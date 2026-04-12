export default function ConsumerImage({ verdict }) {
  return (
    <figure className="consumer-figure">
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
        {verdict.public_description && (
          <p className="caption-note">
            <span className="note-label">Context: </span>
            {verdict.public_description}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
