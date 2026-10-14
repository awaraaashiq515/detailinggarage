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
    UserCheck,
    CalendarCheck,
    Smartphone,
    Menu,
    X,
    Wrench,
    ChevronLeft,
    ChevronRight,
    Navigation,
    MapPin,
    ClipboardCheck,
    Shield,
    Banknote,
    Mail,
    Car,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { LogoutButton } from "@/components/dashboard/logout-button"

interface MenuItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
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
        label: "Workshop Operations",
        items: [
            { name: "Workshop Jobs", href: "/shop/billing/jobs", icon: Wrench },
            { name: "Vehicle Records", href: "/shop/billing/vehicles", icon: Car, badge: "Records" },
            { name: "Staff & Team", href: "/shop/billing/staff", icon: UserCheck },
            { name: "Staff Attendance", href: "/shop/billing/staff/attendance", icon: CalendarCheck },
            { name: "Live Locations", href: "/shop/billing/staff/locations", icon: Navigation, badge: "Live" },
            { name: "Staff App Portal", href: "/staff", icon: Smartphone, badge: "App" },
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
            { name: "Email / SMTP", href: "/shop/billing/settings/smtp", icon: Mail, badge: "SMTP" },
        ]
    }
]

export function ShopSidebar({
    shopName,
    userName,
    hasPdiAccess = false,
    hasInsuranceAccess = false,
}: {
    shopName: string
    userName: string
    hasPdiAccess?: boolean
    hasInsuranceAccess?: boolean
}) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    // Dynamic menu groups depending on granted module permissions
    const menuGroups: MenuGroup[] = useMemo(() => [
        {
            label: "Overview",
            items: [
                { name: "Dashboard", href: "/shop/billing", icon: LayoutDashboard },
            ]
        },
        {
            label: "Workshop Operations",
            items: [
                { name: "Workshop Jobs", href: "/shop/billing/jobs", icon: Wrench },
                { name: "Vehicle Records", href: "/shop/billing/vehicles", icon: Car, badge: "Records" },
                ...(hasPdiAccess ? [{ name: "PDI Inspections", href: "/shop/billing/pdi", icon: ClipboardCheck, badge: "PDI" }] : []),
                ...(hasInsuranceAccess ? [{ name: "Insurance Claims", href: "/shop/billing/insurance", icon: Shield, badge: "Claim" }] : []),
                { name: "Staff & Team", href: "/shop/billing/staff", icon: UserCheck },
                { name: "Salary & Advance", href: "/shop/billing/staff/salary", icon: Banknote, badge: "Payroll" },
                { name: "Staff Attendance", href: "/shop/billing/staff/attendance", icon: CalendarCheck },
                { name: "Live Locations", href: "/shop/billing/staff/locations", icon: Navigation, badge: "Live" },
                { name: "Staff App Portal", href: "/staff", icon: Smartphone, badge: "App" },
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
                { name: "Email / SMTP", href: "/shop/billing/settings/smtp", icon: Mail, badge: "SMTP" },
            ]
        }
    ], [hasPdiAccess, hasInsuranceAccess])

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Automatically collapse sidebar when visiting invoices or quotations pages
    useEffect(() => {
        if (pathname?.startsWith("/shop/billing/invoices") || pathname?.startsWith("/shop/billing/quotations")) {
            setCollapsed(true)
        }
    }, [pathname])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [isOpen])

    const isActive = (href: string) => {
        if (href === "/shop/billing") return pathname === "/shop/billing"
        return pathname.startsWith(href)
    }

    // Hide sidebar completely when viewing /shop/billing launcher (after all hooks have executed)
    if (pathname === "/shop/billing") {
        return null
    }

    return (
        <>
            {/* ============================================================
                DESKTOP SIDEBAR (hidden on mobile, visible lg+)
            ============================================================ */}
            <aside
                className={`
                    hidden lg:flex sticky top-0 inset-y-0 left-0 z-40 h-screen flex-col
                    transition-all duration-300 ease-in-out flex-shrink-0 bg-[#09090b] border-r border-white/5
                    ${collapsed ? "lg:w-[76px]" : "lg:w-[280px]"}
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
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white shrink-0 ml-2"
                                title="Collapse Sidebar"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <div className="w-full flex flex-col items-center justify-center gap-2">
                            <button
                                onClick={() => setCollapsed(false)}
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white shrink-0"
                                title="Expand Sidebar"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-7 custom-scrollbar">
                    {menuGroups.map((group) => (
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
                                            {!collapsed && item.badge && (
                                                item.badge === 'Live' ? (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                                                        {item.badge}
                                                    </span>
                                                ) : (
                                                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#16acd4]/15 text-[#16acd4] border border-[#16acd4]/30">
                                                        {item.badge}
                                                    </span>
                                                )
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

            {/* ============================================================
                MOBILE: Hamburger button (fixed top-left)
            ============================================================ */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-[14px] left-4 z-[55] w-11 h-11 flex items-center justify-center rounded-xl bg-[#121214] border border-white/10 shadow-lg transition-all active:scale-95"
                aria-label="Open Menu"
            >
                <Menu className="w-5 h-5 text-white" />
            </button>

            {/* ============================================================
                MOBILE: Drawer backdrop
            ============================================================ */}
            <div
                className={`lg:hidden fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsOpen(false)}
            />

            {/* ============================================================
                MOBILE: Slide-in Drawer Panel
            ============================================================ */}
            <div
                className={`lg:hidden fixed inset-y-0 left-0 z-[70] w-[300px] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                style={{ background: "#09090b", borderRight: "1px solid rgba(255,255,255,0.08)" }}
            >
                {/* Drawer Header */}
                <div className="h-[72px] flex items-center justify-between px-5 flex-shrink-0 border-b border-white/5"
                    style={{ background: "#121214" }}>
                    <div className="flex flex-col min-w-0">
                        <div className="font-display font-bold tracking-tight uppercase text-white text-sm">
                            Detailing <span className="text-[#16acd4]">Garage</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16acd4]" />
                            <span className="text-[10px] font-bold text-[#16acd4] uppercase tracking-wider truncate max-w-[200px]">
                                {shopName}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                        aria-label="Close Menu"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Drawer Navigation */}
                <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
                    {menuGroups.map((group) => (
                        <div key={group.label}>
                            <p className="text-[10px] font-bold uppercase tracking-[2.5px] mb-2.5 px-3 text-zinc-500">
                                {group.label}
                            </p>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isActive(item.href)
                                    const IconComponent = item.icon
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`
                                                flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 relative
                                                ${active
                                                    ? "text-[#16acd4] font-bold bg-[#16acd4]/10 border border-[#16acd4]/20"
                                                    : "text-zinc-400 border border-transparent active:bg-white/10"
                                                }
                                            `}
                                        >
                                            <IconComponent
                                                className={`w-5 h-5 shrink-0 ${active ? "text-[#16acd4]" : "text-zinc-500"}`}
                                            />
                                            <span className="text-sm tracking-wide flex-1">
                                                {item.name}
                                            </span>
                                            {active && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#16acd4] shrink-0" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-white/5 flex-shrink-0" style={{ background: "#121214" }}>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#16acd4] flex items-center justify-center text-black font-bold text-sm shadow-[0_0_15px_rgba(22,172,212,0.3)] shrink-0">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{userName}</p>
                                <p className="text-[10px] font-bold text-[#16acd4] uppercase tracking-wider">Shop Owner</p>
                            </div>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </div>

            {/* ============================================================
                MOBILE: Bottom Navigation Bar
            ============================================================ */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/8 flex items-stretch"
                style={{ background: "rgba(9,9,11,0.97)", backdropFilter: "blur(20px)", paddingBottom: "env(safe-area-inset-bottom)" }}
            >
                {[
                    { name: "Home", href: "/shop/billing", icon: LayoutDashboard },
                    { name: "Invoices", href: "/shop/billing/invoices", icon: Receipt },
                    { name: "Quotes", href: "/shop/billing/quotations", icon: FileText },
                    { name: "Clients", href: "/shop/billing/clients", icon: Users },
                ].map((item) => {
                    const active = isActive(item.href)
                    const IconComponent = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all active:scale-95 relative ${
                                active ? "text-[#16acd4]" : "text-zinc-500"
                            }`}
                        >
                            {active && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#16acd4] rounded-full" />
                            )}
                            <IconComponent className={`w-5 h-5 ${active ? "text-[#16acd4]" : "text-zinc-500"}`} />
                            <span className={`text-[9px] font-bold uppercase tracking-wide ${active ? "text-[#16acd4]" : "text-zinc-600"}`}>
                                {item.name}
                            </span>
                        </Link>
                    )
                })}
                {/* More button opens drawer */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all active:scale-95 text-zinc-500"
                >
                    <Menu className="w-5 h-5 text-zinc-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wide text-zinc-600">More</span>
                </button>
            </nav>
        </>
    )
}
