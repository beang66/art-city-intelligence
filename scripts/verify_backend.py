"""Replays the requests recorded from the old Next.js API against FastAPI and compares the JSON.

Run from the repo root: python scripts/verify_backend.py
Also checks that the Python calculations equal the recorded TypeScript ones, and that src/data/snapshot_v1.json matches what the API computes, so the static pages
and the API cannot drift apart.
"""
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))
os.environ.pop("RESEND_API_KEY", None)  # the recorded contact case expects 503 without a key

from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402
from app.services import snapshot  # noqa: E402

client = TestClient(app)


def without_images(value):
    """The old API exposed Next.js image objects; FastAPI leaves images to the frontend."""
    if isinstance(value, dict):
        return {k: without_images(v) for k, v in value.items() if k not in ("image", "imageFile")}
    if isinstance(value, list):
        return [without_images(v) for v in value]
    return value


def check_contact_delivery() -> bool:
    """Contact form with a key set: provider accepts → 200, provider rejects → 502. No real email is sent."""
    import httpx
    from app import config
    from app.routers import contact

    sent = []
    real_client = httpx.AsyncClient

    def fake_client(status: int):
        def handler(request: httpx.Request) -> httpx.Response:
            sent.append(json.loads(request.content))
            return httpx.Response(status, json={})
        return lambda **kw: real_client(transport=httpx.MockTransport(handler), **kw)

    body = json.dumps({"name": "<b>홍길동</b>", "phone": "010", "email": "a@b.co"})
    config.RESEND_API_KEY = "test-key"
    try:
        contact.httpx.AsyncClient = fake_client(200)
        accepted = client.post("/api/contact", content=body, headers={"Content-Type": "application/json"})
        contact.httpx.AsyncClient = fake_client(422)
        rejected = client.post("/api/contact", content=body, headers={"Content-Type": "application/json"})
    finally:
        contact.httpx.AsyncClient = real_client
        config.RESEND_API_KEY = None
    escaped = "&lt;b&gt;홍길동&lt;/b&gt;" in sent[0]["html"] if sent else False
    return accepted.status_code == 200 and rejected.status_code == 502 and escaped


def check_opportunity() -> bool:
    """Model endpoints: ranking matches the shared format logic, what-if prediction is sane, bad input is 400."""
    ranking = client.get("/api/opportunity?format=permanent&limit=3").json()["data"]["cities"]
    post = lambda body: client.post("/api/opportunity/predict", json=body)
    good = post({"livability": 13, "prosperity": 16, "population": 24_160_000, "region": "Asia-Pacific"})
    better = post({"livability": 3, "prosperity": 2, "population": 24_160_000, "region": "Asia-Pacific"})
    bad = [post({"livability": 0, "prosperity": 5, "population": 1e6, "region": "Europe"}),
           post({"livability": 5, "prosperity": 5, "population": 1e6, "region": "Mars"}),
           client.get("/api/opportunity?format=gallery")]
    return (
        [c["city"] for c in ranking] == ["Paris", "London", "New York"]
        and good.status_code == 200 and 1 <= good.json()["data"]["predictedLovability"] <= 300
        and better.json()["data"]["predictedLovability"] < good.json()["data"]["predictedLovability"]
        and all(r.status_code == 400 for r in bad)
    )


def check_outcomes() -> bool:
    """Outcome records: every public case is normalised and placed against its format; bad input is 400."""
    listed = client.get("/api/outcomes").json()["data"]
    post = lambda body: client.post("/api/outcomes/evaluate", json=body)
    good = post({"city": "Seoul", "format": "popup", "start": "2026-03-01", "end": "2026-03-10", "visitors": 20000, "areaM2": 300})
    bad = [post({"city": "Atlantis", "format": "popup", "start": "2026-03-01", "end": "2026-03-10", "visitors": 1}),
           post({"city": "Seoul", "format": "gallery", "start": "2026-03-01", "end": "2026-03-10", "visitors": 1}),
           post({"city": "Seoul", "format": "popup", "start": "2026-03-10", "end": "2026-03-01", "visitors": 1}),
           post({"city": "Seoul", "format": "popup", "start": "2026-03-01", "end": "2026-03-10", "visitors": -5})]
    data = good.json().get("data", {})
    return (
        listed["total"] >= 8 and all(c["fitRank"] >= 1 and c["perDay"] > 0 for c in listed["cases"])
        and all(c["ratio"] for c in listed["cases"] if c["format"] == "temporary")  # 6 cases → leave-one-out baseline
        and not any(c["ratio"] for c in listed["cases"] if c["format"] == "popup")   # 2 cases → no baseline yet
        and good.status_code == 200 and data.get("perDay") == 2000 and data.get("perDayPerM2") == 6.67
        and all(r.status_code == 400 for r in bad)
    )


