import Navbar from "./components/navbar.jsx"
import Homepage from "./components/homepage.jsx"
import LoginForm from "./components/login-form.jsx"
import { AuthProvider, useAuth } from "./context/AuthContext.jsx"

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
    <div className="box-border bg-[#0a0a0a] h-screen w-full">
      <Navbar />
      <Homepage />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App