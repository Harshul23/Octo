import { Trophy, Sparkles, ChevronRight, Zap } from 'lucide-react';

const LevelProgress = ({ levelInfo, nextAchievements, recentUnlocks }) => {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (levelInfo.progressToNextLevel / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Level Ring */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
        <div className="flex flex-col items-center">
          {/* Circular Progress */}
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="url(#levelGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Trophy className="text-yellow-400 mb-1" size={24} />
              <span className="text-3xl font-black text-white">{levelInfo.level}</span>
            </div>
          </div>

          {/* XP Info */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              <span className="text-purple-400 font-semibold">{levelInfo.xpInCurrentLevel}</span>
              {' / '}
              <span className="text-white">{levelInfo.xpRequiredForNextLevel}</span>
              {' XP to Level '}{levelInfo.level + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Next Achievements */}
      {nextAchievements.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#161616] border border-white/5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Zap size={14} className="text-yellow-400" />
            Almost There
          </h3>
          <div className="space-y-3">
            {nextAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${achievement.rarity.bg}`}>
                    <Icon size={16} className={achievement.rarity.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{achievement.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${achievement.rarity.color} rounded-full`}
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(achievement.progress)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Unlocks */}
      {recentUnlocks.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-400" />
            Recently Unlocked
          </h3>
          <div className="space-y-2">
            {recentUnlocks.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-white/5"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${achievement.rarity.color}`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{achievement.name}</p>
                    <p className="text-xs text-yellow-400">+{achievement.xp} XP</p>
                  </div>
                  <span className="text-lg">{achievement.emoji}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Motivational message */}
      <div className="p-4 rounded-2xl bg-[#161616] border border-white/5 text-center">
        <p className="text-sm text-gray-400">
          Keep contributing to unlock more achievements! 
          <span className="text-purple-400"> 🚀</span>
        </p>
      </div>
    </div>
  );
};

export default LevelProgress;
