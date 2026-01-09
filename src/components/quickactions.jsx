import React from 'react';
import { Plus, Search, GitPullRequest, Bell, Zap } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    { 
      icon:  Zap, 
      label: 'Find Issue', 
      color: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30',
      onClick: () => console.log('Find new issue')
    },
    { 
      icon: Plus, 
      label: 'New PR', 
      color: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30',
      onClick: () => console.log('Create PR')
    },
    { 
      icon: Search, 
      label: 'Explore', 
      color: 'bg-blue-500/20 text-blue-400 hover: bg-blue-500/30',
      onClick: () => console.log('Explore repos')
    },
    { 
      icon: Bell, 
      label: 'Alerts', 
      color: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30',
      onClick: () => console.log('View alerts')
    }
  ];

  return (
    <div className="w-full p-4 rounded-2xl bg-[#161616] border border-white/5">
      <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex items-center gap-2 px-3 py-2. 5 rounded-xl transition-all duration-200 ${action.color}`}
          >
            <action.icon className="size-4" />
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;