import { NextRequest, NextResponse } from "next/server"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

export async function POST(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const uploadType = (formData.get("type") as string) || "logo"

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Validate image mime types
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Only PNG, JPG, WEBP, or SVG images are allowed" }, { status: 400 })
        }

        // Limit size to 5MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
        }

        const ext = path.extname(file.name) || (file.type === "image/png" ? ".png" : ".jpg")
        const randomHash = crypto.randomBytes(6).toString("hex")
        const fileName = `${uploadType}_${Date.now()}_${randomHash}${ext}`

        const uploadDir = path.join(process.cwd(), "public", "uploads", "shops")
        await mkdir(uploadDir, { recursive: true })

        const buffer = Buffer.from(await file.arrayBuffer())
        const filePath = path.join(uploadDir, fileName)
        await writeFile(filePath, buffer)

        const fileUrl = `/uploads/shops/${fileName}`

        return NextResponse.json({
            success: true,
            url: fileUrl,
            fileName,
        })
    } catch (error: any) {
        console.error("Error uploading shop asset:", error)
        return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 })
    }
}
