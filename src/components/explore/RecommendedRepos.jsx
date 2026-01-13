import React from 'react';
import { Zap, Star, GitFork, ChevronRight, ExternalLink } from 'lucide-react';

const RecommendedRepos = () => {
  // Sample data - will come from AI analysis of your PR history
  const recommendations = [
    {
      id: 1,
      name:  'shadcn/ui',
      description: 'Beautifully designed components built with Radix UI and Tailwind CSS.',
      stars: '45. 2k',
      forks: '2.8k',
      language: 'TypeScript',
      languageColor: '#3178c6',
      matchReason: "You've worked on similar React + Tailwind projects",
      matchScore: 95,
      openIssues: 124,
      goodFirstIssues: 8
    },
    {
      id: 2,
      name:  'vercel/next.js',
      description: 'The React Framework for the Web',
      stars: '118k',
      forks: '25.4k',
      language: 'JavaScript',
      languageColor:  '#f1e05a',
      matchReason: "Based on your React experience from previous PRs",
      matchScore: 88,
      openIssues: 2341,
      goodFirstIssues: 45
    },
    {
      id: 3,
      name: 'tailwindlabs/tailwindcss',
      description:  'A utility-first CSS framework for rapid UI development.',
      stars: '76.8k',
      forks: '3.9k',
      language: 'CSS',
      languageColor:  '#563d7c',
      matchReason: "You use Tailwind in most of your projects! ",
      matchScore: 92,
      openIssues:  89,
      goodFirstIssues: 12
    }
  ];

  return (
    <div className="mb-8 h-full w-full flex flex-col">
      {/* Section Header */}
      <div className="flex items-center overflow-auto justify-between mb-4">
        <div className="flex items-center overflow-auto gap-2">
          <Zap className="size-5 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Recommended for You</h2>
          <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-xs font-medium">
            AI Powered
          </span>
        </div>
        <button className="flex items-center gap-1 text-sm text-neutral-500 hover:text-white transition-colors">
          View all <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Vertical List Container with Scroll */}
      <div className="flex flex-col gap-4 w-full flex-1 overflow-y-auto pr-2 pb-4">
        {recommendations.map((repo) => (
          <div
            key={repo.id}
            className="w-full p-5 rounded-2xl bg-[#161616] border border-white/5 hover:border-white/10 transition-all duration-300 group flex-shrink-0"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-lg font-bold text-white">
                  {repo.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                    {repo.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <div className="flex items-center gap-1">
                      <div 
                        className="size-2 rounded-full" 
                        style={{ backgroundColor: repo.languageColor }}
                      />
                      <span>{repo.language}</span>
                    </div>
                  </div>
                </div>
              </div>
              <a 
                href={`https://github.com/${repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ExternalLink className="size-4 text-neutral-500" />
              </a>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-400 mb-3 line-clamp-2">
              {repo.description}
            </p>

            {/* Match Reason - Student Friendly */}
            <div className="p-2 rounded-lg bg-yellow-400/10 border border-yellow-400/20 mb-3">
              <p className="text-xs text-yellow-400">
                <span className="font-medium">🎯 Why this? </span> {repo.matchReason}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="size-3" />
                  <span>{repo.stars}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="size-3" />
                  <span>{repo.forks}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400">
                <span>{repo.goodFirstIssues} beginner issues</span>
              </div>
            </div>

            {/* Match Score Bar */}
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-500">Match Score</span>
                <span className="text-yellow-400 font-medium">{repo.matchScore}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all"
                  style={{ width: `${repo.matchScore}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedRepos;