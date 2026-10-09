import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// ── Runtime: MUST be Node.js for Playwright native binaries ──────────────────
export const runtime = "nodejs"
// Allow up to 120 seconds for browser launch + page load + scraping
export const maxDuration = 120

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PartData {
  partNumber: string
  sku?: string | null
  partName: string | null
  mrp: string | null
  availability: string | null
  imageUrl: string | null
  category: string | null
  status: "FOUND" | "NOT_FOUND" | "ERROR"
  fromCache: boolean
  scrapedAt: string
}

// ─── Structured Logger ────────────────────────────────────────────────────────

function log(
  level: "INFO" | "WARN" | "ERROR",
  message: string,
  meta?: Record<string, unknown>
) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "maruti-parts-scraper",
    message,
    ...meta,
  }
  if (level === "ERROR") console.error(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}

// ─── Exponential Backoff Retry ────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 2,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error = new Error("Unknown error")
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err as Error
      const delay = baseDelayMs * Math.pow(2, attempt - 1)
      log("WARN", `Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`, {
        error: lastError.message,
      })
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  throw lastError
}

// ─── Maruti Suzuki Parts Scraper ──────────────────────────────────────────────

async function scrapeMarutiPart(
  partNumber: string
): Promise<Omit<PartData, "fromCache" | "scrapedAt">> {
  log("INFO", "Starting Playwright browser for Maruti search", { partNumber })

  const playwright = await import("playwright")
  const { chromium } = playwright

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--disable-gpu",
      "--disable-extensions",
    ],
  })

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 768 },
    extraHTTPHeaders: {
      "Accept-Language": "en-IN,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    },
    ignoreHTTPSErrors: true,
  })

  const page = await context.newPage()

  // Block font/media assets to save bandwidth
  await page.route("**/*.{woff,woff2,ttf,eot,otf}", (route) => route.abort())
  await page.route(
    "**/{hotjar,clarity,gtag,googletagmanager,doubleclick,facebook,twitter}**",
    (route) => route.abort()
  )

  let capturedData: Omit<PartData, "fromCache" | "scrapedAt"> | null = null

  // ── Intercept Magento GraphQL API responses ────────────────────────────────
  page.on("response", async (res) => {
    if (res.url().includes("graphql") && res.url().includes("productSearch")) {
      try {
        const json = await res.json()
        const items = json?.data?.productSearch?.items
        if (items && items.length > 0) {
          const item = items[0]
          const pv = item.productView || {}

          // Extract Price
          let priceVal =
            pv.price?.final?.amount?.value ||
            pv.priceRange?.minimum?.final?.amount?.value

          if (!priceVal && Array.isArray(pv.attributes)) {
            const unitPriceAttr = pv.attributes.find((a: any) => a.name === "unit_price")
            if (unitPriceAttr && unitPriceAttr.value) {
              priceVal = parseFloat(unitPriceAttr.value)
            }
          }

          const formattedPrice = priceVal
            ? `₹ ${Number(priceVal).toLocaleString("en-IN")}`
            : null

          // Extract Image
          let imgUrl = null
          if (Array.isArray(pv.images) && pv.images.length > 0) {
            imgUrl = pv.images[0].url
          }

          // Extract Category
          let category = null
          if (Array.isArray(pv.attributes)) {
            const catAttr = pv.attributes.find(
              (a: any) => a.name === "include_in_menu_category"
            )
            if (catAttr && Array.isArray(catAttr.value)) {
              category = catAttr.value.join(" > ")
            }
          }

          capturedData = {
            partNumber,
            sku: pv.sku || partNumber,
            partName: pv.name || null,
            mrp: formattedPrice,
            availability: pv.inStock !== false ? "In Stock" : "Out of Stock",
            imageUrl: imgUrl,
            category: category,
            status: "FOUND",
          }
          log("INFO", "Captured product data from Maruti GraphQL API", {
            partNumber,
            sku: pv.sku,
            name: pv.name,
            mrp: formattedPrice,
          })
        }
      } catch (e) {
        log("WARN", "Error parsing GraphQL response JSON", { error: (e as Error).message })
      }
    }
  })

  try {
    const searchUrl = `https://www.marutisuzuki.com/genuine-parts/search?q=${encodeURIComponent(partNumber)}`
    log("INFO", "Navigating to Maruti genuine parts search page", { searchUrl })

    await page.goto(searchUrl, { waitUntil: "networkidle", timeout: 35000 }).catch(() => {})
    await page.waitForTimeout(2000)

    if (capturedData) {
      return capturedData
    }

    // ── Fallback: Extract from rendered DOM if GraphQL interception didn't trigger ──────────
    log("INFO", "GraphQL interception did not trigger; attempting DOM extraction", { partNumber })

    const domData = await page.evaluate(({ pn }: { pn: string }) => {
      const pageText = document.body?.innerText || ""

      if (pageText.includes("0 items") || pageText.includes("No products found")) {
        return { found: false }
      }

      const cards = Array.from(
        document.querySelectorAll('[class*="product"], [class*="item"], [class*="card"]')
      )

      for (const card of cards) {
        const text = card.textContent || ""
        if (text.includes("MRP") || text.includes("₹") || text.includes(pn)) {
          const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
          
          let partName = null
          let mrp = null
          let sku = pn

          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("MRP:") || lines[i].includes("₹")) {
              mrp = lines[i]
            } else if (/^[A-Z0-9]{8,15}$/.test(lines[i])) {
              sku = lines[i]
            } else if (!partName && lines[i].length > 4 && !lines[i].includes("Sort") && !lines[i].includes("Filter")) {
              partName = lines[i]
            }
          }

          let imgUrl = null
          const img = card.querySelector("img")
          if (img) {
            imgUrl = img.getAttribute("src") || img.getAttribute("data-src") || null
          }

          if (partName || mrp) {
            return {
              found: true,
              sku,
              partName,
              mrp,
              availability: "In Stock",
              imageUrl: imgUrl,
            }
          }
        }
      }

      return { found: false }
    }, { pn: partNumber })

    if (domData.found) {
      return {
        partNumber,
        sku: domData.sku || partNumber,
        partName: domData.partName || null,
        mrp: domData.mrp || null,
        availability: domData.availability || "In Stock",
        imageUrl: domData.imageUrl || null,
        category: null,
        status: "FOUND",
      }
    }

    return {
      partNumber,
      sku: null,
      partName: null,
      mrp: null,
      availability: null,
      imageUrl: null,
      category: null,
      status: "NOT_FOUND",
    }
  } finally {
    try {
      await context.close()
    } catch {}
    try {
      await browser.close()
    } catch {}
  }
}

