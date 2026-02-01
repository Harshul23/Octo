import Middle from "./middle.jsx";
import RightSidebar from "./rightsidebar.jsx";

const Main = () => {
  return (
    <div className="flex justify-between items-start h-full w-full gap-4 overflow-hidden">
      <Middle />
      <RightSidebar />
    </div>
  );
};

export default Main;
