"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/layout/navbar"
import {
    Car, Fuel, Settings, MapPin, Tag, Gavel, ClipboardList,
    Star, ArrowRight, Loader2, ShoppingBag, Clock, Zap,
    Search, SlidersHorizontal, ChevronDown, Check, X,
    Calendar, Gauge, IndianRupee, Filter, LayoutGrid, List
} from "lucide-react"
import Link from "next/link"

const CRIMSON = "#991b1b"
const CRIMSON_LIGHT = "#dc2626"

export default function PublicMarketplacePage() {
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    // Filter states
    const [filters, setFilters] = useState({
        make: "",
        fuelType: "",
        transmission: "",
        sellingMode: "",
        priceRange: [0, 10000000],
        year: ""
    })

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const res = await fetch("/api/public/company-stock")
                const data = await res.json()
                if (data.vehicles) setVehicles(data.vehicles)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchStock()
    }, [])

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(v => {
            const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.model.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesMake = !filters.make || v.make === filters.make
            const matchesFuel = !filters.fuelType || v.fuelType === filters.fuelType
            const matchesTrans = !filters.transmission || v.transmission === filters.transmission
            const matchesMode = !filters.sellingMode || v.sellingMode === filters.sellingMode
            const matchesYear = !filters.year || v.year.toString() === filters.year

            const price = v.fixedPrice || v.basePrice || 0
            const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1]

            return matchesSearch && matchesMake && matchesFuel && matchesTrans && matchesMode && matchesPrice && matchesYear
        })
    }, [vehicles, searchQuery, filters])

    const makes = Array.from(new Set(vehicles.map(v => v.make))).sort()
    const fuelTypes = Array.from(new Set(vehicles.map(v => v.fuelType))).filter(Boolean)
    const transmissions = Array.from(new Set(vehicles.map(v => v.transmission))).filter(Boolean)

    const images = (v: any) => {
        try { return JSON.parse(v.images || "[]") } catch { return [] }
    }

    const clearFilters = () => {
        setFilters({
            make: "",
            fuelType: "",
            transmission: "",
            sellingMode: "",
            priceRange: [0, 10000000],
            year: ""
        })
        setSearchQuery("")
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Navbar />

            {/* ── Enhanced Hero ── */}
            <div className="pt-32 pb-40 px-6 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-800/5 rounded-full blur-[100px] -ml-40 -mb-40" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8 mb-16">
                        <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-[0_0_20px_rgba(148,163,184,0.05)]">
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Elite Automotive Collection</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none max-w-4xl text-white">
                            THE PINNACLE OF <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-white to-slate-400">AUTOMOTIVE EXCELLENCE</span>
                        </h1>
                        <p className="text-zinc-500 text-lg md:text-xl max-w-2xl font-medium">
                            Explore our meticulously curated selection of premium company stock. Engineered for transparency, performance, and seamless acquisition.
                        </p>
                    </div>

                    {/* Integrated Search Bar */}
                    <div className="max-w-4xl mx-auto relative p-2 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-2xl shadow-2xl">
                        <div className="flex flex-col md:flex-row gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search by make, model, or keywords..."
                                    className="w-full bg-transparent border-none py-5 pl-16 pr-8 text-white focus:ring-0 placeholder:text-zinc-600 text-lg font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-3 px-8 py-5 rounded-[1.8rem] text-sm font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                {showFilters ? 'Hide Filters' : 'Advanced Filters'}
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showFilters && (
                        <div className="max-w-4xl mx-auto mt-6 p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-500 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest pl-1">Manufacturer</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-red-600 focus:ring-0 cursor-pointer"
                                    value={filters.make}
                                    onChange={(e) => setFilters({ ...filters, make: e.target.value })}
                                >
                                    <option value="">All Makes</option>
                                    {makes.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest pl-1">Fuel Type</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-red-600 focus:ring-0 cursor-pointer"
                                    value={filters.fuelType}
                                    onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                                >
                                    <option value="">All Fuel Types</option>
                                    {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest pl-1">Purchase Mode</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-red-600 focus:ring-0 cursor-pointer"
                                    value={filters.sellingMode}
                                    onChange={(e) => setFilters({ ...filters, sellingMode: e.target.value })}
                                >
                                    <option value="">Any Mode</option>
                                    <option value="AUCTION">Live Auction</option>
                                    <option value="FIXED">Direct Buy</option>
                                    <option value="RATE_REQUEST">Price Inquiry</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Content Grid ── */}
            <main className="max-w-7xl mx-auto px-6 -mt-20 pb-40">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                            <span className="text-xl font-black">{filteredVehicles.length}</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-3">Results found</span>
                        </div>
                        {Object.values(filters).some(v => v !== "" && (Array.isArray(v) ? (v[0] !== 0 || v[1] !== 10000000) : true)) && (
                            <button
                                onClick={clearFilters}
                                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors flex items-center gap-2"
                            >
                                <X className="w-3 h-3" /> Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 animate-spin text-red-600" />
                            <div className="absolute inset-0 bg-red-600 blur-[20px] opacity-20" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-zinc-600">Syncing Exclusive Inventory...</span>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="text-center py-40 rounded-[3rem] bg-white/[0.02] border border-dashed border-white/10">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <Search className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-2xl font-black mb-2">No Matching Vehicles</h3>
                        <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Try adjusting your filters or search keywords to find your perfect match.</p>
                        <button onClick={clearFilters} className="px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all">Reset All Filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredVehicles.map((v, idx) => (
                            <VehicleCard key={v.id} v={v} images={images(v)} index={idx} />
                        ))}
                    </div>
                )}
            </main>

            {/* ── Dealer Footer ── */}
            <div className="mx-6 mb-20 rounded-[4rem] bg-gradient-to-br from-[#1a0f0f] to-[#09090b] border border-red-950/30 overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(153,27,27,0.1),transparent)]" />
                </div>
                <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col items-center text-center space-y-10 relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-red-900/10 border border-red-800/20 flex items-center justify-center shadow-2xl">
                        <Star className="w-10 h-10 text-red-600" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">PARTNER WITH<br /><span className="text-red-600">THE BEST IN THE BUSINESS</span></h2>
                        <p className="text-zinc-500 text-lg max-w-xl mx-auto">Authorized dealers gain access to premium auctions, direct buy opportunities, and advanced fleet management tools.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Link href="/dealer/marketplace" className="px-10 py-5 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-95 flex items-center justify-center gap-3">
                            Apply for Dealer Access <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/company-stock" className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3">
                            Public Inventory
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

function VehicleCard({ v, images, index }: any) {
    const mainImg = images[0]
    const price = v.fixedPrice || v.basePrice || 0

    return (
        <div className="group relative flex flex-col rounded-[2.5rem] bg-[#121214] border border-white/5 overflow-hidden transition-all duration-500 hover:border-red-600/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            {/* Top Badge Overlay */}
            <div className="absolute top-5 left-5 right-5 z-20 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-2">
                    {v.sellingMode === "AUCTION" && (
                        <div className="px-3 py-1.5 rounded-full bg-red-600 text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                            <Zap className="w-3 h-3 fill-white" /> Live Auction
                        </div>
                    )}
                    {v.sellingMode === "FIXED" && (
                        <div className="px-3 py-1.5 rounded-full bg-emerald-600 text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                            <Tag className="w-3 h-3 fill-white" /> Direct Buy
                        </div>
                    )}
                </div>
                {v.isFeatured && (
                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <Star className="w-4 h-4 text-red-500 fill-red-500" />
                    </div>
                )}
            </div>

            {/* Image Area */}
            <Link href={`/marketplace/${v.id}`} className="relative h-64 overflow-hidden block">
                {mainImg ? (
                    <img
                        src={mainImg}
                        alt={v.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                        <Car className="w-20 h-20 text-white/5" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-transparent opacity-60" />

                {/* Visual Details Overlay */}
                <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{v.make}</p>
                        <h3 className="text-xl font-black text-white leading-none tracking-tight uppercase">{v.model}</h3>
                    </div>
                    {v.bidDeadline && (
                        <div className="px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                            <Clock className="w-3 h-3 text-red-500" />
                            <span className="text-[9px] font-black text-white/80">{new Date(v.bidDeadline).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Stats Area */}
            <div className="px-8 py-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">Year</p>
                        <p className="text-xs font-black text-white tracking-widest">{v.year}</p>
                    </div>
                    <div className="space-y-1">
                        <Gauge className="w-4 h-4 text-red-600" />
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">Mileage</p>
                        <p className="text-xs font-black text-white tracking-widest">{(v.mileage || 0).toLocaleString()} KM</p>
                    </div>
                    <div className="space-y-1">
                        <Fuel className="w-4 h-4 text-red-600" />
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">Fuel</p>
                        <p className="text-xs font-black text-white tracking-widest">{v.fuelType}</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">
                            {v.sellingMode === "AUCTION" ? "Current Bid" : "Listing Price"}
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black text-red-600">₹</span>
                            <span className="text-2xl font-black text-white tracking-tighter">{price.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    <Link
                        href="/dealer/marketplace"
                        className="px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-lg"
                    >
                        {v.sellingMode === "AUCTION" ? "Place Bid" : "Acquire"}
                    </Link>
                </div>
            </div>

            {/* Hover Accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
    )
}


