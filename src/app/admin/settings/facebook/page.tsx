"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { 
    Facebook, 
    RefreshCw, 
    Save, 
    CheckCircle2, 
    AlertCircle, 
    ExternalLink, 
    Copy, 
    Eye, 
    EyeOff, 
    Radio, 
    Sliders, 
    HelpCircle, 
    ChevronDown, 
    ChevronUp,
    Sparkles,
    ArrowLeft,
    Clock,
    Share2,
    ShieldCheck,
    Layers
} from "lucide-react"
import Link from "next/link"

export default function FacebookSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [showToken, setShowToken] = useState(false)
    const [showSecret, setShowSecret] = useState(false)
    const [showGuide, setShowGuide] = useState(false)
    const [stats, setStats] = useState({ fbPostsCount: 0, totalPostsCount: 0 })
    const [webhookUrl, setWebhookUrl] = useState("")

    const [formData, setFormData] = useState({
        pageId: "",
        pageName: "Detailing Garage Official",
        pageAccessToken: "",
        appId: "",
        appSecret: "",
        webhookVerifyToken: "dg_fb_webhook_token_secure_2026",
        autoSync: true,
        syncInterval: 30,
        showOnHome: true,
        homeSectionTitle: "Live from Facebook",
        homeSectionDesc: "Latest detailing transformations, master ceramic applications, and stories directly from our Facebook page.",
        maxHomePosts: 8,
        fallbackEmbedUrl: "https://www.facebook.com",
        isConnected: false,
        lastSyncStatus: "IDLE",
        lastSyncMessage: "",
        lastSyncedAt: "" as string | null
    })

    useEffect(() => {
        if (typeof window !== "undefined") {
            setWebhookUrl(`${window.location.origin}/api/facebook/webhook`)
        }
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/settings/facebook")
            const data = await res.json()
            if (data.success && data.settings) {
                setFormData({
                    pageId: data.settings.pageId || "",
                    pageName: data.settings.pageName || "Detailing Garage Official",
                    pageAccessToken: data.settings.pageAccessToken || "",
                    appId: data.settings.appId || "",
                    appSecret: data.settings.appSecret || "",
                    webhookVerifyToken: data.settings.webhookVerifyToken || "dg_fb_webhook_token_secure_2026",
                    autoSync: data.settings.autoSync ?? true,
                    syncInterval: data.settings.syncInterval || 30,
                    showOnHome: data.settings.showOnHome ?? true,
                    homeSectionTitle: data.settings.homeSectionTitle || "Live from Facebook",
                    homeSectionDesc: data.settings.homeSectionDesc || "Latest detailing transformations, master ceramic applications, and stories directly from our Facebook page.",
                    maxHomePosts: data.settings.maxHomePosts || 8,
                    fallbackEmbedUrl: data.settings.fallbackEmbedUrl || "https://www.facebook.com",
                    isConnected: data.settings.isConnected ?? false,
                    lastSyncStatus: data.settings.lastSyncStatus || "IDLE",
                    lastSyncMessage: data.settings.lastSyncMessage || "",
                    lastSyncedAt: data.settings.lastSyncedAt
                })
                if (data.stats) {
                    setStats(data.stats)
                }
            }
        } catch (error) {
            toast.error("Failed to load Facebook settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setSaving(true)
        const toastId = toast.loading("Saving settings...")
        try {
            const res = await fetch("/api/admin/settings/facebook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Facebook settings saved successfully!", { id: toastId })
                fetchSettings()
            } else {
                toast.error(data.error || "Failed to save settings", { id: toastId })
            }
        } catch (error) {
            toast.error("An error occurred while saving", { id: toastId })
        } finally {
            setSaving(false)
        }
    }

    const handleTestConnection = async () => {
        if (!formData.pageId || !formData.pageAccessToken) {
            toast.error("Please enter Page ID and Page Access Token first!")
            return
        }

        setTesting(true)
        const toastId = toast.loading("Testing connection with Meta Graph API...")
        try {
            const res = await fetch("/api/admin/settings/facebook/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pageId: formData.pageId,
                    pageAccessToken: formData.pageAccessToken
                })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Connected to "${data.page.name}" successfully! (${data.page.followers || 0} followers)`, { 
                    id: toastId,
                    duration: 5000 
                })
                setFormData(prev => ({
                    ...prev,
                    isConnected: true,
                    pageName: data.page.name || prev.pageName,
                    fallbackEmbedUrl: data.page.link || prev.fallbackEmbedUrl
                }))
            } else {
                toast.error(`Connection failed: ${data.error}`, { id: toastId, duration: 6000 })
            }
        } catch (error) {
            toast.error("Error communicating with Facebook test endpoint", { id: toastId })
        } finally {
            setTesting(false)
        }
    }

    const handleSyncNow = async () => {
        if (!formData.pageId || !formData.pageAccessToken) {
            toast.error("Please configure and save your Facebook Page ID and Access Token first!")
            return
        }

        setSyncing(true)
        const toastId = toast.loading("Syncing latest posts from Facebook...")
        try {
            const res = await fetch("/api/admin/settings/facebook/sync", {
                method: "POST"
            })
            const data = await res.json()
            if (data.success) {
                toast.success(data.message || `Successfully synced ${data.count} posts from Facebook!`, { id: toastId })
                fetchSettings()
            } else {
                toast.error(data.error || "Failed to sync posts", { id: toastId })
            }
        } catch (error) {
            toast.error("Error occurred during Facebook sync", { id: toastId })
        } finally {
            setSyncing(false)
        }
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard!`)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-16 text-zinc-100">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#121214] p-6 rounded-3xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/admin/settings"
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="w-12 h-12 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] shadow-[0_0_20px_rgba(24,119,242,0.25)]">
                        <Facebook className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            Facebook Integration & Auto-Sync
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-400">
                            Sync Facebook Page posts automatically to your website & homepage
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={handleSyncNow}
                        disabled={syncing}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-lg shadow-[#1877F2]/25 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Syncing..." : "Sync Now"}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#16acd4] hover:bg-[#1397bc] text-black shadow-lg shadow-[#16acd4]/25 transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Connection Status */}
                <div className="bg-[#121214] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Status</span>
                        {formData.isConnected ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <span className="w-2 h-2 rounded-full bg-amber-400" /> Not Connected
                            </span>
                        )}
                    </div>
                    <div className="text-xl font-bold text-white truncate">
                        {formData.pageName || "No Page Linked"}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 truncate">
                        ID: {formData.pageId || "Not configured"}
                    </p>
                </div>

                {/* Synced Posts Count */}
                <div className="bg-[#121214] p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Synced Facebook Posts</span>
                        <Share2 className="w-4 h-4 text-[#16acd4]" />
                    </div>
                    <div className="text-3xl font-extrabold text-white">
                        {stats.fbPostsCount}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                        Active on website showcases & homepage
                    </p>
                </div>

                {/* Last Sync Info */}
                <div className="bg-[#121214] p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Last Sync</span>
                        <Clock className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-sm font-bold text-white truncate">
                        {formData.lastSyncedAt ? new Date(formData.lastSyncedAt).toLocaleString("en-IN") : "Never Synced"}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 truncate">
                        {formData.lastSyncMessage || "Ready to sync"}
                    </p>
                </div>
            </div>

            {/* Quick Setup Guide Accordion */}
            <div className="bg-[#121214] border border-white/10 rounded-3xl overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <HelpCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base">
                                Facebook Graph API Setup Guide (Facebook Page से Auto Sync कैसे करें?)
                            </h3>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Simple 3-step guide to get Page ID, Access Token and Webhook setup
                            </p>
                        </div>
                    </div>
                    {showGuide ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </button>

                {showGuide && (
                    <div className="p-6 pt-0 border-t border-white/5 space-y-4 text-sm text-zinc-300 bg-black/20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#16acd4]/20 text-[#16acd4]">Step 1</span>
                                <h4 className="font-bold text-white">Get Page ID</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    अपने Facebook Page पर जाएं {"->"} <strong>About</strong> {"->"} <strong>Page Transparency</strong> देखें या Page URL चेक करें। Page ID कॉपी करके नीचे <strong>Facebook Page ID</strong> फील्ड में पेस्ट करें।
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#1877F2]/20 text-[#1877F2]">Step 2</span>
                                <h4 className="font-bold text-white">Get Page Access Token</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="text-[#16acd4] underline inline-flex items-center gap-1">
                                        Meta Graph API Explorer <ExternalLink className="w-3 h-3" />
                                    </a> पर जाएं, अपना Page चुनें और <code>pages_read_engagement</code>, <code>pages_show_list</code> permissions के साथ <strong>Generate Access Token</strong> पर क्लिक करें।
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Step 3</span>
                                <h4 className="font-bold text-white">Real-Time Webhook (Instant)</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    जब भी Facebook पर नई Post डालेंगे, Webhook उसे तुरंत 0 सेकंड में आपकी वेबसाइट पर ले आएगा। नीचे दिया गया Webhook URL और Verify Token Meta App Settings में डालें।
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Form */}
            <form onSubmit={handleSave} className="space-y-8">
                {/* 1. API Credentials Section */}
                <div className="bg-[#121214] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2]">
                            <Facebook className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Facebook Page Credentials</h2>
                            <p className="text-xs text-zinc-400">Enter your Facebook Page details to connect with Graph API</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Page ID */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Facebook Page ID <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.pageId}
                                onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                                placeholder="e.g. 1092837465241 or detailinggarageofficial"
                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#16acd4] transition-all text-sm font-mono"
                            />
                            <p className="text-[11px] text-zinc-500">
                                Your numeric Facebook Page ID or custom Page username
                            </p>
                        </div>

                        {/* Page Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Page Display Name
                            </label>
                            <input
                                type="text"
                                value={formData.pageName}
                                onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                                placeholder="Detailing Garage Official"
                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#16acd4] transition-all text-sm"
                            />
                            <p className="text-[11px] text-zinc-500">
                                Displayed in the homepage Facebook banner & badges
                            </p>
                        </div>

                        {/* Page Access Token */}
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                    Page Access Token (Permanent / Long-lived) <span className="text-red-400">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                                >
                                    {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    {showToken ? "Hide" : "Show"}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showToken ? "text" : "password"}
                                    value={formData.pageAccessToken}
                                    onChange={(e) => setFormData({ ...formData, pageAccessToken: e.target.value })}
                                    placeholder="EAABw..."
                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#16acd4] transition-all text-sm font-mono pr-28"
                                />
                                <button
                                    type="button"
                                    onClick={handleTestConnection}
                                    disabled={testing || !formData.pageAccessToken}
                                    className="absolute right-2 top-2 bottom-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#16acd4]" />
                                    {testing ? "Testing..." : "Test Token"}
                                </button>
                            </div>
                            <p className="text-[11px] text-zinc-500">
                                Generated from Meta Graph API Explorer or your Meta App with page permissions
                            </p>
                        </div>

                        {/* Meta App ID (Optional) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Meta App ID <span className="text-zinc-500 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.appId}
                                onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                                placeholder="e.g. 849302847592812"
                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#16acd4] transition-all text-sm font-mono"
                            />
                        </div>

                        {/* Meta App Secret (Optional) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                    Meta App Secret <span className="text-zinc-500 font-normal">(Optional)</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                                >
                                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    {showSecret ? "Hide" : "Show"}
                                </button>
                            </div>
                            <input
                                type={showSecret ? "text" : "password"}
                                value={formData.appSecret}
                                onChange={(e) => setFormData({ ...formData, appSecret: e.target.value })}
                                placeholder="App Secret Key"
                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#16acd4] transition-all text-sm font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Real-Time Webhook Configuration */}
                <div className="bg-[#121214] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <Radio className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Live Webhook Settings (Zero Delay Auto-Post)</h2>
                            <p className="text-xs text-zinc-400">Facebook automatically notifies your website the instant a new post is published</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Webhook Callback URL */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Webhook Callback URL
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    readOnly
                                    value={webhookUrl}
                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-zinc-300 font-mono text-xs pr-12 select-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
                                    className="absolute right-2 top-2 bottom-2 px-3 text-zinc-400 hover:text-white flex items-center justify-center"
                                    title="Copy URL"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[11px] text-zinc-500">
                                Paste this in Meta App Dashboard {"->"} Webhooks {"->"} Page {"->"} Callback URL
                            </p>
                        </div>

                        {/* Webhook Verify Token */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Webhook Verify Token
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.webhookVerifyToken}
                                    onChange={(e) => setFormData({ ...formData, webhookVerifyToken: e.target.value })}
                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(formData.webhookVerifyToken, "Verify Token")}
                                    className="absolute right-2 top-2 bottom-2 px-3 text-zinc-400 hover:text-white flex items-center justify-center"
                                    title="Copy Token"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[11px] text-zinc-500">
                                Secret token to verify that incoming webhook requests genuinely come from Facebook
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Automation & Homepage Display Controls */}
                <div className="bg-[#121214] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-[#16acd4]/10 border border-[#16acd4]/20 flex items-center justify-center text-[#16acd4]">
                            <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Automation & Website Display Options</h2>
                            <p className="text-xs text-zinc-400">Configure how and where Facebook posts appear on your homepage</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Auto Sync Toggle */}
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm text-white">Periodic Auto-Sync</h3>
                                <p className="text-xs text-zinc-400 mt-0.5">Automatically sync in background when visitors browse the site</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.autoSync}
                                    onChange={(e) => setFormData({ ...formData, autoSync: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16acd4]"></div>
                            </label>
                        </div>

                        {/* Show on Home Toggle */}
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm text-white">Show on Homepage</h3>
                                <p className="text-xs text-zinc-400 mt-0.5">Display live Facebook section directly on the main website homepage</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.showOnHome}
                                    onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16acd4]"></div>
                            </label>
                        </div>

                        {/* Sync Interval */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Background Sync Frequency
                            </label>
                            <select
                                value={formData.syncInterval}
                                onChange={(e) => setFormData({ ...formData, syncInterval: Number(e.target.value) })}
                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#16acd4] transition-all text-sm"
                            >
                                <option value={15}>Every 15 minutes (High Activity)</option>
                                <option value={30}>Every 30 minutes (Recommended)</option>
                                <option value={60}>Every 1 hour</option>
                                <option value={180}>Every 3 hours</option>
                                <option value={720}>Every 12 hours</option>
                            </select>
                        </div>

                        {/* Max Home Posts */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Maximum Posts on Homepage
                            </label>
                            <select
                                value={formData.maxHomePosts}
                                onChange={(e) => setFormData({ ...formData, maxHomePosts: Number(e.target.value) })}
                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#16acd4] transition-all text-sm"
                            >
                                <option value={4}>4 Posts (Single Row)</option>
                                <option value={6}>6 Posts (Balanced)</option>
                                <option value={8}>8 Posts (2 Rows Grid)</option>
                                <option value={12}>12 Posts (Showcase)</option>
                            </select>
                        </div>

                        {/* Homepage Section Title */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Homepage Section Title
                            </label>
                            <input
                                type="text"
                                value={formData.homeSectionTitle}
                                onChange={(e) => setFormData({ ...formData, homeSectionTitle: e.target.value })}
                                placeholder="Live from Facebook"
                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#16acd4] transition-all text-sm"
                            />
                        </div>

                        {/* Homepage Section Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Homepage Section Description
                            </label>
                            <input
                                type="text"
                                value={formData.homeSectionDesc}
                                onChange={(e) => setFormData({ ...formData, homeSectionDesc: e.target.value })}
                                placeholder="Latest detailing transformations..."
                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#16acd4] transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Save and Actions Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121214] p-6 rounded-3xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/posts"
                            className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                        >
                            <Layers className="w-4 h-4 text-[#16acd4]" /> View All Synced Posts in Showcase
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={handleSyncNow}
                            disabled={syncing}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-lg shadow-[#1877F2]/25 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                            {syncing ? "Syncing..." : "Sync Posts Now"}
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#16acd4] hover:bg-[#1397bc] text-black shadow-lg shadow-[#16acd4]/25 transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
