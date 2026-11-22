from typing import Annotated

from fastapi import Depends, FastAPI, Response

from app.api.deps import AuthenticatedUser, require_user

app = FastAPI()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/me", response_model=AuthenticatedUser)
def me(
    user: Annotated[AuthenticatedUser, Depends(require_user)], response: Response
) -> AuthenticatedUser:
    response.headers["Cache-Control"] = "private, no-store"
    return user
