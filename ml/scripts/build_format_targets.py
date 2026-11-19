"""Builds ml/data/format_targets_2026.csv: public attendance figures per city, used to learn the format weights.

Targets (one per format; none of them is a pop-up or exhibition result itself, so each is a proxy):
- popup      international arrivals per city — Euromonitor Top 100 City Destinations 2018 (Mastercard 2016 when
             Euromonitor has no figure), from Wikipedia "List of cities by international visitors"
- temporary  total 2025 visitors of the city's art museums in The Art Newspaper's top 150
- permanent  number of the city's art museums in that top 150 (how many large venues the city keeps open all year)

Sources are downloaded to ml/data/private/sources/ (not committed); only the per-city numbers are saved.
Run from the repo root:  python ml/scripts/build_format_targets.py
"""
import re
import unicodedata
from pathlib import Path

import pandas as pd
import pdfplumber
import requests

DATA = Path("ml/data")
SRC = DATA / "private" / "sources"
WIKI = "https://en.wikipedia.org/w/index.php?title=List_of_cities_by_international_visitors&action=raw"
TAN_PDF = "https://www.ccb.pt/wp-content/uploads/2026/04/TOP150ArtNewspaper1.pdf"  # The Art Newspaper, Visitor Figures 2025
HEADERS = {"User-Agent": "art-city-intelligence-research/1.0"}
# names the sources spell differently from Resonance
ALIASES = {"new york city": "new york", "washington": "washington dc", "st petersburg": "saint petersburg"}
EXTRA_PLACES = ["New York", "Washington, DC", "Krakow", "Zurich", "Birmingham, UK", "St Petersburg", "Abu Dhabi"]


def norm(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    text = re.sub(r"[^a-z ]", "", text).strip()
    return ALIASES.get(text, text)


def fetch(url: str, path: Path) -> Path:
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        response = requests.get(url, headers=HEADERS, timeout=60)
        response.raise_for_status()
        path.write_bytes(response.content)
    return path


def matcher(cities: list[str]):
    by_norm = {norm(c): c for c in cities}

    def match(name: str) -> str | None:
        n = norm(name)
        return by_norm.get(n) or next((c for k, c in by_norm.items() if n.startswith(k + " ")), None)
    return match


def arrivals(match) -> dict[str, tuple[float, str]]:
    text = fetch(WIKI, SRC / "international_visitors.wiki").read_text(encoding="utf-8")
    table = text[text.index("== 2016/2018 top 100 rankings =="):text.index("==See also==")]
    out = {}
    for block in table.split("|-")[1:]:
        cells = [line.strip().lstrip("|").strip() for line in block.strip().split("\n") if line.strip().startswith("|")]
        if len(cells) < 6:
            continue
        name = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", cells[2])
        city = match(re.sub(r"<.*?>", "", name).strip())

        def number(cell):
            cell = re.sub(r"<.*", "", cell).replace(",", "").strip()
            return float(cell) if re.fullmatch(r"[\d.]+", cell) else None
        euromonitor, mastercard = number(cells[4]), number(cells[5])
        if city and (euromonitor or mastercard):
            out[city] = (euromonitor, "Euromonitor 2018") if euromonitor else (mastercard, "Mastercard 2016")
    return out


def museums(match, cities: list[str]) -> dict[str, list[int]]:
    pdf = pdfplumber.open(fetch(TAN_PDF, SRC / "tan_visitor_figures_2025.pdf"))
    rows = {}
    for page in pdf.pages[1:3]:  # "Top 150 museums: 1-70" and "71-150"
        for m in re.finditer(r"(?:^|\s)(\d{1,3}) (\d{1,3}(?:,\d{3})+) (.+?) (?=[+-]\d+%|No data)", page.extract_text(), re.M):
            rank = int(m.group(1))
            if 1 <= rank <= 150 and rank not in rows:
                rows[rank] = (int(m.group(2).replace(",", "")), re.sub(r"\s+0%$", "", m.group(3)).strip())
    assert len(rows) >= 145, f"expected ~150 museums, parsed {len(rows)}"
    places = sorted(set(cities) | set(EXTRA_PLACES), key=len, reverse=True)
    out = {}
    for visitors, museum_and_city in rows.values():
        place = next((p for p in places if museum_and_city.endswith(" " + p)), None)
        city = match(place) if place else None
        if city:
            out.setdefault(city, []).append(visitors)
    return out


def main():
    cities = pd.read_csv(DATA / "world_cities_2026.csv").city.tolist()
    match = matcher(cities)
    arr, mus = arrivals(match), museums(match, cities)
    table = pd.DataFrame([{
        "city": c,
        "intl_arrivals": arr.get(c, (None, ""))[0],
        "intl_arrivals_source": arr.get(c, (None, ""))[1],
        "art_museum_visitors_2025": sum(mus.get(c, [])),
        "art_museums_top150": len(mus.get(c, [])),
    } for c in cities])
    table.to_csv(DATA / "format_targets_2026.csv", index=False)
    print(f"arrivals for {table.intl_arrivals.notna().sum()} cities, art museums in {(table.art_museums_top150 > 0).sum()} cities")


if __name__ == "__main__":
    main()
