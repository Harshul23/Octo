import React, { useState } from 'react';
import { Compass, RefreshCw, Filter } from 'lucide-react';
import IssueCard from './IssueCard';

const DiscoverIssues = ({ filters, searchQuery }) => {
  const [issues, setIssues] = useState([
    {
      id: 1,
      title: "Add dark mode toggle to settings page",
      repo: "shadcn/ui",
      repoOwner: "shadcn",
      number: 4521,
      labels: ["good first issue", "enhancement", "ui"],
      difficulty: "Easy",
      comments: 0,
      createdAt: "2 hours ago",
      author: "danielcroe",
      authorAvatar: "https://github.com/danielcroe.png",
      body: "We need to add a dark mode toggle in the settings.  The theme context already exists, we just need the UI component.",
      simplifiedSummary: "Add a switch button that lets users turn dark mode on/off.  The hard part (making things dark) is already done - you just need to add the button! ",
      aiSolutionHint: "Create a Toggle component using the existing useTheme() hook. When clicked, call setTheme('dark') or setTheme('light').",
      estimatedTime: "30 mins",
      skillsNeeded: ["React", "Tailwind CSS"],
      hasNoPR: true
    },
    {
      id: 2,
      title: "Fix:  Button hover state inconsistency",
      repo: "vercel/next.js",
      repoOwner: "vercel",
      number: 58234,
      labels: ["bug", "good first issue"],
      difficulty: "Easy",
      comments: 2,
      createdAt: "5 hours ago",
      author:  "leerob",
      authorAvatar:  "https://github.com/leerob.png",
      body: "The button hover state shows different colors on Chrome vs Firefox. Need to standardize the CSS.",
      simplifiedSummary:  "The button looks different when you hover over it in Chrome vs Firefox.  Just make the hover color the same in both browsers! ",
      aiSolutionHint: "Check the Button. module.css file.  Replace the hover pseudo-class with a more specific selector that works across browsers.",
      estimatedTime: "20 mins",
      skillsNeeded: ["CSS"],
      hasNoPR: true
    },
    {
      id: 3,
      title: "Documentation: Add examples for useCallback hook",
      repo: "facebook/react",
      repoOwner: "facebook",
      number: 28456,
      labels: ["documentation", "good first issue", "help wanted"],
      difficulty: "Medium",
      comments: 0,
      createdAt: "1 day ago",
      author:  "gaearon",
      authorAvatar: "https://github.com/gaearon.png",
      body: "The useCallback documentation needs more real-world examples. Please add 2-3 practical examples showing common use cases.",
      simplifiedSummary: "The docs for useCallback are confusing. Add some real examples showing when and why you'd use it - like preventing a button from re-rendering unnecessarily.",
      aiSolutionHint: "Add examples showing:  1) Passing callbacks to child components 2) Event handlers in lists 3) Debounced search input",
      estimatedTime: "1 hour",
      skillsNeeded:  ["React", "Technical Writing"],
      hasNoPR: true
    },
    {
      id: 4,
      title: "Add loading skeleton for dashboard cards",
      repo: "tremor/tremor",
      repoOwner: "tremor",
      number: 1234,
      labels: ["enhancement", "ui", "good first issue"],
      difficulty: "Easy",
      comments: 1,
      createdAt: "3 hours ago",
      author: "christophersevilla",
      authorAvatar:  "https://github.com/christophersevilla.png",
      body: "Dashboard cards should show a skeleton loader while data is being fetched instead of showing nothing.",
      simplifiedSummary:  "When the dashboard is loading, show gray placeholder boxes (skeletons) instead of blank space. It looks more professional and users know something is loading! ",
      aiSolutionHint: "Create a CardSkeleton component with animated gray boxes. Use Tailwind's animate-pulse class for the shimmer effect.",
      estimatedTime: "45 mins",
      skillsNeeded: ["React", "Tailwind CSS"],
      hasNoPR: true
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [acceptedIssues, setAcceptedIssues] = useState([]);
  const [rejectedIssues, setRejectedIssues] = useState([]);

  const handleAccept = (issue) => {
    setAcceptedIssues([...acceptedIssues, issue]);
    // Move to next issue
    if (currentIndex < issues.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    console.log('Added to board:', issue. title);
  };

  const handleReject = (issue) => {
    setRejectedIssues([...rejectedIssues, issue]);
    // Move to next issue
    if (currentIndex < issues.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    console.log('Skipped:', issue.title);
  };

  const handleRefresh = () => {
    // Reset or fetch new issues
    setCurrentIndex(0);
    console.log('Refreshing issues...');
  };

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Compass className="size-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Discover Issues</h2>
          <span className="text-sm text-neutral-500">
            ({issues.length - currentIndex} remaining)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-neutral-400 hover: bg-white/10 hover:text-white transition-all text-sm"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-emerald-400" />
          <span className="text-neutral-400">
            Added:  <span className="text-emerald-400 font-medium">{acceptedIssues.length}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-neutral-600" />
          <span className="text-neutral-400">
            Skipped: <span className="text-neutral-300 font-medium">{rejectedIssues.length}</span>
          </span>
        </div>
      </div>

      {/* Issue Cards Stack */}
      {currentIndex < issues.length ? (
        <IssueCard
          issue={issues[currentIndex]}
          onAccept={handleAccept}
          onReject={handleReject}
          queuePosition={currentIndex + 1}
          totalInQueue={issues.length}
        />
      ) : (
        <div className="p-12 rounded-2xl bg-[#161616] border border-white/5 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
          <p className="text-neutral-400 mb-4">You've reviewed all suggested issues. </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-xl bg-yellow-400 text-black font-medium hover: bg-yellow-300 transition-colors"
          >
            Find More Issues
          </button>
        </div>
      )}

      {/* Recently Added Preview */}
      {acceptedIssues.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
          <h4 className="text-sm font-medium text-emerald-400 mb-2">
            ✅ Recently added to your board:
          </h4>
          <div className="flex flex-wrap gap-2">
            {acceptedIssues.slice(-3).map((issue) => (
              <span
                key={issue.id}
                className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs"
              >
                {issue.repo} #{issue.number}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverIssues;