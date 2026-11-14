"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { WebsiteContent } from "@/lib/website-content.types"
import { 
    Loader2, Save, Plus, Trash2, ArrowUpRight, 
    LayoutTemplate, Sparkles, Shield, Wrench, Package, 
    Users, Video, Building2, HelpCircle, PhoneCall, Radio, Upload
} from "lucide-react"

type ActiveTab = 
    | "header" 
    | "hero" 
    | "ticker" 
    | "pdi" 
    | "services" 
    | "packages" 
    | "customers" 
    | "videos_studio" 
    | "creators" 
    | "faq" 
    | "contact"

// ─── Image Upload + Text Input Component ──────────────────────────────────────
function ImageUploadInput({
    label,
    value,
    onChange,
    placeholder = "Image path or URL"
}: {
    label: string
    value: string
    onChange: (val: string) => void
    placeholder?: string
}) {
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("folder", "website")
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })
            const data = await res.json()
            if (!res.ok || !data.url) throw new Error(data.error || "Upload failed")
            onChange(data.url)
            toast.success("Image uploaded successfully!")
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Failed to upload image")
        } finally {
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ""
        }
    }

    return (
        <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">{label}</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 bg-[#07090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#16acd4]"
                />
                <input 
                    type="file" 
                    ref={fileRef} 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                />
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 flex-shrink-0"
                >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Upload
                </button>
            </div>
            {value && (
                <div className="mt-1.5 flex items-center gap-2">
                    <img src={value} alt="" className="w-7 h-7 object-cover rounded border border-white/10" onError={(e) => ((e.currentTarget as HTMLElement).style.display = 'none')} />
                    <span className="text-[10px] text-zinc-500 truncate max-w-xs">{value}</span>
                </div>
            )}
        </div>
    )
}

