"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
    Calendar, Clock, CheckCircle2, XCircle, AlertCircle,
    RefreshCw, Play, Check, ChevronLeft, ChevronRight,
    Sparkles, MapPin, Radio, LocateFixed, Download, Printer,
    FileSpreadsheet, Filter, CalendarDays, ArrowDownToLine,
    Timer, User, Building2, ChevronDown
} from "lucide-react"
import { calculateDistanceMeters, formatDistance } from "@/lib/geo"

type FilterMode = "THIS_MONTH" | "LAST_MONTH" | "YEAR" | "CUSTOM"

export default function StaffAttendancePage() {
    // ── Filter State ──────────────────────────────────────────────────────────
    const [filterMode, setFilterMode] = useState<FilterMode>("THIS_MONTH")
    const currentYear = new Date().getFullYear().toString()
    const currentMonth = new Date().toISOString().slice(0, 7)

    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)
    const [selectedYear, setSelectedYear] = useState<string>(currentYear)
    const [customStartDate, setCustomStartDate] = useState<string>(
        `${currentYear}-01-01`
    )
    const [customEndDate, setCustomEndDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    )

    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [punching, setPunching] = useState(false)
    const [downloadingPdf, setDownloadingPdf] = useState(false)

    // ── Live Geofence Radar State ─────────────────────────────────────────────
    const [geoStatus, setGeoStatus] = useState<{
        latitude: number | null
        longitude: number | null
        distanceMeters: number | null
        isInside: boolean
        isDetecting: boolean
        error: string | null
        autoPunchedSuccess: boolean
    }>({
        latitude: null,
        longitude: null,
        distanceMeters: null,
        isInside: false,
        isDetecting: false,
        error: null,
        autoPunchedSuccess: false
    })

    // ── Fetch Attendance Data based on selected filter ────────────────────────
    const fetchAttendance = useCallback(async () => {
        try {
            setLoading(true)
            let queryUrl = "/api/staff/attendance?"

            if (filterMode === "THIS_MONTH") {
                queryUrl += `month=${currentMonth}`
            } else if (filterMode === "LAST_MONTH") {
                const d = new Date()
                d.setMonth(d.getMonth() - 1)
                const lastMonthStr = d.toISOString().slice(0, 7)
                queryUrl += `month=${lastMonthStr}`
            } else if (filterMode === "YEAR") {
                queryUrl += `year=${selectedYear}`
            } else if (filterMode === "CUSTOM") {
                queryUrl += `startDate=${customStartDate}&endDate=${customEndDate}`
            }

            const res = await fetch(queryUrl)
            if (res.ok) {
                const result = await res.json()
                if (result.success) {
                    setData(result)
                    return result
                }
            }
        } catch (err) {
            console.error("Attendance fetch error:", err)
        } finally {
            setLoading(false)
        }
        return null
    }, [filterMode, selectedYear, customStartDate, customEndDate, currentMonth])

    // Geolocation check and auto punch
    const checkLocationAndAutoPunch = useCallback((shopLat?: number | null, shopLng?: number | null, radius = 150, autoEnabled = true, alreadyPunched = false) => {
        if (typeof window === "undefined" || !navigator.geolocation) {
            setGeoStatus(prev => ({ ...prev, error: "Geolocation not supported" }))
            return
        }

        setGeoStatus(prev => ({ ...prev, isDetecting: true, error: null }))

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const staffLat = pos.coords.latitude
                const staffLng = pos.coords.longitude
                let dist: number | null = null
                let inside = false

                if (shopLat && shopLng) {
                    dist = calculateDistanceMeters(staffLat, staffLng, shopLat, shopLng)
                    inside = dist <= radius
                }

                setGeoStatus(prev => ({
                    ...prev,
                    latitude: staffLat,
                    longitude: staffLng,
                    distanceMeters: dist,
                    isInside: inside,
                    isDetecting: false,
                    error: null
                }))

                // If inside perimeter & auto attendance enabled & not checked in yet today:
                if (inside && autoEnabled && !alreadyPunched) {
                    try {
                        const res = await fetch("/api/staff/punch", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                action: "PUNCH_IN",
                                latitude: staffLat,
                                longitude: staffLng,
                                isAuto: true
                            })
                        })
                        const resData = await res.json()
                        if (resData.success && !resData.skipped) {
                            setGeoStatus(prev => ({ ...prev, autoPunchedSuccess: true }))
                            fetchAttendance()
                        }
                    } catch (err) {
                        console.error("Auto punch error:", err)
                    }
                }
            },
            (err) => {
                setGeoStatus(prev => ({
                    ...prev,
                    isDetecting: false,
                    error: err.code === 1 ? "Location permission denied" : "Unable to acquire GPS"
                }))
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        )
    }, [fetchAttendance])

    useEffect(() => {
        fetchAttendance().then((res) => {
            if (res && res.shopGeofence) {
                const sg = res.shopGeofence
                const todayStr = new Date().toISOString().split("T")[0]
                const todayRec = res.records?.find((r: any) => r.date === todayStr)
                const isPunched = todayRec?.status === "PRESENT" && !!todayRec?.checkIn
                if (sg.latitude && sg.longitude) {
                    checkLocationAndAutoPunch(
                        sg.latitude,
                        sg.longitude,
                        sg.radius || 150,
                        sg.autoAttendanceEnabled ?? true,
                        isPunched
                    )
                }
            }
        })
    }, [fetchAttendance, checkLocationAndAutoPunch])

    // Handle Quick Punch
    const handlePunch = async (action: "PUNCH_IN" | "PUNCH_OUT") => {
        try {
            setPunching(true)
            const payload: any = { action }
            if (geoStatus.latitude && geoStatus.longitude) {
                payload.latitude = geoStatus.latitude
                payload.longitude = geoStatus.longitude
            }

            const res = await fetch("/api/staff/punch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                const result = await res.json()
                if (result.success) {
                    fetchAttendance()
                } else {
                    alert(result.error || "Punch failed")
                }
            } else {
                alert("Punch action failed (" + res.status + ")")
            }
        } catch (err) {
            console.error("Punch error:", err)
        } finally {
            setPunching(false)
        }
    }

    // ── Export to CSV (Excel Download) ─────────────────────────────────────────
    const handleExportCSV = () => {
        if (!data?.records || data.records.length === 0) {
            alert("No records to export")
            return
        }

        const headers = ["Date", "Day", "Status", "Check In", "Check Out", "Hours Worked", "Punch Method", "Distance", "Notes"]
        const rows = data.records.map((r: any) => {
            const dateObj = new Date(r.date)
            const dayName = isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleDateString("en-IN", { weekday: "short" })
            const duration = (r.checkIn && r.checkOut) ? calculateDuration(r.checkIn, r.checkOut) : "--"
            const dist = r.distanceMeters !== null && r.distanceMeters !== undefined ? `${r.distanceMeters}m` : "--"
            return [
                r.date,
                dayName,
                r.status,
                r.checkIn || "--",
                r.checkOut || "--",
                duration,
                r.punchMethod || "MANUAL",
                dist,
                `"${(r.notes || "").replace(/"/g, '""')}"`
            ].join(",")
        })

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        const staffName = data?.staffInfo?.name ? data.staffInfo.name.replace(/\s+/g, "_") : "staff"
        link.setAttribute("download", `attendance_${staffName}_${data.periodLabel || "report"}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // ── Direct Download PDF Handler (No print modal, direct file download) ───
    const handleDownloadPDF = async () => {
        if (!data?.records || data.records.length === 0) {
            alert("No attendance records found for this period to download.")
            return
        }
        try {
            setDownloadingPdf(true)
            const { downloadAttendancePDF } = await import("@/lib/attendance/pdf-generator")
            downloadAttendancePDF({
                periodLabel: data.periodLabel || "Report",
                staffInfo: data.staffInfo,
                stats: stats,
                records: data.records
            })
        } catch (err) {
            console.error("PDF download error:", err)
            alert("Failed to generate PDF. Please try again.")
        } finally {
            setDownloadingPdf(false)
        }
    }

    // ── Optional Browser Print Handler ───────────────────────────────────────
    const handlePrint = () => {
        window.print()
    }

    // Filtered Records
    const filteredRecords = useMemo(() => {
        if (!data?.records) return []
        if (statusFilter === "ALL") return data.records
        return data.records.filter((r: any) => r.status === statusFilter)
    }, [data?.records, statusFilter])

    const todayDateStr = new Date().toISOString().split("T")[0]
    const todayRecord = data?.records?.find((r: any) => r.date === todayDateStr)
    const isPunchedIn = todayRecord?.status === "PRESENT" && !!todayRecord?.checkIn
    const isPunchedOut = isPunchedIn && !!todayRecord?.checkOut
    const shopLocationConfigured = !!(data?.shopGeofence?.latitude && data?.shopGeofence?.longitude)

    const staffInfo = data?.staffInfo || null
    const stats = data?.stats || {
        totalLoggedDays: 0,
        presentDays: 0,
        halfDays: 0,
        absentDays: 0,
        leaveDays: 0,
        totalPayableDays: 0,
        totalHoursWorked: 0,
        attendancePercentage: 0
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">

            {/* ── PRINT-ONLY STYLED REPORT HEADER (Visible only during printing) ── */}
            <div className="hidden print:block mb-8 p-6 bg-white text-black border border-black">
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-black">{staffInfo?.shopName || "Detailing Garage"}</h1>
                        <p className="text-sm text-gray-600">{staffInfo?.shopAddress} {staffInfo?.shopCity}</p>
                        <p className="text-sm text-gray-600">Phone: {staffInfo?.shopPhone || "—"}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs uppercase font-bold tracking-widest text-gray-500">Official Attendance Slip</span>
                        <h2 className="text-lg font-bold text-gray-900 mt-1">{staffInfo?.name}</h2>
                        <p className="text-sm text-gray-600">{staffInfo?.role}</p>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center border-b pb-4 mb-4">
                    <div className="p-2 border">
                        <span className="text-xs text-gray-500 block">Report Period</span>
                        <strong className="text-sm">{data?.periodLabel || "Custom"}</strong>
                    </div>
                    <div className="p-2 border">
                        <span className="text-xs text-gray-500 block">Present Days</span>
                        <strong className="text-sm text-green-700">{stats.presentDays} Days</strong>
                    </div>
                    <div className="p-2 border">
                        <span className="text-xs text-gray-500 block">Half Days</span>
                        <strong className="text-sm text-amber-700">{stats.halfDays} Days</strong>
                    </div>
                    <div className="p-2 border">
                        <span className="text-xs text-gray-500 block">Total Payable Days</span>
                        <strong className="text-sm text-blue-700">{stats.totalPayableDays} Days</strong>
                    </div>
                </div>
            </div>

            {/* ── Top Header Bar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#16acd4] uppercase tracking-wider mb-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{staffInfo?.shopName || "Workshop"}</span>
                        <span className="text-zinc-600">•</span>
                        <span>{staffInfo?.name || "Staff"}</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <span>Attendance &amp; Work Report</span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Track your daily attendance, working hours, and download reports for any month or year
                    </p>
                </div>

                {/* Report Download Actions */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={handleExportCSV}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold bg-[#131316] hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                        title="Direct download attendance as Excel / CSV file"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span>Download Excel</span>
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloadingPdf}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold bg-[#16acd4] hover:bg-[#16acd4]/90 text-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#16acd4]/20 active:scale-95 disabled:opacity-60"
                        title="Direct download official Attendance PDF report"
                    >
                        {downloadingPdf ? (
                            <RefreshCw className="w-4 h-4 text-black animate-spin" />
                        ) : (
                            <ArrowDownToLine className="w-4 h-4 text-black stroke-[2.5]" />
                        )}
                        <span>{downloadingPdf ? "Generating..." : "Download PDF"}</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-3 py-2.5 rounded-xl text-xs font-bold bg-[#131316] hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
                        title="Print slip using physical printer"
                    >
                        <Printer className="w-4 h-4 text-zinc-300" />
                        <span className="hidden lg:inline text-[11px]">Print</span>
                    </button>
                </div>
            </div>

            {/* ── PERIOD SELECTION BAR (This Month, Last Month, Year, Custom) ── */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#121216] border border-white/10 shadow-xl print:hidden space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-[#16acd4]" />
                        <span>Select Report Period:</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Viewing: <b>{data?.periodLabel || "Current Month"}</b>
                    </span>
                </div>

                {/* Filter Mode Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                        onClick={() => setFilterMode("THIS_MONTH")}
                        className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-center border ${
                            filterMode === "THIS_MONTH"
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10"
                                : "bg-white/5 border-white/8 text-zinc-400 hover:text-white hover:bg-white/8"
                        }`}
                    >
                        📅 This Month
                        <span className="block text-[10px] opacity-70 mt-0.5 font-normal">Current Month</span>
                    </button>

                    <button
                        onClick={() => setFilterMode("LAST_MONTH")}
                        className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-center border ${
                            filterMode === "LAST_MONTH"
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10"
                                : "bg-white/5 border-white/8 text-zinc-400 hover:text-white hover:bg-white/8"
                        }`}
                    >
                        ⏮️ Last Month
                        <span className="block text-[10px] opacity-70 mt-0.5 font-normal">Previous Month</span>
                    </button>

                    <button
                        onClick={() => setFilterMode("YEAR")}
                        className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-center border ${
                            filterMode === "YEAR"
                                ? "bg-[#16acd4]/20 border-[#16acd4]/50 text-[#16acd4] shadow-lg shadow-[#16acd4]/10"
                                : "bg-white/5 border-white/8 text-zinc-400 hover:text-white hover:bg-white/8"
                        }`}
                    >
                        🗓️ Full Year ({selectedYear})
                        <span className="block text-[10px] opacity-70 mt-0.5 font-normal">Annual Report</span>
                    </button>

                    <button
                        onClick={() => setFilterMode("CUSTOM")}
                        className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-center border ${
                            filterMode === "CUSTOM"
                                ? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-lg shadow-purple-500/10"
                                : "bg-white/5 border-white/8 text-zinc-400 hover:text-white hover:bg-white/8"
                        }`}
                    >
                        🎯 Custom Range
                        <span className="block text-[10px] opacity-70 mt-0.5 font-normal">Date Range</span>
                    </button>
                </div>

                {/* Sub-inputs when Year or Custom selected */}
                {filterMode === "YEAR" && (
                    <div className="pt-2 flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-zinc-400 font-medium">Select Year:</span>
                        <div className="flex items-center gap-2">
                            {["2026", "2025", "2024"].map((yr) => (
                                <button
                                    key={yr}
                                    onClick={() => setSelectedYear(yr)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                        selectedYear === yr
                                            ? "bg-[#16acd4] text-black border-[#16acd4]"
                                            : "bg-white/5 border-white/10 text-zinc-300 hover:text-white"
                                    }`}
                                >
                                    {yr}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {filterMode === "CUSTOM" && (
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/30 p-3 rounded-2xl border border-white/5">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                                From Date:
                            </label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={e => setCustomStartDate(e.target.value)}
                                className="w-full bg-[#18181c] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#16acd4]"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                                To Date:
                            </label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={e => setCustomEndDate(e.target.value)}
                                className="w-full bg-[#18181c] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#16acd4]"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Auto-Punch Celebration Banner */}
            {(geoStatus.autoPunchedSuccess || todayRecord?.punchMethod === "AUTO_GEOFENCE") && (
                <div className="p-4 sm:p-5 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl animate-fade-in print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                            <Sparkles className="w-5 h-5 text-emerald-300 animate-spin" />
                        </div>
                        <div>
                            <span className="font-black text-white">Auto Attendance Punched!</span>
                            <p className="text-xs text-emerald-300/80 mt-0.5">
                                You entered workshop geofence ({formatDistance(todayRecord?.distanceMeters || geoStatus.distanceMeters)} away). Checked in at {todayRecord?.checkIn || "Just now"}.
                            </p>
                        </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black bg-emerald-500 text-black shrink-0">
                        GPS VERIFIED
                    </span>
                </div>
            )}

            {/* Quick Punch Bar (Today's check-in / check-out) */}
            <div className="p-5 rounded-3xl bg-[#121216] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">Today's Punch Status</h4>
                            {todayRecord?.punchMethod === "AUTO_GEOFENCE" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <Sparkles className="w-3 h-3 text-emerald-400" />
                                    <span>Auto GPS Geofence</span>
                                </span>
                            )}
                            {todayRecord?.punchMethod === "GPS_VERIFIED" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16acd4]/15 text-[#16acd4] border border-[#16acd4]/30">
                                    <MapPin className="w-3 h-3" />
                                    <span>GPS Verified</span>
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            {todayRecord?.checkIn ? `Checked in at ${todayRecord.checkIn}` : "Not yet punched in today"}
                            {todayRecord?.checkOut && ` • Checked out at ${todayRecord.checkOut}`}
                        </p>
                    </div>
                </div>

                <div>
                    {!isPunchedIn ? (
                        <button
                            onClick={() => handlePunch("PUNCH_IN")}
                            disabled={punching}
                            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                        >
                            <Play className="w-4 h-4 fill-black" />
                            <span>Punch In</span>
                        </button>
                    ) : !isPunchedOut ? (
                        <button
                            onClick={() => handlePunch("PUNCH_OUT")}
                            disabled={punching}
                            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-rose-500/20"
                        >
                            <Check className="w-4 h-4" />
                            <span>Punch Out</span>
                        </button>
                    ) : (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                            ✓ Shift Completed
                        </span>
                    )}
                </div>
            </div>

            {/* ── KEY ATTENDANCE REPORT STATS (Simple & Clear) ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4">
                {/* 1. Payable Days */}
                <div className="p-4.5 rounded-2xl bg-[#121216] border border-white/8 relative overflow-hidden">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Payable Days
                    </span>
                    <div className="flex items-baseline gap-1.5">
                        <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalPayableDays}</p>
                        <span className="text-xs font-semibold text-[#16acd4]">Days</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-1">Salary computation basis</span>
                </div>

                {/* 2. Full Present */}
                <div className="p-4.5 rounded-2xl bg-[#121216] border border-white/8 relative overflow-hidden">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Present Days
                    </span>
                    <div className="flex items-baseline gap-1.5">
                        <p className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.presentDays}</p>
                        <span className="text-xs font-semibold text-zinc-500">of {stats.totalLoggedDays}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-1">Full shifts attended</span>
                </div>

                {/* 3. Half Days */}
                <div className="p-4.5 rounded-2xl bg-[#121216] border border-white/8 relative overflow-hidden">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Half Days
                    </span>
                    <div className="flex items-baseline gap-1.5">
                        <p className="text-2xl sm:text-3xl font-black text-amber-400">{stats.halfDays}</p>
                        <span className="text-xs font-semibold text-zinc-500">Days</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-1">0.5 day credit</span>
                </div>

                {/* 4. Total Hours / Leaves */}
                <div className="p-4.5 rounded-2xl bg-[#121216] border border-white/8 relative overflow-hidden">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Hours &amp; Time Off
                    </span>
                    <div className="flex items-baseline gap-1.5">
                        <p className="text-2xl sm:text-3xl font-black text-purple-400">{stats.totalHoursWorked || 0}h</p>
                        <span className="text-xs font-semibold text-rose-400">({stats.absentDays + stats.leaveDays} Off)</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-1">{stats.attendancePercentage}% Attendance Rate</span>
                </div>
            </div>

            {/* ── DAILY ATTENDANCE LOG TABLE & CARDS ── */}
            <div className="rounded-3xl bg-[#121216] border border-white/10 overflow-hidden shadow-xl">
                {/* Header with status filter tabs */}
                <div className="p-4 sm:p-5 border-b border-white/8 bg-[#15151a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                            <span>Daily Attendance Log</span>
                            <span className="text-zinc-500 font-mono text-xs">({filteredRecords.length} Days)</span>
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                            Period: <strong className="text-white">{data?.periodLabel || "All"}</strong>
                        </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 print:hidden">
                        {[
                            { key: "ALL", label: `All (${data?.records?.length || 0})` },
                            { key: "PRESENT", label: `Present (${stats.presentDays})` },
                            { key: "HALF_DAY", label: `Half Day (${stats.halfDays})` },
                            { key: "ABSENT", label: `Absent (${stats.absentDays})` },
                            { key: "LEAVE", label: `Leave (${stats.leaveDays})` },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                                    statusFilter === tab.key
                                        ? "bg-white text-black border-white"
                                        : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 flex flex-col items-center justify-center text-zinc-500">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#16acd4] mb-2" />
                        <p className="text-xs font-bold uppercase">Loading Attendance Records...</p>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="py-16 text-center p-6 text-zinc-500">
                        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-bold text-white">No attendance records found</p>
                        <p className="text-xs text-zinc-500 mt-1">
                            No attendance records found for the selected period ({data?.periodLabel}).
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredRecords.map((rec: any) => {
                            const dateObj = new Date(rec.date)
                            const dayName = isNaN(dateObj.getTime())
                                ? ""
                                : dateObj.toLocaleDateString("en-IN", { weekday: "long" })
                            const formattedDate = isNaN(dateObj.getTime())
                                ? rec.date
                                : dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

                            const duration = (rec.checkIn && rec.checkOut)
                                ? calculateDuration(rec.checkIn, rec.checkOut)
                                : null

                            return (
                                <div
                                    key={rec.id}
                                    className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                                >
                                    {/* Left: Date + Day + Status Badges */}
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <span className="font-bold text-sm text-white">{formattedDate}</span>
                                            <span className="text-xs text-zinc-500 font-medium">({dayName})</span>

                                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                                rec.status === "PRESENT"
                                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                    : rec.status === "HALF_DAY"
                                                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                                    : rec.status === "LEAVE"
                                                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                                    : "bg-red-500/15 text-red-400 border border-red-500/30"
                                            }`}>
                                                {rec.status === "PRESENT" ? "✓ Present" : rec.status === "HALF_DAY" ? "½ Half Day" : rec.status === "LEAVE" ? "Off / Leave" : "✗ Absent"}
                                            </span>

                                            {rec.punchMethod === "AUTO_GEOFENCE" && (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                                                    <span>Auto GPS Geofence {rec.distanceMeters !== null && rec.distanceMeters !== undefined ? `(${rec.distanceMeters}m)` : ''}</span>
                                                </span>
                                            )}
                                            {rec.punchMethod === "GPS_VERIFIED" && (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16acd4]/15 text-[#16acd4] border border-[#16acd4]/30">
                                                    <MapPin className="w-2.5 h-2.5" />
                                                    <span>GPS Verified</span>
                                                </span>
                                            )}
                                        </div>

                                        {rec.notes && <p className="text-[11px] text-zinc-400">{rec.notes}</p>}
                                    </div>

                                    {/* Right: In / Out / Duration */}
                                    <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-center">
                                        <div className="text-right">
                                            <div className="text-zinc-400">
                                                In: <b className="text-white font-mono">{rec.checkIn || "--:--"}</b>
                                            </div>
                                            <div className="text-zinc-400">
                                                Out: <b className="text-zinc-300 font-mono">{rec.checkOut || "--:--"}</b>
                                            </div>
                                        </div>

                                        {duration && (
                                            <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/8 text-right font-mono text-[11px] font-bold text-zinc-300">
                                                <Timer className="w-3 h-3 text-[#16acd4] inline mr-1" />
                                                {duration}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ── PRINT-ONLY SIGNATURE SECTION (Shown on Print PDF) ── */}
            <div className="hidden print:block mt-16 pt-8 border-t text-sm">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="w-48 border-b border-black mb-2"></div>
                        <p className="font-bold">Staff Signature</p>
                        <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                        <div className="w-48 border-b border-black mb-2 ml-auto"></div>
                        <p className="font-bold">Authorized Workshop Signature / Stamp</p>
                        <p className="text-xs text-gray-500">Paramhans Auto Store</p>
                    </div>
                </div>
            </div>

            {/* Print Style Fix */}
            <style jsx global>{`
                @media print {
                    body {
                        background: #ffffff !important;
                        color: #000000 !important;
                    }
                    nav, aside, footer, header {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    )
}

// Helper to calculate human readable duration between two time strings
function calculateDuration(time1: string, time2: string): string {
    try {
        const parseTime = (t: string) => {
            const parts = t.trim().match(/(\d+):(\d+)\s*(AM|PM)/i)
            if (!parts) return null
            let hours = parseInt(parts[1], 10)
            const minutes = parseInt(parts[2], 10)
            const modifier = parts[3].toUpperCase()
            if (modifier === "PM" && hours < 12) hours += 12
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
