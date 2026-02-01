/* eslint-env node */ /**
 * Vercel Serverless Function: PR Analysis
 * POST /api/agent/analyze-pr
 *
 * Analyze a specific PR and generate AI suggestions
 */

import { analyzePRReview } from "../lib/pr.js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, owner, repo, prNumber } = req.body;

  if (!token || !owner || !repo || !prNumber) {
    return res.status(400).json({
      error: "Missing required fields: token, owner, repo, prNumber",
    });
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

    const result = {
      ...analysis,
      prTitle: prData.title,
      prNumber: prData.number,
      prState: prData.state,
      prUrl: prData.html_url,
      repo: `${owner}/${repo}`,
      updatedAt: new Date().toISOString(),
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("PR analysis error:", error);
    return res.status(500).json({ error: error.message });
  }
}
