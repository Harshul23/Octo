/* eslint-env node */
/**
 * Vercel Serverless Function: GitHub Webhook Handler
 * POST /api/webhook
 *
 * Receives and processes GitHub webhook events
 */

import crypto from "crypto";
import { processWebhookEvent } from "./lib/pr.js";

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

/**
 * Verify GitHub webhook signature
 */
function verifySignature(payload, signature) {
  if (!signature || !WEBHOOK_SECRET) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = Buffer.from(
    "sha256=" + hmac.update(JSON.stringify(payload)).digest("hex"),
    "utf8",
  );
  const checksum = Buffer.from(signature, "utf8");

  if (
    checksum.length !== digest.length ||
    !crypto.timingSafeEqual(digest, checksum)
  ) {
    return false;
  }

  return true;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Hub-Signature-256, X-GitHub-Event",
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["x-hub-signature-256"];
  const event = req.headers["x-github-event"];
  const payload = req.body;

  // Verify signature (skip if no secret configured - useful for testing)
  if (WEBHOOK_SECRET && !verifySignature(payload, signature)) {
    console.error("Invalid webhook signature");
    return res.status(401).json({ error: "Invalid signature" });
  }

  console.log(`📨 Received webhook: ${event}`);

  try {
    const processedEvent = await processWebhookEvent(event, payload);

    if (event === "pull_request_review" && payload.action === "submitted") {
      console.log(`✅ Processed review for PR #${payload.pull_request.number}`);
    }

    return res.status(200).json({
      message: "Event processed",
      processed: processedEvent.processed,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 200 to acknowledge receipt even on processing error
    return res.status(200).json({
      message: "Event received (processing error logged)",
      error: error.message,
    });
  }
}
