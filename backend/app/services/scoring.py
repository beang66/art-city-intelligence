"""Dimension scores, cohort medians and signal ranks. Same rules the UI shows on /methodology."""
import math

from app import data

SIGNAL_LABELS = {
    "market": ("시장", "Market"),
    "cultural": ("문화", "Culture"),
    "opportunity": ("기회", "Opportunity"),
}


def round1(value: float) -> float:
    # JS Math.round semantics (half rounds up), so values match what the site has always shown.
    return math.floor(value * 10 + 0.5) / 10


def median(values: list[float]) -> float:
    ordered = sorted(values)
    mid = len(ordered) // 2
    value = ordered[mid] if len(ordered) % 2 else (ordered[mid - 1] + ordered[mid]) / 2
    return round1(value)


def _spec() -> dict:
    return data.load("dimensions")


def score_for(index: float, weight: float) -> float:
    return min(_spec()["maxScore"], round1(index * weight))


def city_indicators(slug: str) -> list[dict]:
    city = data.find_city(slug)
    if not city:
        return []
    spread = _spec()["weightPerturbation"]
    result = []
    for dim in _spec()["dimensions"]:
        high = score_for(city["index"], dim["weight"] * (1 + spread))
        low = score_for(city["index"], dim["weight"] * (1 - spread))
        result.append({
            "key": dim["key"],
            "label": dim["label"],
            "labelKo": dim["labelKo"],
            "score": score_for(city["index"], dim["weight"]),
            "sensitivity": round1((high - low) / 2),
            "c3Subindex": dim["c3Subindex"],
            "c3Dimension": dim["c3Dimension"],
            "sourceId": dim["sourceId"],
            "color": dim["color"],
        })
    return result


def cohort_medians() -> dict[str, float]:
    return {
        dim["key"]: median([score_for(city["index"], dim["weight"]) for city in data.cities()])
        for dim in _spec()["dimensions"]
    }


def index_median() -> float:
    return median([city["index"] for city in data.cities()])


def signal_stats(slug: str) -> list[dict]:
    city = data.find_city(slug)
    if not city:
        return []
    stats = []
    for key, (ko, en) in SIGNAL_LABELS.items():
        score = city["signalScores"][key]
        values = [item["signalScores"][key] for item in data.cities()]
        cohort = median(values)
        stats.append({
            "key": key,
            "labelKo": ko,
            "label": en,
            "score": score,
            "rank": sorted(values, reverse=True).index(score) + 1,
            "median": cohort,
            "delta": round1(score - cohort),
        })
    return stats


def ranking() -> list[str]:
    """Slugs by illustrative index, highest first (stable for ties)."""
    return [city["slug"] for city in sorted(data.cities(), key=lambda city: -city["index"])]
