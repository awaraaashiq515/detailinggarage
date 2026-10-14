"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
    Calendar, Users, CheckCircle2, Clock, Check, X,
    ChevronLeft, ChevronRight, RefreshCw, Printer, AlertCircle,
    UserCheck, FileText, ArrowRight, Sparkles, Filter,
    HelpCircle, Sun, Moon, CalendarDays, BarChart3, TrendingUp,
    MapPin, Radio, Navigation, LocateFixed, ExternalLink
} from "lucide-react"

type StaffMember = {
    id: string
    name: string
    phone: string | null
    role: string
    specialization: string | null
    salaryType: string
    salary: number
    status: string
}

type AttendanceRecord = {
    id: string
    staffId: string
    date: string
    status: "PRESENT" | "HALF_DAY" | "ABSENT" | "LEAVE"
    checkIn: string | null
    checkOut: string | null
    notes: string | null
    punchMethod?: string | null
    distanceMeters?: number | null
    latitude?: number | null
    longitude?: number | null
    staff?: {
        id: string
        name: string
        role: string
        phone: string | null
    }
}

type StaffRowData = {
    status: "PRESENT" | "HALF_DAY" | "ABSENT" | "LEAVE"
    checkIn: string
    checkOut: string
    notes: string
    punchMethod?: string | null
    distanceMeters?: number | null
    latitude?: number | null
    longitude?: number | null
    isSaved: boolean
}

type ShopGeofenceState = {
    latitude: number | null
    longitude: number | null
    geofenceRadius: number
    autoAttendanceEnabled: boolean
    name?: string
}

