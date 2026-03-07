"""
item_mapper.py — Actor-Critic (Generator-Evaluator) Item Mapping Pipeline
Maps abbreviated / slang menu item names to canonical POS item codes.

Architecture:
  Actor  (Mapper)  — fuzzy match + token overlap against MENU
  Critic (Validator) — composite confidence score
  Router            — auto-accept ≥ 85%, else → review queue

Why fuzzy + token overlap instead of embeddings or LLM calls:
  • Zero latency — no network round-trip, runs in < 1 ms per item
  • Handles phonetic STT errors (e.g. "Nashik masala" → "Mysore Masala Dosa")
  • Food menus are small (< 50 items), so brute-force comparison wins
  • LLM is already used upstream to normalise the name; this is the safety net
"""

from __future__ import annotations
import re
from difflib import SequenceMatcher
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

# ── Canonical menu (imported at runtime from main.py, or fallback) ──
try:
    from main import MENU
except ImportError:
    MENU = {}

# ── Common abbreviations / slang map for South Indian menu items ──
ALIAS_MAP: dict[str, str] = {
    # Coffee
    "filter coffee":        "B01",
    "coffee":               "B01",
    "kaapi":                "B01",
    "kapi":                 "B01",
    "fc":                   "B01",
    # Idli
    "idli":                 "I01",
    "idly":                 "I01",
    "steam idli":           "I01",
    "steamed idli":         "I01",
    "plain idli":           "I01",
    "ghee idli":            "I02",
    "mini idli":            "I02",
    "mini ghee idli":       "I02",
    "thatte idli":          "I03",
    "plate idli":           "I03",
    # Dosa
    "dosa":                 "D01",
    "masala dosa":          "D01",
    "plain dosa":           "D01",
    "ghee dosa":            "D02",
    "ghee roast":           "D02",
    "ghee roast dosa":      "D02",
    "mysore dosa":          "D03",
    "mysore masala":        "D03",
    "mysore masala dosa":   "D03",
    "rava dosa":            "D04",
    "rava":                 "D04",
    # Vada
    "vada":                 "V01",
    "medu vada":            "V01",
    "medhu vada":           "V01",
    "rasam vada":           "V02",
    # Rice
    "pongal":               "R01",
    "ven pongal":           "R01",
    "bisi bele bath":       "R02",
    "bisi bele":            "R02",
    "bbb":                  "R02",
    "curd rice":            "R03",
    "thayir sadam":         "R03",
    "lemon rice":           "R04",
    "chitranna":            "R04",
    # Specials
    "uttapam":              "S01",
    "uttappam":             "S01",
    "onion uttapam":        "S01",
    "appam":                "S02",
    "appam stew":           "S02",
    "appam with stew":      "S02",
    "kesari":               "B02",
    "kesari bath":          "B02",
    "sweet kesari":         "B02",
    "kesari bath sweet":    "B02",
}

CONFIDENCE_THRESHOLD = 0.85   # ≥ 85 % → auto-accept
REVIEW_QUEUE: list[dict] = [] # in-memory review queue


def _normalise(text: str) -> str:
    """Lower-case, strip punctuation, collapse whitespace."""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def _token_overlap(a: str, b: str) -> float:
    """Jaccard-style overlap on word tokens."""
    sa, sb = set(a.split()), set(b.split())
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


# ═══════════════════════════════════════════════════════════════
# ACTOR — proposes the best POS match
# ═══════════════════════════════════════════════════════════════
@dataclass
class ActorProposal:
    original_text: str
    matched_code: Optional[str] = None
    matched_name: Optional[str] = None
    matched_price: int = 0
    method: str = "none"          # alias | fuzzy | token
    raw_score: float = 0.0


