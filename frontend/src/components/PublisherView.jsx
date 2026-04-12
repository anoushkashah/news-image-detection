import ImageCard from "./ImageCard";

export default function PublisherView({ result }) {
  const flaggedCount = result.verdicts?.filter((v) => v.verdict === "flagged").length || 0;
  const totalCount = result.verdicts?.length || 0;

  return (
    <div className="publisher-view">
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
          <p className="rec-eyebrow">Editorial Analysis</p>
          <p className="rec-body">{result.recommendation}</p>
        </div>
      )}

      <div className="pub-image-grid">
        {result.verdicts?.map((v, i) => (
          <ImageCard key={i} verdict={v} index={i} />
        ))}
      </div>
    </div>
  );
}
