"""Extract Resonance World's Best Cities 2026 into a model-ready table.

Run from the repo root:
    python ml/scripts/extract_resonance.py --report src/report/Best-Cities-Worlds-Best-Cities-2026.pdf

Writes
    ml/data/world_cities_2026.csv            facts per city: ranks, population, two highlight categories
    ml/data/private/narratives_2026.jsonl    the report's city paragraphs, for text embeddings only.
                                             Report text belongs to Resonance, so this file is git-ignored.
"""
import argparse
import csv
import json
import re
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parents[2]

REGION = {
    "Europe": ["Austria", "Belgium", "Czechia", "Denmark", "Finland", "France", "Germany", "Greece", "Hungary",
               "Ireland", "Italy", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Spain", "Sweden",
               "Switzerland", "Türkiye", "United Kingdom"],
    "North America": ["Canada", "USA", "Mexico"],
    "Latin America": ["Argentina", "Brazil", "Chile", "Colombia", "Peru"],
    "Asia-Pacific": ["Australia", "China", "India", "Indonesia", "Japan", "Malaysia", "New Zealand", "Singapore",
                     "South Korea", "Taiwan", "Thailand"],
    "Middle East & Africa": ["Qatar", "Saudi Arabia", "South Africa", "UAE"],
}
COUNTRY_REGION = {country: region for region, countries in REGION.items() for country in countries}
CATEGORY_FIX = {"Family- Friendly Attractions": "Family-Friendly Attractions", "Tik Tok Videos": "TikTok Videos",
                "Theater & Concerts": "Theaters & Concerts", "Airport": "Airports"}


def clean_category(name: str) -> str:
    name = name.replace("(Tied)", "").strip()
    return CATEGORY_FIX.get(name, name)


def parse_block(text: str) -> dict | None:
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if "PLACE POWER™ HIGHLIGHTS" not in lines:
        return None
    start = next(i for i, line in enumerate(lines) if re.fullmatch(r"\d{1,3}", line))
    h = lines.index("PLACE POWER™ HIGHLIGHTS")
    highlights = []
    for line in lines[h + 1:h + 3]:
        m = re.match(r"^(\d{1,3})\s+(.+)$", line)
        if m:
            highlights.append((int(m.group(1)), clean_category(m.group(2))))
    body_start = h + 3
    for k in range(h + 1, len(lines)):
        if lines[k].startswith("Metro "):
            body_start = k + 1
            break
    # drop all-caps photo captions and page furniture
    body = " ".join(line for line in lines[body_start:] if not re.fullmatch(r"[A-Z0-9 ’'&,.\-ÉÍÓÁ()/]+", line))
    return {"rank": int(lines[start]), "city": lines[start + 1], "country": lines[start + 2],
            "highlights": highlights, "text": body}


def city_blocks(pdf) -> list[dict]:
    blocks = []
    for page in pdf.pages:
        text = page.extract_text() or ""
        count = text.count("PLACE POWER™ HIGHLIGHTS")
        if count == 1:
            blocks.append(parse_block(text))
        elif count > 1:  # three cities per page, one per column
            xs = sorted(w["x0"] for w in page.extract_words() if w["text"] == "PLACE")
            xs = [x for i, x in enumerate(xs) if i == 0 or x - xs[i - 1] > 20]
            bounds = [0] + [x - 4 for x in xs[1:]] + [page.width]
            for left, right in zip(bounds, bounds[1:]):
                block = parse_block(page.crop((left, 0, right, page.height)).extract_text() or "")
                if block:
                    blocks.append(block)
    return blocks


def summary_table(pdf) -> dict[int, dict]:
    rows = {}
    for page in pdf.pages:
        text = page.extract_text() or ""
        if "RANK CITY COUNTRY LIVABILITY" not in text:
            continue
        for line in text.split("\n"):
            m = re.match(r"^(\d{1,3}) .+? (\d{1,3}) (\d{1,3}) (\d{1,3}) ([\d,]+)$", line)
            if m:
                rank, liv, lov, pro, pop = m.groups()
                rows[int(rank)] = {"livability": int(liv), "lovability": int(lov), "prosperity": int(pro),
                                   "population": int(pop.replace(",", ""))}
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", default=str(ROOT / "src/report/Best-Cities-Worlds-Best-Cities-2026.pdf"))
    args = parser.parse_args()

    with pdfplumber.open(args.report) as pdf:
        table = summary_table(pdf)
        blocks = {b["rank"]: b for b in city_blocks(pdf)}
    assert sorted(table) == list(range(1, 101)), "summary table should list ranks 1–100"
    assert sorted(blocks) == list(range(1, 101)), "every city page should parse"

    out_csv = ROOT / "ml/data/world_cities_2026.csv"
    private = ROOT / "ml/data/private"
    private.mkdir(parents=True, exist_ok=True)
    fields = ["rank", "city", "country", "region", "population", "livability", "lovability", "prosperity",
              "highlight1", "highlight1_rank", "highlight2", "highlight2_rank"]
    with out_csv.open("w", newline="", encoding="utf-8") as f, (private / "narratives_2026.jsonl").open("w", encoding="utf-8") as nf:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for rank in range(1, 101):
            b, t = blocks[rank], table[rank]
            (r1, h1), (r2, h2) = b["highlights"]
            writer.writerow({"rank": rank, "city": b["city"], "country": b["country"],
                             "region": COUNTRY_REGION[b["country"]], **t,
                             "highlight1": h1, "highlight1_rank": r1, "highlight2": h2, "highlight2_rank": r2})
            nf.write(json.dumps({"rank": rank, "city": b["city"], "text": b["text"]}, ensure_ascii=False) + "\n")
    print(f"wrote {out_csv.relative_to(ROOT)} (100 cities) and ml/data/private/narratives_2026.jsonl")


if __name__ == "__main__":
    main()
