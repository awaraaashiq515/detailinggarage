import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const listing = await prisma.marketplaceListing.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.seller !== undefined && { seller: body.seller.trim() }),
        ...(body.category !== undefined && { category: body.category.trim() }),
        ...(body.description !== undefined && { description: body.description ? body.description.trim() : null }),
        ...(body.price !== undefined && { price: body.price ? body.price.trim() : null }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl ? body.imageUrl.trim() : null }),
        ...(body.city !== undefined && { city: body.city ? body.city.trim() : null }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      },
    })
    return NextResponse.json({ success: true, listing })
  } catch (err: any) {
    console.error("Admin marketplace PUT error:", err)
    return NextResponse.json({ success: false, error: err.message || "Failed to update listing" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.marketplaceListing.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Admin marketplace DELETE error:", err)
    return NextResponse.json({ success: false, error: err.message || "Failed to delete listing" }, { status: 500 })
  }
}
