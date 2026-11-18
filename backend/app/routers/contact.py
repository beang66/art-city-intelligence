import html
import logging
import re

import httpx
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app import config

router = APIRouter(prefix="/api")
log = logging.getLogger(__name__)
REQUIRED = ("name", "phone", "email")
EMAIL = re.compile(r"[^\s@]+@[^\s@]+\.[^\s@]+")


def reply(message: str, status: int = 200, fields: list[str] | None = None) -> JSONResponse:
    body = {"message": message} if fields is None else {"message": message, "fields": fields}
    return JSONResponse(body, status_code=status)


def clean(value, max_length: int) -> str:
    # shortcut: slices by code point, the old route sliced UTF-16 units; differs only past the limit with emoji.
    return value.strip()[:max_length] if isinstance(value, str) else ""


@router.post("/contact")
async def contact(request: Request):
    try:
        body = await request.json()
    except ValueError:
        return reply("요청 형식이 올바르지 않습니다.", 400)
    if not isinstance(body, dict):
        body = {}

    if clean(body.get("website"), 200):  # honeypot field filled → pretend success
        return reply("메시지를 보냈습니다.")

    form = {"name": clean(body.get("name"), 80), "phone": clean(body.get("phone"), 40), "email": clean(body.get("email"), 160)}
    missing = [field for field in REQUIRED if not form[field]]
    if missing:
        return reply("모든 항목을 입력해 주세요.", 400, missing)
    if not EMAIL.fullmatch(form["email"]):
        return reply("올바른 이메일 주소를 입력해 주세요.", 400, ["email"])

    if not config.RESEND_API_KEY:
        log.error("Contact form: RESEND_API_KEY is not configured.")
        return reply("메일 전송 설정이 필요합니다. 관리자에게 문의해 주세요.", 503)

    esc = {k: html.escape(v, quote=True) for k, v in form.items()}
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {config.RESEND_API_KEY}"},
                json={
                    "from": config.CONTACT_FROM_EMAIL,
                    "to": [config.CONTACT_TO_EMAIL],
                    "reply_to": form["email"],
                    "subject": f"[Art City Intelligence] {form['name']}님의 새 문의",
                    "html": f"<h2>새로운 문의가 도착했습니다.</h2><p><strong>이름:</strong> {esc['name']}</p><p><strong>연락처:</strong> {esc['phone']}</p><p><strong>이메일:</strong> {esc['email']}</p>",
                },
            )
        except httpx.HTTPError as error:
            log.error("Contact form: email provider unreachable: %s", error)
            return reply("메일 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.", 502)
    if response.is_error:
        log.error("Contact form: email provider rejected the request. %s %s", response.status_code, response.text)
        return reply("메일 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.", 502)
    return reply("메시지를 보냈습니다.")
