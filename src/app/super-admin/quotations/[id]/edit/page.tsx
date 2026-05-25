"use client"
import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type LineItem = { id?: string; tempId: number; name: string; hsnSacCode: string; quantity: number; rate: number; taxRate: number; discount: number }
type Client = { id: string; name: string; phone: string | null }

const lbl: React.CSSProperties = { display: "block", fontSize: "10px", fontWeight: "bold", color: "#333", marginBottom: "2px", textTransform: "uppercase" }
const inp: React.CSSProperties = { width: "100%", fontSize: "11px", border: "1px solid #b0a0d8", padding: "3px 5px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }
const th: React.CSSProperties = { padding: "4px 6px", fontSize: "10px", fontWeight: "bold", background: "#5a3fa0", color: "white", whiteSpace: "nowrap" }
const td: React.CSSProperties = { padding: "3px 6px", fontSize: "11px", borderBottom: "1px solid #e0d8f6" }

export default function QuotationEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [clients, setClients] = useState<Client[]>([])
    const [clientId, setClientId] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [dueDate, setDueDate] = useState("")
    const [status, setStatus] = useState("DRAFT")
    const [discount, setDiscount] = useState(0)
    const [notes, setNotes] = useState("")
    const [terms, setTerms] = useState("")
    const [lineItems, setLineItems] = useState<LineItem[]>([])
    const [invoiceNumber, setInvoiceNumber] = useState("")
    // line form
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
                setInvoiceNumber(inv.invoiceNumber)
                setClientId(inv.clientId)
                setDate(inv.date.split("T")[0])
                setDueDate(inv.dueDate ? inv.dueDate.split("T")[0] : "")
                setStatus(inv.status)
                setDiscount(inv.discount || 0)
                setNotes(inv.notes || "")
                setTerms(inv.terms || "")
                setLineItems(inv.items.map((it: any) => ({ id: it.id, tempId: Date.now() + Math.random(), name: it.name, hsnSacCode: it.hsnSacCode || "", quantity: it.quantity, rate: it.rate, taxRate: it.taxRate, discount: 0 })))
            }
            setLoading(false)
        })
    }, [id])

    const computed = lineItems.map(l => {
        const val = l.quantity * l.rate
        const taxable = val * (1 - l.discount / 100)
        return { ...l, taxable, tax: taxable * l.taxRate / 100, total: taxable + taxable * l.taxRate / 100 }
    })
    const subTotal = computed.reduce((s, l) => s + l.taxable, 0)
    const taxTotal = computed.reduce((s, l) => s + l.tax, 0)
    const grandTotal = subTotal + taxTotal - discount

    const resetLine = () => { setLineDesc(""); setLineHsn(""); setLineQty(1); setLineRate(0); setLineTax(18); setLineDisc(0); setEditingId(null) }
    const addLine = () => {
        if (!lineDesc || lineRate <= 0) return
        if (editingId !== null) {
            setLineItems(prev => prev.map(x => x.tempId === editingId ? { ...x, name: lineDesc, hsnSacCode: lineHsn, quantity: lineQty, rate: lineRate, taxRate: lineTax, discount: lineDisc } : x))
        } else {
            setLineItems(prev => [...prev, { tempId: Date.now(), name: lineDesc, hsnSacCode: lineHsn, quantity: lineQty, rate: lineRate, taxRate: lineTax, discount: lineDisc }])
        }
        resetLine()
    }
    const editLine = (l: LineItem) => { setEditingId(l.tempId); setLineDesc(l.name); setLineHsn(l.hsnSacCode); setLineQty(l.quantity); setLineRate(l.rate); setLineTax(l.taxRate); setLineDisc(l.discount) }

    const handleSave = async () => {
        if (!clientId) { alert("Select a client"); return }
        if (lineItems.length === 0) { alert("Add at least one item"); return }
        setSaving(true)
        await fetch("/api/admin/billing/invoices", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) })
        setSaving(false)
        router.push(`/super-admin/quotations/${id}`)
    }

    const topBar: React.CSSProperties = { background: "linear-gradient(to bottom, #6a4fbd, #5a3fa0)", color: "white", padding: "4px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }
    const section: React.CSSProperties = { background: "white", border: "1px solid #b0a0d8", borderRadius: "2px", marginBottom: "6px" }
    const sHdr = (editing = false): React.CSSProperties => ({ background: editing ? "#16acd4" : "#5a3fa0", color: editing ? "#000" : "white", padding: "3px 8px", fontWeight: "bold", fontSize: "11px" })

    if (loading) return <div style={{ minHeight: "100vh", background: "#e8e4f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontFamily: "Arial" }}>Loading...</div>

    return (
        <div style={{ minHeight: "100vh", background: "#e8e4f0", fontFamily: "Arial, sans-serif", fontSize: "12px" }}>
            <div style={topBar}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Link href={`/super-admin/quotations/${id}`} style={{ color: "white", textDecoration: "none" }}>← Back to View</Link>
                    <span style={{ opacity: 0.6 }}>|</span>
                    <span style={{ fontWeight: "bold" }}>✏ Edit Quotation: {invoiceNumber}</span>
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                    <Link href={`/super-admin/quotations/${id}`}><button style={{ background: "#888", color: "white", padding: "3px 10px", fontSize: "11px", border: "none", borderRadius: "2px", cursor: "pointer" }}>✕ Cancel</button></Link>
                    <button onClick={handleSave} disabled={saving} style={{ background: "#198a19", color: "white", padding: "3px 14px", fontSize: "11px", border: "none", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                        {saving ? "Saving..." : "💾 Save"}
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: "960px", margin: "8px auto", padding: "0 8px" }}>
                <div style={section}>
                    <div style={sHdr()}>Quotation Details</div>
                    <div style={{ padding: "8px 12px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
                        <div><label style={lbl}>Quotation No.</label><input value={invoiceNumber} readOnly style={{ ...inp, background: "#f0ecff", fontFamily: "monospace", color: "#5a3fa0" }} /></div>
                        <div><label style={lbl}>Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} style={inp}>
                                {["DRAFT","UNPAID","PAID","PARTIALLY_PAID","CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div><label style={lbl}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} /></div>
                        <div><label style={lbl}>Valid Until</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inp} /></div>
                        <div><label style={lbl}>Discount (₹)</label><input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} style={inp} /></div>
                        <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Client</label>
                            <select value={clientId} onChange={e => setClientId(e.target.value)} style={inp}>
                                <option value="">Select...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ""}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div style={section}>
                    <div style={sHdr(editingId !== null)}>{editingId !== null ? "✏ Edit Item" : "Add Item"}</div>
                    <div style={{ padding: "8px 10px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "flex-end" }}>
                        <div style={{ flex: "2 1 180px" }}><label style={lbl}>Description *</label><input value={lineDesc} onChange={e => setLineDesc(e.target.value)} style={inp} /></div>
                        <div style={{ flex: "1 1 70px" }}><label style={lbl}>HSN</label><input value={lineHsn} onChange={e => setLineHsn(e.target.value)} style={inp} /></div>
                        <div style={{ flex: "0 0 55px" }}><label style={lbl}>Qty</label><input type="number" value={lineQty} onChange={e => setLineQty(parseFloat(e.target.value) || 1)} style={inp} /></div>
                        <div style={{ flex: "1 1 80px" }}><label style={lbl}>Rate ₹</label><input type="number" value={lineRate} onChange={e => setLineRate(parseFloat(e.target.value) || 0)} style={inp} /></div>
                        <div style={{ flex: "0 0 60px" }}><label style={lbl}>Disc%</label><input type="number" value={lineDisc} onChange={e => setLineDisc(parseFloat(e.target.value) || 0)} style={inp} /></div>
                        <div style={{ flex: "0 0 60px" }}><label style={lbl}>Tax%</label><select value={lineTax} onChange={e => setLineTax(parseFloat(e.target.value))} style={inp}>{[0,5,12,18,28].map(t => <option key={t} value={t}>{t}%</option>)}</select></div>
                        <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={addLine} style={{ background: editingId !== null ? "#16acd4" : "#5a3fa0", color: editingId !== null ? "#000" : "white", padding: "5px 14px", fontSize: "11px", border: "none", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                                {editingId !== null ? "✔ Update" : "➕ ADD"}
                            </button>
                            {editingId !== null && <button onClick={resetLine} style={{ background: "#888", color: "white", padding: "5px 10px", fontSize: "11px", border: "none", borderRadius: "2px", cursor: "pointer" }}>✕</button>}
                        </div>
                    </div>
                </div>

                <div style={section}>
                    <div style={sHdr()}>Items ({lineItems.length})</div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead><tr>{["#","Description","HSN","Qty","Rate","Disc%","Tax%","Total","Action"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                            <tbody>
                                {lineItems.length === 0 ? <tr><td colSpan={9} style={{ ...td, textAlign: "center", color: "#888", padding: "14px", fontStyle: "italic" }}>No items.</td></tr>
                                    : computed.map((l, i) => (
                                        <tr key={l.tempId} style={{ background: editingId === l.tempId ? "#fff8e0" : i % 2 === 0 ? "#f8f5ff" : "white" }}>
                                            <td style={td}>{i + 1}</td>
                                            <td style={{ ...td, fontWeight: "bold" }}>{l.name}</td>
                                            <td style={td}>{l.hsnSacCode || "—"}</td>
                                            <td style={{ ...td, textAlign: "right" }}>{l.quantity}</td>
                                            <td style={{ ...td, textAlign: "right" }}>₹{l.rate.toFixed(2)}</td>
                                            <td style={{ ...td, textAlign: "right" }}>{l.discount}%</td>
                                            <td style={{ ...td, textAlign: "right" }}>{l.taxRate}%</td>
                                            <td style={{ ...td, textAlign: "right", fontWeight: "bold", color: "#5a3fa0" }}>₹{l.total.toFixed(2)}</td>
                                            <td style={td}><div style={{ display: "flex", gap: "3px" }}>
                                                <button onClick={() => editLine(l)} style={{ background: "#5a3fa0", color: "white", padding: "2px 7px", fontSize: "10px", border: "none", cursor: "pointer" }}>✏</button>
                                                <button onClick={() => setLineItems(prev => prev.filter(x => x.tempId !== l.tempId))} style={{ background: "#cc0000", color: "white", padding: "2px 7px", fontSize: "10px", border: "none", cursor: "pointer" }}>✕</button>
                                            </div></td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "6px" }}>
                    <div style={section}>
                        <div style={sHdr()}>Notes & Terms</div>
                        <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div><label style={lbl}>Note</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...inp, resize: "vertical" }} /></div>
                            <div><label style={lbl}>Terms</label><textarea value={terms} onChange={e => setTerms(e.target.value)} rows={3} style={{ ...inp, resize: "vertical" }} /></div>
                        </div>
                    </div>
                    <div style={section}>
                        <div style={sHdr()}>SUMMARY</div>
                        <div style={{ padding: "8px 12px" }}>
                            {[["Sub Total", `₹${subTotal.toFixed(2)}`], ["Tax Total", `₹${taxTotal.toFixed(2)}`]].map(([k, v]) => (
                                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px" }}><span>{k}</span><span style={{ fontFamily: "monospace" }}>{v}</span></div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0 3px", fontWeight: "bold", fontSize: "13px", borderTop: "2px solid #5a3fa0", marginTop: "4px", color: "#5a3fa0" }}>
                                <span>Grand Total</span><span style={{ fontFamily: "monospace" }}>₹{grandTotal.toFixed(2)}</span>
                            </div>
                            <button onClick={handleSave} disabled={saving} style={{ marginTop: "10px", width: "100%", background: "#198a19", color: "white", padding: "6px", fontSize: "11px", border: "none", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                                {saving ? "Saving..." : "💾 Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
