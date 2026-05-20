from celery import Celery
from config import settings

app = Celery(
    "janorascout",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)

import tasks  # noqa: F401, E402 — registers tasks with Celery
