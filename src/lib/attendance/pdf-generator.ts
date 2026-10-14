import { jsPDF } from "jspdf"

export interface AttendancePDFData {
    periodLabel: string
    staffInfo?: {
        name?: string
        role?: string
        shopName?: string
        shopAddress?: string
        shopCity?: string
        shopPhone?: string
    } | null
    stats: {
        totalLoggedDays: number
        presentDays: number
        halfDays: number
        absentDays: number
        leaveDays: number
        totalPayableDays: number
        totalHoursWorked: number
        attendancePercentage: number
    }
    records: Array<{
        id: string
        date: string
        status: string
        checkIn?: string | null
        checkOut?: string | null
        punchMethod?: string | null
        distanceMeters?: number | null
        notes?: string | null
    }>
}

function calculateDuration(time1: string, time2: string): string {
    try {
        const parseTime = (t: string) => {
            const parts = t.trim().match(/(\d+):(\d+)\s*(AM|PM)/i)
            if (!parts) return null
            let hours = parseInt(parts[1], 10)
            const minutes = parseInt(parts[2], 10)
            const modifier = parts[3].toUpperCase()
            if (modifier === "PM" && modifier && hours < 12) hours += 12
            if (modifier === "AM" && hours === 12) hours = 0
            return hours * 60 + minutes
        }
        const m1 = parseTime(time1)
        const m2 = parseTime(time2)
        if (m1 === null || m2 === null) return "--"
        let diff = m2 - m1
        if (diff < 0) diff += 1440
        const hrs = Math.floor(diff / 60)
        const mins = diff % 60
        return `${hrs}h ${mins}m`
    } catch {
        return "--"
    }
}

/**
 * Generates an official, vectorized PDF for Staff Attendance and initiates a direct download in the browser.
 */
