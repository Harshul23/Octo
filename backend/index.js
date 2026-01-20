const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config();

const {
  analyzePRReview,
  askOcto,
  analyzeActivity,
  processWebhookEvent,
} = require("./agents/prAgent");
const {
  parseActivityEvents,
  getActionableItems,
  generateActivitySummary,
  formatForFrontend,
} = require("./agents/activityAgent");

const app = express();

app.use(cors());
app.use(express.json());

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

// In-memory store for recent events (in production, use Redis or a database)
const recentEvents = [];
const MAX_EVENTS = 50;

// Store processed suggestions for quick access
const suggestionCache = new Map();

// Middleware to verify GitHub signature for "Error-Zero" security
const verifySignature = (req, res, next) => {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature || !WEBHOOK_SECRET) {
    return res.status(401).send("Missing signature or webhook secret");
  }

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = Buffer.from(
    "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex"),
    "utf8",
  );
  const checksum = Buffer.from(signature, "utf8");

  if (
    checksum.length !== digest.length ||
    !crypto.timingSafeEqual(digest, checksum)
  ) {
    return res.status(401).send("Invalid signature");
  }
  next();
};

// ============================================
// WEBHOOK ENDPOINTS
// ============================================

app.post("/webhook", verifySignature, async (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log(`📨 Received webhook: ${event}`);

  try {
    // Process the event with AI agent
    const processedEvent = await processWebhookEvent(event, payload);

    // Store the processed event
    recentEvents.unshift({
      ...processedEvent,
      rawEvent: event,
      receivedAt: new Date().toISOString(),
    });

    // Keep only recent events
    if (recentEvents.length > MAX_EVENTS) {
      recentEvents.pop();
    }

    // Cache suggestions if available
    if (processedEvent.suggestions && processedEvent.prNumber) {
      const cacheKey = `${payload.repository?.full_name}#${processedEvent.prNumber}`;
      suggestionCache.set(cacheKey, {
        ...processedEvent.suggestions,
        updatedAt: new Date().toISOString(),
      });
    }

    if (event === "pull_request_review" && payload.action === "submitted") {
      console.log(`✅ Processed review for PR #${payload.pull_request.number}`);
    }

    res.status(200).json({
      message: "Event processed",
      processed: processedEvent.processed,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(200).send("Event received (processing error logged)");
  }
});

// ============================================
// AGENT API ENDPOINTS
// ============================================

/**
 * GET /api/agent/activity
 * Fetch and parse recent activity for a user
 * Query params: token (GitHub token), limit (number of events)
 */
app.get("/api/agent/activity", async (req, res) => {
  const { token, limit = 30 } = req.query;

  if (!token) {
    return res.status(401).json({ error: "GitHub token required" });
  }

  try {
    // Fetch user's events from GitHub
    const response = await fetch(
      "https://api.github.com/users/me/received_events?per_page=" + limit,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!response.ok) {
      // Try alternate endpoint
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      const userData = await userResponse.json();

      const eventsResponse = await fetch(
        `https://api.github.com/users/${userData.login}/received_events?per_page=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (!eventsResponse.ok) {
        throw new Error("Failed to fetch GitHub events");
      }

      const events = await eventsResponse.json();
      const parsedActivities = parseActivityEvents(events);
      const actionable = getActionableItems(parsedActivities);
      const summary = await generateActivitySummary(parsedActivities);

      return res.json({
        activities: parsedActivities.slice(0, 20).map(formatForFrontend),
        actionable: actionable.map(formatForFrontend),
        summary,
        total: parsedActivities.length,
      });
    }

    const events = await response.json();
    const parsedActivities = parseActivityEvents(events);
    const actionable = getActionableItems(parsedActivities);
    const summary = await generateActivitySummary(parsedActivities);

    res.json({
      activities: parsedActivities.slice(0, 20).map(formatForFrontend),
      actionable: actionable.map(formatForFrontend),
      summary,
      total: parsedActivities.length,
    });
  } catch (error) {
    console.error("Activity fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent/analyze-pr
 * Analyze a specific PR and generate suggestions
 * Body: { token, owner, repo, prNumber }
 */
app.post("/api/agent/analyze-pr", async (req, res) => {
  const { token, owner, repo, prNumber } = req.body;

  if (!token || !owner || !repo || !prNumber) {
    return res
      .status(400)
      .json({ error: "Missing required fields: token, owner, repo, prNumber" });
  }

  const cacheKey = `${owner}/${repo}#${prNumber}`;

  // Check cache first
  if (suggestionCache.has(cacheKey)) {
    const cached = suggestionCache.get(cacheKey);
    const cacheAge = Date.now() - new Date(cached.updatedAt).getTime();
    // Return cached if less than 5 minutes old
    if (cacheAge < 300000) {
      return res.json({ ...cached, fromCache: true });
    }
  }

  try {
    // Fetch PR data
    const prResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!prResponse.ok) {
      throw new Error("Failed to fetch PR data");
    }

    const prData = await prResponse.json();

    // Fetch reviews
    const reviewsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    const reviews = reviewsResponse.ok ? await reviewsResponse.json() : [];

    // Analyze with AI
    const analysis = await analyzePRReview(prData, reviews);

    // Add PR metadata
    const result = {
      ...analysis,
      prTitle: prData.title,
      prNumber: prData.number,
      prState: prData.state,
      prUrl: prData.html_url,
      repo: `${owner}/${repo}`,
      updatedAt: new Date().toISOString(),
    };

    // Cache the result
    suggestionCache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error("PR analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent/ask
 * Ask Octo a question about the current context
 * Body: { question, context }
 */
app.post("/api/agent/ask", async (req, res) => {
  const { question, context = {} } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const response = await askOcto(question, context);
    res.json({ response });
  } catch (error) {
    console.error("Ask Octo error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent/suggestions/:repo/:prNumber
 * Get cached suggestions for a specific PR
 */
app.get("/api/agent/suggestions/:owner/:repo/:prNumber", (req, res) => {
  const { owner, repo, prNumber } = req.params;
  const cacheKey = `${owner}/${repo}#${prNumber}`;

  if (suggestionCache.has(cacheKey)) {
    return res.json(suggestionCache.get(cacheKey));
  }

  res.status(404).json({ error: "No cached suggestions found" });
});

/**
 * GET /api/agent/recent-events
 * Get recent webhook events (for debugging/monitoring)
 */
app.get("/api/agent/recent-events", (req, res) => {
  res.json({
    events: recentEvents.slice(0, 20),
    total: recentEvents.length,
  });
});

/**
 * GET /api/agent/health
 * Health check endpoint
 */
app.get("/api/agent/health", (req, res) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  // Determine which provider is active
  const getActiveProvider = () => {
    const provider = process.env.AI_PROVIDER;
    if (provider === "gemini" && hasGemini) return "gemini";
    if (provider === "anthropic" && hasAnthropic) return "anthropic";
    if (provider === "openai" && hasOpenAI) return "openai";
    if (hasGemini) return "gemini";
    if (hasOpenAI) return "openai";
    if (hasAnthropic) return "anthropic";
    return "none";
  };

  res.json({
    status: "ok",
    aiConfigured: hasOpenAI || hasAnthropic || hasGemini,
    aiProvider: getActiveProvider(),
    webhookConfigured: !!WEBHOOK_SECRET,
    cachedSuggestions: suggestionCache.size,
    recentEventsCount: recentEvents.length,
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.AGENT_PORT || 5000;

app.listen(PORT, () => {
  console.log(`🐙 Octo Agent Server running on port ${PORT}`);
  console.log(`   Webhook endpoint: POST /webhook`);
  console.log(`   Activity API: GET /api/agent/activity`);
  console.log(`   PR Analysis: POST /api/agent/analyze-pr`);
  console.log(`   Ask Octo: POST /api/agent/ask`);
  console.log(`   Health: GET /api/agent/health`);
});
