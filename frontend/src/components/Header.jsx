export default function Header({ view, onViewChange, sidebarOpen, onToggleSidebar }) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar} title="Toggle sidebar">
          <span className={`toggle-bar ${sidebarOpen ? "" : "bar-closed"}`} />
          <span className={`toggle-bar ${sidebarOpen ? "" : "bar-closed"}`} />
          <span className={`toggle-bar ${sidebarOpen ? "" : "bar-closed"}`} />
        </button>
        <div className="logo">
          <svg className="logo-v-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <polygon points="8,10 22,10 40,55 18,55" fill="#e8e8e4"/>
            <polygon points="58,10 72,10 40,55 18,55" fill="#e8e8e4"/>
            <circle cx="40" cy="47" r="10" fill="#0e0e0e" stroke="#c0392b" stroke-width="1.2"/>
            <line x1="40" y1="40" x2="40" y2="43" stroke="#c0392b" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="40" y1="51" x2="40" y2="54" stroke="#c0392b" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="33" y1="47" x2="36" y2="47" stroke="#c0392b" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="44" y1="47" x2="47" y2="47" stroke="#c0392b" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="40" cy="47" r="2" fill="#c0392b"/>
          </svg>
          <span className="logo-erify">ERIFY</span>
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
