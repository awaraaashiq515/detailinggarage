"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Search, RefreshCcw, FileText, TrendingUp, ArrowRightLeft, IndianRupee, ClipboardList, FileDown } from "lucide-react"

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
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n)
}

function fmtDate(d: string | null) {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default function ShopQuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("")
    const [clientId, setClientId] = useState("")
    const [clients, setClients] = useState<{ id: string; name: string }[]>([])
    const [converting, setConverting] = useState<string | null>(null)

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
        fetch("/api/admin/billing/clients")
            .then(r => r.json())
            .then(d => { if (d.success) setClients(d.clients) })
    }, [])

    const handleConvertToInvoice = async (q: Quotation) => {
        if (!confirm(`Convert quotation "${q.invoiceNumber}" to a Tax Invoice?\nA new DRAFT invoice will be created with all items copied.`)) return
        setConverting(q.id)
        const res = await fetch("/api/admin/billing/invoices", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: q.id, action: "convert", targetType: "INVOICE" }),
        })
        const data = await res.json()
        setConverting(null)
        if (data.success) {
            alert(`Invoice created: ${data.invoice.invoiceNumber}\nYou can view it from the Invoices page.`)
            fetchQuotations()
        } else {
            alert(data.error || "Conversion failed")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this quotation?")) return
        await fetch(`/api/admin/billing/invoices?id=${id}`, { method: "DELETE" })
        fetchQuotations()
    }

    const totalValue = quotations.reduce((s, q) => s + q.grandTotal, 0)
    const pendingCount = quotations.filter(q => q.status === "DRAFT" || q.status === "UNPAID").length

    return (
        <div className="w-full flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-purple-400" />
                        Quotations
                    </h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Create & convert quotations into tax invoices</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Link
                        href="/shop/billing/quotations/new"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                        <Plus className="w-4 h-4" /> New Quotation
                    </Link>
                    <Link
                        href="/shop/billing/invoices"
                        className="flex items-center gap-2 px-4 py-2 bg-[#121214] border border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                        <FileText className="w-4 h-4" /> All Invoices
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-[#121214] border border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ClipboardList className="w-4 h-4 text-purple-400" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Quotations</p>
                    </div>
                    <p className="text-2xl font-bold text-white font-display">{quotations.length}</p>
                </div>
                <div className="bg-[#121214] border border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pending Approval</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-400 font-display">{pendingCount}</p>
                </div>
                <div className="bg-[#121214] border border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4 text-purple-400" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Value</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-400 font-display">{fmt(totalValue)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#121214] border border-white/5 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && fetchQuotations()}
                            type="text"
                            placeholder="Search quotation #, client, vehicle..."
                            className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 pl-9 outline-none focus:border-purple-500/50 placeholder:text-zinc-600"
                        />
                    </div>
                    <select value={clientId} onChange={e => setClientId(e.target.value)} className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2 outline-none focus:border-purple-500/50">
                        <option value="">All Clients</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2 outline-none focus:border-purple-500/50">
                        <option value="">All Statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="UNPAID">Sent</option>
                        <option value="PAID">Accepted</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button onClick={fetchQuotations} className="flex items-center gap-1.5 text-xs bg-purple-600 text-white px-3 py-2 font-bold hover:bg-purple-500 transition-colors">
                        <Search className="w-3 h-3" /> Search
                    </button>
                    <button onClick={() => { setSearch(""); setStatus(""); setClientId("") }} className="flex items-center gap-1.5 text-xs bg-[#09090b] border border-white/10 text-zinc-400 px-3 py-2 font-bold hover:border-white/30 hover:text-white transition-colors">
                        <RefreshCcw className="w-3 h-3" /> Reset
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#121214] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                        <thead className="sticky top-0 bg-[#1a1a1c] border-b border-white/10">
                            <tr>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 w-8">#</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Quotation No.</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Client</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hidden sm:table-cell">Vehicle</th>
                                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hidden md:table-cell">Date</th>
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
                                        <p className="text-zinc-600 text-[11px] mt-1">Create a quotation or convert an existing invoice</p>
                                        <Link href="/shop/billing/quotations/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white text-xs font-bold uppercase hover:bg-purple-500 transition-colors">
                                            <Plus className="w-3 h-3" /> Create Quotation
                                        </Link>
                                    </td>
                                </tr>
                            ) : quotations.map((q, i) => (
                                <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-3 py-3.5 text-zinc-600">{i + 1}</td>
                                    <td className="px-3 py-3.5 font-mono font-bold text-purple-400">{q.invoiceNumber}</td>
                                    <td className="px-3 py-3.5 font-medium text-white">{q.client.name}</td>
                                    <td className="px-3 py-3.5 text-zinc-400 hidden sm:table-cell">
                                        {q.vehicleName ? (
                                            <div>
                                                <p className="font-semibold text-white text-[11px]">{q.vehicleName}</p>
                                                {q.vehicleRegNo && <p className="text-[10px] font-mono text-purple-400">{q.vehicleRegNo}</p>}
                                            </div>
                                        ) : <span className="text-zinc-600">-</span>}
                                    </td>
                                    <td className="px-3 py-3.5 text-zinc-400 hidden md:table-cell">{fmtDate(q.date)}</td>
                                    <td className="px-3 py-3.5 text-right font-mono font-bold text-white">{fmt(q.grandTotal)}</td>
                                    <td className="px-3 py-3.5">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_COLORS[q.status] || STATUS_COLORS.DRAFT}`}>
                                            {q.status === "UNPAID" ? "Sent" : q.status === "PAID" ? "Accepted" : q.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={`/api/admin/billing/invoices/${q.id}/pdf`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20 transition-colors"
                                                title="Download PDF"
                                            >
                                                <FileDown className="w-3 h-3" /> PDF
                                            </a>
                                            <Link href={`/shop/billing/invoices/${q.id}`} className="text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:text-white transition-colors">View</Link>
                                            <Link href={`/shop/billing/invoices/${q.id}/edit`} className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">Edit</Link>
                                            <button
                                                onClick={() => handleConvertToInvoice(q)}
                                                disabled={converting === q.id}
                                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#16acd4] hover:text-white transition-colors disabled:opacity-40"
                                                title="Convert to Tax Invoice"
                                            >
                                                <ArrowRightLeft className="w-3 h-3" />
                                                {converting === q.id ? "Converting..." : "→ Invoice"}
                                            </button>
                                            <button onClick={() => handleDelete(q.id)} className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-400 transition-colors">Del</button>
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
