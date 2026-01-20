import { useState, useEffect } from 'react';
import { Lock, Check, Sparkles } from 'lucide-react';

const AchievementCard = ({ achievement, isNew = false }) => {
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(isNew);
  const { unlocked, progress, current, required } = achievement;
  const Icon = achievement.icon;

  useEffect(() => {
    if (isNew && unlocked) {
      const timer = setTimeout(() => setShowUnlockAnimation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew, unlocked]);

  return (
    <div
      className={`
        relative group p-4 rounded-2xl transition-all duration-500 overflow-hidden
        ${unlocked 
          ? `bg-gradient-to-br ${achievement.rarity.bg} border ${achievement.rarity.border} hover:scale-[1.02]` 
          : 'bg-[#161616] border border-white/5 opacity-70 hover:opacity-90'
        }
        ${showUnlockAnimation ? 'animate-pulse ring-2 ring-yellow-400/50' : ''}
      `}
    >
      {/* Unlock animation overlay */}
      {showUnlockAnimation && unlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-yellow-400/20 animate-shimmer" />
      )}

      {/* Sparkle effects for unlocked */}
      {unlocked && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Sparkles size={16} className={achievement.rarity.text} />
        </div>
      )}

      {/* Lock icon for locked achievements */}
      {!unlocked && (
        <div className="absolute top-3 right-3">
          <Lock size={14} className="text-gray-600" />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-col gap-3">
        {/* Icon and emoji */}
        <div className="flex items-start justify-between">
          <div className={`
            p-3 rounded-xl transition-all duration-300
            ${unlocked 
              ? `bg-gradient-to-br ${achievement.rarity.color} shadow-lg` 
              : 'bg-white/5'
            }
          `}>
            <Icon 
              size={24} 
              className={unlocked ? 'text-white' : 'text-gray-500'} 
            />
          </div>
          <span className={`text-2xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
            {achievement.emoji}
          </span>
        </div>

        {/* Title and description */}
        <div>
          <h3 className={`font-semibold ${unlocked ? 'text-white' : 'text-gray-400'}`}>
            {achievement.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {achievement.description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className={`font-medium ${achievement.rarity.text}`}>
              {achievement.rarity.name}
            </span>
            <span className={unlocked ? 'text-emerald-400' : 'text-gray-500'}>
              {unlocked ? (
                <span className="flex items-center gap-1">
                  <Check size={12} />
                  Unlocked
                </span>
              ) : (
                `${current}/${required}`
              )}
            </span>
          </div>
          
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`
                h-full rounded-full transition-all duration-700 ease-out
                ${unlocked 
                  ? `bg-gradient-to-r ${achievement.rarity.color}` 
                  : 'bg-gradient-to-r from-gray-600 to-gray-500'
                }
              `}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* XP reward */}
        <div className={`
          flex items-center gap-1.5 text-xs font-medium
          ${unlocked ? 'text-yellow-400' : 'text-gray-600'}
        `}>
          <Sparkles size={12} />
          <span>+{achievement.xp} XP</span>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
