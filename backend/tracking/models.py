from datetime import datetime
from sqlalchemy import Integer, Float, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class PlayerTracking(Base):
    __tablename__ = "player_tracking"

    time: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id", ondelete="CASCADE"), primary_key=True, index=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    x: Mapped[float] = mapped_column(Float, nullable=False)
    y: Mapped[float] = mapped_column(Float, nullable=False)
    speed: Mapped[float] = mapped_column(Float, default=0.0)
    frame_number: Mapped[int] = mapped_column(BigInteger, nullable=False)
