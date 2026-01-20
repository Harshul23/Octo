# 🐙 Octo AI Agent Setup Guide

This guide walks you through setting up the AI-powered agent that analyzes your PRs and issues to provide intelligent suggestions.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AI Provider Setup](#ai-provider-setup)
3. [Backend Configuration](#backend-configuration)
4. [GitHub Webhook Setup](#github-webhook-setup)
5. [Environment Variables](#environment-variables)
6. [Running the Agent](#running-the-agent)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up the AI agent, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A GitHub account with OAuth app configured (see `README-GITHUB-AUTH.md`)
- An account with an AI provider (Google Gemini, OpenAI, or Anthropic)

---

## AI Provider Setup

The Octo agent supports three AI providers. Choose one based on your preference:

### Option A: Google Gemini (Recommended - FREE Tier! 🎉)

1. **Go to Google AI Studio**
   - Visit [aistudio.google.com](https://aistudio.google.com)
   - Sign in with your Google account

2. **Generate an API Key**
   - Click **Get API key** in the left sidebar
   - Click **Create API key**
   - Select a Google Cloud project (or create one)
   - Copy the API key

3. **Free Tier Limits** (Usually enough for personal use!)
   - 15 requests per minute
   - 1 million tokens per minute
   - 1,500 requests per day

### Option B: OpenAI

1. **Create an OpenAI Account**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Sign up or log in

2. **Generate an API Key**
   - Navigate to **Settings** → **API Keys**
   - Click **Create new secret key**
   - Give it a name like "Octo Agent"
   - Copy the key immediately (you won't see it again!)

3. **Add Credits**
   - Go to **Settings** → **Billing**
   - Add a payment method and credits (minimum $5 recommended)
   - The agent uses `gpt-4o-mini` which costs ~$0.15 per 1M input tokens

### Option C: Anthropic Claude

1. **Create an Anthropic Account**
   - Go to [console.anthropic.com](https://console.anthropic.com)
   - Sign up or log in

2. **Generate an API Key**
   - Navigate to **API Keys**
   - Click **Create Key**
   - Copy the key immediately

3. **Add Credits**
   - Go to **Plans & Billing**
   - Add credits (minimum $5 recommended)
   - The agent uses `claude-3-5-sonnet` which costs ~$3 per 1M input tokens

---

## Backend Configuration

### 1. Install Backend Dependencies

Navigate to the backend folder and install the required packages:

```bash
cd backend
npm install
```

### 2. Create Environment File

Create a `.env` file in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Edit the file with your preferred AI provider:

```env
# ============================================
# AI PROVIDER CONFIGURATION
# ============================================

# Choose your AI provider: 'gemini', 'openai', or 'anthropic'
AI_PROVIDER=gemini

# Google Gemini API Key (Recommended - has FREE tier!)
GEMINI_API_KEY=your-gemini-api-key-here

# OpenAI API Key (if using OpenAI)
# OPENAI_API_KEY=sk-your-openai-api-key-here

# Anthropic API Key (if using Anthropic/Claude)
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# ============================================
# SERVER CONFIGURATION
# ============================================

# Port for the agent server (default: 5000)
AGENT_PORT=5000

# ============================================
# GITHUB WEBHOOK (Optional - for real-time updates)
# ============================================

# Webhook secret for verifying GitHub webhook signatures
# Generate with: openssl rand -hex 32
GITHUB_WEBHOOK_SECRET=your-webhook-secret-here
```

### 3. Update Frontend Environment

Add the agent URL to your frontend `.env` file (in the root directory):

```env
# Add to your existing .env file
VITE_AGENT_URL=http://localhost:5000
```

---

## GitHub Webhook Setup (Optional)

For real-time updates when PRs receive reviews or comments, set up a GitHub webhook:

### 1. Generate a Webhook Secret

```bash
openssl rand -hex 32
```

Copy the output and add it to your `backend/.env` as `GITHUB_WEBHOOK_SECRET`.

### 2. Create the Webhook in GitHub

1. Go to your GitHub repository → **Settings** → **Webhooks**
2. Click **Add webhook**
3. Configure:
   - **Payload URL**: `https://your-domain.com/webhook` (or use ngrok for local testing)
   - **Content type**: `application/json`
   - **Secret**: The secret you generated above
   - **Events**: Select individual events:
     - Pull request reviews
     - Pull request review comments
     - Issue comments
     - Pull requests
4. Click **Add webhook**

### 3. Local Testing with ngrok

For local development, use ngrok to expose your local server:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start ngrok tunnel
ngrok http 5000
```

Use the ngrok URL as your webhook payload URL.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable                | Required | Description                                            |
| ----------------------- | -------- | ------------------------------------------------------ |
| `AI_PROVIDER`           | No       | `gemini`, `openai`, or `anthropic` (default: `gemini`) |
| `GEMINI_API_KEY`        | Yes\*    | Your Google Gemini API key                             |
| `OPENAI_API_KEY`        | Yes\*    | Your OpenAI API key                                    |
| `ANTHROPIC_API_KEY`     | Yes\*    | Your Anthropic API key                                 |
| `AGENT_PORT`            | No       | Server port (default: `5000`)                          |
| `GITHUB_WEBHOOK_SECRET` | No       | For verifying webhook signatures                       |

\*At least one AI API key is required.

### Frontend (`.env`)

| Variable         | Required | Description                                         |
| ---------------- | -------- | --------------------------------------------------- |
| `VITE_AGENT_URL` | No       | Agent server URL (default: `http://localhost:5000`) |

---

## Running the Agent

### Development Mode

1. **Start the agent server:**

```bash
cd backend
node index.js
```

Or add to your root `package.json`:

```json
{
  "scripts": {
    "dev:agent": "cd backend && node index.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\" \"npm run dev:agent\""
  }
}
```

2. **Verify the agent is running:**

```bash
curl http://localhost:5000/api/agent/health
```

Expected response:

```json
{
  "status": "ok",
  "aiConfigured": true,
  "aiProvider": "gemini",
  "webhookConfigured": true,
  "cachedSuggestions": 0,
  "recentEventsCount": 0
}
```

### Production Deployment

For production, consider:

1. **Use PM2 or similar process manager:**

```bash
npm install -g pm2
pm2 start backend/index.js --name "octo-agent"
```

2. **Set up proper environment variables** in your hosting platform

3. **Use HTTPS** for webhook endpoints

4. **Add rate limiting** to prevent API abuse

---

## API Endpoints

The agent exposes these endpoints:

| Endpoint                                  | Method | Description                           |
| ----------------------------------------- | ------ | ------------------------------------- |
| `/api/agent/health`                       | GET    | Health check and configuration status |
| `/api/agent/activity`                     | GET    | Fetch parsed activity feed            |
| `/api/agent/analyze-pr`                   | POST   | Analyze a specific PR with AI         |
| `/api/agent/ask`                          | POST   | Ask Octo a question                   |
| `/api/agent/suggestions/:owner/:repo/:pr` | GET    | Get cached suggestions                |
| `/webhook`                                | POST   | GitHub webhook receiver               |

---

## Troubleshooting

### Agent shows "AI Not Configured"

- Check that your API key is correctly set in `backend/.env`
- Ensure the `.env` file is in the `backend/` directory
- Verify the key is valid by testing in the provider's playground

### "Failed to fetch activity"

- Ensure you're logged in with GitHub OAuth
- Check that your GitHub token has the required scopes
- Verify the agent server is running on the correct port

### Webhook not receiving events

- Check that the webhook secret matches in GitHub and your `.env`
- Verify the payload URL is accessible from the internet
- Check GitHub webhook delivery logs for errors

### AI responses are slow

- The first request may take 2-5 seconds as the model loads
- Subsequent requests use caching and are faster
- Gemini is generally the fastest option

### Rate limiting errors

- **Gemini**: Free tier has 15 requests/minute limit; wait and retry
- **OpenAI**: Default rate limits may apply; upgrade your account tier
- **Anthropic**: Check your usage tier and limits
- Implement request queuing for high-volume usage

### Gemini-specific issues

- **"API key not valid"**: Regenerate the key in Google AI Studio
- **"Quota exceeded"**: Wait for the daily/minute limit to reset
- **"Model not found"**: Ensure you're using `gemini-1.5-flash`

---

## Cost Estimation

| Provider  | Model             | Cost per 1M Tokens          | Typical PR Analysis  |
| --------- | ----------------- | --------------------------- | -------------------- |
| Gemini    | gemini-1.5-flash  | **FREE** (with limits)      | **$0.00**            |
| Gemini    | gemini-1.5-pro    | ~$1.25 input / $5 output    | ~$0.005 per analysis |
| OpenAI    | gpt-4o-mini       | ~$0.15 input / $0.60 output | ~$0.001 per analysis |
| OpenAI    | gpt-4o            | ~$2.50 input / $10 output   | ~$0.01 per analysis  |
| Anthropic | claude-3-5-sonnet | ~$3 input / $15 output      | ~$0.02 per analysis  |

**Recommendation**: Start with Gemini's free tier! For typical usage (50 PRs/day), the free tier is usually sufficient.

---

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate API keys** periodically
4. **Set up billing alerts** in your AI provider dashboard
5. **Use webhook secrets** to verify GitHub payloads
6. **Implement rate limiting** on your endpoints

---

## Next Steps

Once the agent is running:

1. Open Octo in your browser
2. You should see "AI Active" indicator in the greeting
3. Navigate to a PR in your activity feed
4. Click "Analyze" to get AI-powered suggestions
5. Use "Ask Octo" to ask questions about the PR

Happy coding! 🐙✨
