"use client"

import React, { useState, useEffect, useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
    Car,
    Wrench,
    Plus,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    Phone,
    UserCheck,
    ArrowRight,
    ChevronRight,
    RefreshCw,
    X,
    Sparkles,
    FileText,
    Receipt,
    Printer,
    Download,
    Calendar,
    IndianRupee,
    Gauge,
    Shield,
    ClipboardCheck,
    MessageSquare,
    ExternalLink,
    Check,
    ArrowUpRight,
    Eye,
    Layers,
    SlidersHorizontal,
    Tag,
    History
} from "lucide-react"

function fmt(n: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(n)
}

function fmtDate(d?: string | null) {
    if (!d) return "—"
    try {
        const date = new Date(d)
        if (isNaN(date.getTime()) || date.getTime() === 0) return "—"
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    } catch {
        return "—"
    }
}

function VehicleRecordsContent() {
    const searchParams = useSearchParams()

    const [vehicles, setVehicles] = useState<any[]>([])
    const [stats, setStats] = useState<any>({
        totalVehicles: 0,
        inWorkshopCount: 0,
        totalRevenue: 0,
        totalPendingBalance: 0,
        repeatCount: 0,
        topServices: []
    })
    const [staffList, setStaffList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [timeframe, setTimeframe] = useState("all")
    const [sortBy, setSortBy] = useState("recent")
    const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
    const [selectedServiceTag, setSelectedServiceTag] = useState<string | null>(null)

    // Modals
    const [showNewModal, setShowNewModal] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // New Vehicle Form State
    const [form, setForm] = useState({
        vehicleRegNo: "",
        vehicleName: "",
        vehicleChassis: "",
        odometer: "",
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        clientAddress: "",
        jobCategory: "DETAILING",
        services: [] as string[],
        staffId: "",
        notes: "",
        amount: "",
        amountPaid: "",
        paymentMethod: "UPI",
        status: "IN_PROGRESS"
    })
    const [customServiceInput, setCustomServiceInput] = useState("")

    const commonServices = [
        "9H Ceramic Coating",
        "Full Body PPF Wrap",
        "Exterior Foam Wash & Polish",
        "Interior Deep Dry Cleaning",
        "Paint Correction & Buffing",
        "Underbody Anti-Rust Coating",
        "Windshield & Glass Polish",
        "Leather Seat Treatment",
        "Denting & Painting",
        "Wheel & Brake Caliper Polish"
    ]

    useEffect(() => {
        if (searchParams.get("new") === "1") {
            setShowNewModal(true)
        }
    }, [searchParams])

    const fetchVehicles = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (searchQuery) params.set("search", searchQuery)
            if (statusFilter !== "ALL") params.set("status", statusFilter)
            if (timeframe !== "all") params.set("timeframe", timeframe)
            if (sortBy) params.set("sortBy", sortBy)

            const res = await fetch(`/api/shop/billing/vehicles?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setVehicles(data.vehicles || [])
                    if (data.stats) setStats(data.stats)
                }
            }
        } catch (err) {
            console.error("Failed to load vehicle records:", err)
        } finally {
            setLoading(false)
        }
    }

    const fetchStaff = async () => {
        try {
            const res = await fetch("/api/shop/billing/staff")
            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setStaffList(data.staff || [])
                    if (data.staff?.length > 0 && !form.staffId) {
                        setForm(prev => ({ ...prev, staffId: data.staff[0].id }))
                    }
                }
            }
        } catch (err) {
            console.error("Failed to load staff list:", err)
        }
    }

    useEffect(() => {
        fetchVehicles()
    }, [statusFilter, timeframe, sortBy])

    useEffect(() => {
        fetchStaff()
    }, [])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchVehicles()
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Filter by tag if selected
    const filteredVehicles = useMemo(() => {
        if (!selectedServiceTag) return vehicles
        return vehicles.filter(v =>
            v.services?.some((s: string) => s.toLowerCase() === selectedServiceTag.toLowerCase())
        )
    }, [vehicles, selectedServiceTag])

    const handleCreateVehicleRecord = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.vehicleRegNo.trim() || !form.vehicleName.trim()) {
            alert("Vehicle Registration Number and Model Name are required.")
            return
        }

        try {
            setSubmitting(true)
            const res = await fetch("/api/shop/billing/vehicles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    amount: form.amount ? Number(form.amount) : 0,
                    amountPaid: form.amountPaid ? Number(form.amountPaid) : 0
                })
            })

            const data = await res.json()
            if (res.ok && data.success) {
                setShowNewModal(false)
                setForm({
                    vehicleRegNo: "",
                    vehicleName: "",
                    vehicleChassis: "",
                    odometer: "",
                    clientName: "",
                    clientPhone: "",
                    clientEmail: "",
                    clientAddress: "",
                    jobCategory: "DETAILING",
                    services: [],
                    staffId: staffList[0]?.id || "",
                    notes: "",
                    amount: "",
                    amountPaid: "",
                    paymentMethod: "UPI",
                    status: "IN_PROGRESS"
                })
                fetchVehicles()
            } else {
                alert(data.error || "Failed to save vehicle record")
            }
        } catch (err) {
            console.error("Error creating vehicle record:", err)
            alert("An error occurred while saving the record.")
        } finally {
            setSubmitting(false)
        }
    }

    const toggleService = (svc: string) => {
        setForm(prev => {
            const exists = prev.services.includes(svc)
            return {
                ...prev,
                services: exists ? prev.services.filter(s => s !== svc) : [...prev.services, svc]
            }
        })
    }

    const addCustomService = () => {
        if (!customServiceInput.trim()) return
        if (!form.services.includes(customServiceInput.trim())) {
            setForm(prev => ({ ...prev, services: [...prev.services, customServiceInput.trim()] }))
        }
        setCustomServiceInput("")
    }

    const exportToCSV = () => {
        if (vehicles.length === 0) return
        const headers = ["Reg No", "Vehicle Model", "Customer Name", "Customer Phone", "Visits", "Last Service Date", "Total Billed", "Total Paid", "Balance Due", "Status", "Services Done"]
        const rows = vehicles.map(v => [
            `"${v.vehicleRegNo}"`,
            `"${v.vehicleName}"`,
            `"${v.client?.name || ""}"`,
            `"${v.client?.phone || ""}"`,
            v.visitsCount || 1,
            `"${fmtDate(v.lastServiceDate)}"`,
            v.totalBilled || 0,
            v.totalPaid || 0,
            v.balanceDue || 0,
            `"${v.currentStatus}"`,
            `"${(v.services || []).join(", ")}"`
        ])

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `workshop_vehicle_records_${new Date().toISOString().split("T")[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Link href="/shop/billing" className="text-zinc-500 hover:text-zinc-300 text-[11px] font-bold uppercase tracking-widest transition-colors">
                            Billing
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                        <span className="text-[#16acd4] text-[11px] font-bold uppercase tracking-widest">
                            Vehicle Records (गाड़ी खाता)
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#16acd4]/20 via-[#16acd4]/10 to-transparent border border-[#16acd4]/30 flex items-center justify-center text-[#16acd4] shadow-[0_0_20px_rgba(22,172,212,0.15)]">
                            <Car className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                                Vehicle Service Records
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#16acd4]/10 text-[#16acd4] border border-[#16acd4]/20">
                                    Live Garage Ledger
                                </span>
                            </h1>
                            <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
                                Complete work history, jobs, billing ledger & service timeline for every vehicle in your workshop.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={exportToCSV}
                        title="Download CSV Excel sheet of vehicle records"
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                        <Download className="w-4 h-4 text-zinc-400" />
                        <span className="hidden sm:inline">Export Excel</span>
                    </button>

                    <button
                        onClick={() => window.print()}
                        title="Print Vehicle Service Register"
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                        <Printer className="w-4 h-4 text-zinc-400" />
                        <span className="hidden sm:inline">Print Register</span>
                    </button>

                    <button
                        onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-black transition-all hover:opacity-95 shadow-[0_0_20px_rgba(22,172,212,0.3)] shrink-0"
                        style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}
                    >
                        <Plus className="w-4 h-4" />
                        <span>Record Vehicle Work</span>
                    </button>
                </div>
            </div>

            {/* ── KPI Metric Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Total Cars Serviced */}
                <div
                    className="rounded-2xl border border-white/10 p-4 sm:p-5 relative overflow-hidden group hover:border-[#16acd4]/40 transition-all"
                    style={{ background: "#111113" }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Total Cars Serviced</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                                {stats.totalVehicles || 0}
                            </h3>
                            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1 font-medium">
                                <History className="w-3.5 h-3.5 text-[#16acd4]" />
                                {stats.repeatCount || 0} repeat customers
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#16acd4]/10 border border-[#16acd4]/20 flex items-center justify-center text-[#16acd4]">
                            <Car className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#16acd4]/5 rounded-full blur-xl group-hover:bg-[#16acd4]/10 transition-colors pointer-events-none" />
                </div>

                {/* 2. Currently In Workshop */}
                <div
                    className="rounded-2xl border border-white/10 p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all"
                    style={{ background: "#111113" }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">In Workshop Bays</p>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                                {stats.inWorkshopCount || 0}
                            </h3>
                            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1 font-medium">
                                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                                Active work in progress
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Wrench className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                </div>

                {/* 3. Total Service Revenue */}
                <div
                    className="rounded-2xl border border-white/10 p-4 sm:p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all"
                    style={{ background: "#111113" }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Vehicle Revenue</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                                {fmt(stats.totalRevenue || 0)}
                            </h3>
                            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Lifetime total billed
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />
                </div>

                {/* 4. Total Pending Balance / Udhaar */}
                <div
                    className="rounded-2xl border border-white/10 p-4 sm:p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all"
                    style={{ background: "#111113" }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Vehicle Khata Due</p>
                            <h3 className={`text-2xl sm:text-3xl font-black mt-1 ${stats.totalPendingBalance > 0 ? "text-amber-400" : "text-zinc-300"}`}>
                                {fmt(stats.totalPendingBalance || 0)}
                            </h3>
                            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                Outstanding on vehicles
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
                </div>
            </div>

            {/* ── Popular Workshop Services Chips ── */}
            {stats.topServices && stats.topServices.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 shrink-0 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#16acd4]" /> Popular:
                    </span>
                    {stats.topServices.map((svc: any) => {
                        const isSelected = selectedServiceTag?.toLowerCase() === svc.name.toLowerCase()
                        return (
                            <button
                                key={svc.name}
                                onClick={() => setSelectedServiceTag(isSelected ? null : svc.name)}
                                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${
                                    isSelected
                                        ? "bg-[#16acd4] text-black border-[#16acd4] shadow-[0_0_12px_rgba(22,172,212,0.4)]"
                                        : "bg-white/5 hover:bg-white/10 text-zinc-300 border-white/8 hover:border-white/20"
                                }`}
                            >
                                <span>{svc.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? "bg-black/20 text-black" : "bg-white/10 text-zinc-400"}`}>
                                    {svc.count}
                                </span>
                            </button>
                        )
                    })}
                    {selectedServiceTag && (
                        <button
                            onClick={() => setSelectedServiceTag(null)}
                            className="text-xs text-[#16acd4] hover:underline flex items-center gap-1 px-2 py-1"
                        >
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}
                </div>
            )}

            {/* ── Search, Filters & Controls ── */}
            <div className="rounded-2xl border border-white/8 p-3.5 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3" style={{ background: "#111113" }}>
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by Vehicle Number (e.g. DL 01, HR 26), Model (Fortuner, Creta), Client Name, or Phone..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#16acd4] transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Tabs */}
                    <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                        {[
                            { id: "ALL", label: "All Cars" },
                            { id: "IN_WORKSHOP", label: "In Workshop" },
                            { id: "COMPLETED", label: "Completed" },
                            { id: "HAS_BALANCE", label: "Due Balance" },
                            { id: "REPEAT", label: "Repeat (2+)" }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setStatusFilter(tab.id)}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all ${
                                    statusFilter === tab.id
                                        ? "bg-[#16acd4] text-black shadow-md shadow-[#16acd4]/30"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Timeframe */}
                    <select
                        value={timeframe}
                        onChange={e => setTimeframe(e.target.value)}
                        className="bg-white/5 border border-white/10 text-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#16acd4]"
                    >
                        <option value="all">All Time</option>
                        <option value="month">This Month</option>
                        <option value="week">Past 7 Days</option>
                        <option value="today">Today</option>
                    </select>

                    {/* Sort By */}
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-white/5 border border-white/10 text-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#16acd4]"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="amount">Highest Billing</option>
                        <option value="visits">Most Visits</option>
                        <option value="balance">Highest Balance Due</option>
                        <option value="reg">Plate Number (A-Z)</option>
                    </select>

                    {/* View Switcher */}
                    <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setViewMode("cards")}
                            title="Grid Cards"
                            className={`p-1.5 rounded-lg transition-all ${viewMode === "cards" ? "bg-white/15 text-[#16acd4]" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            <Layers className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            title="Register Table View"
                            className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-white/15 text-[#16acd4]" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={fetchVehicles}
                        disabled={loading}
                        title="Refresh records"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#16acd4]" : ""}`} />
                    </button>
                </div>
            </div>

            {/* ── Active Filter Indicator ── */}
            {(selectedServiceTag || searchQuery || statusFilter !== "ALL" || timeframe !== "all") && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 bg-white/5 px-3.5 py-2 rounded-xl border border-white/8">
                    <span>Active Filters:</span>
                    {searchQuery && <span className="bg-[#16acd4]/10 text-[#16acd4] px-2 py-0.5 rounded-md font-mono">"{searchQuery}"</span>}
                    {statusFilter !== "ALL" && <span className="bg-white/10 text-white px-2 py-0.5 rounded-md">{statusFilter}</span>}
                    {selectedServiceTag && <span className="bg-[#16acd4]/10 text-[#16acd4] px-2 py-0.5 rounded-md">{selectedServiceTag}</span>}
                    {timeframe !== "all" && <span className="bg-white/10 text-white px-2 py-0.5 rounded-md">{timeframe}</span>}
                    <button
                        onClick={() => {
                            setSearchQuery("")
                            setStatusFilter("ALL")
                            setSelectedServiceTag(null)
                            setTimeframe("all")
                        }}
                        className="ml-auto text-[#16acd4] hover:underline flex items-center gap-1 font-bold"
                    >
                        Reset All
                    </button>
                </div>
            )}

            {/* ── Vehicles List Section ── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/8 bg-[#111113]">
                    <RefreshCw className="w-8 h-8 text-[#16acd4] animate-spin mb-3" />
                    <p className="text-white font-bold text-base">Loading Vehicle Service Ledger...</p>
                    <p className="text-zinc-500 text-xs mt-1">Fetching all vehicle work cards, invoices and client visits</p>
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/8 bg-[#111113] text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-600 mb-4">
                        <Car className="w-8 h-8" />
                    </div>
                    <h3 className="text-white font-bold text-lg">No Vehicle Records Found</h3>
                    <p className="text-zinc-400 text-xs sm:text-sm max-w-md mt-1 mb-6">
                        {searchQuery || statusFilter !== "ALL"
                            ? "No vehicles matched your current search filters. Try clearing your search."
                            : "No vehicles have been logged in your workshop yet. Click below to record your first vehicle service."}
                    </p>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-black shadow-lg shadow-[#16acd4]/20"
                        style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}
                    >
                        <Plus className="w-4 h-4" /> Record Vehicle Service
                    </button>
                </div>
            ) : viewMode === "cards" ? (
                /* ── CARDS GRID VIEW ── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredVehicles.map(veh => {
                        const inWorkshop = veh.currentStatus === "IN_WORKSHOP"
                        const hasDue = veh.balanceDue > 0
                        return (
                            <div
                                key={veh.id}
                                className="rounded-2xl border border-white/8 hover:border-[#16acd4]/40 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
                                style={{ background: "#111113" }}
                            >
                                <div className="p-4 sm:p-5 flex flex-col gap-4">
                                    {/* Card Top: Reg Plate & Status */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            {/* Indian HSRP License Plate Badge */}
                                            <div className="inline-flex items-stretch rounded-lg border-2 border-black bg-white shadow-md overflow-hidden">
                                                <div className="bg-blue-700 px-1.5 flex flex-col items-center justify-center text-[8px] font-black text-white leading-tight">
                                                    <span>🇮🇳</span>
                                                    <span>IND</span>
                                                </div>
                                                <div className="px-3 py-1 font-mono font-black text-sm tracking-wider text-black uppercase">
                                                    {veh.vehicleRegNo}
                                                </div>
                                            </div>

                                            <h3 className="text-base sm:text-lg font-black text-white mt-2 group-hover:text-[#16acd4] transition-colors leading-snug">
                                                {veh.vehicleName}
                                            </h3>

                                            {veh.vehicleChassis && (
                                                <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                                                    VIN: {veh.vehicleChassis}
                                                </p>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            {inWorkshop ? (
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    In Workshop
                                                </span>
                                            ) : hasDue ? (
                                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Due: {fmt(veh.balanceDue)}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                    Delivered
                                                </span>
                                            )}

                                            <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                                {veh.visitsCount || 1} {veh.visitsCount === 1 ? "Visit" : "Visits"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Client Row */}
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-zinc-200 truncate">{veh.client?.name || "Walk-in Customer"}</p>
                                            <p className="text-[11px] font-mono text-zinc-400">{veh.client?.phone || "No Phone"}</p>
                                        </div>
                                        {veh.client?.phone && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <a
                                                    href={`tel:${veh.client.phone}`}
                                                    title="Call Customer"
                                                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                </a>
                                                <a
                                                    href={`https://wa.me/${veh.client.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(veh.client.name)},%20greeting%20from%20our%20workshop%20regarding%20your%20vehicle%20${encodeURIComponent(veh.vehicleRegNo)}.`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Send WhatsApp Message"
                                                    className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Services Done Tags */}
                                    {veh.services && veh.services.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {veh.services.slice(0, 3).map((svc: string, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className="text-[10px] font-medium bg-[#16acd4]/10 text-[#16acd4] border border-[#16acd4]/20 px-2 py-0.5 rounded-md"
                                                >
                                                    {svc}
                                                </span>
                                            ))}
                                            {veh.services.length > 3 && (
                                                <span className="text-[10px] font-medium bg-white/5 text-zinc-400 px-2 py-0.5 rounded-md">
                                                    +{veh.services.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Work Details & Metrics Strip */}
                                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                                        <div className="flex items-center gap-1.5 text-zinc-400">
                                            <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                            <span>Last: <strong className="text-zinc-300">{fmtDate(veh.lastServiceDate)}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-zinc-400 justify-end">
                                            <Gauge className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                            <span>Odo: <strong className="text-zinc-300">{veh.odometer ? `${veh.odometer} KM` : "—"}</strong></span>
                                        </div>
                                    </div>

                                    {/* Financial Ledger Row */}
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                                        <div>
                                            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Total Billed</span>
                                            <p className="font-black text-white text-sm">{fmt(veh.totalBilled || 0)}</p>
                                        </div>
                                        <div>
                                            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Paid</span>
                                            <p className="font-bold text-emerald-400 text-sm">{fmt(veh.totalPaid || 0)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Balance</span>
                                            <p className={`font-black text-sm ${veh.balanceDue > 0 ? "text-amber-400" : "text-zinc-400"}`}>
                                                {fmt(veh.balanceDue || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer Button */}
                                <button
                                    onClick={() => setSelectedVehicle(veh)}
                                    className="w-full py-2.5 px-4 bg-white/5 hover:bg-[#16acd4]/15 border-t border-white/8 hover:border-[#16acd4]/30 text-xs font-bold text-zinc-300 hover:text-[#16acd4] flex items-center justify-center gap-1.5 transition-all"
                                >
                                    <span>View Complete Vehicle Khata & History</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            ) : (
                /* ── DENSE REGISTER TABLE VIEW ── */
                <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "#111113" }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-white/8 text-zinc-400 uppercase tracking-wider text-[10px] font-bold bg-white/5">
                                    <th className="py-3 px-4">Vehicle Plate No</th>
                                    <th className="py-3 px-4">Make & Model</th>
                                    <th className="py-3 px-4">Customer Details</th>
                                    <th className="py-3 px-4">Visits</th>
                                    <th className="py-3 px-4">Last Service</th>
                                    <th className="py-3 px-4">Services Done</th>
                                    <th className="py-3 px-4">Total Billed</th>
                                    <th className="py-3 px-4">Balance Due</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredVehicles.map(veh => {
                                    const inWorkshop = veh.currentStatus === "IN_WORKSHOP"
                                    return (
                                        <tr key={veh.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="py-3 px-4">
                                                <div className="inline-block px-2 py-0.5 rounded font-mono font-black text-xs bg-white text-black border border-black shadow-sm">
                                                    {veh.vehicleRegNo}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-white group-hover:text-[#16acd4] transition-colors">{veh.vehicleName}</p>
                                                {veh.odometer && <p className="text-[10px] text-zinc-500 font-mono">{veh.odometer} KM</p>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-semibold text-zinc-200">{veh.client?.name || "Walk-in"}</p>
                                                <p className="text-[10px] font-mono text-zinc-500">{veh.client?.phone || "—"}</p>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-zinc-300">
                                                {veh.visitsCount || 1}
                                            </td>
                                            <td className="py-3 px-4 text-zinc-400">
                                                {fmtDate(veh.lastServiceDate)}
                                            </td>
                                            <td className="py-3 px-4 max-w-[200px]">
                                                <p className="text-zinc-300 truncate" title={(veh.services || []).join(", ")}>
                                                    {(veh.services || []).join(", ") || "—"}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 font-black text-white">
                                                {fmt(veh.totalBilled || 0)}
                                            </td>
                                            <td className="py-3 px-4 font-bold">
                                                <span className={veh.balanceDue > 0 ? "text-amber-400" : "text-zinc-500"}>
                                                    {fmt(veh.balanceDue || 0)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {inWorkshop ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                        In Workshop
                                                    </span>
                                                ) : veh.balanceDue > 0 ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                                        Balance Due
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/15 text-zinc-400">
                                                        Delivered
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => setSelectedVehicle(veh)}
                                                    className="px-2.5 py-1 rounded-lg bg-[#16acd4]/10 hover:bg-[#16acd4]/20 text-[#16acd4] font-bold text-[11px] transition-colors"
                                                >
                                                    View History
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── MODAL: VEHICLE COMPLETE DOSSIER & SERVICE TIMELINE ── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {selectedVehicle && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                    <div
                        className="w-full max-w-4xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl my-auto animate-in fade-in duration-200"
                        style={{ background: "#111113" }}
                    >
                        {/* Modal Header */}
                        <div className="p-4 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-white/5">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="inline-flex items-stretch rounded-lg border-2 border-black bg-white shadow overflow-hidden">
                                        <div className="bg-blue-700 px-1.5 flex flex-col items-center justify-center text-[7px] font-black text-white leading-tight">
                                            <span>IND</span>
                                        </div>
                                        <div className="px-2.5 py-0.5 font-mono font-black text-sm text-black">
                                            {selectedVehicle.vehicleRegNo}
                                        </div>
                                    </div>
                                    {selectedVehicle.currentStatus === "IN_WORKSHOP" && (
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Active In Workshop
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-white">{selectedVehicle.vehicleName}</h2>
                                <p className="text-zinc-400 text-xs mt-0.5">
                                    Customer: <strong className="text-zinc-200">{selectedVehicle.client?.name || "Walk-in"}</strong>
                                    {selectedVehicle.client?.phone ? ` • ${selectedVehicle.client.phone}` : ""}
                                    {selectedVehicle.odometer ? ` • Odo: ${selectedVehicle.odometer} KM` : ""}
                                    {selectedVehicle.vehicleChassis ? ` • VIN: ${selectedVehicle.vehicleChassis}` : ""}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedVehicle(null)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Financial Ledger Summary Strip */}
                        <div className="grid grid-cols-3 border-b border-white/8 divide-x divide-white/8 bg-black/40 text-center py-3">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-zinc-500">Total Billed</p>
                                <p className="text-base sm:text-lg font-black text-white mt-0.5">{fmt(selectedVehicle.totalBilled || 0)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-zinc-500">Total Paid</p>
                                <p className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">{fmt(selectedVehicle.totalPaid || 0)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-zinc-500">Balance Pending</p>
                                <p className={`text-base sm:text-lg font-black mt-0.5 ${selectedVehicle.balanceDue > 0 ? "text-amber-400" : "text-zinc-400"}`}>
                                    {fmt(selectedVehicle.balanceDue || 0)}
                                </p>
                            </div>
                        </div>

                        {/* Modal Body: Tabs & Timeline */}
                        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-6">
                            {/* Invoices & Bills Section */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-[#16acd4]" />
                                    Invoices & Billing History ({selectedVehicle.invoices?.length || 0})
                                </h4>

                                {selectedVehicle.invoices && selectedVehicle.invoices.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {selectedVehicle.invoices.map((inv: any) => (
                                            <div
                                                key={inv.id}
                                                className="p-3.5 rounded-xl border border-white/8 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/15 transition-all"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-xs text-[#16acd4]">{inv.invoiceNumber}</span>
                                                        <span className="text-[10px] font-semibold text-zinc-500">{fmtDate(inv.date)}</span>
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                                            inv.status === "PAID"
                                                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                        }`}>
                                                            {inv.status}
                                                        </span>
                                                    </div>
                                                    {inv.items && inv.items.length > 0 && (
                                                        <p className="text-xs text-zinc-300 mt-1">
                                                            {inv.items.map((i: any) => i.name).join(", ")}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 self-end sm:self-center">
                                                    <div className="text-right">
                                                        <p className="font-black text-white text-sm">{fmt(inv.grandTotal)}</p>
                                                        {inv.balanceDue > 0 && (
                                                            <p className="text-[10px] text-amber-400 font-bold">Due: {fmt(inv.balanceDue)}</p>
                                                        )}
                                                    </div>
                                                    <Link
                                                        href={`/shop/billing/invoices`}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
                                                        title="View Invoice in Billing"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-500 italic p-3 bg-white/5 rounded-xl">No invoices billed for this vehicle yet.</p>
                                )}
                            </div>

                            {/* Workshop Job Cards Section */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-emerald-400" />
                                    Workshop Job Cards ({selectedVehicle.jobCards?.length || 0})
                                </h4>

                                {selectedVehicle.jobCards && selectedVehicle.jobCards.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedVehicle.jobCards.map((job: any) => (
                                            <div
                                                key={job.id}
                                                className="p-3.5 rounded-xl border border-white/8 bg-white/5 space-y-2 hover:border-white/15 transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-xs text-emerald-400">{job.jobNumber}</span>
                                                        <span className="text-[10px] text-zinc-500">{fmtDate(job.createdAt)}</span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-zinc-300">
                                                            {job.jobCategory}
                                                        </span>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                                        job.status === "COMPLETED" || job.status === "DELIVERED"
                                                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                    }`}>
                                                        {job.status}
                                                    </span>
                                                </div>

                                                {job.technician && (
                                                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                                                        <UserCheck className="w-3.5 h-3.5 text-[#16acd4]" />
                                                        Technician: <strong className="text-zinc-200">{job.technician.name}</strong> ({job.technician.role})
                                                    </p>
                                                )}

                                                {job.workSummary && (
                                                    <p className="text-xs text-zinc-300 bg-black/30 p-2 rounded-lg font-mono">
                                                        {job.workSummary}
                                                    </p>
                                                )}

                                                {job.tasks && job.tasks.length > 0 && (
                                                    <div className="pt-2">
                                                        <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">
                                                            Checklist Tasks ({job.completedTasksCount}/{job.totalTasksCount})
                                                        </p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                            {job.tasks.map((t: any) => (
                                                                <div key={t.id} className="flex items-center gap-1.5 text-xs text-zinc-300">
                                                                    <div className={`w-3.5 h-3.5 rounded-md flex items-center justify-center shrink-0 ${t.isDone ? "bg-emerald-500 text-black" : "border border-zinc-600"}`}>
                                                                        {t.isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                                    </div>
                                                                    <span className={t.isDone ? "line-through text-zinc-500" : ""}>{t.task}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-500 italic p-3 bg-white/5 rounded-xl">No job cards assigned yet.</p>
                                )}
                            </div>

                            {/* PDI or Insurance Claims (if any) */}
                            {((selectedVehicle.pdiReports && selectedVehicle.pdiReports.length > 0) ||
                                (selectedVehicle.insuranceClaims && selectedVehicle.insuranceClaims.length > 0)) && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-purple-400" />
                                        Inspections & Insurance Records
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedVehicle.pdiReports?.map((p: any) => (
                                            <div key={p.id} className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs flex items-center justify-between">
                                                <span>PDI Inspection Completed ({fmtDate(p.date)})</span>
                                                {p.pdfUrl && (
                                                    <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:underline flex items-center gap-1">
                                                        View PDF <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                        {selectedVehicle.insuranceClaims?.map((c: any) => (
                                            <div key={c.id} className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-center justify-between">
                                                <span>Insurance Claim: {c.claimNumber}</span>
                                                <span className="font-bold text-blue-400">{c.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="p-4 sm:p-5 border-t border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-3">
                            {selectedVehicle.client?.phone ? (
                                <a
                                    href={`https://wa.me/${selectedVehicle.client.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(selectedVehicle.client.name)},%20here%20is%20the%20complete%20service%20history%20summary%20for%20your%20vehicle%20${encodeURIComponent(selectedVehicle.vehicleRegNo)}%20(${encodeURIComponent(selectedVehicle.vehicleName)}):%20Total%20Visits:%20${selectedVehicle.visitsCount},%20Total%20Services:%20${encodeURIComponent(selectedVehicle.services?.join(", "))}.%20Total%20Billed:%20${fmt(selectedVehicle.totalBilled)}.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                                >
                                    <MessageSquare className="w-4 h-4" /> Share on WhatsApp
                                </a>
                            ) : <div />}

                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/shop/billing/invoices/new`}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                                >
                                    <Receipt className="w-3.5 h-3.5" /> + Create Bill
                                </Link>

                                <Link
                                    href={`/shop/billing/jobs?new=1`}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black transition-all hover:opacity-90"
                                    style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}
                                >
                                    <Wrench className="w-3.5 h-3.5" /> + New Job Card
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── MODAL: QUICK RECORD VEHICLE WORK ── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {showNewModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                    <div
                        className="w-full max-w-2xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl my-auto animate-in fade-in duration-200"
                        style={{ background: "#111113" }}
                    >
                        {/* Header */}
                        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-[#16acd4]/10 border border-[#16acd4]/20 flex items-center justify-center text-[#16acd4]">
                                    <Car className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-black text-white">Record Vehicle Service Work</h3>
                                    <p className="text-zinc-400 text-xs">Log vehicle details, services performed & billing into your records</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowNewModal(false)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreateVehicleRecord} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Vehicle Details Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Vehicle Plate Number *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. DL 01 AB 1234 or HR 26 DQ 5678"
                                        value={form.vehicleRegNo}
                                        onChange={e => setForm({ ...form, vehicleRegNo: e.target.value.toUpperCase() })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold text-sm placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Vehicle Model / Make *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Toyota Fortuner, Creta SX, Thar"
                                        value={form.vehicleName}
                                        onChange={e => setForm({ ...form, vehicleName: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            {/* Odometer & Chassis */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Current Odometer (KM)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 45,000"
                                        value={form.odometer}
                                        onChange={e => setForm({ ...form, odometer: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Chassis / VIN Number (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. MA3EWB..."
                                        value={form.vehicleChassis}
                                        onChange={e => setForm({ ...form, vehicleChassis: e.target.value.toUpperCase() })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            {/* Customer Details Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/8">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Customer / Owner Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Customer Full Name"
                                        value={form.clientName}
                                        onChange={e => setForm({ ...form, clientName: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Customer Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        value={form.clientPhone}
                                        onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            {/* Service Category & Assigned Technician */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Job Category
                                    </label>
                                    <select
                                        value={form.jobCategory}
                                        onChange={e => setForm({ ...form, jobCategory: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#16acd4]"
                                    >
                                        <option value="DETAILING">Ceramic & Detailing</option>
                                        <option value="PPF_WRAP">PPF & Paint Protection Film</option>
                                        <option value="WASHING">Car Wash & Dry Cleaning</option>
                                        <option value="PAINT_DENT">Denting & Painting</option>
                                        <option value="MECHANICAL">Mechanical & Periodic Service</option>
                                        <option value="ELECTRICAL">Electrical & Lighting</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Assign Technician
                                    </label>
                                    <select
                                        value={form.staffId}
                                        onChange={e => setForm({ ...form, staffId: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#16acd4]"
                                    >
                                        <option value="">-- No Technician (Unassigned) --</option>
                                        {staffList.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({s.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Common Services Selector */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                                    Services Performed on Vehicle
                                </label>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {commonServices.map(svc => {
                                        const isSelected = form.services.includes(svc)
                                        return (
                                            <button
                                                type="button"
                                                key={svc}
                                                onClick={() => toggleService(svc)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                                                    isSelected
                                                        ? "bg-[#16acd4] text-black border-[#16acd4]"
                                                        : "bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10"
                                                }`}
                                            >
                                                {isSelected ? "✓ " : "+ "}
                                                {svc}
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add custom service name..."
                                        value={customServiceInput}
                                        onChange={e => setCustomServiceInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                addCustomService()
                                            }
                                        }}
                                        className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomService}
                                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Billing & Payment Options */}
                            <div className="p-3.5 rounded-xl bg-black/40 border border-white/8 space-y-3">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                    <Receipt className="w-3.5 h-3.5 text-[#16acd4]" />
                                    Billing & Khata Details
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                                            Total Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={form.amount}
                                            onChange={e => setForm({ ...form, amount: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold focus:outline-none focus:border-[#16acd4]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                                            Amount Paid (₹)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={form.amountPaid}
                                            onChange={e => setForm({ ...form, amountPaid: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-emerald-400 text-sm font-bold focus:outline-none focus:border-[#16acd4]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                                            Payment Method
                                        </label>
                                        <select
                                            value={form.paymentMethod}
                                            onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#16acd4]"
                                        >
                                            <option value="UPI">UPI / GPay / PhonePe</option>
                                            <option value="CASH">Cash</option>
                                            <option value="CARD">Debit / Credit Card</option>
                                            <option value="BANK_TRANSFER">Bank NEFT/RTGS</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Remarks */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Current Vehicle Status
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#16acd4]"
                                    >
                                        <option value="IN_PROGRESS">🟢 In Workshop (Work Active)</option>
                                        <option value="COMPLETED">🔵 Completed (Ready for Delivery)</option>
                                        <option value="DELIVERED">✅ Handed Over / Delivered</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Work Notes / Remarks
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Scratches on left fender, delivered clean"
                                        value={form.notes}
                                        onChange={e => setForm({ ...form, notes: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowNewModal(false)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-black shadow-lg shadow-[#16acd4]/30 disabled:opacity-50"
                                    style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-3.5 h-3.5" /> Save Vehicle Record
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ShopVehicleRecordsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
                <RefreshCw className="w-8 h-8 text-[#16acd4] animate-spin" />
            </div>
        }>
            <VehicleRecordsContent />
        </Suspense>
    )
}
