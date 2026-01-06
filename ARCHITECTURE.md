# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React Application (Port 5173)                 │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │  │
│  │  │  Login Form  │  │    Navbar    │  │  GitHub Heatmap  │ │  │
│  │  │              │  │              │  │    Calendar      │ │  │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │  │
│  │         │                 │                    │           │  │
│  │         └─────────────────┼────────────────────┘           │  │
│  │                           │                                │  │
│  │                    ┌──────▼──────┐                         │  │
│  │                    │ AuthContext │                         │  │
│  │                    │  (State)    │                         │  │
│  │                    └──────┬──────┘                         │  │
│  │                           │                                │  │
│  │                    ┌──────▼──────┐                         │  │
│  │                    │ GitHub API  │                         │  │
│  │                    │  Service    │                         │  │
│  │                    └──────┬──────┘                         │  │
│  └───────────────────────────┼─────────────────────────────────┘  │
└────────────────────────────────┼──────────────────────────────────┘
                                │
                                │ HTTP Requests
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        │                       │                       │
┌───────▼────────┐      ┌───────▼────────┐    ┌────────▼────────┐
│   GitHub.com   │      │  Express.js    │    │  GitHub API     │
│                │      │  Auth Server   │    │                 │
│  OAuth Flow    │      │  (Port 3001)   │    │  REST/GraphQL   │
│                │      │                │    │                 │
│  1. Authorize  │      │  Exchange code │    │  • /user        │
│  2. Return code│◄─────┤  for token     │    │  • /events      │
│  3. Callback   │      │                │    │  • /repos       │
│                │      │  Proxy requests│    │  • GraphQL      │
└────────────────┘      └────────────────┘    └─────────────────┘
```

## Authentication Flow

```
┌──────┐                                                      ┌────────────┐
│      │ 1. Click "Login with GitHub"                       │            │
│      ├────────────────────────────────────────────────────►│   GitHub   │
│      │                                                      │            │
│      │ 2. User authorizes app                             │   OAuth    │
│ User │                                                      │            │
│      │◄────────────────────────────────────────────────────┤   Server   │
│      │ 3. Redirect with authorization code                │            │
│      │    (http://localhost:5173/callback?code=xxx)       └────────────┘
│      │
│      │ 4. Send code to backend
│      ├──────────────────────┐
│      │                      │
│      │                      ▼
│      │              ┌───────────────┐
│      │              │  Auth Server  │
│      │              │  (Port 3001)  │
│      │              │               │
│      │              │ POST /auth/   │
│      │              │ github/       │
│      │              │ callback      │
│      │              │               │
│      │              └───────┬───────┘
│      │                      │
│      │                      │ 5. Exchange code for token
│      │                      │
│      │                      ▼
│      │              ┌───────────────┐
│      │              │    GitHub     │
│      │◄─────────────┤   API Server  │
│      │ 6. Return    │               │
│      │    access    └───────────────┘
│      │    token
│      │
│      │ 7. Store token in localStorage
│      │
│      │ 8. Fetch user data with token
│      │
│      ├────────────────────────────────────►┌──────────────┐
│      │                                      │  GitHub API  │
│      │◄─────────────────────────────────────│              │
│      │ 9. Return user profile, events, etc.│  /user       │
│      │                                      │  /events     │
└──────┘                                      └──────────────┘
```

## Data Flow

### On Application Load

```
App Start
   │
   ├─► Check localStorage for token
   │
   ├─► If token exists:
   │     ├─► Fetch user profile (GET /user)
   │     ├─► Store user in AuthContext
   │     └─► Render Dashboard
   │
   └─► If no token:
         └─► Render Login Page
```

### After Login

```
Dashboard Loaded
   │
   ├─► Navbar
   │     └─► Display user.avatar_url, user.name, user.login
   │
   ├─► Middle Section
   │     └─► Display user.public_repos, user.followers, user.following
   │
   └─► Right Sidebar
         │
         ├─► GitHub Heatmap Calendar
         │     ├─► Fetch contribution data (GraphQL)
         │     │     └─► contributionsCollection query
         │     └─► Render colored grid
         │
         └─► Activity Timeline
               ├─► Fetch user events (GET /users/{user}/events)
               ├─► Parse events into categories:
               │     ├─► Commits
               │     ├─► Pull Requests
               │     ├─► Issues
               │     └─► Repositories
               └─► Render timeline
```

## Component Hierarchy

```
App (AuthProvider)
│
├─► AppContent
│   │
│   ├─► If NOT authenticated:
│   │   └─► LoginForm
│   │       └─► GitHub OAuth Button
│   │
│   └─► If authenticated:
│       ├─► Navbar
│       │   ├─► Logo
│       │   ├─► Search
│       │   ├─► Notifications
│       │   └─► User Profile Dropdown
│       │       └─► Logout Button
│       │
│       └─► Homepage
│           ├─► Sidebar (left)
│           │
│           └─► Main
│               ├─► Middle
│               │   ├─► Greeting (personalized)
│               │   ├─► Stats Card
│               │   ├─► Mission Container
│               │   └─► Events
│               │
│               └─► RightSidebar
│                   ├─► GitHubHeatmapCalendar
│                   │   ├─► Month labels
│                   │   ├─► Contribution grid
│                   │   └─► Legend
│                   │
│                   └─► ActivityTimeline
│                       ├─► Commits section
│                       ├─► Repositories section
│                       ├─► Pull Requests section
│                       └─► Issues section
```

## API Integration Points

### 1. Authentication (Backend Proxy)

```
Endpoint: POST http://localhost:3001/auth/github/callback
Body: { code: "authorization_code" }
Response: { access_token: "token", token_type: "bearer", scope: "..." }
```

### 2. User Profile (GitHub REST API)

```
Endpoint: GET https://api.github.com/user
Headers: { Authorization: "Bearer {token}" }
Response: { login, name, avatar_url, public_repos, followers, following, ... }
```

### 3. User Events (GitHub REST API)

```
Endpoint: GET https://api.github.com/users/{username}/events
Headers: { Authorization: "Bearer {token}" }
Response: Array of event objects (PushEvent, PullRequestEvent, IssuesEvent, ...)
```

### 4. Contribution Data (GitHub GraphQL API)

```
Endpoint: POST https://api.github.com/graphql
Headers: { Authorization: "Bearer {token}" }
Body: GraphQL query for contributionsCollection
Response: { weeks: [{ contributionDays: [{ date, contributionCount, color }] }] }
```

## State Management

```
AuthContext
│
├─► State
│   ├─► user: null | UserObject
│   ├─► loading: boolean
│   └─► error: string | null
│
├─► Actions
│   ├─► loginWithGitHub()
│   ├─► logout()
│   └─► getToken()
│
└─► Effects
    ├─► Check localStorage on mount
    ├─► Handle OAuth callback
    └─► Fetch user data with token
```

## File Organization

```
src/
├── context/
│   └── AuthContext.jsx          # Global auth state
│
├── services/
│   └── githubApi.js             # API helper functions
│
├── components/
│   ├── login-form.jsx           # Login UI
│   ├── navbar.jsx               # Top navigation
│   ├── github-heatmap-calendar.jsx  # Contribution visualization
│   ├── activity-timeline.jsx    # Activity feed
│   ├── middle.jsx               # Main content
│   └── rightsidebar.jsx         # Right panel
│
└── App.jsx                      # Root component with routing
```

## Security Layers

```
┌───────────────────────────────────────────────┐
│  Layer 1: Environment Variables                │
│  - Client ID/Secret separated                  │
│  - .env files not committed to git             │
└───────────┬───────────────────────────────────┘
            │
┌───────────▼───────────────────────────────────┐
│  Layer 2: Backend Proxy                        │
│  - Client secret never exposed to frontend     │
│  - Token exchange happens server-side          │
└───────────┬───────────────────────────────────┘
            │
┌───────────▼───────────────────────────────────┐
│  Layer 3: CORS Configuration                   │
│  - Only allows requests from localhost:5173    │
│  - Prevents unauthorized access                │
└───────────┬───────────────────────────────────┘
            │
┌───────────▼───────────────────────────────────┐
│  Layer 4: Token Storage                        │
│  - Tokens stored in localStorage               │
│  - Validated on every API request              │
└───────────────────────────────────────────────┘
```

## Error Handling

```
Error Handling Strategy
│
├─► Authentication Errors
│   ├─► Invalid credentials → Show error message
│   ├─► Network error → Retry mechanism
│   └─► Token expired → Prompt re-login
│
├─► API Errors
│   ├─► Rate limit exceeded → Show wait message
│   ├─► 404 Not Found → Handle gracefully
│   └─► Network timeout → Retry with backoff
│
└─► UI Errors
    ├─► Loading states → Spinner/skeleton
    ├─► Empty states → Helpful message
    └─► Error boundaries → Fallback UI
```

---

This architecture ensures:

- ✅ **Security**: Client secret never exposed to frontend
- ✅ **Performance**: Efficient API calls with caching potential
- ✅ **Scalability**: Modular component structure
- ✅ **Maintainability**: Clear separation of concerns
