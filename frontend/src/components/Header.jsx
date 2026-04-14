export default function Header({ view, onViewChange, sidebarOpen, onToggleSidebar }) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar} title="Toggle sidebar">
          <span className="toggle-bar" />
          <span className="toggle-bar" />
          <span className="toggle-bar" />
        </button>
        <div className="logo">
          <span className="logo-wordmark">VERIFY</span>
        </div>
        <span className="header-rule" />
        <span className="header-sub">Image Integrity System</span>
      </div>
      <div className="view-toggle">
        <button
          className={`toggle-btn ${view === "publisher" ? "toggle-active-pub" : ""}`}
          onClick={() => onViewChange("publisher")}
        >
          Publisher
        </button>
        <span className="toggle-divider" />
        <button
          className={`toggle-btn ${view === "consumer" ? "toggle-active-con" : ""}`}
          onClick={() => onViewChange("consumer")}
        >
          Reader
        </button>
      </div>
    </header>
  );
}
