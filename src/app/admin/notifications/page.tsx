import { db } from "@/lib/db"
import { Bell, ClipboardCheck, UserCheck, Shield, Clock } from "lucide-react"
import Link from "next/link"

export default async function AdminNotificationsPage() {
    // Fetch some data to show as "notifications" (e.g., pending users, new PDI requests)
    const pendingUsers = await db.user.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    const pendingPDIs = await db.pDIConfirmationRequest.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: true }
    })

    const notifications = [
        ...pendingUsers.map(user => ({
            id: `user-${user.id}`,
            type: "USER",
            title: "New User Registration",
            message: `${user.name} has registered and is awaiting approval.`,
            time: user.createdAt.toLocaleDateString(),
            icon: UserCheck,
            colorClass: "text-purple-600",
            bgClass: "bg-purple-100",
            href: "/admin/users?status=PENDING"
        })),
        ...pendingPDIs.map(pdi => ({
            id: `pdi-${pdi.id}`,
            type: "PDI",
            title: "New PDI Request",
            message: `${pdi.user.name} requested PDI for ${pdi.vehicleName} ${pdi.vehicleModel}.`,
            time: pdi.createdAt.toLocaleDateString(),
            icon: ClipboardCheck,
            colorClass: "text-emerald-600",
            bgClass: "bg-emerald-100",
            href: "/admin/requests"
        }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                            <Bell className="w-5 h-5" />
                        </div>
                        Notifications
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-2 pl-1">Stay updated with the latest activities on your platform.</p>
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <Link
                            key={notif.id}
                            href={notif.href}
                            className="flex items-start gap-5 p-5 bg-white rounded-3xl transition-all duration-300 hover:shadow-md border border-slate-200 hover:border-accent/30 group"
                        >
                            <div
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${notif.bgClass}`}
                            >
                                <notif.icon className={`w-6 h-6 ${notif.colorClass}`} />
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex items-center justify-between mb-1.5">
                                    <h3 className="text-base font-black text-slate-900 tracking-tight group-hover:text-accent transition-colors">{notif.title}</h3>
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                                        <Clock className="w-3.5 h-3.5" />
                                        {notif.time}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed">{notif.message}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-200">
                            <Bell className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-lg font-black text-slate-900 tracking-tight">All Caught Up!</p>
                        <p className="text-sm font-medium text-slate-500 mt-1">No new notifications at this time.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
