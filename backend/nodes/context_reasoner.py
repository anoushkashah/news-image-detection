import os
import base64
import httpx
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(override=True)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

def fetch_image_base64(image_url: str) -> tuple:
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "image/webp,image/png,image/jpeg,image/*,*/*"
    }
    response = httpx.get(
        image_url,
        headers=headers,
        timeout=15,
        follow_redirects=True
    )

    content_type = response.headers.get("content-type", "image/jpeg").split(";")[0].strip()

    if "text/html" in content_type or "text" in content_type:
        raise ValueError(f"Got HTML instead of image for {image_url}")

    if image_url.endswith(".png"):
        content_type = "image/png"
    elif image_url.endswith(".jpg") or image_url.endswith(".jpeg"):
        content_type = "image/jpeg"
    elif image_url.endswith(".webp"):
        content_type = "image/webp"

    b64 = base64.standard_b64encode(response.content).decode()
    return b64, content_type


def text_only_analysis(headline, article_text, alt_text, surrounding_text):
    response = client.chat.completions.create(
        model="openai/gpt-4o",
        max_tokens=400,
        messages=[{"role": "user", "content": f"""You are a news image verification analyst. The image itself could not be analyzed directly. Based only on the metadata below, reason carefully about whether this image is likely to match the article.

ARTICLE HEADLINE: {headline}
ARTICLE TEXT: {article_text[:600]}
IMAGE ALT TEXT (this is what the publisher claims — treat with skepticism): {alt_text or "none"}
SURROUNDING TEXT: {surrounding_text[:200]}

Note: alt text is often written to match the article narrative regardless of what the image actually shows. Focus on whether the combination of article content and image metadata seems consistent and credible.

Respond in exactly this format with no extra text:
IMAGE_SHOWS: [what the metadata suggests this image likely actually shows]
ARTICLE_CLAIMS: [what a reader would assume this image depicts]
MATCH: [yes or no]
CONTEXT_LABEL: [if no match: one factual sentence. if match: null]
IMAGE_LABEL: [one factual sentence about what the image likely shows. Only add a second sentence if MATCH is no.]"""}]
    )
    return response.choices[0].message.content.strip()


def parse_response(text: str) -> dict:
    result = {
        "context_match": None,
        "context_reasoning": "",
        "public_description": None,
        "image_label": ""
    }
    for line in text.split("\n"):
        line = line.strip()
        if line.startswith("MATCH:"):
            result["context_match"] = "yes" in line.lower()
        elif line.startswith("CONTEXT_LABEL:"):
            label = line.replace("CONTEXT_LABEL:", "").strip()
            result["public_description"] = None if label == "null" else label
        elif line.startswith("IMAGE_SHOWS:"):
            result["context_reasoning"] = line.replace("IMAGE_SHOWS:", "").strip()
        elif line.startswith("IMAGE_LABEL:"):
            result["image_label"] = line.replace("IMAGE_LABEL:", "").strip()
    return result


def analyze_single_image(
    image_url: str,
    article_text: str,
    headline: str,
    alt_text: str,
    surrounding_text: str,
    original_source: str,
    original_context: str,
    ai_score: float
) -> dict:
    try:
        b64, content_type = fetch_image_base64(image_url)

        response = client.chat.completions.create(
            model="openai/gpt-4o",
            max_tokens=400,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{content_type};base64,{b64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": f"""You are a professional news image verification analyst.

ARTICLE HEADLINE: {headline}
ARTICLE TEXT (excerpt): {article_text[:600]}

IMAGE DETAILS:
- Alt text: {alt_text or "none"}
- Surrounding caption/text: {surrounding_text[:200]}
- Reverse image search source: {original_source or "unknown"}
- Reverse image search context: {original_context or "unknown"}
- AI generation score: {ai_score:.2f} (above 0.85 means likely AI-generated)

Your task: determine whether this image could contribute to a reader misunderstanding either what the image depicts or what the article is about.

A MATCH means the image is a reasonable and honest visual representation of the article's subject. Ask: would a reasonable reader feel deceived if they learned the full context of this image? If no — it is a MATCH. Illustrative, archival, and stock imagery used to represent a topic or organization are MATCH as long as they relate to the same general subject.

A MISMATCH means the image would actively mislead a reader about the specific event, people, or facts being reported. Ask: does this image depict something fundamentally incompatible with the article's claims — a different crisis, a different cause, a fabricated scene, or a completely unrelated subject?

Respond in exactly this format with no extra text:
IMAGE_SHOWS: [one sentence: what does this image actually depict]
ARTICLE_CLAIMS: [one sentence: given the full article context, what would a reader reasonably assume this image depicts]
MATCH: [yes or no]
CONTEXT_LABEL: [if no match: one neutral factual sentence describing the actual subject of the image, suitable for a reader-facing correction. if match: null]
IMAGE_LABEL: [exactly two sentences if mismatch, one sentence if match. Sentence 1: a factual caption describing what the image shows, its likely source, and when and where it was taken if known. If the AI generation score is above 0.85, begin Sentence 1 with "This image appears to be AI-generated." Sentence 2: only include if MATCH is no — one sentence describing what event or context the image actually comes from and why it differs from the article, noting if it is AI-generated where relevant. If MATCH is yes, write only Sentence 1.]"""
                    }
                ]
            }]
        )

        text = response.choices[0].message.content.strip()

        if any(phrase in text.lower() for phrase in ["sorry", "can't", "cannot", "i'm unable", "i am unable"]):
            print(f"GPT-4o refused image analysis for {image_url}, falling back to text-only")
            text = text_only_analysis(headline, article_text, alt_text, surrounding_text)

        return parse_response(text)

    except Exception as e:
        print(f"Context reasoning failed for {image_url}: {e}")
        return {
            "context_match": None,
            "context_reasoning": "Analysis unavailable",
            "public_description": None,
            "image_label": "Image analysis unavailable."
        }


def context_reasoner(state: dict) -> dict:
    images = state["images"]
    signals = state.get("signals", [{} for _ in images])
    article_text = state["article_text"]
    headline = state.get("headline", "")

    for i, img in enumerate(images):
        signal = signals[i] if i < len(signals) else {}

        result = analyze_single_image(
            image_url=img["url"],
            article_text=article_text,
            headline=headline,
            alt_text=img.get("alt_text", ""),
            surrounding_text=img.get("surrounding_text", ""),
            original_source=signal.get("original_source"),
            original_context=signal.get("original_context"),
            ai_score=signal.get("ai_score", 0.0)
        )

        if i >= len(signals):
            signals.append({})
        signals[i].update(result)

    return {"signals": signals}
