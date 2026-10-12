import { getCurrentUser } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { Users, Phone, Mail, Building2, Plus, ChevronRight, Receipt, Car } from "lucide-react"

export default async function ShopClientsPage() {
    const user = await getCurrentUser()
    if (!user) redirect("/login")

    let shopId: string | null = null
    if (user.role === "SHOP_OWNER") {
        const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
        if (!shop || shop.status !== "ACTIVE") redirect("/unauthorized")
        shopId = shop.id
    }

    const clients = await db.billingClient.findMany({
        where: shopId ? { shopId } : {},
        include: { _count: { select: { invoices: true } } },
        orderBy: { createdAt: "desc" }
    })

    const avatarColors = [
        "#16acd4", "#c084fc", "#34d399", "#fb923c", "#f472b6", "#60a5fa", "#a78bfa"
    ]

    return (
        <div className="flex flex-col gap-5">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Billing</span>
                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Clients</span>
                    </div>
                    <h1 className="text-xl lg:text-2xl font-black text-white">Clients</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">{clients.length} clients in your shop</p>
                </div>
                <Link
                    href="/admin/clients/new"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-black transition-all hover:opacity-90 shadow-lg shrink-0"
                    style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Client</span>
                    <span className="sm:hidden">New</span>
                </Link>
            </div>

            {/* ── Stats bar ── */}
            <div className="rounded-2xl border border-white/8 p-4 flex items-center gap-6" style={{ background: "#111113" }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#16acd418" }}>
                        <Users className="w-5 h-5 text-[#16acd4]" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-white">{clients.length}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Clients</p>
                    </div>
                </div>
                <div className="w-px h-10 bg-white/8" />
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#34d39918" }}>
                        <Receipt className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-white">
                            {clients.reduce((s, c) => s + c._count.invoices, 0)}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Invoices</p>
                    </div>
                </div>
            </div>

            {/* ── Client Cards ── */}
            {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/8" style={{ background: "#111113" }}>
                    <Users className="w-14 h-14 text-zinc-700 mb-4" />
                    <p className="text-white font-bold text-lg">No clients yet</p>
                    <p className="text-zinc-500 text-sm mt-1">Add your first client to start creating invoices</p>
                    <Link href="/admin/clients/new"
                        className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl text-sm font-bold text-black shadow-lg"
                        style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}>
                        <Plus className="w-4 h-4" /> Add Client
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                    {clients.map((client, idx) => {
                        const color = avatarColors[idx % avatarColors.length]
                        return (
                            <div
                                key={client.id}
                                className="rounded-2xl border border-white/8 overflow-hidden hover:border-white/15 transition-all"
                                style={{ background: "#111113" }}
                            >
                                {/* Card top */}
                                <div className="p-4 flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0"
                                        style={{ background: color + "20", color }}
                                    >
                                        {client.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-white text-base truncate">{client.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: color + "18", color }}>
                                                {client._count.invoices} invoice{client._count.invoices !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="mx-4 border-t border-white/6" />

                                {/* Details */}
                                <div className="p-4 space-y-2">
                                    {client.phone && (
                                        <div className="flex items-center gap-2.5">
                                            <Phone className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                                            <span className="text-sm text-zinc-400">{client.phone}</span>
                                        </div>
                                    )}
                                    {client.email && (
                                        <div className="flex items-center gap-2.5">
                                            <Mail className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                                            <span className="text-sm text-zinc-400 truncate">{client.email}</span>
                                        </div>
                                    )}
                                    {client.vehicleRegNo && (
                                        <div className="flex items-center gap-2.5">
                                            <Car className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                                            <span className="text-sm font-mono text-[#16acd4]">{client.vehicleRegNo}</span>
                                        </div>
                                    )}
                                    {client.address && (
                                        <div className="flex items-start gap-2.5">
                                            <Building2 className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                                            <span className="text-xs text-zinc-500 leading-relaxed">{client.address}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action footer */}
                                <div className="border-t border-white/6 flex">
                                    <Link
                                        href={`/shop/billing/invoices?clientId=${client.id}`}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-[#16acd4] hover:bg-[#16acd4]/10 transition-colors"
                                    >
                                        <Receipt className="w-3.5 h-3.5" /> View Invoices
                                    </Link>
                                    <div className="w-px bg-white/6" />
                                    <Link
                                        href={`/shop/billing/invoices/new?clientId=${client.id}`}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-zinc-400 hover:bg-white/5 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> New Invoice
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
