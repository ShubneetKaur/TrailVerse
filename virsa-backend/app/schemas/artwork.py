
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class ArtworkCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(min_length=1)
    price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    category: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    image_url: str = Field(min_length=1, max_length=2048)
    cloudinary_public_id: str | None = Field(
    default=None,
    max_length=255,
)


class ArtworkUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = Field(default=None, min_length=1)
    price: Decimal | None = Field(
        default=None, ge=0, max_digits=10, decimal_places=2
    )
    category: str | None = Field(default=None, min_length=1, max_length=100)
    state: str | None = Field(default=None, min_length=1, max_length=100)
    image_url: str | None = Field(default=None, min_length=1, max_length=2048)


class ArtworkResponse(BaseModel):
    id: int
    seller_id: int
    title: str
    description: str
    price: Decimal
    category: str
    state: str
    image_url: str
    status: str
    created_at: datetime
    updated_at: datetime
    cloudinary_public_id: str | None = None

    model_config = ConfigDict(from_attributes=True)
