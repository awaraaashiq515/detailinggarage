"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import {
    Share2,
    Send,
    Sparkles,
    Image as ImageIcon,
    Video,
    Layers,
    CheckCircle2,
    AlertCircle,
    Clock,
    RefreshCw,
    ExternalLink,
    Key,
    Save,
    Trash2,
    Upload,
    Calendar,
    Globe,
    Facebook,
    Instagram,
    Linkedin,
    Twitter,
    MessageCircle,
    HelpCircle,
    Copy,
    Eye,
    EyeOff
} from "lucide-react"

type SupportedPlatform = "FACEBOOK" | "INSTAGRAM" | "GOOGLE_BUSINESS" | "LINKEDIN" | "TWITTER" | "TELEGRAM"

interface SocialAccount {
    id: string
    platform: SupportedPlatform
    accountName: string | null
    accountId: string | null
    accessToken: string | null
    apiKey: string | null
    apiSecret: string | null
    isActive: boolean
    lastStatus: string | null
    lastError: string | null
    updatedAt: string
}

interface PlatformLog {
    id: string
    platform: string
    status: string
    externalPostId: string | null
    externalUrl: string | null
    errorMessage: string | null
    attemptedAt: string
}

interface BroadcastPostItem {
    id: string
    caption: string | null
    mediaUrl: string | null
    mediaUrls: string | null
    mediaType: string
    linkUrl: string | null
    targetList: string | null
    status: string
    scheduledAt: string | null
    publishedAt: string | null
    authorName: string | null
    createdAt: string
    logs: PlatformLog[]
}

const PLATFORM_CONFIG: Record<
    SupportedPlatform,
    {
        name: string
        color: string
        accentBg: string
        borderColor: string
        icon: any
        description: string
        placeholderId: string
    }
> = {
    FACEBOOK: {
        name: "Facebook Page",
        color: "#1877F2",
        accentBg: "rgba(24, 119, 242, 0.15)",
        borderColor: "#1877F2",
        icon: Facebook,
        description: "Official Facebook page posts & reels for community reach",
        placeholderId: "Page ID (e.g. 101690705818998)"
    },
    INSTAGRAM: {
        name: "Instagram",
        color: "#E1306C",
        accentBg: "rgba(225, 48, 108, 0.15)",
        borderColor: "#E1306C",
        icon: Instagram,
        description: "Reels & Before-After showcase on @detailinggarage.in",
        placeholderId: "Instagram Business User ID"
    },
    GOOGLE_BUSINESS: {
        name: "Google Business (Maps)",
        color: "#34A853",
        accentBg: "rgba(52, 168, 83, 0.15)",
        borderColor: "#34A853",
        icon: Globe,
        description: "Local SEO & Updates for car owners searching on Google Maps",
        placeholderId: "Location ID (locations/123...)"
    },
    LINKEDIN: {
        name: "LinkedIn",
        color: "#0A66C2",
        accentBg: "rgba(10, 102, 194, 0.15)",
        borderColor: "#0A66C2",
        icon: Linkedin,
        description: "B2B corporate clients, fleet & luxury car owners",
        placeholderId: "Organization URN (e.g. 12345678)"
    },
    TWITTER: {
        name: "X (Twitter)",
        color: "#e2e8f0",
        accentBg: "rgba(255, 255, 255, 0.1)",
        borderColor: "#94a3b8",
        icon: Twitter,
        description: "Quick updates, video teasers, and industry announcements",
        placeholderId: "Twitter Handle or App Key"
    },
    TELEGRAM: {
        name: "Telegram Channel",
        color: "#229ED9",
        accentBg: "rgba(34, 158, 217, 0.15)",
        borderColor: "#229ED9",
        icon: MessageCircle,
        description: "Instant VIP broadcast to car enthusiasts & subscribers",
        placeholderId: "Channel ID (e.g. @detailinggarage)"
    }
}

