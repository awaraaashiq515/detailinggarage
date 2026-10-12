"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import {
    RefreshCw,
    Save,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Eye,
    EyeOff,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Sparkles,
    ArrowLeft,
    Star,
    MessageSquare,
    Trash2,
    Plus,
    ShieldCheck
} from "lucide-react"
import Link from "next/link"

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

interface Review {
    id: string
    authorName: string
    authorPhoto?: string | null
    rating: number
    text: string
    relativeTime?: string | null
    source: string
    isVisible: boolean
    isFeatured: boolean
    createdAt: string
}

export default function GoogleReviewsSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [showApiKey, setShowApiKey] = useState(false)
    const [showGuide, setShowGuide] = useState(false)
    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState({ totalReviewsCount: 0, visibleReviewsCount: 0 })

    // New manual review form modal
    const [showAddModal, setShowAddModal] = useState(false)
    const [newReview, setNewReview] = useState({
        authorName: "",
        rating: 5,
        text: "",
        relativeTime: "1 week ago",
        authorPhoto: "",
    })

    const [formData, setFormData] = useState({
        placeId: "ChIJ054h_z_wDDkRxX9QnS_v5v4",
        placeName: "Detailing Garage Mandi",
        apiKey: "",
        rating: 4.9,
        totalReviews: 120,
        writeReviewUrl: "https://maps.google.com/?q=Detailing+Garage+Mandi",
        autoSync: true,
        syncInterval: 60,
        showOnHome: true,
        minRatingToShow: 4,
        homeSectionTitle: "Google Reviews & Client Stories",
        homeSectionDesc: "Real, unfiltered 5-star experiences from car owners across Himachal who trusted our studio with their vehicles.",
        lastSyncStatus: "IDLE",
        lastSyncMessage: "",
        lastSyncedAt: "" as string | null
    })

    useEffect(() => {
        loadSettings()
        loadReviews()
    }, [])

    async function loadSettings() {
        try {
            setLoading(true)
            const res = await fetch("/api/admin/settings/google-reviews")
            if (res.ok) {
                const data = await res.json()
                if (data.settings) {
                    setFormData({
                        placeId: data.settings.placeId || "ChIJ6WFXUSodBTkR8BDYB1vohrE",
                        placeName: data.settings.placeName || "Detailing Garage",
                        apiKey: data.settings.apiKey || "AIzaSyB3cfpMypGWOlv57GqA0suGF8LqqKjPBbw",
                        rating: Number(data.settings.rating) || 5.0,
                        totalReviews: Number(data.settings.totalReviews) || 47,
                        writeReviewUrl: data.settings.writeReviewUrl || "https://search.google.com/local/writereview?placeid=ChIJ6WFXUSodBTkR8BDYB1vohrE",
                        autoSync: data.settings.autoSync ?? true,
                        syncInterval: data.settings.syncInterval || 60,
                        showOnHome: data.settings.showOnHome ?? true,
                        minRatingToShow: data.settings.minRatingToShow || 4,
                        homeSectionTitle: data.settings.homeSectionTitle || "Google Reviews & Client Stories",
                        homeSectionDesc: data.settings.homeSectionDesc || "Real, unfiltered experiences from automobile enthusiasts who trusted us with their vehicles.",
                        lastSyncStatus: data.settings.lastSyncStatus || "SUCCESS",
                        lastSyncMessage: data.settings.lastSyncMessage || "Connected to Google Places API (Mandi)",
                        lastSyncedAt: data.settings.lastSyncedAt || null
                    })
                }
                if (data.stats) {
                    setStats(data.stats)
                }
                return
            }

            // Fallback to public reviews endpoint
            const pubRes = await fetch("/api/public/google-reviews")
            if (pubRes.ok) {
                const pubData = await pubRes.json()
                if (pubData.settings) {
                    setFormData(prev => ({
                        ...prev,
                        placeId: pubData.settings.placeId || prev.placeId,
                        placeName: pubData.settings.placeName || prev.placeName,
                        rating: Number(pubData.settings.rating) || 5.0,
                        totalReviews: Number(pubData.settings.totalReviews) || 47,
                        writeReviewUrl: pubData.settings.writeReviewUrl || prev.writeReviewUrl,
                    }))
                }
            }
        } catch (error) {
            console.error("Failed to load settings:", error)
        } finally {
            setLoading(false)
        }
    }

    async function loadReviews() {
        try {
            const res = await fetch("/api/admin/google-reviews")
            if (res.ok) {
                const data = await res.json()
                if (data.reviews && data.reviews.length > 0) {
                    setReviews(data.reviews)
                    setStats(prev => ({ ...prev, totalReviewsCount: data.reviews.length, visibleReviewsCount: data.reviews.length }))
                    return
                }
            }

            // Fallback to public reviews endpoint
            const pubRes = await fetch("/api/public/google-reviews")
            if (pubRes.ok) {
                const pubData = await pubRes.json()
                if (pubData.reviews && pubData.reviews.length > 0) {
                    setReviews(pubData.reviews)
                    setStats({ totalReviewsCount: pubData.reviews.length, visibleReviewsCount: pubData.reviews.length })
                }
            }
        } catch (error) {
            console.error("Failed to load reviews:", error)
        }
    }

    async function handleSave(e?: React.FormEvent) {
        if (e) e.preventDefault()
        setSaving(true)
        const toastId = toast.loading("Saving Google Review settings...")

        try {
            const res = await fetch("/api/admin/settings/google-reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            if (res.ok && data.success) {
                toast.success("Settings saved successfully!", { id: toastId })
                await loadSettings()
            } else {
                toast.error(data.error || "Failed to save settings", { id: toastId })
            }
        } catch (error) {
            toast.error("Network error while saving settings", { id: toastId })
        } finally {
            setSaving(false)
        }
    }

    async function handleSyncNow() {
        setSyncing(true)
        const toastId = toast.loading("Syncing latest reviews from Google...")

        try {
            const res = await fetch("/api/admin/settings/google-reviews/sync", {
                method: "POST"
            })

            const data = await res.json()
            if (res.ok && data.success) {
                toast.success(data.message || `Successfully synced ${data.count} reviews!`, { id: toastId })
                await loadSettings()
                await loadReviews()
            } else {
                toast.error(data.error || data.message || "Failed to sync reviews from Google", { id: toastId })
            }
        } catch (error) {
            toast.error("Error occurred during Google sync", { id: toastId })
        } finally {
            setSyncing(false)
        }
    }

    async function toggleVisibility(id: string, current: boolean) {
        try {
            const res = await fetch(`/api/admin/google-reviews/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVisible: !current })
            })
            if (res.ok) {
                toast.success(current ? "Review hidden from homepage" : "Review made visible on homepage")
                loadReviews()
                loadSettings()
            }
        } catch (err) {
            toast.error("Failed to update visibility")
        }
    }

    async function handleDeleteReview(id: string) {
        if (!confirm("Are you sure you want to delete this review?")) return
        try {
            const res = await fetch(`/api/admin/google-reviews/${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                toast.success("Review deleted successfully")
                loadReviews()
                loadSettings()
            }
        } catch (err) {
            toast.error("Failed to delete review")
        }
    }

    async function handleAddManualReview(e: React.FormEvent) {
        e.preventDefault()
        if (!newReview.authorName || !newReview.text) {
            toast.error("Author name and review text are required")
            return
        }

        const toastId = toast.loading("Adding review...")
        try {
            const res = await fetch("/api/admin/google-reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newReview)
            })

            const data = await res.json()
            if (res.ok && data.success) {
                toast.success("Review added successfully!", { id: toastId })
                setShowAddModal(false)
                setNewReview({
                    authorName: "",
                    rating: 5,
                    text: "",
                    relativeTime: "Recently",
                    authorPhoto: "",
                })
                loadReviews()
                loadSettings()
            } else {
                toast.error(data.error || "Failed to add review", { id: toastId })
            }
        } catch (err) {
            toast.error("Network error", { id: toastId })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
                <RefreshCw className="w-8 h-8 animate-spin text-[#4285F4]" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Top Navigation & Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/settings"
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-zinc-400 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                                    <GoogleIcon className="w-6 h-6" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                                    Google Reviews & Auto-Sync
                                </h1>
                            </div>
                            <p className="text-zinc-400 text-sm mt-1">
                                Automatically sync and display authentic Google Reviews on your website homepage.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleSyncNow}
                            disabled={syncing}
                            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 text-[#4285F4] ${syncing ? "animate-spin" : ""}`} />
                            Sync from Google
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#4285F4]/30 transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            Save Settings
                        </button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-[#121214] border border-white/10">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Average Rating</span>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-3xl font-black text-white">{formData.rating.toFixed(1)}</span>
                            <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#121214] border border-white/10">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Google Reviews</span>
                        <div className="text-3xl font-black text-white mt-2">{formData.totalReviews}+</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#121214] border border-white/10">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active on Homepage</span>
                        <div className="text-3xl font-black text-emerald-400 mt-2">{stats.visibleReviewsCount} Reviews</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#121214] border border-white/10">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Last Sync Status</span>
                        <div className="flex items-center gap-2 mt-2">
                            <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                    formData.lastSyncStatus === "SUCCESS"
                                        ? "bg-emerald-400"
                                        : formData.lastSyncStatus === "ERROR"
                                        ? "bg-red-400"
                                        : "bg-amber-400"
                                }`}
                            />
                            <span className="text-sm font-semibold">{formData.lastSyncStatus || "IDLE"}</span>
                        </div>
                        {formData.lastSyncedAt && (
                            <span className="text-[11px] text-zinc-500 block mt-1">
                                {new Date(formData.lastSyncedAt).toLocaleString("en-IN")}
                            </span>
                        )}
                    </div>
                </div>

                {/* Setup Guide Collapsible */}
                <div className="rounded-2xl border border-[#4285F4]/30 bg-[#4285F4]/5 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowGuide(!showGuide)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <HelpCircle className="w-5 h-5 text-[#4285F4]" />
                            <span className="font-bold text-sm text-zinc-200">
                                Google Reviews Auto-Sync Setup Guide (Google Reviews Website Par Kaise Auto-Sync Karein?)
                            </span>
                        </div>
                        {showGuide ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                    </button>

                    {showGuide && (
                        <div className="p-6 pt-2 border-t border-white/10 space-y-4 text-sm text-zinc-300">
                            <div className="space-y-2">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#4285F4] text-white flex items-center justify-center text-xs">1</span>
                                    Google Place ID Prapt Karein:
                                </h4>
                                <p className="pl-8 text-xs text-zinc-400">
                                    Google Place ID Finder (
                                    <a
                                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#4285F4] underline"
                                    >
                                        Place ID Tool
                                    </a>
                                    ) par jaakar <strong>"Detailing Garage Mandi"</strong> search karein aur Place ID copy karke niche paste karein.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#4285F4] text-white flex items-center justify-center text-xs">2</span>
                                    Google Cloud Places API Key (Optional for Live Auto-Sync):
                                </h4>
                                <p className="pl-8 text-xs text-zinc-400">
                                    Google Cloud Console (
                                    <a
                                        href="https://console.cloud.google.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#4285F4] underline"
                                    >
                                        console.cloud.google.com
                                    </a>
                                    ) me <strong>Places API</strong> enable karein aur Credentials se API Key banakar niche dalein. API key daalne ke baad har naya Google review automatic fetch ho jayega!
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#4285F4] text-white flex items-center justify-center text-xs">3</span>
                                    Bina API Key ke bhi chalega:
                                </h4>
                                <p className="pl-8 text-xs text-zinc-400">
                                    Agar abhi API key nahi hai, toh bhi system me 5-star verified reviews load hain, aur aap niche <strong>"+ Add Manual Review"</strong> button dabakar kabhi bhi naya customer review add kar sakte hain.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Settings */}
                <form onSubmit={handleSave} className="space-y-8">
                    <div className="p-7 rounded-3xl bg-[#121214] border border-white/10 space-y-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#4285F4]" />
                            Google Business & API Configuration
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Business Place Name */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Google Business Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.placeName}
                                    onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                    placeholder="Detailing Garage Mandi"
                                />
                            </div>

                            {/* Google Place ID */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Google Place ID <span className="text-[#4285F4]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.placeId}
                                    onChange={(e) => setFormData({ ...formData, placeId: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                    placeholder="ChIJ054h_z_wDDkRxX9QnS_v5v4"
                                />
                            </div>

                            {/* Google API Key */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Google Places API Key (For Live Real-Time Sync)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? "text" : "password"}
                                        value={formData.apiKey}
                                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none pr-12"
                                        placeholder="AIzaSy..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                                    >
                                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[11px] text-zinc-500 mt-1.5">
                                    Leave blank to use pre-loaded verified 5-star customer reviews until you configure your Google Cloud API key.
                                </p>
                            </div>

                            {/* Write Review Direct URL */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    "Review Us on Google" Direct Button URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.writeReviewUrl}
                                    onChange={(e) => setFormData({ ...formData, writeReviewUrl: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                    placeholder="https://maps.google.com/?q=Detailing+Garage+Mandi"
                                />
                            </div>

                            {/* Rating and Total count manual override */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Displayed Google Rating (Stars)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="5"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5 })}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Total Reviews Count Badge
                                </label>
                                <input
                                    type="number"
                                    value={formData.totalReviews}
                                    onChange={(e) => setFormData({ ...formData, totalReviews: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Display & Homepage Settings */}
                    <div className="p-7 rounded-3xl bg-[#121214] border border-white/10 space-y-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                            Homepage Presentation Settings
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Toggle Show on Home */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-white/5">
                                <div>
                                    <div className="font-bold text-sm text-white">Show on Website Homepage</div>
                                    <div className="text-xs text-zinc-400">Display Google Reviews section on the homepage</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.showOnHome}
                                    onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                                    className="w-5 h-5 accent-[#4285F4] cursor-pointer"
                                />
                            </div>

                            {/* Toggle Auto Sync */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-white/5">
                                <div>
                                    <div className="font-bold text-sm text-white">Background Auto-Sync</div>
                                    <div className="text-xs text-zinc-400">Periodically fetch new reviews when visitors browse</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.autoSync}
                                    onChange={(e) => setFormData({ ...formData, autoSync: e.target.checked })}
                                    className="w-5 h-5 accent-[#4285F4] cursor-pointer"
                                />
                            </div>

                            {/* Section Title */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Section Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.homeSectionTitle}
                                    onChange={(e) => setFormData({ ...formData, homeSectionTitle: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                />
                            </div>

                            {/* Minimum Rating */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Minimum Rating to Show on Homepage
                                </label>
                                <select
                                    value={formData.minRatingToShow}
                                    onChange={(e) => setFormData({ ...formData, minRatingToShow: parseInt(e.target.value) || 4 })}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                >
                                    <option value={5}>5 Stars Only (Perfection)</option>
                                    <option value={4}>4 Stars and Above (Recommended)</option>
                                    <option value={3}>3 Stars and Above</option>
                                </select>
                            </div>

                            {/* Section Description */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Section Subtitle / Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.homeSectionDesc}
                                    onChange={(e) => setFormData({ ...formData, homeSectionDesc: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Reviews List & Manager */}
                <div className="p-7 rounded-3xl bg-[#121214] border border-white/10 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-[#4285F4]" />
                                Synced Customer Reviews ({reviews.length})
                            </h2>
                            <p className="text-xs text-zinc-400 mt-1">
                                Control which reviews are shown on the homepage or add manual client reviews.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors text-white"
                        >
                            <Plus className="w-4 h-4 text-[#4285F4]" />
                            Add Review
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {reviews.map((r) => (
                            <div
                                key={r.id}
                                className={`p-5 rounded-2xl border transition-all ${
                                    r.isVisible ? "bg-zinc-900/80 border-white/10" : "bg-zinc-900/30 border-white/5 opacity-60"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        {r.authorPhoto ? (
                                            <img
                                                src={r.authorPhoto}
                                                alt={r.authorName}
                                                referrerPolicy="no-referrer"
                                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                                                onError={(e) => {
                                                    const target = e.currentTarget
                                                    target.onerror = null
                                                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.authorName)}&background=16acd4&color=fff&bold=true`
                                                }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#4285F4]/20 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                                                {r.authorName.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-sm text-white">{r.authorName}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${
                                                                i < r.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-zinc-400">{r.relativeTime || "Review"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                                            {r.source}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-zinc-300 text-xs leading-relaxed line-clamp-3 mb-4 italic">
                                    "{r.text}"
                                </p>

                                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => toggleVisibility(r.id, r.isVisible)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                            r.isVisible
                                                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                        }`}
                                    >
                                        {r.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        {r.isVisible ? "Visible on Home" : "Hidden"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteReview(r.id)}
                                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal for adding manual review */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-[#4285F4]" /> Add Customer Review
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="text-zinc-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddManualReview} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newReview.authorName}
                                    onChange={(e) => setNewReview({ ...newReview, authorName: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                    placeholder="e.g. Rahul Sharma"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Rating (Stars)
                                    </label>
                                    <select
                                        value={newReview.rating}
                                        onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) || 5 })}
                                        className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                    >
                                        <option value={5}>5 Stars ★★★★★</option>
                                        <option value={4}>4 Stars ★★★★☆</option>
                                        <option value={3}>3 Stars ★★★☆☆</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Time (e.g. 2 days ago)
                                    </label>
                                    <input
                                        type="text"
                                        value={newReview.relativeTime}
                                        onChange={(e) => setNewReview({ ...newReview, relativeTime: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                        placeholder="2 weeks ago"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Customer Photo URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={newReview.authorPhoto}
                                    onChange={(e) => setNewReview({ ...newReview, authorPhoto: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Review Content *
                                </label>
                                <textarea
                                    rows={4}
                                    required
                                    value={newReview.text}
                                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:border-[#4285F4] focus:outline-none"
                                    placeholder="Write what the customer shared about their detailing experience..."
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-bold uppercase tracking-wider"
                                >
                                    Add Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
