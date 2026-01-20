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
      <div className="w-full mt-4 p-4 border border-neutral-700 rounded-2xl bg-[#161616]">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-neutral-400 text-sm">Loading activity...</span>
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
    <div className="w-full mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-stone-500 text-[10px] font-black uppercase tracking-widest">
          Recent Activity
        </h3>
        <div className="flex items-center gap-1 text-neutral-500">
          <Clock className="size-3" />
          <span className="text-[10px]">Live updates every minute</span>
        </div>
      </div>

      <div className="space-y-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:bg-white/5 cursor-pointer ${
              activity.needsAction
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-neutral-700 bg-[#161616]"
            }`}
            onClick={() => activity.url && window.open(activity.url, "_blank")}
          >
            {/* Icon */}
            <div
              className={`p-2 rounded-lg ${activity.actionColor || "bg-neutral-800"}`}
            >
              {getIcon(activity.icon, activity.action)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {activity.title}
                  </p>
                  <p className="text-neutral-500 text-xs truncate">
                    {activity.subtitle}
                  </p>
                </div>

                {/* Action Badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${activity.actionColor || "bg-neutral-800 text-neutral-400"}`}
                >
                  {activity.action}
                </span>
              </div>

              {/* Preview */}
              {activity.preview && (
                <p className="text-neutral-400 text-xs mt-1 line-clamp-1 italic">
                  "{activity.preview}..."
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-2 mt-2">
                {activity.authorAvatar && (
                  <img
                    src={activity.authorAvatar}
                    alt={activity.author}
                    className="size-4 rounded-full"
                  />
                )}
                <span className="text-neutral-500 text-xs">
                  {activity.author}
                </span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-500 text-xs">
                  {activity.timeAgo}
                </span>

                {activity.needsAction && (
                  <>
                    <span className="text-neutral-600">•</span>
                    <span className="text-amber-500 text-xs font-medium">
                      Needs attention
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* External Link */}
            <ExternalLink className="size-4 text-neutral-600 shrink-0 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
