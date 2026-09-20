from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timedelta, timezone
import random

from app.database import products_collection, deals_collection, manual_deals_collection
from app.models.deal import DealSet
from app.utils.security import require_admin

router = APIRouter(prefix="/deals", tags=["deals"])

DEAL_DURATION_HOURS = 24
PERCENT_OPTIONS = [10, 20, 30, 40, 50, 60, 70]
DAILY_DEAL_COUNT = 2


async def get_active_deals():
    """The deals in effect right now, as [{product_id, percent}].

    If the admin hand-picked any games, those are the deals. Otherwise the
    shop falls back to the daily random pair. Deals whose game has been
    deleted are always ignored, so the section never breaks or goes empty
    just because someone removed a product.
    """
    products = [p async for p in products_collection.find({}, {"price": 1})]
    existing_ids = {str(p["_id"]) for p in products}

    manual = [
        {"product_id": d["_id"], "percent": d["percent"]}
        async for d in manual_deals_collection.find()
        if d["_id"] in existing_ids
    ]
    if manual:
        return manual

    paid = [p for p in products if p.get("price", 0) > 0]
    return await daily_deals(paid)


async def daily_deals(paid):
    """Two random discounted games, rotated every 24 hours."""
    paid_ids = {str(p["_id"]) for p in paid}
    if not paid_ids:
        return []

    now = datetime.now(timezone.utc)
    existing = await deals_collection.find_one({"_id": "current"})

    items = []
    previous_ids = []
    still_running = False
    expires_at = now + timedelta(hours=DEAL_DURATION_HOURS)

    if existing:
        previous_ids = [i["product_id"] for i in existing["items"]]
        expires = existing["expires_at"]
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires > now:
            still_running = True
            expires_at = expires
            # keep the deals whose game still exists
            items = [i for i in existing["items"] if i["product_id"] in paid_ids]

    wanted = min(DAILY_DEAL_COUNT, len(paid_ids))
    if still_running and len(items) >= wanted:
        return items

    # Expired, or a deleted game left a gap: fill up with new random picks.
    missing = wanted - len(items)
    taken = {i["product_id"] for i in items}
    candidates = [p for p in paid if str(p["_id"]) not in taken]
    fresh = [p for p in candidates if str(p["_id"]) not in previous_ids]
    pool = fresh if len(fresh) >= missing else candidates
    picks = random.sample(pool, min(missing, len(pool)))
    items += [
        {"product_id": str(p["_id"]), "percent": random.choice(PERCENT_OPTIONS)}
        for p in picks
    ]

    update = {"items": items, "expires_at": expires_at}
    if not still_running:
        update["generated_at"] = now
    await deals_collection.update_one({"_id": "current"}, {"$set": update}, upsert=True)
    return items


@router.get("/")
async def get_current_deals():
    return await get_active_deals()


@router.get("/manual")
async def get_manual_deals(admin=Depends(require_admin)):
    """The games the admin hand-picked (used by the admin dashboard)."""
    return [
        {"product_id": d["_id"], "percent": d["percent"]}
        async for d in manual_deals_collection.find()
    ]


@router.put("/manual/{product_id}")
async def set_manual_deal(product_id: str, deal: DealSet, admin=Depends(require_admin)):
    try:
        obj_id = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    product = await products_collection.find_one({"_id": obj_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.get("price", 0) <= 0:
        raise HTTPException(status_code=400, detail="Free products can't be put on sale")

    await manual_deals_collection.update_one(
        {"_id": product_id}, {"$set": {"percent": deal.percent}}, upsert=True
    )
    return {"product_id": product_id, "percent": deal.percent}


@router.delete("/manual/{product_id}", status_code=204)
async def remove_manual_deal(product_id: str, admin=Depends(require_admin)):
    await manual_deals_collection.delete_one({"_id": product_id})
    return None