import requests
from bs4 import BeautifulSoup
from demo_data import DEMO_ARTICLES

def image_extractor(state: dict) -> dict:
    url = state["article_url"]

    # Check if it's a demo article
    if url in DEMO_ARTICLES:
        demo = DEMO_ARTICLES[url]
        return {
            "article_text": demo["article_text"],
            "headline": demo.get("headline", ""),
            "author": demo.get("author", ""),
            "date": demo.get("date", ""),
            "images": demo["images"],
            "signals": [{} for _ in demo["images"]],
            "verdicts": []
        }

    # Live scraping for real URLs
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract headline
        headline = ""
        if soup.find("h1"):
            headline = soup.find("h1").get_text().strip()

        # Extract article text
        article_text = " ".join([
            p.get_text() for p in soup.find_all("p")[:10]
        ])

        # Extract images
        images = []
        for img in soup.find_all("img")[:3]:
            src = img.get("src", "")
            if not src or src.startswith("data:"):
                continue
            if src.startswith("//"):
                src = f"https:{src}"
            if not src.startswith("http"):
                continue

            parent = img.parent
            surrounding = parent.get_text()[:200] if parent else ""

            images.append({
                "url": src,
                "alt_text": img.get("alt", ""),
                "surrounding_text": surrounding,
                "caption": img.get("alt", "")
            })

        return {
            "article_text": article_text or "Content unavailable",
            "headline": headline,
            "author": "",
            "date": "",
            "images": images[:3],
            "signals": [{} for _ in images[:3]],
            "verdicts": []
        }

    except Exception as e:
        print(f"Scraping failed: {e}")
        return {
            "article_text": "Content unavailable",
            "headline": "",
            "author": "",
            "date": "",
            "images": [],
            "signals": [],
            "verdicts": []
        }