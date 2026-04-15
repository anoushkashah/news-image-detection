# Verify — News Image Integrity Agent

Verify is an agentic AI system that automatically detects AI-generated and miscontextualized images in news articles before publication. It runs each image through a multi-signal analysis pipeline and surfaces findings to editors and readers in two distinct views.

**Live demo:** https://news-image-detection.vercel.app

---

## The Problem

Newsrooms increasingly publish articles containing AI-generated imagery presented as real photography, and images repurposed from unrelated events to illustrate stories they were never meant to accompany. Both erode reader trust and journalistic integrity — and both are difficult to catch manually at publication speed.

Verify addresses this with a three-signal automated pipeline: computer vision AI detection, reverse image provenance search, and GPT-4o contextual alignment analysis. Results stream to a dual-view interface — a publisher dashboard for editors and a transparent reader view for the public.

---

## How It Works

Verify runs a six-node LangGraph pipeline for each article:
image_extractor → ai_detector → provenance_checker → context_reasoner → verdict_issuer → recommendation_generator

**1. Image Extractor**
Pulls article metadata, body text, author, date, and image URLs from the article dataset. Each image includes its URL, alt text, surrounding caption text, and article context.

**2. AI Detector**
Sends each image to the Hive AI V3 computer vision model via base64 encoding. Returns an AI generation confidence score between 0 and 1. Images scoring above 0.85 are flagged as likely AI-generated.

**3. Provenance Checker**
Runs each image through SerpAPI Google Reverse Image Search to find the original source, publication date, and original context of the image across the web. Results inform the context reasoning step.

**4. Context Reasoner**
Sends each image alongside the article headline, body text, alt text, and provenance data to GPT-4o via OpenRouter. GPT-4o uses vision to determine whether the image accurately represents what the article claims. It generates a factual image label and a public-facing context note if a mismatch is detected. If GPT-4o refuses to analyze an image directly, a text-only fallback runs using the article metadata.

**5. Verdict Issuer**
Combines all signals into a per-image verdict of clean or flagged, and an article-level verdict of requires_review true or false. Flagging criteria: AI score above 0.85, or context_match is false. Review reasons are tagged as ai_generated and/or miscontextualized.

**6. Recommendation Generator**
If the article requires review, GPT-4o generates a 4-part response: three sentences summarizing the findings and their severity, followed by a concrete publication recommendation from four options — keep as is, keep with contextual labels, keep with AI-generated labels for public transparency, or remove for misinformation and/or falsified imagery.

Results stream to the frontend in real time via Server-Sent Events as each node completes.

---

## Two Views

**Publisher View (dark)**
A newsroom dashboard showing the full analysis. Includes article headline, author, date, review status badge, flagged reason tags, image analysis summary with publication recommendation, per-image cards with AI score bars, verdict badges, factual image labels, mismatch callouts, provenance data, and approve or remove decision buttons.

**Reader View (light)**
A clean editorial layout showing the article with factual image captions below each photo. A context bar appears above flagged images explaining what the image actually shows. AI-generated images display a red AI Generated badge. The view is designed to be transparent without being alarmist.

---

## Demo Articles

| Article | Expected Result |
|---|---|
| NASA Deep Space Release | Flagged with context — Apollo archive photo used for Artemis article |
| Climate March Coverage | Removed — all three images AI-generated at 100% confidence |
| Houston Protest Report | Removed — real photos completely miscontextualized (flood, coding desk, forest) |

---

## Stack

| Layer | Technology |
|---|---|
| Agent orchestration | LangGraph |
| AI image detection | Hive AI V3 |
| Reverse image search | SerpAPI |
| Vision and language model | GPT-4o via OpenRouter |
| Backend API | FastAPI with SSE streaming |
| Frontend | React and Vite |
| UI fonts | Figtree, IBM Plex Mono, Playfair Display, Noticia Text |
| Backend hosting | Render |
| Frontend hosting | Vercel |

---

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- API keys for Hive AI, SerpAPI, and OpenRouter

### Backend
git clone https://github.com/anoushkashah/news-image-detection.git
cd news-image-detection/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Create a `.env` file in the `backend/` directory:
OPENROUTER_API_KEY=your_openrouter_key
HIVE_API_KEY=your_hive_secret_key
SERPAPI_KEY=your_serpapi_key

Start the backend:
uvicorn main:app --reload --port 8000

### Frontend
cd ../frontend
npm install
npm run dev

Open `http://localhost:5173` in your browser.

Note: when running locally the frontend points to `localhost:8000`. The production frontend points to the Render deployment URL defined in `src/hooks/useVerify.js`.

---

## API Reference

### POST /verify

Triggers the analysis pipeline for a given demo article. Returns a Server-Sent Events stream where each event contains the node name and its output data as the pipeline executes.

Request body:
{ "url": "demo_clean" }
Valid values: `demo_clean`, `demo_ai`, `demo_context`

Stream format:
data: {"node": "image_extractor", "data": {...}}
data: {"node": "ai_detector", "data": {...}}
data: {"node": "provenance_checker", "data": {...}}
data: {"node": "context_reasoner", "data": {...}}
data: {"node": "verdict_issuer", "data": {...}}
data: {"node": "recommendation_generator", "data": {...}}
data: {"node": "done"}

### GET /health

Returns `{"status": "ok"}` if the server is running.

---

## Verdict Schema

Each image verdict contains:

- `image_url` — the image URL
- `verdict` — clean or flagged
- `is_ai_generated` — boolean, true if AI score above 0.85
- `ai_score` — float between 0 and 1
- `context_match` — boolean or null if analysis unavailable
- `image_label` — factual caption for public display
- `public_description` — context correction if mismatched, null if clean
- `original_source` — reverse image search source URL if found
- `original_context` — text snippet from reverse image search
- `original_date` — original publication date if found

Article-level fields:

- `requires_review` — boolean
- `review_reasons` — list containing ai_generated and/or miscontextualized
- `recommendation` — 4-sentence analysis and publication recommendation

---

## Adding Real Articles

To analyze a real article extend `demo_data.py` with a new entry following the existing schema. Each article requires a headline, author, date, article text, and a list of images with URLs, alt text, surrounding text, and captions. A scraper node to automate this from a live URL is a natural next step for production use.

---

## Known Limitations

- Hive AI free tier is limited to 20 requests per day
- SerpAPI reverse image search occasionally times out — results gracefully fall back to null
- GPT-4o via OpenRouter occasionally refuses to analyze certain images — a text-only fallback runs automatically using article metadata
- Demo articles use static data — a real deployment would require a scraper to extract images from live article URLs

---
