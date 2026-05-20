# JanoraScout — Claude Code Playbook
> Drop this file as `CLAUDE.md` in a blank folder, open Claude Code, and say:
> **"Read this playbook and build the JanoraScout project from scratch, phase by phase."**

---

## 1. PROJECT OVERVIEW

**Product name:** JanoraScout  
**What it is:** An AI-powered video analysis platform for football academies. Coaches upload training session footage; the AI pipeline automatically detects players, tracks movement, and captures performance metrics per player per session.  
**Primary users:** Coaches, Academy Directors, Players, Parents  
**Core value:** Replace manual stat-counting with automated, consistent, data-driven player performance tracking.

---

## 2. TECH STACK

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **HTTP client:** Axios
- **State management:** Zustand
- **Routing:** React Router v6
- **Font:** Barlow Condensed + Barlow (Google Fonts)

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Task queue:** Celery + Redis (for async video processing)
- **Auth:** JWT (python-jose)
- **ORM:** SQLAlchemy 2.0 + Alembic (migrations)
- **File uploads:** python-multipart
- **PDF reports:** WeasyPrint

### AI / ML Pipeline
- **Object detection:** Ultralytics YOLOv8
- **Player tracking:** supervision library (ByteTrack)
- **Video processing:** OpenCV + FFmpeg
- **Pose estimation (Phase 4):** MediaPipe
- **Array ops:** NumPy + pandas
- **Model format:** PyTorch

### Database
- **Primary:** PostgreSQL 15
- **Time-series extension:** TimescaleDB
- **Cache / queue broker:** Redis

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Reverse proxy:** Nginx
- **Storage:** MinIO (S3-compatible, self-hosted)
- **Environment:** .env files per service

---

## 3. FOLDER STRUCTURE

Generate this exact folder structure:

```
janorascout/
├── CLAUDE.md                        ← this file
├── docker-compose.yml
├── .env.example
├── README.md
│
├── frontend/                        ← React + Vite app
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── router.tsx
│       ├── api/
│       │   ├── client.ts            ← axios instance
│       │   ├── sessions.ts
│       │   ├── players.ts
│       │   └── metrics.ts
│       ├── store/
│       │   ├── playerStore.ts       ← Zustand
│       │   └── sessionStore.ts
│       ├── pages/
│       │   ├── Dashboard.tsx        ← main coach view
│       │   ├── PlayerProfile.tsx    ← per-player deep dive
│       │   ├── SessionUpload.tsx    ← upload + processing status
│       │   ├── Reports.tsx          ← PDF report generation
│       │   └── Login.tsx
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Topbar.tsx
│       │   │   └── Shell.tsx
│       │   ├── dashboard/
│       │   │   ├── PlayerHero.tsx
│       │   │   ├── MetricCard.tsx
│       │   │   ├── PitchHeatmap.tsx
│       │   │   ├── SkillRadar.tsx
│       │   │   ├── EventLog.tsx
│       │   │   ├── SessionHistory.tsx
│       │   │   └── SquadComparison.tsx
│       │   ├── goalkeeper/
│       │   │   ├── GKDashboard.tsx
│       │   │   ├── SaveZoneMap.tsx
│       │   │   └── DistributionChart.tsx
│       │   └── shared/
│       │       ├── Button.tsx
│       │       ├── Badge.tsx
│       │       ├── Card.tsx
│       │       ├── Spinner.tsx
│       │       └── EmptyState.tsx
│       └── types/
│           ├── player.ts
│           ├── session.ts
│           └── metrics.ts
│
├── backend/                         ← FastAPI app
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── main.py                      ← FastAPI entrypoint
│   ├── config.py                    ← settings from .env
│   ├── database.py                  ← SQLAlchemy engine + session
│   ├── auth/
│   │   ├── router.py
│   │   ├── service.py
│   │   └── schemas.py
│   ├── players/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── sessions/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── metrics/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── reports/
│   │   ├── router.py
│   │   ├── service.py
│   │   └── templates/
│   │       └── session_report.html
│   └── migrations/
│       └── alembic.ini
│
├── pipeline/                        ← AI video analysis
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── worker.py                    ← Celery worker entrypoint
│   ├── tasks.py                     ← Celery task definitions
│   ├── config.py
│   └── processors/
│       ├── __init__.py
│       ├── video_loader.py          ← FFmpeg frame extraction
│       ├── detector.py              ← YOLOv8 detection
│       ├── tracker.py               ← ByteTrack player tracking
│       ├── calibrator.py            ← pixel → real-world coords
│       ├── events/
│       │   ├── __init__.py
│       │   ├── passing.py
│       │   ├── shooting.py
│       │   ├── sprinting.py
│       │   ├── dribbling.py
│       │   ├── ball_control.py
│       │   ├── goalkeeper.py        ← saves, distribution, positioning
│       │   └── advanced.py          ← tackles, interceptions, aerials
│       └── aggregator.py            ← compile events → player stats
│
└── nginx/
    └── nginx.conf
```

