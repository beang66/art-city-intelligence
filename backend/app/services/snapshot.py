"""Everything the static pages need, computed once by the same functions the API uses."""
from app import data
from app.services import observed, opportunity, outcomes, recommend, scoring


def build() -> dict:
    slugs = [city["slug"] for city in data.cities()]
    observations = data.load("observations")
    return {
        "version": "v1",
        "trendYears": data.load("cities")["trendYears"],
        "cities": data.cities(),
        "dimensions": data.load("dimensions")["dimensions"],
        "observations": observations["observations"],
        "pillars": observations["pillars"],
        "sources": data.load("sources")["sources"],
        "provenance": data.load("provenance")["metrics"],
        "indicators": {slug: scoring.city_indicators(slug) for slug in slugs},
        "signalStats": {slug: scoring.signal_stats(slug) for slug in slugs},
        "readings": {slug: observed.read_rank(slug) for slug in slugs},
        "cohortMedians": scoring.cohort_medians(),
        "indexMedian": scoring.index_median(),
        "ranking": scoring.ranking(),
        "opportunity": {
            "summary": opportunity.summary(),
            "top": {key: opportunity.format_ranking(key, 15) for key in opportunity.FORMATS},
            "cities": {city["slug"]: opportunity.city_model(city["name"]) for city in data.cities()},
        },
        "outcomes": outcomes.summary(),
        "themes": recommend.summary(),
    }