export default function SuperAdminWebsitePage() {
    const [content, setContent] = useState<WebsiteContent | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<ActiveTab>("header")

    useEffect(() => {
        fetch("/api/admin/website")
            .then(res => res.json())
            .then(data => {
                setContent(data)
                setIsLoading(false)
            })
            .catch(err => {
                console.error(err)
                toast.error("Failed to load website content")
                setIsLoading(false)
            })
    }, [])

    const handleSave = async () => {
        if (!content) return
        setIsSaving(true)
        try {
            const res = await fetch("/api/admin/website", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(content)
            })
            if (!res.ok) throw new Error("Failed to save")
            toast.success("Website content saved successfully! Refresh homepage to view changes.")
        } catch (error) {
            console.error(error)
            toast.error("Failed to save changes")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading || !content) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#16acd4]" />
                <p className="text-zinc-400 text-sm font-medium">Loading CMS settings...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#121214] border border-white/10 p-6 rounded-2xl shadow-xl">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#16acd4] animate-pulse" />
                        <h1 className="text-2xl font-bold text-white font-display">Homepage Content Management</h1>
                    </div>
                    <p className="text-zinc-400 text-sm">
                        Edit, add, delete, and control 100% of homepage sections in real-time.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <a 
                        href="/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2.5 border border-white/10 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-white/5 transition flex items-center gap-1.5"
                    >
                        Preview Homepage <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#16acd4] text-black rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white transition disabled:opacity-50 shadow-lg shadow-[#16acd4]/20"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-thin">
                {[
                    { id: "header", label: "Header & Nav", icon: LayoutTemplate },
                    { id: "hero", label: "Hero Banner", icon: Sparkles },
                    { id: "ticker", label: "Ticker Strip", icon: Radio },
                    { id: "pdi", label: "PDI & Ritchie", icon: Shield },
                    { id: "services", label: "Services", icon: Wrench },
                    { id: "packages", label: "Packages", icon: Package },
                    { id: "customers", label: "Deliveries", icon: Users },
                    { id: "videos_studio", label: "Videos & Studio", icon: Building2 },
                    { id: "creators", label: "Creators Program", icon: Video },
                    { id: "faq", label: "FAQs", icon: HelpCircle },
                    { id: "contact", label: "Contact & Booking", icon: PhoneCall },
                ].map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ActiveTab)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                isActive 
                                    ? "bg-[#16acd4] text-black shadow-md shadow-[#16acd4]/25" 
                                    : "bg-[#121214] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5"
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* TAB CONTENT AREAS */}
            <div className="space-y-6">

                {/* TAB 1: HEADER & NAVBAR & OLD PAGES */}
                {activeTab === "header" && (
                    <div className="space-y-6">
                        {/* Topbar Settings */}
                        <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <LayoutTemplate className="w-4 h-4 text-[#16acd4]" /> Top Announcement &amp; Contact Bar
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Announcement Text</label>
                                    <input 
                                        type="text" 
                                        value={content.topbar.announcement}
                                        onChange={(e) => setContent({ ...content, topbar: { ...content.topbar, announcement: e.target.value } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Primary Phone</label>
                                    <input 
                                        type="text" 
                                        value={content.topbar.phone1}
                                        onChange={(e) => setContent({ ...content, topbar: { ...content.topbar, phone1: e.target.value } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Secondary Phone</label>
                                    <input 
                                        type="text" 
                                        value={content.topbar.phone2}
                                        onChange={(e) => setContent({ ...content, topbar: { ...content.topbar, phone2: e.target.value } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Email</label>
                                    <input 
                                        type="text" 
                                        value={content.topbar.email}
                                        onChange={(e) => setContent({ ...content, topbar: { ...content.topbar, email: e.target.value } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">WhatsApp Number (e.g. 918679400014)</label>
                                    <input 
                                        type="text" 
                                        value={content.topbar.whatsappNumber}
                                        onChange={(e) => setContent({ ...content, topbar: { ...content.topbar, whatsappNumber: e.target.value } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Navigation Links Manager (Including Old Pages) */}
                        <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Header Navigation Links (All Pages)</h2>
                                    <p className="text-xs text-zinc-400">Add or edit links for both homepage sections and older pages (Marketplace, Cars, Bikes, Insurance Claim, Shop, Feed, etc.).</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const newLinks = [...(content.header.navLinks || []), { label: "New Page", href: "/new-page" }]
                                        setContent({ ...content, header: { ...content.header, navLinks: newLinks } })
                                    }}
                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Nav Link
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(content.header.navLinks || []).map((link, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 bg-[#07090b] p-3 rounded-xl border border-white/5">
                                        <div className="w-full sm:w-1/3">
                                            <input 
                                                type="text" 
                                                value={link.label}
                                                placeholder="Menu Label (e.g. Cars)"
                                                onChange={(e) => {
                                                    const updated = [...content.header.navLinks]
                                                    updated[idx].label = e.target.value
                                                    setContent({ ...content, header: { ...content.header, navLinks: updated } })
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                                            />
                                        </div>
                                        <div className="w-full sm:flex-1">
                                            <input 
                                                type="text" 
                                                value={link.href}
                                                placeholder="URL / Path (e.g. /cars, /marketplace, #pdi)"
                                                onChange={(e) => {
                                                    const updated = [...content.header.navLinks]
                                                    updated[idx].href = e.target.value
                                                    setContent({ ...content, header: { ...content.header, navLinks: updated } })
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const updated = content.header.navLinks.filter((_, i) => i !== idx)
                                                setContent({ ...content, header: { ...content.header, navLinks: updated } })
                                            }}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Logo and Brand Title */}
                        <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                            <h2 className="text-lg font-bold text-white">Brand Logo &amp; CTA</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <ImageUploadInput 
                                    label="Logo Image (Upload or URL)"
                                    value={content.header.logoUrl}
                                    onChange={(url) => setContent({ ...content, header: { ...content.header, logoUrl: url } })}
                                />
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Header CTA Button Text</label>
                                    <input 
                                        type="text" 
                                        value={content.header.ctaText}
                                        onChange={(e) => setContent({ ...content, header: { ...content.header, ctaText: e.target.value } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: HERO BANNER */}
                {activeTab === "hero" && (
                    <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#16acd4]" /> Hero Banner Settings
                        </h2>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="md:col-span-3">
                                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Eyebrow Badge</label>
                                <input 
                                    type="text" 
                                    value={content.hero.eyebrow}
                                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, eyebrow: e.target.value } })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Headline Line 1</label>
                                <input 
                                    type="text" 
                                    value={content.hero.titleLine1}
                                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleLine1: e.target.value } })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Headline Line 2 (Cyan)</label>
                                <input 
                                    type="text" 
                                    value={content.hero.titleLine2}
                                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleLine2: e.target.value } })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-[#16acd4] font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Headline Line 3</label>
                                <input 
                                    type="text" 
                                    value={content.hero.titleLine3}
                                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleLine3: e.target.value } })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Hero Description</label>
                                <textarea 
                                    rows={3}
                                    value={content.hero.description}
                                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <ImageUploadInput 
                                    label="Hero Background Image (Upload or URL)"
                                    value={content.hero.bgImageUrl}
                                    onChange={(url) => setContent({ ...content, hero: { ...content.hero, bgImageUrl: url } })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Primary CTA Button</label>
                                <input 
                                    type="text" 
                                    value={content.hero.primaryCtaText}
                                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, primaryCtaText: e.target.value } })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Secondary CTA Button</label>
                                <input 
                                    type="text" 
                                    value={content.hero.secondaryCtaText}
                                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, secondaryCtaText: e.target.value } })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white"
                                />
                            </div>
                        </div>

                        {/* Stats / Numbers */}
                        <div className="pt-4 border-t border-white/10">
                            <h3 className="text-sm font-bold text-white mb-3">Hero Counter Statistics</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                {content.hero.stats.map((st, i) => (
                                    <div key={i} className="bg-[#07090b] p-3 rounded-xl border border-white/5 space-y-2">
                                        <input 
                                            type="text" 
                                            value={st.value}
                                            placeholder="Stat Value (e.g. 100+)"
                                            onChange={(e) => {
                                                const updated = [...content.hero.stats]
                                                updated[i].value = e.target.value
                                                setContent({ ...content, hero: { ...content.hero, stats: updated } })
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-white"
                                        />
                                        <input 
                                            type="text" 
                                            value={st.label}
                                            placeholder="Label (e.g. PDI checkpoints)"
                                            onChange={(e) => {
                                                const updated = [...content.hero.stats]
                                                updated[i].label = e.target.value
                                                setContent({ ...content, hero: { ...content.hero, stats: updated } })
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-400"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: TICKER STRIP */}
                {activeTab === "ticker" && (
                    <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Radio className="w-4 h-4 text-[#16acd4]" /> Marquee Ticker Strip
                                </h2>
                                <p className="text-xs text-zinc-400">Manage the moving text ribbon displayed below the hero section.</p>
                            </div>
                            <button
                                onClick={() => {
                                    const updated = [...content.ticker.items, "New Announcement"]
                                    setContent({ ...content, ticker: { items: updated } })
                                }}
                                className="px-3 py-1.5 bg-[#16acd4] text-black rounded-lg text-xs font-bold flex items-center gap-1.5"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Ticker Text
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            {content.ticker.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-[#07090b] p-2.5 rounded-xl border border-white/5">
                                    <span className="text-xs font-mono text-zinc-500 w-6 text-center">{idx + 1}</span>
                                    <input 
                                        type="text" 
                                        value={item}
                                        onChange={(e) => {
                                            const updated = [...content.ticker.items]
                                            updated[idx] = e.target.value
                                            setContent({ ...content, ticker: { items: updated } })
                                        }}
                                        className="flex-1 bg-transparent border-0 text-sm text-white focus:outline-none"
                                    />
                                    <button
                                        onClick={() => {
                                            const updated = content.ticker.items.filter((_, i) => i !== idx)
                                            setContent({ ...content, ticker: { items: updated } })
                                        }}
                                        className="p-1.5 text-red-400 hover:text-red-300"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 4: PDI & RITCHIE */}
                {activeTab === "pdi" && (
                    <div className="space-y-6">
                        {/* PDI Pricing & Core Card */}
                        <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#16acd4]" /> PDI Pricing &amp; Details
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">PDI Section Heading</label>
                                    <input 
                                        type="text" 
                                        value={content.pdi.heading}
                                        onChange={(e) => setContent({ ...content, pdi: { ...content.pdi, heading: e.target.value } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Base Price</label>
                                    <input 
                                        type="text" 
                                        value={content.pdi.pricing.amount}
                                        onChange={(e) => setContent({ ...content, pdi: { ...content.pdi, pricing: { ...content.pdi.pricing, amount: e.target.value } } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-[#16acd4] font-bold"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Travel Footnote</label>
                                    <input 
                                        type="text" 
                                        value={content.pdi.pricing.footnote}
                                        onChange={(e) => setContent({ ...content, pdi: { ...content.pdi, pricing: { ...content.pdi.pricing, footnote: e.target.value } } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-zinc-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ritchie Profile */}
                        <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                            <h2 className="text-lg font-bold text-white">PDI Professional Profile (Ritchie)</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Professional Name</label>
                                    <input 
                                        type="text" 
                                        value={content.pdi.ritchie.name}
                                        onChange={(e) => setContent({ ...content, pdi: { ...content.pdi, ritchie: { ...content.pdi.ritchie, name: e.target.value } } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white"
                                    />
                                </div>
                                <ImageUploadInput 
                                    label="Photo Image (Upload or URL)"
                                    value={content.pdi.ritchie.imageUrl}
                                    onChange={(url) => setContent({ ...content, pdi: { ...content.pdi, ritchie: { ...content.pdi.ritchie, imageUrl: url } } })}
                                />
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Quote</label>
                                    <input 
                                        type="text" 
                                        value={content.pdi.ritchie.quote}
                                        onChange={(e) => setContent({ ...content, pdi: { ...content.pdi, ritchie: { ...content.pdi.ritchie, quote: e.target.value } } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-[#16acd4]"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Bio / Credentials</label>
                                    <textarea 
                                        rows={3}
                                        value={content.pdi.ritchie.description}
                                        onChange={(e) => setContent({ ...content, pdi: { ...content.pdi, ritchie: { ...content.pdi.ritchie, description: e.target.value } } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sample Reports */}
                        <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-white">Sample Reports &amp; Evidence Documents</h2>
                                <button
                                    onClick={() => {
                                        const updated = [...content.pdi.sampleReports, { title: "New Report", subtitle: "Details", imageUrl: "/images/reports/pdi-report-scorpio-n.jpg" }]
                                        setContent({ ...content, pdi: { ...content.pdi, sampleReports: updated } })
                                    }}
                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Report Card
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {content.pdi.sampleReports.map((rep, idx) => (
                                    <div key={idx} className="bg-[#07090b] p-4 rounded-xl border border-white/5 space-y-3 relative">
                                        <button
                                            onClick={() => {
                                                const updated = content.pdi.sampleReports.filter((_, i) => i !== idx)
                                                setContent({ ...content, pdi: { ...content.pdi, sampleReports: updated } })
                                            }}
                                            className="absolute top-3 right-3 text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div>
                                            <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Report Title</label>
                                            <input 
                                                type="text" 
                                                value={rep.title}
                                                onChange={(e) => {
                                                    const updated = [...content.pdi.sampleReports]
                                                    updated[idx].title = e.target.value
                                                    setContent({ ...content, pdi: { ...content.pdi, sampleReports: updated } })
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Subtitle</label>
                                            <input 
                                                type="text" 
                                                value={rep.subtitle}
                                                onChange={(e) => {
                                                    const updated = [...content.pdi.sampleReports]
                                                    updated[idx].subtitle = e.target.value
                                                    setContent({ ...content, pdi: { ...content.pdi, sampleReports: updated } })
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                                            />
                                        </div>
                                        <ImageUploadInput 
                                            label="Report Image (Upload or URL)"
                                            value={rep.imageUrl}
                                            onChange={(url) => {
                                                const updated = [...content.pdi.sampleReports]
                                                updated[idx].imageUrl = url
                                                setContent({ ...content, pdi: { ...content.pdi, sampleReports: updated } })
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 5: SERVICES */}
                {activeTab === "services" && (
                    <div className="space-y-6">
                        <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-[#16acd4]" /> Core Detailing Services
                                    </h2>
                                    <p className="text-xs text-zinc-400">Total {content.services.primaryList.length} services configured.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const newSvc = {
                                            id: `svc_${Date.now()}`,
                                            emoji: "✨",
                                            title: "New Service",
                                            description: "Service description here.",
                                            items: ["Point 1", "Point 2"],
                                            ctaLink: "/#contact",
                                            isActive: true
                                        }
                                        setContent({ ...content, services: { ...content.services, primaryList: [...content.services.primaryList, newSvc] } })
                                    }}
                                    className="px-3 py-1.5 bg-[#16acd4] text-black rounded-lg text-xs font-bold flex items-center gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Service
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {content.services.primaryList.map((svc, idx) => (
                                    <div key={svc.id} className="bg-[#07090b] p-4 rounded-xl border border-white/5 space-y-3 relative">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-mono text-[#16acd4]">Service #{idx + 1}</span>
                                            <button
                                                onClick={() => {
                                                    const updated = content.services.primaryList.filter((_, i) => i !== idx)
                                                    setContent({ ...content, services: { ...content.services, primaryList: updated } })
                                                }}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={svc.emoji || ""}
                                                placeholder="Icon"
                                                onChange={(e) => {
                                                    const updated = [...content.services.primaryList]
                                                    updated[idx].emoji = e.target.value
                                                    setContent({ ...content, services: { ...content.services, primaryList: updated } })
                                                }}
                                                className="w-14 text-center bg-black/40 border border-white/10 rounded px-2 py-1.5 text-base font-bold text-white"
                                            />
                                            <input 
                                                type="text" 
                                                value={svc.title}
                                                placeholder="Service Title"
                                                onChange={(e) => {
                                                    const updated = [...content.services.primaryList]
                                                    updated[idx].title = e.target.value
                                                    setContent({ ...content, services: { ...content.services, primaryList: updated } })
                                                }}
                                                className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-1.5 text-sm font-bold text-white"
                                            />
                                        </div>
                                        <textarea 
                                            rows={2}
                                            value={svc.description}
                                            placeholder="Description"
                                            onChange={(e) => {
                                                const updated = [...content.services.primaryList]
                                                updated[idx].description = e.target.value
                                                setContent({ ...content, services: { ...content.services, primaryList: updated } })
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs text-zinc-300"
                                        />
                                        <div>
                                            <label className="block text-[10px] font-mono text-zinc-500 mb-1">Checklist Points (comma separated)</label>
                                            <input 
                                                type="text" 
                                                value={svc.items.join(", ")}
                                                onChange={(e) => {
                                                    const updated = [...content.services.primaryList]
                                                    updated[idx].items = e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                    setContent({ ...content, services: { ...content.services, primaryList: updated } })
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs text-zinc-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-zinc-500 mb-1">Button Link / Action</label>
                                            <input 
                                                type="text" 
                                                value={svc.ctaLink || ""}
                                                placeholder="/pdi or /#contact (empty for WhatsApp)"
                                                onChange={(e) => {
                                                    const updated = [...content.services.primaryList]
                                                    updated[idx].ctaLink = e.target.value
                                                    setContent({ ...content, services: { ...content.services, primaryList: updated } })
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs text-zinc-300 font-mono"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Solutions & Poster */}
                        <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                            <h2 className="text-lg font-bold text-white">Services Mission Poster</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <ImageUploadInput 
                                    label="Poster Image (Upload or URL)"
                                    value={content.services.poster.imageUrl}
                                    onChange={(url) => setContent({ ...content, services: { ...content.services, poster: { ...content.services.poster, imageUrl: url } } })}
                                />
                                <div>
                                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Heading</label>
                                    <input 
                                        type="text" 
                                        value={content.services.poster.heading}
                                        onChange={(e) => setContent({ ...content, services: { ...content.services, poster: { ...content.services.poster, heading: e.target.value } } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded px-3.5 py-2 text-sm text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 6: PACKAGES */}
                {activeTab === "packages" && (
                    <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#16acd4]" /> Detailing Packages
                            </h2>
                            <button
                                onClick={() => {
                                    const newPkg = {
                                        id: `pkg_${Date.now()}`,
                                        forText: "Custom Plan",
                                        name: "New Package",
                                        items: ["Feature 1", "Feature 2"],
                                        isHighlighted: false,
                                        ctaText: "Ask for price",
                                        ctaLink: "#contact"
                                    }
                                    setContent({ ...content, packages: { ...content.packages, list: [...content.packages.list, newPkg] } })
                                }}
                                className="px-3 py-1.5 bg-[#16acd4] text-black rounded-lg text-xs font-bold flex items-center gap-1.5"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Package
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {content.packages.list.map((pkg, idx) => (
                                <div key={pkg.id} className={`p-4 rounded-xl border relative space-y-3 ${pkg.isHighlighted ? "bg-[#16acd4]/10 border-[#16acd4]" : "bg-[#07090b] border-white/5"}`}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="checkbox"
                                                id={`hl_${idx}`}
                                                checked={pkg.isHighlighted}
                                                onChange={(e) => {
                                                    const updated = [...content.packages.list]
                                                    updated[idx].isHighlighted = e.target.checked
                                                    setContent({ ...content, packages: { ...content.packages, list: updated } })
                                                }}
                                                className="accent-[#16acd4]"
                                            />
                                            <label htmlFor={`hl_${idx}`} className="text-xs text-zinc-400 cursor-pointer">Highlight (Cyan border)</label>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const updated = content.packages.list.filter((_, i) => i !== idx)
                                                setContent({ ...content, packages: { ...content.packages, list: updated } })
                                            }}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input 
                                            type="text" 
                                            value={pkg.forText}
                                            placeholder="Tag (e.g. Deep clean)"
                                            onChange={(e) => {
                                                const updated = [...content.packages.list]
                                                updated[idx].forText = e.target.value
                                                setContent({ ...content, packages: { ...content.packages, list: updated } })
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-[#16acd4]"
                                        />
                                        <input 
                                            type="text" 
                                            value={pkg.name}
                                            placeholder="Package Name"
                                            onChange={(e) => {
                                                const updated = [...content.packages.list]
                                                updated[idx].name = e.target.value
                                                setContent({ ...content, packages: { ...content.packages, list: updated } })
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs font-bold text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-zinc-500 mb-1">Features (comma separated)</label>
                                        <textarea 
                                            rows={2}
                                            value={pkg.items.join(", ")}
                                            onChange={(e) => {
                                                const updated = [...content.packages.list]
                                                updated[idx].items = e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                setContent({ ...content, packages: { ...content.packages, list: updated } })
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 7: DELIVERIES / CUSTOMERS */}
                {activeTab === "customers" && (
                    <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-6">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#16acd4]" /> Real Customer Deliveries (Delivered with peace of mind)
                                </h2>
                                <p className="text-xs text-zinc-400">
                                    Live customer delivery cards displayed on the homepage. Automatically fed from Facebook synced posts.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href="/admin/settings/facebook"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:text-blue-300 rounded-lg text-xs font-bold flex items-center gap-1.5"
                                >
                                    <Radio className="w-3.5 h-3.5" /> Facebook Sync Settings ↗
                                </a>
                                <button
                                    onClick={() => {
                                        const newCust = {
                                            id: `c_${Date.now()}`,
                                            brand: "Tata",
                                            carModel: "New Delivery",
                                            customerDetails: "Customer Name · Showroom",
                                            imageUrl: "/images/customers/grand-vitara-gyanchand-sharma.jpg"
                                        }
                                        setContent({ ...content, customers: { ...content.customers, list: [...content.customers.list, newCust] } })
                                    }}
                                    className="px-3 py-1.5 bg-[#16acd4] text-black rounded-lg text-xs font-bold flex items-center gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Manual Card
                                </button>
                            </div>
                        </div>

                        {/* Facebook Live Sync Toggle Card */}
                        <div className="bg-blue-950/20 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                    <b className="text-sm text-white">Live Facebook Deliveries Sync</b>
                                </div>
                                <p className="text-xs text-zinc-400 max-w-xl">
                                    When enabled, the "Delivered with peace of mind" section dynamically displays real delivery posters and inspection details synced from your Facebook page.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={content.customers.useFacebookPosts !== false}
                                        onChange={(e) => setContent({ ...content, customers: { ...content.customers, useFacebookPosts: e.target.checked } })}
                                        className="rounded border-white/20 bg-black/40 text-[#16acd4] focus:ring-0"
                                    />
                                    <span>Sync from Facebook Posts (Active)</span>
                                </label>
                            </div>
                        </div>

                        {/* Section Text Configuration */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400">Eyebrow</label>
                                <input 
                                    type="text" 
                                    value={content.customers.eyebrow}
                                    onChange={(e) => setContent({ ...content, customers: { ...content.customers, eyebrow: e.target.value } })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400">Heading</label>
                                <input 
                                    type="text" 
                                    value={content.customers.heading}
                                    onChange={(e) => setContent({ ...content, customers: { ...content.customers, heading: e.target.value } })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white font-bold"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400">Facebook Page URL</label>
                                <input 
                                    type="text" 
                                    value={content.customers.facebookPageUrl || "https://www.facebook.com/detailinggarage.in"}
                                    onChange={(e) => setContent({ ...content, customers: { ...content.customers, facebookPageUrl: e.target.value } })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-zinc-400">Section Description</label>
                            <textarea 
                                rows={2}
                                value={content.customers.description}
                                onChange={(e) => setContent({ ...content, customers: { ...content.customers, description: e.target.value } })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                            />
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                                Manual Fallback Customer Cards ({content.customers.list.length})
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                {content.customers.list.map((c, idx) => (
                                    <div key={c.id} className="bg-[#07090b] p-3 rounded-xl border border-white/5 space-y-2 relative">
                                        <button
                                            onClick={() => {
                                                const updated = content.customers.list.filter((_, i) => i !== idx)
                                                setContent({ ...content, customers: { ...content.customers, list: updated } })
                                            }}
                                            className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input 
                                                type="text" 
                                                value={c.brand}
                                                placeholder="Brand (e.g. Maruti)"
                                                onChange={(e) => {
                                                    const updated = [...content.customers.list]
                                                    updated[idx].brand = e.target.value
                                                    setContent({ ...content, customers: { ...content.customers, list: updated } })
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#16acd4]"
                                            />
                                            <input 
                                                type="text" 
                                                value={c.carModel}
                                                placeholder="Car Model"
                                                onChange={(e) => {
                                                    const updated = [...content.customers.list]
                                                    updated[idx].carModel = e.target.value
                                                    setContent({ ...content, customers: { ...content.customers, list: updated } })
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-bold text-white"
                                            />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={c.customerDetails}
                                            placeholder="Customer & Dealership"
                                            onChange={(e) => {
                                                const updated = [...content.customers.list]
                                                updated[idx].customerDetails = e.target.value
                                                setContent({ ...content, customers: { ...content.customers, list: updated } })
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-zinc-300"
                                        />
                                        <ImageUploadInput 
                                            label="Poster / Photo (Upload or URL)"
                                            value={c.imageUrl}
                                            onChange={(url) => {
                                                const updated = [...content.customers.list]
                                                updated[idx].imageUrl = url
                                                setContent({ ...content, customers: { ...content.customers, list: updated } })
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 8: VIDEOS & STUDIO */}
                {activeTab === "videos_studio" && (
                    <div className="space-y-6">
                        {/* Video Reels */}
                        <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Video className="w-4 h-4 text-[#16acd4]" /> Video Reels (Watch Us Work)
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {content.videos.reels.map((reel, idx) => (
                                    <div key={reel.id} className="bg-[#07090b] p-4 rounded-xl border border-white/5 space-y-3">
                                        <div className="text-xs font-mono text-[#16acd4]">Reel #{idx + 1}</div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-zinc-500 mb-1">Video MP4 URL</label>
                                            <input 
                                                type="text" 
                                                value={reel.videoUrl}
                                                onChange={(e) => {
                                                    const updated = [...content.videos.reels]
                                                    updated[idx].videoUrl = e.target.value
                                                    setContent({ ...content, videos: { ...content.videos, reels: updated } })
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                                            />
                                        </div>
                                        <ImageUploadInput 
                                            label="Poster Image (Upload or URL)"
                                            value={reel.posterUrl}
                                            onChange={(url) => {
                                                const updated = [...content.videos.reels]
                                                updated[idx].posterUrl = url
                                                setContent({ ...content, videos: { ...content.videos, reels: updated } })
                                            }}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input 
                                                type="text" 
                                                value={reel.title}
                                                placeholder="Title"
                                                onChange={(e) => {
                                                    const updated = [...content.videos.reels]
                                                    updated[idx].title = e.target.value
                                                    setContent({ ...content, videos: { ...content.videos, reels: updated } })
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs font-bold text-white"
                                            />
                                            <input 
                                                type="text" 
                                                value={reel.tag}
                                                placeholder="Tag"
                                                onChange={(e) => {
                                                    const updated = [...content.videos.reels]
                                                    updated[idx].tag = e.target.value
                                                    setContent({ ...content, videos: { ...content.videos, reels: updated } })
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-[#16acd4]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Studio Description & Values */}
                        <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#16acd4]" /> Studio Photos &amp; Tagline
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Hindi Tagline</label>
                                    <input 
                                        type="text" 
                                        value={content.studio.taglineHindi}
                                        onChange={(e) => setContent({ ...content, studio: { ...content.studio, taglineHindi: e.target.value } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded px-3.5 py-2 text-sm text-[#16acd4] font-bold"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Studio Description</label>
                                    <textarea 
                                        rows={3}
                                        value={content.studio.description}
                                        onChange={(e) => setContent({ ...content, studio: { ...content.studio, description: e.target.value } })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded px-3.5 py-2 text-sm text-white"
                                    />
                                </div>
                                <ImageUploadInput 
                                    label="Main Storefront Photo (Upload or URL)"
                                    value={content.studio.photos.main}
                                    onChange={(url) => setContent({ ...content, studio: { ...content.studio, photos: { ...content.studio.photos, main: url } } })}
                                />
                                <ImageUploadInput 
                                    label="Lounge Photo 1 (Upload or URL)"
                                    value={content.studio.photos.sub1}
                                    onChange={(url) => setContent({ ...content, studio: { ...content.studio, photos: { ...content.studio.photos, sub1: url } } })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 9: CREATORS PROGRAM */}
                {activeTab === "creators" && (
                    <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Video className="w-4 h-4 text-[#16acd4]" /> Auto Creators &amp; Influencer Hiring Program
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {content.creators.roles.map((r, idx) => (
                                <div key={idx} className="bg-[#07090b] p-4 rounded-xl border border-white/5 space-y-2">
                                    <input 
                                        type="text" 
                                        value={r.roleNum}
                                        onChange={(e) => {
                                            const updated = [...content.creators.roles]
                                            updated[idx].roleNum = e.target.value
                                            setContent({ ...content, creators: { ...content.creators, roles: updated } })
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1 text-xs text-[#16acd4]"
                                    />
                                    <input 
                                        type="text" 
                                        value={r.title}
                                        onChange={(e) => {
                                            const updated = [...content.creators.roles]
                                            updated[idx].title = e.target.value
                                            setContent({ ...content, creators: { ...content.creators, roles: updated } })
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1 text-sm font-bold text-white"
                                    />
                                    <textarea 
                                        rows={2}
                                        value={r.description}
                                        onChange={(e) => {
                                            const updated = [...content.creators.roles]
                                            updated[idx].description = e.target.value
                                            setContent({ ...content, creators: { ...content.creators, roles: updated } })
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1 text-xs text-zinc-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 10: FAQS */}
                {activeTab === "faq" && (
                    <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4 text-[#16acd4]" /> FAQ Manager
                                </h2>
                                <p className="text-xs text-zinc-400">Total {content.faq.items.length} questions configured.</p>
                            </div>
                            <button
                                onClick={() => {
                                    const newFaq = {
                                        id: `faq_${Date.now()}`,
                                        question: "New Question?",
                                        answer: "Detailed answer goes here."
                                    }
                                    setContent({ ...content, faq: { ...content.faq, items: [...content.faq.items, newFaq] } })
                                }}
                                className="px-3 py-1.5 bg-[#16acd4] text-black rounded-lg text-xs font-bold flex items-center gap-1.5"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add FAQ
                            </button>
                        </div>

                        <div className="space-y-3">
                            {content.faq.items.map((item, idx) => (
                                <div key={item.id} className="bg-[#07090b] p-4 rounded-xl border border-white/5 space-y-3 relative">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-mono text-[#16acd4]">Q#{idx + 1}</span>
                                        <button
                                            onClick={() => {
                                                const updated = content.faq.items.filter((_, i) => i !== idx)
                                                setContent({ ...content, faq: { ...content.faq, items: updated } })
                                            }}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={item.question}
                                        placeholder="Question"
                                        onChange={(e) => {
                                            const updated = [...content.faq.items]
                                            updated[idx].question = e.target.value
                                            setContent({ ...content, faq: { ...content.faq, items: updated } })
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm font-bold text-white"
                                    />
                                    <textarea 
                                        rows={2}
                                        value={item.answer}
                                        placeholder="Answer"
                                        onChange={(e) => {
                                            const updated = [...content.faq.items]
                                            updated[idx].answer = e.target.value
                                            setContent({ ...content, faq: { ...content.faq, items: updated } })
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-zinc-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 11: CONTACT & BOOKING */}
                {activeTab === "contact" && (
                    <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <PhoneCall className="w-4 h-4 text-[#16acd4]" /> Contact Details &amp; WhatsApp Booking Form
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Studio Address</label>
                                <input 
                                    type="text" 
                                    value={content.contact.address}
                                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, address: e.target.value } })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded px-3.5 py-2 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Working Hours</label>
                                <input 
                                    type="text" 
                                    value={content.contact.hours}
                                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, hours: e.target.value } })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded px-3.5 py-2 text-sm text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Booking Form Service Options (comma separated)</label>
                                <input 
                                    type="text" 
                                    value={content.contact.bookingServices.join(", ")}
                                    onChange={(e) => setContent({ 
                                        ...content, 
                                        contact: { 
                                            ...content.contact, 
                                            bookingServices: e.target.value.split(",").map(s => s.trim()).filter(Boolean) 
                                        } 
                                    })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded px-3.5 py-2 text-sm text-white"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Bottom Save Button for Mobile */}
            <div className="sticky bottom-4 z-20 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-[#16acd4] text-black rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-white transition shadow-2xl shadow-[#16acd4]/40"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save All Changes
                </button>
            </div>
        </div>
    )
}
