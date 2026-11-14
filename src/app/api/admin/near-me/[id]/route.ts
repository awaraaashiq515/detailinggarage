import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { NEAR_ME_CATEGORIES } from "@/lib/near-me-categories"

export const dynamic = "force-dynamic"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()

        const cat = body.category ? NEAR_ME_CATEGORIES.find(c => c.id === body.category) : undefined

        const updated = await prisma.nearMeListing.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name.trim() }),
                ...(body.category && {
                    category: body.category.trim(),
                    categoryLabel: cat?.label || body.category.trim()
                }),
                ...(body.city !== undefined && { city: body.city.trim() }),
                ...(body.area !== undefined && { area: body.area ? body.area.trim() : null }),
                ...(body.address !== undefined && { address: body.address ? body.address.trim() : null }),
                ...(body.phone !== undefined && { phone: body.phone.trim() }),
                ...(body.whatsapp !== undefined && { whatsapp: body.whatsapp ? body.whatsapp.replace(/[^0-9]/g, "") : null }),
                ...(body.mapsUrl !== undefined && { mapsUrl: body.mapsUrl ? body.mapsUrl.trim() : null }),
                ...(body.rating !== undefined && { rating: parseFloat(body.rating) }),
                ...(body.reviewsCount !== undefined && { reviewsCount: parseInt(body.reviewsCount) }),
                ...(body.isVerified !== undefined && { isVerified: Boolean(body.isVerified) }),
                ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
                ...(body.services !== undefined && { services: body.services ? body.services.trim() : null }),
            }
        })

        return NextResponse.json({ success: true, listing: updated })
    } catch (error: any) {
        console.error("Admin near-me PUT error:", error)
        return NextResponse.json({ success: false, error: error.message || "Failed to update listing" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.nearMeListing.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Admin near-me DELETE error:", error)
        return NextResponse.json({ success: false, error: error.message || "Failed to delete listing" }, { status: 500 })
    }
}

