"""Sentence-embedding links between brand exhibition themes, the six dimensions and the 18 report cities.

Run from the repo root: ml/.venv/Scripts/python ml/scripts/theme_similarity.py
Writes backend/data/theme_text_v1.json, read by backend/app/services/recommend.py.
- cities: how close each city's record (keywords, institutions, events, industries) is to each theme, and the two
  closest phrases, shown as the evidence;
- weights: which of the six dimensions a theme is about (its "what matters" sentence against dimension names).
  Used only to point at the dimension to read, not to score: dimension scores are illustrative.
"""
import json
from datetime import date
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "backend" / "data"
MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
TEMPERATURE = 0.05  # softmax sharpness for theme -> dimension weights


def load(name):
    return json.loads((DATA / f"{name}_v1.json").read_text(encoding="utf-8"))


def city_phrases(city):
    c = city["cultural"]
    phrases = [city["typeKo"], city["dnaKo"], *c["keywordsKo"], *c["institutions"], *c["events"], *city["industryKo"]]
    return list(dict.fromkeys(phrases))


def top_phrases(phrases, sims, k=2):
    """Closest phrases, skipping one that only repeats a picked phrase ('건축 문화' vs '건축 문화 · 풀뿌리 에너지')."""
    picked = []
    for j in np.argsort(-sims):
        p = phrases[j]
        if not any(p in q or q in p for q in picked):
            picked.append(p)
        if len(picked) == k:
            break
    return picked


def softmax(x):
    e = np.exp((x - x.max()) / TEMPERATURE)
    return e / e.sum()


def main():
    themes = load("themes")["themes"]
    dims = load("dimensions")["dimensions"]
    cities = load("cities")["cities"]
    enc = SentenceTransformer(MODEL)
    embed = lambda texts: enc.encode(texts, normalize_embeddings=True, show_progress_bar=False)

    T = embed([t["text"] for t in themes])
    # Weights: the theme's "what matters" sentence against each dimension's name. Compared on 2026-11-19,
    # this read better than matching against the long dimension descriptions (which pulled most themes to 참여).
    needs = embed([t["text"].split(". ")[-1] for t in themes])
    D = embed([f"{d['labelKo']} {d['label']} {d['c3Dimension']}" for d in dims])
    weights = {t["id"]: dict(zip([d["key"] for d in dims], np.round(softmax(needs[i] @ D.T), 3).tolist()))
               for i, t in enumerate(themes)}

    out = {}
    for city in cities:
        phrases = city_phrases(city)
        P = embed(phrases)
        C = embed([" · ".join(phrases)])[0]
        out[city["slug"]] = {
            t["id"]: {"sim": round(float(C @ T[i]), 4), "matches": top_phrases(phrases, P @ T[i])}
            for i, t in enumerate(themes)
        }

    (DATA / "theme_text_v1.json").write_text(json.dumps({
        "version": "v1", "updated": date.today().isoformat(), "model": MODEL, "temperature": TEMPERATURE,
        "weights": weights, "cities": out,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    for tid, w in weights.items():
        top = sorted(w.items(), key=lambda kv: -kv[1])[:2]
        print(tid, top)


if __name__ == "__main__":
    main()
