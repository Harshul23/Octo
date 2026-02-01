import React from "react";
import { Filter, RotateCcw } from "lucide-react";

const FilterPanel = ({ filters, onFilterChange }) => {
  const difficulties = ["all", "Easy", "Medium", "Hard"];
  const languages = [
    "all",
    "JavaScript",
    "TypeScript",
    "Python",
    "CSS",
    "Go",
    "Rust",
  ];

  const handleReset = () => {
    onFilterChange({
      difficulty: "all",
      language: "all",
      labels: [],
      hasNoComments: false,
      noPRYet: true,
    });
  };

  return (
    <div className="p-3 rounded-xl bg-[#161616] border border-white/5 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Filters</h3>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors"
        >
          <RotateCcw className="size-3" />
          Reset
        </button>
      </div>

      {/* Difficulty Filter */}
      <div className="mb-3">
        <label className="text-xs text-neutral-500 mb-1.5 block">
          Difficulty
        </label>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => onFilterChange({ ...filters, difficulty: diff })}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                filters.difficulty === diff
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-neutral-400 hover:bg-white/10"
              }`}
            >
              {diff === "all" ? "All" : diff}
            </button>
          ))}
        </div>
      </div>

      {/* Language Filter */}
      <div className="mb-3">
        <label className="text-xs text-neutral-500 mb-1.5 block">
          Language
        </label>
        <select
          value={filters.language}
          onChange={(e) =>
            onFilterChange({ ...filters, language: e.target.value })
          }
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-neutral-300 outline-none focus:border-blue-500 transition-colors"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang} className="bg-[#161616]">
              {lang === "all" ? "All Languages" : lang}
            </option>
          ))}
        </select>
      </div>

      {/* Toggle Filters */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.noPRYet}
            onChange={(e) =>
              onFilterChange({ ...filters, noPRYet: e.target.checked })
            }
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
          />
          <span className="text-sm text-neutral-300">No PR submitted yet</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hasNoComments}
            onChange={(e) =>
              onFilterChange({ ...filters, hasNoComments: e.target.checked })
            }
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
          />
          <span className="text-sm text-neutral-300">Zero comments</span>
        </label>
      </div>
    </div>
  );
};

export default FilterPanel;
