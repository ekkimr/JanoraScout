from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://janorascout:changeme@postgres:5432/janorascout"
    REDIS_URL: str = "redis://redis:6379/0"
    MINIO_ROOT_USER: str = "minioadmin"
    MINIO_ROOT_PASSWORD: str = "changeme"
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_BUCKET: str = "janorascout-videos"
    YOLO_MODEL: str = "yolov8n.pt"
    YOLO_CONFIDENCE: float = 0.5
    SPRINT_THRESHOLD_MS: float = 7.0
    PASS_MIN_DISTANCE_M: float = 5.0
    SHOT_MIN_VELOCITY_MS: float = 12.0
    CONTROL_RADIUS_M: float = 1.2
    DRIBBLE_RADIUS_M: float = 1.5
    FRAME_RATE: int = 25

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
