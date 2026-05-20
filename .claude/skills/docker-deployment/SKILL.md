---
name: docker-deployment
description: >
  Activates when editing Dockerfile, docker-compose.yml, or nginx/nginx.conf. Covers
  ScoutAI's 7-service Docker Compose stack, .env configuration, MinIO setup, and
  production readiness patterns.
---

# Docker Deployment — ScoutAI

## Services in docker-compose.yml (all 7 required)
| Service    | Image / Build     | Port  | Notes                        |
|------------|-------------------|-------|------------------------------|
| postgres   | postgres:15       | 5432  | + timescaledb extension      |
| redis      | redis:7-alpine    | 6379  | Celery broker                |
| minio      | minio/minio       | 9000  | S3-compatible video storage  |
| backend    | build: backend/   | 8000  | FastAPI                      |
| worker     | build: pipeline/  | —     | Celery worker                |
| frontend   | build: frontend/  | 5173/80 | Vite dev / Nginx prod      |
| nginx      | nginx:alpine      | 80    | Reverse proxy                |

## Dockerfile patterns
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
- Multi-stage builds for frontend: `node:20-alpine` build → `nginx:alpine` serve
- Never COPY `.env` into the image — inject via `env_file:` in docker-compose.yml

## .env patterns
- `.env.example` committed to repo with placeholder values
- `.env` in `.gitignore` always
- Services reference env vars via `environment:` or `env_file: .env` in compose
- Never hardcode `changeme` passwords in production — use Docker secrets or Railway vars

## PostgreSQL + TimescaleDB init
```yaml
postgres:
  image: timescale/timescaledb:latest-pg15
  environment:
    POSTGRES_DB: ${POSTGRES_DB}
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```
Run `alembic upgrade head` in the backend service's entrypoint or as a one-shot init container.

## MinIO bucket init
Create bucket on first run via a one-shot service or backend startup:
```python
# backend startup
client.make_bucket(settings.MINIO_BUCKET, exist_ok=True)
```

## Health checks
Every service should have a `healthcheck:` block. Backend: `GET /health`. Redis: `redis-cli ping`. MinIO: `curl -f http://minio:9000/minio/health/live`.

## Nginx
- Proxy `/api/` → `backend:8000`
- Proxy `/` → `frontend:80` (or serve static in production)
- Configure `client_max_body_size 2g` for video uploads
