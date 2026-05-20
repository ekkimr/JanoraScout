# JanoraScout — Comprehensive Implementation Plan

## Context

Building JanoraScout from scratch: an AI-powered football academy performance analysis platform.
Spec source: `docs/claude_playbook.md`. Design reference: `docs/janorascout_dashboard.html`.
Feature registry: `docs/football_academy_blueprint.jsx` (24 features across CORE/ENHANCED/FUTURE/GK tiers).

Nothing is scaffolded yet — the repo only contains docs and Claude config files.
This plan covers all 7 phases in strict sequence; no phase begins until the prior phase's ✓ goal is confirmed.

---

## Repository Root Structure (to create)

```
JanoraScoutApp/
├── CLAUDE.md                  ← already exists
├── .claude/                   ← already exists
├── docs/                      ← already exists
├── docker-compose.yml
├── .env.example
├── README.md
├── frontend/
├── backend/
├── pipeline/
└── nginx/
```

---

## Phase 1 — Project Scaffolding

**Goal:** All services start with `docker compose up` — no errors, no code yet.

### Files to create (28 files)

**Root**
- `docker-compose.yml` — 7 services: postgres (timescale/timescaledb:latest-pg15), redis:7-alpine, minio/minio, backend (build: backend/), worker (build: pipeline/), frontend (build: frontend/), nginx:alpine
- `.env.example` — all 22 env vars from the spec
- `README.md` — setup instructions (clone → cp .env.example .env → docker compose up)

