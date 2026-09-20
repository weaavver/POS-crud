from fastapi import APIRouter
from datetime import datetime, timedelta, timezone
import random

from app.database import products_collection, db

router = APIRouter(prefix="/deals", tags=["deals"])
deals_collection = db.deals

DEAL_DURATION_HOURS = 24
PERCENT_OPTIONS = [10, 20, 30, 40, 50, 60, 70]


@router.get("/")
async def get_current_deals():
    existing = await deals_collection.find_one({"_id": "current"})
    now = datetime.now(timezone.utc)

    if existing:
        expires_at = existing["expires_at"]
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at > now:
            return existing["items"]

    previous_ids = [item["product_id"] for item in existing["items"]] if existing else []

    all_products = []
    async for p in products_collection.find({"price": {"$gt": 0}}):
        all_products.append(p)

    eligible = [p for p in all_products if str(p["_id"]) not in previous_ids]
    pool = eligible if len(eligible) >= 2 else all_products
    picks = random.sample(pool, min(2, len(pool)))

    items = [
        {"product_id": str(p["_id"]), "percent": random.choice(PERCENT_OPTIONS)}
        for p in picks
    ]

    await deals_collection.update_one(
        {"_id": "current"},
        {"$set": {
            "items": items,
            "generated_at": now,
            "expires_at": now + timedelta(hours=DEAL_DURATION_HOURS),
        }},
        upsert=True,
    )

    return items