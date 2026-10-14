"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
    Clock, Wrench, CheckCircle2, AlertCircle, ArrowRight,
    Car, Calendar, DollarSign, Sparkles, ChevronRight,
    Play, Check, RefreshCw, Phone, ShieldCheck, MapPin, Radio, LocateFixed, Navigation
} from "lucide-react"
import { calculateDistanceMeters, formatDistance } from "@/lib/geo"

export default function StaffDashboardPage() {
    const [currentTime, setCurrentTime] = useState<string>("")
    const [currentDate, setCurrentDate] = useState<string>("")
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [punching, setPunching] = useState(false)

    // Live Geofence Radar State
    const [geoStatus, setGeoStatus] = useState<{
        latitude: number | null
        longitude: number | null
        distanceMeters: number | null
        isInside: boolean
        isDetecting: boolean
        error: string | null
        autoPunchedSuccess: boolean
        autoPunchMessage?: string | null
    }>({
        latitude: null,
        longitude: null,
        distanceMeters: null,
        isInside: false,
        isDetecting: false,
        error: null,
        autoPunchedSuccess: false,
        autoPunchMessage: null
    })

    // Workshop digital clock
    useEffect(() => {
        const updateClock = () => {
            const now = new Date()
            setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }))
            setCurrentDate(now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }))
        }
        updateClock()
        const timer = setInterval(updateClock, 1000)
        return () => clearInterval(timer)
    }, [])

    const loadDashboard = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/staff/me")
            if (res.ok) {
                const result = await res.json()
                if (result.success) {
                    setData(result)
                    return result
                }
            } else {
                console.warn("loadDashboard returned:", res.status)
            }
        } catch (err) {
            console.error("Dashboard error:", err)
        } finally {
            setLoading(false)
        }
        return null
    }

    // Geolocation detection and auto-punch
    const checkLocationAndAutoPunch = useCallback((shopLat?: number | null, shopLng?: number | null, radius = 150, autoEnabled = true, alreadyPunched = false) => {
        if (typeof window === "undefined" || !navigator.geolocation) {
            setGeoStatus(prev => ({ ...prev, error: "Geolocation is not supported by your device." }))
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

                // If inside perimeter & auto-attendance enabled & not already punched in today:
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
                            setGeoStatus(prev => ({
                                ...prev,
                                autoPunchedSuccess: true,
                                autoPunchMessage: resData.message || `Auto attendance punched successfully (${dist}m away)`
                            }))
                            loadDashboard()
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
                    error: err.code === 1 ? "GPS location permission denied in browser" : "Unable to acquire current GPS coordinates"
                }))
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        )
    }, [])

    useEffect(() => {
        loadDashboard().then((res) => {
            if (res && res.staff?.shop) {
                const shop = res.staff.shop
                const isPunched = res.today?.status === "PRESENT" && !!res.today?.checkIn
                if (shop.latitude && shop.longitude) {
                    checkLocationAndAutoPunch(
                        shop.latitude,
                        shop.longitude,
                        shop.geofenceRadius || 150,
                        shop.autoAttendanceEnabled ?? true,
                        isPunched
                    )
                }
            }
        })
    }, [checkLocationAndAutoPunch])

    // Manual Punch action
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
                    loadDashboard()
                } else {
                    alert(result.error || "Punch failed")
                }
            } else {
                alert("Punch action failed (Server error: " + res.status + ")")
            }
        } catch (err) {
            console.error("Punch error:", err)
        } finally {
            setPunching(false)
        }
    }

    if (loading && !data) {
        return (
            <div className="py-24 flex flex-col items-center justify-center text-zinc-500">
                <RefreshCw className="w-8 h-8 animate-spin text-[#16acd4] mb-3" />
                <p className="text-sm font-semibold">Loading your workshop dashboard...</p>
            </div>
        )
    }

    const isPunchedIn = data?.today?.status === "PRESENT" && !!data?.today?.checkIn
    const isPunchedOut = isPunchedIn && !!data?.today?.checkOut
    const shopLocationConfigured = !!(data?.staff?.shop?.latitude && data?.staff?.shop?.longitude)

    return (
        <div className="space-y-6">
            {/* Top Greeting & Digital Clock Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#131317] via-[#101014] to-[#0c0c0e] border border-white/10 p-5 sm:p-7 shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#16acd4]/10 blur-3xl -z-10 rounded-full" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#16acd4]" />
                            <span>Workshop Bay Assigned</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Welcome back, <span className="text-[#16acd4]">{data?.staff?.name}</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                            {data?.staff?.specialization || data?.staff?.role} • Ready for today's vehicle repairs & detailing
                        </p>
                    </div>

                    {/* Workshop Clock Widget */}
                    <div className="bg-[#17171d]/90 border border-white/10 rounded-2xl px-5 py-3.5 text-right shrink-0">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-end gap-1.5 mb-0.5">
                            <Clock className="w-3.5 h-3.5 text-[#16acd4]" />
                            <span>Workshop Time</span>
                        </div>
                        <div className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider">
                            {currentTime || "--:--:--"}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-medium">
                            {currentDate}
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-Punch Celebration Banner if just triggered */}
            {(geoStatus.autoPunchedSuccess || data?.today?.punchMethod === "AUTO_GEOFENCE") && (
                <div className="p-4 sm:p-5 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                            <Sparkles className="w-5 h-5 text-emerald-300 animate-spin" />
                        </div>
                        <div>
                            <span className="font-black text-white">Auto Attendance Verified &amp; Punched!</span>
                            <p className="text-xs text-emerald-300/80 mt-0.5">
                                You entered the workshop geofence ({formatDistance(data?.today?.distanceMeters || geoStatus.distanceMeters)} away). Check-in logged at {data?.today?.checkIn || "Just now"}.
                            </p>
                        </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black bg-emerald-500 text-black shrink-0">
                        GPS VERIFIED
                    </span>
                </div>
            )}

            {/* Workshop Geofence Radar Card */}
            <div className="p-5 rounded-3xl bg-[#121216] border border-white/10 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                            geoStatus.isInside
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                : geoStatus.distanceMeters !== null
                                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                                : "bg-[#16acd4]/15 border-[#16acd4]/30 text-[#16acd4]"
                        }`}>
                            <Radio className={`w-6 h-6 ${geoStatus.isDetecting ? "animate-spin" : "animate-pulse"}`} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-white">Workshop Location Geofence Radar</h3>
                                {shopLocationConfigured ? (
                                    geoStatus.isInside ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            ● Inside Workshop Perimeter
                                        </span>
                                    ) : geoStatus.distanceMeters !== null ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                            Outside Workshop
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-white/10">
                                            Detecting GPS...
                                        </span>
                                    )
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400">
                                        Workshop GPS Not Set
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-zinc-400 mt-0.5">
                                {shopLocationConfigured ? (
                                    geoStatus.distanceMeters !== null ? (
                                        <>
                                            Live distance: <b className="text-white font-mono">{formatDistance(geoStatus.distanceMeters)}</b> from workshop center
                                            {data?.staff?.shop?.geofenceRadius && ` (Radius: ${data.staff.shop.geofenceRadius}m)`}
                                            {geoStatus.isInside && " • Auto-Attendance is active"}
                                        </>
                                    ) : geoStatus.error ? (
                                        <span className="text-amber-400">{geoStatus.error}</span>
                                    ) : (
                                        "Calculating distance to workshop..."
                                    )
                                ) : (
                                    "Shop owner has not configured workshop GPS yet. Manual punch available."
                                )}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (data?.staff?.shop?.latitude && data?.staff?.shop?.longitude) {
                                checkLocationAndAutoPunch(
                                    data.staff.shop.latitude,
                                    data.staff.shop.longitude,
                                    data.staff.shop.geofenceRadius || 150,
                                    data.staff.shop.autoAttendanceEnabled ?? true,
                                    isPunchedIn
                                )
                            }
                        }}
                        disabled={geoStatus.isDetecting}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5 shrink-0"
                    >
                        <LocateFixed className={`w-3.5 h-3.5 text-[#16acd4] ${geoStatus.isDetecting ? "animate-spin" : ""}`} />
                        <span>{geoStatus.isDetecting ? "Detecting GPS..." : "Refresh Location"}</span>
                    </button>
                </div>
            </div>

            {/* Daily Punch Card (One-Tap Attendance) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#121216] border border-white/10 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                            isPunchedIn && !isPunchedOut
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : isPunchedOut
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}>
                            <Clock className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-black text-white">Daily Attendance Punch</h3>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    isPunchedIn && !isPunchedOut
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        : isPunchedOut
                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        : "bg-zinc-800 text-zinc-400 border border-white/10"
                                }`}>
                                    {isPunchedIn && !isPunchedOut ? "On Shift (Active)" : isPunchedOut ? "Shift Completed" : "Not Checked In"}
                                </span>

                                {data?.today?.punchMethod === "AUTO_GEOFENCE" && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                        <Sparkles className="w-3 h-3 text-emerald-400" />
                                        <span>Auto GPS Geofence</span>
                                    </span>
                                )}
                                {data?.today?.punchMethod === "GPS_VERIFIED" && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16acd4]/15 text-[#16acd4] border border-[#16acd4]/30">
                                        <MapPin className="w-3 h-3" />
                                        <span>GPS Verified</span>
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mt-1.5 text-xs text-zinc-400">
                                <div>
                                    <span className="text-zinc-500">In Time:</span>{" "}
                                    <span className="font-mono font-bold text-white">{data?.today?.checkIn || "Pending"}</span>
                                </div>
                                {data?.today?.checkOut && (
                                    <div>
                                        <span className="text-zinc-500">Out Time:</span>{" "}
                                        <span className="font-mono font-bold text-white">{data?.today?.checkOut}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Punch Action Buttons */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {!isPunchedIn ? (
                            <button
                                onClick={() => handlePunch("PUNCH_IN")}
                                disabled={punching}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Play className="w-4 h-4 fill-black" />
                                <span>Punch In (Start Shift)</span>
                            </button>
                        ) : !isPunchedOut ? (
                            <button
                                onClick={() => handlePunch("PUNCH_OUT")}
                                disabled={punching}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                                <span>Punch Out (End Shift)</span>
                            </button>
                        ) : (
                            <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-300">
                                ✓ Today's Shift Recorded
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Metrics Quick Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: "Active Jobs", value: data?.stats?.activeJobs || 0, sub: "Vehicles In Queue", icon: Wrench, color: "#16acd4", href: "/staff/jobs" },
                    { label: "Done Today", value: data?.stats?.completedToday || 0, sub: "Repairs Completed", icon: CheckCircle2, color: "#34d399", href: "/staff/jobs" },
                    { label: "Base Salary", value: `₹${(data?.staff?.salary || 0).toLocaleString("en-IN")}`, sub: data?.staff?.salaryType === "DAILY" ? "Per Day" : "Per Month", icon: Calendar, color: "#a78bfa", href: "/staff/earnings" },
                    { label: "Commission", value: `₹${(data?.stats?.pendingCommissions || 0).toLocaleString("en-IN")}`, sub: "Pending Payout", icon: DollarSign, color: "#f59e0b", href: "/staff/earnings" },
                ].map((stat, idx) => (
                    <Link
                        key={idx}
                        href={stat.href}
                        className="p-4 rounded-2xl bg-[#121216] border border-white/8 hover:border-white/20 transition-all group flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: stat.color + "20" }}>
                                <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                            </div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{stat.value}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">{stat.sub}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Active Vehicle Spotlight (Car currently being worked on) */}
            <div className="rounded-3xl bg-gradient-to-br from-[#15151b] to-[#111114] border border-[#16acd4]/30 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#16acd4]/10 blur-3xl -z-10 rounded-full" />
                
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#16acd4]/20 text-[#16acd4] flex items-center justify-center">
                            <Car className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Current Active Vehicle in Bay</h3>
                            <p className="text-[11px] text-zinc-400">Primary car assigned for repair / detailing</p>
                        </div>
                    </div>
                    <Link
                        href="/staff/jobs"
                        className="text-xs text-[#16acd4] hover:text-white flex items-center gap-1 font-bold"
                    >
                        <span>All Jobs</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {data?.currentActiveJob ? (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0d0d10] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-black text-xs sm:text-sm bg-amber-400 text-black px-2.5 py-0.5 rounded tracking-widest border border-amber-300 shadow">
                                    {data.currentActiveJob.vehicleRegNo}
                                </span>
                                <span className="text-base sm:text-lg font-black text-white">
                                    {data.currentActiveJob.vehicleName}
                                </span>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#16acd4]/20 text-[#16acd4] border border-[#16acd4]/30">
                                    {data.currentActiveJob.jobCategory}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-zinc-400">
                                <div>
                                    Customer: <span className="text-white font-semibold">{data.currentActiveJob.clientName}</span>
                                </div>
                                {data.currentActiveJob.clientPhone && (
                                    <a href={`tel:${data.currentActiveJob.clientPhone}`} className="text-zinc-400 hover:text-white flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-[#16acd4]" />
                                        <span>{data.currentActiveJob.clientPhone}</span>
                                    </a>
                                )}
                            </div>

                            {data.currentActiveJob.workSummary && (
                                <p className="text-xs text-zinc-400 line-clamp-1 italic bg-white/5 px-2.5 py-1 rounded-lg">
                                    "{data.currentActiveJob.workSummary}"
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Link
                                href={`/staff/jobs/${data.currentActiveJob.id}`}
                                className="w-full md:w-auto px-5 py-3 rounded-xl bg-[#16acd4] hover:bg-[#139cb8] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#16acd4]/20 transition-all"
                            >
                                <Wrench className="w-3.5 h-3.5" />
                                <span>Open Job Sheet & Checklist</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 rounded-2xl bg-[#0d0d10] border border-white/5 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-500 flex items-center justify-center mx-auto mb-3">
                            <Wrench className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">No Active Vehicle In Bay</h4>
                        <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
                            You have no cars currently set to "In Progress". Check your assigned vehicle queue to pick up a car.
                        </p>
                        <Link
                            href="/staff/jobs"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
                        >
                            <span>Browse Assigned Cars</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Action Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                    href="/staff/jobs"
                    className="p-4 rounded-2xl bg-[#121216] border border-white/8 hover:border-[#16acd4]/40 transition-all flex items-center gap-3 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-[#16acd4]/15 text-[#16acd4] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Car className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-[#16acd4] transition-colors">Assigned Vehicle Jobs</h4>
                        <p className="text-[11px] text-zinc-500">View repair queue & checklist</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                </Link>

                <Link
                    href="/staff/attendance"
                    className="p-4 rounded-2xl bg-[#121216] border border-white/8 hover:border-emerald-500/40 transition-all flex items-center gap-3 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">My Attendance Log</h4>
                        <p className="text-[11px] text-zinc-500">Muster roll & punch records</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                </Link>

                <Link
                    href="/staff/earnings"
                    className="p-4 rounded-2xl bg-[#121216] border border-white/8 hover:border-purple-500/40 transition-all flex items-center gap-3 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Commissions & Salary</h4>
                        <p className="text-[11px] text-zinc-500">Track payouts & rates</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                </Link>
            </div>
        </div>
    )
}
