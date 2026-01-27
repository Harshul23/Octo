/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // GitHub OAuth configuration
  const CLIENT_ID = process.meta.env.GITHUB_CLIENT_ID;
  const REDIRECT_URI =
    process.meta.env.GITHUB_REDIRECT_URI ||
    "http://localhost:5173/callback";

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
      window.history.replaceState({}, document.title, window.location.pathname);
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange code for token");
        }

        const data = await response.json();

        if (data.access_token) {
          localStorage.setItem("github_token", data.access_token);

          // Clean URL
          window.history.replaceState({}, document.title, "/");

          // Fetch user data
          await fetchUserData(data.access_token);
        } else {
          throw new Error(data.error_description || "No access token received");
        }
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
