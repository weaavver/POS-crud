from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class OrderItem(BaseModel):
    product_id: str
    title: str
    price: float  # what the customer was actually charged (after any deal)
    # Only set when a deal applied at the time of purchase; older orders don't have them.
    original_price: Optional[float] = None
    discount_percent: Optional[int] = None
    download_url: str


class OrderCreate(BaseModel):
    product_ids: List[str]


class OrderOut(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    total: float
    created_at: datetime