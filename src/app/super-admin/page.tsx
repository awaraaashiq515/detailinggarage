"use client"

import Link from "next/link"

const MENU_ITEMS = [
    { href: "/super-admin/invoices", icon: "🧾", label: "Invoices" },
    { href: "/super-admin/invoices/new", icon: "📄", label: "New Invoice" },
    { href: "/admin/clients", icon: "👥", label: "Clients" },
    { href: "/admin/billing-items", icon: "📦", label: "Products/Services" },
    { href: "/admin/payments", icon: "💰", label: "Payments" },
    { href: "/admin/settings", icon: "⚙️", label: "Settings" },
]

export default function SuperAdminDashboard() {
    return (
        <div style={{ padding: "16px", background: "#f0f0f0", minHeight: "calc(100vh - 40px)" }}>
            <div style={{ background: "white", border: "1px solid #a0b8d8", borderRadius: "2px" }}>
                <div style={{ background: "linear-gradient(to bottom, #2a6fbd, #1a4f9a)", color: "white", padding: "5px 10px", fontWeight: "bold", fontSize: "12px" }}>
                    Super Admin — Dashboard
                </div>
                <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
                    {MENU_ITEMS.map(item => (
                        <DashCard key={item.href} {...item} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function DashCard({ href, icon, label }: { href: string; icon: string; label: string }) {
    return (
        <Link href={href} style={{ textDecoration: "none" }}>
            <div
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 10px", background: "linear-gradient(to bottom, #ddeeff, #c0d8f0)", border: "1px solid #a0b8d8", borderRadius: "4px", color: "#1a4f9a", gap: "8px", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(to bottom, #c0d8f0, #a0bce0)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(to bottom, #ddeeff, #c0d8f0)" }}
            >
                <span style={{ fontSize: "28px" }}>{icon}</span>
                <span style={{ fontSize: "11px", fontWeight: "bold", textAlign: "center" }}>{label}</span>
            </div>
        </Link>
    )
}
