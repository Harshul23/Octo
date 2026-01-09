import React from 'react';
import { Trophy, ChevronRight, Sparkles } from 'lucide-react';

const RecentAchievement = () => {
  const achievement = {
    title: "First PR Merged!  🎉",
    description: "You got your first pull request merged in an open source project! ",
    earnedAt: "2 days ago",
    icon: "🥇"
  };

  return (
    <div className="w-full p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 relative overflow-hidden">
      {/* Sparkle decoration */}
      <Sparkles className="absolute top-2 right-2 size-4 text-yellow-500/30" />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="size-4 text-yellow-400" />
        <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
          Latest Achievement
        </span>
      </div>

      {/* Achievement */}
      <div className="flex items-center gap-3">
        <div className="text-3xl">{achievement.icon}</div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white">{achievement.title}</h4>
          <p className="text-xs text-neutral-500 mt-0.5">{achievement.earnedAt}</p>
        </div>
      </div>

      {/* View All Link */}
      <button className="flex items-center gap-1 text-xs text-yellow-400/70 hover:text-yellow-400 mt-3 transition-colors">
        View all achievements <ChevronRight className="size-3" />
      </button>
    </div>
  );
};

export default RecentAchievement;