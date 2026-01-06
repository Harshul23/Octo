import React, { useState } from 'react';
import { Check, X, Terminal, Zap, Trophy, Search } from 'lucide-react';

const OctoDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const missions = [
    { 
      id: 0, 
      title: "Fix: Default Theme Env", 
      tag: "Critical", 
      color: "bg-pink-400", 
      text: "text-pink-900",
      summary: "Maintainer wants to ensure the app doesn't crash if .env is missing. I've drafted a fix for line 42."
    },
    { 
      id: 1, 
      title: "Bug: Mobile Login UI", 
      tag: "High", 
      color: "bg-yellow-400", 
      text: "text-yellow-900",
      summary: "The login button is currently overlapping the footer on iPhone 13 screens. Need to adjust media queries."
    },
    { 
      id: 2, 
      title: "Docs: Setup Guide", 
      tag: "Stable", 
      color: "bg-blue-400", 
      text: "text-blue-900",
      summary: "Adding a 'Quick Start' section for first-year students to get the project running in under 5 minutes."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F7] p-8 font-sans text-slate-900">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Good Morning, Developer</h1>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-slate-100">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Ask Octo..." className="bg-transparent outline-none text-sm w-64" />
          </div>
        </div>
      </div>

      {/* The Connected Component Section */}
      <div className="flex flex-col lg:flex-row gap-0 items-start">
        
        {/* Left Side: The Mission List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-1 z-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 px-4">Active Missions</h2>
          {missions.map((mission, index) => (
            <button
              key={mission.id}
              onClick={() => setActiveTab(index)}
              className={`relative flex flex-col p-5 transition-all duration-300 group
                ${activeTab === index 
                  ? `${mission.color} rounded-l-3xl shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.1)]` 
                  : 'bg-transparent hover:bg-slate-100 rounded-xl mx-2'
                }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className={`text-xs font-bold px-2 py-1 rounded-md mb-2 ${activeTab === index ? 'bg-white/40' : 'bg-slate-200'}`}>
                  #{4300 + mission.id}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === index ? 'opacity-60' : 'text-slate-400'}`}>
                  {mission.tag}
                </span>
              </div>
              <h3 className={`font-bold text-lg ${activeTab === index ? mission.text : 'text-slate-700'}`}>
                {mission.title}
              </h3>

              {/* THE MAGIC CURVE: Only visible on Active Tab (Desktop) */}
              {activeTab === index && (
                <>
                  {/* Top Curve */}
                  <div className={`absolute -top-6 right-0 w-6 h-6 hidden lg:block`}>
                    <div className={`w-full h-full rounded-full shadow-[10px_10px_0_0] shadow-${mission.color.split('-')[1]}-${mission.color.split('-')[2]}`} 
                         style={{ boxShadow: `10px 10px 0 0 ${getHexColor(mission.color)}` }}></div>
                  </div>
                  {/* Bottom Curve */}
                  <div className={`absolute -bottom-6 right-0 w-6 h-6 hidden lg:block`}>
                    <div className={`w-full h-full rounded-full shadow-[10px_-10px_0_0] shadow-${mission.color.split('-')[1]}-${mission.color.split('-')[2]}`}
                         style={{ boxShadow: `10px -10px 0 0 ${getHexColor(mission.color)}` }}></div>
                  </div>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Right Side: The Detail Panel */}
        <div className={`w-full lg:w-2/3 min-h-[450px] rounded-3xl lg:rounded-tl-none p-10 transition-colors duration-500 shadow-xl
          ${missions[activeTab].color} ${missions[activeTab].text}`}>
          
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/30 rounded-2xl">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-60">Octo Simplified Logic</p>
                <h2 className="text-3xl font-black italic uppercase">Mission Details</h2>
              </div>
            </div>

            <p className="text-xl leading-relaxed font-medium mb-8 bg-white/20 p-6 rounded-3xl border border-white/20">
              "{missions[activeTab].summary}"
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 bg-slate-900 text-white p-4 rounded-2xl font-bold hover:scale-105 transition-transform">
                <Terminal size={18} /> Generate AI Fix
              </button>
              <button className="flex items-center justify-center gap-2 bg-white/40 p-4 rounded-2xl font-bold hover:bg-white/60 transition-colors">
                <X size={18} /> Ignore Mission
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to get hex for the inline-style shadow fallback
const getHexColor = (twClass) => {
  if (twClass.includes('pink-400')) return '#f472b6';
  if (twClass.includes('yellow-400')) return '#facc15';
  if (twClass.includes('blue-400')) return '#60a5fa';
  return '#ffffff';
};

export default OctoDashboard;