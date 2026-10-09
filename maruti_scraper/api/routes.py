"""
api/routes.py — FastAPI route handlers for the Maruti parts lookup service.
"""
import re
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header, Query
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from sqlalchemy.orm import Session

from scraper.maruti_scraper import scrape_part, scrape_parts_batch
from scraper.retry import ScraperError, RateLimitError
from db.models import MarutiPart
from db.database import get_db
from utils.logger import get_logger

logger = get_logger(__name__)


# ─── Config ───────────────────────────────────────────────────────────────────

class RouteSettings(BaseSettings):
    api_secret_key: str = "change_this"
    cache_ttl_hours: int = 24

    class Config:
        env_file = ".env"
        extra = "ignore"


_settings = RouteSettings()
router = APIRouter(prefix="/parts", tags=["Parts Lookup"])

PART_NUMBER_RE = re.compile(r"^[A-Z0-9\-_]{2,60}$")


# ─── Schemas ──────────────────────────────────────────────────────────────────

class PartLookupRequest(BaseModel):
    """Request body for single part lookup."""
    part_number: str = Field(..., min_length=2, max_length=60, example="55121M74K00")
    force_refresh: bool = Field(False, description="Bypass cache and re-scrape")


class BulkLookupRequest(BaseModel):
    """Request body for batch part lookup."""
    part_numbers: list[str] = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="List of part numbers (max 1000 per request)",
    )
    force_refresh: bool = Field(False)


class PartResponse(BaseModel):
    """Response schema for a single part."""
    part_number: str
    part_name: Optional[str]
    mrp: Optional[str]
    availability: Optional[str]
    image_url: Optional[str]
    category: Optional[str]
    status: str
    from_cache: bool
    scraped_at: Optional[str]


class APIResponse(BaseModel):
    success: bool
    data: Optional[PartResponse] = None
    error: Optional[str] = None


class BulkAPIResponse(BaseModel):
    success: bool
    data: list[PartResponse] = []
    total: int = 0
    found: int = 0
    not_found: int = 0
    errors: int = 0


# ─── Auth ─────────────────────────────────────────────────────────────────────

def verify_api_key(authorization: str = Header(default="")) -> None:
    """Simple bearer token auth."""
    expected = f"Bearer {_settings.api_secret_key}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Unauthorized — invalid API key")


def normalize_part_number(pn: str) -> str:
    """Normalize a part number to uppercase, no spaces."""
    return pn.strip().upper().replace(" ", "")


def validate_part_number(pn: str) -> str:
    """Validate and normalize part number, raise 400 if invalid."""
    normalized = normalize_part_number(pn)
    if not PART_NUMBER_RE.match(normalized):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid part number '{pn}' — use alphanumeric characters only (2-60 chars)",
        )
    return normalized


# ─── Cache Logic ──────────────────────────────────────────────────────────────

def get_cached_part(db: Session, part_number: str, cache_ttl_hours: int) -> Optional[MarutiPart]:
    """Return cached part if it's within TTL, else None."""
    part = db.query(MarutiPart).filter(MarutiPart.part_number == part_number).first()
    if part is None:
        return None
    age = datetime.utcnow() - part.scraped_at
    if age < timedelta(hours=cache_ttl_hours):
        return part
    return None


def upsert_part(db: Session, part_number: str, result) -> MarutiPart:
    """Insert or update a scraped part in the database."""
    existing = db.query(MarutiPart).filter(MarutiPart.part_number == part_number).first()

    if existing:
        existing.part_name = result.part_name
        existing.mrp = result.mrp
        existing.availability = result.availability
        existing.image_url = result.image_url
        existing.category = result.category
        existing.status = result.status
        existing.scraped_at = datetime.utcnow()
        db.flush()
        return existing
    else:
        part = MarutiPart(
            part_number=part_number,
            part_name=result.part_name,
            mrp=result.mrp,
            availability=result.availability,
            image_url=result.image_url,
            category=result.category,
            status=result.status,
            scraped_at=datetime.utcnow(),
        )
        db.add(part)
        db.flush()
        return part


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get(
    "/{part_number}",
    response_model=APIResponse,
    summary="Look up a single Maruti genuine part by part number",
)
async def lookup_part(
    part_number: str,
    force_refresh: bool = Query(False, description="Bypass cache"),
    _auth: None = Depends(verify_api_key),
):
    """
    GET /parts/{part_number}
    
    Returns part details: name, MRP, availability, image URL.
    Results are cached for 24 hours (configurable).
    """
    pn = validate_part_number(part_number)
    logger.info("Part lookup request", part_number=pn, force_refresh=force_refresh)

    with get_db() as db:
        # Check cache
        if not force_refresh:
            cached = get_cached_part(db, pn, _settings.cache_ttl_hours)
            if cached:
                logger.info("Cache HIT", part_number=pn)
                return APIResponse(
                    success=True,
                    data=PartResponse(
                        part_number=cached.part_number,
                        part_name=cached.part_name,
                        mrp=cached.mrp,
                        availability=cached.availability,
                        image_url=cached.image_url,
                        category=cached.category,
                        status=cached.status,
                        from_cache=True,
                        scraped_at=cached.scraped_at.isoformat() if cached.scraped_at else None,
                    ),
                )

        # Scrape
        try:
            result = await scrape_part(pn)
        except RateLimitError:
            raise HTTPException(
                status_code=429,
                detail="Rate limited by source website. Please retry in 60 seconds.",
            )
        except ScraperError as exc:
            logger.error("Scrape failed", part_number=pn, error=str(exc))
            # Save error state
            with get_db() as db2:
                from db.models import MarutiPart as MP
                err_part = db2.query(MP).filter(MP.part_number == pn).first()
                if err_part:
                    err_part.status = "ERROR"
                    err_part.scraped_at = datetime.utcnow()
                else:
                    db2.add(MP(part_number=pn, status="ERROR", scraped_at=datetime.utcnow()))
            raise HTTPException(status_code=502, detail=f"Scraping failed: {exc}")

        # Save to DB
        with get_db() as db3:
            saved = upsert_part(db3, pn, result)
            return APIResponse(
                success=True,
                data=PartResponse(
                    part_number=saved.part_number,
                    part_name=saved.part_name,
                    mrp=saved.mrp,
                    availability=saved.availability,
                    image_url=saved.image_url,
                    category=saved.category,
                    status=saved.status,
                    from_cache=False,
                    scraped_at=saved.scraped_at.isoformat() if saved.scraped_at else None,
                ),
            )


