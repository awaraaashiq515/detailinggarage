"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
    Receipt,
    FileText,
    Users,
    Sparkles,
    Boxes,
    Wrench,
    ClipboardCheck,
    Zap,
    Shield,
    BatteryCharging,
    UserCheck,
    CalendarCheck,
    Navigation,
    Smartphone,
    Store,
    Globe,
    Search,
    Plus,
    IndianRupee,
    Clock,
    Car,
    Menu,
    X,
    ChevronRight,
    Layers,
    CheckCircle2,
    SlidersHorizontal,
    PlusCircle,
    FilePlus,
    LayoutGrid,
    Home,
    Radio,
    Banknote,
    Wallet
} from "lucide-react"

export interface AppTile {
    id: string
    title: string
    sub?: string
    href: string
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
    category: "billing" | "ev" | "workshop" | "team" | "settings"
    badge?: string
    isEV?: boolean
    quickAction?: {
        label: string
        href: string
    }
}

interface ShopAppLauncherProps {
    shopName: string
    userName: string
    totalRevenue: number
    totalOutstanding: number
    totalInvoicesCount: number
    totalQuotationsCount: number
    clientsCount: number
    servicesCount: number
    inventoryCount: number
    staffCount: number
    presentStaffCount: number
    activeJobsCount: number
    pdiCount: number
    evPdiCount: number
    insuranceCount: number
    evInsuranceCount: number
    vehiclesCount?: number
    activeJobs: any[]
    recentInvoices: any[]
}

