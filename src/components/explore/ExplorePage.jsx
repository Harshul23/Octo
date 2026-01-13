import React, { useState } from 'react';
import { Sparkles, GitFork } from 'lucide-react';
import ExploreHeader from './ExploreHeader';
import RecommendedRepos from './RecommendedRepos';
import ForkedRepos from './ForkedRepos';
import SkillsCard from './SkillsCard';
import FilterPanel from './FilterPanel';
import Sidebar from '../sidebar';

const ExplorePage = () => {
  const [activeFilters, setActiveFilters] = useState({
    difficulty: 'all',
    language: 'all',
    labels: [],
    hasNoComments: false,
    noPRYet: true
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('recommended');

  const viewOptions = [
    { id: 'recommended', icon: Sparkles, label: 'AI Recommended' },
    { id: 'forked', icon: GitFork, label: 'My Forks' }
  ];

  return (
    <div className="h-9/10 w-full flex gap-8 px-5">
      {/* Left Sidebar - Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="w-full justify-between flex h-9/10 gap-6 mt-10">
        <div className='flex flex-col h-full w-4/5'>
           {/* Left:  Main Content */}
          {/* Header with Search */}
          <ExploreHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl w-fit mb-6 border border-white/10">
            {viewOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setViewMode(option.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                  ${viewMode === option.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <option.icon size={16} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className='max-h-8/11 h-full'>
            {viewMode === 'recommended' ? (
              <RecommendedRepos />
            ) : (
              <ForkedRepos />
            )}
          </div>
        </div>
        
       

        {/* Right: Sidebar */}
        <div className="w-[22em] flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <SkillsCard />
          <FilterPanel 
            filters={activeFilters}
            onFilterChange={setActiveFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;