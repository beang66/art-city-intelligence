"""Reads the published Resonance pillar ranks and states what their spread means."""
from app import data
from app.korean import with_subject


def pillar_ko() -> dict[str, str]:
    return {p["key"]: p["labelKo"] for p in data.load("observations")["pillars"]}


def read_rank(slug: str) -> dict | None:
    observation = data.observation(slug)
    if not observation or not observation.get("world"):
        return None
    world = observation["world"]
    labels = pillar_ko()
    entries = [{"key": key, "rank": rank} for key, rank in world["pillars"].items()]
    ordered = sorted(entries, key=lambda e: e["rank"])  # stable, like Array.sort
    best, worst = ordered[0], ordered[-1]
    spread = worst["rank"] - best["rank"]
    headline = (
        f"글로벌 {world['rank']}위. 세 축 가운데 {with_subject(labels[best['key']])} {best['rank']}위로 가장 앞서고, "
        f"{with_subject(labels[worst['key']])} {worst['rank']}위로 가장 뒤처집니다."
    )
    if spread >= 20:
        detail = f"축 사이 격차가 {spread}단계로 크게 벌어져 있습니다. 종합 순위만 보면 놓치게 되는 불균형으로, {with_subject(labels[worst['key']])} 이 도시의 실질적 약점입니다."
    elif spread >= 10:
        detail = f"축 사이 격차는 {spread}단계입니다. 한쪽으로 치우쳐 있지만 종합 순위를 크게 흔들 정도는 아닙니다."
    else:
        detail = f"축 사이 격차가 {spread}단계에 그쳐 세 방향이 고르게 발달한 편입니다."
    return {"headline": headline, "detail": detail, "best": best, "worst": worst, "spread": spread}
