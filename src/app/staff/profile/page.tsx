"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    User, Mail, Phone, MapPin, Calendar,
    Building2, ShieldCheck, LogOut, RefreshCw,
    Sparkles, Key, Wrench
} from "lucide-react"

export default function StaffProfilePage() {
    const router = useRouter()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMe = async () => {
            try {
                setLoading(true)
                const res = await fetch("/api/staff/me")
                if (res.ok) {
                    const result = await res.json()
                    if (result.success) {
                        setData(result)
                    }
                }
            } catch (err) {
                console.error("Profile fetch error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchMe()
    }, [])

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
        } catch {}
        router.push("/login")
    }

    if (loading && !data) {
        return (
            <div className="py-24 flex flex-col items-center justify-center text-zinc-500">
                <RefreshCw className="w-8 h-8 animate-spin text-[#16acd4] mb-3" />
                <p className="text-xs font-bold uppercase tracking-wider">Loading staff profile...</p>
            </div>
        )
    }

    const staff = data?.staff

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <User className="w-6 h-6 text-[#16acd4]" />
                    <span>Technician Profile</span>
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                    Your account, workshop bay assignment, and contact details
                </p>
            </div>

            {/* Profile Hero Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#15151c] to-[#101013] border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#16acd4]/10 blur-3xl -z-10 rounded-full" />

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#16acd4] to-cyan-300 text-black flex items-center justify-center font-black text-xl shadow-xl shadow-[#16acd4]/20 shrink-0">
                        {staff?.name ? staff.name.charAt(0).toUpperCase() : "T"}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-black text-white">{staff?.name}</h2>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {staff?.status || "ACTIVE"}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-[#16acd4] mt-0.5">{staff?.role}</p>
                        {staff?.specialization && (
                            <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                                <Sparkles className="w-3.5 h-3.5 text-[#16acd4]" />
                                <span>{staff.specialization}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Account & Workshop Details */}
            <div className="rounded-3xl bg-[#121216] border border-white/10 p-5 space-y-4">
                <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                    Assigned Workshop Studio
                </h3>

                <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#17171d] border border-white/5">
                        <span className="text-zinc-500 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-zinc-400" /> Studio Name
                        </span>
                        <span className="font-bold text-white">{staff?.shop?.name || "Auto Studio"}</span>
                    </div>

                    {staff?.shop?.phone && (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#17171d] border border-white/5">
                            <span className="text-zinc-500 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-zinc-400" /> Workshop Phone
                            </span>
                            <span className="font-mono text-zinc-300">{staff.shop.phone}</span>
                        </div>
                    )}

                    {staff?.shop?.address && (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#17171d] border border-white/5">
                            <span className="text-zinc-500 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-zinc-400" /> Location
                            </span>
                            <span className="text-zinc-300 text-right">{staff.shop.address}{staff.shop.city ? `, ${staff.shop.city}` : ""}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Login Account Info */}
            <div className="rounded-3xl bg-[#121216] border border-white/10 p-5 space-y-4">
                <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                    Staff Portal Login Information
                </h3>

                <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#17171d] border border-white/5">
                        <span className="text-zinc-500 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-zinc-400" /> Login Email
                        </span>
                        <span className="font-mono font-bold text-white">{staff?.email || "Not set"}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#17171d] border border-white/5">
                        <span className="text-zinc-500 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-zinc-400" /> Mobile Number
                        </span>
                        <span className="font-mono text-zinc-300">{staff?.phone || "Not set"}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#17171d] border border-white/5">
                        <span className="text-zinc-500 flex items-center gap-2">
                            <Key className="w-4 h-4 text-zinc-400" /> Password Management
                        </span>
                        <span className="text-[11px] text-zinc-400">Managed by Workshop Owner</span>
                    </div>
                </div>
            </div>

            {/* Sign Out Button */}
            <div className="pt-2">
                <button
                    onClick={handleLogout}
                    className="w-full py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-98"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Staff Portal</span>
                </button>
            </div>
        </div>
    )
}
