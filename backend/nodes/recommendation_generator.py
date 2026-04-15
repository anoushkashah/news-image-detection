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
        return {"recommendation": "", "editorial_call": ""}

    verdicts = state.get("verdicts", [])
    headline = state.get("headline", "")
    review_reasons = state.get("review_reasons", [])

    image_summaries = []
    for i, v in enumerate(verdicts):
        if v["verdict"] == "flagged":
            parts = [f"Image {i+1}:"]
            if v.get("is_ai_generated"):
                parts.append(f"Flagged as AI-generated with {round(v['ai_score']*100)}% confidence — this image was likely never a real photograph.")
            if v.get("context_match") is False and v.get("public_description"):
                parts.append(f"Context mismatch: {v['public_description']}")
            image_summaries.append(" ".join(parts))

    summary = "\n".join(image_summaries)

    reasons_list = []
    if "ai_generated" in review_reasons:
        reasons_list.append("AI-generated imagery")
    if "miscontextualized" in review_reasons:
        reasons_list.append("image miscontextualization")
    reasons_text = " and ".join(reasons_list)

    prompt = f"""You are an editorial AI assistant helping a news editor or publishing platform review flagged image content.

Article: "{headline}"
Flagged signals: {reasons_text}

Per-image findings:
{summary}

Write exactly 4 sentences structured as follows:

The first 3 sentences summarize what the automated analysis found. Reason about the actual severity of each finding — consider whether the flagged images would genuinely mislead a reader or whether they are reasonable editorial choices. Be neutral and specific.

Then add a blank line.

The 4th sentence is the publication recommendation. It must begin with exactly one of these four options — choose whichever is most appropriate:
- "This article can be kept as is." — if flagged images do not materially mislead readers and the article's integrity is intact.
- "This article can be kept with contextual labels added to flagged images." — if images are real but miscontextualized in a way that could confuse readers without being outright deceptive.
- "This article can be kept with AI-generated labels added to flagged images for public transparency." — if images are AI-generated but the article text is accurate and imagery is illustrative rather than deceptive.
- "This article should be removed for misinformation and/or falsified imagery." — only if images are AI-generated AND fundamentally misrepresent real events in a way that would actively deceive readers. Do not recommend removal solely for miscontextualized real photos.

After the chosen opening, explain why in the same sentence, being specific about the nature of the findings and their impact on reader understanding."""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}]
        )
        recommendation = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Recommendation generation failed: {e}")
        recommendation = "Automated analysis flagged issues with this article's images. Please review the per-image breakdown above before publishing."

    return {"recommendation": recommendation, "editorial_call": ""}
