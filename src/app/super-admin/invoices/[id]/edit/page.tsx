"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type InvoiceItem = {
    id?: string; tempId?: number; name: string; hsnSacCode: string
    quantity: number; rate: number; taxRate: number; discount: number
}
type Client = {
    id: string; name: string; phone: string | null; email: string | null; gstin: string | null; state: string | null; address?: string | null
    vehicleName?: string | null; vehicleRegNo?: string | null; vehicleChassis?: string | null; odometer?: string | null
    invoices?: { vehicleName: string | null; vehicleRegNo: string | null; vehicleChassis: string | null; odometer: string | null }[]
}
type Invoice = {
    id: string; invoiceNumber: string; type: string; date: string; dueDate: string | null
    status: string; discount: number; notes: string | null; terms: string | null
    clientId: string
    client: Client
    vehicleName: string | null; vehicleRegNo: string | null; vehicleChassis: string | null; odometer: string | null
    items: { id: string; name: string; hsnSacCode: string | null; quantity: number; rate: number; taxRate: number; cgst: number; sgst: number; igst: number; total: number }[]
}

const INDIAN_STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli & Daman & Diu","Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry"]

const lbl: React.CSSProperties = { display: "block", fontSize: "10px", fontWeight: "bold", color: "#333", marginBottom: "2px", textTransform: "uppercase" }
const inp: React.CSSProperties = { width: "100%", fontSize: "11px", border: "1px solid #a0b8d8", padding: "3px 5px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "white" }
const th: React.CSSProperties = { padding: "4px 6px", fontSize: "10px", fontWeight: "bold", background: "#2a6fbd", color: "white", whiteSpace: "nowrap", textAlign: "left" }
const td: React.CSSProperties = { padding: "2px 4px", fontSize: "11px", borderBottom: "1px solid #e0eaf6" }

export default function SuperAdminInvoiceEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [clients, setClients] = useState<Client[]>([])

    // Form state
    const [clientId, setClientId] = useState("")
    const [type, setType] = useState("INVOICE")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [dueDate, setDueDate] = useState("")
    const [status, setStatus] = useState("UNPAID")
    const [discountAmt, setDiscountAmt] = useState(0)
    const [notes, setNotes] = useState("")
    const [terms, setTerms] = useState("")
    const [lineItems, setLineItems] = useState<InvoiceItem[]>([])
    const [vehicleName, setVehicleName] = useState("")
    const [vehicleRegNo, setVehicleRegNo] = useState("")
    const [vehicleChassis, setVehicleChassis] = useState("")
    const [odometer, setOdometer] = useState("")

    // Add line form
    const [lineDesc, setLineDesc] = useState("")
    const [lineHsn, setLineHsn] = useState("")
    const [lineQty, setLineQty] = useState(1)
    const [lineRate, setLineRate] = useState(0)
    const [lineTax, setLineTax] = useState(18)
    const [lineDisc, setLineDisc] = useState(0)
    const [editingId, setEditingId] = useState<number | null>(null)

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/billing/clients").then(r => r.json()),
            fetch(`/api/admin/billing/invoices?id=${id}`).then(r => r.json()),
        ]).then(([cData, iData]) => {
            if (cData.success) setClients(cData.clients)
            if (iData.success && iData.invoice) {
                const inv = iData.invoice
                if (inv) {
                    setInvoice(inv)
                    setClientId(inv.clientId)
                    setType(inv.type)
                    setDate(inv.date.split("T")[0])
                    setDueDate(inv.dueDate ? inv.dueDate.split("T")[0] : "")
                    setStatus(inv.status)
                    setDiscountAmt(inv.discount || 0)
                    setNotes(inv.notes || "")
                    setTerms(inv.terms || "")
                    setVehicleName(inv.vehicleName || "")
                    setVehicleRegNo(inv.vehicleRegNo || "")
                    setVehicleChassis(inv.vehicleChassis || "")
                    setOdometer(inv.odometer || "")
                    setLineItems(inv.items.map((item: any) => ({
                        id: item.id,
                        tempId: Date.now() + Math.random(),
                        name: item.name,
                        hsnSacCode: item.hsnSacCode || "",
                        quantity: item.quantity,
                        rate: item.rate,
                        taxRate: item.taxRate,
                        discount: 0,
                    })))
                }
            }
            setLoading(false)
        })
    }, [id])

    // Computed totals
    const computed = lineItems.map(l => {
        const val = l.quantity * l.rate
        const discAmt = (val * l.discount) / 100
        const taxable = val - discAmt
        const tax = (taxable * l.taxRate) / 100
        return { ...l, taxable, tax, total: taxable + tax }
    })
    const subTotal = computed.reduce((s, l) => s + l.taxable, 0)
    const taxTotal = computed.reduce((s, l) => s + l.tax, 0)
    const grandTotal = subTotal + taxTotal - discountAmt

    const resetLine = () => { setLineDesc(""); setLineHsn(""); setLineQty(1); setLineRate(0); setLineTax(18); setLineDisc(0); setEditingId(null) }

    const addLine = () => {
        if (!lineDesc || lineRate <= 0) return
        if (editingId !== null) {
            setLineItems(prev => prev.map(x => x.tempId === editingId
                ? { ...x, name: lineDesc, hsnSacCode: lineHsn, quantity: lineQty, rate: lineRate, taxRate: lineTax, discount: lineDisc }
                : x
            ))
        } else {
            setLineItems(prev => [...prev, { tempId: Date.now(), name: lineDesc, hsnSacCode: lineHsn, quantity: lineQty, rate: lineRate, taxRate: lineTax, discount: lineDisc }])
        }
        resetLine()
    }

    const handleEditLine = (l: InvoiceItem) => {
        setEditingId(l.tempId || null)
        setLineDesc(l.name); setLineHsn(l.hsnSacCode); setLineQty(l.quantity)
        setLineRate(l.rate); setLineTax(l.taxRate); setLineDisc(l.discount)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleSave = async () => {
        if (!clientId) { alert("Please select a client"); return }
        if (lineItems.length === 0) { alert("Add at least one item"); return }
        setSaving(true)
        const res = await fetch("/api/admin/billing/invoices", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id,
                clientId,
                type,
                date,
                dueDate: dueDate || null,
                status,
                items: lineItems,
                discount: discountAmt,
                notes,
                terms,
                vehicleName,
                vehicleRegNo,
                vehicleChassis,
                odometer
            }),
        })
        setSaving(false)
        const data = await res.json()
        if (data.success) {
            router.push(`/super-admin/invoices/${id}`)
        } else {
            alert(data.error || "Failed to save changes")
        }
    }

    // ─── Styles ─────────────────────────────────────────────────────────────
    const pageStyle: React.CSSProperties = { minHeight: "100vh", background: "#d0d8e8", fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#111" }
    const topBar: React.CSSProperties = { background: "linear-gradient(to bottom, #3a80cd, #2a6fbd)", color: "white", padding: "4px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }
    const section: React.CSSProperties = { background: "white", border: "1px solid #a0b8d8", borderRadius: "2px", marginBottom: "6px" }
    const sectionHdr: React.CSSProperties = { background: "#2a6fbd", color: "white", padding: "3px 8px", fontWeight: "bold", fontSize: "11px" }
    const btn = (bg: string, color = "white"): React.CSSProperties => ({ background: bg, color, padding: "3px 12px", fontSize: "11px", border: "none", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" })
    const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`

    if (loading) return (
        <div style={pageStyle}>
            <div style={topBar}><span>Edit Invoice — Loading...</span></div>
            <div style={{ textAlign: "center", padding: "60px", color: "#555" }}>🔄 Loading...</div>
        </div>
    )
    if (!invoice) return (
        <div style={pageStyle}>
            <div style={topBar}><span>Invoice Not Found</span></div>
            <div style={{ textAlign: "center", padding: "60px", color: "#cc0000" }}>❌ Not found</div>
        </div>
    )

    return (
        <div style={pageStyle}>
            {/* ── TOP BAR ─── */}
            <div style={topBar}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Link href={`/super-admin/invoices/${id}`} style={{ color: "white", textDecoration: "none" }}>← Back to View</Link>
                    <span style={{ color: "#ffffff88" }}>|</span>
                    <span style={{ fontWeight: "bold", fontSize: "13px" }}>✏ Edit Invoice: {invoice.invoiceNumber}</span>
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                    <Link href={`/super-admin/invoices/${id}`}>
                        <button style={btn("#888")}>✕ Cancel</button>
                    </Link>
                    <button onClick={handleSave} disabled={saving} style={btn("#198a19")}>
                        {saving ? "Saving..." : "💾 Save Changes"}
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: "960px", margin: "8px auto", padding: "0 8px" }}>

                {/* ── INVOICE META ─── */}
                <div style={section}>
                    <div style={sectionHdr}>Invoice Details</div>
                    <div style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                        <div>
                            <label style={lbl}>Invoice No.</label>
                            <input value={invoice.invoiceNumber} readOnly style={{ ...inp, background: "#f0f0f0", color: "#666" }} />
                        </div>
                        <div>
                            <label style={lbl}>Type</label>
                            <select value={type} onChange={e => setType(e.target.value)} style={inp}>
                                <option value="INVOICE">Tax Invoice</option>
                                <option value="ESTIMATE">Estimate / Quotation</option>
                                <option value="RECEIPT">Receipt</option>
                                <option value="CREDIT_NOTE">Credit Note</option>
                            </select>
                        </div>
                        <div>
                            <label style={lbl}>Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} style={inp}>
                                <option value="DRAFT">Draft</option>
                                <option value="UNPAID">Unpaid</option>
                                <option value="PAID">Paid</option>
                                <option value="PARTIALLY_PAID">Partially Paid</option>
                                <option value="OVERDUE">Overdue</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label style={lbl}>Invoice Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
                        </div>
                        <div>
                            <label style={lbl}>Due Date</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inp} />
                        </div>
                        <div>
                            <label style={lbl}>Overall Discount (₹)</label>
                            <input type="number" value={discountAmt} onChange={e => setDiscountAmt(parseFloat(e.target.value) || 0)} style={inp} />
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                            <label style={lbl}>Client</label>
                            <select value={clientId} onChange={e => {
                                const val = e.target.value
                                setClientId(val)
                                const c = clients.find(x => x.id === val)
                                const vName = c?.vehicleName || c?.invoices?.[0]?.vehicleName
                                const vReg = c?.vehicleRegNo || c?.invoices?.[0]?.vehicleRegNo
                                const vChassis = c?.vehicleChassis || c?.invoices?.[0]?.vehicleChassis
                                const vOdo = c?.odometer || c?.invoices?.[0]?.odometer
                                if (c) {
                                    setVehicleName(vName || "")
                                    setVehicleRegNo(vReg || "")
                                    setVehicleChassis(vChassis || "")
                                    setOdometer(vOdo || "")
                                }
                            }} style={inp}>
                                <option value="">Select client...</option>
                                {clients.map(c => {
                                    const vName = c.vehicleName || c.invoices?.[0]?.vehicleName
                                    const vReg = c.vehicleRegNo || c.invoices?.[0]?.vehicleRegNo
                                    const label = c.name + (c.phone ? ` — ${c.phone}` : "") + (vReg ? ` (${vName || "Vehicle"} - ${vReg})` : "")
                                    return <option key={c.id} value={c.id}>{label}</option>
                                })}
                            </select>
                            {clientId && (() => {
                                const c = clients.find(x => x.id === clientId)
                                const vName = c?.vehicleName || c?.invoices?.[0]?.vehicleName
                                const vReg = c?.vehicleRegNo || c?.invoices?.[0]?.vehicleRegNo
                                return c ? (
                                    <div style={{ marginTop: "4px", fontSize: "10px", color: "#555", background: "#f0f6ff", border: "1px solid #c0d0e8", padding: "4px" }}>
                                        {c.phone && <div>📞 {c.phone}</div>}
                                        {c.email && <div>✉️ {c.email}</div>}
                                        {c.gstin && <div>🏛 GSTIN: {c.gstin}</div>}
                                        {c.address && <div>📍 {c.address}</div>}
                                        {vReg && (
                                            <div style={{ color: "#2a6fbd", fontWeight: "bold", marginTop: "2px" }}>🚗 Vehicle: {vName} ({vReg})</div>
                                        )}
                                    </div>
                                ) : null
                            })()}
                        </div>
                    </div>
                </div>

                {/* ── ADD ITEM ROW ─── */}
                <div style={section}>
                    <div style={{ ...sectionHdr, background: editingId !== null ? "#16acd4" : "#2a6fbd", color: editingId !== null ? "#000" : "white" }}>
                        {editingId !== null ? "✏ Edit Item — Make changes then click Update" : "Add / Edit Line Items"}
                    </div>
                    <div style={{ padding: "8px 10px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "flex-end" }}>
                        <div style={{ flex: "2 1 180px" }}>
                            <label style={lbl}>Description *</label>
                            <input value={lineDesc} onChange={e => setLineDesc(e.target.value)} style={inp} placeholder="Item or service name..." />
                        </div>
                        <div style={{ flex: "1 1 80px" }}>
                            <label style={lbl}>HSN/SAC</label>
                            <input value={lineHsn} onChange={e => setLineHsn(e.target.value)} style={inp} />
                        </div>
                        <div style={{ flex: "0 0 60px" }}>
                            <label style={lbl}>Qty</label>
                            <input type="number" value={lineQty} onChange={e => setLineQty(parseFloat(e.target.value) || 1)} style={inp} min={1} />
                        </div>
                        <div style={{ flex: "1 1 90px" }}>
                            <label style={lbl}>Unit Price (₹)</label>
                            <input type="number" value={lineRate} onChange={e => setLineRate(parseFloat(e.target.value) || 0)} style={inp} />
                        </div>
                        <div style={{ flex: "0 0 70px" }}>
                            <label style={lbl}>Disc %</label>
                            <input type="number" value={lineDisc} onChange={e => setLineDisc(parseFloat(e.target.value) || 0)} style={inp} />
                        </div>
                        <div style={{ flex: "0 0 70px" }}>
                            <label style={lbl}>Tax %</label>
                            <select value={lineTax} onChange={e => setLineTax(parseFloat(e.target.value))} style={inp}>
                                {[0, 5, 12, 18, 28].map(t => <option key={t} value={t}>{t}%</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={addLine} style={{ ...btn(editingId !== null ? "#16acd4" : "#2a6fbd", editingId !== null ? "#000" : "white"), padding: "5px 14px" }}>
                                {editingId !== null ? "✔ Update" : "➕ ADD"}
                            </button>
                            {editingId !== null && (
                                <button onClick={resetLine} style={{ ...btn("#888"), padding: "5px 10px" }}>✕</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── ITEMS TABLE ─── */}
                <div style={section}>
                    <div style={sectionHdr}>Invoice Items ({lineItems.length})</div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    {["#", "Description", "HSN", "Qty", "Rate", "Disc%", "Tax%", "Taxable", "Tax", "Total", "Action"].map(h => (
                                        <th key={h} style={{ ...th, textAlign: ["Qty", "Rate", "Tax%", "Disc%", "Taxable", "Tax", "Total"].includes(h) ? "right" : "left" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.length === 0 ? (
                                    <tr><td colSpan={11} style={{ ...td, textAlign: "center", color: "#888", padding: "16px", fontStyle: "italic" }}>No items added yet. Use the form above to add items.</td></tr>
                                ) : computed.map((l, i) => (
                                    <tr key={l.tempId} style={{ background: editingId === l.tempId ? "#fff8e0" : i % 2 === 0 ? "#f5f8ff" : "white" }}>
                                        <td style={td}>{i + 1}</td>
                                        <td style={{ ...td, fontWeight: "bold" }}>{l.name}</td>
                                        <td style={{ ...td, fontFamily: "monospace" }}>{l.hsnSacCode || "—"}</td>
                                        <td style={{ ...td, textAlign: "right" }}>{l.quantity}</td>
                                        <td style={{ ...td, textAlign: "right", fontFamily: "monospace" }}>₹{l.rate.toFixed(2)}</td>
                                        <td style={{ ...td, textAlign: "right" }}>{l.discount}%</td>
                                        <td style={{ ...td, textAlign: "right" }}>{l.taxRate}%</td>
                                        <td style={{ ...td, textAlign: "right", fontFamily: "monospace" }}>₹{l.taxable.toFixed(2)}</td>
                                        <td style={{ ...td, textAlign: "right", fontFamily: "monospace", color: "#555" }}>₹{l.tax.toFixed(2)}</td>
                                        <td style={{ ...td, textAlign: "right", fontFamily: "monospace", fontWeight: "bold", color: "#2a6fbd" }}>₹{l.total.toFixed(2)}</td>
                                        <td style={{ ...td, whiteSpace: "nowrap" }}>
                                            <div style={{ display: "flex", gap: "3px" }}>
                                                <button onClick={() => handleEditLine(l)}
                                                    style={{ background: editingId === l.tempId ? "#16acd4" : "#2a6fbd", color: editingId === l.tempId ? "#000" : "white", padding: "2px 7px", fontSize: "10px", border: "none", cursor: "pointer", borderRadius: "1px", fontWeight: "bold" }}>
                                                    ✏ Edit
                                                </button>
                                                <button onClick={() => { setLineItems(prev => prev.filter(x => x.tempId !== l.tempId)); if (editingId === l.tempId) resetLine() }}
                                                    style={{ background: "#cc0000", color: "white", padding: "2px 7px", fontSize: "10px", border: "none", cursor: "pointer", borderRadius: "1px", fontWeight: "bold" }}>
                                                    ✕ Del
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── NOTES + TOTALS ─── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "6px" }}>
                    <div style={section}>
                        <div style={sectionHdr}>Notes & Terms</div>
                        <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div>
                                <label style={lbl}>Note (printed on invoice)</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...inp, resize: "vertical" }} />
                            </div>
                            <div>
                                <label style={lbl}>Terms & Conditions</label>
                                <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={3} style={{ ...inp, resize: "vertical" }} />
                            </div>
                        </div>
                    </div>

                    <div style={section}>
                        <div style={sectionHdr}>SUMMARY</div>
                        <div style={{ padding: "8px 12px" }}>
                            {[
                                ["Sub Total", fmt(subTotal), ""],
                                ["Tax Total", fmt(taxTotal), "#555"],
                                ...(discountAmt > 0 ? [["Discount", `- ${fmt(discountAmt)}`, "#cc0000"]] : []),
                            ].map(([label, value, color]) => (
                                <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px", color: color as string || "#333" }}>
                                    <span>{label}</span><span style={{ fontFamily: "monospace" }}>{value}</span>
                                </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0 3px", fontWeight: "bold", fontSize: "14px", borderTop: "2px solid #2a6fbd", marginTop: "4px", color: "#2a6fbd" }}>
                                <span>Grand Total</span><span style={{ fontFamily: "monospace" }}>{fmt(grandTotal)}</span>
                            </div>
                            <button onClick={handleSave} disabled={saving}
                                style={{ marginTop: "10px", width: "100%", background: "#198a19", color: "white", padding: "6px", fontSize: "11px", border: "none", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                                {saving ? "Saving..." : "💾 Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
