"use client"

import { useEffect, useState } from "react"
import { Star, ExternalLink, ShieldCheck, MessageSquarePlus, Sparkles, CheckCircle2 } from "lucide-react"

interface ReviewItem {
    id: string
    authorName: string
    authorPhoto?: string | null
    rating: number
    text: string
    relativeTime?: string | null
    source: string
}

interface GoogleReviewData {
    settings: {
        rating: number
        totalReviews: number
        placeName: string
        writeReviewUrl: string
        showOnHome: boolean
        homeSectionTitle: string
        homeSectionDesc: string
    }
    reviews: ReviewItem[]
}

// Google Official Multi-Color "G" Icon
function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
            />
        </svg>
    )
}

export default function GoogleReviewsSection() {
    const [data, setData] = useState<GoogleReviewData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        async function fetchReviews() {
            try {
                const res = await fetch("/api/public/google-reviews")
                if (res.ok) {
                    const json = await res.json()
                    if (isMounted && json.success) {
                        setData(json)
                    }
                }
            } catch (err) {
                console.error("Failed to load Google Reviews:", err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchReviews()
        return () => {
            isMounted = false
        }
    }, [])

    if (!loading && data && !data.settings.showOnHome) {
        return null
    }

    const reviews = data?.reviews || []
    const settings = data?.settings || {
        rating: 4.9,
        totalReviews: 120,
        placeName: "Detailing Garage Mandi",
        writeReviewUrl: "https://maps.google.com/?q=Detailing+Garage+Mandi",
        homeSectionTitle: "Google Reviews & Client Stories",
        homeSectionDesc: "Real, unfiltered 5-star experiences from car owners across Himachal who trusted us with their machines.",
    }

    // Double list for infinite seamless marquee loop
    const marqueeList = reviews.length > 0 ? [...reviews, ...reviews] : []

    return (
        <section className="py-24 px-6 md:px-14 bg-[#09090b] border-t border-white/5 relative overflow-hidden">
            {/* Ambient Cyan/Gold Glow */}
            <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-[#16acd4]/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/3 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-[130px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-14 gap-8">
                    <div>
                        {/* Live Google Badge */}
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md mb-4 shadow-inner">
                            <GoogleIcon className="w-4 h-4" />
                            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-zinc-200">
                                Google Verified Reviews
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 font-display text-white">
                            {settings.homeSectionTitle || "Google Reviews & Client Stories"}
                        </h2>
                        <p className="text-zinc-400 max-w-2xl text-sm md:text-base font-light leading-relaxed">
                            {settings.homeSectionDesc ||
                                "Real, unfiltered experiences from car owners across Himachal who trusted our studio with their vehicles."}
                        </p>
                    </div>

                    {/* Google Rating Summary & Action Button */}
                    <div className="flex flex-wrap items-center gap-4 bg-[#121214] border border-white/10 p-4 rounded-2xl shadow-xl">
                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-2xl font-black text-white">{settings.rating.toFixed(1)}</span>
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                </div>
                                <span className="text-[11px] text-zinc-400 font-medium">
                                    Based on {settings.totalReviews}+ Google Reviews
                                </span>
                            </div>
                        </div>

                        {/* Leave a review button */}
                        <a
                            href={settings.writeReviewUrl || "https://maps.google.com/?q=Detailing+Garage+Mandi"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 bg-gradient-to-r from-[#16acd4] to-[#0f80a0] hover:from-[#19bde9] hover:to-[#1293b7] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-[#16acd4]/30 active:scale-95"
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            Review Us on Google
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                        </a>
                    </div>
                </div>

                {/* Reviews Marquee Track */}
                {marqueeList.length > 0 ? (
                    <div className="relative w-full overflow-hidden group">
                        {/* Side fade masks */}
                        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-[#09090b] to-transparent z-20" />
                        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-[#09090b] to-transparent z-20" />

                        {/* Moving Track */}
                        <div className="flex gap-6 py-4 animate-stories-scroll w-max group-hover:[animation-play-state:paused]">
                            {marqueeList.map((review, i) => (
                                <div
                                    key={`${review.id}-${i}`}
                                    className="w-[320px] sm:w-[380px] md:w-[420px] shrink-0 bg-[#121214]/90 backdrop-blur-xl border border-white/10 hover:border-[#16acd4]/60 p-6 md:p-7 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-[#16acd4]/15 flex flex-col justify-between group/card relative"
                                >
                                    {/* Top row: Author & Google Icon */}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            {review.authorPhoto ? (
                                                <img
                                                    src={review.authorPhoto}
                                                    alt={review.authorName}
                                                    referrerPolicy="no-referrer"
                                                    className="w-11 h-11 rounded-full object-cover border border-white/20 bg-zinc-800"
                                                    onError={(e) => {
                                                        const target = e.currentTarget
                                                        target.onerror = null
                                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.authorName)}&background=16acd4&color=fff&bold=true`
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#16acd4]/30 to-purple-500/30 border border-white/15 flex items-center justify-center font-bold text-white text-base">
                                                    {review.authorName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="text-sm md:text-base font-bold text-white tracking-wide">
                                                        {review.authorName}
                                                    </h4>
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16acd4]" />
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-zinc-400 font-medium">
                                                        {review.relativeTime || "Verified Google Review"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Google Multi-Color G Icon */}
                                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover/card:bg-white/10 transition-colors">
                                            <GoogleIcon className="w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* Star Rating */}
                                    <div className="flex items-center gap-1 mb-3">
                                        {[...Array(5)].map((_, sIndex) => (
                                            <Star
                                                key={sIndex}
                                                className={`w-3.5 h-3.5 ${
                                                    sIndex < review.rating
                                                        ? "text-amber-400 fill-amber-400"
                                                        : "text-zinc-700"
                                                }`}
                                            />
                                        ))}
                                        <span className="text-[11px] font-semibold text-zinc-400 ml-1.5">
                                            {review.rating}.0
                                        </span>
                                    </div>

                                    {/* Review Text */}
                                    <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed line-clamp-4 group-hover/card:line-clamp-none transition-all duration-300">
                                        "{review.text}"
                                    </p>

                                    {/* Verified Tag at Bottom */}
                                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                                        <span className="inline-flex items-center gap-1 text-emerald-400/90 font-medium text-[10px] uppercase tracking-wider">
                                            <ShieldCheck className="w-3 h-3" /> 100% Genuine Review
                                        </span>
                                        <span className="text-[10px] text-zinc-500">Posted on Google Maps</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center text-zinc-500 text-sm">
                        Loading verified Google reviews...
                    </div>
                )}

                {/* Bottom Trust Row */}
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#16acd4]" />
                        <span>All reviews are auto-synced directly from our official Google Business profile.</span>
                    </div>
                    <a
                        href={settings.writeReviewUrl || "https://maps.google.com/?q=Detailing+Garage+Mandi"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#16acd4] hover:underline flex items-center gap-1 font-medium"
                    >
                        View all reviews on Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </section>
    )
}
