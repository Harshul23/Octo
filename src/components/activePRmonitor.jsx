import React from 'react';
import { GitPullRequest, MessageSquare, AlertCircle, Clock, ChevronRight } from 'lucide-react';

const ActivePRsMonitor = ({ prs }) => {
  // Sample data - will be replaced with real GitHub API data
  const samplePRs = prs || [
    {
      id:  1,
      title: "Add dark mode toggle",
      repo: "vercel/next. js",
      status: "needs-action",
      statusText: "Review requested changes",
      simplifiedAction: "The maintainer wants you to add a loading spinner.  Just wrap your component with a Suspense boundary! ",
      updatedAt: "5 min ago",
      comments: 3
    },
    {
      id: 2,
      title: "Fix typo in README",
      repo:  "facebook/react",
      status: "approved",
      statusText: "Ready to merge",
      simplifiedAction: "All good! Just click the merge button when you're ready.",
      updatedAt:  "1 hour ago",
      comments: 1
    }
  ];

  const data = prs || samplePRs;

  const statusStyles = {
    'needs-action': {
      bg: 'bg-orange-400/10',
      text: 'text-orange-400',
      border: 'border-orange-400/30',
      icon: AlertCircle
    },
    'approved':  {
      bg:  'bg-emerald-400/10',
      text:  'text-emerald-400',
      border: 'border-emerald-400/30',
      icon: GitPullRequest
    },
    'changes-requested': {
      bg: 'bg-red-400/10',
      text: 'text-red-400',
      border: 'border-red-400/30',
      icon:  AlertCircle
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <GitPullRequest className="size-5 text-purple-400" />
          Active PRs
        </h2>
        <button className="text-xs text-neutral-500 hover:text-white transition-colors flex items-center gap-1">
          View all <ChevronRight className="size-3" />
        </button>
      </div>

      <div className="space-y-3">
        {data.map((pr) => {
          const style = statusStyles[pr.status] || statusStyles['needs-action'];
          const StatusIcon = style.icon;
          
          return (
            <div 
              key={pr.id}
              className={`p-4 rounded-xl bg-[#161616] border ${style.border} hover:bg-[#1a1a1a] transition-all duration-200 cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white mb-1">{pr.title}</h3>
                  <p className="text-xs text-neutral-500">{pr.repo}</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${style.bg}`}>
                  <StatusIcon className={`size-3 ${style.text}`} />
                  <span className={`text-xs ${style.text}`}>{pr.statusText}</span>
                </div>
              </div>

              {/* Simplified action for student */}
              <div className="p-2 rounded-lg bg-black/30 mb-2">
                <p className="text-xs text-neutral-400">
                  <span className="text-blue-400">📝 What to do:  </span>
                  {pr.simplifiedAction}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{pr.updatedAt}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="size-3" />
                  <span>{pr. comments}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivePRsMonitor;