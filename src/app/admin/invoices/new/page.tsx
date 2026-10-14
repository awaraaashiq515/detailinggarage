"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Plus, Trash2, Check, ArrowLeft, X, Sparkles, Car, ShieldCheck, CheckCircle2, Boxes } from "lucide-react"

type BillingClient = {
    id: string; name: string; phone: string | null; email: string | null; gstin: string | null; state: string | null; address: string | null
    vehicleName?: string | null; vehicleRegNo?: string | null; vehicleChassis?: string | null; odometer?: string | null
    invoices?: { vehicleName: string | null; vehicleRegNo: string | null; vehicleChassis: string | null; odometer: string | null }[]
}
type BillingItem = { id: string; name: string; price: number; hsnSacCode: string | null; taxRate: number; type: string; stock?: number; unit?: string }
type LineItem = { tempId: number; name: string; hsnSacCode: string; quantity: number; rate: number; taxRate: number; discount: number }

const INDIAN_STATES = ["01-Jammu & Kashmir","02-Himachal Pradesh","03-Punjab","04-Chandigarh","05-Uttarakhand","06-Haryana","07-Delhi","08-Rajasthan","09-Uttar Pradesh","10-Bihar","11-Sikkim","12-Arunachal Pradesh","13-Nagaland","14-Manipur","15-Mizoram","16-Tripura","17-Meghalaya","18-Assam","19-West Bengal","20-Jharkhand","21-Odisha","22-Chhattisgarh","23-Madhya Pradesh","24-Gujarat","25-Daman & Diu","26-Dadra & Nagar Haveli","27-Maharashtra","28-Andhra Pradesh","29-Karnataka","30-Goa","31-Lakshadweep","32-Kerala","33-Tamil Nadu","34-Puducherry","35-Andaman & Nicobar","36-Telangana","37-Andhra Pradesh (New)"]

const TYPE_PREFIX: Record<string, string> = { INVOICE: "DG", QUOTATION: "QT", PROFORMA: "PF" }
const TYPE_LABELS: Record<string, string> = { INVOICE: "Tax Invoice", QUOTATION: "Quotation", PROFORMA: "Proforma Invoice" }

