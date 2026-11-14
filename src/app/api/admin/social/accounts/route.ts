import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const accounts = await db.socialAccount.findMany({
            orderBy: { platform: "asc" }
        })

        // Also check if FacebookSettings has credentials to show as legacy fallback
        const fbLegacy = await db.facebookSettings.findFirst()

        return NextResponse.json({
            success: true,
            accounts,
            fbLegacy: fbLegacy
                ? {
                      isConnected: fbLegacy.isConnected,
                      pageId: fbLegacy.pageId,
                      pageName: fbLegacy.pageName,
                      hasToken: !!fbLegacy.pageAccessToken
                  }
                : null
        })
    } catch (error: any) {
        console.error("Fetch social accounts error:", error)
        return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { platform, accountName, accountId, accessToken, refreshToken, apiKey, apiSecret, isActive } = body

        if (!platform) {
            return NextResponse.json({ error: "Platform is required" }, { status: 400 })
        }

        const existing = await db.socialAccount.findFirst({
            where: { platform }
        })

        let account
        if (existing) {
            account = await db.socialAccount.update({
                where: { id: existing.id },
                data: {
                    accountName: accountName?.trim() ?? existing.accountName,
                    accountId: accountId?.trim() ?? existing.accountId,
                    accessToken: accessToken?.trim() ?? existing.accessToken,
                    refreshToken: refreshToken?.trim() ?? existing.refreshToken,
                    apiKey: apiKey?.trim() ?? existing.apiKey,
                    apiSecret: apiSecret?.trim() ?? existing.apiSecret,
                    isActive: isActive !== undefined ? isActive : existing.isActive,
                    lastStatus: accessToken || apiKey ? "CONNECTED" : "DISCONNECTED"
                }
            })
        } else {
            account = await db.socialAccount.create({
                data: {
                    platform,
                    accountName: accountName?.trim() || `${platform} Account`,
                    accountId: accountId?.trim() || null,
                    accessToken: accessToken?.trim() || null,
                    refreshToken: refreshToken?.trim() || null,
                    apiKey: apiKey?.trim() || null,
                    apiSecret: apiSecret?.trim() || null,
                    isActive: isActive !== undefined ? isActive : true,
                    lastStatus: accessToken || apiKey ? "CONNECTED" : "DISCONNECTED"
                }
            })
        }

        // If updating FACEBOOK token, auto-sync to INSTAGRAM since both share the same Meta permissions/Graph API token
        if (platform === "FACEBOOK" && accessToken?.trim()) {
            const igAccount = await db.socialAccount.findFirst({ where: { platform: "INSTAGRAM" } })
            if (igAccount) {
                await db.socialAccount
                    .update({
                        where: { id: igAccount.id },
                        data: { accessToken: accessToken.trim(), lastStatus: "CONNECTED" }
                    })
                    .catch(() => {})
            }
        }

        return NextResponse.json({ success: true, account })
    } catch (error: any) {
        console.error("Save social account error:", error)
        return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        const platform = searchParams.get("platform")

        if (!id && !platform) {
            return NextResponse.json({ error: "ID or platform required" }, { status: 400 })
        }

        if (id) {
            await db.socialAccount.delete({ where: { id } })
        } else if (platform) {
            await db.socialAccount.deleteMany({ where: { platform } })
        }

        return NextResponse.json({ success: true, message: "Account disconnected" })
    } catch (error: any) {
        console.error("Delete social account error:", error)
        return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
    }
}

