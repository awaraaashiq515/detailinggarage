import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, city, service, message } = body

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: "Name and phone are required." }, { status: 400 })
    }

    console.log("Contact Enquiry Received:", {
      name,
      phone,
      city: city || "Mandi",
      service: service || "PDI booking",
      message: message || "",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Thank you! Your enquiry has been received. Our team will contact you shortly.",
    })
  } catch (err: any) {
    console.error("Contact API error:", err)
    return NextResponse.json({ success: false, error: "Failed to submit enquiry." }, { status: 500 })
  }
}

