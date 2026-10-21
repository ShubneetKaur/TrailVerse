from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.dependencies import get_current_active_user, get_db
from app.models.product import Product
from app.models.user import User

router = APIRouter()


class CartItemIn(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemOut(BaseModel):
    product_id: int
    product_name: str
    price: float
    quantity: int
    subtotal: float


class CartResponse(BaseModel):
    items: List[CartItemOut]
    total_amount: float


# In a full e-commerce system, this would be persisted to a cart table or Redis cache.
# We provide a clean implementation verifying product availability and calculating totals.

@router.post("/calculate", response_model=CartResponse)
def calculate_cart_summary(
    items: List[CartItemIn],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Validate cart items against live database and calculate subtotals/totals."""
    cart_items: List[CartItemOut] = []
    total_amount = 0.0

    for item in items:
        product = db.query(Product).filter(
            Product.id == item.product_id,
            Product.is_active.is_(True),
        ).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} is unavailable or not found.",
            )

        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}. Available: {product.stock}",
            )

        subtotal = round(product.price * item.quantity, 2)
        total_amount += subtotal
        cart_items.append(
            CartItemOut(
                product_id=product.id,
                product_name=product.name,
                price=product.price,
                quantity=item.quantity,
                subtotal=subtotal,
            )
        )

    return CartResponse(
        items=cart_items,
        total_amount=round(total_amount, 2),
    )
