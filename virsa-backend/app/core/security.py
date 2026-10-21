import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union

import jwt
from pwdlib import PasswordHash

# Initialize modern Argon2 password hashing context
password_hash_context = PasswordHash.recommended()

# JWT configuration settings
SECRET_KEY = os.getenv("SECRET_KEY", "virsa-insecure-secret-key-for-dev-only-change-me-1234567890")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


def hash_password(password: str) -> str:
    """Generate a secure Argon2 hash from the given plain password."""
    return password_hash_context.hash(password)


# Backward-compatibility alias
get_password_hash = hash_password


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored Argon2 hash."""
    return password_hash_context.verify(plain_password, hashed_password)


def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT access token using PyJWT."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.now(timezone.utc),
    }
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token."""
    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
    )
