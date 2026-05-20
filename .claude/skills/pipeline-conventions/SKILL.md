---
name: pipeline-conventions
description: >
  Activates when editing files in pipeline/. Enforces Celery task patterns, YOLOv8/ByteTrack
  usage, event classifier class contract, idempotent step design, and aggregator rules.
---

# Pipeline Conventions — JanoraScout AI Pipeline

## 7-step processing order (must not be reordered)
```
video_loader → detector → tracker → calibrator → events/* → aggregator → cleanup
```

## Celery task pattern
- One Celery task in `tasks.py`: `process_session(session_id: int)`
- Task sets `session.status = "processing"` at start, `"complete"` or `"failed"` at end
- All steps called sequentially inside the task — no sub-tasks chaining
- Idempotent: re-running `process_session` on same session_id must produce same result

```python
@celery_app.task(bind=True, max_retries=2)
def process_session(self, session_id: int):
    try:
        update_status(session_id, "processing")
        frames = load_frames(session_id)
        detections = detect(frames)
        tracks = track(detections)
        coords = calibrate(tracks)
        events = classify_events(coords, session_id)
        aggregate(events, session_id)
        cleanup(session_id)
        update_status(session_id, "complete")
    except Exception as exc:
        update_status(session_id, "failed")
        raise self.retry(exc=exc)
```

## Event classifier contract (hard rule)
Every classifier in `pipeline/processors/events/` must be a class:
```python
class PassingClassifier:
    def detect(self, tracking_data: list[TrackFrame]) -> list[Event]:
        ...
```
- Input: full tracking timeline for the session
- Output: `list[Event]` (from `pipeline/models.py`)
- No side effects inside `detect()` — return events, don't write to DB
- Confidence below 0.5 → skip, don't emit event

## YOLOv8 usage
- Model: `yolov8n.pt` (nano) for speed; load once at worker startup, not per-frame
- Classes: `0` (person), `32` (sports ball)
- Filter: `confidence > settings.YOLO_CONFIDENCE` (default 0.5)

## ByteTrack / supervision
- Use `sv.ByteTracker` — preserves `tracker_id` across frames
- Separate ball track (`class_id == 32`) from player tracks before passing to classifiers

## Thresholds (always from config, never hardcoded)
- Sprint: `settings.SPRINT_THRESHOLD_MS` m/s (default 7.0), sustained 0.8s
- Pass min distance: `settings.PASS_MIN_DISTANCE_M` m (default 5.0)
- Shot min velocity: `settings.SHOT_MIN_VELOCITY_MS` m/s (default 12.0)
- Control radius: `settings.CONTROL_RADIUS_M` m (default 1.2)
- Dribble radius: `settings.DRIBBLE_RADIUS_M` m (default 1.5)
