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
          <span className="brand-soft">Store</span>
        </a>

        <nav className="nav">
          {isLoggedIn ? (
            <>
              <a className="nav-item" href="#">
                <span className="nav-ico">�</span> Profile
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
                <span className="nav-ico">🚪</span> Logout
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
                <span className="nav-ico">➡️</span> Login
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
                <span className="nav-ico">👤</span> Register
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
