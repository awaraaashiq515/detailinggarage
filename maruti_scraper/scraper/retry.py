"""
scraper/retry.py — Tenacity-powered retry decorator with exponential backoff.
"""
import asyncio
import random
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
    RetryCallState,
)
from utils.logger import get_logger

logger = get_logger(__name__)


class ScraperError(Exception):
    """Raised when the scraper fails to extract data."""


class RateLimitError(ScraperError):
    """Raised when the website signals rate limiting (HTTP 429 / CAPTCHA)."""


def scraper_retry(max_attempts: int = 3, base_wait: float = 2.0):
    """
    Retry decorator for scraper functions.
    
    Args:
        max_attempts: Maximum number of attempts before giving up.
        base_wait: Base delay in seconds for exponential backoff.
    
    Uses exponential backoff: 2s → 4s → 8s between retries.
    Rate limit errors are NOT retried (fail fast to avoid bans).
    """
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=base_wait, min=base_wait, max=30),
        retry=retry_if_exception_type(ScraperError)
        & ~retry_if_exception_type(RateLimitError),
        before_sleep=before_sleep_log(logger, "warning"),  # type: ignore[arg-type]
        reraise=True,
    )


async def respectful_delay(min_seconds: float = 1.5, max_seconds: float = 3.5) -> None:
    """
    Wait a random amount of time between requests.
    Adds human-like variability to avoid detection.
    
    Never go below 1 second — this is required to be respectful of the website.
    """
    delay = random.uniform(max(1.0, min_seconds), max_seconds)
    logger.debug("Respectful delay", delay_seconds=round(delay, 2))
    await asyncio.sleep(delay)
