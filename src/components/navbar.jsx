import { Command, Bell, LogOut } from "lucide-react";
import Octo from "../assets/Octo.png";
import { useAuth } from "@/context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-[#0a0a0a] w-full h-16 shrink-0 text-white flex justify-between items-center px-4 py-3 box-border border-b border-white/5">
      <div className="flex gap-6 items-center">
        <div className="logo h-12 w-12 rounded-full bg-white">
          <img src={Octo} alt="logo" />
        </div>
        <h1 className="text-4xl font-bold">Octo</h1>
      </div>
      <div className="">
        <input
          type="text"
          className="bg-[#262626] border-2 border-[#707070] rounded-3xl h-11 w-[34em] px-6 py-3"
          placeholder="Ask Octo"
        />
      </div>
      <div className="flex justify-around items-center">
        <div className="relative right-[17em] flex items-center gap-1 bg-neutral-700 px-2 text-xm py-1 rounded-lg">
          <Command className="size-3" /> <h1 className="text-xs">K</h1>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Bell size={25} strokeWidth={2.25} />
        {user && (
          <>
            <div className="group relative">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="h-12 w-12 rounded-full border-2 border-neutral-700 hover:border-blue-500 transition-all cursor-pointer"
                title={`@${user.login}`}
              />
              <div className="absolute right-0 top-14 hidden group-hover:block bg-neutral-800 border border-neutral-700 rounded-lg p-4 shadow-xl min-w-[200px] z-50">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-neutral-700">
                  <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm">
                      {user.name || user.login}
                    </p>
                    <p className="text-xs text-gray-400">@{user.login}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
        {!user && <div className="h-12 w-12 rounded-full bg-neutral-500"></div>}
      </div>
    </div>
  );
}

export default Navbar;
