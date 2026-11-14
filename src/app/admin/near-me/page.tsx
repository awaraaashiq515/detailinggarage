"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { NEAR_ME_CATEGORIES, POPULAR_CITIES } from "@/lib/near-me-categories"
import {
    MapPin,
    Plus,
    Search,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    ExternalLink,
    Phone,
    Shield,
    Star,
    Building2,
    RefreshCw
} from "lucide-react"

interface Listing {
    id: string
    name: string
    category: string
    categoryLabel?: string | null
    city: string
    area?: string | null
    address?: string | null
    phone: string
    whatsapp?: string | null
    mapsUrl?: string | null
    rating: number
    reviewsCount: number
    isVerified: boolean
    isActive: boolean
    services?: string | null
    createdAt: string
}

export default function AdminNearMePage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 })
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedCity, setSelectedCity] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")

    // Modal state
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        category: "garages",
        city: "Mandi",
        area: "",
        address: "",
        phone: "",
        whatsapp: "",
        mapsUrl: "",
        rating: "4.8",
        reviewsCount: "25",
        isVerified: true,
        isActive: true,
        services: ""
    })

    const fetchListings = () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (selectedCategory !== "all") params.set("category", selectedCategory)
        if (selectedCity !== "all") params.set("city", selectedCity)
        if (searchQuery.trim()) params.set("search", searchQuery.trim())

        fetch(`/api/admin/near-me?${params.toString()}`)
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    setListings(res.listings || [])
                    if (res.stats) setStats(res.stats)
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchListings()
    }, [selectedCategory, selectedCity])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        fetchListings()
    }

    const openAddModal = () => {
        setEditingId(null)
        setFormData({
            name: "",
            category: "garages",
            city: "Mandi",
            area: "",
            address: "",
            phone: "",
            whatsapp: "",
            mapsUrl: "",
            rating: "4.8",
            reviewsCount: "25",
            isVerified: true,
            isActive: true,
            services: ""
        })
        setModalOpen(true)
    }

    const openEditModal = (item: Listing) => {
        setEditingId(item.id)
        setFormData({
            name: item.name,
            category: item.category,
            city: item.city,
            area: item.area || "",
            address: item.address || "",
            phone: item.phone,
            whatsapp: item.whatsapp || "",
            mapsUrl: item.mapsUrl || "",
            rating: String(item.rating),
            reviewsCount: String(item.reviewsCount),
            isVerified: item.isVerified,
            isActive: item.isActive,
            services: item.services || ""
        })
        setModalOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.phone || !formData.category) {
            alert("Please fill in business name, category, and phone")
            return
        }

        setSaving(true)
        try {
            const url = editingId ? `/api/admin/near-me/${editingId}` : "/api/admin/near-me"
            const method = editingId ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                setModalOpen(false)
                fetchListings()
            } else {
                alert(data.error || "Failed to save listing")
            }
        } catch {
            alert("An error occurred while saving")
        } finally {
            setSaving(false)
        }
    }

    const toggleVerified = async (item: Listing) => {
        try {
            const res = await fetch(`/api/admin/near-me/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVerified: !item.isVerified })
            })
            const data = await res.json()
            if (data.success) {
                setListings(prev => prev.map(l => l.id === item.id ? { ...l, isVerified: !item.isVerified } : l))
                setStats(s => ({
                    ...s,
                    verified: item.isVerified ? s.verified - 1 : s.verified + 1,
                    pending: item.isVerified ? s.pending + 1 : s.pending - 1
                }))
            }
        } catch {
            alert("Failed to toggle verification status")
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return
        try {
            const res = await fetch(`/api/admin/near-me/${id}`, { method: "DELETE" })
            const data = await res.json()
            if (data.success) {
                fetchListings()
            } else {
                alert("Failed to delete listing")
            }
        } catch {
            alert("Error deleting listing")
        }
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#07090b] text-[#eef4f6] font-sans antialiased">
            {/* Header */}
            <header className="border-b border-[#1a2328] bg-[#0a1317]/80 backdrop-blur-md px-6 py-5 sticky top-0 z-30 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#16acd4]/15 border border-[#16acd4]/30 flex items-center justify-center text-[#16acd4]">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-display">
                                    Near Me Directory
                                </h1>
                                <p className="text-xs text-zinc-400">
                                    Manage verified automotive workshops, garages, towing &amp; auto services
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/near-me"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-colors"
                        >
                            View Live Page <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#16acd4] hover:bg-[#1499bd] text-[#07090b] text-xs font-extrabold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(22,172,212,0.3)] transition-all"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" /> Add Listing
                        </button>
                    </div>
                </header>

                <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
                    {/* Stats Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-[#0a1317] border border-[#1a2328] rounded-xl p-4">
                            <span className="text-xs text-zinc-400 block font-mono uppercase tracking-wider">Total Listings</span>
                            <span className="text-2xl font-black text-white font-mono mt-1 block">{stats.total}</span>
                        </div>
                        <div className="bg-[#0a1317] border border-[#1a2328] rounded-xl p-4">
                            <span className="text-xs text-emerald-400 block font-mono uppercase tracking-wider">Verified Partners</span>
                            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">{stats.verified}</span>
                        </div>
                        <div className="bg-[#0a1317] border border-[#1a2328] rounded-xl p-4">
                            <span className="text-xs text-amber-400 block font-mono uppercase tracking-wider">Pending Review</span>
                            <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">{stats.pending}</span>
                        </div>
                        <div className="bg-[#0a1317] border border-[#1a2328] rounded-xl p-4">
                            <span className="text-xs text-[#16acd4] block font-mono uppercase tracking-wider">Categories</span>
                            <span className="text-2xl font-black text-[#16acd4] font-mono mt-1 block">{NEAR_ME_CATEGORIES.length}</span>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-[#0a1317] border border-[#1a2328] rounded-xl p-4 flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
                            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by name, area, phone, service..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#16acd4]"
                            />
                        </form>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="bg-[#07090b] border border-[#1a2328] text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#16acd4]"
                        >
                            <option value="all">All Categories</option>
                            {NEAR_ME_CATEGORIES.map(c => (
                                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                            ))}
                        </select>

                        {/* City Filter */}
                        <select
                            value={selectedCity}
                            onChange={e => setSelectedCity(e.target.value)}
                            className="bg-[#07090b] border border-[#1a2328] text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#16acd4]"
                        >
                            <option value="all">All Cities</option>
                            {POPULAR_CITIES.filter(c => c !== "All cities").map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <button
                            onClick={fetchListings}
                            title="Refresh Listings"
                            className="p-2 border border-[#1a2328] hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Listings Table / Cards */}
                    <div className="bg-[#0a1317] border border-[#1a2328] rounded-xl overflow-hidden">
                        {loading ? (
                            <div className="py-16 text-center text-zinc-500 text-sm">
                                Loading directory listings...
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="py-16 text-center text-zinc-500 text-sm space-y-3">
                                <p>No listings found matching your filters.</p>
                                <button
                                    onClick={openAddModal}
                                    className="px-4 py-2 bg-[#16acd4]/15 border border-[#16acd4]/30 text-[#16acd4] rounded-lg text-xs font-bold hover:bg-[#16acd4]/25"
                                >
                                    + Add First Listing
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#07090b] border-b border-[#1a2328] text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4">Business / Workshop</th>
                                            <th className="py-3 px-4">Category</th>
                                            <th className="py-3 px-4">Location</th>
                                            <th className="py-3 px-4">Phone / WhatsApp</th>
                                            <th className="py-3 px-4">Rating</th>
                                            <th className="py-3 px-4">Verified</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1a2328] text-zinc-300">
                                        {listings.map(item => {
                                            const cat = NEAR_ME_CATEGORIES.find(c => c.id === item.category)
                                            return (
                                                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3.5 px-4 font-semibold text-white">
                                                        <div className="font-bold text-sm text-zinc-100">{item.name}</div>
                                                        {item.services && (
                                                            <div className="text-[11px] text-zinc-500 line-clamp-1 max-w-xs mt-0.5">
                                                                {item.services}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[11px]">
                                                            <span>{cat?.emoji || "🚗"}</span>
                                                            <span className="truncate max-w-[130px]">{cat?.label || item.category}</span>
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-medium text-zinc-200">{item.city}</div>
                                                        {item.area && (
                                                            <div className="text-[11px] text-zinc-500">{item.area}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono text-[11px]">
                                                        <div>{item.phone}</div>
                                                        {item.whatsapp && (
                                                            <div className="text-emerald-400">WA: {item.whatsapp}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                            <span>{item.rating.toFixed(1)}</span>
                                                        </div>
                                                        <span className="text-[10px] text-zinc-500">({item.reviewsCount} rev)</span>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <button
                                                            onClick={() => toggleVerified(item)}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                                                item.isVerified
                                                                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                                                                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                                                            }`}
                                                        >
                                                            {item.isVerified ? (
                                                                <>
                                                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle className="w-3 h-3" /> Unverified
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right space-x-2">
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="p-1.5 rounded-lg border border-white/10 hover:border-[#16acd4] text-zinc-400 hover:text-[#16acd4] transition-colors"
                                                            title="Edit Listing"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id, item.name)}
                                                            className="p-1.5 rounded-lg border border-white/10 hover:border-red-500 text-zinc-400 hover:text-red-400 transition-colors"
                                                            title="Delete Listing"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>

            {/* ─── Modal: Add / Edit Listing ────────────────────────────────────── */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="bg-[#0c1215] border border-[#16acd4]/30 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl shadow-cyan-950/40"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-[#1a2328]">
                            <h2 className="text-lg font-bold text-white uppercase tracking-tight font-display">
                                {editingId ? "Edit Business Listing" : "Add Business Listing"}
                            </h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-zinc-400 hover:text-white text-lg font-mono"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
                            <div>
                                <label className="block text-zinc-400 font-mono uppercase mb-1">
                                    Business / Workshop Name *
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. High Range Auto Garage"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-zinc-400 font-mono uppercase mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-[#16acd4]"
                                    >
                                        {NEAR_ME_CATEGORIES.map(c => (
                                            <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-zinc-400 font-mono uppercase mb-1">
                                        City *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Mandi, Kullu..."
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-zinc-400 font-mono uppercase mb-1">
                                        Area / Landmark
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Gutkar, NH-21"
                                        value={formData.area}
                                        onChange={e => setFormData({ ...formData, area: e.target.value })}
                                        className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-[#16acd4]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 font-mono uppercase mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+91 98160 xxxxx"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-zinc-400 font-mono uppercase mb-1">
                                        WhatsApp Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="918679400014"
                                        value={formData.whatsapp}
                                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-[#16acd4]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 font-mono uppercase mb-1">
                                        Google Maps Link
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://maps.app.goo.gl/..."
                                        value={formData.mapsUrl}
                                        onChange={e => setFormData({ ...formData, mapsUrl: e.target.value })}
                                        className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-zinc-400 font-mono uppercase mb-1">
                                        Rating (1.0 to 5.0)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        max="5"
                                        value={formData.rating}
                                        onChange={e => setFormData({ ...formData, rating: e.target.value })}
                                        className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-[#16acd4]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 font-mono uppercase mb-1">
                                        Reviews Count
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.reviewsCount}
                                        onChange={e => setFormData({ ...formData, reviewsCount: e.target.value })}
                                        className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-zinc-400 font-mono uppercase mb-1">
                                    Services / Notes
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Periodic Service, Foam Wash, Wheel Alignment, AC Refill..."
                                    value={formData.services}
                                    onChange={e => setFormData({ ...formData, services: e.target.value })}
                                    className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer text-zinc-200">
                                    <input
                                        type="checkbox"
                                        checked={formData.isVerified}
                                        onChange={e => setFormData({ ...formData, isVerified: e.target.checked })}
                                        className="rounded border-[#1a2328] text-[#16acd4] focus:ring-0"
                                    />
                                    <span>Verified Partner (Green Badge)</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer text-zinc-200">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded border-[#1a2328] text-[#16acd4] focus:ring-0"
                                    />
                                    <span>Active (Visible on public site)</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-[#1a2328]">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 border border-white/10 text-zinc-400 hover:text-white rounded-lg text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-[#16acd4] hover:bg-[#1499bd] text-[#07090b] font-bold uppercase rounded-lg text-xs"
                                >
                                    {saving ? "Saving..." : editingId ? "Update Listing" : "Create Listing"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

