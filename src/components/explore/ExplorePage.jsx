import React, { useState } from "react";
import { Sparkles, GitFork } from "lucide-react";
import ExploreHeader from "./ExploreHeader";
import RecommendedRepos from "./RecommendedRepos";
import ForkedRepos from "./ForkedRepos";
import SkillsCard from "./SkillsCard";
import FilterPanel from "./FilterPanel";
import Sidebar from "../sidebar";

const ExplorePage = () => {
  const [activeFilters, setActiveFilters] = useState({
    difficulty: "all",
    language: "all",
    labels: [],
    hasNoComments: false,
    noPRYet: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("recommended");

  const viewOptions = [
    { id: "recommended", icon: Sparkles, label: "AI Recommended" },
    { id: "forked", icon: GitFork, label: "My Forks" },
  ];

  return (
    <div className="h-full w-full flex gap-4 px-4 py-4 overflow-hidden">
      {/* Left Sidebar - Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex h-full gap-4 overflow-hidden">
        <div className="flex flex-col h-full flex-1 min-w-0 overflow-hidden">
          {/* Left:  Main Content */}
          {/* Header with Search */}
          <ExploreHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg w-fit mb-4 border border-white/10 shrink-0">
            {viewOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setViewMode(option.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                  ${
                    viewMode === option.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-500"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }
                `}
              >
                <option.icon size={16} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden min-h-0">
            {viewMode === "recommended" ? (
              <RecommendedRepos />
            ) : (
              <ForkedRepos />
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-80 shrink-0 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
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
