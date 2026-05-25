import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"

export async function POST(request: NextRequest) {
    try {
        // Auth check — admin only
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { reg_no } = body

        if (!reg_no || typeof reg_no !== "string" || reg_no.trim().length < 4) {
            return NextResponse.json(
                { error: "Please enter a valid registration number" },
                { status: 400 }
            )
        }

        // Call RapidAPI
        const response = await fetch(
            "https://rto-vehicle-information-verification-india2.p.rapidapi.com/api/v1/private/rc-v1",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-rapidapi-host": "rto-vehicle-information-verification-india2.p.rapidapi.com",
                    "x-rapidapi-key": "13babdd43bmsh0a4b5be857f2551p1ee470jsnf8652ee9fe37",
                },
                body: JSON.stringify({
                    reg_no: reg_no.trim(),
                    consent: "yes",
                    consent_text:
                        "I hear by declare my consent agreement for fetching my information via Foxtail Kyc API",
                }),
            }
        )

        const data = await response.json()

        // The API returns status_code: 100 for success
        if (!data || data.status_code !== 100) {
            return NextResponse.json(
                { error: data?.message || "Vehicle not found. Please check the registration number." },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: data.result })
    } catch (error) {
        console.error("Vehicle lookup error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
