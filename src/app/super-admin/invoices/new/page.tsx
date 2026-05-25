"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import InvoiceScanner, { ScannedData } from "../_components/InvoiceScanner"

type BillingClient = { id: string; name: string; phone: string | null; email: string | null; gstin: string | null; state: string | null; address: string | null }
type BillingItem = { id: string; name: string; price: number; hsnSacCode: string | null; taxRate: number; type: string }
type LineItem = { tempId: number; name: string; hsnSacCode: string; quantity: number; rate: number; taxRate: number; discount: number }

const INDIAN_STATES = ["01-Jammu & Kashmir","02-Himachal Pradesh","03-Punjab","04-Chandigarh","05-Uttarakhand","06-Haryana","07-Delhi","08-Rajasthan","09-Uttar Pradesh","10-Bihar","18-Assam","19-West Bengal","20-Jharkhand","21-Odisha","22-Chhattisgarh","23-Madhya Pradesh","24-Gujarat","27-Maharashtra","29-Karnataka","32-Kerala","33-Tamil Nadu","36-Telangana","37-Andhra Pradesh (New)"]

export function SuperAdminInvoiceForm({ 
    defaultType, 
    defaultBackUrl, 
    defaultLockType 
}: { 
    defaultType?: string, 
    defaultBackUrl?: string, 
    defaultLockType?: boolean 
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlType = defaultType || searchParams.get("type") || "INVOICE"
    const backUrl = defaultBackUrl || searchParams.get("back") || "/super-admin/invoices"
    const lockType = defaultLockType !== undefined ? defaultLockType : searchParams.get("lockType") === "true"

    const TYPE_PREFIX: Record<string, string> = { INVOICE: "DG", QUOTATION: "QT", ESTIMATE: "QT", PROFORMA: "PF", CHALLAN: "CH", RECEIPT: "RC", CREDIT_NOTE: "CN" }
    const TYPE_LABELS: Record<string, string> = { INVOICE: "Tax Invoice", QUOTATION: "Quotation", PROFORMA: "Proforma Invoice", CHALLAN: "Delivery Challan", ESTIMATE: "Estimate", RECEIPT: "Receipt", CREDIT_NOTE: "Credit Note" }
    const TYPE_COLOR: Record<string, string> = { INVOICE: "#2a6fbd", QUOTATION: "#5a3fa0", PROFORMA: "#1a6a7a", CHALLAN: "#1a7a4a", ESTIMATE: "#5a3fa0", RECEIPT: "#2a6fbd", CREDIT_NOTE: "#8a3a00" }
    const accentColor = TYPE_COLOR[urlType] || "#2a6fbd"

    const [clients, setClients] = useState<BillingClient[]>([])
    const [catalogItems, setCatalogItems] = useState<BillingItem[]>([])
    const [saving, setSaving] = useState(false)
    const [clientId, setClientId] = useState("")
    const [invType, setInvType] = useState(urlType)
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [dueDate, setDueDate] = useState("")
    const [docPrefix, setDocPrefix] = useState(TYPE_PREFIX[urlType] || "DG")
    const [discount, setDiscount] = useState(0)
    const [notes, setNotes] = useState("WE SHALL NOT BE RESPONSIBLE FOR THE REPLACED PARTS IF NOT COLLECTED AT THE TIME OF DELIVERY.")
    const [lineItems, setLineItems] = useState<LineItem[]>([])
    const [selItemId, setSelItemId] = useState("")
    const [lineDesc, setLineDesc] = useState("")
    const [lineHsn, setLineHsn] = useState("")
    const [lineQty, setLineQty] = useState(1)
    const [lineRate, setLineRate] = useState(0)
    const [lineTax, setLineTax] = useState(18)
    const [lineDisc, setLineDisc] = useState(0)
    // Product smart search
    const [productSearch, setProductSearch] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [savingProduct, setSavingProduct] = useState(false)
    const [lineUom, setLineUom] = useState("Nos")
    // Inline edit
    const [editingId, setEditingId] = useState<number | null>(null)
    // Save to catalog modal
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [showAddClient, setShowAddClient] = useState(false)
    const [newClient, setNewClient] = useState({
        name: "", contactName: "", phone: "", email: "",
        gstin: "", tin: "", pan: "", vat: "",
        address: "", city: "", state: "", pin: "", country: "India",
        privateDetails: "", otherDetails: ""
    })
    const [showOtherDetails, setShowOtherDetails] = useState(false)
    const [showScanner, setShowScanner] = useState(false)

    const handleScanComplete = (data: ScannedData) => {
        if (data.date) setDate(data.date)
        
        let addedNotes = ""
        if (data.invoiceNo) addedNotes += `Ref Bill No: ${data.invoiceNo}\n`
        if (data.amount) {
            setLineItems(prev => [
                ...prev, 
                { tempId: Date.now(), name: "Scanned Bill / Miscellaneous", hsnSacCode: "", quantity: 1, rate: data.amount!, taxRate: 0, discount: 0 }
            ])
            addedNotes += `Scanned Amount: ₹${data.amount}\n`
        }
        if (addedNotes) {
            setNotes(prev => prev + (prev ? "\n\n" : "") + "--- Scanned Data ---\n" + addedNotes)
        }
    }

    useEffect(() => {
        fetch("/api/admin/billing/clients").then(r => r.json()).then(d => d.success && setClients(d.clients))
        fetch("/api/admin/billing/items").then(r => r.json()).then(d => d.success && setCatalogItems(d.items))
    }, [])

    useEffect(() => {
        if (!selItemId) return
        const item = catalogItems.find(i => i.id === selItemId)
        if (!item) return
        setLineDesc(item.name); setLineHsn(item.hsnSacCode || ""); setLineRate(item.price); setLineTax(item.taxRate)
        setProductSearch(item.name); setShowSuggestions(false)
    }, [selItemId, catalogItems])

    // Filtered suggestions based on typed text
    const filteredProducts = productSearch.trim().length > 0
        ? catalogItems.filter(i => i.name.toLowerCase().includes(productSearch.toLowerCase()))
        : catalogItems

    const exactMatch = catalogItems.find(i => i.name.toLowerCase() === productSearch.toLowerCase())

    const handleSelectProduct = (item: BillingItem) => {
        setSelItemId(item.id)
        setProductSearch(item.name)
        setLineDesc(item.name)
        setLineHsn(item.hsnSacCode || "")
        setLineRate(item.price)
        setLineTax(item.taxRate)
        setShowSuggestions(false)
    }

    const handleAddNewProduct = async (opts?: { price?: number; taxRate?: number; hsnSacCode?: string; uom?: string }) => {
        if (!productSearch.trim()) return
        setSavingProduct(true)
        const res = await fetch("/api/admin/billing/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: productSearch.trim(),
                description: opts?.uom || lineUom || "Nos",
                price: opts?.price ?? lineRate ?? 0,
                taxRate: opts?.taxRate ?? lineTax ?? 18,
                hsnSacCode: opts?.hsnSacCode ?? lineHsn ?? "",
                type: "SERVICE",
            }),
        })
        const data = await res.json()
        setSavingProduct(false)
        if (data.success) {
            setCatalogItems(prev => [...prev, data.item])
            setSelItemId(data.item.id)
            setShowSuggestions(false)
            return data.item
        } else {
            alert(data.error || "Failed to add product")
            return null
        }
    }

    const handleEdit = (l: LineItem) => {
        setEditingId(l.tempId)
        setProductSearch(l.name)
        setLineDesc(l.name)
        setLineHsn(l.hsnSacCode)
        setLineQty(l.quantity)
        setLineRate(l.rate)
        setLineTax(l.taxRate)
        setLineDisc(l.discount)
        // scroll to top form
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const resetLineForm = () => {
        setSelItemId(""); setLineDesc(""); setLineHsn(""); setLineQty(1); setLineRate(0); setLineTax(18); setLineDisc(0); setProductSearch(""); setLineUom("Nos")
    }

    const doAddLine = () => {
        if (editingId !== null) {
            setLineItems(prev => prev.map(x => x.tempId === editingId
                ? { ...x, name: lineDesc, hsnSacCode: lineHsn, quantity: lineQty, rate: lineRate, taxRate: lineTax, discount: lineDisc }
                : x
            ))
            setEditingId(null)
        } else {
            setLineItems(prev => [...prev, { tempId: Date.now(), name: lineDesc, hsnSacCode: lineHsn, quantity: lineQty, rate: lineRate, taxRate: lineTax, discount: lineDisc }])
        }
        resetLineForm()
    }

    const addLine = () => {
        if (!lineDesc || lineRate <= 0) return
        // If product is new (not in catalog) and we are NOT editing, ask user
        if (!exactMatch && editingId === null && productSearch.trim()) {
            setShowSaveModal(true)
            return
        }
        doAddLine()
    }

    // "Save to catalog + Add to invoice"
    const handleSaveAndAdd = async () => {
        setShowSaveModal(false)
        await handleAddNewProduct()
        doAddLine()
    }

    // "Just add to invoice (don't save to catalog)"
    const handleJustAdd = () => {
        setShowSaveModal(false)
        doAddLine()
    }

    const computed = lineItems.map(l => {
        const val = l.quantity * l.rate
        const discAmt = (val * l.discount) / 100
        const taxable = val - discAmt
        const tax = (taxable * l.taxRate) / 100
        return { ...l, taxable, tax, total: taxable + tax }
    })
    const subTotal = computed.reduce((s, l) => s + l.taxable, 0)
    const taxTotal = computed.reduce((s, l) => s + l.tax, 0)
    const grandTotal = subTotal + taxTotal - discount

    const handleSave = async () => {
        if (!clientId) { alert("Please select a client"); return }
        if (lineItems.length === 0) { alert("Add at least one item"); return }
        setSaving(true)
        const res = await fetch("/api/admin/billing/invoices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId, type: invType, date, dueDate: dueDate || null, items: lineItems, discount, notes }),
        })
        const data = await res.json()
        setSaving(false)
        if (data.success) router.push(backUrl)
        else alert(data.error || "Failed to save")
    }

    const inp: React.CSSProperties = { padding: "2px 4px", fontSize: "11px", border: "1px solid #a0b8d8", borderRadius: "2px", background: "white", width: "100%" }
    const lbl: React.CSSProperties = { fontSize: "11px", fontWeight: "bold", color: "#333", marginBottom: "2px", display: "block" }
    const th: React.CSSProperties = { padding: "4px 6px", background: accentColor, color: "white", fontSize: "11px", fontWeight: "bold", borderRight: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap" }
    const td: React.CSSProperties = { padding: "3px 6px", borderBottom: "1px solid #d0dff0", borderRight: "1px solid #d0dff0", fontSize: "11px", whiteSpace: "nowrap" }

    return (
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", backgroundColor: "#f0f0f0", minHeight: "100vh", color: "#000" }}>
            {/* Title Bar */}
            <div style={{ background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}dd)`, color: "white", padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #0d3a7a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "14px" }}>📄</span>
                    <span style={{ fontWeight: "bold", fontSize: "13px" }}>New {TYPE_LABELS[invType] || "Document"}</span>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => setShowScanner(true)}
                        style={{ background: "#4a7fc1", color: "white", padding: "3px 10px", fontSize: "11px", fontWeight: "bold", border: "1px solid #2a5f9a", borderRadius: "2px", cursor: "pointer" }}>
                        📷 Scan Bill
                    </button>
                    <Link href={backUrl} style={{ background: "#e0e0e0", color: "#333", padding: "3px 10px", fontSize: "11px", textDecoration: "none", border: "1px solid #aaa", borderRadius: "2px" }}>
                        ← Back
                    </Link>
                    <button onClick={handleSave} disabled={saving}
                        style={{ background: "#16acd4", color: "#000", padding: "3px 14px", fontSize: "11px", fontWeight: "bold", border: "1px solid #c88a00", borderRadius: "2px", cursor: "pointer" }}>
                        {saving ? "Saving..." : `💾 Save ${TYPE_LABELS[invType] || "Document"}`}
                    </button>
                </div>
            </div>

            <div style={{ margin: "6px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {/* Document Data */}
                <div style={{ background: "white", border: "1px solid #a0b8d8", borderRadius: "2px" }}>
                    <div style={{ background: accentColor, color: "white", padding: "3px 8px", fontWeight: "bold", fontSize: "11px" }}>Document Data</div>
                    <div style={{ padding: "10px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                        {/* Client */}
                        <div>
                            <label style={lbl}>Client *</label>
                            <div style={{ display: "flex", gap: "4px" }}>
                                <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ ...inp, flex: 1 }}>
                                    <option value="">Select client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button onClick={() => setShowAddClient(true)} title="Add New Client"
                                    style={{ background: accentColor, color: "white", padding: "2px 8px", fontSize: "11px", border: `1px solid ${accentColor}`, borderRadius: "2px", cursor: "pointer" }}>+</button>
                            </div>
                            {clientId && (() => {
                                const c = clients.find(x => x.id === clientId)
                                return c ? (
                                    <div style={{ marginTop: "4px", fontSize: "10px", color: "#555", background: "#f0f6ff", border: "1px solid #c0d0e8", padding: "4px" }}>
                                        {c.phone && <div>📞 {c.phone}</div>}
                                        {c.gstin && <div>🏛 GSTIN: {c.gstin}</div>}
                                        {c.address && <div>📍 {c.address}</div>}
                                    </div>
                                ) : null
                            })()}
                        </div>

                        {/* Doc Info */}
                        <div>
                            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                                <label style={{ ...lbl, marginBottom: 0 }}>Prefix & Doc No.</label>
                                <div style={{ display: "flex", gap: "4px" }}>
                                    <input value={docPrefix} onChange={e => setDocPrefix(e.target.value)} style={{ ...inp, width: "60px" }} />
                                    <input readOnly placeholder="Auto" style={{ ...inp, background: "#f0f0f0", color: "#666", flex: 1 }} />
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                                <label style={{ ...lbl, marginBottom: 0 }}>Type</label>
                                {lockType ? (
                                    <input readOnly value={TYPE_LABELS[invType] || invType} style={{ ...inp, background: "#f0f0f0", color: accentColor, fontWeight: "bold" }} />
                                ) : (
                                    <select value={invType} onChange={e => { setInvType(e.target.value); setDocPrefix(TYPE_PREFIX[e.target.value] || "DG") }} style={inp}>
                                        <option value="INVOICE">Tax Invoice</option>
                                        <option value="QUOTATION">Quotation</option>
                                        <option value="PROFORMA">Proforma Invoice</option>
                                        <option value="CHALLAN">Delivery Challan</option>
                                        <option value="ESTIMATE">Estimate</option>
                                        <option value="RECEIPT">Receipt</option>
                                        <option value="CREDIT_NOTE">Credit Note</option>
                                    </select>
                                )}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px", alignItems: "center" }}>
                                <label style={{ ...lbl, marginBottom: 0 }}>Discount ₹</label>
                                <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} style={inp} />
                            </div>
                        </div>

                        {/* Dates */}
                        <div>
                            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                                <label style={{ ...lbl, marginBottom: 0 }}>Issue Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                                <label style={{ ...lbl, marginBottom: 0 }}>Payment Terms</label>
                                <select style={inp}><option>Due On Receipt</option></select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px", alignItems: "center" }}>
                                <label style={{ ...lbl, marginBottom: 0 }}>Due Date</label>
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inp} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Product Row */}
                <div style={{ background: "white", border: "1px solid #a0b8d8", borderRadius: "2px" }}>
                    <div style={{ background: editingId !== null ? "#16acd4" : "#2a6fbd", color: editingId !== null ? "#000" : "white", padding: "3px 8px", fontWeight: "bold", fontSize: "11px" }}>
                        {editingId !== null ? "✏ Edit Item (make changes and click Update)" : "Add Product / Service"}
                    </div>
                    <div style={{ padding: "8px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "flex-end" }}>
                        <div style={{ flex: "1 1 220px", position: "relative" }}>
                            <label style={lbl}>Product</label>
                            <div style={{ display: "flex", gap: "3px" }}>
                                <div style={{ position: "relative", flex: 1 }}>
                                    <input
                                        value={productSearch}
                                        onChange={e => { setProductSearch(e.target.value); setLineDesc(e.target.value); setShowSuggestions(true) }}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        placeholder="Type product name..."
                                        style={{ ...inp, width: "100%" }}
                                    />
                                    {/* Dropdown suggestions */}
                                    {showSuggestions && productSearch.length > 0 && (
                                        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #2a6fbd", zIndex: 100, maxHeight: "180px", overflowY: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                                            {filteredProducts.length > 0 ? filteredProducts.map(item => (
                                                <div key={item.id}
                                                    onMouseDown={() => handleSelectProduct(item)}
                                                    style={{ padding: "5px 8px", cursor: "pointer", fontSize: "11px", borderBottom: "1px solid #e8f0fb", display: "flex", justifyContent: "space-between" }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = "#ddeeff")}
                                                    onMouseLeave={e => (e.currentTarget.style.background = "white")}>
                                                    <span style={{ fontWeight: "bold" }}>{item.name}</span>
                                                    <span style={{ color: "#666" }}>₹{item.price} | {item.taxRate}%</span>
                                                </div>
                                            )) : (
                                                <div style={{ padding: "6px 8px", fontSize: "11px", color: "#888", fontStyle: "italic" }}>
                                                    No match found
                                                </div>
                                            )}
                                            {/* Add New option if no exact match */}
                                            {!exactMatch && productSearch.trim() && (
                                                <div
                                                    onMouseDown={() => handleAddNewProduct()}
                                                    style={{ padding: "6px 8px", cursor: "pointer", fontSize: "11px", background: "#e8f5e9", color: "#2a7a2a", fontWeight: "bold", borderTop: "1px solid #b8ddb8", display: "flex", alignItems: "center", gap: "4px" }}>
                                                    ➕ Add &quot;{productSearch}&quot; as new product
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Quick add button */}
                                {productSearch.trim() && !exactMatch && (
                                    <button
                                        onClick={() => handleAddNewProduct()}
                                        disabled={savingProduct}
                                        title="Save as new product in catalog"
                                        style={{ background: "#2a7a2a", color: "white", padding: "2px 8px", fontSize: "11px", border: "1px solid #1a5a1a", borderRadius: "2px", cursor: "pointer", whiteSpace: "nowrap" }}>
                                        {savingProduct ? "..." : "+ New"}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div style={{ flex: "2 1 200px" }}>
                            <label style={lbl}>Description *</label>
                            <input value={lineDesc} onChange={e => setLineDesc(e.target.value)} placeholder="Service / item name" style={inp} />
                        </div>
                        <div style={{ width: "80px" }}>
                            <label style={lbl}>UoM</label>
                            <input value={lineUom} onChange={e => setLineUom(e.target.value)} style={inp} />
                        </div>
                        <div style={{ width: "70px" }}>
                            <label style={lbl}>HSN/SAC</label>
                            <input value={lineHsn} onChange={e => setLineHsn(e.target.value)} style={inp} />
                        </div>
                        <div style={{ width: "55px" }}>
                            <label style={lbl}>QTY</label>
                            <input type="number" value={lineQty} onChange={e => setLineQty(parseInt(e.target.value) || 1)} min={1} style={{ ...inp, textAlign: "center" }} />
                        </div>
                        <div style={{ width: "80px" }}>
                            <label style={lbl}>Unit Price</label>
                            <input type="number" value={lineRate} onChange={e => setLineRate(parseFloat(e.target.value) || 0)} style={{ ...inp, textAlign: "right" }} />
                        </div>
                        <div style={{ width: "70px" }}>
                            <label style={lbl}>Discount %</label>
                            <input type="number" value={lineDisc} onChange={e => setLineDisc(parseFloat(e.target.value) || 0)} min={0} max={100} style={{ ...inp, textAlign: "right" }} />
                        </div>
                        <div style={{ width: "70px" }}>
                            <label style={lbl}>Tax %</label>
                            <select value={lineTax} onChange={e => setLineTax(parseFloat(e.target.value))} style={inp}>
                                <option value={0}>0%</option>
                                <option value={5}>5%</option>
                                <option value={12}>12%</option>
                                <option value={18}>18%</option>
                                <option value={28}>28%</option>
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={addLine}
                                style={{ background: editingId !== null ? "#16acd4" : "#2a6fbd", color: editingId !== null ? "#000" : "white", padding: "4px 14px", fontSize: "11px", border: `1px solid ${editingId !== null ? "#c88a00" : "#1a4f9a"}`, borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                                {editingId !== null ? "✔ Update Item" : "➕ ADD"}
                            </button>
                            {editingId !== null && (
                                <button onClick={() => { setEditingId(null); resetLineForm() }}
                                    style={{ background: "#888", color: "white", padding: "4px 10px", fontSize: "11px", border: "1px solid #666", borderRadius: "2px", cursor: "pointer" }}>
                                    ✕ Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div style={{ background: "white", border: "1px solid #a0b8d8", borderRadius: "2px", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={th}>No.</th>
                                <th style={th}>Product/Service</th>
                                <th style={th}>HSN/SAC</th>
                                <th style={th}>Description</th>
                                <th style={th}>UoM</th>
                                <th style={{ ...th, textAlign: "center" }}>QTY</th>
                                <th style={{ ...th, textAlign: "right" }}>Unit Price</th>
                                <th style={{ ...th, textAlign: "right" }}>Value</th>
                                <th style={{ ...th, textAlign: "right" }}>Discount</th>
                                <th style={{ ...th, textAlign: "right" }}>CGST</th>
                                <th style={{ ...th, textAlign: "right" }}>SGST</th>
                                <th style={{ ...th, textAlign: "right" }}>Total</th>
                                <th style={th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {computed.length === 0 ? (
                                <tr>
                                    <td colSpan={13} style={{ ...td, textAlign: "center", padding: "20px", color: "#888" }}>
                                        You haven&apos;t added any product/service to this invoice yet.
                                    </td>
                                </tr>
                            ) : computed.map((l, i) => (
                                <tr key={l.tempId} style={{ background: i % 2 === 0 ? "#f0f6ff" : "white" }}>
                                    <td style={td}>{i + 1}</td>
                                    <td style={{ ...td, fontWeight: "bold" }}>{l.name}</td>
                                    <td style={td}>{l.hsnSacCode}</td>
                                    <td style={td}>{l.name}</td>
                                    <td style={td}>Nos</td>
                                    <td style={{ ...td, textAlign: "center" }}>{l.quantity}</td>
                                    <td style={{ ...td, textAlign: "right" }}>{l.rate.toFixed(2)}</td>
                                    <td style={{ ...td, textAlign: "right" }}>{(l.quantity * l.rate).toFixed(2)}</td>
                                    <td style={{ ...td, textAlign: "right" }}>{l.discount}%</td>
                                    <td style={{ ...td, textAlign: "right" }}>{(l.tax / 2).toFixed(2)}</td>
                                    <td style={{ ...td, textAlign: "right" }}>{(l.tax / 2).toFixed(2)}</td>
                                    <td style={{ ...td, textAlign: "right", fontWeight: "bold" }}>{l.total.toFixed(2)}</td>
                                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                                        <div style={{ display: "flex", gap: "3px" }}>
                                            <button
                                                onClick={() => handleEdit(l)}
                                                style={{ background: editingId === l.tempId ? "#16acd4" : "#2a6fbd", color: "white", padding: "2px 7px", fontSize: "10px", border: "none", cursor: "pointer", borderRadius: "1px", fontWeight: "bold" }}>
                                                ✏ Edit
                                            </button>
                                            <button
                                                onClick={() => { setLineItems(prev => prev.filter(x => x.tempId !== l.tempId)); if (editingId === l.tempId) { setEditingId(null); resetLineForm() } }}
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

                {/* Bottom: Notes + Totals */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "6px" }}>
                    <div style={{ background: "white", border: "1px solid #a0b8d8", borderRadius: "2px", padding: "8px" }}>
                        <label style={lbl}>Note (printed on invoice)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                            style={{ ...inp, resize: "vertical", height: "80px" }} />
                    </div>
                    <div style={{ background: "white", border: "1px solid #a0b8d8", borderRadius: "2px", padding: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #e0e8f0", fontSize: "11px" }}>
                            <span>Sub Total</span><span style={{ fontWeight: "bold" }}>₹{subTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #e0e8f0", fontSize: "11px" }}>
                            <span>CGST</span><span>₹{(taxTotal / 2).toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #e0e8f0", fontSize: "11px" }}>
                            <span>SGST</span><span>₹{(taxTotal / 2).toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #e0e8f0", fontSize: "11px", color: "#cc0000" }}>
                                <span>Discount</span><span>-₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "13px", fontWeight: "bold", borderTop: "2px solid #2a6fbd", marginTop: "4px" }}>
                            <span>TOTAL</span><span style={{ color: "#1a4f9a" }}>₹{grandTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize: "10px", color: "#888", textAlign: "right" }}>* Inclusive of Taxes</div>
                        <button onClick={handleSave} disabled={saving}
                            style={{ marginTop: "8px", width: "100%", background: "#2a6fbd", color: "white", padding: "6px", fontSize: "12px", fontWeight: "bold", border: "1px solid #1a4f9a", cursor: "pointer", borderRadius: "2px" }}>
                            {saving ? "Saving..." : "💾 Save Invoice"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Save to Catalog Modal */}
            {showSaveModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "white", border: "2px solid #2a6fbd", borderRadius: "4px", width: "420px", boxShadow: "0 4px 24px rgba(0,0,0,0.35)" }}>
                        {/* Header */}
                        <div style={{ background: "linear-gradient(to bottom, #2a6fbd, #1a4f9a)", color: "white", padding: "8px 12px", fontWeight: "bold", fontSize: "13px" }}>
                            💾 New Product — Save to Catalog?
                        </div>
                        {/* Body */}
                        <div style={{ padding: "16px 14px" }}>
                            <div style={{ background: "#f0f6ff", border: "1px solid #c0d8f0", borderRadius: "3px", padding: "10px 12px", marginBottom: "12px" }}>
                                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#1a4f9a", marginBottom: "6px" }}>Product Details:</div>
                                <table style={{ fontSize: "11px", width: "100%", borderCollapse: "collapse" }}>
                                    <tbody>
                                        {[
                                            ["Name", productSearch],
                                            ["HSN/SAC", lineHsn || "—"],
                                            ["UoM", lineUom || "Nos"],
                                            ["Unit Price", `₹${lineRate.toFixed(2)}`],
                                            ["Discount", `${lineDisc}%`],
                                            ["Tax Rate", `${lineTax}%`],
                                        ].map(([k, v]) => (
                                            <tr key={k}>
                                                <td style={{ padding: "2px 6px 2px 0", color: "#555", width: "90px" }}>{k}</td>
                                                <td style={{ padding: "2px 0", fontWeight: "bold" }}>{v}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p style={{ fontSize: "11px", color: "#555", margin: "0 0 4px" }}>
                                Do you want to <strong>save this product to the catalog</strong> so it appears automatically next time?
                            </p>
                        </div>
                        {/* Buttons */}
                        <div style={{ padding: "10px 14px", borderTop: "1px solid #d0dff0", display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button onClick={() => setShowSaveModal(false)}
                                style={{ background: "#e0e0e0", color: "#333", padding: "5px 14px", fontSize: "11px", border: "1px solid #aaa", borderRadius: "2px", cursor: "pointer" }}>
                                ✕ Cancel
                            </button>
                            <button onClick={handleJustAdd}
                                style={{ background: "#888", color: "white", padding: "5px 14px", fontSize: "11px", border: "1px solid #666", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                                ➕ Add to Invoice Only
                            </button>
                            <button onClick={handleSaveAndAdd} disabled={savingProduct}
                                style={{ background: "#2a6fbd", color: "white", padding: "5px 16px", fontSize: "11px", border: "1px solid #1a4f9a", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                                {savingProduct ? "Saving..." : "💾 Save to Catalog + Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Client Modal */}
            {showAddClient && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px" }}>
                    <div style={{ background: "white", border: "2px solid #2a6fbd", borderRadius: "4px", width: "560px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 4px 24px rgba(0,0,0,0.35)" }}>
                        {/* Header */}
                        <div style={{ background: "linear-gradient(to bottom, #2a6fbd, #1a4f9a)", color: "white", padding: "7px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                            <span style={{ fontWeight: "bold", fontSize: "13px" }}>👤 Add New Client</span>
                            <button onClick={() => setShowAddClient(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}>✕</button>
                        </div>

                        {/* Scrollable Body */}
                        <div style={{ overflowY: "auto", flex: 1, padding: "10px 12px" }}>

                            {/* Section: Basic Info */}
                            <div style={{ background: "#2a6fbd", color: "white", padding: "2px 8px", fontSize: "10px", fontWeight: "bold", letterSpacing: "0.5px", marginBottom: "6px" }}>CLIENT INFORMATION</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={lbl}>Client Name *</label>
                                    <input value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} style={inp} placeholder="Business or individual name" />
                                </div>
                                <div>
                                    <label style={lbl}>Contact Name</label>
                                    <input value={newClient.contactName} onChange={e => setNewClient(p => ({ ...p, contactName: e.target.value }))} style={inp} placeholder="Contact person" />
                                </div>
                                <div>
                                    <label style={lbl}>Phone</label>
                                    <input value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} style={inp} placeholder="+91 XXXXX XXXXX" />
                                </div>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={lbl}>Email</label>
                                    <input type="email" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} style={inp} placeholder="email@example.com" />
                                </div>
                            </div>

                            {/* Section: Tax Info */}
                            <div style={{ background: "#2a6fbd", color: "white", padding: "2px 8px", fontSize: "10px", fontWeight: "bold", letterSpacing: "0.5px", marginBottom: "6px" }}>TAX INFORMATION</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                                <div>
                                    <label style={lbl}>GSTIN</label>
                                    <input value={newClient.gstin} onChange={e => setNewClient(p => ({ ...p, gstin: e.target.value }))} style={inp} placeholder="22AAAAA0000A1Z5" />
                                </div>
                                <div>
                                    <label style={lbl}>PAN</label>
                                    <input value={newClient.pan} onChange={e => setNewClient(p => ({ ...p, pan: e.target.value }))} style={inp} placeholder="ABCDE1234F" />
                                </div>
                                <div>
                                    <label style={lbl}>TIN</label>
                                    <input value={newClient.tin} onChange={e => setNewClient(p => ({ ...p, tin: e.target.value }))} style={inp} />
                                </div>
                                <div>
                                    <label style={lbl}>VAT No.</label>
                                    <input value={newClient.vat} onChange={e => setNewClient(p => ({ ...p, vat: e.target.value }))} style={inp} />
                                </div>
                            </div>

                            {/* Section: Address */}
                            <div style={{ background: "#2a6fbd", color: "white", padding: "2px 8px", fontSize: "10px", fontWeight: "bold", letterSpacing: "0.5px", marginBottom: "6px" }}>BILLING ADDRESS</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={lbl}>Billing Address</label>
                                    <textarea value={newClient.address} onChange={e => setNewClient(p => ({ ...p, address: e.target.value }))} rows={2} style={{ ...inp, resize: "vertical" }} placeholder="Street / Area / Landmark" />
                                </div>
                                <div>
                                    <label style={lbl}>City</label>
                                    <input value={newClient.city} onChange={e => setNewClient(p => ({ ...p, city: e.target.value }))} style={inp} />
                                </div>
                                <div>
                                    <label style={lbl}>PIN Code</label>
                                    <input value={newClient.pin} onChange={e => setNewClient(p => ({ ...p, pin: e.target.value }))} style={inp} maxLength={6} />
                                </div>
                                <div>
                                    <label style={lbl}>State</label>
                                    <select value={newClient.state} onChange={e => setNewClient(p => ({ ...p, state: e.target.value }))} style={inp}>
                                        <option value="">Select state...</option>
                                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={lbl}>Country</label>
                                    <input value={newClient.country} onChange={e => setNewClient(p => ({ ...p, country: e.target.value }))} style={inp} />
                                </div>
                            </div>

                            {/* Section: Other Details (collapsible) */}
                            <div
                                onClick={() => setShowOtherDetails(v => !v)}
                                style={{ background: "#6a8fbd", color: "white", padding: "2px 8px", fontSize: "10px", fontWeight: "bold", letterSpacing: "0.5px", marginBottom: "6px", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                                <span>OTHER DETAILS (optional)</span>
                                <span>{showOtherDetails ? "▲" : "▼"}</span>
                            </div>
                            {showOtherDetails && (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "6px" }}>
                                    <div>
                                        <label style={lbl}>Private Client Details <span style={{ color: "#888", fontWeight: "normal" }}>(not printed on invoice)</span></label>
                                        <textarea value={newClient.privateDetails} onChange={e => setNewClient(p => ({ ...p, privateDetails: e.target.value }))} rows={2} style={{ ...inp, resize: "vertical" }} placeholder="Internal notes about this client..." />
                                    </div>
                                    <div>
                                        <label style={lbl}>Other Client Details</label>
                                        <textarea value={newClient.otherDetails} onChange={e => setNewClient(p => ({ ...p, otherDetails: e.target.value }))} rows={2} style={{ ...inp, resize: "vertical" }} placeholder="Any other information..." />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: "8px 12px", borderTop: "1px solid #d0dff0", display: "flex", justifyContent: "flex-end", gap: "6px", flexShrink: 0, background: "#f5f9ff" }}>
                            <button onClick={() => setShowAddClient(false)}
                                style={{ background: "#e0e0e0", color: "#333", padding: "5px 16px", fontSize: "11px", border: "1px solid #aaa", borderRadius: "2px", cursor: "pointer" }}>
                                Cancel
                            </button>
                            <button onClick={async () => {
                                if (!newClient.name) { alert("Client name is required"); return }
                                const res = await fetch("/api/admin/billing/clients", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(newClient)
                                })
                                const data = await res.json()
                                if (data.success) {
                                    setClients(prev => [data.client, ...prev])
                                    setClientId(data.client.id)
                                    setShowAddClient(false)
                                    setNewClient({ name: "", contactName: "", phone: "", email: "", gstin: "", tin: "", pan: "", vat: "", address: "", city: "", state: "", pin: "", country: "India", privateDetails: "", otherDetails: "" })
                                    setShowOtherDetails(false)
                                } else alert(data.error || "Failed to save client")
                            }} style={{ background: "#2a6fbd", color: "white", padding: "5px 18px", fontSize: "11px", border: "1px solid #1a4f9a", borderRadius: "2px", cursor: "pointer", fontWeight: "bold" }}>
                                ✓ Save Client
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scanner Modal */}
            {showScanner && (
                <InvoiceScanner onScan={handleScanComplete} onClose={() => setShowScanner(false)} />
            )}
        </div>
    )
}

export default function SuperAdminNewInvoicePage() {
    return <SuperAdminInvoiceForm />
}
