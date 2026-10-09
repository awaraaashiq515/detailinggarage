"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Sparkles,
    Plus,
    Search,
    Car,
    Clock,
    ShieldCheck,
    Edit3,
    Trash2,
    Layers,
    Receipt,
    X,
    Check,
    Wrench,
    Droplets,
    ArrowRight,
    Boxes,
    IndianRupee,
    Tag
} from "lucide-react"

export interface PackageProduct {
    id?: string
    name: string
    quantity: number
    unit: string
    price: number
    itemId?: string
}

export interface ServicePackage {
    id: string
    vehicleName?: string | null
    name: string
    category: string
    description?: string | null
    inclusions?: string | null
    productsUsed?: string | null
    laborCharge?: number | null
    basePrice: number
    hatchbackPrice?: number | null
    sedanPrice?: number | null
    compactSuvPrice?: number | null
    fullSuvPrice?: number | null
    bikePrice?: number | null
    duration?: string | null
    warranty?: string | null
    hsnSacCode?: string | null
    taxRate: number
    isActive: boolean
    shopId?: string | null
    createdAt: string
}

const CATEGORIES = [
    { key: "ALL", label: "All Vehicles & Services", icon: Sparkles },
    { key: "COATING", label: "Ceramic / Graphene", icon: ShieldCheck },
    { key: "PPF", label: "PPF Protection", icon: Layers },
    { key: "WASHING", label: "Washing & Cleaning", icon: Droplets },
    { key: "POLISHING", label: "Rubbing & Polishing", icon: Sparkles },
    { key: "INTERIOR", label: "Interior Spa", icon: Car },
    { key: "LABOR", label: "Service & Mechanical", icon: Wrench },
]

const POPULAR_VEHICLES = [
    "Toyota Fortuner",
    "Mahindra Thar",
    "Hyundai Creta",
    "Mahindra Scorpio-N",
    "Tata Nexon",
    "Maruti Swift",
    "Honda City",
    "Kia Seltos",
    "Tata Safari / Harrier",
    "BMW 3 Series / Mercedes C-Class",
    "Royal Enfield / Bike"
]

function parseProductsList(raw: any): PackageProduct[] {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) return parsed
            if (typeof parsed === "string") {
                const doubleParsed = JSON.parse(parsed)
                if (Array.isArray(doubleParsed)) return doubleParsed
            }
        } catch {
            return []
        }
    }
    return []
}

