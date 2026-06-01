"""
Database configuration.

Uses SQLAlchemy's synchronous engine connected to PostgreSQL.
DATABASE_URL is read from the environment (see .env).
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Read the connection URL from environment
# ---------------------------------------------------------------------------
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/inventory_db",
)

# ---------------------------------------------------------------------------
# Engine + session factory
# ---------------------------------------------------------------------------
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,       # reconnect silently on stale connections
    echo=False,               # set True to log SQL – useful while debugging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------------------------------------------------------------------------
# Base class for all ORM models
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# FastAPI dependency – yields a DB session and guarantees cleanup
# ---------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
