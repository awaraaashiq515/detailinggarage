"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
    Plus, Search, RefreshCcw, FileDown, Receipt,
    TrendingUp, AlertCircle, IndianRupee, FileText,
    ArrowRightLeft, ChevronRight, Car, Calendar,
    MoreVertical, Eye, Pencil, Trash2
} from "lucide-react"

type Client = { name: string }
type InvoiceItem = { id: string; name: string; total: number }
type Payment = { id: string; amount: number }
type Invoice = {
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
    vehicleName?: string | null
    vehicleRegNo?: string | null
    assignedStaff?: { id: string; name: string; role: string } | null
    client: Client
    items: InvoiceItem[]
    payments: Payment[]
}
type Summary = {
    totalInvoices: number
    totalOutstanding: number
    totalPaid: number
    subTotal: number
    taxTotal: number
    grandTotal: number
    amountPaid: number
}

const STATUS_COLORS: Record<string, string> = {
    PAID: "bg-green-500/10 text-green-400 border border-green-500/20",
    UNPAID: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    PARTIALLY_PAID: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    OVERDUE: "bg-red-500/10 text-red-400 border border-red-500/20",
    DRAFT: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
    CANCELLED: "bg-red-900/20 text-red-500 border border-red-900/20",
}

const STATUS_DOT: Record<string, string> = {
    PAID: "bg-green-400",
    UNPAID: "bg-amber-400",
    PARTIALLY_PAID: "bg-blue-400",
    OVERDUE: "bg-red-400",
    DRAFT: "bg-zinc-400",
    CANCELLED: "bg-red-600",
}

function fmt(n: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
}

function fmtDate(d: string | null) {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })
}

