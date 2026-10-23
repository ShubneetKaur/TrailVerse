API_PREFIX = "/api/v1"

def register_and_login(client, name, email, password="password123"):
    register_response = client.post(
        f"{API_PREFIX}/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200

    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_application(client, headers):
    return client.post(
        f"{API_PREFIX}/seller-applications",
        headers=headers,
        json={
            "business_name": "Heritage Studio",
            "description": (
                "We create and sell traditional handcrafted goods "
                "made by skilled local artisans."
            ),
        },
    )


def make_admin(client, db_session):
    headers = register_and_login(
        client, "Administrator", "admin-http@example.com"
    )
    admin = (
        db_session.query(User)
        .filter(User.email == "admin-http@example.com")
        .first()
    )
    assert admin is not None
    admin.role = "admin"
    db_session.commit()
    return headers, admin


def create_application_for_user(client, name, email):
    headers = register_and_login(client, name, email)
    response = create_application(client, headers)
    assert response.status_code == 201
    return headers, response.json()


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
        f"{API_PREFIX}/seller-applications/mine",
        headers=headers,
    )

    assert mine_response.status_code == 200
    assert len(mine_response.json()) == 1
    assert mine_response.json()[0]["id"] == application["id"]


def test_unauthenticated_user_cannot_submit_application(client):
    response = client.post(
        f"{API_PREFIX}/seller-applications",
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
        f"{API_PREFIX}/seller-applications",
        headers=headers,
    )

    assert response.status_code == 403


def test_customer_cannot_view_another_users_application(client):
    owner_headers, application = create_application_for_user(
        client, "Application Owner", "application-owner@example.com"
    )
    other_headers, _ = create_application_for_user(
        client, "Other Customer", "other-customer@example.com"
    )

    response = client.get(
        f"{API_PREFIX}/seller-applications/{application['id']}",
        headers=other_headers,
    )

    assert response.status_code == 403
    assert owner_headers != other_headers


def test_customer_mine_endpoint_returns_only_the_current_users_application(
    client
):
    _, owner_application = create_application_for_user(
        client, "Mine Owner", "mine-owner@example.com"
    )
    other_headers, _ = create_application_for_user(
        client, "Mine Other", "mine-other@example.com"
    )

    response = client.get(
        f"{API_PREFIX}/seller-applications/mine",
        headers=other_headers,
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] != [
        owner_application["id"]
    ]


def test_admin_can_list_applications_with_each_status_filter(
    client, db_session
):
    admin_headers, _ = make_admin(client, db_session)
    _, pending = create_application_for_user(
        client, "Pending Applicant", "pending-http@example.com"
    )
    _, approved = create_application_for_user(
        client, "Approved Applicant", "approved-http@example.com"
    )
    _, rejected = create_application_for_user(
        client, "Rejected Applicant", "rejected-http@example.com"
    )
    _, needs_info = create_application_for_user(
        client, "Needs Info Applicant", "needs-info-http@example.com"
    )

    review_cases = [
        (approved["id"], {"status": "approved"}),
        (
            rejected["id"],
            {"status": "rejected", "review_notes": "Please provide proof."},
        ),
        (
            needs_info["id"],
            {"status": "needs_more_info", "review_notes": "Add workshop details."},
        ),
    ]
    for application_id, payload in review_cases:
        response = client.patch(
            f"{API_PREFIX}/seller-applications/{application_id}/review",
            headers=admin_headers,
            json=payload,
        )
        assert response.status_code == 200

    expected = {
        "pending": pending["id"],
        "approved": approved["id"],
        "rejected": rejected["id"],
        "needs_more_info": needs_info["id"],
    }
    all_response = client.get(
        f"{API_PREFIX}/seller-applications",
        headers=admin_headers,
    )
    assert all_response.status_code == 200
    assert {item["id"] for item in all_response.json()} == set(expected.values())

    for status_value, application_id in expected.items():
        response = client.get(
            f"{API_PREFIX}/seller-applications",
            params={"status": status_value},
            headers=admin_headers,
        )
        assert response.status_code == 200
        assert [item["id"] for item in response.json()] == [application_id]


def test_invalid_application_status_filter_is_rejected(client, db_session):
    admin_headers, _ = make_admin(client, db_session)

    response = client.get(
        f"{API_PREFIX}/seller-applications",
        params={"status": "unknown"},
        headers=admin_headers,
    )

    assert response.status_code == 422


