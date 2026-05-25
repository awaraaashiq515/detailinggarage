"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import {
    Car,
    Fuel,
    Gauge,
    Calendar,
    Zap,
    MapPin,
    ArrowRight,
    Loader2,
    Star,
    Tag,
    Clock
} from "lucide-react"
import Link from "next/link"

export default function PublicCompanyStockPage() {
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <div className="pt-24 pb-16 px-6 bg-zinc-900 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#16acd4]/10 to-transparent skew-x-12" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                        <span className="w-1 h-1 rounded-full bg-[#16acd4] animate-pulse" />
                        <span className="text-[9px] font-semibold text-white uppercase tracking-widest text-[#16acd4]/80">Official Company Inventory</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
                        Premium <span className="text-zinc-500 italic">Pre-Owned</span> <br />
                        Automobiles.
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-xl font-normal opacity-90">
                        Exclusive enterprise stock available directly from our centralized inventory. Rigorously inspected and ready for mobilization.
                    </p>
                </div>
            </div>

            {/* Inventory Grid */}
            <main className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Current Stock</h2>
                    <div className="w-32 h-[1px] bg-zinc-100 hidden sm:block" />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-200" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Loading Portfolio...</span>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-40 bg-zinc-50 rounded-3xl border border-zinc-100">
                        <Car className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                        <p className="text-zinc-500 font-medium">No inventory is currently listed publicly.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {vehicles.map((v) => (
                            <VehicleCard key={v.id} vehicle={v} />
                        ))}
                    </div>
                )}
            </main>

            {/* Premium CTA */}
            <section className="bg-zinc-50 py-24 mb-20 mx-6 rounded-[3rem] border border-zinc-100 overflow-hidden relative">
                <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
                    <h2 className="text-3xl font-bold text-zinc-900 mb-6">Are you an authorized dealer?</h2>
                    <p className="text-zinc-500 text-lg mb-10 font-medium">
                        Dealers get exclusive access to bidding, direct purchase pricing, and bulk inventory management tools.
                    </p>
                    <Link
                        href="/dealer/marketplace"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-zinc-200"
                    >
                        Access Dealer Marketplace
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    )
}

function VehicleCard({ vehicle }: { vehicle: any }) {
    const images = (() => { try { return JSON.parse(vehicle.images || '[]') } catch { return [] } })()

    return (
        <div className={`group flex flex-col bg-white rounded-3xl overflow-hidden border transition-all duration-500 hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200/50 ${vehicle.isFeatured ? 'border-[#16acd4]/20 shadow-[0_4px_20px_rgba(22, 172, 212,0.05)]' : 'border-zinc-100'}`}>
            {/* Image Placeholder */}
            <div className="h-64 relative overflow-hidden bg-zinc-50">
                {images[0] ? (
                    <img src={images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={vehicle.title} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-200">
                        <Car className="w-16 h-16 opacity-20" />
                    </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                    <div className="flex gap-2">
                        {vehicle.isNew && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 animate-pulse">New Listing</span>
                        )}
                        {vehicle.isFeatured && (
                            <span className="px-2.5 py-1 rounded-lg bg-[#16acd4] text-white text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-[#16acd4]/20 flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-white" /> Featured
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-8 flex flex-col flex-1">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-3 h-3 text-[#16acd4]" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Listing Garage Official {vehicle.city && `• ${vehicle.city}`}</span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 tracking-tight leading-snug group-hover:text-[#16acd4] transition-colors duration-300">
                        {vehicle.title}
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {[
                        { icon: Calendar, val: vehicle.year, label: "Year" },
                        { icon: Fuel, val: vehicle.fuelType, label: "Fuel" },
                        { icon: Zap, val: vehicle.transmission?.slice(0, 4), label: "Transmission" },
                        { icon: Gauge, val: vehicle.mileage ? `${(vehicle.mileage / 1000).toFixed(0)}K KM` : "N/A", label: "Mileage" }
                    ].map((spec, i) => (
                        <div key={i} className="flex flex-col p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 transition-all hover:bg-white hover:border-zinc-200 hover:shadow-sm">
                            <spec.icon className="w-3.5 h-3.5 text-[#16acd4] mb-1.5" />
                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{spec.label}</span>
                            <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">{spec.val}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-zinc-50">
                    <div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                            {vehicle.sellingMode === "AUCTION" ? "Opening Bid" : "Direct Price"}
                        </span>
                        <span className="text-xl font-bold text-zinc-900 tracking-tighter">
                            ₹{((vehicle.sellingMode === "FIXED" ? vehicle.fixedPrice : vehicle.basePrice) || 0).toLocaleString('en-IN')}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-[#16acd4]">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Inquire</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </div>
    )
}
