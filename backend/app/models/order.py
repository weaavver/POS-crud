from pydantic import BaseModel
from typing import List
from datetime import datetime


class OrderItem(BaseModel):
    product_id: str
    title: str
    price: float
    download_url: str


class OrderCreate(BaseModel):
    items: List[OrderItem]


class OrderOut(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    total: float
    created_at: datetime