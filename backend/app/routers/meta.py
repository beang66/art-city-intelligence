from fastapi import APIRouter

from app import data

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/api/meta")
def meta():
    observations = data.load("observations")["observations"]
    return {"data": {
        "cityCount": len(data.cities()),
        "observedCityCount": len(observations),
        "worldRankedCityCount": sum(1 for o in observations.values() if o.get("world")),
        "sourceCount": len(data.load("sources")["sources"]),
        "versions": {name: data.load(name)["version"] for name in ("cities", "dimensions", "observations", "sources")},
        "provenance": data.load("provenance")["metrics"],
    }}
