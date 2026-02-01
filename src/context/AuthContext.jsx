/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

const AuthContext = createContext(null);

// Development-only mock user for testing without OAuth
const DEV_MOCK_USER = {
  id: 12345678,
  login: "dev-user",
  name: "Development User",
  avatar_url: "https://avatars.githubusercontent.com/u/12345678?v=4",
  html_url: "https://github.com/dev-user",
  bio: "Mock user for local development",
  public_repos: 10,
  followers: 100,
  following: 50,
  created_at: "2020-01-01T00:00:00Z",
};

// Check if we're in dev mode AND dev bypass is enabled
const isDevBypass = () => {
  const isDev = import.meta.env.DEV;
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const bypassEnabled = import.meta.env.VITE_DEV_AUTH_BYPASS === "true";

  return isDev && isLocalhost && bypassEnabled;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for dev bypass on initial load
  useEffect(() => {
    if (isDevBypass()) {
      console.log("🔓 DEV AUTH BYPASS ACTIVE - Using mock user");
      setUser(DEV_MOCK_USER);
      setLoading(false);
    }
  }, []);

  // GitHub OAuth configuration
  const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const REDIRECT_URI =
    import.meta.env.VITE_GITHUB_REDIRECT_URI ||
    "http://localhost:5173/callback";
  const AUTH_API_URL =
    import.meta.env.VITE_AUTH_API_URL || "http://localhost:3001";

  // Fetch GitHub user data
  const fetchUserData = useCallback(async (token) => {
    try {
      setLoading(true);
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setUser(userData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
      localStorage.removeItem("github_token");
      setLoading(false);
    }
  }, []);

  // Exchange authorization code for access token
  const exchangeCodeForToken = useCallback(
    async (code) => {
      try {
        setLoading(true);
        setError(null);

        // Use the configured auth API URL (serverless function in production)
        const response = await fetch(`${AUTH_API_URL}/auth/github/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("Failed to authenticate with GitHub");
        }

        const data = await response.json();
        localStorage.setItem("github_token", data.access_token);

        // Clean URL
        window.history.replaceState({}, document.title, "/");

        // Fetch user data
        await fetchUserData(data.access_token);
      } catch (err) {
        console.error("Authentication error:", err);
        setError(err.message);
        setLoading(false);
      }
    },
    [fetchUserData],
  );

  // Check if user is already logged in (token in localStorage)
  useEffect(() => {
    // Skip if dev bypass is active
    if (isDevBypass()) return;

    const token = localStorage.getItem("github_token");
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, [fetchUserData]);

  // Handle GitHub OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && !localStorage.getItem("github_token")) {
      exchangeCodeForToken(code);
    }
  }, [exchangeCodeForToken]);

  // Initiate GitHub OAuth login
  const loginWithGitHub = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo,user,read:org`;
    window.location.href = githubAuthUrl;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("github_token");
    setUser(null);
  };

  // Get access token
  const getToken = () => {
    return localStorage.getItem("github_token");
  };

  const value = {
    user,
    loading,
    error,
    loginWithGitHub,
    logout,
    getToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
