"""Learns the pop-up / temporary / permanent weights from public attendance data (format_targets_2026.csv).

For each format: non-negative least squares of the target on the 0–1 components from formats.components(),
weights normalised to sum to 1, so the score stays an explainable weighted sum. Compared against the earlier
hand-set weights with repeated 5-fold cross-validation (Spearman between score and target on held-out cities).
The targets are proxies (visitor flows), not pop-up or exhibition results — those come with roadmap G1.

Run from the repo root after the notebook:  python ml/scripts/learn_format_weights.py
"""
import datetime
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.optimize import lsq_linear
from scipy.stats import spearmanr
from sklearn.model_selection import KFold

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "ml" / "app"))
from formats import DESIGN_WEIGHTS, components  # noqa: E402

DATA, MODELS = ROOT / "ml" / "data", ROOT / "ml" / "models"
TARGETS = {
    "popup": ("국제 방문객 수", "Euromonitor Top 100 City Destinations 2018 (일부 Mastercard 2016), Wikipedia 표"),
    "temporary": ("미술관 연간 관람객 합", "The Art Newspaper Visitor Figures 2025, 상위 150개 미술관"),
    "permanent": ("상위 150 안의 미술관 수", "The Art Newspaper Visitor Figures 2025, 상위 150개 미술관"),
}
MIN_WEIGHT = 0.03  # smaller learned weights are dropped so the table stays readable


def target_values(t: pd.DataFrame) -> dict[str, np.ndarray]:
    floor_arrivals = t.intl_arrivals.min() * 0.8      # cities outside the top 100 sit below the smallest listed one
    listed = t.art_museum_visitors_2025[t.art_museum_visitors_2025 > 0]
    floor_visitors = listed.min() * 0.8
    return {
        "popup": np.log(t.intl_arrivals.fillna(floor_arrivals)).to_numpy(),
        "temporary": np.log(t.art_museum_visitors_2025.where(t.art_museum_visitors_2025 > 0, floor_visitors)).to_numpy(),
        "permanent": t.art_museums_top150.astype(float).to_numpy(),
    }


def fit(X: np.ndarray, y: np.ndarray) -> np.ndarray:
    A = np.c_[X, np.ones(len(X))]  # last column: free intercept
    lower = [0.0] * X.shape[1] + [-np.inf]
    w = lsq_linear(A, y, bounds=(lower, [np.inf] * A.shape[1])).x[:-1]
    return w / w.sum() if w.sum() > 0 else w


def tidy(w: np.ndarray, names: list[str]) -> dict[str, float]:
    keep = {n: v for n, v in zip(names, w) if v >= MIN_WEIGHT}
    total = sum(keep.values())
    out = {n: round(float(v / total), 2) for n, v in sorted(keep.items(), key=lambda kv: -kv[1])}
    top = next(iter(out))
    out[top] = round(float(out[top] + 1 - sum(out.values())), 2)  # rounding remainder goes to the largest weight
    return out


def cv_spearman(X: np.ndarray, y: np.ndarray, weights=None, repeats: int = 20) -> float:
    rhos = []
    for seed in range(repeats):
        for train, test in KFold(5, shuffle=True, random_state=seed).split(X):
            w = fit(X[train], y[train]) if weights is None else weights
            rhos.append(spearmanr(X[test] @ w, y[test])[0])
    return float(np.nanmean(rhos))


def learn(scores: pd.DataFrame, targets: pd.DataFrame) -> dict:
    df = scores.merge(targets, on="city", validate="one_to_one")
    comp = components(df)
    names, X = list(comp.columns), comp.to_numpy()
    ys = target_values(df)
    rng = np.random.default_rng(0)
    result = {}
    for key, y in ys.items():
        design = np.array([DESIGN_WEIGHTS[key].get(n, 0.0) for n in names])
        w = fit(X, y)
        boots = np.array([fit(X[i], y[i]) for i in (rng.integers(0, len(X), len(X)) for _ in range(300))])
        listed = int(df.intl_arrivals.notna().sum() if key == "popup" else (df.art_museums_top150 > 0).sum())
        result[key] = {
            "target": TARGETS[key][0], "source": TARGETS[key][1], "cities_listed": listed,
            "weights": tidy(w, names),
            "weights_90ci": {n: [round(float(lo), 2), round(float(hi), 2)]
                             for n, lo, hi in zip(names, np.percentile(boots, 5, 0), np.percentile(boots, 95, 0))},
            "cv_spearman": {"learned": round(cv_spearman(X, y), 3), "design": round(cv_spearman(X, y, design), 3)},
        }
    corr = pd.DataFrame(ys).corr("spearman").round(2)
    return {
        "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "method": "non-negative least squares on 0–1 components, weights normalised to 1; 20×5-fold CV",
        "cities": len(df), "formats": result, "target_correlation": corr.to_dict(),
    }


if __name__ == "__main__":
    card = learn(pd.read_csv(DATA / "city_scores_2026.csv"), pd.read_csv(DATA / "format_targets_2026.csv"))
    (MODELS / "format_weights.json").write_text(json.dumps(card, ensure_ascii=False, indent=1), encoding="utf-8")
    for key, spec in card["formats"].items():
        print(key, spec["weights"], "CV ρ learned", spec["cv_spearman"]["learned"], "design", spec["cv_spearman"]["design"])
