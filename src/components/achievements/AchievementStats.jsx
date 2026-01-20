import { Trophy, Star, Target, Flame, TrendingUp } from 'lucide-react';

const AchievementStats = ({ stats, achievements, levelInfo }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercent = Math.round((unlockedCount / totalCount) * 100);

  const statItems = [
    {
      icon: Trophy,
      label: 'Level',
      value: levelInfo.level,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      icon: Star,
      label: 'Total XP',
      value: levelInfo.currentXP.toLocaleString(),
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      icon: Target,
      label: 'Badges Earned',
      value: `${unlockedCount}/${totalCount}`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${stats.currentStreak || 0}d`,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
    },
    {
      icon: TrendingUp,
      label: 'Completion',
      value: `${completionPercent}%`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#161616] border border-white/5 hover:border-white/10 transition-all duration-300 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`p-2.5 rounded-xl ${item.bgColor} group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`size-5 ${item.color}`} />
            </div>
            <span className="text-2xl font-bold text-white">{item.value}</span>
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default AchievementStats;
