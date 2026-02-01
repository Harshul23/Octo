import React from "react";
import {
  GitPullRequest,
  MessageSquare,
  MessageCircle,
  CheckCircle,
  XCircle,
  CircleDot,
  ExternalLink,
  Clock,
} from "lucide-react";

/**
 * ActivityFeed - Displays recent PR/Issue activity with AI insights
 */
const ActivityFeed = ({ activities = [], loading = false }) => {
  if (loading) {
    return (
      <div className="w-full mt-3 p-3 border border-neutral-700 rounded-xl bg-[#161616] shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-neutral-400 text-xs">Loading activity...</span>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return null;
  }

  const getIcon = (iconName, action) => {
    const iconClass = "size-4";

    switch (iconName) {
      case "GitPullRequest":
        return <GitPullRequest className={iconClass} />;
      case "CheckCircle":
        return <CheckCircle className={`${iconClass} text-emerald-400`} />;
      case "XCircle":
        return <XCircle className={`${iconClass} text-amber-500`} />;
      case "MessageSquare":
      case "MessageSquareCode":
        return <MessageSquare className={iconClass} />;
      case "MessageCircle":
        return <MessageCircle className={iconClass} />;
      case "CircleDot":
        return <CircleDot className={iconClass} />;
      default:
        return <GitPullRequest className={iconClass} />;
    }
  };

  return (
    <div className="w-full mt-3 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-stone-500 text-[10px] font-black uppercase tracking-widest">
          Recent Activity
        </h3>
        <div className="flex items-center gap-1 text-neutral-500">
          <Clock className="size-3" />
          <span className="text-[10px]">Live updates</span>
        </div>
      </div>

      <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start gap-2 p-2 rounded-lg border transition-all hover:bg-white/5 cursor-pointer ${
              activity.needsAction
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-neutral-700 bg-[#161616]"
            }`}
            onClick={() => activity.url && window.open(activity.url, "_blank")}
          >
            {/* Icon */}
            <div
              className={`p-1.5 rounded-lg shrink-0 ${activity.actionColor || "bg-neutral-800"}`}
            >
              {getIcon(activity.icon, activity.action)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">
                    {activity.title}
                  </p>
                  <p className="text-neutral-500 text-[10px] truncate">
                    {activity.subtitle}
                  </p>
                </div>

                {/* Action Badge */}
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${activity.actionColor || "bg-neutral-800 text-neutral-400"}`}
                >
                  {activity.action}
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-1.5 mt-1">
                {activity.authorAvatar && (
                  <img
                    src={activity.authorAvatar}
                    alt={activity.author}
                    className="size-3 rounded-full"
                  />
                )}
                <span className="text-neutral-500 text-[10px]">
                  {activity.author}
                </span>
                <span className="text-neutral-600 text-[10px]">•</span>
                <span className="text-neutral-500 text-[10px]">
                  {activity.timeAgo}
                </span>

                {activity.needsAction && (
                  <>
                    <span className="text-neutral-600 text-[10px]">•</span>
                    <span className="text-amber-500 text-[10px] font-medium">
                      Action needed
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* External Link */}
            <ExternalLink className="size-3 text-neutral-600 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
