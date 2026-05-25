/**
 * rate-limit.ts
 * In-memory rate limiter for Next.js API routes.
 * 
 * For production, replace with Upstash Redis:
 * https://upstash.com/docs/redis/quickstarts/nextjs
 * 
 * Usage in any API route:
 *   const ip = request.headers.get("x-forwarded-for") ?? "unknown"
 *   const { success, remaining } = rateLimit(ip, { limit: 10, window: 60 })
 *   if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
 */

interface RateLimitConfig {
    /** Max requests allowed in the window */
    limit: number
    /** Time window in seconds */
    window: number
}

interface RateLimitResult {
    /** Whether the request is allowed */
    success: boolean
    /** Remaining requests in current window */
    remaining: number
    /** Seconds until the window resets */
    reset: number
}

// In-memory store: Map<identifier, { count: number; expiresAt: number }>
const store = new Map<string, { count: number; expiresAt: number }>()

/**
 * Apply rate limiting based on a unique identifier (usually IP address).
 */
export function rateLimit(
    identifier: string,
    config: RateLimitConfig = { limit: 10, window: 60 }
): RateLimitResult {
    const now = Date.now()
    const windowMs = config.window * 1000

    const record = store.get(identifier)

    // If no record or window has expired — start fresh
    if (!record || now > record.expiresAt) {
        store.set(identifier, { count: 1, expiresAt: now + windowMs })
        return {
            success: true,
            remaining: config.limit - 1,
            reset: config.window,
        }
    }

    // Window active — check count
    if (record.count >= config.limit) {
        return {
            success: false,
            remaining: 0,
            reset: Math.ceil((record.expiresAt - now) / 1000),
        }
    }

    // Increment count
    record.count += 1
    return {
        success: true,
        remaining: config.limit - record.count,
        reset: Math.ceil((record.expiresAt - now) / 1000),
    }
}

/**
 * Pre-configured rate limiters for common use cases.
 */

/** Auth endpoints: 50 attempts per minute (relaxed for local dev) */
export function authRateLimit(ip: string) {
    return rateLimit(ip, { limit: 50, window: 60 })
}

/** Payment endpoints: 3 attempts per minute */
export function paymentRateLimit(ip: string) {
    return rateLimit(ip, { limit: 3, window: 60 })
}

/** General API endpoints: 60 requests per minute */
export function apiRateLimit(ip: string) {
    return rateLimit(ip, { limit: 60, window: 60 })
}
