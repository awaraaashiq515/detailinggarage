"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PAID: { label: "Paid", color: "#006400" },
    UNPAID: { label: "Unpaid", color: "#cc0000" },
    PARTIALLY_PAID: { label: "Partial", color: "#e65c00" },
    OVERDUE: { label: "Overdue", color: "#cc0000" },
    DRAFT: { label: "Draft", color: "#555" },
    CANCELLED: { label: "Cancelled", color: "#888" },
}

function fmt(n: number) {
    return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function fmtDate(d: string | null) {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default function SuperAdminInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [summary, setSummary] = useState<Summary | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [clientName, setClientName] = useState("")
    const [invoiceNum, setInvoiceNum] = useState("")
    const [city, setCity] = useState("")
    const [status, setStatus] = useState("")
    const [type, setType] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [dueFrom, setDueFrom] = useState("")
    const [dueTo, setDueTo] = useState("")
    const [resultsPerPage, setResultsPerPage] = useState(99)

    const fetchInvoices = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (clientName) params.set("search", clientName)
        if (invoiceNum) params.set("invoiceNum", invoiceNum)
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
    }, [search, clientName, invoiceNum, status, type, fromDate, toDate])

    useEffect(() => { fetchInvoices() }, [])

    const handleReset = () => {
        setSearch(""); setClientName(""); setInvoiceNum(""); setCity("")
        setStatus(""); setType(""); setFromDate(""); setToDate("")
        setDueFrom(""); setDueTo("")
    }

    const displayedInvoices = invoices.slice(0, resultsPerPage)

    return (
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", backgroundColor: "#f0f0f0", minHeight: "100vh", color: "#000" }}>

            {/* Title Bar */}
            <div style={{ background: "linear-gradient(to bottom, #2a6fbd, #1a4f9a)", color: "white", padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #0d3a7a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "14px" }}>🧾</span>
                    <span style={{ fontWeight: "bold", fontSize: "13px" }}>Invoices Report</span>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                    <Link href="/super-admin/invoices/new"
                        style={{ background: "#16acd4", color: "#000", padding: "3px 10px", fontSize: "11px", fontWeight: "bold", textDecoration: "none", border: "1px solid #c88a00", borderRadius: "2px" }}>
                        📄 New Invoice
                    </Link>
                    <button style={{ background: "#4a7fc1", color: "white", padding: "3px 10px", fontSize: "11px", border: "1px solid #2a5f9a", borderRadius: "2px", cursor: "pointer" }}>
                        📤 Export
                    </button>
                </div>
            </div>

            {/* Search Section */}
            <div style={{ background: "#d6e4f7", border: "1px solid #a0b8d8", margin: "6px", padding: "8px", borderRadius: "2px" }}>
                <div style={{ background: "#2a6fbd", color: "white", padding: "3px 8px", fontWeight: "bold", fontSize: "11px", marginBottom: "8px", letterSpacing: "0.5px" }}>
                    🔍 Search Invoices
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "6px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "11px", color: "#333", fontWeight: "bold" }}>Client Name</label>
                        <select value={clientName} onChange={e => setClientName(e.target.value)}
                            style={{ padding: "3px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px", background: "white" }}>
                            <option value="">-</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "11px", color: "#333", fontWeight: "bold" }}>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)}
                            style={{ padding: "3px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px", background: "white" }}>
                            <option value="">All</option>
                            <option value="UNPAID">Unpaid</option>
                            <option value="PAID">Paid</option>
                            <option value="PARTIALLY_PAID">Partially Paid</option>
                            <option value="OVERDUE">Overdue</option>
                            <option value="DRAFT">Draft</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: "6px", alignItems: "end", gridColumn: "1 / -1" }}>
                        <div>
                            <label style={{ fontSize: "11px", color: "#333", fontWeight: "bold", display: "block", marginBottom: "2px" }}>Issued Between</label>
                            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                                    style={{ padding: "3px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px", width: "130px" }} />
                                <span style={{ fontSize: "11px" }}>and</span>
                                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                                    style={{ padding: "3px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px", width: "130px" }} />
                            </div>
                        </div>
                        <div />
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "6px", marginBottom: "6px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "11px", color: "#333", fontWeight: "bold" }}>Invoice Number</label>
                        <input value={invoiceNum} onChange={e => setInvoiceNum(e.target.value)}
                            style={{ padding: "3px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "11px", color: "#333", fontWeight: "bold" }}>Type</label>
                        <select value={type} onChange={e => setType(e.target.value)}
                            style={{ padding: "3px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px", background: "white" }}>
                            <option value="">All</option>
                            <option value="INVOICE">Invoice</option>
                            <option value="ESTIMATE">Estimate</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "11px", color: "#333", fontWeight: "bold" }}>City</label>
                        <input value={city} onChange={e => setCity(e.target.value)}
                            style={{ padding: "3px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <label style={{ fontSize: "11px", color: "transparent", display: "block" }}>.</label>
                        <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={fetchInvoices}
                                style={{ background: "#2a6fbd", color: "white", padding: "4px 16px", fontSize: "11px", border: "1px solid #1a4f9a", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                                🔍 Search
                            </button>
                            <button onClick={handleReset}
                                style={{ background: "#e0e0e0", color: "#333", padding: "4px 14px", fontSize: "11px", border: "1px solid #aaa", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                                ↺ Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Due Between Filter */}
            <div style={{ margin: "0 6px", background: "#d6e4f7", border: "1px solid #a0b8d8", padding: "6px 8px", borderRadius: "2px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "bold", color: "#333" }}>Due Between</label>
                    <input type="date" value={dueFrom} onChange={e => setDueFrom(e.target.value)}
                        style={{ padding: "2px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px", width: "120px" }} />
                    <span style={{ fontSize: "11px" }}>and</span>
                    <input type="date" value={dueTo} onChange={e => setDueTo(e.target.value)}
                        style={{ padding: "2px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px", width: "120px" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "bold", color: "#333" }}>Quick Search</label>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        style={{ padding: "2px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px", width: "150px" }} />
                </div>
            </div>

            {/* Results Section */}
            <div style={{ margin: "6px", background: "white", border: "1px solid #a0b8d8", borderRadius: "2px" }}>
                <div style={{ background: "#2a6fbd", color: "white", padding: "3px 8px", fontWeight: "bold", fontSize: "11px", letterSpacing: "0.5px" }}>
                    Results
                    {summary && (
                        <span style={{ marginLeft: "12px", fontWeight: "normal", fontSize: "10px" }}>
                            ({summary.totalInvoices} invoices)
                        </span>
                    )}
                </div>

                {/* Summary Totals Bar */}
                {summary && (
                    <div style={{ background: "#f5f9ff", borderBottom: "1px solid #c0d0e8", padding: "4px 8px", display: "flex", gap: "20px", fontSize: "11px" }}>
                        <span>Total Invoices: <strong>{summary.totalInvoices}</strong></span>
                        <span>Sub Total: <strong>₹{fmt(summary.subTotal)}</strong></span>
                        <span>Tax: <strong>₹{fmt(summary.taxTotal)}</strong></span>
                        <span style={{ color: "#0d3a7a" }}>Grand Total: <strong>₹{fmt(summary.grandTotal)}</strong></span>
                        <span style={{ color: "#006400" }}>Paid: <strong>₹{fmt(summary.amountPaid)}</strong></span>
                        <span style={{ color: "#cc0000" }}>Outstanding: <strong>₹{fmt(summary.totalOutstanding)}</strong></span>
                    </div>
                )}

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                        <thead>
                            <tr style={{ background: "#2a6fbd", color: "white" }}>
                                <th style={thStyle}>No.</th>
                                <th style={thStyle}>Client Name</th>
                                <th style={thStyle}>Invoice No.</th>
                                <th style={thStyle}>Issue Date</th>
                                <th style={thStyle}>Due Date</th>
                                <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                                <th style={{ ...thStyle, textAlign: "right" }}>Tax</th>
                                <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
                                <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
                                <th style={{ ...thStyle, textAlign: "right" }}>Amount Paid</th>
                                <th style={{ ...thStyle, textAlign: "right" }}>Balance</th>
                                <th style={thStyle}>Type</th>
                                <th style={thStyle}>Fiscal Year</th>
                                <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={14} style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                                        Loading invoices...
                                    </td>
                                </tr>
                            ) : displayedInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={14} style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                                        No invoices found. <Link href="/super-admin/invoices/new" style={{ color: "#2a6fbd" }}>Create New Invoice</Link>
                                    </td>
                                </tr>
                            ) : displayedInvoices.map((inv, i) => {
                                const balance = Math.max(0, inv.grandTotal - inv.amountPaid)
                                const statusInfo = STATUS_LABELS[inv.status] || { label: inv.status, color: "#555" }
                                const isEven = i % 2 === 0
                                const year = new Date(inv.date).getFullYear()
                                const fiscalYear = new Date(inv.date).getMonth() >= 3
                                    ? `${year}-${year + 1}`
                                    : `${year - 1}-${year}`
                                return (
                                    <tr key={inv.id} style={{ background: isEven ? "#f0f6ff" : "white" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#ddeeff")}
                                        onMouseLeave={e => (e.currentTarget.style.background = isEven ? "#f0f6ff" : "white")}>
                                        <td style={tdStyle}>{i + 1}</td>
                                        <td style={{ ...tdStyle, fontWeight: "bold", color: "#1a1a1a" }}>{inv.client.name}</td>
                                        <td style={{ ...tdStyle, color: "#1a4f9a", fontWeight: "bold" }}>{inv.invoiceNumber}</td>
                                        <td style={tdStyle}>{fmtDate(inv.date)}</td>
                                        <td style={tdStyle}>{fmtDate(inv.dueDate)}</td>
                                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(inv.subTotal)}</td>
                                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(inv.taxTotal)}</td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: "bold" }}>{fmt(inv.grandTotal)}</td>
                                        <td style={{ ...tdStyle, textAlign: "center" }}>
                                            <span style={{ color: statusInfo.color, fontWeight: "bold", fontSize: "10px" }}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "right", color: "#006400" }}>{fmt(inv.amountPaid)}</td>
                                        <td style={{ ...tdStyle, textAlign: "right", color: balance > 0 ? "#cc0000" : "#006400" }}>{fmt(balance)}</td>
                                        <td style={tdStyle}>{inv.type === "INVOICE" ? "Standard" : "Estimate"}</td>
                                        <td style={tdStyle}>{fiscalYear}</td>
                                        <td style={{ ...tdStyle, textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "3px", justifyContent: "center" }}>
                                                <Link href={`/super-admin/invoices/${inv.id}`}
                                                    style={{ background: "#2a6fbd", color: "white", padding: "1px 6px", fontSize: "10px", textDecoration: "none", borderRadius: "1px", border: "1px solid #1a4f9a" }}>
                                                    👁 View
                                                </Link>
                                                <Link href={`/super-admin/invoices/${inv.id}/edit`}
                                                    style={{ background: "#4a8f4a", color: "white", padding: "1px 6px", fontSize: "10px", textDecoration: "none", borderRadius: "1px", border: "1px solid #2a6a2a" }}>
                                                    ✏ Edit
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        {displayedInvoices.length > 0 && summary && (
                            <tfoot>
                                <tr style={{ background: "#2a6fbd", color: "white", fontWeight: "bold" }}>
                                    <td colSpan={5} style={{ ...tdStyle, textAlign: "right", fontSize: "11px", letterSpacing: "1px" }}>TOTAL INVOICES</td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(summary.subTotal)}</td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(summary.taxTotal)}</td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(summary.grandTotal)}</td>
                                    <td style={tdStyle} />
                                    <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(summary.amountPaid)}</td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(Math.max(0, summary.grandTotal - summary.amountPaid))}</td>
                                    <td colSpan={3} style={tdStyle} />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ padding: "6px 8px", borderTop: "1px solid #c0d0e8", display: "flex", alignItems: "center", gap: "8px", background: "#f5f9ff" }}>
                    <span style={{ fontSize: "11px", color: "#333" }}>Results Per Page:</span>
                    <select value={resultsPerPage} onChange={e => setResultsPerPage(Number(e.target.value))}
                        style={{ padding: "2px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px", background: "white" }}>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={99}>99</option>
                        <option value={200}>200</option>
                    </select>
                    <button onClick={fetchInvoices}
                        style={{ background: "#2a6fbd", color: "white", padding: "2px 10px", fontSize: "11px", border: "1px solid #1a4f9a", borderRadius: "2px", cursor: "pointer" }}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    )
}

const thStyle: React.CSSProperties = {
    padding: "5px 7px",
    fontWeight: "bold",
    fontSize: "11px",
    borderRight: "1px solid rgba(255,255,255,0.2)",
    whiteSpace: "nowrap",
    letterSpacing: "0.3px",
}

const tdStyle: React.CSSProperties = {
    padding: "3px 7px",
    borderBottom: "1px solid #d0dff0",
    borderRight: "1px solid #d0dff0",
    whiteSpace: "nowrap",
    fontSize: "11px",
}
