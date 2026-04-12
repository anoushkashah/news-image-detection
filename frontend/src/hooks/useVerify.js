import { useState, useRef } from "react";

export function useVerify() {
  const [loading, setLoading] = useState(false);
  const [currentNode, setCurrentNode] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  async function analyze(demoKey) {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setResult(null);
    setError(null);
    setCurrentNode("image_extractor");

    let accumulated = {};

    try {
      const res = await fetch("https://news-image-detection.onrender.com/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: demoKey }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Backend error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.node === "done") {
              setResult({ ...accumulated });
              setLoading(false);
              setCurrentNode("done");
            } else {
              setCurrentNode(json.node);
              accumulated = { ...accumulated, ...json.data };
            }
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setError("Could not connect to backend. Make sure uvicorn is running on port 8000.");
        setLoading(false);
      }
    }
  }

  return { loading, currentNode, result, error, analyze };
}
