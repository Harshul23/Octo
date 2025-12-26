# Octo - GitHub Automation Tool

> Your intelligent GitHub contribution companion that helps you discover repositories matching your skills and manage your open source journey.

## ✨ Features

- **Repository Discovery**: Analyzes your merged PRs to find new repos matching your skills
- **Smart Filtering**: Excludes repositories you already own or have forked
- **Language & Topic Analysis**: Identifies your top programming languages and interests
- **Beautiful Dashboard**: React-based UI to visualize recommendations

## 📁 Project Structure

```
octo/
├── backend/           # The Python logic (The Kitchen)
│   ├── main.py        # FastAPI entry point
│   ├── scout.py       # Repository discovery logic
│   └── requirements.txt
├── frontend/          # The React App (The Dining Area)
│   ├── src/
│   │   ├── App.tsx    # Main React component
│   │   ├── main.tsx   # React entry point
│   │   └── index.css  # Tailwind styles
│   ├── public/
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- GitHub Personal Access Token

### 1. Get Your GitHub Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:user`
4. Copy the token

### 2. Setup Backend

```bash
cd octo/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your GitHub token to .env
# GITHUB_TOKEN=your_token_here
```

### 3. Run Backend

```bash
# As API server (recommended)
python main.py

# Or as CLI tool
python main.py --cli

# Or run scout directly
python scout.py
```

The API will be available at `http://localhost:8000`

### 4. Setup Frontend

```bash
cd octo/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/discover` | GET | Discover repository recommendations |
| `/api/profile` | GET | Get analyzed user profile |
| `/docs` | GET | Interactive API documentation |

### Example API Call

```bash
# Discover repositories
curl http://localhost:8000/api/discover?max_results=5
```

## 🧠 How It Works

1. **Authentication**: Uses your GitHub token to access the API
2. **PR Analysis**: Fetches your merged Pull Requests
3. **Profile Building**: Identifies top languages and topics from your contributions
4. **Repository Search**: Searches GitHub for matching repositories with:
   - Good first issues
   - Active development
   - Matching languages
5. **Filtering**: Excludes repos you own or have already forked
6. **Recommendations**: Returns top 5 repositories to contribute to

## 📊 What Gets Analyzed

From your merged PRs, Octo extracts:
- **Top 3 Languages**: Based on repository primary language
- **Top 5 Topics**: Based on repository topic tags
- **Contribution Patterns**: Active repositories and domains

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | Your GitHub PAT | Yes |
| `PORT` | API server port | No (default: 8000) |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this for your own projects!

---

Made with 💜 by a fellow open source enthusiast