export default function AdminSocialPage() {
    const [activeTab, setActiveTab] = useState<"COMPOSER" | "ACCOUNTS" | "HISTORY">("COMPOSER")
    const [loading, setLoading] = useState(false)
    const [accounts, setAccounts] = useState<SocialAccount[]>([])
    const [posts, setPosts] = useState<BroadcastPostItem[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)

    // Composer Form State
    const [selectedPlatforms, setSelectedPlatforms] = useState<SupportedPlatform[]>([
        "FACEBOOK",
        "INSTAGRAM"
    ])
    const [caption, setCaption] = useState("")
    const [mediaUrl, setMediaUrl] = useState("")
    const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO" | "REEL">("IMAGE")
    const [linkUrl, setLinkUrl] = useState("https://detailinggarage.in")
    const [isScheduling, setIsScheduling] = useState(false)
    const [scheduledDateTime, setScheduledDateTime] = useState("")
    const [isBroadcasting, setIsBroadcasting] = useState(false)
    const [uploadingMedia, setUploadingMedia] = useState(false)

    // AI Modal State
    const [showAiModal, setShowAiModal] = useState(false)
    const [aiCarModel, setAiCarModel] = useState("Toyota Fortuner Legender")
    const [aiServiceType, setAiServiceType] = useState("10H Ceramic Coating & Full PPF")
    const [aiTone, setAiTone] = useState<"PREMIUM" | "HYPE" | "OFFER" | "EDUCATIONAL">("PREMIUM")
    const [aiCustomNote, setAiCustomNote] = useState("")
    const [generatingAi, setGeneratingAi] = useState(false)

    // Accounts Configuration State
    const [selectedConfigPlatform, setSelectedConfigPlatform] = useState<SupportedPlatform>("FACEBOOK")
    const [configFormData, setConfigFormData] = useState({
        accountName: "",
        accountId: "",
        accessToken: "",
        apiKey: "",
        apiSecret: "",
        isActive: true
    })
    const [savingAccount, setSavingAccount] = useState(false)
    const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})

    useEffect(() => {
        fetchAccounts()
    }, [])

    useEffect(() => {
        if (activeTab === "HISTORY") {
            fetchHistory()
        }
    }, [activeTab])

    const fetchAccounts = async () => {
        try {
            const res = await fetch("/api/admin/social/accounts")
            const data = await res.json()
            if (data.success) {
                setAccounts(data.accounts || [])
                const currentAcc = (data.accounts || []).find((a: SocialAccount) => a.platform === selectedConfigPlatform)
                if (currentAcc) {
                    setConfigFormData({
                        accountName: currentAcc.accountName || "",
                        accountId: currentAcc.accountId || "",
                        accessToken: currentAcc.accessToken || "",
                        apiKey: currentAcc.apiKey || "",
                        apiSecret: currentAcc.apiSecret || "",
                        isActive: currentAcc.isActive
                    })
                }
            }
        } catch (err) {
            console.error("Error fetching social accounts:", err)
        }
    }

    const fetchHistory = async () => {
        setHistoryLoading(true)
        try {
            const res = await fetch("/api/admin/social/broadcast?limit=25")
            const data = await res.json()
            if (data.success) {
                setPosts(data.posts || [])
            }
        } catch (err) {
            toast.error("Failed to load broadcast history")
        } finally {
            setHistoryLoading(false)
        }
    }

    const togglePlatform = (p: SupportedPlatform) => {
        if (selectedPlatforms.includes(p)) {
            if (selectedPlatforms.length === 1) {
                toast.error("At least one platform must be selected")
                return
            }
            setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p))
        } else {
            setSelectedPlatforms([...selectedPlatforms, p])
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingMedia(true)
        const toastId = toast.loading(`Uploading ${file.name}...`)

        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("folder", "social-posts")

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            const data = await res.json()
            if (data.url) {
                setMediaUrl(data.url)
                if (file.type.startsWith("video/")) {
                    setMediaType("REEL")
                } else {
                    setMediaType("IMAGE")
                }
                toast.success("Media uploaded successfully!", { id: toastId })
            } else {
                toast.error(data.error || "Failed to upload file", { id: toastId })
            }
        } catch (err: any) {
            toast.error(err.message || "Upload failed", { id: toastId })
        } finally {
            setUploadingMedia(false)
        }
    }

    const handleGenerateAiCaption = async () => {
        setGeneratingAi(true)
        try {
            const res = await fetch("/api/admin/social/ai-caption", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    carModel: aiCarModel,
                    serviceType: aiServiceType,
                    tone: aiTone,
                    customPrompt: aiCustomNote
                })
            })

            const data = await res.json()
            if (data.success && data.caption) {
                setCaption(data.caption)
                setShowAiModal(false)
                toast.success("AI Caption generated & inserted!")
            } else {
                toast.error(data.error || "Failed to generate AI caption")
            }
        } catch (err) {
            toast.error("Error generating caption")
        } finally {
            setGeneratingAi(false)
        }
    }

    const handleBroadcast = async () => {
        if (!caption && !mediaUrl) {
            toast.error("Please enter a caption or upload media")
            return
        }

        if (selectedPlatforms.length === 0) {
            toast.error("Please select at least one platform")
            return
        }

        setIsBroadcasting(true)
        const toastId = toast.loading(`Broadcasting to ${selectedPlatforms.length} platforms...`)

        try {
            const res = await fetch("/api/admin/social/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    caption,
                    mediaUrl: mediaUrl || undefined,
                    mediaType,
                    linkUrl: linkUrl || undefined,
                    platforms: selectedPlatforms,
                    scheduledAt: isScheduling && scheduledDateTime ? scheduledDateTime : undefined
                })
            })

            const data = await res.json()
            if (data.success) {
                const results = data.result?.platformResults || []
                const succeeded = results.filter((r: any) => r.success)
                const skipped = results.filter((r: any) => r.error === "Not configured — skipped")

                if (succeeded.length > 0) {
                    toast.success(`✅ ${succeeded.length} platform${succeeded.length > 1 ? "s" : ""} par post ho gaya!`, { id: toastId })
                } else if (skipped.length === results.length) {
                    toast.error("⚠️ Koi platform connected nahi! 'Connected Channels' tab me token save karo.", { id: toastId })
                } else {
                    toast.error("❌ Broadcast encounter error — History me status dekhein.", { id: toastId })
                }
                setActiveTab("HISTORY")
                fetchHistory()
            } else {
                toast.error(data.error || "Broadcast encountered an error", { id: toastId })
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to send broadcast", { id: toastId })
        } finally {
            setIsBroadcasting(false)
        }
    }

    const handleSaveAccountConfig = async (e: React.FormEvent) => {
        e.preventDefault()
        setSavingAccount(true)
        const toastId = toast.loading("Saving platform connection...")

        try {
            const res = await fetch("/api/admin/social/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    platform: selectedConfigPlatform,
                    ...configFormData
                })
            })

            const data = await res.json()
            if (data.success) {
                toast.success(`${PLATFORM_CONFIG[selectedConfigPlatform].name} updated!`, { id: toastId })
                fetchAccounts()
            } else {
                toast.error(data.error || "Failed to save configuration", { id: toastId })
            }
        } catch (err) {
            toast.error("Network error while saving account", { id: toastId })
        } finally {
            setSavingAccount(false)
        }
    }

    const selectPlatformForConfig = (p: SupportedPlatform) => {
        setSelectedConfigPlatform(p)
        const acc = accounts.find((a) => a.platform === p)
        if (acc) {
            setConfigFormData({
                accountName: acc.accountName || "",
                accountId: acc.accountId || "",
                accessToken: acc.accessToken || "",
                apiKey: acc.apiKey || "",
                apiSecret: acc.apiSecret || "",
                isActive: acc.isActive
            })
        } else {
            setConfigFormData({
                accountName: `${PLATFORM_CONFIG[p].name} Account`,
                accountId: "",
                accessToken: "",
                apiKey: "",
                apiSecret: "",
                isActive: true
            })
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto text-zinc-100 space-y-6">
            {/* Header Banner - Dark Luxury Detailing Theme */}
            <div className="bg-gradient-to-r from-zinc-950 via-[#121214] to-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16acd4] to-blue-600 flex items-center justify-center text-black shadow-lg shadow-[#16acd4]/20">
                            <Share2 className="w-5 h-5 text-black" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Omnichannel Social Media Broadcast Studio
                        </h1>
                    </div>
                    <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
                        Create once, publish everywhere: Instantly broadcast studio transformations, reels, and detailing offers
                        across <strong className="text-zinc-200">Facebook, Instagram, Google Business Profile, LinkedIn, X (Twitter),</strong> and <strong className="text-zinc-200">Telegram</strong> in one click.
                    </p>
                </div>

                {/* Tab Navigation Pills */}
                <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("COMPOSER")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === "COMPOSER"
                                ? "bg-[#16acd4] text-black shadow-md shadow-[#16acd4]/30"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <Send className="w-3.5 h-3.5" />
                        Broadcast Studio
                    </button>
                    <button
                        onClick={() => setActiveTab("ACCOUNTS")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === "ACCOUNTS"
                                ? "bg-[#16acd4] text-black shadow-md shadow-[#16acd4]/30"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <Key className="w-3.5 h-3.5" />
                        Connected Channels ({accounts.filter((a) => a.accessToken || a.apiKey).length})
                    </button>
                    <button
                        onClick={() => setActiveTab("HISTORY")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === "HISTORY"
                                ? "bg-[#16acd4] text-black shadow-md shadow-[#16acd4]/30"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        Delivery History
                    </button>
                </div>
            </div>

            {/* TAB 1: BROADCAST COMPOSER */}
            {activeTab === "COMPOSER" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Post Creator Form */}
                    <div className="lg:col-span-7 bg-[#121214] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                        {/* Step 1: Select Target Platforms */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#16acd4]">
                                    1. Target Platforms ({selectedPlatforms.length} Selected)
                                </label>
                                <span className="text-xs text-zinc-400">Click to toggle channels</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {(Object.keys(PLATFORM_CONFIG) as SupportedPlatform[]).map((p) => {
                                    const conf = PLATFORM_CONFIG[p]
                                    const isSelected = selectedPlatforms.includes(p)
                                    const Icon = conf.icon
                                    const acc = accounts.find((a) => a.platform === p)
                                    const isConnected = !!(acc?.accessToken || acc?.apiKey)

                                    return (
                                        <div
                                            key={p}
                                            onClick={() => togglePlatform(p)}
                                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative ${isSelected
                                                    ? "bg-zinc-900 border-[#16acd4] shadow-[0_0_15px_rgba(22,172,212,0.15)]"
                                                    : "bg-zinc-950/70 border-white/10 hover:border-white/20 hover:bg-zinc-900/50"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4 shrink-0" style={{ color: conf.color }} />
                                                    <span className="text-xs font-bold text-white truncate">
                                                        {conf.name.split(" ")[0]}
                                                    </span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => { }}
                                                    className="w-3.5 h-3.5 rounded accent-[#16acd4] cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400" : "bg-zinc-600"
                                                        }`}
                                                />
                                                <span
                                                    className={`text-[10px] font-semibold ${isConnected ? "text-emerald-400" : "text-zinc-500"
                                                        }`}
                                                >
                                                    {isConnected ? "Connected" : "No Token"}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Step 2: Media Upload */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#16acd4]">
                                    2. Media Upload (Photo / Reel / Transformation Video)
                                </label>
                                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                                    {(["IMAGE", "REEL", "VIDEO"] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setMediaType(type)}
                                            className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${mediaType === type
                                                    ? "bg-[#16acd4] text-black shadow-sm"
                                                    : "text-zinc-400 hover:text-white"
                                                }`}
                                        >
                                            {type === "IMAGE" ? "📷 Image" : type === "REEL" ? "🎬 9:16 Reel" : "🎥 Video"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-white/15 hover:border-[#16acd4]/50 bg-zinc-950/60 rounded-xl p-5 text-center transition-all">
                                {mediaUrl ? (
                                    <div className="relative inline-block max-w-full">
                                        {mediaType === "VIDEO" || mediaType === "REEL" ? (
                                            <video
                                                src={mediaUrl}
                                                controls
                                                className="max-h-56 rounded-lg max-w-full border border-white/10"
                                            />
                                        ) : (
                                            <img
                                                src={mediaUrl}
                                                alt="Post preview"
                                                className="max-h-56 rounded-lg object-contain max-w-full border border-white/10"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setMediaUrl("")}
                                            className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 py-3">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-zinc-300">
                                                Drag & drop your before/after photo or reel here
                                            </p>
                                            <p className="text-[11px] text-zinc-500 mt-0.5">
                                                Supports JPG, PNG, WEBP, MP4 & MOV
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center gap-3">
                                            <label className="cursor-pointer px-4 py-2 bg-[#16acd4] hover:bg-[#0f80a0] text-black text-xs font-bold rounded-lg transition-all shadow-md shadow-[#16acd4]/20">
                                                {uploadingMedia ? "Uploading..." : "Browse Local File"}
                                                <input
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                    disabled={uploadingMedia}
                                                />
                                            </label>
                                            <span className="text-xs text-zinc-500">or enter URL below</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <input
                                type="text"
                                placeholder="Or enter direct image / video URL (/uploads/social-posts/... or https://...)"
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                className="w-full mt-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#16acd4] transition-all font-mono"
                            />
                        </div>

                        {/* Step 3: Caption & AI Detailing Assistant */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#16acd4]">
                                    3. Caption & Trending Studio Hashtags
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowAiModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    ✨ AI Detailing Caption
                                </button>
                            </div>

                            <textarea
                                rows={7}
                                placeholder="Write your detailing post caption: describe the vehicle, mirror gloss ceramic reflection, hydrophobic water-beading effect, TPU PPF warranty, and booking call to action..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="w-full p-4 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#16acd4] transition-all leading-relaxed"
                            />
                            <div className="flex justify-between items-center text-[11px] text-zinc-400 mt-1.5">
                                <span>High-gloss before/after stories & warranty tags perform best on Instagram & Facebook.</span>
                                <span className="font-mono text-zinc-300 font-semibold">{caption.length} characters</span>
                            </div>
                        </div>

                        {/* Step 4: CTA Link & Scheduling */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                                    Call To Action / Website Link
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://detailinggarage.in/packages"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#16acd4] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                                    Publish Timing
                                </label>
                                <div className="flex items-center gap-4 h-[42px] px-3 bg-zinc-900 rounded-xl border border-white/10">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="timing"
                                            checked={!isScheduling}
                                            onChange={() => setIsScheduling(false)}
                                            className="accent-[#16acd4]"
                                        />
                                        Instant Broadcast
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="timing"
                                            checked={isScheduling}
                                            onChange={() => setIsScheduling(true)}
                                            className="accent-[#16acd4]"
                                        />
                                        Schedule Later
                                    </label>
                                </div>
                            </div>
                        </div>

                        {isScheduling && (
                            <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10">
                                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                                    Select Future Date & Time:
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduledDateTime}
                                    onChange={(e) => setScheduledDateTime(e.target.value)}
                                    className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>
                        )}

                        {/* Big Submit Button */}
                        <button
                            type="button"
                            onClick={handleBroadcast}
                            disabled={isBroadcasting}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#16acd4] via-blue-600 to-indigo-600 hover:opacity-95 text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-[#16acd4]/20 transition-all disabled:opacity-50"
                        >
                            {isBroadcasting ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                                    Broadcasting to Selected Channels...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 text-black" />
                                    {isScheduling
                                        ? "Schedule Broadcast Post"
                                        : `Broadcast to ${selectedPlatforms.length} Platform${selectedPlatforms.length > 1 ? "s" : ""} Now`}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Column: Live Mockup / Preview */}
                    <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                        <div className="bg-[#121214] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Live Social Feed Preview
                                </h3>
                                <span className="text-[11px] font-bold text-zinc-400">Instagram / FB Mockup</span>
                            </div>

                            {/* Instagram Card Mockup */}
                            <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl">
                                {/* Header */}
                                <div className="flex items-center gap-3 p-3.5 border-b border-white/10">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] flex items-center justify-center shrink-0">
                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-extrabold text-white">
                                            DG
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                            detailinggarage.in
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                                        </div>
                                        <div className="text-[10px] text-zinc-400">Detailing Studio • Original Post</div>
                                    </div>
                                </div>

                                {/* Media Canvas */}
                                <div className="w-full h-64 bg-black flex items-center justify-center overflow-hidden relative">
                                    {mediaUrl ? (
                                        mediaType === "VIDEO" || mediaType === "REEL" ? (
                                            <video src={mediaUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                                        )
                                    ) : (
                                        <div className="text-center text-zinc-600 p-6">
                                            <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40 text-zinc-500" />
                                            <div className="text-xs text-zinc-400 font-semibold">Upload photo or reel to preview</div>
                                            <div className="text-[10px] text-zinc-600 mt-1">Live reflection & shine preview appears here</div>
                                        </div>
                                    )}
                                </div>

                                {/* Caption Box */}
                                <div className="p-4 space-y-2.5">
                                    <div className="text-xs text-zinc-300 leading-relaxed break-words whitespace-pre-line">
                                        <strong className="text-white mr-1.5">detailinggarage.in</strong>
                                        {caption ? (
                                            caption.length > 200 ? (
                                                <>
                                                    {caption.substring(0, 200)}...{" "}
                                                    <span className="text-[#16acd4] font-semibold cursor-pointer">more</span>
                                                </>
                                            ) : (
                                                caption
                                            )
                                        ) : (
                                            <span className="text-zinc-500 italic">
                                                Your captivating detailing story and trending hashtags will appear here...
                                            </span>
                                        )}
                                    </div>

                                    {linkUrl && (
                                        <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-between text-[11px] text-[#16acd4]">
                                            <span className="truncate">{linkUrl}</span>
                                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Auto Sync Website Notice */}
                            <div className="p-3.5 rounded-xl bg-[#16acd4]/10 border border-[#16acd4]/30 flex items-start gap-3">
                                <CheckCircle2 className="w-4 h-4 text-[#16acd4] shrink-0 mt-0.5" />
                                <div className="text-xs text-zinc-300">
                                    <strong className="text-white block font-bold mb-0.5">Website Showcase Auto-Sync</strong>
                                    Har post aapke Detailing Garage ke official website homepage & portfolio feed par bhi automatically sync ho jata hai!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CONNECTED PLATFORM SETTINGS */}
            {activeTab === "ACCOUNTS" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Platform Selector List */}
                    <div className="lg:col-span-4 bg-[#121214] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#16acd4] mb-3">
                            Select Channel to Configure
                        </h3>
                        <div className="space-y-2">
                            {(Object.keys(PLATFORM_CONFIG) as SupportedPlatform[]).map((p) => {
                                const conf = PLATFORM_CONFIG[p]
                                const isSelected = selectedConfigPlatform === p
                                const Icon = conf.icon
                                const acc = accounts.find((a) => a.platform === p)
                                const isConnected = !!(acc?.accessToken || acc?.apiKey)

                                return (
                                    <div
                                        key={p}
                                        onClick={() => selectPlatformForConfig(p)}
                                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${isSelected
                                                ? "bg-zinc-900 border-[#16acd4] shadow-[0_0_15px_rgba(22,172,212,0.15)]"
                                                : "bg-zinc-950/60 border-white/10 hover:border-white/20 hover:bg-zinc-900/40"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Icon className="w-5 h-5 shrink-0" style={{ color: conf.color }} />
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-white truncate">{conf.name}</div>
                                                <div className="text-[11px] text-zinc-400 truncate">
                                                    {acc?.accountName || "Not configured"}
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${isConnected
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                                                }`}
                                        >
                                            {isConnected ? "Active" : "Offline"}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Platform Configuration Card */}
                    <div className="lg:col-span-8 bg-[#121214] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            {(() => {
                                const Icon = PLATFORM_CONFIG[selectedConfigPlatform].icon
                                return <Icon className="w-7 h-7 shrink-0" style={{ color: PLATFORM_CONFIG[selectedConfigPlatform].color }} />
                            })()}
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    {PLATFORM_CONFIG[selectedConfigPlatform].name} Credentials
                                </h2>
                                <p className="text-xs text-zinc-400">
                                    {PLATFORM_CONFIG[selectedConfigPlatform].description}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveAccountConfig} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                                        Account / Page Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Detailing Garage Official"
                                        value={configFormData.accountName}
                                        onChange={(e) => setConfigFormData({ ...configFormData, accountName: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#16acd4] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                                        Account ID / Handle / Page ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={PLATFORM_CONFIG[selectedConfigPlatform].placeholderId}
                                        value={configFormData.accountId}
                                        onChange={(e) => setConfigFormData({ ...configFormData, accountId: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#16acd4] transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                                    Access Token / OAuth Token / Bot Token
                                </label>
                                <div className="relative">
                                    <input
                                        type={showTokens[selectedConfigPlatform] ? "text" : "password"}
                                        placeholder="Enter permanent or long-lived API Access Token"
                                        value={configFormData.accessToken}
                                        onChange={(e) => setConfigFormData({ ...configFormData, accessToken: e.target.value })}
                                        className="w-full pr-10 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#16acd4] transition-all font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowTokens({
                                                ...showTokens,
                                                [selectedConfigPlatform]: !showTokens[selectedConfigPlatform]
                                            })
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                                    >
                                        {showTokens[selectedConfigPlatform] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <span className="text-[11px] text-zinc-500 mt-1.5 block">
                                    Securely encrypted server-side to broadcast media, stories, and captions automatically.
                                </span>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={configFormData.isActive}
                                        onChange={(e) => setConfigFormData({ ...configFormData, isActive: e.target.checked })}
                                        className="w-3.5 h-3.5 rounded accent-[#16acd4] cursor-pointer"
                                    />
                                    Enable this platform for 1-click broadcast studio
                                </label>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={savingAccount}
                                    className="px-6 py-2.5 rounded-xl bg-[#16acd4] hover:bg-[#0f80a0] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#16acd4]/20 transition-all disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 text-black" />
                                    {savingAccount ? "Saving Settings..." : "Save Connection Credentials"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* TAB 3: BROADCAST HISTORY & LOGS */}
            {activeTab === "HISTORY" && (
                <div className="bg-[#121214] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div>
                            <h3 className="text-base font-bold text-white">
                                Broadcast Archive & Multi-Platform Delivery Reports
                            </h3>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Real-time delivery logs, live platform links, and broadcast statuses
                            </p>
                        </div>
                        <button
                            onClick={fetchHistory}
                            disabled={historyLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
                            Refresh History
                        </button>
                    </div>

                    {posts.length === 0 ? (
                        <div className="text-center py-16 text-zinc-500 space-y-2">
                            <Share2 className="w-12 h-12 mx-auto opacity-30 text-zinc-400" />
                            <p className="text-sm font-semibold text-zinc-400">No broadcast posts yet.</p>
                            <p className="text-xs text-zinc-600">
                                Switch to "Broadcast Studio" tab above to create and publish your first post!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3.5">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="p-4 rounded-xl bg-zinc-950/70 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center gap-4"
                                >
                                    {/* Thumbnail */}
                                    <div className="w-20 h-20 rounded-lg bg-zinc-900 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                                        {post.mediaUrl ? (
                                            post.mediaType === "VIDEO" || post.mediaType === "REEL" ? (
                                                <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={post.mediaUrl} alt="Post" className="w-full h-full object-cover" />
                                            )
                                        ) : (
                                            <span className="text-[10px] text-zinc-500 font-semibold">Text Post</span>
                                        )}
                                    </div>

                                    {/* Content & Details */}
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${post.status === "PUBLISHED"
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : post.status === "PARTIAL"
                                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                    }`}
                                            >
                                                {post.status}
                                            </span>
                                            <span className="text-xs text-zinc-400">
                                                {new Date(post.createdAt).toLocaleString("en-IN")}
                                            </span>
                                            <span className="text-xs text-zinc-500 font-medium">by {post.authorName}</span>
                                        </div>

                                        <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">
                                            {post.caption || <span className="text-zinc-600 italic">No caption provided</span>}
                                        </p>

                                        {post.linkUrl && (
                                            <a
                                                href={post.linkUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[11px] text-[#16acd4] hover:underline inline-flex items-center gap-1 font-mono"
                                            >
                                                🔗 {post.linkUrl}
                                            </a>
                                        )}
                                    </div>

                                    {/* Per-Platform Results */}
                                    <div className="w-full md:w-72 shrink-0 space-y-1.5 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                            Delivery Reports:
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {post.logs && post.logs.length > 0 ? (
                                                post.logs.map((log) => {
                                                    const conf = PLATFORM_CONFIG[log.platform as SupportedPlatform]
                                                    const isSuccess = log.status === "SUCCESS"
                                                    const isSkipped = log.status === "SKIPPED"

                                                    return (
                                                        <div
                                                            key={log.id}
                                                            title={log.errorMessage || ""}
                                                            className={`text-[11px] font-semibold px-2 py-1 rounded-md border flex items-center gap-1.5 ${isSuccess
                                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                    : isSkipped
                                                                        ? "bg-zinc-900 text-zinc-500 border-zinc-800"
                                                                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                                }`}
                                                        >
                                                            <span>{conf ? conf.name.split(" ")[0] : log.platform}:</span>
                                                            <strong>
                                                                {isSuccess ? "✅ Sent" : isSkipped ? "⚪ No Token" : "❌ Failed"}
                                                            </strong>
                                                            {log.externalUrl && (
                                                                <a
                                                                    href={log.externalUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-[#16acd4] hover:text-white transition-colors ml-0.5"
                                                                >
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <span className="text-xs text-zinc-500">No logs</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* AI Detailing Caption Generator Modal */}
            {showAiModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#18181b] border border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold text-white">
                                    AI Detailing Caption Generator
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center text-xs font-bold transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                                    Vehicle Model / Brand
                                </label>
                                <input
                                    type="text"
                                    value={aiCarModel}
                                    onChange={(e) => setAiCarModel(e.target.value)}
                                    placeholder="e.g. Toyota Fortuner Legender, BMW M340i, Thar Roxx"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                                    Detailing Service Performed
                                </label>
                                <select
                                    value={aiServiceType}
                                    onChange={(e) => setAiServiceType(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#16acd4]"
                                >
                                    <option value="10H Ceramic Coating & Full PPF">10H Ceramic Coating & Full Paint Protection Film</option>
                                    <option value="Self-Healing TPU PPF Armor">Self-Healing TPU Paint Protection Film (PPF)</option>
                                    <option value="Graphene Matrix Ceramic Shield">Graphene Matrix Ceramic Shield</option>
                                    <option value="Deep Interior Spa & Leather Nourishing">Deep Interior Spa & Leather Nourishing</option>
                                    <option value="3-Stage Mirror Paint Correction">3-Stage Mirror Paint Correction</option>
                                    <option value="High-Heat Rejection Sun Control Film">High-Heat Rejection Sun Control Film</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                                    Post Vibe / Tone
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(["PREMIUM", "HYPE", "OFFER", "EDUCATIONAL"] as const).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setAiTone(t)}
                                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${aiTone === t
                                                    ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-600/20"
                                                    : "bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                }`}
                                        >
                                            {t === "PREMIUM" && "👑 Luxury & Elegance"}
                                            {t === "HYPE" && "🔥 Viral / High Energy"}
                                            {t === "OFFER" && "🎁 Special Promo Offer"}
                                            {t === "EDUCATIONAL" && "💡 Car Care Advice"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                                    Extra Studio Details (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={aiCustomNote}
                                    onChange={(e) => setAiCustomNote(e.target.value)}
                                    placeholder="e.g. 5-year warranty, gloss hydrophobic test passed"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleGenerateAiCaption}
                                disabled={generatingAi}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                            >
                                <Sparkles className="w-4 h-4 text-white" />
                                {generatingAi ? "Crafting Studio Caption..." : "Generate & Insert into Post"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
