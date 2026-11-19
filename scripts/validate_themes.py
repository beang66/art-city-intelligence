"""Check the brand-exhibition theme recommendation against public exhibition outcomes.

Question: in a given city, do exhibitions whose theme the recommender rates higher beat their expected visitors more?
For every public case with a theme, a 'better than expected' ratio (backend/app/services/outcomes.py) and a city in
theme_text_v1.json:
    x = theme similarity for that city minus the city's mean over all themes (removes city-level differences)
    y = log(actual per day / expected per day)
Reports Spearman rho(x, y), a label-shuffling permutation p-value, hit rate of the top 3 among cases that beat
expectation, and the top-3 vs rest gap. With fewer than 20 usable cases the result is a signal, not a test.

Multi-brand fairs (kind = fair: CES, motor shows, expos) are left out unless --with-fairs is given.

Usage: backend\\.venv\\Scripts\\python.exe scripts\\validate_themes.py [--perm 5000] [--with-fairs]
"""
import json
import math
import random
import sys
from pathlib import Path
from statistics import mean

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from app.services import outcomes  # noqa: E402

TOP_K = 3
SIGNAL_BELOW = 20


def spearman(x: list[float], y: list[float]) -> float:
    return float(pd.Series(x).corr(pd.Series(y), method="spearman"))


def permutation_p(themes: list[str], cities: list[str], y: list[float], sims: dict, n: int, seed: int = 0) -> tuple[float, float]:
    """Observed rho and one-sided p: share of theme shuffles whose rho is at least as high."""
    xs = lambda labels: [sims[c][t] for c, t in zip(cities, labels)]
    observed = spearman(xs(themes), y)
    rng, shuffled, hits = random.Random(seed), list(themes), 0
    for _ in range(n):
        rng.shuffle(shuffled)
        hits += spearman(xs(shuffled), y) >= observed
    return observed, (hits + 1) / (n + 1)


def centred(theme_text: dict) -> dict:
    """city slug → theme → similarity minus the city's mean similarity."""
    out = {}
    for city, by_theme in theme_text["cities"].items():
        m = mean(v["sim"] for v in by_theme.values())
        out[city] = {t: v["sim"] - m for t, v in by_theme.items()}
    return out


def usable_rows(sims: dict, with_fairs: bool = False) -> tuple[list[dict], list[str]]:
    rows, skipped = [], []
    for c in outcomes.summary()["cases"]:
        if c.get("kind") == "fair" and not with_fairs:
            continue  # a multi-brand fair's theme is the show's, not one brand's choice
        slug = c["city"].lower().replace(" ", "-")
        if not c.get("theme") or not c.get("ratio") or slug not in sims:
            skipped.append(f'{c["id"]} ({"no ratio" if not c.get("ratio") else "city or theme missing"})')
            continue
        ranked = sorted(sims[slug], key=sims[slug].get, reverse=True)
        rows.append({**c, "slug": slug, "x": sims[slug][c["theme"]], "rank": ranked.index(c["theme"]) + 1,
                     "y": math.log(c["ratio"])})
    return rows, skipped


def self_check() -> None:
    sims = {"a": {"t1": 0.3, "t2": 0.1, "t3": -0.4}}
    rho, p = permutation_p(["t1", "t2", "t3"] * 4, ["a"] * 12, [1.0, 0.0, -1.0] * 4, sims, 500)
    assert rho > 0.99 and p < 0.05, (rho, p)


def main() -> None:
    n_perm = int(sys.argv[sys.argv.index("--perm") + 1]) if "--perm" in sys.argv else 5000
    self_check()
    theme_text = json.loads((ROOT / "backend/data/theme_text_v1.json").read_text(encoding="utf-8"))
    sims = centred(theme_text)
    with_fairs = "--with-fairs" in sys.argv
    rows, skipped = usable_rows(sims, with_fairs)
    n = len(rows)
    print(f"Cases: {'brand exhibitions and fairs' if with_fairs else 'brand exhibitions only (add --with-fairs for fairs)'}")
    print(f"Usable cases: {n} (skipped {len(skipped)}: {', '.join(skipped) or '-'})")
    print(f"Distinct themes: {len({r['theme'] for r in rows})}, cities: {len({r['slug'] for r in rows})}")
    if n < 5:
        print("Too few cases to compare.")
        return
    rho, p = permutation_p([r["theme"] for r in rows], [r["slug"] for r in rows], [r["y"] for r in rows], sims, n_perm)
    top = [r for r in rows if r["rank"] <= TOP_K]
    rest = [r for r in rows if r["rank"] > TOP_K]
    beat = [r for r in rows if r["ratio"] > 1]
    n_themes = len(theme_text["weights"])
    print(f"Spearman rho(theme similarity, log actual/expected) = {rho:+.2f}, permutation p = {p:.3f} ({n_perm} shuffles)")
    if beat:
        hit = sum(r["rank"] <= TOP_K for r in beat) / len(beat)
        print(f"Beat expectation: {len(beat)} cases, theme in city's top {TOP_K}: {hit:.0%} (random {TOP_K / n_themes:.0%})")
    if top and rest:
        gap = math.exp(mean(r["y"] for r in top) - mean(r["y"] for r in rest))
        print(f"Top-{TOP_K} theme cases: {len(top)}, rest: {len(rest)}, geometric-mean ratio top/rest = {gap:.2f}x")
    multi = {s for s in {r["slug"] for r in rows} if len({r["theme"] for r in rows if r["slug"] == s}) > 1}
    print(f"Cities with 2+ themes (within-city comparison possible): {len(multi)}: {', '.join(sorted(multi))}")
    print("Reading: " + ("signal only (fewer than 20 cases)" if n < SIGNAL_BELOW else
                         "supported" if p < 0.05 and rho > 0 else "not supported by these cases"))


if __name__ == "__main__":
    main()