// ─── POST /api/admin/parts-lookup ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    let body: { partNumber?: string; forceRefresh?: boolean }

    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
    }

    const rawPartNumber = (body.partNumber || "").trim().toUpperCase().replace(/\s+/g, "")
    const forceRefresh = body.forceRefresh === true

    if (!rawPartNumber) {
      return NextResponse.json(
        { success: false, error: "partNumber is required" },
        { status: 400 }
      )
    }

    if (!/^[A-Z0-9\-_]{2,50}$/.test(rawPartNumber)) {
      return NextResponse.json(
        { success: false, error: "Invalid part number format (alphanumeric, 2-50 chars)" },
        { status: 400 }
      )
    }

    log("INFO", "Parts lookup request received", { partNumber: rawPartNumber, forceRefresh })

    // ── Cache Check (ONLY use cache if status === "FOUND") ─────────────────────
    if (!forceRefresh) {
      try {
        const cached = await db.marutiPart.findUnique({
          where: { partNumber: rawPartNumber },
        })

        // CRITICAL FIX: Only serve from cache if status is "FOUND"!
        // Do NOT serve stale NOT_FOUND or ERROR entries from cache.
        if (cached && cached.status === "FOUND") {
          const cacheAgeMs = Date.now() - cached.scrapedAt.getTime()
          const CACHE_TTL_MS = 24 * 60 * 60 * 1000

          if (cacheAgeMs < CACHE_TTL_MS) {
            log("INFO", "Cache HIT (FOUND)", {
              partNumber: rawPartNumber,
              ageHours: (cacheAgeMs / 3600000).toFixed(1),
            })
            const result: PartData = {
              partNumber: cached.partNumber,
              sku: cached.rawHtml ? JSON.parse(cached.rawHtml).sku : cached.partNumber,
              partName: cached.partName,
              mrp: cached.mrp,
              availability: cached.availability,
              imageUrl: cached.imageUrl,
              category: cached.category,
              status: "FOUND",
              fromCache: true,
              scrapedAt: cached.scrapedAt.toISOString(),
            }
            return NextResponse.json({ success: true, data: result })
          }
          log("INFO", "Cache STALE, re-scraping", { partNumber: rawPartNumber })
        }
      } catch (dbErr) {
        log("WARN", "DB cache check failed, proceeding with live scrape", {
          error: (dbErr as Error).message,
        })
      }
    }

    // ── Live Scrape ────────────────────────────────────────────────────────
    const scraped = await withRetry(() => scrapeMarutiPart(rawPartNumber), 2, 1000)

    // ── Save to DB only if status === "FOUND" ───────────────────────────────
    if (scraped.status === "FOUND") {
      try {
        await db.marutiPart.upsert({
          where: { partNumber: rawPartNumber },
          create: {
            partNumber: rawPartNumber,
            partName: scraped.partName,
            mrp: scraped.mrp,
            availability: scraped.availability,
            imageUrl: scraped.imageUrl,
            category: scraped.category,
            status: "FOUND",
            rawHtml: JSON.stringify({ sku: scraped.sku }),
            scrapedAt: new Date(),
          },
          update: {
            partName: scraped.partName,
            mrp: scraped.mrp,
            availability: scraped.availability,
            imageUrl: scraped.imageUrl,
            category: scraped.category,
            status: "FOUND",
            rawHtml: JSON.stringify({ sku: scraped.sku }),
            scrapedAt: new Date(),
          },
        })
      } catch (dbErr) {
        log("WARN", "DB upsert failed, returning scraped result directly", {
          error: (dbErr as Error).message,
        })
      }
    } else {
      // Delete any bad cache entry if scraping returned NOT_FOUND
      await db.marutiPart.delete({ where: { partNumber: rawPartNumber } }).catch(() => {})
    }

    const result: PartData = {
      partNumber: rawPartNumber,
      sku: scraped.sku || rawPartNumber,
      partName: scraped.partName,
      mrp: scraped.mrp,
      availability: scraped.availability,
      imageUrl: scraped.imageUrl,
      category: scraped.category,
      status: scraped.status as PartData["status"],
      fromCache: false,
      scrapedAt: new Date().toISOString(),
    }

    log("INFO", "Scrape complete", { partNumber: rawPartNumber, status: scraped.status })
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    const error = err as Error
    log("ERROR", "Unhandled error in POST handler", { error: error.message })

    return NextResponse.json(
      {
        success: false,
        error: `Scraping error: ${error.message}`,
      },
      { status: 500 }
    )
  }
}

// ─── GET /api/admin/parts-lookup — Lookup History ────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 500)
    const search = searchParams.get("search")?.toUpperCase()

    const parts = await db.marutiPart.findMany({
      where: {
        status: "FOUND",
        ...(search ? { partNumber: { contains: search } } : {}),
      },
      orderBy: { scrapedAt: "desc" },
      take: limit,
      select: {
        id: true,
        partNumber: true,
        partName: true,
        mrp: true,
        availability: true,
        imageUrl: true,
        category: true,
        status: true,
        rawHtml: true,
        scrapedAt: true,
        updatedAt: true,
      },
    })

    const formattedParts = parts.map((p) => ({
      ...p,
      sku: p.rawHtml ? JSON.parse(p.rawHtml).sku : p.partNumber,
    }))

    return NextResponse.json({ success: true, data: formattedParts, total: formattedParts.length })
  } catch (err) {
    const error = err as Error
    log("ERROR", "Failed to fetch parts history", { error: error.message })
    return NextResponse.json(
      { success: false, error: "Failed to fetch history" },
      { status: 500 }
    )
  }
}
