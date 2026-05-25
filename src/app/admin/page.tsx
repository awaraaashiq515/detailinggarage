import { db } from "@/lib/db"
import {
    ClipboardCheck,
    Shield,
    Users,
    Car,
    TrendingUp,
    UserCheck,
    Settings,
    Mail
} from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
    // Fetch real user stats
    const totalUsers = await db.user.count()
    const pendingUsers = await db.user.count({ where: { status: "PENDING" } })
    const approvedUsers = await db.user.count({ where: { status: "APPROVED" } })

    const stats = [
        { label: "Total Service Inspections", value: "1,234", icon: ClipboardCheck, color: "#16acd4", bgColor: "rgba(22, 172, 212, 0.1)", href: "/admin/pdi" },
        { label: "Active Detailing Claims", value: "56", icon: Shield, color: "#ffffff", bgColor: "rgba(255, 255, 255, 0.05)", href: "/admin/insurance" },
        { label: "Registered Clients", value: totalUsers.toString(), icon: Users, color: "#16acd4", bgColor: "rgba(22, 172, 212, 0.1)", href: "/admin/users" },
        { label: "Pending Approvals", value: pendingUsers.toString(), icon: UserCheck, color: "#ffffff", bgColor: "rgba(255, 255, 255, 0.05)", href: "/admin/users?status=PENDING" },
    ]

    const recentActivities = [
        { type: "Service", message: "New PPF inspection completed for Porsche 911", time: "2 mins ago" },
        { type: "User", message: `${pendingUsers} users awaiting approval`, time: "Just now" },
        { type: "Claim", message: "Service claim #1234 approved", time: "15 mins ago" },
        { type: "User", message: "New VIP client registered", time: "1 hour ago" },
        { type: "Service", message: "Ceramic coating report generated for BMW M4", time: "2 hours ago" },
    ]

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-display font-extrabold text-white tracking-tight">
                    Welcome back, <span className="text-[#16acd4]">Admin!</span>
                </h2>
                <p className="text-sm font-medium text-zinc-500">Here's what's happening in the studio today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Link
                        key={index}
                        href={stat.href}
                        className="group relative p-6 rounded-[24px] transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-white/5 bg-[#121214] shadow-2xl shadow-black/40"
                    >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                                background: `radial-gradient(circle at 50% 0%, ${stat.bgColor}, transparent 70%)`
                            }}
                        />
                        
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-lg border border-white/5"
                                    style={{ backgroundColor: stat.bgColor }}
                                >
                                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                                </div>
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#16acd4]/10 border border-[#16acd4]/20">
                                    <TrendingUp className="w-3.5 h-3.5 text-[#16acd4]" />
                                    <span className="text-[10px] font-bold text-[#16acd4] uppercase tracking-wider">Live</span>
                                </div>
                            </div>
                            <p className="text-3xl font-display font-bold text-white mb-1 tabular-nums tracking-tight">{stat.value}</p>
                            <p className="text-[12px] font-bold tracking-[1px] uppercase text-zinc-500 group-hover:text-zinc-400 transition-colors">{stat.label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 p-8 rounded-[28px] relative overflow-hidden shadow-2xl shadow-black/40 border border-white/5 bg-[#121214]">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#16acd4]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-10" />
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-display font-bold text-white tracking-wide">Studio Activity</h3>
                            <p className="text-sm text-zinc-500 mt-1">Live updates from the system</p>
                        </div>
                        <button className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-white/5 border border-white/10 text-[#16acd4]">
                            View History
                        </button>
                    </div>
                    <div className="space-y-3 relative z-10">
                        {recentActivities.map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-5 p-4 rounded-2xl transition-all duration-300 hover:bg-white/5 group border border-transparent hover:border-white/10"
                            >
                                <div
                                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:scale-105 transition-transform duration-300"
                                    style={{
                                        backgroundColor: activity.type === "Service"
                                            ? 'rgba(22, 172, 212, 0.1)'
                                            : activity.type === "Claim"
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : 'rgba(22, 172, 212, 0.05)'
                                    }}
                                >
                                    {activity.type === "Service" && <ClipboardCheck className="w-5 h-5 text-[#16acd4]" />}
                                    {activity.type === "Claim" && <Shield className="w-5 h-5 text-white" />}
                                    {activity.type === "User" && <Users className="w-5 h-5 text-[#16acd4]/70" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-medium text-zinc-300 group-hover:text-white transition-colors">{activity.message}</p>
                                    <p className="text-xs mt-1 font-medium text-zinc-600">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="p-8 rounded-[28px] shadow-2xl shadow-black/40 border border-white/5 bg-[#121214] relative overflow-hidden">
                    <div className="mb-8 relative z-10">
                        <h3 className="text-xl font-display font-bold text-white tracking-wide">Direct Access</h3>
                        <p className="text-sm text-zinc-500 mt-1">Frequently used modules</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 relative z-10">
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:translate-x-1 group border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#16acd4]/10 flex items-center justify-center group-hover:bg-[#16acd4] transition-colors duration-300 border border-[#16acd4]/20">
                                <UserCheck className="w-5 h-5 text-[#16acd4] group-hover:text-black transition-colors" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-white text-sm tracking-wide">Review Clients</p>
                                <p className="text-[11px] font-medium text-zinc-500">{pendingUsers} applications</p>
                            </div>
                        </Link>
                        
                        <Link
                            href="/admin/pdi"
                            className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:translate-x-1 group border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white transition-colors duration-300 border border-white/10">
                                <ClipboardCheck className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-white text-sm tracking-wide">Service Queue</p>
                                <p className="text-[11px] font-medium text-zinc-500">Manage inspections</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/packages"
                            className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:translate-x-1 group border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#16acd4]/10 flex items-center justify-center group-hover:bg-[#16acd4] transition-colors duration-300 border border-[#16acd4]/20">
                                <Car className="w-5 h-5 text-[#16acd4] group-hover:text-black transition-colors" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-white text-sm tracking-wide">Service Packages</p>
                                <p className="text-[11px] font-medium text-zinc-500">Configure services</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/settings"
                            className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:translate-x-1 group mt-2 border border-white/5 bg-white/5 hover:bg-white/10"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                <Settings className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-white text-sm tracking-wide">Settings</p>
                                <p className="text-[11px] font-medium text-zinc-500">System configuration</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
