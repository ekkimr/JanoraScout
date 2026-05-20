# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## JanoraScout

AI-powered video analysis platform for football academies. Coaches upload training footage; the AI pipeline detects players, tracks movement, and captures performance metrics per player per session.

## Stacks

```
frontend/  — React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Recharts
backend/   — FastAPI (Python 3.11) + SQLAlchemy 2.0 + Alembic + JWT
pipeline/  — Celery workers + YOLOv8 + ByteTrack (supervision) + OpenCV + FFmpeg
infra/     — PostgreSQL 15 + TimescaleDB + Redis + MinIO + Nginx (Docker Compose)
```

## Build & test commands

```bash
# Start full stack
docker compose up

# Frontend
cd frontend && npm install && npm run dev   # http://localhost:5173
npm run lint                               # ESLint
npm run test                               # Vitest

# Backend
cd backend && uvicorn main:app --reload --port 8000
pytest                                     # all tests
pytest tests/test_players.py -v           # single file
ruff check .                              # lint

# Migrations
alembic upgrade head
alembic revision --autogenerate -m "description"
```

## Planning vs. direct execution

Plan first when: touching 3+ files, new endpoint/feature, schema changes, cross-stack work.
Execute directly when: debugging, single-file fix, or user says "just do it".

## Documentation

After any feature, flow change, or API change, invoke `/doc-updater`.
The Stop hook (`check-docs-needed.sh`) also reminds automatically.

## Universal rules

- No `any` in TypeScript — use `src/types/` interfaces
- Business logic in `service.py` only, never in `router.py`
- All API calls through `src/api/` modules only, never inside React components
- Each pipeline classifier: standalone class with `detect(data) -> list[Event]`
- Pipeline steps are idempotent — safe to re-run on same session
- No hardcoded values — use `config.py` / env vars

## Stack conventions

Skills auto-activate by file type:
- `.py` files → `python-conventions`
- `.ts` / `.tsx` files → `react-conventions`
- `pipeline/` folder → `pipeline-conventions`
- `Dockerfile` / `docker-compose.yml` → `docker-deployment`
- `migrations/` folder → `db-migration`

Manual: `/api-code-review`, `/db-migration`, `/docker-deployment`

## Agents

```
/codebase-explorer  — map the repo before starting a feature (fast, read-only)
/code-reviewer      — review changes before committing
/test-writer        — generate pytest / Vitest tests for any file
/security-auditor   — OWASP scan (auth, file uploads, API endpoints)
/db-inspector       — check PostgreSQL schema vs Alembic models
/doc-updater        — sync docs/ after feature implementations
/feature-planner    — cross-stack plan before writing any code
/product-analyst    — product/feature verdict with persona + benchmark
/ux-reviewer        — UI/UX review for dashboard components and flows
```

## Design tokens

Palette: `--bg: #040a06` `--green: #00e676` `--amber: #ffab40` `--red: #ff5252` `--blue: #40c4ff` `--text: #c8d8cc`
Metric colors — Passes: `#40c4ff` | Shots: `#ff5252` | Sprints: `#ffab40` | Dribbles: `#ea80fc` | Control: `#69f0ae` | Saves: `#ff9f43`
Fonts — Display: `Barlow Condensed 700/800` | Body: `Barlow 300-500` | Mono: `Share Tech Mono`

## Reference files

- `docs/janorascout_dashboard.html` — pixel-perfect design reference for all dashboard components
- `docs/claude_playbook.md` — full project spec: DB schema, API endpoints, AI pipeline, build phases
