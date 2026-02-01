import React from "react";
import { Sparkles, TrendingUp } from "lucide-react";

const SkillsCard = () => {
  // Detected from your PR history
  const skills = [
    { name: "React", level: 85, trending: true },
    { name: "Tailwind CSS", level: 90, trending: true },
    { name: "JavaScript", level: 80, trending: false },
    { name: "TypeScript", level: 45, trending: true },
    { name: "CSS", level: 75, trending: false },
    { name: "Python", level: 30, trending: false },
  ];

  return (
    <div className="p-3 rounded-xl bg-[#161616] border border-white/5 shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-white">Your Skills</h3>
        <span className="text-xs text-neutral-600">(from PRs)</span>
      </div>

      {/* Skills List */}
      <div className="space-y-2">
        {skills.map((skill, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-300">{skill.name}</span>
                {skill.trending && (
                  <TrendingUp className="size-3 text-emerald-400" />
                )}
              </div>
              <span className="text-xs text-neutral-500">{skill.level}%</span>
            </div>
            <div className="h-1. 5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <p className="text-[10px] text-neutral-600 mt-3">
        Skills are detected automatically from your merged PRs
      </p>
    </div>
  );
};

export default SkillsCard;
