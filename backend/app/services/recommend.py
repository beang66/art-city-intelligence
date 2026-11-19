"""Brand exhibition themes that fit each report city, with the evidence behind each pick.

Score: sentence-embedding similarity between the city's record (keywords, institutions, events, industries) and the
theme text (ml/scripts/theme_similarity.py), standardised per theme across the 18 cities. So "fits" means
"this city's record leans to the theme more than the other cities' do", not that a big all-round city wins.
The six dimension scores are illustrative (provenance), so they are not used to score; each theme only names the
dimension it is about, for reading the Compare explorer.
shortcut: text similarity only; add observed outcome data per theme once 20+ themed cases are recorded.
"""
from functools import cache
from statistics import mean, pstdev

from app import data
from app.services import opportunity

TOP = 3


def _z(values: dict[str, float]) -> dict[str, float]:
    m, s = mean(values.values()), pstdev(values.values()) or 1.0
    return {k: (v - m) / s for k, v in values.items()}


@cache
def _table() -> dict:
    text = data.load("theme_text")
    slugs = [c["slug"] for c in data.cities()]
    table = {}
    for t in data.load("themes")["themes"]:
        z = _z({s: text["cities"][s][t["id"]]["sim"] for s in slugs})
        order = sorted(slugs, key=lambda s: -z[s])
        weights = text["weights"][t["id"]]
        for s in slugs:
            table.setdefault(s, []).append({
                "id": t["id"], "labelKo": t["labelKo"], "label": t["label"], "brandsKo": t["brandsKo"],
                "z": round(z[s], 2), "cityRank": order.index(s) + 1,
                "dimension": max(weights, key=weights.get),
                "matches": text["cities"][s][t["id"]]["matches"],
            })
    return table


def _best_format(city: dict) -> dict | None:
    model = opportunity.city_model(city["name"])
    if not model:
        return None
    key, best = min(model["formats"].items(), key=lambda kv: kv[1]["rank"])
    return {"key": key, "rank": best["rank"], "fit": best["fit"]}


def for_city(slug: str) -> dict | None:
    city = data.find_city(slug)
    if not city:
        return None
    ranked = sorted(_table()[slug], key=lambda r: -r["z"])
    return {"city": slug, "themes": ranked[:TOP], "format": _best_format(city)}


def summary() -> dict:
    return {
        "model": data.load("theme_text")["model"],
        "themeCount": len(data.load("themes")["themes"]),
        "cityCount": len(data.cities()),
        "cities": {c["slug"]: for_city(c["slug"]) for c in data.cities()},
    }
