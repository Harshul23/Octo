import Sidebar from "../sidebar.jsx";
import Main from "./main.jsx";

const Homepage = () => {
  return (
    <div className="h-full w-full flex gap-4 px-4 py-4 overflow-hidden">
      <Sidebar />
      <Main />
    </div>
  );
};

export default Homepage;
