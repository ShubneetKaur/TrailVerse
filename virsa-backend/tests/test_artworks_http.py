import pytest

from app.models.user import User
from app.models.seller_application import SellerApplication
from app.models.artwork import Artwork


def register_and_login(client, name, email, password="password123"):
    response = client.post(
        "/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
        },
    )
    assert response.status_code == 201

    response = client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200

    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def approve_seller(db_session, email):
    user = db_session.query(User).filter(User.email == email).first()
    assert user is not None

    application = SellerApplication(
        applicant_id=user.id,
        business_name="Heritage Studio",
        description=(
            "We create and sell traditional handcrafted goods "
            "made by skilled local artisans."
        ),
        status="approved",
    )
    user.role = "seller"

    db_session.add(application)
    db_session.commit()
    db_session.refresh(user)

    return user


def artwork_payload(**overrides):
    payload = {
        "title": "Handwoven Shawl",
        "description": "A traditional handwoven wool shawl.",
        "price": "1499.00",
        "category": "Textiles",
        "state": "Himachal Pradesh",
        "image_url": "https://example.com/shawl.jpg",
    }
    payload.update(overrides)
    return payload


def create_artwork(client, headers, **overrides):
    return client.post(
        "/artworks",
        headers=headers,
        json=artwork_payload(**overrides),
    )


def test_approved_seller_can_create_draft(client, db_session):
    headers = register_and_login(
        client, "Seller One", "seller1@example.com"
    )
    approve_seller(db_session, "seller1@example.com")

    response = create_artwork(client, headers)

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Handwoven Shawl"
    assert data["status"] == "draft"
    assert data["seller_id"] is not None


def test_customer_cannot_create_artwork(client):
    headers = register_and_login(
        client, "Customer One", "customer1@example.com"
    )

    response = create_artwork(client, headers)

    assert response.status_code == 403


def test_unauthenticated_user_cannot_create_artwork(client):
    response = client.post("/artworks", json=artwork_payload())

    assert response.status_code == 401


def test_seller_can_edit_own_artwork(client, db_session):
    headers = register_and_login(
        client, "Seller Two", "seller2@example.com"
    )
    approve_seller(db_session, "seller2@example.com")

    created = create_artwork(client, headers)
    assert created.status_code == 201
    artwork_id = created.json()["id"]

    response = client.patch(
        f"/artworks/{artwork_id}",
        headers=headers,
        json={"title": "Updated Shawl", "price": "1799.00"},
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Updated Shawl"
    assert response.json()["price"] == "1799.00"


def test_seller_cannot_edit_another_sellers_artwork(client, db_session):
    owner_headers = register_and_login(
        client, "Owner", "owner@example.com"
    )
    other_headers = register_and_login(
        client, "Other Seller", "other@example.com"
    )
    approve_seller(db_session, "owner@example.com")
    approve_seller(db_session, "other@example.com")

    created = create_artwork(client, owner_headers)
    assert created.status_code == 201
    artwork_id = created.json()["id"]

    response = client.patch(
        f"/artworks/{artwork_id}",
        headers=other_headers,
        json={"title": "Stolen Edit"},
    )

    assert response.status_code == 403


def test_seller_can_publish_own_draft(client, db_session):
    headers = register_and_login(
        client, "Seller Three", "seller3@example.com"
    )
    approve_seller(db_session, "seller3@example.com")

    created = create_artwork(client, headers)
    assert created.status_code == 201
    artwork_id = created.json()["id"]

    response = client.patch(
        f"/artworks/{artwork_id}/publish",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "published"


def test_public_catalog_hides_drafts_and_shows_published(
    client, db_session
):
    headers = register_and_login(
        client, "Seller Four", "seller4@example.com"
    )
    approve_seller(db_session, "seller4@example.com")

    draft = create_artwork(
        client, headers, title="Private Draft"
    )
    published = create_artwork(
        client, headers, title="Public Shawl"
    )
    assert draft.status_code == 201
    assert published.status_code == 201

    draft_id = draft.json()["id"]
    published_id = published.json()["id"]

    publish_response = client.patch(
        f"/artworks/{published_id}/publish",
        headers=headers,
    )
    assert publish_response.status_code == 200

    catalog = client.get("/artworks")
    assert catalog.status_code == 200

    titles = [item["title"] for item in catalog.json()["items"]]
    assert "Public Shawl" in titles
    assert "Private Draft" not in titles

    hidden_detail = client.get(f"/artworks/{draft_id}")
    visible_detail = client.get(f"/artworks/{published_id}")

    assert hidden_detail.status_code == 404
    assert visible_detail.status_code == 200


def test_seller_cannot_publish_another_sellers_artwork(
    client, db_session
):
    owner_headers = register_and_login(
        client, "Owner Two", "owner2@example.com"
    )
    other_headers = register_and_login(
        client, "Other Two", "other2@example.com"
    )
    approve_seller(db_session, "owner2@example.com")
    approve_seller(db_session, "other2@example.com")

    created = create_artwork(client, owner_headers)
    assert created.status_code == 201
    artwork_id = created.json()["id"]

    response = client.patch(
        f"/artworks/{artwork_id}/publish",
        headers=other_headers,
    )

    assert response.status_code == 403


def test_seller_can_delete_own_artwork(client, db_session):
    headers = register_and_login(
        client, "Seller Five", "seller5@example.com"
    )
    approve_seller(db_session, "seller5@example.com")

    created = create_artwork(client, headers)
    assert created.status_code == 201
    artwork_id = created.json()["id"]

    response = client.delete(
        f"/artworks/{artwork_id}",
        headers=headers,
    )

    assert response.status_code == 204
    assert db_session.get(Artwork, artwork_id) is None


def test_seller_cannot_delete_another_sellers_artwork(
    client, db_session
):
    owner_headers = register_and_login(
        client, "Owner Three", "owner3@example.com"
    )
    other_headers = register_and_login(
        client, "Other Three", "other3@example.com"
    )
    approve_seller(db_session, "owner3@example.com")
    approve_seller(db_session, "other3@example.com")

    created = create_artwork(client, owner_headers)
    assert created.status_code == 201
    artwork_id = created.json()["id"]

    response = client.delete(
        f"/artworks/{artwork_id}",
        headers=other_headers,
    )

    assert response.status_code == 403
    assert db_session.get(Artwork, artwork_id) is not None


def test_seller_cannot_publish_same_artwork_twice(
    client, db_session
):
    headers = register_and_login(
        client, "Seller Six", "seller6@example.com"
    )
    approve_seller(db_session, "seller6@example.com")

    created = create_artwork(client, headers)
    assert created.status_code == 201
    artwork_id = created.json()["id"]

    first = client.patch(
        f"/artworks/{artwork_id}/publish",
        headers=headers,
    )
    second = client.patch(
        f"/artworks/{artwork_id}/publish",
        headers=headers,
    )

    assert first.status_code == 200
    assert second.status_code == 400