export function AdminInvoiceForm({ 
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
    const lockType = defaultLockType !== undefined ? defaultLockType : searchParams.get("lockType") === "true"
    const backUrl = defaultBackUrl || searchParams.get("back") || "/admin/invoices"

    const [clients, setClients] = useState<BillingClient[]>([])
    const [catalogItems, setCatalogItems] = useState<BillingItem[]>([])
    const [saving, setSaving] = useState(false)
    const [showAddClient, setShowAddClient] = useState(false)
    const [addingClient, setAddingClient] = useState(false)

    // Invoice form state
    const [clientId, setClientId] = useState("")
    const [invType, setInvType] = useState(urlType)
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [dueDate, setDueDate] = useState("")
    const [docPrefix, setDocPrefix] = useState(
        backUrl.startsWith("/shop")
            ? (urlType === "QUOTATION" || urlType === "ESTIMATE" ? "QT" : "INV")
            : (TYPE_PREFIX[urlType] || "DG")
    )
    const [discount, setDiscount] = useState(0)
    const [notes, setNotes] = useState("WE SHALL NOT BE RESPONSIBLE FOR THE REPLACED PARTS IF NOT COLLECTED AT THE TIME OF DELIVERY.")
    const [terms, setTerms] = useState("")
    const [savingDefaults, setSavingDefaults] = useState(false)
    const [savedDefaultsFeedback, setSavedDefaultsFeedback] = useState(false)
    const [lineItems, setLineItems] = useState<LineItem[]>([])
    const [vehicleName, setVehicleName] = useState("")
    const [vehicleRegNo, setVehicleRegNo] = useState("")
    const [vehicleChassis, setVehicleChassis] = useState("")
    const [odometer, setOdometer] = useState("")
    const [staffList, setStaffList] = useState<{ id: string; name: string; role: string; commissionRate: number; phone?: string | null }[]>([])
    const [assignedStaffId, setAssignedStaffId] = useState("")

    // New line item inputs
    const [selItemId, setSelItemId] = useState("")
    const [lineDesc, setLineDesc] = useState("")
    const [lineHsn, setLineHsn] = useState("")
    const [lineQty, setLineQty] = useState(1)
    const [lineRate, setLineRate] = useState(0)
    const [lineLabor, setLineLabor] = useState(0)
    const [lineTax, setLineTax] = useState(18)
    const [lineDisc, setLineDisc] = useState(0)
    const [lineType, setLineType] = useState<"PRODUCT" | "SERVICE">("PRODUCT")
    const [lineUnit, setLineUnit] = useState("PCS")
    const [lineStock, setLineStock] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)

    // Quick Add Product / Stock Modal
    const [showAddProductModal, setShowAddProductModal] = useState(false)
    const [addingProduct, setAddingProduct] = useState(false)
    const [newProduct, setNewProduct] = useState({
        name: "",
        type: "PRODUCT",
        price: "",
        purchasePrice: "",
        stock: "10",
        unit: "PCS",
        minStockAlert: "5",
        sku: "",
        hsnSacCode: "",
        taxRate: "18",
        addToInvoice: true,
        qtyToBill: "1",
    })

    // Quick Add Labor state
    const [quickLaborDesc, setQuickLaborDesc] = useState("")
    const [quickLaborAmount, setQuickLaborAmount] = useState(0)
    const [quickLaborTax, setQuickLaborTax] = useState(18)
    const [quickLaborSac, setQuickLaborSac] = useState("9987")

    // Detailing Packages State
    const [servicePackages, setServicePackages] = useState<any[]>([])
    const [showPackageModal, setShowPackageModal] = useState(false)
    const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null)
    const [pkgVehicleType, setPkgVehicleType] = useState<"hatchback" | "sedan" | "compactSuv" | "fullSuv" | "bike" | "base">("sedan")

    // Labor modal states
    const [showLaborModal, setShowLaborModal] = useState(false)
    const [laborTab, setLaborTab] = useState<"general" | "parts">("general")
    const [partLabors, setPartLabors] = useState<Record<string, number>>({})

    // New client form
    const [newClient, setNewClient] = useState({ name: "", phone: "", email: "", address: "", gstin: "", state: "", city: "", pin: "", vehicleName: "", vehicleRegNo: "", vehicleChassis: "", odometer: "" })

    useEffect(() => {
        fetch("/api/admin/billing/clients").then(r => r.json()).then(d => d.success && setClients(d.clients))
        fetch("/api/admin/billing/items").then(r => r.json()).then(d => d.success && setCatalogItems(d.items))
        fetch("/api/shop/billing/staff").then(r => r.json()).then(d => d.success && d.staff && setStaffList(d.staff)).catch(() => {})

        // Pre-fill default Notes & Terms from Shop / Business Profile
        const profileApi = backUrl.startsWith("/shop") ? "/api/shop/billing/profile" : "/api/admin/billing/profile"
        fetch(profileApi)
            .then(r => r.json())
            .then(d => {
                const p = d.profile || d
                if (p) {
                    if (p.defaultNotes) setNotes(p.defaultNotes)
                    if (p.defaultTerms) setTerms(p.defaultTerms)
                }
            })
            .catch(() => {})

        fetch("/api/admin/billing/packages").then(r => r.json()).then(d => {
            if (d.success && d.packages) {
                setServicePackages(d.packages)
                if (typeof window !== "undefined") {
                    const params = new URLSearchParams(window.location.search)
                    const pName = params.get("package")
                    if (pName) {
                        const match = d.packages.find((p: any) => p.name.toLowerCase() === pName.toLowerCase())
                        if (match) {
                            setSelectedPkgId(match.id)
                            setShowPackageModal(true)
                        }
                    }
                }
            }
        })
    }, [backUrl])

    const handleSaveDefaultsToProfile = async () => {
        setSavingDefaults(true)
        try {
            const profileApi = backUrl.startsWith("/shop") ? "/api/shop/billing/profile" : "/api/admin/billing/profile"
            const res = await fetch(profileApi, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ defaultNotes: notes, defaultTerms: terms })
            })
            const d = await res.json()
            if (d.success) {
                setSavedDefaultsFeedback(true)
                setTimeout(() => setSavedDefaultsFeedback(false), 3000)
            } else {
                alert(d.error || "Failed to save defaults to profile")
            }
        } catch (err: any) {
            alert(err?.message || "Error saving defaults to profile")
        }
        setSavingDefaults(false)
    }

    // When catalog item is selected, auto-fill
    useEffect(() => {
        if (!selItemId) return
        const item = catalogItems.find(i => i.id === selItemId)
        if (!item) return
        setLineDesc(item.name)
        setLineHsn(item.hsnSacCode || "")
        setLineRate(item.price)
        setLineTax(item.taxRate)
        if (item.type === "PRODUCT" || item.type === "SERVICE") {
            setLineType(item.type as any)
        }
        if (item.unit) setLineUnit(item.unit)
        if (item.stock !== undefined) setLineStock(String(item.stock))
    }, [selItemId, catalogItems])

    const handleCreateProductSubmit = async () => {
        if (!newProduct.name.trim()) {
            alert("Product name is required")
            return
        }
        if (!newProduct.price || isNaN(parseFloat(newProduct.price))) {
            alert("Valid selling price is required")
            return
        }

        setAddingProduct(true)
        try {
            const initialStock = newProduct.type === "PRODUCT" ? (parseFloat(newProduct.stock) || 0) : 0
            const res = await fetch("/api/admin/billing/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newProduct.name.trim(),
                    price: parseFloat(newProduct.price),
                    purchasePrice: newProduct.purchasePrice ? parseFloat(newProduct.purchasePrice) : null,
                    hsnSacCode: newProduct.hsnSacCode.trim() || null,
                    taxRate: parseFloat(newProduct.taxRate) || 0,
                    type: newProduct.type,
                    stock: initialStock,
                    unit: newProduct.unit || "PCS",
                    minStockAlert: parseFloat(newProduct.minStockAlert) || 5,
                    sku: newProduct.sku.trim() || null,
                    trackStock: newProduct.type === "PRODUCT",
                })
            })
            const data = await res.json()
            if (data.success && data.item) {
                setCatalogItems(prev => [data.item, ...prev])

                if (newProduct.addToInvoice) {
                    const billQty = parseFloat(newProduct.qtyToBill) || 1
                    const timestamp = Date.now()
                    setLineItems(prev => [
                        ...prev,
                        {
                            tempId: timestamp,
                            name: data.item.name,
                            hsnSacCode: data.item.hsnSacCode || "",
                            quantity: billQty,
                            rate: data.item.price,
                            taxRate: data.item.taxRate,
                            discount: 0,
                        }
                    ])
                }

                setShowAddProductModal(false)
                setNewProduct({
                    name: "",
                    type: "PRODUCT",
                    price: "",
                    purchasePrice: "",
                    stock: "10",
                    unit: "PCS",
                    minStockAlert: "5",
                    sku: "",
                    hsnSacCode: "",
                    taxRate: "18",
                    addToInvoice: true,
                    qtyToBill: "1",
                })
            } else {
                alert(data.error || "Failed to create product")
            }
        } catch (e: any) {
            alert(e?.message || "Failed to create product")
        } finally {
            setAddingProduct(false)
        }
    }

    const addLine = async () => {
        if (!lineDesc || lineRate <= 0) return
        
        // Auto-save to catalog & stock if not exists
        const exists = catalogItems.some(i => i.name.toLowerCase() === lineDesc.trim().toLowerCase())
        if (!exists) {
            try {
                const initialStock = lineType === "PRODUCT" ? (parseFloat(lineStock) || lineQty) : 0
                const res = await fetch("/api/admin/billing/items", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: lineDesc.trim(),
                        price: lineRate,
                        hsnSacCode: lineHsn || "",
                        taxRate: lineTax,
                        type: lineType,
                        stock: initialStock,
                        unit: lineUnit || "PCS",
                        minStockAlert: 5,
                        trackStock: lineType === "PRODUCT",
                    })
                })
                const data = await res.json()
                if (data.success && data.item) {
                    setCatalogItems(prev => [data.item, ...prev])
                }
            } catch (err) {
                console.error("Failed to auto-save item to catalog:", err)
            }
        }

        const timestamp = Date.now()
        const newPart = {
            tempId: timestamp,
            name: lineDesc.trim(),
            hsnSacCode: lineHsn,
            quantity: lineQty,
            rate: lineRate,
            taxRate: lineTax,
            discount: lineDisc,
        }

        if (lineLabor > 0) {
            const newLabor = {
                tempId: timestamp + 1,
                name: `${lineDesc.trim()} (Labor Charge)`,
                hsnSacCode: "9987",
                quantity: lineQty,
                rate: lineLabor,
                taxRate: lineTax,
                discount: 0,
            }
            setLineItems(prev => [...prev, newPart, newLabor])
        } else {
            setLineItems(prev => [...prev, newPart])
        }

        setSelItemId(""); setLineDesc(""); setLineHsn(""); setLineQty(1); setLineRate(0); setLineLabor(0); setLineTax(18); setLineDisc(0)
    }

    const addQuickLabor = () => {
        if (!quickLaborDesc || quickLaborAmount <= 0) return
        setLineItems(prev => [...prev, {
            tempId: Date.now() + Math.random(),
            name: quickLaborDesc,
            hsnSacCode: quickLaborSac || "9987",
            quantity: 1,
            rate: quickLaborAmount,
            taxRate: quickLaborTax,
            discount: 0,
        }])
        setQuickLaborDesc("")
        setQuickLaborAmount(0)
        setShowLaborModal(false)
    }

    const applyPartLabors = () => {
        const timestamp = Date.now()
        const newLaborItems: any[] = []
        Object.entries(partLabors).forEach(([tempIdStr, rate], index) => {
            const tempId = parseFloat(tempIdStr)
            const partItem = lineItems.find(item => item.tempId === tempId)
            if (partItem && rate > 0) {
                newLaborItems.push({
                    tempId: timestamp + index + Math.random(),
                    name: `${partItem.name} (Labor Charge)`,
                    hsnSacCode: "9987",
                    quantity: partItem.quantity,
                    rate: rate,
                    taxRate: partItem.taxRate,
                    discount: 0,
                })
            }
        })
        if (newLaborItems.length > 0) {
            setLineItems(prev => [...prev, ...newLaborItems])
        }
        setPartLabors({})
        setShowLaborModal(false)
    }

    const removeLine = (id: number) => setLineItems(prev => prev.filter(l => l.tempId !== id))

    const updateLineItem = (tempId: number, field: keyof LineItem, value: any) => {
        setLineItems(prev => prev.map(item => {
            if (item.tempId === tempId) {
                return { ...item, [field]: value }
            }
            return item
        }))
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
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId, type: invType, date, dueDate: dueDate || null, items: lineItems, discount, notes, terms, vehicleName, vehicleRegNo, vehicleChassis, odometer, prefix: docPrefix, assignedStaffId: assignedStaffId || null }),
        })
        const data = await res.json()
        setSaving(false)
        if (data.success) router.push(backUrl)
        else alert(data.error || "Failed to create invoice")
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

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 bg-[#121214] border-b border-white/10 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={backUrl} className="text-zinc-500 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
                    <h1 className="text-base font-bold font-display whitespace-nowrap">New {TYPE_LABELS[invType] || "Invoice"}</h1>
                    <button
                        type="button"
                        onClick={() => setShowLaborModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-[#16acd4] hover:text-black border border-white/10 text-white font-bold text-xs uppercase transition-colors rounded-sm ml-4"
                    >
                        🔧 Add Labor
                    </button>
                </div>

                <div className="flex gap-2">
                    {!lockType && (
                        <select
                            value={invType}
                            onChange={e => {
                                const nextT = e.target.value
                                setInvType(nextT)
                                setDocPrefix(
                                    backUrl.startsWith("/shop")
                                        ? (nextT === "QUOTATION" || nextT === "ESTIMATE" ? "QT" : "INV")
                                        : (TYPE_PREFIX[nextT] || "DG")
                                )
                            }}
                            className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2 outline-none"
                        >
                            <option value="INVOICE">Tax Invoice</option>
                            <option value="QUOTATION">Quotation</option>
                            <option value="PROFORMA">Proforma Invoice</option>
                        </select>
                    )}
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase transition-colors disabled:opacity-50">
                        <Check className="w-4 h-4" /> {saving ? "Saving..." : `Save ${TYPE_LABELS[invType] || "Document"}`}
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-6 w-full max-w-[1600px] mx-auto flex flex-col gap-6">
                    {/* Document Info */}
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

                        {/* Doc Number */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Document Info</p>
                            <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                                <label className="text-xs text-zinc-500">Prefix</label>
                                <input value={docPrefix} onChange={e => setDocPrefix(e.target.value)} className="bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50 w-20" />
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

                    {/* Vehicle & Assigned Technician / Staff */}
                    <div className="bg-[#121214] border border-white/5 p-4 rounded-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#16acd4] mb-1.5 flex items-center gap-1.5">
                                <Car className="w-3.5 h-3.5" /> Vehicle Name / Model
                            </label>
                            <input
                                value={vehicleName}
                                onChange={e => setVehicleName(e.target.value)}
                                placeholder="e.g. Toyota Fortuner / Creta"
                                className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">
                                Vehicle Reg. Number
                            </label>
                            <input
                                value={vehicleRegNo}
                                onChange={e => setVehicleRegNo(e.target.value.toUpperCase())}
                                placeholder="e.g. DL 01 AB 1234"
                                className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50 font-mono uppercase"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Serviced By (Staff)
                                </span>
                                {assignedStaffId && (() => {
                                    const s = staffList.find(x => x.id === assignedStaffId)
                                    return s?.commissionRate ? (
                                        <span className="text-[9px] text-[#c084fc] font-bold">
                                            {s.commissionRate}% Comm
                                        </span>
                                    ) : null
                                })()}
                            </label>
                            <select
                                value={assignedStaffId}
                                onChange={e => setAssignedStaffId(e.target.value)}
                                className="w-full bg-[#09090b] border border-emerald-500/30 text-white text-xs px-3 py-2 outline-none focus:border-emerald-400 font-semibold"
                            >
                                <option value="">No staff assigned</option>
                                {staffList.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.role}){s.commissionRate > 0 ? ` • ${s.commissionRate}% Comm` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">
                                    Odometer
                                </label>
                                <input
                                    value={odometer}
                                    onChange={e => setOdometer(e.target.value)}
                                    placeholder="KM"
                                    className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">
                                    Chassis / VIN
                                </label>
                                <input
                                    value={vehicleChassis}
                                    onChange={e => setVehicleChassis(e.target.value)}
                                    placeholder="Optional"
                                    className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add Item Row */}
                    <div className="bg-[#121214] border border-white/5 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Add Line Item</p>
                                <div className="flex items-center bg-[#09090b] border border-white/10 rounded p-0.5 text-[10px]">
                                    <button
                                        type="button"
                                        onClick={() => setLineType("PRODUCT")}
                                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                                            lineType === "PRODUCT"
                                                ? "bg-[#16acd4] text-black"
                                                : "text-zinc-500 hover:text-white"
                                        }`}
                                    >
                                        📦 Product (Stock)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLineType("SERVICE")}
                                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                                            lineType === "SERVICE"
                                                ? "bg-blue-500 text-white"
                                                : "text-zinc-500 hover:text-white"
                                        }`}
                                    >
                                        🛠️ Service
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPackageModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded text-xs font-bold transition-colors"
                                >
                                    <Sparkles className="w-3.5 h-3.5" /> ✨ Detailing Packages
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddProductModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-[#16acd4]/10 hover:bg-[#16acd4]/20 text-[#16acd4] border border-[#16acd4]/30 rounded text-xs font-bold transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> + New Product / Add to Stock
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-end">
                            <div className="relative flex-1 min-w-[240px]">
                                <label className="text-[10px] text-zinc-600 mb-1 block font-bold text-[#16acd4]">Service / Item *</label>
                                <input
                                    value={lineDesc}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    onChange={e => {
                                        const val = e.target.value
                                        setLineDesc(val)
                                        setShowSuggestions(true)
                                        const item = catalogItems.find(i => i.name.toLowerCase() === val.trim().toLowerCase())
                                        if (item) {
                                            setLineHsn(item.hsnSacCode || "")
                                            setLineRate(item.price)
                                            setLineTax(item.taxRate)
                                            if (item.type === "PRODUCT" || item.type === "SERVICE") {
                                                setLineType(item.type as any)
                                            }
                                            if (item.unit) setLineUnit(item.unit)
                                            if (item.stock !== undefined) setLineStock(String(item.stock))
                                        }
                                    }}
                                    placeholder="Type product name or select saved..."
                                    className="w-full bg-[#09090b] border border-[#16acd4]/30 text-white text-xs px-2.5 py-2 outline-none focus:border-[#16acd4] placeholder:text-zinc-700 font-semibold"
                                />
                                {showSuggestions && catalogItems.filter(i => i.name.toLowerCase().includes(lineDesc.toLowerCase())).length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#121214] border border-white/10 shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-white/5">
                                        {catalogItems
                                            .filter(i => i.name.toLowerCase().includes(lineDesc.toLowerCase()))
                                            .map(item => (
                                                <div
                                                    key={item.id}
                                                    onMouseDown={() => {
                                                        setLineDesc(item.name)
                                                        setLineHsn(item.hsnSacCode || "")
                                                        setLineRate(item.price)
                                                        setLineTax(item.taxRate)
                                                        if (item.type === "PRODUCT" || item.type === "SERVICE") {
                                                            setLineType(item.type as any)
                                                        }
                                                        if (item.unit) setLineUnit(item.unit)
                                                        if (item.stock !== undefined) setLineStock(String(item.stock))
                                                        setShowSuggestions(false)
                                                    }}
                                                    className="p-2.5 hover:bg-[#16acd4]/10 hover:text-[#16acd4] cursor-pointer text-left transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-semibold text-white text-xs">{item.name}</div>
                                                        {item.type === "PRODUCT" && item.stock !== undefined && (
                                                            <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                                                item.stock <= 0
                                                                    ? "bg-red-500/20 text-red-400"
                                                                    : item.stock <= 5
                                                                    ? "bg-amber-500/20 text-amber-400"
                                                                    : "bg-emerald-500/20 text-emerald-400"
                                                            }`}>
                                                                Stock: {item.stock} {item.unit || "PCS"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500 mt-0.5">
                                                        Rate: ₹{item.price} | GST: {item.taxRate}% {item.type === "PRODUCT" ? `· Product` : "· Service"}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
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
                            <div className="w-24">
                                <label className="text-[10px] text-[#16acd4] mb-1 block font-bold">Labor (₹)</label>
                                <input type="number" value={lineLabor} onChange={e => setLineLabor(parseFloat(e.target.value) || 0)} className="w-full bg-[#09090b] border border-[#16acd4]/30 text-white text-xs px-2 py-2 outline-none focus:border-[#16acd4] text-right" />
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
                            {lineType === "PRODUCT" && (
                                <>
                                    <div className="w-20">
                                        <label className="text-[10px] text-zinc-600 mb-1 block">Unit</label>
                                        <select
                                            value={lineUnit}
                                            onChange={e => setLineUnit(e.target.value)}
                                            className="w-full bg-[#09090b] border border-white/10 text-zinc-300 text-xs px-2 py-2 outline-none focus:border-[#16acd4]/50"
                                        >
                                            {["PCS", "LTR", "BOTTLE", "BOX", "SET", "KG", "CAN", "MTR", "PACK", "ROLL", "KIT"].map(u => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <label className="text-[10px] text-emerald-400 mb-1 block font-bold" title="Opening stock quantity in workshop">
                                            Stock Qty
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={lineStock}
                                            onChange={e => setLineStock(e.target.value)}
                                            placeholder="In stock"
                                            className="w-full bg-[#09090b] border border-emerald-500/40 text-emerald-400 text-xs px-2 py-2 outline-none focus:border-emerald-400 text-center font-mono font-bold"
                                        />
                                    </div>
                                </>
                            )}
                            <button onClick={addLine} className="flex items-center gap-1.5 px-4 py-2 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase transition-colors">
                                <Plus className="w-4 h-4" /> ADD
                            </button>
                        </div>
                    </div>



                    {/* Items Table */}
                    <div className="bg-[#121214] border border-white/5 overflow-x-auto rounded-lg">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-[#1a1a1c] border-b border-white/10">
                                <tr>
                                    <th className="p-2.5 text-zinc-500 font-bold uppercase tracking-wider text-center w-8">#</th>
                                    <th className="p-2.5 text-zinc-500 font-bold uppercase tracking-wider min-w-[200px]">Service / Item Name</th>
                                    <th className="p-2.5 text-zinc-500 font-bold uppercase tracking-wider w-24">HSN/SAC</th>
                                    <th className="p-2.5 text-zinc-500 font-bold uppercase tracking-wider text-center w-20">Qty</th>
                                    <th className="p-2.5 text-zinc-500 font-bold uppercase tracking-wider text-right w-28">Rate (₹)</th>
                                    <th className="p-2.5 text-zinc-500 font-bold uppercase tracking-wider text-right w-20">Disc %</th>
                                    <th className="p-2.5 text-zinc-500 font-bold uppercase tracking-wider text-center w-16">Tax %</th>
                                    <th className="p-2.5 text-zinc-500 font-bold uppercase tracking-wider text-right">Taxable</th>
                                    <th className="p-2.5 text-zinc-500 font-bold uppercase tracking-wider text-right">CGST</th>
                                    <th className="p-2.5 text-zinc-500 font-bold uppercase tracking-wider text-right">SGST</th>
                                    <th className="p-2.5 text-zinc-500 font-bold uppercase tracking-wider text-right">Total</th>
                                    <th className="p-2.5 text-zinc-500 font-bold uppercase tracking-wider text-center w-10">Del</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {computed.length === 0 ? (
                                    <tr><td colSpan={12} className="p-10 text-center text-zinc-600">No items added yet. Add a product or service above.</td></tr>
                                ) : computed.map((l, i) => (
                                    <tr key={l.tempId} className="hover:bg-white/[0.02] group">
                                        <td className="p-2.5 text-zinc-600 text-center font-mono text-[11px]">{i + 1}</td>
                                        <td className="p-1.5">
                                            <input
                                                type="text"
                                                value={l.name}
                                                onChange={e => updateLineItem(l.tempId, "name", e.target.value)}
                                                placeholder="Service or part name"
                                                className="w-full bg-[#09090b]/60 hover:bg-[#09090b] focus:bg-[#09090b] border border-white/5 hover:border-white/20 focus:border-[#16acd4] rounded px-2.5 py-1.5 text-xs text-white font-medium outline-none transition-colors"
                                            />
                                        </td>
                                        <td className="p-1.5">
                                            <input
                                                type="text"
                                                value={l.hsnSacCode}
                                                onChange={e => updateLineItem(l.tempId, "hsnSacCode", e.target.value)}
                                                placeholder="HSN/SAC"
                                                className="w-full bg-[#09090b]/60 hover:bg-[#09090b] focus:bg-[#09090b] border border-white/5 hover:border-white/20 focus:border-[#16acd4] rounded px-2 py-1.5 text-xs text-zinc-400 font-mono outline-none transition-colors"
                                            />
                                        </td>
                                        <td className="p-1.5">
                                            <input
                                                type="number"
                                                step="any"
                                                min="0.01"
                                                value={l.quantity}
                                                onChange={e => updateLineItem(l.tempId, "quantity", parseFloat(e.target.value) || 0)}
                                                className="w-full bg-[#09090b]/60 hover:bg-[#09090b] focus:bg-[#09090b] border border-white/5 hover:border-white/20 focus:border-[#16acd4] rounded px-1.5 py-1.5 text-xs text-white font-mono font-bold text-center outline-none transition-colors"
                                            />
                                        </td>
                                        <td className="p-1.5">
                                            <div className="flex items-center bg-[#09090b]/60 hover:bg-[#09090b] focus-within:bg-[#09090b] border border-white/5 hover:border-white/20 focus-within:border-[#16acd4] rounded px-2 py-1.5 transition-colors">
                                                <span className="text-zinc-500 font-mono text-[11px] mr-1">₹</span>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={l.rate}
                                                    onChange={e => updateLineItem(l.tempId, "rate", parseFloat(e.target.value) || 0)}
                                                    className="w-full bg-transparent text-xs text-white font-mono font-bold text-right outline-none"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-1.5">
                                            <div className="flex items-center bg-[#09090b]/60 hover:bg-[#09090b] focus-within:bg-[#09090b] border border-white/5 hover:border-white/20 focus-within:border-[#16acd4] rounded px-1.5 py-1.5 transition-colors">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    max="100"
                                                    value={l.discount}
                                                    onChange={e => updateLineItem(l.tempId, "discount", parseFloat(e.target.value) || 0)}
                                                    className="w-full bg-transparent text-xs text-zinc-300 font-mono text-right outline-none"
                                                />
                                                <span className="text-zinc-500 font-mono text-[10px] ml-0.5">%</span>
                                            </div>
                                        </td>
                                        <td className="p-1.5">
                                            <select
                                                value={l.taxRate}
                                                onChange={e => updateLineItem(l.tempId, "taxRate", parseFloat(e.target.value))}
                                                className="w-full bg-[#09090b]/60 hover:bg-[#09090b] focus:bg-[#09090b] border border-white/5 hover:border-white/20 focus:border-[#16acd4] rounded px-1 py-1.5 text-[11px] text-zinc-400 outline-none transition-colors cursor-pointer text-center"
                                            >
                                                <option value={0}>0%</option>
                                                <option value={5}>5%</option>
                                                <option value={12}>12%</option>
                                                <option value={18}>18%</option>
                                                <option value={28}>28%</option>
                                            </select>
                                        </td>
                                        <td className="p-2.5 text-right font-mono text-zinc-200">
                                            ₹{l.taxable.toFixed(2)}
                                        </td>
                                        <td className="p-2.5 text-right font-mono text-zinc-400">
                                            ₹{(l.tax / 2).toFixed(2)}
                                        </td>
                                        <td className="p-2.5 text-right font-mono text-zinc-400">
                                            ₹{(l.tax / 2).toFixed(2)}
                                        </td>
                                        <td className="p-2.5 text-right font-mono font-bold text-[#16acd4]">
                                            ₹{l.total.toFixed(2)}
                                        </td>
                                        <td className="p-2.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeLine(l.tempId)}
                                                className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                                                title="Delete item"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Section: Notes & Terms (Left) + Totals Summary & Action (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                        {/* Notes & Terms (Left - 7 cols) */}
                        <div className="lg:col-span-7 bg-[#121214] border border-white/5 p-5 rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Notes & Terms</p>
                                <button
                                    type="button"
                                    onClick={handleSaveDefaultsToProfile}
                                    disabled={savingDefaults}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-[#16acd4] border border-[#16acd4]/30 rounded transition-all disabled:opacity-50"
                                    title="Save current note and terms to your Profile defaults so all future invoices use them"
                                >
                                    {savedDefaultsFeedback ? (
                                        <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Saved to Profile Defaults!</span>
                                    ) : (
                                        <span>💾 {savingDefaults ? "Saving..." : "Save as Default in Profile"}</span>
                                    )}
                                </button>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Note (printed on invoice)</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Enter note to be printed on invoice..."
                                    className="w-full bg-[#09090b] border border-white/10 text-zinc-300 text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50 rounded resize-none font-sans"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Terms & Conditions</label>
                                <textarea
                                    value={terms}
                                    onChange={e => setTerms(e.target.value)}
                                    rows={3}
                                    placeholder="Enter terms and conditions..."
                                    className="w-full bg-[#09090b] border border-white/10 text-zinc-300 text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50 rounded resize-none font-sans"
                                />
                            </div>
                        </div>

                        {/* Totals Summary (Right - 5 cols) */}
                        <div className="lg:col-span-5 bg-[#121214] border border-white/5 p-5 rounded-lg flex flex-col justify-between gap-5">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Summary</p>
                                <div className="space-y-2.5 text-xs">
                                    <div className="flex justify-between text-zinc-400">
                                        <span>Sub Total</span>
                                        <span className="font-mono text-zinc-200">₹{subTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-400">
                                        <span>CGST</span>
                                        <span className="font-mono text-zinc-200">₹{(taxTotal / 2).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-400">
                                        <span>SGST</span>
                                        <span className="font-mono text-zinc-200">₹{(taxTotal / 2).toFixed(2)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-red-400">
                                            <span>Discount</span>
                                            <span className="font-mono">-₹{discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-white/10">
                                        <span>Grand Total</span>
                                        <span className="font-mono text-[#16acd4]">₹{grandTotal.toFixed(2)}</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 text-right">* Inclusive of all taxes</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-3.5 bg-[#16acd4] hover:bg-white text-black font-bold uppercase tracking-widest text-sm rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#16acd4]/20"
                            >
                                <Check className="w-4 h-4" /> {saving ? "Saving..." : `Save ${TYPE_LABELS[invType] || "Invoice"}`}
                            </button>
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

            {/* Add Labor Modal */}
            {showLaborModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#121214] border border-white/10 w-full max-w-2xl rounded-sm shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-bold text-white flex items-center gap-2">🔧 Manage Labor Charges</h3>
                            <button onClick={() => setShowLaborModal(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex border-b border-white/5 bg-[#1a1a1c]">
                            <button
                                onClick={() => setLaborTab("general")}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${laborTab === "general" ? "bg-[#16acd4]/10 text-[#16acd4] border-b-2 border-[#16acd4]" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                            >
                                General Labor Charge
                            </button>
                            <button
                                onClick={() => setLaborTab("parts")}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${laborTab === "parts" ? "bg-[#16acd4]/10 text-[#16acd4] border-b-2 border-[#16acd4]" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                            >
                                Part-Linked Labor Charge
                            </button>
                        </div>

                        <div className="p-5 max-h-[60vh] overflow-y-auto">
                            {laborTab === "general" ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">Labor Description *</label>
                                        <input
                                            value={quickLaborDesc}
                                            onChange={e => setQuickLaborDesc(e.target.value)}
                                            placeholder="e.g., General Denting & Painting Labor"
                                            className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">SAC Code</label>
                                            <input
                                                value={quickLaborSac}
                                                onChange={e => setQuickLaborSac(e.target.value)}
                                                className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">Amount (₹) *</label>
                                            <input
                                                type="number"
                                                value={quickLaborAmount || ""}
                                                onChange={e => setQuickLaborAmount(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50 text-right"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">Tax %</label>
                                            <select
                                                value={quickLaborTax}
                                                onChange={e => setQuickLaborTax(parseFloat(e.target.value))}
                                                className="w-full bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50"
                                            >
                                                <option value={0}>0%</option>
                                                <option value={5}>5%</option>
                                                <option value={12}>12%</option>
                                                <option value={18}>18%</option>
                                                <option value={28}>28%</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-2">Select and add labor cost to parts currently in the invoice:</p>
                                    
                                    {lineItems.filter(item => item.hsnSacCode !== "9987" && !item.name.includes("(Labor")).length === 0 ? (
                                        <p className="text-center py-6 text-zinc-600 text-xs">No parts added to the invoice yet. Add products to the invoice first.</p>
                                    ) : (
                                        <div className="divide-y divide-white/5 border border-white/5 bg-[#09090b]">
                                            {lineItems.filter(item => item.hsnSacCode !== "9987" && !item.name.includes("(Labor")).map(item => (
                                                <div key={item.tempId} className="flex items-center justify-between p-3">
                                                    <div>
                                                        <p className="font-semibold text-white text-xs">{item.name}</p>
                                                        <p className="text-[10px] text-zinc-500 font-mono">Qty: {item.quantity} | Rate: ₹{item.rate}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Labor Charge (₹):</span>
                                                        <input
                                                            type="number"
                                                            value={partLabors[String(item.tempId)] || ""}
                                                            onChange={e => setPartLabors(prev => ({ ...prev, [String(item.tempId)]: parseFloat(e.target.value) || 0 }))}
                                                            placeholder="0.00"
                                                            className="bg-[#121214] border border-white/10 text-white text-xs px-3 py-1.5 outline-none focus:border-[#16acd4]/50 w-28 text-right font-mono"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/10 flex justify-end gap-2 bg-[#1a1a1c]">
                            <button
                                onClick={() => setShowLaborModal(false)}
                                className="px-5 py-2 bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 font-bold text-xs uppercase transition-colors"
                            >
                                Cancel
                            </button>
                            {laborTab === "general" ? (
                                <button
                                    onClick={addQuickLabor}
                                    className="px-6 py-2 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase transition-colors"
                                >
                                    Add General Labor
                                </button>
                            ) : (
                                <button
                                    onClick={applyPartLabors}
                                    disabled={lineItems.filter(item => item.hsnSacCode !== "9987" && !item.name.includes("(Labor")).length === 0}
                                    className="px-6 py-2 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase transition-colors disabled:opacity-50"
                                >
                                    Apply Labor Charges
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Quick Add Product to Stock Modal */}
            {showAddProductModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#121214] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#161618]">
                            <div>
                                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-[#16acd4]" />
                                    Add New Product / Stock Catalog
                                </h3>
                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                    Item will be permanently saved to your workshop stock catalog
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddProductModal(false)}
                                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
                            {/* Type selector */}
                            <div>
                                <label className="text-[10px] text-zinc-400 mb-1 block font-bold uppercase tracking-wider">Type *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNewProduct(p => ({ ...p, type: "PRODUCT" }))}
                                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                                            newProduct.type === "PRODUCT"
                                                ? "border-[#16acd4] bg-[#16acd4]/10 text-white"
                                                : "border-white/5 bg-[#09090b] text-zinc-400"
                                        }`}
                                    >
                                        📦 Physical Product (Stock)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewProduct(p => ({ ...p, type: "SERVICE" }))}
                                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                                            newProduct.type === "SERVICE"
                                                ? "border-blue-400 bg-blue-500/10 text-white"
                                                : "border-white/5 bg-[#09090b] text-zinc-400"
                                        }`}
                                    >
                                        🛠️ Service / Labor
                                    </button>
                                </div>
                            </div>

                            {/* Product Name */}
                            <div>
                                <label className="text-[10px] text-zinc-400 mb-1 block font-bold uppercase tracking-wider">Product / Item Name *</label>
                                <input
                                    value={newProduct.name}
                                    onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. PPF Roll TPU 15m, Ceramic 50ml, Oil Filter"
                                    className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/50"
                                />
                            </div>

                            {/* SKU & HSN */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-zinc-400 mb-1 block font-bold uppercase tracking-wider">SKU / Part Number</label>
                                    <input
                                        value={newProduct.sku}
                                        onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))}
                                        placeholder="Optional part #"
                                        className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/50 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-400 mb-1 block font-bold uppercase tracking-wider">HSN / SAC Code</label>
                                    <input
                                        value={newProduct.hsnSacCode}
                                        onChange={e => setNewProduct(p => ({ ...p, hsnSacCode: e.target.value }))}
                                        placeholder="e.g. 39199090"
                                        className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/50 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Selling Price & Purchase Price */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-zinc-400 mb-1 block font-bold uppercase tracking-wider">Selling Rate (₹) *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                                        placeholder="Rate for customer"
                                        className="w-full bg-[#09090b] border border-[#16acd4]/40 text-[#16acd4] font-mono font-bold text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-400 mb-1 block font-bold uppercase tracking-wider">Purchase Cost (₹)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={newProduct.purchasePrice}
                                        onChange={e => setNewProduct(p => ({ ...p, purchasePrice: e.target.value }))}
                                        placeholder="Cost price (optional)"
                                        className="w-full bg-[#09090b] border border-white/10 text-white font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/50"
                                    />
                                </div>
                            </div>

                            {/* Stock & Unit (if product) */}
                            {newProduct.type === "PRODUCT" && (
                                <div className="bg-[#09090b] border border-white/10 p-3 rounded-xl grid grid-cols-3 gap-2.5">
                                    <div>
                                        <label className="text-[9.5px] text-zinc-400 mb-1 block font-bold uppercase tracking-wider">Opening Stock</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={newProduct.stock}
                                            onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))}
                                            className="w-full bg-[#121214] border border-white/10 text-emerald-400 font-mono font-bold text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-emerald-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9.5px] text-zinc-400 mb-1 block font-bold uppercase tracking-wider">Unit</label>
                                        <select
                                            value={newProduct.unit}
                                            onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))}
                                            className="w-full bg-[#121214] border border-white/10 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-[#16acd4]/50"
                                        >
                                            {["PCS", "LTR", "BOTTLE", "BOX", "SET", "KG", "CAN", "MTR", "PACK", "ROLL", "KIT"].map(u => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9.5px] text-zinc-400 mb-1 block font-bold uppercase tracking-wider">Low Alert Qty</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={newProduct.minStockAlert}
                                            onChange={e => setNewProduct(p => ({ ...p, minStockAlert: e.target.value }))}
                                            className="w-full bg-[#121214] border border-white/10 text-amber-400 font-mono text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-amber-400"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* GST Rate */}
                            <div>
                                <label className="text-[10px] text-zinc-400 mb-1 block font-bold uppercase tracking-wider">GST Rate (%)</label>
                                <select
                                    value={newProduct.taxRate}
                                    onChange={e => setNewProduct(p => ({ ...p, taxRate: e.target.value }))}
                                    className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/50"
                                >
                                    {[0, 5, 12, 18, 28].map(r => (
                                        <option key={r} value={r}>{r}% GST {r === 18 ? "(Standard)" : ""}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Add immediately to current invoice checkbox */}
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300">
                                    <input
                                        type="checkbox"
                                        checked={newProduct.addToInvoice}
                                        onChange={e => setNewProduct(p => ({ ...p, addToInvoice: e.target.checked }))}
                                        className="w-4 h-4 accent-[#16acd4]"
                                    />
                                    Add this item to current bill right now
                                </label>
                                {newProduct.addToInvoice && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] text-zinc-500">Bill Qty:</span>
                                        <input
                                            type="number"
                                            step="any"
                                            value={newProduct.qtyToBill}
                                            onChange={e => setNewProduct(p => ({ ...p, qtyToBill: e.target.value }))}
                                            className="w-14 bg-[#09090b] border border-white/10 text-white text-xs px-2 py-1 rounded outline-none focus:border-[#16acd4] text-center font-mono"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 bg-[#161618] flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowAddProductModal(false)}
                                className="px-4 py-2 rounded-lg border border-white/10 text-zinc-400 text-xs font-bold hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={addingProduct}
                                onClick={handleCreateProductSubmit}
                                className="px-5 py-2 bg-[#16acd4] hover:bg-white text-black font-bold uppercase tracking-wider text-xs rounded-lg transition-colors flex items-center gap-2"
                            >
                                {addingProduct ? "Saving..." : "Save to Stock & Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailing Packages Modal */}
            {showPackageModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#121214] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#161618]">
                            <div>
                                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-fuchsia-400" />
                                    Select Detailing / Labor Package
                                </h3>
                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                    Pick a package and vehicle category to auto-calculate price & inclusions (No stock required)
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPackageModal(false)}
                                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Vehicle Segment Selector */}
                            <div>
                                <label className="text-[10px] text-zinc-400 mb-1.5 block font-bold uppercase tracking-wider">
                                    Select Vehicle Category
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                                    {[
                                        { key: "hatchback", label: "Hatchback", icon: "🚗" },
                                        { key: "sedan", label: "Sedan", icon: "🚘" },
                                        { key: "compactSuv", label: "Compact SUV", icon: "🚙" },
                                        { key: "fullSuv", label: "Full SUV", icon: "🚜" },
                                        { key: "bike", label: "Two-Wheeler", icon: "🏍️" },
                                        { key: "base", label: "Standard", icon: "⭐" },
                                    ].map(seg => (
                                        <button
                                            key={seg.key}
                                            type="button"
                                            onClick={() => setPkgVehicleType(seg.key as any)}
                                            className={`p-2 rounded-lg border text-center transition-all ${
                                                pkgVehicleType === seg.key
                                                    ? "bg-[#16acd4]/20 border-[#16acd4] text-white shadow-sm"
                                                    : "bg-[#09090b] border-white/10 text-zinc-400 hover:text-white"
                                            }`}
                                        >
                                            <div className="text-base">{seg.icon}</div>
                                            <div className="text-[10px] font-bold mt-0.5 leading-tight">{seg.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Packages list */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                                    Available Packages ({servicePackages.length})
                                </label>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {servicePackages.map(pkg => {
                                        const isSel = (selectedPkgId || servicePackages[0]?.id) === pkg.id
                                        
                                        // calculate price for selected vehicle
                                        let price = pkg.basePrice
                                        if (pkgVehicleType === "hatchback" && pkg.hatchbackPrice) price = pkg.hatchbackPrice
                                        else if (pkgVehicleType === "sedan" && pkg.sedanPrice) price = pkg.sedanPrice
                                        else if (pkgVehicleType === "compactSuv" && pkg.compactSuvPrice) price = pkg.compactSuvPrice
                                        else if (pkgVehicleType === "fullSuv" && pkg.fullSuvPrice) price = pkg.fullSuvPrice
                                        else if (pkgVehicleType === "bike" && pkg.bikePrice) price = pkg.bikePrice

                                        let incs: string[] = []
                                        if (pkg.inclusions) {
                                            try { incs = JSON.parse(pkg.inclusions) } catch { incs = pkg.inclusions.split("\n") }
                                        }

                                        let prods: any[] = []
                                        if (pkg.productsUsed) {
                                            try { prods = JSON.parse(pkg.productsUsed) } catch { prods = [] }
                                        }

                                        return (
                                            <div
                                                key={pkg.id}
                                                onClick={() => setSelectedPkgId(pkg.id)}
                                                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                                    isSel
                                                        ? "bg-fuchsia-500/10 border-fuchsia-500/50 shadow-md"
                                                        : "bg-[#09090b] border-white/5 hover:border-white/20"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-fuchsia-300">
                                                            {pkg.category}
                                                        </span>
                                                        <h4 className="font-bold text-white text-xs">{pkg.name}</h4>
                                                    </div>
                                                    <span className="font-mono font-bold text-[#16acd4] text-sm">
                                                        ₹{price.toLocaleString()}
                                                    </span>
                                                </div>

                                                {pkg.description && (
                                                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                                                        {pkg.description}
                                                    </p>
                                                )}

                                                {/* Materials & Parts Required */}
                                                {prods.length > 0 && isSel && (
                                                    <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                                                        <div className="flex items-center justify-between text-[10px] text-[#fb923c] font-bold">
                                                            <span className="flex items-center gap-1">
                                                                <Boxes className="w-3 h-3" /> Required Parts & Materials:
                                                            </span>
                                                            <span className="font-mono">
                                                                Cost: ₹{prods.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-zinc-300">
                                                            {prods.map((p, idx) => (
                                                                <div key={idx} className="flex justify-between bg-black/20 px-2 py-0.5 rounded border border-white/5">
                                                                    <span className="truncate">• {p.name} ({p.quantity} {p.unit})</span>
                                                                    <span className="font-mono text-[#fb923c] ml-1 shrink-0">₹{(p.price * p.quantity).toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {incs.length > 0 && isSel && (
                                                    <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Scope of Work:</div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                                            {incs.slice(0, 4).map((inc, i) => (
                                                                <div key={i} className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                                                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                                                    <span className="truncate">{inc}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500">
                                                    {pkg.duration && <span>⏱ {pkg.duration}</span>}
                                                    {pkg.warranty && <span>🛡️ {pkg.warranty}</span>}
                                                    <span>SAC {pkg.hsnSacCode || "9987"} · {pkg.taxRate}% GST</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 bg-[#161618] flex items-center justify-between">
                            <Link
                                href="/shop/billing/services"
                                target="_blank"
                                className="text-xs text-fuchsia-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                                Manage Packages & Rates →
                            </Link>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPackageModal(false)}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const pkg = servicePackages.find(p => p.id === (selectedPkgId || servicePackages[0]?.id))
                                        if (!pkg) return

                                        let segPrice = pkg.basePrice
                                        let segLabel = "Standard"
                                        if (pkgVehicleType === "hatchback") {
                                            segLabel = "Hatchback"
                                            if (pkg.hatchbackPrice) segPrice = pkg.hatchbackPrice
                                        } else if (pkgVehicleType === "sedan") {
                                            segLabel = "Sedan"
                                            if (pkg.sedanPrice) segPrice = pkg.sedanPrice
                                        } else if (pkgVehicleType === "compactSuv") {
                                            segLabel = "Compact SUV"
                                            if (pkg.compactSuvPrice) segPrice = pkg.compactSuvPrice
                                        } else if (pkgVehicleType === "fullSuv") {
                                            segLabel = "Full SUV"
                                            if (pkg.fullSuvPrice) segPrice = pkg.fullSuvPrice
                                        } else if (pkgVehicleType === "bike") {
                                            segLabel = "Two-Wheeler"
                                            if (pkg.bikePrice) segPrice = pkg.bikePrice
                                        }

                                        let prods: any[] = []
                                        if (pkg.productsUsed) {
                                            try {
                                                prods = typeof pkg.productsUsed === "string" ? JSON.parse(pkg.productsUsed) : pkg.productsUsed
                                                if (typeof prods === "string") prods = JSON.parse(prods)
                                            } catch {
                                                prods = []
                                            }
                                        }

                                        const timestamp = Date.now()
                                        const newItems: LineItem[] = []

                                        if (Array.isArray(prods) && prods.length > 0) {
                                            let partsSum = 0
                                            prods.forEach((p: any, idx: number) => {
                                                const qty = parseFloat(p.quantity) || 1
                                                const rate = parseFloat(p.price) || 0
                                                partsSum += (qty * rate)

                                                const matched = catalogItems.find(c => c.name.toLowerCase() === (p.name || "").toLowerCase())
                                                const defaultHsn = (p.name || "").toLowerCase().includes("oil")
                                                    ? "27101981"
                                                    : (p.name || "").toLowerCase().includes("filter")
                                                    ? "8421"
                                                    : (p.name || "").toLowerCase().includes("coolant")
                                                    ? "38200000"
                                                    : (p.name || "").toLowerCase().includes("plug")
                                                    ? "85111000"
                                                    : "8708"

                                                newItems.push({
                                                    tempId: timestamp + idx + Math.random(),
                                                    name: p.name,
                                                    hsnSacCode: matched?.hsnSacCode || defaultHsn,
                                                    quantity: qty,
                                                    rate: rate,
                                                    taxRate: matched?.taxRate || 18,
                                                    discount: 0,
                                                })
                                            })

                                            const labor = pkg.laborCharge > 0 ? pkg.laborCharge : Math.max(0, segPrice - partsSum)
                                            if (labor > 0) {
                                                newItems.push({
                                                    tempId: timestamp + prods.length + 10 + Math.random(),
                                                    name: `${pkg.name} - Service & Labor Charge (${segLabel})`,
                                                    hsnSacCode: "9987",
                                                    quantity: 1,
                                                    rate: labor,
                                                    taxRate: 18,
                                                    discount: 0,
                                                })
                                            }
                                        } else {
                                            newItems.push({
                                                tempId: timestamp,
                                                name: `${pkg.name} (${segLabel})`,
                                                hsnSacCode: pkg.hsnSacCode || "9987",
                                                quantity: 1,
                                                rate: segPrice,
                                                taxRate: pkg.taxRate || 18,
                                                discount: 0,
                                            })
                                        }

                                        if (!vehicleName && pkg.vehicleName) {
                                            setVehicleName(pkg.vehicleName)
                                        }

                                        setLineItems(prev => [...prev, ...newItems])
                                        setShowPackageModal(false)
                                    }}
                                    className="px-5 py-2 bg-[#16acd4] hover:bg-white text-black font-bold uppercase tracking-wider text-xs rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <Check className="w-4 h-4" /> Add Package to Bill
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function NewInvoicePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 text-sm">Loading...</div>}>
            <AdminInvoiceForm />
        </Suspense>
    )
}
