import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Plus,
  LayoutGrid,
  List,
  Table2,
  RefreshCw,
  Settings,
  Download,
  Upload,
} from 'lucide-react';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import AddCardModal from './AddCardModal';
import { useKanban } from '../../context/KanbanContext';

const viewModes = [
  { id: 'board', icon: LayoutGrid, label: 'Board' },
  { id: 'list', icon: List, label: 'List' },
  { id: 'table', icon: Table2, label: 'Table' },
];

export default function KanbanBoard({ filters = {} }) {
  const {
    columns,
    cards,
    settings,
    updateSettings,
    addColumn,
    moveCard,
    syncWithGitHub,
    syncStatus,
    loading,
    getFilteredCards,
  } = useKanban();

  const [activeCard, setActiveCard] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalColumnId, setAddModalColumnId] = useState(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get filtered cards
  const filteredCards = useMemo(() => {
    return getFilteredCards(filters);
  }, [getFilteredCards, filters]);

  // Get cards for each column
  const getColumnCards = (columnId) => {
    return filteredCards.filter(card => card.columnId === columnId);
  };

  // Handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    const card = cards.find(c => c.id === active.id);
    setActiveCard(card);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeCard = cards.find(c => c.id === active.id);
    if (!activeCard) return;

    // Determine target column
    let targetColumnId = null;
    let targetIndex = null;

    // Check if dropped on a column
    const targetColumn = columns.find(col => col.id === over.id);
    if (targetColumn) {
      targetColumnId = targetColumn.id;
    } else {
      // Dropped on another card - find its column
      const targetCard = cards.find(c => c.id === over.id);
      if (targetCard) {
        targetColumnId = targetCard.columnId;
        const columnCards = getColumnCards(targetColumnId);
        targetIndex = columnCards.findIndex(c => c.id === over.id);
      }
    }

    if (targetColumnId && (targetColumnId !== activeCard.columnId || targetIndex !== null)) {
      moveCard(active.id, targetColumnId, targetIndex);
    }
  };

  // Handle adding a new card
  const handleAddCard = (columnId) => {
    setAddModalColumnId(columnId);
    setShowAddModal(true);
  };

  // Handle adding a new column
  const handleAddColumn = () => {
    addColumn({ title: 'New Column' });
  };

  // Handle sync with GitHub
  const handleSync = async () => {
    await syncWithGitHub();
  };

  // Render Board View
  const renderBoardView = () => (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-auto h-full pb-4 px-1">
        <SortableContext
          items={columns.map(c => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={getColumnCards(column.id)}
              onAddCard={handleAddCard}
            />
          ))}
        </SortableContext>

        {/* Add Column Button */}
        <button
          onClick={handleAddColumn}
          className="shrink-0 flex flex-col items-center justify-center w-80 min-w-[320px] h-32 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group"
        >
          <Plus size={24} className="text-gray-500 group-hover:text-white transition-colors" />
          <span className="text-sm text-gray-500 group-hover:text-white mt-2 transition-colors">
            Add Column
          </span>
        </button>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCard && <KanbanCard card={activeCard} overlay />}
      </DragOverlay>
    </DndContext>
  );

  // Render List View
  const renderListView = () => (
    <div className="space-y-6">
      {columns.map((column) => {
        const columnCards = getColumnCards(column.id);
        return (
          <div key={column.id} className="bg-[#0f0f0f] rounded-2xl border border-white/5 overflow-hidden">
            {/* Column Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="text-sm font-semibold text-white">{column.title}</h3>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                {columnCards.length}
              </span>
            </div>
            
            {/* Cards */}
            <div className="divide-y divide-white/5">
              {columnCards.map((card) => (
                <div key={card.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{card.title}</p>
                      {card.repo && (
                        <p className="text-xs text-gray-500 mt-1">
                          {card.repo} {card.number && `#${card.number}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {card.labels?.slice(0, 2).map((label, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{
                            backgroundColor: `#${label.color}20`,
                            color: `#${label.color}`,
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {columnCards.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500 text-sm">
                  No cards in this column
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render Table View
  const renderTableView = () => (
    <div className="bg-[#0f0f0f] rounded-2xl border border-white/5 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Title</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Type</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Priority</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Repository</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Labels</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {filteredCards.map((card) => {
            const column = columns.find(c => c.id === card.columnId);
            return (
              <tr key={card.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm text-white font-medium">{card.title}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${column?.color || 'bg-gray-500'}`} />
                    <span className="text-sm text-gray-300">{column?.title || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-400 capitalize">{card.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-400 capitalize">{card.priority}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-400">
                    {card.repo ? card.repo.split('/')[1] : '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {card.labels?.slice(0, 2).map((label, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs rounded-full"
                        style={{
                          backgroundColor: `#${label.color}20`,
                          color: `#${label.color}`,
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filteredCards.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500 text-sm">
          No cards match your filters
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
          {viewModes.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => updateSettings({ viewMode: id })}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${settings.viewMode === id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }
              `}
              title={label}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={loading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${syncStatus === 'syncing' 
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">
              {loading ? 'Syncing...' : 'Sync GitHub'}
            </span>
          </button>

          <button
            onClick={() => handleAddCard('todo')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Card</span>
          </button>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden min-h-screen">
        {settings.viewMode === 'board' && renderBoardView()}
        {settings.viewMode === 'list' && renderListView()}
        {settings.viewMode === 'table' && renderTableView()}
      </div>

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        columnId={addModalColumnId}
      />
    </div>
  );
}
