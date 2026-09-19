from fastapi import APIRouter, HTTPException, Depends, status
from bson import ObjectId
from bson.errors import InvalidId
from typing import List, Optional

from app.database import products_collection
from app.models.product import ProductCreate, ProductUpdate, ProductOut
from app.utils.security import require_admin, get_optional_admin

router = APIRouter(prefix="/products", tags=["products"])


def product_helper(product, include_download_url: bool = True) -> dict:
    product["id"] = str(product["_id"])
    del product["_id"]
    if not include_download_url:
        product["download_url"] = None
    return product


@router.get("/", response_model=List[ProductOut])
async def get_products(type: Optional[str] = None, is_admin: bool = Depends(get_optional_admin)):
    query = {}
    if type:
        query["type"] = type

    products = []
    async for product in products_collection.find(query).sort("_id", -1):
        products.append(product_helper(product, include_download_url=is_admin))
    return products


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str, is_admin: bool = Depends(get_optional_admin)):
    try:
        obj_id = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    product = await products_collection.find_one({"_id": obj_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_helper(product, include_download_url=is_admin)


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, admin=Depends(require_admin)):
    result = await products_collection.insert_one(product.model_dump())
    new_product = await products_collection.find_one({"_id": result.inserted_id})
    return product_helper(new_product)


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(product_id: str, product: ProductUpdate, admin=Depends(require_admin)):
    try:
        obj_id = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await products_collection.update_one({"_id": obj_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    updated = await products_collection.find_one({"_id": obj_id})
    return product_helper(updated)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, admin=Depends(require_admin)):
    try:
        obj_id = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = await products_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return None