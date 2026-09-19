from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timezone
from typing import List

from app.database import orders_collection
from app.models.order import OrderCreate, OrderOut
from app.utils.security import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])


def order_helper(order) -> dict:
    order["id"] = str(order["_id"])
    del order["_id"]
    return order


@router.post("/", response_model=OrderOut, status_code=201)
async def create_order(order: OrderCreate, current_user: dict = Depends(get_current_user)):
    if not order.items:
        raise HTTPException(status_code=400, detail="Cannot place an empty order")

    total = sum(item.price for item in order.items)

    order_doc = {
        "user_id": str(current_user["_id"]),
        "items": [item.model_dump() for item in order.items],
        "total": total,
        "created_at": datetime.now(timezone.utc),
    }
    result = await orders_collection.insert_one(order_doc)
    new_order = await orders_collection.find_one({"_id": result.inserted_id})
    return order_helper(new_order)


@router.get("/", response_model=List[OrderOut])
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    orders = []
    async for order in orders_collection.find({"user_id": str(current_user["_id"])}).sort("created_at", -1):
        orders.append(order_helper(order))
    return orders


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(order_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid order ID")

    order = await orders_collection.find_one({"_id": obj_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only the owner (or an admin) can view it
    if order["user_id"] != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    return order_helper(order)