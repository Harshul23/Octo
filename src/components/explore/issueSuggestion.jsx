import React from 'react';
import { Check, X, Zap, ExternalLink, Clock, MessageSquare } from 'lucide-react';

const IssueSuggestionCard = ({ issue, onAccept, onReject }) => {
  // Sample issue data - will come from your backend later
  const sampleIssue = issue || {
    id:  1,
    title:  "Fix:  Button hover state on dark mode",
    repo: "shadcn/ui",
    labels: ["good first issue", "bug"],
    simplifiedSummary: "The button looks weird when you hover over it in dark mode.  You need to change the hover color in the CSS.",
    aiSolution: "Update the hover: bg-slate-700 to hover:bg-slate-600 in the Button component's className.",
    difficulty: "Easy",
    comments: 0,
    createdAt: "2 hours ago"
  };

  const data = issue || sampleIssue;

  const difficultyColors = {
    Easy: 'bg-emerald-400/20 text-emerald-400',
    Medium:  'bg-yellow-400/20 text-yellow-400',
    Hard:  'bg-red-400/20 text-red-400'
  };

  return (
    <div className="w-full p-5 rounded-2xl bg-[#161616] border border-white/5 hover:border-white/10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="size-4 text-yellow-400" />
            <span className="text-xs text-neutral-500 uppercase tracking-wider">AI Suggested</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">{data.title}</h3>
          <p className="text-sm text-neutral-400">{data.repo}</p>
        </div>
        <a 
          href={`https://github.com/${data.repo}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ExternalLink className="size-4 text-neutral-500" />
        </a>
      </div>

      {/* Labels */}
      <div className="flex flex-wrap gap-2 mb-4">
        {data. labels.map((label, idx) => (
          <span 
            key={idx}
            className="px-2 py-1 text-xs rounded-full bg-white/5 text-neutral-300"
          >
            {label}
          </span>
        ))}
        <span className={`px-2 py-1 text-xs rounded-full ${difficultyColors[data.difficulty]}`}>
          {data.difficulty}
        </span>
      </div>

      {/* Simplified Summary (for 1st year student) */}
      <div className="mb-4 p-3 rounded-xl bg-black/50 border border-white/5">
        <p className="text-sm text-neutral-300 leading-relaxed">
          <span className="text-emerald-400 font-medium">🎯 In simple words:  </span>
          {data.simplifiedSummary}
        </p>
      </div>

      {/* AI Solution Preview */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
        <p className="text-sm text-neutral-300 leading-relaxed">
          <span className="text-purple-400 font-medium">💡 Quick fix idea:  </span>
          {data.aiSolution}
        </p>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 mb-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <Clock className="size-3" />
          <span>{data.createdAt}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="size-3" />
          <span>{data.comments} comments</span>
        </div>
      </div>

      {/* Action Buttons - DO and NOPE */}
      <div className="flex gap-3">
        <button 
          onClick={() => onAccept?.(data)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all duration-200 hover:scale-[1.02]"
        >
          <Check className="size-5" />
          <span>Do It! </span>
        </button>
        <button 
          onClick={() => onReject?.(data)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold transition-all duration-200 border border-white/10"
        >
          <X className="size-5" />
          <span>Nope</span>
        </button>
      </div>
    </div>
  );
};

export default IssueSuggestionCard;