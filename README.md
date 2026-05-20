# JanoraScout

AI-powered video analysis platform for football academies. Coaches upload training footage; the AI pipeline automatically detects players, tracks movement, and captures performance metrics per player per session.

## Quick Start

```bash
git clone https://github.com/ekkimr/JanoraScout.git
cd JanoraScout
cp .env.example .env          # edit passwords before production use
docker compose up
```

Open **http://localhost** in your browser.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Zustand |
| Backend | FastAPI (Python 3.11) + SQLAlchemy 2.0 + Alembic |
| Pipeline | Celery + YOLOv8 + ByteTrack + OpenCV + FFmpeg |
| Database | PostgreSQL 15 + TimescaleDB + Redis |
| Storage | MinIO (S3-compatible) |
| Infra | Docker Compose + Nginx |

## Services

| Service | URL |
|---|---|
| App | http://localhost |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| MinIO Console | http://localhost:9001 |

## Development

- Full spec: `docs/claude_playbook.md`
- Implementation plan: `docs/implementation_plan.md`
- Design reference: `docs/janorascout_dashboard.html`
- Feature registry: `docs/football_academy_blueprint.jsx`

## Seed Data

Academy **Garuda Football Academy** (Jakarta) with 6 players and 8 sessions is seeded automatically on first run.

Default credentials: `coach@garuda.id` / `password123`
