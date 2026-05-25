"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
    { href: "/super-admin", label: "🏠 Dashboard" },
    { href: "/super-admin/invoices", label: "🧾 Invoices" },
    { href: "/super-admin/quotations", label: "📋 Quotations" },
    { href: "/super-admin/proformas", label: "📑 Proformas" },
    { href: "/super-admin/challans", label: "📦 Challans" },
    { href: "/super-admin/invoices/new", label: "📄 New Invoice" },
    { href: "/super-admin/website", label: "🌐 Website Content" },
    { href: "/super-admin/settings/billing", label: "⚙️ Billing Settings" },
    { href: "/admin", label: "🛠 Admin Panel" },
]

export function SuperAdminNav({ userName, userRole }: { userName: string; userRole: string }) {
    const pathname = usePathname()

    return (
        <div style={{ background: "linear-gradient(to bottom, #2a6fbd, #1a4f9a)", color: "white", display: "flex", alignItems: "stretch", borderBottom: "2px solid #0d3a7a" }}>
            {/* Logo */}
            <div style={{ padding: "6px 12px", fontWeight: "bold", fontSize: "13px", borderRight: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
                🚗 Car Detailing ERP
            </div>

            {/* Nav Links */}
            <nav style={{ display: "flex" }}>
                {NAV_ITEMS.map(item => {
                    const isActive = pathname === item.href || (item.href !== "/super-admin" && item.href !== "/admin" && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                padding: "6px 14px",
                                fontSize: "12px",
                                color: "white",
                                textDecoration: "none",
                                borderRight: "1px solid rgba(255,255,255,0.15)",
                                display: "flex",
                                alignItems: "center",
                                background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                                fontWeight: isActive ? "bold" : "normal",
                                borderBottom: isActive ? "2px solid #16acd4" : "2px solid transparent",
                            }}
                            onMouseEnter={e => {
                                if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"
                            }}
                            onMouseLeave={e => {
                                if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"
                            }}
                        >
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* User Info */}
            <div style={{ marginLeft: "auto", padding: "4px 12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", whiteSpace: "nowrap" }}>
                <span>👤 {userName}</span>
                <span style={{ background: "#16acd4", color: "#000", padding: "1px 6px", fontSize: "10px", fontWeight: "bold", borderRadius: "2px" }}>
                    {userRole === "SUPER_ADMIN" ? "SUPER ADMIN" : "ADMIN"}
                </span>
            </div>
        </div>
    )
}
