"""Reset an existing user's password for local development only.

Usage:
    $env:ALLOW_DEV_PASSWORD_RESET = "true"
    ..\\.venv\\Scripts\\python.exe .\\reset_dev_password.py --email "user@example.com"

The password is entered interactively and is never printed or stored here.
The same email may be supplied through DEV_PASSWORD_RESET_EMAIL.
"""

import argparse
import getpass
import os
import sys
from collections.abc import Sequence

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User


class DevPasswordResetError(Exception):
    """Raised when a development password reset cannot be completed safely."""


def _require_local_reset_opt_in() -> None:
    if os.getenv("ALLOW_DEV_PASSWORD_RESET", "").strip().lower() != "true":
        raise DevPasswordResetError(
            "Refusing to reset a password without "
            "ALLOW_DEV_PASSWORD_RESET=true."
        )

    environment = os.getenv(
        "APP_ENV",
        os.getenv("ENVIRONMENT", ""),
    ).strip().lower()
    if environment not in {"development", "dev", "local", "test"}:
        raise DevPasswordResetError(
            "Refusing password reset unless APP_ENV or ENVIRONMENT is "
            "development, dev, local, or test."
        )


def reset_existing_user_password(
    db: Session,
    email: str,
    new_password: str,
) -> str:
    normalized_email = email.strip().lower()
    if not normalized_email:
        raise DevPasswordResetError("An account email is required.")
    if len(new_password) < 8:
        raise DevPasswordResetError(
            "The new password must be at least 8 characters long."
        )

    user = db.query(User).filter(User.email == normalized_email).first()
    if user is None:
        raise DevPasswordResetError(
            f"No user exists with email {normalized_email}. "
            "Only existing accounts can be reset."
        )

    reset_email = user.email
    user.hashed_password = hash_password(new_password)
    db.commit()
    return reset_email


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Reset an existing VIRSA user's password for development."
    )
    parser.add_argument(
        "--email",
        default=None,
        help="Existing account email; defaults to DEV_PASSWORD_RESET_EMAIL.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    email = args.email or os.getenv("DEV_PASSWORD_RESET_EMAIL")

    try:
        _require_local_reset_opt_in()
        if not email:
            raise DevPasswordResetError(
                "Provide --email or set DEV_PASSWORD_RESET_EMAIL."
            )

        new_password = getpass.getpass("New password: ")
        confirmation = getpass.getpass("Confirm new password: ")
        if new_password != confirmation:
            raise DevPasswordResetError("The passwords do not match.")
    except DevPasswordResetError as exc:
        print(f"Development password reset refused: {exc}", file=sys.stderr)
        return 1

    db = SessionLocal()
    try:
        reset_email = reset_existing_user_password(
            db,
            email,
            new_password,
        )
    except DevPasswordResetError as exc:
        db.rollback()
        print(f"Development password reset refused: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:
        db.rollback()
        print(f"Development password reset failed: {exc}", file=sys.stderr)
        return 1
    finally:
        db.close()

    print(f"Password reset successfully for {reset_email}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
