import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { Plus, MoreHorizontal, Edit3, Trash2, Palette } from 'lucide-react';
import KanbanCard from './KanbanCard';
import { useKanban } from '../../context/KanbanContext';

const columnColors = [
  { name: 'Gray', value: 'bg-gray-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-emerald-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Pink', value: 'bg-pink-500' },
];

export default function KanbanColumn({ column, cards, onAddCard }) {
  const { updateColumn, deleteColumn, columns } = useKanban();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const cardIds = cards.map(card => card.id);

  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle !== column.title) {
      updateColumn(column.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(column.title);
      setIsEditing(false);
    }
  };

  const handleColorChange = (color) => {
    updateColumn(column.id, { color });
    setShowColorPicker(false);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (columns.length <= 1) {
      alert('You need at least one column');
      return;
    }
    if (confirm(`Delete "${column.title}" column? Cards will be moved to Backlog.`)) {
      deleteColumn(column.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="flex flex-col w-80 min-w-[320px] h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          {/* Color Indicator */}
          <div className={`w-3 h-3 rounded-full ${column.color}`} />
          
          {/* Title */}
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyDown}
              className="bg-transparent border border-white/20 rounded-lg px-2 py-1 text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
              autoFocus
            />
          ) : (
            <h3 className="text-sm font-semibold text-white">{column.title}</h3>
          )}
          
          {/* Card Count */}
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddCard(column.id)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Add card"
          >
            <Plus size={16} />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => { setShowMenu(false); setShowColorPicker(false); }}
                />
                <div className="absolute top-8 right-0 z-50 w-48 py-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl">
                  <button
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Edit3 size={14} /> Rename
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                    >
                      <Palette size={14} /> Change Color
                    </button>
                    
                    {/* Color Picker */}
                    {showColorPicker && (
                      <div className="absolute left-full top-0 ml-2 p-3 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl">
                        <div className="grid grid-cols-4 gap-2">
                          {columnColors.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => handleColorChange(color.value)}
                              className={`w-6 h-6 rounded-full ${color.value} hover:scale-110 transition-transform ${
                                column.color === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]' : ''
                              }`}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-white/5 my-2" />
                  
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete Column
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-3 rounded-2xl bg-[#0f0f0f] border border-white/5
          overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent
          transition-all duration-200
          ${isOver ? 'border-blue-500/50 bg-blue-500/5' : ''}
        `}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {cards.map((card) => (
              <KanbanCard key={card.id} card={card} />
            ))}
          </div>
        </SortableContext>

        {/* Empty State */}
        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-gray-500 mb-2">No cards yet</p>
            <button
              onClick={() => onAddCard(column.id)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Plus size={14} /> Add a card
            </button>
          </div>
        )}

        {/* Drop Indicator */}
        {isOver && (
          <div className="mt-3 h-20 rounded-xl border-2 border-dashed border-blue-500/30 bg-blue-500/5 flex items-center justify-center">
            <span className="text-xs text-blue-400">Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
}
