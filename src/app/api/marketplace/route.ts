import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const SEED_PRODUCTS = [
  {
    title: "Premium Car Audio Upgrade",
    seller: "Detailing Garage HQ",
    category: "audio",
    description: "Speakers, subwoofers, amplifiers and DSP from brands like Sony, JBL, Morel and JL Audio – installed and tuned.",
    price: "Price on request",
    imageUrl: null,
    city: "Chandigarh",
    isActive: true,
  },
  {
    title: "Ceramic Coating Package (Multi-layer)",
    seller: "Detailing Garage HQ",
    category: "coatings",
    description: "Paint correction plus multi-layer ceramic coating, with warranty registered against your VIN.",
    price: "Price on request",
    imageUrl: null,
    city: "Chandigarh",
    isActive: true,
  },
  {
    title: "Front & Rear Dash Camera (Hard-wired)",
    seller: "Detailing Garage HQ",
    category: "audio",
    description: "Dash camera with hidden hard-wiring through the fuse box – clean install, no loose wires.",
    price: "Price on request",
    imageUrl: null,
    city: "Chandigarh",
    isActive: true,
  },
  {
    title: "GFX Custom-fit Floor & Trunk Mats",
    seller: "GFX Mats",
    category: "floor-mats",
    description: "Custom-fit, waterproof mats made for your exact car model – perfect fit guaranteed.",
    price: "Price on request",
    imageUrl: null,
    city: "Chandigarh",
    isActive: true,
  },
  {
    title: "Graphene Coating Package",
    seller: "Detailing Garage HQ",
    category: "coatings",
    description: "Graphene coating for strong water beading and fewer water spots – lasts longer than ceramic.",
    price: "Price on request",
    imageUrl: null,
    city: "Chandigarh",
    isActive: true,
  },
  {
    title: "PPF – Full Body / Front Kit",
    seller: "Detailing Garage HQ",
    category: "coatings",
    description: "Self-healing TPU paint protection film in gloss or matte, fitted by our team.",
    price: "Price on request",
    imageUrl: null,
    city: "Chandigarh",
    isActive: true,
  },
  {
    title: "Proman Off-road Bumpers & Side Steps",
    seller: "Proman",
    category: "4x4",
    description: "Rugged bumpers, side steps and accessories for Thar, Jimny and more.",
    price: "Price on request",
    imageUrl: null,
    city: "Chandigarh",
    isActive: true,
  },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const city = searchParams.get("city")
    const search = searchParams.get("search")

    // Auto-seed on first run
    const count = await prisma.marketplaceListing.count()
    if (count === 0) {
      await prisma.marketplaceListing.createMany({ data: SEED_PRODUCTS })
    }

    const where: any = { isActive: true }
    if (category && category !== "all") where.category = category
    if (city && city !== "all") where.city = city
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

    return NextResponse.json({ listings })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const listing = await prisma.marketplaceListing.create({ data: body })
    return NextResponse.json({ listing }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

