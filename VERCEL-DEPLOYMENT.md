# 🐙 Octo - Vercel Production Deployment Guide

This guide will help you deploy Octo to Vercel with full authentication and AI features working.

---

## 📋 Prerequisites

1. **GitHub OAuth App** - You need to create one in GitHub Developer Settings
2. **Vercel Account** - Free tier works fine
3. **AI API Key** - At least one of: Gemini (free), OpenAI, or Anthropic

---

## 🔐 Step 1: Create GitHub OAuth App

1. Go to **GitHub Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
   - Or direct link: https://github.com/settings/applications/new

2. Fill in the details:
   | Field | Value |
   |-------|-------|
   | **Application name** | `Octo` (or your preferred name) |
   | **Homepage URL** | `https://octo-alpha.vercel.app` |
   | **Authorization callback URL** | `https://octo-alpha.vercel.app/callback` |

3. Click **Register application**

4. Copy the **Client ID** (you'll need this)

5. Click **Generate a new client secret** and copy it immediately (shown only once!)

---

## 🤖 Step 2: Get AI API Key

Choose at least one AI provider:

### Option A: Google Gemini (Recommended - Free Tier)

1. Go to https://aistudio.google.com/apikey
2. Click **Create API Key**
3. Copy the API key

### Option B: OpenAI

1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the API key

### Option C: Anthropic Claude

1. Go to https://console.anthropic.com/
2. Create new API key
3. Copy the API key

---

## 🌐 Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect it's a Vite project
4. **Before deploying**, add environment variables (see Step 4)
5. Click **Deploy**

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /path/to/Octo
vercel --prod
```

---

## 🔑 Step 4: Configure Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables**

Add the following variables:

### Required Variables

| Variable                   | Value                                    | Description                         |
| -------------------------- | ---------------------------------------- | ----------------------------------- |
| `VITE_GITHUB_CLIENT_ID`    | `Oxxxxxxxxxxxx`                          | Your GitHub OAuth App Client ID     |
| `VITE_GITHUB_REDIRECT_URI` | `https://octo-alpha.vercel.app/callback` | OAuth callback URL                  |
| `VITE_AUTH_API_URL`        | `/api`                                   | Use relative path for serverless    |
| `GITHUB_CLIENT_ID`         | `Oxxxxxxxxxxxx`                          | Same as VITE_GITHUB_CLIENT_ID       |
| `GITHUB_CLIENT_SECRET`     | `xxxxxxxxxxxxx`                          | Your GitHub OAuth App Client Secret |

### AI Provider (at least one required)

| Variable            | Value          | Description                                         |
| ------------------- | -------------- | --------------------------------------------------- |
| `AI_PROVIDER`       | `gemini`       | Which AI to use: `gemini`, `openai`, or `anthropic` |
| `GEMINI_API_KEY`    | `AIzaxxxxxxxx` | Google Gemini API key                               |
| `OPENAI_API_KEY`    | `sk-xxxxxxxx`  | OpenAI API key (optional)                           |
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxx` | Anthropic API key (optional)                        |

### Webhooks (Optional - for real-time updates)

| Variable                | Value         | Description                     |
| ----------------------- | ------------- | ------------------------------- |
| `GITHUB_WEBHOOK_SECRET` | `your_secret` | Secret for webhook verification |

---

## 📋 Complete Environment Variables Reference

Copy this template and fill in your values:

```env
# Frontend (exposed to browser - prefix with VITE_)
VITE_GITHUB_CLIENT_ID=Oxxxxxxxxxxxxxxxxxx
VITE_GITHUB_REDIRECT_URI=https://octo-alpha.vercel.app/callback
VITE_AUTH_API_URL=/api

# Backend (serverless functions - NOT exposed to browser)
GITHUB_CLIENT_ID=Oxxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# AI Provider
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
# OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
# ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx

# Webhooks (optional)
GITHUB_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔄 Step 5: Set Up GitHub Webhooks (Optional)

For real-time PR review notifications:

1. Go to your GitHub repository → **Settings** → **Webhooks** → **Add webhook**

2. Configure:
   | Field | Value |
   |-------|-------|
   | **Payload URL** | `https://octo-alpha.vercel.app/api/webhook` |
   | **Content type** | `application/json` |
   | **Secret** | Same as your `GITHUB_WEBHOOK_SECRET` |

3. Select events:
   - Pull requests
   - Pull request reviews
   - Pull request review comments
   - Issue comments

4. Click **Add webhook**

---

## ✅ Step 6: Verify Deployment

After deploying, test the following:

### 1. Check Health Endpoint

```bash
curl https://octo-alpha.vercel.app/api/agent/health
```

Expected response:

```json
{
  "status": "ok",
  "aiConfigured": true,
  "aiProvider": "gemini",
  "webhookConfigured": true,
  "serverless": true
}
```

### 2. Test OAuth Flow

1. Visit https://octo-alpha.vercel.app
2. Click "Login with GitHub"
3. Authorize the app
4. Should redirect back and show your GitHub profile

### 3. Test AI Features

1. Navigate to your dashboard
2. Check if activity feed loads
3. Try "Ask Octo" feature

---

## 🐛 Troubleshooting

### Authentication Not Working

**Symptom**: OAuth redirects fail or token exchange fails

**Fixes**:

1. Verify `VITE_AUTH_API_URL` is set to `/api` (not full URL)
2. Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` match your OAuth app
3. Ensure callback URL in GitHub OAuth App matches `VITE_GITHUB_REDIRECT_URI`
4. Check Vercel Function logs: Project → Functions → View logs

### AI Features Not Working

**Symptom**: Activity feed shows errors, "Ask Octo" fails

**Fixes**:

1. Verify at least one AI key is set (`GEMINI_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`)
2. Check `AI_PROVIDER` matches the key you provided
3. Test the health endpoint to verify AI configuration

### CORS Errors

**Symptom**: Browser console shows CORS errors

**Fixes**:

1. Ensure `vercel.json` is in the root directory
2. Clear Vercel cache and redeploy: `vercel --prod --force`

### Webhooks Not Receiving Events

**Fixes**:

1. Check webhook secret matches between GitHub and Vercel env vars
2. Verify webhook URL is exactly: `https://your-domain.vercel.app/api/webhook`
3. Check GitHub webhook delivery history for errors

---

## 📁 Project Structure (After Setup)

```
Octo/
├── api/                        # Vercel Serverless Functions
│   ├── auth/github/
│   │   └── callback.js         # OAuth token exchange
│   ├── agent/
│   │   ├── activity.js         # Activity feed
│   │   ├── analyze-pr.js       # PR analysis
│   │   ├── ask.js              # Ask Octo
│   │   └── health.js           # Health check
│   ├── lib/
│   │   ├── ai.js               # AI provider abstraction
│   │   ├── activity.js         # Activity utilities
│   │   └── pr.js               # PR analysis utilities
│   └── webhook.js              # GitHub webhook handler
├── src/                        # React Frontend
├── vercel.json                 # Vercel configuration
└── .env.example                # Environment template
```

---

## 🔄 Local Development

For local development, you still need to run the auth server:

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Auth server (for local OAuth)
npm run dev:server

# Terminal 3: AI Agent (optional, for AI features)
cd backend && node index.js
```

Your `.env` file for local dev:

```env
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/callback
VITE_AUTH_API_URL=http://localhost:3001
VITE_AGENT_URL=http://localhost:5000

# For auth server
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
CLIENT_URL=http://localhost:5173
PORT=3001
```

---

## 🎉 Done!

Your Octo app should now be fully functional on Vercel with:

- ✅ GitHub OAuth authentication
- ✅ AI-powered PR analysis
- ✅ Activity feed
- ✅ Real-time webhooks (optional)

If you encounter issues, check the Vercel function logs and ensure all environment variables are correctly set.
