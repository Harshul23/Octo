import React from 'react'
import { BsArrowUpRightCircleFill } from "react-icons/bs";
import UpcomingEvents from './events.jsx';
import MainMissionContainer from './octo-update.jsx';
import { useAuth } from '@/context/AuthContext';

const Middle = () => {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.name?.split(' ')[0] || user?.login || 'User';

  return (
     <div className='text-white h-full w-3/5 rounded-4xl flex justify-start items-start flex-col'>

      <div className='flex flex-col my-3'>
        <h1 className="text-5xl font-black leading-normal">
          {getGreeting()}, {userName}
        </h1>
        <p className='text-lg text-neutral-400'>
          Intelly wishes you a good and productive day. {user?.public_repos || 0} public repositories are in your profile.
        </p>
      </div>
     <MainMissionContainer />

      <div className='flex justify-between w-full gap-4'>

        <div className='h-58 w-2/5 my-3 flex rounded-2xl px-4 py-1 bg-[#161616] group hover:bg-[#2d2d32] transition-all duration-300 border border-white/5 shadow-2xl'>
          <div>
           <div className='flex items-center gap-2'>
              <span className='text-stone-400 text-[0.6em] my-1 font-bold uppercase tracking-widest'>
                GitHub Profile
              </span>
            </div>
            <h1 className='text-6xl md:text-8xl font-black text-white'>
              {user?.public_repos || 0}
            </h1>
            <p className='text-white font-bold text-[clamp(0.5rem,2vw,2rem)]'>Public Repos</p>
            <p className='text-[clamp(0.5rem,5vw,0.82rem)] font-medium text-neutral-300 py-1'>
              {user?.followers || 0} followers · {user?.following || 0} following
            </p>
          </div>
          <div>
            <BsArrowUpRightCircleFill className='size-9 my-2 group-hover:scale-110' />
          </div>
          
        </div>

        <UpcomingEvents />

      </div>

    </div>
  )
}

export default Middle
