import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ArrowUpRight, 
  Terminal, 
  ShieldCheck, 
  MessageSquareCode,
  Sparkles
} from 'lucide-react';
import { LuArrowUpRight } from "react-icons/lu";

const MainMissionContainer = () => {
  // Dummy data based on your workflow logic
  const steps = [
    { id: 1, text: "Rename variables in 'themeContext.js' to camelCase", status: "done" },
    { id: 2, text: "Add a null check for the '.env' loader logic", status: "current" },
    { id: 3, text: "Run 'npm test' to verify local consistency", status: "pending" },
  ];

  return (
    <div className='h-96 w-full my-2 rounded-3xl bg-[#161616] border border-white/5 shadow-2xl overflow-hidden flex flex-col'>
      
      {/* 1. Header Area: Identity & Status */}
      <div className='px-4 py-3 border-b border-white/5 flex justify-between items-center'>
        <div className='flex items-center gap-5'>
          <div className='p-3 bg-black rounded-xl border-2 border-neutral-500'>
            <Terminal className='text-white size-6' />
          </div>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-3'>
              <span className='text-stone-500 text-[10px] font-black uppercase tracking-widest'>Current Mission</span>
              <span className='px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20'>
                CHANGES REQUESTED
              </span>
            </div>
            <h1 className='text-2xl font-medium text-white'>#4307 :  Set Default Theme Logic</h1>
            <div className='flex gap-1 items-center'>
                <div className='h-5 w-5 mr-2 rounded-full bg-neutral-400'></div>
                <span className='text-xs text-neutral-400'>shadcn/ui - by Harshul23</span>
            </div>
          </div>
        </div>
        <button className='px-3 py-2 w-24 text-xm flex items-center justify-evenly rounded-full bg-white transition-colors border text-black border-white/10 group'>
            <p>View</p>
        <LuArrowUpRight className='size-4' />
        </button>
      </div>

      {/* 2. Content Body: Split Layout */}
      <div className='flex-1 flex px-2 py-2 h-full gap-8 overflow-hidden'>
        
        {/* Left Side: Octo's AI Insight */}
        <div className='w-1/2 h-full flex flex-col justify-between'>
          <div className='relative p-5 rounded-2xl bg-black border border-white/5 scroll-auto overflow-y-auto custom-scrollbar flex-1 h-full'>
            <div className='flex items-center gap-2 mb-3'>
              <Sparkles className='text-neutral-300 size-4' />
              <span className='text-white text-2xl font-medium tracking-tighter'>Octo Status</span>
            </div>
            <p className='text-stone-300 text-lg leading-relaxed font-medium italic'>
              "The maintainer liked your logic but wants the code to be 'cleaner'. Basically, just make sure our variable names match their style and add a safety check so the app doesn't crash!"
            </p>

          </div>
        </div>

        {/* Right Side: The "Roadmap" (Steps to take) */}
        <div className='w-1/2 flex flex-col'>
          <h3 className='text-stone-500 text-[10px] font-black uppercase tracking-widest mb-4'>Steps to Resolve</h3>
          <div className='space-y-3 overflow-y-auto pr-2 custom-scrollbar'>
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  step.status === 'current' 
                    ? 'bg-white/5 border-neutral-700 border-2' 
                    : 'bg-transparent border-neutral-700 border-2 opacity-60'
                }`}
              >
                {step.status === 'done' ? (
                  <CheckCircle2 className='text-emerald-400 size-5 mt-0.5 shrink-0' />
                ) : (
                  <Circle className={`${step.status === 'current' ? 'text-white' : 'text-stone-600'} size-5 mt-0.5 shrink-0`} />
                )}
                <p className={`text-sm font-bold ${step.status === 'current' ? 'text-white' : 'text-stone-400'}`}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Bottom Footer: AI Context Tracking */}
      <div className='px-6 py-3 bg-black/20 flex justify-between items-center'>
        <div className='flex gap-4 text-[10px] font-medium text-stone-400'>
          <span className='uppercase'>Agent: Copilot-v2</span>
          <span className='text-stone-500'>|</span>
          <p><span className='uppercase'>Complexity : </span> Normal</p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='h-1.5 w-24 bg-white/5 rounded-full overflow-hidden'>
            <div className='h-full bg-neutral-200 w-2/3'></div>
          </div>
          <span className='text-xs font-bold text-neutral-400 uppercase'>66% Completed</span>
        </div>
      </div>
    </div>
  );
};

export default MainMissionContainer;