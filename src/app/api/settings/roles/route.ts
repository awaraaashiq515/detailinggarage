import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const rolePermissions = await db.rolePermission.findMany()
        return NextResponse.json({ success: true, permissions: rolePermissions })
    } catch (error) {
        console.error("Error fetching role permissions:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { role, permissions } = body

        if (!role || !permissions) {
            return NextResponse.json({ error: "Role and permissions are required" }, { status: 400 })
        }

        const result = await db.rolePermission.upsert({
            where: { role },
            update: { permissions: JSON.stringify(permissions) },
            create: { role, permissions: JSON.stringify(permissions) }
        })

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        console.error("Error updating role permissions:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
