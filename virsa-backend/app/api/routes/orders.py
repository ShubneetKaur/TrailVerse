from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import update
from sqlalchemy.orm import Session, selectinload

from app.dependencies import get_db, require_role
from app.models.artwork import Artwork
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.order import (
    CheckoutRequest,
    OrderResponse,
    OrderStatus,
)

router = APIRouter(prefix="/orders", tags=["orders"])

MONEY_QUANTUM = Decimal("0.01")


def _money(value: Decimal) -> Decimal:
    return Decimal(str(value)).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)


def _customer_order_query(db: Session, customer_id: int):
    return (
        db.query(Order)
        .options(selectinload(Order.items))
        .filter(Order.customer_id == customer_id)
    )


def _get_owned_order(
    db: Session,
    order_id: int,
    customer_id: int,
) -> Order:
    order = _customer_order_query(db, customer_id).filter(
        Order.id == order_id
    ).first()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )
    return order


def _decrement_stock(db: Session, artwork_id: int, quantity: int) -> bool:
    result = db.execute(
        update(Artwork)
        .where(
            Artwork.id == artwork_id,
            Artwork.status == "published",
            Artwork.stock_quantity.is_not(None),
            Artwork.stock_quantity >= quantity,
        )
        .values(stock_quantity=Artwork.stock_quantity - quantity)
    )
    return result.rowcount == 1


def _restore_stock(db: Session, artwork_id: int, quantity: int) -> bool:
    result = db.execute(
        update(Artwork)
        .where(
            Artwork.id == artwork_id,
            Artwork.stock_quantity.is_not(None),
        )
        .values(stock_quantity=Artwork.stock_quantity + quantity)
    )
    return result.rowcount == 1


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def checkout(
    current_user: Annotated[User, Depends(require_role("customer"))],
    db: Annotated[Session, Depends(get_db)],
    _payload: CheckoutRequest | None = None,
) -> OrderResponse:
    db.rollback()
    try:
        cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
        if cart is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty.",
            )

        cart_items = (
            db.query(CartItem)
            .filter(CartItem.cart_id == cart.id)
            .order_by(CartItem.artwork_id.asc())
            .all()
        )
        if not cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty.",
            )

        for item in cart_items:
            artwork = item.artwork
            if (
                artwork.status != "published"
                or artwork.stock_quantity is None
                or artwork.stock_quantity <= 0
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        f"Artwork {item.artwork_id} is no longer available."
                    ),
                )

        snapshots: list[tuple[CartItem, Decimal, Decimal, Decimal]] = []
        subtotal = Decimal("0.00")
        for item in cart_items:
            listed_price = _money(item.artwork.price)
            agreed_price = listed_price
            line_total = _money(agreed_price * item.quantity)
            subtotal = _money(subtotal + line_total)
            snapshots.append((item, listed_price, agreed_price, line_total))

        for item, _, _, _ in snapshots:
            if not _decrement_stock(db, item.artwork_id, item.quantity):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        f"Artwork {item.artwork_id} does not have "
                        "enough available stock."
                    ),
                )

        order = Order(
            customer_id=current_user.id,
            status=OrderStatus.pending.value,
            currency="INR",
            subtotal=subtotal,
            total=subtotal,
        )
        db.add(order)
        db.flush()

        for item, listed_price, agreed_price, line_total in snapshots:
            db.add(
                OrderItem(
                    order_id=order.id,
                    artwork_id=item.artwork_id,
                    title=item.artwork.title,
                    listed_unit_price=listed_price,
                    agreed_unit_price=agreed_price,
                    quantity=item.quantity,
                    line_total=line_total,
                )
            )
            db.delete(item)

        db.commit()
        db.refresh(order)
        return order
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


@router.get("", response_model=list[OrderResponse])
def list_orders(
    current_user: Annotated[User, Depends(require_role("customer"))],
    db: Annotated[Session, Depends(get_db)],
) -> list[OrderResponse]:
    return _customer_order_query(
        db,
        current_user.id,
    ).order_by(Order.created_at.desc(), Order.id.desc()).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: Annotated[User, Depends(require_role("customer"))],
    db: Annotated[Session, Depends(get_db)],
) -> OrderResponse:
    return _get_owned_order(db, order_id, current_user.id)


@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    current_user: Annotated[User, Depends(require_role("customer"))],
    db: Annotated[Session, Depends(get_db)],
) -> OrderResponse:
    db.rollback()
    try:
        order = _get_owned_order(db, order_id, current_user.id)
        transition = db.execute(
            update(Order)
            .where(
                Order.id == order_id,
                Order.customer_id == current_user.id,
                Order.status == OrderStatus.pending.value,
            )
            .values(
                status=OrderStatus.cancelled.value,
                cancelled_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
        )
        if transition.rowcount != 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only pending orders can be cancelled.",
            )

        for item in order.items:
            if not _restore_stock(db, item.artwork_id, item.quantity):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Could not restore order inventory.",
                )

        db.commit()
        db.expire_all()
        return _get_owned_order(db, order_id, current_user.id)
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
