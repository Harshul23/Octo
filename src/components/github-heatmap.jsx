import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchContributionData } from '@/services/githubApi';
import QuickStats from './home/quickstats';

const GitHubHeatmap = () => {
  const { user, getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContributions = async () => {
      if (!user || !getToken()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = getToken();
        
        // Fetch last year of contribution data
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const responseData = await fetchContributionData(
          user.login,
          token,
          oneYearAgo.toISOString(),
          now.toISOString()
        );
        
        setData(responseData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading contributions:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadContributions();
  }, [user, getToken]);

  // Get color based on contribution count (GitHub style)
  const getContributionColor = (count) => {
    if (count === 0) return '#161b22';
    if (count < 3) return '#0e4429';
    if (count < 6) return '#006d32';
    if (count < 9) return '#26a641';
    return '#39d353';
  };

  // Generate month labels
  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push({
        month: months[date.getMonth()],
        index: date.getMonth()
      });
    }
    
    return labels;
  };

  if (!user) {
    return (
      <div className="w-full bg-[#0d1117] rounded-2xl p-6 border border-[#30363d]">
        <p className="text-[#7d8590] text-center">Please login to view your contribution graph</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-[#0d1117] rounded-2xl p-6 border border-[#30363d] flex items-center justify-center min-h-[200px]">
        <Loader2 className="animate-spin text-[#7d8590]" size={24} />
        <span className="ml-2 text-[#7d8590]">Loading contributions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#0d1117] rounded-2xl p-6 border border-[#30363d]">
        <p className="text-red-400 text-center">Error loading contributions</p>
      </div>
    );
  }

  const weeks = data?.calendar?.weeks || [];
  const totalContributions = data?.calendar?.totalContributions || 0;
  const monthLabels = getMonthLabels();

  return (
    <div className='flex flex-col gap-6 w-full'>
      <QuickStats stats={data?.stats} />
      
      <div className="w-full bg-[#0d1117] rounded-2xl p-6 border border-[#30363d]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#c9d1d9] font-semibold">
            {totalContributions} contributions in the last year
          </h3>
        </div>

        {/* Contribution Graph */}
        <div className="overflow-x-auto">
          <div className="min-w-fit">
            {/* Month labels */}
            <div className="flex mb-2 ml-8">
              {monthLabels.map((label, idx) => (
                <span 
                  key={idx} 
                  className="text-[#7d8590] text-xs"
                  style={{ width: '52px' }}
                >
                  {label.month}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col justify-around mr-2 text-[#7d8590] text-xs">
                <span className="h-[10px]"></span>
                <span className="h-[10px]">Mon</span>
                <span className="h-[10px]"></span>
                <span className="h-[10px]">Wed</span>
                <span className="h-[10px]"></span>
                <span className="h-[10px]">Fri</span>
                <span className="h-[10px]"></span>
              </div>

              {/* Contribution cells */}
              <div className="flex gap-[3px]">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3px]">
                    {week.contributionDays.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        className="w-[10px] h-[10px] rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-[#58a6ff]"
                        style={{ backgroundColor: getContributionColor(day.contributionCount) }}
                        title={`${day.contributionCount} contributions on ${new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end mt-4 gap-2">
              <span className="text-[#7d8590] text-xs">Less</span>
              <div className="flex gap-[3px]">
                {[0, 2, 5, 8, 10].map((level, idx) => (
                  <div
                    key={idx}
                    className="w-[10px] h-[10px] rounded-sm"
                    style={{ backgroundColor: getContributionColor(level) }}
                  />
                ))}
              </div>
              <span className="text-[#7d8590] text-xs">More</span>
            </div>
          </div>
        </div>

        {/* Learn More Link */}
        <div className="mt-4 pt-4 border-t border-[#21262d]">
          <a 
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#58a6ff] text-sm hover:underline"
          >
            View full contribution graph on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
};

export default GitHubHeatmap;
