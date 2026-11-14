"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
    Wrench,
    Plus,
    Trash2,
    Save,
    ExternalLink,
    MoveUp,
    MoveDown,
    CheckCircle2,
    Tag,
    Layers,
    Sparkles,
    AlertCircle,
    ArrowLeft
} from "lucide-react"
import { WebsiteContent, defaultWebsiteContent } from "@/lib/website-content.types"
import { toast } from "react-hot-toast"

interface ServiceCardItem {
    id: string
    emoji?: string
    title: string
    description: string
    items: string[]
    ctaLink?: string
    isActive: boolean
}

const COMMON_EMOJIS = ["🔎", "💎", "🧴", "🛡️", "🔊", "🚙", "🔧", "🎨", "📋", "🚨", "⚙️", "🤝", "✨", "🚗", "🏎️", "🧽", "🏁", "⚡"]

export default function AdminServicesEditorPage() {
    const [content, setContent] = useState<WebsiteContent | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [newBrand, setNewBrand] = useState("")

    // Load content
    useEffect(() => {
        fetch("/api/admin/website")
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized or failed")
                return res.json()
            })
            .then(data => {
                setContent(data)
                setLoading(false)
            })
            .catch(err => {
                console.error("Error loading website content:", err)
                toast.error("Failed to load website content")
                setLoading(false)
            })
    }, [])

    const handleSave = async () => {
        if (!content) return
        setSaving(true)
        try {
            const res = await fetch("/api/admin/website", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    services: content.services
                })
            })
            if (!res.ok) throw new Error("Failed to save")
            const updated = await res.json()
            setContent(updated)
            toast.success("Services page updated successfully!")
        } catch (err) {
            console.error("Error saving services content:", err)
            toast.error("Failed to save changes. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    // Card operations
    const updateCard = (index: number, patch: Partial<ServiceCardItem>) => {
        if (!content) return
        const list = [...(content.services.primaryList || [])]
        list[index] = { ...list[index], ...patch }
        setContent({
            ...content,
            services: { ...content.services, primaryList: list }
        })
    }

    const addCard = () => {
        if (!content) return
        const newCard: ServiceCardItem = {
            id: `svc_${Date.now()}`,
            emoji: "✨",
            title: "New Service",
            description: "Describe the service highlights and what makes it special.",
            items: ["Key feature 1", "Key feature 2", "Key feature 3"],
            ctaLink: "/#contact",
            isActive: true
        }
        setContent({
            ...content,
            services: {
                ...content.services,
                primaryList: [...(content.services.primaryList || []), newCard]
            }
        })
        toast("New service card added. Remember to click Save!", { icon: "✨" })
    }

    const removeCard = (index: number) => {
        if (!content) return
        const list = [...(content.services.primaryList || [])]
        const removed = list.splice(index, 1)
        setContent({
            ...content,
            services: { ...content.services, primaryList: list }
        })
        toast(`Removed "${removed[0]?.title || 'Service'}"`, { icon: "🗑️" })
    }

    const moveCard = (index: number, direction: "up" | "down") => {
        if (!content) return
        const list = [...(content.services.primaryList || [])]
        const targetIndex = direction === "up" ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= list.length) return
        const temp = list[index]
        list[index] = list[targetIndex]
        list[targetIndex] = temp
        setContent({
            ...content,
            services: { ...content.services, primaryList: list }
        })
    }

    // Brand operations
    const addBrand = () => {
        if (!content || !newBrand.trim()) return
        const currentBrands = content.services.brands || defaultWebsiteContent.services.brands || []
        if (currentBrands.includes(newBrand.trim())) {
            toast("Brand already exists", { icon: "⚠️" })
            return
        }
        setContent({
            ...content,
            services: {
                ...content.services,
                brands: [...currentBrands, newBrand.trim()]
            }
        })
        setNewBrand("")
    }

    const removeBrand = (index: number) => {
        if (!content) return
        const currentBrands = [...(content.services.brands || defaultWebsiteContent.services.brands || [])]
        currentBrands.splice(index, 1)
        setContent({
            ...content,
            services: { ...content.services, brands: currentBrands }
        })
    }

    // Reset to defaults
    const handleResetDefaults = () => {
        if (!content) return
        if (!confirm("Are you sure you want to reset the services and brands to default values?")) return
        setContent({
            ...content,
            services: {
                ...content.services,
                eyebrow: defaultWebsiteContent.services.eyebrow,
                heading: defaultWebsiteContent.services.heading,
                description: defaultWebsiteContent.services.description,
                primaryList: defaultWebsiteContent.services.primaryList,
                brandsHeading: defaultWebsiteContent.services.brandsHeading,
                brands: defaultWebsiteContent.services.brands
            }
        })
        toast("Reset to defaults. Click 'Save Changes' to apply.", { icon: "ℹ️" })
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-400 gap-3">
                <div className="w-8 h-8 border-2 border-[#16acd4] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-mono">Loading Services Content...</p>
            </div>
        )
    }

    if (!content) {
        return (
            <div className="p-8 text-center text-zinc-400 space-y-4">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <p className="text-lg font-semibold text-white">Could not load website content.</p>
                <p className="text-sm">Make sure you are logged in with admin privileges.</p>
            </div>
        )
    }

    const services = content.services
    const cardList = services.primaryList || defaultWebsiteContent.services.primaryList
    const brands = services.brands || defaultWebsiteContent.services.brands || []

    return (
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-24">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#16acd4] uppercase tracking-wider mb-1">
                        <Link href="/admin" className="hover:underline flex items-center gap-1">
                            <ArrowLeft className="w-3 h-3" /> Admin Dashboard
                        </Link>
                        <span>/</span>
                        <span>Services Editor</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                        <Wrench className="w-7 h-7 text-[#16acd4]" />
                        Services Page Manager
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Dynamic visual manager for <code className="text-[#16acd4]">/services</code> page cards, hero text, and partner brands.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={handleResetDefaults}
                        type="button"
                        className="px-3.5 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition"
                    >
                        Reset Defaults
                    </button>
                    <Link
                        href="/services"
                        target="_blank"
                        className="px-3.5 py-2 rounded-xl border border-[#16acd4]/30 bg-[#16acd4]/10 text-xs font-semibold text-[#16acd4] hover:bg-[#16acd4]/20 flex items-center gap-1.5 transition"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Live Page
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 rounded-xl bg-[#16acd4] hover:bg-[#1499be] text-black text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#16acd4]/20 transition disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save All Changes"}
                    </button>
                </div>
            </div>

            {/* SECTION 1: HERO SETTINGS */}
            <div className="bg-[#0e1316] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <Sparkles className="w-5 h-5 text-[#16acd4]" />
                    <h2 className="text-lg font-bold text-white">Services Page Header (Hero Banner)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                            Eyebrow Tagline
                        </label>
                        <input
                            type="text"
                            value={services.eyebrow || ""}
                            onChange={e => setContent({
                                ...content,
                                services: { ...content.services, eyebrow: e.target.value }
                            })}
                            placeholder="e.g. Detailing & protection"
                            className="w-full bg-[#07090b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#16acd4]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                            Page Title / Heading
                        </label>
                        <input
                            type="text"
                            value={services.heading || ""}
                            onChange={e => setContent({
                                ...content,
                                services: { ...content.services, heading: e.target.value }
                            })}
                            placeholder="e.g. Showroom se bhi better finish"
                            className="w-full bg-[#07090b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#16acd4]"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                            Hero Description Paragraph
                        </label>
                        <textarea
                            rows={3}
                            value={services.description || ""}
                            onChange={e => setContent({
                                ...content,
                                services: { ...content.services, description: e.target.value }
                            })}
                            placeholder="Brief introductory paragraph explaining your complete automotive care under one roof."
                            className="w-full bg-[#07090b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#16acd4] resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 2: SERVICES CARDS */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-[#16acd4]" />
                            <h2 className="text-xl font-extrabold text-white">
                                Service Cards ({cardList.length})
                            </h2>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Drag or click arrows to reorder. Each card shows on <code className="text-[#16acd4]">/services</code> grid.
                        </p>
                    </div>
                    <button
                        onClick={addCard}
                        type="button"
                        className="px-4 py-2 bg-[#16acd4] hover:bg-[#1499be] text-black rounded-xl text-xs font-bold flex items-center gap-2 transition"
                    >
                        <Plus className="w-4 h-4" /> Add Service Card
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {cardList.map((svc, idx) => (
                        <div
                            key={svc.id || idx}
                            className={`bg-[#0e1316] border rounded-2xl p-5 space-y-4 transition-all relative ${
                                svc.isActive !== false ? "border-white/10" : "border-red-500/20 opacity-60"
                            }`}
                        >
                            {/* Card Header & Controls */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-[#16acd4] font-bold">
                                        #{idx + 1}
                                    </span>
                                    <span className="text-xl" title="Current icon">{svc.emoji || "✨"}</span>
                                    <span className="text-xs text-zinc-400 truncate max-w-[140px] font-semibold">
                                        {svc.title || "Untitled"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => moveCard(idx, "up")}
                                        disabled={idx === 0}
                                        title="Move Up"
                                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <MoveUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveCard(idx, "down")}
                                        disabled={idx === cardList.length - 1}
                                        title="Move Down"
                                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <MoveDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeCard(idx)}
                                        title="Delete Card"
                                        className="p-1 text-red-400 hover:text-red-300 ml-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Emoji Picker / Quick Selection */}
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                    Icon Emoji
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={svc.emoji || ""}
                                        onChange={e => updateCard(idx, { emoji: e.target.value })}
                                        placeholder="🔎"
                                        className="w-14 text-center text-lg bg-[#07090b] border border-white/10 rounded-lg py-1 text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                    <div className="flex items-center gap-1 overflow-x-auto py-1 text-base">
                                        {COMMON_EMOJIS.slice(0, 8).map(em => (
                                            <button
                                                key={em}
                                                type="button"
                                                onClick={() => updateCard(idx, { emoji: em })}
                                                className="hover:scale-125 transition-transform px-0.5"
                                            >
                                                {em}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                    Service Title
                                </label>
                                <input
                                    type="text"
                                    value={svc.title}
                                    onChange={e => updateCard(idx, { title: e.target.value })}
                                    placeholder="e.g. CERAMIC COATING"
                                    className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={svc.description}
                                    onChange={e => updateCard(idx, { description: e.target.value })}
                                    placeholder="Brief explanation of what the service delivers."
                                    className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#16acd4] resize-none"
                                />
                            </div>

                            {/* Checklist Points */}
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1 flex items-center justify-between">
                                    <span>Checklist Bullets (comma separated)</span>
                                    <span className="text-[10px] text-zinc-500">{svc.items?.length || 0} bullets</span>
                                </label>
                                <input
                                    type="text"
                                    value={svc.items ? svc.items.join(", ") : ""}
                                    onChange={e => {
                                        const splitted = e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                        updateCard(idx, { items: splitted })
                                    }}
                                    placeholder="e.g. Deep gloss, Hydrophobic, UV protection, Easy washing"
                                    className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            {/* CTA Link */}
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                    Button Action / Link
                                </label>
                                <input
                                    type="text"
                                    value={svc.ctaLink || ""}
                                    onChange={e => updateCard(idx, { ctaLink: e.target.value })}
                                    placeholder="e.g. /pdi or /#contact or WhatsApp"
                                    className="w-full bg-[#07090b] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-400 font-mono focus:outline-none focus:border-[#16acd4]"
                                />
                                <span className="text-[10px] text-zinc-500 mt-0.5 block">
                                    Leave blank to default to WhatsApp chat.
                                </span>
                            </div>

                            {/* Active Switch */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <label className="text-xs text-zinc-400 flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={svc.isActive !== false}
                                        onChange={e => updateCard(idx, { isActive: e.target.checked })}
                                        className="rounded border-zinc-700 text-[#16acd4] focus:ring-[#16acd4]"
                                    />
                                    <span>Card Visible on Website</span>
                                </label>
                                <span className={`text-[11px] font-mono ${svc.isActive !== false ? "text-emerald-400" : "text-zinc-500"}`}>
                                    {svc.isActive !== false ? "Active" : "Hidden"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECTION 3: BRANDS WE OFFER */}
            <div className="bg-[#0e1316] border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <Tag className="w-5 h-5 text-[#16acd4]" />
                    <div>
                        <h2 className="text-lg font-bold text-white">Brands We Offer Strip</h2>
                        <p className="text-xs text-zinc-400">Pill badges shown at the bottom of the services page.</p>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                        Section Heading
                    </label>
                    <input
                        type="text"
                        value={services.brandsHeading || "Brands We Offer"}
                        onChange={e => setContent({
                            ...content,
                            services: { ...content.services, brandsHeading: e.target.value }
                        })}
                        placeholder="e.g. Brands We Offer"
                        className="max-w-md w-full bg-[#07090b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#16acd4]"
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                        Brand Badges ({brands.length})
                    </label>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {brands.map((b, idx) => (
                            <span
                                key={b + idx}
                                className="inline-flex items-center gap-2 bg-[#07090b] border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-medium text-white group hover:border-[#16acd4]/50"
                            >
                                <span>{b}</span>
                                <button
                                    type="button"
                                    onClick={() => removeBrand(idx)}
                                    title="Remove Brand"
                                    className="text-zinc-500 hover:text-red-400 transition"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 max-w-sm">
                        <input
                            type="text"
                            value={newBrand}
                            onChange={e => setNewBrand(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    addBrand()
                                }
                            }}
                            placeholder="Add brand (e.g. Meguiar's)"
                            className="flex-1 bg-[#07090b] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                        />
                        <button
                            type="button"
                            onClick={addBrand}
                            className="px-4 py-2 bg-[#16acd4] hover:bg-[#1499be] text-black text-xs font-bold rounded-xl transition"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Floating Save Bar */}
            <div className="sticky bottom-6 z-30 bg-[#0e1316]/90 backdrop-blur border border-white/15 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-[#16acd4]" />
                    <span>Any changes you make here update the live <code className="text-[#16acd4]">/services</code> page dynamically.</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-[#16acd4] hover:bg-[#1499be] text-black text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#16acd4]/30 transition disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save All Changes"}
                    </button>
                </div>
            </div>
        </div>
    )
}
