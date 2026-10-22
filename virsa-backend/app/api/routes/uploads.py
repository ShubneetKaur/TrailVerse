
from io import BytesIO
from typing import Annotated

import cloudinary.uploader
from PIL import Image, UnidentifiedImageError
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from app.core import cloudinary_config
from app.dependencies import require_approved_seller
from app.models.user import User

router = APIRouter(prefix="/uploads", tags=["uploads"])

MAX_FILE_SIZE = 5 * 1024 * 1024

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WEBP",
}


@router.post("/artwork-image")
async def upload_artwork_image(
    current_user: Annotated[
        User, Depends(require_approved_seller)
    ],
    file: Annotated[UploadFile, File(...)],
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, and WebP images are allowed.",
        )

    contents = await file.read(MAX_FILE_SIZE + 1)

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image must be 5 MB or smaller.",
        )

    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        image = Image.open(BytesIO(contents))
        detected_format = image.format

        if detected_format != ALLOWED_CONTENT_TYPES[file.content_type]:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="File contents do not match the declared image type.",
            )

        image.verify()

    except UnidentifiedImageError as exc:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="The uploaded file is not a valid supported image.",
        ) from exc
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="The uploaded image is invalid or corrupted.",
        ) from exc
    finally:
        await file.close()

    try:
        result = cloudinary.uploader.upload(
            BytesIO(contents),
            folder="virsa/artworks",
            resource_type="image",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Image upload failed. Please try again.",
        ) from exc

    return {
        "image_url": result["secure_url"],
        "public_id": result["public_id"],
    }
