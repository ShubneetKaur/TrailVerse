
from collections.abc import Callable, Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models.user import User
from app.models.seller_application import SellerApplication


bearer_scheme = HTTPBearer(auto_error=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    try:
        payload = decode_access_token(credentials.credentials)
        subject = payload.get("sub")

        if not isinstance(subject, str) or not subject.isdigit():
            raise unauthorized
    except jwt.PyJWTError as exc:
        raise unauthorized from exc

    current_user = db.get(User, int(subject))

    if current_user is None or not current_user.is_active:
        raise unauthorized

    return current_user


def require_role(*allowed_roles: str) -> Callable[..., User]:
    """Require an authenticated user to have one of the allowed roles."""
    if not allowed_roles:
        raise ValueError("At least one role is required.")

    def role_dependency(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )
        return current_user

    return role_dependency


def require_approved_seller(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Require the current user to have an approved seller application."""
    application = (
        db.query(SellerApplication)
        .filter(
            SellerApplication.applicant_id == current_user.id,
            SellerApplication.status == "approved",
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="An approved seller application is required.",
        )

    return current_user
