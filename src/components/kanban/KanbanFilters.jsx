import {
  Search,
  X,
  CircleDot,
  GitPullRequest,
  FileText,
  RotateCcw,
} from "lucide-react";
import { useKanban } from "../../context/KanbanContext";
import { CARD_TYPES } from "../../lib/constants";

const filterTypes = [
  { value: "", label: "All Types", icon: null },
  { value: CARD_TYPES.ISSUE, label: "Issues", icon: CircleDot },
  { value: CARD_TYPES.PR, label: "Pull Requests", icon: GitPullRequest },
  { value: CARD_TYPES.NOTE, label: "Notes", icon: FileText },
];

const filterPriorities = [
  { value: "", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function KanbanFilters({ filters, onFilterChange }) {
  const { getUniqueRepos } = useKanban();

  const repos = getUniqueRepos();

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v && v !== "",
  ).length;

  const handleClearFilters = () => {
    onFilterChange({
      search: "",
      type: "",
      priority: "",
      repo: "",
    });
  };

  return (
    <div className="space-y-2">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            placeholder="Search cards..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            <RotateCcw size={12} />
            <span className="text-xs">Clear</span>
          </button>
        )}
      </div>

      {/* Quick Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        {/* Repository Filter */}
        {repos.length > 0 && (
          <select
            value={filters.repo || ""}
            onChange={(e) =>
              onFilterChange({ ...filters, repo: e.target.value })
            }
            className="px-3 py-1.5 bg-white/5 border border-transparent rounded-lg text-xs font-medium text-gray-400 focus:outline-none focus:border-blue-500/30 cursor-pointer hover:bg-white/10 hover:text-white transition-all"
          >
            <option value="">All Repos</option>
            {repos.map((repo) => (
              <option key={repo} value={repo}>
                {repo.split("/")[1] || repo}
              </option>
            ))}
          </select>
        )}

        {repos.length > 0 && <span className="mx-2 border-l border-white/10" />}

        {filterTypes.slice(1).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() =>
              onFilterChange({
                ...filters,
                type: filters.type === value ? "" : value,
              })
            }
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${
                filters.type === value
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white"
              }
            `}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}

        <span className="mx-2 border-l border-white/10" />

        {filterPriorities.slice(1).map(({ value, label }) => (
          <button
            key={value}
            onClick={() =>
              onFilterChange({
                ...filters,
                priority: filters.priority === value ? "" : value,
              })
            }
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${
                filters.priority === value
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
