import { useState, useEffect } from 'react';
import { Search, List, MessageSquare, LogIn, UserPlus, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageAPI } from '../lib/api';

export default function SiteHeader() {
  const { isAuthenticated, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for unread message count
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const data = await MessageAPI.getUnreadCount();
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <header className="topbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <div className="topbar-inner">
        <nav className="nav" style={{ width: '100%', justifyContent: 'space-between' }}>
          
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

          
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link className="nav-item" to="/">
              <Search size={18} className="nav-ico" /> Find a Book
            </Link>

            {isAuthenticated ? (
              <>
                <Link className="nav-item" to="/my-books">
                  <List size={18} className="nav-ico" /> My Listings
                </Link>
                <Link className="nav-item" to="/messages" style={{ position: 'relative' }}>
                  <MessageSquare size={18} className="nav-ico" /> Messages
                  {unreadCount > 0 && (
                    <span style={{
                      marginLeft: '4px',
                      padding: '2px 8px',
                      backgroundColor: '#FF5F05',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderRadius: '10px'
                    }}>
                      ({unreadCount})
                    </span>
                  )}
                </Link>

                <Link className="nav-item" to={`/users/${user?.id}`}>
                  <User size={18} className="nav-ico" /> {user?.nickname}
                </Link>
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
