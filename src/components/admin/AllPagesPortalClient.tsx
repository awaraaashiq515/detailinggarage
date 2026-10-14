"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import {
    Search,
    ShieldCheck,
    ClipboardCheck,
    FileText,
    Shield,
    Car,
    MessageSquare,
    FileWarning,
    Trash2,
    Boxes,
    Receipt,
    Users,
    Store,
    ShieldAlert,
    UserCheck,
    Package,
    CreditCard,
    Image as ImageIcon,
    Settings,
    Smartphone,
    Share2,
    Bot,
    Mail,
    Sliders,
    Key,
    Bell,
    Globe,
    Zap,
    ExternalLink,
    Building2,
    CarFront,
    PlusCircle,
    X,
    LayoutGrid,
    Menu,
    ChevronUp,
    ChevronRight,
    Compass,
    SlidersHorizontal,
    Star,
} from "lucide-react"

export interface PageBoxItem {
    id: string
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    isExternal?: boolean
    tags: string[]
}

export interface SectionGroup {
    id: string
    title: string
    shortTitle: string
    accentColor: string // hex for the vertical line
    iconColor: string // icon tint
    items: PageBoxItem[]
}

interface AllPagesPortalClientProps {
    counts?: {
        pendingUsers?: number
        totalUsers?: number
        pdiCount?: number
        invoicesCount?: number
        claimsCount?: number
        serviceInquiries?: number
        shopsCount?: number
    }
}

