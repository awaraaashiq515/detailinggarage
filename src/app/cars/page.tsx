"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import {
    Car,
    ArrowUpDown,
    ChevronRight,
    Loader2,
    Eye,
    ShieldCheck,
    Award,
    MapPin,
    Zap,
    Fuel,
    Gauge,
    Calendar,
    LucideStar,
    MessageSquare,
} from "lucide-react"
import Link from "next/link"


import { WishlistButton } from "@/components/shared/WishlistButton"

import HomeFooter from "@/components/home/HomeFooter"


export default function CarsPage() {
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchVehicles = useCallback((searchFilters?: any) => {
        setLoading(true)
        const raw: Record<string, string> = { type: "CAR", ...(searchFilters || {}) }
        // Strip empty values
        const params = new URLSearchParams(
            Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== ""))
        )
        fetch(`/api/vehicles?${params.toString()}`)
            .then(r => r.json())
            .then(data => setVehicles(data.vehicles || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        fetchVehicles()
    }, [fetchVehicles])

    const featuredCars = vehicles.filter(v => v.isFeatured)
    const regularCars = vehicles.filter(v => !v.isFeatured)

    return (
        <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-100">
            <Navbar />

            {/* Premium Cinematic Header for Marketplace */}
            <header className="relative pt-28 pb-20 px-6 md:px-14 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="/hero-bg.png" className="w-full h-full object-cover opacity-20 grayscale" alt="Background" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="text-[#ff4b55] text-[12px] font-bold uppercase tracking-[0.4em] mb-6">EXPLORE OUR INVENTORY</div>
                        <h1 className="font-display text-[clamp(40px,7vw,70px)] text-gray-900 leading-[1.1] mb-8 uppercase tracking-tight">
                            Cars <span className="text-[#ff4b55]">Marketplace</span>
                        </h1>
                        <div className="w-16 h-1 bg-[#ff4b55] rounded-full mb-8 shadow-[0_0_10px_rgba(255,75,85,0.3)]" />
                        <p className="text-gray-500 text-lg max-w-2xl font-normal leading-relaxed opacity-90">
                            Navigate through our curated selection of high-performance vehicles, meticulously verified for complete transparency and quality.
                        </p>
                    </div>
                </div>
            </header>




            {/* Inventory List Section */}
            <main className="px-6 md:px-12 pb-24">
                <div className="max-w-7xl mx-auto space-y-16">

                    {/* Featured Row */}
                    {featuredCars.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Featured Selection</h2>
                                    <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-widest mt-1">Handpicked Premium Assets</p>
                                </div>
                                <div className="hidden sm:block w-16 h-[1px] bg-zinc-100"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {featuredCars.map(vehicle => (
                                    <VehicleCard key={vehicle.id} vehicle={vehicle} featured />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Standard List */}
                    <div>
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xl font-bold text-zinc-900 tracking-tight italic">Our Collection</h2>
                            <div className="flex items-center gap-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                                <ArrowUpDown className="w-3.5 h-3.5" /> Sort: Latest
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-zinc-200" />
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300">Building Inventory...</span>
                            </div>
                        ) : regularCars.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {regularCars.map(vehicle => (
                                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-40 bg-zinc-50 border border-zinc-100 rounded-[2.5rem]">
                                <Car className="w-12 h-12 text-zinc-200 mx-auto mb-6 opacity-50" />
                                <h3 className="text-lg font-bold text-zinc-900 mb-2">No matching vehicles</h3>
                                <p className="text-zinc-400 text-xs font-medium">Try different search terms or reset filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <HomeFooter />

        </div>
    )
}

function VehicleCard({ vehicle, featured }: { vehicle: any, featured?: boolean }) {
    const imgs = (() => { try { return JSON.parse(vehicle.images || '[]') } catch { return [] } })()
    const thumb = imgs[0] || "/service-workshop.png"

    // Price in lakh format
    const priceInLakh = vehicle.price >= 100000
        ? `₹${(vehicle.price / 100000).toFixed(2).replace(/\.?0+$/, '')} lakh`
        : `₹${vehicle.price.toLocaleString('en-IN')}`

    // Simple EMI estimate: 20% down, 12% p.a., 36 months
    const loanAmount = vehicle.price * 0.8
    const monthlyRate = 0.12 / 12
    const emi = Math.round(loanAmount * monthlyRate * Math.pow(1 + monthlyRate, 36) / (Math.pow(1 + monthlyRate, 36) - 1))

    // Spec chips: mileage, fuel, transmission, RTO
    const chips = [
        vehicle.mileage ? `${vehicle.mileage.toLocaleString('en-IN')} km` : null,
        vehicle.fuelType || null,
        vehicle.transmission || null,
        vehicle.registrationNumber ? vehicle.registrationNumber.slice(0, 5) : null,
    ].filter(Boolean)

    const location = vehicle.city
        ? (vehicle.state ? `${vehicle.city}, ${vehicle.state}` : vehicle.city)
        : (vehicle.dealer?.dealerCity || null)

    return (
        <Link href={`/cars/${vehicle.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1">
            {/* Image */}
            <div className="relative bg-gray-50 overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <img
                    src={thumb}
                    alt={vehicle.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 z-10">
                    <WishlistButton vehicleId={vehicle.id} variant="icon" className="!shadow-md !bg-white/90 !border-0 hover:!bg-white" />
                </div>
                {featured && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-[#ff4b55] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow">Featured</span>
                    </div>
                )}
                {/* Dealer badge — like "Cars24 Owned Stock" */}
                {(vehicle.dealer?.dealerBusinessName || vehicle.dealer?.name) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-3 py-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-[12px] font-bold text-gray-800 truncate">
                            {vehicle.dealer?.dealerBusinessName || vehicle.dealer?.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-3 line-clamp-2 group-hover:text-[#ff4b55] transition-colors">
                    {vehicle.year && <span className="text-gray-900">{vehicle.year} </span>}
                    {vehicle.make} {vehicle.model}
                    {vehicle.title && !(`${vehicle.make} ${vehicle.model}` === vehicle.title) && (
                        <span className="text-gray-400 font-normal text-[13px]"> {vehicle.title.replace(`${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim(), '').trim()}</span>
                    )}
                </h3>

                {/* Spec Chips */}
                {chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {chips.map((chip, i) => (
                            <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-[11px] font-semibold text-gray-600">
                                {chip}
                            </span>
                        ))}
                    </div>
                )}

                {/* EMI + Price Row */}
                <div className="flex items-end justify-between mt-1 pt-3 border-t border-gray-50">
                    <div>
                        <div className="text-[11px] font-bold text-gray-500 mb-0.5">EMI ₹{emi.toLocaleString('en-IN')}/m*</div>
                        <div className="text-[11px] text-gray-300 leading-none" style={{ borderBottom: '1px dashed #d1d5db', width: '80%' }} />
                    </div>
                    <div className="text-right">
                        <div className="text-base font-bold text-gray-900">{priceInLakh}</div>
                        <div className="text-[10px] text-gray-400">+ other charges</div>
                    </div>
                </div>

                {/* Location Footer */}
                {location && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{location}</span>
                    </div>
                )}
            </div>
        </Link>
    )
}