export default function StaffAttendancePage() {
    const todayStr = new Date().toISOString().split("T")[0]
    const [selectedDate, setSelectedDate] = useState<string>(todayStr)
    const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily")
    const [selectedMonth, setSelectedMonth] = useState<string>(todayStr.substring(0, 7)) // YYYY-MM

    const [staffList, setStaffList] = useState<StaffMember[]>([])
    const [attendanceMap, setAttendanceMap] = useState<Record<string, StaffRowData>>({})
    const [loadingDaily, setLoadingDaily] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    // Geofence state
    const [geofence, setGeofence] = useState<ShopGeofenceState>({
        latitude: null,
        longitude: null,
        geofenceRadius: 150,
        autoAttendanceEnabled: true
    })
    const [loadingGeofence, setLoadingGeofence] = useState(false)
    const [savingGeofence, setSavingGeofence] = useState(false)
    const [detectingGps, setDetectingGps] = useState(false)
    const [geofenceMessage, setGeofenceMessage] = useState<{ type: "success" | "error" | "info", text: string } | null>(null)
    const [showGeofenceSettings, setShowGeofenceSettings] = useState(false)

    // Monthly data
    const [monthlyRecords, setMonthlyRecords] = useState<AttendanceRecord[]>([])
    const [loadingMonthly, setLoadingMonthly] = useState(false)

    // Format current time as "09:30 AM"
    const getCurrentTimeString = () => {
        const now = new Date()
        let hours = now.getHours()
        const minutes = now.getMinutes().toString().padStart(2, "0")
        const ampm = hours >= 12 ? "PM" : "AM"
        hours = hours % 12
        hours = hours ? hours : 12
        return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`
    }

    // Load geofence settings
    const loadGeofenceSettings = useCallback(async () => {
        try {
            setLoadingGeofence(true)
            const res = await fetch("/api/shop/billing/staff/geofence")
            if (res.ok) {
                const data = await res.json()
                if (data.shop) {
                    setGeofence({
                        latitude: data.shop.latitude !== null && data.shop.latitude !== undefined ? Number(data.shop.latitude) : null,
                        longitude: data.shop.longitude !== null && data.shop.longitude !== undefined ? Number(data.shop.longitude) : null,
                        geofenceRadius: data.shop.geofenceRadius || 150,
                        autoAttendanceEnabled: data.shop.autoAttendanceEnabled ?? true,
                        name: data.shop.name
                    })
                }
            }
        } catch (err) {
            console.error("Failed to load geofence:", err)
        } finally {
            setLoadingGeofence(false)
        }
    }, [])

    // Load staff and daily attendance
    const loadDailyAttendance = useCallback(async (date: string) => {
        try {
            setLoadingDaily(true)
            const [staffRes, attRes] = await Promise.all([
                fetch("/api/shop/billing/staff"),
                fetch(`/api/shop/billing/staff/attendance?date=${date}`)
            ])

            const staffData = await staffRes.json()
            const attData = await attRes.json()

            const staff: StaffMember[] = staffData.staff || []
            const records: AttendanceRecord[] = attData.records || []
            setStaffList(staff)

            const map: Record<string, StaffRowData> = {}
            staff.forEach(s => {
                const existing = records.find(r => r.staffId === s.id)
                if (existing) {
                    map[s.id] = {
                        status: existing.status,
                        checkIn: existing.checkIn || "09:30 AM",
                        checkOut: existing.checkOut || "07:30 PM",
                        notes: existing.notes || "",
                        punchMethod: existing.punchMethod || null,
                        distanceMeters: existing.distanceMeters !== undefined ? existing.distanceMeters : null,
                        latitude: existing.latitude !== undefined ? existing.latitude : null,
                        longitude: existing.longitude !== undefined ? existing.longitude : null,
                        isSaved: true
                    }
                } else {
                    map[s.id] = {
                        status: "PRESENT",
                        checkIn: "09:30 AM",
                        checkOut: "07:30 PM",
                        notes: "",
                        punchMethod: null,
                        distanceMeters: null,
                        latitude: null,
                        longitude: null,
                        isSaved: false
                    }
                }
            })
            setAttendanceMap(map)
        } catch (err) {
            console.error("Failed to load attendance:", err)
        } finally {
            setLoadingDaily(false)
        }
    }, [])

    // Load monthly records
    const loadMonthlyAttendance = useCallback(async (month: string) => {
        try {
            setLoadingMonthly(true)
            const res = await fetch(`/api/shop/billing/staff/attendance?month=${month}`)
            const data = await res.json()
            if (data.success) {
                setMonthlyRecords(data.records || [])
            }
        } catch (err) {
            console.error("Failed to load monthly attendance:", err)
        } finally {
            setLoadingMonthly(false)
        }
    }, [])

    useEffect(() => {
        loadGeofenceSettings()
    }, [loadGeofenceSettings])

    useEffect(() => {
        loadDailyAttendance(selectedDate)
    }, [selectedDate, loadDailyAttendance])

    useEffect(() => {
        if (viewMode === "monthly") {
            loadMonthlyAttendance(selectedMonth)
        }
    }, [viewMode, selectedMonth, loadMonthlyAttendance])

    // Date change navigation
    const changeDateByDays = (days: number) => {
        const d = new Date(selectedDate)
        d.setDate(d.getDate() + days)
        setSelectedDate(d.toISOString().split("T")[0])
    }

    // Status change
    const updateStaffStatus = (staffId: string, status: "PRESENT" | "HALF_DAY" | "ABSENT" | "LEAVE") => {
        setAttendanceMap(prev => ({
            ...prev,
            [staffId]: {
                ...(prev[staffId] || { checkIn: "09:30 AM", checkOut: "07:30 PM", notes: "", isSaved: false }),
                status,
                isSaved: false
            }
        }))
    }

    // CheckIn/CheckOut update
    const updateStaffField = (staffId: string, field: "checkIn" | "checkOut" | "notes", val: string) => {
        setAttendanceMap(prev => ({
            ...prev,
            [staffId]: {
                ...(prev[staffId] || { status: "PRESENT", checkIn: "09:30 AM", checkOut: "07:30 PM", notes: "", isSaved: false }),
                [field]: val,
                isSaved: false
            }
        }))
    }

    // Set current time to check in/out
    const setStaffTimeNow = (staffId: string, field: "checkIn" | "checkOut") => {
        const timeNow = getCurrentTimeString()
        updateStaffField(staffId, field, timeNow)
    }

    // Bulk actions
    const handleMarkAllPresent = () => {
        setAttendanceMap(prev => {
            const next = { ...prev }
            staffList.filter(s => s.status === "ACTIVE").forEach(s => {
                next[s.id] = {
                    ...(next[s.id] || { checkIn: "09:30 AM", checkOut: "07:30 PM", notes: "" }),
                    status: "PRESENT",
                    isSaved: false
                }
            })
            return next
        })
    }

    const handleFillStandardTimes = () => {
        setAttendanceMap(prev => {
            const next = { ...prev }
            staffList.forEach(s => {
                next[s.id] = {
                    ...(next[s.id] || { status: "PRESENT", notes: "" }),
                    checkIn: "09:30 AM",
                    checkOut: "07:30 PM",
                    isSaved: false
                }
            })
            return next
        })
    }

    // Save Attendance
    const handleSaveAttendance = async () => {
        try {
            setSaving(true)
            const records = Object.entries(attendanceMap).map(([staffId, data]) => ({
                staffId,
                date: selectedDate,
                status: data.status,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                notes: data.notes
            }))

            const res = await fetch("/api/shop/billing/staff/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ records })
            })
            const data = await res.json()

            if (data.success) {
                setSaveSuccess(true)
                setTimeout(() => setSaveSuccess(false), 3000)
                // Mark all as saved
                setAttendanceMap(prev => {
                    const next = { ...prev }
                    Object.keys(next).forEach(k => {
                        next[k].isSaved = true
                    })
                    return next
                })
            } else {
                alert(data.error || "Failed to save attendance")
            }
        } catch (err) {
            console.error("Save error:", err)
            alert("Error saving attendance")
        } finally {
            setSaving(false)
        }
    }

    // Detect Current Workshop GPS via browser
    const handleDetectCurrentLocation = () => {
        if (typeof window === "undefined" || !navigator.geolocation) {
            setGeofenceMessage({ type: "error", text: "Geolocation is not supported by your browser." })
            return
        }
        setDetectingGps(true)
        setGeofenceMessage({ type: "info", text: "Acquiring high-accuracy GPS coordinates..." })

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = Number(pos.coords.latitude.toFixed(6))
                const lng = Number(pos.coords.longitude.toFixed(6))
                setGeofence(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                }))
                setDetectingGps(false)
                setGeofenceMessage({
                    type: "success",
                    text: `📍 Workshop GPS detected: ${lat}, ${lng} (Accuracy: ~${Math.round(pos.coords.accuracy)}m). Click "Save Workshop Location" to activate.`
                })
            },
            (err) => {
                setDetectingGps(false)
                setGeofenceMessage({
                    type: "error",
                    text: `Location access error (${err.message}). You can manually enter Latitude and Longitude.`
                })
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        )
    }

    // Save Geofence Settings
    const handleSaveGeofence = async () => {
        try {
            setSavingGeofence(true)
            const res = await fetch("/api/shop/billing/staff/geofence", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(geofence)
            })
            const data = await res.json()
            if (data.success) {
                setGeofenceMessage({
                    type: "success",
                    text: "✓ Workshop Geofence & Auto Attendance settings saved successfully!"
                })
                setTimeout(() => setGeofenceMessage(null), 6000)
            } else {
                setGeofenceMessage({
                    type: "error",
                    text: data.error || "Failed to update geofence."
                })
            }
        } catch (err) {
            console.error("Save geofence error:", err)
            setGeofenceMessage({ type: "error", text: "Server error saving geofence settings." })
        } finally {
            setSavingGeofence(false)
        }
    }

    // Metric counts for selected day
    const activeStaff = staffList.filter(s => s.status === "ACTIVE")
    const presentCount = activeStaff.filter(s => attendanceMap[s.id]?.status === "PRESENT").length
    const halfDayCount = activeStaff.filter(s => attendanceMap[s.id]?.status === "HALF_DAY").length
    const absentCount = activeStaff.filter(s => attendanceMap[s.id]?.status === "ABSENT").length
    const leaveCount = activeStaff.filter(s => attendanceMap[s.id]?.status === "LEAVE").length
    const totalMarked = presentCount + halfDayCount + absentCount + leaveCount
    const attendancePercentage = activeStaff.length > 0 ? Math.round(((presentCount + halfDayCount * 0.5) / activeStaff.length) * 100) : 0

    // Format readable date
    const formattedDisplayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    })

    // Calculate days in selected month for Muster Roll
    const [yearPart, monthPart] = selectedMonth.split("-").map(Number)
    const daysInMonth = new Date(yearPart, monthPart, 0).getDate()

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Shop Portal</span>
                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                        <Link href="/shop/billing" className="text-zinc-500 hover:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                            Billing
                        </Link>
                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                        <Link href="/shop/billing/staff" className="text-zinc-500 hover:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                            Staff
                        </Link>
                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                        <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Attendance</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Staff Attendance Register</h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                            Auto GPS Geofence &amp; Muster Roll
                        </span>
                    </div>
                    <p className="text-zinc-400 text-sm mt-1">
                        Auto attendance logging via workshop GPS perimeter, daily check-in/out, and monthly payroll muster roll
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* View Switcher */}
                    <div className="flex items-center bg-[#17171a] p-1 rounded-2xl border border-white/10">
                        <button
                            onClick={() => setViewMode("daily")}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                viewMode === "daily"
                                    ? "bg-[#16acd4] text-black shadow-lg"
                                    : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            <Calendar className="w-3.5 h-3.5" /> Daily Register
                        </button>
                        <button
                            onClick={() => setViewMode("monthly")}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                viewMode === "monthly"
                                    ? "bg-[#16acd4] text-black shadow-lg"
                                    : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            <BarChart3 className="w-3.5 h-3.5" /> Monthly Muster Roll
                        </button>
                    </div>

                    {viewMode === "daily" && (
                        <button
                            onClick={handleSaveAttendance}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            <span>Save Attendance</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Success Toast */}
            {saveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-xl animate-fade-in">
                    <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>Attendance for {formattedDisplayDate} saved and synced successfully!</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">SYNCED</span>
                </div>
            )}

            {/* ── WORKSHOP GEOFENCE & AUTO-ATTENDANCE CONTROL CARD ── */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#141419] via-[#101014] to-[#0c0c0e] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#16acd4]/10 blur-3xl -z-10 rounded-full" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left: Info & Live Status */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-[#16acd4]/15 border border-[#16acd4]/30 text-[#16acd4] flex items-center justify-center shrink-0">
                                <Radio className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                                    <span>Workshop Geofence &amp; Auto Attendance</span>
                                    {geofence.latitude && geofence.longitude ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            ● GPS Active
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                            GPS Not Set
                                        </span>
                                    )}
                                </h3>
                                <p className="text-xs text-zinc-400">
                                    Staff members entering this workshop perimeter are automatically punched in on their portal.
                                </p>
                            </div>
                        </div>

                        {/* Location Details Badges */}
                        <div className="flex items-center gap-2.5 flex-wrap pt-1 text-xs">
                            {geofence.latitude && geofence.longitude ? (
                                <>
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-mono text-[11px]">
                                        <MapPin className="w-3.5 h-3.5 text-[#16acd4]" />
                                        <span>{geofence.latitude.toFixed(5)}, {geofence.longitude.toFixed(5)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-[11px] font-semibold">
                                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Perimeter: <b className="text-white">{geofence.geofenceRadius}m</b> radius</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px]">
                                        <span className={`w-2 h-2 rounded-full ${geofence.autoAttendanceEnabled ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
                                        <span className="text-zinc-300 font-semibold">
                                            Auto-Punch: <b className={geofence.autoAttendanceEnabled ? 'text-emerald-400' : 'text-zinc-400'}>
                                                {geofence.autoAttendanceEnabled ? 'ENABLED' : 'PAUSED'}
                                            </b>
                                        </span>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps?q=${geofence.latitude},${geofence.longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1 text-[11px] font-bold text-[#16acd4] hover:underline px-2 py-1"
                                    >
                                        <span>View Pin</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </>
                            ) : (
                                <div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span>Workshop coordinates needed. Click "Detect My Current Location" below while at your studio.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Toggle Setup Panel Button */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            onClick={() => setShowGeofenceSettings(!showGeofenceSettings)}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 ${
                                showGeofenceSettings
                                    ? "bg-white/15 text-white border-white/20"
                                    : "bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 hover:text-white"
                            }`}
                        >
                            <LocateFixed className="w-4 h-4 text-[#16acd4]" />
                            <span>{showGeofenceSettings ? "Hide Location Setup" : "Edit Workshop Location"}</span>
                        </button>
                    </div>
                </div>

                {/* Expandable Geofence Editor */}
                {showGeofenceSettings && (
                    <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                        {/* 1. GPS Auto-Detect Button */}
                        <div className="p-4 rounded-2xl bg-[#17171d] border border-white/8 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                                Quick GPS Detection
                            </span>
                            <button
                                onClick={handleDetectCurrentLocation}
                                disabled={detectingGps}
                                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#16acd4] to-[#0d89ab] hover:from-[#1ac0ed] hover:to-[#0f9ec4] text-black font-extrabold text-xs transition-all shadow-lg shadow-[#16acd4]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <LocateFixed className={`w-4 h-4 ${detectingGps ? 'animate-spin' : ''}`} />
                                <span>{detectingGps ? "Detecting GPS..." : "📍 Detect My Current Location"}</span>
                            </button>
                            <p className="text-[10px] text-zinc-500">
                                Click while sitting at your workshop counter to grab exact coordinates.
                            </p>
                        </div>

                        {/* 2. Manual Coordinates Input */}
                        <div className="p-4 rounded-2xl bg-[#17171d] border border-white/8 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                                Latitude &amp; Longitude
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] text-zinc-500 font-bold block mb-0.5">LAT</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={geofence.latitude ?? ""}
                                        onChange={e => setGeofence(prev => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : null }))}
                                        placeholder="28.6139"
                                        className="w-full bg-[#111114] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] text-zinc-500 font-bold block mb-0.5">LNG</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={geofence.longitude ?? ""}
                                        onChange={e => setGeofence(prev => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : null }))}
                                        placeholder="77.2090"
                                        className="w-full bg-[#111114] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Perimeter Radius Selector */}
                        <div className="p-4 rounded-2xl bg-[#17171d] border border-white/8 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                                Perimeter Radius (Meters)
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {[50, 100, 150, 200, 300, 500].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setGeofence(prev => ({ ...prev, geofenceRadius: r }))}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                                            geofence.geofenceRadius === r
                                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-black shadow"
                                                : "bg-[#111114] text-zinc-400 border-white/5 hover:text-white"
                                        }`}
                                    >
                                        {r}m
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-zinc-500">
                                Technicians within {geofence.geofenceRadius}m of the workshop center are verified.
                            </p>
                        </div>

                        {/* 4. Auto Attendance Switch & Save */}
                        <div className="p-4 rounded-2xl bg-[#17171d] border border-white/8 flex flex-col justify-between gap-3">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                                    Auto Attendance Trigger
                                </span>
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={geofence.autoAttendanceEnabled}
                                        onChange={e => setGeofence(prev => ({ ...prev, autoAttendanceEnabled: e.target.checked }))}
                                        className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                                    />
                                    <span className="text-xs font-bold text-white">
                                        Auto-Punch on Studio Entry
                                    </span>
                                </label>
                            </div>

                            <button
                                onClick={handleSaveGeofence}
                                disabled={savingGeofence}
                                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                {savingGeofence ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                <span>Save Workshop Location</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Geofence Feedback Message */}
                {geofenceMessage && (
                    <div className={`mt-4 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border animate-fade-in ${
                        geofenceMessage.type === "success"
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                            : geofenceMessage.type === "error"
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                            : "bg-[#16acd4]/15 border-[#16acd4]/30 text-[#16acd4]"
                    }`}>
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span>{geofenceMessage.text}</span>
                    </div>
                )}
            </div>

            {/* =========================================================================
                VIEW 1: DAILY ATTENDANCE REGISTER
            ========================================================================= */}
            {viewMode === "daily" && (
                <div className="flex flex-col gap-5">
                    {/* Date Navigation & Controls Bar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border border-white/8 bg-[#111113]">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                                onClick={() => changeDateByDays(-1)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5"
                                title="Previous Day"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setSelectedDate(todayStr)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                    selectedDate === todayStr
                                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-black shadow"
                                        : "bg-white/5 text-zinc-400 border-white/5 hover:text-white"
                                    }`}
                            >
                                Today
                            </button>

                            <button
                                onClick={() => changeDateByDays(1)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5"
                                title="Next Day"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-2 bg-[#17171a] border border-white/10 rounded-xl px-3 py-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#16acd4]" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                                />
                            </div>

                            <span className="text-sm font-bold text-zinc-300 ml-2 hidden sm:inline">
                                {formattedDisplayDate}
                            </span>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={handleMarkAllPresent}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/20 transition-all hover:border-emerald-500/40"
                            >
                                ✓ Mark All Present
                            </button>
                            <button
                                onClick={handleFillStandardTimes}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors"
                            >
                                Set 09:30 AM – 07:30 PM
                            </button>
                        </div>
                    </div>

                    {/* Summary Metric Cards for Selected Date */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="rounded-2xl border border-white/8 p-4 bg-[#111113]">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Total Team</p>
                            <p className="text-2xl lg:text-3xl font-black text-white">{activeStaff.length}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">Active Staff Members</p>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/20 p-4 bg-emerald-500/[0.04]">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Present (P)</p>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                            <p className="text-2xl lg:text-3xl font-black text-emerald-400">{presentCount}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{attendancePercentage}% Attendance Rate</p>
                        </div>

                        <div className="rounded-2xl border border-amber-500/20 p-4 bg-amber-500/[0.04]">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">Half Day (HD)</p>
                            <p className="text-2xl lg:text-3xl font-black text-amber-400">{halfDayCount}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">0.5 Day Calculated</p>
                        </div>

                        <div className="rounded-2xl border border-red-500/20 p-4 bg-red-500/[0.04]">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-red-400 mb-1">Absent (A)</p>
                            <p className="text-2xl lg:text-3xl font-black text-red-400">{absentCount}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Unexcused Absence</p>
                        </div>

                        <div className="rounded-2xl border border-purple-500/20 p-4 bg-purple-500/[0.04] col-span-2 lg:col-span-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-1">Leave (L)</p>
                            <p className="text-2xl lg:text-3xl font-black text-purple-400">{leaveCount}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Approved Leave</p>
                        </div>
                    </div>

                    {/* Attendance Register Table */}
                    {loadingDaily ? (
                        <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-3" />
                            <p className="text-sm">Loading attendance records...</p>
                        </div>
                    ) : staffList.length === 0 ? (
                        <div className="py-16 text-center rounded-2xl border border-white/8 bg-[#111113] p-8">
                            <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-white mb-1">No Staff Members Found</h3>
                            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
                                You need to add staff members first before you can mark attendance.
                            </p>
                            <Link
                                href="/shop/billing/staff"
                                className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#16acd4] hover:bg-[#1499bd]"
                            >
                                + Add Staff Members
                            </Link>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/8 bg-[#111113] overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-white/8 text-zinc-400 uppercase tracking-wider text-[10px] bg-[#17171a]">
                                            <th className="py-3.5 px-4 w-12 text-center">#</th>
                                            <th className="py-3.5 px-4 min-w-[200px]">Staff Member</th>
                                            <th className="py-3.5 px-4 min-w-[170px]">Punch Mode &amp; GPS</th>
                                            <th className="py-3.5 px-4 min-w-[240px]">Attendance Status</th>
                                            <th className="py-3.5 px-4 min-w-[130px]">In Time</th>
                                            <th className="py-3.5 px-4 min-w-[130px]">Out Time</th>
                                            <th className="py-3.5 px-4 min-w-[180px]">Daily Notes / Overtime</th>
                                            <th className="py-3.5 px-4 text-center w-20">Saved</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {staffList.filter(s => s.status === "ACTIVE").map((staff, idx) => {
                                            const current = attendanceMap[staff.id] || {
                                                status: "PRESENT",
                                                checkIn: "09:30 AM",
                                                checkOut: "07:30 PM",
                                                notes: "",
                                                punchMethod: null,
                                                distanceMeters: null,
                                                latitude: null,
                                                longitude: null,
                                                isSaved: false
                                            }

                                            return (
                                                <tr key={staff.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3.5 px-4 text-center text-zinc-600 font-mono text-[11px]">
                                                        {idx + 1}
                                                    </td>

                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                                                                {staff.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-white text-[13px]">{staff.name}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-[10px] text-zinc-400 font-semibold uppercase">{staff.role}</span>
                                                                    {staff.phone && (
                                                                        <span className="text-[10px] text-zinc-500 font-mono">{staff.phone}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Punch Mode & GPS verification badge */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex flex-col gap-1 items-start">
                                                            {current.punchMethod === "AUTO_GEOFENCE" ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                                    <Sparkles className="w-3 h-3 text-emerald-400" />
                                                                    <span>Auto GPS {current.distanceMeters !== null && current.distanceMeters !== undefined ? `(${current.distanceMeters}m)` : ''}</span>
                                                                </span>
                                                            ) : current.punchMethod === "GPS_VERIFIED" ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#16acd4]/15 text-[#16acd4] border border-[#16acd4]/30">
                                                                    <MapPin className="w-3 h-3 text-[#16acd4]" />
                                                                    <span>GPS Verified {current.distanceMeters !== null && current.distanceMeters !== undefined ? `(${current.distanceMeters}m)` : ''}</span>
                                                                </span>
                                                            ) : current.punchMethod === "MANUAL_OUTSIDE_GPS" ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                                                    <AlertCircle className="w-3 h-3 text-amber-400" />
                                                                    <span>Manual ({current.distanceMeters}m away)</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 text-zinc-400 border border-white/5">
                                                                    <span>Manual Entry</span>
                                                                </span>
                                                            )}
                                                            {current.latitude && current.longitude && (
                                                                <a
                                                                    href={`https://www.google.com/maps?q=${current.latitude},${current.longitude}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#16acd4] hover:underline"
                                                                    title={`Lat: ${current.latitude}, Lng: ${current.longitude}`}
                                                                >
                                                                    <MapPin className="w-2.5 h-2.5 text-[#16acd4]" />
                                                                    <span>View on Maps ↗</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Status Buttons */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            {[
                                                                { key: "PRESENT", label: "Present (P)", activeColor: "bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20 font-black", idleColor: "text-emerald-400/80 hover:bg-emerald-500/10" },
                                                                { key: "HALF_DAY", label: "Half Day (HD)", activeColor: "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20 font-black", idleColor: "text-amber-400/80 hover:bg-amber-500/10" },
                                                                { key: "ABSENT", label: "Absent (A)", activeColor: "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20 font-black", idleColor: "text-red-400/80 hover:bg-red-500/10" },
                                                                { key: "LEAVE", label: "Leave (L)", activeColor: "bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/20 font-black", idleColor: "text-purple-400/80 hover:bg-purple-500/10" },
                                                            ].map(btn => (
                                                                <button
                                                                    key={btn.key}
                                                                    onClick={() => updateStaffStatus(staff.id, btn.key as any)}
                                                                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                                                                        current.status === btn.key
                                                                            ? btn.activeColor
                                                                            : `bg-white/5 border-white/5 ${btn.idleColor}`
                                                                    }`}
                                                                >
                                                                    {btn.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>

                                                    {/* In Time */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <input
                                                                type="text"
                                                                value={current.checkIn || ""}
                                                                onChange={e => updateStaffField(staff.id, "checkIn", e.target.value)}
                                                                placeholder="09:30 AM"
                                                                className="w-24 bg-[#17171a] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono text-center"
                                                            />
                                                            <button
                                                                onClick={() => setStaffTimeNow(staff.id, "checkIn")}
                                                                className="px-2 py-1.5 rounded-lg text-[9px] font-bold bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10"
                                                                title="Set current time"
                                                            >
                                                                Now
                                                            </button>
                                                        </div>
                                                    </td>

                                                    {/* Out Time */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <input
                                                                type="text"
                                                                value={current.checkOut || ""}
                                                                onChange={e => updateStaffField(staff.id, "checkOut", e.target.value)}
                                                                placeholder="07:30 PM"
                                                                className="w-24 bg-[#17171a] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono text-center"
                                                            />
                                                            <button
                                                                onClick={() => setStaffTimeNow(staff.id, "checkOut")}
                                                                className="px-2 py-1.5 rounded-lg text-[9px] font-bold bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10"
                                                                title="Set current time"
                                                            >
                                                                Now
                                                            </button>
                                                        </div>
                                                    </td>

                                                    {/* Daily Notes / Overtime */}
                                                    <td className="py-3.5 px-4">
                                                        <input
                                                            type="text"
                                                            value={current.notes || ""}
                                                            onChange={e => updateStaffField(staff.id, "notes", e.target.value)}
                                                            placeholder="e.g. PPF night shift / 2 hr OT"
                                                            className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400"
                                                        />
                                                    </td>

                                                    {/* Status indicator */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        {current.isSaved ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                                <Check className="w-3 h-3" /> Saved
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Table Footer */}
                            <div className="p-4 border-t border-white/8 bg-[#17171b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="text-xs text-zinc-400">
                                    <span className="font-bold text-white">{presentCount}</span> of <span className="font-bold text-white">{activeStaff.length}</span> staff present on {formattedDisplayDate}
                                </div>
                                <button
                                    onClick={handleSaveAttendance}
                                    disabled={saving}
                                    className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all disabled:opacity-50 shadow-lg shadow-emerald-400/20"
                                >
                                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    Save Today&apos;s Attendance
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* =========================================================================
                VIEW 2: MONTHLY MUSTER ROLL / PAYROLL REGISTER
            ========================================================================= */}
            {viewMode === "monthly" && (
                <div className="flex flex-col gap-5">
                    {/* Month Picker Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/8 bg-[#111113]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#16acd4]/10 flex items-center justify-center text-[#16acd4] border border-[#16acd4]/20">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Monthly Attendance &amp; Payroll Summary</h3>
                                <p className="text-[11px] text-zinc-400">Calculates total payable days &amp; pro-rata salary for {selectedMonth}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-[#17171a] border border-white/10 rounded-xl px-3 py-1.5">
                                <span className="text-[11px] text-zinc-400 uppercase font-bold">Month:</span>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={e => setSelectedMonth(e.target.value)}
                                    className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                                />
                            </div>

                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors"
                            >
                                <Printer className="w-3.5 h-3.5" /> Print Sheet
                            </button>
                        </div>
                    </div>

                    {/* Monthly Summary Table */}
                    {loadingMonthly ? (
                        <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                            <RefreshCw className="w-6 h-6 animate-spin text-[#16acd4] mb-3" />
                            <p className="text-sm">Calculating monthly muster roll...</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/8 bg-[#111113] overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-white/8 text-zinc-400 uppercase tracking-wider text-[10px] bg-[#17171a]">
                                            <th className="py-3.5 px-4 w-12 text-center">#</th>
                                            <th className="py-3.5 px-4 min-w-[200px]">Staff Member</th>
                                            <th className="py-3.5 px-4 text-center">Month Days</th>
                                            <th className="py-3.5 px-4 text-center text-emerald-400">Present (P)</th>
                                            <th className="py-3.5 px-4 text-center text-amber-400">Half Day (HD)</th>
                                            <th className="py-3.5 px-4 text-center text-red-400">Absent (A)</th>
                                            <th className="py-3.5 px-4 text-center text-purple-400">Leave (L)</th>
                                            <th className="py-3.5 px-4 text-center font-bold text-white">Payable Days</th>
                                            <th className="py-3.5 px-4 text-center">Attendance %</th>
                                            <th className="py-3.5 px-4 text-right">Fixed Salary</th>
                                            <th className="py-3.5 px-4 text-right text-emerald-400 font-bold">Est. Payable</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {staffList.map((staff, idx) => {
                                            const staffRecords = monthlyRecords.filter(r => r.staffId === staff.id)
                                            const pCount = staffRecords.filter(r => r.status === "PRESENT").length
                                            const hdCount = staffRecords.filter(r => r.status === "HALF_DAY").length
                                            const aCount = staffRecords.filter(r => r.status === "ABSENT").length
                                            const lCount = staffRecords.filter(r => r.status === "LEAVE").length

                                            const payableDays = pCount + (hdCount * 0.5)
                                            const pct = daysInMonth > 0 ? Math.round((payableDays / daysInMonth) * 100) : 0

                                            // Estimated salary pro-rata
                                            const dailyRate = staff.salary > 0 && daysInMonth > 0 ? (staff.salary / daysInMonth) : 0
                                            const estPayableSalary = staff.salaryType === "DAILY"
                                                ? Math.round(payableDays * staff.salary)
                                                : staff.salary > 0
                                                    ? Math.round(dailyRate * payableDays)
                                                    : 0

                                            return (
                                                <tr key={staff.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3.5 px-4 text-center text-zinc-600 font-mono text-[11px]">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <p className="font-bold text-white text-[13px]">{staff.name}</p>
                                                        <span className="text-[10px] text-zinc-400 uppercase font-semibold">{staff.role}</span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-mono text-zinc-400">
                                                        {daysInMonth}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400 bg-emerald-500/[0.02]">
                                                        {pCount}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400 bg-amber-500/[0.02]">
                                                        {hdCount}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-mono font-bold text-red-400 bg-red-500/[0.02]">
                                                        {aCount}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-mono font-bold text-purple-400 bg-purple-500/[0.02]">
                                                        {lCount}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-mono font-black text-white text-sm bg-white/[0.03]">
                                                        {payableDays}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                                <div
                                                                    className={`h-full ${pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                                                                    style={{ width: `${Math.min(100, pct)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[11px] font-bold text-zinc-300 font-mono">{pct}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-mono text-zinc-300">
                                                        {staff.salary > 0 ? `₹${staff.salary.toLocaleString("en-IN")}` : "—"}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                                                        {estPayableSalary > 0 ? `₹${estPayableSalary.toLocaleString("en-IN")}` : "Per Job / Comm."}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}
