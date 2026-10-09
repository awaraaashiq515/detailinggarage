import { getCurrentUser } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft, Users, Phone, Mail, MapPin, Building2, Plus } from "lucide-react"

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/shop/billing" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white mb-2 transition-colors">
                        <ArrowLeft className="w-3 h-3" /> Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-black text-white">Clients</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">{clients.length} clients in your shop</p>
                </div>
                <Link href="/admin/clients/new"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}>
                    <Plus className="w-4 h-4" /> New Client
                </Link>
            </div>

            {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/8" style={{ background: "#111113" }}>
                    <Users className="w-12 h-12 text-zinc-700 mb-4" />
                    <p className="text-white font-bold text-lg">No clients yet</p>
                    <p className="text-zinc-500 text-sm mt-1">Add your first client to start creating invoices</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {clients.map(client => (
                        <div key={client.id} className="rounded-2xl border border-white/8 p-5 hover:border-white/15 transition-all" style={{ background: "#111113" }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-[#16acd4]/15 flex items-center justify-center font-bold text-[#16acd4]">
                                    {client.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{client.name}</p>
                                    <p className="text-xs text-zinc-500">{client._count.invoices} invoices</p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                {client.phone && <div className="flex items-center gap-2 text-xs text-zinc-500"><Phone className="w-3 h-3" />{client.phone}</div>}
                                {client.email && <div className="flex items-center gap-2 text-xs text-zinc-500"><Mail className="w-3 h-3" />{client.email}</div>}
                                {client.vehicleRegNo && <div className="flex items-center gap-2 text-xs text-zinc-500"><Building2 className="w-3 h-3" />{client.vehicleRegNo}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
