# Sup

A modern, AI-powered GitHub productivity dashboard that helps developers track their contributions, manage projects, and gamify their coding journey.

![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-cyan?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Dashboard & Activity Tracking

- **GitHub Contribution Heatmap** - Visual calendar showing your daily contributions
- **Activity Feed** - Real-time feed of your GitHub events (commits, PRs, issues)
- **Quick Stats** - At-a-glance view of your repositories, PRs, and contributions
- **Streak Tracking** - Keep track of your coding streaks

### Explore & Discover

- **AI-Recommended Repos** - Personalized repository recommendations
- **Forked Repos Management** - Easy access to your forked repositories
- **Skills Overview** - Visual representation of your tech stack
- **Smart Filters** - Filter by difficulty, language, and labels

### Kanban Project Board

- **Drag & Drop Interface** - Intuitive task management with `@dnd-kit`
- **GitHub Integration** - Sync issues and PRs directly from your repositories
- **Multiple Card Types** - Track issues, PRs, and personal notes
- **Priority Management** - Organize tasks by priority levels

### Achievements & Gamification

- **Progress Tracking** - XP-based leveling system
- **Achievement Categories** - Unlock achievements across different categories
- **Streak Rewards** - Earn badges for consistent contributions
- **Visual Progress** - Beautiful charts and progress indicators

### AI-Powered Agent

- **PR Analysis** - Get AI-generated suggestions for your pull requests
- **Issue Insights** - Intelligent analysis of repository issues
- **Multi-Provider Support** - Choose from Gemini (free!), OpenAI, or Anthropic

## Tech Stack

### Frontend

- **React 19** - UI library
- **Vite 7** - Build tool & dev server
- **TailwindCSS 4** - Utility-first styling
- **React Router 7** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **@dnd-kit** - Drag and drop functionality

### Backend

- **Node.js** - Runtime environment
- **Express** - API server
- **Vercel Serverless** - Production deployment

### Integrations

- **GitHub OAuth** - Authentication
- **GitHub API & GraphQL** - Data fetching
- **AI APIs** - Gemini, OpenAI, Anthropic

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub account
- GitHub OAuth App credentials

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/octo.git
   cd octo
   ```

2. **Run the setup script**

   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

   Or manually install dependencies:

   ```bash
   npm install
   cd backend && npm install
   cd ../server && npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_GITHUB_CLIENT_ID=your_github_client_id
   VITE_GITHUB_REDIRECT_URI=http://localhost:5173/callback
   VITE_AUTH_API_URL=http://localhost:3001

   # Optional: Enable dev mode without OAuth
   VITE_DEV_AUTH_BYPASS=true
   ```

   Create a `.env` file in the `backend/` directory:

   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # AI Provider (choose one)
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key
   # OPENAI_API_KEY=your_openai_api_key
   # ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. **Start the development server**

   ```bash
   # Run frontend and backend together
   npm run dev:all

   # Or run separately
   npm run dev          # Frontend only
   npm run dev:server   # Backend only
   ```

5. **Open in browser**

   Navigate to [http://localhost:5173](http://localhost:5173)

## Project Structure

```
octo/
├── api/                    # Vercel serverless functions
│   ├── auth/               # GitHub OAuth callback
│   ├── agent/              # AI agent endpoints
│   └── lib/                # Shared utilities
├── backend/                # Express backend server
│   └── agents/             # AI agent implementations
├── server/                 # Auth server for development
├── src/
│   ├── components/
│   │   ├── achievements/   # Achievement system components
│   │   ├── explore/        # Explore & discover features
│   │   ├── home/           # Dashboard & activity feed
│   │   ├── kanban/         # Project board components
│   │   └── ui/             # Reusable UI components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & constants
│   └── services/           # API service functions
└── public/                 # Static assets
```

## Deployment

### Vercel (Recommended)

See [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

### AI Agent Setup

For setting up the AI-powered features, see [AI-AGENT-SETUP.md](./AI-AGENT-SETUP.md).

## Available Scripts

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `npm run dev`        | Start frontend development server |
| `npm run dev:server` | Start backend development server  |
| `npm run dev:all`    | Start both frontend and backend   |
| `npm run build`      | Build for production              |
| `npm run preview`    | Preview production build          |
| `npm run lint`       | Run ESLint                        |
| `npm run setup`      | Run setup script                  |

## Configuration

### GitHub OAuth App Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - **Homepage URL**: `http://localhost:5173` (dev) or your production URL
   - **Callback URL**: `http://localhost:5173/callback` (dev) or your production callback

### AI Provider Setup

The app supports three AI providers:

| Provider      | Free Tier                   | Cost             |
| ------------- | --------------------------- | ---------------- |
| **Gemini**    | ✅ 15 req/min, 1.5K req/day | Free             |
| **OpenAI**    | ❌                          | ~$0.15/1M tokens |
| **Anthropic** | ❌                          | ~$3/1M tokens    |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [GitHub API](https://docs.github.com/en/rest) for data access
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Lucide](https://lucide.dev/) for beautiful icons
- [Recharts](https://recharts.org/) for data visualization

---

<p align="center">
  Made with love by developers, for developers
</p>