---

## 4. DATABASE SCHEMA

Create these tables via SQLAlchemy models + Alembic migrations:

### `users`
```
id, email, password_hash, role (coach|admin|player|parent),
name, academy_id, created_at
```

### `academies`
```
id, name, location, created_at
```

### `players`
```
id, academy_id, name, jersey_number, jersey_color,
position (FWD|MID|DEF|GK), date_of_birth, created_at
```

### `sessions`
```
id, academy_id, date, label (e.g. "Morning Training"),
session_number, video_path, status (pending|processing|complete|failed),
duration_seconds, created_at
```

### `session_players`
```
id, session_id, player_id  ← which players participated
```

### `events`
```
id, session_id, player_id,
action_type (pass|shot|sprint|dribble|control|save|distribution|
             tackle|interception|aerial|press|key_pass),
timestamp_seconds FLOAT,
result (success|failed|on_target|off_target|saved),
confidence FLOAT,
metadata JSONB    ← flexible: speed, zone, distance, etc.
```

### `player_stats` (aggregated per session)
```
id, session_id, player_id,
passes INT, pass_accuracy FLOAT,
shots INT, shots_on_target INT,
sprints INT, sprint_max_speed FLOAT, distance_covered FLOAT,
dribbles INT, dribble_accuracy FLOAT,
ball_control_rate FLOAT,
tackles INT, interceptions INT,
aerial_duels INT, aerial_won INT,
key_passes INT, progressive_passes INT,
press_count INT,
saves INT, save_rate FLOAT,           ← GK only
distribution INT, dist_accuracy FLOAT, ← GK only
positioning_score FLOAT,               ← GK only
reaction_time_ms FLOAT,                ← GK only
performance_score FLOAT,               ← computed overall
created_at
```

### `player_tracking` (TimescaleDB hypertable — time-series)
```
time TIMESTAMPTZ, session_id, player_id,
x FLOAT, y FLOAT,        ← real-world pitch coords (meters)
speed FLOAT,             ← m/s
frame_number INT
```

---

## 5. API ENDPOINTS

### Auth
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Players
```
GET    /api/players                  ← list all (filter by academy)
POST   /api/players                  ← create player
GET    /api/players/{id}             ← player profile + all-time stats
PUT    /api/players/{id}
DELETE /api/players/{id}
GET    /api/players/{id}/history     ← stats across all sessions
```

### Sessions
```
GET    /api/sessions                 ← list sessions
POST   /api/sessions                 ← create + upload video
GET    /api/sessions/{id}            ← session detail + status
DELETE /api/sessions/{id}
GET    /api/sessions/{id}/players    ← all player stats for session
POST   /api/sessions/{id}/process    ← trigger AI pipeline manually
GET    /api/sessions/{id}/status     ← processing progress (SSE)
```

### Metrics
```
GET    /api/metrics/{session_id}/{player_id}   ← full metrics for player/session
GET    /api/metrics/{session_id}/squad         ← all players in session (comparison)
GET    /api/metrics/{player_id}/trend          ← multi-session trend data
GET    /api/events/{session_id}/{player_id}    ← event log
```

### Reports
```
POST   /api/reports/session/{session_id}       ← generate full session PDF
POST   /api/reports/player/{player_id}         ← generate player progress PDF
GET    /api/reports/{report_id}/download
```

---

## 6. AI PIPELINE — PROCESSING FLOW

When a video is uploaded, trigger this pipeline via Celery task:

