# Octo Dashboard - GitHub Integration

A modern React dashboard with GitHub OAuth authentication, contribution heatmap, and real-time activity tracking.

## ✨ Features

- 🔐 **GitHub OAuth Authentication** - Secure login with GitHub
- 📊 **Contribution Heatmap** - Beautiful GitHub-style contribution calendar
- 📋 **Activity Timeline** - Real-time feed of commits, PRs, issues, and repos
- 👤 **User Profile Integration** - Display GitHub profile data and stats
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- ⚡ **Fast & Efficient** - Built with Vite and React 19

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- GitHub account

### 1. Clone and Install

```bash
cd /Users/harshul/coding/React/react-p01/01-rect
npm run setup  # Automated setup script
```

### 2. Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Create new OAuth App:
   - **Homepage URL**: `http://localhost:5173`
   - **Callback URL**: `http://localhost:5173/callback`
3. Copy your Client ID and Client Secret

### 3. Configure Environment

**Frontend `.env`:**

```env
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/callback
```

**Backend `server/.env`:**

```env
PORT=3001
CLIENT_URL=http://localhost:5173
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 4. Run the Application

```bash
# Run both frontend and backend
npm run dev:all

# Or separately:
npm run dev          # Frontend on port 5173
npm run dev:server   # Backend on port 3001
```

### 5. Open and Login

Visit http://localhost:5173 and click "Login with GitHub"

## 📖 Documentation

- **[QUICK-START.md](./QUICK-START.md)** - Fast setup guide
- **[INSTRUCTIONS.md](./INSTRUCTIONS.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and flow diagrams
- **[FEATURE-SUMMARY.md](./FEATURE-SUMMARY.md)** - Technical implementation details

## 📁 Project Structure

```
01-rect/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx          # Authentication state
│   ├── services/
│   │   └── githubApi.js             # GitHub API integration
│   ├── components/
│   │   ├── login-form.jsx           # Login page
│   │   ├── github-heatmap-calendar.jsx  # Contribution heatmap
│   │   ├── activity-timeline.jsx    # Activity feed
│   │   └── navbar.jsx               # Navigation with user profile
│   └── App.jsx
├── server/
│   ├── auth-server.js               # OAuth proxy server
│   └── package.json
└── [documentation files]
```

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **Backend**: Express.js, Node.js
- **APIs**: GitHub REST API, GitHub GraphQL API
- **Auth**: GitHub OAuth 2.0

## 🎯 Features Breakdown

### Authentication

- Secure OAuth 2.0 flow
- Token management with localStorage
- Automatic session persistence
- Protected routes

### Contribution Heatmap

- Full year of contribution data
- GitHub-style color coding
- Interactive hover tooltips
- Responsive grid layout

### Activity Timeline

- Real-time GitHub activity
- Categorized by type (commits, PRs, issues, repos)
- Aggregated statistics
- Direct links to GitHub

## 🔒 Security

- Client secret never exposed to frontend
- Backend proxy for token exchange
- CORS configuration
- Environment variable protection
- Token validation on API requests

## 📊 GitHub API Usage

| API         | Purpose                     | Rate Limit       |
| ----------- | --------------------------- | ---------------- |
| REST API    | User profile, events, repos | 5000/hour        |
| GraphQL API | Contribution calendar data  | 5000 points/hour |

## 🐛 Troubleshooting

See [INSTRUCTIONS.md](./INSTRUCTIONS.md#troubleshooting) for common issues and solutions.

## 🚀 Deployment

For production deployment:

1. Update GitHub OAuth app with production URLs
2. Set production environment variables
3. Build frontend: `npm run build`
4. Deploy backend to hosting service
5. Deploy frontend to static hosting

## 📝 License

This project is part of a learning exercise.

## 🙏 Acknowledgments

- GitHub API for comprehensive developer tools
- React and Vite communities
- TailwindCSS for styling utilities

---

**Made with ❤️ for developers who love GitHub**
