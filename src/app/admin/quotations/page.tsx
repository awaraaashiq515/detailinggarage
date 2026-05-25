"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Search, RotateCcw, FileText, Eye } from "lucide-react"

type Client = { name: string }
type Quotation = {
    id: string; invoiceNumber: string; type: string; date: string
    dueDate: string | null; status: string; subTotal: number
    taxTotal: number; grandTotal: number; amountPaid: number
    client: Client
}

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(n)
const fmtDt = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-"

const STATUS_COLORS: Record<string, string> = {
    PAID: "text-green-400 bg-green-400/10",
    UNPAID: "text-red-400 bg-red-400/10",
    PARTIALLY_PAID: "text-orange-400 bg-orange-400/10",
    OVERDUE: "text-red-400 bg-red-400/10",
    DRAFT: "text-zinc-400 bg-zinc-400/10",
    CANCELLED: "text-zinc-500 bg-zinc-500/10",
}

export default function AdminQuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [grandTotal, setGrandTotal] = useState(0)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({ type: "QUOTATION" })
        if (search) params.set("search", search)
        if (fromDate) params.set("fromDate", fromDate)
        if (toDate) params.set("toDate", toDate)
        const res = await fetch(`/api/admin/billing/invoices?${params}`)
        const data = await res.json()
        if (data.success) {
            setQuotations(data.invoices)
            setGrandTotal(data.summary?.grandTotal || 0)
        }
        setLoading(false)
    }, [search, fromDate, toDate])

    useEffect(() => { fetchData() }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white font-display">Quotations</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage all client quotations</p>
                </div>
                <Link
                    href="/admin/quotations/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase tracking-widest transition-colors"
                >
                    <Plus className="w-4 h-4" /> New Quotation
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-[#121214] border border-white/5 p-4 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Search</label>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && fetchData()}
                        placeholder="QT number / client name..."
                        className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">From Date</label>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                        className="bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50" />
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">To Date</label>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                        className="bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50" />
                </div>
                <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase transition-colors">
                    <Search className="w-3.5 h-3.5" /> Search
                </button>
                <button onClick={() => { setSearch(""); setFromDate(""); setToDate("") }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 font-bold text-xs uppercase transition-colors border border-white/10">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
            </div>

            {/* Summary bar */}
            {!loading && quotations.length > 0 && (
                <div className="bg-[#121214] border border-white/5 px-5 py-3 flex gap-6 text-xs">
                    <span className="text-zinc-500">Total: <strong className="text-white">{quotations.length}</strong></span>
                    <span className="text-zinc-500">Grand Total: <strong className="text-[#16acd4]">₹{fmt(grandTotal)}</strong></span>
                </div>
            )}

            {/* Table */}
            <div className="bg-[#121214] border border-white/5 overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-[#1a1a1c] border-b border-white/10">
                        <tr>
                            {["#", "Client", "QT Number", "Date", "Valid Until", "Amount", "Tax", "Total", "Status", "Action"].map(h => (
                                <th key={h} className="p-3 text-zinc-500 font-bold uppercase tracking-widest whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={10} className="p-10 text-center text-zinc-600">Loading...</td></tr>
                        ) : quotations.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="p-16 text-center">
                                    <FileText className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                                    <p className="text-zinc-500 text-sm">No quotations found</p>
                                    <Link href="/admin/quotations/new" className="mt-3 inline-block text-[#16acd4] hover:underline text-xs font-bold">
                                        + Create your first quotation
                                    </Link>
                                </td>
                            </tr>
                        ) : quotations.map((q, i) => (
                            <tr key={q.id} className="hover:bg-white/[0.02]">
                                <td className="p-3 text-zinc-600">{i + 1}</td>
                                <td className="p-3 text-white font-medium">{q.client.name}</td>
                                <td className="p-3 font-mono text-[#16acd4] font-bold">{q.invoiceNumber}</td>
                                <td className="p-3 text-zinc-400">{fmtDt(q.date)}</td>
                                <td className="p-3 text-zinc-400">{fmtDt(q.dueDate)}</td>
                                <td className="p-3 text-right font-mono text-zinc-300">₹{fmt(q.subTotal)}</td>
                                <td className="p-3 text-right font-mono text-zinc-500">₹{fmt(q.taxTotal)}</td>
                                <td className="p-3 text-right font-mono font-bold text-white">₹{fmt(q.grandTotal)}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${STATUS_COLORS[q.status] || "text-zinc-400"}`}>
                                        {q.status.replace("_", " ")}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <Link href={`/admin/invoices/${q.id}`}
                                        className="flex items-center gap-1 text-[#16acd4] hover:text-white text-[10px] font-bold uppercase">
                                        <Eye className="w-3 h-3" /> View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
