"""
scraper/maruti_scraper.py — Core Playwright scraper for Maruti Suzuki genuine parts.

Authorization Note:
    This scraper is authorized by the website owner for internal business use.
    It reads data only and does NOT modify the source website.
    It respects rate limits and does NOT bypass authentication or CAPTCHAs.
"""
import asyncio
import json
import re
from dataclasses import dataclass, field
from typing import Optional
from playwright.async_api import async_playwright, Page, BrowserContext
from pydantic_settings import BaseSettings

from scraper.retry import scraper_retry, respectful_delay, ScraperError, RateLimitError
from utils.logger import get_logger

logger = get_logger(__name__)


# ─── Config ───────────────────────────────────────────────────────────────────

class ScraperSettings(BaseSettings):
    playwright_browser: str = "chromium"
    scrape_delay_seconds: float = 2.0

    class Config:
        env_file = ".env"
        extra = "ignore"


_settings = ScraperSettings()


# ─── Data Model ───────────────────────────────────────────────────────────────

@dataclass
class PartResult:
    """Result of a single part scrape operation."""
    part_number: str
    sku: Optional[str] = None
    part_name: Optional[str] = None
    mrp: Optional[str] = None
    availability: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    status: str = "FOUND"           # FOUND | NOT_FOUND | ERROR
    raw_data: Optional[dict] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "partNumber": self.part_number,
            "sku": self.sku or self.part_number,
            "partName": self.part_name,
            "mrp": self.mrp,
            "availability": self.availability,
            "imageUrl": self.image_url,
            "category": self.category,
            "status": self.status,
        }


# ─── Browser Manager ──────────────────────────────────────────────────────────

class MarutiBrowserManager:
    """Manages a shared Playwright browser instance for efficiency."""

    def __init__(self):
        self._playwright = None
        self._browser = None
        self._lock = asyncio.Lock()

    async def get_context(self) -> BrowserContext:
        """Get a fresh browser context (tab) for each scrape."""
        async with self._lock:
            if self._browser is None or not self._browser.is_connected():
                await self._start_browser()

        context = await self._browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1366, "height": 768},
            extra_http_headers={
                "Accept-Language": "en-IN,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            },
            java_script_enabled=True,
            ignore_https_errors=True,
        )

        await context.route(
            "**/*.{woff,woff2,ttf,eot,otf}",
            lambda route: route.abort(),
        )
        await context.route(
            "**/{hotjar,clarity,googletagmanager,facebook,twitter,doubleclick}**",
            lambda route: route.abort(),
        )

        return context

    async def _start_browser(self):
        """Launch the browser."""
        if self._playwright is None:
            self._playwright = await async_playwright().start()

        browser_type = getattr(self._playwright, _settings.playwright_browser)
        self._browser = await browser_type.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
                "--disable-gpu",
                "--disable-extensions",
            ],
        )
        logger.info(
            "Browser launched",
            browser=_settings.playwright_browser,
        )

    async def close(self):
        """Gracefully close the browser."""
        if self._browser:
            await self._browser.close()
            self._browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None


_browser_manager = MarutiBrowserManager()


# ─── Main Scraper Function ────────────────────────────────────────────────────

@scraper_retry(max_attempts=3, base_wait=2.0)
async def scrape_part(part_number: str) -> PartResult:
    """
    Scrape a single Maruti Suzuki genuine part by part number using Playwright + GraphQL Interception.
    """
    logger.info("Starting part scrape", part_number=part_number)

    context = await _browser_manager.get_context()
    page = await context.new_page()

    captured_result: Optional[PartResult] = None

    async def handle_response(response):
        nonlocal captured_result
        if "graphql" in response.url and "productSearch" in response.url:
            try:
                json_data = await response.json()
                items = json_data.get("data", {}).get("productSearch", {}).get("items", [])
                if items:
                    item = items[0]
                    pv = item.get("productView", {})

                    price_val = (
                        pv.get("price", {}).get("final", {}).get("amount", {}).get("value")
                        or pv.get("priceRange", {}).get("minimum", {}).get("final", {}).get("amount", {}).get("value")
                    )

                    if not price_val and "attributes" in pv:
                        for attr in pv["attributes"]:
                            if attr.get("name") == "unit_price":
                                price_val = float(attr.get("value"))
                                break

                    formatted_price = f"₹ {price_val:,.0f}" if price_val else None

                    img_url = None
                    if pv.get("images"):
                        img_url = pv["images"][0].get("url")

                    category = None
                    if pv.get("attributes"):
                        for attr in pv["attributes"]:
                            if attr.get("name") == "include_in_menu_category":
                                vals = attr.get("value")
                                if isinstance(vals, list):
                                    category = " > ".join(vals)

                    captured_result = PartResult(
                        part_number=part_number,
                        sku=pv.get("sku", part_number),
                        part_name=pv.get("name"),
                        mrp=formatted_price,
                        availability="In Stock" if pv.get("inStock") else "Out of Stock",
                        image_url=img_url,
                        category=category,
                        status="FOUND",
                        raw_data=pv,
                    )
            except Exception as exc:
                logger.warning("Error parsing GraphQL response", error=str(exc))

    page.on("response", handle_response)

    try:
        search_url = f"https://www.marutisuzuki.com/genuine-parts/search?q={part_number}"
        logger.debug("Navigating to search URL", url=search_url)

        try:
            await page.goto(search_url, wait_until="networkidle", timeout=35_000)
        except Exception:
            pass

        await asyncio.sleep(2.0)

        if captured_result:
            return captured_result

        # Check DOM if GraphQL missed
        page_text = await page.inner_text("body")
        if "0 items" in page_text or "No products found" in page_text:
            return PartResult(part_number=part_number, status="NOT_FOUND")

        return PartResult(part_number=part_number, status="NOT_FOUND")

    except Exception as exc:
        logger.error("Scraper error", part_number=part_number, error=str(exc))
        raise ScraperError(f"Scraper error: {exc}") from exc
    finally:
        await page.close()
        await context.close()
        await respectful_delay(
            min_seconds=_settings.scrape_delay_seconds,
            max_seconds=_settings.scrape_delay_seconds + 1.5,
        )


async def scrape_parts_batch(
    part_numbers: list[str],
    max_concurrent: int = 3,
) -> list[PartResult]:
    semaphore = asyncio.Semaphore(max_concurrent)

    async def bounded_scrape(pn: str) -> PartResult:
        async with semaphore:
            try:
                return await scrape_part(pn)
            except Exception as exc:
                logger.error("Batch scrape failed", part_number=pn, error=str(exc))
                return PartResult(part_number=pn, status="ERROR")

    results = await asyncio.gather(*[bounded_scrape(pn) for pn in part_numbers])
    return list(results)


async def close_browser():
    await _browser_manager.close()
