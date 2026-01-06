import Sidebar from "./sidebar.jsx"
import Main from "./main.jsx"

const Homepage = () => {
  return (
    <div className="h-9/10 w-full flex gap-8 px-5">
        <Sidebar />
        <Main />
    </div>

  )
}

export default Homepage     