def actor_map(utterance: str) -> ActorProposal:
    """
    Step 1: exact alias lookup  (fastest, highest confidence).
    Step 2: fuzzy SequenceMatcher against every canonical name.
    Step 3: token-overlap boost (catches partial word matches).
    Returns the single best proposal.
    """
    norm = _normalise(utterance)
    proposal = ActorProposal(original_text=utterance)

    # ── 1. Alias lookup ──────────────────────────────────────
    if norm in ALIAS_MAP:
        code = ALIAS_MAP[norm]
        item = MENU.get(code, {})
        proposal.matched_code = code
        proposal.matched_name = item.get("name", code)
        proposal.matched_price = item.get("price", 0)
        proposal.method = "alias"
        proposal.raw_score = 1.0
        return proposal

    # ── 2. Fuzzy + token overlap against canonical names ─────
    best_score = 0.0
    best_code = None

    for code, item in MENU.items():
        canon = _normalise(item["name"])
        # SequenceMatcher ratio (0-1)
        fuzzy = SequenceMatcher(None, norm, canon).ratio()
        # Token overlap bonus
        tok = _token_overlap(norm, canon)
        # Weighted composite
        score = 0.65 * fuzzy + 0.35 * tok

        if score > best_score:
            best_score = score
            best_code = code

    # Also check aliases for partial hits
    for alias, code in ALIAS_MAP.items():
        fuzzy = SequenceMatcher(None, norm, alias).ratio()
        tok = _token_overlap(norm, alias)
        score = 0.65 * fuzzy + 0.35 * tok
        if score > best_score:
            best_score = score
            best_code = code

    if best_code:
        item = MENU.get(best_code, {})
        proposal.matched_code = best_code
        proposal.matched_name = item.get("name", best_code)
        proposal.matched_price = item.get("price", 0)
        proposal.method = "fuzzy"
        proposal.raw_score = best_score

    return proposal


# ═══════════════════════════════════════════════════════════════
# CRITIC — validates and scores the proposal
# ═══════════════════════════════════════════════════════════════
@dataclass
class CriticResult:
    proposal: ActorProposal
    confidence: float = 0.0       # 0-1
    auto_accepted: bool = False
    reason: str = ""


def critic_evaluate(proposal: ActorProposal) -> CriticResult:
    """
    Assigns a final confidence score considering:
      • Actor's raw score
      • Match method (alias gets a bonus)
      • Name-length ratio (penalise wildly different lengths)
    """
    result = CriticResult(proposal=proposal)

    if proposal.matched_code is None:
        result.confidence = 0.0
        result.reason = "No match found in menu"
        return result

    base = proposal.raw_score

    # Alias matches are hand-curated — always trust them fully
    if proposal.method == "alias":
        result.confidence = 1.0
        result.auto_accepted = True
        result.reason = "Auto-mapped (100%) via alias"
        return result

    # Length-ratio penalty for fuzzy matches: if spoken text is much
    # shorter/longer than the canonical name, slightly reduce confidence
    norm_utt = _normalise(proposal.original_text)
    norm_match = _normalise(proposal.matched_name or "")
    if norm_match:
        len_ratio = min(len(norm_utt), len(norm_match)) / max(len(norm_utt), len(norm_match))
        # Only penalise if ratio is very skewed (< 0.3)
        if len_ratio < 0.3:
            base *= (0.7 + 0.3 * len_ratio)

    result.confidence = round(base, 4)
    result.auto_accepted = result.confidence >= CONFIDENCE_THRESHOLD

    if result.auto_accepted:
        result.reason = f"Auto-mapped ({result.confidence:.0%}) via {proposal.method}"
    else:
        result.reason = f"Low confidence ({result.confidence:.0%}), sent to review queue"

    return result


# ═══════════════════════════════════════════════════════════════
# ROUTER — connects Actor → Critic → accept / review-queue
# ═══════════════════════════════════════════════════════════════
def map_item(utterance: str, order_id: str = "") -> dict:
    """
    Full pipeline entry-point.
    Returns a dict with mapping details + routing decision.
    """
    proposal = actor_map(utterance)
    verdict = critic_evaluate(proposal)

    result = {
        "original_utterance": utterance,
        "matched_code":      proposal.matched_code,
        "matched_name":      proposal.matched_name,
        "matched_price":     proposal.matched_price,
        "method":            proposal.method,
        "confidence":        verdict.confidence,
        "auto_accepted":     verdict.auto_accepted,
        "reason":            verdict.reason,
    }

    if not verdict.auto_accepted:
        entry = {
            **result,
            "order_id":   order_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "resolved":   False,
        }
        REVIEW_QUEUE.append(entry)

    return result


