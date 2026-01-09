import React, { useEffect, useState } from 'react';
import { GitPullRequest, CheckCircle, Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchContributionData } from '@/services/githubApi';

const QuickStats = () => {
  const { user, getToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user || !getToken()) {
        setLoading(false);
        return;
      }

      try {
        const token = getToken();
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const data = await fetchContributionData(
          user.login,
          token,
          oneYearAgo.toISOString(),
          now.toISOString()
        );

        setStats(data.stats);
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user, getToken]);

  const data = stats || {
    prsMerged: 0,
    issuesSolved: 0,
    totalContributions: 0
  };

  const statItems = [
    { 
      icon: GitPullRequest, 
      label: 'PRs Merged', 
      value: data.prsMerged,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10'
    },
    { 
      icon: CheckCircle, 
      label: 'Issues Solved', 
      value: data.issuesSolved,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    { 
      icon: Star, 
      label:  'Contributions', 
      value: data.totalContributions,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    }
  ];

  if (loading) {
    return (
      <div className="w-full grid grid-cols-3 gap-3 my-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-[#161616] border border-white/5 min-h-[120px]"
          >
            <Loader2 className="animate-spin text-neutral-500" size={24} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-3 gap-3 my-4">
      {statItems.map((item, index) => (
        <div 
          key={index}
          className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#161616] border border-white/5 hover:border-white/10 transition-all duration-300"
        >
          <div className='flex gap-3'>
              <div className={`p-2 rounded-xl ${item.bgColor}`}>
              <item.icon className={`size-6 ${item.color}`} />
           </div>
             <div className="flex flex-col">
             <span className="text-4xl font-bold text-white">{item.value}</span>
            </div>
          </div>
            <span className="text-[0.8em] text-neutral-300 tracking-wide">{item.label}</span>
          
        </div>
      ))}
    </div>
  );
};

export default QuickStats;