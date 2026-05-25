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
    ArrowLeft,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    MessageSquare,
    Share2,
    Info,
    Tag,
    Clock
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

export default function PublicCompanyVehicleDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [vehicle, setVehicle] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/public/company-stock`)
                const data = await res.json()
                const found = data.vehicles?.find((v: any) => v.id === id)
                if (found) setVehicle(found)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchDetail()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-zinc-200 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Fetching Asset Data...</p>
            </div>
        )
    }

    if (!vehicle) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
                <Car className="w-16 h-16 text-zinc-100 mb-6" />
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">Vehicle Not Found</h1>
                <p className="text-zinc-500 mb-8 max-w-md text-center">The vehicle you are looking for might have been sold or removed from the marketplace.</p>
                <Link href="/company-stock" className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-sm">Back to Stock</Link>
            </div>
        )
    }

    const images = (() => { try { return JSON.parse(vehicle.images || '[]') } catch { return [] } })()

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-32">
                {/* Navigation */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-10 group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Back to Collection</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left: Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-[4/3] rounded-[3rem] bg-zinc-50 border border-zinc-100 overflow-hidden relative group">
                            {images[0] ? (
                                <img src={images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={vehicle.title} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Car className="w-24 h-24 text-zinc-200" />
                                </div>
                            )}

                            <div className="absolute top-8 left-8 flex flex-col gap-3">
                                {vehicle.isNew && (
                                    <div className="px-4 py-2 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20">Newly Arrived</div>
                                )}
                                {vehicle.isFeatured && (
                                    <div className="px-4 py-2 bg-[#16acd4] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#16acd4]/20 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Professional Selection
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails grid placeholder - real images would go here */}
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                    <Car className="w-6 h-6 text-zinc-200 opacity-50" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col">
                        <div className="mb-8 p-8 rounded-[2.5rem] bg-zinc-50 border border-zinc-100">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-3 h-3 text-[#16acd4]" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Listing Garage Enterprise</span>
                            </div>
                            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-4">{vehicle.title}</h1>
                            <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Inspected</span>
                                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Documents Clear</span>
                            </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {[
                                { icon: Calendar, val: vehicle.year, label: "Model Year" },
                                { icon: Gauge, val: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} KM` : "N/A", label: "Kilometers" },
                                { icon: Fuel, val: vehicle.fuelType, label: "Engine Fuel" },
                                { icon: Zap, val: vehicle.transmission, label: "Transmission" }
                            ].map((spec, i) => (
                                <div key={i} className="flex flex-col p-5 rounded-3xl bg-white border border-zinc-100 shadow-sm transition-all hover:border-[#16acd4]/20 hover:shadow-md">
                                    <spec.icon className="w-5 h-5 text-[#16acd4] mb-3" />
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{spec.label}</span>
                                    <span className="text-sm font-bold text-zinc-900">{spec.val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Price Area */}
                        <div className="mb-12 p-8 rounded-[2.5rem] bg-zinc-900 text-white relative overflow-hidden shadow-2xl shadow-zinc-200">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#16acd4]/20 to-transparent skew-x-12" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    {vehicle.sellingMode === "AUCTION" ? (
                                        <div className="flex items-center gap-2 text-amber-500">
                                            <Tag className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Open For Bidding</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-blue-400">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Direct Buy Ready</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pb-1.5">Value Est.</span>
                                    <span className="text-5xl font-black tracking-tighter">₹{((vehicle.sellingMode === "FIXED" ? vehicle.fixedPrice : vehicle.basePrice) || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <p className="text-xs font-medium text-zinc-500">Price excluding insurance and registration transer fees.</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button className="flex-1 py-4 bg-[#16acd4] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 shadow-xl shadow-amber-500/20">
                                <MessageSquare className="w-5 h-5" />
                                Inquire Now
                            </button>
                            <button className="w-14 h-14 rounded-2xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button className="w-14 h-14 rounded-2xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 transition-all">
                                <Info className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Description Area */}
                <div className="mt-32 pt-20 border-t border-zinc-100">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-8">Executive Summary</h2>
                        <div className="prose prose-zinc prose-lg leading-relaxed text-zinc-500">
                            {vehicle.description || "No additional description provided by the company."}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
                            <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                                <h3 className="font-bold text-zinc-900 flex items-center gap-3 mb-4">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> Certified Points
                                </h3>
                                <ul className="space-y-2 text-sm text-zinc-500">
                                    <li>• Single Owner Certificate</li>
                                    <li>• Full Service History Available</li>
                                    <li>• Non-Accidental Declaration</li>
                                    <li>• OEM Standards Verification</li>
                                </ul>
                            </div>
                            <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                                <h3 className="font-bold text-zinc-900 flex items-center gap-3 mb-4">
                                    <Info className="w-5 h-5 text-zinc-400" /> Key Features
                                </h3>
                                <ul className="space-y-2 text-sm text-zinc-500 uppercase tracking-tighter">
                                    <li>• {vehicle.fuelType} Engine</li>
                                    <li>• {vehicle.transmission} Gearbox</li>
                                    <li>• Central Locking System</li>
                                    <li>• Standard Safety Suite</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
