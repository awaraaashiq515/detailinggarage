"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    Home, Wrench, Calendar, DollarSign, User,
    LogOut, Car, Shield, Sparkles, Clock,
    CheckCircle2, AlertCircle, ChevronRight
} from "lucide-react"

export default function StaffPortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [staffData, setStaffData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch("/api/staff/me")
                if (res.status === 401) {
                    router.push("/login?callbackUrl=/staff")
                    return
                }
                if (res.ok) {
                    const data = await res.json()
                    if (data.success) {
                        setStaffData(data)
                    }
                }
            } catch (err) {
                console.error("Staff layout fetch error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchMe()
    }, [router])

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
        } catch {}
        router.push("/login")
    }

    const navItems = [
        { href: "/staff", label: "Dashboard", icon: Home, exact: true },
        { href: "/staff/jobs", label: "Vehicle Jobs", icon: Wrench, count: staffData?.stats?.activeJobs },
        { href: "/staff/attendance", label: "Attendance", icon: Calendar },
        { href: "/staff/earnings", label: "Earnings", icon: DollarSign },
        { href: "/staff/profile", label: "Profile", icon: User }
    ]

    const isActive = (item: typeof navItems[0]) => {
        if (item.exact) return pathname === item.href
        return pathname.startsWith(item.href)
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col selection:bg-[#16acd4] selection:text-black">
            {/* Top Header Bar */}
            <header className="sticky top-0 z-40 bg-[#111114]/90 backdrop-blur-md border-b border-white/8 px-4 py-3 sm:px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#16acd4] to-cyan-300 flex items-center justify-center text-black font-black text-sm shadow-lg shadow-[#16acd4]/20">
                            <Car className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm tracking-tight text-white uppercase">
                                    {staffData?.staff?.shop?.name || "Technician Portal"}
                                </span>
                                {staffData?.isPreview && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                                        Owner Preview
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-zinc-400">
                                {staffData?.staff ? (
                                    <>
                                        <span className="text-zinc-200 font-semibold">{staffData.staff.name}</span>
                                        <span className="text-zinc-600 mx-1.5">•</span>
                                        <span className="text-[#16acd4]">{staffData.staff.role}</span>
                                    </>
                                ) : (
                                    "Workshop Bay Portal"
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                        {/* Status chip */}
                        {staffData?.today && (
                            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border border-white/10 bg-white/5">
                                <span className={`w-2 h-2 rounded-full ${staffData.today.status === "PRESENT" ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                                <span className={staffData.today.status === "PRESENT" ? "text-emerald-400" : "text-zinc-400"}>
                                    {staffData.today.status === "PRESENT" ? "Punched In" : "Not Punched"}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            title="Sign out"
                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/8 hover:border-red-500/30 flex items-center justify-center transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Desktop Navigation Sub-bar */}
            <nav className="hidden md:block bg-[#141418] border-b border-white/5 px-6">
                <div className="max-w-6xl mx-auto flex items-center gap-1">
                    {navItems.map(item => {
                        const active = isActive(item)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
                                    active
                                        ? "text-[#16acd4] border-[#16acd4] bg-[#16acd4]/5"
                                        : "text-zinc-400 hover:text-white border-transparent hover:bg-white/5"
                                }`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                                {item.count !== undefined && item.count > 0 && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#16acd4] text-black font-extrabold">
                                        {item.count}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Main Content View (Padded for mobile bottom bar) */}
            <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-10">
                {children}
            </main>

            {/* Floating Mobile Bottom Navigation Bar (Thumb friendly for workshop technicians) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121215]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-2xl shadow-black">
                <div className="grid grid-cols-5 gap-1 items-center">
                    {navItems.map(item => {
                        const active = isActive(item)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                                    active
                                        ? "text-[#16acd4]"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                <div className={`relative p-1 rounded-xl transition-colors ${active ? "bg-[#16acd4]/15" : ""}`}>
                                    <item.icon className="w-5 h-5" />
                                    {item.count !== undefined && item.count > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#16acd4] text-black text-[9px] font-black flex items-center justify-center">
                                            {item.count}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold mt-0.5 tracking-tight ${active ? "text-[#16acd4]" : "text-zinc-500"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
