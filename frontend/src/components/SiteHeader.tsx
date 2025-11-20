import { Search, List, MessageSquare, LogIn, UserPlus, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SiteHeader() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <div className="topbar-inner">
        <nav className="nav" style={{ width: '100%', justifyContent: 'space-between' }}>
          {/* Logo on left - Orange background: BookSwap white, Store navy */}
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: 600
          }}>
            <span style={{ color: '#FFFFFF' }}>BookSwap</span>
            <span style={{ color: '#13294B' }}>&nbsp;Store</span>
          </Link>

          {/* All navigation on right */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link className="nav-item" to="/">
              <Search size={18} className="nav-ico" /> Find a Book
            </Link>

            {isAuthenticated ? (
              <>
                <Link className="nav-item" to="/my-books">
                  <List size={18} className="nav-ico" /> My Listings
                </Link>
                <Link className="nav-item" to="/messages">
                  <MessageSquare size={18} className="nav-ico" /> Messages
                </Link>

                <div className="nav-item" style={{
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => {
                  const menu = document.getElementById('user-menu');
                  if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                }}>
                  <User size={18} className="nav-ico" /> {user?.nickname}

                  <div id="user-menu" style={{
                    display: 'none',
                    position: 'absolute',
                    top: '40px',
                    right: '0',
                    background: '#fff',
                    border: '1px solid var(--color-gray-100)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-card)',
                    minWidth: '150px'
                  }}>
                    <Link to="/profile" style={{
                      display: 'block',
                      padding: '12px 16px',
                      color: 'var(--color-gray-900)',
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                    onClick={() => {
                      const menu = document.getElementById('user-menu');
                      if (menu) menu.style.display = 'none';
                    }}>
                      Profile
                    </Link>
                    <button onClick={handleLogout} style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      color: 'var(--color-gray-900)',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link className="nav-item" to="/login">
                  <LogIn size={18} className="nav-ico" /> Login
                </Link>
                <Link className="nav-item" to="/register">
                  <UserPlus size={18} className="nav-ico" /> Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
