from decimal import Decimal
from unittest.mock import patch

import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app.api.routes.orders import _decrement_stock as real_decrement_stock
from app.models.artwork import Artwork
from app.models.cart import Cart, CartItem
from app.models.order import Order
from app.models.user import User


API_PREFIX = "/api/v1"


def register_and_login(client, name, email):
    response = client.post(
        f"{API_PREFIX}/auth/register",
        json={
            "name": name,
            "email": email,
            "password": "password123",
        },
    )
    assert response.status_code == 201
    response = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": email, "password": "password123"},
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def create_artwork(
    db_session,
    email,
    *,
    price="19.99",
    stock=5,
    status="published",
):
    seller = db_session.query(User).filter(User.email == email).one()
    artwork = Artwork(
        seller_id=seller.id,
        title=f"Artwork {price}",
        description="Order test artwork.",
        price=Decimal(price),
        stock_quantity=stock,
        category="Textiles",
        state="Punjab",
        image_url="https://example.com/artwork.jpg",
        status=status,
    )
    db_session.add(artwork)
    db_session.commit()
    db_session.refresh(artwork)
    return artwork


def add_cart_line(db_session, user_email, artwork, quantity=1):
    user = db_session.query(User).filter(User.email == user_email).one()
    cart = db_session.query(Cart).filter(Cart.user_id == user.id).first()
    if cart is None:
        cart = Cart(user_id=user.id)
        db_session.add(cart)
        db_session.flush()
    db_session.add(
        CartItem(
            cart_id=cart.id,
            artwork_id=artwork.id,
            quantity=quantity,
        )
    )
    db_session.commit()


def test_order_endpoints_require_authenticated_customer(client):
    assert client.post(f"{API_PREFIX}/orders").status_code == 401
    assert client.get(f"{API_PREFIX}/orders").status_code == 401
    assert client.get(f"{API_PREFIX}/orders/1").status_code == 401
    assert client.post(f"{API_PREFIX}/orders/1/cancel").status_code == 401


def test_checkout_rejects_empty_cart(client):
    headers = register_and_login(client, "Empty", "empty@example.com")

    response = client.post(f"{API_PREFIX}/orders", headers=headers)

    assert response.status_code == 400
    assert response.json()["detail"] == "Cart is empty."


@pytest.mark.parametrize(
    ("status", "stock"),
    [
        ("draft", 5),
        ("archived", 5),
        ("published", None),
        ("published", 0),
    ],
)
def test_checkout_rejects_unavailable_artwork(
    client,
    db_session,
    status,
    stock,
):
    stock_label = "unconfigured" if stock is None else str(stock)
    email = f"unavailable-{status}-{stock_label}@example.com"
    headers = register_and_login(client, "Unavailable", email)
    artwork = create_artwork(
        db_session,
        email,
        status=status,
        stock=stock,
    )
    add_cart_line(db_session, email, artwork)

    response = client.post(f"{API_PREFIX}/orders", headers=headers)

    assert response.status_code == 409
    assert db_session.query(Order).count() == 0


def test_checkout_rejects_insufficient_stock(client, db_session):
    email = "insufficient@example.com"
    headers = register_and_login(client, "Insufficient", email)
    artwork = create_artwork(db_session, email, stock=1)
    add_cart_line(db_session, email, artwork, quantity=2)

    response = client.post(f"{API_PREFIX}/orders", headers=headers)

    assert response.status_code == 409
    db_session.refresh(artwork)
    assert artwork.stock_quantity == 1
    assert db_session.query(Order).count() == 0


def test_checkout_creates_one_order_with_snapshots_and_clears_cart(
    client,
    db_session,
):
    email = "checkout@example.com"
    headers = register_and_login(client, "Checkout", email)
    first = create_artwork(db_session, email, price="12.50", stock=4)
    second = create_artwork(db_session, email, price="3.25", stock=6)
    add_cart_line(db_session, email, first, quantity=2)
    add_cart_line(db_session, email, second, quantity=3)

    response = client.post(f"{API_PREFIX}/orders", headers=headers)

    assert response.status_code == 201
    body = response.json()
    assert body["currency"] == "INR"
    assert body["status"] == "pending"
    assert body["subtotal"] == "34.75"
    assert body["total"] == "34.75"
    assert [
        (
            item["artwork_id"],
            item["listed_unit_price"],
            item["agreed_unit_price"],
            item["quantity"],
            item["line_total"],
        )
        for item in body["items"]
    ] == [
        (first.id, "12.50", "12.50", 2, "25.00"),
        (second.id, "3.25", "3.25", 3, "9.75"),
    ]

    db_session.refresh(first)
    db_session.refresh(second)
    assert first.stock_quantity == 2
    assert second.stock_quantity == 3
    customer = db_session.query(User).filter(User.email == email).one()
    cart = db_session.query(Cart).filter(Cart.user_id == customer.id).one()
    assert cart.items == []
    assert db_session.query(Order).count() == 1


