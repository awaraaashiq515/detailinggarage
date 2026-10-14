import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

export async function GET() {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const aiSettings = await db.aISettings.findFirst()
        const hasKey = Boolean(aiSettings?.geminiApiKey && aiSettings.geminiApiKey.length > 5)
        const maskedKey = hasKey && aiSettings?.geminiApiKey
            ? `${aiSettings.geminiApiKey.substring(0, 6)}••••••••${aiSettings.geminiApiKey.slice(-4)}`
            : null

        return NextResponse.json({
            success: true,
            isConfigured: hasKey,
            maskedKey,
        })
    } catch (error: any) {
        console.error("Error fetching AI settings:", error)
        return NextResponse.json({ error: error.message || "Failed to fetch AI settings" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { apiKey } = await request.json()
        if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 10) {
            return NextResponse.json({ error: "A valid Google Gemini API Key is required (starts with AIzaSy...)" }, { status: 400 })
        }

        const cleanedKey = apiKey.trim()
        const existing = await db.aISettings.findFirst()

        if (existing) {
            await db.aISettings.update({
                where: { id: existing.id },
                data: {
                    geminiApiKey: cleanedKey,
                    translationEnabled: true,
                    updatedBy: ctx.user.userId,
                }
            })
        } else {
            await db.aISettings.create({
                data: {
                    geminiApiKey: cleanedKey,
                    translationEnabled: true,
                    updatedBy: ctx.user.userId,
                }
            })
        }

        return NextResponse.json({
            success: true,
            message: "Google Gemini AI API Key saved successfully!",
            maskedKey: `${cleanedKey.substring(0, 6)}••••••••${cleanedKey.slice(-4)}`,
        })
    } catch (error: any) {
        console.error("Error saving AI settings:", error)
        return NextResponse.json({ error: error.message || "Failed to save AI settings" }, { status: 500 })
    }
}
