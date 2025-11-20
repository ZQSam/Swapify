import { User, LogIn, LogOut } from 'lucide-react';

export default function SiteHeader({
  onLoginClick,
  onRegisterClick,
  isLoggedIn,
  onLogout,
}: {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="/">
          <span className="brand-strong">BookSwap</span>{" "}
          <span className="brand-soft" style={{ color: 'var(--color-navy)' }}>Store</span>
        </a>

        <nav className="nav">
          {isLoggedIn ? (
            <>
              <a className="nav-item" href="#">
                <User size={18} className="nav-ico" /> Profile
              </a>
              <button
                className="nav-item"
                onClick={onLogout}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0",
                }}
              >
                <LogOut size={18} className="nav-ico" /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-item"
                onClick={onLoginClick}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0",
                }}
              >
                <LogIn size={18} className="nav-ico" /> Login
              </button>
              <button
                className="nav-item"
                onClick={onRegisterClick}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0",
                }}
              >
                <User size={18} className="nav-ico" /> Register
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
