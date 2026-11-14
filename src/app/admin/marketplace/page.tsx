"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Package,
  RefreshCw,
  ExternalLink,
  Search,
  AlertTriangle,
  Tag,
  ImageIcon,
  Store,
  MapPin,
  Check,
  Eye,
  EyeOff
} from "lucide-react"
import Link from "next/link"

const CATEGORIES = [
  { id: "coatings", label: "Coatings & care", icon: "✨" },
  { id: "floor-mats", label: "Floor mats", icon: "🟫" },
  { id: "accessories", label: "Accessories", icon: "🔩" },
  { id: "4x4", label: "4x4 & off-road", icon: "🏔️" },
  { id: "audio", label: "Audio & dash cams", icon: "🎵" },
  { id: "spare-parts", label: "Spare parts", icon: "⚙️" },
  { id: "engine", label: "Engine & service parts", icon: "🔨" },
  { id: "body", label: "Body parts", icon: "🚙" },
  { id: "tyres", label: "Tyres & batteries", icon: "🔄" },
  { id: "detailing-tools", label: "Detailing tools", icon: "🧹" },
  { id: "services", label: "Services", icon: "🛠️" },
]

const CITIES = [
  "All cities",
  "Chandigarh",
  "Panchkula",
  "Mohali",
  "Mandi",
  "Sundernagar",
  "Shimla",
  "Kullu",
  "Manali",
  "Dharamshala",
  "Kangra",
  "Dehradun"
]

const EMPTY_FORM = {
  title: "",
  seller: "Detailing Garage HQ",
  category: "coatings",
  description: "",
  price: "Price on request",
  imageUrl: "",
  city: "Chandigarh",
  isActive: true,
}

interface Listing {
  id: string
  title: string
  seller: string
  category: string
  description: string | null
  price: string | null
  imageUrl: string | null
  city: string | null
  isActive: boolean
  createdAt: string
}