// ─── Mobile Invoice Card ───────────────────────────────────────────────────
function InvoiceCard({
    inv,
    index,
    onDelete,
    onConvert,
}: {
    inv: Invoice
    index: number
    onDelete: (id: string) => void
    onConvert: (inv: Invoice) => void
}) {
    const [menuOpen, setMenuOpen] = useState(false)
    const balance = Math.max(0, inv.grandTotal - inv.amountPaid)
    const isQuotation = inv.type === "QUOTATION" || inv.type === "ESTIMATE"

    return (
        <div
            className="rounded-2xl border border-white/8 overflow-hidden transition-all active:scale-[0.99]"
            style={{ background: "#111113" }}
        >
            {/* Card Header */}
            <div className="flex items-start justify-between px-4 pt-4 pb-3">
                <div className="flex items-start gap-3 min-w-0">
                    {/* Type indicator dot */}
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${isQuotation ? "bg-purple-400" : "bg-[#16acd4]"}`} />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-mono font-bold text-sm ${isQuotation ? "text-purple-400" : "text-[#16acd4]"}`}>
                                {inv.invoiceNumber}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLORS[inv.status] || STATUS_COLORS.DRAFT}`}>
                                {inv.status.replace("_", " ")}
                            </span>
                        </div>
                        <p className="text-white font-bold text-[15px] mt-0.5">{inv.client.name}</p>
                        {inv.vehicleName && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <Car className="w-3 h-3 text-zinc-600 shrink-0" />
                                <span className="text-xs text-zinc-400">{inv.vehicleName}</span>
                                {inv.vehicleRegNo && (
                                    <span className="text-[10px] font-mono text-[#16acd4] bg-[#16acd4]/10 px-1.5 py-0.5 rounded">
                                        {inv.vehicleRegNo}
                                    </span>
                                )}
                            </div>
                        )}
                        {inv.assignedStaff && (
                            <div className="mt-1">
                                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    👨‍🔧 {inv.assignedStaff.name} ({inv.assignedStaff.role})
                                </span>
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
                            <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
                                style={{ background: "#1a1a1c" }}>
                                <Link
                                    href={`/shop/billing/invoices/${inv.id}`}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                                >
                                    <Eye className="w-4 h-4 text-zinc-400" /> View
                                </Link>
                                <Link
                                    href={`/shop/billing/invoices/${inv.id}/edit`}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                                >
                                    <Pencil className="w-4 h-4 text-zinc-400" /> Edit
                                </Link>
                                <a
                                    href={`/api/admin/billing/invoices/${inv.id}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-emerald-400 hover:bg-white/5 transition-colors"
                                >
                                    <FileDown className="w-4 h-4" /> Download PDF
                                </a>
                                <button
                                    onClick={() => { setMenuOpen(false); onConvert(inv) }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-purple-400 hover:bg-white/5 transition-colors"
                                >
                                    <ArrowRightLeft className="w-4 h-4" />
                                    {isQuotation ? "→ Convert to Invoice" : "→ Convert to Quote"}
                                </button>
                                <button
                                    onClick={() => { setMenuOpen(false); onDelete(inv.id) }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-white/6" />

            {/* Amount + Date row */}
            <div className="flex items-center justify-between px-4 py-3">
                <div>
                    <p className="text-2xl font-black text-white font-mono">{fmt(inv.grandTotal)}</p>
                    {balance > 0 && inv.status !== "PAID" && (
                        <p className="text-xs text-amber-400 mt-0.5 font-medium">Balance: {fmt(balance)}</p>
                    )}
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 justify-end">
                        <Calendar className="w-3 h-3" />
                        <span>{fmtDate(inv.date)}</span>
                    </div>
                    {inv.dueDate && (
                        <p className="text-[10px] text-zinc-600 mt-0.5">Due: {fmtDate(inv.dueDate)}</p>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="border-t border-white/6 flex divide-x divide-white/6">
                <Link
                    href={`/shop/billing/invoices/${inv.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-[#16acd4] hover:bg-[#16acd4]/10 transition-colors"
                >
                    <Eye className="w-3.5 h-3.5" /> View
                </Link>
                <a
                    href={`/api/admin/billing/invoices/${inv.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                >
                    <FileDown className="w-3.5 h-3.5" /> PDF
                </a>
                <Link
                    href={`/shop/billing/invoices/${inv.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-zinc-400 hover:bg-white/5 transition-colors"
                >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function ShopInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [summary, setSummary] = useState<Summary | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("")
    const [type, setType] = useState("")
    const [clientId, setClientId] = useState("")
    const [clients, setClients] = useState<{ id: string; name: string }[]>([])
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [showFilters, setShowFilters] = useState(false)

    const fetchInvoices = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (status) params.set("status", status)
        if (type) params.set("type", type)
        if (clientId) params.set("clientId", clientId)
        if (fromDate) params.set("fromDate", fromDate)
        if (toDate) params.set("toDate", toDate)
        const res = await fetch(`/api/admin/billing/invoices?${params.toString()}`)
        const data = await res.json()
        if (data.success) { setInvoices(data.invoices); setSummary(data.summary) }
        setLoading(false)
    }, [search, status, type, clientId, fromDate, toDate])

    useEffect(() => {
        fetchInvoices()
        fetch("/api/admin/billing/clients")
            .then(r => r.json()).then(d => { if (d.success) setClients(d.clients) })
            .catch(() => {})
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this invoice?")) return
        await fetch(`/api/admin/billing/invoices?id=${id}`, { method: "DELETE" })
        fetchInvoices()
    }

    const handleConvert = async (inv: Invoice) => {
        const label = inv.type === "QUOTATION" ? "Invoice" : "Quotation"
        const targetType = inv.type === "QUOTATION" ? "INVOICE" : "QUOTATION"
        if (!confirm(`Convert "${inv.invoiceNumber}" to a ${label}?`)) return
        const res = await fetch("/api/admin/billing/invoices", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: inv.id, action: "convert", targetType }),
        })
        const data = await res.json()
        if (data.success) { alert(`✅ Created: ${data.invoice.invoiceNumber}`); fetchInvoices() }
        else alert(data.error || "Conversion failed")
    }

    const handleReset = () => { setSearch(""); setStatus(""); setType(""); setClientId(""); setFromDate(""); setToDate("") }

    return (
        <div className="w-full flex flex-col gap-4 lg:gap-5">

            {/* ── Page Header ── */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Billing</span>
                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Invoices</span>
                    </div>
                    <h1 className="text-xl lg:text-2xl font-black text-white">Invoices</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">GST-compliant invoices &amp; estimates</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Link
                        href="/shop/billing/invoices/new"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-black transition-all hover:opacity-90 shadow-lg"
                        style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Invoice</span>
                        <span className="sm:hidden">New</span>
                    </Link>
                </div>
            </div>

            {/* ── Summary Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "Total", value: summary?.totalInvoices ?? 0, icon: Receipt, color: "#16acd4", isNum: true },
                    { label: "Outstanding", value: fmt(summary?.totalOutstanding ?? 0), icon: AlertCircle, color: "#fb923c", isNum: false },
                    { label: "Paid", value: fmt(summary?.totalPaid ?? 0), icon: TrendingUp, color: "#34d399", isNum: false },
                    { label: "Grand Total", value: fmt(summary?.grandTotal ?? 0), icon: IndianRupee, color: "#16acd4", isNum: false },
                ].map((s) => (
                    <div key={s.label} className="rounded-2xl border border-white/8 p-3.5 lg:p-5 flex items-center gap-3 transition-all" style={{ background: "#111113" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + "18" }}>
                            <s.icon className="w-4 h-4" style={{ color: s.color }} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-base lg:text-xl font-black text-white truncate">{s.value}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Search + Filter bar ── */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && fetchInvoices()}
                        type="text"
                        placeholder="Search invoice, client, vehicle..."
                        className="w-full rounded-xl border border-white/10 bg-[#111113] text-white text-sm px-4 py-3 pl-10 outline-none focus:border-[#16acd4]/50 placeholder:text-zinc-600"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-3.5 py-3 rounded-xl border transition-all text-xs font-bold ${showFilters ? "border-[#16acd4]/40 bg-[#16acd4]/10 text-[#16acd4]" : "border-white/10 bg-[#111113] text-zinc-400"}`}
                >
                    Filter
                </button>
                <button
                    onClick={fetchInvoices}
                    className="px-3.5 py-3 rounded-xl border border-white/10 bg-[#111113] text-zinc-400 transition-all hover:border-white/20"
                >
                    <RefreshCcw className="w-4 h-4" />
                </button>
            </div>

            {/* ── Expanded Filters (collapsible) ── */}
            {showFilters && (
                <div className="rounded-2xl border border-white/8 p-4 flex flex-col gap-3" style={{ background: "#111113" }}>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <select value={status} onChange={e => setStatus(e.target.value)}
                            className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-[#16acd4]/50 col-span-1">
                            <option value="">All Statuses</option>
                            <option value="UNPAID">Unpaid</option>
                            <option value="PAID">Paid</option>
                            <option value="PARTIALLY_PAID">Partially Paid</option>
                            <option value="OVERDUE">Overdue</option>
                            <option value="DRAFT">Draft</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <select value={type} onChange={e => setType(e.target.value)}
                            className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-[#16acd4]/50 col-span-1">
                            <option value="">All Types</option>
                            <option value="INVOICE">Invoice</option>
                            <option value="QUOTATION">Quotation</option>
                            <option value="ESTIMATE">Estimate</option>
                        </select>
                        <select value={clientId} onChange={e => setClientId(e.target.value)}
                            className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-[#16acd4]/50 col-span-2">
                            <option value="">All Clients</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">From</span>
                            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                                className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-2 py-2 rounded-xl outline-none focus:border-[#16acd4]/50" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">To</span>
                            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                                className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-2 py-2 rounded-xl outline-none focus:border-[#16acd4]/50" />
                        </div>
                        <button onClick={fetchInvoices}
                            className="flex items-center gap-1.5 text-xs bg-[#16acd4] text-black px-4 py-2 rounded-xl font-bold hover:opacity-90 transition-all">
                            <Search className="w-3 h-3" /> Apply
                        </button>
                        <button onClick={handleReset}
                            className="flex items-center gap-1.5 text-xs border border-white/10 text-zinc-400 px-4 py-2 rounded-xl font-bold hover:border-white/30 hover:text-white transition-all">
                            <RefreshCcw className="w-3 h-3" /> Reset
                        </button>
                    </div>
                </div>
            )}

            {/* ── MOBILE: Card List ── */}
            <div className="lg:hidden">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-2xl border border-white/5 h-40 animate-pulse" style={{ background: "#111113" }} />
                        ))}
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="rounded-2xl border border-white/8 py-20 flex flex-col items-center justify-center" style={{ background: "#111113" }}>
                        <Receipt className="w-12 h-12 text-zinc-700 mb-3" />
                        <p className="text-white font-bold">No invoices found</p>
                        <p className="text-zinc-500 text-sm mt-1">Create your first invoice</p>
                        <Link href="/shop/billing/invoices/new"
                            className="inline-flex items-center gap-2 mt-5 px-5 py-3 rounded-xl text-sm font-bold text-black"
                            style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}>
                            <Plus className="w-4 h-4" /> Create Invoice
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {invoices.map((inv, i) => (
                            <InvoiceCard key={inv.id} inv={inv} index={i} onDelete={handleDelete} onConvert={handleConvert} />
                        ))}
                        {/* Summary footer */}
                        {summary && (
                            <div className="rounded-2xl border border-[#16acd4]/20 p-4 flex items-center justify-between" style={{ background: "#16acd410" }}>
                                <div>
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Total ({invoices.length} invoices)</p>
                                    <p className="text-xl font-black text-[#16acd4] mt-0.5">{fmt(summary.grandTotal)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500">Paid: <span className="text-green-400 font-bold">{fmt(summary.amountPaid)}</span></p>
                                    <p className="text-xs text-zinc-500 mt-1">Balance: <span className="text-amber-400 font-bold">{fmt(Math.max(0, summary.grandTotal - summary.amountPaid))}</span></p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── DESKTOP: Table ── */}
            <div className="hidden lg:block bg-[#121214] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                        <thead className="sticky top-0 bg-[#1a1a1c] border-b border-white/10 z-10">
                            <tr>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 w-8">#</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Invoice No.</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Client</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Vehicle</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Date</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Due</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Total</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Paid</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Balance</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Type</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-zinc-300 divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={12} className="p-12 text-center text-zinc-500">Loading invoices...</td></tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={12} className="p-16 text-center">
                                        <Receipt className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                                        <p className="text-zinc-500 font-medium">No invoices found</p>
                                        <Link href="/shop/billing/invoices/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#16acd4] text-black text-xs font-bold">
                                            <Plus className="w-3 h-3" /> Create Invoice
                                        </Link>
                                    </td>
                                </tr>
                            ) : invoices.map((inv, i) => {
                                const balance = inv.grandTotal - inv.amountPaid
                                return (
                                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-3 py-3.5 text-zinc-600">{i + 1}</td>
                                        <td className="px-3 py-3.5 font-mono font-bold text-[#16acd4]">{inv.invoiceNumber}</td>
                                        <td className="px-3 py-3.5 font-medium text-white">{inv.client.name}</td>
                                        <td className="px-3 py-3.5 text-zinc-400">
                                            {inv.vehicleRegNo ? (
                                                <div>
                                                    <p className="font-semibold text-white text-[11px]">{inv.vehicleName}</p>
                                                    <p className="text-[10px] font-mono text-[#16acd4]">{inv.vehicleRegNo}</p>
                                                </div>
                                            ) : <span className="text-zinc-600">-</span>}
                                            {inv.assignedStaff && (
                                                <div className="mt-1">
                                                    <span className="inline-block text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                        👨‍🔧 {inv.assignedStaff.name}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3.5 text-zinc-400">{fmtDate(inv.date)}</td>
                                        <td className="px-3 py-3.5 text-zinc-400">{fmtDate(inv.dueDate)}</td>
                                        <td className="px-3 py-3.5 text-right font-mono font-bold text-white">{fmt(inv.grandTotal)}</td>
                                        <td className="px-3 py-3.5 text-right font-mono text-green-400">{fmt(inv.amountPaid)}</td>
                                        <td className="px-3 py-3.5 text-right font-mono text-amber-400">{fmt(Math.max(0, balance))}</td>
                                        <td className="px-3 py-3.5">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_COLORS[inv.status] || STATUS_COLORS.DRAFT}`}>
                                                {inv.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                                inv.type === "QUOTATION" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-[#16acd4]/10 text-[#16acd4] border border-[#16acd4]/20"
                                            }`}>{inv.type}</span>
                                        </td>
                                        <td className="px-3 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a href={`/api/admin/billing/invoices/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-white bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 transition-colors">
                                                    <FileDown className="w-3 h-3" /> PDF
                                                </a>
                                                <Link href={`/shop/billing/invoices/${inv.id}`} className="text-[10px] font-bold text-[#16acd4] hover:text-white transition-colors">View</Link>
                                                <Link href={`/shop/billing/invoices/${inv.id}/edit`} className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors">Edit</Link>
                                                <button onClick={() => handleConvert(inv)}
                                                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                                                    <ArrowRightLeft className="w-3 h-3" />
                                                    {inv.type === "QUOTATION" ? "→ Inv" : "→ Qt"}
                                                </button>
                                                <button onClick={() => handleDelete(inv.id)} className="text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors">Del</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        {invoices.length > 0 && summary && (
                            <tfoot className="border-t border-white/10 bg-[#121214] font-bold text-white">
                                <tr>
                                    <td className="px-3 py-3.5" colSpan={6}><span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">TOTAL ({invoices.length})</span></td>
                                    <td className="px-3 py-3.5 text-right font-mono text-[#16acd4]">{fmt(summary.grandTotal)}</td>
                                    <td className="px-3 py-3.5 text-right font-mono text-green-400">{fmt(summary.amountPaid)}</td>
                                    <td className="px-3 py-3.5 text-right font-mono text-amber-400">{fmt(Math.max(0, summary.grandTotal - summary.amountPaid))}</td>
                                    <td colSpan={3} className="px-3 py-3.5"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    )
}
