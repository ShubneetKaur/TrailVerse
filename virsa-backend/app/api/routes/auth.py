from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.dependencies import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(payload: UserRegister, db: Session = Depends(get_db)) -> UserResponse:
    """Register a new customer account.

    - **name**: display name (2–100 characters)
    - **email**: unique email address
    - **password**: at least 8 characters (stored as Argon2 hash, never returned)

    Raises **409 Conflict** if the email is already registered.
    The role is always set to `customer`; it cannot be supplied by the caller.
    """
    # Guard against duplicate emails
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role="customer",  # hardcoded — callers cannot escalate
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