export function AllPagesPortalClient({ counts = {} }: AllPagesPortalClientProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Define all groups exactly matching the clean POS/enterprise design
    const sections: SectionGroup[] = useMemo(() => [
        {
            id: "pdi-inspections",
            title: "PDI & INSPECTION SERVICES",
            shortTitle: "PDI & Inspections",
            accentColor: "#16acd4", // Detailing Garage Cyan
            iconColor: "#38bdf8",
            items: [
                {
                    id: "pdi-queue",
                    title: "PDI INSPECTIONS",
                    href: "/admin/pdi",
                    icon: ShieldCheck,
                    tags: ["pdi", "inspection", "reports", "car check", "queue"],
                },
                {
                    id: "pdi-requests",
                    title: "PDI REQUESTS",
                    href: "/admin/requests",
                    icon: ClipboardCheck,
                    tags: ["requests", "customer bookings", "slots"],
                },
                {
                    id: "pdi-new-std",
                    title: "NEW STANDARD PDI",
                    href: "/admin/pdi/new",
                    icon: PlusCircle,
                    tags: ["new pdi", "create standard report", "inspection new"],
                },
                {
                    id: "pdi-new-ev",
                    title: "NEW EV PDI",
                    href: "/admin/pdi/ev-new",
                    icon: Zap,
                    tags: ["new ev pdi", "electric vehicle inspection"],
                },
                {
                    id: "pdi-settings",
                    title: "PDI SETTINGS",
                    href: "/admin/pdi/settings",
                    icon: Settings,
                    tags: ["pdi settings", "inspection items", "checklist configuration"],
                },
                {
                    id: "pdi-packages",
                    title: "PDI PACKAGES",
                    href: "/admin/packages",
                    icon: Package,
                    tags: ["packages", "plans", "pricing tiers"],
                },
            ],
        },
        {
            id: "billing-payments",
            title: "BILLING & PAYMENTS",
            shortTitle: "Billing & Invoices",
            accentColor: "#10b981", // Emerald Green like the screenshot
            iconColor: "#34d399",
            items: [
                {
                    id: "invoices",
                    title: "INVOICES",
                    href: "/admin/invoices",
                    icon: FileText,
                    tags: ["invoices", "gst", "bills", "tax invoice"],
                },
                {
                    id: "new-invoice",
                    title: "NEW INVOICE",
                    href: "/admin/invoices/new",
                    icon: PlusCircle,
                    tags: ["create invoice", "billing new", "add invoice"],
                },
                {
                    id: "quotations",
                    title: "QUOTATIONS",
                    href: "/admin/quotations",
                    icon: Receipt,
                    tags: ["quotations", "estimates", "quotes", "pricing"],
                },
                {
                    id: "new-quotation",
                    title: "NEW QUOTE",
                    href: "/admin/quotations/new",
                    icon: PlusCircle,
                    tags: ["new quote", "create estimate"],
                },
                {
                    id: "payments",
                    title: "PAYMENTS",
                    href: "/admin/payments",
                    icon: CreditCard,
                    tags: ["payments", "transactions", "ledger", "razorpay"],
                },
                {
                    id: "clients",
                    title: "CLIENTS",
                    href: "/admin/clients",
                    icon: Users,
                    tags: ["clients", "customers", "client directory", "gstin"],
                },
                {
                    id: "billing-items",
                    title: "SERVICES & ITEMS",
                    href: "/admin/billing-items",
                    icon: Store,
                    tags: ["items", "rate list", "hsn", "pricing"],
                },
                {
                    id: "super-admin-billing",
                    title: "SUPER BILLING",
                    href: "/super-admin/invoices",
                    icon: ShieldAlert,
                    tags: ["super admin", "master billing", "franchise invoices"],
                },
            ],
        },
        {
            id: "operations-workshop",
            title: "WORKSHOP & OPERATIONS",
            shortTitle: "Workshop & Claims",
            accentColor: "#38bdf8", // Sky Blue
            iconColor: "#60a5fa",
            items: [
                {
                    id: "insurance-claims",
                    title: "INSURANCE CLAIMS",
                    href: "/admin/insurance",
                    icon: Shield,
                    tags: ["insurance claims", "warranty", "claims list"],
                },
                {
                    id: "insurance-new",
                    title: "NEW CLAIM",
                    href: "/admin/insurance/new",
                    icon: PlusCircle,
                    tags: ["new claim", "file insurance", "warranty"],
                },
                {
                    id: "insurance-requests",
                    title: "INSURANCE REQUESTS",
                    href: "/admin/insurance-requests",
                    icon: FileText,
                    tags: ["insurance requests", "quotes", "leads"],
                },
                {
                    id: "vehicle-inquiries",
                    title: "VEHICLE INQUIRIES",
                    href: "/admin/vehicle-inquiries",
                    icon: Car,
                    tags: ["vehicle inquiries", "car questions", "leads"],
                },
                {
                    id: "service-inquiries",
                    title: "SERVICE INQUIRIES",
                    href: "/admin/service-inquiries",
                    icon: MessageSquare,
                    tags: ["service inquiries", "ppf leads", "ceramic chat"],
                },
                {
                    id: "e-challan",
                    title: "E-CHALLAN",
                    href: "/admin/e-challan",
                    icon: FileWarning,
                    tags: ["echallan", "challan", "traffic fine", "rto check"],
                },
                {
                    id: "scrap-cars",
                    title: "SCRAP CARS",
                    href: "/admin/scrap-cars",
                    icon: Trash2,
                    tags: ["scrap cars", "disposal", "scrap evaluation"],
                },
                {
                    id: "parts-lookup",
                    title: "PARTS LOOKUP",
                    href: "/admin/parts-lookup",
                    icon: Boxes,
                    tags: ["parts lookup", "maruti oem", "spare parts"],
                },
            ],
        },
        {
            id: "staff-users",
            title: "USERS & MANAGEMENT",
            shortTitle: "Users & Staff",
            accentColor: "#8b5cf6", // Purple / Indigo like the screenshot
            iconColor: "#a78bfa",
            items: [
                {
                    id: "users-portal",
                    title: "USERS LIST",
                    href: "/admin/users",
                    icon: Users,
                    tags: ["users", "clients", "dealers", "staff portal"],
                },
                {
                    id: "pending-approvals",
                    title: "PENDING APPROVALS",
                    href: "/admin/users?status=PENDING",
                    icon: UserCheck,
                    tags: ["pending approvals", "kyc", "new registrations"],
                },
                {
                    id: "social-showcase",
                    title: "SOCIAL SHOWCASE",
                    href: "/admin/posts",
                    icon: ImageIcon,
                    tags: ["posts", "gallery", "social showcase", "photos"],
                },
                {
                    id: "shop-management",
                    title: "MULTI-SHOP",
                    href: "/admin/shops",
                    icon: Building2,
                    tags: ["shops", "franchise", "multi shop", "branches"],
                },
                {
                    id: "notifications-hub",
                    title: "NOTIFICATIONS",
                    href: "/admin/notifications",
                    icon: Bell,
                    tags: ["notifications", "alerts", "live notifications"],
                },
            ],
        },
        {
            id: "system-settings",
            title: "SETTINGS & INTEGRATIONS",
            shortTitle: "Settings & Config",
            accentColor: "#f59e0b", // Amber
            iconColor: "#fbbf24",
            items: [
                {
                    id: "settings-general",
                    title: "GENERAL SETTINGS",
                    href: "/admin/settings",
                    icon: Settings,
                    tags: ["settings", "company info", "studio settings"],
                },
                {
                    id: "settings-otp",
                    title: "OTP GATEWAY",
                    href: "/admin/settings/otp",
                    icon: Smartphone,
                    tags: ["otp", "sms", "fast2sms", "whatsapp"],
                },
                {
                    id: "settings-payment-gateway",
                    title: "PAYMENT GATEWAY",
                    href: "/admin/settings/payment",
                    icon: CreditCard,
                    tags: ["payment settings", "razorpay key", "gateway"],
                },
                {
                    id: "settings-google-reviews",
                    title: "GOOGLE REVIEWS",
                    href: "/admin/settings/google-reviews",
                    icon: Star,
                    tags: ["google reviews", "places api", "ratings sync"],
                },
                {
                    id: "settings-facebook",
                    title: "FACEBOOK SYNC",
                    href: "/admin/settings/facebook",
                    icon: Share2,
                    tags: ["facebook", "meta", "feed sync"],
                },
                {
                    id: "settings-ai",
                    title: "AI ASSISTANT",
                    href: "/admin/settings/ai",
                    icon: Bot,
                    tags: ["ai", "gemini", "assistant", "smart reply"],
                },
                {
                    id: "settings-smtp",
                    title: "SMTP MAILER",
                    href: "/admin/settings/smtp",
                    icon: Mail,
                    tags: ["smtp", "email server", "outgoing mail"],
                },
                {
                    id: "settings-header",
                    title: "HEADER MENUS",
                    href: "/admin/settings/header",
                    icon: Sliders,
                    tags: ["header", "navigation", "menu bar"],
                },
                {
                    id: "settings-login-purposes",
                    title: "LOGIN PURPOSES",
                    href: "/admin/settings/login-purposes",
                    icon: Key,
                    tags: ["login purposes", "signup options"],
                },
            ],
        },
        {
            id: "public-portals",
            title: "PUBLIC & CUSTOMER SITES",
            shortTitle: "Public Portals",
            accentColor: "#ec4899", // Rose/Pink
            iconColor: "#f472b6",
            items: [
                {
                    id: "public-home",
                    title: "LIVE SITE",
                    href: "/",
                    icon: Globe,
                    isExternal: true,
                    tags: ["home", "public site", "customer website"],
                },
                {
                    id: "public-cars",
                    title: "CARS MARKETPLACE",
                    href: "/cars",
                    icon: CarFront,
                    isExternal: true,
                    tags: ["cars", "marketplace", "pre-owned cars"],
                },
                {
                    id: "public-bikes",
                    title: "BIKES MARKETPLACE",
                    href: "/bikes",
                    icon: Zap,
                    isExternal: true,
                    tags: ["bikes", "motorcycles", "superbikes"],
                },
                {
                    id: "public-stock",
                    title: "COMPANY STOCK",
                    href: "/company-stock",
                    icon: Boxes,
                    isExternal: true,
                    tags: ["company stock", "certified stock"],
                },
                {
                    id: "public-dealers",
                    title: "DEALER NETWORK",
                    href: "/dealers",
                    icon: Users,
                    isExternal: true,
                    tags: ["dealers", "dealer network", "partners"],
                },
                {
                    id: "public-pdi",
                    title: "CLIENT PDI BOOKING",
                    href: "/pdi",
                    icon: ShieldCheck,
                    isExternal: true,
                    tags: ["client pdi", "customer booking"],
                },
                {
                    id: "public-insurance",
                    title: "INSURANCE CLAIM",
                    href: "/insurance-claim",
                    icon: Shield,
                    isExternal: true,
                    tags: ["insurance claim", "submit claim"],
                },
                {
                    id: "public-feed",
                    title: "SOCIAL FEED",
                    href: "/feed",
                    icon: Share2,
                    isExternal: true,
                    tags: ["feed", "community", "social"],
                },
                {
                    id: "public-shop",
                    title: "ONLINE SHOP",
                    href: "/shop",
                    icon: Store,
                    isExternal: true,
                    tags: ["shop", "store", "products", "diy"],
                },
            ],
        },
    ], [counts])

    // Filter sections based on search and selectedCategory
    const filteredSections = useMemo(() => {
        const q = searchQuery.toLowerCase().trim()

        return sections
            .filter((sec) => {
                if (selectedCategory === "ALL") return true
                return sec.id === selectedCategory
            })
            .map((sec) => {
                if (!q) return sec
                const matchedItems = sec.items.filter(
                    (item) =>
                        item.title.toLowerCase().includes(q) ||
                        item.href.toLowerCase().includes(q) ||
                        item.tags.some((t) => t.toLowerCase().includes(q))
                )
                return {
                    ...sec,
                    items: matchedItems,
                }
            })
            .filter((sec) => sec.items.length > 0)
    }, [sections, searchQuery, selectedCategory])

    const totalPagesCount = useMemo(() => {
        return sections.reduce((acc, sec) => acc + sec.items.length, 0)
    }, [sections])

    const scrollToTopAndFocusSearch = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
        setTimeout(() => {
            searchInputRef.current?.focus()
        }, 200)
    }

    return (
        <div className="space-y-6 sm:space-y-10 min-h-screen bg-[#060813] text-white p-3 sm:p-5 rounded-3xl pb-28 lg:pb-12">
            {/* Top Search & Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-widest text-white flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#16acd4] animate-pulse shrink-0" />
                            <span>SYSTEM PAGES DIRECTORY</span>
                        </h1>
                        <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 uppercase tracking-wider">
                            Direct 1-Click Access To All {totalPagesCount} Modules
                        </p>
                    </div>

                    {/* Mobile quick category button */}
                    <button
                        onClick={() => setMobileDrawerOpen(true)}
                        className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e1327] border border-white/10 text-xs font-bold text-[#16acd4]"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Filter</span>
                    </button>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search any page... (e.g. Invoices, PDI)"
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#0e1327] border border-white/10 text-white placeholder-zinc-500 text-sm sm:text-xs tracking-wider font-medium focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile / Desktop Horizontal Quick Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
                <button
                    onClick={() => setSelectedCategory("ALL")}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                        selectedCategory === "ALL"
                            ? "bg-[#16acd4] text-black border-[#16acd4] shadow-[0_0_15px_rgba(22,172,212,0.35)]"
                            : "bg-[#0c1022] text-zinc-400 border-white/5 hover:border-white/20 hover:text-white"
                    }`}
                >
                    <span>All Pages</span>
                    <span className="text-[10px] opacity-75 font-mono">({totalPagesCount})</span>
                </button>

                {sections.map((sec) => {
                    const isSelected = selectedCategory === sec.id
                    return (
                        <button
                            key={sec.id}
                            onClick={() => setSelectedCategory(sec.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                                isSelected
                                    ? "bg-white/15 text-white border-white/30 shadow-lg"
                                    : "bg-[#0c1022] text-zinc-400 border-white/5 hover:border-white/20 hover:text-white"
                            }`}
                        >
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: sec.accentColor }}
                            />
                            <span>{sec.shortTitle}</span>
                            <span className="text-[10px] opacity-75 font-mono">({sec.items.length})</span>
                        </button>
                    )
                })}
            </div>

            {/* SECTIONS RENDER */}
            {filteredSections.length === 0 ? (
                <div className="text-center py-16 rounded-2xl bg-[#0c1022] border border-white/5">
                    <Search className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-zinc-300">No pages found matching "{searchQuery}"</p>
                    <button
                        onClick={() => {
                            setSearchQuery("")
                            setSelectedCategory("ALL")
                        }}
                        className="mt-3 px-4 py-2 rounded-lg text-xs font-bold bg-[#16acd4] text-black"
                    >
                        Reset Filter & Show All
                    </button>
                </div>
            ) : (
                <div className="space-y-8 sm:space-y-10">
                    {filteredSections.map((sec) => (
                        <div key={sec.id} className="space-y-3.5 sm:space-y-4">
                            {/* Section Header with exact colored vertical bar */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="w-1.5 h-5 rounded-full inline-block shrink-0"
                                        style={{ backgroundColor: sec.accentColor }}
                                    />
                                    <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-white">
                                        {sec.title}
                                    </h2>
                                </div>

                                {selectedCategory !== "ALL" && (
                                    <button
                                        onClick={() => setSelectedCategory("ALL")}
                                        className="text-[11px] font-bold text-zinc-400 hover:text-[#16acd4] transition-colors"
                                    >
                                        Show All Sections
                                    </button>
                                )}
                            </div>

                            {/* Exact Grid Boxes matching the user screenshot */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
                                {sec.items.map((item) => {
                                    const IconCmp = item.icon
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            target={item.isExternal ? "_blank" : undefined}
                                            className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border border-white/[0.05] bg-[#0c1022]/90 hover:bg-[#121833] active:scale-95 hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-black/40 min-h-[105px] sm:min-h-[120px] text-center"
                                        >
                                            {/* Top Icon */}
                                            <div
                                                className="mb-2 sm:mb-3 transition-transform duration-200 group-hover:scale-110"
                                                style={{ color: sec.iconColor }}
                                            >
                                                <IconCmp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
                                            </div>

                                            {/* Bottom Title in ALL CAPS */}
                                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors leading-snug line-clamp-2 px-1">
                                                {item.title}
                                            </span>

                                            {/* External icon small corner indicator if external */}
                                            {item.isExternal && (
                                                <ExternalLink className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-3 h-3 text-zinc-600 group-hover:text-zinc-400" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── MOBILE CATEGORIES SLIDE-UP BOTTOM SHEET ── */}
            {mobileDrawerOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setMobileDrawerOpen(false)}
                    />

                    {/* Sheet Content */}
                    <div className="relative z-10 bg-[#0e1327] border-t border-white/10 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4 text-[#16acd4]" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                                    Categories & Menu
                                </h3>
                            </div>
                            <button
                                onClick={() => setMobileDrawerOpen(false)}
                                className="p-1.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Category selection */}
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    setSelectedCategory("ALL")
                                    setMobileDrawerOpen(false)
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                    selectedCategory === "ALL"
                                        ? "bg-[#16acd4]/20 border-[#16acd4] text-white"
                                        : "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/5"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <LayoutGrid className="w-4 h-4 text-[#16acd4]" />
                                    <span className="text-xs font-bold uppercase tracking-wider">All Pages ({totalPagesCount})</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-zinc-500" />
                            </button>

                            {sections.map((sec) => (
                                <button
                                    key={sec.id}
                                    onClick={() => {
                                        setSelectedCategory(sec.id)
                                        setMobileDrawerOpen(false)
                                    }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                        selectedCategory === sec.id
                                            ? "bg-white/10 border-white/30 text-white"
                                            : "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/5"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: sec.accentColor }}
                                        />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-white">
                                                {sec.title}
                                            </p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                                {sec.items.length} pages inside
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                                </button>
                            ))}
                        </div>

                        {/* Quick links to core actions */}
                        <div className="pt-2 border-t border-white/5 flex gap-2">
                            <Link
                                href="/admin"
                                onClick={() => setMobileDrawerOpen(false)}
                                className="flex-1 py-2.5 rounded-xl bg-white/5 text-center text-xs font-bold text-zinc-300 hover:bg-white/10"
                            >
                                Admin Home
                            </Link>
                            <Link
                                href="/"
                                target="_blank"
                                onClick={() => setMobileDrawerOpen(false)}
                                className="flex-1 py-2.5 rounded-xl bg-white/5 text-center text-xs font-bold text-zinc-300 hover:bg-white/10"
                            >
                                View Live Site ↗
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
