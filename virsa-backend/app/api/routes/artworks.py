from typing import Annotated

import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_approved_seller
from app.models.artwork import Artwork
from app.models.user import User
from app.models.uploaded_asset import UploadedAsset
from app.schemas.artwork import (
    ArtworkCreate,
    ArtworkListResponse,
    ArtworkResponse,
    ArtworkUpdate,
)

router = APIRouter(prefix="/artworks", tags=["artworks"])


@router.post(
    "",
    response_model=ArtworkResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_artwork(
    payload: ArtworkCreate,
    current_user: Annotated[User, Depends(require_approved_seller)],
    db: Annotated[Session, Depends(get_db)],
) -> Artwork:
    asset = None
    if payload.cloudinary_public_id:
        asset = (
            db.query(UploadedAsset)
            .filter(
                UploadedAsset.public_id == payload.cloudinary_public_id,
                UploadedAsset.owner_id == current_user.id,
                UploadedAsset.artwork_id.is_(None),
            )
            .first()
        )
        if asset is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only attach your own uploaded image.",
            )
        if payload.image_url.strip() != asset.image_url:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Artwork image details do not match the uploaded image.",
            )

    artwork = Artwork(
        seller_id=current_user.id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        price=payload.price,
        stock_quantity=payload.stock_quantity,
        category=payload.category.strip(),
        state=payload.state.strip(),
        image_url=asset.image_url if asset else payload.image_url.strip(),
        cloudinary_public_id=asset.public_id if asset else None,
        status="draft",
    )

    db.add(artwork)
    if asset:
        db.flush()
        asset.artwork_id = artwork.id
    db.commit()
    db.refresh(artwork)

    return artwork


@router.patch(
    "/{artwork_id}",
    response_model=ArtworkResponse,
)
def update_artwork(
    artwork_id: int,
    payload: ArtworkUpdate,
    current_user: Annotated[User, Depends(require_approved_seller)],
    db: Annotated[Session, Depends(get_db)],
) -> Artwork:
    artwork = db.get(Artwork, artwork_id)

    if artwork is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artwork not found.",
        )

    if artwork.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own artwork.",
        )

    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update.",
        )

    if "image_url" in updates and artwork.cloudinary_public_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cloudinary-backed artwork images cannot be replaced.",
        )

    for field, value in updates.items():
        if isinstance(value, str):
            value = value.strip()
            if not value:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"{field} cannot be empty.",
                )

        setattr(artwork, field, value)

    db.commit()
    db.refresh(artwork)

    return artwork


@router.delete(
    "/{artwork_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_artwork(
    artwork_id: int,
    current_user: Annotated[User, Depends(require_approved_seller)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    artwork = db.get(Artwork, artwork_id)

    if artwork is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artwork not found.",
        )

    if artwork.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own artwork.",
        )

    # Delete the Cloudinary image first, if its public ID is stored.
    asset = None
    if artwork.cloudinary_public_id:
        asset = (
            db.query(UploadedAsset)
            .filter(
                UploadedAsset.public_id == artwork.cloudinary_public_id,
                UploadedAsset.owner_id == current_user.id,
                UploadedAsset.artwork_id == artwork.id,
            )
            .first()
        )
    if asset:
        try:
            result = cloudinary.uploader.destroy(
                asset.public_id,
                resource_type="image",
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Could not delete the artwork image. Please try again.",
            ) from exc

        if result.get("result") not in {"ok", "not found"}:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Cloudinary did not confirm image deletion.",
            )

    if asset:
        db.delete(asset)
    db.delete(artwork)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch(
    "/{artwork_id}/publish",
    response_model=ArtworkResponse,
)
def publish_artwork(
    artwork_id: int,
    current_user: Annotated[User, Depends(require_approved_seller)],
    db: Annotated[Session, Depends(get_db)],
) -> Artwork:
    artwork = db.get(Artwork, artwork_id)

    if artwork is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artwork not found.",
        )

    if artwork.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only publish your own artwork.",
        )

    if artwork.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft artworks can be published.",
        )

    artwork.status = "published"

    db.commit()
    db.refresh(artwork)

    return artwork


@router.get(
    "",
    response_model=ArtworkListResponse,
)
def list_artworks(
    db: Annotated[Session, Depends(get_db)],
    category: Annotated[
        str | None,
        Query(min_length=1, max_length=100),
    ] = None,
    state: Annotated[
        str | None,
        Query(min_length=1, max_length=100),
    ] = None,
    sort_by: Annotated[
        str,
        Query(pattern="^(newest|price_asc|price_desc)$"),
    ] = "newest",
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> ArtworkListResponse:
    query = db.query(Artwork).filter(
        Artwork.status == "published"
    )

    if category:
        query = query.filter(
            Artwork.category.ilike(category.strip())
        )

    if state:
        query = query.filter(
            Artwork.state.ilike(state.strip())
        )

    total = query.count()

    if sort_by == "price_asc":
        query = query.order_by(Artwork.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Artwork.price.desc())
    else:
        query = query.order_by(Artwork.created_at.desc())

    items = query.offset(offset).limit(limit).all()

    return ArtworkListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )

@router.get("/mine", response_model=ArtworkListResponse)
def list_my_artworks(
    current_user: Annotated[User, Depends(require_approved_seller)],
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> ArtworkListResponse:
    query = db.query(Artwork).filter(
        Artwork.seller_id == current_user.id
    )

    total = query.count()

    items = (
        query.order_by(Artwork.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return ArtworkListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )
@router.get("/mine/stats")
def get_my_artwork_stats(
    current_user: Annotated[User, Depends(require_approved_seller)],
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, int]:
    artworks = (
        db.query(Artwork)
        .filter(Artwork.seller_id == current_user.id)
        .all()
    )

    return {
        "total": len(artworks),
        "draft": sum(1 for artwork in artworks if artwork.status == "draft"),
        "published": sum(
            1 for artwork in artworks if artwork.status == "published"
        ),
        "archived": sum(
            1 for artwork in artworks if artwork.status == "archived"
        ),
    }

@router.get(
    "/{artwork_id}",
    response_model=ArtworkResponse,
)
def get_artwork(
    artwork_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Artwork:
    artwork = db.get(Artwork, artwork_id)

    if artwork is None or artwork.status != "published":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artwork not found.",
        )

    return artwork
