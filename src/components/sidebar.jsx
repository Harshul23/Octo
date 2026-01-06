import React from 'react'
import { GoHomeFill } from "react-icons/go";
import { GoTelescopeFill } from "react-icons/go";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaMedal } from "react-icons/fa6";

const tooltips = ['Home', 'Explore', 'Dashboard', 'Achievements'];

function Sidebar() {
  return (
    <div className='flex flex-col h-full w-12 justify-evenly'>
        {[
          { icon: GoHomeFill, label: 'Home' },
          { icon: GoTelescopeFill, label: 'Explore' },
          { icon: TbLayoutDashboardFilled, label: 'Dashboard' },
          { icon: FaMedal, label: 'Achievements' }
        ].map((item, index) => (
          <div key={index} className='group relative'>
            <button className="icon size-14 rounded-xl bg-white flex justify-center items-center hover:shadow-lg transition">
              <item.icon className={item.label === 'Dashboard' ? 'size-9' : 'size-7'} />
            </button>
            <div className='absolute top-1/2 my-4 translate-y-2/3 hidden group-hover:block bg-neutral-700 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap'>
              {item.label}
              <div className='absolute w-2 h-2 bottom-6 left-6 bg-neutral-700 transform rotate-45'></div>
            </div>
          </div>
        ))}
    </div>
  )
}

export default Sidebar
