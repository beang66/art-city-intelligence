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
        [c["city"] for c in ranking] == ["London", "New York", "Paris"]
        and good.status_code == 200 and 1 <= good.json()["data"]["predictedLovability"] <= 300
        and better.json()["data"]["predictedLovability"] < good.json()["data"]["predictedLovability"]
        and all(r.status_code == 400 for r in bad)
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
    print(f"Contact delivery (mocked provider 200 → 200, 422 → 502, HTML escaped): {delivery}")
    return 0 if not failures and not calc_diff and snap_ok and health and delivery and model_ok else 1


if __name__ == "__main__":
    sys.exit(main())
