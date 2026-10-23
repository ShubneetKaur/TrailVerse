from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_role
from app.models.artwork import Artwork
from app.models.cart import Cart, CartItem
from app.models.user import User
from app.schemas.cart import (
    CartItemCreate,
    CartItemResponse,
    CartItemUpdate,
    CartResponse,
)

router = APIRouter(prefix="/cart", tags=["cart"])


def _is_available(artwork: Artwork) -> bool:
    return (
        artwork.status == "published"
        and artwork.stock_quantity is not None
        and artwork.stock_quantity > 0
    )


def _is_cart_item_uniqueness_error(exc: IntegrityError) -> bool:
    constraint_name = getattr(
        getattr(exc.orig, "diag", None),
        "constraint_name",
        None,
    )
    return constraint_name == "uq_cart_items_cart_artwork" or (
        "uq_cart_items_cart_artwork" in str(exc.orig)
    )


def _get_or_create_cart(db: Session, user_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if cart is None:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.flush()
    return cart


def _cart_response(cart: Cart) -> CartResponse:
    items = [
        CartItemResponse(
            id=item.id,
            artwork_id=item.artwork_id,
            quantity=item.quantity,
            unit_price=item.artwork.price,
            subtotal=item.artwork.price * item.quantity,
            title=item.artwork.title,
            image_url=item.artwork.image_url,
            available=_is_available(item.artwork),
        )
        for item in cart.items
    ]
    return CartResponse(
        id=cart.id,
        items=items,
        subtotal=sum(
            (item.subtotal for item in items),
            start=Decimal("0.00"),
        ),
    )


def _get_cart_item(
    db: Session,
    cart_id: int,
    artwork_id: int,
) -> CartItem | None:
    return (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart_id,
            CartItem.artwork_id == artwork_id,
        )
        .first()
    )


@router.get("", response_model=CartResponse)
def get_cart(
    current_user: Annotated[User, Depends(require_role("customer"))],
    db: Annotated[Session, Depends(get_db)],
) -> CartResponse:
    cart = _get_or_create_cart(db, current_user.id)
    db.commit()
    return _cart_response(cart)


@router.post(
    "/items",
    response_model=CartResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_cart_item(
    payload: CartItemCreate,
    current_user: Annotated[User, Depends(require_role("customer"))],
    db: Annotated[Session, Depends(get_db)],
) -> CartResponse:
    artwork = db.get(Artwork, payload.artwork_id)
    if artwork is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artwork not found.",
        )
    if not _is_available(artwork):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Artwork is not available.",
        )
    if payload.quantity > artwork.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Requested quantity exceeds available stock.",
        )

    cart = _get_or_create_cart(db, current_user.id)
    if _get_cart_item(db, cart.id, artwork.id) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Artwork is already in the cart.",
        )

    db.add(
        CartItem(
            cart_id=cart.id,
            artwork_id=artwork.id,
            quantity=payload.quantity,
        )
    )
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        if _is_cart_item_uniqueness_error(exc):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Artwork is already in the cart.",
            ) from exc
        raise
    db.refresh(cart)
    return _cart_response(cart)


@router.patch("/items/{artwork_id}", response_model=CartResponse)
def update_cart_item(
    artwork_id: int,
    payload: CartItemUpdate,
    current_user: Annotated[User, Depends(require_role("customer"))],
    db: Annotated[Session, Depends(get_db)],
) -> CartResponse:
    cart = _get_or_create_cart(db, current_user.id)
    item = _get_cart_item(db, cart.id, artwork_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found.",
        )
    if not _is_available(item.artwork):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Artwork is not available.",
        )
    if payload.quantity > item.artwork.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Requested quantity exceeds available stock.",
        )

    item.quantity = payload.quantity
    db.commit()
    db.refresh(cart)
    return _cart_response(cart)


@router.delete("/items/{artwork_id}", response_model=CartResponse)
def remove_cart_item(
    artwork_id: int,
    current_user: Annotated[User, Depends(require_role("customer"))],
    db: Annotated[Session, Depends(get_db)],
) -> CartResponse:
    cart = _get_or_create_cart(db, current_user.id)
    item = _get_cart_item(db, cart.id, artwork_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found.",
        )

    db.delete(item)
    db.commit()
    db.refresh(cart)
    return _cart_response(cart)
