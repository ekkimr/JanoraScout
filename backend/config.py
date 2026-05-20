from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    POSTGRES_USER: str = "janorascout"
    POSTGRES_PASSWORD: str = "changeme"
    POSTGRES_DB: str = "janorascout"
    DATABASE_URL: str = "postgresql+asyncpg://janorascout:changeme@postgres:5432/janorascout"
    REDIS_URL: str = "redis://redis:6379/0"
    MINIO_ROOT_USER: str = "minioadmin"
    MINIO_ROOT_PASSWORD: str = "changeme"
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_BUCKET: str = "janorascout-videos"
    JWT_SECRET: str = "changeme"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    YOLO_MODEL: str = "yolov8n.pt"
    YOLO_CONFIDENCE: float = 0.5
    SPRINT_THRESHOLD_MS: float = 7.0
    PASS_MIN_DISTANCE_M: float = 5.0
    SHOT_MIN_VELOCITY_MS: float = 12.0
    CONTROL_RADIUS_M: float = 1.2
    DRIBBLE_RADIUS_M: float = 1.5
    FRAME_RATE: int = 25
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:80"
    VITE_API_BASE_URL: str = "http://localhost:8000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
