from typing import TypedDict

class VerifyState(TypedDict):
    article_url: str
    article_text: str
    headline: str
    author: str
    date: str
    images: list[dict]
    signals: list[dict]
    verdicts: list[dict]
    requires_review: bool
    review_reasons: list[str]
    recommendation: str
