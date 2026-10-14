"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
    MapPin, Navigation, Users, RefreshCw, Clock, WifiOff,
    CheckCircle2, XCircle, AlertCircle, Phone, Wrench, Car,
    Activity, Signal, Crosshair, ChevronRight, Radio,
    Building2, LocateFixed, Coffee, Map
} from "lucide-react"

// ─── Leaflet CSS (loaded globally once) ──────────────────────────────────────
import "leaflet/dist/leaflet.css"

// ─── Dynamically load Map component (no SSR) ─────────────────────────────────
const StaffMap = dynamic(() => import("@/components/shop/staff-map"), {
    ssr: false,
    loading: () => (
        <div
            className="w-full flex items-center justify-center rounded-2xl"
            style={{ height: 440, background: "rgba(19,19,21,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-[#16acd4]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#16acd4] animate-spin" />
                    <MapPin className="absolute inset-0 m-auto w-5 h-5 text-[#16acd4]" />
                </div>
                <p className="text-xs text-zinc-500 font-medium">Loading map...</p>
            </div>
        </div>
    ),
})

// ─── Types ────────────────────────────────────────────────────────────────────
type ActiveJob = {
    id: string
    jobNumber: string
    vehicleName: string
    vehicleRegNo: string
    clientName: string
    status: string
    priority: string
    jobCategory: string
}

type StaffLocation = {
    id: string
    name: string
    phone: string | null
    role: string
    specialization: string | null
    todayStatus: string
    checkIn: string | null
    checkOut: string | null
    punchMethod: string | null
    latitude: number | null
    longitude: number | null
    distanceMeters: number | null
    lastSeen: string | null
    activeJob: ActiveJob | null
}

type ShopLocation = {
    latitude: number | null
    longitude: number | null
    geofenceRadius: number
}

type ApiResponse = {
    success: boolean
    staff: StaffLocation[]
    shopLocation: ShopLocation | null
    updatedAt: string
    date: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
    TECHNICIAN: "Detailing Tech",
    PPF_INSTALLER: "PPF Installer",
    CERAMIC_SPECIALIST: "Ceramic Expert",
    PAINTER: "Painter",
    MECHANIC: "Mechanic",
    WASHER: "Washer",
    MANAGER: "Manager",
    HELPER: "Helper",
    DETAILER: "Detailer",
    DENTER: "Denter",
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    TECHNICIAN: { bg: "#16acd415", text: "#16acd4", border: "#16acd440" },
    PPF_INSTALLER: { bg: "#c084fc15", text: "#c084fc", border: "#c084fc40" },
    CERAMIC_SPECIALIST: { bg: "#38bdf815", text: "#38bdf8", border: "#38bdf840" },
    PAINTER: { bg: "#fb923c15", text: "#fb923c", border: "#fb923c40" },
    MECHANIC: { bg: "#f472b615", text: "#f472b6", border: "#f472b640" },
    WASHER: { bg: "#34d39915", text: "#34d399", border: "#34d39940" },
    MANAGER: { bg: "#fbbf2415", text: "#fbbf24", border: "#fbbf2440" },
    HELPER: { bg: "#94a3b815", text: "#94a3b8", border: "#94a3b840" },
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    PRESENT: { label: "Present", color: "#34d399", bg: "#34d39920", icon: CheckCircle2 },
    ABSENT: { label: "Absent", color: "#f87171", bg: "#f8717120", icon: XCircle },
    HALF_DAY: { label: "Half Day", color: "#fbbf24", bg: "#fbbf2420", icon: Coffee },
    LEAVE: { label: "On Leave", color: "#94a3b8", bg: "#94a3b820", icon: AlertCircle },
    NOT_MARKED: { label: "Not Marked", color: "#6b7280", bg: "#6b728020", icon: Clock },
}

const PUNCH_METHOD_LABELS: Record<string, { label: string; color: string; icon: any }> = {
    AUTO_GEOFENCE: { label: "Auto Geofence", color: "#16acd4", icon: Radio },
    GPS_VERIFIED: { label: "GPS Verified", color: "#34d399", icon: LocateFixed },
    MANUAL: { label: "Manual", color: "#fbbf24", icon: Clock },
    SELF_PUNCH: { label: "Self Punch", color: "#c084fc", icon: Users },
}

const PRIORITY_COLORS: Record<string, string> = {
    URGENT: "#f87171",
    HIGH: "#fb923c",
    NORMAL: "#16acd4",
}

function formatDistance(meters: number | null | undefined): string {
    if (meters === null || meters === undefined) return "--"
    if (meters < 1000) return `${meters}m`
    return `${(meters / 1000).toFixed(1)}km`
}

function timeAgo(isoDate: string | null): string {
    if (!isoDate) return "Unknown"
    const diff = Date.now() - new Date(isoDate).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

// ─── Staff Avatar ─────────────────────────────────────────────────────────────
function StaffAvatar({ name, role, status }: { name: string; role: string; status: string }) {
    const colors = ROLE_COLORS[role] || ROLE_COLORS.HELPER
    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    return (
        <div className="relative flex-shrink-0">
            <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg"
                style={{ background: colors.bg, border: `1.5px solid ${colors.border}`, color: colors.text }}
            >
                {initials}
            </div>
            <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0e0e10]"
                style={{ background: (status === "PRESENT" || status === "HALF_DAY") ? "#34d399" : "#6b728060" }}
            />
        </div>
    )
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
function StatsCard({ label, value, icon: Icon, color, sub }: {
    label: string; value: string | number; icon: any; color: string; sub?: string
}) {
    return (
        <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: "#13131580", border: "1px solid rgba(255,255,255,0.06)" }}
        >
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}
            >
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="min-w-0">
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-zinc-500 font-medium mt-0.5">{label}</div>
                {sub && <div className="text-[10px] mt-0.5 font-medium" style={{ color }}>{sub}</div>}
            </div>
        </div>
    )
}

