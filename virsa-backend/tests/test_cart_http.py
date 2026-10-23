from decimal import Decimal
from unittest.mock import patch

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.artwork import Artwork
from app.models.cart import Cart, CartItem
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


def create_artwork(db_session, email, *, status="published", stock=5, price="19.99"):
    seller = db_session.query(User).filter(User.email == email).first()
    assert seller is not None
    artwork = Artwork(
        seller_id=seller.id,
        title="Test artwork",
        description="A test artwork for cart coverage.",
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


def test_cart_requires_authenticated_customer(client):
    response = client.get(f"{API_PREFIX}/cart")

    assert response.status_code == 401


def test_cart_rejects_non_customer_role(client, db_session):
    headers = register_and_login(client, "Seller", "seller@example.com")
    user = db_session.query(User).filter(User.email == "seller@example.com").one()
    user.role = "seller"
    db_session.commit()

    response = client.get(f"{API_PREFIX}/cart", headers=headers)

    assert response.status_code == 403


def test_customer_can_add_update_remove_and_retrieve_cart(
    client, db_session
):
    headers = register_and_login(client, "Customer", "customer@example.com")
    artwork = create_artwork(db_session, "customer@example.com", price="12.50")

    response = client.post(
        f"{API_PREFIX}/cart/items",
        headers=headers,
        json={"artwork_id": artwork.id, "quantity": 2},
    )

    assert response.status_code == 201
    assert response.json()["subtotal"] == "25.00"
    assert response.json()["items"][0]["unit_price"] == "12.50"
    assert response.json()["items"][0]["available"] is True

    response = client.patch(
        f"{API_PREFIX}/cart/items/{artwork.id}",
        headers=headers,
        json={"quantity": 3},
    )

    assert response.status_code == 200
    assert response.json()["subtotal"] == "37.50"

    response = client.get(f"{API_PREFIX}/cart", headers=headers)
    assert response.status_code == 200
    assert response.json()["items"][0]["quantity"] == 3

    response = client.delete(
        f"{API_PREFIX}/cart/items/{artwork.id}",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["items"] == []
    assert response.json()["subtotal"] == "0.00"


def test_cart_is_isolated_between_customers(client, db_session):
    first_headers = register_and_login(client, "First", "first@example.com")
    second_headers = register_and_login(client, "Second", "second@example.com")
    artwork = create_artwork(db_session, "first@example.com")

    add_response = client.post(
        f"{API_PREFIX}/cart/items",
        headers=first_headers,
        json={"artwork_id": artwork.id},
    )
    assert add_response.status_code == 201

    second_cart = client.get(
        f"{API_PREFIX}/cart",
        headers=second_headers,
    )
    assert second_cart.status_code == 200
    assert second_cart.json()["items"] == []

    update_response = client.patch(
        f"{API_PREFIX}/cart/items/{artwork.id}",
        headers=second_headers,
        json={"quantity": 2},
    )
    assert update_response.status_code == 404


@pytest.mark.parametrize(
    "payload",
    [
        {"artwork_id": 0, "quantity": 1},
        {"artwork_id": 1, "quantity": 0},
        {"artwork_id": 1, "quantity": -1},
    ],
)
def test_cart_rejects_invalid_ids_and_quantities(client, payload):
    headers = register_and_login(client, "Customer", "invalid@example.com")

    response = client.post(
        f"{API_PREFIX}/cart/items",
        headers=headers,
        json=payload,
    )

    assert response.status_code == 422


def test_cart_rejects_missing_unpublished_and_insufficient_stock(
    client, db_session
):
    headers = register_and_login(client, "Customer", "availability@example.com")
    unpublished = create_artwork(
        db_session,
        "availability@example.com",
        status="draft",
    )
    published = create_artwork(
        db_session,
        "availability@example.com",
        stock=2,
    )

    missing = client.post(
        f"{API_PREFIX}/cart/items",
        headers=headers,
        json={"artwork_id": 9999},
    )
    assert missing.status_code == 404

    unavailable = client.post(
        f"{API_PREFIX}/cart/items",
        headers=headers,
        json={"artwork_id": unpublished.id},
    )
    assert unavailable.status_code == 409

    insufficient = client.post(
        f"{API_PREFIX}/cart/items",
        headers=headers,
        json={"artwork_id": published.id, "quantity": 3},
    )
    assert insufficient.status_code == 409


def test_cart_keeps_unavailable_items_visible_with_availability_flag(
    client, db_session
):
    headers = register_and_login(
        client,
        "Availability Customer",
        "availability-visibility@example.com",
    )
    user = db_session.query(User).filter(
        User.email == "availability-visibility@example.com"
    ).one()
    cart = Cart(user_id=user.id)
    db_session.add(cart)
    db_session.flush()

    artworks = [
        create_artwork(
            db_session,
            "availability-visibility@example.com",
            status="published",
            stock=3,
            price="10.00",
        ),
        create_artwork(
            db_session,
            "availability-visibility@example.com",
            status="draft",
            stock=3,
            price="11.00",
        ),
        create_artwork(
            db_session,
            "availability-visibility@example.com",
            status="archived",
            stock=3,
            price="12.00",
        ),
    ]
    artworks[0].stock_quantity = None
    zero_stock = create_artwork(
        db_session,
        "availability-visibility@example.com",
        status="published",
        stock=0,
        price="13.00",
    )
    db_session.add_all(
        [
            CartItem(cart_id=cart.id, artwork_id=artwork.id, quantity=1)
            for artwork in [*artworks, zero_stock]
        ]
    )
    db_session.commit()

    response = client.get(f"{API_PREFIX}/cart", headers=headers)

    assert response.status_code == 200
    availability = {
        item["artwork_id"]: item["available"]
        for item in response.json()["items"]
    }
    assert availability == {artwork.id: False for artwork in [*artworks, zero_stock]}


def test_cart_rejects_duplicate_lines_and_uses_current_price(
    client, db_session
):
    headers = register_and_login(client, "Customer", "price@example.com")
    artwork = create_artwork(db_session, "price@example.com", price="10.00")

    first = client.post(
        f"{API_PREFIX}/cart/items",
        headers=headers,
        json={"artwork_id": artwork.id},
    )
    assert first.status_code == 201

    duplicate = client.post(
        f"{API_PREFIX}/cart/items",
        headers=headers,
        json={"artwork_id": artwork.id},
    )
    assert duplicate.status_code == 409

    artwork.price = Decimal("15.25")
    db_session.commit()

    cart = client.get(f"{API_PREFIX}/cart", headers=headers)
    assert cart.status_code == 200
    assert cart.json()["items"][0]["unit_price"] == "15.25"
    assert cart.json()["subtotal"] == "15.25"


def test_cart_duplicate_integrity_error_returns_conflict_and_rolls_back(
    client, db_session
):
    headers = register_and_login(
        client,
        "Concurrent Customer",
        "concurrent@example.com",
    )
    artwork = create_artwork(db_session, "concurrent@example.com")

    integrity_error = IntegrityError(
        "insert",
        {},
        Exception("uq_cart_items_cart_artwork"),
    )
    with patch(
        "app.api.routes.cart.Session.commit",
        side_effect=integrity_error,
    ) as commit:
        response = client.post(
            f"{API_PREFIX}/cart/items",
            headers=headers,
            json={"artwork_id": artwork.id},
        )

    assert response.status_code == 409
    assert response.json()["detail"] == "Artwork is already in the cart."
    commit.assert_called_once()


def test_cart_database_constraints_prevent_duplicate_lines_and_bad_quantity(
    db_session,
):
    user = User(
        name="Constraint User",
        email="constraint@example.com",
        hashed_password="hash",
        role="customer",
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    artwork = Artwork(
        seller_id=user.id,
        title="Constraint artwork",
        description="A test artwork for database constraints.",
        price=Decimal("10.00"),
        stock_quantity=1,
        category="Textiles",
        state="Punjab",
        image_url="https://example.com/artwork.jpg",
        status="published",
    )
    cart = Cart(user_id=user.id)
    db_session.add_all([artwork, cart])
    db_session.flush()

    db_session.add(CartItem(cart_id=cart.id, artwork_id=artwork.id, quantity=1))
    db_session.commit()

    db_session.add(CartItem(cart_id=cart.id, artwork_id=artwork.id, quantity=1))
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()

    db_session.add(CartItem(cart_id=cart.id, artwork_id=artwork.id, quantity=0))
    with pytest.raises(IntegrityError):
        db_session.commit()
