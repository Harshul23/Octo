import { useState, useEffect } from "react";
import {
  Trophy,
  Flame,
  Star,
  Target,
  TrendingUp,
  ChevronRight,
  Check,
  Lock,
  Sparkles,
  GitPullRequest,
  Bug,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Sidebar from "../sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  fetchContributionData,
  fetchUserEvents,
  fetchUserRepositories,
  parseUserActivity,
} from "../../services/githubApi";
import {
  ACHIEVEMENTS,
  CATEGORIES,
  calculateStreak,
  calculateTotalXP,
  calculateLevel,
  getAchievementsWithProgress,
  getRecentlyUnlocked,
  getNextToUnlock,
} from "./achievementData";

const AchievementsPage = () => {
  const { user, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    prsMerged: 0,
    issuesClosed: 0,
    totalContributions: 0,
    currentStreak: 0,
    comments: 0,
    reposCreated: 0,
  });
  const [achievements, setAchievements] = useState([]);
  const [levelInfo, setLevelInfo] = useState({
    level: 1,
    currentXP: 0,
    progressToNextLevel: 0,
  });

  const fetchStats = async () => {
    const token = getToken();
    if (!user || !token) {
      setError("Please log in to view your achievements");
      return;
    }

    try {
      setError(null);
      const toDate = new Date().toISOString();
      const fromDate = new Date(
        Date.now() - 365 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const [contributionData, events, repos] = await Promise.all([
        fetchContributionData(user.login, token, fromDate, toDate),
        fetchUserEvents(user.login, token, 100),
        fetchUserRepositories(user.login, token, 100),
      ]);

      const activity = parseUserActivity(events);
      const allDays = contributionData.calendar.weeks.flatMap(
        (w) => w.contributionDays,
      );
      const currentStreak = calculateStreak(allDays);
      const ownedRepos = repos.filter((r) => !r.fork).length;

      const newStats = {
        prsMerged: contributionData.stats.prsMerged,
        issuesClosed: contributionData.stats.issuesSolved,
        totalContributions: contributionData.stats.totalContributions,
        currentStreak,
        comments: activity.comments.length,
        reposCreated: ownedRepos,
      };

      setStats(newStats);
      const achievementsWithProgress = getAchievementsWithProgress(newStats);
      setAchievements(achievementsWithProgress);
      const totalXP = calculateTotalXP(ACHIEVEMENTS, newStats);
      const level = calculateLevel(totalXP);
      setLevelInfo(level);
    } catch (err) {
      console.error("Error fetching achievement stats:", err);
      setError("Failed to fetch GitHub data. Please try again.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    loadData();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  // Donut chart data
  const donutData = [
    { name: "Unlocked", value: unlockedCount, color: "#a855f7" },
    { name: "Locked", value: totalCount - unlockedCount, color: "#f0e6d3" },
  ];

  // Filter achievements
  const filteredAchievements =
    activeFilter === "all"
      ? achievements
      : achievements.filter((a) => a.category === activeFilter);

  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return b.progress - a.progress;
  });

  const nearUnlocks = getNextToUnlock(achievements);
  const recentUnlocks = getRecentlyUnlocked(achievements);

  const filters = [
    { id: "all", name: "All" },
    ...Object.values(CATEGORIES).map((c) => ({
      id: c.id,
      name: c.name.split(" ")[0],
    })),
  ];

  if (loading) {
    return (
      <div className="h-9/10 w-full flex gap-8 px-5">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 text-purple-400 animate-spin" />
            <p className="text-gray-400">Loading your GitHub achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-9/10 w-full flex gap-8 px-5">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-full bg-red-500/10">
              <Trophy className="size-8 text-red-400" />
            </div>
            <p className="text-red-400">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-9/10 w-full flex gap-6 px-5">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-5 mt-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Trophy size={14} />
              <span>Dashboard</span>
              <ChevronRight size={14} />
              <span className="text-white">Achievements</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Your Achievement Progress
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Top Section: Stats Cards + Donut Chart */}
        <div className="flex gap-5 shrink-0">
          {/* Left: Donut Chart */}
          <div className="w-[280px] p-6 rounded-3xl bg-gradient-to-br from-[#fef3c7]/10 to-[#fde68a]/5 border border-amber-200/10 relative">
            <div className="absolute top-4 right-4 text-amber-400/60">
              <Sparkles size={18} />
            </div>
            <div className="absolute bottom-4 left-4 text-purple-400/60">
              <Star size={16} />
            </div>
            <div className="relative h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">
                  {unlockedCount}
                </span>
                <span className="text-xs text-gray-400">of {totalCount}</span>
              </div>
            </div>
          </div>

          {/* Right: Stats Cards */}
          <div className="flex-1 grid grid-cols-3 gap-4">
            {/* Badges Earned - Yellow */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-400/20 to-yellow-400/10 border border-amber-400/20">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-amber-400" />
                <span className="text-sm text-amber-200/80">Badges earned</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">
                  {unlockedCount}
                </span>
                <span className="text-emerald-400 text-sm flex items-center gap-0.5 mb-1">
                  <TrendingUp size={14} />+
                  {Math.round((unlockedCount / totalCount) * 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total achievements unlocked
              </p>
            </div>

            {/* Total XP - Pink */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-400/20 to-rose-400/10 border border-pink-400/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-pink-400" />
                <span className="text-sm text-pink-200/80">Total XP</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">
                  {levelInfo.currentXP.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Experience points earned
              </p>
            </div>

            {/* Current Level - White/Neutral */}
            <div className="p-5 rounded-2xl bg-[#1a1a1a] border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Target size={16} className="text-purple-400" />
                <span className="text-sm text-gray-400">Current level</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">
                  Lvl {levelInfo.level}
                </span>
                <span className="text-gray-500 text-sm mb-1">
                  {Math.round(levelInfo.progressToNextLevel)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {levelInfo.xpRequiredForNextLevel - levelInfo.xpInCurrentLevel}{" "}
                XP to next level
              </p>
            </div>

            {/* Current Streak */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-400/20 to-red-400/10 border border-orange-400/20">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={16} className="text-orange-400" />
                <span className="text-sm text-orange-200/80">
                  Current streak
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">
                  {stats.currentStreak}
                </span>
                <span className="text-sm text-gray-400 mb-1">days</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Keep the momentum going!
              </p>
            </div>

            {/* PRs Merged */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-400/20 to-cyan-400/10 border border-blue-400/20">
              <div className="flex items-center gap-2 mb-3">
                <GitPullRequest size={16} className="text-blue-400" />
                <span className="text-sm text-blue-200/80">PRs merged</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">
                  {stats.prsMerged}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">This year</p>
            </div>

            {/* Issues Closed */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-green-400/10 border border-emerald-400/20">
              <div className="flex items-center gap-2 mb-3">
                <Bug size={16} className="text-emerald-400" />
                <span className="text-sm text-emerald-200/80">
                  Issues closed
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">
                  {stats.issuesClosed}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">This year</p>
            </div>
          </div>
        </div>

        {/* Middle Section: Near Unlocks + Recent Unlocks */}
        <div className="flex gap-5 shrink-0">
          {/* Almost There */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Almost there
            </h3>
            <div className="flex gap-3">
              {nearUnlocks.length > 0 ? (
                nearUnlocks.slice(0, 3).map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className="flex-1 p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 hover:border-purple-500/30 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                          <Icon size={18} className="text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {achievement.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {achievement.description}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">
                          {Math.round(achievement.progress)}%
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 text-center text-gray-500">
                  <p className="text-sm">
                    Start contributing to unlock achievements!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Unlocks */}
        <div className="shrink-0">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Recent unlocks
          </h3>
          <div className="flex gap-3">
            {recentUnlocks.length > 0 ? (
              recentUnlocks.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 flex items-center gap-3"
                >
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-br ${achievement.rarity.color}`}
                  >
                    <achievement.icon size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {achievement.name}
                    </p>
                    <p className="text-xs text-yellow-400">
                      +{achievement.xp} XP
                    </p>
                  </div>
                  <span className="text-lg ml-1">{achievement.emoji}</span>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-[#1a1a1a] border border-white/5 text-gray-500 text-sm">
                No recent unlocks yet
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Achievement Table */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Filters */}
          <div className="flex gap-2 mb-4 shrink-0">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter.id
                    ? "bg-white text-black"
                    : "bg-[#1a1a1a] text-gray-400 hover:text-white border border-white/5"
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto custom-scrollbar rounded-2xl bg-[#0f0f0f] border border-white/5">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-xs text-gray-500 font-medium sticky top-0 bg-[#0f0f0f] z-10">
              <div className="col-span-1">Rarity</div>
              <div className="col-span-3">Achievement</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Progress</div>
              <div className="col-span-1">XP</div>
              <div className="col-span-2">Status</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5">
              {sortedAchievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors animate-fadeIn"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Rarity */}
                    <div className="col-span-1">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-lg ${achievement.rarity.bg} ${achievement.rarity.text}`}
                      >
                        {achievement.rarity.name.slice(0, 4)}
                      </span>
                    </div>

                    {/* Achievement Name + Icon */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${achievement.unlocked ? `bg-gradient-to-br ${achievement.rarity.color}` : "bg-white/5"}`}
                      >
                        <Icon
                          size={16}
                          className={
                            achievement.unlocked
                              ? "text-white"
                              : "text-gray-600"
                          }
                        />
                      </div>
                      <span
                        className={`font-medium ${achievement.unlocked ? "text-white" : "text-gray-500"}`}
                      >
                        {achievement.name}
                      </span>
                      <span
                        className={`text-lg ${achievement.unlocked ? "" : "grayscale opacity-40"}`}
                      >
                        {achievement.emoji}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="col-span-3">
                      <span className="text-sm text-gray-500">
                        {achievement.description}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              achievement.unlocked
                                ? `bg-gradient-to-r ${achievement.rarity.color}`
                                : "bg-gray-600"
                            }`}
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12">
                          {achievement.current}/{achievement.required}
                        </span>
                      </div>
                    </div>

                    {/* XP */}
                    <div className="col-span-1">
                      <span
                        className={`text-sm font-medium ${achievement.unlocked ? "text-yellow-400" : "text-gray-600"}`}
                      >
                        +{achievement.xp}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center gap-2">
                      {achievement.unlocked ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                          <Check size={12} />
                          Unlocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white/5 px-3 py-1.5 rounded-full">
                          <Lock size={12} />
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
