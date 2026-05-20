"""Seed Garuda Football Academy with 6 players and 8 sessions of mock stats."""
import asyncio
import random
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from config import settings
from database import Base
from academies.models import Academy
from users.models import User
from players.models import Player
from sessions.models import Session, SessionPlayer
from metrics.models import PlayerStats, Event
from auth.service import hash_password

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

PLAYERS_DATA = [
    {"name": "Bima Sakti",        "jersey_number": 10, "jersey_color": "red",   "position": "FWD", "dob": date(2006, 3, 15)},
    {"name": "Rafi Alamsyah",     "jersey_number": 8,  "jersey_color": "red",   "position": "MID", "dob": date(2007, 7, 22)},
    {"name": "Dani Wahyudi",      "jersey_number": 6,  "jersey_color": "red",   "position": "MID", "dob": date(2006, 11, 5)},
    {"name": "Fajar Nugroho",     "jersey_number": 4,  "jersey_color": "red",   "position": "DEF", "dob": date(2007, 1, 30)},
    {"name": "Eko Prasetyo",      "jersey_number": 3,  "jersey_color": "red",   "position": "DEF", "dob": date(2006, 9, 12)},
    {"name": "Gilang Wibowo",     "jersey_number": 1,  "jersey_color": "yellow","position": "GK",  "dob": date(2005, 5, 8)},
]

SESSION_LABELS = ["Tactical", "Technical", "Physical", "Match", "Recovery", "Finishing", "Pressing", "Set Piece"]


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def _make_outfield_stats(player: Player, session_idx: int, session_id: int) -> PlayerStats:
    t = session_idx / 7.0
    jitter = lambda base: max(0.0, base + random.uniform(-base * 0.1, base * 0.1))

    pos_mult = {"FWD": 1.1, "MID": 1.0, "DEF": 0.85}[player.position]

    passes_att = int(jitter(_lerp(20, 35, t) * pos_mult))
    passes_comp = int(passes_att * jitter(_lerp(0.65, 0.82, t)))
    shots_att = int(jitter(_lerp(3, 7, t) * pos_mult))
    shots_on = int(shots_att * jitter(_lerp(0.40, 0.65, t)))
    dribbles_att = int(jitter(_lerp(4, 9, t) * pos_mult))
    dribbles_comp = int(dribbles_att * jitter(_lerp(0.50, 0.72, t)))
    sprints = int(jitter(_lerp(8, 18, t)))
    distance = jitter(_lerp(6.5, 10.2, t))
    touches = int(jitter(_lerp(35, 65, t) * pos_mult))
    tackles_att = int(jitter(_lerp(3, 7, t) / pos_mult))
    tackles_won = int(tackles_att * jitter(_lerp(0.45, 0.68, t)))
    key_passes = int(jitter(_lerp(1, 4, t) * pos_mult))

    pass_acc = passes_comp / passes_att if passes_att else 0.0
    shot_rate = shots_on / shots_att if shots_att else 0.0
    drib_acc = dribbles_comp / dribbles_att if dribbles_att else 0.0
    ctrl_rate = jitter(_lerp(0.55, 0.80, t))
    top_speed = jitter(_lerp(6.0, 8.5, t))
    avg_speed = jitter(_lerp(3.5, 5.0, t))

    # Weighted performance score
    score = (
        pass_acc * 0.20
        + shot_rate * 0.15
        + min(sprints / 20.0, 1.0) * 0.10
        + drib_acc * 0.15
        + ctrl_rate * 0.15
        + min(tackles_won / 5.0, 1.0) * 0.10
        + min(key_passes / 5.0, 1.0) * 0.10
        + min(distance / 10.0, 1.0) * 0.05
    )

    return PlayerStats(
        session_id=session_id,
        player_id=player.id,
        passes_attempted=passes_att,
        passes_completed=passes_comp,
        pass_accuracy=round(pass_acc, 3),
        key_passes=key_passes,
        shots_attempted=shots_att,
        shots_on_target=shots_on,
        shots_on_target_rate=round(shot_rate, 3),
        goals=int(shots_on * 0.25),
        sprint_count=sprints,
        distance_covered=round(distance, 2),
        top_speed=round(top_speed, 2),
        avg_speed=round(avg_speed, 2),
        dribbles_attempted=dribbles_att,
        dribbles_completed=dribbles_comp,
        dribble_accuracy=round(drib_acc, 3),
        touches=touches,
        ball_control_rate=round(ctrl_rate, 3),
        tackles_attempted=tackles_att,
        tackles_won=tackles_won,
        interceptions=int(jitter(_lerp(1, 4, t) / pos_mult)),
        aerial_duels_won=int(jitter(_lerp(1, 3, t))),
        pressing_actions=int(jitter(_lerp(4, 12, t))),
        performance_score=round(min(score, 1.0), 3),
    )


