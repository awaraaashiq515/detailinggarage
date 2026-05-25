"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Search, RefreshCcw, FileDown, Receipt, TrendingUp, AlertCircle, IndianRupee } from "lucide-react"

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

function fmt(n: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n)
}

function fmtDate(d: string | null) {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [summary, setSummary] = useState<Summary | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("")
    const [type, setType] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    const fetchInvoices = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (status) params.set("status", status)
        if (type) params.set("type", type)
        if (fromDate) params.set("fromDate", fromDate)
        if (toDate) params.set("toDate", toDate)

        const res = await fetch(`/api/admin/billing/invoices?${params.toString()}`)
        const data = await res.json()
        if (data.success) {
            setInvoices(data.invoices)
            setSummary(data.summary)
        }
        setLoading(false)
    }, [search, status, type, fromDate, toDate])

    useEffect(() => { fetchInvoices() }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return
        await fetch(`/api/admin/billing/invoices?id=${id}`, { method: "DELETE" })
        fetchInvoices()
    }

    const handleReset = () => {
        setSearch(""); setStatus(""); setType(""); setFromDate(""); setToDate("")
    }

    return (
        <div className="p-4 md:p-6 w-full min-h-screen bg-[#09090b] flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">Invoices</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Manage GST-compliant invoices & estimates</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Link
                        href="/admin/invoices/new"
                        className="flex items-center gap-2 px-4 py-2 bg-[#16acd4] hover:bg-white text-black font-bold uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(22, 172, 212,0.2)]"
                    >
                        <Plus className="w-4 h-4" /> New Invoice
                    </Link>
                    <Link
                        href="/super-admin/invoices"
                        className="flex items-center gap-2 px-4 py-2 bg-[#2a6fbd] hover:bg-[#1a4f9a] text-white font-bold uppercase tracking-widest text-xs transition-colors border border-[#2a6fbd]"
                    >
                        🛡 Super Admin View
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#121214] border border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-widest text-xs transition-colors">
                        <FileDown className="w-4 h-4" /> Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#121214] border border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Receipt className="w-4 h-4 text-zinc-500" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Invoices</p>
                    </div>
                    <p className="text-2xl font-bold text-white font-display">{summary?.totalInvoices ?? 0}</p>
                </div>
                <div className="bg-[#121214] border border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Outstanding</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-400 font-display">{fmt(summary?.totalOutstanding ?? 0)}</p>
                </div>
                <div className="bg-[#121214] border border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Paid</p>
                    </div>
                    <p className="text-2xl font-bold text-green-400 font-display">{fmt(summary?.totalPaid ?? 0)}</p>
                </div>
                <div className="bg-[#121214] border border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4 text-[#16acd4]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Grand Total</p>
                    </div>
                    <p className="text-2xl font-bold text-[#16acd4] font-display">{fmt(summary?.grandTotal ?? 0)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#121214] border border-white/5 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <div className="relative sm:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            type="text"
                            placeholder="Search invoice # or client name..."
                            className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 pl-9 outline-none focus:border-[#16acd4]/50 placeholder:text-zinc-600"
                        />
                    </div>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50">
                        <option value="">All Statuses</option>
                        <option value="UNPAID">Unpaid</option>
                        <option value="PAID">Paid</option>
                        <option value="PARTIALLY_PAID">Partially Paid</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="DRAFT">Draft</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <select value={type} onChange={e => setType(e.target.value)} className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50">
                        <option value="">All Types</option>
                        <option value="INVOICE">Invoice</option>
                        <option value="ESTIMATE">Estimate</option>
                    </select>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">From</span>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-2 py-1.5 outline-none focus:border-[#16acd4]/50" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">To</span>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-2 py-1.5 outline-none focus:border-[#16acd4]/50" />
                    </div>
                    <button onClick={fetchInvoices} className="flex items-center gap-1.5 text-xs bg-[#16acd4] text-black px-3 py-1.5 font-bold hover:bg-white transition-colors">
                        <Search className="w-3 h-3" /> Search
                    </button>
                    <button onClick={handleReset} className="flex items-center gap-1.5 text-xs bg-[#09090b] border border-white/10 text-zinc-400 px-3 py-1.5 font-bold hover:border-white/30 hover:text-white transition-colors">
                        <RefreshCcw className="w-3 h-3" /> Reset
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#121214] border border-white/5 flex-1 flex flex-col overflow-hidden">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-[#1a1a1c] border-b border-white/10 z-10">
                            <tr>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">#</th>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">Invoice No.</th>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">Client</th>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">Issue Date</th>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">Due Date</th>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap text-right">Amount</th>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap text-right">Tax</th>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap text-right">Total</th>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap text-right">Paid</th>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap text-right">Balance</th>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">Status</th>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">Type</th>
                                <th className="p-3 font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-zinc-300 divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={13} className="p-12 text-center text-zinc-500">Loading invoices...</td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="p-16 text-center">
                                        <Receipt className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                                        <p className="text-zinc-500 font-medium">No invoices found</p>
                                        <p className="text-zinc-600 text-[11px] mt-1">Create your first invoice to get started</p>
                                        <Link href="/admin/invoices/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#16acd4] text-black text-xs font-bold uppercase hover:bg-white transition-colors">
                                            <Plus className="w-3 h-3" /> Create Invoice
                                        </Link>
                                    </td>
                                </tr>
                            ) : invoices.map((inv, i) => {
                                const balance = inv.grandTotal - inv.amountPaid
                                return (
                                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-3 text-zinc-600">{i + 1}</td>
                                        <td className="p-3 font-mono font-bold text-[#16acd4]">{inv.invoiceNumber}</td>
                                        <td className="p-3 font-medium text-white">{inv.client.name}</td>
                                        <td className="p-3 text-zinc-400">{fmtDate(inv.date)}</td>
                                        <td className="p-3 text-zinc-400">{fmtDate(inv.dueDate)}</td>
                                        <td className="p-3 text-right font-mono">{fmt(inv.subTotal)}</td>
                                        <td className="p-3 text-right font-mono text-zinc-500">{fmt(inv.taxTotal)}</td>
                                        <td className="p-3 text-right font-mono font-bold text-white">{fmt(inv.grandTotal)}</td>
                                        <td className="p-3 text-right font-mono text-green-400">{fmt(inv.amountPaid)}</td>
                                        <td className="p-3 text-right font-mono text-amber-400">{fmt(Math.max(0, balance))}</td>
                                        <td className="p-3">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_COLORS[inv.status] || STATUS_COLORS.DRAFT}`}>
                                                {inv.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="p-3 text-zinc-500">{inv.type}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/invoices/${inv.id}`} className="text-[10px] font-bold uppercase text-[#16acd4] hover:underline">View</Link>
                                                <button onClick={() => handleDelete(inv.id)} className="text-[10px] font-bold uppercase text-red-500 hover:underline">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        {invoices.length > 0 && summary && (
                            <tfoot className="border-t-2 border-white/10 bg-[#121214]">
                                <tr className="font-bold text-white">
                                    <td colSpan={5} className="p-3 text-right text-xs uppercase tracking-widest text-zinc-400">TOTAL</td>
                                    <td className="p-3 text-right font-mono">{fmt(summary.subTotal)}</td>
                                    <td className="p-3 text-right font-mono text-zinc-400">{fmt(summary.taxTotal)}</td>
                                    <td className="p-3 text-right font-mono text-[#16acd4]">{fmt(summary.grandTotal)}</td>
                                    <td className="p-3 text-right font-mono text-green-400">{fmt(summary.amountPaid)}</td>
                                    <td className="p-3 text-right font-mono text-amber-400">{fmt(Math.max(0, summary.grandTotal - summary.amountPaid))}</td>
                                    <td colSpan={3}></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    )
}