def test_checkout_rejects_client_price_fields(client, db_session):
    email = "client-price@example.com"
    headers = register_and_login(client, "Client Price", email)
    artwork = create_artwork(db_session, email)
    add_cart_line(db_session, email, artwork)

    response = client.post(
        f"{API_PREFIX}/orders",
        headers=headers,
        json={"total": "0.01", "agreed_unit_price": "0.01"},
    )

    assert response.status_code == 422
    assert db_session.query(Order).count() == 0


def test_later_stock_failure_rolls_back_entire_checkout(
    client,
    db_session,
):
    email = "rollback@example.com"
    headers = register_and_login(client, "Rollback", email)
    first = create_artwork(db_session, email, stock=4)
    second = create_artwork(db_session, email, stock=4)
    add_cart_line(db_session, email, first, quantity=2)
    add_cart_line(db_session, email, second, quantity=2)

    calls = 0

    def decrement_then_fail(db, artwork_id, quantity):
        nonlocal calls
        calls += 1
        if calls == 1:
            return real_decrement_stock(db, artwork_id, quantity)
        return False

    with patch(
        "app.api.routes.orders._decrement_stock",
        side_effect=decrement_then_fail,
    ):
        response = client.post(f"{API_PREFIX}/orders", headers=headers)

    assert response.status_code == 409
    db_session.refresh(first)
    db_session.refresh(second)
    assert first.stock_quantity == 4
    assert second.stock_quantity == 4
    assert db_session.query(Order).count() == 0
    assert db_session.query(CartItem).count() == 2


def test_customer_can_only_read_and_cancel_own_order(client, db_session):
    first_email = "owner@example.com"
    second_email = "other@example.com"
    first_headers = register_and_login(client, "Owner", first_email)
    second_headers = register_and_login(client, "Other", second_email)
    artwork = create_artwork(db_session, first_email)
    add_cart_line(db_session, first_email, artwork)
    checkout = client.post(f"{API_PREFIX}/orders", headers=first_headers)
    order_id = checkout.json()["id"]

    assert client.get(
        f"{API_PREFIX}/orders",
        headers=second_headers,
    ).json() == []
    assert client.get(
        f"{API_PREFIX}/orders/{order_id}",
        headers=second_headers,
    ).status_code == 404
    assert client.post(
        f"{API_PREFIX}/orders/{order_id}/cancel",
        headers=second_headers,
    ).status_code == 404


def test_cancelling_pending_order_restores_stock_once(client, db_session):
    email = "cancel@example.com"
    headers = register_and_login(client, "Cancel", email)
    artwork = create_artwork(db_session, email, stock=5)
    add_cart_line(db_session, email, artwork, quantity=2)
    checkout = client.post(f"{API_PREFIX}/orders", headers=headers)
    order_id = checkout.json()["id"]

    response = client.post(
        f"{API_PREFIX}/orders/{order_id}/cancel",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"
    db_session.refresh(artwork)
    assert artwork.stock_quantity == 5

    repeated = client.post(
        f"{API_PREFIX}/orders/{order_id}/cancel",
        headers=headers,
    )
    assert repeated.status_code == 409
    db_session.refresh(artwork)
    assert artwork.stock_quantity == 5


def test_failed_stock_restoration_rolls_back_cancellation(client, db_session):
    email = "restore-failure@example.com"
    headers = register_and_login(client, "Restore Failure", email)
    artwork = create_artwork(db_session, email, stock=5)
    add_cart_line(db_session, email, artwork, quantity=2)
    checkout = client.post(f"{API_PREFIX}/orders", headers=headers)
    order_id = checkout.json()["id"]

    with patch("app.api.routes.orders._restore_stock", return_value=False):
        response = client.post(
            f"{API_PREFIX}/orders/{order_id}/cancel",
            headers=headers,
        )

    assert response.status_code == 409
    order = db_session.get(Order, order_id)
    db_session.refresh(artwork)
    assert order.status == "pending"
    assert artwork.stock_quantity == 3


def test_customer_deletion_is_restricted_by_historical_order(
    client,
    db_session,
):
    email = "historical@example.com"
    headers = register_and_login(client, "Historical", email)
    artwork = create_artwork(db_session, email)
    add_cart_line(db_session, email, artwork)
    checkout = client.post(f"{API_PREFIX}/orders", headers=headers)
    assert checkout.status_code == 201

    db_session.execute(text("PRAGMA foreign_keys=ON"))
    user = db_session.query(User).filter(User.email == email).one()
    db_session.delete(user)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()
