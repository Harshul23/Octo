import React, { useEffect, useState } from 'react';
import { GitCommit, Book, GitPullRequest, MessageSquare, GitBranch, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchUserEvents, 
  parseUserActivity, 
  aggregateCommitsByRepo, 
  fetchContributionData, 
  fetchUserRepositories,
  fetchRepositoryCommitStats 
} from '@/services/githubApi';

const ActivityTimeline = () => {
  const { user, getToken } = useAuth();
  const [activity, setActivity] = useState(null);
  const [contributionData, setContributionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadActivity = async () => {
      if (!user || !getToken()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = getToken();
        
        // Fetch events
        const events = await fetchUserEvents(user.login, token, 100);
        const parsedActivity = parseUserActivity(events);
        
        // Fetch contribution data for current year
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const contributions = await fetchContributionData(
          user.login,
          token,
          startOfYear.toISOString(),
          now.toISOString()
        );
        
        // Fetch user repositories
        const repos = await fetchUserRepositories(user.login, token, 100);
        
        // Fetch commit statistics for repositories
        const commitStats = await fetchRepositoryCommitStats(
          user.login,
          token,
          repos,
          startOfYear.toISOString()
        );
        
        // Combine commit stats with parsed activity
        const enhancedActivity = {
          ...parsedActivity,
          commitStats: commitStats,
        };
        
        setActivity(enhancedActivity);
        setContributionData(contributions);
        setLoading(false);
      } catch (err) {
        console.error('Error loading activity:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadActivity();
  }, [user, getToken]);

  if (!user) {
    return (
      <div className="w-full bg-[#0d1117] text-white p-8">
        <p className="text-gray-400">Please login to view your activity</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full flex flex-col justify-center items-center bg-[#0d1117] text-white p-8">
        <Loader2 className="animate-spin text-gray-400" size={32} />
        <p className="text-gray-400 mt-4">Loading your GitHub activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col justify-center items-center bg-[#0d1117] text-white p-8">
        <p className="text-red-400">Error loading activity: {error}</p>
      </div>
    );
  }

  if (!activity) {
    return null;
  }

  // Use the commit stats from repository API instead of events
  const commitsByRepo = activity.commitStats || aggregateCommitsByRepo(activity.commits);
  
  // Calculate total commits from GraphQL contribution data
  const totalContributions = contributionData?.totalContributions || 0;
  
  // Use commit stats as the primary source
  const displayCommitsByRepo = commitsByRepo;
  
  // Calculate total from displayed repos
  const totalCommits = displayCommitsByRepo.reduce((sum, item) => sum + item.count, 0) || totalContributions;
  const maxCommits = Math.max(...displayCommitsByRepo.map(r => r.count), 1);
  
  console.log('Contribution Data:', {
    totalContributions,
    commitsByRepo: displayCommitsByRepo,
    totalCommits,
    maxCommits,
    activity,
    repos: activity.repositories,
    prs: activity.pullRequests
  });
  
  // Get current year and month info
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Check if we're in January (first month of year)
  const isJanuary = now.getMonth() === 0;
  
  // Organize activities by year and month
  const activitiesByYearMonth = {};
  
  // Add commits to the appropriate year-month
  displayCommitsByRepo.forEach(commit => {
    // Since we fetch commits for current year, put them in current year
    // But actually they might be from December 2025 based on the events
    const yearMonth = `${currentYear}-01`; // January 2026 for current year data
    if (!activitiesByYearMonth[yearMonth]) {
      activitiesByYearMonth[yearMonth] = { commits: [], repos: [], prs: [], issues: [], year: currentYear, month: 0 };
    }
    activitiesByYearMonth[yearMonth].commits.push(commit);
  });
  
  // Add repos, PRs, issues
  activity.repositories.forEach(repo => {
    const date = new Date(repo.date);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!activitiesByYearMonth[yearMonth]) {
      activitiesByYearMonth[yearMonth] = { commits: [], repos: [], prs: [], issues: [], year: date.getFullYear(), month: date.getMonth() };
    }
    activitiesByYearMonth[yearMonth].repos.push(repo);
  });
  
  activity.pullRequests.forEach(pr => {
    const date = new Date(pr.date);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!activitiesByYearMonth[yearMonth]) {
      activitiesByYearMonth[yearMonth] = { commits: [], repos: [], prs: [], issues: [], year: date.getFullYear(), month: date.getMonth() };
    }
    activitiesByYearMonth[yearMonth].prs.push(pr);
  });
  
  activity.issues.forEach(issue => {
    const date = new Date(issue.date);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!activitiesByYearMonth[yearMonth]) {
      activitiesByYearMonth[yearMonth] = { commits: [], repos: [], prs: [], issues: [], year: date.getFullYear(), month: date.getMonth() };
    }
    activitiesByYearMonth[yearMonth].issues.push(issue);
  });
  
  // Sort year-months in descending order
  const sortedYearMonths = Object.keys(activitiesByYearMonth).sort().reverse();
  
  // Determine how many months to show
  const monthsToShow = showAll ? sortedYearMonths.length : 2;
  const visibleYearMonths = sortedYearMonths.slice(0, monthsToShow);
  
  // Limit items when not showing all
  const displayLimit = 999; // Always show all items in visible months

  return (
    <div className="w-full bg-[#0d1117] text-white">
      {/* Header */}
      <div className="border-b border-[#21262d] px-6 py-4">
        <h2 className="text-xl font-semibold">Contribution activity</h2>
        <p className="text-[#7d8590] text-sm mt-1">{currentYear} (showing current year only)</p>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Render each visible month */}
        {visibleYearMonths.map((yearMonth, index) => {
          const monthData = activitiesByYearMonth[yearMonth];
          const date = new Date(monthData.year, monthData.month, 1);
          const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          const hasActivity = monthData.commits.length > 0 || monthData.repos.length > 0 || monthData.prs.length > 0 || monthData.issues.length > 0;
          
          if (!hasActivity) return null;
          
          return (
            <div key={yearMonth}>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-base font-semibold">{monthLabel}</h3>
                <div className="flex-1 h-[1px] bg-[#21262d]" />
              </div>
              
              <div className="space-y-4 border-l-2 border-[#21262d] pl-4 ml-2">
                {/* Commits Section */}
                {monthData.commits.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <GitCommit className="text-[#7d8590] mt-1 flex-shrink-0" size={16} />
                      <div className="flex-1">
                        <p className="text-sm text-[#c9d1d9]">
                          Created <span className="font-semibold">{totalCommits} {totalCommits === 1 ? 'commit' : 'commits'}</span> in {monthData.commits.length} {monthData.commits.length === 1 ? 'repository' : 'repositories'}
                        </p>
                        <div className="mt-3 space-y-2">
                          {monthData.commits.map((item, idx) => {
                            const percentage = Math.max((item.count / maxCommits) * 100, 5);
                            return (
                              <div key={idx} className="flex items-center gap-3">
                                <a 
                                  href={`https://github.com/${item.repo}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#58a6ff] hover:underline text-sm font-medium min-w-[200px] truncate"
                                >
                                  {item.repo}
                                </a>
                                <span className="text-[#7d8590] text-xs whitespace-nowrap">
                                  {item.count} {item.count === 1 ? 'commit' : 'commits'}
                                </span>
                                <div className="flex-1 max-w-[300px]">
                                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-[#39d353] rounded-full transition-all duration-300 ease-out"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Repositories */}
                {monthData.repos.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <div className="flex items-start gap-3">
                      <Book className="text-[#7d8590] mt-1 flex-shrink-0" size={16} />
                      <div className="flex-1">
                        <p className="text-sm text-[#c9d1d9] mb-4">
                          Created <span className="font-semibold">{monthData.repos.length}</span> {monthData.repos.length === 1 ? 'repository' : 'repositories'}
                        </p>
                        <div className="space-y-3">
                          {monthData.repos.map((repo, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-2">
                                <Book className="text-[#7d8590]" size={16} />
                                <a 
                                  href={`https://github.com/${repo.name}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#58a6ff] hover:underline text-sm font-medium"
                                >
                                  {repo.name}
                                </a>
                                <span className="text-[#7d8590] text-xs">
                                  • Built by <span className="text-[#c9d1d9]">{user.login}</span>
                                </span>
                              </div>
                              <span className="text-[#7d8590] text-xs">
                                {new Date(repo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Pull Requests */}
                {monthData.prs.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <div className="flex items-start gap-3">
                      <GitPullRequest className="text-[#7d8590] mt-1 flex-shrink-0" size={16} />
                      <div className="flex-1">
                        <p className="text-sm text-[#c9d1d9] mb-4">
                          Created a pull request in{' '}
                          <a 
                            href={`https://github.com/${monthData.prs[0].repo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#58a6ff] hover:underline font-medium"
                          >
                            {monthData.prs[0].repo}
                          </a>
                          {' '}that received comments
                        </p>
                        <div className="space-y-3">
                          {monthData.prs.map((pr, idx) => (
                            <div key={idx} className="border border-[#30363d] rounded-md p-4 hover:border-[#484f58] transition-colors">
                              <div className="flex items-start gap-3">
                                <GitBranch className="text-[#3fb950] mt-1 flex-shrink-0" size={16} />
                                <div className="flex-1 min-w-0">
                                  <a 
                                    href={pr.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#58a6ff] hover:underline font-semibold text-sm block"
                                  >
                                    {pr.title}
                                  </a>
                                  <p className="text-xs text-[#7d8590] mt-2">
                                    {pr.action} • {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Issues */}
                {monthData.issues.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="text-[#7d8590] mt-1 flex-shrink-0" size={16} />
                      <div className="flex-1">
                        <p className="text-sm text-[#c9d1d9] mb-3">
                          {monthData.issues.length} {monthData.issues.length === 1 ? 'issue' : 'issues'}
                        </p>
                        <div className="space-y-2">
                          {monthData.issues.map((issue, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <a 
                                href={issue.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#58a6ff] hover:underline text-sm flex-1 truncate"
                              >
                                {issue.title}
                              </a>
                              <span className="text-[#7d8590] text-xs">{issue.action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Show More Button - always shows if there are more months to display */}
        {visibleYearMonths.length < sortedYearMonths.length && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-3 border border-[#30363d] rounded-md text-[#58a6ff] hover:border-[#58a6ff] transition-colors text-sm font-medium"
          >
            Show more activity
          </button>
        )}

      </div>
    </div>
  );
};

export default ActivityTimeline;