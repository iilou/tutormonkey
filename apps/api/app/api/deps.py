import os
import re
from typing import Annotated
from uuid import UUID

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel


class AuthenticatedUser(BaseModel):
    id: UUID
    email: str | None = None


class SupabaseUser(AuthenticatedUser):
    is_anonymous: bool = False


def unauthorized() -> HTTPException:
    return HTTPException(
        status_code=401,
        detail="Sign-in required",
        headers={"WWW-Authenticate": "Bearer"},
    )


def auth_unavailable() -> HTTPException:
    return HTTPException(status_code=503, detail="Authentication is unavailable")


def require_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(HTTPBearer(auto_error=False))
    ],
) -> AuthenticatedUser:
    if not credentials or not re.fullmatch(
        r"[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+){2}", credentials.credentials
    ):
        raise unauthorized()

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_PUBLISHABLE_KEY")
    if not url or not key:
        raise auth_unavailable()

    try:
        response = httpx.get(
            f"{url.rstrip('/')}/auth/v1/user",
            headers={
                "apikey": key,
                "Authorization": f"Bearer {credentials.credentials}",
            },
            timeout=5,
        )
    except (httpx.RequestError, httpx.InvalidURL):
        raise auth_unavailable() from None

    if response.status_code in {401, 403}:
        raise unauthorized()
    if response.status_code != 200:
        raise auth_unavailable()

    try:
        user = SupabaseUser.model_validate_json(response.content)
    except ValueError:
        raise auth_unavailable() from None

    if user.is_anonymous:
        raise unauthorized()

    return user
