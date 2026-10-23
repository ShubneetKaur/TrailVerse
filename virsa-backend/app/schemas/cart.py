from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CartItemCreate(BaseModel):
    artwork_id: int = Field(gt=0)
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemResponse(BaseModel):
    id: int
    artwork_id: int
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    title: str
    image_url: str
    available: bool

    model_config = ConfigDict(from_attributes=True)


class CartResponse(BaseModel):
    id: int
    items: list[CartItemResponse]
    subtotal: Decimal