// ─── Staff Location Card ──────────────────────────────────────────────────────
function StaffCard({
    staff, shopLocation, isSelected, onClick
}: {
    staff: StaffLocation
    shopLocation: ShopLocation | null
    isSelected: boolean
    onClick: () => void
}) {
    const statusMeta = STATUS_META[staff.todayStatus] || STATUS_META.NOT_MARKED
    const StatusIcon = statusMeta.icon
    const roleColors = ROLE_COLORS[staff.role] || ROLE_COLORS.HELPER
    const punchMeta = staff.punchMethod ? PUNCH_METHOD_LABELS[staff.punchMethod] : null
    const PunchIcon = punchMeta?.icon || Clock
    const hasGps = staff.latitude != null && staff.longitude != null
    const isOnShop = staff.distanceMeters != null && shopLocation?.geofenceRadius != null
        && staff.distanceMeters <= shopLocation.geofenceRadius

    return (
        <button
            onClick={onClick}
            className="w-full text-left rounded-2xl p-4 transition-all duration-200 group"
            style={{
                background: isSelected ? "rgba(22,172,212,0.08)" : "rgba(19,19,21,0.7)",
                border: isSelected ? "1.5px solid rgba(22,172,212,0.35)" : "1.5px solid rgba(255,255,255,0.06)",
                boxShadow: isSelected ? "0 0 20px rgba(22,172,212,0.1)" : "none",
            }}
        >
            <div className="flex items-center gap-3 mb-3">
                <StaffAvatar name={staff.name} role={staff.role} status={staff.todayStatus} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">{staff.name}</span>
                        <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                            style={{ background: roleColors.bg, color: roleColors.text, border: `1px solid ${roleColors.border}` }}
                        >
                            {ROLE_LABELS[staff.role] || staff.role}
                        </span>
                    </div>
                    {staff.specialization && (
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">{staff.specialization}</p>
                    )}
                </div>
                <div
                    className="flex items-center gap-1 px-2 py-1 rounded-xl flex-shrink-0"
                    style={{ background: statusMeta.bg, border: `1px solid ${statusMeta.color}30` }}
                >
                    <StatusIcon className="w-3 h-3" style={{ color: statusMeta.color }} />
                    <span className="text-[10px] font-bold" style={{ color: statusMeta.color }}>
                        {statusMeta.label}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2.5">
                <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-0.5">Check In</div>
                    <div className="text-sm font-bold text-white">{staff.checkIn || "--"}</div>
                </div>
                <div
                    className="rounded-xl px-3 py-2"
                    style={{
                        background: hasGps && isOnShop ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.03)",
                        border: hasGps && isOnShop ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(255,255,255,0.06)"
                    }}
                >
                    <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-0.5">Distance</div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: hasGps ? (isOnShop ? "#34d399" : "#fb923c") : "#6b7280" }} />
                        <span className="text-sm font-bold" style={{ color: hasGps ? (isOnShop ? "#34d399" : "#fb923c") : "#6b7280" }}>
                            {hasGps ? formatDistance(staff.distanceMeters) : "No GPS"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {hasGps ? (
                        <>
                            <div className="flex items-center gap-1">
                                <LocateFixed className="w-3 h-3 text-[#16acd4]" />
                                <span className="text-[10px] text-[#16acd4] font-medium">GPS Available</span>
                            </div>
                            {punchMeta && (
                                <>
                                    <span className="text-zinc-700">·</span>
                                    <div className="flex items-center gap-1">
                                        <PunchIcon className="w-3 h-3" style={{ color: punchMeta.color }} />
                                        <span className="text-[10px] font-medium" style={{ color: punchMeta.color }}>
                                            {punchMeta.label}
                                        </span>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-1">
                            <WifiOff className="w-3 h-3 text-zinc-600" />
                            <span className="text-[10px] text-zinc-600">No location data</span>
                        </div>
                    )}
                </div>
                {staff.activeJob && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg flex-shrink-0"
                        style={{ background: "#fb923c15", border: "1px solid #fb923c30" }}>
                        <Wrench className="w-2.5 h-2.5 text-[#fb923c]" />
                        <span className="text-[10px] font-bold text-[#fb923c]">Working</span>
                    </div>
                )}
            </div>
        </button>
    )
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function StaffDetailPanel({ staff, shopLocation, onClose }: {
    staff: StaffLocation
    shopLocation: ShopLocation | null
    onClose: () => void
}) {
    const statusMeta = STATUS_META[staff.todayStatus] || STATUS_META.NOT_MARKED
    const StatusIcon = statusMeta.icon
    const punchMeta = staff.punchMethod ? PUNCH_METHOD_LABELS[staff.punchMethod] : null
    const PunchIcon = punchMeta?.icon || Clock
    const hasGps = staff.latitude != null && staff.longitude != null
    const isOnShop = staff.distanceMeters != null && shopLocation?.geofenceRadius != null
        && staff.distanceMeters <= shopLocation.geofenceRadius

    const mapsUrl = hasGps
        ? `https://www.google.com/maps?q=${staff.latitude},${staff.longitude}`
        : null

    return (
        <div
            className="rounded-2xl p-5"
            style={{ background: "#13131580", border: "1px solid rgba(255,255,255,0.08)" }}
        >
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                    <StaffAvatar name={staff.name} role={staff.role} status={staff.todayStatus} />
                    <div>
                        <h3 className="text-base font-bold text-white">{staff.name}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">{ROLE_LABELS[staff.role] || staff.role}</p>
                        {staff.specialization && (
                            <p className="text-[10px] text-zinc-600 mt-0.5">{staff.specialization}</p>
                        )}
                    </div>
                </div>
                <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors p-1 text-xs">✕</button>
            </div>

            <div
                className="flex items-center justify-between p-3 rounded-xl mb-4"
                style={{ background: statusMeta.bg, border: `1px solid ${statusMeta.color}30` }}
            >
                <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4" style={{ color: statusMeta.color }} />
                    <span className="text-sm font-bold" style={{ color: statusMeta.color }}>{statusMeta.label}</span>
                </div>
                {staff.lastSeen && (
                    <span className="text-xs" style={{ color: statusMeta.color }}>{timeAgo(staff.lastSeen)}</span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest mb-1">Check In</div>
                    <div className="text-sm font-bold text-white">{staff.checkIn || "—"}</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest mb-1">Check Out</div>
                    <div className="text-sm font-bold text-white">{staff.checkOut || "—"}</div>
                </div>
            </div>

            <div className="mb-4">
                <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest mb-2">Location</div>
                {hasGps ? (
                    <div className="space-y-2">
                        <div
                            className="flex items-center justify-between p-3 rounded-xl"
                            style={{
                                background: isOnShop ? "rgba(52,211,153,0.08)" : "rgba(251,146,60,0.08)",
                                border: isOnShop ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(251,146,60,0.25)"
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" style={{ color: isOnShop ? "#34d399" : "#fb923c" }} />
                                <div>
                                    <div className="text-xs font-bold" style={{ color: isOnShop ? "#34d399" : "#fb923c" }}>
                                        {isOnShop ? "At Shop" : "Off-site"}
                                    </div>
                                    <div className="text-[10px] text-zinc-500">{formatDistance(staff.distanceMeters)} from shop</div>
                                </div>
                            </div>
                            {mapsUrl && (
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
                                    style={{ background: "#16acd420", color: "#16acd4", border: "1px solid #16acd440" }}
                                >
                                    <Map className="w-3 h-3" />
                                    View
                                </a>
                            )}
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="text-[10px] text-zinc-500 mb-1">Coordinates</div>
                            <div className="text-xs text-zinc-300 font-mono">
                                {staff.latitude?.toFixed(6)}, {staff.longitude?.toFixed(6)}
                            </div>
                        </div>
                        {punchMeta && (
                            <div
                                className="flex items-center gap-2 p-3 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                            >
                                <PunchIcon className="w-3.5 h-3.5" style={{ color: punchMeta.color }} />
                                <div>
                                    <div className="text-[10px] text-zinc-500">Punch Method</div>
                                    <div className="text-xs font-bold" style={{ color: punchMeta.color }}>{punchMeta.label}</div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center py-6 rounded-xl gap-2"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                        <WifiOff className="w-7 h-7 text-zinc-600" />
                        <p className="text-xs text-zinc-500 text-center">
                            No GPS location available.<br />Staff may have punched in manually.
                        </p>
                    </div>
                )}
            </div>

            {staff.activeJob && (
                <div className="mb-4">
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest mb-2">Active Job</div>
                    <div className="p-3 rounded-xl" style={{ background: "rgba(251,146,60,0.07)", border: "1px solid rgba(251,146,60,0.2)" }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#fb923c]">{staff.activeJob.jobNumber}</span>
                            <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase"
                                style={{ color: PRIORITY_COLORS[staff.activeJob.priority] || "#16acd4", background: `${PRIORITY_COLORS[staff.activeJob.priority] || "#16acd4"}15` }}
                            >
                                {staff.activeJob.priority}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <Car className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-xs text-zinc-300 font-medium">{staff.activeJob.vehicleName}</span>
                            <span className="text-[10px] text-zinc-600">{staff.activeJob.vehicleRegNo}</span>
                        </div>
                        <div className="text-xs text-zinc-500">Client: {staff.activeJob.clientName}</div>
                    </div>
                </div>
            )}

            {staff.phone && (
                <a
                    href={`tel:${staff.phone}`}
                    className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl transition-all hover:scale-[1.01] active:scale-95"
                    style={{ background: "rgba(22,172,212,0.1)", border: "1px solid rgba(22,172,212,0.25)", color: "#16acd4" }}
                >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-bold">{staff.phone}</span>
                </a>
            )}
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StaffLocationsPage() {
    const [data, setData] = useState<ApiResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>("ALL")
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [countdown, setCountdown] = useState(30)
    const [showMap, setShowMap] = useState(true)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const countdownRef = useRef<NodeJS.Timeout | null>(null)

    const fetchLocations = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true)
            const res = await fetch("/api/shop/billing/staff/locations")
            const json = await res.json()
            if (json.success) {
                setData(json)
                setLastUpdated(new Date())
                setCountdown(30)
            }
        } catch (err) {
            console.error("Failed to fetch staff locations:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchLocations()
    }, [fetchLocations])

    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(() => { fetchLocations(true) }, 30000)
            countdownRef.current = setInterval(() => {
                setCountdown(prev => prev <= 1 ? 30 : prev - 1)
            }, 1000)
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (countdownRef.current) clearInterval(countdownRef.current)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (countdownRef.current) clearInterval(countdownRef.current)
        }
    }, [autoRefresh, fetchLocations])

    const staff = data?.staff || []
    const shopLocation = data?.shopLocation || null

    const filteredStaff = staff.filter(s => {
        if (filterStatus === "ALL") return true
        if (filterStatus === "GPS") return s.latitude != null
        if (filterStatus === "NO_GPS") return s.latitude == null
        return s.todayStatus === filterStatus
    })

    const selectedStaff = staff.find(s => s.id === selectedId) || null

    const presentCount = staff.filter(s => s.todayStatus === "PRESENT" || s.todayStatus === "HALF_DAY").length
    const withGps = staff.filter(s => s.latitude != null).length
    const onShopCount = staff.filter(s => s.latitude != null && s.distanceMeters != null && shopLocation && s.distanceMeters <= shopLocation.geofenceRadius).length
    const workingCount = staff.filter(s => s.activeJob != null).length

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-[#16acd4]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#16acd4] animate-spin" />
                    <LocateFixed className="absolute inset-0 m-auto w-6 h-6 text-[#16acd4]" />
                </div>
                <p className="text-zinc-400 text-sm font-medium">Loading staff locations...</p>
            </div>
        )
    }

    return (
        <div className="space-y-5 max-w-7xl mx-auto">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
                        <Link href="/shop/billing" className="hover:text-zinc-300 transition-colors">Shop Portal</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/shop/billing/staff" className="hover:text-zinc-300 transition-colors">Staff</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#16acd4]">Live Locations</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#16acd4]/15 border border-[#16acd4]/30 flex items-center justify-center">
                            <Navigation className="w-4 h-4 text-[#16acd4]" />
                        </div>
                        Staff Live Locations
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Real-time GPS tracking — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Live countdown */}
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                        {autoRefresh ? (
                            <>
                                <Activity className="w-3.5 h-3.5 text-[#34d399]" />
                                <span className="text-zinc-400">Refresh in</span>
                                <span className="font-bold text-[#34d399] w-5 text-right">{countdown}s</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-zinc-600">Paused</span>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => setAutoRefresh(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                            background: autoRefresh ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
                            border: autoRefresh ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.08)",
                            color: autoRefresh ? "#34d399" : "#6b7280"
                        }}
                    >
                        <Signal className="w-3.5 h-3.5" />
                        {autoRefresh ? "Live" : "Paused"}
                    </button>
                    <button
                        onClick={() => fetchLocations(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                        style={{ background: "rgba(22,172,212,0.1)", border: "1px solid rgba(22,172,212,0.3)", color: "#16acd4" }}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatsCard label="Present Today" value={presentCount} icon={CheckCircle2} color="#34d399" sub={`of ${staff.length} staff`} />
                <StatsCard label="GPS Tracked" value={withGps} icon={LocateFixed} color="#16acd4" sub={withGps === 0 ? "No GPS yet" : "Live tracking"} />
                <StatsCard label="At Shop Now" value={onShopCount} icon={Building2} color="#c084fc" sub={shopLocation?.latitude ? "Geofence active" : "No geofence set"} />
                <StatsCard label="Working on Jobs" value={workingCount} icon={Wrench} color="#fb923c" sub="Active job cards" />
            </div>

            {/* ── MAP SECTION ── */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
                {/* Map header bar */}
                <div
                    className="flex items-center justify-between px-5 py-3"
                    style={{ background: "rgba(13,13,15,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#16acd4]/15 flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5 text-[#16acd4]" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-white">Live Map</span>
                            <span className="text-zinc-600 text-xs ml-2">
                                {withGps === 0 ? "No GPS data today" : `${withGps} staff tracked`}
                            </span>
                        </div>
                        {/* Pulsing live dot */}
                        <div className="flex items-center gap-1 ml-2">
                            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
                            <span className="text-[10px] text-[#34d399] font-bold uppercase tracking-wider">Live</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Legend */}
                        <div className="hidden sm:flex items-center gap-3 text-[10px] text-zinc-500">
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-sm bg-[#16acd4]/20 border border-[#16acd4]/50 inline-block" />
                                Shop
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] inline-block" />
                                Present
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#f87171] inline-block" />
                                Absent
                            </span>
                        </div>
                        <button
                            onClick={() => setShowMap(v => !v)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "#6b7280"
                            }}
                        >
                            {showMap ? "Hide Map" : "Show Map"}
                        </button>
                    </div>
                </div>

                {/* Map */}
                {showMap && (
                    <div style={{ height: 440, position: "relative" }}>
                        <StaffMap
                            staff={staff}
                            shopLocation={shopLocation}
                            selectedId={selectedId}
                            onSelectStaff={(id) => setSelectedId(prev => (prev === id || !id) ? null : id)}
                        />
                        {/* No GPS overlay */}
                        {withGps === 0 && (
                            <div
                                className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
                                style={{ background: "rgba(9,9,11,0.55)", backdropFilter: "blur(2px)" }}
                            >
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                    style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
                                    <MapPin className="w-6 h-6 text-[#fbbf24]" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-white">No GPS data yet</p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Staff must punch via the app with GPS
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Staff List + Detail Panel ── */}
            <div className={`grid gap-4 ${selectedStaff ? "lg:grid-cols-[1fr,360px]" : "grid-cols-1"}`}>
                <div>
                    {/* Filter tabs */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                        {[
                            { value: "ALL", label: `All (${staff.length})` },
                            { value: "PRESENT", label: `Present (${presentCount})` },
                            { value: "GPS", label: `GPS (${withGps})` },
                            { value: "NO_GPS", label: `No GPS (${staff.length - withGps})` },
                            { value: "ABSENT", label: `Absent (${staff.filter(s => s.todayStatus === "ABSENT").length})` },
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setFilterStatus(tab.value)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
                                style={{
                                    background: filterStatus === tab.value ? "rgba(22,172,212,0.15)" : "rgba(255,255,255,0.05)",
                                    border: filterStatus === tab.value ? "1px solid rgba(22,172,212,0.4)" : "1px solid rgba(255,255,255,0.07)",
                                    color: filterStatus === tab.value ? "#16acd4" : "#6b7280"
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {filteredStaff.length === 0 ? (
                        <div
                            className="flex flex-col items-center justify-center py-14 rounded-2xl gap-4 text-center"
                            style={{ background: "rgba(19,19,21,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{ background: "rgba(22,172,212,0.1)", border: "1px solid rgba(22,172,212,0.2)" }}>
                                <Users className="w-6 h-6 text-[#16acd4]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-zinc-400">No staff found</p>
                                <p className="text-xs text-zinc-600 mt-1">Try changing the filter</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            {filteredStaff.map(s => (
                                <StaffCard
                                    key={s.id}
                                    staff={s}
                                    shopLocation={shopLocation}
                                    isSelected={selectedId === s.id}
                                    onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}
                                />
                            ))}
                        </div>
                    )}

                    {lastUpdated && (
                        <div className="flex items-center gap-2 mt-4 text-xs text-zinc-600">
                            <Clock className="w-3 h-3" />
                            Last updated: {lastUpdated.toLocaleTimeString("en-IN")}
                            {autoRefresh && (
                                <span className="flex items-center gap-1 text-[#34d399]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse inline-block" />
                                    Live
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {selectedStaff && (
                    <StaffDetailPanel
                        staff={selectedStaff}
                        shopLocation={shopLocation}
                        onClose={() => setSelectedId(null)}
                    />
                )}
            </div>

            {/* ── No GPS Warning ── */}
            {staff.length > 0 && withGps === 0 && (
                <div
                    className="flex items-start gap-4 p-4 rounded-2xl"
                    style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}
                >
                    <div className="w-9 h-9 rounded-xl bg-[#fbbf24]/15 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-[#fbbf24]" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#fbbf24]">No GPS location data yet today</p>
                        <p className="text-xs text-zinc-500 mt-1">
                            GPS coordinates are captured when staff punch via the{" "}
                            <strong className="text-zinc-400">Staff App Portal</strong> using geofence auto-detection or GPS verification.
                            Manual punches do not capture location.
                        </p>
                        <Link href="/staff" className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-[#16acd4] hover:underline">
                            Open Staff App Portal
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            )}

            {/* ── Geofence not set ── */}
            {!shopLocation?.latitude && (
                <div
                    className="flex items-start gap-4 p-4 rounded-2xl"
                    style={{ background: "rgba(22,172,212,0.07)", border: "1px solid rgba(22,172,212,0.18)" }}
                >
                    <div className="w-9 h-9 rounded-xl bg-[#16acd4]/15 flex items-center justify-center flex-shrink-0">
                        <Crosshair className="w-4 h-4 text-[#16acd4]" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#16acd4]">Shop location not configured</p>
                        <p className="text-xs text-zinc-500 mt-1">
                            Set your shop's GPS coordinates and geofence radius in Shop Profile to enable distance tracking.
                        </p>
                        <Link href="/shop/billing/profile" className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-[#16acd4] hover:underline">
                            Go to Shop Profile
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
