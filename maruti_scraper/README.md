# Maruti Suzuki Genuine Parts Scraper

An **authorized** internal business tool to look up Maruti Suzuki genuine spare parts data.

> **Authorization Notice**: This tool is built for authorized internal use only.
> It reads data only and does NOT modify the source website.
> It does NOT bypass authentication, CAPTCHAs, or security mechanisms.

---

## Project Structure

```
maruti_scraper/
├── main.py                     # FastAPI app entry point
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
├── scraper/
│   ├── maruti_scraper.py       # Core Playwright scraper logic
│   └── retry.py                # Retry + rate-limit handling
├── api/
│   └── routes.py               # FastAPI route handlers
├── db/
│   ├── models.py               # SQLAlchemy MySQL models
│   └── database.py             # DB connection + session management
└── utils/
    └── logger.py               # Structured JSON logging
```

---

## Features

| Feature | Details |
|---|---|
| **Search by Part Number** | Single or batch (up to 1000 parts) |
| **Extracted Fields** | Part Number, Part Name, MRP, Availability, Image URL, Category |
| **Smart Caching** | 24-hour DB cache — avoids re-scraping unchanged data |
| **Retry Logic** | 3 attempts with exponential backoff (2s → 4s → 8s) |
| **Rate Limit Handling** | Respectful 2-3s delay between requests; HTTP 429 detection |
| **MySQL Storage** | All results stored in MySQL via SQLAlchemy |
| **REST API** | FastAPI with Swagger docs at `/docs` |
| **Structured Logging** | JSON logs via structlog |
| **Bearer Token Auth** | Simple API key protection |

---

## Installation

### 1. Prerequisites

- Python 3.11+
- MySQL server running
- pip

### 2. Set up virtual environment

```bash
cd maruti_scraper

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Install Playwright browser

```bash
playwright install chromium
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env and set your MySQL credentials and API secret key
```

Example `.env`:
```env
DATABASE_URL=mysql+pymysql://root:mypassword@localhost:3306/maruti_parts
API_SECRET_KEY=my_very_secret_key_here
SCRAPE_DELAY_SECONDS=2.0
CACHE_TTL_HOURS=24
```

### 5. Create MySQL database

```sql
CREATE DATABASE maruti_parts CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Tables are created automatically when the app starts.

### 6. Run the API server

```bash
# Development (with auto-reload)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
```

Open Swagger UI: http://localhost:8000/docs

---

## API Reference

All endpoints require the header:
```
Authorization: Bearer your_api_secret_key
```

### GET /parts/{part_number}

Look up a single part.

```bash
curl -X GET "http://localhost:8000/parts/55121M74K00" \
  -H "Authorization: Bearer your_key"
```

Response:
```json
{
  "success": true,
  "data": {
    "part_number": "55121M74K00",
    "part_name": "Front Bumper Assembly",
    "mrp": "₹8,500.00",
    "availability": "In Stock",
    "image_url": "https://www.marutisuzuki.com/...",
    "category": "Body Parts > Bumpers",
    "status": "FOUND",
    "from_cache": false,
    "scraped_at": "2026-07-22T07:00:00Z"
  }
}
```

### POST /parts/bulk

Look up multiple parts at once.

```bash
curl -X POST "http://localhost:8000/parts/bulk" \
  -H "Authorization: Bearer your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "part_numbers": ["55121M74K00", "37110M55NN0", "84710M55NA0"],
    "force_refresh": false
  }'
```

### GET /parts/

Fetch lookup history from database.

```bash
curl "http://localhost:8000/parts/?limit=50&status=FOUND" \
  -H "Authorization: Bearer your_key"
```

### GET /health

Health check (no auth required).

---

## How It Works

```
Request → Cache Check (DB) → [HIT] → Return cached data
                           → [MISS] → Launch Playwright Browser
                                   → Navigate to marutisuzuki.com/genuine-parts?search=PARTNO
                                   → Wait for JS to render
                                   → Extract: Name, MRP, Availability, Image, Category
                                   → Save to MySQL
                                   → Return data
```

### Retry Flow

```
Attempt 1 → Fails → Wait 2s
Attempt 2 → Fails → Wait 4s
Attempt 3 → Fails → Return ERROR status
```

---

## Scalability

For **thousands of part lookups**:

1. **Cache First**: 24-hour cache means each part is scraped at most once per day
2. **Batch Endpoint**: Use `/parts/bulk` with lists of 1000 parts
3. **Concurrent Scraping**: `scrape_parts_batch()` runs 3 concurrent browser tabs by default
4. **Queue Integration**: For very large batches (10,000+), integrate with Celery + Redis:

```python
# Example: Celery task
@celery_app.task
def scrape_part_task(part_number: str):
    import asyncio
    result = asyncio.run(scrape_part(part_number))
    # save to DB...
```

---

## Notes

- Scraping speed: ~3-5 seconds per part (includes page load + JS render + delay)
- For 1000 parts: ~50-90 minutes single-threaded; ~20-30 minutes with 3 concurrent tabs
- The respectful 2s delay between requests is intentional and required
- Do not reduce the delay below 1 second
