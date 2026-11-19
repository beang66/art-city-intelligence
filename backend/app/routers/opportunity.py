from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.routers.cities import fail, ok
from app.services import opportunity as model
from formats import FORMATS

router = APIRouter(prefix="/api/opportunity")


@router.get("")
def ranking(request: Request):
    key = request.query_params.get("format", "popup")
    if key not in FORMATS:
        return fail(f"format must be one of {', '.join(FORMATS)}")
    try:
        limit = min(100, max(1, int(request.query_params.get("limit", "15"))))
    except ValueError:
        return fail("limit must be a number")
    return ok({"format": key, "label": FORMATS[key]["label"], "cities": model.format_ranking(key, limit)})


@router.post("/predict")
async def predict(request: Request):
    try:
        body = await request.json()
    except ValueError:
        return fail("JSON body required")
    if not isinstance(body, dict):
        return fail("JSON object required")
    liv, pro, pop, region = (body.get(k) for k in ("livability", "prosperity", "population", "region"))
    if not (model.is_number(liv) and 1 <= liv <= 300 and model.is_number(pro) and 1 <= pro <= 300):
        return fail("livability and prosperity must be ranks between 1 and 300")
    if not (model.is_number(pop) and 100_000 <= pop <= 60_000_000):
        return fail("population must be between 100,000 and 60,000,000")
    if region not in model.REGIONS:
        return fail(f"region must be one of {', '.join(model.REGIONS)}")
    predicted = model.predict_lovability(int(liv), int(pro), float(pop), region)
    return JSONResponse({"data": {"predictedLovability": round(predicted, 1), "model": model.model_card()["model"]}})
