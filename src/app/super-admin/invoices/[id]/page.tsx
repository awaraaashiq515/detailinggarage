"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type InvoiceItem = {
    id: string; name: string; hsnSacCode: string | null
    quantity: number; rate: number; taxRate: number
    cgst: number; sgst: number; igst: number; total: number
}
type Payment = {
    id: string; amount: number; paymentMethod: string
    reference: string | null; paymentDate: string; notes: string | null
}
type Invoice = {
    id: string; invoiceNumber: string; type: string; date: string; dueDate: string | null
    status: string; subTotal: number; cgstTotal: number; sgstTotal: number
    igstTotal: number; taxTotal: number; discount: number; grandTotal: number; amountPaid: number
    notes: string | null; terms: string | null
    vehicleName: string | null; vehicleRegNo: string | null; vehicleChassis: string | null; odometer: string | null
    client: {
        name: string; phone: string | null; email: string | null
        gstin: string | null; address: string | null; state: string | null; city: string | null
    }
    items: InvoiceItem[]
    payments: Payment[]
}
type BizProfile = {
    businessName: string; tagline: string | null; logoUrl: string | null
    phone: string | null; email: string | null; address: string | null
    city: string | null; state: string | null; pinCode: string | null
    gstin: string | null; pan: string | null
    bankName: string | null; accountNumber: string | null; ifscCode: string | null; upiId: string | null
    defaultNotes: string | null; defaultTerms: string | null; signatureUrl: string | null
}

const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
    PAID:           { label: "PAID",           bg: "#198a19", color: "white" },
    UNPAID:         { label: "UNPAID",         bg: "#cc6600", color: "white" },
    PARTIALLY_PAID: { label: "PARTIAL",        bg: "#2a6fbd", color: "white" },
    OVERDUE:        { label: "OVERDUE",        bg: "#cc0000", color: "white" },
    DRAFT:          { label: "DRAFT",          bg: "#888888", color: "white" },
    CANCELLED:      { label: "CANCELLED",      bg: "#444444", color: "white" },
}

const lbl: React.CSSProperties = { display: "block", fontSize: "10px", fontWeight: "bold", color: "#555", marginBottom: "2px", textTransform: "uppercase" }
const inp: React.CSSProperties = { width: "100%", fontSize: "12px", border: "1px solid #a0b8d8", padding: "3px 5px", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }
const th: React.CSSProperties = { padding: "4px 8px", textAlign: "left", fontSize: "11px", fontWeight: "bold", borderBottom: "2px solid #2a6fbd", background: "#e8f0fb", whiteSpace: "nowrap" }
const td: React.CSSProperties = { padding: "4px 8px", fontSize: "11px", borderBottom: "1px solid #e0eaf6" }

