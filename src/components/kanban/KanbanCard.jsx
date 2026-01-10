import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import {
  GitPullRequest,
  CircleDot,
  FileText,
  MoreHorizontal,
  Calendar,
  Tag,
  ExternalLink,
  Trash2,
  Edit3,
  Flag,
  Clock,
  MessageSquare,
  User,
} from 'lucide-react';
import { CARD_TYPES, useKanban } from '../../context/KanbanContext';
import { formatDistanceToNow } from 'date-fns';

const priorityColors = {
  low: 'bg-gray-400/20 text-gray-400 border-gray-400/30',
  medium: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
  high: 'bg-orange-400/20 text-orange-400 border-orange-400/30',
  urgent: 'bg-red-400/20 text-red-400 border-red-400/30',
};

const priorityIcons = {
  low: '○',
  medium: '◐',
  high: '●',
  urgent: '⚠',
};

const typeConfig = {
  [CARD_TYPES.ISSUE]: {
    icon: CircleDot,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    label: 'Issue',
  },
  [CARD_TYPES.PR]: {
    icon: GitPullRequest,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    label: 'PR',
  },
  [CARD_TYPES.NOTE]: {
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    label: 'Note',
  },
};

export default function KanbanCard({ card, overlay = false }) {
  const { updateCard, deleteCard } = useKanban();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const TypeIcon = typeConfig[card.type]?.icon || FileText;
  const typeColor = typeConfig[card.type]?.color || 'text-gray-400';
  const typeBgColor = typeConfig[card.type]?.bgColor || 'bg-gray-400/10';

  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle !== card.title) {
      updateCard(card.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(card.title);
      setIsEditing(false);
    }
  };

  const handlePriorityChange = (priority) => {
    updateCard(card.id, { priority });
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCard(card.id);
    }
    setShowMenu(false);
  };

  if (overlay) {
    return (
      <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/20 shadow-2xl rotate-3 scale-105">
        <CardContent 
          card={card} 
          TypeIcon={TypeIcon} 
          typeColor={typeColor} 
          typeBgColor={typeBgColor}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative p-4 rounded-xl bg-[#161616] border border-white/5 
        hover:border-white/10 transition-all duration-200 cursor-grab
        ${isDragging ? 'opacity-50 shadow-lg ring-2 ring-blue-500/50' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      {/* Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
      >
        <MoreHorizontal size={16} className="text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div 
          className="absolute top-10 right-3 z-50 w-48 py-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { setIsEditing(true); setShowMenu(false); }}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
          >
            <Edit3 size={14} /> Edit Title
          </button>
          
          <div className="px-4 py-2 text-xs text-gray-500 uppercase">Priority</div>
          {['low', 'medium', 'high', 'urgent'].map((p) => (
            <button
              key={p}
              onClick={() => handlePriorityChange(p)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 ${
                card.priority === p ? 'text-white' : 'text-gray-400'
              }`}
            >
              <span>{priorityIcons[p]}</span>
              <span className="capitalize">{p}</span>
              {card.priority === p && <span className="ml-auto">✓</span>}
            </button>
          ))}
          
          <div className="border-t border-white/5 my-2" />
          
          {card.url && (
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
            >
              <ExternalLink size={14} /> Open in GitHub
            </a>
          )}
          
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {/* Card Content */}
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border border-white/20 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <CardContent 
          card={card} 
          TypeIcon={TypeIcon} 
          typeColor={typeColor} 
          typeBgColor={typeBgColor}
        />
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

function CardContent({ card, TypeIcon, typeColor, typeBgColor }) {
  return (
    <>
      {/* Type Badge & Priority */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${typeBgColor}`}>
          <TypeIcon size={12} className={typeColor} />
          <span className={`text-xs font-medium ${typeColor}`}>
            {card.repo ? `${card.repo.split('/')[1]}` : typeConfig[card.type]?.label}
            {card.number && ` #${card.number}`}
          </span>
        </div>
        
        <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${priorityColors[card.priority]}`}>
          {priorityIcons[card.priority]} {card.priority}
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-white mb-2 line-clamp-2 pr-6">
        {card.title}
      </h4>

      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {card.labels.slice(0, 3).map((label, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: `#${label.color || '666'}20`,
                color: `#${label.color || '999'}`,
                border: `1px solid #${label.color || '666'}40`,
              }}
            >
              {label.name}
            </span>
          ))}
          {card.labels.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-gray-500">
              +{card.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Description Preview for Notes */}
      {card.type === CARD_TYPES.NOTE && card.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Footer Meta */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {card.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{new Date(card.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        
        {card.updatedAt && (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}</span>
          </div>
        )}

        {card.assignees && card.assignees.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            {card.assignees.slice(0, 2).map((assignee, idx) => (
              <img
                key={idx}
                src={assignee.avatar_url}
                alt={assignee.login}
                className="w-5 h-5 rounded-full border border-white/10"
                title={assignee.login}
              />
            ))}
            {card.assignees.length > 2 && (
              <span className="text-gray-500">+{card.assignees.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </>
  );
}
