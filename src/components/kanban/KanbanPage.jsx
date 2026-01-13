import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Plus,
  Settings,
  RefreshCw,
  Sparkles,
  CircleDot,
  GitPullRequest,
  FileText,
  ChevronRight,
} from 'lucide-react';
import Sidebar from '../sidebar';
import KanbanBoard from './KanbanBoard';
import KanbanFilters from './KanbanFilters';
import { KanbanProvider, useKanban } from '../../context/KanbanContext';
import { CARD_TYPES } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';

function KanbanPageContent() {
  const { isAuthenticated } = useAuth();
  const { 
    cards, 
    syncWithGitHub, 
  } = useKanban();

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    priority: '',
    repo: '',
  });

  // Auto-sync on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && cards.length === 0) {
      syncWithGitHub();
    }
  }, [isAuthenticated, cards.length, syncWithGitHub]);

  // Calculate stats
  const stats = {
    total: cards.length,
    issues: cards.filter(c => c.type === CARD_TYPES.ISSUE).length,
    prs: cards.filter(c => c.type === CARD_TYPES.PR).length,
    notes: cards.filter(c => c.type === CARD_TYPES.NOTE).length,
    inProgress: cards.filter(c => c.columnId === 'in-progress').length,
    done: cards.filter(c => c.columnId === 'done').length,
  };

  return (
    <div className="h-9/10 w-full flex gap-8 px-5">
      {/* Left Sidebar - Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 mt-10 overflow-hidden">
        {/* Header */}
        <header className="shrink-0">
          <div className="pb-4">
            {/* Title & Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
              <ChevronRight size={14} />
              <span className="text-white">Project Board</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl">
                    <LayoutDashboard size={24} />
                  </div>
                  Project Board
                  <span className="px-2 py-1 text-xs font-normal bg-emerald-500/20 text-emerald-400 rounded-lg">
                    Beta
                  </span>
                </h1>
                <p className="text-gray-400 mt-1">
                  Manage your issues, PRs, and tasks in one place
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4">
                <QuickStat 
                  icon={CircleDot} 
                  label="Issues" 
                  value={stats.issues} 
                  color="text-emerald-400" 
                  bgColor="bg-emerald-400/10"
                />
                <QuickStat 
                  icon={GitPullRequest} 
                  label="PRs" 
                  value={stats.prs} 
                  color="text-purple-400"
                  bgColor="bg-purple-400/10"
                />
                <QuickStat 
                  icon={FileText} 
                  label="Notes" 
                  value={stats.notes} 
                  color="text-blue-400"
                  bgColor="bg-blue-400/10"
                />
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="pb-4">
            <KanbanFilters filters={filters} onFilterChange={setFilters} />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!isAuthenticated ? (
            <NotAuthenticatedState />
          ) : (
            <KanbanBoard filters={filters} />
          )}
        </div>
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${bgColor}`}>
      <Icon size={18} className={color} />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function NotAuthenticatedState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="p-6 bg-linear-to-br from-blue-500/20 to-purple-600/20 rounded-3xl mb-6">
        <LayoutDashboard size={48} className="text-blue-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Sign in to use Project Board</h2>
      <p className="text-gray-400 max-w-md mb-6">
        Connect your GitHub account to sync your issues and pull requests, 
        or create custom notes to track your work.
      </p>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <CircleDot size={16} className="text-emerald-400" />
          Track Issues
        </div>
        <div className="flex items-center gap-2">
          <GitPullRequest size={16} className="text-purple-400" />
          Monitor PRs
        </div>
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-400" />
          Add Notes
        </div>
      </div>
    </div>
  );
}

export default function KanbanPage() {
  return (
    <KanbanProvider>
      <KanbanPageContent />
    </KanbanProvider>
  );
}