def _make_gk_stats(player: Player, session_idx: int, session_id: int) -> PlayerStats:
    t = session_idx / 7.0
    jitter = lambda base: max(0.0, base + random.uniform(-base * 0.08, base * 0.08))

    saves = int(jitter(_lerp(3, 7, t)))
    goals_conceded = int(jitter(_lerp(2.0, 0.8, t)))
    dist_acc = jitter(_lerp(0.60, 0.80, t))
    saves_rate = saves / (saves + goals_conceded) if (saves + goals_conceded) else 0.0
    score = saves_rate * 0.40 + dist_acc * 0.25 + min(saves / 8.0, 1.0) * 0.35

    return PlayerStats(
        session_id=session_id,
        player_id=player.id,
        saves=saves,
        saves_rate=round(saves_rate, 3),
        goals_conceded=goals_conceded,
        distribution_accuracy=round(dist_acc, 3),
        passes_attempted=int(jitter(_lerp(8, 14, t))),
        passes_completed=int(jitter(_lerp(5, 11, t))),
        pass_accuracy=round(jitter(_lerp(0.60, 0.80, t)), 3),
        distance_covered=round(jitter(_lerp(2.5, 4.0, t)), 2),
        performance_score=round(min(score, 1.0), 3),
    )


def _make_events(player: Player, session_id: int, stats: PlayerStats) -> list[Event]:
    events: list[Event] = []
    t_offset = 0.0

    for _ in range(stats.passes_completed):
        t_offset += random.uniform(20, 120)
        events.append(Event(
            session_id=session_id, player_id=player.id,
            action_type="pass", timestamp_seconds=round(t_offset, 1),
            result="success", confidence=round(random.uniform(0.75, 0.99), 2),
        ))

    for _ in range(stats.shots_attempted - stats.shots_on_target):
        t_offset += random.uniform(60, 300)
        events.append(Event(
            session_id=session_id, player_id=player.id,
            action_type="shot", timestamp_seconds=round(t_offset, 1),
            result="miss", confidence=round(random.uniform(0.70, 0.95), 2),
        ))

    for _ in range(stats.shots_on_target):
        t_offset += random.uniform(60, 300)
        events.append(Event(
            session_id=session_id, player_id=player.id,
            action_type="shot", timestamp_seconds=round(t_offset, 1),
            result="on_target", confidence=round(random.uniform(0.80, 0.99), 2),
        ))

    for _ in range(stats.sprint_count):
        t_offset += random.uniform(30, 90)
        events.append(Event(
            session_id=session_id, player_id=player.id,
            action_type="sprint", timestamp_seconds=round(t_offset, 1),
            result="success", confidence=round(random.uniform(0.85, 0.99), 2),
        ))

    for _ in range(stats.saves):
        t_offset += random.uniform(120, 400)
        events.append(Event(
            session_id=session_id, player_id=player.id,
            action_type="save", timestamp_seconds=round(t_offset, 1),
            result="success", confidence=round(random.uniform(0.80, 0.99), 2),
        ))

    return events


async def seed() -> None:
    random.seed(42)

    async with AsyncSessionLocal() as db:
        # Academy
        academy = Academy(name="Garuda Football Academy", location="Jakarta, Indonesia")
        db.add(academy)
        await db.flush()

        # Admin user
        admin = User(
            email="coach@garuda.id",
            password_hash=hash_password("password123"),
            role="admin",
            name="Coach Hendra",
            academy_id=academy.id,
        )
        db.add(admin)
        await db.flush()

        # Players
        players: list[Player] = []
        for pd in PLAYERS_DATA:
            p = Player(
                academy_id=academy.id,
                name=pd["name"],
                jersey_number=pd["jersey_number"],
                jersey_color=pd["jersey_color"],
                position=pd["position"],
                date_of_birth=pd["dob"],
            )
            db.add(p)
            players.append(p)
        await db.flush()

        # Sessions S17–S24 (8 sessions)
        base_date = date(2025, 9, 1)
        for i in range(8):
            session = Session(
                academy_id=academy.id,
                date=base_date + timedelta(weeks=i),
                label=SESSION_LABELS[i],
                session_number=17 + i,
                status="complete",
            )
            db.add(session)
            await db.flush()

            for player in players:
                sp = SessionPlayer(session_id=session.id, player_id=player.id)
                db.add(sp)

                if player.position == "GK":
                    stats = _make_gk_stats(player, i, session.id)
                else:
                    stats = _make_outfield_stats(player, i, session.id)
                db.add(stats)

                for event in _make_events(player, session.id, stats):
                    db.add(event)

        await db.commit()
        print("Seed complete: Garuda Football Academy, 6 players, 8 sessions.")


if __name__ == "__main__":
    asyncio.run(seed())