export function ShopAppLauncher({
    shopName,
    userName,
    totalRevenue,
    totalOutstanding,
    totalInvoicesCount,
    totalQuotationsCount,
    clientsCount,
    servicesCount,
    inventoryCount,
    staffCount,
    presentStaffCount,
    activeJobsCount,
    pdiCount,
    evPdiCount,
    insuranceCount,
    evInsuranceCount,
    vehiclesCount = 0,
    activeJobs,
    recentInvoices
}: ShopAppLauncherProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false)

    // Complete list of all workshop app tiles matching the reference design:
    // Centered icon in a squircle with uppercase title below
    const apps: AppTile[] = useMemo(() => [
        {
            id: "invoices",
            title: "INVOICES",
            sub: "Tax & Retail Bills",
            href: "/shop/billing/invoices",
            icon: Receipt,
            category: "billing",
            badge: `${totalInvoicesCount} TOTAL`,
            quickAction: { label: "+ Bill", href: "/shop/billing/invoices/new" }
        },
        {
            id: "quotations",
            title: "QUOTATIONS",
            sub: "Estimates & Approval",
            href: "/shop/billing/quotations",
            icon: FileText,
            category: "billing",
            badge: `${totalQuotationsCount} QUOTES`,
            quickAction: { label: "+ Quote", href: "/shop/billing/quotations/new" }
        },
        {
            id: "clients",
            title: "CLIENTS",
            sub: "Customer Directory",
            href: "/shop/billing/clients",
            icon: Users,
            category: "billing",
            badge: `${clientsCount} CLIENTS`,
        },
        {
            id: "services",
            title: "SERVICES MENU",
            sub: "Detailing & PPF Menu",
            href: "/shop/billing/services",
            icon: Sparkles,
            category: "billing",
            badge: `${servicesCount} PACKAGES`,
        },
        {
            id: "inventory",
            title: "STOCK / INVENTORY",
            sub: "Chemicals & Products",
            href: "/shop/billing/items",
            icon: Boxes,
            category: "billing",
            badge: `${inventoryCount} ITEMS`,
        },
        {
            id: "jobs",
            title: "WORKSHOP JOBS",
            sub: "Active Bay Vehicle Flow",
            href: "/shop/billing/jobs",
            icon: Wrench,
            category: "workshop",
            badge: `${activeJobsCount} ACTIVE`,
            quickAction: { label: "+ Assign", href: "/shop/billing/jobs?new=1" }
        },
        {
            id: "vehicles",
            title: "VEHICLE RECORDS",
            sub: "All Cars Work & Ledger Khata",
            href: "/shop/billing/vehicles",
            icon: Car,
            category: "workshop",
            badge: `${vehiclesCount > 0 ? vehiclesCount + " CARS" : "LIVE LEDGER"}`,
            quickAction: { label: "+ Record Car", href: "/shop/billing/vehicles?new=1" }
        },
        {
            id: "pdi",
            title: "PDI INSPECTION",
            sub: "100+ Checkpoints",
            href: "/shop/billing/pdi",
            icon: ClipboardCheck,
            category: "ev",
            badge: `${pdiCount} REPORTS`,
        },
        {
            id: "ev_pdi",
            title: "⚡ EV PDI STUDIO",
            sub: "High Voltage Battery PDI",
            href: "/shop/billing/pdi/ev-new",
            icon: Zap,
            category: "ev",
            badge: "⚡ EV SUITE",
            isEV: true,
            quickAction: { label: "Launch EV", href: "/shop/billing/pdi/ev-new" }
        },
        {
            id: "insurance",
            title: "INSURANCE CLAIMS",
            sub: "Cashless Surveyor Desk",
            href: "/shop/billing/insurance",
            icon: Shield,
            category: "ev",
            badge: `${insuranceCount} CLAIMS`,
        },
        {
            id: "ev_insurance",
            title: "⚡ EV INSURANCE",
            sub: "Battery Pack & Motor Claims",
            href: "/shop/billing/insurance/ev-new",
            icon: BatteryCharging,
            category: "ev",
            badge: "⚡ EV CLAIM",
            isEV: true,
            quickAction: { label: "New EV Claim", href: "/shop/billing/insurance/ev-new" }
        },
        {
            id: "staff",
            title: "STAFF & TEAM",
            sub: "Technicians & Detailers",
            href: "/shop/billing/staff",
            icon: UserCheck,
            category: "team",
            badge: `${staffCount} MEMBERS`,
        },
        {
            id: "salary",
            title: "STAFF SALARY",
            sub: "Payroll & Advance Khata",
            href: "/shop/billing/staff/salary",
            icon: Banknote,
            category: "team",
            badge: "PAYROLL",
            quickAction: { label: "Pay", href: "/shop/billing/staff/salary" }
        },
        {
            id: "attendance",
            title: "STAFF ATTENDANCE",
            sub: "Geofence Punch In/Out",
            href: "/shop/billing/staff/attendance",
            icon: CalendarCheck,
            category: "team",
            badge: `${presentStaffCount} PRESENT`,
        },
        {
            id: "live_locations",
            title: "LIVE GPS MAP",
            sub: "Realtime Staff Radar",
            href: "/shop/billing/staff/locations",
            icon: Navigation,
            category: "team",
            badge: "🔴 LIVE RADAR",
        },
        {
            id: "staff_app",
            title: "STAFF MOBILE APP",
            sub: "PWA Technician View",
            href: "/staff",
            icon: Smartphone,
            category: "team",
            badge: "MOBILE PORTAL",
        },
        {
            id: "profile",
            title: "SHOP SETTINGS",
            sub: "GST, Bank & Profile",
            href: "/shop/billing/profile",
            icon: Store,
            category: "settings",
            badge: "VERIFIED",
        },
        {
            id: "site",
            title: "PUBLIC WEBSITE",
            sub: "Customer Showcase",
            href: "/",
            icon: Globe,
            category: "settings",
            badge: "LIVE SITE",
        },
        {
            id: "create_invoice",
            title: "+ CREATE INVOICE",
            sub: "Fast Tax Invoice",
            href: "/shop/billing/invoices/new",
            icon: PlusCircle,
            category: "billing",
            badge: "QUICK",
        },
        {
            id: "create_quote",
            title: "+ NEW ESTIMATE",
            sub: "Fast Quotation",
            href: "/shop/billing/quotations/new",
            icon: FilePlus,
            category: "billing",
            badge: "QUICK",
        }
    ], [
        totalInvoicesCount,
        totalQuotationsCount,
        clientsCount,
        servicesCount,
        inventoryCount,
        staffCount,
        presentStaffCount,
        activeJobsCount,
        pdiCount,
        insuranceCount
    ])

    // Filter logic
    const filteredApps = useMemo(() => {
        return apps.filter(app => {
            const matchesCategory = selectedCategory === "all" || app.category === selectedCategory
            const q = searchQuery.toLowerCase().trim()
            const matchesQuery = !q ||
                app.title.toLowerCase().includes(q) ||
                (app.sub && app.sub.toLowerCase().includes(q))
            return matchesCategory && matchesQuery
        })
    }, [apps, selectedCategory, searchQuery])

    const categories = [
        { id: "all", label: "ALL PAGES", count: apps.length },
        { id: "billing", label: "BILLING & FINANCE", count: apps.filter(a => a.category === "billing").length },
        { id: "ev", label: "EV & INSPECTIONS", count: apps.filter(a => a.category === "ev").length },
        { id: "workshop", label: "WORKSHOP BAYS", count: apps.filter(a => a.category === "workshop").length },
        { id: "team", label: "STAFF & RADAR", count: apps.filter(a => a.category === "team").length },
        { id: "settings", label: "SETTINGS", count: apps.filter(a => a.category === "settings").length },
    ]

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">

            {/* ── Top Bar & Mobile App Menu Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0b101f] border border-[#1b2544]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366f1] to-cyan-400 flex items-center justify-center text-black font-black text-sm shadow-md shadow-[#6366f1]/20">
                        DG
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                                {shopName}
                            </h1>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> VERIFIED
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                            Workshop Operating System • Logged in as <span className="text-white font-semibold">{userName}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Full Mobile App Menu Button */}
                    <button
                        onClick={() => setIsMenuDrawerOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141b36] hover:bg-[#1c264a] border border-[#242e56] text-[#818cf8] hover:text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                    >
                        <Menu className="w-4 h-4" />
                        <span>FULL MENU</span>
                    </button>

                    <Link
                        href="/shop/billing/invoices/new"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#6366f1]/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>+ BILL</span>
                    </Link>
                </div>
            </div>

            {/* ── Search Bar with Instant Page Filter ── */}
            <div className="relative">
                <div className="relative flex items-center">
                    <Search className="absolute left-4 w-5 h-5 text-[#818cf8]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search all workshop pages (Invoices, Quotations, EV PDI, Insurance, Staff, Stock)..."
                        className="w-full bg-[#0b101f] border border-[#1b2544] hover:border-[#6366f1]/40 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 text-white placeholder-zinc-500 rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base font-medium transition-all shadow-lg"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Instant Search Suggestions / Count */}
                {searchQuery && (
                    <div className="mt-2 px-2 flex items-center justify-between text-xs text-zinc-400">
                        <span>Found <b className="text-white">{filteredApps.length}</b> pages matching &ldquo;{searchQuery}&rdquo;</span>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="text-[#818cf8] hover:underline"
                        >
                            Reset Search
                        </button>
                    </div>
                )}
            </div>

            {/* ── Category Filter Pills (Exact App Navigation) ── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => {
                    const isActive = selectedCategory === cat.id
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all
                                ${isActive
                                    ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/30"
                                    : "bg-[#0b101f] text-zinc-400 hover:text-white hover:bg-[#12182c] border border-[#1b2544]"}
                            `}
                        >
                            <span>{cat.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? "bg-black/20 text-white" : "bg-[#141b36] text-zinc-400"}`}>
                                {cat.count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* ── SQUARED APPS GRID (Exact Reference Aesthetic from User Screenshot) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {filteredApps.map((app) => {
                    const Icon = app.icon
                    return (
                        <Link
                            key={app.id}
                            href={app.href}
                            className={`
                                group relative flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl
                                bg-[#0b101f] border border-[#1b2544]
                                hover:border-[#6366f1]/60 hover:bg-[#10172e]
                                transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6366f1]/10
                                active:scale-95 text-center min-h-[140px]
                                ${app.isEV ? "border-cyan-500/40 hover:border-cyan-400/80" : ""}
                            `}
                        >
                            {/* Optional Notification / Count Badge */}
                            {app.badge && (
                                <span className={`
                                    absolute top-2.5 right-2.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border tracking-wider
                                    ${app.isEV
                                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                        : "bg-[#141b36] text-[#818cf8] border-[#242e56]"}
                                `}>
                                    {app.badge}
                                </span>
                            )}

                            {/* Centered Squircle Icon Box (Matching user image) */}
                            <div className={`
                                w-12 h-12 rounded-2xl bg-[#141b36] border border-[#242e56]/60
                                flex items-center justify-center text-[#818cf8]
                                group-hover:text-white group-hover:bg-[#6366f1] group-hover:border-[#6366f1]
                                group-hover:scale-110 transition-all duration-300 shadow-md mb-3
                                ${app.isEV ? "text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-500" : ""}
                            `}>
                                <Icon className="w-6 h-6 transition-transform" />
                            </div>

                            {/* Centered Bold Uppercase Title */}
                            <span className="text-[12px] sm:text-[13px] font-black tracking-wider text-white uppercase text-center leading-tight group-hover:text-[#a5b4fc] transition-colors">
                                {app.title}
                            </span>

                            {/* Micro Description */}
                            {app.sub && (
                                <span className="text-[10px] text-zinc-400 font-medium mt-1 line-clamp-1 group-hover:text-zinc-300 transition-colors">
                                    {app.sub}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* ── Active Workshop Bay Jobs & Live Summary ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                {/* Active Vehicles in Bay */}
                <div className="rounded-2xl bg-[#0b101f] border border-[#1b2544] p-5">
                    <div className="flex items-center justify-between border-b border-[#1b2544] pb-3 mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#141b36] border border-[#242e56] flex items-center justify-center text-[#818cf8]">
                                <Wrench className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Active Bay Vehicles</h3>
                                <p className="text-[11px] text-zinc-400">Cars currently being serviced</p>
                            </div>
                        </div>
                        <Link
                            href="/shop/billing/jobs"
                            className="text-xs font-bold text-[#818cf8] hover:underline flex items-center gap-1 uppercase"
                        >
                            View All ({activeJobs.length}) <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {activeJobs.length === 0 ? (
                        <div className="py-6 text-center text-zinc-500 text-xs">
                            <Car className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            No vehicles currently active in the bays.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {activeJobs.slice(0, 4).map((job: any) => (
                                <Link
                                    key={job.id}
                                    href="/shop/billing/jobs"
                                    className="p-3 rounded-xl bg-[#10162a] hover:bg-[#161f3c] border border-[#1b2544] transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="font-mono text-xs font-black bg-amber-400 text-black px-1.5 py-0.5 rounded">
                                            {job.vehicleRegNo}
                                        </span>
                                        <span className="text-[9px] font-extrabold uppercase text-[#818cf8] bg-[#141b36] px-2 py-0.5 rounded">
                                            {job.status === "IN_PROGRESS" ? "In Bay" : "Assigned"}
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-white truncate">
                                        {job.vehicleName}
                                    </div>
                                    <div className="text-[10px] text-zinc-400 mt-1">
                                        Tech: <b className="text-zinc-200">{job.staff?.name || "Unassigned"}</b>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Billing Receipts */}
                <div className="rounded-2xl bg-[#0b101f] border border-[#1b2544] p-5">
                    <div className="flex items-center justify-between border-b border-[#1b2544] pb-3 mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#141b36] border border-[#242e56] flex items-center justify-center text-emerald-400">
                                <Receipt className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Recent Invoices</h3>
                                <p className="text-[11px] text-zinc-400">Latest customer bills</p>
                            </div>
                        </div>
                        <Link
                            href="/shop/billing/invoices"
                            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 uppercase"
                        >
                            All Bills <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recentInvoices.length === 0 ? (
                        <div className="py-6 text-center text-zinc-500 text-xs">
                            No invoices generated yet.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentInvoices.slice(0, 4).map((inv: any) => (
                                <Link
                                    key={inv.id}
                                    href={`/shop/billing/invoices/${inv.id}`}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#10162a] hover:bg-[#161f3c] border border-[#1b2544] transition-all text-xs"
                                >
                                    <div>
                                        <div className="font-bold text-white">{inv.invoiceNumber}</div>
                                        <div className="text-[11px] text-zinc-400">{inv.client?.name || "Cash Customer"}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-white">₹{inv.grandTotal?.toLocaleString("en-IN")}</div>
                                        <span className={`text-[10px] font-bold uppercase ${inv.status === "PAID" ? "text-emerald-400" : "text-amber-400"}`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── FULL MENU DRAWER (Mobile App Slide-over Menu) ── */}
            {isMenuDrawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md h-full bg-[#0b101f] border-l border-[#1b2544] flex flex-col justify-between overflow-y-auto p-5 sm:p-6 shadow-2xl">
                        {/* Drawer Header */}
                        <div>
                            <div className="flex items-center justify-between border-b border-[#1b2544] pb-4 mb-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-[#6366f1] flex items-center justify-center text-white font-black text-sm">
                                        DG
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-white uppercase tracking-wider">FULL WORKSHOP MENU</h2>
                                        <p className="text-[11px] text-zinc-400">All modules &amp; direct links</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMenuDrawerOpen(false)}
                                    className="w-9 h-9 rounded-xl bg-[#141b36] border border-[#242e56] flex items-center justify-center text-zinc-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Categorized Menu Links */}
                            <div className="space-y-6">
                                {/* Billing & Invoices */}
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#818cf8] mb-2.5 block">
                                        Billing &amp; Finance
                                    </span>
                                    <div className="space-y-1">
                                        {[
                                            { name: "Invoices & GST Bills", href: "/shop/billing/invoices", icon: Receipt },
                                            { name: "Create New Invoice", href: "/shop/billing/invoices/new", icon: PlusCircle },
                                            { name: "Quotations & Estimates", href: "/shop/billing/quotations", icon: FileText },
                                            { name: "Create New Quote", href: "/shop/billing/quotations/new", icon: FilePlus },
                                            { name: "Clients Directory", href: "/shop/billing/clients", icon: Users },
                                            { name: "Services & PPF Menu", href: "/shop/billing/services", icon: Sparkles },
                                            { name: "Stock / Inventory", href: "/shop/billing/items", icon: Boxes },
                                        ].map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMenuDrawerOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#141b36] text-zinc-300 hover:text-white text-xs font-bold transition-all"
                                            >
                                                <item.icon className="w-4 h-4 text-[#818cf8]" />
                                                <span>{item.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* EV & Inspections */}
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2.5 block">
                                        ⚡ EV &amp; Inspections Suite
                                    </span>
                                    <div className="space-y-1">
                                        {[
                                            { name: "⚡ EV PDI Inspection Studio", href: "/shop/billing/pdi/ev-new", icon: Zap },
                                            { name: "Standard PDI Inspection", href: "/shop/billing/pdi", icon: ClipboardCheck },
                                            { name: "⚡ EV Insurance Claims", href: "/shop/billing/insurance/ev-new", icon: BatteryCharging },
                                            { name: "Standard Insurance Claims", href: "/shop/billing/insurance", icon: Shield },
                                        ].map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMenuDrawerOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#141b36] text-zinc-300 hover:text-white text-xs font-bold transition-all"
                                            >
                                                <item.icon className="w-4 h-4 text-cyan-400" />
                                                <span>{item.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Workshop & Staff */}
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2.5 block">
                                        Workshop &amp; Team
                                    </span>
                                    <div className="space-y-1">
                                        {[
                                            { name: "Workshop Bay Jobs", href: "/shop/billing/jobs", icon: Wrench },
                                            { name: "Staff & Technicians", href: "/shop/billing/staff", icon: UserCheck },
                                            { name: "Salary & Advance Khata", href: "/shop/billing/staff/salary", icon: Banknote },
                                            { name: "Staff Attendance (Geofenced)", href: "/shop/billing/staff/attendance", icon: CalendarCheck },
                                            { name: "Live GPS Tracker Map", href: "/shop/billing/staff/locations", icon: Navigation },
                                            { name: "Staff Mobile App View", href: "/staff", icon: Smartphone },
                                        ].map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMenuDrawerOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#141b36] text-zinc-300 hover:text-white text-xs font-bold transition-all"
                                            >
                                                <item.icon className="w-4 h-4 text-amber-400" />
                                                <span>{item.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Settings */}
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2.5 block">
                                        Settings &amp; Web
                                    </span>
                                    <div className="space-y-1">
                                        {[
                                            { name: "Shop Profile & GST", href: "/shop/billing/profile", icon: Store },
                                            { name: "Public Booking Website", href: "/", icon: Globe },
                                        ].map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMenuDrawerOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#141b36] text-zinc-300 hover:text-white text-xs font-bold transition-all"
                                            >
                                                <item.icon className="w-4 h-4 text-zinc-400" />
                                                <span>{item.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Bottom */}
                        <div className="pt-6 border-t border-[#1b2544] mt-6">
                            <button
                                onClick={() => setIsMenuDrawerOpen(false)}
                                className="w-full py-3 rounded-xl bg-[#141b36] hover:bg-[#1c264a] text-white font-black text-xs uppercase tracking-wider transition-all"
                            >
                                Close Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MOBILE APP BOTTOM TAB BAR (Always accessible like a mobile app) ── */}
            <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0b101f]/95 backdrop-blur-xl border-t border-[#1b2544] px-4 py-2 flex items-center justify-around shadow-2xl">
                <Link
                    href="/shop/billing"
                    className="flex flex-col items-center gap-1 text-[#818cf8] font-bold text-[10px] uppercase tracking-wider py-1 px-3"
                >
                    <Home className="w-5 h-5 text-[#818cf8]" />
                    <span>Home</span>
                </Link>

                <Link
                    href="/shop/billing/invoices"
                    className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white font-bold text-[10px] uppercase tracking-wider py-1 px-3"
                >
                    <Receipt className="w-5 h-5" />
                    <span>Bills</span>
                </Link>

                <Link
                    href="/shop/billing/pdi/ev-new"
                    className="flex flex-col items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold text-[10px] uppercase tracking-wider py-1 px-3"
                >
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <span>⚡ EV</span>
                </Link>

                <Link
                    href="/shop/billing/jobs"
                    className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white font-bold text-[10px] uppercase tracking-wider py-1 px-3"
                >
                    <Wrench className="w-5 h-5" />
                    <span>Bays</span>
                </Link>

                <Link
                    href="/shop/billing/staff"
                    className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white font-bold text-[10px] uppercase tracking-wider py-1 px-3"
                >
                    <UserCheck className="w-5 h-5" />
                    <span>Staff</span>
                </Link>

                <button
                    onClick={() => setIsMenuDrawerOpen(true)}
                    className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white font-bold text-[10px] uppercase tracking-wider py-1 px-3"
                >
                    <Menu className="w-5 h-5" />
                    <span>Menu</span>
                </button>
            </nav>
        </div>
    )
}
