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
    
    # If we got HTML instead of an image, it's a redirect issue
    if "text/html" in content_type or "text" in content_type:
        raise ValueError(f"Got HTML instead of image for {image_url}")
    
    # Force correct content type based on URL
    if image_url.endswith(".png"):
        content_type = "image/png"
    elif image_url.endswith(".jpg") or image_url.endswith(".jpeg"):
        content_type = "image/jpeg"
    elif image_url.endswith(".webp"):
        content_type = "image/webp"
    
    b64 = base64.standard_b64encode(response.content).decode()
    return b64, content_type

def analyze_single_image(
    image_url: str,
    article_text: str,
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
                        "text": f"""You are an expert news image verifier.

ARTICLE TEXT:
{article_text[:400]}

IMAGE ALT TEXT: {alt_text or "none"}
SURROUNDING TEXT: {surrounding_text[:200]}
ORIGINAL SOURCE FROM REVERSE SEARCH: {original_source or "unknown"}
ORIGINAL CONTEXT FROM REVERSE SEARCH: {original_context or "unknown"}
AI GENERATION SCORE: {ai_score} (above 0.7 means likely AI generated)

Analyze whether this image accurately represents what the article claims.

Respond in exactly this format with no extra text:
IMAGE_SHOWS: [one sentence describing what the image actually shows]
ARTICLE_CLAIMS: [one sentence describing what the article claims this image shows]
MATCH: [yes or no]
CONTEXT_LABEL: [if no match, one factual sentence explaining the discrepancy for a public warning. if match, write null]
IMAGE_LABEL: [exactly two sentences. sentence 1: describe what the image shows, where it is from, and when if known. sentence 2: if ai_score above 0.7 note it was flagged as AI generated with the score as a percentage. if context mismatch note what event it actually shows. if clean note the source.]"""
                    }
                ]
            }]
        )

        text = response.choices[0].message.content.strip()
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

    for i, img in enumerate(images):
        signal = signals[i] if i < len(signals) else {}

        result = analyze_single_image(
            image_url=img["url"],
            article_text=article_text,
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