@router.post(
    "/bulk",
    response_model=BulkAPIResponse,
    summary="Batch lookup multiple Maruti parts",
)
async def bulk_lookup(
    request: BulkLookupRequest,
    _auth: None = Depends(verify_api_key),
):
    """
    POST /parts/bulk
    
    Accepts up to 1000 part numbers per request.
    Returns results for all parts with found/not_found/error counts.
    Concurrent scraping with max 3 simultaneous browser tabs.
    """
    if len(request.part_numbers) > 1000:
        raise HTTPException(status_code=400, detail="Maximum 1000 part numbers per request")

    # Normalize and deduplicate
    seen = set()
    normalized = []
    for pn in request.part_numbers:
        n = normalize_part_number(pn)
        if PART_NUMBER_RE.match(n) and n not in seen:
            seen.add(n)
            normalized.append(n)

    logger.info("Bulk lookup request", count=len(normalized))

    results = []
    to_scrape = []

    # Check cache first
    with get_db() as db:
        for pn in normalized:
            if not request.force_refresh:
                cached = get_cached_part(db, pn, _settings.cache_ttl_hours)
                if cached:
                    results.append(
                        PartResponse(
                            part_number=cached.part_number,
                            part_name=cached.part_name,
                            mrp=cached.mrp,
                            availability=cached.availability,
                            image_url=cached.image_url,
                            category=cached.category,
                            status=cached.status,
                            from_cache=True,
                            scraped_at=cached.scraped_at.isoformat() if cached.scraped_at else None,
                        )
                    )
                    continue
            to_scrape.append(pn)

    # Scrape uncached parts
    if to_scrape:
        scraped_results = await scrape_parts_batch(to_scrape, max_concurrent=3)
        with get_db() as db:
            for scraped in scraped_results:
                saved = upsert_part(db, scraped.part_number, scraped)
                results.append(
                    PartResponse(
                        part_number=saved.part_number,
                        part_name=saved.part_name,
                        mrp=saved.mrp,
                        availability=saved.availability,
                        image_url=saved.image_url,
                        category=saved.category,
                        status=saved.status,
                        from_cache=False,
                        scraped_at=saved.scraped_at.isoformat() if saved.scraped_at else None,
                    )
                )

    found = sum(1 for r in results if r.status == "FOUND")
    not_found = sum(1 for r in results if r.status == "NOT_FOUND")
    errors = sum(1 for r in results if r.status == "ERROR")

    return BulkAPIResponse(
        success=True,
        data=results,
        total=len(results),
        found=found,
        not_found=not_found,
        errors=errors,
    )


@router.get(
    "/",
    summary="Get lookup history from database",
)
async def get_history(
    limit: int = Query(50, ge=1, le=500),
    status: Optional[str] = Query(None, description="Filter: FOUND | NOT_FOUND | ERROR"),
    search: Optional[str] = Query(None, description="Search by part number"),
    _auth: None = Depends(verify_api_key),
):
    """GET /parts/ — Returns recent part lookup history."""
    with get_db() as db:
        query = db.query(MarutiPart)
        if status:
            query = query.filter(MarutiPart.status == status.upper())
        if search:
            query = query.filter(
                MarutiPart.part_number.like(f"%{search.upper()}%")
            )
        parts = query.order_by(MarutiPart.scraped_at.desc()).limit(limit).all()
        return {
            "success": True,
            "data": [p.to_dict() for p in parts],
            "total": len(parts),
        }
