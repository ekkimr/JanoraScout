import logging
from worker import app

logger = logging.getLogger(__name__)


@app.task(bind=True, max_retries=2, name="pipeline.process_session")
def process_session(self, session_id: int) -> dict:
    """Stub — replaced in Phase 5 with the full AI pipeline."""
    logger.info("Processing session %d (stub)", session_id)
    return {"session_id": session_id, "status": "complete"}
