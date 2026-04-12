from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from graph import build_graph
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/verify")
async def verify(body: dict):
    url = body["url"]

    async def stream():
        graph = build_graph()
        async for event in graph.astream({
            "article_url": url,
            "article_text": "",
            "headline": "",
            "author": "",
            "date": "",
            "images": [],
            "signals": [],
            "verdicts": [],
            "requires_review": False,
            "review_reasons": [],
            "recommendation": ""
        }):
            node = list(event.keys())[0]
            data = event[node]
            yield f"data: {json.dumps({'node': node, 'data': data}, default=str)}\n\n"
        yield "data: {\"node\": \"done\"}\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")

@app.get("/health")
async def health():
    return {"status": "ok"}
