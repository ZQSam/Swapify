import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div style={{
      paddingTop: 'var(--topbar-h)',
      paddingBottom: 'var(--bottombar-h)',
      minHeight: '100vh'
    }}>
      <div style={{
        padding: '32px 24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: 'var(--font-header)',
          fontWeight: 'var(--font-weight-bold)',
          marginBottom: '16px'
        }}>
          {isAuthenticated ? `Welcome back, ${user?.nickname}!` : 'Find Your Textbooks'}
        </h1>
        <p style={{
          fontSize: 'var(--font-body)',
          color: 'var(--color-gray-300)',
          marginTop: '24px'
        }}>
          {isAuthenticated
            ? 'Browse available textbooks or list your own.'
            : 'Browse available textbooks. Sign in to purchase or list your own.'}
        </p>
        <p style={{
          fontSize: 'var(--font-body)',
          color: 'var(--color-gray-300)',
          marginTop: '80px'
        }}>
          Book marketplace features coming soon...
        </p>
      </div>
    </div>
  );
}
