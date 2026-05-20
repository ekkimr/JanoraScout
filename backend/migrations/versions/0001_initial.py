"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "academies",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="coach"),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("academy_id", sa.Integer, sa.ForeignKey("academies.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "players",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("academy_id", sa.Integer, sa.ForeignKey("academies.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("jersey_number", sa.Integer, nullable=False),
        sa.Column("jersey_color", sa.String(50), nullable=False, server_default="white"),
        sa.Column("position", sa.String(50), nullable=False),
        sa.Column("date_of_birth", sa.Date, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_players_academy_id", "players", ["academy_id"])

    op.create_table(
        "sessions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("academy_id", sa.Integer, sa.ForeignKey("academies.id"), nullable=False),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("session_number", sa.Integer, nullable=False),
        sa.Column("video_path", sa.String(500), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="pending"),
        sa.Column("duration_seconds", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_sessions_academy_id", "sessions", ["academy_id"])

    op.create_table(
        "session_players",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("session_id", sa.Integer, sa.ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("player_id", sa.Integer, sa.ForeignKey("players.id", ondelete="CASCADE"), nullable=False),
    )
    op.create_index("ix_session_players_session_id", "session_players", ["session_id"])
    op.create_index("ix_session_players_player_id", "session_players", ["player_id"])

    op.create_table(
        "player_stats",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("session_id", sa.Integer, sa.ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("player_id", sa.Integer, sa.ForeignKey("players.id", ondelete="CASCADE"), nullable=False),
        sa.Column("passes_attempted", sa.Integer, server_default="0"),
        sa.Column("passes_completed", sa.Integer, server_default="0"),
        sa.Column("pass_accuracy", sa.Float, server_default="0"),
        sa.Column("key_passes", sa.Integer, server_default="0"),
        sa.Column("shots_attempted", sa.Integer, server_default="0"),
        sa.Column("shots_on_target", sa.Integer, server_default="0"),
        sa.Column("shots_on_target_rate", sa.Float, server_default="0"),
        sa.Column("goals", sa.Integer, server_default="0"),
        sa.Column("sprint_count", sa.Integer, server_default="0"),
        sa.Column("distance_covered", sa.Float, server_default="0"),
        sa.Column("top_speed", sa.Float, server_default="0"),
        sa.Column("avg_speed", sa.Float, server_default="0"),
        sa.Column("dribbles_attempted", sa.Integer, server_default="0"),
        sa.Column("dribbles_completed", sa.Integer, server_default="0"),
        sa.Column("dribble_accuracy", sa.Float, server_default="0"),
        sa.Column("touches", sa.Integer, server_default="0"),
        sa.Column("ball_control_rate", sa.Float, server_default="0"),
        sa.Column("tackles_attempted", sa.Integer, server_default="0"),
        sa.Column("tackles_won", sa.Integer, server_default="0"),
        sa.Column("interceptions", sa.Integer, server_default="0"),
        sa.Column("aerial_duels_won", sa.Integer, server_default="0"),
        sa.Column("pressing_actions", sa.Integer, server_default="0"),
        sa.Column("saves", sa.Integer, server_default="0"),
        sa.Column("saves_rate", sa.Float, server_default="0"),
        sa.Column("goals_conceded", sa.Integer, server_default="0"),
        sa.Column("distribution_accuracy", sa.Float, server_default="0"),
        sa.Column("performance_score", sa.Float, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_player_stats_session_id", "player_stats", ["session_id"])
    op.create_index("ix_player_stats_player_id", "player_stats", ["player_id"])

    op.create_table(
        "events",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("session_id", sa.Integer, sa.ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("player_id", sa.Integer, sa.ForeignKey("players.id", ondelete="CASCADE"), nullable=False),
        sa.Column("action_type", sa.String(50), nullable=False),
        sa.Column("timestamp_seconds", sa.Float, nullable=False),
        sa.Column("result", sa.String(50), nullable=False),
        sa.Column("confidence", sa.Float, server_default="1.0"),
        sa.Column("extra_data", sa.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_events_session_id", "events", ["session_id"])
    op.create_index("ix_events_player_id", "events", ["player_id"])

    op.create_table(
        "player_tracking",
        sa.Column("time", sa.DateTime(timezone=True), primary_key=True, nullable=False),
        sa.Column("session_id", sa.Integer, sa.ForeignKey("sessions.id", ondelete="CASCADE"), primary_key=True, nullable=False),
        sa.Column("player_id", sa.Integer, sa.ForeignKey("players.id", ondelete="CASCADE"), nullable=False),
        sa.Column("x", sa.Float, nullable=False),
        sa.Column("y", sa.Float, nullable=False),
        sa.Column("speed", sa.Float, server_default="0"),
        sa.Column("frame_number", sa.BigInteger, nullable=False),
    )
    op.create_index("ix_player_tracking_session_id", "player_tracking", ["session_id"])
    op.create_index("ix_player_tracking_player_id", "player_tracking", ["player_id"])

    op.execute(
        "SELECT create_hypertable('player_tracking', 'time', if_not_exists => TRUE)"
    )


def downgrade() -> None:
    op.drop_table("player_tracking")
    op.drop_table("events")
    op.drop_table("player_stats")
    op.drop_table("session_players")
    op.drop_table("sessions")
    op.drop_table("players")
    op.drop_table("users")
    op.drop_table("academies")
