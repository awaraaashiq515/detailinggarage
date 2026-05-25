"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import {
    Car, Fuel, Gauge, Calendar, Settings, ArrowLeft, Loader2,
    CheckCircle2, ShieldCheck, Gavel, Tag, ClipboardList, Clock,
    Star, Info, ChevronLeft, ChevronRight, IndianRupee, Building2,
    MapPin, Hash, Users, Palette, FileText, Wrench, AlertCircle,
    BadgeCheck, PackageCheck, TrendingUp, Eye, Layers, Zap,
    Share2, ShieldAlert, Check, ArrowRight
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

const CRIMSON = "#991b1b"
const CRIMSON_LIGHT = "#dc2626"

export default function MarketplaceVehicleDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [vehicle, setVehicle] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeImg, setActiveImg] = useState(0)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/public/company-stock/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.vehicle) setVehicle(data.vehicle)
                }
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b]">
                <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-red-600" />
                    <div className="absolute inset-0 bg-red-600 blur-[20px] opacity-20" />
                </div>
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Retrieving Vehicle Signature...</p>
            </div>
        )
    }

    if (!vehicle) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#09090b]">
                <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8 rotate-12 transition-transform hover:rotate-0 duration-500">
                    <ShieldAlert className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Asset Not Found</h1>
                <p className="mb-10 max-w-sm text-center text-zinc-500 font-medium">
                    This vehicle may have been successfully acquired or moved to the private archive.
                </p>
                <Link href="/marketplace"
                    className="px-10 py-4 rounded-[1.5rem] bg-red-600 text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-red-700 active:scale-95 shadow-xl shadow-red-900/20">
                    Explore Marketplace
                </Link>
            </div>
        )
    }

    const images = (() => { try { return JSON.parse(vehicle.images || '[]') } catch { return [] } })()
    const partsRefurbished: any[] = (() => { try { return JSON.parse(vehicle.partsRefurbished || '[]') } catch { return [] } })()

    const modeMap: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string; actionLabel: string; priceLabel: string }> = {
        FIXED: { label: 'Fixed Price', icon: <Tag className="w-4 h-4" />, color: '#dc2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.2)', actionLabel: '🛍️ Acquire via Dealer Portal', priceLabel: 'Listing Price' },
        RATE_REQUEST: { label: 'Rate Request', icon: <ClipboardList className="w-4 h-4" />, color: '#dc2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.2)', actionLabel: '📋 Submit Rate via Dealer Portal', priceLabel: vehicle.basePrice > 0 ? 'Floor Price' : 'Open Rate' },
        AUCTION: { label: 'Live Auction', icon: <Gavel className="w-4 h-4" />, color: '#dc2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.2)', actionLabel: '🔨 Place Bid via Dealer Portal', priceLabel: 'Current Bid' },
    }
    const mode = modeMap[vehicle.sellingMode as string] || modeMap.FIXED
    const priceValue = (vehicle.fixedPrice || vehicle.basePrice || 0)

    const companyName = vehicle.company?.dealerBusinessName || vehicle.company?.name || 'Company'
    const companyLocation = [vehicle.company?.dealerCity, vehicle.company?.dealerState].filter(Boolean).join(', ')

    const InfoRow = ({ icon, label, value }: any) => value ? (
        <div className="flex items-center justify-between py-4 border-b border-white/[0.03]">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">{icon}</div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
            </div>
            <span className="text-sm font-black text-white text-right">{value}</span>
        </div>
    ) : null

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-40">
                {/* ── Breadcrumb & Utility ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <button onClick={() => router.back()} className="group flex items-center gap-4 text-zinc-500 hover:text-white transition-all">
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600/50 group-hover:bg-red-600/10">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit to Discovery</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <button className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                            <Share2 className="w-4 h-4 text-zinc-400" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* ── LEFT: Visuals & Depth (7 cols) ── */}
                    <div className="lg:col-span-7 space-y-12">
                        {/* Hero Image Section */}
                        <div className="space-y-6">
                            <div className="relative aspect-[16/10] rounded-[3rem] overflow-hidden border border-white/5 group shadow-2xl">
                                {images[activeImg] ? (
                                    <img src={images[activeImg]} alt={vehicle.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                ) : (
                                    <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center">
                                        <Car className="w-24 h-24 text-white/5" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                                {/* Mode Overlays */}
                                <div className="absolute top-8 left-8 flex flex-col gap-3">
                                    <div className="px-5 py-2 rounded-full border border-red-900/40 bg-red-950/40 backdrop-blur-xl flex items-center gap-3 ring-4 ring-black/50">
                                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">{mode.label}</span>
                                    </div>
                                    {vehicle.isFeatured && (
                                        <div className="px-4 py-2 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                                            <Star className="w-3.5 h-3.5 fill-black" /> Premium Listing
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                {images.length > 1 && (
                                    <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)} className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-red-600/20 hover:border-red-600/40 transition-all active:scale-90">
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => setActiveImg(i => (i + 1) % images.length)} className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-red-600/20 hover:border-red-600/40 transition-all active:scale-90">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="px-5 py-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black tracking-widest">
                                            {activeImg + 1} <span className="text-zinc-500 mx-1">/</span> {images.length} <span className="text-zinc-500 ml-2 uppercase">Capacities</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                {images.map((img: string, i: number) => (
                                    <button key={i} onClick={() => setActiveImg(i)} className={`relative flex-shrink-0 w-24 h-24 rounded-[1.5rem] overflow-hidden border-2 transition-all duration-300 ${activeImg === i ? 'border-red-600 scale-105 shadow-lg shadow-red-900/20' : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'}`}>
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Core Specs Grid ── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { icon: <Calendar className="w-5 h-5 text-red-600" />, label: 'Release Year', val: vehicle.year },
                                { icon: <Fuel className="w-5 h-5 text-red-600" />, label: 'Engine Diet', val: vehicle.fuelType },
                                { icon: <Settings className="w-5 h-5 text-red-600" />, label: 'Transmission', val: vehicle.transmission?.slice(0, 9) },
                                { icon: <Gauge className="w-5 h-5 text-red-600" />, label: 'Distance Traveled', val: `${(vehicle.mileage || 0).toLocaleString()} km` },
                            ].map(spec => (
                                <div key={spec.label} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-red-600/[0.03] hover:border-red-600/20 transition-all">
                                    {spec.icon}
                                    <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">{spec.label}</p>
                                    <p className="text-lg font-black text-white">{spec.val || 'N/A'}</p>
                                </div>
                            ))}
                        </div>

                        {/* ── Description ── */}
                        <div className="p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 space-y-6">
                            <div className="flex items-center gap-3">
                                <Info className="w-5 h-5 text-red-600" />
                                <h3 className="text-lg font-black uppercase tracking-widest">Asset Narrative</h3>
                            </div>
                            <p className="text-zinc-500 leading-relaxed font-medium">
                                {vehicle.description || vehicle.listingNarrative || "Performance meets precision. This curated asset is maintained to the highest standards, ensuring a seamless transition to its next owner. Detailed service records and technical evaluations are available for verification."}
                            </p>
                        </div>

                        {/* ── Technical Blueprint ── */}
                        <div className="p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5">
                            <div className="flex items-center gap-4 mb-10">
                                <Layers className="w-6 h-6 text-red-600" />
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-[0.2em]">Technical Blueprint</h3>
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1">Full mechanical & physical specifications</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                <div>
                                    <InfoRow icon={<Car className="w-3.5 h-3.5" />} label="Category" value={vehicle.vehicleType} />
                                    <InfoRow icon={<Layers className="w-3.5 h-3.5" />} label="Body Architecture" value={vehicle.bodyType} />
                                    <InfoRow icon={<Palette className="w-3.5 h-3.5" />} label="Exterior Hue" value={vehicle.color} />
                                    <InfoRow icon={<Settings className="w-3.5 h-3.5" />} label="Engine Displacement" value={vehicle.engineCC ? `${vehicle.engineCC} cc` : null} />
                                </div>
                                <div>
                                    <InfoRow icon={<Users className="w-3.5 h-3.5" />} label="Hierarchy" value={vehicle.ownerType} />
                                    <InfoRow icon={<IndianRupee className="w-3.5 h-3.5" />} label="Market Valuation" value={vehicle.commercialValuation ? `₹ ${vehicle.commercialValuation.toLocaleString()}` : null} />
                                    <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Origin State" value={vehicle.stateOfRegistration} />
                                    <InfoRow icon={<BadgeCheck className="w-3.5 h-3.5" />} label="Asset Condition" value={vehicle.condition} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Acquisition & Integrity (5 cols) ── */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Status Card */}
                        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-[#121214] to-[#09090b] border border-white/5 shadow-2xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px]" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Active Inventory Item</span>
                                </div>
                                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">{vehicle.title}</h1>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-zinc-500 border border-white/5">{vehicle.make}</span>
                                    <span className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-zinc-500 border border-white/5">{vehicle.variant}</span>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">{mode.priceLabel}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-black text-red-600">₹</span>
                                    <span className="text-5xl font-black tracking-tighter">{priceValue.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {vehicle.bidDeadline && (
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-red-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Acquisition Deadline</span>
                                    </div>
                                    <span className="text-xs font-black">{new Date(vehicle.bidDeadline).toLocaleDateString()}</span>
                                </div>
                            )}

                            <Link href="/dealer/marketplace" className="w-full h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl shadow-red-900/20">
                                {mode.actionLabel}
                                <ArrowRight className="w-5 h-5" />
                            </Link>

                            <p className="text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Authorized dealer authentication required</p>
                        </div>

                        {/* Integrity Passport */}
                        <div className="p-10 rounded-[3rem] bg-white/[0.01] border border-white/5 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                    <h3 className="text-lg font-black uppercase tracking-widest">Asset Integrity</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { label: 'Documentation (RC)', status: vehicle.rcStatus === 'ORIGINAL', detail: 'Original RC' },
                                    { label: 'Insurance Validation', status: vehicle.insuranceStatus === 'ACTIVE', detail: 'Valid Policy' },
                                    { label: 'Collision Integrity', status: vehicle.accidentHistory === 'NO', detail: 'Untouched Chassis' },
                                    { label: 'Title Clearance', status: vehicle.hypothecationStatus === 'NO', detail: 'Clean Registry' },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase mb-0.5">{item.label}</p>
                                            <p className="text-xs font-black uppercase tracking-tighter text-zinc-300">{item.detail}</p>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Origin details */}
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Authenticated Partner</p>
                                <h4 className="text-base font-black uppercase">{companyName}</h4>
                                <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-widest"><MapPin className="w-3 h-3 inline mr-1" />{companyLocation}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
