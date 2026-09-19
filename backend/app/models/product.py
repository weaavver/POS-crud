from pydantic import BaseModel
from typing import Optional, List, Literal


class SystemRequirements(BaseModel):
    os: Optional[str] = None
    processor: Optional[str] = None
    memory: Optional[str] = None
    graphics: Optional[str] = None
    directx: Optional[str] = None
    storage: Optional[str] = None


class ProductBase(BaseModel):
    title: str
    description: str
    price: float
    type: Literal["game", "book"]
    platform: str
    cover_image: Optional[str] = None
    gallery_images: List[str] = []
    download_url: str
    system_requirements: Optional[SystemRequirements] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    type: Optional[Literal["game", "book"]] = None
    platform: Optional[str] = None
    cover_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    download_url: Optional[str] = None
    system_requirements: Optional[SystemRequirements] = None


class ProductOut(ProductBase):
    id: str