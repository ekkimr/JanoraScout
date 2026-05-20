from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.service import get_current_user
from database import get_db
from users.models import User
from .models import Player
from .schemas import PlayerOut

router = APIRouter(prefix="/api/players", tags=["players"])


@router.get("", response_model=list[PlayerOut])
async def list_players(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[Player]:
    result = await db.execute(
        select(Player).where(Player.academy_id == current_user.academy_id).order_by(Player.jersey_number)
    )
    return list(result.scalars().all())
