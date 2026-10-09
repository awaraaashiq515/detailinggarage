"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Check,
    Boxes,
    Package,
    AlertTriangle,
    TrendingUp,
    ArrowUpRight,
    History,
    RefreshCw,
    SlidersHorizontal,
    Barcode,
    Layers,
    DollarSign,
    IndianRupee,
    ArrowDown,
    ArrowUp
} from "lucide-react"

export type BillingItem = {
    id: string
    name: string
    description: string | null
    price: number
    purchasePrice: number | null
    hsnSacCode: string | null
    taxRate: number
    type: string // "SERVICE" | "PRODUCT"
    stock: number
    unit: string
    minStockAlert: number
    sku: string | null
    trackStock: boolean
    createdAt: string
    stockLogs?: StockLog[]
}

export type StockLog = {
    id: string
    quantity: number
    previousStock: number
    newStock: number
    type: string
    note: string | null
    referenceId: string | null
    createdAt: string
}

type Summary = {
    totalItems: number
    totalProducts: number
    totalStockUnits: number
    lowStockCount: number
    outOfStockCount: number
    inventoryValue: number
}

const UNITS = ["PCS", "LTR", "BOTTLE", "BOX", "SET", "KG", "CAN", "MTR", "PACK", "ROLL", "KIT"]
const TAX_RATES = [0, 5, 12, 18, 28]

const emptyItemForm = {
    name: "",
    description: "",
    type: "PRODUCT",
    price: "",
    purchasePrice: "",
    stock: "0",
    unit: "PCS",
    minStockAlert: "5",
    sku: "",
    hsnSacCode: "",
    taxRate: "18",
    trackStock: true,
}

