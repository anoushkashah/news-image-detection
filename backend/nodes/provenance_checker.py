import requests
import os
from dotenv import load_dotenv

load_dotenv(override=True)
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

def reverse_image_search(image_url: str) -> dict:
    try:
        params = {
            "engine": "google_reverse_image",
            "image_url": image_url,
            "api_key": SERPAPI_KEY
        }

        response = requests.get(
            "https://serpapi.com/search",
            params=params,
            timeout=15
        )

        data = response.json()

        # Handle error responses
        if isinstance(data, str):
            print(f"SerpAPI returned string: {data}")
            return {
                "original_source": None,
                "original_date": None,
                "original_context": None,
                "related_pages": []
            }

        if "error" in data:
            print(f"SerpAPI error: {data['error']}")
            return {
                "original_source": None,
                "original_date": None,
                "original_context": None,
                "related_pages": []
            }

        result = {
            "original_source": None,
            "original_date": None,
            "original_context": None,
            "related_pages": []
        }

        if "image_results" in data and data["image_results"]:
            top = data["image_results"][0]
            if isinstance(top, dict):
                source = top.get("source", {})
                result["original_source"] = source.get("name") if isinstance(source, dict) else None
                result["original_context"] = top.get("title")
                result["original_date"] = top.get("date")

        if "knowledge_graph" in data and isinstance(data["knowledge_graph"], dict):
            kg = data["knowledge_graph"]
            if not result["original_context"]:
                result["original_context"] = kg.get("title")

        if "organic_results" in data and isinstance(data["organic_results"], list):
            result["related_pages"] = [
                {
                    "title": r.get("title", ""),
                    "source": r.get("displayed_link", ""),
                    "snippet": r.get("snippet", "")
                }
                for r in data["organic_results"][:3]
                if isinstance(r, dict)
            ]

        return result

    except Exception as e:
        print(f"Reverse image search failed for {image_url}: {e}")
        return {
            "original_source": None,
            "original_date": None,
            "original_context": None,
            "related_pages": []
        }


def provenance_checker(state: dict) -> dict:
    images = state["images"]
    signals = state.get("signals", [{} for _ in images])

    for i, img in enumerate(images):
        result = reverse_image_search(img["url"])

        if i >= len(signals):
            signals.append({})

        signals[i]["original_source"] = result["original_source"]
        signals[i]["original_date"] = result["original_date"]
        signals[i]["original_context"] = result["original_context"]
        signals[i]["related_pages"] = result["related_pages"]

    return {"signals": signals}