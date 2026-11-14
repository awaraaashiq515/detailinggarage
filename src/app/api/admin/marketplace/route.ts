import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const where: any = {}
    if (category && category !== "all") where.category = category
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { seller: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const listings = await prisma.marketplaceListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    const total = await prisma.marketplaceListing.count()
    const active = await prisma.marketplaceListing.count({ where: { isActive: true } })

    return NextResponse.json({ success: true, listings, stats: { total, active } })
  } catch (err: any) {
    console.error("Admin marketplace GET error:", err)
    return NextResponse.json({ success: false, error: "Failed to fetch listings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.title || !body.seller || !body.category) {
      return NextResponse.json({ success: false, error: "Title, seller, and category are required" }, { status: 400 })
    }

    const listing = await prisma.marketplaceListing.create({
      data: {
        title: body.title.trim(),
        seller: body.seller.trim(),
        category: body.category.trim(),
        description: body.description ? body.description.trim() : null,
        price: body.price ? body.price.trim() : "Price on request",
        imageUrl: body.imageUrl ? body.imageUrl.trim() : null,
        city: body.city ? body.city.trim() : "Chandigarh",
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    })
    return NextResponse.json({ success: true, listing }, { status: 201 })
  } catch (err: any) {
    console.error("Admin marketplace POST error:", err)
    return NextResponse.json({ success: false, error: err.message || "Failed to create listing" }, { status: 500 })
  }
}
