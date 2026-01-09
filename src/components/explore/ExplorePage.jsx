import React, { useState } from 'react';
import ExploreHeader from './ExploreHeader';
import RecommendedRepos from './RecommendedRepos';
import DiscoverIssues from './DiscoverIssues';
import SkillsCard from './SkillsCard';
import FilterPanel from './FilterPanel';
import QuickTips from './QuickTips';
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

  return (
    <div className="h-9/10 w-full flex gap-8 px-5">
      {/* Left Sidebar - Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Left:  Main Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
          {/* Header with Search */}
          <ExploreHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* AI Recommended Repos Section */}
          <RecommendedRepos />

          {/* Discover Issues Section - Main Feed */}
          <DiscoverIssues 
            filters={activeFilters}
            searchQuery={searchQuery}
          />
        </div>

        {/* Right: Sidebar */}
        <div className="w-[22em] flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <SkillsCard />
          <FilterPanel 
            filters={activeFilters}
            onFilterChange={setActiveFilters}
          />
          <QuickTips />
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;