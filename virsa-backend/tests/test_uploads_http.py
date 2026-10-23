API_PREFIX = "/api/v1"

from io import BytesIO
from unittest.mock import patch

from PIL import Image

from app.models.user import User
from app.models.seller_application import SellerApplication


def register_and_login(client, name, email, password="password123"):
    response = client.post(
        f"{API_PREFIX}/auth/register",
        json={"name": name, "email": email, "password": password},
    )
    assert response.status_code == 201

    response = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200

    return {
        "Authorization": f"Bearer {response.json()['access_token']}"
    }


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


def make_png():
    """Return bytes for a valid, tiny PNG image."""
    image = Image.new("RGB", (2, 2), color="red")
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def upload(client, headers, content, filename="test.png",
           content_type="image/png"):
    return client.post(
        f"{API_PREFIX}/uploads/artwork-image",
        headers=headers,
        files={"file": (filename, content, content_type)},
    )


def seller_setup(client, db_session, email="upload-seller@example.com"):
    headers = register_and_login(client, "Upload Seller", email)
    approve_seller(db_session, email)
    return headers


def test_valid_png_upload_returns_cloudinary_details(client, db_session):
    headers = seller_setup(client, db_session)
    fake_result = {
        "secure_url": "https://res.cloudinary.com/demo/image/upload/test.png",
        "public_id": "virsa/artworks/test",
    }

    with patch(
        "app.api.routes.uploads.cloudinary.uploader.upload",
        return_value=fake_result,
    ) as mocked_upload:
        response = upload(client, headers, make_png())

    assert response.status_code == 200
    assert response.json() == {
        "image_url": fake_result["secure_url"],
        "public_id": fake_result["public_id"],
    }
    mocked_upload.assert_called_once()


def test_unauthenticated_upload_is_rejected(client):
    response = upload(client, {}, make_png())

    assert response.status_code == 401


def test_customer_cannot_upload_image(client):
    headers = register_and_login(
        client, "Regular Customer", "upload-customer@example.com"
    )

    response = upload(client, headers, make_png())

    assert response.status_code == 403


def test_unsupported_content_type_is_rejected(client, db_session):
    headers = seller_setup(client, db_session)

    with patch("app.api.routes.uploads.cloudinary.uploader.upload") as mocked:
        response = upload(
            client, headers, b"not an image",
            filename="test.gif", content_type="image/gif",
        )

    assert response.status_code == 415
    mocked.assert_not_called()


def test_file_larger_than_5mb_is_rejected(client, db_session):
    headers = seller_setup(client, db_session)

    oversized = b"x" * (5 * 1024 * 1024 + 1)

    with patch("app.api.routes.uploads.cloudinary.uploader.upload") as mocked:
        response = upload(client, headers, oversized)

    assert response.status_code == 413
    mocked.assert_not_called()


def test_empty_file_is_rejected(client, db_session):
    headers = seller_setup(client, db_session)

    with patch("app.api.routes.uploads.cloudinary.uploader.upload") as mocked:
        response = upload(client, headers, b"")

    assert response.status_code == 400
    mocked.assert_not_called()


def test_invalid_image_contents_are_rejected(client, db_session):
    headers = seller_setup(client, db_session)

    with patch("app.api.routes.uploads.cloudinary.uploader.upload") as mocked:
        response = upload(
            client, headers, b"this is not a PNG image"
        )

    assert response.status_code == 415
    mocked.assert_not_called()


def test_declared_type_must_match_actual_image(client, db_session):
    headers = seller_setup(client, db_session)

    # The bytes are a valid PNG, but the client declares JPEG.
    with patch("app.api.routes.uploads.cloudinary.uploader.upload") as mocked:
        response = upload(
            client, headers, make_png(),
            filename="test.jpg", content_type="image/jpeg",
        )

    assert response.status_code == 415
    mocked.assert_not_called()


def test_cloudinary_failure_returns_502(client, db_session):
    headers = seller_setup(client, db_session)

    with patch(
        "app.api.routes.uploads.cloudinary.uploader.upload",
        side_effect=RuntimeError("Simulated Cloudinary failure"),
    ) as mocked:
        response = upload(client, headers, make_png())

    assert response.status_code == 502
    mocked.assert_called_once()
