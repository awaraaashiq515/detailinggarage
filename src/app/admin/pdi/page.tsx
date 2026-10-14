"use client"

import * as React from "react"
import { ClipboardCheck, Plus, Search, Filter, Settings, Loader2, Zap, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PDIPage() {
    const [inspections, setInspections] = React.useState<any[]>([])
    const [evInspections, setEvInspections] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [evLoading, setEvLoading] = React.useState(true)
    const [activeTab, setActiveTab] = React.useState<"regular" | "ev">("regular")
    const [shopFilter, setShopFilter] = React.useState<string>("all")
    const [shops, setShops] = React.useState<any[]>([])

    const fetchInspections = async () => {
        try {
            const url = shopFilter !== "all" ? `/api/admin/pdi/list?shopId=${shopFilter}` : '/api/admin/pdi/list'
            const res = await fetch(url)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setInspections(data)
        } catch (error) {
            console.error("Failed to load inspections:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchEvInspections = async () => {
        try {
            const url = shopFilter !== "all" ? `/api/admin/ev-pdi/list?shopId=${shopFilter}` : '/api/admin/ev-pdi/list'
            const res = await fetch(url)
            if (!res.ok) throw new Error('Failed to fetch EV inspections')
            const data = await res.json()
            setEvInspections(data)
        } catch (error) {
            console.error("Failed to load EV inspections:", error)
        } finally {
            setEvLoading(false)
        }
    }

    React.useEffect(() => {
        fetch('/api/admin/shops').then(r => r.json()).then(d => {
            if (d.shops) setShops(d.shops)
        }).catch(() => {})
    }, [])

    React.useEffect(() => {
        fetchInspections()
        fetchEvInspections()
    }, [shopFilter])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED": return { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981" }
            case "IN_PROGRESS": return { bg: "rgba(255, 75, 85, 0.1)", text: "#ff4b55" }
            case "PENDING": return { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6" }
            default: return { bg: "rgba(100, 116, 139, 0.1)", text: "#64748b" }
        }
    }

    const getResultColor = (result: string) => {
        switch (result) {
            case "PASS": return { bg: "rgba(0,212,255,0.1)", text: "#00d4ff" }
            case "PASS_WITH_OBSERVATIONS": return { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" }
            case "RECHECK": return { bg: "rgba(249,115,22,0.1)", text: "#f97316" }
            case "NOT_RECOMMENDED": return { bg: "rgba(255,68,68,0.1)", text: "#ff4444" }
            default: return { bg: "rgba(100, 116, 139, 0.1)", text: "#64748b" }
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        } catch (e) {
            return dateString
        }
    }

    return (
        <div className="space-y-6 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                            <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                        </div>
                        PDI Inspections
                    </h2>
                    <p className="mt-1 text-zinc-400 font-medium text-xs sm:text-sm">Manage Pre-Delivery Inspections</p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <Link href="/admin/pdi/settings" className="flex-1 sm:flex-initial">
                        <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-all bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 text-xs sm:text-sm shadow-sm">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </button>
                    </Link>
                    <Link href="/admin/pdi/new" className="flex-1 sm:flex-initial">
                        <button className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black uppercase tracking-wider text-[10px] sm:text-xs transition-all bg-accent text-white shadow-lg shadow-accent/30 active:scale-95">
                            <Plus className="w-3.5 h-3.5" />
                            <span>New PDI</span>
                        </button>
                    </Link>
                    <Link href="/admin/pdi/ev-new" className="w-full sm:w-auto">
                        <button
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black uppercase tracking-wider text-[10px] sm:text-xs transition-all active:scale-95 shadow-lg"
                            style={{
                                background: "linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)",
                                color: "#000",
                                boxShadow: "0 4px 20px rgba(0,212,255,0.35)"
                            }}
                        >
                            <Zap className="w-3.5 h-3.5" />
                            <span>⚡ EV PDI</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* EV PDI Banner */}
            <div
                className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer group"
                style={{ background: "linear-gradient(135deg, #07090d 0%, #0d1525 100%)", border: "1px solid rgba(0,212,255,0.2)" }}
                onClick={() => setActiveTab("ev")}
            >
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)" }}>
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-400 mb-0.5">DETAILING GARAGE® | EV PDI</div>
                        <div className="text-sm sm:text-base font-black text-white">Electric Vehicle PDI System</div>
                        <div className="text-[11px] sm:text-xs text-zinc-400 line-clamp-1">150+ Point EV Pre-Delivery Inspection — Battery, Motor, ADAS</div>
                    </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <span
                        className="text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full border"
                        style={{ color: "#00d4ff", borderColor: "rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.08)" }}
                    >
                        {evLoading ? "..." : evInspections.length} Reports
                    </span>
                    <Link href="/admin/pdi/ev-new" onClick={e => e.stopPropagation()}>
                        <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105"
                            style={{ background: "linear-gradient(135deg, #00d4ff, #0066ff)", color: "#000" }}
                        >
                            <Plus className="w-3 h-3" /> New EV PDI
                        </button>
                    </Link>
                    <ChevronRight className="w-4 h-4 text-cyan-400/50 group-hover:text-cyan-400 transition-colors hidden sm:block" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-2xl bg-white border border-slate-100 shadow-sm w-fit">
                <button
                    onClick={() => setActiveTab("regular")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "regular" ? "bg-accent text-white shadow-md" : "text-slate-500 hover:text-slate-900"}`}
                >
                    Standard PDI
                    <span className="ml-2 opacity-60">{inspections.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab("ev")}
                    className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                    style={activeTab === "ev" ? { background: "linear-gradient(135deg, #00d4ff, #0066ff)", color: "#000", boxShadow: "0 2px 12px rgba(0,212,255,0.3)" } : { color: "#64748b" }}
                >
                    <Zap className="w-3.5 h-3.5" /> EV PDI
                    <span className="opacity-60">{evInspections.length}</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by VIN, vehicle, or customer..."
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-accent/40 focus:ring-4 focus:ring-accent/5 text-slate-900 placeholder-slate-400"
                    />
                </div>
                <select
                    value={shopFilter}
                    onChange={(e) => setShopFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer bg-slate-50 border border-slate-100 focus:bg-white focus:border-accent/40 text-slate-800 font-bold"
                >
                    <option value="all">All Workshops</option>
                    {shops.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* ── REGULAR PDI TABLE ── */}
            {activeTab === "regular" && (
                <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-accent" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading inspections...</p>
                            </div>
                        ) : inspections.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                                <div className="w-16 h-16 rounded-[2rem] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center mb-6">
                                    <ClipboardCheck className="w-8 h-8 text-slate-200" />
                                </div>
                                <h3 className="text-slate-900 font-extrabold text-xl tracking-tight">No Inspections Found</h3>
                                <p className="text-slate-500 max-w-xs mt-2 text-sm">Start by creating your first Pre-Delivery Inspection report.</p>
                                <Link href="/admin/pdi/new" className="mt-8">
                                    <Button className="bg-accent hover:bg-accent/90 text-white font-black px-8 h-12 rounded-2xl shadow-lg shadow-accent/20 transition-all uppercase tracking-widest text-[10px]">
                                        Create Inspection
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Mobile Cards (Visible only on mobile/tablet) */}
                                <div className="block md:hidden divide-y divide-slate-100 p-3 space-y-3">
                                    {inspections.map((inspection) => {
                                        const statusColor = getStatusColor(inspection.status)
                                        return (
                                            <div key={inspection.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                                                            {inspection.vehicleMake} {inspection.vehicleModel}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                            {inspection.vehicleYear} • {inspection.customerName}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className="px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase border shrink-0"
                                                        style={{ backgroundColor: statusColor.bg, color: statusColor.text, borderColor: `${statusColor.text}20` }}
                                                    >
                                                        {inspection.status}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-slate-500 pt-1.5 border-t border-slate-200/50">
                                                    <span className="font-mono text-[11px] font-bold text-slate-600">{formatDate(inspection.inspectionDate)}</span>
                                                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">{inspection.vin || 'No VIN'}</span>
                                                </div>

                                                <Link href={`/admin/pdi/view/${inspection.id}`} className="block pt-1">
                                                    <button className="w-full py-2 bg-white hover:bg-accent hover:text-white rounded-lg text-slate-700 font-bold text-xs uppercase tracking-wider transition-all border border-slate-200 shadow-sm text-center">
                                                        View Report →
                                                    </button>
                                                </Link>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                                <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle</th>
                                                <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">VIN</th>
                                                <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                                                <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Workshop</th>
                                                <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                                <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {inspections.map((inspection) => {
                                                const statusColor = getStatusColor(inspection.status)
                                                return (
                                                    <tr key={inspection.id} className="transition-colors hover:bg-slate-50/50 group">
                                                        <td className="px-6 py-5 text-sm text-slate-500 font-bold font-mono tracking-tight">{formatDate(inspection.inspectionDate)}</td>
                                                        <td className="px-6 py-5">
                                                            <div className="text-slate-900 font-extrabold text-sm group-hover:text-accent transition-colors">
                                                                {inspection.vehicleMake} {inspection.vehicleModel}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{inspection.vehicleYear}</div>
                                                        </td>
                                                        <td className="px-6 py-5 text-sm font-bold font-mono text-slate-400">{inspection.vin || 'N/A'}</td>
                                                        <td className="px-6 py-5">
                                                            <div className="text-sm font-bold text-slate-900">{inspection.customerName}</div>
                                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Contract Holder</div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                                                {inspection.shop?.name || "Main Admin HQ"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span
                                                                className="px-3 py-1.5 rounded-full text-[9px] font-black tracking-[0.1em] uppercase border"
                                                                style={{ backgroundColor: statusColor.bg, color: statusColor.text, borderColor: `${statusColor.text}20` }}
                                                            >
                                                                {inspection.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <Link href={`/admin/pdi/view/${inspection.id}`}>
                                                                <button className="px-4 py-2 bg-slate-50 hover:bg-accent/10 rounded-xl text-slate-400 hover:text-accent transition-all border border-slate-100 font-black text-[9px] uppercase tracking-widest shadow-sm">
                                                                    View Report
                                                                </button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── EV PDI TABLE ── */}
            {activeTab === "ev" && (
                <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "#0a0c11", border: "1px solid rgba(0,212,255,0.15)" }}>
                    <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">EV PDI Inspections</span>
                        </div>
                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">150+ Point Electric Vehicle Inspection</span>
                    </div>
                    <div className="overflow-x-auto">
                        {evLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full border-2 border-cyan-400/20 animate-spin" style={{ borderTopColor: "#00d4ff" }} />
                                    <Zap className="w-4 h-4 text-cyan-400 absolute inset-0 m-auto" />
                                </div>
                                <p className="text-cyan-400/50 font-bold uppercase tracking-widest text-[10px]">Loading EV Inspections...</p>
                            </div>
                        ) : evInspections.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(0,212,255,0.05)", border: "1px dashed rgba(0,212,255,0.2)" }}>
                                    <Zap className="w-8 h-8 text-cyan-400/20" />
                                </div>
                                <h3 className="text-white font-extrabold text-xl tracking-tight mb-2">No EV Inspections Yet</h3>
                                <p className="text-gray-600 max-w-xs text-sm">Create your first 150+ point Electric Vehicle PDI report.</p>
                                <Link href="/admin/pdi/ev-new" className="mt-8">
                                    <button
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all hover:scale-105"
                                        style={{ background: "linear-gradient(135deg, #00d4ff, #0066ff)", color: "#000" }}
                                    >
                                        <Zap className="w-4 h-4" /> Create EV PDI Report
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Mobile Cards for EV PDI */}
                                <div className="block md:hidden divide-y divide-white/5 p-3 space-y-3">
                                    {evInspections.map((inspection) => {
                                        const resultColor = getResultColor(inspection.finalResult)
                                        const resultLabels: Record<string, string> = {
                                            PASS: "✅ PASS",
                                            PASS_WITH_OBSERVATIONS: "⚠️ OBS",
                                            RECHECK: "🔶 RECHECK",
                                            NOT_RECOMMENDED: "❌ NOT OK",
                                        }
                                        return (
                                            <div key={inspection.id} className="p-3.5 rounded-xl border border-cyan-400/20 bg-cyan-950/20 space-y-2.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5 leading-snug">
                                                            <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                                            {inspection.vehicleMake} {inspection.vehicleModel}
                                                        </h4>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                            {inspection.vehicleVariant || inspection.vehicleYear} • {inspection.customerName}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border shrink-0"
                                                        style={{ backgroundColor: resultColor.bg, color: resultColor.text, borderColor: `${resultColor.text}30` }}
                                                    >
                                                        {resultLabels[inspection.finalResult] || inspection.finalResult || "—"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-gray-500 pt-1.5 border-t border-white/5">
                                                    <span className="font-mono text-[11px] font-bold text-gray-400">{formatDate(inspection.inspectionDate)}</span>
                                                    <span className="font-mono text-[10px] text-gray-500 truncate max-w-[120px]">{inspection.vin || 'No VIN'}</span>
                                                </div>

                                                <Link href={`/admin/pdi/ev-view/${inspection.id}`} className="block pt-1">
                                                    <button
                                                        className="w-full py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all border text-center"
                                                        style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", borderColor: "rgba(0,212,255,0.3)" }}
                                                    >
                                                        View EV Report →
                                                    </button>
                                                </Link>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Desktop Table for EV PDI */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
                                                <th className="text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-cyan-400/50">Date</th>
                                                <th className="text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-cyan-400/50">EV Vehicle</th>
                                                <th className="text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-cyan-400/50">VIN</th>
                                                <th className="text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-cyan-400/50">Customer</th>
                                                <th className="text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-cyan-400/50">PDI Result</th>
                                                <th className="text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-cyan-400/50">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {evInspections.map((inspection) => {
                                                const resultColor = getResultColor(inspection.finalResult)
                                                const resultLabels: Record<string, string> = {
                                                    PASS: "✅ PASS",
                                                    PASS_WITH_OBSERVATIONS: "⚠️ OBS",
                                                    RECHECK: "🔶 RECHECK",
                                                    NOT_RECOMMENDED: "❌ NOT OK",
                                                }
                                                return (
                                                    <tr
                                                        key={inspection.id}
                                                        className="transition-colors group"
                                                        style={{ borderBottom: "1px solid rgba(0,212,255,0.04)" }}
                                                    >
                                                        <td className="px-6 py-4 text-xs text-gray-500 font-mono">{formatDate(inspection.inspectionDate)}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                                                                <Zap className="w-3 h-3 text-cyan-400/60" />
                                                                {inspection.vehicleMake} {inspection.vehicleModel}
                                                            </div>
                                                            <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-0.5">{inspection.vehicleVariant || inspection.vehicleYear}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-mono text-gray-500">{inspection.vin || 'N/A'}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-white">{inspection.customerName}</div>
                                                            <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">EV Customer</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className="px-3 py-1.5 rounded-full text-[9px] font-black tracking-[0.1em] uppercase border"
                                                                style={{ backgroundColor: resultColor.bg, color: resultColor.text, borderColor: `${resultColor.text}20` }}
                                                            >
                                                                {resultLabels[inspection.finalResult] || inspection.finalResult || "—"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Link href={`/admin/pdi/ev-view/${inspection.id}`}>
                                                                <button
                                                                    className="px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:scale-105 border"
                                                                    style={{ background: "rgba(0,212,255,0.06)", color: "#00d4ff", borderColor: "rgba(0,212,255,0.2)" }}
                                                                >
                                                                    View EV Report
                                                                </button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
