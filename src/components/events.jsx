import React from 'react';
import { BsArrowUpRightCircleFill } from 'react-icons/bs';
import { FiCalendar, FiClock } from 'react-icons/fi';

const UpcomingEvents = () => {
  return (
    <div className='h-58 w-2/3 my-3 flex rounded-3xl px-6 py-5 bg-[#161616] justify-between group hover:bg-[#2d2d32] transition-all duration-300 border border-white/5 shadow-2xl'>
      
      {/* Left Section: Info & Content */}
      <div className='flex flex-col justify-between h-full py-1'>
        <div>
          <div className='flex items-center gap-2 mb-2'>
            <span className='flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse'></span>
            <span className='text-stone-400 text-[10px] font-bold uppercase tracking-widest'>
              Last Updated • 10 MIN AGO
            </span>
          </div>
          
          <h1 className='text-3xl font-black text-white italic uppercase tracking-tighter mb-1'>
            Upcoming Events
          </h1>
          
          <div className='flex items-center gap-3'>
            <p className='text-xl font-bold text-emerald-300'>LFX - Linux Foundation</p>
            <span className='bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold'>
              OPEN SOON
            </span>
          </div>
        </div>

        {/* Bottom Metadata: Simplified for 1st Year student */}
        <div className='flex gap-6 items-end w-full'>
          <div className='flex flex-col w-1/3'>
            <span className='text-stone-400 text-xs font-medium uppercase mb-1'>Date</span>
            <div className='flex items-center gap-2 text-stone-200 text-sm font-medium'>
              <FiCalendar className='text-white size-9' />
              <span>Jan 26, 2026</span>
            </div>
          </div>
          
          <div className='flex flex-col w-2/3'>
            <span className='text-stone-400 text-xs font-medium uppercase mb-1'>Octo Advice</span>
            <div className='flex items-center gap-2 text-stone-200 text-sm font-medium'>
              <FiClock className='text-white size-9' />
              <span>Perfect time to start 5 minor PRs for eligibility.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Action & Icon */}
      <div className='flex flex-col justify-between items-end h-full'>
        <BsArrowUpRightCircleFill className='size-9 text-white group-hover:scale-110 transition-transform cursor-pointer' />
      </div>

    </div>
  );
};

export default UpcomingEvents;