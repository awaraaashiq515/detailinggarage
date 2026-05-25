"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send, Loader2, MessageSquare, RefreshCw, Save } from "lucide-react"

interface ChatMessage {
    id: string
    senderType: string
    senderId: string
    message: string
    createdAt: string
}

interface Inquiry {
    id: string
    subject: string
    description: string
    status: string
    adminNotes: string | null
    createdAt: string
    updatedAt: string
    user: { id: string; name: string; email: string; mobile?: string }
    _count: { messages: number }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Pending", color: "#16acd4", bg: "rgba(22, 172, 212,0.12)" },
    IN_PROCESS: { label: "In Process", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
    COMPLETED: { label: "Completed", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
    REJECTED: { label: "Rejected", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}

function formatDate(iso: string) {
    const d = new Date(iso)
    const today = new Date()
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000)
    if (diff === 0) return "Today"
    if (diff === 1) return "Yesterday"
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

export default function AdminInquiryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [inquiry, setInquiry] = useState<Inquiry | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [newStatus, setNewStatus] = useState("")
    const [adminNotes, setAdminNotes] = useState("")
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState("")
    const chatEndRef = useRef<HTMLDivElement>(null)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    const fetchAll = useCallback(async (silent = false) => {
        try {
            const [inqRes, msgRes] = await Promise.all([
                fetch(`/api/admin/service-inquiries/${id}`),
                fetch(`/api/admin/service-inquiries/${id}/messages`),
            ])
            if (inqRes.status === 404) { router.push("/admin/service-inquiries"); return }
            const inqData = await inqRes.json()
            const msgData = await msgRes.json()
            setMessages(msgData.messages || [])
            if (!silent) {
                setInquiry(inqData.inquiry)
                setNewStatus(inqData.inquiry?.status || "PENDING")
                setAdminNotes(inqData.inquiry?.adminNotes || "")
                setLoading(false)
            }
        } catch (e) {
            console.error(e)
            if (!silent) setLoading(false)
        }
    }, [id, router])

    useEffect(() => {
        fetchAll()
        pollingRef.current = setInterval(() => fetchAll(true), 3000)
        return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
    }, [fetchAll])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const saveStatus = async () => {
        setSaving(true)
        setSaveMsg("")
        try {
            const res = await fetch(`/api/admin/service-inquiries/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, adminNotes }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setInquiry(prev => prev ? { ...prev, status: newStatus, adminNotes } : prev)
            setSaveMsg("Saved successfully!")
            setTimeout(() => setSaveMsg(""), 3000)
        } catch (e: any) {
            setSaveMsg(e.message || "Save failed")
        } finally {
            setSaving(false)
        }
    }

    const sendMessage = async () => {
        if (!text.trim() || sending) return
        setSending(true)
        try {
            const res = await fetch(`/api/admin/service-inquiries/${id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text.trim() }),
            })
            if (res.ok) {
                setText("")
                await fetchAll(true)
            }
        } catch (e) { console.error(e) }
        finally { setSending(false) }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
    }

    // Group messages by date
    const groups: { date: string; msgs: ChatMessage[] }[] = []
    messages.forEach(m => {
        const d = formatDate(m.createdAt)
        const last = groups[groups.length - 1]
        if (last && last.date === d) last.msgs.push(m)
        else groups.push({ date: d, msgs: [m] })
    })

