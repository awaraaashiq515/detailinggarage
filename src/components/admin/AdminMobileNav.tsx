"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    LayoutGrid,
    ShieldCheck,
    Receipt,
    Menu,
} from "lucide-react"

export function AdminMobileNav() {
    const pathname = usePathname()

    const openSidebar = () => {
        window.dispatchEvent(new Event("dg_open_mobile_sidebar"))
    }

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin"
        return pathname.startsWith(href)
    }

    return (
        <nav
            aria-label="Mobile Navigation"
            className="lg:hidden fixed bottom-3 inset-x-3 z-40"
        >
            <div className="flex items-center justify-around py-2 px-2 rounded-2xl bg-[#0c1022]/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
                {/* 1. Dashboard */}
                <Link
                    href="/admin"
                    className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95 ${
                        isActive("/admin")
                            ? "text-[#16acd4] bg-[#16acd4]/10 font-bold"
                            : "text-zinc-400 hover:text-white"
                    }`}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Home</span>
                </Link>

                {/* 2. All Pages Portal */}
                <Link
                    href="/admin/portal"
                    className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95 ${
                        isActive("/admin/portal")
                            ? "text-[#16acd4] bg-[#16acd4]/10 font-bold"
                            : "text-zinc-400 hover:text-white"
                    }`}
                >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">All Pages</span>
                </Link>

                {/* 3. PDI Inspections */}
                <Link
                    href="/admin/pdi"
                    className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95 ${
                        isActive("/admin/pdi")
                            ? "text-[#38bdf8] bg-[#38bdf8]/10 font-bold"
                            : "text-zinc-400 hover:text-white"
                    }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">PDI</span>
                </Link>

                {/* 4. Invoices */}
                <Link
                    href="/admin/invoices"
                    className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95 ${
                        isActive("/admin/invoices")
                            ? "text-[#34d399] bg-[#34d399]/10 font-bold"
                            : "text-zinc-400 hover:text-white"
                    }`}
                >
                    <Receipt className="w-4 h-4" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Invoices</span>
                </Link>

                {/* 5. Menu Drawer Trigger */}
                <button
                    onClick={openSidebar}
                    className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-zinc-300 hover:text-[#16acd4] active:scale-95 transition-all"
                >
                    <Menu className="w-4 h-4" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Menu</span>
                </button>
            </div>
        </nav>
    )
}
