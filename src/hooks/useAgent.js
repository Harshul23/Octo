import { useState, useEffect, useCallback, useRef } from "react";

const AGENT_BASE_URL =
  import.meta.env.VITE_AGENT_URL || "http://localhost:5000";

/**
 * Hook for interacting with the Octo AI Agent
 * Provides activity feed, PR analysis, and Ask Octo functionality
 */
export function useAgent() {
  const [activities, setActivities] = useState([]);
  const [actionableItems, setActionableItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const getToken = () => localStorage.getItem("github_token");

  /**
   * Fetch recent activity from the agent
   */
  const fetchActivity = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("Not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${AGENT_BASE_URL}/api/agent/activity?token=${token}&limit=30`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activity");
      }

      const data = await response.json();
      setActivities(data.activities || []);
      setActionableItems(data.actionable || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("Activity fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    activities,
    actionableItems,
    summary,
    loading,
    error,
    fetchActivity,
    refresh: fetchActivity,
  };
}

/**
 * Hook for analyzing a specific PR
 */
export function usePRAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem("github_token");

  /**
   * Analyze a specific PR
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} prNumber - PR number
   */
  const analyzePR = useCallback(async (owner, repo, prNumber) => {
    const token = getToken();
    if (!token) {
      setError("Not authenticated");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${AGENT_BASE_URL}/api/agent/analyze-pr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, owner, repo, prNumber }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze PR");
      }

      const data = await response.json();
      setAnalysis(data);
      return data;
    } catch (err) {
      console.error("PR analysis error:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get cached suggestions for a PR
   */
  const getCachedSuggestions = useCallback(async (owner, repo, prNumber) => {
    try {
      const response = await fetch(
        `${AGENT_BASE_URL}/api/agent/suggestions/${owner}/${repo}/${prNumber}`,
      );

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error("Cache fetch error:", err);
      return null;
    }
  }, []);

  return {
    analysis,
    loading,
    error,
    analyzePR,
    getCachedSuggestions,
    clearAnalysis: () => setAnalysis(null),
  };
}

/**
 * Hook for the "Ask Octo" feature
 */
export function useAskOcto() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  /**
   * Ask Octo a question
   * @param {string} question - The question to ask
   * @param {Object} context - Current PR/issue context
   */
  const ask = useCallback(async (question, context = {}) => {
    if (!question.trim()) return null;

    setLoading(true);
    setError(null);

    try {
      const fetchResponse = await fetch(`${AGENT_BASE_URL}/api/agent/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, context }),
      });

      if (!fetchResponse.ok) {
        throw new Error("Failed to get response from Octo");
      }

      const data = await fetchResponse.json();
      setResponse(data.response);

      // Add to history
      setHistory((prev) => [
        ...prev,
        {
          question,
          response: data.response,
          timestamp: new Date().toISOString(),
        },
      ]);

      return data.response;
    } catch (err) {
      console.error("Ask Octo error:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    response,
    loading,
    error,
    history,
    ask,
    clearResponse: () => setResponse(null),
    clearHistory: () => setHistory([]),
  };
}

/**
 * Hook for polling agent updates
 * @param {number} interval - Polling interval in milliseconds (default: 60000)
 */
export function useAgentPolling(interval = 60000) {
  const {
    fetchActivity,
    activities,
    actionableItems,
    summary,
    loading,
    error,
  } = useAgent();
  const intervalRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    fetchActivity();

    // Set up polling
    intervalRef.current = setInterval(fetchActivity, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchActivity, interval]);

  return {
    activities,
    actionableItems,
    summary,
    loading,
    error,
    refresh: fetchActivity,
  };
}

/**
 * Hook to check agent health/configuration
 */
export function useAgentHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${AGENT_BASE_URL}/api/agent/health`);
        if (response.ok) {
          const data = await response.json();
          setHealth(data);
        } else {
          setHealth({ status: "error", message: "Agent not responding" });
        }
      } catch (err) {
        setHealth({ status: "offline", message: err.message });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return { health, loading, isConfigured: health?.aiConfigured };
}

export default useAgent;
