import React from 'react'
import { BsArrowUpRightCircleFill } from "react-icons/bs";
import UpcomingEvents from './events.jsx';
import MainMissionContainer from './octo-update.jsx';
import GitHubHeatmap from './github-heatmap.jsx';
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
     <div className='text-white h-full w-4/5 rounded-4xl flex justify-start items-start flex-col'>

      <div className='flex flex-col my-3'>
        <h1 className="text-5xl font-black leading-normal">
          {getGreeting()}, {userName}
        </h1>
        <p className='text-lg text-neutral-400'>
          Intelly wishes you a good and productive day. {user?.public_repos || 0} public repositories are in your profile.
        </p>
      </div>
     <MainMissionContainer />

    </div>
  )
}

export default Middle
