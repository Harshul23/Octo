// Card types for Kanban board
export const CARD_TYPES = {
  ISSUE: 'issue',
  PR: 'pull_request',
  NOTE: 'note',
};

// Default columns for the Kanban board
export const DEFAULT_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'bg-gray-500' },
  { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
  { id: 'review', title: 'In Review', color: 'bg-purple-500' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500' },
];

// Local storage keys
export const STORAGE_KEYS = {
  COLUMNS: 'octo_kanban_columns',
  CARDS: 'octo_kanban_cards',
  SETTINGS: 'octo_kanban_settings',
};

// Generate unique ID
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to extract repo name from GitHub URL
export const extractRepoFromUrl = (url) => {
  if (!url) return '';
  const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
  return match ? match[1] : '';
};