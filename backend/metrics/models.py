from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class PlayerStats(Base):
    __tablename__ = "player_stats"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)

    # Passing
    passes_attempted: Mapped[int] = mapped_column(Integer, default=0)
    passes_completed: Mapped[int] = mapped_column(Integer, default=0)
    pass_accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    key_passes: Mapped[int] = mapped_column(Integer, default=0)

    # Shooting
    shots_attempted: Mapped[int] = mapped_column(Integer, default=0)
    shots_on_target: Mapped[int] = mapped_column(Integer, default=0)
    shots_on_target_rate: Mapped[float] = mapped_column(Float, default=0.0)
    goals: Mapped[int] = mapped_column(Integer, default=0)

    # Movement
    sprint_count: Mapped[int] = mapped_column(Integer, default=0)
    distance_covered: Mapped[float] = mapped_column(Float, default=0.0)
    top_speed: Mapped[float] = mapped_column(Float, default=0.0)
    avg_speed: Mapped[float] = mapped_column(Float, default=0.0)

    # Dribbling
    dribbles_attempted: Mapped[int] = mapped_column(Integer, default=0)
    dribbles_completed: Mapped[int] = mapped_column(Integer, default=0)
    dribble_accuracy: Mapped[float] = mapped_column(Float, default=0.0)

    # Ball control
    touches: Mapped[int] = mapped_column(Integer, default=0)
    ball_control_rate: Mapped[float] = mapped_column(Float, default=0.0)

    # Defensive
    tackles_attempted: Mapped[int] = mapped_column(Integer, default=0)
    tackles_won: Mapped[int] = mapped_column(Integer, default=0)
    interceptions: Mapped[int] = mapped_column(Integer, default=0)
    aerial_duels_won: Mapped[int] = mapped_column(Integer, default=0)
    pressing_actions: Mapped[int] = mapped_column(Integer, default=0)

    # GK specific
    saves: Mapped[int] = mapped_column(Integer, default=0)
    saves_rate: Mapped[float] = mapped_column(Float, default=0.0)
    goals_conceded: Mapped[int] = mapped_column(Integer, default=0)
    distribution_accuracy: Mapped[float] = mapped_column(Float, default=0.0)

    # Overall
    performance_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)
    timestamp_seconds: Mapped[float] = mapped_column(Float, nullable=False)
    result: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    extra_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
