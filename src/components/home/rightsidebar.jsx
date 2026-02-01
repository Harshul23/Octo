import StreakCalendar from "./streak-calender.jsx";
import QuickStats from "./quickstats.jsx";

const Rightsidebar = () => {
  return (
    <div className="flex bg-[#0a0a0a] w-2/5 h-full flex-col items-center justify-start rounded-2xl overflow-hidden shrink-0">
      <div className="flex flex-col h-full items-center w-full overflow-y-auto custom-scrollbar p-2 gap-3">
        <StreakCalendar />
        <QuickStats />
      </div>
    </div>
  );
};

export default Rightsidebar;
