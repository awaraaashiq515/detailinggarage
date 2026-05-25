import { db } from "@/lib/db"
import { getCurrentUser, type Role } from "@/lib/auth/jwt"

// Admin always has full access without any package requirement
export async function hasPackageAccess(
    userId: string,
    role: Role,
    requiredType?: "PDI" | "INSURANCE" | "SERVICE"
): Promise<boolean> {
    // Admin always has free unlimited access
    if (role === "ADMIN") {
        return true
    }

    // For non-admin roles, check if they have an active package with remaining PDIs
    const activePackage = await db.userPackage.findFirst({
        where: {
            userId,
            status: "ACTIVE",
            pdiRemaining: { gt: 0 },
            ...(requiredType ? {
                package: {
                    type: requiredType,
                    status: "ACTIVE"
                }
            } : {
                package: {
                    status: "ACTIVE"
                }
            })
        },
        include: {
            package: true
        }
    })

    return !!activePackage
}

// Get user's active packages
export async function getUserActivePackages(userId: string) {
    return db.userPackage.findMany({
        where: {
            userId,
            status: "ACTIVE",
            pdiRemaining: { gt: 0 },
            package: {
                status: "ACTIVE"
            }
        },
        include: {
            package: true
        },
        orderBy: {
            purchasedAt: "desc"
        }
    })
}

// Check package access for current user (server-side helper)
export async function checkCurrentUserPackageAccess(
    requiredType?: "PDI" | "INSURANCE" | "SERVICE"
): Promise<{ hasAccess: boolean; isAdmin: boolean; packages: any[] }> {
    const user = await getCurrentUser()

    if (!user) {
        return { hasAccess: false, isAdmin: false, packages: [] }
    }

    // Admin always has access
    if (user.role === "ADMIN") {
        return { hasAccess: true, isAdmin: true, packages: [] }
    }

    const packages = await getUserActivePackages(user.userId)
    const hasAccess = requiredType
        ? packages.some(p => p.package.type === requiredType)
        : packages.length > 0

    return { hasAccess, isAdmin: false, packages }
}

// Helper to format package for response
export function formatPackageResponse(pkg: any) {
    return {
        id: pkg.id,
        name: pkg.name,
        type: pkg.type,
        description: pkg.description,
        services: JSON.parse(pkg.services || "[]"),
        price: pkg.price,
        pdiCount: pkg.pdiCount,
        status: pkg.status,
        createdAt: pkg.createdAt.toISOString(),
        updatedAt: pkg.updatedAt.toISOString(),
    }
}

// Helper to format user package for response
export function formatUserPackageResponse(userPkg: any) {
    return {
        id: userPkg.id,
        packageId: userPkg.packageId,
        purchasedAt: userPkg.purchasedAt.toISOString(),
        pdiRemaining: userPkg.pdiRemaining,
        pdiUsed: userPkg.pdiUsed,
        status: userPkg.status,
        package: formatPackageResponse(userPkg.package),
    }
}
