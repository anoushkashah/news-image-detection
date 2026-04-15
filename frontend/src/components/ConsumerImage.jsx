export default function ConsumerImage({ verdict }) {
  const showContextBar = verdict.public_description || verdict.is_ai_generated;

  const contextMessage = () => {
    if (verdict.is_ai_generated && verdict.public_description) {
      return `This image was flagged as AI-generated and may not depict a real event. ${verdict.public_description}`;
    }
    if (verdict.is_ai_generated) {
      return "This image was flagged as AI-generated and may not depict a real photograph or event.";
    }
    if (verdict.public_description) {
      return verdict.public_description;
    }
    return null;
  };

  const barLabel = verdict.is_ai_generated ? "AI Notice" : "Context";

  return (
    <figure className="consumer-figure">
      {showContextBar && (
        <div className={`consumer-context-bar ${verdict.is_ai_generated ? "context-bar-ai" : "context-bar-mismatch"}`}>
          <span className="context-bar-mark">{verdict.is_ai_generated ? "AI" : "!"}</span>
          <p className="context-bar-text">
            <span className="note-label">{barLabel}: </span>
            {contextMessage()}
          </p>
        </div>
      )}

      <div className="consumer-img-wrap">
        <img
          src={verdict.image_url}
          alt=""
          className="consumer-img"
          loading="lazy"
        />
        {verdict.is_ai_generated && (
          <span className="consumer-ai-badge">AI Generated</span>
        )}
      </div>

      <figcaption className="consumer-caption">
        <p className="caption-primary">{verdict.image_label?.split(".")[0]}.</p>
      </figcaption>
    </figure>
  );
}
