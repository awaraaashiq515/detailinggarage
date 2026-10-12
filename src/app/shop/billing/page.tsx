import { getCurrentUser } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import {
    Receipt, FileText, Users, Boxes, Store, Sparkles,
    Plus, ArrowRight, IndianRupee, Clock, ChevronRight,
    ClipboardList, TrendingUp, AlertCircle, Car,
} from "lucide-react"

const STATUS_COLOR: Record<string, string> = {
    PAID: "#34d399", UNPAID: "#fb923c", PARTIALLY_PAID: "#fbbf24",
    DRAFT: "#6b7280", OVERDUE: "#f87171", CANCELLED: "#6b7280"
}
const STATUS_BG: Record<string, string> = {
    PAID: "#34d39918", UNPAID: "#fb923c18", PARTIALLY_PAID: "#fbbf2418",
    DRAFT: "#6b728018", OVERDUE: "#f8717118", CANCELLED: "#6b728018"
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

    const totalRevenue = allDocs.filter(i => i.type === "INVOICE" && i.status === "PAID").reduce((s, i) => s + i.grandTotal, 0)
    const totalOutstanding = allDocs.filter(i => i.type === "INVOICE" && i.status !== "PAID" && i.status !== "CANCELLED").reduce((s, i) => s + (i.grandTotal - i.amountPaid), 0)
    const totalQuotationsCount = allDocs.filter(i => i.type === "QUOTATION").length
    const totalInvoicesCount = allDocs.filter(i => i.type === "INVOICE").length

    return (
        <div className="flex flex-col gap-5 lg:gap-7">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Shop Portal</span>
                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                        <span className="text-[#16acd4] text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
                    </div>
                    <h1 className="text-xl lg:text-2xl font-black text-white leading-tight">{shopName}</h1>
                    <p className="text-zinc-500 text-sm mt-1">Billing &amp; Finance Overview</p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                        href="/shop/billing/invoices/new"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90 shadow-lg"
                        style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}
                    >
                        <Plus className="w-4 h-4" /> New Invoice
                    </Link>
                    <Link
                        href="/shop/billing/quotations/new"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg"
                    >
                        <FileText className="w-4 h-4" /> New Quote
                    </Link>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "Revenue", value: `₹${(totalRevenue / 1000).toFixed(1)}K`, sub: "from paid invoices", icon: IndianRupee, color: "#16acd4" },
                    { label: "Outstanding", value: `₹${(totalOutstanding / 1000).toFixed(1)}K`, sub: "pending payment", icon: Clock, color: "#fb923c" },
                    { label: "Clients", value: clients, sub: "registered", icon: Users, color: "#a78bfa" },
                    { label: "Quotations", value: totalQuotationsCount, sub: "estimates", icon: ClipboardList, color: "#c084fc" },
                ].map((s) => (
                    <div key={s.label} className="rounded-2xl border border-white/8 p-4 lg:p-5 transition-all hover:border-white/15 active:scale-[0.98]" style={{ background: "#111113" }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + "18" }}>
                                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                            </div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-tight">{s.label}</p>
                        </div>
                        <p className="text-2xl lg:text-3xl font-black text-white">{s.value}</p>
                        {s.sub && <p className="text-[10px] text-zinc-600 mt-1">{s.sub}</p>}
                    </div>
                ))}
            </div>

            {/* ── Quick Links ── */}
            <div>
                <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-zinc-500 mb-3 px-1">Quick Access</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {[
                        { href: "/shop/billing/invoices", label: "Invoices", sub: `${totalInvoicesCount} total`, icon: Receipt, color: "#16acd4" },
                        { href: "/shop/billing/quotations", label: "Quotations", sub: `${totalQuotationsCount} total`, icon: FileText, color: "#c084fc" },
                        { href: "/shop/billing/services", label: "Services", sub: "& packages", icon: Sparkles, color: "#e879f9" },
                        { href: "/shop/billing/items", label: "Stock", sub: "inventory", icon: Boxes, color: "#fb923c" },
                        { href: "/shop/billing/clients", label: "Clients", sub: `${clients} registered`, icon: Users, color: "#a78bfa" },
                        { href: "/shop/billing/profile", label: "Shop Profile", sub: "settings", icon: Store, color: "#34d399" },
                    ].map((q) => (
                        <Link
                            key={q.href}
                            href={q.href}
                            className="flex flex-col gap-3 p-4 rounded-2xl border border-white/8 hover:border-white/20 active:scale-[0.97] transition-all group"
                            style={{ background: "#111113" }}
                        >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: q.color + "18" }}>
                                <q.icon className="w-4 h-4" style={{ color: q.color }} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white group-hover:text-white transition-colors">{q.label}</p>
                                <p className="text-[10px] text-zinc-600 mt-0.5">{q.sub}</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Recent Activity Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

                {/* Recent Invoices */}
                <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "#111113" }}>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
                        <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-[#16acd4]" />
                            <h2 className="font-bold text-white text-sm lg:text-base">Recent Invoices</h2>
                        </div>
                        <Link href="/shop/billing/invoices"
                            className="text-xs text-[#16acd4] hover:underline font-bold flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {invoices.length === 0 ? (
                        <div className="py-14 text-center flex flex-col items-center justify-center gap-3">
                            <Receipt className="w-10 h-10 text-zinc-700" />
                            <p className="text-white font-bold text-sm">No invoices yet</p>
                            <Link href="/shop/billing/invoices/new"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black shadow-md"
                                style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}>
                                <Plus className="w-3.5 h-3.5" /> Create Invoice
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/4">
                            {invoices.map((inv) => (
                                <Link
                                    key={inv.id}
                                    href={`/shop/billing/invoices/${inv.id}`}
                                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors group"
                                >
                                    {/* Status dot */}
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLOR[inv.status] || "#6b7280" }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-[#16acd4] text-xs font-mono group-hover:underline">{inv.invoiceNumber}</p>
                                        </div>
                                        <p className="text-xs text-zinc-400 truncate mt-0.5">{inv.client.name}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-white text-sm font-mono">₹{inv.grandTotal.toLocaleString("en-IN")}</p>
                                        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5"
                                            style={{ background: STATUS_BG[inv.status] || "#6b728018", color: STATUS_COLOR[inv.status] || "#6b7280" }}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Quotations */}
                <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "#111113" }}>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-purple-400" />
                            <h2 className="font-bold text-white text-sm lg:text-base">Recent Quotations</h2>
                        </div>
                        <Link href="/shop/billing/quotations"
                            className="text-xs text-purple-400 hover:underline font-bold flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {quotations.length === 0 ? (
                        <div className="py-14 text-center flex flex-col items-center justify-center gap-3">
                            <ClipboardList className="w-10 h-10 text-zinc-700" />
                            <p className="text-white font-bold text-sm">No quotations yet</p>
                            <Link href="/shop/billing/quotations/new"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md">
                                <Plus className="w-3.5 h-3.5" /> Create Quotation
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/4">
                            {quotations.map((q) => (
                                <Link
                                    key={q.id}
                                    href={`/shop/billing/invoices/${q.id}`}
                                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors group"
                                >
                                    <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-purple-400 text-xs font-mono group-hover:underline">{q.invoiceNumber}</p>
                                        <p className="text-xs text-zinc-400 truncate mt-0.5">{q.client.name}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-white text-sm font-mono">₹{q.grandTotal.toLocaleString("en-IN")}</p>
                                        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5"
                                            style={{ background: STATUS_BG[q.status] || "#6b728018", color: STATUS_COLOR[q.status] || "#6b7280" }}>
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
