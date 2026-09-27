from fastapi import APIRouter, Depends

from app.core.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me")
def get_me(user: dict[str, str] = Depends(get_current_user)) -> dict[str, str]:
    """Return the authenticated Supabase user's public profile."""
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "avatar": user["avatar"],
    }