export default function SuperAdminInvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [biz, setBiz] = useState<BizProfile | null>(null)
    const [loading, setLoading] = useState(true)
    // Payment modal
    const [showPayModal, setShowPayModal] = useState(false)
    const [payAmount, setPayAmount] = useState("")
    const [payMethod, setPayMethod] = useState("CASH")
    const [payRef, setPayRef] = useState("")
    const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0])
    const [paying, setPaying] = useState(false)

    const fetchInvoice = async () => {
        setLoading(true)
        const [invRes, bizRes] = await Promise.all([
            fetch(`/api/admin/billing/invoices?id=${id}`),
            fetch(`/api/admin/billing/profile`),
        ])
        const invData = await invRes.json()
        const bizData = await bizRes.json()
        if (invData.success && invData.invoice) { setInvoice(invData.invoice) } else { setInvoice(null) }
        if (bizData.success) setBiz(bizData.profile)
        setLoading(false)
    }

    useEffect(() => { fetchInvoice() }, [id])

    const handleMarkStatus = async (status: string) => {
        if (!confirm(`Mark invoice as ${status}?`)) return
        await fetch("/api/admin/billing/invoices", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        })
        fetchInvoice()
    }

    const handleDelete = async () => {
        if (!confirm("Delete this invoice permanently? This cannot be undone.")) return
        await fetch(`/api/admin/billing/invoices?id=${id}`, { method: "DELETE" })
        router.push("/super-admin/invoices")
    }

    const handleRecordPayment = async () => {
        if (!payAmount || parseFloat(payAmount) <= 0) { alert("Enter a valid amount"); return }
        setPaying(true)
        const res = await fetch("/api/admin/billing/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invoiceId: id, amount: parseFloat(payAmount), paymentMethod: payMethod, reference: payRef, paymentDate: payDate }),
        })
        const data = await res.json()
        setPaying(false)
        if (data.success) { setShowPayModal(false); setPayAmount(""); setPayRef(""); fetchInvoice() }
        else alert(data.error || "Failed to record payment")
    }

    // ─── Styles ───────────────────────────────────────────────────────────────
    const pageStyle: React.CSSProperties = {
        minHeight: "100vh", background: "#d0d8e8", fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#111"
    }
    const topBar: React.CSSProperties = {
        background: "linear-gradient(to bottom, #3a80cd, #2a6fbd)",
        color: "white", padding: "4px 8px", display: "flex", justifyContent: "space-between", alignItems: "center"
    }
    const section: React.CSSProperties = {
        background: "white", border: "1px solid #a0b8d8", borderRadius: "2px", marginBottom: "6px"
    }
    const sectionHdr: React.CSSProperties = {
        background: "#2a6fbd", color: "white", padding: "3px 8px", fontWeight: "bold", fontSize: "11px", letterSpacing: "0.3px"
    }
    const btn = (bg: string, color = "white"): React.CSSProperties => ({
        background: bg, color, padding: "3px 10px", fontSize: "11px", border: `1px solid ${bg === "white" ? "#aaa" : "transparent"}`,
        borderRadius: "2px", cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap"
    })

    if (loading) return (
        <div style={pageStyle}>
            <div style={topBar}><span style={{ fontWeight: "bold" }}>Invoice — Loading...</span></div>
            <div style={{ textAlign: "center", padding: "60px", color: "#555" }}>🔄 Loading invoice...</div>
        </div>
    )
    if (!invoice) return (
        <div style={pageStyle}>
            <div style={topBar}><span style={{ fontWeight: "bold" }}>Invoice Not Found</span></div>
            <div style={{ textAlign: "center", padding: "60px", color: "#cc0000" }}>
                ❌ Invoice not found. <Link href="/super-admin/invoices" style={{ color: "#2a6fbd" }}>← Back to list</Link>
            </div>
        </div>
    )

    const balance = Math.max(0, invoice.grandTotal - invoice.amountPaid)
    const statusInfo = STATUS_LABEL[invoice.status] || STATUS_LABEL.DRAFT

    return (
        <div style={pageStyle}>
            {/* ── TOP BAR ─────────────────────────────────────────────────── */}
            <div style={topBar}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Link href="/super-admin/invoices" style={{ color: "white", textDecoration: "none", fontSize: "13px" }}>← Back</Link>
                    <span style={{ color: "#ffffff88" }}>|</span>
                    <span style={{ fontWeight: "bold", fontSize: "13px" }}>Invoice: {invoice.invoiceNumber}</span>
                    <span style={{ background: statusInfo.bg, color: statusInfo.color, padding: "1px 7px", fontSize: "10px", fontWeight: "bold", borderRadius: "2px" }}>
                        {statusInfo.label}
                    </span>
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                    <button onClick={() => window.print()} style={btn("#555")}>🖨 Print</button>
                    <Link href={`/super-admin/invoices/${id}/edit`}>
                        <button style={btn("#16acd4", "#000")}>✏ Edit</button>
                    </Link>
                    {invoice.status !== "PAID" && (
                        <button onClick={() => setShowPayModal(true)} style={btn("#198a19")}>💰 Record Payment</button>
                    )}
                    {invoice.status === "DRAFT" && (
                        <button onClick={() => handleMarkStatus("UNPAID")} style={btn("#2a6fbd")}>✓ Finalize</button>
                    )}
                    {invoice.status !== "CANCELLED" && (
                        <button onClick={() => handleMarkStatus("CANCELLED")} style={btn("#888")}>✕ Cancel</button>
                    )}
                    <button onClick={handleDelete} style={btn("#cc0000")}>🗑 Delete</button>
                </div>
            </div>

            <div style={{ maxWidth: "900px", margin: "8px auto", padding: "0 8px" }}>

                {/* ── INVOICE HEADER ──────────────────────────────────────── */}
                <div style={{ ...section, marginBottom: "6px" }}>
                    <div style={{ padding: "10px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                            {biz?.logoUrl && <img src={biz.logoUrl} alt="logo" style={{ height: "40px", objectFit: "contain", marginBottom: "4px" }} />}
                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#2a6fbd" }}>{biz?.businessName || "Your Business"}</div>
                            {biz?.tagline && <div style={{ fontSize: "11px", color: "#555" }}>{biz.tagline}</div>}
                            <div style={{ marginTop: "4px", fontSize: "10px", color: "#555" }}>
                                {biz?.address && <div>{biz.address}</div>}
                                {(biz?.city || biz?.state) && <div>{[biz.city, biz.state, biz.pinCode].filter(Boolean).join(", ")}</div>}
                                {biz?.phone && <div>📞 {biz.phone}</div>}
                                {biz?.email && <div>✉ {biz.email}</div>}
                                {biz?.gstin && <div>GSTIN: <strong style={{ fontFamily: "monospace" }}>{biz.gstin}</strong></div>}
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "11px", color: "#555", fontWeight: "bold" }}>
                                {invoice.type === "QUOTATION" ? "QUOTATION" : invoice.type === "PROFORMA" ? "PROFORMA INVOICE" : invoice.type === "CHALLAN" ? "DELIVERY CHALLAN" : "TAX INVOICE"}
                            </div>
                            <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>Invoice No.</div>
                            <div style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "monospace" }}>{invoice.invoiceNumber}</div>
                            <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>
                                Date: <strong>{new Date(invoice.date).toLocaleDateString("en-IN")}</strong>
                            </div>
                            {invoice.dueDate && (
                                <div style={{ fontSize: "11px", color: "#cc6600" }}>
                                    Due: <strong>{new Date(invoice.dueDate).toLocaleDateString("en-IN")}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── BILL TO & VEHICLE DETAILS ─────────────────────────────── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
                    <div style={section}>
                        <div style={sectionHdr}>BILL TO</div>
                        <div style={{ padding: "8px 12px", minHeight: "80px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontWeight: "bold", fontSize: "13px" }}>{invoice.client.name}</div>
                                {invoice.client.address && <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>{invoice.client.address}</div>}
                            </div>
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px", paddingTop: "6px", borderTop: "1px solid #e0eaf6" }}>
                                {invoice.client.city && <span style={{ fontSize: "11px", color: "#555" }}>📍 {invoice.client.city}{invoice.client.state ? `, ${invoice.client.state}` : ""}</span>}
                                {invoice.client.phone && <span style={{ fontSize: "11px", color: "#555" }}>📞 {invoice.client.phone}</span>}
                                {invoice.client.email && <span style={{ fontSize: "11px", color: "#555" }}>✉ {invoice.client.email}</span>}
                                {invoice.client.gstin && <span style={{ fontSize: "11px", color: "#333" }}>GSTIN: <strong style={{ fontFamily: "monospace" }}>{invoice.client.gstin}</strong></span>}
                            </div>
                        </div>
                    </div>

                    <div style={section}>
                        <div style={sectionHdr}>VEHICLE DETAILS</div>
                        <div style={{ padding: "8px 12px", minHeight: "80px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontWeight: "bold", fontSize: "13px" }}>{invoice.vehicleName || <span style={{ color: "#888", fontStyle: "italic" }}>No Vehicle Details</span>}</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                                    {invoice.vehicleRegNo && (
                                        <div>
                                            <span style={{ fontSize: "10px", color: "#666", display: "block", fontWeight: "bold" }}>REG NO:</span>
                                            <span style={{ fontSize: "11px", fontFamily: "monospace" }}>{invoice.vehicleRegNo}</span>
                                        </div>
                                    )}
                                    {invoice.odometer && (
                                        <div>
                                            <span style={{ fontSize: "10px", color: "#666", display: "block", fontWeight: "bold" }}>ODOMETER:</span>
                                            <span style={{ fontSize: "11px" }}>{invoice.odometer}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {invoice.vehicleChassis && (
                                <div style={{ marginTop: "8px", paddingTop: "6px", borderTop: "1px solid #e0eaf6" }}>
                                    <span style={{ fontSize: "10px", color: "#666", fontWeight: "bold" }}>CHASSIS / VIN: </span>
                                    <strong style={{ fontFamily: "monospace", fontSize: "11px" }}>{invoice.vehicleChassis}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── ITEMS TABLE ─────────────────────────────────────────── */}
                <div style={section}>
                    <div style={sectionHdr}>ITEMS / SERVICES</div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    {["#", "Item / Service", "HSN/SAC", "Qty", "Rate", "Value", "Disc%", "CGST", "SGST", "IGST", "Total"].map(h => (
                                        <th key={h} style={{ ...th, textAlign: ["Qty", "Rate", "Value", "CGST", "SGST", "IGST", "Total"].includes(h) ? "right" : "left" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, i) => {
                                    const val = item.quantity * item.rate
                                    return (
                                        <tr key={item.id} style={{ background: i % 2 === 0 ? "#f5f8ff" : "white" }}>
                                            <td style={td}>{i + 1}</td>
                                            <td style={{ ...td, fontWeight: "bold" }}>{item.name}</td>
                                            <td style={{ ...td, fontFamily: "monospace" }}>{item.hsnSacCode || "—"}</td>
                                            <td style={{ ...td, textAlign: "right" }}>{item.quantity}</td>
                                            <td style={{ ...td, textAlign: "right", fontFamily: "monospace" }}>{fmt(item.rate)}</td>
                                            <td style={{ ...td, textAlign: "right", fontFamily: "monospace" }}>{fmt(val)}</td>
                                            <td style={{ ...td, textAlign: "right" }}>—</td>
                                            <td style={{ ...td, textAlign: "right", fontFamily: "monospace", color: "#555" }}>{fmt(item.cgst)}</td>
                                            <td style={{ ...td, textAlign: "right", fontFamily: "monospace", color: "#555" }}>{fmt(item.sgst)}</td>
                                            <td style={{ ...td, textAlign: "right", fontFamily: "monospace", color: "#555" }}>{fmt(item.igst)}</td>
                                            <td style={{ ...td, textAlign: "right", fontFamily: "monospace", fontWeight: "bold", color: "#2a6fbd" }}>{fmt(item.total)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── TOTALS + PAYMENT HISTORY ────────────────────────────── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "6px" }}>

                    {/* Payment History */}
                    <div style={section}>
                        <div style={sectionHdr}>PAYMENT HISTORY</div>
                        <div style={{ padding: "8px 12px" }}>
                            {invoice.payments.length === 0 ? (
                                <div style={{ color: "#888", fontSize: "11px", fontStyle: "italic", padding: "8px 0" }}>No payments recorded yet.</div>
                            ) : (
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            {["Date", "Method", "Reference", "Amount"].map(h => (
                                                <th key={h} style={{ ...th, fontSize: "10px" }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.payments.map((p, i) => (
                                            <tr key={p.id} style={{ background: i % 2 === 0 ? "#f5f8ff" : "white" }}>
                                                <td style={td}>{new Date(p.paymentDate).toLocaleDateString("en-IN")}</td>
                                                <td style={td}>{p.paymentMethod}</td>
                                                <td style={{ ...td, fontFamily: "monospace" }}>{p.reference || "—"}</td>
                                                <td style={{ ...td, textAlign: "right", fontFamily: "monospace", fontWeight: "bold", color: "#198a19" }}>{fmt(p.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {invoice.notes && (
                                <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #d0e0f0" }}>
                                    <div style={{ fontSize: "10px", fontWeight: "bold", color: "#555", marginBottom: "2px" }}>NOTES</div>
                                    <div style={{ fontSize: "11px", color: "#333" }}>{invoice.notes}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Totals */}
                    <div style={section}>
                        <div style={sectionHdr}>SUMMARY</div>
                        <div style={{ padding: "8px 12px" }}>
                            {[
                                ["Sub Total", fmt(invoice.subTotal), ""],
                                ["CGST", fmt(invoice.cgstTotal), "#555"],
                                ["SGST", fmt(invoice.sgstTotal), "#555"],
                                ...(invoice.igstTotal > 0 ? [["IGST", fmt(invoice.igstTotal), "#555"]] : []),
                                ...(invoice.discount > 0 ? [["Discount", `- ${fmt(invoice.discount)}`, "#cc0000"]] : []),
                            ].map(([label, value, color]) => (
                                <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px", color: color as string || "#333" }}>
                                    <span>{label}</span>
                                    <span style={{ fontFamily: "monospace" }}>{value}</span>
                                </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0 3px", fontWeight: "bold", fontSize: "13px", borderTop: "2px solid #2a6fbd", marginTop: "4px" }}>
                                <span>Grand Total</span>
                                <span style={{ fontFamily: "monospace", color: "#2a6fbd" }}>{fmt(invoice.grandTotal)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px", color: "#198a19" }}>
                                <span>Paid</span>
                                <span style={{ fontFamily: "monospace" }}>{fmt(invoice.amountPaid)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0 3px", fontWeight: "bold", fontSize: "13px", borderTop: "1px solid #d0e0f0", marginTop: "2px", color: balance > 0 ? "#cc6600" : "#198a19" }}>
                                <span>Balance Due</span>
                                <span style={{ fontFamily: "monospace" }}>{fmt(balance)}</span>
                            </div>

                            {invoice.status !== "PAID" && balance > 0 && (
                                <button onClick={() => setShowPayModal(true)}
                                    style={{ marginTop: "8px", width: "100%", background: "#198a19", color: "white", padding: "5px", fontSize: "11px", border: "none", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                                    💰 Record Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PAYMENT MODAL ───────────────────────────────────────────── */}
            {showPayModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "white", border: "2px solid #2a6fbd", borderRadius: "4px", width: "380px", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
                        <div style={{ background: "linear-gradient(to bottom, #2a6fbd, #1a4f9a)", color: "white", padding: "7px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: "bold", fontSize: "13px" }}>💰 Record Payment</span>
                            <button onClick={() => setShowPayModal(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "16px" }}>✕</button>
                        </div>
                        <div style={{ padding: "12px" }}>
                            <div style={{ background: "#f0f6ff", border: "1px solid #c0d8f0", borderRadius: "3px", padding: "6px 10px", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "11px", color: "#555" }}>Balance Due</span>
                                <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#cc6600" }}>{fmt(balance)}</span>
                            </div>
                            {[
                                { label: "Amount *", type: "number", value: payAmount, onChange: (e: any) => setPayAmount(e.target.value), placeholder: `Max: ${balance.toFixed(2)}` },
                                { label: "Ref / UTR", type: "text", value: payRef, onChange: (e: any) => setPayRef(e.target.value), placeholder: "Optional" },
                                { label: "Payment Date", type: "date", value: payDate, onChange: (e: any) => setPayDate(e.target.value) },
                            ].map(f => (
                                <div key={f.label} style={{ marginBottom: "8px" }}>
                                    <label style={lbl}>{f.label}</label>
                                    <input type={f.type} value={f.value} onChange={f.onChange} placeholder={f.placeholder} style={inp} />
                                </div>
                            ))}
                            <div style={{ marginBottom: "8px" }}>
                                <label style={lbl}>Payment Method *</label>
                                <select value={payMethod} onChange={e => setPayMethod(e.target.value)} style={inp}>
                                    {["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE"].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div style={{ padding: "8px 12px", borderTop: "1px solid #d0dff0", display: "flex", justifyContent: "flex-end", gap: "6px", background: "#f5f9ff" }}>
                            <button onClick={() => setShowPayModal(false)}
                                style={{ background: "#e0e0e0", color: "#333", padding: "5px 14px", fontSize: "11px", border: "1px solid #aaa", borderRadius: "2px", cursor: "pointer" }}>
                                Cancel
                            </button>
                            <button onClick={handleRecordPayment} disabled={paying}
                                style={{ background: "#198a19", color: "white", padding: "5px 16px", fontSize: "11px", border: "none", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                                {paying ? "Saving..." : "✓ Save Payment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
