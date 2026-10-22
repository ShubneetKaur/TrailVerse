from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db, require_role
from app.models.seller_application import SellerApplication
from app.models.user import User
from app.schemas.seller_application import (
    SellerApplicationCreate,
    SellerApplicationResponse,
    SellerApplicationReview,
    SellerApplicationStatus,
)

router = APIRouter(prefix="/seller-applications", tags=["seller-applications"])


@router.post(
    "",
    response_model=SellerApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_seller_application(
    payload: SellerApplicationCreate,
    current_user: Annotated[User, Depends(require_role("customer"))],
    db: Session = Depends(get_db),
) -> SellerApplication:
    existing = (
        db.query(SellerApplication)
        .filter(
            SellerApplication.applicant_id == current_user.id,
            SellerApplication.status.in_(
                ["pending", "needs_more_info", "approved"]
            ),
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active seller application.",
        )

    application = SellerApplication(
        applicant_id=current_user.id,
        business_name=payload.business_name.strip(),
        description=payload.description.strip(),
        status=SellerApplicationStatus.pending.value,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get(
    "/mine",
    response_model=list[SellerApplicationResponse],
)
def list_my_seller_applications(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> list[SellerApplication]:
    return (
        db.query(SellerApplication)
        .filter(SellerApplication.applicant_id == current_user.id)
        .order_by(SellerApplication.submitted_at.desc())
        .all()
    )


@router.get(
    "",
    response_model=list[SellerApplicationResponse],
)
def list_seller_applications(
    current_user: Annotated[User, Depends(require_role("admin"))],
    db: Session = Depends(get_db),
    application_status: SellerApplicationStatus | None = Query(
        default=None,
        alias="status",
    ),
) -> list[SellerApplication]:
    query = db.query(SellerApplication)
    if application_status is not None:
        query = query.filter(
            SellerApplication.status == application_status.value
        )
    return query.order_by(SellerApplication.submitted_at.asc()).all()


@router.get(
    "/{application_id}",
    response_model=SellerApplicationResponse,
)
def get_seller_application(
    application_id: int,
    current_user: Annotated[User, Depends(require_role("admin"))],
    db: Session = Depends(get_db),
) -> SellerApplication:
    application = db.get(SellerApplication, application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller application not found.",
        )
    return application


@router.patch(
    "/{application_id}/review",
    response_model=SellerApplicationResponse,
)
def review_seller_application(
    application_id: int,
    payload: SellerApplicationReview,
    current_user: Annotated[User, Depends(require_role("admin"))],
    db: Session = Depends(get_db),
) -> SellerApplication:
    application = db.get(SellerApplication, application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller application not found.",
        )
    if application.status in {
        SellerApplicationStatus.approved.value,
        SellerApplicationStatus.rejected.value,
    }:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This seller application has already been finalized.",
        )

    application.status = payload.status.value
    application.review_notes = (
        payload.review_notes.strip()
        if payload.review_notes is not None
        else None
    )
    application.reviewed_at = datetime.now(timezone.utc)
    application.reviewed_by_id = current_user.id
    db.commit()
    db.refresh(application)
    return application
