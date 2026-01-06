import Calendar from './ui/calendar.jsx'
import ActivityTimeline from './activity-timeline.jsx'

const Rightsidebar = () => {
  return (
    <>
        <div className='flex bg-[#0a0a0a] w-[34em] h-full flex-col items-center justify-start rounded-3xl overflow-hidden'>
            <div className='flex flex-col mb-8 justify-start h-full items-center w-full overflow-y-auto'>
                <Calendar />
            </div>
        </div>
    </>
)
}

export default Rightsidebar