export function StockInventoryView({
    basePath = "/shop/billing",
    title = "Stock & Inventory Management",
    subtitle = "Track product stocks, purchase rates, low stock alerts & billing items"
}: {
    basePath?: string
    title?: string
    subtitle?: string
}) {
    const [items, setItems] = useState<BillingItem[]>([])
    const [summary, setSummary] = useState<Summary>({
        totalItems: 0,
        totalProducts: 0,
        totalStockUnits: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        inventoryValue: 0,
    })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterTab, setFilterTab] = useState<"ALL" | "PRODUCTS" | "LOW_STOCK" | "OUT_OF_STOCK" | "SERVICES">("ALL")

    // Modals
    const [showItemModal, setShowItemModal] = useState(false)
    const [editingItem, setEditingItem] = useState<BillingItem | null>(null)
    const [form, setForm] = useState(emptyItemForm)
    const [saving, setSaving] = useState(false)

    // Restock Modal
    const [showRestockModal, setShowRestockModal] = useState(false)
    const [restockItem, setRestockItem] = useState<BillingItem | null>(null)
    const [restockQty, setRestockQty] = useState("10")
    const [restockRate, setRestockRate] = useState("")
    const [restockNote, setRestockNote] = useState("")
    const [restockType, setRestockType] = useState<"RESTOCK" | "ADJUSTMENT" | "DAMAGE">("RESTOCK")
    const [restocking, setRestocking] = useState(false)

    // Stock History Modal
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [historyItem, setHistoryItem] = useState<BillingItem | null>(null)
    const [historyLogs, setHistoryLogs] = useState<StockLog[]>([])
    const [loadingLogs, setLoadingLogs] = useState(false)

    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set("search", search)
            if (filterTab === "SERVICES") params.set("type", "SERVICE")
            if (filterTab === "PRODUCTS") params.set("type", "PRODUCT")
            if (filterTab === "LOW_STOCK") params.set("stockStatus", "LOW")
            if (filterTab === "OUT_OF_STOCK") params.set("stockStatus", "OUT")

            const res = await fetch(`/api/admin/billing/items?${params.toString()}`)
            const data = await res.json()
            if (data.success) {
                setItems(data.items || [])
                if (data.summary) setSummary(data.summary)
            }
        } catch (e) {
            console.error("Failed to load inventory items:", e)
        } finally {
            setLoading(false)
        }
    }, [search, filterTab])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    // Open add new modal
    const openAdd = () => {
        setEditingItem(null)
        setForm(emptyItemForm)
        setShowItemModal(true)
    }

    // Open edit modal
    const openEdit = (item: BillingItem) => {
        setEditingItem(item)
        setForm({
            name: item.name,
            description: item.description || "",
            type: item.type,
            price: String(item.price),
            purchasePrice: item.purchasePrice !== null ? String(item.purchasePrice) : "",
            stock: String(item.stock),
            unit: item.unit || "PCS",
            minStockAlert: String(item.minStockAlert ?? 5),
            sku: item.sku || "",
            hsnSacCode: item.hsnSacCode || "",
            taxRate: String(item.taxRate),
            trackStock: item.trackStock,
        })
        setShowItemModal(true)
    }

    // Save Item (Create or Update)
    const handleSaveItem = async () => {
        if (!form.name.trim()) {
            alert("Item name is required")
            return
        }
        if (!form.price || isNaN(parseFloat(form.price))) {
            alert("Valid selling price is required")
            return
        }

        setSaving(true)
        try {
            const payload: any = {
                name: form.name.trim(),
                description: form.description.trim() || null,
                type: form.type,
                price: parseFloat(form.price),
                purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null,
                stock: form.stock ? parseFloat(form.stock) : 0,
                unit: form.unit,
                minStockAlert: form.minStockAlert ? parseFloat(form.minStockAlert) : 5,
                sku: form.sku.trim() || null,
                hsnSacCode: form.hsnSacCode.trim() || null,
                taxRate: parseFloat(form.taxRate) || 0,
                trackStock: form.trackStock,
            }

            let res
            if (editingItem) {
                res = await fetch("/api/admin/billing/items", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingItem.id, ...payload }),
                })
            } else {
                res = await fetch("/api/admin/billing/items", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
            }

            const data = await res.json()
            if (data.success) {
                setShowItemModal(false)
                fetchItems()
            } else {
                alert(data.error || "Failed to save item")
            }
        } catch (e: any) {
            alert(e?.message || "Error saving item")
        } finally {
            setSaving(false)
        }
    }

    // Delete Item
    const handleDeleteItem = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return
        try {
            const res = await fetch(`/api/admin/billing/items?id=${id}`, { method: "DELETE" })
            const data = await res.json()
            if (data.success) {
                fetchItems()
            } else {
                alert(data.error || "Failed to delete item")
            }
        } catch (e: any) {
            alert(e?.message || "Failed to delete item")
        }
    }

    // Open Quick Restock Modal
    const openRestock = (item: BillingItem) => {
        setRestockItem(item)
        setRestockQty("10")
        setRestockRate(item.purchasePrice !== null ? String(item.purchasePrice) : "")
        setRestockNote("")
        setRestockType("RESTOCK")
        setShowRestockModal(true)
    }

    // Submit Quick Restock
    const handleRestockSubmit = async () => {
        if (!restockItem) return
        const qty = parseFloat(restockQty)
        if (isNaN(qty) || qty === 0) {
            alert("Please enter a valid quantity change")
            return
        }

        setRestocking(true)
        try {
            const res = await fetch("/api/admin/billing/items", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: restockItem.id,
                    action: "adjust-stock",
                    quantity: qty,
                    type: restockType,
                    note: restockNote.trim() || undefined,
                    purchasePrice: restockRate ? parseFloat(restockRate) : undefined,
                })
            })
            const data = await res.json()
            if (data.success) {
                setShowRestockModal(false)
                fetchItems()
            } else {
                alert(data.error || "Failed to update stock")
            }
        } catch (e: any) {
            alert(e?.message || "Failed to update stock")
        } finally {
            setRestocking(false)
        }
    }

    // Open History / Log Modal
    const openHistory = async (item: BillingItem) => {
        setHistoryItem(item)
        setShowHistoryModal(true)
        setLoadingLogs(true)
        try {
            const res = await fetch(`/api/admin/billing/items?logs=true&itemId=${item.id}`)
            const data = await res.json()
            if (data.success) {
                setHistoryLogs(data.logs || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingLogs(false)
        }
    }

    const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen flex flex-col gap-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2.5">
                        <Boxes className="w-6 h-6 text-[#16acd4]" />
                        {title}
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#16acd4] hover:bg-white text-black font-bold uppercase tracking-wider text-xs transition-colors rounded-lg shadow-[0_0_20px_rgba(22,172,212,0.2)]"
                    >
                        <Plus className="w-4 h-4" /> Add Item / Product
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-[#121214] border border-white/5 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Products</span>
                        <Package className="w-4 h-4 text-[#16acd4]" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white font-mono">{summary.totalProducts}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{summary.totalItems} total catalog items</div>
                </div>

                <div className="bg-[#121214] border border-white/5 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Stock Units</span>
                        <Boxes className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
                        {summary.totalStockUnits.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Physical units in workshop</div>
                </div>

                <div className={`bg-[#121214] border rounded-xl p-4 relative overflow-hidden ${summary.lowStockCount > 0 ? "border-amber-500/30 bg-amber-500/[0.02]" : "border-white/5"}`}>
                    <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock Warning</span>
                        <AlertTriangle className={`w-4 h-4 ${summary.lowStockCount > 0 ? "text-amber-400" : "text-zinc-600"}`} />
                    </div>
                    <div className={`mt-2 text-2xl font-bold font-mono ${summary.lowStockCount > 0 ? "text-amber-400" : "text-white"}`}>
                        {summary.lowStockCount}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                        {summary.outOfStockCount > 0 ? `${summary.outOfStockCount} items out of stock` : "Needs replenishment"}
                    </div>
                </div>

                <div className="bg-[#121214] border border-white/5 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Inventory Value</span>
                        <TrendingUp className="w-4 h-4 text-[#16acd4]" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-[#16acd4] font-mono">
                        {fmt(summary.inventoryValue)}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">At purchase cost rate</div>
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-[#121214] border border-white/5 p-3 rounded-xl">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    {[
                        { id: "ALL", label: `All (${summary.totalItems})` },
                        { id: "PRODUCTS", label: `Products (${summary.totalProducts})` },
                        { id: "LOW_STOCK", label: `Low Stock (${summary.lowStockCount})`, alert: summary.lowStockCount > 0 },
                        { id: "OUT_OF_STOCK", label: `Out of Stock (${summary.outOfStockCount})` },
                        { id: "SERVICES", label: "Services Only" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterTab(tab.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                filterTab === tab.id
                                    ? "bg-[#16acd4] text-black font-bold shadow-sm"
                                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                            } ${tab.alert && filterTab !== tab.id ? "border border-amber-500/40 text-amber-300" : ""}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative min-w-[240px] md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && fetchItems()}
                        type="text"
                        placeholder="Search product, SKU, HSN..."
                        className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 pl-9 rounded-lg outline-none focus:border-[#16acd4]/60 placeholder:text-zinc-600"
                    />
                    {search && (
                        <button onClick={() => { setSearch(""); fetchItems() }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#121214] border border-white/5 rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="bg-[#18181b] border-b border-white/5 text-zinc-400">
                            <tr>
                                <th className="p-3.5 font-bold uppercase tracking-wider text-zinc-500">Item &amp; Details</th>
                                <th className="p-3.5 font-bold uppercase tracking-wider text-center">Type</th>
                                <th className="p-3.5 font-bold uppercase tracking-wider text-right">Selling Price</th>
                                <th className="p-3.5 font-bold uppercase tracking-wider text-right">Purchase Price</th>
                                <th className="p-3.5 font-bold uppercase tracking-wider text-center">Stock Level</th>
                                <th className="p-3.5 font-bold uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-zinc-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center text-zinc-500">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#16acd4] border-t-transparent mb-2"></div>
                                        <p>Loading inventory items...</p>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center">
                                        <Boxes className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                                        <p className="text-zinc-400 font-bold text-sm">No items found</p>
                                        <p className="text-zinc-600 text-xs mt-1 mb-4">
                                            {filterTab === "LOW_STOCK" ? "No items are low on stock." : "Add spare parts, liquids, coatings, or services to your catalog."}
                                        </p>
                                        <button
                                            onClick={openAdd}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#16acd4] text-black text-xs font-bold uppercase hover:bg-white rounded-lg transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add First Item
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => {
                                    const isProduct = item.type === "PRODUCT"
                                    const isLow = isProduct && item.stock > 0 && item.stock <= (item.minStockAlert || 5)
                                    const isOut = isProduct && item.stock <= 0
                                    const margin = item.purchasePrice && item.purchasePrice > 0
                                        ? Math.round(((item.price - item.purchasePrice) / item.price) * 100)
                                        : null

                                    return (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                            {/* Item name + sku */}
                                            <td className="p-3.5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-sm group-hover:text-[#16acd4] transition-colors">
                                                        {item.name}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                                                        {item.sku && (
                                                            <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-zinc-300 border border-white/5">
                                                                SKU: {item.sku}
                                                            </span>
                                                        )}
                                                        {item.hsnSacCode && (
                                                            <span>HSN: {item.hsnSacCode}</span>
                                                        )}
                                                        {item.taxRate > 0 && (
                                                            <span>GST: {item.taxRate}%</span>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                                                            {item.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Type */}
                                            <td className="p-3.5 text-center">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                                    isProduct
                                                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                }`}>
                                                    {item.type}
                                                </span>
                                            </td>

                                            {/* Selling Price */}
                                            <td className="p-3.5 text-right font-mono font-bold text-white text-sm">
                                                ₹{item.price.toLocaleString("en-IN")}
                                            </td>

                                            {/* Purchase Price & Margin */}
                                            <td className="p-3.5 text-right font-mono text-zinc-400">
                                                {item.purchasePrice !== null && item.purchasePrice !== undefined ? (
                                                    <div>
                                                        <span>₹{item.purchasePrice.toLocaleString("en-IN")}</span>
                                                        {margin !== null && (
                                                            <span className={`block text-[10px] font-sans font-bold ${margin >= 20 ? "text-emerald-400" : "text-amber-400"}`}>
                                                                {margin}% margin
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-600">-</span>
                                                )}
                                            </td>

                                            {/* Stock Level */}
                                            <td className="p-3.5 text-center">
                                                {isProduct ? (
                                                    <div className="inline-flex flex-col items-center">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                                                            isOut
                                                                ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                                                : isLow
                                                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                                                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                        }`}>
                                                            <span>{item.stock}</span>
                                                            <span className="text-[10px] opacity-75">{item.unit || "PCS"}</span>
                                                        </div>
                                                        <span className="text-[9.5px] mt-0.5 text-zinc-500">
                                                            {isOut ? "Out of Stock" : isLow ? `Low (Alert: ${item.minStockAlert})` : "In Stock"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-600 text-[11px] font-medium">Non-inventory</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-3.5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {isProduct && (
                                                        <button
                                                            onClick={() => openRestock(item)}
                                                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md font-bold text-[11px] transition-colors"
                                                            title="Add / Adjust Stock"
                                                        >
                                                            <Plus className="w-3 h-3" /> Stock
                                                        </button>
                                                    )}
                                                    {isProduct && (
                                                        <button
                                                            onClick={() => openHistory(item)}
                                                            className="p-1.5 text-zinc-400 hover:text-[#16acd4] hover:bg-white/5 rounded-md transition-colors"
                                                            title="View Stock History / Audit Logs"
                                                        >
                                                            <History className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openEdit(item)}
                                                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                                                        title="Edit Item"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id, item.name)}
                                                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                                        title="Delete Item"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================
                MODAL 1: Add / Edit Item & Product
                ======================================================== */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#121214] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#161618]">
                            <div>
                                <h3 className="font-bold text-white text-base">
                                    {editingItem ? "Edit Item / Product" : "Add New Item / Product"}
                                </h3>
                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                    Define pricing, stock tracking and tax details
                                </p>
                            </div>
                            <button
                                onClick={() => setShowItemModal(false)}
                                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 overflow-y-auto flex-1">
                            {/* Type selector */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                                    Item Category *
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, type: "PRODUCT", trackStock: true }))}
                                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                                            form.type === "PRODUCT"
                                                ? "border-[#16acd4] bg-[#16acd4]/10 text-white"
                                                : "border-white/5 bg-[#09090b] text-zinc-400 hover:border-white/20"
                                        }`}
                                    >
                                        <Package className={`w-4 h-4 mt-0.5 shrink-0 ${form.type === "PRODUCT" ? "text-[#16acd4]" : "text-zinc-500"}`} />
                                        <div>
                                            <div className="font-bold text-xs text-white">Physical Product</div>
                                            <div className="text-[10px] text-zinc-500 mt-0.5">Spare parts, rolls, fluids, coatings (tracks stock)</div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, type: "SERVICE", trackStock: false }))}
                                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                                            form.type === "SERVICE"
                                                ? "border-blue-400 bg-blue-500/10 text-white"
                                                : "border-white/5 bg-[#09090b] text-zinc-400 hover:border-white/20"
                                        }`}
                                    >
                                        <Layers className={`w-4 h-4 mt-0.5 shrink-0 ${form.type === "SERVICE" ? "text-blue-400" : "text-zinc-500"}`} />
                                        <div>
                                            <div className="font-bold text-xs text-white">Service / Labor</div>
                                            <div className="text-[10px] text-zinc-500 mt-0.5">Detailing, washing, polishing (no stock needed)</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                    Item / Product Name *
                                </label>
                                <input
                                    id="item-name-input"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder={form.type === "PRODUCT" ? "e.g. PPF Roll TPU Ultra Clear 15m" : "e.g. Full Body Ceramic 9H Coating"}
                                    className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3.5 py-2.5 rounded-lg outline-none focus:border-[#16acd4]/60 placeholder:text-zinc-700"
                                />
                            </div>

                            {/* SKU & HSN/SAC */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                        SKU / Part Number
                                    </label>
                                    <input
                                        value={form.sku}
                                        onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                                        placeholder="e.g. PPF-TPU-15M"
                                        className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/60 placeholder:text-zinc-700 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                        HSN / SAC Code
                                    </label>
                                    <input
                                        value={form.hsnSacCode}
                                        onChange={e => setForm(p => ({ ...p, hsnSacCode: e.target.value }))}
                                        placeholder="e.g. 39199090"
                                        className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/60 placeholder:text-zinc-700 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Prices */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                        Selling Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={form.price}
                                        onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/60 font-mono font-bold text-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                        Purchase Rate (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={form.purchasePrice}
                                        onChange={e => setForm(p => ({ ...p, purchasePrice: e.target.value }))}
                                        placeholder="Cost price (optional)"
                                        className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/60 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Tax Rate */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                    GST Rate (%)
                                </label>
                                <select
                                    value={form.taxRate}
                                    onChange={e => setForm(p => ({ ...p, taxRate: e.target.value }))}
                                    className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/60"
                                >
                                    {TAX_RATES.map(r => (
                                        <option key={r} value={r}>{r}% GST {r === 18 ? "(Standard)" : ""}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Stock Section (Only for Products) */}
                            {form.type === "PRODUCT" && (
                                <div className="bg-[#09090b] border border-white/10 rounded-xl p-3.5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Boxes className="w-3.5 h-3.5 text-[#16acd4]" />
                                            Inventory &amp; Stock Details
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2.5">
                                        <div>
                                            <label className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                                {editingItem ? "Current Stock" : "Opening Stock"}
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={form.stock}
                                                onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                                                className="w-full bg-[#121214] border border-white/10 text-emerald-400 text-xs px-2.5 py-1.5 rounded-lg font-mono font-bold outline-none focus:border-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                                Unit
                                            </label>
                                            <select
                                                value={form.unit}
                                                onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                                                className="w-full bg-[#121214] border border-white/10 text-white text-xs px-2 py-1.5 rounded-lg outline-none focus:border-[#16acd4]/60"
                                            >
                                                {UNITS.map(u => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                                Low Alert At
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={form.minStockAlert}
                                                onChange={e => setForm(p => ({ ...p, minStockAlert: e.target.value }))}
                                                className="w-full bg-[#121214] border border-white/10 text-amber-400 text-xs px-2.5 py-1.5 rounded-lg font-mono outline-none focus:border-amber-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                    Description / Warranty / Specifications
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    rows={2}
                                    placeholder="e.g. 5 Years Warranty TPU film, Self healing finish"
                                    className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/60 resize-none placeholder:text-zinc-700"
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 bg-[#161618] flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowItemModal(false)}
                                className="px-4 py-2 rounded-lg border border-white/10 text-zinc-400 text-xs font-bold hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={handleSaveItem}
                                className="px-5 py-2 bg-[#16acd4] hover:bg-white text-black font-bold uppercase tracking-wider text-xs rounded-lg transition-colors flex items-center gap-2"
                            >
                                {saving ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
                MODAL 2: Quick Restock / Add Stock
                ======================================================== */}
            {showRestockModal && restockItem && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#121214] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#161618]">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                    <Boxes className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Add / Adjust Stock</h3>
                                    <p className="text-[11px] text-zinc-400 truncate max-w-[240px]">{restockItem.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowRestockModal(false)}
                                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Stock change preview banner */}
                            <div className="bg-[#09090b] border border-white/10 rounded-xl p-3 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Current Stock</span>
                                    <span className="text-sm font-mono font-bold text-zinc-300">
                                        {restockItem.stock} {restockItem.unit}
                                    </span>
                                </div>
                                <div className="text-zinc-600 font-bold">→</div>
                                <div className="text-right">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">New Stock Preview</span>
                                    <span className="text-base font-mono font-bold text-emerald-400">
                                        {Math.max(0, (restockItem.stock || 0) + (parseFloat(restockQty) || 0))} {restockItem.unit}
                                    </span>
                                </div>
                            </div>

                            {/* Adjustment type */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                    Reason / Operation
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRestockType("RESTOCK")
                                            if (parseFloat(restockQty) < 0) setRestockQty(String(Math.abs(parseFloat(restockQty))))
                                        }}
                                        className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                                            restockType === "RESTOCK"
                                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                                                : "border-white/5 bg-[#09090b] text-zinc-400 hover:border-white/10"
                                        }`}
                                    >
                                        + Restock
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRestockType("ADJUSTMENT")}
                                        className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                                            restockType === "ADJUSTMENT"
                                                ? "border-blue-400 bg-blue-500/10 text-blue-300"
                                                : "border-white/5 bg-[#09090b] text-zinc-400 hover:border-white/10"
                                        }`}
                                    >
                                        Adjustment
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRestockType("DAMAGE")
                                            const q = parseFloat(restockQty) || 1
                                            if (q > 0) setRestockQty(String(-Math.abs(q)))
                                        }}
                                        className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                                            restockType === "DAMAGE"
                                                ? "border-red-500 bg-red-500/10 text-red-300"
                                                : "border-white/5 bg-[#09090b] text-zinc-400 hover:border-white/10"
                                        }`}
                                    >
                                        - Damage
                                    </button>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                    Quantity ({restockItem.unit}) *
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={restockQty}
                                    onChange={e => setRestockQty(e.target.value)}
                                    placeholder="e.g. 10"
                                    className="w-full bg-[#09090b] border border-white/10 text-white text-base px-3.5 py-2.5 rounded-lg outline-none focus:border-emerald-500 font-mono font-bold"
                                />
                            </div>

                            {/* Purchase rate update */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                    Purchase Rate per {restockItem.unit} (₹)
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={restockRate}
                                    onChange={e => setRestockRate(e.target.value)}
                                    placeholder="Leave as is or update purchase cost"
                                    className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/60 font-mono"
                                />
                            </div>

                            {/* Supplier / Invoice Note */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                    Supplier Bill # / Note
                                </label>
                                <input
                                    value={restockNote}
                                    onChange={e => setRestockNote(e.target.value)}
                                    placeholder="e.g. Vendor Invoice #1042 / Received fresh lot"
                                    className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4]/60 placeholder:text-zinc-700"
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 bg-[#161618] flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowRestockModal(false)}
                                className="px-4 py-2 rounded-lg border border-white/10 text-zinc-400 text-xs font-bold hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={restocking}
                                onClick={handleRestockSubmit}
                                className="px-5 py-2 bg-emerald-500 hover:bg-white text-black font-bold uppercase tracking-wider text-xs rounded-lg transition-colors flex items-center gap-2"
                            >
                                {restocking ? "Saving..." : "Confirm & Update Stock"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
                MODAL 3: Stock History & Audit Logs
                ======================================================== */}
            {showHistoryModal && historyItem && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#121214] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#161618]">
                            <div>
                                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                    <History className="w-4 h-4 text-[#16acd4]" />
                                    Stock Audit History
                                </h3>
                                <p className="text-[11px] text-zinc-400 mt-0.5">{historyItem.name}</p>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 divide-y divide-white/5">
                            {loadingLogs ? (
                                <div className="p-8 text-center text-zinc-500 text-xs">
                                    Loading history logs...
                                </div>
                            ) : historyLogs.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-xs">
                                    No stock transaction logs recorded yet.
                                </div>
                            ) : (
                                historyLogs.map((log) => {
                                    const isPositive = log.quantity > 0
                                    return (
                                        <div key={log.id} className="py-3 flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-2.5">
                                                <div className={`p-1.5 rounded-lg mt-0.5 ${
                                                    isPositive
                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                        : "bg-red-500/10 text-red-400"
                                                }`}>
                                                    {isPositive ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-white block">
                                                        {log.type.replace("_", " ")}
                                                    </span>
                                                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                                                        {log.note || (isPositive ? "Stock Added" : "Stock Deducted")}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-600 block mt-0.5 font-mono">
                                                        {new Date(log.createdAt).toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className={`text-sm font-mono font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                                                    {isPositive ? `+${log.quantity}` : log.quantity} {historyItem.unit}
                                                </span>
                                                <span className="block text-[10px] text-zinc-500 mt-0.5">
                                                    Bal: {log.newStock} {historyItem.unit}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <div className="p-3.5 border-t border-white/10 bg-[#161618] text-right">
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
