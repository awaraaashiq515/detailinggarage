"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    MessageSquare, Phone, Calendar, Car, Search, Loader2,
    Building2, Clock, CheckCircle2, XCircle, Ban
} from "lucide-react"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDING: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    CONTACTED: { label: "Contacted", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    CLOSED: { label: "Closed", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    SPAM: { label: "Spam", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
}

export default function AdminVehicleInquiriesPage() {
    const [inquiries, setInquiries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterStatus, setFilterStatus] = useState("ALL")

    useEffect(() => {
        fetch("/api/admin/vehicle-inquiries")
            .then(r => r.json())
            .then(d => { if (d.inquiries) setInquiries(d.inquiries) })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filtered = inquiries.filter(inq => {
        const matchStatus = filterStatus === "ALL" || inq.status === filterStatus
        const q = search.toLowerCase()
        const matchSearch = !q || (
            inq.customerName?.toLowerCase().includes(q) ||
            inq.customerMobile?.includes(q) ||
            inq.vehicle?.title?.toLowerCase().includes(q) ||
            inq.dealer?.businessName?.toLowerCase().includes(q) ||
            inq.dealer?.name?.toLowerCase().includes(q)
        )
        return matchStatus && matchSearch
    })

    return (
        <div className="flex-1 p-6 lg:p-8 overflow-auto space-y-6 bg-slate-50 min-h-screen animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 select-none flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-xl border border-accent/20">
                            <MessageSquare className="w-6 h-6 text-accent" />
                        </div>
                        Vehicle Inquiries
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        All customer inquiries submitted on dealer vehicles — see chats, update status
                    </p>
                </div>
                
                {/* Search */}
                <div className="relative group w-full md:w-[400px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-accent transition-colors duration-300" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search customer, vehicle, dealer..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent sm:text-sm transition-all duration-300 shadow-sm hover:border-slate-300"
                    />
                </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-3 flex-wrap">
                {[{ key: "ALL", label: "Total", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label, color: v.color, bg: v.bg, border: v.border }))].map(({ key, label, color, bg, border }) => {
                    const count = key === "ALL" ? inquiries.length : inquiries.filter(i => i.status === key).length
                    const active = filterStatus === key
                    return (
                        <button key={key} onClick={() => setFilterStatus(key)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${active ? `${bg} ${color} ${border} shadow-sm ring-1 ring-current` : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                            {label}
                            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${active ? 'bg-white/50 backdrop-blur-sm' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
                        </button>
                    )
                })}
            </div>

            {/* List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="py-24 flex flex-col items-center gap-4 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Loading Inquiries...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 rounded-[2rem] border border-dashed border-slate-300 bg-white shadow-sm">
                        <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">No Inquiries Found</h3>
                        <p className="text-sm font-medium text-slate-500">
                            {search || filterStatus !== "ALL" ? "Try adjusting filters." : "No vehicle inquiries have been received yet."}
                        </p>
                    </div>
                ) : (
                    filtered.map(inq => {
                        const images = (() => { try { return JSON.parse(inq.vehicle?.images || "[]") } catch { return [] } })()
                        const thumb = images[0] || null
                        const cfg = STATUS_CONFIG[inq.status] || STATUS_CONFIG.PENDING

                        return (
                            <div key={inq.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-3xl transition-all bg-white border border-slate-200 hover:border-accent/30 shadow-sm hover:shadow-md group">

                                {/* Thumbnail */}
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                                    {thumb ? (
                                        <img src={thumb} alt={inq.vehicle?.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <Car className="w-6 h-6 text-slate-300" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap mb-1">
                                        <span className="text-sm font-black text-slate-900 group-hover:text-accent transition-colors">{inq.customerName}</span>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                                            {cfg.label}
                                        </span>
                                    </div>

                                    <p className="text-xs font-bold text-slate-500 truncate mb-2">
                                        <span className="text-slate-900">{inq.vehicle?.make} {inq.vehicle?.model}</span> <span className="text-slate-300 px-1">•</span> {inq.vehicle?.title}
                                    </p>

                                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5" /> <span className="font-mono">{inq.customerMobile}</span>
                                        </span>
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5" />
                                            {inq.dealer?.businessName || inq.dealer?.name}
                                            {inq.dealer?.city ? ` · ${inq.dealer.city}` : ""}
                                        </span>
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="font-mono">{new Date(inq.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                        </span>
                                    </div>

                                    {inq.message && (
                                        <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                            <p className="text-xs font-medium text-slate-600 line-clamp-2 italic">
                                                "{inq.message}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 mt-4 sm:mt-0">
                                    <Link href={`/admin/vehicle-inquiries/${inq.id}`}
                                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent/90 hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto">
                                        <MessageSquare className="w-4 h-4" />
                                        View Chat
                                    </Link>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
