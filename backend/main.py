"""Art City Intelligence API. Run: uvicorn main:app --reload (from backend/)."""
from fastapi import FastAPI

from app.routers import cities, contact, meta, opportunity

app = FastAPI(title="Art City Intelligence API", version="1.0.0")
app.include_router(meta.router)
app.include_router(cities.router)
app.include_router(contact.router)
app.include_router(opportunity.router)
