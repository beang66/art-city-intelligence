"""Exhibition outcomes (roadmap G1): public cases with a published visitor count, and 'better than expected?'.

Measurement stage 2 of 4 (expected → visits → awareness → sales). A case is normalised to visitors per day,
then compared with a baseline built from the other cases of the same format:

    expected per day = median per-day visitors of the same format × (this city's fit / median fit of those cases)

So a city with a higher format fit is expected to draw proportionally more. Fewer than MIN_PEERS comparable
cases → no expectation (the page says so instead of guessing). With fewer than 20 cases the page labels
everything as a signal.
shortcut: proportional baseline from a handful of public cases; replace with a regression on city, neighbourhood,
format and brand once there are 20+ recorded cases (roadmap G2).
"""
import datetime as dt
import json
from functools import cache
from pathlib import Path
from statistics import median

from app.services.opportunity import FORMATS, _ranked, scores

DATA = Path(__file__).resolve().parents[2] / "data" / "exhibition_outcomes_v1.json"
MIN_PEERS = 3       # comparable cases needed before an expectation is shown
SIGNAL_BELOW = 20   # below this many cases, correlations are labelled as signals
MAX_DAYS = 3660
MAX_VISITORS = 50_000_000


@cache
def _file() -> dict:
    return json.loads(DATA.read_text(encoding="utf-8"))


def _fit(city: str, format_key: str) -> tuple[float, int] | None:
    ranked = _ranked(format_key)
    row = ranked[ranked.city == city]
    if row.empty:
        return None
    return float(row.fit.iloc[0]), int(row.fit_rank.iloc[0])


def _days(start: str, end: str) -> int:
    return (dt.date.fromisoformat(end) - dt.date.fromisoformat(start)).days + 1


def _normalise(case: dict) -> dict:
    days = _days(case["start"], case["end"])
    fit, rank = _fit(case["city"], case["format"])
    return {**case, "days": days, "perDay": round(case["visitors"] / days), "fit": fit, "fitRank": rank}


@cache
def cases() -> list[dict]:
    return [_normalise(c) for c in _file()["cases"]]


def _expected(fit: float, format_key: str, exclude_id: str | None = None) -> dict:
    peers = [c for c in cases() if c["format"] == format_key and c["id"] != exclude_id]
    if len(peers) < MIN_PEERS:
        return {"expectedPerDay": None, "peers": len(peers)}
    base_per_day = median(c["perDay"] for c in peers)
    base_fit = median(c["fit"] for c in peers)
    return {"expectedPerDay": round(base_per_day * fit / base_fit), "peers": len(peers)}


def _with_expectation(case: dict) -> dict:
    exp = _expected(case["fit"], case["format"], exclude_id=case["id"])  # leave-one-out: a case never sets its own bar
    ratio = round(case["perDay"] / exp["expectedPerDay"], 2) if exp.get("expectedPerDay") else None
    return {**case, **exp, "ratio": ratio}


def summary() -> dict:
    rows = [_with_expectation(c) for c in cases()]
    by_format = {key: sum(r["format"] == key for r in rows) for key in FORMATS}
    return {
        "updatedAt": _file()["updatedAt"], "note": _file()["note"], "total": len(rows),
        "signalOnly": len(rows) < SIGNAL_BELOW, "minPeers": MIN_PEERS,
        "casesByFormat": by_format, "cases": rows, "cityOptions": sorted(scores().city.tolist()),
        "themeOptions": [{"id": t["id"], "labelKo": t["labelKo"]} for t in _themes()],
    }


@cache
def _themes() -> list[dict]:
    return json.loads((DATA.parent / "themes_v1.json").read_text(encoding="utf-8"))["themes"]


def evaluate(body: dict) -> tuple[dict | None, str | None]:
    """Normalise one new record and compare it with the public cases. Returns (result, error)."""
    city, key = body.get("city"), body.get("format")
    if key not in FORMATS:
        return None, f"format must be one of {', '.join(FORMATS)}"
    fit = _fit(city, key) if isinstance(city, str) else None
    if fit is None:
        return None, "city must be one of the 100 cities in the model (English name, e.g. Seoul)"
    try:
        days = _days(str(body.get("start")), str(body.get("end")))
    except ValueError:
        return None, "start and end must be dates (YYYY-MM-DD)"
    if not 1 <= days <= MAX_DAYS:
        return None, "end must be on or after start, within 10 years"
    visitors = body.get("visitors")
    if isinstance(visitors, bool) or not isinstance(visitors, (int, float)) or not 1 <= visitors <= MAX_VISITORS:
        return None, "visitors must be a number between 1 and 50,000,000"
    area = body.get("areaM2")
    if area is not None and (isinstance(area, bool) or not isinstance(area, (int, float)) or not 1 <= area <= 100_000):
        return None, "areaM2 must be between 1 and 100,000"
    per_day = round(visitors / days)
    exp = _expected(fit[0], key)
    ratio = round(per_day / exp["expectedPerDay"], 2) if exp.get("expectedPerDay") else None
    return {
        "city": city, "format": key, "days": days, "perDay": per_day,
        "perDayPerM2": round(visitors / days / area, 2) if area else None,
        "fit": fit[0], "fitRank": fit[1], **exp, "ratio": ratio,
    }, None
