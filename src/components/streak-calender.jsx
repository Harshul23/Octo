import React, { useState, useEffect } from 'react';
import { Flame, ChevronLeft, ChevronRight, Trophy, Zap, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { WiRefresh } from "react-icons/wi";
import { useAuth } from '../context/AuthContext';
import { fetchContributionData } from '../services/githubApi';

const StreakCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [contributionMap, setContributionMap] = useState({}); // { "dateString": count }
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    streakDates: [] // Will hold the ISO strings of dates in the streak
  });

  // --- 1. FETCH REAL GITHUB CONTRIBUTIONS ---
  useEffect(() => {
    const loadContributions = async () => {
      if (!user?.login) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('github_token');
        
        // Fetch last year of contributions
        const toDate = new Date().toISOString();
        const fromDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString();
        
        const data = await fetchContributionData(user.login, token, fromDate, toDate);
        
        // Build contribution map: { "Mon Jan 09 2026": 5, ... }
        const contribMap = {};
        const allDatesWithContributions = [];
        
        data.calendar.weeks.forEach(week => {
          week.contributionDays.forEach(day => {
            const dateStr = new Date(day.date).toDateString();
            contribMap[dateStr] = day.contributionCount;
            if (day.contributionCount > 0) {
              allDatesWithContributions.push(dateStr);
            }
          });
        });
        
        setContributionMap(contribMap);
        
        // Calculate streaks
        const { currentStreak, longestStreak, streakDates } = calculateStreaks(contribMap);
        setStreakData({ currentStreak, longestStreak, streakDates });
        
      } catch (error) {
        console.error('Failed to fetch contributions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContributions();
  }, [user]);

  // Calculate current and longest streaks
  const calculateStreaks = (contribMap) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const streakDates = [];
    
    // Check current streak (going backwards from today)
    let checkDate = new Date(today);
    
    // If today has no contributions, start from yesterday
    if (!contribMap[checkDate.toDateString()] || contribMap[checkDate.toDateString()] === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (contribMap[checkDate.toDateString()] > 0) {
      currentStreak++;
      streakDates.push(checkDate.toDateString());
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Calculate longest streak (iterate through all dates)
    const sortedDates = Object.keys(contribMap)
      .filter(date => contribMap[date] > 0)
      .map(date => new Date(date))
      .sort((a, b) => a - b);
    
    if (sortedDates.length > 0) {
      tempStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const diff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    return { currentStreak, longestStreak, streakDates };
  };

  // Get intensity level (0-4) based on contribution count
  const getIntensityLevel = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    const count = contributionMap[dateStr] || 0;
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  const getIntensityColor = (level) => {
    const colors = [
      'bg-transparent', // 0 contributions
      'bg-green-900/50', // 1-2 contributions
      'bg-green-700/60', // 3-5 contributions
      'bg-green-500/70', // 6-10 contributions
      'bg-green-400/80', // 10+ contributions
    ];
    return colors[level];
  };

  const getContributionCount = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return contributionMap[dateStr] || 0;
  };

  // --- 2. CALENDAR LOGIC ---
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Generate calendar grid
  const days = Array.from({ length: daysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Helper to check if a day is part of the active streak
  const isStreakDay = (day) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return streakData.streakDates.includes(checkDate);
  };

  const isToday = (day) => {
    return new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
  };

  const resetToCurrentMonth = () => {
    setCurrentDate(new Date())
  }

  if (loading) {
    return (
      <div className='w-full max-w-sm bg-[#1a1a1e] border border-white/5 rounded-3xl p-6 shadow-2xl font-sans flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='w-8 h-8 text-orange-500 animate-spin' />
          <span className='text-sm text-stone-500'>Loading contributions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full bg-[#1a1a1e] border border-white/5 rounded-3xl p-6 shadow-2xl font-sans'>
      
      {/* Header: Streak Stats */}
      <div className='flex justify-between items-end mb-6 gap-5 w-full'>
        <div>
          <div className='flex items-center justify-between w-full gap-0 mb-1'>
            <span className={`flex h-2 w-2 rounded-full ${streakData.currentStreak > 0 ? 'bg-orange-500 animate-pulse' : 'bg-stone-600'}`}></span>
            <span className='text-[10px] font-black text-stone-500 uppercase tracking-widest'>Current Streak</span>
            {/* Reset to Current Month Button */}
      <div className=" top-24 right-10">
        <Button
          onClick={resetToCurrentMonth}
          variant="ghost"
          size="sm"
          className="text-xs text-gray-400 z-10 mt-2 rounded-2xl hover:text-white hover:bg-transparent"
          title="Reset to current month"
        >
          <WiRefresh className="size-7" />
          Today
        </Button>
      </div>
          </div>
          <div className='flex items-center gap-3'>
            <h1 className='text-5xl font-black text-white leading-none'>{streakData.currentStreak}</h1>
            <div className='flex flex-col'>
              <span className='text-xl font-bold text-orange-500 leading-none'>DAYS</span>
              <span className='text-[10px] font-medium text-stone-500'>
                {streakData.currentStreak > 0 ? 'Keep the fire burning!' : 'Start contributing!'}
              </span>
            </div>
          </div>
        </div>
        <div className='p-3 bg-gradient-to-br from-orange-500/20 to-transparent rounded-2xl border border-orange-500/20'>
          <Flame className='text-orange-500 fill-orange-500' size={24} />
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className='flex justify-between items-center mb-4 px-2'>
        <span className='text-sm font-bold text-white'>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        <div className='flex gap-1'>
          <button onClick={handlePrevMonth} className='p-1 hover:bg-white/9 rounded-lg text-white font-black'><ChevronLeft size={16} /></button>
          <button onClick={handleNextMonth} className='p-1 hover:bg-white/9 rounded-lg text-white font-black'><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* The Grid */}
      <div className='grid grid-cols-7 gap-y-2 mb-6'>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className='text-center text-[10px] font-black text-stone-600 mb-2'>{d}</div>
        ))}

        {padding.map(i => <div key={`pad-${i}`} />)}

        {days.map(day => {
          const active = isStreakDay(day);
          const today = isToday(day);
          const intensityLevel = getIntensityLevel(day);
          const contribCount = getContributionCount(day);

          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isStart = day === 1 || !isStreakDay(day - 1) || date.getDay() === 0;
          const isEnd = day === days.length || !isStreakDay(day + 1) || date.getDay() === 6;

          return (
            <div key={day} className='relative flex items-center justify-center h-10 group'>
              
              {/* STREAK CONNECTION BACKGROUND (Visual Glue) */}
              {active && (
                <div 
                  className={`absolute inset-0 bg-white/10 z-0
                    ${isStart ? 'rounded-l-lg' : ''} 
                    ${isEnd ? 'rounded-r-lg' : ''}
                  `}
                />
              )}

              {/* The Date Circle with Intensity */}
              <div 
                className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-lg text-xs font-bold transition-all
                  ${today 
                    ? 'bg-white text-black' 
                    : contribCount > 0
                      ? `${getIntensityColor(intensityLevel)} text-white` 
                      : 'text-stone-500 hover:bg-white/5'
                  }`}
                title={`${contribCount} contribution${contribCount !== 1 ? 's' : ''}`}
              >
                {day}
              </div>

              {/* Tooltip on hover */}
              {contribCount > 0 && (
                <div className='absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20'>
                  {contribCount} contribution{contribCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer: Longest Record */}
      <div className='flex items-center gap-3 p-4 bg-white/[0.03] rounded-2xl border border-white/5'>
        <Trophy className='text-yellow-500' size={18} />
        <div>
          <p className='text-[10px] font-black text-stone-500 uppercase'>Longest Streak (Last Year)</p>
          <p className='text-sm font-bold text-white'>{streakData.longestStreak} Days</p>
        </div>
        <div className='ml-auto'>
           <Zap className={streakData.currentStreak >= streakData.longestStreak ? 'text-yellow-500' : 'text-stone-600'} size={16} />
        </div>
      </div>

      {/* Intensity Legend */}
      <div className='flex items-center justify-center gap-2 mt-4'>
        <span className='text-[10px] text-stone-500'>Less</span>
        <div className='w-3 h-3 rounded-xs bg-transparent border border-white/10'></div>
        <div className='w-3 h-3 rounded-xs bg-green-900/50'></div>
        <div className='w-3 h-3 rounded-xs bg-green-700/60'></div>
        <div className='w-3 h-3 rounded-xs bg-green-500/70'></div>
        <div className='w-3 h-3 rounded-xs bg-green-400/80'></div>
        <span className='text-[10px] text-stone-500'>More</span>
      </div>

    </div>
  );
};

export default StreakCalendar;