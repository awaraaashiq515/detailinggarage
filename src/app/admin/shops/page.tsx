"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Store, Plus, Search, MoreVertical, Edit2, Trash2,
    CheckCircle, XCircle, Users, FileText, TrendingUp,
    Phone, Mail, MapPin, Building2, Shield, Eye, RefreshCw,
    ChevronRight, AlertTriangle, X, Save, Loader2, Copy, Check
} from "lucide-react"

interface Shop {
    id: string
    name: string
    phone?: string
    email?: string
    address?: string
    city?: string
    state?: string
    gstin?: string
    status: string
    createdAt: string
    owner: {
        id: string
        name: string
        email: string
        mobile?: string
        status: string
        createdAt: string
    }
    _count: { clients: number; invoices: number }
}

// ─── Modal: Create New Shop ──────────────────────────────────────────────────
function CreateShopModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [form, setForm] = useState({
        ownerName: "", ownerEmail: "", ownerMobile: "", ownerPassword: "",
        shopName: "", phone: "", email: "", address: "", city: "", state: "", gstin: ""
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [copied, setCopied] = useState(false)

    const randomPass = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#"
        return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    }

    const generatePassword = () => {
        const p = randomPass()
        setForm(f => ({ ...f, ownerPassword: p }))
    }

    const copyPassword = () => {
        navigator.clipboard.writeText(form.ownerPassword)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const res = await fetch("/api/admin/shops", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to create shop")
            onCreated()
            onClose()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
            <div className="w-full max-w-2xl rounded-2xl border border-white/10 overflow-hidden" style={{ background: "#111113" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-white/8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#16acd4]/15 flex items-center justify-center">
                            <Store className="w-5 h-5 text-[#16acd4]" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-base">Create New Shop</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">User account + shop will be created together</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/8 text-zinc-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-7 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Owner Account */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 rounded-full bg-[#16acd4]" />
                            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Owner Account</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Full Name *</label>
                                <input
                                    required
                                    value={form.ownerName}
                                    onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
                                    placeholder="Rahul Sharma"
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 border border-white/8 focus:border-[#16acd4]/50 focus:outline-none transition-colors"
                                    style={{ background: "#1a1a1d" }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Mobile</label>
                                <input
                                    value={form.ownerMobile}
                                    onChange={e => setForm(f => ({ ...f, ownerMobile: e.target.value }))}
                                    placeholder="9876543210"
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 border border-white/8 focus:border-[#16acd4]/50 focus:outline-none transition-colors"
                                    style={{ background: "#1a1a1d" }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Email (Login) *</label>
                                <input
                                    required type="email"
                                    value={form.ownerEmail}
                                    onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))}
                                    placeholder="rahul@motors.com"
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 border border-white/8 focus:border-[#16acd4]/50 focus:outline-none transition-colors"
                                    style={{ background: "#1a1a1d" }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Password *</label>
                                <div className="flex gap-2">
                                    <input
                                        required
                                        value={form.ownerPassword}
                                        onChange={e => setForm(f => ({ ...f, ownerPassword: e.target.value }))}
                                        placeholder="••••••••••••"
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white font-mono placeholder:text-zinc-600 border border-white/8 focus:border-[#16acd4]/50 focus:outline-none transition-colors"
                                        style={{ background: "#1a1a1d" }}
                                    />
                                    <button type="button" onClick={generatePassword} title="Generate"
                                        className="px-3 py-2.5 rounded-xl text-xs bg-white/8 hover:bg-white/12 text-zinc-400 hover:text-white border border-white/8 transition-all flex items-center gap-1">
                                        <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                    {form.ownerPassword && (
                                        <button type="button" onClick={copyPassword} title="Copy"
                                            className="px-3 py-2.5 rounded-xl text-xs bg-white/8 hover:bg-white/12 border border-white/8 transition-all flex items-center gap-1 text-zinc-400 hover:text-white">
                                            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shop Details */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 rounded-full bg-amber-400" />
                            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Shop Details</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Shop Name *</label>
                                <input
                                    required
                                    value={form.shopName}
                                    onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
                                    placeholder="Al Motors & Detailing"
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 border border-white/8 focus:border-amber-400/50 focus:outline-none transition-colors"
                                    style={{ background: "#1a1a1d" }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Shop Phone</label>
                                <input
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="011-XXXXXXXX"
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 border border-white/8 focus:border-amber-400/50 focus:outline-none transition-colors"
                                    style={{ background: "#1a1a1d" }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Shop Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="info@almotors.com"
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 border border-white/8 focus:border-amber-400/50 focus:outline-none transition-colors"
                                    style={{ background: "#1a1a1d" }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">City</label>
                                <input
                                    value={form.city}
                                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                    placeholder="New Delhi"
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 border border-white/8 focus:border-amber-400/50 focus:outline-none transition-colors"
                                    style={{ background: "#1a1a1d" }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">State</label>
                                <input
                                    value={form.state}
                                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                                    placeholder="07-Delhi"
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 border border-white/8 focus:border-amber-400/50 focus:outline-none transition-colors"
                                    style={{ background: "#1a1a1d" }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">GSTIN</label>
                                <input
                                    value={form.gstin}
                                    onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))}
                                    placeholder="07AAAAA0000A1Z5"
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 border border-white/8 focus:border-amber-400/50 focus:outline-none transition-colors"
                                    style={{ background: "#1a1a1d" }}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Address</label>
                                <input
                                    value={form.address}
                                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                    placeholder="Shop No. 12, Main Market, Sector 15"
                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 border border-white/8 focus:border-amber-400/50 focus:outline-none transition-colors"
                                    style={{ background: "#1a1a1d" }}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-5 py-3 rounded-xl text-sm font-bold text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 px-5 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                            style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
                            {loading ? "Creating..." : "Create Shop"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Shop Card ────────────────────────────────────────────────────────────────
function ShopCard({ shop, onRefresh }: { shop: Shop; onRefresh: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const toggleStatus = async () => {
        setLoading(true)
        setMenuOpen(false)
        try {
            const newStatus = shop.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
            await fetch("/api/admin/shops", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: shop.id, status: newStatus })
            })
            onRefresh()
        } finally {
            setLoading(false)
        }
    }

    const deleteShop = async () => {
        if (!confirm(`Delete "${shop.name}" and owner account? This cannot be undone.`)) return
        setLoading(true)
        setMenuOpen(false)
        try {
            await fetch(`/api/admin/shops?id=${shop.id}`, { method: "DELETE" })
            onRefresh()
        } finally {
            setLoading(false)
        }
    }

    const isActive = shop.status === "ACTIVE"

    return (
        <div className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${isActive ? "border-white/8 hover:border-white/15" : "border-red-500/20 opacity-75"}`}
            style={{ background: "#111113" }}>

            {/* Status stripe */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${isActive ? "bg-gradient-to-r from-[#16acd4] to-transparent" : "bg-gradient-to-r from-red-500 to-transparent"}`} />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg ${isActive ? "bg-[#16acd4]/15 text-[#16acd4]" : "bg-red-500/15 text-red-400"}`}>
                            {shop.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base leading-tight">{shop.name}</h3>
                            <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${isActive ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>
                                {isActive ? <CheckCircle className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                                {shop.status}
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <button onClick={() => setMenuOpen(v => !v)} disabled={loading}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/8 text-zinc-500 hover:text-white transition-colors">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-10 z-20 rounded-xl border border-white/10 shadow-2xl overflow-hidden w-44"
                                style={{ background: "#1a1a1d" }}>
                                <button onClick={toggleStatus}
                                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-white/8 transition-colors text-left"
                                    style={{ color: isActive ? "#f87171" : "#34d399" }}>
                                    {isActive ? <><XCircle className="w-4 h-4" />Suspend Shop</> : <><CheckCircle className="w-4 h-4" />Reactivate</>}
                                </button>
                                <div className="h-px bg-white/8" />
                                <button onClick={deleteShop}
                                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left">
                                    <Trash2 className="w-4 h-4" />Delete Shop
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Owner Info */}
                <div className="mb-4 px-3 py-2.5 rounded-xl border border-white/6" style={{ background: "#0d0d0f" }}>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1.5 font-bold">Owner</p>
                    <p className="text-sm font-bold text-white">{shop.owner.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{shop.owner.email}</p>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-5">
                    {shop.phone && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Phone className="w-3 h-3 text-zinc-600" /> {shop.phone}
                        </div>
                    )}
                    {shop.city && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <MapPin className="w-3 h-3 text-zinc-600" /> {shop.city}{shop.state ? `, ${shop.state}` : ""}
                        </div>
                    )}
                    {shop.gstin && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Building2 className="w-3 h-3 text-zinc-600" /> GST: {shop.gstin}
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl px-3 py-2.5 text-center border border-white/6" style={{ background: "#0d0d0f" }}>
                        <p className="text-lg font-bold text-white">{shop._count.clients}</p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">Clients</p>
                    </div>
                    <div className="rounded-xl px-3 py-2.5 text-center border border-white/6" style={{ background: "#0d0d0f" }}>
                        <p className="text-lg font-bold text-white">{shop._count.invoices}</p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">Invoices</p>
                    </div>
                </div>

                {/* Footer: Created date */}
                <p className="text-[10px] text-zinc-700 mt-4">
                    Created {new Date(shop.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminShopsPage() {
    const [shops, setShops] = useState<Shop[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [showCreate, setShowCreate] = useState(false)

    const fetchShops = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/shops")
            const data = await res.json()
            if (data.success) setShops(data.shops)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchShops() }, [fetchShops])

    const filtered = shops.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.owner.name.toLowerCase().includes(search.toLowerCase()) ||
        s.owner.email.toLowerCase().includes(search.toLowerCase())
    )

    const activeCount = shops.filter(s => s.status === "ACTIVE").length
    const totalClients = shops.reduce((s, sh) => s + sh._count.clients, 0)
    const totalInvoices = shops.reduce((s, sh) => s + sh._count.invoices, 0)

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Admin</span>
                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Shops</span>
                    </div>
                    <h1 className="text-2xl font-black text-white">Shop Management</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage workshop accounts & their billing access</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-lg"
                    style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}>
                    <Plus className="w-4 h-4" />
                    New Shop
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Shops", value: shops.length, icon: Store, color: "#16acd4" },
                    { label: "Active", value: activeCount, icon: CheckCircle, color: "#34d399" },
                    { label: "Total Clients", value: totalClients, icon: Users, color: "#a78bfa" },
                    { label: "Total Invoices", value: totalInvoices, icon: FileText, color: "#fb923c" },
                ].map(stat => (
                    <div key={stat.label} className="rounded-2xl border border-white/8 p-5 flex items-center gap-4" style={{ background: "#111113" }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.color + "18" }}>
                            <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by shop name or owner..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-zinc-600 border border-white/8 focus:border-[#16acd4]/40 focus:outline-none transition-colors"
                        style={{ background: "#111113" }}
                    />
                </div>
                <button onClick={fetchShops} className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/8 hover:border-white/15 text-zinc-500 hover:text-white transition-all" style={{ background: "#111113" }}>
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#16acd4]" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                        <Store className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-white font-bold text-lg">No shops yet</p>
                    <p className="text-zinc-500 text-sm mt-1">Click "New Shop" to add a workshop account</p>
                    <button onClick={() => setShowCreate(true)}
                        className="mt-6 px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2"
                        style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}>
                        <Plus className="w-4 h-4" /> Create First Shop
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(shop => (
                        <ShopCard key={shop.id} shop={shop} onRefresh={fetchShops} />
                    ))}
                </div>
            )}

            {showCreate && (
                <CreateShopModal
                    onClose={() => setShowCreate(false)}
                    onCreated={fetchShops}
                />
            )}
        </div>
    )
}
