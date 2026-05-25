"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ClipboardCheck,
    Shield,
    Settings,
    LogOut,
    Menu,
    X,
    Car,
    Package,
    Users,
    FileText,
    Store,
    CreditCard,
    Bell,
    MessageSquare,
    Trash2,
    FileWarning,
    ShieldCheck,
    Image as ImageIcon,
    Receipt,
} from "lucide-react"
import { useState } from "react"

interface MenuItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number
}

interface MenuGroup {
    label: string
    items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
    {
        label: "Overview",
        items: [
            { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ]
    },
    {
        label: "Management",
        items: [
            { name: "Users", href: "/admin/users", icon: Users },

            { name: "PDI Packages", href: "/admin/packages", icon: FileText },
            { name: "Payments", href: "/admin/payments", icon: CreditCard },
            { name: "Social Showcase", href: "/admin/posts", icon: ImageIcon },
        ]
    },
    {
        label: "Operations",
        items: [
            { name: "PDI Requests", href: "/admin/requests", icon: ClipboardCheck },
            { name: "PDI Inspections", href: "/admin/pdi", icon: ShieldCheck },
            { name: "Insurance Requests", href: "/admin/insurance-requests", icon: FileText },
            { name: "Insurance", href: "/admin/insurance", icon: Shield },
            { name: "Vehicle Inquiries", href: "/admin/vehicle-inquiries", icon: Car },
            { name: "Service Inquiries", href: "/admin/service-inquiries", icon: MessageSquare },
            { name: "Scrap Cars", href: "/admin/scrap-cars", icon: Trash2 },
            { name: "E-Challan", href: "/admin/e-challan", icon: FileWarning },
        ]
    },
    {
        label: "System",
        items: [
            { name: "Notifications", href: "/admin/notifications", icon: Bell },
            { name: "Settings", href: "/admin/settings", icon: Settings },
        ]
    },
    {
        label: "Billing & Finance",
        items: [
            { name: "Invoices", href: "/admin/invoices", icon: Receipt },
            { name: "Quotations", href: "/admin/quotations", icon: FileText },
            { name: "Clients", href: "/admin/clients", icon: Users },
            { name: "Services & Items", href: "/admin/billing-items", icon: Store },
            { name: "Super Admin Billing", href: "/super-admin/invoices", icon: Shield },
        ]
    },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            window.location.href = "/login"
        } catch (error) {
            console.error("Logout error:", error)
        }
    }

    const isActive = (href: string) =>
        href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl transition-all bg-[#121214] border border-white/10"
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
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${collapsed ? 'lg:w-[76px]' : 'lg:w-[280px]'}
                    w-[280px]
                `}
            >
                {/* Logo */}
                <div className="h-20 flex items-center justify-center px-4 flex-shrink-0 border-b border-white/5 bg-[#121214]">
                    <Link href="/admin" className="flex items-center justify-center w-full" onClick={() => setIsOpen(false)}>
                        <div className={`font-display font-bold tracking-tight uppercase text-white transition-all ${collapsed ? 'text-xl' : 'text-xl'}`}>
                            {collapsed ? "DG" : <>Detailing <span className="text-[#16acd4]">Garage</span></>}
                        </div>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-7 custom-scrollbar">
                    {menuGroups.map((group) => (
                        <div key={group.label}>
                            {/* Group label */}
                            {!collapsed && (
                                <p className="text-[11px] font-bold uppercase tracking-[2px] mb-3 px-3 text-zinc-500">
                                    {group.label}
                                </p>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isActive(item.href)
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            title={collapsed ? item.name : undefined}
                                            className={`
                                                flex items-center gap-3.5 rounded-xl transition-all duration-300 relative group
                                                ${collapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3'}
                                                ${active
                                                    ? 'text-[#16acd4] font-bold bg-[#16acd4]/10 border border-[#16acd4]/20'
                                                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                                                }
                                            `}
                                        >
                                            <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 transition-all duration-300 ${active ? 'text-[#16acd4]' : 'text-zinc-500 group-hover:text-[#16acd4]'}`} />
                                            {!collapsed && (
                                                <span className="text-[14px] relative z-10 truncate tracking-wide font-medium">{item.name}</span>
                                            )}
                                            {active && !collapsed && (
                                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[#16acd4] shadow-[0_0_10px_rgba(22, 172, 212,0.4)]" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom: Logout */}
                <div className="p-4 flex-shrink-0 border-t border-white/5 bg-[#121214]">
                    {collapsed ? (
                        <button
                            onClick={handleLogout}
                            className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-all duration-300 text-red-500 hover:bg-red-500/10 hover:text-red-400 group relative"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3.5 px-4 py-3 rounded-xl w-full transition-all duration-300 group relative text-red-500 font-bold hover:bg-red-500/10 hover:text-red-400 border border-transparent"
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0 relative z-10" />
                            <span className="text-[14px] relative z-10 tracking-wide">Logout</span>
                        </button>
                    )}
                </div>
            </aside>
        </>
    )
}
