"use client"

import { useState, useEffect, useRef, useCallback, use } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft, Loader2, MessageSquare, RefreshCw, Save,
    Car, Phone, Building2, Calendar, Clock, CheckCircle2, XCircle, Ban,
    User as UserIcon, Eye
} from "lucide-react"

interface Message {
    id: string
    senderType: string   // DEALER or CUSTOMER
    senderId: string
    message: string
    createdAt: string
}

interface Inquiry {
    id: string
    customerName: string
    customerMobile: string
    message: string | null
    status: string
    adminNotes: string | null
    createdAt: string
    vehicle: { id: string; title: string; make: string; model: string; price: number; images: string }
    dealer: { id: string; name: string; businessName: string | null; city: string | null; mobile: string | null }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDING: { label: "Pending", color: "#16acd4", bg: "rgba(22, 172, 212,0.12)", border: "#16acd4" },
    CONTACTED: { label: "Contacted", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "#60a5fa" },
    CLOSED: { label: "Closed", color: "#4ade80", bg: "rgba(74,222,128,0.12)", border: "#4ade80" },
    SPAM: { label: "Spam", color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "#f87171" },
}

const STATUS_ICONS: Record<string, any> = {
    PENDING: Clock, CONTACTED: CheckCircle2, CLOSED: Ban, SPAM: XCircle,
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}
function formatDate(iso: string) {
    const d = new Date(iso)
    const diff = Math.floor((new Date().getTime() - d.getTime()) / 86400000)
    if (diff === 0) return "Today"
    if (diff === 1) return "Yesterday"
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

export default function AdminInquiryDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise)
    const router = useRouter()
    const id = params.id

    const [inquiry, setInquiry] = useState<Inquiry | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [newStatus, setNewStatus] = useState("PENDING")
    const [notes, setNotes] = useState("")
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState("")
    const chatEndRef = useRef<HTMLDivElement>(null)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/vehicle-inquiries/${id}`)
            const data = await res.json()
            if (data.messages) setMessages(data.messages)
        } catch { }
    }, [id])

    const fetchAll = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/vehicle-inquiries/${id}`)
            if (res.status === 404) { router.push("/admin/vehicle-inquiries"); return }
            const data = await res.json()
            setInquiry(data.inquiry)
            setMessages(data.messages || [])
            setNewStatus(data.inquiry?.status || "PENDING")
            setNotes(data.inquiry?.adminNotes || "")
        } catch { }
        finally { setLoading(false) }
    }, [id, router])

    useEffect(() => {
        fetchAll()
        pollingRef.current = setInterval(() => fetchMessages(), 5000)
        return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
    }, [fetchAll, fetchMessages])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const saveChanges = async () => {
        setSaving(true); setSaveMsg("")
        try {
            const res = await fetch(`/api/admin/vehicle-inquiries/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, adminNotes: notes }),
            })
            if (!res.ok) throw new Error()
            setInquiry(prev => prev ? { ...prev, status: newStatus, adminNotes: notes } : prev)
            setSaveMsg("Saved!")
            setTimeout(() => setSaveMsg(""), 2500)
        } catch { setSaveMsg("Save failed") }
        finally { setSaving(false) }
    }

    // Group messages by date
    const groups: { date: string; msgs: Message[] }[] = []
    messages.forEach(m => {
        const d = formatDate(m.createdAt)
        const last = groups[groups.length - 1]
        if (last && last.date === d) last.msgs.push(m)
        else groups.push({ date: d, msgs: [m] })
    })

    let thumb = ""
    try { thumb = JSON.parse(inquiry?.vehicle.images || "[]")[0] || "" } catch { }
    const cfg = STATUS_CONFIG[inquiry?.status || "PENDING"]

    return (
        <div className="max-w-6xl mx-auto space-y-5 pb-12">
            <Link href="/admin/vehicle-inquiries"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
                style={{ color: "#6b7080" }}>
                <ArrowLeft className="w-4 h-4" /> Back to Vehicle Inquiries
            </Link>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-[#16acd4]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* LEFT PANEL */}
                    <div className="space-y-4">

                        {/* Vehicle card */}
                        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <div className="relative aspect-video bg-black">
                                {thumb ? (
                                    <img src={thumb} alt={inquiry?.vehicle.title} className="w-full h-full object-cover opacity-80" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Car className="w-10 h-10 text-gray-700" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-3 left-3 right-3">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Vehicle</p>
                                    <p className="text-sm font-bold text-white truncate">{inquiry?.vehicle.title}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-sm font-bold" style={{ color: "#16acd4" }}>
                                    ₹{inquiry?.vehicle.price?.toLocaleString("en-IN")}
                                </span>
                                <Link href={`/cars/${inquiry?.vehicle.id}`} target="_blank"
                                    className="text-[11px] flex items-center gap-1 transition-colors hover:text-white"
                                    style={{ color: "#4b5563" }}>
                                    <Eye className="w-3 h-3" /> View Listing
                                </Link>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="p-5 rounded-2xl space-y-3" style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6b7080" }}>Customer</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff" }}>
                                    {inquiry?.customerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{inquiry?.customerName}</p>
                                    <a href={`tel:${inquiry?.customerMobile}`}
                                        className="text-xs flex items-center gap-1 transition-colors hover:text-[#16acd4]"
                                        style={{ color: "#6b7080" }}>
                                        <Phone className="w-3 h-3" /> {inquiry?.customerMobile}
                                    </a>
                                </div>
                            </div>
                            {inquiry?.message && (
                                <div className="px-3 py-2 rounded-xl text-xs italic" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "#9ca3af" }}>
                                    "{inquiry.message}"
                                </div>
                            )}
                            <p className="text-[11px] flex items-center gap-1.5" style={{ color: "#374151" }}>
                                <Calendar className="w-3 h-3" />
                                {inquiry && new Date(inquiry.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                            </p>
                            {cfg && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                    style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                                    {cfg.label}
                                </span>
                            )}
                        </div>

                        {/* Dealer Info */}
                        <div className="p-5 rounded-2xl space-y-3" style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6b7080" }}>Dealer</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #16acd4, #ff6b35)", color: "#000" }}>
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {inquiry?.dealer.businessName || inquiry?.dealer.name}
                                    </p>
                                    {inquiry?.dealer.city && (
                                        <p className="text-xs" style={{ color: "#6b7080" }}>{inquiry.dealer.city}</p>
                                    )}
                                </div>
                            </div>
                            {inquiry?.dealer.mobile && (
                                <a href={`tel:${inquiry.dealer.mobile}`}
                                    className="text-xs flex items-center gap-1.5 transition-colors hover:text-[#16acd4]"
                                    style={{ color: "#6b7080" }}>
                                    <Phone className="w-3 h-3" /> {inquiry.dealer.mobile}
                                </a>
                            )}
                        </div>

                        {/* Admin Status Control */}
                        <div className="p-5 rounded-2xl space-y-4" style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6b7080" }}>Admin Control</h4>

                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(STATUS_CONFIG).map(([key, c]) => {
                                    const active = newStatus === key
                                    const Icon = STATUS_ICONS[key]
                                    return (
                                        <button key={key} onClick={() => setNewStatus(key)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                                            style={active ? {
                                                backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`,
                                            } : {
                                                backgroundColor: "rgba(255,255,255,0.03)", color: "#6b7080",
                                                border: "1px solid rgba(255,255,255,0.06)",
                                            }}>
                                            <Icon className="w-3 h-3" /> {c.label}
                                        </button>
                                    )
                                })}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-white mb-1.5">Internal Notes</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                                    placeholder="Admin-only notes..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-xl text-xs text-white placeholder-gray-600 outline-none resize-none"
                                    style={{ backgroundColor: "#0d0f14", border: "1px solid rgba(255,255,255,0.1)" }}
                                    onFocus={e => (e.currentTarget.style.borderColor = "#16acd4")}
                                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                                />
                            </div>

                            <button onClick={saveChanges} disabled={saving}
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #16acd4, #ff6b35)", color: "#000" }}>
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>

                            {saveMsg && (
                                <p className="text-xs text-center" style={{ color: saveMsg === "Saved!" ? "#4ade80" : "#f87171" }}>
                                    {saveMsg}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Chat Panel (READ-ONLY for admin) */}
                    <div className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden"
                        style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)", minHeight: "550px" }}>

                        {/* Chat header */}
                        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                            <MessageSquare className="w-5 h-5 flex-shrink-0" style={{ color: "#60a5fa" }} />
                            <span className="text-sm font-semibold text-white flex-1">
                                Dealer ↔ Customer Chat
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(96,165,250,0.1)", color: "#60a5fa" }}>
                                {messages.length} message{messages.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest"
                                style={{ backgroundColor: "rgba(248,113,113,0.1)", color: "#f87171" }}>
                                Read Only
                            </span>
                            <button onClick={fetchMessages}
                                className="p-1.5 rounded-lg transition hover:bg-white/8" style={{ color: "#6b7080" }}>
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 px-5 py-2 text-[11px] flex-shrink-0"
                            style={{ backgroundColor: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <span className="flex items-center gap-1.5" style={{ color: "#16acd4" }}>
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #16acd4, #ff6b35)" }} />
                                Dealer message (right)
                            </span>
                            <span className="flex items-center gap-1.5" style={{ color: "#3b82f6" }}>
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }} />
                                Customer message (left)
                            </span>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ backgroundColor: "#0d0f14" }}>
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-16">
                                    <MessageSquare className="w-10 h-10 mb-3 text-gray-700" />
                                    <p className="text-sm text-gray-600">No chat messages yet for this inquiry.</p>
                                </div>
                            ) : (
                                groups.map(group => (
                                    <div key={group.date}>
                                        <div className="flex items-center gap-3 my-4">
                                            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                                            <span className="text-[11px] px-3 py-1 rounded-full"
                                                style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#4b5563" }}>
                                                {group.date}
                                            </span>
                                            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                                        </div>

                                        {group.msgs.map((msg, i) => {
                                            const isDealer = msg.senderType === "DEALER"
                                            const prev = group.msgs[i - 1]
                                            const sameSender = prev && prev.senderType === msg.senderType
                                            return (
                                                <div key={msg.id}
                                                    className={`flex ${isDealer ? "justify-end" : "justify-start"} ${sameSender ? "mt-0.5" : "mt-3"}`}>

                                                    {!isDealer && !sameSender && (
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5 flex-shrink-0"
                                                            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff" }}>
                                                            C
                                                        </div>
                                                    )}
                                                    {!isDealer && sameSender && <div className="w-7 mr-2 flex-shrink-0" />}

                                                    <div className={`max-w-[72%] flex flex-col ${isDealer ? "items-end" : "items-start"}`}>
                                                        {!sameSender && (
                                                            <span className="text-[11px] mb-1 px-1"
                                                                style={{ color: isDealer ? "#16acd4" : "#60a5fa" }}>
                                                                {isDealer
                                                                    ? (inquiry?.dealer.businessName || inquiry?.dealer.name || "Dealer")
                                                                    : inquiry?.customerName}
                                                            </span>
                                                        )}
                                                        <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                                                            style={isDealer ? {
                                                                background: "linear-gradient(135deg, #16acd4, #d49510)",
                                                                color: "#000", borderBottomRightRadius: "4px",
                                                            } : {
                                                                backgroundColor: "#1a1d27", color: "#e5e7eb",
                                                                border: "1px solid rgba(255,255,255,0.06)",
                                                                borderBottomLeftRadius: "4px",
                                                            }}>
                                                            {msg.message}
                                                        </div>
                                                        <span className="text-[10px] mt-1 px-1" style={{ color: "#374151" }}>
                                                            {formatTime(msg.createdAt)}
                                                        </span>
                                                    </div>

                                                    {isDealer && !sameSender && (
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ml-2 mt-0.5 flex-shrink-0"
                                                            style={{ background: "linear-gradient(135deg, #16acd4, #ff6b35)", color: "#000" }}>
                                                            D
                                                        </div>
                                                    )}
                                                    {isDealer && sameSender && <div className="w-7 ml-2 flex-shrink-0" />}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* No input for admin — read only */}
                        <div className="flex items-center justify-center px-5 py-3 flex-shrink-0"
                            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                            <p className="text-xs" style={{ color: "#374151" }}>
                                Admin can view but not send messages in this chat.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
