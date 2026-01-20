/**
 * Activity Agent - Monitors and processes PR/Issue activity in real-time
 * Provides structured activity data for the frontend
 */

const { callAI } = require("./prAgent");

/**
 * Activity types and their priority weights
 */
const ACTIVITY_PRIORITIES = {
  changes_requested: 10,
  review_requested: 9,
  commented: 7,
  approved: 5,
  merged: 3,
  opened: 4,
  closed: 2,
};

/**
 * Parse GitHub events into structured activity items
 * @param {Array} events - Raw GitHub events from API
 * @returns {Array} Structured activity items
 */
function parseActivityEvents(events) {
  const activities = [];

  for (const event of events) {
    const activity = {
      id: event.id,
      type: null,
      action: null,
      title: null,
      repo: event.repo?.name || "Unknown",
      number: null,
      author: event.actor?.login || "Unknown",
      authorAvatar: event.actor?.avatar_url,
      timestamp: event.created_at,
      url: null,
      priority: 0,
      needsAction: false,
      body: null,
    };

    switch (event.type) {
      case "PullRequestEvent":
        activity.type = "pull_request";
        activity.action = event.payload?.action;
        activity.title = event.payload?.pull_request?.title;
        activity.number = event.payload?.pull_request?.number;
        activity.url = event.payload?.pull_request?.html_url;
        activity.priority = ACTIVITY_PRIORITIES[event.payload?.action] || 1;
        break;

      case "PullRequestReviewEvent":
        activity.type = "review";
        activity.action = event.payload?.review?.state;
        activity.title = event.payload?.pull_request?.title;
        activity.number = event.payload?.pull_request?.number;
        activity.url = event.payload?.review?.html_url;
        activity.body = event.payload?.review?.body;
        activity.priority =
          ACTIVITY_PRIORITIES[event.payload?.review?.state] || 5;
        activity.needsAction =
          event.payload?.review?.state === "changes_requested";
        break;

      case "PullRequestReviewCommentEvent":
        activity.type = "review_comment";
        activity.action = "commented";
        activity.title = event.payload?.pull_request?.title;
        activity.number = event.payload?.pull_request?.number;
        activity.url = event.payload?.comment?.html_url;
        activity.body = event.payload?.comment?.body;
        activity.priority = ACTIVITY_PRIORITIES["commented"];
        activity.needsAction = true;
        break;

      case "IssueCommentEvent":
        activity.type = "issue_comment";
        activity.action = event.payload?.action;
        activity.title = event.payload?.issue?.title;
        activity.number = event.payload?.issue?.number;
        activity.url = event.payload?.comment?.html_url;
        activity.body = event.payload?.comment?.body;
        activity.priority = ACTIVITY_PRIORITIES["commented"];
        break;

      case "IssuesEvent":
        activity.type = "issue";
        activity.action = event.payload?.action;
        activity.title = event.payload?.issue?.title;
        activity.number = event.payload?.issue?.number;
        activity.url = event.payload?.issue?.html_url;
        activity.priority = ACTIVITY_PRIORITIES[event.payload?.action] || 3;
        break;

      default:
        continue; // Skip non-relevant events
    }

    activities.push(activity);
  }

  // Sort by priority (highest first), then by timestamp (newest first)
  return activities.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
}

/**
 * Get items that need immediate attention
 * @param {Array} activities - Parsed activity items
 * @returns {Array} Activities requiring user action
 */
function getActionableItems(activities) {
  return activities.filter((a) => a.needsAction || a.priority >= 8);
}

/**
 * Generate AI summary for a batch of activities
 * @param {Array} activities - Parsed activity items
 * @returns {Object} AI-generated summary and recommendations
 */
