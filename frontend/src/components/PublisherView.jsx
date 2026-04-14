import { useState } from "react";
import ImageCard from "./ImageCard";

export default function PublisherView({ result }) {
  const [decision, setDecision] = useState(null);
  const flaggedCount = result.verdicts?.filter((v) => v.verdict === "flagged").length || 0;
  const totalCount = result.verdicts?.length || 0;

  return (
    <div className="publisher-view">
      {decision === "removed" && (
        <div className="decision-banner decision-removed">
          <span className="decision-icon">⚑</span>
          <span className="decision-text">Marked for removal by human editor — article remains visible to readers pending final review</span>
        </div>
      )}
      {decision === "approved" && (
        <div className="decision-banner decision-approved">
          <span className="decision-icon">✓</span>
          <span className="decision-text">Approved by human editor — article cleared for publication with context notes</span>
        </div>
      )}

      <div className="pub-article-header">
        <div className="pub-meta-row">
          <span className="pub-author">{result.author}</span>
          <span className="pub-meta-sep">—</span>
          <span className="pub-date">{result.date}</span>
        </div>
        <h1 className="pub-headline">{result.headline}</h1>

        <div className="pub-status-row">
          <div className={`status-badge ${result.requires_review ? "status-review" : "status-clear"}`}>
            <span className="status-dot" />
            <span className="status-text">
              {result.requires_review ? "Requires Review" : "Cleared for Publication"}
            </span>
          </div>

          {result.review_reasons?.map((r) => (
            <span key={r} className="reason-chip">
              {r === "ai_generated" ? "AI-Generated Imagery" : "Image Miscontextualization"}
            </span>
          ))}

          <span className="image-count">
            {flaggedCount}/{totalCount} images flagged
          </span>
        </div>
      </div>

      <div className="pub-rule" />

      {result.recommendation && (
        <div className="pub-recommendation">
          <p className="rec-eyebrow">Image Analysis Summary</p>
          <p className="rec-body">{result.recommendation}</p>
        </div>
      )}

      {result.requires_review && (
        <div className="decision-row">
          <p className="decision-label">Publication Decision</p>
          <div className="decision-buttons">
            <button
              className={`decision-btn btn-approve ${decision === "approved" ? "btn-active-approve" : ""}`}
              onClick={() => setDecision(decision === "approved" ? null : "approved")}
            >
              {decision === "approved" ? "✓ Approved" : "Approve with Context"}
            </button>
            <button
              className={`decision-btn btn-remove ${decision === "removed" ? "btn-active-remove" : ""}`}
              onClick={() => setDecision(decision === "removed" ? null : "removed")}
            >
              {decision === "removed" ? "⚑ Marked for Removal" : "Mark for Removal"}
            </button>
          </div>
        </div>
      )}

      <div className="pub-image-grid">
        {result.verdicts?.map((v, i) => (
          <ImageCard key={i} verdict={v} index={i} articleDate={result.date} />
        ))}
      </div>
    </div>
  );
}
