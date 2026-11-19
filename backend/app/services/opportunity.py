"""Model outputs for the web app: opportunity score, format fit, city type, similar cities, what-if prediction.

Everything here reads files the Colab notebook produced (ml/data, ml/models); nothing is trained at request time.
"""
import json
import math
import sys
from functools import cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
ML = ROOT / "ml"
sys.path.insert(0, str(ML / "app"))  # formats.py is shared with the Streamlit app
from formats import FORMATS, cluster_labels, fit_scores  # noqa: E402

REGIONS = ("Asia-Pacific", "Europe", "Latin America", "Middle East & Africa", "North America")


@cache
def scores() -> pd.DataFrame:
    return pd.read_csv(ML / "data/city_scores_2026.csv")


@cache
def similar() -> dict:
    path = ML / "data/similar_cities_2026.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


@cache
def model_card() -> dict:
    return json.loads((ML / "models/model_card.json").read_text(encoding="utf-8"))


@cache
def _model():
    return joblib.load(ML / "models/lovability_model.joblib")


@cache
def _ranked(format_key: str) -> pd.DataFrame:
    ranked = fit_scores(scores(), FORMATS[format_key]["weights"]).sort_values("fit", ascending=False)
    return ranked.assign(fit_rank=range(1, len(ranked) + 1))


def format_ranking(format_key: str, limit: int) -> list[dict]:
    ranked = _ranked(format_key).head(limit)
    return [{"rank": int(r.fit_rank), "city": r.city, "country": r.country, "region": r.region,
             "fit": float(r.fit), "worldRank": int(r["rank"])} for _, r in ranked.iterrows()]


def city_model(name: str) -> dict | None:
    df = scores()
    row = df[df.city == name]
    if row.empty:
        return None
    r = row.iloc[0]
    labels = cluster_labels(df)
    return {
        "worldRank": int(r["rank"]),
        "lovability": int(r.lovability),
        "predictedLovability": float(r.predicted_lovability),
        "opportunity": float(r.opportunity),
        "opportunityRank": int((df.opportunity > r.opportunity).sum() + 1),
        "cluster": labels[int(r.cluster)],
        "highlights": [{"category": r.highlight1, "rank": int(r.highlight1_rank)},
                       {"category": r.highlight2, "rank": int(r.highlight2_rank)}],
        "formats": {key: {"fit": float(_ranked(key).loc[row.index[0], "fit"]),
                          "rank": int(_ranked(key).loc[row.index[0], "fit_rank"])} for key in FORMATS},
        "similar": similar().get(name, []),
    }


def predict_lovability(livability: int, prosperity: int, population: float, region: str) -> float:
    frame = pd.DataFrame([{"livability": livability, "prosperity": prosperity, "population": population, "region": region}])
    return float(np.exp(_model().predict(frame)[0]))


def summary() -> dict:
    card = model_card()
    serving = next(s for s in card["scores"] if s["model"] == card["model"])
    baseline = next(s for s in card["scores"] if s["model"].startswith("Mean"))
    return {
        "model": card["model"], "trainedAt": card["trained_at"], "cv": card["cv"], "cityCount": len(scores()),
        "r2": serving["R2"], "spearman": serving["Spearman"], "mae": serving["MAE_log"],
        "maeReduction": round(1 - serving["MAE_log"] / baseline["MAE_log"], 3),
        "scores": card["scores"],
        "formats": {key: {"label": spec["label"], "why": spec["why"], "weights": spec["weights"]} for key, spec in FORMATS.items()},
        "regions": list(REGIONS),
    }


def is_number(value) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)