async function generateActivitySummary(activities) {
  if (activities.length === 0) {
    return {
      summary: "No recent activity to report. Time to start something new! 🚀",
      topPriority: null,
      recommendation: "Browse open issues or start a new feature.",
    };
  }

  const actionableCount = activities.filter((a) => a.needsAction).length;
  const reviewsRequested = activities.filter(
    (a) => a.action === "changes_requested",
  ).length;

  // Quick summary without AI for simple cases
  if (activities.length <= 3 && actionableCount === 0) {
    return {
      summary: `${activities.length} recent ${activities.length === 1 ? "activity" : "activities"}. Looking good!`,
      topPriority: activities[0] || null,
      recommendation: "Keep up the great work!",
    };
  }

  // Use AI for complex summaries
  const activityText = activities
    .slice(0, 10)
    .map(
      (a) =>
        `- ${a.type}: ${a.action} on ${a.repo}#${a.number} "${a.title?.slice(0, 50)}"`,
    )
    .join("\n");

  const systemPrompt = `You are Octo, a helpful coding assistant. Summarize the developer's recent activity in a friendly, concise way.`;

  const userPrompt = `Recent GitHub activity:
${activityText}

Actionable items: ${actionableCount}
Reviews with changes requested: ${reviewsRequested}

Provide a JSON response:
{
  "summary": "One friendly sentence summarizing activity (max 100 chars)",
  "recommendation": "One actionable suggestion (max 80 chars)"
}`;

  try {
    const response = await callAI(systemPrompt, userPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary,
        topPriority: activities[0],
        recommendation: parsed.recommendation,
      };
    }
  } catch (error) {
    console.error("Activity summary AI error:", error);
  }

  // Fallback summary
  return {
    summary: `${activities.length} activities, ${actionableCount} need your attention.`,
    topPriority: activities[0],
    recommendation:
      actionableCount > 0
        ? "Address the pending review requests first."
        : "All caught up!",
  };
}

/**
 * Format activity for frontend display
 * @param {Object} activity - Single activity item
 * @returns {Object} Frontend-ready activity object
 */
function formatForFrontend(activity) {
  const timeAgo = getTimeAgo(new Date(activity.timestamp));

  return {
    id: activity.id,
    type: activity.type,
    icon: getActivityIcon(activity.type, activity.action),
    title: activity.title || "Untitled",
    subtitle: `${activity.repo}#${activity.number}`,
    author: activity.author,
    authorAvatar: activity.authorAvatar,
    timeAgo,
    action: formatAction(activity.action),
    actionColor: getActionColor(activity.action),
    url: activity.url,
    needsAction: activity.needsAction,
    preview: activity.body?.slice(0, 100) || null,
  };
}

/**
 * Helper: Get relative time string
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

/**
 * Helper: Get icon name for activity type
 */
function getActivityIcon(type, action) {
  const icons = {
    pull_request: "GitPullRequest",
    review:
      action === "approved"
        ? "CheckCircle"
        : action === "changes_requested"
          ? "XCircle"
          : "MessageSquare",
    review_comment: "MessageSquareCode",
    issue_comment: "MessageCircle",
    issue: "CircleDot",
  };
  return icons[type] || "Activity";
}

/**
 * Helper: Format action for display
 */
function formatAction(action) {
  const actionMap = {
    changes_requested: "Changes Requested",
    approved: "Approved",
    commented: "Commented",
    opened: "Opened",
    closed: "Closed",
    merged: "Merged",
    created: "Created",
  };
  return actionMap[action] || action;
}

/**
 * Helper: Get color for action
 */
function getActionColor(action) {
  const colors = {
    changes_requested: "text-amber-500 bg-amber-500/10",
    approved: "text-emerald-500 bg-emerald-500/10",
    commented: "text-blue-400 bg-blue-400/10",
    opened: "text-green-400 bg-green-400/10",
    closed: "text-purple-400 bg-purple-400/10",
    merged: "text-violet-500 bg-violet-500/10",
  };
  return colors[action] || "text-neutral-400 bg-neutral-400/10";
}

module.exports = {
  parseActivityEvents,
  getActionableItems,
  generateActivitySummary,
  formatForFrontend,
  ACTIVITY_PRIORITIES,
};
