"""
Inventory & Order Management System - FastAPI Backend
Entry point for the application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.database import engine, Base
from app.routers import products, customers, orders


# ---------------------------------------------------------------------------
# Lifespan: create all tables on startup (dev convenience).
# In production, use Alembic migrations instead.
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist yet
    Base.metadata.create_all(bind=engine)
    yield


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Inventory & Order Management API",
    description="REST API for managing products, customers, and orders.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS – allow the React dev server (and any configured origin)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Tighten in production: ["https://your-frontend.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(orders.router,   prefix="/api/orders",   tags=["Orders"])


@app.get("/", tags=["Health"])
def root():
    """Health-check endpoint."""
    return {"status": "ok", "message": "Inventory API is running 🚀"}
