# Verify — News Image Integrity Agent

Verify is an agentic AI system that automatically detects AI-generated and miscontextualized images in news articles before publication. It runs each image through a multi-signal analysis pipeline and surfaces findings to editors and readers in two distinct views.

**Live demo:** https://news-image-detection.vercel.app

---

## The Problem

Newsrooms increasingly publish articles containing AI-generated imagery presented as real photography, and images repurposed from unrelated events to illustrate stories they were never meant to accompany. Both erode reader trust and journalistic integrity — and both are difficult to catch manually at publication speed.

---

## How It Works

Verify runs a six-node LangGraph pipeline for each article:
1. **Image Extractor** — Pulls article metadata, body text, and image URLs from the article dataset.
2. **AI Detector** — Sends each image to the Hive AI V3 computer vision model, which returns an AI generation confidence score. Images scoring above 0.85 are flagged as likely AI-generated.
3. **Provenance Checker** — Runs each image through SerpAPI reverse image search to find the original source, publication date, and original context.
4. **Context Reasoner** — Sends each image alongside the article headline, body text, and provenance data to GPT-4o via OpenRouter. GPT-4o determines whether the image accurately represents what the article claims, generating a factual image label and a public-facing context note if a mismatch is detected.
5. **Verdict Issuer** — Combines all signals into a per-image verdict (clean or flagged) and an article-level verdict (requires_review: true or false) with specific reasons (ai_generated, miscontextualized).
6. **Recommendation Generator** — If the article requires review, GPT-4o generates a neutral 3-sentence editorial analysis summarizing findings for the editor without prescribing a course of action.

Results stream to the frontend in real time via Server-Sent Events as each node completes.

---

## Two Views

**Editor View (dark)** — A publisher dashboard showing the full analysis: article headline, review status, editorial recommendation, and per-image cards with AI score bars, verdict badges, factual labels, and mismatch callouts.

**Reader View (light)** — A clean editorial layout showing the article with factual image captions below each photo. Context notes appear only when an image is flagged. An AI Generated badge overlays images that scored above the detection threshold.

---

## Demo Articles

| Article | Expected Result |
|---|---|
| NASA Deep Space Release | Cleared — real photos, contextually accurate |
| Climate March Coverage | Flagged — all three images AI-generated at ~100% confidence |
| Houston Protest Report | Flagged — real photos miscontextualized (flood, coding, forest) |

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

---
## API Reference

### POST /verify

Triggers the analysis pipeline. Returns a Server-Sent Events stream.

**Request body:**
{ "url": "demo_clean" }
Valid values: `demo_clean`, `demo_ai`, `demo_context`

### GET /health

Returns `{ "status": "ok" }` if the server is running.
