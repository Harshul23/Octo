import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';

const StreakTracker = ({ currentStreak = 5, longestStreak = 14 }) => {
  // Generate last 7 days activity (sample data)
  const weekActivity = [
    { day: 'M', active: true },
    { day: 'T', active: true },
    { day: 'W', active:  true },
    { day: 'T', active: false },
    { day: 'F', active: true },
    { day: 'S', active: true },
    { day: 'S', active:  false }, // Today - not yet contributed
  ];

  return (
    <div className="w-full p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="size-5 text-orange-400" />
          <span className="text-sm font-semibold text-white">Streak</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <TrendingUp className="size-3" />
          <span>Best: {longestStreak} days</span>
        </div>
      </div>

      {/* Current Streak Number */}
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-4xl font-black text-orange-400">{currentStreak}</span>
        <span className="text-sm text-neutral-500">days</span>
      </div>

      {/* Week Activity Dots */}
      <div className="flex items-center justify-between">
        {weekActivity.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <div 
              className={`size-6 rounded-full flex items-center justify-center transition-all ${
                day.active 
                  ? 'bg-orange-400 text-black' 
                  : 'bg-white/5 text-neutral-600'
              }`}
            >
              {day.active && <Flame className="size-3" />}
            </div>
            <span className="text-[10px] text-neutral-600">{day.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakTracker;