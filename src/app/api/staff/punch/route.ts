import { NextRequest, NextResponse } from "next/server"
import { getStaffContext } from "@/lib/auth/staff-auth"
import { db } from "@/lib/db"
import { calculateDistanceMeters } from "@/lib/geo"

function formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    })
}

// GET today's punch status and shop geofence target
export async function GET(request: NextRequest) {
    const ctx = await getStaffContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const today = new Date().toISOString().split("T")[0]
        const [attendance, shop] = await Promise.all([
            db.staffAttendance.findUnique({
                where: {
                    staffId_date: {
                        staffId: ctx.staff.id,
                        date: today
                    }
                }
            }),
            ctx.staff.shopId ? db.shop.findUnique({
                where: { id: ctx.staff.shopId },
                select: {
                    id: true,
                    name: true,
                    latitude: true,
                    longitude: true,
                    geofenceRadius: true,
                    autoAttendanceEnabled: true
                }
            }) : null
        ])

        return NextResponse.json({
            success: true,
            date: today,
            attendance: attendance || null,
            status: attendance ? attendance.status : "NOT_MARKED",
            shopGeofence: shop ? {
                hasLocation: !!(shop.latitude && shop.longitude),
                latitude: shop.latitude,
                longitude: shop.longitude,
                radius: shop.geofenceRadius || 150,
                autoAttendanceEnabled: shop.autoAttendanceEnabled ?? true
            } : null
        })
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Failed to get punch status" }, { status: 500 })
    }
}

// POST Punch-In or Punch-Out with GPS Geofence Verification
export async function POST(request: NextRequest) {
    const ctx = await getStaffContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { action, latitude, longitude, isAuto } = body // action: "PUNCH_IN", "PUNCH_OUT"
        const now = new Date()
        const today = now.toISOString().split("T")[0]
        const timeString = formatTime(now)

        // Parse coordinates
        const staffLat = latitude !== undefined && latitude !== null ? parseFloat(latitude) : null
        const staffLng = longitude !== undefined && longitude !== null ? parseFloat(longitude) : null

        // Fetch Shop's Geofence settings
        const shop = ctx.staff.shopId ? await db.shop.findUnique({
            where: { id: ctx.staff.shopId },
            select: {
                latitude: true,
                longitude: true,
                geofenceRadius: true,
                autoAttendanceEnabled: true
            }
        }) : null

        let distanceMeters: number | null = null
        let isInsideGeofence = false
        const geofenceRadius = shop?.geofenceRadius || 150

        if (shop?.latitude && shop?.longitude && staffLat !== null && staffLng !== null) {
            distanceMeters = calculateDistanceMeters(staffLat, staffLng, shop.latitude, shop.longitude)
            isInsideGeofence = distanceMeters <= geofenceRadius
        }

        // Check if this was an automatic punch trigger but staff is outside workshop area
        if (isAuto && !isInsideGeofence) {
            return NextResponse.json({
                success: false,
                skipped: true,
                reason: "OUTSIDE_GEOFENCE",
                message: `You are ${distanceMeters !== null ? distanceMeters + "m" : "unknown distance"} away from workshop perimeter (${geofenceRadius}m radius). Auto-attendance was not triggered.`,
                distanceMeters,
                geofenceRadius
            })
        }

        let attendance = await db.staffAttendance.findUnique({
            where: {
                staffId_date: {
                    staffId: ctx.staff.id,
                    date: today
                }
            }
        })

        // Determine punch method label
        let punchMethod = "MANUAL"
        if (isAuto && isInsideGeofence) {
            punchMethod = "AUTO_GEOFENCE"
        } else if (isInsideGeofence) {
            punchMethod = "GPS_VERIFIED"
        } else if (staffLat !== null) {
            punchMethod = "MANUAL_OUTSIDE_GPS"
        }

        if (action === "PUNCH_IN") {
            if (attendance && attendance.checkIn) {
                return NextResponse.json({
                    success: true,
                    alreadyPunched: true,
                    message: `Already checked in today at ${attendance.checkIn}`,
                    attendance,
                    distanceMeters,
                    isInsideGeofence
                })
            }

            const punchNote = isInsideGeofence
                ? `Auto-verified inside workshop (${distanceMeters}m from center)`
                : distanceMeters !== null
                ? `Punched manually (${distanceMeters}m from center)`
                : `Manual punch`

            if (!attendance) {
                attendance = await db.staffAttendance.create({
                    data: {
                        staffId: ctx.staff.id,
                        shopId: ctx.staff.shopId,
                        date: today,
                        status: "PRESENT",
                        checkIn: timeString,
                        punchMethod,
                        latitude: staffLat,
                        longitude: staffLng,
                        distanceMeters,
                        notes: punchNote
                    }
                })
            } else {
                attendance = await db.staffAttendance.update({
                    where: { id: attendance.id },
                    data: {
                        checkIn: timeString,
                        status: "PRESENT",
                        punchMethod,
                        latitude: staffLat,
                        longitude: staffLng,
                        distanceMeters,
                        notes: punchNote
                    }
                })
            }

            return NextResponse.json({
                success: true,
                message: punchMethod === "AUTO_GEOFENCE"
                    ? `✓ Auto Attendance Marked! You entered workshop perimeter (${distanceMeters}m away) at ${timeString}`
                    : `Punched In successfully at ${timeString}`,
                attendance,
                punchMethod,
                distanceMeters,
                isInsideGeofence
            })
        }

        if (action === "PUNCH_OUT") {
            if (!attendance) {
                attendance = await db.staffAttendance.create({
                    data: {
                        staffId: ctx.staff.id,
                        shopId: ctx.staff.shopId,
                        date: today,
                        status: "PRESENT",
                        checkOut: timeString,
                        punchMethod,
                        latitude: staffLat,
                        longitude: staffLng,
                        distanceMeters
                    }
                })
            } else {
                attendance = await db.staffAttendance.update({
                    where: { id: attendance.id },
                    data: {
                        checkOut: timeString,
                        distanceMeters: distanceMeters !== null ? distanceMeters : attendance.distanceMeters
                    }
                })
            }

            return NextResponse.json({
                success: true,
                message: `Punched Out successfully at ${timeString}`,
                attendance,
                distanceMeters,
                isInsideGeofence
            })
        }

        return NextResponse.json({ error: "Invalid action. Use PUNCH_IN or PUNCH_OUT" }, { status: 400 })
    } catch (error: any) {
        console.error("Punch error:", error)
        return NextResponse.json({ error: error?.message || "Punch failed" }, { status: 500 })
    }
}
