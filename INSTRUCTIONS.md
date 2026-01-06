# GitHub Authentication Setup Instructions

This document provides step-by-step instructions to set up GitHub OAuth authentication for your React application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create GitHub OAuth App](#create-github-oauth-app)
3. [Configure Environment Variables](#configure-environment-variables)
4. [Install Dependencies](#install-dependencies)
5. [Start the Application](#start-the-application)
6. [Testing the Authentication](#testing-the-authentication)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

- Node.js (v16 or higher) installed
- npm or yarn package manager
- A GitHub account
- Git installed on your machine

---

## Create GitHub OAuth App

### Step 1: Navigate to GitHub Developer Settings

1. Go to [GitHub.com](https://github.com)
2. Click on your profile picture in the top-right corner
3. Select **Settings** from the dropdown menu
4. Scroll down to the bottom of the left sidebar
5. Click on **Developer settings**
6. Click on **OAuth Apps** in the left sidebar
7. Click the **New OAuth App** button

### Step 2: Register Your Application

Fill in the following details:

- **Application name**: `Octo Dashboard` (or any name you prefer)
- **Homepage URL**: `http://localhost:5173`
- **Application description**: (optional) `GitHub activity dashboard with contribution heatmap`
- **Authorization callback URL**: `http://localhost:5173/callback`

> ⚠️ **Important**: The callback URL must match exactly with what you'll set in your `.env` file.

### Step 3: Generate Client Secret

1. After creating the app, you'll see your **Client ID** displayed
2. Click on **Generate a new client secret**
3. Copy both the **Client ID** and **Client Secret** immediately
   - ⚠️ You won't be able to see the client secret again!
   - Store them in a secure location temporarily

---

## Configure Environment Variables

### Step 1: Setup Frontend Environment Variables

1. Navigate to your project root directory:

   ```bash
   cd /Users/harshul/coding/React/react-p01/01-rect
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. Open the `.env` file and replace the placeholder values:
   ```env
   VITE_GITHUB_CLIENT_ID=your_actual_client_id_here
   VITE_GITHUB_REDIRECT_URI=http://localhost:5173/callback
   ```

### Step 2: Setup Backend Environment Variables

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. Open the `server/.env` file and add your credentials:
   ```env
   PORT=3001
   CLIENT_URL=http://localhost:5173
   GITHUB_CLIENT_ID=your_actual_client_id_here
   GITHUB_CLIENT_SECRET=your_actual_client_secret_here
   ```

> 🔒 **Security Note**: Never commit `.env` files to version control! Make sure `.env` is in your `.gitignore`.

---

## Install Dependencies

### Step 1: Install Frontend Dependencies

From the project root directory:

```bash
cd /Users/harshul/coding/React/react-p01/01-rect
npm install
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

If you get any errors, try:

```bash
npm install --legacy-peer-deps
```

---

## Start the Application

You'll need to run both the frontend and backend servers simultaneously.

### Option 1: Using Two Terminal Windows

**Terminal 1 - Backend Server:**

```bash
cd /Users/harshul/coding/React/react-p01/01-rect/server
npm start
```

You should see:

```
GitHub OAuth proxy server running on http://localhost:3001
Client URL: http://localhost:5173
```

**Terminal 2 - Frontend Application:**

```bash
cd /Users/harshul/coding/React/react-p01/01-rect
npm run dev
```

You should see:

```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### Option 2: Using a Process Manager (Recommended for Development)

Install `concurrently` to run both servers from one command:

```bash
# In the project root
npm install -D concurrently
```

Add this script to your root `package.json`:

```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev\" \"cd server && npm start\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "npm run dev"
  }
}
```

Then run:

```bash
npm run dev:all
```

---

## Testing the Authentication

### Step 1: Access the Application

1. Open your browser and go to: `http://localhost:5173`
2. You should see the login page

### Step 2: Login with GitHub

1. Click the **"Login with GitHub"** button
2. You'll be redirected to GitHub's authorization page
3. Review the permissions requested:
   - Access to your public repositories
   - Read your user profile
   - Access to organization data
4. Click **"Authorize"**
5. You'll be redirected back to your application

### Step 3: Verify the Features

After successful authentication, you should see:

✅ **Navbar**:

- Your GitHub profile picture
- Hover over your profile to see logout option

✅ **Right Sidebar**:

- GitHub contribution heatmap calendar (last 365 days)
- Color-coded contribution intensity
- Hover over squares to see contribution count

✅ **Activity Timeline**:

- Recent commits grouped by repository
- Newly created repositories
- Pull requests you've created/worked on
- Issues you've opened or commented on

---

## Troubleshooting

### Issue: "Failed to authenticate with GitHub"

**Possible causes:**

1. Incorrect Client ID or Client Secret
2. Backend server not running
3. Callback URL mismatch

**Solutions:**

```bash
# 1. Verify environment variables
cat .env
cat server/.env

# 2. Check if backend is running
curl http://localhost:3001/health

# 3. Restart both servers
# Terminal 1
cd server && npm start

# Terminal 2
cd .. && npm run dev
```

### Issue: "CORS error" in browser console

**Solution:**
Make sure the `CLIENT_URL` in `server/.env` matches your frontend URL exactly:

```env
CLIENT_URL=http://localhost:5173
```

### Issue: Contribution heatmap not loading

**Possible causes:**

1. GitHub API rate limiting
2. Invalid token
3. Missing GraphQL permissions

**Solutions:**

1. Check browser console for errors
2. Verify the token has the correct scopes
3. Wait a few minutes if rate limited (GitHub allows 5000 requests/hour for authenticated users)

### Issue: "Module not found" errors

**Solution:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For the server
cd server
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use

**Solution:**

```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

---

## Production Deployment Considerations

When deploying to production, you'll need to:

### 1. Update GitHub OAuth App Settings

- Add your production domain to Homepage URL
- Update Authorization callback URL to your production domain
- Example: `https://yourdomain.com/callback`

### 2. Update Environment Variables

```env
# Frontend .env
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_GITHUB_REDIRECT_URI=https://yourdomain.com/callback

# Backend .env
CLIENT_URL=https://yourdomain.com
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 3. Security Best Practices

- Use HTTPS for all URLs
- Store secrets in secure environment variable systems (not in code)
- Enable rate limiting on your backend
- Implement proper error logging
- Consider using a reverse proxy (nginx)

### 4. Hosting Options

- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, Render, AWS EC2

---

## API Rate Limits

GitHub API has the following rate limits:

- **Authenticated requests**: 5,000 requests per hour
- **GraphQL API**: 5,000 points per hour
- **Search API**: 30 requests per minute

The application is designed to work within these limits, but if you're developing actively, you may hit rate limits. If this happens:

1. Wait for the rate limit to reset (check headers for reset time)
2. Implement caching for contribution data
3. Consider reducing the frequency of API calls

---

## Additional Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub GraphQL API Documentation](https://docs.github.com/en/graphql)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

## Support

If you encounter any issues not covered in this guide:

1. Check the browser console for error messages
2. Check the terminal/server logs for backend errors
3. Verify all environment variables are set correctly
4. Ensure both frontend and backend servers are running
5. Check GitHub OAuth app settings match your configuration

---

## Summary Checklist

Before running the application, ensure you've completed:

- [ ] Created GitHub OAuth App
- [ ] Copied Client ID and Client Secret
- [ ] Created `.env` file in project root
- [ ] Created `.env` file in `server/` directory
- [ ] Installed frontend dependencies (`npm install`)
- [ ] Installed backend dependencies (`cd server && npm install`)
- [ ] Started backend server (port 3001)
- [ ] Started frontend dev server (port 5173)
- [ ] Tested login functionality
- [ ] Verified contribution heatmap loads
- [ ] Verified activity timeline displays

---

**Congratulations! Your GitHub authentication integration is now complete! 🎉**
