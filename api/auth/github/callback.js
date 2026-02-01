/* eslint-env node */ /**
 * Vercel Serverless Function: GitHub OAuth Token Exchange
 * POST /api/auth/github/callback
 *
 * Exchanges the authorization code for an access token
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is required" });
  }

  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      },
    );

    const data = await tokenResponse.json();

    if (data.error) {
      console.error("GitHub OAuth error:", data);
      return res.status(400).json({
        error: "Failed to authenticate with GitHub",
        details: data.error_description || data.error,
      });
    }

    const { access_token, token_type, scope } = data;

    if (!access_token) {
      return res.status(400).json({ error: "Failed to obtain access token" });
    }

    return res.status(200).json({
      access_token,
      token_type,
      scope,
    });
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return res.status(500).json({
      error: "Authentication failed",
      details: error.message,
    });
  }
}