def test_admin_can_get_application_and_missing_application_is_404(
    client, db_session
):
    admin_headers, _ = make_admin(client, db_session)
    _, application = create_application_for_user(
        client, "Detail Applicant", "detail-applicant@example.com"
    )

    response = client.get(
        f"{API_PREFIX}/seller-applications/{application['id']}",
        headers=admin_headers,
    )
    missing_response = client.get(
        f"{API_PREFIX}/seller-applications/999999",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["id"] == application["id"]
    assert missing_response.status_code == 404
    assert missing_response.json()["detail"] == "Seller application not found."


def test_admin_can_reject_application_with_notes_and_records_review(
    client, db_session
):
    admin_headers, admin = make_admin(client, db_session)
    _, application = create_application_for_user(
        client, "Reject Applicant", "reject-http@example.com"
    )

    response = client.patch(
        f"{API_PREFIX}/seller-applications/{application['id']}/review",
        headers=admin_headers,
        json={
            "status": "rejected",
            "review_notes": "  Please provide clearer craft provenance.  ",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "rejected"
    assert data["review_notes"] == "Please provide clearer craft provenance."
    assert data["reviewed_by_id"] == admin.id
    assert data["reviewed_at"] is not None


def test_admin_can_request_more_information_with_notes(
    client, db_session
):
    admin_headers, admin = make_admin(client, db_session)
    _, application = create_application_for_user(
        client, "More Info Applicant", "more-info-http@example.com"
    )

    response = client.patch(
        f"{API_PREFIX}/seller-applications/{application['id']}/review",
        headers=admin_headers,
        json={
            "status": "needs_more_info",
            "review_notes": "  Please add your workshop location.  ",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "needs_more_info"
    assert data["review_notes"] == "Please add your workshop location."
    assert data["reviewed_by_id"] == admin.id
    assert data["reviewed_at"] is not None

import pytest

from app.models.seller_application import SellerApplication
from app.models.user import User


@pytest.mark.parametrize(
    "payload",
    [
        {"status": "pending"},
        {"status": "rejected"},
        {"status": "needs_more_info"},
        {"status": "rejected", "review_notes": "   "},
        {"status": "rejected", "review_notes": "x" * 5001},
    ],
)
def test_invalid_review_payload_is_rejected(client, db_session, payload):
    admin_headers, _ = make_admin(client, db_session)
    _, application = create_application_for_user(
        client, "Validation Applicant", "validation-http@example.com"
    )

    response = client.patch(
        f"{API_PREFIX}/seller-applications/{application['id']}/review",
        headers=admin_headers,
        json=payload,
    )

    assert response.status_code == 422


def test_customer_cannot_review_application(client, db_session):
    customer_headers, application = create_application_for_user(
        client, "Review Customer", "review-customer@example.com"
    )

    response = client.patch(
        f"{API_PREFIX}/seller-applications/{application['id']}/review",
        headers=customer_headers,
        json={"status": "approved"},
    )

    assert response.status_code == 403


def test_approved_review_promotes_applicant_to_seller(
    client, db_session
):
    admin_headers, _ = make_admin(client, db_session)
    _, application = create_application_for_user(
        client, "Approved Applicant", "approved-role-http@example.com"
    )

    response = client.patch(
        f"{API_PREFIX}/seller-applications/{application['id']}/review",
        headers=admin_headers,
        json={"status": "approved"},
    )

    applicant = db_session.query(User).filter(
        User.email == "approved-role-http@example.com"
    ).first()
    assert response.status_code == 200
    assert applicant is not None
    assert applicant.role == "seller"


@pytest.mark.parametrize("final_status", ["approved", "rejected"])
def test_finalized_application_cannot_be_reviewed_again(
    client, db_session, final_status
):
    admin_headers, _ = make_admin(client, db_session)
    _, application = create_application_for_user(
        client,
        f"Finalized {final_status}",
        f"finalized-{final_status}-http@example.com",
    )

    first_payload = {"status": final_status}
    if final_status == "rejected":
        first_payload["review_notes"] = "Application is incomplete."
    first = client.patch(
        f"{API_PREFIX}/seller-applications/{application['id']}/review",
        headers=admin_headers,
        json=first_payload,
    )
    second = client.patch(
        f"{API_PREFIX}/seller-applications/{application['id']}/review",
        headers=admin_headers,
        json={"status": "approved"},
    )

    assert first.status_code == 200
    assert second.status_code == 409


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
        f"{API_PREFIX}/seller-applications/{application_id}/review",
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