```
STEP 1 — video_loader.py
  Input:  raw video file path
  Action: extract frames at 25 FPS using FFmpeg (subprocess)
          normalize to 1280×720
          save frames to temp dir
  Output: list of frame paths, fps, duration

STEP 2 — detector.py
  Input:  frame paths
  Model:  YOLOv8n (nano — fast inference)
          classes to detect: person (0), sports ball (32)
  Action: run inference per frame
          filter detections by confidence > 0.5
  Output: per-frame list of {box, class, confidence}

STEP 3 — tracker.py
  Input:  per-frame detections
  Model:  ByteTrack via supervision library
  Action: assign persistent tracker_id per player across frames
          separate ball track from player tracks
  Output: per-frame list of {tracker_id, box, class}

STEP 4 — calibrator.py
  Input:  tracker output + pitch calibration points
  Action: apply homography matrix (computed once at setup)
          convert pixel (x,y) → real-world pitch coords (meters)
          compute speed from position delta per frame
  Output: per-frame per-player {real_x, real_y, speed_ms}
          write to player_tracking hypertable

STEP 5 — events/ classifiers (run in order)
  Each classifier receives: full tracking timeline for session

  passing.py:
    - Detect ball possession change from Player A to Player B
    - Ball separation > 5m between release and receive
    - Log: pass event, timestamp, from_player, to_player, distance, result

  shooting.py:
    - Ball velocity > 12 m/s toward goal zone
    - Log: shot event, timestamp, player, zone, result (on/off target)

  sprinting.py:
    - Player speed > 7.0 m/s sustained for > 0.8 seconds
    - Log: sprint event, timestamp, player, duration, max_speed, distance

  dribbling.py:
    - Player + ball within 1.5m while moving past opponent bounding box
    - Log: dribble event, timestamp, player, result (success/failed)

  ball_control.py:
    - Ball received by player (possession change)
    - Ball stays within 1.2m of player for 3+ frames
    - Log: control event, timestamp, player, result

  goalkeeper.py:
    - Detect GK player (by jersey or manual tag)
    - Save: ball on goal trajectory intercepted by GK
    - Distribution: ball released from GK with outward trajectory
    - Positioning: compute GK angle relative to ball and goal center

  advanced.py:
    - Tackle: possession change within tight proximity (< 1m), no pass
    - Interception: player intercepts ball mid-flight before opponent
    - Aerial: two players jump (y-velocity spike) near ball peak height
    - Key pass: pass followed by shot within 5 seconds
    - Press: player moves toward opponent in possession at > 3 m/s

STEP 6 — aggregator.py
  Input:  all events for session
  Action: group by player_id
          compute totals, rates, averages per metric
          compute performance_score (weighted formula below)
          write to player_stats table
  Output: complete player_stats rows for all players in session

STEP 7 — cleanup
  Delete temp frame files
  Update session status → "complete"
  Trigger SSE notification to frontend
```

### Performance Score Formula
```python
def compute_performance_score(stats) -> float:
    weights = {
        "pass_accuracy":        0.20,
        "shots_on_target_rate": 0.15,
        "sprint_count_norm":    0.10,
        "dribble_accuracy":     0.15,
        "ball_control_rate":    0.15,
        "tackles_norm":         0.10,
        "key_passes_norm":      0.10,
        "distance_norm":        0.05,
    }
    # normalize each metric to 0–100 scale against session averages
    # return weighted sum, clamped to 0–100
```

---

## 7. FRONTEND PAGES & COMPONENTS

### Dashboard (`/dashboard`)
Layout: sidebar (player list) + main content area

**Sidebar:**
- List all players grouped by OUTFIELD / GOALKEEPER
- Show jersey number, name, position, performance score
- Click to select player → update main content

**Main content (Outfield player selected):**
1. `PlayerHero` — jersey number, name, position badge, age, distance covered, animated score ring, 8-session sparkline
2. `MetricCard × 5` — Passes, Shots, Sprints, Dribbles, Ball Control — each with delta vs last session
3. `PitchHeatmap` — SVG football pitch with radial gradient blobs at player position zones
4. `SkillRadar` — hexagonal radar: passing / shooting / sprinting / dribbling / control / defending
5. `EventLog` — scrollable list of detected events with timestamp, type, description, result badge
6. `SessionHistory` — bar charts for passes and shots across last 5 sessions
7. `SquadComparison` — table of all outfield players, sortable by metric, highlight selected player

