export default function SiteFooter() {
  return (
    <footer className="bottombar">
      <div className="bottombar-inner" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span className="brand">
          <span className="brand-strong">BookSwap</span>{" "}
          <span className="brand-soft">Store</span>
        </span>
        <span className="copyright">Copyright 2025 Team Swapify</span>
      </div>
    </footer>
  );
}
