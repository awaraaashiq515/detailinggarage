"use client"

import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Search, ShoppingCart, ChevronDown, X, Package, CheckCircle, Loader2 } from "lucide-react"

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "coatings", label: "Coatings & care" },
  { id: "floor-mats", label: "Floor mats" },
  { id: "accessories", label: "Accessories" },
  { id: "4x4", label: "4x4 & off-road" },
  { id: "audio", label: "Audio & dash cams" },
  { id: "spare-parts", label: "Spare parts" },
  { id: "engine", label: "Engine & service parts" },
  { id: "body", label: "Body parts" },
  { id: "tyres", label: "Tyres & batteries" },
  { id: "detailing-tools", label: "Detailing tools" },
  { id: "services", label: "Services" },
]

const CITIES = ["All cities", "Chandigarh", "Panchkula", "Mohali", "Mandi", "Shimla", "Kullu", "Dharamshala", "Dehradun"]

const SECTION_TABS = [
  { id: "parts", label: "Parts, accessories & products", icon: "🔧" },
  { id: "used-cars", label: "Used cars", icon: "🚗" },
  { id: "sellers", label: "Sellers & distributors", icon: "🏪" },
]

const BUSINESS_TYPES = [
  { icon: "🔧", title: "Garage / wash / detailing centre", desc: "List your workshop on Near Me & get customers" },
  { icon: "🚛", title: "Towing truck operator", desc: "Flatbed, wheel-lift & crane operators for our 24×7 network" },
  { icon: "🚨", title: "RSA / mobile mechanic", desc: "Battery, puncture, fuel, lockout & on-spot repair partners" },
  { icon: "⚙️", title: "Spare parts, accessories & scrap dealer", desc: "Retailers, distributors, OEM parts, tyres, lubricants, kabadi/recyclers" },
  { icon: "🚗", title: "Used car dealer", desc: "Use our used-car software, PDI & listings" },
]

