// Achievement definitions and calculation logic
// All achievements are calculated on-the-fly from GitHub data

import { 
  GitPullRequest, 
  GitMerge, 
  Bug, 
  Flame, 
  Star, 
  Rocket, 
  Code2, 
  GitFork,
  Users,
  MessageSquare,
  Zap,
  Trophy,
  Target,
  Crown,
  Sparkles,
  Calendar,
  TrendingUp,
  Award,
  Shield,
  Heart
} from 'lucide-react';

// Rarity tiers with colors
export const RARITY = {
  COMMON: { name: 'Common', color: 'from-gray-400 to-gray-500', border: 'border-gray-500/30', bg: 'bg-gray-500/10', text: 'text-gray-400' },
  RARE: { name: 'Rare', color: 'from-blue-400 to-blue-500', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  EPIC: { name: 'Epic', color: 'from-purple-400 to-purple-600', border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  LEGENDARY: { name: 'Legendary', color: 'from-yellow-400 to-amber-500', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  MYTHIC: { name: 'Mythic', color: 'from-rose-400 to-pink-600', border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-400' },
};

// Achievement categories
export const CATEGORIES = {
  PR_MASTER: { id: 'pr_master', name: 'PR Master', icon: GitPullRequest, description: 'Pull Request milestones' },
  ISSUE_HUNTER: { id: 'issue_hunter', name: 'Issue Hunter', icon: Bug, description: 'Issue tracking achievements' },
  STREAK_LEGEND: { id: 'streak_legend', name: 'Streak Legend', icon: Flame, description: 'Consistency rewards' },
  CONTRIBUTION_KING: { id: 'contribution_king', name: 'Contribution King', icon: TrendingUp, description: 'Contribution milestones' },
  SOCIAL_BUTTERFLY: { id: 'social_butterfly', name: 'Social Butterfly', icon: Users, description: 'Community engagement' },
  CODE_WARRIOR: { id: 'code_warrior', name: 'Code Warrior', icon: Code2, description: 'Coding achievements' },
};

// All achievements definition
export const ACHIEVEMENTS = [
  // PR Master Achievements
  {
    id: 'first_pr',
    name: 'First Pull',
    description: 'Merged your first pull request',
    icon: GitPullRequest,
    category: 'pr_master',
    rarity: RARITY.COMMON,
    xp: 50,
    requirement: { type: 'prs_merged', count: 1 },
    emoji: '🎉'
  },
  {
    id: 'pr_apprentice',
    name: 'PR Apprentice',
    description: 'Merged 10 pull requests',
    icon: GitPullRequest,
    category: 'pr_master',
    rarity: RARITY.RARE,
    xp: 150,
    requirement: { type: 'prs_merged', count: 10 },
    emoji: '📝'
  },
  {
    id: 'pr_specialist',
    name: 'PR Specialist',
    description: 'Merged 50 pull requests',
    icon: GitMerge,
    category: 'pr_master',
    rarity: RARITY.EPIC,
    xp: 400,
    requirement: { type: 'prs_merged', count: 50 },
    emoji: '🔀'
  },
  {
    id: 'merge_master',
    name: 'Merge Master',
    description: 'Merged 100 pull requests',
    icon: GitMerge,
    category: 'pr_master',
    rarity: RARITY.LEGENDARY,
    xp: 800,
    requirement: { type: 'prs_merged', count: 100 },
    emoji: '👑'
  },
  {
    id: 'pr_legend',
    name: 'PR Legend',
    description: 'Merged 500 pull requests',
    icon: Crown,
    category: 'pr_master',
    rarity: RARITY.MYTHIC,
    xp: 2000,
    requirement: { type: 'prs_merged', count: 500 },
    emoji: '🏆'
  },

  // Issue Hunter Achievements
  {
    id: 'bug_squasher',
    name: 'Bug Squasher',
    description: 'Closed your first issue',
    icon: Bug,
    category: 'issue_hunter',
    rarity: RARITY.COMMON,
    xp: 50,
    requirement: { type: 'issues_closed', count: 1 },
    emoji: '🐛'
  },
  {
    id: 'issue_tracker',
    name: 'Issue Tracker',
    description: 'Closed 10 issues',
    icon: Target,
    category: 'issue_hunter',
    rarity: RARITY.RARE,
    xp: 150,
    requirement: { type: 'issues_closed', count: 10 },
    emoji: '🎯'
  },
  {
    id: 'problem_solver',
    name: 'Problem Solver',
    description: 'Closed 50 issues',
    icon: Zap,
    category: 'issue_hunter',
    rarity: RARITY.EPIC,
    xp: 400,
    requirement: { type: 'issues_closed', count: 50 },
    emoji: '⚡'
  },
  {
    id: 'issue_destroyer',
    name: 'Issue Destroyer',
    description: 'Closed 100 issues',
    icon: Shield,
    category: 'issue_hunter',
    rarity: RARITY.LEGENDARY,
    xp: 800,
    requirement: { type: 'issues_closed', count: 100 },
    emoji: '🛡️'
  },

  // Streak Legend Achievements
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Contributed for 3 consecutive days',
    icon: Flame,
    category: 'streak_legend',
    rarity: RARITY.COMMON,
    xp: 30,
    requirement: { type: 'streak_days', count: 3 },
    emoji: '🔥'
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    icon: Flame,
    category: 'streak_legend',
    rarity: RARITY.RARE,
    xp: 100,
    requirement: { type: 'streak_days', count: 7 },
    emoji: '📅'
  },
  {
    id: 'monthly_grinder',
    name: 'Monthly Grinder',
    description: 'Maintained a 30-day streak',
    icon: Calendar,
    category: 'streak_legend',
    rarity: RARITY.EPIC,
    xp: 500,
    requirement: { type: 'streak_days', count: 30 },
    emoji: '📆'
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintained a 100-day streak',
    icon: Trophy,
    category: 'streak_legend',
    rarity: RARITY.LEGENDARY,
    xp: 1500,
    requirement: { type: 'streak_days', count: 100 },
    emoji: '🏅'
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintained a 365-day streak',
    icon: Crown,
    category: 'streak_legend',
    rarity: RARITY.MYTHIC,
    xp: 5000,
    requirement: { type: 'streak_days', count: 365 },
    emoji: '💎'
  },

  // Contribution King Achievements
  {
    id: 'first_contribution',
    name: 'First Steps',
    description: 'Made your first contribution',
    icon: Star,
    category: 'contribution_king',
    rarity: RARITY.COMMON,
    xp: 25,
    requirement: { type: 'total_contributions', count: 1 },
    emoji: '⭐'
  },
  {
    id: 'contributor',
    name: 'Active Contributor',
    description: 'Made 100 contributions',
    icon: TrendingUp,
    category: 'contribution_king',
    rarity: RARITY.RARE,
    xp: 200,
    requirement: { type: 'total_contributions', count: 100 },
    emoji: '📈'
  },
  {
    id: 'dedicated_dev',
    name: 'Dedicated Developer',
    description: 'Made 500 contributions',
    icon: Rocket,
    category: 'contribution_king',
    rarity: RARITY.EPIC,
    xp: 600,
    requirement: { type: 'total_contributions', count: 500 },
    emoji: '🚀'
  },
  {
    id: 'contribution_machine',
    name: 'Contribution Machine',
    description: 'Made 1000 contributions',
    icon: Award,
    category: 'contribution_king',
    rarity: RARITY.LEGENDARY,
    xp: 1200,
    requirement: { type: 'total_contributions', count: 1000 },
    emoji: '🎖️'
  },
  {
    id: 'contribution_god',
    name: 'Contribution God',
    description: 'Made 5000 contributions',
    icon: Sparkles,
    category: 'contribution_king',
    rarity: RARITY.MYTHIC,
    xp: 3000,
    requirement: { type: 'total_contributions', count: 5000 },
    emoji: '✨'
  },

  // Social Butterfly Achievements
  {
    id: 'first_comment',
    name: 'First Words',
    description: 'Left your first comment',
    icon: MessageSquare,
    category: 'social_butterfly',
    rarity: RARITY.COMMON,
    xp: 25,
    requirement: { type: 'comments', count: 1 },
    emoji: '💬'
  },
  {
    id: 'conversationalist',
    name: 'Conversationalist',
    description: 'Left 50 comments',
    icon: MessageSquare,
    category: 'social_butterfly',
    rarity: RARITY.RARE,
    xp: 150,
    requirement: { type: 'comments', count: 50 },
    emoji: '🗣️'
  },
  {
    id: 'community_pillar',
    name: 'Community Pillar',
    description: 'Left 200 comments',
    icon: Heart,
    category: 'social_butterfly',
    rarity: RARITY.EPIC,
    xp: 400,
    requirement: { type: 'comments', count: 200 },
    emoji: '❤️'
  },

  // Code Warrior Achievements
  {
    id: 'repo_creator',
    name: 'Repo Creator',
    description: 'Created your first repository',
    icon: GitFork,
    category: 'code_warrior',
    rarity: RARITY.COMMON,
    xp: 50,
    requirement: { type: 'repos_created', count: 1 },
    emoji: '📁'
  },
  {
    id: 'project_builder',
    name: 'Project Builder',
    description: 'Created 10 repositories',
    icon: Code2,
    category: 'code_warrior',
    rarity: RARITY.RARE,
    xp: 200,
    requirement: { type: 'repos_created', count: 10 },
    emoji: '🏗️'
  },
  {
    id: 'code_architect',
    name: 'Code Architect',
    description: 'Created 25 repositories',
    icon: Rocket,
    category: 'code_warrior',
    rarity: RARITY.EPIC,
    xp: 500,
    requirement: { type: 'repos_created', count: 25 },
    emoji: '🏛️'
  },
];

// Calculate current streak from contribution calendar
export const calculateStreak = (contributionDays) => {
  if (!contributionDays || contributionDays.length === 0) return 0;
  
  // Sort days by date descending (most recent first)
  const sortedDays = [...contributionDays].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const day of sortedDays) {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    
    // Check if this is today or yesterday (to allow for timezone differences)
    const diffDays = Math.floor((today - dayDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak && day.contributionCount > 0) {
      streak++;
    } else if (diffDays === streak && day.contributionCount === 0) {
      // Skip today if no contributions yet
      if (diffDays === 0) continue;
      break;
    } else if (diffDays > streak) {
      break;
    }
  }
  
  return streak;
};

// Calculate achievement progress
export const calculateAchievementProgress = (achievement, stats) => {
  const { type, count } = achievement.requirement;
  let current = 0;
  
  switch (type) {
    case 'prs_merged':
      current = stats.prsMerged || 0;
      break;
    case 'issues_closed':
      current = stats.issuesClosed || 0;
      break;
    case 'streak_days':
      current = stats.currentStreak || 0;
      break;
    case 'total_contributions':
      current = stats.totalContributions || 0;
      break;
    case 'comments':
      current = stats.comments || 0;
      break;
    case 'repos_created':
      current = stats.reposCreated || 0;
      break;
    default:
      current = 0;
  }
  
  const progress = Math.min((current / count) * 100, 100);
  const unlocked = current >= count;
  
  return { current, required: count, progress, unlocked };
};

// Calculate total XP from unlocked achievements
export const calculateTotalXP = (achievements, stats) => {
  return achievements.reduce((total, achievement) => {
    const { unlocked } = calculateAchievementProgress(achievement, stats);
    return total + (unlocked ? achievement.xp : 0);
  }, 0);
};

// Calculate level from XP
export const calculateLevel = (xp) => {
  // Level formula: Each level requires progressively more XP
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
  const levels = [0, 100, 250, 500, 800, 1200, 1800, 2500, 3500, 5000, 7000, 10000, 15000, 20000, 30000];
  
  let level = 1;
  for (let i = 1; i < levels.length; i++) {
    if (xp >= levels[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  const currentLevelXP = levels[level - 1] || 0;
  const nextLevelXP = levels[level] || levels[levels.length - 1] + 5000;
  const xpInCurrentLevel = xp - currentLevelXP;
  const xpRequiredForNextLevel = nextLevelXP - currentLevelXP;
  const progressToNextLevel = (xpInCurrentLevel / xpRequiredForNextLevel) * 100;
  
  return {
    level,
    currentXP: xp,
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    nextLevelXP,
    progressToNextLevel: Math.min(progressToNextLevel, 100)
  };
};

// Get all achievements with their progress
export const getAchievementsWithProgress = (stats) => {
  return ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    ...calculateAchievementProgress(achievement, stats)
  }));
};

// Get recently unlocked achievements (mock - would need timestamp tracking in real app)
export const getRecentlyUnlocked = (achievementsWithProgress) => {
  return achievementsWithProgress
    .filter(a => a.unlocked)
    .slice(-3)
    .reverse();
};

// Get next achievements to unlock
export const getNextToUnlock = (achievementsWithProgress) => {
  return achievementsWithProgress
    .filter(a => !a.unlocked && a.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);
};
