import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            )
        }

        return NextResponse.json({
            user: {
                id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        console.error("Get user error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