export default function AdminMarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0 })
  const [loading, setLoading] = useState(true)

  // Modals & States
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Listing | null>(null)
  const [deletingItem, setDeletingItem] = useState<Listing | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Filters
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterCity, setFilterCity] = useState("All cities")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [search, setSearch] = useState("")

  const showToastMsg = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCategory !== "all") params.set("category", filterCategory)
      if (search.trim()) params.set("search", search.trim())

      const res = await fetch(`/api/admin/marketplace?${params}`)
      const data = await res.json()
      if (data.success && data.listings) {
        setListings(data.listings)
        if (data.stats) setStats(data.stats)
      }
    } catch (err) {
      console.error("Fetch marketplace error:", err)
    } finally {
      setLoading(false)
    }
  }, [filterCategory, search])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setErrorMsg(null)
    setShowModal(true)
  }

  const openEdit = (item: Listing) => {
    setEditing(item)
    setForm({
      title: item.title,
      seller: item.seller,
      category: item.category,
      description: item.description || "",
      price: item.price || "Price on request",
      imageUrl: item.imageUrl || "",
      city: item.city || "Chandigarh",
      isActive: item.isActive,
    })
    setErrorMsg(null)
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.seller.trim()) {
      setErrorMsg("Product title and seller/brand name are required.")
      return
    }

    setSaving(true)
    setErrorMsg(null)
    try {
      const url = editing ? `/api/admin/marketplace/${editing.id}` : "/api/admin/marketplace"
      const method = editing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (data.success) {
        setShowModal(false)
        showToastMsg(editing ? "Listing updated successfully!" : "New listing added successfully!")
        fetchListings()
      } else {
        setErrorMsg(data.error || "Failed to save listing.")
      }
    } catch {
      setErrorMsg("An unexpected error occurred while saving.")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (item: Listing) => {
    const nextState = !item.isActive
    try {
      // Optimistic update
      setListings(prev => prev.map(l => (l.id === item.id ? { ...l, isActive: nextState } : l)))
      setStats(prev => ({
        ...prev,
        active: nextState ? prev.active + 1 : prev.active - 1,
      }))

      const res = await fetch(`/api/admin/marketplace/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      })
      const data = await res.json()
      if (!data.success) {
        // Rollback
        fetchListings()
        alert("Failed to update status")
      } else {
        showToastMsg(`Listing is now ${nextState ? "Active" : "Inactive"}`)
      }
    } catch {
      fetchListings()
    }
  }

  const confirmDelete = async () => {
    if (!deletingItem) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/marketplace/${deletingItem.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        showToastMsg(`"${deletingItem.title}" has been deleted`)
        setDeletingItem(null)
        fetchListings()
      } else {
        alert(data.error || "Failed to delete listing")
      }
    } catch {
      alert("Error deleting listing")
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter in memory for city and status if needed
  const displayedListings = listings.filter(item => {
    if (filterCity !== "All cities" && item.city && item.city.toLowerCase() !== filterCity.toLowerCase()) {
      return false
    }
    if (filterStatus === "active" && !item.isActive) return false
    if (filterStatus === "inactive" && item.isActive) return false
    return true
  })

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#07090b] text-[#eef4f6] font-sans antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#16acd4] text-[#07090b] font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_10px_30px_rgba(22,172,212,0.4)] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[#1a2328] bg-[#0a1317]/80 backdrop-blur-md px-6 py-5 sticky top-0 z-30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#16acd4]/15 border border-[#16acd4]/30 flex items-center justify-center text-[#16acd4]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-display">
                Marketplace Management
              </h1>
              <p className="text-xs text-zinc-400">
                Add, edit, remove &amp; manage products, parts, car accessories and services
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/marketplace"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-colors"
          >
            View Live Page <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#16acd4] hover:bg-[#1499bd] text-[#07090b] text-xs font-extrabold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(22,172,212,0.3)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Product / Listing
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0a1317] border border-[#1a2328] rounded-xl p-4">
            <span className="text-xs text-zinc-400 block font-mono uppercase tracking-wider">Total Listings</span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">{stats.total}</span>
          </div>
          <div className="bg-[#0a1317] border border-[#1a2328] rounded-xl p-4">
            <span className="text-xs text-emerald-400 block font-mono uppercase tracking-wider">Active Products</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">{stats.active}</span>
          </div>
          <div className="bg-[#0a1317] border border-[#1a2328] rounded-xl p-4">
            <span className="text-xs text-amber-400 block font-mono uppercase tracking-wider">Inactive Products</span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">{stats.total - stats.active}</span>
          </div>
          <div className="bg-[#0a1317] border border-[#1a2328] rounded-xl p-4">
            <span className="text-xs text-[#16acd4] block font-mono uppercase tracking-wider">Categories</span>
            <span className="text-2xl font-black text-[#16acd4] font-mono mt-1 block">{CATEGORIES.length}</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-[#0a1317] border border-[#1a2328] rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 flex items-center gap-2 bg-[#07090b] border border-[#1a2328] rounded-lg px-3 py-2 text-sm focus-within:border-[#16acd4]">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              type="text"
              placeholder="Search product title, seller, brand, description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-zinc-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-[#07090b] border border-[#1a2328] text-zinc-300 text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4] cursor-pointer"
            >
              <option value="all">All Categories ({CATEGORIES.length})</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>

            <select
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="bg-[#07090b] border border-[#1a2328] text-zinc-300 text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4] cursor-pointer"
            >
              {CITIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="bg-[#07090b] border border-[#1a2328] text-zinc-300 text-xs px-3 py-2 rounded-lg outline-none focus:border-[#16acd4] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button
              onClick={fetchListings}
              className="p-2 border border-[#1a2328] hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
              title="Refresh listings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#16acd4]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-[#0a1317] border border-[#1a2328] rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090b] text-zinc-400 uppercase font-mono tracking-wider text-[11px] border-b border-[#1a2328]">
                <tr>
                  <th className="px-5 py-3.5">Product &amp; Description</th>
                  <th className="px-4 py-3.5">Seller / Brand</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">City</th>
                  <th className="px-4 py-3.5">Live Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2328]/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-zinc-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#16acd4]" />
                      <span>Loading marketplace listings...</span>
                    </td>
                  </tr>
                ) : displayedListings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <Package className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                      <p className="text-zinc-400 font-semibold text-sm">No marketplace listings found</p>
                      <p className="text-zinc-600 text-xs mt-1">
                        Try clearing search filters or click &quot;+ Add Product / Listing&quot; to create one.
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayedListings.map(item => {
                    const catObj = CATEGORIES.find(c => c.id === item.category)
                    return (
                      <tr key={item.id} className="hover:bg-[#0e171b] transition-colors group">
                        {/* Title & Description with Thumbnail */}
                        <td className="px-5 py-4 max-w-xs sm:max-w-md">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-[#07090b] border border-[#1a2328] flex items-center justify-center shrink-0 overflow-hidden text-xl">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={e => {
                                    ;(e.currentTarget as HTMLElement).style.display = "none"
                                  }}
                                />
                              ) : (
                                <span>{catObj?.icon || "📦"}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-white text-sm uppercase tracking-tight group-hover:text-[#16acd4] transition-colors line-clamp-1">
                                {item.title}
                              </p>
                              <p className="text-zinc-400 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                                {item.description || "No description provided."}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Seller */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-zinc-500" />
                            {item.seller}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#16acd4]/10 border border-[#16acd4]/20 text-[#16acd4] font-semibold text-[11px]">
                            <span>{catObj?.icon || "📦"}</span>
                            <span>{catObj?.label || item.category}</span>
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/20">
                            {item.price || "Price on request"}
                          </span>
                        </td>

                        {/* City */}
                        <td className="px-4 py-4 whitespace-nowrap text-zinc-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                            {item.city || "All regions"}
                          </span>
                        </td>

                        {/* Live Toggle */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleActive(item)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                              item.isActive
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                            }`}
                            title="Click to toggle active status"
                          >
                            {item.isActive ? (
                              <>
                                <Eye className="w-3 h-3 text-emerald-400" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-zinc-500" />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 rounded-lg border border-[#1a2328] hover:border-[#16acd4]/50 bg-[#07090b] text-zinc-400 hover:text-[#16acd4] transition-colors"
                              title="Edit Listing"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingItem(item)}
                              className="p-1.5 rounded-lg border border-[#1a2328] hover:border-red-500/50 bg-[#07090b] text-zinc-400 hover:text-red-400 transition-colors"
                              title="Delete Listing"
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
      </main>

      {/* Add / Edit Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0a1317] border border-[#1a2328] shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#16acd4]/15 border border-[#16acd4]/30 flex items-center justify-center text-[#16acd4]">
                {editing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5 stroke-[3]" />}
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white font-display">
                  {editing ? "Edit Product / Listing" : "Add New Product"}
                </h2>
                <p className="text-xs text-zinc-400">
                  Fill in the product details to publish or update on DG Marketplace
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                  Product / Service Title <span className="text-[#16acd4]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceramic Coating Package (Multi-layer)"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                />
              </div>

              {/* Seller & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                    Seller / Brand <span className="text-[#16acd4]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Detailing Garage HQ, GFX Mats"
                    value={form.seller}
                    onChange={e => setForm(f => ({ ...f, seller: e.target.value }))}
                    className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#16acd4] cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">Price</label>
                  <input
                    type="text"
                    placeholder="e.g. Price on request or ₹9,999"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">Location / City</label>
                  <select
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#16acd4] cursor-pointer"
                  >
                    {CITIES.filter(c => c !== "All cities").map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">Image URL (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... image address"
                    value={form.imageUrl}
                    onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                  />
                  {form.imageUrl && (
                    <div className="w-9 h-9 rounded bg-[#07090b] border border-[#1a2328] overflow-hidden shrink-0">
                      <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed specifications, features, warranty terms or compatibility info..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="p-3 bg-[#07090b] border border-[#1a2328] rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Publish Immediately</p>
                  <p className="text-[11px] text-zinc-500">Visible to all visitors on the marketplace page</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.isActive ? "bg-[#16acd4]" : "bg-zinc-800"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a2328]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-white/10 hover:bg-white/5 text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#16acd4] hover:bg-[#1499bd] text-[#07090b] text-xs font-extrabold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(22,172,212,0.3)] transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : editing ? (
                    "Save Changes"
                  ) : (
                    "Create Listing"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0a1317] border border-red-900/40 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center justify-center text-red-400 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black uppercase text-center text-white tracking-tight mb-2">
              Delete Product Listing?
            </h3>
            <p className="text-xs text-zinc-400 text-center leading-relaxed mb-6">
              Are you sure you want to delete <span className="text-white font-bold">&quot;{deletingItem.title}&quot;</span>?
              This will remove the product permanently from the public marketplace.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-lg border border-white/10 hover:bg-white/5 text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
