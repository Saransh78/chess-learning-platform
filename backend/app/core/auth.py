"""Supabase JWT verification for BoardSense.

Report endpoints remain public. This module only powers the optional
``/api/auth/me`` endpoint so the frontend can attach a persistent user
identity without changing analysis behavior or the ML pipeline.

Supabase projects using the new ECC (P-256) signing keys issue ES256
access tokens. Verification therefore uses the project's JWKS document
(``{SUPABASE_URL}/auth/v1/.well-known/jwks.json``) via PyJWT's
``PyJWKClient`` instead of the legacy HS256 shared secret.
"""

from functools import lru_cache
from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

_bearer_scheme = HTTPBearer(auto_error=False)

EXPECTED_AUDIENCE = "authenticated"


def _jwks_url() -> str:
    base = settings.SUPABASE_URL.strip() if settings.SUPABASE_URL else ""
    if not base:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured. Set SUPABASE_URL.",
        )
    return f"{base.rstrip('/')}/auth/v1/.well-known/jwks.json"


@lru_cache(maxsize=4)
def _jwk_client_for(jwks_url: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(jwks_url)


def _signing_key_for(token: str):
    try:
        return _jwk_client_for(_jwks_url()).get_signing_key_from_jwt(token)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session. Please sign in again.",
        ) from exc


def verify_supabase_token(token: str) -> dict[str, Any]:
    """Verify a Supabase ES256 access token and return its claims."""
    signing_key = _signing_key_for(token)
    try:
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience=EXPECTED_AUDIENCE,
            options={"require": ["exp", "sub"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please sign in again.",
        ) from exc
    except jwt.InvalidAudienceError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session audience.",
        ) from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session. Please sign in again.",
        ) from exc
    if not isinstance(claims, dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session. Please sign in again.",
        )
    return claims


def _pick_first(*values: Any) -> str:
    for value in values:
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def normalize_user(claims: dict[str, Any]) -> dict[str, str]:
    """Return the public profile shape consumed by the frontend header."""
    metadata = claims.get("user_metadata")
    if not isinstance(metadata, dict):
        metadata = {}
    email = _pick_first(claims.get("email"), metadata.get("email"))
    name = _pick_first(
        metadata.get("full_name"),
        metadata.get("name"),
        metadata.get("preferred_username"),
        metadata.get("user_name"),
        email.split("@")[0] if "@" in email else "",
    )
    avatar = _pick_first(
        metadata.get("avatar_url"),
        metadata.get("picture"),
        metadata.get("avatar"),
    )
    return {
        "id": str(claims.get("sub", "")),
        "email": email,
        "name": name,
        "avatar": avatar,
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> dict[str, str]:
    """FastAPI dependency that verifies the Supabase Bearer token."""
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Bearer token.",
        )
    claims = verify_supabase_token(credentials.credentials)
    user = normalize_user(claims)
    if not user["id"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session. Please sign in again.",
        )
    return user