    const cfg = inquiry ? (STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.PENDING) : null

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Back */}
            <Link href="/admin/service-inquiries"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
                style={{ color: "#6b7080" }}>
                <ArrowLeft className="w-4 h-4" />
                Back to Inquiries
            </Link>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-[#16acd4]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Inquiry Info + Status Control */}
                    <div className="space-y-4">
                        {/* Inquiry Card */}
                        <div className="p-5 rounded-2xl space-y-4"
                            style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <div>
                                <span className="text-[11px] font-mono px-2 py-1 rounded"
                                    style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#4b5563" }}>
                                    #{id.slice(-6).toUpperCase()}
                                </span>
                                <h3 className="text-base font-semibold text-white mt-2">{inquiry?.subject}</h3>
                                <p className="text-sm mt-1" style={{ color: "#6b7080" }}>{inquiry?.description}</p>
                            </div>

                            {cfg && (
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                                        style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                                        {cfg.label}
                                    </span>
                                </div>
                            )}

                            <div className="pt-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#3d4150" }}>Client</p>
                                    <p className="text-sm font-medium text-white">{inquiry?.user.name}</p>
                                    <p className="text-xs" style={{ color: "#6b7080" }}>{inquiry?.user.email}</p>
                                    {inquiry?.user.mobile && <p className="text-xs" style={{ color: "#6b7080" }}>{inquiry?.user.mobile}</p>}
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#3d4150" }}>Submitted</p>
                                    <p className="text-xs" style={{ color: "#6b7080" }}>
                                        {inquiry && new Date(inquiry.createdAt).toLocaleString("en-IN", {
                                            day: "2-digit", month: "short", year: "numeric",
                                            hour: "2-digit", minute: "2-digit"
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Control */}
                        <div className="p-5 rounded-2xl space-y-4"
                            style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <h4 className="text-sm font-semibold text-white">Update Status</h4>

                            <div className="grid grid-cols-2 gap-2">
                                {["PENDING", "IN_PROCESS", "COMPLETED", "REJECTED"].map(s => {
                                    const c = STATUS_CONFIG[s]
                                    const active = newStatus === s
                                    return (
                                        <button key={s}
                                            onClick={() => setNewStatus(s)}
                                            className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                                            style={active ? {
                                                backgroundColor: c.bg,
                                                color: c.color,
                                                border: `1px solid ${c.color}`,
                                            } : {
                                                backgroundColor: "rgba(255,255,255,0.03)",
                                                color: "#6b7080",
                                                border: "1px solid rgba(255,255,255,0.06)",
                                            }}>
                                            {c.label}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Admin Notes */}
                            <div>
                                <label className="block text-xs font-medium text-white mb-1.5">Internal Notes</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    placeholder="Private notes (not visible to client)..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-xl text-xs text-white placeholder-gray-600 outline-none resize-none"
                                    style={{ backgroundColor: "#0d0f14", border: "1px solid rgba(255,255,255,0.1)" }}
                                    onFocus={e => (e.currentTarget.style.borderColor = "#16acd4")}
                                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                                />
                            </div>

                            <button
                                onClick={saveStatus}
                                disabled={saving}
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #16acd4, #ff6b35)", color: "#000" }}>
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>

                            {saveMsg && (
                                <p className="text-xs text-center" style={{ color: saveMsg.includes("uccess") ? "#4ade80" : "#f87171" }}>
                                    {saveMsg}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Chat */}
                    <div className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden"
                        style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)", minHeight: "550px" }}>

                        {/* Chat header */}
                        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                            <MessageSquare className="w-5 h-5" style={{ color: "#60a5fa" }} />
                            <span className="text-sm font-semibold text-white flex-1">
                                Chat with {inquiry?.user.name}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(96,165,250,0.1)", color: "#60a5fa" }}>
                                {messages.length} message{messages.length !== 1 ? "s" : ""}
                            </span>
                            <button onClick={() => fetchAll(true)} className="p-1.5 rounded-lg transition hover:bg-white/8" style={{ color: "#6b7080" }}>
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ backgroundColor: "#0d0f14" }}>
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <MessageSquare className="w-10 h-10 mb-3 text-gray-700" />
                                    <p className="text-sm text-gray-600">No messages yet. Start the conversation.</p>
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
                                            const isAdmin = msg.senderType === "ADMIN"
                                            const prev = group.msgs[i - 1]
                                            const sameSender = prev && prev.senderType === msg.senderType
                                            return (
                                                <div key={msg.id}
                                                    className={`flex ${isAdmin ? "justify-end" : "justify-start"} ${sameSender ? "mt-0.5" : "mt-3"}`}>
                                                    {!isAdmin && !sameSender && (
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5 flex-shrink-0"
                                                            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff" }}>
                                                            {inquiry?.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    {!isAdmin && sameSender && <div className="w-7 mr-2 flex-shrink-0" />}

                                                    <div className={`max-w-[72%] ${isAdmin ? "items-end" : "items-start"} flex flex-col`}>
                                                        {!sameSender && (
                                                            <span className="text-[11px] mb-1 px-1"
                                                                style={{ color: isAdmin ? "#16acd4" : "#9ca3af" }}>
                                                                {isAdmin ? "You (Admin)" : inquiry?.user.name}
                                                            </span>
                                                        )}
                                                        <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                                                            style={isAdmin ? {
                                                                background: "linear-gradient(135deg, #16acd4, #d49510)",
                                                                color: "#000",
                                                                borderBottomRightRadius: "4px",
                                                            } : {
                                                                backgroundColor: "#1a1d27",
                                                                color: "#e5e7eb",
                                                                border: "1px solid rgba(255,255,255,0.06)",
                                                                borderBottomLeftRadius: "4px",
                                                            }}>
                                                            {msg.message}
                                                        </div>
                                                        <span className="text-[10px] mt-1 px-1" style={{ color: "#374151" }}>
                                                            {formatTime(msg.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div className="flex items-end gap-3 px-4 py-3 flex-shrink-0"
                            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Reply to client… (Enter to send)"
                                rows={1}
                                className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none"
                                style={{ backgroundColor: "#0d0f14", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "100px" }}
                                onInput={e => {
                                    const el = e.currentTarget
                                    el.style.height = "auto"
                                    el.style.height = el.scrollHeight + "px"
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = "#16acd4")}
                                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!text.trim() || sending}
                                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 disabled:opacity-40"
                                style={{ background: "linear-gradient(135deg, #16acd4, #ff6b35)", color: "#000" }}>
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
