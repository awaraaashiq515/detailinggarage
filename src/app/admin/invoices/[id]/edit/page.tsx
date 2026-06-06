"use client"

import { useState, useEffect, use, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Trash2, Check, ArrowLeft, X, Edit2 } from "lucide-react"

type BillingClient = {
    id: string; name: string; phone: string | null; email: string | null; gstin: string | null; state: string | null; address: string | null
    vehicleName?: string | null; vehicleRegNo?: string | null; vehicleChassis?: string | null; odometer?: string | null
    invoices?: { vehicleName: string | null; vehicleRegNo: string | null; vehicleChassis: string | null; odometer: string | null }[]
}
type BillingItem = { id: string; name: string; price: number; hsnSacCode: string | null; taxRate: number; type: string }
type LineItem = { tempId: number; id?: string; name: string; hsnSacCode: string; quantity: number; rate: number; taxRate: number; discount: number }

const INDIAN_STATES = ["01-Jammu & Kashmir","02-Himachal Pradesh","03-Punjab","04-Chandigarh","05-Uttarakhand","06-Haryana","07-Delhi","08-Rajasthan","09-Uttar Pradesh","10-Bihar","11-Sikkim","12-Arunachal Pradesh","13-Nagaland","14-Manipur","15-Mizoram","16-Tripura","17-Meghalaya","18-Assam","19-West Bengal","20-Jharkhand","21-Odisha","22-Chhattisgarh","23-Madhya Pradesh","24-Gujarat","25-Daman & Diu","26-Dadra & Nagar Haveli","27-Maharashtra","28-Andhra Pradesh","29-Karnataka","30-Goa","31-Lakshadweep","32-Kerala","33-Tamil Nadu","34-Puducherry","35-Andaman & Nicobar","36-Telangana","37-Andhra Pradesh (New)"]

const TYPE_LABELS: Record<string, string> = { INVOICE: "Tax Invoice", QUOTATION: "Quotation", PROFORMA: "Proforma Invoice", ESTIMATE: "Estimate" }

function EditInvoiceForm({ id }: { id: string }) {
    const router = useRouter()
    const [clients, setClients] = useState<BillingClient[]>([])
    const [catalogItems, setCatalogItems] = useState<BillingItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showAddClient, setShowAddClient] = useState(false)
    const [addingClient, setAddingClient] = useState(false)

    // Invoice form state
    const [clientId, setClientId] = useState("")
    const [invType, setInvType] = useState("INVOICE")
    const [date, setDate] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [invoiceNumber, setInvoiceNumber] = useState("")
    const [status, setStatus] = useState("DRAFT")
    const [discount, setDiscount] = useState(0)
    const [notes, setNotes] = useState("")
    const [terms, setTerms] = useState("")
    const [lineItems, setLineItems] = useState<LineItem[]>([])
    const [vehicleName, setVehicleName] = useState("")
    const [vehicleRegNo, setVehicleRegNo] = useState("")
    const [vehicleChassis, setVehicleChassis] = useState("")
    const [odometer, setOdometer] = useState("")

    // New/Edit line item inputs
    const [selItemId, setSelItemId] = useState("")
    const [lineDesc, setLineDesc] = useState("")
    const [lineHsn, setLineHsn] = useState("")
    const [lineQty, setLineQty] = useState(1)
    const [lineRate, setLineRate] = useState(0)
    const [lineTax, setLineTax] = useState(18)
    const [lineDisc, setLineDisc] = useState(0)
    const [editingTempId, setEditingTempId] = useState<number | null>(null)

    // New client form
    const [newClient, setNewClient] = useState({ name: "", phone: "", email: "", address: "", gstin: "", state: "", city: "", pin: "", vehicleName: "", vehicleRegNo: "", vehicleChassis: "", odometer: "" })

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/billing/clients").then(r => r.json()),
            fetch("/api/admin/billing/items").then(r => r.json()),
            fetch(`/api/admin/billing/invoices?id=${id}`).then(r => r.json())
        ]).then(([cData, iData, invData]) => {
            if (cData.success) setClients(cData.clients)
            if (iData.success) setCatalogItems(iData.items)
            if (invData.success && invData.invoice) {
                const inv = invData.invoice
                setClientId(inv.clientId)
                setInvType(inv.type)
                setDate(inv.date.split("T")[0])
                setDueDate(inv.dueDate ? inv.dueDate.split("T")[0] : "")
                setInvoiceNumber(inv.invoiceNumber)
                setStatus(inv.status)
                setDiscount(inv.discount || 0)
                setNotes(inv.notes || "")
                setTerms(inv.terms || "")
                setVehicleName(inv.vehicleName || "")
                setVehicleRegNo(inv.vehicleRegNo || "")
                setVehicleChassis(inv.vehicleChassis || "")
                setOdometer(inv.odometer || "")
                setLineItems(inv.items.map((item: any) => ({
                    tempId: Date.now() + Math.random(),
                    id: item.id,
                    name: item.name,
                    hsnSacCode: item.hsnSacCode || "",
                    quantity: item.quantity,
                    rate: item.rate,
                    taxRate: item.taxRate,
                    discount: 0 // existing items saved total
                })))
            }
            setLoading(false)
        }).catch(err => {
            console.error("Error loading invoice:", err)
            setLoading(false)
        })
    }, [id])

    // When catalog item is selected, auto-fill
    useEffect(() => {
        if (!selItemId) return
        const item = catalogItems.find(i => i.id === selItemId)
        if (!item) return
        setLineDesc(item.name)
        setLineHsn(item.hsnSacCode || "")
        setLineRate(item.price)
        setLineTax(item.taxRate)
    }, [selItemId, catalogItems])

    const addOrUpdateLine = () => {
        if (!lineDesc || lineRate <= 0) return

        if (editingTempId !== null) {
            // Update existing line
            setLineItems(prev => prev.map(l => l.tempId === editingTempId ? {
                ...l,
                name: lineDesc,
                hsnSacCode: lineHsn,
                quantity: lineQty,
                rate: lineRate,
                taxRate: lineTax,
                discount: lineDisc
            } : l))
            setEditingTempId(null)
        } else {
            // Add new line
            setLineItems(prev => [...prev, {
                tempId: Date.now() + Math.random(),
                name: lineDesc,
                hsnSacCode: lineHsn,
                quantity: lineQty,
                rate: lineRate,
                taxRate: lineTax,
                discount: lineDisc,
            }])
        }

        setSelItemId(""); setLineDesc(""); setLineHsn(""); setLineQty(1); setLineRate(0); setLineTax(18); setLineDisc(0)
    }

    const editLine = (item: LineItem) => {
        setEditingTempId(item.tempId)
        setLineDesc(item.name)
        setLineHsn(item.hsnSacCode)
        setLineQty(item.quantity)
        setLineRate(item.rate)
        setLineTax(item.taxRate)
        setLineDisc(item.discount || 0)
    }

    const removeLine = (tempId: number) => {
        setLineItems(prev => prev.filter(l => l.tempId !== tempId))
        if (editingTempId === tempId) {
            setEditingTempId(null)
            setSelItemId(""); setLineDesc(""); setLineHsn(""); setLineQty(1); setLineRate(0); setLineTax(18); setLineDisc(0)
        }
    }

    // Compute totals
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
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id,
                clientId,
                type: invType,
                date,
                dueDate: dueDate || null,
                status,
                items: lineItems,
                discount,
                notes,
                terms,
                vehicleName,
                vehicleRegNo,
                vehicleChassis,
                odometer
            }),
        })
        const data = await res.json()
        setSaving(false)
        if (data.success) {
            router.push(`/admin/invoices/${id}`)
        } else {
            alert(data.error || "Failed to save invoice changes")
        }
    }

    const handleAddClient = async () => {
        if (!newClient.name) { alert("Client name is required"); return }
        setAddingClient(true)
        const res = await fetch("/api/admin/billing/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newClient),
        })
        const data = await res.json()
        setAddingClient(false)
        if (data.success) {
            setClients(prev => [data.client, ...prev])
            setClientId(data.client.id)
            if (data.client.vehicleName) setVehicleName(data.client.vehicleName)
            if (data.client.vehicleRegNo) setVehicleRegNo(data.client.vehicleRegNo)
            if (data.client.vehicleChassis) setVehicleChassis(data.client.vehicleChassis)
            if (data.client.odometer) setOdometer(data.client.odometer)
            setShowAddClient(false)
            setNewClient({ name: "", phone: "", email: "", address: "", gstin: "", state: "", city: "", pin: "", vehicleName: "", vehicleRegNo: "", vehicleChassis: "", odometer: "" })
        } else alert(data.error || "Failed to add client")
    }

    if (loading) {
        return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 text-sm">Loading invoice data...</div>
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 bg-[#121214] border-b border-white/10 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={`/admin/invoices/${id}`} className="text-zinc-500 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
                    <h1 className="text-base font-bold font-display">Edit {TYPE_LABELS[invType] || "Invoice"}: <span className="text-[#16acd4] font-mono">{invoiceNumber}</span></h1>
                </div>
                <div className="flex gap-2">
                    <select value={invType} onChange={e => setInvType(e.target.value)} className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2 outline-none">
                        <option value="INVOICE">Tax Invoice</option>
                        <option value="QUOTATION">Quotation</option>
                        <option value="PROFORMA">Proforma Invoice</option>
                    </select>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2 outline-none">
                        <option value="DRAFT">Draft</option>
                        <option value="UNPAID">Unpaid</option>
                        <option value="PAID">Paid</option>
                        <option value="PARTIALLY_PAID">Partially Paid</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase transition-colors disabled:opacity-50">
                        <Check className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-6 w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6">
                {/* Left Pane: Document info, item inputs, items list */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    {/* Document Info */}
                    <div className="bg-[#121214] border border-white/5 p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Client */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Client Details</p>
                            <div className="flex gap-2">
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
                                }} className="flex-1 bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50">
                                    <option value="">Select a client...</option>
                                    {clients.map(c => {
                                        const vName = c.vehicleName || c.invoices?.[0]?.vehicleName
                                        const vReg = c.vehicleRegNo || c.invoices?.[0]?.vehicleRegNo
                                        const label = c.name + (vReg ? ` (${vName || "Vehicle"} - ${vReg})` : "")
                                        return <option key={c.id} value={c.id}>{label}</option>
                                    })}
                                </select>
                                <button onClick={() => setShowAddClient(true)} className="bg-[#16acd4] hover:bg-white text-black p-2 transition-colors" title="Add New Client">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            {clientId && (() => {
                                const c = clients.find(x => x.id === clientId)
                                const vName = c?.vehicleName || c?.invoices?.[0]?.vehicleName
                                const vReg = c?.vehicleRegNo || c?.invoices?.[0]?.vehicleRegNo
                                return c ? (
                                    <div className="text-xs text-zinc-400 space-y-1 pl-1 border-l-2 border-[#16acd4]/30">
                                        {c.phone && <p>📞 {c.phone}</p>}
                                        {c.email && <p>✉️ {c.email}</p>}
                                        {c.gstin && <p>🏛️ GSTIN: {c.gstin}</p>}
                                        {c.address && <p>📍 {c.address}</p>}
                                        {vReg && (
                                            <p className="text-[#16acd4] font-semibold mt-1">🚗 Vehicle: {vName} ({vReg})</p>
                                        )}
                                    </div>
                                ) : null
                            })()}
                        </div>

                        {/* Doc Number & Discount */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Document Info</p>
                            <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                                <label className="text-xs text-zinc-500">Number</label>
                                <input value={invoiceNumber} readOnly className="bg-[#09090b] border border-white/10 text-zinc-500 text-xs px-3 py-2 outline-none cursor-not-allowed font-mono" />
                            </div>
                            <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                                <label className="text-xs text-zinc-500">Discount ₹</label>
                                <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50" />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Dates</p>
                            <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                                <label className="text-xs text-zinc-500">Issue Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50" />
                            </div>
                            <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                                <label className="text-xs text-zinc-500">Due Date</label>
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50" />
                            </div>
                        </div>
                    </div>

                    {/* Add Item Row */}
                    <div className="bg-[#121214] border border-white/5 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">{editingTempId !== null ? "✏ Edit Product / Service" : "Add Product / Service"}</p>
                        <div className="flex flex-wrap gap-2 items-end">
                            <div className="flex-1 min-w-[180px]">
                                <label className="text-[10px] text-zinc-600 mb-1 block">From Catalog</label>
                                <select value={selItemId} onChange={e => setSelItemId(e.target.value)} className="w-full bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-2 py-2 outline-none focus:border-[#16acd4]/50">
                                    <option value="">Pick a saved service...</option>
                                    {catalogItems.map(i => <option key={i.id} value={i.id}>{i.name} (₹{i.price})</option>)}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[160px]">
                                <label className="text-[10px] text-zinc-600 mb-1 block">Description *</label>
                                <input value={lineDesc} onChange={e => setLineDesc(e.target.value)} placeholder="Service name" className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-2 py-2 outline-none focus:border-[#16acd4]/50 placeholder:text-zinc-700" />
                            </div>
                            <div className="w-24">
                                <label className="text-[10px] text-zinc-600 mb-1 block">HSN/SAC</label>
                                <input value={lineHsn} onChange={e => setLineHsn(e.target.value)} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-2 py-2 outline-none focus:border-[#16acd4]/50" />
                            </div>
                            <div className="w-16">
                                <label className="text-[10px] text-zinc-600 mb-1 block">Qty</label>
                                <input type="number" value={lineQty} onChange={e => setLineQty(parseInt(e.target.value) || 1)} min={1} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-2 py-2 outline-none focus:border-[#16acd4]/50 text-center" />
                            </div>
                            <div className="w-24">
                                <label className="text-[10px] text-zinc-600 mb-1 block">Rate (₹) *</label>
                                <input type="number" value={lineRate} onChange={e => setLineRate(parseFloat(e.target.value) || 0)} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-2 py-2 outline-none focus:border-[#16acd4]/50 text-right" />
                            </div>
                            <div className="w-20">
                                <label className="text-[10px] text-zinc-600 mb-1 block">Disc %</label>
                                <input type="number" value={lineDisc} onChange={e => setLineDisc(parseFloat(e.target.value) || 0)} min={0} max={100} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-2 py-2 outline-none focus:border-[#16acd4]/50 text-right" />
                            </div>
                            <div className="w-20">
                                <label className="text-[10px] text-zinc-600 mb-1 block">Tax %</label>
                                <select value={lineTax} onChange={e => setLineTax(parseFloat(e.target.value))} className="w-full bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-2 py-2 outline-none focus:border-[#16acd4]/50">
                                    <option value={0}>0%</option>
                                    <option value={5}>5%</option>
                                    <option value={12}>12%</option>
                                    <option value={18}>18%</option>
                                    <option value={28}>28%</option>
                                </select>
                            </div>
                            <div className="flex gap-1.5">
                                <button onClick={addOrUpdateLine} className="flex items-center gap-1.5 px-4 py-2 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase transition-colors">
                                    {editingTempId !== null ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editingTempId !== null ? "UPDATE" : "ADD"}
                                </button>
                                {editingTempId !== null && (
                                    <button onClick={() => {
                                        setEditingTempId(null)
                                        setSelItemId(""); setLineDesc(""); setLineHsn(""); setLineQty(1); setLineRate(0); setLineTax(18); setLineDisc(0)
                                    }} className="bg-zinc-800 text-zinc-400 p-2 hover:text-white border border-white/10" title="Cancel Edit">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-[#121214] border border-white/5 overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-[#1a1a1c] border-b border-white/10">
                                <tr>
                                    <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">#</th>
                                    <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">Service / Item</th>
                                    <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">HSN/SAC</th>
                                    <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-center">Qty</th>
                                    <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">Rate</th>
                                    <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">Disc %</th>
                                    <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">Taxable</th>
                                    <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">CGST</th>
                                    <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">SGST</th>
                                    <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">Total</th>
                                    <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {computed.length === 0 ? (
                                    <tr><td colSpan={11} className="p-10 text-center text-zinc-600">No items added yet. Add a product or service above.</td></tr>
                                ) : computed.map((l, i) => (
                                    <tr key={l.tempId} className={`hover:bg-white/[0.02] transition-colors ${editingTempId === l.tempId ? "bg-white/[0.04]" : ""}`}>
                                        <td className="p-3 text-zinc-600">{i + 1}</td>
                                        <td className="p-3 text-white font-medium">{l.name}</td>
                                        <td className="p-3 text-zinc-500">{l.hsnSacCode}</td>
                                        <td className="p-3 text-center">{l.quantity}</td>
                                        <td className="p-3 text-right font-mono">₹{l.rate.toFixed(2)}</td>
                                        <td className="p-3 text-right font-mono">{l.discount}%</td>
                                        <td className="p-3 text-right font-mono">₹{l.taxable.toFixed(2)}</td>
                                        <td className="p-3 text-right font-mono text-zinc-400">₹{(l.tax / 2).toFixed(2)}</td>
                                        <td className="p-3 text-right font-mono text-zinc-400">₹{(l.tax / 2).toFixed(2)}</td>
                                        <td className="p-3 text-right font-mono font-bold text-[#16acd4]">₹{l.total.toFixed(2)}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => editLine(l)} className="text-[#16acd4] hover:text-white" title="Edit row"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => removeLine(l.tempId)} className="text-red-500 hover:text-red-400" title="Delete row"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Pane: Sticky Summary & Notes */}
                <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
                    {/* Totals Summary */}
                    <div className="bg-[#121214] border border-white/5 p-5 flex flex-col gap-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Summary</p>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-zinc-400"><span>Sub Total</span><span className="font-mono">₹{subTotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-zinc-400"><span>CGST</span><span className="font-mono">₹{(taxTotal / 2).toFixed(2)}</span></div>
                            <div className="flex justify-between text-zinc-400"><span>SGST</span><span className="font-mono">₹{(taxTotal / 2).toFixed(2)}</span></div>
                            {discount > 0 && <div className="flex justify-between text-red-400"><span>Discount</span><span className="font-mono">-₹{discount.toFixed(2)}</span></div>}
                            <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-white/10">
                                <span>Grand Total</span>
                                <span className="font-mono text-[#16acd4]">₹{grandTotal.toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-zinc-600 text-right">* Inclusive of all taxes</p>
                        </div>
                        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[#16acd4] hover:bg-white text-black font-bold uppercase tracking-widest text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" /> {saving ? "Saving..." : "Save Invoice Changes"}
                        </button>
                    </div>

                    {/* Notes & Terms */}
                    <div className="bg-[#121214] border border-white/5 p-5 space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Notes & Terms</p>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1 block">Note (printed on invoice)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-[#09090b] border border-white/10 text-zinc-300 text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50 resize-none font-sans" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1 block">Terms & Conditions</label>
                            <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={3} className="w-full bg-[#09090b] border border-white/10 text-zinc-300 text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50 resize-none font-sans" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Client Modal */}
            {showAddClient && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#121214] border border-white/10 w-full max-w-lg rounded-sm shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-bold text-white">Add New Client</h3>
                            <button onClick={() => setShowAddClient(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
                            {[
                                { label: "Client Name *", key: "name", col: 2 },
                                { label: "Phone", key: "phone", col: 1 },
                                { label: "Email", key: "email", col: 1 },
                                { label: "GSTIN", key: "gstin", col: 1 },
                                { label: "City", key: "city", col: 1 },
                                { label: "PIN Code", key: "pin", col: 1 },
                                { label: "Vehicle Name", key: "vehicleName", col: 1 },
                                { label: "Reg Number", key: "vehicleRegNo", col: 1 },
                                { label: "Odometer (KM)", key: "odometer", col: 1 },
                                { label: "Chassis / VIN", key: "vehicleChassis", col: 1 },
                            ].map(f => (
                                <div key={f.key} className={f.col === 2 ? "col-span-2" : ""}>
                                    <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">{f.label}</label>
                                    <input
                                        value={(newClient as any)[f.key]}
                                        onChange={e => setNewClient(prev => ({ ...prev, [f.key]: e.target.value }))}
                                        className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50"
                                    />
                                </div>
                            ))}
                            <div className="col-span-2">
                                <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">State</label>
                                <select value={newClient.state} onChange={e => setNewClient(prev => ({ ...prev, state: e.target.value }))} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50">
                                    <option value="">Select state...</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">Billing Address</label>
                                <textarea value={newClient.address} onChange={e => setNewClient(prev => ({ ...prev, address: e.target.value }))} rows={2} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50 resize-none" />
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/10 flex justify-end">
                            <button onClick={handleAddClient} disabled={addingClient} className="px-6 py-2 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase transition-colors disabled:opacity-50 flex items-center gap-2">
                                <Check className="w-4 h-4" /> {addingClient ? "Saving..." : "Save Client"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 text-sm">Loading...</div>}>
            <EditInvoiceForm id={id} />
        </Suspense>
    )
}
