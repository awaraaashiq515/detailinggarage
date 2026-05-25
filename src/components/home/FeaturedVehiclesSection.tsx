"use client"

import Link from "next/link"
import { MapPin, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from "lucide-react"
import { useRef } from "react"
import { WishlistButton } from "@/components/shared/WishlistButton"

interface Vehicle {
    id: string
    title: string
    price: number
    images?: string
    year?: number
    fuelType?: string
    transmission?: string
    mileage?: number
    vehicleType: 'CAR' | 'BIKE'
    dealer: {
        name: string
        dealerBusinessName?: string
        dealerPage?: {
            slug: string
        }
    }
    city?: string
    state?: string
}

interface Props {
    vehicles: Vehicle[]
    type: 'CAR' | 'BIKE'
    title?: string
    subtitle?: string
}

export default function FeaturedVehiclesSection({ vehicles, type, title, subtitle }: Props) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const filtered = vehicles.filter(v => v.vehicleType === type)
    if (filtered.length === 0) return null

    const isCar = type === 'CAR'
    const displayTitle = title || "Our Recent Masterpieces"
    const displaySubtitle = subtitle || "Explore our latest detailing and protection projects. Flawless finishes, guaranteed."

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const firstChild = scrollContainerRef.current.firstElementChild as HTMLElement | null
            const itemWidth = firstChild ? firstChild.offsetWidth + 24 : 350
            const scrollAmount = direction === 'left' ? -itemWidth : itemWidth
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    return (
        <section className="py-24 px-6 md:px-14 bg-zinc-950 border-t border-zinc-900">
            <div className="max-w-7xl mx-auto relative cursor-default">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 section-reveal gap-6">
                    <div className="text-left max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-10 h-[2px] bg-[#16acd4]"></span>
                            <span className="text-[#16acd4] text-xs font-black uppercase tracking-widest whitespace-nowrap">Studio Showcase</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">{displayTitle}</h2>
                        <p className="text-zinc-400 text-lg font-medium leading-relaxed opacity-90">
                            {displaySubtitle}
                        </p>
                    </div>

                    {filtered.length > 4 && (
                        <div className="hidden md:flex gap-3">
                            <button
                                onClick={() => scroll('left')}
                                className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-[#16acd4] hover:border-[#16acd4] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-[#16acd4] hover:border-[#16acd4] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>

                {filtered.length > 4 && (
                    <div className="flex gap-4 md:hidden mb-8 justify-end">
                        <button
                            onClick={() => scroll('left')}
                            className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 active:bg-zinc-800"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 active:bg-zinc-800"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                )}

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 pt-4 w-full"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {filtered.map((vehicle, idx) => {
                        const imgs = (() => { try { return JSON.parse(vehicle.images || '[]') } catch { return [] } })()
                        const thumb = imgs[0] || "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop"

                        // Spec chips
                        const chips = [
                            "Ceramic Coated",
                            "Paint Correction",
                        ]

                        return (
                            <Link
                                key={vehicle.id}
                                href={`/${isCar ? 'cars' : 'bikes'}/${vehicle.id}`}
                                className="w-[85vw] md:w-[calc(50%_-_12px)] lg:w-[calc(33.333%_-_16px)] snap-start shrink-0 group block bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl hover:border-[#16acd4]/50 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(22, 172, 212,0.15)] transition-all duration-500 section-reveal relative"
                                style={{ transitionDelay: `${(idx % 3) * 0.15}s` }}
                            >
                                {/* Hover glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#16acd4]/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />

                                {/* Image */}
                                <div className="relative bg-zinc-950 overflow-hidden z-10" style={{ aspectRatio: '16/10' }}>
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                    <img
                                        src={thumb}
                                        alt={vehicle.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                    />
                                    <div className="absolute top-4 right-4 z-20" onClick={e => e.preventDefault()}>
                                        <WishlistButton
                                            vehicleId={vehicle.id}
                                            className="!w-10 !h-10 !border-none !rounded-full !bg-zinc-950/80 !text-white hover:!bg-[#16acd4] hover:!text-black !backdrop-blur-md transition-colors"
                                        />
                                    </div>
                                    {/* Dealer badge / Master Tech */}
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <div className="bg-zinc-950/80 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg">
                                            <Sparkles className="w-4 h-4 text-[#16acd4] shrink-0" />
                                            <span className="text-xs font-bold text-white tracking-widest uppercase">
                                                Premium Finish
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 relative z-10">
                                    {/* Title */}
                                    <h3 className="font-black text-white text-xl leading-snug mb-4 line-clamp-2 group-hover:text-[#16acd4] transition-colors tracking-tight">
                                        {vehicle.year && <span>{vehicle.year} </span>}
                                        {vehicle.title}
                                    </h3>

                                    {/* Spec Chips */}
                                    {chips.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {chips.map((chip, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                                    {chip}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[#16acd4] text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-2">
                                            View Details <ChevronRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </section>
    )
}
