import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PublisherView from "./components/PublisherView";
import ConsumerView from "./components/ConsumerView";
import { useVerify } from "./hooks/useVerify";

export default function App() {
  const [view, setView] = useState("publisher");
  const [selectedDemo, setSelectedDemo] = useState(null);
  const { loading, currentNode, result, error, analyze } = useVerify();

  function handleSelect(key) {
    setSelectedDemo(key);
    analyze(key);
  }

  return (
    <div className={`app ${view === "consumer" ? "app-consumer" : "app-publisher"}`}>
      <Header view={view} onViewChange={setView} />

      <div className="app-body">
        <Sidebar
          selectedDemo={selectedDemo}
          currentNode={currentNode}
          loading={loading}
          onSelect={handleSelect}
        />

        <main className="main-content">
          {!selectedDemo && !loading && !result && (
            <div className="empty-state">
              <p className="empty-mark">◈</p>
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
