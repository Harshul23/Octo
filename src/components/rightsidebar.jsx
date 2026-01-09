import StreakCalendar from "./streak-calender.jsx"
import QuickStats from "./quickstats.jsx"

const Rightsidebar = () => {
  return (
    <>
        <div className='flex bg-[#0a0a0a] w-3/6 h-full flex-col items-center justify-start rounded-3xl overflow-hidden'>
            <div className='flex flex-col mb-8 justify-centre h-full items-center w-full overflow-y-auto'>
                <StreakCalendar />
                <QuickStats />
            </div>
        </div>
    </>
)
}

export default Rightsidebar
