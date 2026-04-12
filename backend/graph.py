from langgraph.graph import StateGraph
from state import VerifyState
from nodes.image_extractor import image_extractor
from nodes.ai_detector import ai_detector
from nodes.provenance_checker import provenance_checker
from nodes.context_reasoner import context_reasoner
from nodes.verdict_issuer import verdict_issuer
from nodes.recommendation_generator import recommendation_generator

def build_graph():
    graph = StateGraph(VerifyState)

    graph.add_node("image_extractor", image_extractor)
    graph.add_node("ai_detector", ai_detector)
    graph.add_node("provenance_checker", provenance_checker)
    graph.add_node("context_reasoner", context_reasoner)
    graph.add_node("verdict_issuer", verdict_issuer)
    graph.add_node("recommendation_generator", recommendation_generator)

    graph.add_edge("image_extractor", "ai_detector")
    graph.add_edge("ai_detector", "provenance_checker")
    graph.add_edge("provenance_checker", "context_reasoner")
    graph.add_edge("context_reasoner", "verdict_issuer")
    graph.add_edge("verdict_issuer", "recommendation_generator")

    graph.set_entry_point("image_extractor")
    graph.set_finish_point("recommendation_generator")

    return graph.compile()