**Main content (GK selected):**
1. `PlayerHero` — same structure, GK-specific tags
2. `MetricCard × 5` — Saves, Positioning, Distribution, Aerial Claims, Reaction Time
3. `PitchHeatmap` — GK position zones (near goal)
4. `SaveZoneMap` — 2×3 grid (TL/TC/TR, BL/BC/BR) with save counts per zone
5. `EventLog` — GK events: saves, distributions, aerials
6. `DistributionChart` — bar chart by channel + type breakdown

### Session Upload (`/sessions/upload`)
- Drag-and-drop video upload (MP4/MOV)
- Player selection (multi-select from roster)
- Session date + label input
- Real-time processing progress via SSE (animated checklist)

### Player Profile (`/players/:id`)
- Multi-session trend line charts per metric (Recharts LineChart)
- Session-by-session stats table

### Reports (`/reports`)
- Select player + session range → preview → download PDF

---

## 8. BUILD PHASES

Build in this exact order. Complete each phase fully before moving to the next.

### PHASE 1 — Project Scaffolding
**Goal:** Empty project with working dev environment  
1. Create all folders per Section 3
2. Initialize frontend with Vite + React + TypeScript
3. Install all frontend dependencies
4. Configure Tailwind with design tokens from Section 10
5. Initialize backend with FastAPI, requirements.txt
6. Create docker-compose.yml with all 7 services
7. Create .env.example with all variables from Section 11
8. Write README.md with setup instructions

**✓ Done when:** `docker compose up` starts all services without errors.

---

### PHASE 2 — Database & Auth
**Goal:** Working database with all tables + JWT auth  
1. Create all SQLAlchemy models per Section 4
2. Configure Alembic, generate and run initial migration
3. Create TimescaleDB hypertable for `player_tracking`
4. Implement auth endpoints + JWT middleware
5. Seed script per Section 13

**✓ Done when:** `POST /api/auth/login` returns JWT. `GET /api/players` returns seeded players.

---

### PHASE 3 — Player & Session APIs
**Goal:** Full CRUD + video upload pipeline stub  
1. All player endpoints
2. All session endpoints
3. MinIO video upload integration
4. Celery stub task (no AI yet — just sets status to complete)
5. SSE status endpoint

**✓ Done when:** Upload video → stored in MinIO → Celery runs → status updates via SSE.

---

### PHASE 4 — Frontend Shell
**Goal:** Working React app with all pages, routing, and real API data  
1. Shell, Sidebar, Topbar layout components
2. React Router + protected routes
3. Zustand stores
4. Full Dashboard with all outfield + GK components
5. SessionUpload page with drag-and-drop
6. Connect all Axios API calls to backend

**✓ Done when:** Full dashboard renders with seeded data. Player switching works.

---

### PHASE 5 — Core AI Pipeline
**Goal:** Real video processing for 5 outfield metrics + GK saves  
1. video_loader.py → detector.py → tracker.py → calibrator.py
2. All 5 outfield event classifiers + goalkeeper.py
3. aggregator.py → player_stats
4. Wire full Celery task
5. Connect metrics API to dashboard

**✓ Done when:** Upload real video → dashboard shows real detected events and stats.

---

### PHASE 6 — Advanced Metrics & Reports
**Goal:** Tackles, interceptions, aerials, pressing + PDF reports  
1. advanced.py classifiers
2. PlayerProfile.tsx with trend charts
3. WeasyPrint PDF generation
4. Reports page

**✓ Done when:** Full PDF report generates. Advanced metrics visible in dashboard.

---

### PHASE 7 — Polish & Production Readiness
**Goal:** Full auth flow, error handling, deploy-ready  
1. Login page + protected routes
2. Error boundaries + loading states everywhere
3. Nginx config
4. Logging, rate limiting, env validation

**✓ Done when:** Full user flow works end-to-end in Docker.

---

## 9. CODING CONVENTIONS

