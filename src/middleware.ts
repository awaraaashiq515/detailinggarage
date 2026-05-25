import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// SECURITY: JWT_SECRET must be set in .env — no fallback allowed in production
if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("FATAL: JWT_SECRET environment variable is not set. App cannot start.")
}

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "car-service-project-2026-secret-key"
)

// Routes that require authentication
const protectedRoutes = ["/admin"]

// Routes that require ADMIN role
const adminRoutes = ["/admin"]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check which route type this is
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    if (!isProtectedRoute) {
        return NextResponse.next()
    }

    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
        // Redirect to login if no token
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    try {
        // Verify token
        const { payload } = await jwtVerify(token, JWT_SECRET)

        // Check admin role for admin routes
        if (isAdminRoute && payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/unauthorized", request.url))
        }

        // Add user info to request headers for use in server components
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set("x-user-id", payload.userId as string)
        requestHeaders.set("x-user-role", payload.role as string)
        requestHeaders.set("x-user-email", payload.email as string)

        return NextResponse.next({
            request: {
                headers: requestHeaders
            }
        })

    } catch (error) {
        // Invalid or expired token — redirect to login
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }
}

export const config = {
    matcher: [
        // Match all admin routes
        "/admin/:path*",
    ]
}
