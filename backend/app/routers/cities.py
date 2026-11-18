import re

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app import data
from app.services import scoring

router = APIRouter(prefix="/api")
CITY_SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")


def ok(payload) -> JSONResponse:
    return JSONResponse({"data": payload})


def fail(message: str, status: int = 400) -> JSONResponse:
    return JSONResponse({"error": message}, status_code=status)


def query(request: Request, key: str) -> str | None:
    values = request.query_params.getlist(key)  # first value, like URLSearchParams.get
    return values[0] if values else None


def parse_slug(value: str | None) -> str | None:
    if value is None:
        return None
    slug = value.strip().lower()
    return slug if CITY_SLUG.fullmatch(slug) else None


def public_city(city: dict) -> dict:
    """Images are frontend assets; the API returns the record without the file reference."""
    work = {k: v for k, v in city["signatureWork"].items() if k != "imageFile"}
    return {**city, "signatureWork": work}


@router.get("/cities")
def get_cities(request: Request):
    raw = query(request, "slug")
    if not raw:
        return ok([public_city(city) for city in data.cities()])
    slug = parse_slug(raw)
    if not slug:
        return fail("Invalid city slug")
    city = data.find_city(slug)
    return ok(public_city(city)) if city else fail("City not found", 404)


def _city_slug(request: Request) -> str | None:
    return parse_slug(query(request, "city"))


@router.get("/indicators")
def get_indicators(request: Request):
    slug = _city_slug(request)
    if not slug:
        return fail("A valid city query is required")
    indicators = scoring.city_indicators(slug)
    return ok(indicators) if indicators else fail("City not found", 404)


@router.get("/cultural")
def get_cultural(request: Request):
    slug = _city_slug(request)
    if not slug:
        return fail("A valid city query is required")
    city = data.find_city(slug)
    return ok(city["cultural"]) if city else fail("City not found", 404)


@router.get("/market")
def get_market(request: Request):
    slug = _city_slug(request)
    if not slug:
        return fail("A valid city query is required")
    city = data.find_city(slug)
    return ok(city["market"]) if city else fail("City not found", 404)
