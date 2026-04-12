export default function ImageCard({ verdict, index }) {
  const isFlagged = verdict.verdict === "flagged";
  const scorePercent = Math.round((verdict.ai_score || 0) * 100);

  const scoreColor =
    verdict.ai_score > 0.85
      ? "#c0392b"
      : verdict.ai_score > 0.4
      ? "#d4a017"
      : "#4a7c5f";

  return (
    <div className={`image-card ${isFlagged ? "image-card-flagged" : "image-card-clean"}`}>
      <div className="card-image-wrap">
        <img
          src={verdict.image_url}
          alt=""
          className="card-image"
          loading="lazy"
        />
        <div className="card-overlay-top">
          <span className={`verdict-pill ${isFlagged ? "pill-flagged" : "pill-clean"}`}>
            {isFlagged ? "FLAGGED" : "CLEAN"}
          </span>
          {verdict.is_ai_generated && (
            <span className="ai-pill">AI</span>
          )}
        </div>
        <span className="card-index">0{index + 1}</span>
      </div>

      <div className="card-body">
        <div className="score-row">
          <span className="score-label">AI SCORE</span>
          <div className="score-track">
            <div
              className="score-fill"
              style={{ width: `${scorePercent}%`, background: scoreColor }}
            />
          </div>
          <span className="score-value" style={{ color: scoreColor }}>
            {scorePercent}%
          </span>
        </div>

        <p className="card-label-text">{verdict.image_label}</p>

        {verdict.public_description && (
          <div className="mismatch-row">
            <span className="mismatch-mark">!</span>
            <p className="mismatch-text">{verdict.public_description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
