import React, { useState } from 'react';
import { 
  Check, X, ExternalLink, Clock, MessageSquare, 
  User, ChevronDown, ChevronUp, Zap, BookOpen,
  Code, Lightbulb, GitPullRequest
} from 'lucide-react';

const IssueCard = ({ issue, onAccept, onReject, queuePosition, totalInQueue }) => {
  const [expanded, setExpanded] = useState(false);

  const difficultyColors = {
    Easy: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30',
    Medium: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
    Hard: 'bg-red-400/20 text-red-400 border-red-400/30'
  };

  const labelColors = {
    'good first issue': 'bg-purple-400/20 text-purple-400',
    'bug': 'bg-red-400/20 text-red-400',
    'enhancement': 'bg-blue-400/20 text-blue-400',
    'documentation': 'bg-yellow-400/20 text-yellow-400',
    'help wanted': 'bg-emerald-400/20 text-emerald-400',
    'ui': 'bg-pink-400/20 text-pink-400'
  };

  return (
    <div className="p-6 rounded-2xl bg-[#161616] border border-white/5 hover:border-white/10 transition-all duration-300">
      {/* Queue Position */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-600">
            Issue {queuePosition} of {totalInQueue}
          </span>
          <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-400 rounded-full transition-all"
              style={{ width: `${(queuePosition / totalInQueue) * 100}%` }}
            />
          </div>
        </div>
        {issue.hasNoPR && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs">
            <GitPullRequest className="size-3" />
            No PR yet
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <img 
          src={issue.authorAvatar} 
          alt={issue.author}
          className="size-10 rounded-full border-2 border-white/10"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-neutral-400">{issue.repo}</span>
            <span className="text-neutral-600">•</span>
            <span className="text-sm text-neutral-500">#{issue.number}</span>
          </div>
          <h3 className="text-lg font-semibold text-white leading-snug">
            {issue.title}
          </h3>
        </div>
        <a
          href={`https://github.com/${issue.repo}/issues/${issue.number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ExternalLink className="size-4 text-neutral-500" />
        </a>
      </div>

      {/* Labels & Difficulty */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`px-2 py-1 text-xs rounded-full border ${difficultyColors[issue.difficulty]}`}>
          {issue.difficulty}
        </span>
        {issue.labels.map((label, idx) => (
          <span
            key={idx}
            className={`px-2 py-1 text-xs rounded-full ${labelColors[label] || 'bg-white/10 text-neutral-400'}`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Simplified Summary - Student Friendly */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="size-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">In Simple Words</span>
        </div>
        <p className="text-sm text-neutral-300 leading-relaxed">
          {issue.simplifiedSummary}
        </p>
      </div>

      {/* AI Solution Hint */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="size-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-400">Quick Solution Hint</span>
        </div>
        <p className="text-sm text-neutral-300 leading-relaxed">
          {issue.aiSolutionHint}
        </p>
      </div>

      {/* Meta Information */}
      <div className="flex items-center gap-4 mb-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <Clock className="size-3" />
          <span>{issue.createdAt}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="size-3" />
          <span>{issue. comments} comments</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="size-3" />
          <span>~{issue.estimatedTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="size-3" />
          <span>by @{issue.author}</span>
        </div>
      </div>

      {/* Skills Needed */}
      <div className="flex items-center gap-2 mb-4">
        <Code className="size-4 text-neutral-500" />
        <span className="text-xs text-neutral-500">Skills needed:</span>
        {issue.skillsNeeded.map((skill, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 rounded-md bg-white/5 text-neutral-400 text-xs"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Expandable Original Description */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-neutral-500 hover: text-white transition-colors mb-4"
      >
        {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        {expanded ? 'Hide' : 'Show'} original description
      </button>
      
      {expanded && (
        <div className="p-3 rounded-lg bg-black/30 border border-white/5 mb-4">
          <p className="text-xs text-neutral-400 font-mono leading-relaxed">
            {issue.body}
          </p>
        </div>
      )}

      {/* Action Buttons - DO and NOPE */}
      <div className="flex gap-3 pt-4 border-t border-white/5">
        <button
          onClick={() => onAccept(issue)}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Check className="size-5" strokeWidth={2.5} />
          <span>Do It! </span>
        </button>
        <button
          onClick={() => onReject(issue)}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold transition-all duration-200 border border-white/10 hover: border-white/20"
        >
          <X className="size-5" strokeWidth={2.5} />
          <span>Nope</span>
        </button>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-neutral-600">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 font-mono">D</kbd> to accept
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 font-mono">N</kbd> to skip
        </span>
      </div>
    </div>
  );
};

export default IssueCard;