export default function SiteFooter() {
  return (
    <footer className="bottombar">
      <div className="bottombar-inner" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}>
        {/* Navy background: BookSwap orange, Store white */}
        <div style={{
          fontSize: '18px',
          fontWeight: 600
        }}>
          <span style={{ color: '#FF5F05' }}>BookSwap</span>
          <span style={{ color: '#FFFFFF' }}> Store</span>
        </div>
        <span className="copyright" style={{ fontSize: '12px', margin: 0 }}>
          Copyright 2025 Team Swapify
        </span>
      </div>
    </footer>
  );
}
