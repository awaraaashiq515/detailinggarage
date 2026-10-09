import { getCurrentUser } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import {
    Receipt,
    FileText,
    Users,
    Boxes,
    Store,
    Sparkles,
    TrendingUp,
    AlertCircle,
    Plus,
    ArrowRight,
    IndianRupee,
    Clock,
    ChevronRight,
    ClipboardList,
} from "lucide-react"

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    color,
}: {
    label: string
    value: string | number
    sub?: string
    icon: any
    color: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 p-6 flex items-center gap-4 transition-all hover:border-white/15" style={{ background: "#111113" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{label}</p>
                {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

export default async function ShopBillingDashboard() {
    const user = await getCurrentUser()
    if (!user) redirect("/login")

    let shopId: string | null = null
    let shopName = "My Workshop"

    if (user.role === "SHOP_OWNER") {
        const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
        if (!shop || shop.status !== "ACTIVE") redirect("/unauthorized")
        shopId = shop.id
        shopName = shop.name
    }

    // Fetch data scoped to shop
    const whereClause = shopId ? { shopId } : {}

    const [invoices, quotations, clients, allDocs] = await Promise.all([
        db.invoice.findMany({
            where: { ...whereClause, type: "INVOICE" },
            include: { client: true },
            orderBy: { date: "desc" },
            take: 5
        }),
        db.invoice.findMany({
            where: { ...whereClause, type: "QUOTATION" },
            include: { client: true },
            orderBy: { date: "desc" },
            take: 5
        }),
        db.billingClient.count({ where: whereClause }),
        db.invoice.findMany({ where: whereClause })
    ])

    const totalRevenue = allDocs
        .filter(i => i.type === "INVOICE" && i.status === "PAID")
        .reduce((s, i) => s + i.grandTotal, 0)
    const totalOutstanding = allDocs
        .filter(i => i.type === "INVOICE" && i.status !== "PAID" && i.status !== "CANCELLED")
        .reduce((s, i) => s + (i.grandTotal - i.amountPaid), 0)
    const totalQuotationsCount = allDocs.filter(i => i.type === "QUOTATION").length
    const overdueCount = allDocs.filter(i =>
        i.type === "INVOICE" && i.status === "UNPAID" && i.dueDate && new Date(i.dueDate) < new Date()
    ).length

    const statusColor: Record<string, string> = {
        PAID: "#34d399",
        UNPAID: "#fb923c",
        PARTIALLY_PAID: "#fbbf24",
        DRAFT: "#6b7280",
        OVERDUE: "#f87171",
        CANCELLED: "#6b7280"
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Shop Portal</span>
                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Billing & Finance</span>
                    </div>
                    <h1 className="text-2xl font-black text-white">{shopName}</h1>
                    <p className="text-zinc-500 text-sm mt-1">Overview of revenue, invoices and quotations</p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                        href="/shop/billing/invoices/new"
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-lg"
                        style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}
                    >
                        <Plus className="w-4 h-4" /> New Invoice
                    </Link>
                    <Link
                        href="/shop/billing/quotations/new"
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg"
                    >
                        <FileText className="w-4 h-4" /> New Quotation
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} icon={IndianRupee} color="#16acd4" />
                <StatCard label="Outstanding" value={`₹${totalOutstanding.toLocaleString("en-IN")}`} icon={Clock} color="#fb923c" />
                <StatCard label="Total Clients" value={clients} icon={Users} color="#a78bfa" />
                <StatCard label="Quotations" value={totalQuotationsCount} sub="estimates" icon={ClipboardList} color="#c084fc" />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { href: "/shop/billing/invoices", label: "Invoices", icon: Receipt, color: "#16acd4" },
                    { href: "/shop/billing/quotations", label: "Quotations", icon: FileText, color: "#c084fc" },
                    { href: "/shop/billing/services", label: "Services & Pkgs", icon: Sparkles, color: "#e879f9" },
                    { href: "/shop/billing/items", label: "Stock / Inventory", icon: Boxes, color: "#fb923c" },
                    { href: "/shop/billing/clients", label: "Clients", icon: Users, color: "#a78bfa" },
                    { href: "/shop/billing/profile", label: "Shop Profile", icon: Store, color: "#34d399" },
                ].map((q) => (
                    <Link
                        key={q.href}
                        href={q.href}
                        className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/8 hover:border-white/15 transition-all group"
                        style={{ background: "#111113" }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: q.color + "18" }}>
                                <q.icon className="w-4 h-4" style={{ color: q.color }} />
                            </div>
                            <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{q.label}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-white transition-colors" />
                    </Link>
                ))}
            </div>

            {/* Invoices & Quotations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Invoices */}
                <div className="rounded-2xl border border-white/8 overflow-hidden flex flex-col" style={{ background: "#111113" }}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
                        <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-[#16acd4]" />
                            <h2 className="font-bold text-white text-base">Recent Invoices</h2>
                        </div>
                        <Link href="/shop/billing/invoices" className="text-xs text-[#16acd4] hover:underline transition-colors font-bold flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {invoices.length === 0 ? (
                        <div className="py-14 text-center flex-1 flex flex-col items-center justify-center">
                            <Receipt className="w-10 h-10 text-zinc-700 mb-3" />
                            <p className="text-white font-bold text-sm">No invoices yet</p>
                            <Link
                                href="/shop/billing/invoices/new"
                                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-md"
                                style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}
                            >
                                <Plus className="w-3.5 h-3.5" /> Create Invoice
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/4">
                            {invoices.map((inv) => (
                                <Link
                                    key={inv.id}
                                    href={`/shop/billing/invoices/${inv.id}`}
                                    className="flex items-center justify-between px-6 py-3.5 hover:bg-white/3 transition-colors block group"
                                >
                                    <div>
                                        <p className="font-bold text-white text-sm group-hover:text-[#16acd4] transition-colors">{inv.invoiceNumber}</p>
                                        <p className="text-xs text-zinc-500 mt-0.5">{inv.client.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white text-sm font-mono">₹{inv.grandTotal.toLocaleString("en-IN")}</p>
                                        <span
                                            className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
                                            style={{
                                                background: (statusColor[inv.status] || "#6b7280") + "18",
                                                color: statusColor[inv.status] || "#6b7280"
                                            }}
                                        >
                                            {inv.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Quotations */}
                <div className="rounded-2xl border border-white/8 overflow-hidden flex flex-col" style={{ background: "#111113" }}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-400" />
                            <h2 className="font-bold text-white text-base">Recent Quotations</h2>
                        </div>
                        <Link href="/shop/billing/quotations" className="text-xs text-purple-400 hover:underline transition-colors font-bold flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {quotations.length === 0 ? (
                        <div className="py-14 text-center flex-1 flex flex-col items-center justify-center">
                            <ClipboardList className="w-10 h-10 text-zinc-700 mb-3" />
                            <p className="text-white font-bold text-sm">No quotations yet</p>
                            <Link
                                href="/shop/billing/quotations/new"
                                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-md"
                            >
                                <Plus className="w-3.5 h-3.5" /> Create Quotation
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/4">
                            {quotations.map((q) => (
                                <Link
                                    key={q.id}
                                    href={`/shop/billing/invoices/${q.id}`}
                                    className="flex items-center justify-between px-6 py-3.5 hover:bg-white/3 transition-colors block group"
                                >
                                    <div>
                                        <p className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors font-mono">{q.invoiceNumber}</p>
                                        <p className="text-xs text-zinc-500 mt-0.5">{q.client.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white text-sm font-mono">₹{q.grandTotal.toLocaleString("en-IN")}</p>
                                        <span
                                            className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
                                            style={{
                                                background: (statusColor[q.status] || "#6b7280") + "18",
                                                color: statusColor[q.status] || "#6b7280"
                                            }}
                                        >
                                            {q.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
