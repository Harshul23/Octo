/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchAssignedIssues,
  fetchCreatedIssues,
  fetchUserPullRequests,
} from '../services/githubApi';
import {
  CARD_TYPES,
  DEFAULT_COLUMNS,
  STORAGE_KEYS,
  generateId,
  extractRepoFromUrl,
} from '../lib/constants';

const KanbanContext = createContext(null);

export function KanbanProvider({ children }) {
  const { user, getToken, isAuthenticated } = useAuth();
  
  // Board state
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COLUMNS);
    return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
  });

  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : {
      viewMode: 'board', // 'board', 'list', 'table'
      showClosedItems: false,
      groupBy: 'status', // 'status', 'repo', 'label', 'assignee'
      selectedRepos: [], // Filter by specific repos
    };
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'synced', 'error'

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Fetch GitHub items and sync with board
  const syncWithGitHub = useCallback(async () => {
    if (!isAuthenticated) return;
    
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setSyncStatus('syncing');
    setError(null);

    try {
      // Fetch issues and PRs assigned to user
      const [assignedIssues, createdIssues, authoredPRs, reviewPRs] = await Promise.all([
        fetchAssignedIssues(token).catch(() => []),
        fetchCreatedIssues(token).catch(() => []),
        fetchUserPullRequests(user.login, token, { type: 'author' }).catch(() => []),
        fetchUserPullRequests(user.login, token, { type: 'review-requested' }).catch(() => []),
      ]);

      // Combine and deduplicate issues
      const allIssues = [...assignedIssues, ...createdIssues];
      const uniqueIssues = allIssues.filter((issue, index, self) =>
        index === self.findIndex(i => i.id === issue.id)
      );

      // Combine and deduplicate PRs
      const allPRs = [...authoredPRs, ...reviewPRs];
      const uniquePRs = allPRs.filter((pr, index, self) =>
        index === self.findIndex(p => p.id === pr.id)
      );

      // Convert GitHub items to cards (only add new ones)
      const existingGitHubIds = new Set(
        cards.filter(c => c.githubId).map(c => c.githubId)
      );

      const newIssueCards = uniqueIssues
        .filter(issue => !existingGitHubIds.has(issue.id))
        .map(issue => ({
          id: generateId(),
          githubId: issue.id,
          type: CARD_TYPES.ISSUE,
          title: issue.title,
          description: issue.body || '',
          columnId: 'todo',
          url: issue.html_url,
          number: issue.number,
          repo: issue.repository?.full_name || extractRepoFromUrl(issue.html_url),
          labels: issue.labels || [],
          assignees: issue.assignees || [],
          state: issue.state,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          priority: 'medium',
          dueDate: null,
          customFields: {},
        }));

      const newPRCards = uniquePRs
        .filter(pr => !existingGitHubIds.has(pr.id))
        .map(pr => ({
          id: generateId(),
          githubId: pr.id,
          type: CARD_TYPES.PR,
          title: pr.title,
          description: pr.body || '',
          columnId: pr.draft ? 'in-progress' : 'review',
          url: pr.html_url,
          number: pr.number,
          repo: pr.repository?.full_name || extractRepoFromUrl(pr.html_url),
          labels: pr.labels || [],
          assignees: pr.assignees || [],
          state: pr.state,
          draft: pr.draft,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          priority: 'medium',
          dueDate: null,
          customFields: {},
        }));

      if (newIssueCards.length > 0 || newPRCards.length > 0) {
        setCards(prev => [...prev, ...newIssueCards, ...newPRCards]);
      }

      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to sync with GitHub:', err);
      setError(err.message);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getToken, user, cards]);

  // Card operations
  const addCard = useCallback((cardData) => {
    const newCard = {
      id: generateId(),
      type: cardData.type || CARD_TYPES.NOTE,
      title: cardData.title || 'Untitled',
      description: cardData.description || '',
      columnId: cardData.columnId || 'todo',
      priority: cardData.priority || 'medium',
      dueDate: cardData.dueDate || null,
      labels: cardData.labels || [],
      assignees: cardData.assignees || [],
      customFields: cardData.customFields || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...cardData,
    };
    setCards(prev => [...prev, newCard]);
    return newCard;
  }, []);

  const updateCard = useCallback((cardId, updates) => {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { ...card, ...updates, updatedAt: new Date().toISOString() }
        : card
    ));
  }, []);

  const deleteCard = useCallback((cardId) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
  }, []);

  const moveCard = useCallback((cardId, targetColumnId, targetIndex = null) => {
    setCards(prev => {
      const cardIndex = prev.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;

      const newCards = [...prev];
      const [movedCard] = newCards.splice(cardIndex, 1);
      movedCard.columnId = targetColumnId;
      movedCard.updatedAt = new Date().toISOString();

      if (targetIndex !== null) {
        // Find the position to insert based on other cards in the column
        const columnCards = newCards.filter(c => c.columnId === targetColumnId);
        const insertPosition = targetIndex <= columnCards.length ? targetIndex : columnCards.length;
        
        // Find actual index in the array
        let actualIndex = 0;
        let columnCount = 0;
        for (let i = 0; i < newCards.length; i++) {
          if (newCards[i].columnId === targetColumnId) {
            if (columnCount === insertPosition) {
              actualIndex = i;
              break;
            }
            columnCount++;
          }
          actualIndex = i + 1;
        }
        newCards.splice(actualIndex, 0, movedCard);
      } else {
        newCards.push(movedCard);
      }

      return newCards;
    });
  }, []);

  // Column operations
  const addColumn = useCallback((columnData) => {
    const newColumn = {
      id: generateId(),
      title: columnData.title || 'New Column',
      color: columnData.color || 'bg-gray-500',
    };
    setColumns(prev => [...prev, newColumn]);
    return newColumn;
  }, []);

  const updateColumn = useCallback((columnId, updates) => {
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, ...updates } : col
    ));
  }, []);

  const deleteColumn = useCallback((columnId) => {
    // Move cards from deleted column to backlog
    setCards(prev => prev.map(card =>
      card.columnId === columnId ? { ...card, columnId: 'backlog' } : card
    ));
    setColumns(prev => prev.filter(col => col.id !== columnId));
  }, []);

  const reorderColumns = useCallback((startIndex, endIndex) => {
    setColumns(prev => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  // Settings operations
  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset board to defaults
  const resetBoard = useCallback(() => {
    setColumns(DEFAULT_COLUMNS);
    setCards([]);
    setSettings({
      viewMode: 'board',
      showClosedItems: false,
      groupBy: 'status',
      selectedRepos: [],
    });
  }, []);

  // Get cards for a specific column
  const getCardsForColumn = useCallback((columnId) => {
    return cards.filter(card => card.columnId === columnId);
  }, [cards]);

  // Get filtered cards based on settings
  const getFilteredCards = useCallback((filters = {}) => {
    return cards.filter(card => {
      if (filters.type && card.type !== filters.type) return false;
      if (filters.repo && card.repo !== filters.repo) return false;
      if (filters.priority && card.priority !== filters.priority) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return (
          card.title.toLowerCase().includes(search) ||
          card.description?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [cards]);

  // Get unique repos from cards
  const getUniqueRepos = useCallback(() => {
    const repos = new Set(cards.filter(c => c.repo).map(c => c.repo));
    return Array.from(repos);
  }, [cards]);

  const value = {
    // State
    columns,
    cards,
    settings,
    loading,
    error,
    syncStatus,
    
    // Card operations
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    
    // Column operations
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    
    // Settings
    updateSettings,
    
    // Utilities
    syncWithGitHub,
    resetBoard,
    getCardsForColumn,
    getFilteredCards,
    getUniqueRepos,
  };

  return (
    <KanbanContext.Provider value={value}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
}

export default KanbanContext;
