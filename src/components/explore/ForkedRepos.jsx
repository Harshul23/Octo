import React, { useState, useEffect } from 'react';
import { GitFork, Star, ExternalLink, Calendar, RefreshCcw, Loader2, AlertCircle, Circle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserRepositories } from '../../services/githubApi';
import { formatDistanceToNow } from 'date-fns';

const ForkedRepos = () => {
  const { user, getToken } = useAuth();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadForkedRepos = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = getToken();
        // Fetch repositories (including forks)
        // Note: fetchUserRepositories defaults to sorting by 'updated'
        const allRepos = await fetchUserRepositories(user.login, token, 100);
        
        // Filter for forks
        const forks = allRepos.filter(repo => repo.fork);
        setRepos(forks);
      } catch (err) {
        console.error("Error fetching forks:", err);
        setError("Failed to load forked repositories.");
      } finally {
        setLoading(false);
      }
    };

    loadForkedRepos();
  }, [user, getToken]);

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-400">
            <GitFork size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">Connect GitHub</h3>
            <p className="max-w-xs mx-auto">Please connect your GitHub account to view your forked repositories.</p>
        </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 size={32} className="animate-spin mb-3 text-blue-500" />
        <p>Loading your forks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-400">
        <AlertCircle size={32} className="mb-3" />
        <p>{error}</p>
        <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm transition-colors"
        >
            Try Again
        </button>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#161b22]/50 border border-[#30363d] rounded-xl border-dashed h-full">
        <div className="p-4 bg-white/5 rounded-full mb-4">
          <GitFork size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">No Forks Found</h3>
        <p className="text-gray-400 max-w-md px-6">
          You haven't forked any repositories yet. Fork repositories to contribute or experiment with them!
        </p>
      </div>
    );
  }

  // Helper to get language color (simplified map)
  const getLanguageColor = (lang) => {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Java: '#b07219',
      Go: '#00ADD8',
      Rust: '#dea584',
      HTML: '#e34c26',
      CSS: '#563d7c',
    };
    return colors[lang] || '#8b949e';
  };

  return (
    <div className="mb-8 h-full w-full flex flex-col">
       {/* Section Header */}
       <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitFork className="size-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Your Forks</h2>
          <span className="px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-400 text-xs font-medium">
            {repos.length} Repos
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4 w-full flex-1 overflow-y-auto pr-2 pb-4 sm:pr-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="w-full p-5 rounded-2xl bg-[#161616] border border-white/5 hover:border-white/10 transition-all duration-300 group flex-shrink-0"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 w-full overflow-hidden">
                <div className="size-10 rounded-xl bg-gradient-to-br from-blue-900/50 to-blue-800/30 flex-shrink-0 flex items-center justify-center text-lg font-bold text-blue-200 border border-blue-500/20">
                  {repo.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                    {repo.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                     {repo.language && (
                        <div className="flex items-center gap-1">
                        <div 
                            className="size-2 rounded-full" 
                            style={{ backgroundColor: getLanguageColor(repo.language) }}
                        />
                        <span>{repo.language}</span>
                        </div>
                     )}
                     <span className="text-neutral-600">•</span>
                     <span>Updated {formatDistanceToNow(new Date(repo.updated_at))} ago</span>
                  </div>
                </div>
              </div>
              <a 
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
              >
                <ExternalLink className="size-4 text-neutral-500 group-hover:text-white" />
              </a>
            </div>

            {/* Description */}
            {repo.description && (
                <p className="text-sm text-neutral-400 mb-4 line-clamp-2">
                {repo.description}
                </p>
            )}

            {/* Stats / Footer */}
            <div className="flex items-center justify-between text-xs text-neutral-500 mt-auto pt-2 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors">
                  <Star className="size-3.5" />
                  <span>{repo.stargazers_count}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <GitFork className="size-3.5" />
                  <span>{repo.forks_count}</span>
                </div>
                {repo.open_issues_count > 0 && (
                     <div className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
                     <Circle className="size-3.5 fill-current" />
                     <span>{repo.open_issues_count} issues</span>
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForkedRepos;
