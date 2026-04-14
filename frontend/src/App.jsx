import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PublisherView from "./components/PublisherView";
import ConsumerView from "./components/ConsumerView";
import { useVerify } from "./hooks/useVerify";

function VerifyMark({ bgColor }) {
  return (
    <svg className="empty-logo" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,10 24,10 40,58 16,58" fill="#e8e8e4"/>
      <polygon points="70,10 56,10 40,58 64,58" fill="#e8e8e4"/>
      <circle cx="40" cy="48" r="12" fill={bgColor} stroke="#c0392b" stroke-width="1.5"/>
      <line x1="40" y1="39" x2="40" y2="43" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="40" y1="53" x2="40" y2="57" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="31" y1="48" x2="35" y2="48" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="45" y1="48" x2="49" y2="48" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="40" cy="48" r="3" fill="#c0392b"/>
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState("publisher");
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { loading, currentNode, result, error, analyze } = useVerify();

  function handleSelect(key) {
    setSelectedDemo(key);
    analyze(key);
  }

  const bgColor = view === "consumer" ? "#f5f3ee" : "#0e0e0e";

  return (
    <div className={`app ${view === "consumer" ? "app-consumer" : "app-publisher"}`}>
      <Header view={view} onViewChange={setView} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="app-body">
        <Sidebar
          selectedDemo={selectedDemo}
          currentNode={currentNode}
          loading={loading}
          onSelect={handleSelect}
          isOpen={sidebarOpen}
        />

        <main className="main-content">
          {!selectedDemo && !loading && !result && (
            <div className="empty-state">
              <VerifyMark bgColor={bgColor} />
              <p className="empty-title">Select an article to analyze</p>
              <p className="empty-body">
                Verify runs each image through AI detection, provenance search,
                and contextual alignment analysis.
              </p>
            </div>
          )}

          {loading && !result && (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p className="loading-node">
                {currentNode?.replace(/_/g, " ")}
              </p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p className="error-mark">×</p>
              <p className="error-text">{error}</p>
            </div>
          )}

          {result && !loading && (
            <>
              {view === "publisher" && <PublisherView result={result} />}
              {view === "consumer" && <ConsumerView result={result} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
