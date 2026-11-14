import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("[DEALER / FRANCHISE APPLICATION RECEIVED]:", {
      ...body,
      submittedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Dealer application submitted successfully! Our expansion manager will contact you within 24 hours.",
    })
  } catch (err: any) {
    console.error("Dealer Apply API error:", err)
    return NextResponse.json({ success: false, error: "Failed to submit dealer application." }, { status: 500 })
  }
}

