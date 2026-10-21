from datetime import datetime
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.dependencies import get_current_active_user, get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User

router = APIRouter()


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class OrderCreate(BaseModel):
    shipping_address: Optional[str] = None
    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: str
    total_amount: float
    shipping_address: Optional[str]
    created_at: datetime
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=List[OrderResponse])
def get_user_orders(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Retrieve orders for the current authenticated user."""
    query = db.query(Order).filter(Order.user_id == current_user.id)
    return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Create a new order for current user and decrement product inventory."""
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item.",
        )

    total_amount = 0.0
    order_items_to_create = []

    for item in order_in.items:
        product = db.query(Product).filter(
            Product.id == item.product_id,
            Product.is_active.is_(True),
        ).with_for_update().first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product ID {item.product_id} not found.",
            )

        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}. Available: {product.stock}",
            )

        # Decrement inventory
        product.stock -= item.quantity
        line_total = product.price * item.quantity
        total_amount += line_total

        order_items_to_create.append(
            OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price=product.price,
            )
        )

    new_order = Order(
        user_id=current_user.id,
        status="pending",
        total_amount=round(total_amount, 2),
        shipping_address=order_in.shipping_address,
        items=order_items_to_create,
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Retrieve details of a specific order."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )
    if order.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this order.",
        )
    return order
