"""
db/database.py — Async SQLAlchemy engine + session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from typing import Generator
from pydantic_settings import BaseSettings
from db.models import Base


class Settings(BaseSettings):
    database_url: str = "mysql+pymysql://root:password@localhost:3306/maruti_parts"

    class Config:
        env_file = ".env"
        extra = "ignore"


_settings = Settings()

# Create engine with connection pooling
engine = create_engine(
    _settings.database_url,
    pool_pre_ping=True,           # Detect stale connections
    pool_size=10,                  # Max persistent connections
    max_overflow=20,               # Extra connections when pool exhausted
    pool_recycle=3600,             # Recycle connections every hour
    echo=False,                    # Set True to log all SQL (debug only)
    connect_args={
        "connect_timeout": 10,
    },
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def create_tables() -> None:
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)


@contextmanager
def get_db() -> Generator[Session, None, None]:
    """Context manager for database sessions with automatic cleanup."""
    db: Session = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
