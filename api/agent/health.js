/* eslint-env node */ /**
 * Vercel Serverless Function: Health Check
 * GET /api/agent/health
 *
 * Returns health status and AI configuration
 */

import { getAIStatus } from "../lib/ai.js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const aiStatus = getAIStatus();

  return res.status(200).json({
    status: "ok",
    aiConfigured: aiStatus.configured,
    aiProvider: aiStatus.provider,
    webhookConfigured: !!process.env.GITHUB_WEBHOOK_SECRET,
    serverless: true,
  });
}
