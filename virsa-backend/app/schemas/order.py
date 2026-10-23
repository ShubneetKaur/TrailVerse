from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict


class OrderStatus(str, Enum):
    pending = "pending"
    cancelled = "cancelled"


class CheckoutRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")


class OrderItemResponse(BaseModel):
    id: int
    artwork_id: int
    title: str
    listed_unit_price: Decimal
    agreed_unit_price: Decimal
    quantity: int
    line_total: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    status: OrderStatus
    currency: str
    subtotal: Decimal
    total: Decimal
    created_at: datetime
    updated_at: datetime
    cancelled_at: datetime | None
    items: list[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
