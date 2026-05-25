"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import {
    Bike,
    Search,
    Filter,
    ArrowUpDown,
    Wrench,
    ChevronRight,
    Loader2,
    Activity
} from "lucide-react"
import Link from "next/link"

export default function BikesPage() {
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        make: "",
        minPrice: "",
        maxPrice: "",
        minYear: ""
    })

    const fetchVehicles = () => {
        setLoading(true)
        const params = new URLSearchParams({
            type: "BIKE",
            ...filters
        })
        fetch(`/api/vehicles?${params.toString()}`)
            .then(r => r.json())
            .then(data => setVehicles(data.vehicles || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchVehicles()
    }, [])

    const handleFilterChange = (key: string, val: string) => {
        setFilters(f => ({ ...f, [key]: val }))
    }

    const featuredBikes = vehicles.filter(v => v.isFeatured)
    const regularBikes = vehicles.filter(v => !v.isFeatured)

    return (
        <div className="min-h-screen bg-[#08090c]">
            <Navbar />

            {/* Header */}
            <header className="relative py-24 px-6 md:px-14 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-1 h-0.5 bg-[#60a5fa]"></div>
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-[#60a5fa]">Two-Wheeler Elite</span>
                    </div>
                    <h1 className="font-display text-[clamp(48px,8vw,80px)] font-extrabold tracking-tight uppercase italic leading-none text-white">
                        Ride Into The <br /> <span className="text-gray-500 text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-blue-300">New Horizon</span>
                    </h1>
                </div>
            </header>

            {/* Filters Bar */}
            <section className="px-6 md:px-14 -mt-10 mb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-4 flex flex-wrap items-center gap-4 shadow-2xl">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                            <input
                                type="text"
                                placeholder="Search Brand (e.g. Enfield, Honda)..."
                                value={filters.make}
                                onChange={e => handleFilterChange("make", e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <select
                                value={filters.minPrice}
                                onChange={e => handleFilterChange("minPrice", e.target.value)}
                                className="bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-[#888] appearance-none cursor-pointer hover:border-white/10"
                            >
                                <option value="">Min Price</option>
                                <option value="20000">₹20K+</option>
                                <option value="50000">₹50K+</option>
                                <option value="100000">₹1 Lakh+</option>
                            </select>
                            <select
                                value={filters.maxPrice}
                                onChange={e => handleFilterChange("maxPrice", e.target.value)}
                                className="bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-[#888] appearance-none cursor-pointer hover:border-white/10"
                            >
                                <option value="">Max Price</option>
                                <option value="50000">Up to ₹50K</option>
                                <option value="100000">Up to ₹1 Lakh</option>
                                <option value="500000">Up to ₹5 Lakh</option>
                            </select>
                            <select
                                value={filters.minYear}
                                onChange={e => handleFilterChange("minYear", e.target.value)}
                                className="bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-[#888] appearance-none cursor-pointer hover:border-white/10"
                            >
                                <option value="">Year</option>
                                <option value="2022">2022 & Newer</option>
                                <option value="2018">2018 & Newer</option>
                                <option value="2015">2015 & Newer</option>
                            </select>
                            <button
                                onClick={fetchVehicles}
                                className="bg-[#60a5fa] text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-400 transition-all flex items-center gap-2"
                            >
                                <Filter className="w-3 h-3" /> Apply
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* List */}
            <main className="px-6 md:px-14 pb-32">
                <div className="max-w-7xl mx-auto space-y-24">
                    {/* Featured Section */}
                    {featuredBikes.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black uppercase tracking-widest text-white italic">Featured Legends</h2>
                                <div className="text-[10px] font-bold text-[#444] uppercase tracking-widest">Handpicked Selections</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {featuredBikes.map(vehicle => (
                                    <BikeCard key={vehicle.id} vehicle={vehicle} featured />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Bikes */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black uppercase tracking-widest text-white italic">The Collection</h2>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-[#444] uppercase tracking-widest">
                                <ArrowUpDown className="w-3 h-3" /> New Arrivals
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-500/20" />
                            </div>
                        ) : regularBikes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {regularBikes.map(vehicle => (
                                    <BikeCard key={vehicle.id} vehicle={vehicle} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 border border-dashed border-white/5 rounded-[3rem]">
                                <Bike className="w-12 h-12 text-[#111] mx-auto mb-4" />
                                <p className="text-[#444] font-bold uppercase tracking-widest">No matching bikes found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="py-20 px-6 md:px-14 border-t border-white/5 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[#444]">
                    <div className="font-display text-xl font-black italic uppercase tracking-widest text-white">
                        Listing<span className="text-[#60a5fa]">Garage</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 Premium Bike Portal</p>
                </div>
            </footer>
        </div>
    )
}

function BikeCard({ vehicle, featured }: { vehicle: any, featured?: boolean }) {
    const imgs = (() => { try { return JSON.parse(vehicle.images || '[]') } catch { return [] } })()
    const thumb = imgs[0] || null

    return (
        <div className={`group rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 hover:border-blue-500/30 ${featured ? 'border-2 border-[#60a5fa]/20 shadow-[0_30px_60px_rgba(96,165,250,0.05)] bg-[#0d0f14]' : 'bg-[#111] border border-white/5 shadow-xl'}`}>
            <div className="h-64 relative overflow-hidden bg-black">
                {thumb ? (
                    <img src={thumb} alt={vehicle.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><Bike className="w-16 h-16" /></div>
                )}
                {featured && (
                    <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#60a5fa]/30 text-[#60a5fa] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Verified Listing
                    </div>
                )}
            </div>
            <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-[#60a5fa] transition-colors">{vehicle.title}</h3>
                </div>
                <div className="text-2xl font-black text-white mb-4">₹{vehicle.price.toLocaleString('en-IN')}</div>

                <div className="text-[11px] mb-6 flex items-center gap-2 text-[#666] font-bold uppercase tracking-widest">
                    <Wrench className="w-3 h-3 text-[#333]" />
                    {vehicle.dealer.dealerPage?.slug ? (
                        <Link
                            href={`/dealer/${vehicle.dealer.dealerPage.slug}`}
                            className="hover:text-[#60a5fa] transition-colors"
                        >
                            {vehicle.dealer.dealerBusinessName || vehicle.dealer.name}
                        </Link>
                    ) : (
                        <span>{vehicle.dealer.dealerBusinessName || vehicle.dealer.name}</span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {[vehicle.year, vehicle.engineCC ? `${vehicle.engineCC} CC` : null, vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : null].filter(Boolean).map((tag, idx) => (
                        <div key={idx} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[#555]">{tag}</div>
                    ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333]">Location: {vehicle.city || 'Anywhere'}</span>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#888] hover:text-white transition-colors">
                        View Details <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    )
}