export function ServicePackagesView({
    basePath = "/shop/billing"
}: {
    basePath?: string
}) {
    const [packages, setPackages] = useState<ServicePackage[]>([])
    const [stockItems, setStockItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("ALL")
    
    // Create / Edit modal state
    const [showModal, setShowModal] = useState(false)
    const [editingPkg, setEditingPkg] = useState<ServicePackage | null>(null)
    const [saving, setSaving] = useState(false)

    // Form inputs
    const [formVehicleName, setFormVehicleName] = useState("")
    const [formName, setFormName] = useState("")
    const [formCategory, setFormCategory] = useState("COATING")
    const [formDescription, setFormDescription] = useState("")

    // Products / Parts used
    const [formProducts, setFormProducts] = useState<PackageProduct[]>([])
    const [selectedStockItemId, setSelectedStockItemId] = useState("")
    const [productInputName, setProductInputName] = useState("")
    const [productInputPrice, setProductInputPrice] = useState("")
    const [productInputQty, setProductInputQty] = useState(1)
    const [productInputUnit, setProductInputUnit] = useState("PCS")

    // Pricing & Labor
    const [formLaborCharge, setFormLaborCharge] = useState("")
    const [formBasePrice, setFormBasePrice] = useState("")
    const [formDuration, setFormDuration] = useState("")
    const [formWarranty, setFormWarranty] = useState("")
    const [formHsnSacCode, setFormHsnSacCode] = useState("9987")
    const [formTaxRate, setFormTaxRate] = useState("18")

    const fetchPackages = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (selectedCategory && selectedCategory !== "ALL") params.set("category", selectedCategory)
            if (search) params.set("search", search)
            const res = await fetch(`/api/admin/billing/packages?${params.toString()}`)
            const data = await res.json()
            if (data.success) {
                setPackages(data.packages || [])
            }
        } catch (e) {
            console.error("Failed to load packages:", e)
        } finally {
            setLoading(false)
        }
    }

    const fetchStockItems = async () => {
        try {
            const res = await fetch("/api/admin/billing/items")
            const data = await res.json()
            if (data.success && data.items) {
                setStockItems(data.items)
            }
        } catch (e) {
            console.error("Failed to fetch stock items:", e)
        }
    }

    useEffect(() => {
        fetchPackages()
        fetchStockItems()
    }, [selectedCategory])

    const totalPartsCost = formProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0)

    // Auto-update base price when parts or labor change
    const updateLaborAndTotal = (laborStr: string) => {
        setFormLaborCharge(laborStr)
        const labor = parseFloat(laborStr) || 0
        setFormBasePrice(String(totalPartsCost + labor))
    }

    const openCreateModal = () => {
        setEditingPkg(null)
        setFormVehicleName("Toyota Fortuner")
        setFormName("Toyota Fortuner - 9H Ceramic & Underbody Armor")
        setFormCategory("COATING")
        setFormDescription("Complete multi-layer ceramic protection, underbody anti-rust seal and interior detailing.")
        setFormProducts([
            { id: "1", name: "Graphene Matrix Ceramic Coating 50ml", quantity: 1, unit: "BOTTLE", price: 3750 },
            { id: "2", name: "Heavy Cutting Compound", quantity: 1, unit: "CAN", price: 850 },
            { id: "3", name: "Underbody Rubberized Anti-Rust Seal", quantity: 2, unit: "CAN", price: 1200 },
        ])
        setSelectedStockItemId("")
        setProductInputName("")
        setProductInputPrice("")
        setProductInputQty(1)
        setProductInputUnit("PCS")
        
        const initialParts = (3750 * 1) + (850 * 1) + (1200 * 2) // 7000
        const initialLabor = 5000
        setFormLaborCharge(String(initialLabor))
        setFormBasePrice(String(initialParts + initialLabor))
        setFormDuration("2 Days")
        setFormWarranty("3 Years Warranty")
        setFormHsnSacCode("9987")
        setFormTaxRate("18")
        setShowModal(true)
    }

    const openEditModal = (pkg: ServicePackage) => {
        setEditingPkg(pkg)
        setFormVehicleName(pkg.vehicleName || pkg.name.split("-")[0]?.trim() || "")
        setFormName(pkg.name)
        setFormCategory(pkg.category || "DETAILING")
        setFormDescription(pkg.description || "")

        const prodList: PackageProduct[] = parseProductsList(pkg.productsUsed)
        setFormProducts(prodList)
        setSelectedStockItemId("")
        setProductInputName("")
        setProductInputPrice("")
        setProductInputQty(1)
        setProductInputUnit("PCS")

        const partsSum = prodList.reduce((acc, p) => acc + (p.price * p.quantity), 0)
        const labor = pkg.laborCharge !== null && pkg.laborCharge !== undefined ? pkg.laborCharge : Math.max(0, pkg.basePrice - partsSum)
        setFormLaborCharge(String(labor))
        setFormBasePrice(String(pkg.basePrice || (partsSum + labor)))
        setFormDuration(pkg.duration || "")
        setFormWarranty(pkg.warranty || "")
        setFormHsnSacCode(pkg.hsnSacCode || "9987")
        setFormTaxRate(String(pkg.taxRate || 18))
        setShowModal(true)
    }

    const handleAddProduct = () => {
        if (!productInputName.trim()) {
            alert("Please select or enter a product/part name")
            return
        }

        const price = parseFloat(productInputPrice) || 0
        const qty = productInputQty > 0 ? productInputQty : 1
        const newProd: PackageProduct = {
            id: Date.now().toString(),
            name: productInputName.trim(),
            quantity: qty,
            unit: productInputUnit || "PCS",
            price: price,
            itemId: selectedStockItemId || undefined
        }

        const nextProducts = [...formProducts, newProd]
        setFormProducts(nextProducts)

        // auto-recalc total price
        const nextPartsTotal = nextProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0)
        const currentLabor = parseFloat(formLaborCharge) || 0
        setFormBasePrice(String(nextPartsTotal + currentLabor))

        setSelectedStockItemId("")
        setProductInputName("")
        setProductInputPrice("")
        setProductInputQty(1)
        setProductInputUnit("PCS")
    }

    const handleRemoveProduct = (idx: number) => {
        const nextProducts = formProducts.filter((_, i) => i !== idx)
        setFormProducts(nextProducts)
        const nextPartsTotal = nextProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0)
        const currentLabor = parseFloat(formLaborCharge) || 0
        setFormBasePrice(String(nextPartsTotal + currentLabor))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formName.trim()) {
            alert("Package name / service title is required")
            return
        }

        setSaving(true)
        try {
            const labor = parseFloat(formLaborCharge) || 0
            const total = parseFloat(formBasePrice) || (totalPartsCost + labor)

            const payload = {
                id: editingPkg ? editingPkg.id : undefined,
                vehicleName: formVehicleName.trim() || null,
                name: formName.trim(),
                category: formCategory,
                description: formDescription.trim() || null,
                inclusions: null, // Scope of work removed per user request
                productsUsed: formProducts,
                laborCharge: labor,
                basePrice: total,
                duration: formDuration.trim() || null,
                warranty: formWarranty.trim() || null,
                hsnSacCode: formHsnSacCode.trim() || "9987",
                taxRate: parseFloat(formTaxRate) || 18,
            }

            const method = editingPkg ? "PUT" : "POST"
            const res = await fetch("/api/admin/billing/packages", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (data.success) {
                setShowModal(false)
                fetchPackages()
            } else {
                alert(data.error || "Failed to save package")
            }
        } catch (err: any) {
            alert(err?.message || "Error saving package")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return
        try {
            const res = await fetch(`/api/admin/billing/packages?id=${id}`, {
                method: "DELETE"
            })
            const data = await res.json()
            if (data.success) {
                setPackages(prev => prev.filter(p => p.id !== id))
            } else {
                alert(data.error || "Failed to delete package")
            }
        } catch (err: any) {
            alert(err?.message || "Error deleting package")
        }
    }

    const filtered = packages.filter(p => {
        if (search) {
            const q = search.toLowerCase()
            const matchName = p.name.toLowerCase().includes(q)
            const matchVehicle = p.vehicleName?.toLowerCase().includes(q)
            const matchDesc = p.description?.toLowerCase().includes(q)
            return matchName || matchVehicle || matchDesc
        }
        return true
    })

    return (
        <div className="space-y-6">
            {/* Header & Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 bg-[#16acd4]/10 text-[#16acd4] border border-[#16acd4]/30 rounded flex items-center gap-1">
                            <Car className="w-3 h-3" /> Vehicle-Wise Packages
                        </span>
                        <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded flex items-center gap-1">
                            <Boxes className="w-3 h-3" /> Stock Parts & Products
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
                        <Sparkles className="w-6 h-6 text-[#16acd4]" />
                        Vehicle Service & Detailing Packages
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Pre-configured packages by car model: Vehicle name, required stock parts/materials, labor charges, and total pricing.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`${basePath}/invoices/new`}
                        className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5"
                    >
                        <Receipt className="w-4 h-4 text-[#16acd4]" /> Create Bill
                    </Link>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2.5 bg-[#16acd4] hover:bg-white text-black text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 shadow-lg shadow-[#16acd4]/20"
                    >
                        <Plus className="w-4 h-4" /> + Create Vehicle Package
                    </button>
                </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.map(cat => {
                    const Icon = cat.icon
                    const isSelected = selectedCategory === cat.key
                    return (
                        <button
                            key={cat.key}
                            onClick={() => setSelectedCategory(cat.key)}
                            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded whitespace-nowrap transition-all ${
                                isSelected
                                    ? "bg-[#16acd4] text-black shadow-md shadow-[#16acd4]/25"
                                    : "bg-[#121214] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {cat.label}
                        </button>
                    )
                })}
            </div>

            {/* Search Bar & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121214] border border-white/5 p-3 rounded">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by Vehicle Name (e.g. Fortuner, Creta, Thar, Swift)..."
                        className="w-full bg-[#09090b] border border-white/10 rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#16acd4]"
                    />
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                    Total Packages: <span className="text-[#16acd4] font-bold">{filtered.length}</span>
                </div>
            </div>

            {/* Packages Grid */}
            {loading ? (
                <div className="py-20 text-center text-zinc-500 text-xs animate-pulse">
                    Loading vehicle packages...
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center bg-[#121214] border border-white/5 rounded-lg">
                    <Car className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-white mb-1">No vehicle packages found</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
                        Create packages for specific cars with parts/materials and labor rates.
                    </p>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-[#16acd4] text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-white transition-colors"
                    >
                        + Create Package
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(pkg => {
                        const products: PackageProduct[] = parseProductsList(pkg.productsUsed)

                        const partsSum = products.reduce((acc, p) => acc + (p.price * p.quantity), 0)
                        const labor = pkg.laborCharge !== null && pkg.laborCharge !== undefined ? pkg.laborCharge : Math.max(0, pkg.basePrice - partsSum)
                        const vehicleDisplay = pkg.vehicleName || pkg.name.split("-")[0]?.trim()

                        return (
                            <div
                                key={pkg.id}
                                className="bg-[#121214] border border-white/5 hover:border-[#16acd4]/40 rounded-xl p-5 flex flex-col justify-between transition-all group hover:shadow-2xl hover:shadow-[#16acd4]/5"
                            >
                                <div className="space-y-4">
                                    {/* Card Header with Car Name & Category */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#16acd4]/15 text-[#16acd4] border border-[#16acd4]/30 flex items-center gap-1">
                                                    <Car className="w-3 h-3" /> {vehicleDisplay}
                                                </span>
                                                <span className="text-[9.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/5">
                                                    {pkg.category}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold text-white mt-2 group-hover:text-[#16acd4] transition-colors leading-snug">
                                                {pkg.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => openEditModal(pkg)}
                                                className="p-1.5 text-zinc-500 hover:text-white rounded hover:bg-white/5 transition-colors"
                                                title="Edit Package"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pkg.id, pkg.name)}
                                                className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                                                title="Delete Package"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {pkg.description && (
                                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                                            {pkg.description}
                                        </p>
                                    )}

                                    {/* Products & Parts Used */}
                                    <div className="bg-[#161619] border border-[#fb923c]/25 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold text-[#fb923c] border-b border-white/5 pb-1.5">
                                            <span className="flex items-center gap-1.5">
                                                <Boxes className="w-3.5 h-3.5" />
                                                Parts & Products Used ({products.length})
                                            </span>
                                            <span className="font-mono bg-[#fb923c]/10 px-2 py-0.5 rounded text-[11px]">
                                                Parts: ₹{partsSum.toLocaleString()}
                                            </span>
                                        </div>

                                        {products.length > 0 ? (
                                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                                {products.map((p, i) => (
                                                    <div key={i} className="flex justify-between items-center text-[11px] bg-black/25 px-2.5 py-1.5 rounded border border-white/5">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="text-[#fb923c] font-bold">•</span>
                                                            <span className="text-zinc-200 font-medium truncate">{p.name}</span>
                                                            <span className="text-zinc-400 font-mono text-[10px] shrink-0">
                                                                ({p.quantity} {p.unit})
                                                            </span>
                                                        </div>
                                                        <span className="font-mono text-[#fb923c] font-bold text-[10.5px] shrink-0 ml-2">
                                                            ₹{(p.price * p.quantity).toLocaleString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-zinc-500 italic py-1">
                                                No parts specified (Pure service/labor).
                                            </p>
                                        )}
                                    </div>

                                    {/* Pricing Breakdown: Parts + Labor = Total */}
                                    <div className="bg-[#09090b] border border-white/5 rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between items-center text-xs text-zinc-400">
                                            <span>Parts & Materials Total:</span>
                                            <span className="font-mono text-zinc-200">₹{partsSum.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-zinc-400">
                                            <span>Service / Labor Charge:</span>
                                            <span className="font-mono text-[#16acd4] font-bold">₹{labor.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-white/10">
                                            <span className="flex items-center gap-1">
                                                <Tag className="w-3.5 h-3.5 text-[#16acd4]" /> Total Package Price:
                                            </span>
                                            <span className="font-mono text-lg text-[#16acd4]">
                                                ₹{pkg.basePrice.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Meta pills: Duration & Warranty */}
                                    <div className="flex flex-wrap gap-2 text-[11px]">
                                        {pkg.duration && (
                                            <span className="inline-flex items-center gap-1 text-zinc-400 bg-white/[0.03] px-2 py-0.5 rounded">
                                                <Clock className="w-3 h-3 text-zinc-500" />
                                                {pkg.duration}
                                            </span>
                                        )}
                                        {pkg.warranty && pkg.warranty !== "None" && (
                                            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                                {pkg.warranty}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 text-zinc-500 bg-white/[0.02] px-2 py-0.5 rounded font-mono text-[10px]">
                                            SAC {pkg.hsnSacCode || "9987"} · {pkg.taxRate}% GST
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Action Button */}
                                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                                    <Link
                                        href={`${basePath}/invoices/new?package=${encodeURIComponent(pkg.name)}`}
                                        className="w-full py-2.5 bg-white/[0.05] hover:bg-[#16acd4] hover:text-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all text-center flex items-center justify-center gap-1.5"
                                    >
                                        Use in Invoice / Bill <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal: Create / Edit Package */}
            {showModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#16161a]">
                            <div className="flex items-center gap-2">
                                <Car className="w-5 h-5 text-[#16acd4]" />
                                <div>
                                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                        {editingPkg ? "Edit Vehicle Service Package" : "Create Vehicle Service Package"}
                                    </h2>
                                    <p className="text-[11px] text-zinc-400">
                                        Specify vehicle model, required parts & materials, and labor fees
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-zinc-500 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
                            {/* Vehicle Name & Quick Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-zinc-400 block">
                                    Vehicle Name / Model *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formVehicleName}
                                    onChange={e => {
                                        const vName = e.target.value
                                        setFormVehicleName(vName)
                                        if (!editingPkg) {
                                            setFormName(`${vName} - Service Package`)
                                        }
                                    }}
                                    placeholder="e.g. Toyota Fortuner, Mahindra Thar, Creta, Swift..."
                                    className="w-full bg-[#09090b] border border-white/15 rounded-lg px-3 py-2 text-sm text-white font-bold outline-none focus:border-[#16acd4]"
                                />
                                
                                {/* Quick Vehicle Badges */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
                                    <span className="text-[9.5px] text-zinc-500 font-bold shrink-0">Quick Pick:</span>
                                    {POPULAR_VEHICLES.map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => {
                                                setFormVehicleName(v)
                                                if (!editingPkg) {
                                                    setFormName(`${v} - Service Package`)
                                                }
                                            }}
                                            className={`text-[10px] px-2 py-0.5 rounded border whitespace-nowrap transition-colors ${
                                                formVehicleName === v
                                                    ? "bg-[#16acd4] text-black font-bold border-[#16acd4]"
                                                    : "bg-[#121214] text-zinc-400 border-white/5 hover:text-white"
                                            }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Package Title & Category */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                                        Service Package Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formName}
                                        onChange={e => setFormName(e.target.value)}
                                        placeholder="e.g. Periodic Service & 9H Ceramic Protection"
                                        className="w-full bg-[#09090b] border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={formCategory}
                                        onChange={e => setFormCategory(e.target.value)}
                                        className="w-full bg-[#09090b] border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-[#16acd4]"
                                    >
                                        <option value="COATING">Ceramic / Graphene Coating</option>
                                        <option value="PPF">Paint Protection Film (PPF)</option>
                                        <option value="WASHING">Washing & Cleaning</option>
                                        <option value="POLISHING">Rubbing & Polishing</option>
                                        <option value="INTERIOR">Interior Spa</option>
                                        <option value="LABOR">Service & Mechanical</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                                    Package Notes / Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={formDescription}
                                    onChange={e => setFormDescription(e.target.value)}
                                    placeholder="Brief customer notes for this service..."
                                    className="w-full bg-[#09090b] border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-[#16acd4] resize-none"
                                />
                            </div>

                            {/* PARTS & PRODUCTS USED SECTION */}
                            <div className="bg-[#09090b] border border-[#fb923c]/35 p-4 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Boxes className="w-4 h-4 text-[#fb923c]" />
                                            Required Parts & Products (Stock Select or Add)
                                        </h4>
                                        <p className="text-[11px] text-zinc-400">
                                            Select from workshop stock or add custom parts with quantity & rate
                                        </p>
                                    </div>
                                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#fb923c]/15 text-[#fb923c] font-bold border border-[#fb923c]/30">
                                        Parts Total: ₹{totalPartsCost.toLocaleString()}
                                    </span>
                                </div>

                                {/* Part input row */}
                                <div className="bg-[#121214] p-3 rounded-lg border border-white/10 space-y-2.5">
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                        {/* Dropdown from stock */}
                                        <div className="sm:col-span-5">
                                            <label className="text-[9.5px] font-bold text-zinc-400 block mb-1">
                                                Select from Workshop Stock
                                            </label>
                                            <select
                                                value={selectedStockItemId}
                                                onChange={e => {
                                                    const sId = e.target.value
                                                    setSelectedStockItemId(sId)
                                                    if (sId) {
                                                        const found = stockItems.find(i => i.id === sId)
                                                        if (found) {
                                                            setProductInputName(found.name)
                                                            setProductInputPrice(String(found.purchasePrice || found.price || ""))
                                                            setProductInputUnit(found.unit || "PCS")
                                                        }
                                                    }
                                                }}
                                                className="w-full bg-[#09090b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#fb923c]"
                                            >
                                                <option value="">-- Choose Stock Item --</option>
                                                {stockItems.map(item => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name} (Stock: {item.stock || 0} {item.unit || "PCS"} · ₹{item.purchasePrice || item.price})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Part Name */}
                                        <div className="sm:col-span-4">
                                            <label className="text-[9.5px] font-bold text-zinc-400 block mb-1">
                                                Part / Product Name
                                            </label>
                                            <input
                                                type="text"
                                                value={productInputName}
                                                onChange={e => setProductInputName(e.target.value)}
                                                placeholder="e.g. Engine Oil 5W30 or Ceramic Coat"
                                                className="w-full bg-[#09090b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#fb923c]"
                                            />
                                        </div>

                                        {/* Qty */}
                                        <div className="sm:col-span-1">
                                            <label className="text-[9.5px] font-bold text-zinc-400 block mb-1 text-center">
                                                Qty
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={productInputQty}
                                                onChange={e => setProductInputQty(parseInt(e.target.value) || 1)}
                                                className="w-full bg-[#09090b] border border-white/10 rounded px-1.5 py-1.5 text-xs text-white outline-none focus:border-[#fb923c] text-center font-mono font-bold"
                                            />
                                        </div>

                                        {/* Unit */}
                                        <div className="sm:col-span-2">
                                            <label className="text-[9.5px] font-bold text-zinc-400 block mb-1">
                                                Unit
                                            </label>
                                            <select
                                                value={productInputUnit}
                                                onChange={e => setProductInputUnit(e.target.value)}
                                                className="w-full bg-[#09090b] border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#fb923c]"
                                            >
                                                {["PCS", "BOTTLE", "CAN", "BOX", "LTR", "MTR", "SET", "KG", "KIT", "ROLL"].map(u => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <label className="text-[10px] font-bold text-zinc-400">
                                                Price / Rate (₹):
                                            </label>
                                            <input
                                                type="number"
                                                value={productInputPrice}
                                                onChange={e => setProductInputPrice(e.target.value)}
                                                placeholder="Price in ₹"
                                                className="w-36 bg-[#09090b] border border-white/10 rounded px-2.5 py-1 text-xs text-white outline-none focus:border-[#fb923c] font-mono font-bold"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddProduct}
                                            className="px-4 py-1.5 bg-[#fb923c] hover:bg-white text-black font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> + Add Part
                                        </button>
                                    </div>
                                </div>

                                {/* List of Added Parts */}
                                {formProducts.length > 0 ? (
                                    <div className="space-y-1.5 pt-1">
                                        <label className="text-[10px] uppercase font-bold text-zinc-400 block">
                                            Parts in this Package ({formProducts.length}):
                                        </label>
                                        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                                            {formProducts.map((p, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between gap-2 bg-[#121214] px-3 py-2 rounded-lg border border-white/5 text-xs"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Boxes className="w-3.5 h-3.5 text-[#fb923c]" />
                                                        <span className="font-bold text-white">{p.name}</span>
                                                        <span className="text-[10px] text-zinc-400 font-mono">
                                                            ({p.quantity} {p.unit} × ₹{p.price})
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-[#fb923c] font-bold">
                                                            ₹{(p.price * p.quantity).toLocaleString()}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveProduct(idx)}
                                                            className="text-zinc-500 hover:text-red-400 p-0.5"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[10.5px] text-zinc-500 italic">
                                        No parts added yet. (Add stock items or parts needed for this car).
                                    </p>
                                )}
                            </div>

                            {/* LABOR & TOTAL BILL SECTION */}
                            <div className="bg-[#09090b] border border-white/10 p-4 rounded-xl space-y-3">
                                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <IndianRupee className="w-3.5 h-3.5 text-[#16acd4]" /> Pricing & Labor Charges
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="bg-[#121214] p-3 rounded-lg border border-white/5">
                                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                                            Parts Subtotal (₹)
                                        </label>
                                        <div className="text-base font-mono font-bold text-[#fb923c]">
                                            ₹{totalPartsCost.toLocaleString()}
                                        </div>
                                        <p className="text-[9.5px] text-zinc-500 mt-0.5">Sum of all parts above</p>
                                    </div>

                                    <div className="bg-[#121214] p-3 rounded-lg border border-white/5">
                                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                                            Service / Labor Charge (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={formLaborCharge}
                                            onChange={e => updateLaborAndTotal(e.target.value)}
                                            placeholder="e.g. 2500"
                                            className="w-full bg-[#09090b] border border-white/10 rounded px-2.5 py-1 text-sm font-mono font-bold text-[#16acd4] outline-none focus:border-[#16acd4]"
                                        />
                                        <p className="text-[9.5px] text-zinc-500 mt-0.5">Workshop labor fee</p>
                                    </div>

                                    <div className="bg-[#121214] p-3 rounded-lg border border-[#16acd4]/40">
                                        <label className="text-[10px] font-bold text-[#16acd4] block mb-1 uppercase">
                                            Total Package Price (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={formBasePrice}
                                            onChange={e => setFormBasePrice(e.target.value)}
                                            placeholder="Final price"
                                            className="w-full bg-[#09090b] border border-[#16acd4] rounded px-2.5 py-1 text-base font-mono font-bold text-white outline-none"
                                        />
                                        <p className="text-[9.5px] text-zinc-400 mt-0.5 font-bold">Parts + Labor = Total</p>
                                    </div>
                                </div>
                            </div>

                            {/* Meta: Duration, Warranty, SAC & GST */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Duration</label>
                                    <input
                                        type="text"
                                        value={formDuration}
                                        onChange={e => setFormDuration(e.target.value)}
                                        placeholder="e.g. 2 Days / 4 Hours"
                                        className="w-full bg-[#09090b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Warranty</label>
                                    <input
                                        type="text"
                                        value={formWarranty}
                                        onChange={e => setFormWarranty(e.target.value)}
                                        placeholder="e.g. 3 Years Warranty"
                                        className="w-full bg-[#09090b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">SAC Code</label>
                                    <input
                                        type="text"
                                        value={formHsnSacCode}
                                        onChange={e => setFormHsnSacCode(e.target.value)}
                                        placeholder="9987"
                                        className="w-full bg-[#09090b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">GST Rate %</label>
                                    <select
                                        value={formTaxRate}
                                        onChange={e => setFormTaxRate(e.target.value)}
                                        className="w-full bg-[#09090b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#16acd4]"
                                    >
                                        <option value="0">0%</option>
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18% (Standard)</option>
                                        <option value="28">28%</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-[#16acd4] hover:bg-white text-black text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    {saving ? "Saving..." : editingPkg ? "Update Package" : "Save Package"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
