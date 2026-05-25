import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

// ─── Helper: find or create a general inquiry (chat thread) for this user ↔ dealer ───
async function getOrCreateChatInquiry(
    dealerPage: { id: string; dealer: { id: string; name: string } },
    userId: string,
    userName: string
) {
    const dealerId = dealerPage.dealer.id

    // Look for an existing "GENERAL_CHAT" inquiry between this user and dealer
    const existing = await db.inquiry.findFirst({
        where: {
            dealerId,
            userId,
            message: { startsWith: "[GENERAL_CHAT]" },
        },
    })

    if (existing) return existing

    // Create a new inquiry to represent the chat thread.
    // vehicleId is not required by the schema (it has no @default), but the model allows
    // it to be set — we'll pick any vehicle belonging to this dealer, or skip if none.
    // Actually, looking at schema: vehicleId is required (no ? and no default).
    // We'll create a "dummy" approach: store vehicleId as the first active vehicle, or
    // if no vehicles exist we need a workaround. Let's check schema: vehicleId String (required)
    // Per the schema Inquiry.vehicleId is required. We need a vehicle. Let's grab the first.
    const firstVehicle = await db.dealerVehicle.findFirst({
        where: { dealerId },
        select: { id: true },
    })

    if (!firstVehicle) {
        // No vehicles — can't create Inquiry (vehicleId required).
        // Return null to indicate chat unavailable.
        return null
    }

    return db.inquiry.create({
        data: {
            vehicleId: firstVehicle.id,
            dealerId,
            userId,
            customerName: userName,
            customerMobile: "N/A",
            message: "[GENERAL_CHAT] Chat thread",
            status: "PENDING",
        },
    })
}

// ─── GET /api/public/dealer/[slug]/chat ─────────────────────────────────────
// Returns the current user's chat messages with this dealer.
// Requires auth (401 if not logged in).
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: "Login required to chat" }, { status: 401 })
    }

    const { slug } = await params
    const page = await db.dealerPage.findUnique({
        where: { slug },
        include: { dealer: { select: { id: true, name: true } } },
    })
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 })
    if (!page.isActive) return NextResponse.json({ error: "Page unavailable" }, { status: 403 })

    // Find the existing inquiry/chat thread
    const inquiry = await db.inquiry.findFirst({
        where: {
            dealerId: page.dealer.id,
            userId: user.userId,
            message: { startsWith: "[GENERAL_CHAT]" },
        },
    })

    if (!inquiry) {
        // No thread yet — return empty messages
        return NextResponse.json({ messages: [] })
    }

    const messages = await db.inquiryMessage.findMany({
        where: { inquiryId: inquiry.id },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            senderType: true,
            senderId: true,
            message: true,
            createdAt: true,
        },
    })

    return NextResponse.json({ messages })
}

// ─── POST /api/public/dealer/[slug]/chat ─────────────────────────────────────
// Sends a new message to the dealer. Creates thread if it doesn't exist.
// Requires auth (401 if not logged in).
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: "Login required to chat" }, { status: 401 })
    }

    const { slug } = await params
    const page = await db.dealerPage.findUnique({
        where: { slug },
        include: { dealer: { select: { id: true, name: true } } },
    })
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 })
    if (!page.isActive) return NextResponse.json({ error: "Page unavailable" }, { status: 403 })

    // Prevent dealer from chatting with themselves
    if (page.dealer.id === user.userId) {
        return NextResponse.json(
            { error: "You cannot chat with your own dealer page" },
            { status: 400 }
        )
    }

    const body = await req.json()
    const text = (body.message || "").trim()
    if (!text) {
        return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 })
    }
    if (text.length > 1000) {
        return NextResponse.json({ error: "Message too long (max 1000 chars)" }, { status: 400 })
    }

    // Get or create the chat thread
    const inquiry = await getOrCreateChatInquiry(page, user.userId, user.name)
    if (!inquiry) {
        return NextResponse.json(
            {
                error:
                    "This dealer has no vehicles listed yet. Chat cannot be started.",
            },
            { status: 400 }
        )
    }

    // Save the message
    const message = await db.inquiryMessage.create({
        data: {
            inquiryId: inquiry.id,
            senderType: "CUSTOMER",
            senderId: user.userId,
            message: text,
        },
    })

    return NextResponse.json({ message }, { status: 201 })
}
