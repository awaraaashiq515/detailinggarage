"""
main.py — FastAPI application entry point for the Maruti Suzuki Parts Scraper service.

Usage:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Authorization:
    This service is authorized by the website owner for internal business use.
    It only reads data and does not modify the source website.
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic_settings import BaseSettings

from api.routes import router
from db.database import create_tables
from scraper.maruti_scraper import close_browser
from utils.logger import configure_logging, get_logger

# ─── Settings ─────────────────────────────────────────────────────────────────

class AppSettings(BaseSettings):
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"


# Configure structured logging early
configure_logging()
logger = get_logger(__name__)


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown handler."""
    logger.info("Starting Maruti Parts Scraper API")

    # Create DB tables (idempotent)
    try:
        create_tables()
        logger.info("Database tables verified")
    except Exception as exc:
        logger.error("Failed to connect to database", error=str(exc))
        logger.warning("API will start but DB operations will fail until connection is fixed")

    yield  # App runs here

    # Cleanup
    logger.info("Shutting down — closing browser")
    await close_browser()
    logger.info("Shutdown complete")


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Maruti Suzuki Genuine Parts API",
    description=(
        "Authorized internal API to look up Maruti Suzuki genuine spare parts. "
        "Scrapes real-time data from marutisuzuki.com with caching and retry logic."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS — restrict to your own domain in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend domain e.g. ["https://yoursite.com"]
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────

app.include_router(router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "maruti-parts-scraper",
        "version": "1.0.0",
    }


@app.get("/", tags=["Info"])
async def root():
    """API info."""
    return {
        "name": "Maruti Suzuki Genuine Parts API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "single_lookup": "GET /parts/{part_number}",
            "bulk_lookup": "POST /parts/bulk",
            "history": "GET /parts/",
            "health": "GET /health",
        },
    }


# ─── Exception Handlers ───────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error("Unhandled exception", error=str(exc), path=str(request.url), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"},
    )


# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    settings = AppSettings()
    uvicorn.run(
        "main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=False,
        log_level="info",
        access_log=True,
    )
