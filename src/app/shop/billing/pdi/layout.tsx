import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Lock } from "lucide-react"
import Link from "next/link"

export default async function PdiShopLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser()
    if (!user) redirect("/login")

    if (user.role === "SHOP_OWNER") {
        const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
        if (!shop || !shop.hasPdiAccess) {
            return (
                <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">PDI Inspection Module Not Activated</h2>
                    <p className="text-sm text-zinc-400 max-w-md mb-6">
                        The Pre-Delivery Inspection (PDI) module has not been enabled for your workshop by the administrator. Please contact your Superadmin to grant access.
                    </p>
                    <Link
                        href="/shop/billing"
                        className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all"
                    >
                        Back to Workshop Dashboard
                    </Link>
                </div>
            )
        }
    }

    return <>{children}</>
}
