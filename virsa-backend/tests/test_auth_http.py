import pytest


def test_register_user_returns_customer(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Test Customer",
            "email": "customer@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Customer"
    assert data["email"] == "customer@example.com"
    assert data["role"] == "customer"
    assert data["is_active"] is True
    assert "hashed_password" not in data


def test_register_cannot_assign_admin_role(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Test Customer",
            "email": "role-test@example.com",
            "password": "password123",
            "role": "admin",
        },
    )

    assert response.status_code == 201
    assert response.json()["role"] == "customer"


def test_duplicate_registration_returns_conflict(client):
    payload = {
        "name": "Test Customer",
        "email": "duplicate@example.com",
        "password": "password123",
    }

    first_response = client.post("/auth/register", json=payload)
    second_response = client.post("/auth/register", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_register_rejects_short_password(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Test Customer",
            "email": "short-password@example.com",
            "password": "123",
        },
    )

    assert response.status_code == 422


def test_login_returns_access_token(client):
    client.post(
        "/auth/register",
        json={
            "name": "Login Customer",
            "email": "login@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "login@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 0
    assert data["token_type"] == "bearer"


def test_login_rejects_wrong_password(client):
    client.post(
        "/auth/register",
        json={
            "name": "Login Customer",
            "email": "wrong-password@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "wrong-password@example.com",
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401


def test_auth_me_returns_authenticated_user(client):
    client.post(
        "/auth/register",
        json={
            "name": "Current Customer",
            "email": "current@example.com",
            "password": "password123",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "current@example.com",
            "password": "password123",
        },
    )

    token = login_response.json()["access_token"]
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == "current@example.com"
    assert response.json()["role"] == "customer"


@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Authorization": "Bearer invalid-token"},
    ],
)
def test_auth_me_rejects_missing_or_invalid_token(client, headers):
    response = client.get("/auth/me", headers=headers)

    assert response.status_code == 401