export function downloadAttendancePDF(data: AttendancePDFData): void {
    if (typeof window === "undefined") return

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 14
    const contentWidth = pageWidth - margin * 2

    const staffInfo = data.staffInfo || {}
    const stats = data.stats || {
        totalLoggedDays: 0,
        presentDays: 0,
        halfDays: 0,
        absentDays: 0,
        leaveDays: 0,
        totalPayableDays: 0,
        totalHoursWorked: 0,
        attendancePercentage: 0
    }
    const records = data.records || []

    let y = 14

    // ── Helper: Draw Workshop Header ──
    const drawHeader = () => {
        // Outer card box
        doc.setFillColor(248, 250, 252)
        doc.setDrawColor(203, 213, 225)
        doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "FD")

        // Workshop info (Left)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.setTextColor(15, 23, 42)
        doc.text(staffInfo.shopName || "Paramhans Auto Store", margin + 4, y + 8)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(100, 116, 139)
        const addressLine = [staffInfo.shopAddress, staffInfo.shopCity].filter(Boolean).join(", ")
        doc.text(addressLine || "Detailing & Auto Service Workshop", margin + 4, y + 14)
        doc.text(`Phone: ${staffInfo.shopPhone || "N/A"}`, margin + 4, y + 19)

        // Staff Info (Right)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.setTextColor(15, 23, 42)
        doc.text(staffInfo.name || "Staff", pageWidth - margin - 4, y + 8, { align: "right" })

        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(71, 85, 105)
        doc.text(staffInfo.role || "Technician", pageWidth - margin - 4, y + 14, { align: "right" })

        doc.setFont("helvetica", "bold")
        doc.setFontSize(7.5)
        doc.setTextColor(14, 116, 144) // Cyan / Teal
        doc.text("OFFICIAL ATTENDANCE SLIP", pageWidth - margin - 4, y + 19, { align: "right" })

        y += 30
    }

    drawHeader()

    // ── Metric Cards ──
    const cardWidth = (contentWidth - 12) / 4
    const cards = [
        { label: "REPORT PERIOD", val: data.periodLabel || "Selected Period", color: [30, 41, 59] },
        { label: "PRESENT DAYS", val: `${stats.presentDays} Days`, color: [22, 101, 52] },
        { label: "HALF DAYS", val: `${stats.halfDays} Days`, color: [180, 83, 9] },
        { label: "TOTAL PAYABLE", val: `${stats.totalPayableDays} Days`, color: [29, 78, 216] },
    ]

    cards.forEach((c, idx) => {
        const cx = margin + idx * (cardWidth + 4)
        doc.setFillColor(248, 250, 252)
        doc.setDrawColor(226, 232, 240)
        doc.roundedRect(cx, y, cardWidth, 14, 1.5, 1.5, "FD")

        doc.setFont("helvetica", "bold")
        doc.setFontSize(6.5)
        doc.setTextColor(100, 116, 139)
        doc.text(c.label, cx + cardWidth / 2, y + 5, { align: "center" })

        doc.setFontSize(9)
        doc.setTextColor(c.color[0], c.color[1], c.color[2])
        doc.text(c.val, cx + cardWidth / 2, y + 11, { align: "center" })
    })

    y += 18

    // ── Secondary Stats Row (Hours Worked, Absents, Attendance Rate) ──
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    const summaryText = `Total Hours: ${stats.totalHoursWorked || 0}h  |  Absent: ${stats.absentDays}  |  Leave: ${stats.leaveDays}  |  Attendance Rate: ${stats.attendancePercentage}%  |  Records: ${records.length} days`
    doc.text(summaryText, margin, y)
    y += 5

    // ── Table Header ──
    const drawTableHeader = () => {
        doc.setFillColor(241, 245, 249)
        doc.setDrawColor(203, 213, 225)
        doc.rect(margin, y, contentWidth, 7, "FD")

        doc.setFont("helvetica", "bold")
        doc.setFontSize(7.5)
        doc.setTextColor(51, 65, 85)

        doc.text("Date", margin + 3, y + 5)
        doc.text("Day", margin + 27, y + 5)
        doc.text("Status", margin + 46, y + 5)
        doc.text("Check In", margin + 74, y + 5)
        doc.text("Check Out", margin + 98, y + 5)
        doc.text("Hours", margin + 122, y + 5)
        doc.text("Punch Method & Verification", margin + 142, y + 5)

        y += 7
    }

    drawTableHeader()

    // ── Attendance Rows ──
    records.forEach((rec, idx) => {
        // Page break if near bottom
        if (y + 9 > pageHeight - 24) {
            doc.addPage()
            y = 14
            drawTableHeader()
        }

        const isEven = idx % 2 === 0
        if (isEven) {
            doc.setFillColor(250, 250, 252)
            doc.rect(margin, y, contentWidth, 6.5, "F")
        }

        doc.setDrawColor(241, 245, 249)
        doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5)

        const dateObj = new Date(rec.date)
        const dayName = isNaN(dateObj.getTime())
            ? ""
            : dateObj.toLocaleDateString("en-IN", { weekday: "short" })

        // Date & Day
        doc.setFont("helvetica", "normal")
        doc.setFontSize(7.5)
        doc.setTextColor(15, 23, 42)
        doc.text(rec.date, margin + 3, y + 4.5)

        doc.setTextColor(100, 116, 139)
        doc.text(dayName, margin + 27, y + 4.5)

        // Status Badge color
        doc.setFont("helvetica", "bold")
        if (rec.status === "PRESENT") {
            doc.setTextColor(22, 101, 52) // Green
            doc.text("PRESENT", margin + 46, y + 4.5)
        } else if (rec.status === "HALF_DAY") {
            doc.setTextColor(180, 83, 9) // Amber
            doc.text("HALF DAY", margin + 46, y + 4.5)
        } else if (rec.status === "LEAVE") {
            doc.setTextColor(29, 78, 216) // Blue
            doc.text("LEAVE", margin + 46, y + 4.5)
        } else {
            doc.setTextColor(185, 28, 28) // Red
            doc.text("ABSENT", margin + 46, y + 4.5)
        }

        // Times
        doc.setFont("helvetica", "normal")
        doc.setTextColor(15, 23, 42)
        doc.text(rec.checkIn || "--:--", margin + 74, y + 4.5)
        doc.text(rec.checkOut || "--:--", margin + 98, y + 4.5)

        // Duration
        const duration = (rec.checkIn && rec.checkOut)
            ? calculateDuration(rec.checkIn, rec.checkOut)
            : "--"
        doc.text(duration, margin + 122, y + 4.5)

        // Punch method info
        doc.setTextColor(100, 116, 139)
        let methodStr = ""
        if (rec.punchMethod === "AUTO_GEOFENCE") {
            methodStr = `Auto Geofence${rec.distanceMeters !== null && rec.distanceMeters !== undefined ? ` (${rec.distanceMeters}m)` : ""}`
        } else if (rec.punchMethod === "GPS_VERIFIED") {
            methodStr = "GPS Verified"
        } else if (rec.notes) {
            methodStr = rec.notes.slice(0, 24)
        } else {
            methodStr = "Manual Entry"
        }
        doc.text(methodStr, margin + 142, y + 4.5)

        y += 6.5
    })

    // ── Signatures & Stamp Section ──
    if (y + 24 > pageHeight - 16) {
        doc.addPage()
        y = 20
    } else {
        y += 10
    }

    // Staff Signature (Left)
    doc.setDrawColor(15, 23, 42)
    doc.line(margin + 5, y + 8, margin + 50, y + 8)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(15, 23, 42)
    doc.text("Staff Signature", margin + 5, y + 12)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, margin + 5, y + 16)

    // Authorized Stamp / Signature (Right)
    doc.line(pageWidth - margin - 55, y + 8, pageWidth - margin - 5, y + 8)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(15, 23, 42)
    doc.text("Authorized Workshop Signature / Stamp", pageWidth - margin - 5, y + 12, { align: "right" })
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    doc.text(staffInfo.shopName || "Paramhans Auto Store", pageWidth - margin - 5, y + 16, { align: "right" })

    // ── Add Page Numbers & Footer to All Pages ──
    const totalPages = doc.getNumberOfPages()
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.setTextColor(148, 163, 184)
        doc.text(
            `Page ${p} of ${totalPages}  •  Detailing Garage Verified Attendance System  •  Generated on ${new Date().toLocaleDateString("en-IN")}`,
            pageWidth / 2,
            pageHeight - 6,
            { align: "center" }
        )
    }

    // ── Trigger Direct Browser File Download ──
    const safeStaffName = staffInfo.name ? staffInfo.name.replace(/\s+/g, "_") : "Staff"
    const safePeriod = data.periodLabel ? data.periodLabel.replace(/[\s/:]+/g, "_") : "Report"
    const fileName = `Attendance_Report_${safeStaffName}_${safePeriod}.pdf`

    doc.save(fileName)
}
