"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MessageSquare, Clock, ChevronRight, Loader2, Users, Filter } from "lucide-react"

interface Inquiry {
    id: string
    subject: string
    description: string
    status: string
    createdAt: string
    updatedAt: string
    user: { id: string; name: string; email: string; mobile?: string }
    _count: { messages: number }
    messages: { message: string; senderType: string; createdAt: string }[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDING: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    IN_PROCESS: { label: "In Process", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    COMPLETED: { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
}

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
            {cfg.label}
        </span>
    )
}

export default function AdminServiceInquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("ALL")

    const statuses = ["ALL", "PENDING", "IN_PROCESS", "COMPLETED", "REJECTED"]

    useEffect(() => {
        const url = filter !== "ALL"
            ? `/api/admin/service-inquiries?status=${filter}`
            : "/api/admin/service-inquiries"
        fetch(url)
            .then(r => r.json())
            .then(d => setInquiries(d.inquiries || []))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [filter])

    const counts: Record<string, number> = { ALL: inquiries.length }
    inquiries.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1 })

    return (
        <div className="flex-1 p-6 lg:p-8 overflow-auto space-y-6 bg-slate-50 min-h-screen animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 select-none flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-xl border border-accent/20">
                            <MessageSquare className="w-6 h-6 text-accent" />
                        </div>
                        Service Inquiries
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        Manage and respond to client inquiries.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-black text-slate-900">{inquiries.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</span>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {statuses.map(s => {
                    const active = filter === s
                    const cfg = s !== "ALL" ? STATUS_CONFIG[s] : null
                    
                    return (
                        <button
                            key={s}
                            onClick={() => { setLoading(true); setFilter(s) }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${active && cfg ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm ring-1 ring-current` : active && !cfg ? `bg-slate-100 text-slate-600 border-slate-200 shadow-sm ring-1 ring-current` : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            {s === "ALL" ? "All" : cfg?.label}
                            {counts[s] !== undefined && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${active ? 'bg-white/50 backdrop-blur-sm' : 'bg-slate-100 text-slate-400'}`}>
                                    {counts[s]}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Table / List */}
            {loading ? (
                <div className="py-24 flex flex-col items-center gap-4 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Loading Inquiries...</p>
                </div>
            ) : inquiries.length === 0 ? (
                <div className="text-center py-24 rounded-[2rem] border border-dashed border-slate-300 bg-white shadow-sm">
                    <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">No Inquiries Found</h3>
                    <p className="text-sm font-medium text-slate-500">No inquiries found for this filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {inquiries.map(inq => {
                        const lastMsg = inq.messages?.[0]
                        return (
                            <Link
                                key={inq.id}
                                href={`/admin/service-inquiries/${inq.id}`}
                                className="group flex items-center gap-4 p-5 rounded-3xl transition-all bg-white border border-slate-200 hover:border-accent/30 shadow-sm hover:shadow-md"
                            >
                                {/* Client avatar */}
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl font-black text-white shadow-inner bg-accent">
                                    {inq.user.name.charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap mb-1">
                                        <span className="text-sm font-black text-slate-900 group-hover:text-accent transition-colors">{inq.user.name}</span>
                                        <StatusBadge status={inq.status} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 truncate mb-2">{inq.subject}</p>
                                    {lastMsg && (
                                        <div className="mt-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest pt-0.5 ${lastMsg.senderType === "ADMIN" ? "text-accent" : "text-slate-400"}`}>
                                                {lastMsg.senderType === "ADMIN" ? "You:" : `${inq.user.name}:`}
                                            </span>
                                            <p className="text-xs font-medium text-slate-600 line-clamp-1 italic">
                                                {lastMsg.message}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="font-mono">{new Date(inq.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                        </span>
                                        {inq._count?.messages > 0 && (
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                                                {inq._count.messages} MSG{inq._count.messages !== 1 ? "S" : ""}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300 font-mono">
                                            #{inq.id.slice(-6).toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 group-hover:border-accent/20 group-hover:text-accent transition-all text-slate-400">
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
