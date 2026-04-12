import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(override=True)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

def recommendation_generator(state: dict) -> dict:
    if not state.get("requires_review"):
        return {"recommendation": ""}

    verdicts = state.get("verdicts", [])
    headline = state.get("headline", "")
    review_reasons = state.get("review_reasons", [])

    image_summaries = []
    for i, v in enumerate(verdicts):
        if v["verdict"] == "flagged":
            parts = [f"Image {i+1}:"]
            if v.get("is_ai_generated"):
                parts.append(f"AI-generated with {round(v['ai_score']*100)}% confidence.")
            if v.get("context_match") is False and v.get("public_description"):
                parts.append(f"Context mismatch: {v['public_description']}")
            image_summaries.append(" ".join(parts))

    summary = "\n".join(image_summaries)
    reasons_text = " and ".join(review_reasons).replace("ai_generated", "AI-generated content").replace("miscontextualized", "image miscontextualization")

    prompt = f"""You are an editorial AI assistant helping a news editor review flagged content.

Article: "{headline}"
Flagged for: {reasons_text}

Per-image findings:
{summary}

Write a 3-4 sentence editorial recommendation for the human editor. Explain what was found, why it is concerning from a journalistic integrity standpoint, and what the editor should consider before publishing. Be specific and factual. Do not tell the editor what decision to make — present the findings and considerations clearly."""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        recommendation = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Recommendation generation failed: {e}")
        recommendation = "Automated analysis flagged issues with this article's images. Please review the per-image breakdown above before publishing."

    return {"recommendation": recommendation}
