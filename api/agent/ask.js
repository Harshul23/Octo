/* eslint-env node */ /**
 * Vercel Serverless Function: Ask Octo
 * POST /api/agent/ask
 *
 * Ask Octo a question about the current context
 */

import { askOcto } from "../lib/pr.js";

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

  const { question, context = {} } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const response = await askOcto(question, context);
    return res.status(200).json({ response });
  } catch (error) {
    console.error("Ask Octo error:", error);
    return res.status(500).json({ error: error.message });
  }
}
