/* eslint-env node */ /**
 * PR Analysis Utilities for Serverless Functions
 */

import { callAI } from "./ai.js";

/**
 * Analyze PR review comments and generate actionable steps
 */
export async function analyzePRReview(prData, reviews) {
  const systemPrompt = `You are Octo, a friendly AI assistant that helps developers understand and act on PR feedback. 
Your job is to:
1. Summarize the reviewer's feedback in a casual, encouraging tone (like a helpful teammate)
2. Break down the required changes into clear, actionable steps
3. Prioritize the steps logically (what to do first, second, etc.)

Always be positive and constructive. Use "we" language to make developers feel supported.`;

  const latestReviews = reviews.slice(-5);
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
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("AI analysis error:", error);
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
 * Generate a conversational response for "Ask Octo" feature
 */
export async function askOcto(question, context) {
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
 * Process a webhook event and generate real-time suggestions
 */
export async function processWebhookEvent(eventType, payload) {
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
