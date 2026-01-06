import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchContributionData, getContributionColor } from '@/services/githubApi';

const GitHubHeatmapCalendar = () => {
  const { user, getToken } = useAuth();
  const [contributionData, setContributionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const loadContributionData = async () => {
      if (!user || !getToken()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = getToken();
        
        // Get date range for last year
        const toDate = new Date().toISOString();
        const fromDate = new Date();
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        
        const data = await fetchContributionData(
          user.login,
          token,
          fromDate.toISOString(),
          toDate
        );
        
        setContributionData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading contribution data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadContributionData();
  }, [user, getToken]);

  if (!user) {
    return (
      <div className="w-full p-8 bg-black border-2 border-neutral-700 rounded-3xl">
        <p className="text-gray-400 text-center">Please login to view your contribution graph</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full p-8 bg-black border-2 border-neutral-700 rounded-3xl">
        <p className="text-gray-400 text-center">Loading contribution data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 bg-black border-2 border-neutral-700 rounded-3xl">
        <p className="text-red-400 text-center">Error: {error}</p>
      </div>
    );
  }

  if (!contributionData) {
    return null;
  }

  const { weeks, totalContributions } = contributionData;
  const months = getMonthLabels(weeks);

  return (
    <div className="w-full p-8 bg-black border-2 border-neutral-700 rounded-3xl">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">
          {totalContributions} contributions in the last year
        </h2>
        <p className="text-sm text-gray-400">
          GitHub activity heatmap for @{user.login}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-2">
            <div className="w-8"></div>
            <div className="flex-1 flex">
              {months.map((month, idx) => (
                <div
                  key={idx}
                  className="text-xs text-gray-400"
                  style={{ width: `${month.width}px`, marginLeft: idx === 0 ? '0' : '10px' }}
                >
                  {month.label}
                </div>
              ))}
            </div>
          </div>

          {/* Contribution grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col justify-around w-8 pr-2 text-xs text-gray-400">
              <div>Mon</div>
              <div>Wed</div>
              <div>Fri</div>
            </div>

            {/* Contribution squares */}
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {week.contributionDays.map((day, dayIdx) => (
                    <ContributionSquare
                      key={dayIdx}
                      day={day}
                      onHover={setSelectedDate}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Tooltip */}
          {selectedDate && (
            <div className="mt-4 p-3 bg-neutral-800 rounded-lg border border-neutral-700">
              <p className="text-sm text-white font-medium">
                {selectedDate.count} contributions on {formatDate(selectedDate.date)}
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getColorForLevel(level) }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Contribution square component
const ContributionSquare = ({ day, onHover }) => {
  const color = day.color || getContributionColor(day.contributionCount);
  
  return (
    <div
      className="w-[10px] h-[10px] rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-white/50"
      style={{ backgroundColor: color }}
      onMouseEnter={() => onHover({ date: day.date, count: day.contributionCount })}
      onMouseLeave={() => onHover(null)}
      title={`${day.contributionCount} contributions on ${day.date}`}
    />
  );
};

// Helper functions
const getMonthLabels = (weeks) => {
  const months = [];
  let currentMonth = null;
  let startWeek = 0;

  weeks.forEach((week, idx) => {
    const firstDay = week.contributionDays[0];
    const date = new Date(firstDay.date);
    const month = date.toLocaleString('default', { month: 'short' });

    if (month !== currentMonth) {
      if (currentMonth !== null) {
        months.push({
          label: currentMonth,
          width: (idx - startWeek) * 13, // 10px square + 3px gap
        });
      }
      currentMonth = month;
      startWeek = idx;
    }
  });

  // Add last month
  if (currentMonth !== null) {
    months.push({
      label: currentMonth,
      width: (weeks.length - startWeek) * 13,
    });
  }

  return months;
};

const getColorForLevel = (level) => {
  const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
  return colors[level];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('default', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export default GitHubHeatmapCalendar;
