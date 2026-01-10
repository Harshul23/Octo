import { useState } from 'react';
import {
  Search,
  Filter,
  X,
  CircleDot,
  GitPullRequest,
  FileText,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { CARD_TYPES, useKanban } from '../../context/KanbanContext';

const filterTypes = [
  { value: '', label: 'All Types', icon: null },
  { value: CARD_TYPES.ISSUE, label: 'Issues', icon: CircleDot },
  { value: CARD_TYPES.PR, label: 'Pull Requests', icon: GitPullRequest },
  { value: CARD_TYPES.NOTE, label: 'Notes', icon: FileText },
];

const filterPriorities = [
  { value: '', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function KanbanFilters({ filters, onFilterChange }) {
  const { getUniqueRepos } = useKanban();
  const [isExpanded, setIsExpanded] = useState(false);

  const repos = getUniqueRepos();

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '').length;

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      type: '',
      priority: '',
      repo: '',
    });
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search cards..."
            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all
            ${isExpanded || activeFiltersCount > 0
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            }
          `}
        >
          <Filter size={16} />
          <span className="text-sm font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown 
            size={16} 
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            <RotateCcw size={16} />
            <span className="text-sm">Clear</span>
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase">Type</span>
            <select
              value={filters.type || ''}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
              className="px-3 py-2 bg-[#161616] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {filterTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase">Priority</span>
            <select
              value={filters.priority || ''}
              onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
              className="px-3 py-2 bg-[#161616] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {filterPriorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Repository Filter */}
          {repos.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase">Repository</span>
              <select
                value={filters.repo || ''}
                onChange={(e) => onFilterChange({ ...filters, repo: e.target.value })}
                className="px-3 py-2 bg-[#161616] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer max-w-[200px]"
              >
                <option value="">All Repos</option>
                {repos.map((repo) => (
                  <option key={repo} value={repo}>
                    {repo.split('/')[1] || repo}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Quick Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filterTypes.slice(1).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onFilterChange({ 
              ...filters, 
              type: filters.type === value ? '' : value 
            })}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${filters.type === value
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white'
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
            onClick={() => onFilterChange({ 
              ...filters, 
              priority: filters.priority === value ? '' : value 
            })}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${filters.priority === value
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white'
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
