import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Helper function to get user from session/token
 * For now, this is a placeholder - integrate with your actual auth system
 */
export async function getUserFromRequest(request: NextRequest) {
    // TODO: Implement actual session/JWT validation
    // This is a placeholder that extracts user info from headers or cookies

    // Example: If you're using custom headers for auth
    const userEmail = request.headers.get('x-user-email')
    const userRole = request.headers.get('x-user-role')

    if (!userEmail) {
        return null
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
        }
    })

    return user
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(request: NextRequest) {
    const user = await getUserFromRequest(request)

    if (!user) {
        throw new Error('Authentication required')
    }

    if (user.status !== 'APPROVED') {
        throw new Error('User account not approved')
    }

    return user
}

/**
 * Require ADMIN role
 */
export async function requireAdmin(request: NextRequest) {
    const user = await requireAuth(request)

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        throw new Error('Admin access required')
    }

    return user
}

/**
 * Require CLIENT role
 */
export async function requireClient(request: NextRequest) {
    const user = await requireAuth(request)

    if (user.role !== 'CLIENT') {
        throw new Error('Client access required')
    }

    return user
}

/**
 * Check if user is admin
 */
export function isAdmin(user: { role: string } | null): boolean {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
}

/**
 * Check if user is client
 */
export function isClient(user: { role: string } | null): boolean {
    return user?.role === 'CLIENT'
}

/**
 * Create auth error response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
    return NextResponse.json(
        { error: message },
        { status: 401 }
    )
}

/**
 * Create forbidden error response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
    return NextResponse.json(
        { error: message },
        { status: 403 }
    )
}
