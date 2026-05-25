"use client"

import Link from "next/link"
import { CheckCircle, MapPin, Car, Users, Star, ChevronRight } from "lucide-react"

interface Dealer {
    id: string
    businessName: string
    slug: string
    logoUrl?: string
    coverUrl?: string
    isFeatured?: boolean
    isVerified?: boolean
    city?: string
    state?: string
    vehicleCount: number
    followerCount: number
    avgRating?: number
}

interface Props {
    dealers: Dealer[]
}

export default function FeaturedDealersSection({ dealers }: Props) {
    if (dealers.length === 0) return null

    return (
        <section className="py-24 px-6 md:px-14" style={{ background: 'linear-gradient(180deg, #060a14 0%, #0d1828 100%)' }}>
            <div className="text-center mb-14 section-reveal">
                <div className="inline-flex items-center gap-3 mb-4">
                    <span className="w-8 h-0.5 rounded" style={{ backgroundColor: '#c9921e' }} />
                    <span className="text-xs font-semibold tracking-[2.5px] uppercase" style={{ color: '#c9921e' }}>Trusted Sellers</span>
                    <span className="w-8 h-0.5 rounded" style={{ backgroundColor: '#c9921e' }} />
                </div>
                <h2 className="font-display text-[clamp(36px,5vw,52px)] tracking-[3px] text-white">Featured <span style={{ color: '#c9921e' }}>Dealers</span></h2>
                <p className="max-w-[500px] mx-auto mt-4 text-[15px] leading-relaxed font-light" style={{ color: '#6b7280' }}>
                    Connect directly with verified dealers and browse their full inventory.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
                {dealers.map((d) => {
                    const initials = d.businessName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                    return (
                        <Link key={d.id} href={`/dealer/${d.slug}`}
                            className="group block rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_24px_60px_rgba(0,0,0,0.5)] section-reveal"
                            style={{ background: 'linear-gradient(145deg, #0c1a2e, #081122)', border: '1px solid rgba(201,146,30,0.15)' }}
                        >
                            {/* Cover */}
                            <div className="relative h-32 overflow-hidden">
                                {d.coverUrl ? (
                                    <img src={d.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #0f2e4f, #1a4a7a)' }} />
                                )}
                                {d.isFeatured && (
                                    <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full" style={{ background: 'rgba(201,146,30,0.9)', color: '#000' }}>★ Featured</span>
                                )}
                                {/* Logo overlay */}
                                <div className="absolute -bottom-5 left-4 w-11 h-11 rounded-xl border-2 overflow-hidden" style={{ borderColor: '#081122' }}>
                                    {d.logoUrl ? (
                                        <img src={d.logoUrl} alt={d.businessName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-black" style={{ background: 'linear-gradient(135deg,#c9921e,#f3d090)', color: '#122033' }}>{initials}</div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-7 pb-5 px-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-white text-sm truncate">{d.businessName}</h3>
                                    {d.isVerified && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#c9921e' }} />}
                                </div>
                                {d.city && (
                                    <p className="text-xs flex items-center gap-1" style={{ color: '#6b7280' }}>
                                        <MapPin className="w-3 h-3" /> {d.city}{d.state ? `, ${d.state}` : ''}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 pt-1 flex-wrap">
                                    <span className="text-xs flex items-center gap-1" style={{ color: '#6b7280' }}><Car className="w-3 h-3" /> {d.vehicleCount}</span>
                                    <span className="text-xs flex items-center gap-1" style={{ color: '#6b7280' }}><Users className="w-3 h-3" /> {d.followerCount}</span>
                                    {d.avgRating && <span className="text-xs font-bold flex items-center gap-1 ml-auto" style={{ color: '#c9921e' }}><Star className="w-3 h-3" style={{ fill: '#c9921e' }} />{d.avgRating}</span>}
                                </div>
                                <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                    <span className="text-xs font-bold group-hover:text-amber-300 transition-colors" style={{ color: '#c9921e' }}>Visit Page →</span>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            <div className="mt-12 text-center">
                <Link href="/dealers" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] hover:text-white transition-all group" style={{ color: '#6b7280' }}>
                    Explore All Dealers <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </section>
    )
}
