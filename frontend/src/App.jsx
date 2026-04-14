import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PublisherView from "./components/PublisherView";
import ConsumerView from "./components/ConsumerView";
import { useVerify } from "./hooks/useVerify";

export default function App() {
  const [view, setView] = useState("publisher");
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { loading, currentNode, result, error, analyze } = useVerify();

  function handleSelect(key) {
    setSelectedDemo(key);
    analyze(key);
  }

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
              <svg className="empty-logo" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <polygon points="8,10 22,10 40,55 18,55" fill="#e8e8e4"/>
                <polygon points="58,10 72,10 40,55 18,55" fill="#e8e8e4"/>
                <circle cx="40" cy="47" r="10" fill="#0e0e0e" stroke="#c0392b" stroke-width="1.2"/>
                <line x1="40" y1="40" x2="40" y2="43" stroke="#c0392b" stroke-width="1.2" stroke-linecap="round"/>
                <line x1="40" y1="51" x2="40" y2="54" stroke="#c0392b" stroke-width="1.2" stroke-linecap="round"/>
                <line x1="33" y1="47" x2="36" y2="47" stroke="#c0392b" stroke-width="1.2" stroke-linecap="round"/>
                <line x1="44" y1="47" x2="47" y2="47" stroke="#c0392b" stroke-width="1.2" stroke-linecap="round"/>
                <circle cx="40" cy="47" r="2" fill="#c0392b"/>
              </svg>
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
