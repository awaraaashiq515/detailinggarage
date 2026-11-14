import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      type, // "pdi" | "detailing"
      fullName,
      mobile,
      email,
      city,
      vehicleType,
      makeModel,
      dealershipName,
      deliveryDate,
      preferredTime,
      carAge,
      serviceAt,
      servicesNeeded,
      message,
    } = body

    if (!fullName || !mobile) {
      return NextResponse.json({ success: false, error: "Full name and mobile number are required." }, { status: 400 })
    }

    console.log(`[BOOKING REQUEST - ${type?.toUpperCase() || "GENERAL"}]:`, {
      fullName,
      mobile,
      email,
      city,
      vehicleType,
      makeModel,
      dealershipName,
      deliveryDate,
      preferredTime,
      carAge,
      serviceAt,
      servicesNeeded,
      message,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Booking request received successfully! Our team will contact you shortly to confirm.",
    })
  } catch (err: any) {
    console.error("Booking API error:", err)
    return NextResponse.json({ success: false, error: "Failed to process booking request." }, { status: 500 })
  }
}