def resolve_review(index: int, correct_code: str) -> dict | None:
    """Admin manually resolves a review-queue entry."""
    if 0 <= index < len(REVIEW_QUEUE):
        entry = REVIEW_QUEUE[index]
        item = MENU.get(correct_code, {})
        entry["resolved"] = True
        entry["resolved_code"] = correct_code
        entry["resolved_name"] = item.get("name", correct_code)
        entry["resolved_at"] = datetime.now(timezone.utc).isoformat()
        return entry
    return None


def get_review_queue(include_resolved: bool = False) -> list[dict]:
    if include_resolved:
        return REVIEW_QUEUE
    return [e for e in REVIEW_QUEUE if not e.get("resolved")]


# ═══════════════════════════════════════════════════════════════
# ENRICH ORDER DATA — drop-in replacement for process_turn
# ═══════════════════════════════════════════════════════════════
def enrich_order_items(order_data: list[dict], order_id: str = "") -> list[dict]:
    """
    Takes the LLM's order_data list and runs each item through
    the Actor-Critic pipeline.  Items the LLM already mapped to a
    valid code pass through; items with unknown/missing codes get
    re-mapped from their name field.
    """
    enriched = []
    for item in order_data:
        code = item.get("item_code", "")
        # If LLM already gave a valid code, trust it
        if code in MENU:
            menu_item = MENU[code]
            enriched.append({
                **item,
                "name":       menu_item["name"],
                "price":      menu_item["price"],
                "confidence": 1.0,
                "auto_accepted": True,
                "mapping_method": "llm_direct",
            })
            continue

        # Otherwise, run Actor-Critic on the name / raw text
        raw_name = item.get("name", "") or item.get("item_name", "") or code
        result = map_item(raw_name, order_id=order_id)

        if result["auto_accepted"] and result["matched_code"]:
            enriched.append({
                **item,
                "item_code":  result["matched_code"],
                "name":       result["matched_name"],
                "price":      result["matched_price"],
                "confidence": result["confidence"],
                "auto_accepted": True,
                "mapping_method": result["method"],
            })
        else:
            # Keep original with flag so upstream knows it's unresolved
            enriched.append({
                **item,
                "name":       raw_name,
                "price":      result.get("matched_price", 0),
                "confidence": result["confidence"],
                "auto_accepted": False,
                "mapping_method": result["method"],
                "review_reason": result["reason"],
            })

    return enriched


# ═══════════════════════════════════════════════════════════════
# CLI DEMO
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    tests = [
        "filter coffee",
        "coffee",
        "kaapi",
        "fc",
        "idli",
        "steam idli",
        "ghee idli",
        "masala dosa",
        "mysore dosa",
        "Nashik masala",
        "ghee roast",
        "rava",
        "vada",
        "medu vada",
        "pongal",
        "bisi bele",
        "bbb",
        "curd rice",
        "thayir sadam",
        "kesari",
        "uttapam",
        "appam stew",
        "plate idli",
        "lemon rice",
        "chitranna",
        "mystery item xyz",
    ]

    print(f"{'Input':<22} {'Mapped To':<30} {'Code':<6} {'Conf':>6}  {'Route'}")
    print("-" * 95)
    for t in tests:
        r = map_item(t, order_id="TEST")
        mapped = r["matched_name"] or "—"
        code = r["matched_code"] or "—"
        conf = f"{r['confidence']:.0%}"
        route = "✓ Auto" if r["auto_accepted"] else "⚠ Review"
        print(f"{t:<22} {mapped:<30} {code:<6} {conf:>6}  {route}")

    print(f"\nReview queue: {len(get_review_queue())} items")
    for i, e in enumerate(get_review_queue()):
        print(f"  [{i}] {e['original_utterance']} → needs manual mapping")