**frontend/**
- `package.json` — react@18, typescript, vite, tailwindcss, recharts, axios, zustand, react-router-dom@6
- `vite.config.ts` — proxy /api → http://backend:8000
- `tailwind.config.ts` — extend theme with all CSS vars from dashboard (--bg, --green, --blue, etc.), Barlow + Share Tech Mono fonts
- `tsconfig.json` — strict: true, paths alias @/ → src/
- `index.html` — Google Fonts link (Barlow Condensed, Barlow, Share Tech Mono), root div
- `src/main.tsx` — render App
- `src/App.tsx` — placeholder (returns null for now)
- `src/router.tsx` — placeholder

**backend/**
- `requirements.txt` — fastapi, uvicorn[standard], sqlalchemy[asyncio], asyncpg, alembic, python-jose[cryptography], passlib[bcrypt], python-multipart, celery[redis], minio, weasyprint, pydantic-settings, aiofiles
- `Dockerfile` — python:3.11-slim, pip install, CMD uvicorn main:app
- `main.py` — FastAPI() instance, CORS middleware, /health endpoint, placeholder router registration
- `config.py` — pydantic-settings BaseSettings with all 22 env vars
- `database.py` — async engine + AsyncSession factory + Base

**pipeline/**
- `requirements.txt` — celery[redis], ultralytics, supervision, opencv-python-headless, ffmpeg-python, numpy, pandas, sqlalchemy[asyncio], asyncpg, minio, pydantic-settings
- `Dockerfile` — python:3.11-slim + ffmpeg apt install
- `worker.py` — Celery app instance
- `tasks.py` — stub `process_session()` task that just logs and returns
- `config.py` — same BaseSettings pattern as backend

**nginx/**
- `nginx.conf` — proxy /api/ → backend:8000, / → frontend:80, client_max_body_size 2g

✓ **Done when:** `docker compose up` — all 7 containers healthy, `GET http://localhost:8000/health` returns `{"status":"ok"}`

---

## Phase 2 — Database & Auth

**Goal:** JWT auth working, seeded players visible via API.

### Files to create (22 files)

**SQLAlchemy models (backend/)**
- `academies/models.py` — Academy(id, name, location, created_at)
- `users/models.py` — User(id, email, password_hash, role, name, academy_id, created_at)
- `players/models.py` — Player(id, academy_id, name, jersey_number, jersey_color, position, date_of_birth, created_at)
- `sessions/models.py` — Session(id, academy_id, date, label, session_number, video_path, status, duration_seconds, created_at), SessionPlayer(id, session_id, player_id)
- `metrics/models.py` — PlayerStats(all 28 columns from spec), Event(id, session_id, player_id, action_type, timestamp_seconds, result, confidence, metadata JSONB)
- `tracking/models.py` — PlayerTracking(time, session_id, player_id, x, y, speed, frame_number) — hypertable

**Alembic**
- `migrations/alembic.ini`
- `migrations/env.py` — async-compatible env with all models imported
- `migrations/versions/0001_initial.py` — all tables + `create_hypertable('player_tracking','time')` via op.execute()

**Auth module (backend/auth/)**
- `schemas.py` — LoginRequest, TokenResponse, UserOut
- `service.py` — verify_password(), create_access_token(), get_current_user() dependency
- `router.py` — POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me

**Seed script**
- `backend/seed.py` — creates Garuda Football Academy, 6 players (5 outfield + 1 GK from spec), 8 sessions (S17–S24) with mock player_stats showing gradual improvement trend

✓ **Done when:** `POST /api/auth/login` returns JWT. `GET /api/players` (with token) returns 6 seeded players.

---

## Phase 3 — Player & Session APIs

**Goal:** Full CRUD + video upload → MinIO → Celery → SSE status.

### Files to create (20 files)

**Players module (backend/players/)**
- `schemas.py` — PlayerBase, PlayerCreate, PlayerOut, PlayerHistory
- `service.py` — get_all(), get_or_404(), create(), update(), delete(), get_history()
- `router.py` — GET/POST /api/players, GET/PUT/DELETE /api/players/{id}, GET /api/players/{id}/history

**Sessions module (backend/sessions/)**
- `schemas.py` — SessionCreate, SessionOut, SessionStatus
- `service.py` — list_sessions(), get_or_404(), create_with_upload(), delete(), trigger_processing(), get_status()
- `router.py` — GET/POST /api/sessions, GET/DELETE /api/sessions/{id}, POST /api/sessions/{id}/process, GET /api/sessions/{id}/status (SSE via StreamingResponse)

**Metrics module (backend/metrics/)**
- `schemas.py` — PlayerStatsOut, SquadStatsOut, TrendOut, EventOut
- `service.py` — get_player_metrics(), get_squad_metrics(), get_trend(), get_events()
- `router.py` — GET /api/metrics/{session_id}/{player_id}, GET /api/metrics/{session_id}/squad, GET /api/metrics/{player_id}/trend, GET /api/events/{session_id}/{player_id}

**Reports module (backend/reports/)**
- `schemas.py` — ReportRequest, ReportOut
- `service.py` — generate_session_pdf(), generate_player_pdf(), get_download_path()
- `router.py` — POST /api/reports/session/{session_id}, POST /api/reports/player/{player_id}, GET /api/reports/{report_id}/download
- `templates/session_report.html` — WeasyPrint HTML template

**MinIO integration**
- `backend/storage.py` — MinIO client wrapper: upload_video(), get_presigned_url(), delete_object()

**Celery stub upgrade**
- Update `pipeline/tasks.py` — process_session() now: fetch session from DB, update status→processing, sleep 2s, update status→complete, save to MinIO path

✓ **Done when:** Upload video via POST /api/sessions → stored in MinIO → Celery runs → SSE stream shows `{"status":"complete"}`

---

## Phase 4 — Frontend Shell

**Goal:** Full dashboard renders with seeded data. All pages routed. Player switching works.

### Files to create (35 files)

**Types (frontend/src/types/)**
- `player.ts` — Player, PlayerHistory interfaces (matches backend PlayerOut/PlayerHistory)
- `session.ts` — Session, SessionStatus interfaces
- `metrics.ts` — PlayerStats, SquadStats, Trend, Event, EventType enum interfaces

**API layer (frontend/src/api/)**
- `client.ts` — axios instance, baseURL from VITE_API_BASE_URL, Authorization header interceptor
- `players.ts` — fetchPlayers(), fetchPlayer(id), createPlayer(), updatePlayer(), deletePlayer(), fetchPlayerHistory(id)
- `sessions.ts` — fetchSessions(), createSession(), fetchSession(id), deleteSession(), triggerProcessing(id), streamStatus(id)
- `metrics.ts` — fetchPlayerMetrics(sId, pId), fetchSquadMetrics(sId), fetchTrend(pId), fetchEvents(sId, pId)

**Zustand stores (frontend/src/store/)**
- `playerStore.ts` — players[], selectedPlayerId, selectedSessionId, setSelected(), fetchAll()
- `sessionStore.ts` — sessions[], processingStatus, setStatus(), fetchAll()

**Layout components (frontend/src/components/layout/)**
- `Shell.tsx` — CSS grid 220px|1fr × 56px|1fr exactly matching dashboard HTML
- `Topbar.tsx` — JANORA·SCOUT logo, session tag, live badge — pixel-match to HTML reference
- `Sidebar.tsx` — outfield list + GK list, click → setSelected, active state styling

**Shared components (frontend/src/components/shared/)**
- `Button.tsx`, `Badge.tsx`, `Card.tsx`, `Spinner.tsx`, `EmptyState.tsx`

**Dashboard components (frontend/src/components/dashboard/)**
- `PlayerHero.tsx` — jersey number, name, position badge, age, ScoreRing SVG, 8-session sparkline
- `MetricCard.tsx` — label, value, subtext, color border, delta badge (matches metricCard() helper from HTML)
- `PitchHeatmap.tsx` — SVG pitch with position-specific radial gradient blobs (FWD/MID/DEF)
- `SkillRadar.tsx` — 6-axis SVG radar: passing/shooting/sprinting/dribbling/control/defending
- `EventLog.tsx` — scrollable list, colored dots, time, label, result badge (max-height 280px)
- `SessionHistory.tsx` — bar charts for passes + shots across last 5 sessions
- `SquadComparison.tsx` — sortable table: rank, name, passes, shots, sprints, score

**Goalkeeper components (frontend/src/components/goalkeeper/)**
- `GKDashboard.tsx` — GK hero + 5 GK metric cards + pitch + save zones + events + history + distribution
- `SaveZoneMap.tsx` — 3×2 grid with save counts, zone colors (hot/mid/empty)
- `DistributionChart.tsx` — bar chart by channel + type

**Pages (frontend/src/pages/)**
- `Dashboard.tsx` — Shell + Sidebar + main (dispatches to outfield or GK view based on selected player position)
- `PlayerProfile.tsx` — multi-session trend LineCharts (Recharts)
- `SessionUpload.tsx` — drag-and-drop MP4/MOV, player multi-select, date + label, SSE progress
- `Reports.tsx` — player + session range selector, preview, download PDF
- `Login.tsx` — email + password form, POST /api/auth/login, store JWT in localStorage

**Router (frontend/src/)**
- `router.tsx` — BrowserRouter with ProtectedRoute wrapper: /login, /dashboard, /players/:id, /sessions/upload, /reports
- `App.tsx` — RouterProvider

✓ **Done when:** `npm run dev` → full dashboard renders at localhost:5173 with 6 seeded players. Clicking players switches views. GK view renders correctly. All routes navigate without error.

---

## Phase 5 — Core AI Pipeline

**Goal:** Upload real video → dashboard shows real detected events and stats.

### Files to create (12 files)

All in `pipeline/processors/`:

- `video_loader.py` — `load_frames(session_id)`: fetch video from MinIO, FFmpeg extract at 25fps, normalize to 1280×720, return frame path list
- `detector.py` — `detect(frames)`: load YOLOv8n once at import time, run inference per frame, filter confidence > YOLO_CONFIDENCE (0.5), return per-frame detections
- `tracker.py` — `track(detections)`: sv.ByteTracker, assign persistent tracker_id, separate ball track (class_id==32) from player tracks
- `calibrator.py` — `calibrate(tracks, session_id)`: apply homography matrix, convert pixel→real-world coords (meters), compute speed from position delta, write to player_tracking hypertable
- `events/__init__.py`
- `events/passing.py` — PassingClassifier.detect(): ball possession change, separation > PASS_MIN_DISTANCE_M (5.0m)
- `events/shooting.py` — ShootingClassifier.detect(): ball velocity > SHOT_MIN_VELOCITY_MS (12 m/s) toward goal zone
- `events/sprinting.py` — SprintingClassifier.detect(): player speed > SPRINT_THRESHOLD_MS (7.0 m/s) sustained > 0.8s
- `events/dribbling.py` — DribblingClassifier.detect(): player + ball within DRIBBLE_RADIUS_M (1.5m) past opponent bounding box
- `events/ball_control.py` — BallControlClassifier.detect(): ball stays within CONTROL_RADIUS_M (1.2m) for 3+ frames after receive
- `events/goalkeeper.py` — GoalkeeperClassifier.detect(): saves (ball on goal trajectory intercepted), distribution (ball released outward), positioning score
- `aggregator.py` — `aggregate(events, session_id)`: group by player_id, compute all totals/rates/averages, compute performance_score (weighted formula from spec), write to player_stats table

**Update pipeline/tasks.py** — wire full pipeline: load_frames → detect → track → calibrate → classify all events → aggregate → cleanup temp files → status→complete → trigger SSE

✓ **Done when:** Upload real training video → wait for processing → dashboard metrics cards show real values (not seed data)

---

## Phase 6 — Advanced Metrics & Reports

**Goal:** Tackles/interceptions/aerials/pressing live. Player trend charts. PDF reports downloadable.

### Files to create (6 files)

- `pipeline/processors/events/advanced.py` — AdvancedClassifier.detect(): tackles (possession change < 1m, no pass), interceptions (ball cut mid-flight), aerials (y-velocity spike + proximity), key passes (pass followed by shot < 5s), pressing (player moves toward opponent in possession > 3 m/s)
- `backend/reports/templates/session_report.html` — WeasyPrint template: header, player summary, metric bars, event log, performance score ring — uses CSS vars from design system
- Update `backend/reports/service.py` — implement generate_session_pdf() and generate_player_pdf() using WeasyPrint
- Update `frontend/src/pages/PlayerProfile.tsx` — wire up Recharts LineChart for each metric trend using GET /api/metrics/{player_id}/trend
- Update `frontend/src/pages/Reports.tsx` — POST to generate PDF, poll /reports/{id}/download until ready, trigger browser download
- Update `backend/seed.py` — add mock tackle/interception/aerial/pressing data to existing 8 sessions

✓ **Done when:** PDF report downloads with real data. PlayerProfile shows multi-session trend lines. Advanced metrics (tackles, etc.) visible in EventLog.

---

## Phase 7 — Polish & Production Readiness

**Goal:** Full auth flow. Error boundaries. Nginx routing. Rate limiting. Ready for Docker deploy.

### Files to create/update (10 files)

- `frontend/src/pages/Login.tsx` — complete implementation (was placeholder): form validation, error display, redirect to /dashboard on success, redirect to /login if token missing
- `frontend/src/components/shared/ErrorBoundary.tsx` — React ErrorBoundary wrapping all pages
- `frontend/src/components/shared/LoadingState.tsx` — consistent skeleton loader for all async data
- Update all page components — wrap data fetches with loading/error states, use ErrorBoundary
- `backend/main.py` — add: SlowAPI rate limiter (10 req/s per IP on /api/auth/login), structured logging via loguru, startup validation of all required env vars
- `nginx/nginx.conf` — finalize: gzip compression, security headers (X-Frame-Options, X-Content-Type-Options), cache static assets, rate limit headers pass-through
- `backend/Dockerfile` — add HEALTHCHECK directive
- `pipeline/Dockerfile` — add HEALTHCHECK directive
- `docker-compose.yml` — add healthcheck blocks for all 7 services, depends_on with condition: service_healthy
- `.env.example` — verify all variables documented with comments

✓ **Done when:** Full user flow (login → dashboard → upload video → view stats → download PDF) works end-to-end in `docker compose up`. No unhandled errors in browser console.

---

## File Count Summary

| Phase | New Files | Key Deliverable |
|-------|-----------|-----------------|
| 1 | 28 | All 7 Docker services start |
| 2 | 22 | JWT auth + 6 seeded players |
| 3 | 20 | Video upload → MinIO → Celery → SSE |
| 4 | 35 | Full React dashboard with all components |
| 5 | 12 | Real AI pipeline processing |
| 6 | 6  | Advanced metrics + PDF reports |
| 7 | 10 | Production-ready auth + polish |
| **Total** | **133** | **Full system end-to-end** |

---

## Conventions (enforced throughout)

- No `any` in TypeScript — all types in `src/types/`
- Business logic in `service.py` only — not in `router.py`
- All API calls via `src/api/` — not inside React components
- Each pipeline classifier: `class X: def detect(self, data) -> list[Event]`
- Pipeline steps idempotent (safe to re-run same session)
- No hardcoded values — all from `config.py` / env vars
- All components pixel-matched to `docs/janorascout_dashboard.html`

## Verification (end-to-end test sequence)

1. `docker compose up` — all 7 services healthy
2. `POST /api/auth/login` → JWT token returned
3. `GET /api/players` with token → 6 Garuda players returned
4. Open `http://localhost` → login page → enter credentials → redirect to dashboard
5. Dashboard renders with player list; click each player — view switches
6. Click GK (Gilang Wibowo) — GK-specific dashboard renders (save zones, distribution)
7. Go to `/sessions/upload` → drag MP4 → select players → submit → SSE progress bar → status: complete
8. Return to dashboard → select player from that session → real metrics shown
9. Go to `/players/1` → trend line charts show improvement over sessions
10. Go to `/reports` → generate session report → download PDF → verify content
