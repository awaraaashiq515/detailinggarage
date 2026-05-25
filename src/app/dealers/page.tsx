"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, MapPin, Star, Users, Car, CheckCircle, Loader2, Filter } from "lucide-react"

interface DealerCard {
    id: string
    slug: string
    businessName: string
    tagline?: string
    logoUrl?: string
    coverUrl?: string
    city?: string
    state?: string
    isVerified: boolean
    isFeatured: boolean
    followerCount: number
    vehicleCount: number
    avgRating: number | null
    reviewCount: number
}

export default function DealersPage() {
    const [dealers, setDealers] = useState<DealerCard[]>([])
    const [filtered, setFiltered] = useState<DealerCard[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [cityFilter, setCityFilter] = useState("All")
    const [verifiedOnly, setVerifiedOnly] = useState(false)

    useEffect(() => {
        fetch("/api/public/dealers")
            .then((r) => r.json())
            .then((d) => {
                setDealers(d.dealers || [])
                setFiltered(d.dealers || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    useEffect(() => {
        let list = [...dealers]
        if (search) list = list.filter((d) => d.businessName.toLowerCase().includes(search.toLowerCase()) || d.city?.toLowerCase().includes(search.toLowerCase()))
        if (cityFilter !== "All") list = list.filter((d) => d.city === cityFilter)
        if (verifiedOnly) list = list.filter((d) => d.isVerified)
        setFiltered(list)
    }, [search, cityFilter, verifiedOnly, dealers])

    const cities = ["All", ...Array.from(new Set(dealers.map((d) => d.city).filter(Boolean) as string[]))]

    return (
        <div className="min-h-screen bg-[#070f1a]">
            {/* Hero */}
            <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f2e4f 0%, #122033 100%)" }}>
                <div className="absolute inset-0 opacity-10">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute rounded-full bg-accent/80" style={{ width: Math.random() * 200 + 50, height: Math.random() * 200 + 50, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: 0.1, filter: "blur(60px)" }} />
                    ))}
                </div>
                <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Find Your Dealer</h1>
                    <p className="text-gray-400 text-lg mb-8">Browse verified dealers and explore their inventory</p>

                    {/* Search */}
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search dealers by name or city…"
                            className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:bg-white/15 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 py-5">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Filter:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {cities.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCityFilter(c)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${cityFilter === c ? "bg-accent text-black" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"}`}
                            >{c}</button>
                        ))}
                    </div>
                    <button
                        onClick={() => setVerifiedOnly(!verifiedOnly)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold ml-auto transition-all ${verifiedOnly ? "bg-accent/20 border border-accent/30 text-accent" : "bg-white/5 border border-white/10 text-gray-400"}`}
                    >
                        <CheckCircle className="w-3 h-3" /> Verified Only
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-16">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Car className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No dealers found matching your search.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-gray-600 mb-4">{filtered.length} dealer{filtered.length !== 1 ? "s" : ""} found</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {filtered.map((d) => (
                                <DealerCard key={d.id} dealer={d} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function DealerCard({ dealer: d }: { dealer: DealerCard }) {
    const initials = d.businessName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    return (
        <Link href={`/dealer/${d.slug}`} className="group block bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden hover:border-accent/30 transition-all hover:shadow-lg hover:shadow-accent/5">
            {/* Cover */}
            <div className="relative h-32 overflow-hidden">
                {d.coverUrl ? (
                    <img src={d.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #0f2e4f, #1a4a7a)" }} />
                )}
                {d.isFeatured && (
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-accent text-black text-[9px] font-bold rounded-full">★ Featured</span>
                )}
                {/* Logo overlay */}
                <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl border-2 border-[#070f1a] overflow-hidden">
                    {d.logoUrl ? (
                        <img src={d.logoUrl} alt={d.businessName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold" style={{ background: "linear-gradient(135deg,#c9921e,#f3d090)", color: "#122033" }}>
                            {initials}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-7 pb-4 px-4 space-y-1.5">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-[13px] truncate tracking-tight">{d.businessName}</h3>
                    {d.isVerified && <CheckCircle className="w-3 h-3 text-accent flex-shrink-0" />}
                </div>
                {d.city && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {d.city}{d.state ? `, ${d.state}` : ""}
                    </p>
                )}

                <div className="flex items-center gap-3 pt-1 flex-wrap">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Car className="w-3 h-3" /> {d.vehicleCount} vehicles</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {d.followerCount}</span>
                    {d.avgRating && (
                        <span className="text-xs text-accent font-bold flex items-center gap-1 ml-auto">
                            <Star className="w-3 h-3 fill-amber-400" /> {d.avgRating}
                        </span>
                    )}
                </div>

                <div className="pt-2 border-t border-white/5">
                    <span className="text-[11px] font-semibold text-accent group-hover:text-accent transition-colors">Visit Page →</span>
                </div>
            </div>
        </Link>
    )
}
