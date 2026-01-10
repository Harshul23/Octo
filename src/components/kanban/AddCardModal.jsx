import { useState } from 'react';
import {
  X,
  Plus,
  CircleDot,
  GitPullRequest,
  FileText,
  Calendar,
  Tag,
  Flag,
} from 'lucide-react';
import { CARD_TYPES, useKanban } from '../../context/KanbanContext';

const cardTypes = [
  { type: CARD_TYPES.NOTE, icon: FileText, label: 'Note', description: 'A quick note or task' },
  { type: CARD_TYPES.ISSUE, icon: CircleDot, label: 'Issue Reference', description: 'Link to GitHub issue' },
  { type: CARD_TYPES.PR, icon: GitPullRequest, label: 'PR Reference', description: 'Link to pull request' },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-400' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-400' },
  { value: 'high', label: 'High', color: 'bg-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-400' },
];

export default function AddCardModal({ isOpen, onClose, columnId }) {
  const { addCard, columns } = useKanban();
  const [cardType, setCardType] = useState(CARD_TYPES.NOTE);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedColumn, setSelectedColumn] = useState(columnId || 'todo');
  const [githubUrl, setGithubUrl] = useState('');
  const [labels, setLabels] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const cardData = {
      type: cardType,
      title: title.trim(),
      description: description.trim(),
      columnId: selectedColumn,
      priority,
      dueDate: dueDate || null,
      labels: labels
        .split(',')
        .map(l => l.trim())
        .filter(Boolean)
        .map(name => ({ name, color: generateLabelColor(name) })),
    };

    // If it's a GitHub reference, try to parse the URL
    if ((cardType === CARD_TYPES.ISSUE || cardType === CARD_TYPES.PR) && githubUrl) {
      const parsed = parseGitHubUrl(githubUrl);
      if (parsed) {
        cardData.url = githubUrl;
        cardData.repo = `${parsed.owner}/${parsed.repo}`;
        cardData.number = parsed.number;
      }
    }

    addCard(cardData);
    handleClose();
  };

  const handleClose = () => {
    setCardType(CARD_TYPES.NOTE);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setGithubUrl('');
    setLabels('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plus size={20} className="text-blue-400" />
            Add New Card
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Card Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Type</label>
            <div className="grid grid-cols-3 gap-3">
              {cardTypes.map(({ type, icon: Icon, label, description }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCardType(type)}
                  className={`
                    p-4 rounded-xl border text-left transition-all
                    ${cardType === type 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                    }
                  `}
                >
                  <Icon size={20} className={cardType === type ? 'text-blue-400' : 'text-gray-400'} />
                  <p className="text-sm font-medium text-white mt-2">{label}</p>
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* GitHub URL (for Issue/PR types) */}
          {(cardType === CARD_TYPES.ISSUE || cardType === CARD_TYPES.PR) && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                GitHub URL (optional)
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/issues/123"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Column & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Column Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Column</label>
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id} className="bg-[#161616]">
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value} className="bg-[#161616]">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Labels Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Calendar size={14} /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              />
            </div>

            {/* Labels */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Tag size={14} /> Labels
              </label>
              <input
                type="text"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                placeholder="bug, feature, docs"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2.5 text-sm font-medium bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function to parse GitHub URL
function parseGitHubUrl(url) {
  const patterns = [
    /github\.com\/([^/]+)\/([^/]+)\/(?:issues|pull)\/(\d+)/,
    /github\.com\/([^/]+)\/([^/]+)\/(?:issues|pulls)\/(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        number: parseInt(match[3], 10),
      };
    }
  }
  return null;
}

// Generate consistent color for label
function generateLabelColor(name) {
  const colors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899', '06b6d4', '84cc16'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
