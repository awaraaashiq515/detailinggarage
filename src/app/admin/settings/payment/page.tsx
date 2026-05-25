"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import {
    QrCode,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Building2,
    Globe,
    Settings2,
    Info
} from "lucide-react"

export default function AdminPaymentSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

    const [upiId, setUpiId] = useState("")
    const [upiName, setUpiName] = useState("")
    const [isActive, setIsActive] = useState(true)
    const [qrCodePath, setQrCodePath] = useState<string | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings/payment")
            if (res.ok) {
                const data = await res.json()
                if (data.settings) {
                    setUpiId(data.settings.upiId || "")
                    setUpiName(data.settings.upiName || "Dealer Package Payment")
                    setIsActive(data.settings.isActive)
                    setQrCodePath(data.settings.qrCodePath)
                }
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch("/api/admin/settings/payment", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ upiId, upiName, isActive }),
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: "success", text: "Payment settings updated successfully!" })
                setQrCodePath(data.settings.qrCodePath)
            } else {
                throw new Error(data.error || "Failed to update settings")
            }
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Failed to save settings" })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-32 pb-24 container px-6 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-12">

                    {/* Settings Form */}
                    <div className="flex-1">
                        <div className="mb-10">
                            <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2 uppercase">
                                Payment <span className="text-white">Settings</span>
                            </h1>
                            <p className="text-[#888] text-sm">Configure UPI details and QR codes for dealer payments.</p>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-[#b0b0b0] flex items-center gap-2">
                                            UPI ID <span className="text-white/50">(Required)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                            placeholder="e.g. 9876543210@paytm"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-[#b0b0b0] flex items-center gap-2">
                                            Payee Name <span className="text-white/50">(Required)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={upiName}
                                            onChange={(e) => setUpiName(e.target.value)}
                                            placeholder="e.g. The Garage Services"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsActive(!isActive)}
                                        className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${isActive ? "bg-white" : "bg-white/10"}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 rounded-full ${isActive ? "bg-black" : "bg-white"} transition-all duration-300 ${isActive ? "left-7" : "left-1"}`}></div>
                                    </button>
                                    <div>
                                        <div className="text-sm font-bold">Accept Payments</div>
                                        <div className="text-xs text-[#666]">Enable or disable UPI payments for dealers.</div>
                                    </div>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300 ${message.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border border-red-500/20 text-red-500"
                                    }`}>
                                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    <span className="text-sm font-medium">{message.text}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full md:w-auto px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 ${saving
                                    ? "bg-white/5 text-[#444]"
                                    : "bg-white text-black hover:bg-gray-200 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                                    }`}
                            >
                                {saving ? "Saving Changes..." : <><Save className="w-4 h-4" /> Save Settings</>}
                            </button>
                        </form>
                    </div>

                    {/* QR Preview Sidebar */}
                    <div className="w-full md:w-[350px]">
                        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-8 sticky top-32">
                            <h3 className="font-display text-xl font-bold flex items-center gap-3">
                                <QrCode className="w-5 h-5 text-white" /> QR Preview
                            </h3>

                            <div className="bg-white p-6 rounded-3xl aspect-square flex items-center justify-center shadow-2xl relative group overflow-hidden">
                                {qrCodePath ? (
                                    <img
                                        src={qrCodePath}
                                        alt="Generated UPI QR Code"
                                        className="max-w-full h-auto"
                                    />
                                ) : (
                                    <div className="text-center space-y-4">
                                        <QrCode className="w-16 h-16 text-gray-200 mx-auto" strokeWidth={1} />
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No QR Generated</p>
                                    </div>
                                )}

                                {isActive && qrCodePath && (
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                    <div className="text-[10px] text-[#666] uppercase tracking-widest font-bold mb-1">Current Active UPI</div>
                                    <div className="text-xs font-mono text-white truncate">{upiId || "Not Set"}</div>
                                </div>

                                <div className="flex items-start gap-3 p-4">
                                    <Info className="w-4 h-4 text-[#444] shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-[#666] leading-relaxed">
                                        Changing the UPI ID or Payee Name will automatically regenerate the QR code image for all checkout pages.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
