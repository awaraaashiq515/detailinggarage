import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Log enquiry (can extend to save to DB or send WhatsApp/email)
    console.log("Marketplace Enquiry:", body)
    return NextResponse.json({ success: true, message: "Enquiry received! We will contact you shortly." })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

