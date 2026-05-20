---
name: python-conventions
description: >
  Activates when editing .py files in the ScoutAI backend. Enforces FastAPI router/service
  split, SQLAlchemy 2.0 model patterns, Alembic migration rules, Pydantic schemas, and
  pytest structure.
---

# Python Conventions — ScoutAI Backend

## Router / Service split (hard rule)
- `router.py` — HTTP wiring only: path, method, dependencies, call service, return response
- `service.py` — all business logic, DB queries, error raising
- Never put queries or logic in `router.py`; never put HTTP concerns in `service.py`

```python
# router.py
@router.get("/{player_id}", response_model=PlayerOut)
async def get_player(player_id: int, db: AsyncSession = Depends(get_db)):
    return await PlayerService.get_or_404(db, player_id)

# service.py
class PlayerService:
    @staticmethod
    async def get_or_404(db: AsyncSession, player_id: int) -> Player:
        player = await db.get(Player, player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        return player
```

## SQLAlchemy 2.0 models
- Use `Mapped[T]` annotations, not `Column()`
- Every model inherits from `Base` (declared in `database.py`)
- FK relationships use `relationship()` with `lazy="selectin"` for async safety

```python
class Player(Base):
    __tablename__ = "players"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    position: Mapped[str] = mapped_column(String(3))  # FWD|MID|DEF|GK
    academy_id: Mapped[int] = mapped_column(ForeignKey("academies.id"))
```

## Pydantic schemas
- `schemas.py` per module: `PlayerBase`, `PlayerCreate(PlayerBase)`, `PlayerOut(PlayerBase)`
- Never expose ORM models directly — always return Pydantic `Out` schemas
- Use `model_config = ConfigDict(from_attributes=True)` for ORM compatibility

## pytest
- Tests in `backend/tests/`, mirroring module structure
- Use `pytest-asyncio` with `AsyncClient` for endpoint tests
- Fixture for test DB session in `conftest.py`; never hit prod DB in tests
- Run single file: `pytest tests/test_players.py -v`

## Config
- All settings via `config.py` using `pydantic-settings` `BaseSettings`
- No hardcoded strings — reference `settings.POSTGRES_URL`, `settings.JWT_SECRET`, etc.
