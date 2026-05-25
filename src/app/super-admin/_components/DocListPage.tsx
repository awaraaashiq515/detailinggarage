"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

type Client = { name: string }
type Invoice = {
    id: string; invoiceNumber: string; type: string; date: string
    dueDate: string | null; status: string; subTotal: number
    taxTotal: number; grandTotal: number; amountPaid: number
    client: Client
}
type Summary = {
    totalInvoices: number; totalOutstanding: number; totalPaid: number
    subTotal: number; taxTotal: number; grandTotal: number; amountPaid: number
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PAID:           { label: "Paid",      color: "#006400" },
    UNPAID:         { label: "Unpaid",    color: "#cc0000" },
    PARTIALLY_PAID: { label: "Partial",   color: "#e65c00" },
    OVERDUE:        { label: "Overdue",   color: "#cc0000" },
    DRAFT:          { label: "Draft",     color: "#555" },
    CANCELLED:      { label: "Cancelled", color: "#888" },
}

const fmt   = (n: number) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(n)
const fmtDt = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-"

const thS: React.CSSProperties = { padding: "5px 7px", fontWeight: "bold", fontSize: "11px", borderRight: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap" }
const tdS: React.CSSProperties = { padding: "3px 7px", borderBottom: "1px solid #d0dff0", borderRight: "1px solid #d0dff0", whiteSpace: "nowrap", fontSize: "11px" }

// ─── Config per document type ─────────────────────────────────────────────────
const CONFIG = {
    quotations: {
        type: "QUOTATION",
        title: "Quotations Report",
        icon: "📋",
        newHref: "/super-admin/quotations/new",
        viewBase: "/super-admin/quotations",
        prefix: "QT",
        color: "#2a6fbd",
    },
    proformas: {
        type: "PROFORMA",
        title: "Proforma Invoices",
        icon: "📑",
        newHref: "/super-admin/proformas/new",
        viewBase: "/super-admin/proformas",
        prefix: "PF",
        color: "#5a3fa0",
    },
    challans: {
        type: "CHALLAN",
        title: "Delivery Challans",
        icon: "📦",
        newHref: "/super-admin/challans/new",
        viewBase: "/super-admin/challans",
        prefix: "CH",
        color: "#1a7a4a",
    },
}


export function DocListPage({ docKey }: { docKey: keyof typeof CONFIG }) {
    const cfg = CONFIG[docKey]
    const [invoices, setInvoices]   = useState<Invoice[]>([])
    const [summary, setSummary]     = useState<Summary | null>(null)
    const [loading, setLoading]     = useState(true)
    const [search, setSearch]       = useState("")
    const [status, setStatus]       = useState("")
    const [fromDate, setFromDate]   = useState("")
    const [toDate, setToDate]       = useState("")

    const fetchData = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({ type: cfg.type })
        if (search)   params.set("search", search)
        if (status)   params.set("status", status)
        if (fromDate) params.set("fromDate", fromDate)
        if (toDate)   params.set("toDate", toDate)
        const res  = await fetch(`/api/admin/billing/invoices?${params}`)
        const data = await res.json()
        if (data.success) { setInvoices(data.invoices); setSummary(data.summary) }
        setLoading(false)
    }, [cfg.type, search, status, fromDate, toDate])

    useEffect(() => { fetchData() }, [])

    return (
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", backgroundColor: "#f0f0f0", minHeight: "100vh", color: "#000" }}>

            {/* Title Bar */}
            <div style={{ background: `linear-gradient(to bottom, ${cfg.color}, #1a3f7a)`, color: "white", padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #0d3a7a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "14px" }}>{cfg.icon}</span>
                    <span style={{ fontWeight: "bold", fontSize: "13px" }}>{cfg.title}</span>
                    {summary && <span style={{ fontSize: "11px", opacity: 0.8 }}>({summary.totalInvoices} records)</span>}
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                    <Link href={cfg.newHref}
                        style={{ background: "#16acd4", color: "#000", padding: "3px 10px", fontSize: "11px", fontWeight: "bold", textDecoration: "none", border: "1px solid #c88a00", borderRadius: "2px" }}>
                        ➕ New {cfg.icon}
                    </Link>
                    <Link href="/super-admin/invoices"
                        style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "3px 10px", fontSize: "11px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "2px" }}>
                        🧾 Invoices
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div style={{ background: "#d6e4f7", border: "1px solid #a0b8d8", margin: "6px", padding: "8px", borderRadius: "2px" }}>
                <div style={{ background: cfg.color, color: "white", padding: "3px 8px", fontWeight: "bold", fontSize: "11px", marginBottom: "8px" }}>🔍 Search {cfg.title}</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div>
                        <label style={{ fontSize: "11px", fontWeight: "bold", color: "#333", display: "block", marginBottom: "2px" }}>Quick Search</label>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder={`${cfg.prefix} number / client...`}
                            style={{ padding: "3px 6px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px", width: "180px" }} />
                    </div>
                    <div>
                        <label style={{ fontSize: "11px", fontWeight: "bold", color: "#333", display: "block", marginBottom: "2px" }}>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)}
                            style={{ padding: "3px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px", background: "white" }}>
                            <option value="">All</option>
                            {["UNPAID","PAID","PARTIALLY_PAID","OVERDUE","DRAFT","CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: "11px", fontWeight: "bold", color: "#333", display: "block", marginBottom: "2px" }}>From Date</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                            style={{ padding: "3px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px" }} />
                    </div>
                    <div>
                        <label style={{ fontSize: "11px", fontWeight: "bold", color: "#333", display: "block", marginBottom: "2px" }}>To Date</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                            style={{ padding: "3px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px" }} />
                    </div>
                    <button onClick={fetchData}
                        style={{ background: cfg.color, color: "white", padding: "4px 16px", fontSize: "11px", border: "none", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                        🔍 Search
                    </button>
                    <button onClick={() => { setSearch(""); setStatus(""); setFromDate(""); setToDate("") }}
                        style={{ background: "#e0e0e0", color: "#333", padding: "4px 12px", fontSize: "11px", border: "1px solid #aaa", borderRadius: "2px", cursor: "pointer" }}>
                        ↺ Reset
                    </button>
                </div>
            </div>

            {/* Results */}
            <div style={{ margin: "0 6px 6px", background: "white", border: "1px solid #a0b8d8", borderRadius: "2px" }}>
                <div style={{ background: cfg.color, color: "white", padding: "3px 8px", fontWeight: "bold", fontSize: "11px" }}>Results</div>

                {summary && (
                    <div style={{ background: "#f5f9ff", borderBottom: "1px solid #c0d0e8", padding: "4px 8px", display: "flex", gap: "20px", fontSize: "11px" }}>
                        <span>Total: <strong>{summary.totalInvoices}</strong></span>
                        <span>Sub Total: <strong>₹{fmt(summary.subTotal)}</strong></span>
                        <span>Tax: <strong>₹{fmt(summary.taxTotal)}</strong></span>
                        <span style={{ color: "#0d3a7a" }}>Grand Total: <strong>₹{fmt(summary.grandTotal)}</strong></span>
                        <span style={{ color: "#006400" }}>Paid: <strong>₹{fmt(summary.amountPaid)}</strong></span>
                        <span style={{ color: "#cc0000" }}>Outstanding: <strong>₹{fmt(summary.totalOutstanding)}</strong></span>
                    </div>
                )}

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                        <thead>
                            <tr style={{ background: cfg.color, color: "white" }}>
                                {["No.", "Client", `${cfg.prefix} Number`, "Date", "Due Date", "Sub Total", "Tax", "Total", "Status", "Paid", "Balance", "Action"].map(h => (
                                    <th key={h} style={thS}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={12} style={{ textAlign: "center", padding: "20px", color: "#666" }}>Loading...</td></tr>
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan={12} style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                                    No {cfg.title.toLowerCase()} found. <Link href={cfg.newHref} style={{ color: cfg.color }}>Create New</Link>
                                </td></tr>
                            ) : invoices.map((inv, i) => {
                                const balance = Math.max(0, inv.grandTotal - inv.amountPaid)
                                const st = STATUS_LABELS[inv.status] || { label: inv.status, color: "#555" }
                                return (
                                    <tr key={inv.id} style={{ background: i % 2 === 0 ? "#f5f9ff" : "white" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#ddeeff")}
                                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#f5f9ff" : "white")}>
                                        <td style={tdS}>{i + 1}</td>
                                        <td style={{ ...tdS, fontWeight: "bold" }}>{inv.client.name}</td>
                                        <td style={{ ...tdS, color: cfg.color, fontWeight: "bold", fontFamily: "monospace" }}>{inv.invoiceNumber}</td>
                                        <td style={tdS}>{fmtDt(inv.date)}</td>
                                        <td style={tdS}>{fmtDt(inv.dueDate)}</td>
                                        <td style={{ ...tdS, textAlign: "right" }}>{fmt(inv.subTotal)}</td>
                                        <td style={{ ...tdS, textAlign: "right" }}>{fmt(inv.taxTotal)}</td>
                                        <td style={{ ...tdS, textAlign: "right", fontWeight: "bold" }}>{fmt(inv.grandTotal)}</td>
                                        <td style={{ ...tdS, textAlign: "center" }}>
                                            <span style={{ color: st.color, fontWeight: "bold", fontSize: "10px" }}>{st.label}</span>
                                        </td>
                                        <td style={{ ...tdS, textAlign: "right", color: "#006400" }}>{fmt(inv.amountPaid)}</td>
                                        <td style={{ ...tdS, textAlign: "right", color: balance > 0 ? "#cc0000" : "#006400" }}>{fmt(balance)}</td>
                                        <td style={{ ...tdS, textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "3px" }}>
                                                <Link href={`${cfg.viewBase}/${inv.id}`}
                                                    style={{ background: cfg.color, color: "white", padding: "1px 6px", fontSize: "10px", textDecoration: "none", borderRadius: "1px" }}>
                                                    👁 View
                                                </Link>
                                                <Link href={`${cfg.viewBase}/${inv.id}/edit`}
                                                    style={{ background: "#4a8f4a", color: "white", padding: "1px 6px", fontSize: "10px", textDecoration: "none", borderRadius: "1px" }}>
                                                    ✏ Edit
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        {invoices.length > 0 && summary && (
                            <tfoot>
                                <tr style={{ background: cfg.color, color: "white", fontWeight: "bold" }}>
                                    <td colSpan={5} style={{ ...tdS, textAlign: "right", color: "white", border: "none" }}>TOTAL</td>
                                    <td style={{ ...tdS, textAlign: "right", color: "white", border: "none" }}>₹{fmt(summary.subTotal)}</td>
                                    <td style={{ ...tdS, textAlign: "right", color: "white", border: "none" }}>₹{fmt(summary.taxTotal)}</td>
                                    <td style={{ ...tdS, textAlign: "right", color: "white", border: "none" }}>₹{fmt(summary.grandTotal)}</td>
                                    <td style={{ border: "none" }} />
                                    <td style={{ ...tdS, textAlign: "right", color: "white", border: "none" }}>₹{fmt(summary.amountPaid)}</td>
                                    <td style={{ ...tdS, textAlign: "right", color: "white", border: "none" }}>₹{fmt(Math.max(0, summary.grandTotal - summary.amountPaid))}</td>
                                    <td style={{ border: "none" }} />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    )
}
