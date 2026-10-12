"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
    Plus, Search, RefreshCcw, FileText, TrendingUp,
    ArrowRightLeft, IndianRupee, ClipboardList, FileDown,
    ChevronRight, Car, Calendar, MoreVertical, Eye, Pencil, Trash2
} from "lucide-react"

type Client = { name: string }
type Quotation = {
    id: string
    invoiceNumber: string
    type: string
    date: string
    dueDate: string | null
    status: string
    subTotal: number
    taxTotal: number
    grandTotal: number
    amountPaid: number
    client: Client
    vehicleName: string | null
    vehicleRegNo: string | null
    items: { id: string; name: string; total: number }[]
}

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
    UNPAID: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    PAID: "bg-green-500/10 text-green-400 border border-green-500/20",
    CANCELLED: "bg-red-900/20 text-red-500 border border-red-900/20",
}

function fmt(n: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
}
function fmtDate(d: string | null) {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })
}
function statusLabel(s: string) {
    if (s === "UNPAID") return "Sent"
    if (s === "PAID") return "Accepted"
    return s
}

// ─── Mobile Quotation Card ────────────────────────────────────────────────
function QuotationCard({
    q,
    converting,
    onConvert,
    onDelete,
}: {
    q: Quotation
    converting: string | null
    onConvert: (q: Quotation) => void
    onDelete: (id: string) => void
}) {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div className="rounded-2xl border border-white/8 overflow-hidden transition-all active:scale-[0.99]" style={{ background: "#111113" }}>
            {/* Card Header */}
            <div className="flex items-start justify-between px-4 pt-4 pb-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-1 w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-sm text-purple-400">{q.invoiceNumber}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLORS[q.status] || STATUS_COLORS.DRAFT}`}>
                                {statusLabel(q.status)}
                            </span>
                        </div>
                        <p className="text-white font-bold text-[15px] mt-0.5">{q.client.name}</p>
                        {q.vehicleName && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <Car className="w-3 h-3 text-zinc-600 shrink-0" />
                                <span className="text-xs text-zinc-400">{q.vehicleName}</span>
                                {q.vehicleRegNo && (
                                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">{q.vehicleRegNo}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3-dot menu */}
                <div className="relative shrink-0 ml-2">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 active:bg-white/10"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                            <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-white/10 shadow-2xl overflow-hidden" style={{ background: "#1a1a1c" }}>
                                <Link href={`/shop/billing/invoices/${q.id}`} onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors">
                                    <Eye className="w-4 h-4 text-zinc-400" /> View
                                </Link>
                                <Link href={`/shop/billing/invoices/${q.id}/edit`} onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors">
                                    <Pencil className="w-4 h-4 text-zinc-400" /> Edit
                                </Link>
                                <a href={`/api/admin/billing/invoices/${q.id}/pdf`} target="_blank" rel="noopener noreferrer"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-emerald-400 hover:bg-white/5 transition-colors">
                                    <FileDown className="w-4 h-4" /> Download PDF
                                </a>
                                <button onClick={() => { setMenuOpen(false); onConvert(q) }}
                                    disabled={converting === q.id}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#16acd4] hover:bg-white/5 transition-colors disabled:opacity-40">
                                    <ArrowRightLeft className="w-4 h-4" />
                                    {converting === q.id ? "Converting..." : "→ Convert to Invoice"}
                                </button>
                                <button onClick={() => { setMenuOpen(false); onDelete(q.id) }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-white/6" />

            {/* Amount + Date */}
            <div className="flex items-center justify-between px-4 py-3">
                <p className="text-2xl font-black text-white font-mono">{fmt(q.grandTotal)}</p>
                <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 justify-end">
                        <Calendar className="w-3 h-3" />
                        <span>{fmtDate(q.date)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{q.items.length} line items</p>
                </div>
            </div>

            {/* Action buttons */}
            <div className="border-t border-white/6 flex divide-x divide-white/6">
                <Link href={`/shop/billing/invoices/${q.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-purple-400 hover:bg-purple-500/10 transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View
                </Link>
                <a href={`/api/admin/billing/invoices/${q.id}/pdf`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                    <FileDown className="w-3.5 h-3.5" /> PDF
                </a>
                <button onClick={() => onConvert(q)} disabled={converting === q.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-[#16acd4] hover:bg-[#16acd4]/10 transition-colors disabled:opacity-40">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    {converting === q.id ? "..." : "→ Invoice"}
                </button>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function ShopQuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("")
    const [clientId, setClientId] = useState("")
    const [clients, setClients] = useState<{ id: string; name: string }[]>([])
    const [converting, setConverting] = useState<string | null>(null)
    const [showFilters, setShowFilters] = useState(false)

    const fetchQuotations = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({ type: "QUOTATION" })
        if (search) params.set("search", search)
        if (status) params.set("status", status)
        if (clientId) params.set("clientId", clientId)
        const res = await fetch(`/api/admin/billing/invoices?${params.toString()}`)
        const data = await res.json()
        if (data.success) setQuotations(data.invoices)
        setLoading(false)
    }, [search, status, clientId])

    useEffect(() => {
        fetchQuotations()
        fetch("/api/admin/billing/clients").then(r => r.json()).then(d => { if (d.success) setClients(d.clients) })
    }, [])

    const handleConvertToInvoice = async (q: Quotation) => {
        if (!confirm(`Convert "${q.invoiceNumber}" to a Tax Invoice?`)) return
        setConverting(q.id)
        const res = await fetch("/api/admin/billing/invoices", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: q.id, action: "convert", targetType: "INVOICE" }),
        })
        const data = await res.json()
        setConverting(null)
        if (data.success) { alert(`✅ Invoice created: ${data.invoice.invoiceNumber}`); fetchQuotations() }
        else alert(data.error || "Conversion failed")
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this quotation?")) return
        await fetch(`/api/admin/billing/invoices?id=${id}`, { method: "DELETE" })
        fetchQuotations()
    }

    const totalValue = quotations.reduce((s, q) => s + q.grandTotal, 0)
    const pendingCount = quotations.filter(q => q.status === "DRAFT" || q.status === "UNPAID").length

    return (
        <div className="w-full flex flex-col gap-4 lg:gap-5">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Billing</span>
                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Quotations</span>
                    </div>
                    <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" /> Quotations
                    </h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Create &amp; convert quotations into tax invoices</p>
                </div>
                <Link href="/shop/billing/quotations/new"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-lg bg-purple-600 hover:bg-purple-500 shrink-0">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Quotation</span>
                    <span className="sm:hidden">New</span>
                </Link>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total", value: quotations.length, icon: ClipboardList, color: "#c084fc" },
                    { label: "Pending", value: pendingCount, icon: TrendingUp, color: "#fb923c" },
                    { label: "Total Value", value: fmt(totalValue), icon: IndianRupee, color: "#c084fc" },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl border border-white/8 p-3.5 lg:p-5 flex flex-col gap-2 transition-all" style={{ background: "#111113" }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.color + "18" }}>
                            <s.icon className="w-4 h-4" style={{ color: s.color }} />
                        </div>
                        <div>
                            <p className="text-lg lg:text-2xl font-black text-white leading-none">{s.value}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Search + Filter ── */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && fetchQuotations()}
                        type="text"
                        placeholder="Search quotation, client, vehicle..."
                        className="w-full rounded-xl border border-white/10 bg-[#111113] text-white text-sm px-4 py-3 pl-10 outline-none focus:border-purple-500/50 placeholder:text-zinc-600"
                    />
                </div>
                <button onClick={() => setShowFilters(!showFilters)}
                    className={`px-3.5 py-3 rounded-xl border transition-all text-xs font-bold ${showFilters ? "border-purple-500/40 bg-purple-500/10 text-purple-400" : "border-white/10 bg-[#111113] text-zinc-400"}`}>
                    Filter
                </button>
                <button onClick={fetchQuotations}
                    className="px-3.5 py-3 rounded-xl border border-white/10 bg-[#111113] text-zinc-400 transition-all hover:border-white/20">
                    <RefreshCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="rounded-2xl border border-white/8 p-4 flex flex-wrap gap-3" style={{ background: "#111113" }}>
                    <select value={clientId} onChange={e => setClientId(e.target.value)}
                        className="flex-1 min-w-[140px] bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2.5 rounded-xl outline-none">
                        <option value="">All Clients</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        className="flex-1 min-w-[140px] bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2.5 rounded-xl outline-none">
                        <option value="">All Statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="UNPAID">Sent</option>
                        <option value="PAID">Accepted</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button onClick={fetchQuotations}
                        className="flex items-center gap-1.5 text-xs bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-purple-500 transition-all">
                        <Search className="w-3 h-3" /> Apply
                    </button>
                    <button onClick={() => { setSearch(""); setStatus(""); setClientId("") }}
                        className="flex items-center gap-1.5 text-xs border border-white/10 text-zinc-400 px-4 py-2.5 rounded-xl font-bold hover:border-white/30 hover:text-white transition-all">
                        <RefreshCcw className="w-3 h-3" /> Reset
                    </button>
                </div>
            )}

            {/* ── MOBILE: Cards ── */}
            <div className="lg:hidden">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-2xl border border-white/5 h-40 animate-pulse" style={{ background: "#111113" }} />
                        ))}
                    </div>
                ) : quotations.length === 0 ? (
                    <div className="rounded-2xl border border-white/8 py-20 flex flex-col items-center justify-center" style={{ background: "#111113" }}>
                        <ClipboardList className="w-12 h-12 text-zinc-700 mb-3" />
                        <p className="text-white font-bold">No quotations found</p>
                        <p className="text-zinc-500 text-sm mt-1">Create your first quotation</p>
                        <Link href="/shop/billing/quotations/new"
                            className="inline-flex items-center gap-2 mt-5 px-5 py-3 rounded-xl text-sm font-bold text-white bg-purple-600">
                            <Plus className="w-4 h-4" /> Create Quotation
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {quotations.map(q => (
                            <QuotationCard key={q.id} q={q} converting={converting} onConvert={handleConvertToInvoice} onDelete={handleDelete} />
                        ))}
                        <div className="rounded-2xl border border-purple-500/20 p-4 flex items-center justify-between" style={{ background: "#c084fc10" }}>
                            <div>
                                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Total ({quotations.length})</p>
                                <p className="text-xl font-black text-purple-400 mt-0.5">{fmt(totalValue)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-zinc-500">Pending: <span className="text-amber-400 font-bold">{pendingCount}</span></p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── DESKTOP: Table ── */}
            <div className="hidden lg:block bg-[#121214] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                        <thead className="sticky top-0 bg-[#1a1a1c] border-b border-white/10">
                            <tr>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 w-8">#</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Quotation No.</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Client</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Vehicle</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Date</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Total</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-zinc-300 divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={8} className="p-12 text-center text-zinc-500">Loading quotations...</td></tr>
                            ) : quotations.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-16 text-center">
                                        <ClipboardList className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                                        <p className="text-zinc-500 font-medium">No quotations found</p>
                                        <Link href="/shop/billing/quotations/new"
                                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold">
                                            <Plus className="w-3 h-3" /> Create Quotation
                                        </Link>
                                    </td>
                                </tr>
                            ) : quotations.map((q, i) => (
                                <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-3 py-3.5 text-zinc-600">{i + 1}</td>
                                    <td className="px-3 py-3.5 font-mono font-bold text-purple-400">{q.invoiceNumber}</td>
                                    <td className="px-3 py-3.5 font-medium text-white">{q.client.name}</td>
                                    <td className="px-3 py-3.5 text-zinc-400">
                                        {q.vehicleName ? (
                                            <div>
                                                <p className="font-semibold text-white text-[11px]">{q.vehicleName}</p>
                                                {q.vehicleRegNo && <p className="text-[10px] font-mono text-purple-400">{q.vehicleRegNo}</p>}
                                            </div>
                                        ) : <span className="text-zinc-600">-</span>}
                                    </td>
                                    <td className="px-3 py-3.5 text-zinc-400">{fmtDate(q.date)}</td>
                                    <td className="px-3 py-3.5 text-right font-mono font-bold text-white">{fmt(q.grandTotal)}</td>
                                    <td className="px-3 py-3.5">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_COLORS[q.status] || STATUS_COLORS.DRAFT}`}>
                                            {statusLabel(q.status)}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a href={`/api/admin/billing/invoices/${q.id}/pdf`} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 transition-colors">
                                                <FileDown className="w-3 h-3" /> PDF
                                            </a>
                                            <Link href={`/shop/billing/invoices/${q.id}`} className="text-[10px] font-bold text-purple-400 hover:text-white transition-colors">View</Link>
                                            <Link href={`/shop/billing/invoices/${q.id}/edit`} className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors">Edit</Link>
                                            <button onClick={() => handleConvertToInvoice(q)} disabled={converting === q.id}
                                                className="flex items-center gap-1 text-[10px] font-bold text-[#16acd4] hover:text-white transition-colors disabled:opacity-40">
                                                <ArrowRightLeft className="w-3 h-3" />
                                                {converting === q.id ? "..." : "→ Invoice"}
                                            </button>
                                            <button onClick={() => handleDelete(q.id)} className="text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors">Del</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
