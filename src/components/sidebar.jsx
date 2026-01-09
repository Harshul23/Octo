import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GoHomeFill } from "react-icons/go";
import { GoTelescopeFill } from "react-icons/go";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaMedal } from "react-icons/fa6";

const navItems = [
  { icon: GoHomeFill, label: 'Home', path: '/' },
  { icon: GoTelescopeFill, label: 'Explore', path: '/explore' },
  { icon: TbLayoutDashboardFilled, label: 'Dashboard', path: '/dashboard' },
  { icon: FaMedal, label: 'Achievements', path: '/achievements' }
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className='flex flex-col h-full w-12 justify-evenly'>
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <div key={index} className='group relative'>
              <button 
                onClick={() => navigate(item.path)}
                className={`icon size-14 rounded-xl flex justify-center items-center hover:shadow-lg transition ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
              >
                <item.icon className={item.label === 'Dashboard' ? 'size-9' : 'size-7'} />
              </button>
              <div className='absolute top-1/2 my-4 translate-y-2/3 hidden group-hover:block bg-neutral-700 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap'>
                {item.label}
                <div className='absolute w-2 h-2 bottom-6 left-6 bg-neutral-700 transform rotate-45'></div>
              </div>
            </div>
          );
        })}
    </div>
  )
}

export default Sidebar
