import React from 'react';
import { Lightbulb, ChevronRight } from 'lucide-react';

const QuickTips = () => {
  const tips = [
    "Start with 'good first issue' labeled issues",
    "Read CONTRIBUTING.md before starting",
    "Ask questions in issue comments if stuck",
    "Small PRs get reviewed faster!"
  ];

  const [currentTip, setCurrentTip] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="size-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-yellow-400">Pro Tip</h3>
      </div>

      <p className="text-sm text-neutral-300 leading-relaxed min-h-[40px]">
        💡 {tips[currentTip]}
      </p>

      {/* Dots indicator */}
      <div className="flex items-center gap-1. 5 mt-3">
        {tips.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentTip(idx)}
            className={`size-1.5 rounded-full transition-all ${
              idx === currentTip ?  'bg-yellow-400 w-4' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickTips;