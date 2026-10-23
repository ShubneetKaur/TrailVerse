from app.models.artwork import Artwork
from app.models.seller_application import SellerApplication
from app.models.user import User


def register_and_login(client, name, email, password):
    register_response = client.post(
        "/auth/register",
        json={"name": name, "email": email, "password": password},
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    return {
        "Authorization": f"Bearer {login_response.json()['access_token']}"
    }


def test_admin_dashboard_requires_admin_role(client):
    customer_headers = register_and_login(
        client,
        "Dashboard Customer",
        "dashboard-customer@example.com",
        "password123",
    )

    response = client.get(
        "/admin/dashboard/stats",
        headers=customer_headers,
    )

    assert response.status_code == 403


def test_admin_dashboard_returns_database_counts(client, db_session):
    admin_headers = register_and_login(
        client, "Dashboard Admin", "dashboard-admin@example.com", "password123"
    )
    _seller_headers = register_and_login(
        client, "Dashboard Seller", "dashboard-seller@example.com", "password123"
    )
    customer_headers = register_and_login(
        client,
        "Dashboard Customer",
        "dashboard-count-customer@example.com",
        "password123",
    )
    del customer_headers

    admin = db_session.query(User).filter(
        User.email == "dashboard-admin@example.com"
    ).first()
    seller = db_session.query(User).filter(
        User.email == "dashboard-seller@example.com"
    ).first()
    assert admin is not None
    assert seller is not None
    admin.role = "admin"
    seller.role = "seller"
    db_session.add(
        SellerApplication(
            applicant_id=seller.id,
            business_name="Dashboard Studio",
            description="A verified dashboard test studio.",
            status="pending",
        )
    )
    db_session.add_all(
        [
            Artwork(
                seller_id=seller.id,
                title="Draft",
                description="Draft artwork",
                price=10,
                category="Test",
                state="Test",
                image_url="https://example.com/draft.jpg",
                status="draft",
            ),
            Artwork(
                seller_id=seller.id,
                title="Published",
                description="Published artwork",
                price=20,
                category="Test",
                state="Test",
                image_url="https://example.com/published.jpg",
                status="published",
            ),
            Artwork(
                seller_id=seller.id,
                title="Archived",
                description="Archived artwork",
                price=30,
                category="Test",
                state="Test",
                image_url="https://example.com/archived.jpg",
                status="archived",
            ),
        ]
    )
    db_session.commit()

    response = client.get(
        "/admin/dashboard/stats",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json() == {
        "total_users": 3,
        "total_sellers": 1,
        "pending_applications": 1,
        "total_artworks": 3,
        "draft_artworks": 1,
        "published_artworks": 1,
        "archived_artworks": 1,
    }