- All code in English
- No `any` types in TypeScript — define interfaces in `src/types/`
- Every function has a docstring / JSDoc comment
- Max function length: 50 lines — split into helpers if longer
- No hardcoded values — use constants or config
- Frontend: all API calls through `src/api/` only, never in components
- Backend: business logic in `service.py` only, never in `router.py`
- Pipeline: each classifier is a standalone class with `detect(data) -> list[Event]`
- Pipeline steps are idempotent — safe to re-run on same session

---

## 10. DESIGN SYSTEM

### Colors
```
--bg:      #040a06   --surface: #080f0a   --card:    #0c1510
--border:  #112018   --border2: #1a3025   --dim:     #1e3028
--green:   #00e676   --green2:  #69f0ae   --amber:   #ffab40
--red:     #ff5252   --blue:    #40c4ff   --purple:  #ea80fc
--text:    #c8d8cc   --muted:   #4a6855
```

### Fonts
- Display: `Barlow Condensed` (700, 800)
- Body: `Barlow` (300, 400, 500)
- Mono labels: `Share Tech Mono`

### Metric Colors (use consistently everywhere)
```
Passes: #40c4ff  |  Shots: #ff5252   |  Sprints: #ffab40
Dribbles: #ea80fc  |  Ball Control: #69f0ae  |  Saves (GK): #ff9f43
Tackles: #00e676
```

---

## 11. ENVIRONMENT VARIABLES

```env
POSTGRES_USER=janorascout
POSTGRES_PASSWORD=changeme
POSTGRES_DB=janorascout
DATABASE_URL=postgresql://janorascout:changeme@postgres:5432/janorascout
REDIS_URL=redis://redis:6379/0
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=changeme
MINIO_ENDPOINT=minio:9000
MINIO_BUCKET=janorascout-videos
JWT_SECRET=changeme-use-a-long-random-string
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
YOLO_MODEL=yolov8n.pt
YOLO_CONFIDENCE=0.5
SPRINT_THRESHOLD_MS=7.0
PASS_MIN_DISTANCE_M=5.0
SHOT_MIN_VELOCITY_MS=12.0
CONTROL_RADIUS_M=1.2
DRIBBLE_RADIUS_M=1.5
FRAME_RATE=25
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:80
VITE_API_BASE_URL=http://localhost:8000
```

---

## 12. SEED DATA

Academy: **Garuda Football Academy**, Jakarta

| # | Name | Position | Age |
|---|---|---|---|
| 7 | Arif Kurniawan | FWD | 16 |
| 10 | Dimas Prasetyo | MID | 15 |
| 4 | Rizky Fadhilah | DEF | 17 |
| 11 | Bagas Santoso | FWD | 15 |
| 8 | Fauzan Hidayat | MID | 16 |
| 1 | Gilang Wibowo | GK | 16 |

Create 8 sessions (S17–S24) with mock `player_stats` showing gradual improvement trend per player.

---

## 13. REFERENCE FILES

The following files were built during the design phase and should be used as visual and structural references:

- `football_academy_blueprint.jsx` — interactive product blueprint (feature list, metrics library, AI pipeline steps, roadmap)
- `football_academy_blueprint.md` — markdown version of the same blueprint
- `janorascout_dashboard.html` — fully working dashboard prototype (use this as the pixel-perfect design reference for all dashboard components)

When building frontend components, open `janorascout_dashboard.html` and replicate the exact layout, colors, typography, and component structure in React + TypeScript + Tailwind.

---

## 14. HOW TO START

When Claude Code reads this CLAUDE.md:

1. Confirm you have read and understood all sections
2. Ask: **"Should I start from Phase 1 (full build) or a specific phase?"**
3. For each phase:
   - Announce which phase you are starting
   - List all files you will create
   - Build every file completely — no stubs, no TODOs, no placeholder comments
   - Confirm the phase ✓ goal before moving on
4. After all 7 phases: verify `docker compose up` brings the full system online

**Rules:**
- Do not skip phases
- Do not leave TODO comments — implement everything
- Do not use `any` in TypeScript
- When in doubt about design, refer to `janorascout_dashboard.html`
- When in doubt about a metric or feature, refer to `football_academy_blueprint.md`

---

*JanoraScout CLAUDE.md Playbook v1.0 — Football Academy AI Performance Analysis System*
