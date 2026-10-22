from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.seller import SellerProfileResponse

router = APIRouter(prefix="/sellers", tags=["sellers"])


@router.get(
    "/{seller_id}",
    response_model=SellerProfileResponse,
)
def get_seller_profile(
    seller_id: int,
    db: Session = Depends(get_db),
) -> User:
    seller = db.get(User, seller_id)

    if (
        seller is None
        or not seller.is_active
        or seller.role != "seller"
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found.",
        )

    return seller
