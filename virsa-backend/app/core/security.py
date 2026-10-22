
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union

import jwt
from pwdlib import PasswordHash

password_hash_context = PasswordHash.recommended()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY is missing. Set it in the backend .env file."
    )

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)


def hash_password(password: str) -> str:
    return password_hash_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_hash_context.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    if expires_delta is None:
        expires_delta = timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "exp": now + expires_delta,
        "iat": now,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
    )
