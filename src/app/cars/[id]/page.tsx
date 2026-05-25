"use client"

import { useState, useEffect, use } from "react"
import { Navbar } from "@/components/layout/navbar"
import {
    ChevronLeft, Share2, MapPin, Calendar, Gauge, Fuel, Zap,
    ShieldCheck, Activity, Wrench, CheckCircle2, Phone, MessageSquare,
    Send, Loader2, Play, Sparkles, Star, Eye, FileText, Download,
    Award, Shield, Cog, Droplets, Info, Thermometer, User, ClipboardCheck,
    Lock, Banknote, History, ExternalLink, PlayCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { WishlistButton } from "@/components/shared/WishlistButton"
import { EMICalculator } from "@/components/shared/EMICalculator"

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [vehicle, setVehicle] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)
    const [currentUser, setCurrentUser] = useState<{ name: string; mobile?: string } | null>(null)

    // Inquiry Form State
    const [inquiry, setInquiry] = useState({ name: "", mobile: "", message: "" })
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    useEffect(() => {
        fetch(`/api/vehicles/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.vehicle) setVehicle(data.vehicle)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))

        // Auto-detect logged in user
        fetch("/api/auth/me")
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.user && data.user.role === "CLIENT") {
                    setCurrentUser(data.user)
                    setInquiry(prev => ({
                        ...prev,
                        name: data.user.name || "",
                        mobile: data.user.mobile || "",
                    }))
                }
            })
            .catch(() => { })
    }, [id])

    const handleInquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        try {
            const res = await fetch("/api/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vehicleId: id,
                    customerName: inquiry.name,
                    customerMobile: inquiry.mobile,
                    message: inquiry.message
                })
            })
            if (res.ok) setSent(true)
        } catch (error) {
            console.error("Inquiry failed", error)
        } finally {
            setSending(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
        </div>
    )

    if (!vehicle) return (
        <div className="min-h-screen bg-white flex items-center justify-center text-slate-900 font-bold">
            Asset not found
        </div>
    )

    const images = (() => { try { return JSON.parse(vehicle.images || '[]') } catch { return [] } })()
    const metadata = (() => { try { return JSON.parse(vehicle.metadata || '{}') } catch { return {} } })()
    const modifications = (() => { try { return JSON.parse(vehicle.modifications || '[]') } catch { return [] } })()
    const safetyFeatures = metadata.safetyFeatures || []
    const comfortFeatures = metadata.comfortFeatures || []
    const inspection = metadata.inspectionDetails || {}

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 md:px-[88px] mb-[70px] mt-[120px]">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-3 px-1">
                            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                            <span className="opacity-30">/</span>
                            <Link href="/cars" className="hover:text-slate-900 transition-colors">Inventory</Link>
                            <span className="opacity-30">/</span>
                            <span className="text-slate-600">{vehicle.make}</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 mb-0 uppercase">
                            {vehicle.title}
                        </h1>
                    </div>
                    <div className="flex flex-col md:items-end gap-4">
                        <div className="flex items-center gap-6">
                            <div className="text-left md:text-right">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Retail Price</div>
                                <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">₹{vehicle.price?.toLocaleString('en-IN')}</div>
                            </div>
                            <div className="h-12 w-[1px] bg-slate-100 hidden sm:block"></div>
                            <div className="flex items-center gap-3">
                                <WishlistButton vehicleId={vehicle.id} variant="full" className="!bg-white !border-slate-200 !shadow-sm hover:!border-[#ff4b55] transition-all !font-bold !px-6 !py-4 !rounded-xl" />
                                <button className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#ff4b55] hover:border-[#ff4b55] transition-all shadow-sm">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

                    {/* Left Side: Media & Details */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Interactive Gallery */}
                        <div className="space-y-6">
                            <div className="relative aspect-[16/9] bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm group/main">
                                {images[activeImage] ? (
                                    <img 
                                        src={images[activeImage]} 
                                        alt={vehicle.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-black uppercase tracking-widest text-sm">No Media Available</div>
                                )}

                                {vehicle.videoUrl && (
                                    <a 
                                        href={vehicle.videoUrl} 
                                        target="_blank" 
                                        className="absolute bottom-8 right-8 px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#ff4b55] transition-all group/vid"
                                    >
                                        <PlayCircle className="w-5 h-5 group-hover/vid:scale-110 transition-transform" />
                                        Watch Experience
                                    </a>
                                )}

                                {/* Premium Badges */}
                                <div className="absolute top-8 left-8 flex flex-col gap-3">
                                    {vehicle.isFeatured && (
                                        <div className="px-6 py-2.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl text-[#ff4b55] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#ff4b55] animate-pulse"></div>
                                            Premium Selection
                                        </div>
                                    )}
                                    {vehicle.pdiStatus === "Yes" && (
                                        <div className="px-6 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 shadow-2xl border border-white/10">
                                            <ShieldCheck className="w-4 h-4 text-[#ff4b55]" /> PDI Certified
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative w-32 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? "border-[#ff4b55] scale-105 shadow-xl ring-4 ring-[#ff4b55]/10" : "border-transparent opacity-40 hover:opacity-100"}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Attribute Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: Calendar, label: "Model Year", value: vehicle.year },
                                { icon: Gauge, label: "Odometer", value: `${vehicle.mileage?.toLocaleString()} km` },
                                { icon: Fuel, label: "Fuel Type", value: vehicle.fuelType },
                                { icon: Cog, label: "Transmission", value: vehicle.transmission },
                                { icon: Zap, label: "Engine CC", value: vehicle.engineCC ? `${vehicle.engineCC} cc` : null },
                                { icon: User, label: "Owner", value: vehicle.ownerType },
                                { icon: ClipboardCheck, label: "Seating", value: vehicle.seatingCapacity ? `${vehicle.seatingCapacity} Seater` : null },
                                { icon: Activity, label: "Drive Type", value: vehicle.driveType },
                                { icon: Thermometer, label: "Color", value: vehicle.color },
                                { icon: MapPin, label: "Location", value: vehicle.city && vehicle.state ? `${vehicle.city}, ${vehicle.state}` : (vehicle.city || vehicle.state || null) },
                            ].filter(x => x.value).map((item, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-[#ff4b55]/20 hover:shadow-xl transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:bg-[#ff4b55]/5 group-hover:border-[#ff4b55]/10 transition-colors">
                                        <item.icon className="w-5 h-5 text-slate-400 group-hover:text-[#ff4b55] transition-colors" />
                                    </div>
                                    <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">{item.label}</div>
                                    <div className="font-bold text-slate-900 text-sm uppercase">{item.value || "N/A"}</div>
                                </div>
                            ))}
                        </div>

                        {/* Integrity Report */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-4 uppercase">
                                        Mechanical Integrity
                                    </h2>
                                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em] mt-1">Certified Diagnostic Report</p>
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[8px] font-bold text-slate-400 uppercase tracking-widest">Certified 2026</div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    { label: "Engine", grade: vehicle.engineGrade },
                                    { label: "Transmission", grade: vehicle.transmissionGrade },
                                    { label: "Exterior", grade: vehicle.exteriorGrade },
                                    { label: "Interior", grade: vehicle.interiorGrade },
                                ].map((g, i) => (
                                    <div key={i} className="flex flex-col items-center group">
                                        <div className="w-16 h-16 rounded-full border-[6px] border-slate-50 flex items-center justify-center text-xl font-bold text-slate-900 relative mb-4 transition-transform group-hover:scale-110 duration-500 shadow-inner">
                                            {g.grade || "A"}
                                            <div className={`absolute inset-[-6px] rounded-full border-t-[6px] border-[#ff4b55] rotate-[135deg]`}></div>
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 transition-colors">{g.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-5 rounded-2xl border flex items-center justify-between ${vehicle.accidentFree ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "bg-red-50 border-red-100 text-red-900"}`}>
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Accident History</span>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase">{vehicle.accidentFree ? "Clean Record" : "History Reported"}</span>
                                </div>
                                <div className={`p-5 rounded-2xl border flex items-center justify-between ${!vehicle.floodAffected ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "bg-red-50 border-red-100 text-red-900"}`}>
                                    <div className="flex items-center gap-3">
                                        <Droplets className="w-4 h-4" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Flood Status</span>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase">{!vehicle.floodAffected ? "Safe / No Damage" : "Flood Reported"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Technical Specifications overhaul */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase mb-6">
                                Detailed Specifications
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-12">
                                {[
                                    { label: "Registration No", value: vehicle.registrationNumber },
                                    { label: "RTO Location", value: vehicle.rtoLocation },
                                    { label: "Body Type", value: vehicle.bodyType },
                                    { label: "Engine Number", value: vehicle.engineNumber },
                                    { label: "Chassis / VIN", value: vehicle.chassisNumber },
                                    { label: "Insurance Co", value: vehicle.insuranceCompany },
                                    { label: "Insurance Expiry", value: vehicle.insuranceExpiry },
                                    { label: "RC Availability", value: vehicle.rcAvailable === "Yes" ? "Available" : "Not Available" },
                                    { label: "Spare Key", value: vehicle.spareKey },
                                    { label: "Last Service", value: vehicle.lastServiceDate ? `${vehicle.lastServiceDate} (${vehicle.lastServiceKM?.toLocaleString()} km)` : "Not Recorded" },
                                    { label: "Service Count", value: vehicle.serviceCount !== undefined && vehicle.serviceCount !== null ? String(vehicle.serviceCount) : null },
                                    { label: "Service Record", value: vehicle.serviceHistory },
                                    { label: "Loan Status", value: vehicle.isLoan ? `Active - ${vehicle.loanBank}` : "No Active Loan" },
                                    { label: "Location", value: vehicle.city && vehicle.state ? `${vehicle.city}, ${vehicle.state}` : (vehicle.city || vehicle.state || null) },
                                ].filter(x => x.value).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-5 border-b border-slate-50 group">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">{item.label}</span>
                                        <span className="text-xs font-black text-slate-900 uppercase transition-transform group-hover:translate-x-1">{item.value || "Not Specified"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Inspection Report Section */}
                        {(inspection.brakeCondition || inspection.tyreLifePercent || inspection.oilLeakage || inspection.accidentType || inspection.electricalAC) && (
                            <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm">
                                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase mb-6">
                                    Inspection Report
                                </h2>

                                {/* Mechanical Health */}
                                {(inspection.tyreLifePercent || inspection.batteryHealth || inspection.brakeCondition || inspection.suspensionCondition) && (
                                    <div className="mb-6">
                                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">Mechanical Health</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {inspection.tyreLifePercent && (
                                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                                                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Tyre Life</div>
                                                    <div className="text-lg font-black text-slate-900">{inspection.tyreLifePercent}%</div>
                                                </div>
                                            )}
                                            {inspection.batteryHealth && (
                                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                                                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Battery Health</div>
                                                    <div className="text-lg font-black text-slate-900">{inspection.batteryHealth}%</div>
                                                </div>
                                            )}
                                            {inspection.brakeCondition && (
                                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                                                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Brakes</div>
                                                    <div className="text-sm font-black text-slate-900 uppercase">{inspection.brakeCondition}</div>
                                                </div>
                                            )}
                                            {inspection.suspensionCondition && (
                                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                                                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Suspension</div>
                                                    <div className="text-sm font-black text-slate-900 uppercase">{inspection.suspensionCondition}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Engine & Accident */}
                                {(inspection.oilLeakage || inspection.exhaustSmoke || inspection.engineNoise || inspection.accidentType) && (
                                    <div className="mb-6">
                                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">Engine &amp; History</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-12">
                                            {[
                                                { label: "Oil Leakage", value: inspection.oilLeakage },
                                                { label: "Exhaust Smoke", value: inspection.exhaustSmoke },
                                                { label: "Engine Noise", value: inspection.engineNoise },
                                                { label: "Accident Type", value: inspection.accidentType },
                                                { label: "Insurance Claim", value: inspection.insuranceClaim },
                                                { label: "Repaired At", value: inspection.repairedAt },
                                            ].filter(x => x.value).map((item, i) => (
                                                <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 group">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                                                    <span className="text-xs font-black text-slate-900 uppercase">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Electrical Systems */}
                                {(inspection.electricalAC || inspection.electricalLights || inspection.electricalWindows || inspection.electricalInfotainment) && (
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">Electrical Systems</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { label: "AC", value: inspection.electricalAC },
                                                { label: "Lights", value: inspection.electricalLights },
                                                { label: "Windows", value: inspection.electricalWindows },
                                                { label: "Infotainment", value: inspection.electricalInfotainment },
                                            ].filter(x => x.value).map((item, i) => (
                                                <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                                                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{item.label}</div>
                                                    <div className={`text-xs font-black uppercase ${
                                                        item.value === 'Excellent' ? 'text-emerald-600' :
                                                        item.value === 'Functional' ? 'text-slate-900' :
                                                        'text-red-600'
                                                    }`}>{item.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                         {/* Modifications & Upgrades Section */}
                         {modifications.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Wrench className="w-5 h-5 text-indigo-600" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-800">Bespoke Modifications</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {modifications.map((mod: string, i: number) => (
                                        <div key={i} className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between hover:shadow-lg transition-all transform hover:-translate-y-1">
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-600">{mod}</span>
                                            <Sparkles className="w-3 h-3 text-indigo-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Safety & Comfort Features */}
                        {(safetyFeatures.length > 0 || comfortFeatures.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {safetyFeatures.length > 0 && (
                                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8 flex items-center gap-3">
                                            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Safety Registry
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {safetyFeatures.map((f: string, i: number) => (
                                                <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-bold text-slate-900 uppercase tracking-widest">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {comfortFeatures.length > 0 && (
                                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8 flex items-center gap-3">
                                            <Sparkles className="w-4 h-4 text-indigo-600" /> Luxury Systems
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {comfortFeatures.map((f: string, i: number) => (
                                                <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-bold text-slate-900 uppercase tracking-widest">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Description Section */}
                        {vehicle.description && (
                            <div className="bg-slate-50 rounded-[2.5rem] p-10 md:p-14 border border-slate-100">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 block">Narrative Description</label>
                                <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{vehicle.description}</p>
                            </div>
                        )}

                        {/* Functional Modules */}
                        <div id="calculator-section">
                            <EMICalculator price={vehicle.price} className="!p-10 md:!p-14 !rounded-[2.5rem]" />
                        </div>
                    </div>

                    {/* Right Side: Action Console */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Summary Sticky */}
                        <div className="sticky top-12 space-y-8">

                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-all duration-700">
                                    <Sparkles className="w-32 h-32" />
                                </div>

                                <div className="relative z-10">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-3">Final Offer</div>
                                    <div className="text-4xl font-black text-white mb-8 tracking-tighter">₹{vehicle.price?.toLocaleString('en-IN')}</div>

                                    <div className="space-y-5 mb-10 pb-10 border-b border-white/5">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                                            <span>Asset ID</span>
                                            <span className="text-white">#AV-{vehicle.id?.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                                            <span>Views</span>
                                            <span className="text-white flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> {vehicle.views || 0}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[9px] text-center text-white/40 uppercase tracking-widest font-black">Professional Grade Certificate</p>
                                    </div>
                                </div>
                            </div>

                            {/* Inquiry Console */}
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-8">Send Inquiry</h3>
                                {sent ? (
                                    <div className="text-center py-10 bg-emerald-50 rounded-3xl border border-emerald-100">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                                        <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest">Inquiry Sent!</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleInquirySubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <input
                                                required
                                                placeholder="Your Name"
                                                value={inquiry.name}
                                                onChange={e => setInquiry({ ...inquiry, name: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                            />
                                            <input
                                                required
                                                placeholder="Mobile Number"
                                                value={inquiry.mobile}
                                                onChange={e => setInquiry({ ...inquiry, mobile: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                            />
                                            <textarea
                                                placeholder="Ask your query here..."
                                                rows={4}
                                                value={inquiry.message}
                                                onChange={e => setInquiry({ ...inquiry, message: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium focus:bg-white focus:border-[#ff4b55] outline-none resize-none transition-all shadow-inner"
                                            />
                                        </div>
                                        <button
                                            disabled={sending}
                                            className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-4 shadow-xl shadow-slate-200"
                                        >
                                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#ff4b55]" />}
                                            Send Signal
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Custodian Segment */}
                            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-inner">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm relative">
                                    <Award className="w-7 h-7 text-[#ff4b55]" />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Dealer</div>
                                    {vehicle.dealer?.dealerPage?.slug ? (
                                        <Link
                                            href={`/dealer/${vehicle.dealer.dealerPage.slug}`}
                                            className="text-sm font-black text-slate-900 uppercase line-clamp-1 hover:text-[#ff4b55] transition-colors"
                                        >
                                            {vehicle.dealer?.dealerBusinessName || vehicle.dealer?.name || "Premium Enterprise"}
                                        </Link>
                                    ) : (
                                        <div className="text-sm font-black text-slate-900 uppercase line-clamp-1">
                                            {vehicle.dealer?.dealerBusinessName || vehicle.dealer?.name || "Premium Enterprise"}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-100 p-5 md:hidden z-50 flex gap-4 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
                <button className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] active:scale-95">
                    Contact Seller
                </button>
                <button className="w-16 h-16 bg-[#ff4b55] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95">
                    <Phone className="w-6 h-6" />
                </button>
            </div>

        </div>
    )
}
