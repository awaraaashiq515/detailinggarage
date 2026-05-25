import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET — fetch billing profile (create default if missing)
export async function GET() {
    try {
        let profile = await db.billingProfile.findUnique({ where: { id: "default" } })
        if (!profile) {
            profile = await db.billingProfile.create({
                data: {
                    id: "default",
                    businessName: "Detailing Garage",
                    tagline: "Premium Auto Protection Studio",
                    phone: "",
                    email: "",
                    address: "",
                    city: "",
                    state: "",
                    pinCode: "",
                    country: "India",
                    gstin: "",
                    pan: "",
                    bankName: "",
                    accountName: "",
                    accountNumber: "",
                    ifscCode: "",
                    upiId: "",
                    defaultNotes: "WE SHALL NOT BE RESPONSIBLE FOR THE REPLACED PARTS IF NOT COLLECTED AT THE TIME OF DELIVERY.",
                    defaultTerms: "",
                },
            })
        }
        return NextResponse.json({ success: true, profile })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}

// PUT — update billing profile
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const profile = await db.billingProfile.upsert({
            where: { id: "default" },
            update: body,
            create: { id: "default", ...body },
        })
        return NextResponse.json({ success: true, profile })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
