"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Receipt,
    FileText,
    Users,
    Boxes,
    Store,
    Sparkles,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { useState, useEffect } from "react"
import { LogoutButton } from "@/components/dashboard/logout-button"

interface MenuItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

interface MenuGroup {
    label: string
    items: MenuItem[]
}

const shopMenuGroups: MenuGroup[] = [
    {
        label: "Overview",
        items: [
            { name: "Dashboard", href: "/shop/billing", icon: LayoutDashboard },
        ]
    },
    {
        label: "Billing & Finance",
        items: [
            { name: "Invoices", href: "/shop/billing/invoices", icon: Receipt },
            { name: "Quotations", href: "/shop/billing/quotations", icon: FileText },
            { name: "Clients", href: "/shop/billing/clients", icon: Users },
            { name: "Services & Packages", href: "/shop/billing/services", icon: Sparkles },
            { name: "Stock / Inventory", href: "/shop/billing/items", icon: Boxes },
        ]
    },
    {
        label: "Settings",
        items: [
            { name: "Shop Profile", href: "/shop/billing/profile", icon: Store },
        ]
    }
]

export function ShopSidebar({
    shopName,
    userName
}: {
    shopName: string
    userName: string
}) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    // Automatically collapse sidebar when visiting invoices or quotations pages so the wide table has maximum space
    useEffect(() => {
        if (pathname?.startsWith("/shop/billing/invoices") || pathname?.startsWith("/shop/billing/quotations")) {
            setCollapsed(true)
            setIsOpen(false)
        }
    }, [pathname])

    const isActive = (href: string) => {
        if (href === "/shop/billing") return pathname === "/shop/billing"
        return pathname.startsWith(href)
    }

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl transition-all bg-[#121214] border border-white/10"
                aria-label="Toggle Menu"
            >
                {isOpen ? (
                    <X className="w-5 h-5 text-white" />
                ) : (
                    <Menu className="w-5 h-5 text-white" />
                )}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 backdrop-blur-sm bg-black/60"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 inset-y-0 left-0 z-40 h-screen flex flex-col
                    transition-all duration-300 ease-in-out flex-shrink-0 bg-[#09090b] border-r border-white/5
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    ${collapsed ? "lg:w-[76px]" : "lg:w-[280px]"}
                    w-[280px]
                `}
            >
                {/* Header / Logo */}
                <div className="h-20 flex items-center justify-between px-4 flex-shrink-0 border-b border-white/5 bg-[#121214]">
                    {!collapsed ? (
                        <>
                            <div className="flex flex-col min-w-0">
                                <div className="font-display font-bold tracking-tight uppercase text-white text-base truncate">
                                    Detailing <span className="text-[#16acd4]">Garage</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#16acd4]" />
                                    <span className="text-[10px] font-bold text-[#16acd4] uppercase tracking-wider truncate max-w-[170px]">
                                        {shopName}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setCollapsed(true)}
                                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white shrink-0 ml-2"
                                title="Collapse Sidebar"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <div className="w-full flex flex-col items-center justify-center gap-2">
                            <button
                                onClick={() => setCollapsed(false)}
                                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white shrink-0"
                                title="Expand Sidebar"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-7 custom-scrollbar">
                    {shopMenuGroups.map((group) => (
                        <div key={group.label}>
                            {!collapsed && (
                                <p className="text-[11px] font-bold uppercase tracking-[2px] mb-3 px-3 text-zinc-500">
                                    {group.label}
                                </p>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isActive(item.href)
                                    const IconComponent = item.icon
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            title={collapsed ? item.name : undefined}
                                            className={`
                                                flex items-center gap-3.5 rounded-xl transition-all duration-300 relative group
                                                ${collapsed ? "px-0 py-3 justify-center" : "px-4 py-3"}
                                                ${active
                                                    ? "text-[#16acd4] font-bold bg-[#16acd4]/10 border border-[#16acd4]/20"
                                                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                                                }
                                            `}
                                        >
                                            <IconComponent
                                                className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                                                    active ? "text-[#16acd4]" : "text-zinc-400 group-hover:text-white"
                                                }`}
                                            />
                                            {!collapsed && (
                                                <span className="text-sm tracking-wide flex-1 truncate">
                                                    {item.name}
                                                </span>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer User Info + Logout */}
                <div className="p-4 border-t border-white/5 bg-[#121214] flex-shrink-0">
                    <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : "justify-between"}`}>
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#16acd4] flex items-center justify-center text-black font-bold text-sm shadow-[0_0_15px_rgba(22,172,212,0.3)] shrink-0">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            {!collapsed && (
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{userName}</p>
                                    <p className="text-[10px] font-bold text-[#16acd4] uppercase tracking-wider">Shop Owner</p>
                                </div>
                            )}
                        </div>
                        {!collapsed && <LogoutButton />}
                    </div>
                </div>
            </aside>
        </>
    )
}
