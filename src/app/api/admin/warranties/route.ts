import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

async function checkAdminAuth() {
    const user = await getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        return null
    }
    return user
}

export async function GET(request: Request) {
    const user = await checkAdminAuth()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search")?.trim()
        const status = searchParams.get("status")?.trim()

        const where: any = {}

        if (status && status !== "ALL") {
            where.status = status
        }

        if (search) {
            where.OR = [
                { certificateNumber: { contains: search } },
                { customerName: { contains: search } },
                { customerPhone: { contains: search } },
                { vin: { contains: search } },
                { vehicleReg: { contains: search } },
                { type: { contains: search } },
                { productPackage: { contains: search } },
            ]
        }

        const warranties = await db.warranty.findMany({
            where,
            include: {
                inspections: {
                    orderBy: { date: "desc" }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ success: true, warranties })
    } catch (error: any) {
        console.error("Error fetching warranties:", error)
        return NextResponse.json({ error: error.message || "Failed to fetch warranties" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const user = await checkAdminAuth()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            certificateNumber,
            type,
            productPackage,
            coverageArea,
            customerName,
            customerPhone,
            vin,
            vehicleReg,
            invoiceNo,
            startDate,
            years,
            requiresAnnualInspection,
            terms,
            notes
        } = body

        if (!type || !customerName || !customerPhone) {
            return NextResponse.json({ error: "Type, Customer Name, and Phone are required" }, { status: 400 })
        }

        // Generate Certificate number if not provided
        let cert = certificateNumber?.trim()
        if (!cert) {
            const randomCode = Math.floor(100000 + Math.random() * 900000)
            cert = `DG-WAR-${randomCode}`
        }

        // Check uniqueness of certificateNumber
        const existing = await db.warranty.findUnique({
            where: { certificateNumber: cert }
        })
        if (existing) {
            return NextResponse.json({ error: `Certificate number "${cert}" already exists` }, { status: 400 })
        }

        const sDate = startDate ? new Date(startDate) : new Date()
        const validYears = Number(years) || 1
        const eDate = new Date(sDate)
        eDate.setFullYear(eDate.getFullYear() + validYears)

        let nextInspectionDate: Date | null = null
        if (requiresAnnualInspection !== false) {
            nextInspectionDate = new Date(sDate)
            nextInspectionDate.setFullYear(nextInspectionDate.getFullYear() + 1)
        }

        const warranty = await db.warranty.create({
            data: {
                certificateNumber: cert,
                type,
                productPackage: productPackage || null,
                coverageArea: coverageArea || null,
                customerName,
                customerPhone,
                vin: vin || null,
                vehicleReg: vehicleReg || null,
                invoiceNo: invoiceNo || null,
                startDate: sDate,
                endDate: eDate,
                years: validYears,
                requiresAnnualInspection: requiresAnnualInspection !== false,
                nextInspectionDate,
                status: "Active",
                terms: terms || "Covers product defects such as peeling, yellowing, cracking or loss of performance under normal use. Excludes accident damage, improper washing, chemical damage and work by non-authorised installers.",
                notes: notes || null
            }
        })

        return NextResponse.json({ success: true, warranty }, { status: 201 })
    } catch (error: any) {
        console.error("Error creating warranty:", error)
        return NextResponse.json({ error: error.message || "Failed to create warranty" }, { status: 500 })
    }
}

