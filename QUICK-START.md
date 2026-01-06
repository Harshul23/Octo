# 🚀 Quick Start Guide

This is a quick reference for getting your GitHub authentication feature running in minutes!

## ⚡ Super Quick Setup (5 minutes)

### 1️⃣ Create GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - **Name**: `Octo Dashboard`
   - **Homepage**: `http://localhost:5173`
   - **Callback**: `http://localhost:5173/callback`
4. Click "Register application"
5. Copy your **Client ID**
6. Click "Generate a new client secret"
7. Copy your **Client Secret** (you won't see it again!)

### 2️⃣ Configure Environment

```bash
# Run the automated setup script
npm run setup

# OR manually:
cp .env.example .env
cp server/.env.example server/.env
```

**Edit `.env`** (in project root):

```env
VITE_GITHUB_CLIENT_ID=paste_your_client_id_here
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/callback
```

**Edit `server/.env`**:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
GITHUB_CLIENT_ID=paste_your_client_id_here
GITHUB_CLIENT_SECRET=paste_your_client_secret_here
```

### 3️⃣ Install & Run

```bash
# Install all dependencies (frontend + backend)
npm install
cd server && npm install && cd ..

# Option 1: Run both servers with one command (recommended)
npm run dev:all

# Option 2: Run separately in two terminals
# Terminal 1:
npm run dev:server

# Terminal 2:
npm run dev
```

### 4️⃣ Test It!

1. Open http://localhost:5173
2. Click "Login with GitHub"
3. Authorize the app
4. See your dashboard with:
   - ✅ Contribution heatmap
   - ✅ Activity timeline
   - ✅ GitHub profile stats

---

## 📁 Project Structure

```
01-rect/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx          # 🔐 Auth state management
│   ├── services/
│   │   └── githubApi.js             # 🌐 GitHub API calls
│   └── components/
│       ├── login-form.jsx           # 🔑 Login page
│       ├── github-heatmap-calendar.jsx  # 📊 Contribution heatmap
│       └── activity-timeline.jsx    # 📋 Activity feed
├── server/
│   ├── auth-server.js               # 🔧 OAuth proxy
│   ├── package.json
│   └── .env                         # ⚠️ Add your secrets here
├── .env                             # ⚠️ Add your client ID here
├── INSTRUCTIONS.md                  # 📖 Detailed setup guide
└── QUICK-START.md                   # ⚡ This file
```

---

## 🎯 Features Overview

| Feature                 | Status | Description                      |
| ----------------------- | ------ | -------------------------------- |
| 🔐 GitHub OAuth         | ✅     | Secure authentication via GitHub |
| 📊 Contribution Heatmap | ✅     | Full-year GitHub-style calendar  |
| 📋 Activity Timeline    | ✅     | Recent commits, PRs, issues      |
| 👤 User Profile         | ✅     | Avatar, name, stats in navbar    |
| 🎨 Responsive UI        | ✅     | Works on all screen sizes        |

---

## 🛠️ Common Commands

```bash
# Run both frontend and backend together
npm run dev:all

# Run frontend only
npm run dev

# Run backend only
npm run dev:server

# Install dependencies
npm install
cd server && npm install

# Build for production
npm run build

# Lint code
npm run lint
```

---

## 🐛 Troubleshooting

### "Failed to authenticate with GitHub"

✅ **Fix**: Check your Client ID and Secret in `.env` files

### "CORS error"

✅ **Fix**: Make sure `CLIENT_URL` in `server/.env` is `http://localhost:5173`

### "Port already in use"

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
cd server && rm -rf node_modules package-lock.json && npm install
```

---

## 📊 GitHub API Features

| API         | Used For            | Endpoint                        |
| ----------- | ------------------- | ------------------------------- |
| REST API    | User profile, repos | `/user`, `/users/{user}/events` |
| GraphQL API | Contribution data   | `contributionsCollection`       |

**Rate Limits**: 5,000 requests/hour when authenticated

---

## 🔒 Security Checklist

- ✅ Client secret is only in backend `.env`
- ✅ `.env` files are in `.gitignore`
- ✅ Tokens stored in localStorage (client-side only)
- ✅ Backend proxy protects client secret
- ✅ CORS configured to only allow your frontend

---

## 📱 What You'll See

### Login Page

- Clean, modern design
- Big "Login with GitHub" button
- Loading states and error messages

### Dashboard

- **Navbar**: Your profile pic, hover to see logout
- **Main**: Personalized greeting + GitHub stats
- **Right Sidebar**:
  - Contribution heatmap (hover squares for details)
  - Activity timeline (commits, PRs, issues, repos)

---

## 🎨 Color Scheme (Contribution Heatmap)

| Level | Color   | Count             |
| ----- | ------- | ----------------- |
| 0     | #161b22 | 0 contributions   |
| 1     | #0e4429 | 1-2 contributions |
| 2     | #006d32 | 3-5 contributions |
| 3     | #26a641 | 6-8 contributions |
| 4     | #39d353 | 9+ contributions  |

---

## 📚 Additional Documentation

- **INSTRUCTIONS.md** - Complete detailed setup guide
- **FEATURE-SUMMARY.md** - Technical implementation details

---

## ⚠️ Important Notes

1. **Backend must be running** on port 3001 for auth to work
2. **GitHub OAuth app** must have correct callback URL
3. **Both .env files** must be configured with your credentials
4. **Don't commit** `.env` files to git (they're in `.gitignore`)

---

## 💡 Pro Tips

- Use `npm run dev:all` to run both servers with one command
- Keep browser console open to see any errors
- Check server logs if authentication fails
- GitHub API rate limit is generous (5k/hour)

---

## 🎉 You're All Set!

Your GitHub authentication feature is ready to use. Enjoy your personalized dashboard with real-time GitHub data!

**Need help?** Check [INSTRUCTIONS.md](./INSTRUCTIONS.md) for detailed troubleshooting.
