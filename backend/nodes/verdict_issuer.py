def calculate_verdict(signal: dict) -> str:
    ai_score = signal.get("ai_score", 0.0)
    context_match = signal.get("context_match")

    if ai_score > 0.85:
        return "flagged"

    if context_match is False:
        return "flagged"

    return "clean"


def calculate_article_verdict(verdicts: list) -> dict:
    flagged_images = [v for v in verdicts if v["verdict"] == "flagged"]

    if not flagged_images:
        return {"requires_review": False, "review_reasons": []}

    reasons = []
    if any(v["ai_score"] > 0.85 for v in flagged_images):
        reasons.append("ai_generated")
    if any(v["context_match"] is False for v in flagged_images):
        reasons.append("miscontextualized")

    return {"requires_review": True, "review_reasons": reasons}


def verdict_issuer(state: dict) -> dict:
    images = state["images"]
    signals = state.get("signals", [{} for _ in images])

    verdicts = []
    for i, img in enumerate(images):
        signal = signals[i] if i < len(signals) else {}
        verdict = calculate_verdict(signal)

        verdicts.append({
            "image_url": img["url"],
            "verdict": verdict,
            "is_ai_generated": signal.get("ai_score", 0.0) > 0.85,
            "ai_score": signal.get("ai_score", 0.0),
            "context_match": signal.get("context_match"),
            "context_reasoning": signal.get("context_reasoning", ""),
            "public_description": signal.get("public_description"),
            "image_label": signal.get("image_label", ""),
            "original_source": signal.get("original_source"),
            "original_date": signal.get("original_date"),
            "original_context": signal.get("original_context"),
            "related_pages": signal.get("related_pages", [])
        })

    article_verdict = calculate_article_verdict(verdicts)

    return {
        "verdicts": verdicts,
        "requires_review": article_verdict["requires_review"],
        "review_reasons": article_verdict["review_reasons"]
    }