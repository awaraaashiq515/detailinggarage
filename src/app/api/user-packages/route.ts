import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"
import { purchasePackageSchema } from "@/lib/schemas/package"
import { formatUserPackageResponse } from "@/lib/auth/package-access"

// GET /api/user-packages - Get current user's packages
export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Admin doesn't need packages
        if (user.role === "ADMIN") {
            return NextResponse.json({
                message: "Admin has unlimited access without packages",
                isAdmin: true,
                packages: [],
            })
        }

        const now = new Date()

        const userPackages = await db.userPackage.findMany({
            where: {
                userId: user.userId,
            },
            include: {
                package: true,
            },
            orderBy: {
                purchasedAt: "desc",
            },
        })

        // Separate active and inactive packages
        const activePackages = userPackages.filter(
            up => up.status === "ACTIVE" &&
                up.package.status === "ACTIVE"
        )

        const inactivePackages = userPackages.filter(
            up => up.status !== "ACTIVE" ||
                up.package.status !== "ACTIVE"
        )

        return NextResponse.json({
            isAdmin: false,
            activePackages: activePackages.map(formatUserPackageResponse),
            inactivePackages: inactivePackages.map(formatUserPackageResponse),
        })
    } catch (error) {
        console.error("Error fetching user packages:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST /api/user-packages - Purchase/assign a package
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Admin doesn't need to purchase packages
        if (user.role === "ADMIN") {
            return NextResponse.json(
                { error: "Admin has unlimited access without packages" },
                { status: 400 }
            )
        }

        const body = await request.json()
        const validation = purchasePackageSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { packageId } = validation.data

        // Check if package exists and is active
        const pkg = await db.package.findFirst({
            where: {
                id: packageId,
                status: "ACTIVE",
            },
        })

        if (!pkg) {
            return NextResponse.json(
                { error: "Package not found or not available" },
                { status: 404 }
            )
        }

        // Check if user already has this package
        const existingUserPackage = await db.userPackage.findFirst({
            where: {
                userId: user.userId,
                packageId,
            },
        })

        if (existingUserPackage) {
            // Reactivate if expired/cancelled
            if (existingUserPackage.status !== "ACTIVE") {
                const updatedUserPackage = await db.userPackage.update({
                    where: { id: existingUserPackage.id },
                    data: {
                        status: "ACTIVE",
                        purchasedAt: new Date(),
                        pdiRemaining: pkg.pdiCount, // Reset PDIs on reactivation
                        pdiUsed: 0
                    },
                    include: { package: true },
                })

                return NextResponse.json({
                    message: "Package reactivated successfully",
                    userPackage: formatUserPackageResponse(updatedUserPackage),
                })
            }

            return NextResponse.json(
                { error: "You already have this package" },
                { status: 400 }
            )
        }

        // Create new user package
        const newUserPackage = await db.userPackage.create({
            data: {
                userId: user.userId,
                packageId,
                pdiRemaining: pkg.pdiCount,
                pdiUsed: 0,
                status: "ACTIVE"
            },
            include: { package: true },
        })

        return NextResponse.json({
            message: "Package purchased successfully",
            userPackage: formatUserPackageResponse(newUserPackage),
        }, { status: 201 })
    } catch (error) {
        console.error("Error purchasing package:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
