import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/navbar.jsx";
import Homepage from "./components/home/homepage.jsx";
import LoginForm from "./components/login-form.jsx";
import ExplorePage from "./components/explore/ExplorePage.jsx";
import { KanbanPage } from "./components/kanban";
import { AchievementsPage } from "./components/achievements";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="box-border bg-[#0a0a0a] h-screen w-full flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="box-border bg-[#0a0a0a] h-screen w-full flex items-center justify-center">
        <div className="max-w-md w-full px-6">
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="box-border bg-[#0a0a0a] h-screen w-full flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/dashboard" element={<KanbanPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Analytics />
    </AuthProvider>
  );
};

export default App;
