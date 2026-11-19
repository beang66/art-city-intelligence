"""Format fit: which cities suit a pop-up, a temporary exhibition or a permanent exhibition.

Weights come from ml/models/format_weights.json, learned on public attendance data (ml/scripts/learn_format_weights.py):
international arrivals for pop-ups, art-museum visitors for temporary exhibitions, the number of large art museums
for permanent ones. These are proxies; pop-up and exhibition results themselves come with roadmap G1.
DESIGN_WEIGHTS keeps the earlier hand-set weights as the fallback and as the baseline the learning is compared with.
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd

# Highlight categories that matter for each format (Resonance category names).
SIGNALS = {
    "buzz": {"Instagram Posts", "TikTok Videos", "Facebook Check-ins", "Google Trends", "Shopping", "Nightlife",
             "Sights & Landmarks", "Walkability", "Public Transit", "Family-Friendly Attractions"},
    "culture": {"Museums", "Theaters & Concerts", "Sights & Landmarks", "University"},
    "base": {"Standard of Living", "Large Companies", "Economic Output", "Educational Attainment",
             "Convention Center", "Public Transit", "Business Ecosystem"},
}

# Earlier hand-set weights: fallback when no learned file exists, and the baseline in the CV comparison.
DESIGN_WEIGHTS = {
    "popup": {"opportunity": 0.30, "lovability": 0.30, "population": 0.15, "buzz": 0.25},
    "temporary": {"culture": 0.35, "lovability": 0.25, "opportunity": 0.15, "population": 0.25},
    "permanent": {"livability": 0.30, "prosperity": 0.30, "base": 0.20, "lovability": 0.10, "opportunity": 0.10},
}

FORMATS = {
    "popup": {
        "label": "팝업 (며칠~몇 주)",
        "why": "짧은 기간에 사람을 모으는 힘이 중요합니다. 도시를 찾는 국제 방문객 수를 정답으로 가중치를 학습했습니다.",
    },
    "temporary": {
        "label": "비상설 전시 (기획전, 1~6개월)",
        "why": "전시를 보러 오는 관객층이 중요합니다. 도시 미술관의 연간 관람객 합을 정답으로 가중치를 학습했습니다.",
    },
    "permanent": {
        "label": "상설 전시 (상설관·쇼룸, 1년 이상)",
        "why": "1년 내내 관객을 유지하는 힘이 중요합니다. 도시가 운영하는 대형 미술관 수를 정답으로 가중치를 학습했습니다.",
    },
}

LEARNED = Path(__file__).resolve().parents[1] / "models" / "format_weights.json"
_card = json.loads(LEARNED.read_text(encoding="utf-8")) if LEARNED.exists() else {"formats": {}}
for _key, _spec in FORMATS.items():
    _learned = _card["formats"].get(_key)
    _spec["weights"] = _learned["weights"] if _learned else DESIGN_WEIGHTS[_key]
    _spec["learned"] = {k: _learned[k] for k in ("target", "source", "cities_listed", "cv_spearman")} if _learned else None

COMPONENT_LABELS = {
    "opportunity": "기회 점수", "lovability": "문화 매력", "livability": "정주 여건", "prosperity": "경제 활력",
    "population": "인구 규모", "buzz": "화제성 강점", "culture": "문화 관객 강점", "base": "생활·구매력 강점",
}


def cluster_labels(df: pd.DataFrame) -> dict[int, str]:
    """Names each KMeans cluster by its median profile, so labels follow whatever k the notebook chose."""
    med = df.groupby("cluster")[["lovability", "prosperity", "population"]].median()
    names = {}
    for c, row in med.iterrows():
        if row.lovability <= 15 and row.prosperity <= 15:
            names[c] = "글로벌 허브"
        elif row.population >= med.population.median() and row.lovability < row.prosperity:
            names[c] = "매력 앞선 대도시"
        else:
            names[c] = "살기 좋은 중형 도시"
    return {int(c): names[c] for c in names}


def _scale(values: pd.Series) -> pd.Series:
    span = values.max() - values.min()
    return (values - values.min()) / span if span else values * 0


def components(df: pd.DataFrame) -> pd.DataFrame:
    """Every component on 0–1, higher = better. Ranks are log-scaled so the top of the table counts more."""
    out = pd.DataFrame(index=df.index)
    for col in ("lovability", "livability", "prosperity"):
        out[col] = 1 - _scale(np.log(df[col]))
    out["population"] = _scale(np.log(df.population))
    out["opportunity"] = _scale(df.opportunity)
    for signal, cats in SIGNALS.items():
        # strength of the best matching highlight (rank 1 → 1.0, rank 300 → 0); 0 when neither highlight matches
        strengths = [np.where(df[f"highlight{n}"].isin(cats), 1 - np.log(df[f"highlight{n}_rank"]) / np.log(300), 0.0)
                     for n in (1, 2)]
        out[signal] = np.maximum(*strengths)
    return out


def fit_scores(df: pd.DataFrame, weights: dict[str, float]) -> pd.DataFrame:
    total = sum(weights.values())
    if total <= 0:
        raise ValueError("at least one weight must be positive")
    comp = components(df)
    score = sum(comp[k] * w for k, w in weights.items()) / total
    return df.assign(fit=(score * 100).round(1)).join(comp.add_prefix("c_"))


if __name__ == "__main__":  # self-check: python ml/app/formats.py
    data = pd.read_csv(Path(__file__).resolve().parents[1] / "data/city_scores_2026.csv")
    tops = {}
    for key, spec in FORMATS.items():
        assert abs(sum(spec["weights"].values()) - 1) < 1e-6, key
        ranked = fit_scores(data, spec["weights"]).sort_values("fit", ascending=False)
        assert ranked.fit.between(0, 100).all()
        tops[key] = ranked.city.head(5).tolist()
        print(spec["label"], "→", tops[key])
    assert tops["popup"] != tops["permanent"], "formats should rank cities differently"
    print("ok")