const CATEGORY_ICONS: Record<string, string> = {
  audio: "🎵",
  coatings: "✨",
  "floor-mats": "🟫",
  accessories: "🔩",
  "4x4": "🏔️",
  "spare-parts": "⚙️",
  engine: "🔨",
  body: "🚙",
  tyres: "🔄",
  "detailing-tools": "🧹",
  services: "🛠️",
  default: "📦",
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
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("parts")
  const [selectedCity, setSelectedCity] = useState("All cities")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [showSellModal, setShowSellModal] = useState(false)
  const [enquiryItem, setEnquiryItem] = useState<Listing | null>(null)
  const [cartItems, setCartItems] = useState<Listing[]>([])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeCategory !== "all") params.set("category", activeCategory)
      if (selectedCity !== "All cities") params.set("city", selectedCity)
      if (debouncedSearch) params.set("search", debouncedSearch)
      const res = await fetch(`/api/marketplace?${params}`)
      const data = await res.json()
      if (data.listings) setListings(data.listings)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [activeCategory, selectedCity, debouncedSearch])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const addToCart = (item: Listing) => {
    setCartItems(prev => prev.find(i => i.id === item.id) ? prev : [...prev, item])
  }

  return (
    <div className="min-h-screen bg-[#07090b] text-white">
      <Navbar />

      {/* ── HERO ── */}
      <div
        className="pt-28 pb-10 px-6"
        style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(22,172,212,0.08) 0%, transparent 60%), #07090b" }}
      >
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-3"
            style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
          >
            DG <span style={{ color: "#16acd4" }}>MARKETPLACE</span>
          </h1>
          <p className="text-zinc-400 text-base mb-8" style={{ fontFamily: "Manrope, sans-serif" }}>
            Genuine detailing products, accessories &amp; parts – fitted by our experts.
          </p>

          {/* Search + Cart */}
          <div className="flex items-center gap-3 mb-8">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products, brands..."
                className="w-full bg-[#0e1316] border border-[#1a2328] rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#16acd4] transition-colors"
              />
            </div>
            <button
              onClick={() => cartItems.length > 0 && setEnquiryItem(null)}
              className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all relative"
              style={{ background: "#16acd4", color: "#07090b" }}
            >
              <ShoppingCart className="w-4 h-4" />
              Cart {cartItems.length > 0 && `(${cartItems.length})`}
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                style={
                  activeCategory === cat.id
                    ? { background: "#16acd4", borderColor: "#16acd4", color: "#07090b" }
                    : { background: "transparent", borderColor: "#1a2328", color: "#a1a1aa" }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION TABS ── */}
      <div className="px-6 border-b border-[#1a2328]">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap py-2">
          {SECTION_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={
                activeTab === tab.id
                  ? { background: "#16acd4", color: "#07090b" }
                  : { background: "transparent", color: "#a1a1aa", border: "1px solid #1a2328" }
              }
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}

          {/* City Dropdown */}
          <div className="relative ml-auto">
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="appearance-none bg-[#0e1316] border border-[#1a2328] text-zinc-300 text-sm pl-4 pr-9 py-2.5 rounded-lg outline-none focus:border-[#16acd4] cursor-pointer"
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>

          {/* Sell button */}
          <button
            onClick={() => setShowSellModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#16acd4] transition-all hover:bg-[#16acd4]/10 whitespace-nowrap"
            style={{ color: "#16acd4" }}
          >
            + Sell on DG Marketplace
          </button>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <div className="px-6 py-10">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#16acd4" }} />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-24 text-zinc-500">
              <Package className="w-14 h-14 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm mt-1">Try a different category or search term</p>
            </div>
          ) : (
            <>
              <p className="text-zinc-500 text-sm mb-6" style={{ fontFamily: "Manrope, sans-serif" }}>
                {listings.length} product{listings.length !== 1 ? "s" : ""} found
                {activeCategory !== "all" && ` in ${CATEGORIES.find(c => c.id === activeCategory)?.label}`}
                {debouncedSearch && ` for "${debouncedSearch}"`}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {listings.map(item => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onEnquire={() => setEnquiryItem(item)}
                    onAddToCart={() => addToCart(item)}
                    inCart={cartItems.some(i => i.id === item.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── SELL MODAL ── */}
      {showSellModal && <SellModal onClose={() => setShowSellModal(false)} />}

      {/* ── ENQUIRY MODAL ── */}
      {enquiryItem && <EnquiryModal item={enquiryItem} onClose={() => setEnquiryItem(null)} />}
    </div>
  )
}

/* ─── Product Card ─── */
function ProductCard({
  item,
  onEnquire,
  onAddToCart,
  inCart,
}: {
  item: Listing
  onEnquire: () => void
  onAddToCart: () => void
  inCart: boolean
}) {
  const icon = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.default

  return (
    <div
      className="rounded-xl border flex flex-col overflow-hidden group transition-all hover:border-[#16acd4]/50 hover:shadow-[0_0_20px_rgba(22,172,212,0.08)]"
      style={{ background: "#0e1316", borderColor: "#1a2328" }}
    >
      {/* Image Area */}
      <div
        className="h-36 flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d1a1f 0%, #0e1316 100%)" }}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-5xl opacity-70 group-hover:scale-110 transition-transform duration-300 select-none">{icon}</span>
        )}
        {/* Category badge */}
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
          style={{ background: "rgba(22,172,212,0.15)", color: "#16acd4", border: "1px solid rgba(22,172,212,0.3)" }}
        >
          {CATEGORIES.find(c => c.id === item.category)?.label || item.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-zinc-500 mb-1 truncate" style={{ fontFamily: "Manrope, sans-serif" }}>
          {item.seller}
        </p>
        <h3
          className="text-sm font-black uppercase tracking-tight text-white leading-tight mb-1.5 line-clamp-2"
          style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
        >
          {item.title}
        </h3>
        <p
          className="text-xs text-zinc-500 leading-relaxed line-clamp-2 flex-1 mb-3"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          {item.description}
        </p>

        <p className="text-sm font-bold mb-2.5" style={{ color: "#16acd4" }}>
          {item.price || "Price on request"}
        </p>

        <div className="flex gap-1.5">
          <button
            onClick={onEnquire}
            className="flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#16acd4", color: "#07090b" }}
          >
            Enquire
          </button>
          <button
            onClick={onAddToCart}
            className="px-2.5 py-2 rounded-lg text-xs font-bold border transition-all"
            style={
              inCart
                ? { background: "rgba(22,172,212,0.15)", borderColor: "#16acd4", color: "#16acd4" }
                : { background: "transparent", borderColor: "#1a2328", color: "#71717a" }
            }
            title={inCart ? "Added to cart" : "Add to cart"}
          >
            {inCart ? <CheckCircle className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Enquiry Modal ─── */
function EnquiryModal({ item, onClose }: { item: Listing; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", message: "" })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) return
    setSending(true)
    try {
      await fetch("/api/marketplace/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId: item.id, productTitle: item.title, seller: item.seller }),
      })
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{ background: "#0e1316", border: "1px solid #1a2328" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-400" />
        </button>

        {sent ? (
          <div className="text-center py-8">
            <CheckCircle className="w-14 h-14 mx-auto mb-4" style={{ color: "#16acd4" }} />
            <h3 className="text-xl font-black mb-2" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
              ENQUIRY SENT!
            </h3>
            <p className="text-zinc-400 text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
              We will contact you shortly on {form.phone}
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-lg text-sm font-bold w-full"
              style={{ background: "#16acd4", color: "#07090b" }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-black mb-1" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
              ENQUIRE NOW
            </h2>
            <p className="text-zinc-500 text-xs mb-5" style={{ fontFamily: "Manrope, sans-serif" }}>
              {item.title} · {item.seller}
            </p>

            <form onSubmit={submit} className="flex flex-col gap-3">
              <input
                required
                placeholder="Your name *"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
              />
              <input
                required
                placeholder="Phone / WhatsApp *"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
              />
              <textarea
                placeholder="Message (optional)"
                rows={3}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "#16acd4", color: "#07090b" }}
              >
                {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                {sending ? "Sending..." : "Send Enquiry"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Sell Modal ─── */
function SellModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [form, setForm] = useState({ name: "", phone: "", business: "" })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selected === null) return
    setSending(true)
    try {
      await fetch("/api/marketplace/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          businessType: BUSINESS_TYPES[selected].title,
          type: "sell-request",
        }),
      })
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div
        className="relative w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
        style={{ background: "#0e1316", border: "1px solid #1a2328" }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-400" />
        </button>

        {sent ? (
          <div className="text-center py-10">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#16acd4" }} />
            <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
              REQUEST RECEIVED!
            </h2>
            <p className="text-zinc-400 text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
              Our team will verify and activate your listing shortly.
            </p>
            <button onClick={onClose} className="mt-6 px-8 py-3 rounded-xl text-sm font-bold" style={{ background: "#16acd4", color: "#07090b" }}>
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black mb-1" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
              LIST YOUR BUSINESS <span style={{ color: "#16acd4" }}>– FREE</span>
            </h2>
            <p className="text-zinc-400 text-sm mb-6" style={{ fontFamily: "Manrope, sans-serif" }}>
              Create a verified partner account – your listing goes live on Near Me after verification.
            </p>

            {/* Business Type Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {BUSINESS_TYPES.map((bt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className="flex items-start gap-4 p-4 rounded-xl border text-left transition-all"
                  style={
                    selected === i
                      ? { borderColor: "#16acd4", background: "rgba(22,172,212,0.08)" }
                      : { borderColor: "#1a2328", background: "#07090b" }
                  }
                >
                  <span className="text-2xl mt-0.5">{bt.icon}</span>
                  <div>
                    <p
                      className="text-sm font-bold leading-snug mb-1"
                      style={{ fontFamily: "'Saira Semi Condensed', sans-serif", color: selected === i ? "#16acd4" : "#fff" }}
                    >
                      {bt.title}
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed" style={{ fontFamily: "Manrope, sans-serif" }}>
                      {bt.desc}
                    </p>
                  </div>
                  {selected === i && <CheckCircle className="w-5 h-5 ml-auto flex-shrink-0 mt-0.5" style={{ color: "#16acd4" }} />}
                </button>
              ))}
            </div>

            {/* Contact Form */}
            {selected !== null && (
              <form onSubmit={submit} className="flex flex-col gap-3 border-t border-[#1a2328] pt-6">
                <p className="text-xs font-semibold text-zinc-400 mb-1">Your contact details</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Your name *"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-[#07090b] border border-[#1a2328] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                  />
                  <input
                    required
                    placeholder="Phone / WhatsApp *"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="bg-[#07090b] border border-[#1a2328] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                  />
                </div>
                <input
                  placeholder="Business / shop name"
                  value={form.business}
                  onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
                  className="bg-[#07090b] border border-[#1a2328] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-1"
                  style={{ background: "#16acd4", color: "#07090b" }}
                >
                  {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {sending ? "Submitting..." : "Submit & Get Listed"}
                </button>
              </form>
            )}

            {selected === null && (
              <button onClick={onClose} className="mt-2 w-full py-3 rounded-xl text-sm text-zinc-500 border border-[#1a2328] hover:bg-white/5 transition-colors">
                Close
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
