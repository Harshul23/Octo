/**
 * PR Agent - AI-powered PR analysis and suggestion generation
 * Uses OpenAI/Anthropic/Gemini to analyze PR reviews and generate actionable steps
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Determine which AI provider to use
const AI_PROVIDER = process.env.AI_PROVIDER || "gemini"; // 'openai' | 'anthropic' | 'gemini'

/**
 * Call Google Gemini API for generating suggestions
 */
async function callGemini(systemPrompt, userPrompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Gemini API error: ${error.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Call OpenAI API for generating suggestions
 */
async function callOpenAI(systemPrompt, userPrompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `OpenAI API error: ${error.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call Anthropic Claude API for generating suggestions
 */
async function callAnthropic(systemPrompt, userPrompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Anthropic API error: ${error.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Call the configured AI provider
 */
async function callAI(systemPrompt, userPrompt) {
  if (AI_PROVIDER === "gemini" && GEMINI_API_KEY) {
    return callGemini(systemPrompt, userPrompt);
  } else if (AI_PROVIDER === "anthropic" && ANTHROPIC_API_KEY) {
    return callAnthropic(systemPrompt, userPrompt);
  } else if (AI_PROVIDER === "openai" && OPENAI_API_KEY) {
    return callOpenAI(systemPrompt, userPrompt);
  } else if (GEMINI_API_KEY) {
    return callGemini(systemPrompt, userPrompt);
  } else if (OPENAI_API_KEY) {
    return callOpenAI(systemPrompt, userPrompt);
  } else if (ANTHROPIC_API_KEY) {
    return callAnthropic(systemPrompt, userPrompt);
  } else {
    throw new Error(
      "No AI API key configured. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in your .env file.",
    );
  }
}

/**
 * Analyze PR review comments and generate actionable steps
 * @param {Object} prData - Pull request data from GitHub API
 * @param {Array} reviews - Array of review objects with comments
 * @returns {Object} AI-generated analysis with status and steps
 */
async function analyzePRReview(prData, reviews) {
  const systemPrompt = `You are Octo, a friendly AI assistant that helps developers understand and act on PR feedback. 
Your job is to:
1. Summarize the reviewer's feedback in a casual, encouraging tone (like a helpful teammate)
2. Break down the required changes into clear, actionable steps
3. Prioritize the steps logically (what to do first, second, etc.)

Always be positive and constructive. Use "we" language to make developers feel supported.`;

  const latestReviews = reviews.slice(-5); // Focus on recent reviews
  const reviewContent = latestReviews
    .map(
      (r) =>
        `Review by ${r.user?.login || "Reviewer"} (${r.state}): ${r.body || "No comment"}`,
    )
    .join("\n\n");

  const userPrompt = `Analyze this PR and its reviews:

**PR Title:** ${prData.title}
**PR Description:** ${prData.body || "No description provided"}
**Current State:** ${prData.state}
**Mergeable:** ${prData.mergeable ? "Yes" : "No"}

**Recent Reviews:**
${reviewContent || "No reviews yet"}

Please respond in this exact JSON format:
{
  "octoStatus": "A friendly 1-2 sentence summary of what the reviewer wants (casual tone, like explaining to a friend)",
  "complexity": "easy|normal|hard",
  "steps": [
    {"id": 1, "text": "First actionable step", "status": "pending"},
    {"id": 2, "text": "Second actionable step", "status": "pending"},
    {"id": 3, "text": "Third actionable step (if needed)", "status": "pending"}
  ],
  "progressPercent": 0
}`;

  try {
    const response = await callAI(systemPrompt, userPrompt);
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("AI analysis error:", error);
    // Return fallback response
    return {
      octoStatus:
        "I'm having trouble analyzing this PR right now. Check back in a moment!",
      complexity: "normal",
      steps: [
        { id: 1, text: "Review the PR comments manually", status: "pending" },
        { id: 2, text: "Address any requested changes", status: "pending" },
        { id: 3, text: "Request a re-review when ready", status: "pending" },
      ],
      progressPercent: 0,
      error: error.message,
    };
  }
}

/**
 * Generate a conversational response for the "Ask Octo" feature
 * @param {string} question - User's question about the PR
 * @param {Object} context - Current PR and review context
 * @returns {string} AI-generated response
 */
async function askOcto(question, context) {
  const systemPrompt = `You are Octo, a friendly AI coding assistant. You help developers understand PR feedback and coding concepts.
Keep responses concise (2-3 sentences max), helpful, and encouraging. Use casual language.
If you don't have enough context, ask clarifying questions.`;

  const userPrompt = `Context about the current PR:
- Title: ${context.prTitle || "Unknown"}
- Status: ${context.status || "Unknown"}
- Recent feedback: ${context.recentFeedback || "None"}

Developer's question: "${question}"

Provide a helpful, concise response:`;

  try {
    return await callAI(systemPrompt, userPrompt);
  } catch (error) {
    console.error("Ask Octo error:", error);
    return "Hmm, I'm having trouble thinking right now. Try asking me again in a moment!";
  }
}

/**
 * Analyze recent activity (comments, reviews, status changes) for a user
 * @param {Array} events - GitHub events from the user's activity feed
 * @returns {Object} Categorized and summarized activity
 */
async function analyzeActivity(events) {
  // Filter relevant events
  const relevantEvents = events
    .filter((e) =>
      [
        "PullRequestEvent",
        "PullRequestReviewEvent",
        "PullRequestReviewCommentEvent",
        "IssueCommentEvent",
        "IssuesEvent",
      ].includes(e.type),
    )
    .slice(0, 20);

  if (relevantEvents.length === 0) {
    return {
      summary: "No recent PR or issue activity to analyze.",
      items: [],
      needsAttention: [],
    };
  }

  // Format events for AI analysis
  const eventsText = relevantEvents
    .map((e) => {
      const repo = e.repo?.name || "Unknown repo";
      const action = e.payload?.action || "action";
      const number =
        e.payload?.pull_request?.number || e.payload?.issue?.number || "";
      return `- ${e.type}: ${action} on ${repo}${number ? ` #${number}` : ""} at ${e.created_at}`;
    })
    .join("\n");

  const systemPrompt = `You are Octo, analyzing a developer's recent GitHub activity to identify what needs their attention.
Focus on actionable items: reviews requested, changes requested, comments needing response.`;

  const userPrompt = `Analyze this activity and identify items needing attention:

${eventsText}

Respond in this JSON format:
{
  "summary": "One sentence overview of recent activity",
  "needsAttention": [
    {"repo": "owner/repo", "number": 123, "type": "pr|issue", "reason": "Brief reason this needs attention", "priority": "high|medium|low"}
  ]
}`;

  try {
    const response = await callAI(systemPrompt, userPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse activity analysis");
  } catch (error) {
    console.error("Activity analysis error:", error);
    return {
      summary: "Unable to analyze activity right now.",
      needsAttention: [],
      error: error.message,
    };
  }
}

/**
 * Process a webhook event and generate real-time suggestions
 * @param {string} eventType - GitHub event type
 * @param {Object} payload - Webhook payload
 * @returns {Object} Processed event with AI suggestions
 */
async function processWebhookEvent(eventType, payload) {
  const result = {
    eventType,
    timestamp: new Date().toISOString(),
    processed: false,
    suggestions: null,
  };

  if (eventType === "pull_request_review" && payload.action === "submitted") {
    const review = payload.review;
    const pr = payload.pull_request;

    result.processed = true;
    result.prNumber = pr.number;
    result.prTitle = pr.title;
    result.reviewState = review.state;
    result.reviewer = review.user?.login;

    // Generate suggestions based on review
    if (review.state === "changes_requested") {
      result.suggestions = await analyzePRReview(pr, [review]);
    } else if (review.state === "approved") {
      result.suggestions = {
        octoStatus: `Great news! ${review.user?.login} approved your PR. You're ready to merge! 🎉`,
        complexity: "easy",
        steps: [
          { id: 1, text: "Double-check any final comments", status: "pending" },
          { id: 2, text: "Squash commits if needed", status: "pending" },
          { id: 3, text: "Merge the PR", status: "pending" },
        ],
        progressPercent: 90,
      };
    }
  }

  if (
    eventType === "issue_comment" ||
    eventType === "pull_request_review_comment"
  ) {
    result.processed = true;
    result.comment = payload.comment?.body;
    result.author = payload.comment?.user?.login;

    // Quick analysis of the comment
    const systemPrompt =
      "You are Octo. Analyze this code review comment and suggest a one-line action item.";
    const userPrompt = `Comment: "${payload.comment?.body}"\n\nSuggest one clear action in under 15 words:`;

    try {
      result.quickAction = await callAI(systemPrompt, userPrompt);
    } catch (error) {
      result.quickAction = "Review this comment and respond appropriately.";
    }
  }

  return result;
}

module.exports = {
  analyzePRReview,
  askOcto,
  analyzeActivity,
  processWebhookEvent,
  callAI,
};
