def register_and_login(client, name, email, password="password123"):
    register_response = client.post(
        "/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200

    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_application(client, headers):
    return client.post(
        "/seller-applications",
        headers=headers,
        json={
            "business_name": "Heritage Studio",
            "description": (
                "We create and sell traditional handcrafted goods "
                "made by skilled local artisans."
            ),
        },
    )


def test_customer_can_submit_and_view_own_application(client):
    headers = register_and_login(
        client, "Customer One", "customer1@example.com"
    )

    response = create_application(client, headers)

    assert response.status_code == 201
    application = response.json()
    assert application["status"] == "pending"
    assert application["business_name"] == "Heritage Studio"

    mine_response = client.get(
        "/seller-applications/mine",
        headers=headers,
    )

    assert mine_response.status_code == 200
    assert len(mine_response.json()) == 1
    assert mine_response.json()[0]["id"] == application["id"]


def test_unauthenticated_user_cannot_submit_application(client):
    response = client.post(
        "/seller-applications",
        json={
            "business_name": "Heritage Studio",
            "description": (
                "We create and sell traditional handcrafted goods "
                "made by skilled local artisans."
            ),
        },
    )

    assert response.status_code == 401


def test_customer_cannot_list_all_applications(client):
    headers = register_and_login(
        client, "Customer Two", "customer2@example.com"
    )

    response = client.get(
        "/seller-applications",
        headers=headers,
    )

    assert response.status_code == 403


def test_customer_cannot_submit_duplicate_active_application(client):
    headers = register_and_login(
        client, "Customer Three", "customer3@example.com"
    )

    first = create_application(client, headers)
    second = create_application(client, headers)

    assert first.status_code == 201
    assert second.status_code == 409



def test_approval_promotes_customer_to_seller(client, db_session):
    from app.models.user import User

    customer_headers = register_and_login(
        client, "Applicant", "applicant@example.com"
    )
    admin_headers = register_and_login(
        client, "Administrator", "admin@example.com"
    )

    # Promote the admin account in the isolated test database.
    admin = (
        db_session.query(User)
        .filter(User.email == "admin@example.com")
        .first()
    )
    assert admin is not None

    admin.role = "admin"
    db_session.commit()

    # The customer submits a seller application.
    application_response = create_application(client, customer_headers)
    assert application_response.status_code == 201

    application_id = application_response.json()["id"]

    # The admin approves the application.
    review_response = client.patch(
        f"/seller-applications/{application_id}/review",
        headers=admin_headers,
        json={"status": "approved"},
    )

    assert review_response.status_code == 200

    # Confirm the applicant was promoted to seller.
    customer = (
        db_session.query(User)
        .filter(User.email == "applicant@example.com")
        .first()
    )
    assert customer is not None
    assert customer.role == "seller"
