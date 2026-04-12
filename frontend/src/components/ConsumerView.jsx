import ConsumerImage from "./ConsumerImage";

export default function ConsumerView({ result }) {
  return (
    <div className="consumer-view">
      <div className="consumer-article">
        <div className="consumer-meta">
          <span className="con-author">{result.author}</span>
          <span className="con-sep">·</span>
          <span className="con-date">{result.date}</span>
        </div>

        <h1 className="con-headline">{result.headline}</h1>

        <div className="con-rule" />

        <p className="con-body">{result.article_text?.slice(0, 800)}{result.article_text?.length > 800 ? "..." : ""}</p>

        <div className="con-images">
          {result.verdicts?.map((v, i) => (
            <ConsumerImage key={i} verdict={v} />
          ))}
        </div>
      </div>
    </div>
  );
}