def check_themes() -> bool:
    """Theme picks: 3 per city, best first, each with evidence phrases from the city's own record; bad city is 400/404."""
    from app import data
    picks = [client.get(f"/api/opportunity/themes?city={c['slug']}").json()["data"] for c in data.cities()]

    def grounded(city, theme):
        record = data.find_city(city)
        words = " ".join([record["typeKo"], record["dnaKo"], *record["cultural"]["keywordsKo"], *record["cultural"]["institutions"],
                          *record["cultural"]["events"], *record["industryKo"]])
        return theme["matches"] and all(m in words for m in theme["matches"])

    return (
        all(len(p["themes"]) == 3 and [t["z"] for t in p["themes"]] == sorted((t["z"] for t in p["themes"]), reverse=True)
            and all(grounded(p["city"], t) for t in p["themes"]) for p in picks)
        and len({p["themes"][0]["id"] for p in picks}) >= 6  # not one theme for every city
        and client.get("/api/opportunity/themes").status_code == 400
        and client.get("/api/opportunity/themes?city=atlantis").status_code == 404
    )


def main() -> int:
    cases = json.loads((ROOT / "backend/tests/baseline/api_baseline_v0.json").read_text(encoding="utf-8"))
    failures = []
    for case in cases:
        if case["method"] == "GET":
            res = client.get(case["path"])
        else:
            res = client.post(case["path"], content=case["body"], headers={"Content-Type": "application/json"})
        got = without_images(res.json())
        want = without_images(case["json"])
        if res.status_code != case["status"] or got != want:
            failures.append((case["method"], case["path"], case["body"], case["status"], res.status_code))

    snap_path = ROOT / "src/data/snapshot_v1.json"
    snap_ok = snap_path.exists() and json.loads(snap_path.read_text(encoding="utf-8")) == snapshot.build()
    health = client.get("/health").json() == {"status": "ok"}
    built = snapshot.build()
    old_calc = json.loads((ROOT / "backend/tests/baseline/ts_calculations_v0.json").read_text(encoding="utf-8"))
    # readings come from observed ranks, which were re-extracted from the report tables in observations v1.1;
    # the TypeScript record holds readings of the old (shifted) transcription, so they are not compared.
    old_calc.pop("readings")
    calc_diff = [key for key, value in old_calc.items() if built[key] != value]

    print(f"API parity: {len(cases) - len(failures)}/{len(cases)} cases match")
    for failure in failures:
        print("  MISMATCH", failure)
    print(f"Python calculations match the old TypeScript ones: {len(old_calc) - len(calc_diff)}/{len(old_calc)} ({', '.join(old_calc)})")
    for key in calc_diff:
        print("  MISMATCH", key)
    print(f"Snapshot matches API calculations: {snap_ok}")
    print(f"Health: {health}")
    delivery = check_contact_delivery()
    model_ok = check_opportunity()
    print(f"Opportunity API (format ranking, what-if prediction, 400 on bad input): {model_ok}")
    outcomes_ok = check_outcomes()
    print(f"Outcomes API (cases normalised, evaluate, 400 on bad input): {outcomes_ok}")
    themes_ok = check_themes()
    print(f"Theme picks (3 per city, sorted, evidence from the city record, 6+ distinct top themes, 400/404): {themes_ok}")
    print(f"Contact delivery (mocked provider 200 → 200, 422 → 502, HTML escaped): {delivery}")
    ok = not failures and not calc_diff and snap_ok and health and delivery and model_ok and outcomes_ok and themes_ok
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
