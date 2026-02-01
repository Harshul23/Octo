import React from "react";
import MainMissionContainer from "./mission.jsx";
import ActivityFeed from "./ActivityFeed.jsx";
import { useAuth } from "@/context/AuthContext";
import { useAgentPolling, useAgentHealth } from "@/hooks/useAgent";
import { AlertCircle, Wifi, WifiOff, Sparkles } from "lucide-react";

const Middle = () => {
  const { user } = useAuth();
  const { activities, actionableItems, summary, loading, error, refresh } =
    useAgentPolling(60000);
  const { health, isConfigured } = useAgentHealth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const userName = user?.name?.split(" ")[0] || user?.login || "User";

  return (
    <div className="text-white h-full w-3/5 flex flex-col overflow-hidden">
      <div className="flex flex-col shrink-0 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-black leading-normal">
            {getGreeting()}, {userName}
          </h1>
          {/* Agent Status Indicator */}
          {health && (
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                health.status === "ok" && isConfigured
                  ? "bg-emerald-500/10 text-emerald-400"
                  : health.status === "ok"
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-red-500/10 text-red-400"
              }`}
            >
              {health.status === "ok" ? (
                <>
                  <Wifi className="size-3" />
                  <span>
                    {isConfigured ? "AI Active" : "AI Not Configured"}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="size-3" />
                  <span>Agent Offline</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* AI Summary Banner */}
        {summary && !loading && (
          <div className="flex items-start gap-2 mt-1">
            <p className="text-sm text-neutral-400">
              {summary.summary ||
                `${user?.public_repos || 0} public repositories are in your profile.`}
            </p>
          </div>
        )}

        {!summary && (
          <p className="text-sm text-neutral-400">
            Intelly wishes you a good and productive day.{" "}
            {user?.public_repos || 0} public repositories are in your profile.
          </p>
        )}

        {/* Actionable Items Alert */}
        {actionableItems.length > 0 && (
          <div className="flex items-center gap-2 mt-2 px-2 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertCircle className="size-3 text-amber-500" />
            <span className="text-amber-400 text-xs font-medium">
              {actionableItems.length} item
              {actionableItems.length > 1 ? "s" : ""} need attention
            </span>
            <button
              onClick={refresh}
              className="ml-auto text-[10px] text-amber-500 hover:text-amber-400 underline"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Main Mission Container - Now receives activity data */}
      <MainMissionContainer
        activities={activities}
        actionableItems={actionableItems}
        summary={summary}
        loading={loading}
        onRefresh={refresh}
      />

      {/* Activity Feed - Shows recent PR/Issue activity */}
      {activities.length > 0 && (
        <ActivityFeed activities={activities.slice(0, 3)} loading={loading} />
      )}
    </div>
  );
};

export default Middle;
