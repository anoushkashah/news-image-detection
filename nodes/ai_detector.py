import httpx
import asyncio
import base64
import os
from dotenv import load_dotenv

load_dotenv(override=True)

HIVE_SECRET_KEY = "tQsQ2aBIiD+i3xVURl+IEQ=="
HIVE_URL = "https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection"

async def detect_single_image(image_url: str) -> float:
    try:
        # Download image and send as base64
        async with httpx.AsyncClient(timeout=15) as client:
            img_response = await client.get(
                image_url,
                headers={"User-Agent": "Mozilla/5.0"},
                follow_redirects=True
            )
            image_b64 = base64.b64encode(img_response.content).decode()
            content_type = img_response.headers.get("content-type", "image/jpeg").split(";")[0]

            # Check we actually got an image
            if "text/html" in content_type:
                print(f"Got HTML instead of image for {image_url}")
                return 0.0

            media_base64 = f"data:{content_type};base64,{image_b64}"

            response = await client.post(
                HIVE_URL,
                headers={
                    "authorization": f"Bearer {HIVE_SECRET_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "media_metadata": True,
                    "input": [{"media_base64": media_base64}]
                },
                timeout=30
            )

        data = response.json()
        print(f"Hive response status: {response.status_code}")

        if response.status_code != 200:
            print(f"Hive error: {data}")
            return 0.0

        classes = data["output"][0]["classes"]
        ai_score = next(
            (c["value"] for c in classes if c["class"] == "ai_generated"),
            0.0
        )
        return round(ai_score, 3)

    except Exception as e:
        print(f"AI detection failed for {image_url}: {e}")
        return 0.0

async def ai_detector_async(state: dict) -> dict:
    images = state["images"]
    signals = state.get("signals", [{} for _ in images])

    # Run sequentially to avoid hitting rate limits
    for i, img in enumerate(images):
        score = await detect_single_image(img["url"])
        if i >= len(signals):
            signals.append({})
        signals[i]["ai_score"] = score
        print(f"Image {i+1} AI score: {score}")

    return {"signals": signals}

def ai_detector(state: dict) -> dict:
    return asyncio.run(ai_detector_async(state))