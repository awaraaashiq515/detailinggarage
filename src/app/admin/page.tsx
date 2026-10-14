import { db } from "@/lib/db"
import {
    ClipboardCheck,
    Shield,
    Users,
    TrendingUp,
    UserCheck,
} from "lucide-react"
import Link from "next/link"
import { AllPagesPortalClient } from "@/components/admin/AllPagesPortalClient"

export default async function AdminDashboard() {
    // Fetch stats safely
    let totalUsers = 0
    let pendingUsers = 0
    let pdiCount = 0
    let invoicesCount = 0
    let claimsCount = 0
    let serviceInquiries = 0
    let shopsCount = 0

    try {
        totalUsers = await db.user.count()
        pendingUsers = await db.user.count({ where: { status: "PENDING" } })
    } catch (e) {
        // fallback
    }

    try {
        pdiCount = await db.pDIInspection.count()
    } catch (e) {
        // fallback
    }

    try {
        invoicesCount = await db.invoice.count()
    } catch (e) {
        // fallback
    }

    try {
        claimsCount = await db.insuranceClaim.count()
    } catch (e) {
        // fallback
    }

    try {
        serviceInquiries = await db.serviceInquiry.count()
    } catch (e) {
        // fallback
    }

    try {
        shopsCount = await db.shop.count()
    } catch (e) {
        // fallback
    }

    const stats = [
        {
            label: "Total Service Inspections",
            value: pdiCount > 0 ? pdiCount.toLocaleString("en-IN") : "0",
            icon: ClipboardCheck,
            color: "#16acd4",
            bgColor: "rgba(22, 172, 212, 0.1)",
            href: "/admin/pdi"
        },
        {
            label: "Active Detailing Claims",
            value: claimsCount.toString(),
            icon: Shield,
            color: "#ffffff",
            bgColor: "rgba(255, 255, 255, 0.05)",
            href: "/admin/insurance"
        },
        {
            label: "Registered Clients",
            value: totalUsers.toString(),
            icon: Users,
            color: "#16acd4",
            bgColor: "rgba(22, 172, 212, 0.1)",
            href: "/admin/users"
        },
        {
            label: "Pending Approvals",
            value: pendingUsers.toString(),
            icon: UserCheck,
            color: "#ffffff",
            bgColor: "rgba(255, 255, 255, 0.05)",
            href: "/admin/users?status=PENDING"
        },
    ]

    const recentActivities = [
        { type: "Service", message: "New PPF inspection completed for client vehicle", time: "Recent" },
        { type: "User", message: `${pendingUsers} applications awaiting verification`, time: "Live" },
        { type: "Claim", message: "Detailing warranty claims system active", time: "Live" },
        { type: "Billing", message: `${invoicesCount} GST tax invoices generated`, time: "Live" },
    ]

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-extrabold text-white tracking-tight">
                        Welcome back, <span className="text-[#16acd4]">Admin!</span>
                    </h2>
                    <p className="text-sm font-medium text-zinc-400 mt-1">
                        All studio management modules, billing tools, and settings are accessible directly below.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/portal"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#16acd4]/10 border border-[#16acd4]/30 text-[#16acd4] hover:bg-[#16acd4] hover:text-black transition-all"
                    >
                        Focus Portal View ↗
                    </Link>
                </div>
            </div>

            {/* Quick KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                    <Link
                        key={index}
                        href={stat.href}
                        className="group relative p-5 sm:p-6 rounded-[22px] transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-white/5 bg-[#121214] shadow-xl shadow-black/40"
                    >
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                                background: `radial-gradient(circle at 50% 0%, ${stat.bgColor}, transparent 70%)`
                            }}
                        />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-lg border border-white/5"
                                    style={{ backgroundColor: stat.bgColor }}
                                >
                                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                                </div>
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#16acd4]/10 border border-[#16acd4]/20">
                                    <TrendingUp className="w-3 h-3 text-[#16acd4]" />
                                    <span className="text-[10px] font-bold text-[#16acd4] uppercase tracking-wider">Live</span>
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-display font-bold text-white mb-1 tabular-nums tracking-tight">{stat.value}</p>
                            <p className="text-[11px] font-bold tracking-[1px] uppercase text-zinc-500 group-hover:text-zinc-300 transition-colors">{stat.label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Master Hub: All Pages Grid (Boxes for all modules) */}
            <section className="pt-2">
                <AllPagesPortalClient
                    counts={{
                        pendingUsers,
                        totalUsers,
                        pdiCount,
                        invoicesCount,
                        claimsCount,
                        serviceInquiries,
                        shopsCount,
                    }}
                />
            </section>

            {/* Recent Activity Strip */}
            <div className="p-6 sm:p-8 rounded-[24px] relative overflow-hidden shadow-2xl shadow-black/40 border border-white/5 bg-[#121214]">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-display font-bold text-white tracking-wide">Studio System Log</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Live activities across modules</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {recentActivities.map((act, idx) => (
                        <div
                            key={idx}
                            className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-3"
                        >
                            <div className="w-2 h-2 rounded-full bg-[#16acd4] mt-1.5 shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-zinc-300 leading-snug">{act.message}</p>
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-1 inline-block">{act.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
