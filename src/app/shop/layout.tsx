import { getCurrentUser } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { Globe, Bell, ChevronRight } from "lucide-react"
import { ShopSidebar } from "@/components/shop/shop-sidebar"

export default async function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    if (!user) redirect("/login")

    // Redirect non-shop-owners
    if (user.role !== "SHOP_OWNER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        redirect("/unauthorized")
    }

    // Admin can also access shop routes for preview
    let shopName = "My Workshop"
    if (user.role === "SHOP_OWNER") {
        const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
        if (!shop || shop.status !== "ACTIVE") redirect("/unauthorized")
        shopName = shop.name
    }

    return (
        <div className="min-h-screen flex bg-[#09090b] text-white">
            {/* Sidebar with exact same design & brand styling */}
            <ShopSidebar shopName={shopName} userName={user.name} />

            {/* Main column */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Navigation Bar */}
                <header
                    className="h-20 flex items-center justify-between px-5 lg:px-7 flex-shrink-0 sticky top-0 z-30"
                    style={{
                        backgroundColor: "rgba(18,18,20,0.8)",
                        backdropFilter: "blur(16px)",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                >
                    {/* Left: breadcrumb */}
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden w-10" />
                        <div className="hidden lg:flex items-center gap-1.5 overflow-hidden group">
                            <span className="text-zinc-500 font-bold text-xs uppercase tracking-[2px]">Shop Portal</span>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                            <span className="text-white font-bold text-xs truncate tracking-[2px] uppercase">
                                {shopName}
                            </span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-5">
                        <Link
                            href="/"
                            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 hover:border-[#16acd4]/50 hover:bg-[#16acd4]/10 text-zinc-400 hover:text-[#16acd4] group"
                        >
                            <Globe className="w-4 h-4 group-hover:text-[#16acd4] transition-colors" />
                            <span className="tracking-widest uppercase">View Site</span>
                        </Link>

                        <div className="w-px h-6 bg-white/10 hidden sm:block" />

                        <div className="flex items-center gap-4">
                            <button className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all bg-white/5 hover:bg-white/10 border border-white/10 group">
                                <Bell className="w-5 h-5 text-zinc-400 group-hover:text-[#16acd4] transition-colors" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#16acd4] rounded-full shadow-[0_0_8px_rgba(22,172,212,0.8)]" />
                            </button>

                            <div className="flex items-center gap-3 pl-2 pr-5 py-2 rounded-2xl bg-white/5 border border-white/10 hover:border-[#16acd4]/30 transition-all cursor-pointer group">
                                <div className="w-9 h-9 rounded-xl bg-[#16acd4] flex items-center justify-center text-black font-bold text-sm shadow-[0_0_15px_rgba(22,172,212,0.3)] group-hover:scale-105 transition-transform">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-xs font-bold text-white tracking-wide">{user.name}</p>
                                    <p className="text-[10px] font-bold text-[#16acd4] uppercase tracking-widest mt-0.5">Shop Owner</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-5 lg:p-8 bg-[#09090b]">
                    {children}
                </main>
            </div>
        </div>
    )
}
