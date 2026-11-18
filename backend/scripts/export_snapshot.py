"""Writes src/data/snapshot_v1.json for the statically generated pages.

Run from backend/: python scripts/export_snapshot.py
Re-run after editing anything in backend/data; scripts/verify_backend.py fails if the snapshot is stale.
"""
import json
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND))

from app.services.snapshot import build  # noqa: E402

out = BACKEND.parent / "src" / "data" / "snapshot_v1.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(build(), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"wrote {out.relative_to(BACKEND.parent)}")
