import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PublisherView from "./components/PublisherView";
import ConsumerView from "./components/ConsumerView";
import VerifyMark from "./components/VerifyMark";
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
              <VerifyMark size={200} bgColor={bgColor} />
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
