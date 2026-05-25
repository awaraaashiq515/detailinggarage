import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

// Helper to get JWT_SECRET dynamically at runtime
function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("FATAL: JWT_SECRET environment variable is not set.")
        }
        return new TextEncoder().encode("car-service-project-2026-secret-key");
    }
    return new TextEncoder().encode(secret);
}

// Valid roles in the system
export type Role = "SUPER_ADMIN" | "ADMIN" | "CLIENT" | "DEALER" | "AGENT" | "COMPANY" | "ENTERPRISE"

export interface JWTPayload {
    userId: string
    email: string
    name: string
    role: Role
    status?: string  // PENDING | APPROVED | REJECTED | SUSPENDED
}

// Sign a new JWT token (24h expiry)
export async function signToken(payload: JWTPayload): Promise<string> {
    const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(getJwtSecret())

    return token
}

// Verify and decode JWT token — returns null on failure
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret())
        return payload as unknown as JWTPayload
    } catch {
        return null
    }
}

// Get token from httpOnly cookies
export async function getTokenFromCookies(): Promise<string | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")
    return token?.value || null
}

// Get current authenticated user from token
export async function getCurrentUser(): Promise<JWTPayload | null> {
    const token = await getTokenFromCookies()
    if (!token) return null
    return verifyToken(token)
}

// ── Role Helpers ──────────────────────────────────────────────────────────

export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
}

export async function isDealer(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === "DEALER" || user?.role === "ADMIN"
}

export async function isCompany(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === "COMPANY" || user?.role === "ENTERPRISE" || user?.role === "ADMIN"
}

export async function isClient(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === "CLIENT" || user?.role === "ADMIN"
}

// Check if user has a specific role
export async function hasRole(role: Role): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === role
}

