"""Versioned JSON snapshots under backend/data. Read once per process; there are no writes."""
import json
from functools import cache
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


@cache
def load(name: str) -> dict:
    return json.loads((DATA_DIR / f"{name}_v1.json").read_text(encoding="utf-8"))


def cities() -> list[dict]:
    return load("cities")["cities"]


def find_city(slug: str) -> dict | None:
    return next((city for city in cities() if city["slug"] == slug), None)


def observation(slug: str) -> dict | None:
    return load("observations")["observations"].get(slug)
