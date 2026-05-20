---
name: api-code-review
description: >
  Checklist for reviewing FastAPI endpoints, Pydantic schemas, and API contracts in JanoraScout.
  Invoke manually with /api-code-review before any endpoint is merged.
---

# API Code Review Checklist — JanoraScout

## Auth & authorization
- [ ] All non-public endpoints have `Depends(get_current_user)` or equivalent guard
- [ ] Role checks enforced in service layer (`coach`, `admin`, `player`, `parent`)
- [ ] JWT decoded and validated — never trust unverified payload claims

## Input validation
- [ ] Request body uses a Pydantic schema — no raw `dict` or `request.json()`
- [ ] Path/query params have type annotations; ranges validated where needed
- [ ] File uploads: mime type + size checked before processing (video: MP4/MOV, max TBD)

## Error handling
- [ ] 404 raised via `HTTPException(status_code=404)` in service — never silently return `None`
- [ ] 422 (validation) is automatic from Pydantic — don't duplicate manually
- [ ] 500 errors logged with `logger.exception()`, not swallowed

## Response shape
- [ ] Returns a Pydantic `Out` schema — never raw ORM object
- [ ] Pagination for list endpoints: `skip` + `limit` with defaults; max `limit` capped (e.g. 100)
- [ ] SSE endpoint (`/sessions/{id}/status`) uses `EventSourceResponse` with proper keepalive

## DB safety
- [ ] Async session used: `AsyncSession`, never sync `Session` in async context
- [ ] All writes inside a try/except with `await db.rollback()` on failure
- [ ] N+1 queries avoided — use `selectinload` or `joinedload` for relations

## File uploads
- [ ] Video stored in MinIO, not on local disk or DB
- [ ] Upload path uses `session_id` as key — never user-supplied filename directly
- [ ] Celery task triggered after MinIO upload confirms success, not before
