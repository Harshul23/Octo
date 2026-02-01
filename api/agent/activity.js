/* eslint-env node */ /**
 * Vercel Serverless Function: Activity Feed
 * GET /api/agent/activity
 *
 * Fetch and parse recent activity for a user
 */

import {
  parseActivityEvents,
  getActionableItems,
  generateActivitySummary,
  formatForFrontend,
} from "../lib/activity.js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, limit = 30 } = req.query;

  if (!token) {
    return res.status(401).json({ error: "GitHub token required" });
  }

  try {
    // First get the user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user data");
    }

    const userData = await userResponse.json();

    // Fetch user's received events
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

    return res.status(200).json({
      activities: parsedActivities.slice(0, 20).map(formatForFrontend),
      actionable: actionable.map(formatForFrontend),
      summary,
      total: parsedActivities.length,
    });
  } catch (error) {
    console.error("Activity fetch error:", error);
    return res.status(500).json({ error: error.message });
  }
}
