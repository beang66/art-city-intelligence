from fastapi import APIRouter, Request

from app.routers.cities import fail, ok
from app.services import outcomes

router = APIRouter(prefix="/api/outcomes")


@router.get("")
def list_outcomes():
    return ok(outcomes.summary())


@router.post("/evaluate")
async def evaluate(request: Request):
    try:
        body = await request.json()
    except ValueError:
        return fail("JSON body required")
    if not isinstance(body, dict):
        return fail("JSON object required")
    result, error = outcomes.evaluate(body)
    return fail(error) if error else ok(result)
