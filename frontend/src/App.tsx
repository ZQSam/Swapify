import "./App.css";
import "./styles/auth.css";
import { useState } from "react";
import RegisterWizard from "./pages/RegisterWizard";
import LoginPage from "./pages/LoginPage";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

type Page = "login" | "register" | "home";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [session, setSession] = useState<string | null>(
    localStorage.getItem("session")
  );

  const handleLoginSuccess = (sessionToken: string) => {
    setSession(sessionToken);
    setCurrentPage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("session");
    setSession(null);
    setCurrentPage("login");
  };

  const navigateToLogin = () => setCurrentPage("login");
  const navigateToRegister = () => setCurrentPage("register");

  return (
    <>
      <SiteHeader
        onLoginClick={navigateToLogin}
        onRegisterClick={navigateToRegister}
        isLoggedIn={!!session}
        onLogout={handleLogout}
      />

      {!session && currentPage === "login" && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={navigateToRegister}
        />
      )}

      {!session && currentPage === "register" && (
        <RegisterWizard onRegistrationComplete={navigateToLogin} />
      )}

      {session && (
        <div
          style={{ marginTop: "56px", marginBottom: "56px", padding: "20px" }}
        >
          <h1>Welcome back!</h1>
          <p>You are logged in.</p>
          <button onClick={handleLogout} className="btn btn-primary">
            Logout
          </button>
        </div>
      )}

      <SiteFooter />
    </>
  );
}
