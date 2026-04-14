const DEMOS = [
  { key: "demo_clean", label: "NASA Deep Space Release", sub: "Expected: Clear" },
  { key: "demo_ai", label: "Climate March Coverage", sub: "Expected: AI Flagged" },
  { key: "demo_context", label: "Houston Protest Report", sub: "Expected: Miscontextualized" },
];

const PIPELINE_STEPS = [
  { node: "image_extractor", label: "Extracting article" },
  { node: "ai_detector", label: "AI detection" },
  { node: "provenance_checker", label: "Provenance check" },
  { node: "context_reasoner", label: "Context analysis" },
  { node: "verdict_issuer", label: "Issuing verdicts" },
  { node: "recommendation_generator", label: "Recommendation" },
];

const NODE_ORDER = PIPELINE_STEPS.map((s) => s.node);

export default function Sidebar({ selectedDemo, currentNode, loading, onSelect, isOpen }) {
  const currentIdx = NODE_ORDER.indexOf(currentNode);

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {isOpen && (
        <>
          <p className="sidebar-section-label">Articles</p>
          <div className="demo-list">
            {DEMOS.map((d) => (
              <button
                key={d.key}
                className={`demo-item ${selectedDemo === d.key ? "demo-item-active" : ""}`}
                onClick={() => onSelect(d.key)}
              >
                <span className="demo-number">
                  {String(DEMOS.indexOf(d) + 1).padStart(2, "0")}
                </span>
                <span className="demo-info">
                  <span className="demo-title">{d.label}</span>
                  <span className="demo-sub">{d.sub}</span>
                </span>
              </button>
            ))}
          </div>

          {(loading || currentNode === "done") && (
            <div className="pipeline-wrap">
              <p className="sidebar-section-label" style={{ marginBottom: "0.75rem" }}>Pipeline</p>
              <div className="pipeline">
                {PIPELINE_STEPS.map((step, i) => {
                  const status =
                    currentNode === "done"
                      ? "complete"
                      : i < currentIdx
                      ? "complete"
                      : i === currentIdx
                      ? "active"
                      : "pending";
                  return (
                    <div key={step.node} className={`pipeline-step step-${status}`}>
                      <span className="step-dot">
                        {status === "complete" ? "✓" : status === "active" ? "·" : ""}
                      </span>
                      <span className="step-label">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  );
}
