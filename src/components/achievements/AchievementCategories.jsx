import { CATEGORIES } from './achievementData';

const AchievementCategories = ({ activeCategory, onCategoryChange, achievements }) => {
  const categories = [
    { id: 'all', name: 'All Badges', icon: null },
    ...Object.values(CATEGORIES)
  ];

  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') {
      return {
        unlocked: achievements.filter(a => a.unlocked).length,
        total: achievements.length
      };
    }
    const categoryAchievements = achievements.filter(a => a.category === categoryId);
    return {
      unlocked: categoryAchievements.filter(a => a.unlocked).length,
      total: categoryAchievements.length
    };
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        const count = getCategoryCount(category.id);
        const Icon = category.icon;
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              transition-all duration-300
              ${isActive 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20' 
                : 'bg-[#161616] text-gray-400 border border-white/5 hover:border-white/10 hover:text-white'
              }
            `}
          >
            {Icon && <Icon size={16} />}
            <span>{category.name}</span>
            <span className={`
              text-xs px-1.5 py-0.5 rounded-md
              ${isActive ? 'bg-white/20' : 'bg-white/5'}
            `}>
              {count.unlocked}/{count.total}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default AchievementCategories;
