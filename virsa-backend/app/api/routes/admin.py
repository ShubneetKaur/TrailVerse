
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_role
from app.models.artwork import Artwork
from app.models.seller_application import SellerApplication
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard/stats")
def get_admin_dashboard_stats(
    current_user: Annotated[User, Depends(require_role("admin"))],
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, int]:
    return {
        "total_users": db.query(User).count(),
        "total_sellers": db.query(User)
        .filter(User.role == "seller")
        .count(),
        "pending_applications": db.query(SellerApplication)
        .filter(SellerApplication.status == "pending")
        .count(),
        "total_artworks": db.query(Artwork).count(),
        "draft_artworks": db.query(Artwork)
        .filter(Artwork.status == "draft")
        .count(),
        "published_artworks": db.query(Artwork)
        .filter(Artwork.status == "published")
        .count(),
        "archived_artworks": db.query(Artwork)
        .filter(Artwork.status == "archived")
        .count(),
    }
