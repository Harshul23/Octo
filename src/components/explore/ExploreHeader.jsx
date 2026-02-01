import React from "react";
import { Search, Sparkles, SlidersHorizontal } from "lucide-react";

const ExploreHeader = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="mb-4 shrink-0">
      {/* Title Section */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="size-6 text-yellow-400" />
            Explore
          </h1>
          <p className="text-neutral-400 mt-1 text-sm">
            Discover new repositories and issues tailored for you
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161616] border border-white/5 focus-within:border-white/20 transition-all">
          <Search className="size-5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search repos, issues, or topics...  (e.g., 'React bug fix', 'Python documentation')"
            className="flex-1 bg-transparent text-white placeholder:text-neutral-600 outline-none text-sm"
          />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-neutral-500 text-xs">
            <SlidersHorizontal className="size-3" />
            <span>Filters</span>
          </div>
        </div>
      </div>

      {/* Quick Filter Tags */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className="text-xs text-neutral-600">Quick filters:</span>
        {[
          "good first issue",
          "documentation",
          "bug",
          "help wanted",
          "React",
          "Python",
        ].map((tag) => (
          <button
            key={tag}
            className="px-3 py-1 rounded-full text-xs bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition-all"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExploreHeader;
