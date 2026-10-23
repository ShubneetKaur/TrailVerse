"""Promote an existing user to admin for local development.

Usage:
    $env:ALLOW_ADMIN_PROMOTION = "true"
    ..\\.venv\\Scripts\\python.exe .\\create_admin.py --email "admin@example.com"

The same email may be supplied through ADMIN_EMAIL instead of --email.
This script never creates users or changes passwords.
"""

import argparse
import os
import sys
from collections.abc import Sequence

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User


class AdminPromotionError(Exception):
    """Raised when an admin promotion cannot be safely completed."""


def _require_local_promotion_opt_in() -> None:
    if os.getenv("ALLOW_ADMIN_PROMOTION", "").strip().lower() != "true":
        raise AdminPromotionError(
            "Refusing to promote an admin without "
            "ALLOW_ADMIN_PROMOTION=true."
        )

    environment = os.getenv("APP_ENV", os.getenv("ENVIRONMENT", "")).strip().lower()
    if environment not in {"development", "dev", "local", "test"}:
        raise AdminPromotionError(
            "Refusing admin promotion unless APP_ENV or ENVIRONMENT is "
            "development, dev, local, or test."
        )


def promote_existing_user(db: Session, email: str) -> str:
    normalized_email = email.strip().lower()
    if not normalized_email:
        raise AdminPromotionError("An administrator email is required.")

    user = db.query(User).filter(User.email == normalized_email).first()
    if user is None:
        raise AdminPromotionError(
            f"No user exists with email {normalized_email}. "
            "Create the account through the normal registration flow first."
        )

    promoted_email = user.email
    user.role = "admin"
    db.commit()
    return promoted_email


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Promote an existing VIRSA user to administrator."
    )
    parser.add_argument(
        "--email",
        default=None,
        help="Existing account email; defaults to ADMIN_EMAIL.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    email = args.email or os.getenv("ADMIN_EMAIL")

    try:
        _require_local_promotion_opt_in()
        if not email:
            raise AdminPromotionError(
                "Provide --email or set ADMIN_EMAIL."
            )
    except AdminPromotionError as exc:
        print(f"Admin promotion refused: {exc}", file=sys.stderr)
        return 1

    db = SessionLocal()
    try:
        promoted_email = promote_existing_user(db, email)
    except AdminPromotionError as exc:
        db.rollback()
        print(f"Admin promotion refused: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:
        db.rollback()
        print(f"Admin promotion failed: {exc}", file=sys.stderr)
        return 1
    finally:
        db.close()

    print(
        f"Promoted {promoted_email} to admin. "
        "Log in again to obtain a fresh access token."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
