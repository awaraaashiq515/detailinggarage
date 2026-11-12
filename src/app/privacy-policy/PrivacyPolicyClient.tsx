"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import HomeFooter from "@/components/home/HomeFooter"
import {
    ShieldCheck,
    Lock,
    Eye,
    FileText,
    Car,
    Camera,
    CreditCard,
    Server,
    UserCheck,
    Bell,
    Mail,
    Phone,
    MapPin,
    Printer,
    ArrowLeft,
    ChevronRight,
    CheckCircle2,
    Clock,
    Scale,
    ExternalLink,
    HelpCircle,
    Copy,
    Check
} from "lucide-react"

export default function PrivacyPolicyClient() {
    const [copiedEmail, setCopiedEmail] = useState(false)
    const [activeSection, setActiveSection] = useState("overview")

    const lastUpdated = "November 12, 2026"
    const effectiveDate = "January 1, 2026"

    const navSections = [
        { id: "overview", label: "1. Overview & Scope", icon: ShieldCheck },
        { id: "collection", label: "2. Information We Collect", icon: FileText },
        { id: "usage", label: "3. How We Use Information", icon: UserCheck },
        { id: "vehicle-media", label: "4. Vehicle Photos & Videos", icon: Camera },
        { id: "sharing", label: "5. Data Sharing & Disclosure", icon: Eye },
        { id: "payments", label: "6. Payments & Billing Security", icon: CreditCard },
        { id: "security", label: "7. Storage & Security", icon: Lock },
        { id: "retention", label: "8. Data Retention", icon: Clock },
        { id: "rights", label: "9. Your Rights & Choices", icon: Scale },
        { id: "cookies", label: "10. Cookies & Web Tracking", icon: Server },
        { id: "grievance", label: "11. Grievance Officer & Contact", icon: Mail },
    ]

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200
            for (const section of navSections) {
                const el = document.getElementById(section.id)
                if (el) {
                    const top = el.offsetTop
                    const height = el.offsetHeight
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(section.id)
                        break
                    }
                }
            }
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleCopyEmail = () => {
        navigator.clipboard.writeText("info@detailinggarage.in")
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2500)
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="min-h-screen bg-[#07090e] text-zinc-200 selection:bg-[#16acd4] selection:text-black antialiased">
            <Navbar />

            {/* Background Subtle Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#16acd4]/12 via-[#16acd4]/5 to-transparent blur-[120px] rounded-full" />
                <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-[#16acd4]/5 blur-[140px] rounded-full" />
            </div>

            {/* Main Content Area */}
            <main className="relative z-10 pt-28 sm:pt-32 pb-20">
                {/* Header Container */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Breadcrumbs & Back */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                            <Link href="/" className="hover:text-[#16acd4] transition-colors flex items-center gap-1.5">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to Home
                            </Link>
                            <span className="text-zinc-600">/</span>
                            <span className="text-zinc-500">Legal</span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-[#16acd4]">Privacy Policy</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all shadow-sm"
                                title="Print or save as PDF"
                            >
                                <Printer className="w-3.5 h-3.5 text-[#16acd4]" />
                                Print Document
                            </button>
                        </div>
                    </div>

                    {/* Hero Title Section */}
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16acd4]/10 border border-[#16acd4]/30 text-[#16acd4] text-xs font-bold tracking-wider uppercase mb-5">
                            <ShieldCheck className="w-4 h-4" />
                            Official Data Protection Policy
                        </div>
                        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                            At <span className="text-white font-semibold">Detailing Garage</span>, we value your trust. This Privacy Policy details how we handle, protect, and process your personal information, vehicle details, inspection reports, and payment transactions across our studio locations in Mandi (HP) and our online platform.
                        </p>

                        {/* Meta Badges */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
                            <span className="px-3 py-1 rounded-md bg-zinc-900/80 border border-white/10 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#16acd4]" />
                                Last Updated: <strong className="text-white">{lastUpdated}</strong>
                            </span>
                            <span className="px-3 py-1 rounded-md bg-zinc-900/80 border border-white/10 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                Effective Date: <strong className="text-white">{effectiveDate}</strong>
                            </span>
                            <span className="px-3 py-1 rounded-md bg-zinc-900/80 border border-white/10 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#16acd4]" />
                                Mandi, Himachal Pradesh, India
                            </span>
                        </div>
                    </div>

                    {/* Key Commitments Highlights Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                        <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                            <div className="w-9 h-9 rounded-lg bg-[#16acd4]/10 flex items-center justify-center text-[#16acd4] mb-3">
                                <Lock className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold text-white mb-1">Encrypted & Secure</h2>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Industry-grade SSL encryption and secure role-based access for your vehicle records and inspection data.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold text-white mb-1">Zero Data Selling</h2>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                We will never sell, rent, or trade your contact info or vehicle details to third-party telemarketers.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3">
                                <Camera className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold text-white mb-1">Number Plate Privacy</h2>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Vehicle plates and personal identifiers are blurred or omitted upon customer request on social media.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3">
                                <Scale className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold text-white mb-1">DPDP & IT Act Compliant</h2>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Formulated in strict accordance with the Digital Personal Data Protection Act and Information Technology Rules.
                            </p>
                        </div>
                    </div>

                    {/* Layout: Sidebar Navigation + Main Document Body */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* Sticky Left Navigation (Desktop) */}
                        <div className="lg:col-span-4 sticky top-28 hidden lg:block">
                            <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 px-2 flex items-center justify-between">
                                    <span>Contents & Quick Jump</span>
                                    <span className="text-[10px] text-[#16acd4] font-normal">11 Sections</span>
                                </div>
                                <nav className="space-y-1">
                                    {navSections.map((sec) => {
                                        const Icon = sec.icon
                                        const isActive = activeSection === sec.id
                                        return (
                                            <a
                                                key={sec.id}
                                                href={`#${sec.id}`}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isActive
                                                        ? "bg-[#16acd4]/15 text-[#16acd4] border border-[#16acd4]/30 font-semibold"
                                                        : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                                                    }`}
                                            >
                                                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-[#16acd4]" : "text-zinc-500"}`} />
                                                <span className="truncate">{sec.label}</span>
                                            </a>
                                        )
                                    })}
                                </nav>

                                <div className="mt-6 pt-5 border-t border-white/10 px-2">
                                    <div className="text-xs font-semibold text-white mb-1">Need Clarification?</div>
                                    <p className="text-[11px] text-zinc-400 mb-3">
                                        Reach our privacy compliance desk directly.
                                    </p>
                                    <a
                                        href="mailto:info@detailinggarage.in"
                                        className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-[#16acd4] hover:bg-[#1397bc] text-black font-bold text-xs transition-colors"
                                    >
                                        <Mail className="w-3.5 h-3.5" />
                                        <span>info@detailinggarage.in</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Horizontal Quick Jump Pills */}
                        <div className="lg:hidden col-span-1 overflow-x-auto pb-2 -mx-4 px-4 flex gap-2 no-scrollbar">
                            {navSections.map((sec) => (
                                <a
                                    key={sec.id}
                                    href={`#${sec.id}`}
                                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:border-[#16acd4]/40"
                                >
                                    {sec.label}
                                </a>
                            ))}
                        </div>

                        {/* Main Document Content */}
                        <div className="lg:col-span-8 space-y-10">

                            {/* Section 1 */}
                            <section id="overview" className="scroll-mt-32 p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#16acd4]/10 flex items-center justify-center text-[#16acd4]">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">
                                        1. Overview & Scope
                                    </h2>
                                </div>
                                <div className="text-xs sm:text-sm text-zinc-300 space-y-3.5 leading-relaxed">
                                    <p>
                                        Welcome to <strong className="text-white">Detailing Garage</strong> (“we”, “us”, “our”, or “Company”). Detailing Garage is a premier auto protection and vehicle aesthetics studio operating in Mandi, Himachal Pradesh, India, with physical studio facilities located at:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                                            <div className="text-xs font-bold text-[#16acd4] uppercase mb-1">Studio Branch 1</div>
                                            <p className="text-xs text-zinc-300">Prime Shine, Saulikhad, Mandi, Himachal Pradesh, India</p>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                                            <div className="text-xs font-bold text-[#16acd4] uppercase mb-1">Studio Branch 2</div>
                                            <p className="text-xs text-zinc-300">Opposite Rani Ki Bain, Gutkar, Mandi, Himachal Pradesh – 175021, India</p>
                                        </div>
                                    </div>
                                    <p>
                                        This Privacy Policy governs your use of our website (<code className="text-[#16acd4] bg-[#16acd4]/10 px-1.5 py-0.5 rounded text-xs">detailinggarage.in</code>), our digital Pre-Delivery Inspection (PDI) portals, vehicle service appointment booking tools, insurance claim consultation utilities, and any services availed physically at our detailing studios.
                                    </p>
                                    <p>
                                        By visiting our website, submitting an inquiry, booking an appointment, or handing over your vehicle for detailing, PPF, ceramic coating, PDI, or insurance claims, you acknowledge and agree to the practices described in this Privacy Policy.
                                    </p>
                                </div>
                            </section>

                            {/* Section 2 */}
                            <section id="collection" className="scroll-mt-32 p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#16acd4]/10 flex items-center justify-center text-[#16acd4]">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">
                                        2. Information We Collect
                                    </h2>
                                </div>
                                <div className="text-xs sm:text-sm text-zinc-300 space-y-4 leading-relaxed">
                                    <p>
                                        To provide our specialized automotive services, we collect information across three main categories:
                                    </p>

                                    {/* Sub-item A */}
                                    <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                                        <div className="flex items-center gap-2 text-white font-semibold text-sm">
                                            <UserCheck className="w-4 h-4 text-[#16acd4]" />
                                            <span>A. Personal & Contact Information</span>
                                        </div>
                                        <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300 pl-2">
                                            <li>Full name and preferred contact title.</li>
                                            <li>Mobile phone number (for WhatsApp updates, SMS confirmations, and OTP verification).</li>
                                            <li>Email address (for digital invoices, warranty certificates, and PDI inspection PDF reports).</li>
                                            <li>Residential or business address (for billing and pick-up/drop-off services when applicable).</li>
                                            <li>Government ID / Driving License (solely when required for insurance claims or test drives).</li>
                                        </ul>
                                    </div>

                                    {/* Sub-item B */}
                                    <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                                        <div className="flex items-center gap-2 text-white font-semibold text-sm">
                                            <Car className="w-4 h-4 text-[#16acd4]" />
                                            <span>B. Vehicle Information & Inspection Records</span>
                                        </div>
                                        <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300 pl-2">
                                            <li>Vehicle registration number (RC plate), chassis number (VIN), and engine number.</li>
                                            <li>Vehicle make, model, variant, manufacturing year, color code, and odometer reading.</li>
                                            <li>Pre-existing paint defects, scratches, swirl marks, panel repaints, or body damages documented during intake inspection.</li>
                                            <li>Paint depth gauge readings (microns/mils) recorded prior to paint correction or PPF application.</li>
                                            <li>Pre-Delivery Inspection (PDI) checklists for ICE and EV vehicles (battery diagnostics, panel gaps, glass etchings, tire codes).</li>
                                        </ul>
                                    </div>

                                    {/* Sub-item C */}
                                    <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                                        <div className="flex items-center gap-2 text-white font-semibold text-sm">
                                            <Server className="w-4 h-4 text-[#16acd4]" />
                                            <span>C. Technical, Browser & Device Information</span>
                                        </div>
                                        <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300 pl-2">
                                            <li>IP address, browser type, device operating system, and approximate geographical location.</li>
                                            <li>Pages visited, time spent on packages or marketplace listings, and referral URLs.</li>
                                            <li>Authentication session cookies and local storage tokens.</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section id="usage" className="scroll-mt-32 p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#16acd4]/10 flex items-center justify-center text-[#16acd4]">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">
                                        3. How We Use Your Information
                                    </h2>
                                </div>
                                <div className="text-xs sm:text-sm text-zinc-300 space-y-3.5 leading-relaxed">
                                    <p>
                                        We collect and process your information strictly for legitimate automotive service execution, legal obligations, and customer experience enhancements:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                        <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-white text-xs block mb-0.5">Service Fulfillment</strong>
                                                <span className="text-xs text-zinc-400">Executing PPF installation, ceramic coatings, deep detailing, and custom maintenance schedules.</span>
                                            </div>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-white text-xs block mb-0.5">Digital PDI Reports</strong>
                                                <span className="text-xs text-zinc-400">Compiling comprehensive multi-point vehicle inspection audits and delivering authentic PDF certifications.</span>
                                            </div>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-white text-xs block mb-0.5">Job Status & WhatsApp Alerts</strong>
                                                <span className="text-xs text-zinc-400">Sending real-time vehicle stage updates, curing status, collection readiness, and digital invoices.</span>
                                            </div>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-white text-xs block mb-0.5">Warranty Verification</strong>
                                                <span className="text-xs text-zinc-400">Maintaining electronic warranty records for 3, 5, or 10-year PPF and Ceramic coating warranties.</span>
                                            </div>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-white text-xs block mb-0.5">Insurance Claim Coordination</strong>
                                                <span className="text-xs text-zinc-400">Assisting in estimation, surveyor inspections, and repair documentation when requested by you.</span>
                                            </div>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-white text-xs block mb-0.5">Statutory & Tax Compliance</strong>
                                                <span className="text-xs text-zinc-400">Generating GST-compliant invoices and retaining transaction audits in accordance with Indian tax laws.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section id="vehicle-media" className="scroll-mt-32 p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#16acd4]/10 flex items-center justify-center text-[#16acd4]">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">
                                        4. Vehicle Photography, Videos & Social Media Policy
                                    </h2>
                                </div>
                                <div className="text-xs sm:text-sm text-zinc-300 space-y-3.5 leading-relaxed">
                                    <p>
                                        As a high-end detailing studio, high-resolution before-and-after photographs, gloss meter readings, and cinematic transformation reels form an integral part of our craft documentation and studio portfolio.
                                    </p>

                                    <div className="p-4 rounded-xl bg-[#16acd4]/10 border border-[#16acd4]/30 space-y-2">
                                        <div className="font-semibold text-white flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-[#16acd4]" />
                                            <span>Your Privacy Rights Concerning Vehicle Media:</span>
                                        </div>
                                        <ul className="list-disc list-inside space-y-1 text-xs text-zinc-300 pl-2">
                                            <li><strong className="text-white">Number Plate Blurring:</strong> By default or upon request, vehicle registration numbers are masked or digitally edited out before publishing promotional content on Instagram, Facebook, or YouTube.</li>
                                            <li><strong className="text-white">Opt-Out Guarantee:</strong> If you do not wish for your vehicle to be featured in public media or reels, inform our studio manager during vehicle intake or drop us a message. We will record a strict "No-Media" flag on your job card.</li>
                                            <li><strong className="text-white">Internal Quality Records:</strong> Internal diagnostic photos (e.g. pre-existing deep scratches or paint damage) are retained securely solely for verification and warranty records.</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 5 */}
                            <section id="sharing" className="scroll-mt-32 p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#16acd4]/10 flex items-center justify-center text-[#16acd4]">
                                        <Eye className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">
                                        5. Data Sharing & Third-Party Disclosure
                                    </h2>
                                </div>
                                <div className="text-xs sm:text-sm text-zinc-300 space-y-3.5 leading-relaxed">
                                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium text-xs flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                        <span>Detailing Garage does NOT sell, rent, monetize, or lease your personal data to external advertisers or brokers.</span>
                                    </div>
                                    <p>We disclose information only to the following trusted entities on a need-to-know basis:</p>
                                    <ul className="space-y-2 text-xs">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#16acd4] font-bold">•</span>
                                            <span><strong className="text-white">Studio Technicians & Supervisors:</strong> Authorized personnel directly servicing or inspecting your vehicle.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#16acd4] font-bold">•</span>
                                            <span><strong className="text-white">Insurance Companies & Loss Assessors:</strong> Shared solely upon your authorization when you engage us for accidental repairs or cashless claim assistance.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#16acd4] font-bold">•</span>
                                            <span><strong className="text-white">Payment & Infrastructure Providers:</strong> Secure payment gateways (e.g., Razorpay), SMS/WhatsApp notification APIs, and encrypted cloud storage hosts operating under strict confidentiality covenants.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#16acd4] font-bold">•</span>
                                            <span><strong className="text-white">Legal & Law Enforcement Bodies:</strong> Disclosed only when legally obligated by Indian judicial orders, subpoenas, or statutory mandates.</span>
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 6 */}
                            <section id="payments" className="scroll-mt-32 p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#16acd4]/10 flex items-center justify-center text-[#16acd4]">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">
                                        6. Payments & Financial Security
                                    </h2>
                                </div>
                                <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                                    <p>
                                        When you make online payments for advance bookings, inspection fees, or detailing packages:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300 pl-2">
                                        <li>Payments are processed through certified, PCI-DSS Level 1 compliant payment gateways (such as <strong className="text-white">Razorpay</strong>), UPI, Net Banking, and authorized POS terminals.</li>
                                        <li><strong className="text-white">No Sensitive Card Storage:</strong> Detailing Garage does <strong className="text-white">not</strong> capture, store, or have access to your full credit/debit card numbers, CVV codes, or net banking passwords.</li>
                                        <li>We store only payment confirmation tokens, transaction reference IDs, amounts paid, date, and payment status for invoicing and accounting purposes.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 7 */}
                            <section id="security" className="scroll-mt-32 p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#16acd4]/10 flex items-center justify-center text-[#16acd4]">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">
                                        7. Storage & Information Security Safeguards
                                    </h2>
                                </div>
                                <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                                    <p>
                                        We implement administrative, technical, and physical security measures in accordance with Rule 8 of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                            <div className="text-xs font-bold text-white mb-1">SSL/TLS Encryption</div>
                                            <p className="text-[11px] text-zinc-400">All browser traffic to our servers is encrypted using 256-bit Secure Socket Layer technology.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                            <div className="text-xs font-bold text-white mb-1">Restricted Access Control</div>
                                            <p className="text-[11px] text-zinc-400">Customer profiles and vehicle records are guarded by strict role-based authentication keys.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                            <div className="text-xs font-bold text-white mb-1">Secure Backup Vaults</div>
                                            <p className="text-[11px] text-zinc-400">Inspection databases and warranty sheets are backed up in isolated, secure cloud environments.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                            <div className="text-xs font-bold text-white mb-1">Physical Studio Security</div>
                                            <p className="text-[11px] text-zinc-400">24/7 CCTV surveillance at both studio branches in Saulikhad and Gutkar to safeguard your vehicles.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 8 */}
                            <section id="retention" className="scroll-mt-32 p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#16acd4]/10 flex items-center justify-center text-[#16acd4]">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">
                                        8. Data Retention Period
                                    </h2>
                                </div>
                                <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                                    <p>We retain your information only as long as necessary for the purposes outlined in this policy:</p>
                                    <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300 pl-2">
                                        <li><strong className="text-white">Active Service & Warranty Records:</strong> Retained for the complete duration of your Ceramic Coating or PPF warranty period (ranging from 1 to 10 years) to honor warranty claims and annual checkups.</li>
                                        <li><strong className="text-white">Tax & Billing Invoices:</strong> Retained for 7 years to comply with statutory GST and Indian Income Tax regulations.</li>
                                        <li><strong className="text-white">PDI Inspection Reports:</strong> Retained digitally for at least 3 years to assist owners during resale or dealer dispute resolution.</li>
                                        <li><strong className="text-white">Non-essential Inquiry Leads:</strong> Automatically purged after 12 months if no service engagement occurs.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 9 */}
                            <section id="rights" className="scroll-mt-32 p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#16acd4]/10 flex items-center justify-center text-[#16acd4]">
                                        <Scale className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">
                                        9. Your Legal Rights & Choices
                                    </h2>
                                </div>
                                <div className="text-xs sm:text-sm text-zinc-300 space-y-3.5 leading-relaxed">
                                    <p>
                                        Under the Digital Personal Data Protection Act (DPDP) and applicable Indian privacy laws, you possess distinct rights regarding your personal information:
                                    </p>
                                    <div className="space-y-2.5">
                                        <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                            <strong className="text-white text-xs block mb-0.5">Right to Access & Review:</strong>
                                            <span className="text-xs text-zinc-400">You may request a copy of all personal details, job cards, and inspection certificates associated with your phone number or vehicle.</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                            <strong className="text-white text-xs block mb-0.5">Right to Correction & Updating:</strong>
                                            <span className="text-xs text-zinc-400">If your vehicle registration, phone number, or address changes, contact us to update your records promptly.</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                            <strong className="text-white text-xs block mb-0.5">Right to Erasure / Account Deletion:</strong>
                                            <span className="text-xs text-zinc-400">You can request erasure of non-statutory personal data, subject to mandatory tax retention guidelines.</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                            <strong className="text-white text-xs block mb-0.5">Marketing Opt-Out:</strong>
                                            <span className="text-xs text-zinc-400">You may unsubscribe from promotional WhatsApp or SMS messages anytime by replying "STOP" or notifying our support.</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 10 */}
                            <section id="cookies" className="scroll-mt-32 p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#16acd4]/10 flex items-center justify-center text-[#16acd4]">
                                        <Server className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">
                                        10. Cookies & Web Tracking Technologies
                                    </h2>
                                </div>
                                <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                                    <p>
                                        Our website uses standard cookies and local storage tokens to deliver a reliable user experience:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300 pl-2">
                                        <li><strong className="text-white">Strictly Necessary Cookies:</strong> Required for user authentication, security verification, and booking workflow state.</li>
                                        <li><strong className="text-white">Performance & Analytics:</strong> Anonymous aggregated metrics to help us optimize page load speed and popular package browsing.</li>
                                        <li><strong className="text-white">Control:</strong> You can manage or disable cookie storage via your browser settings at any time without losing access to basic website features.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 11 */}
                            <section id="grievance" className="scroll-mt-32 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-[#16acd4]/30 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-36 h-36 bg-[#16acd4]/10 rounded-full blur-2xl pointer-events-none" />

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#16acd4]/15 flex items-center justify-center text-[#16acd4]">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">
                                        11. Grievance Officer & Contact Information
                                    </h2>
                                </div>

                                <div className="text-xs sm:text-sm text-zinc-300 space-y-4 leading-relaxed">
                                    <p>
                                        In compliance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, the contact details of our designated Grievance Officer are provided below:
                                    </p>

                                    <div className="p-4 sm:p-5 rounded-xl bg-black/50 border border-white/10 space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">Designated Entity</span>
                                                <strong className="text-white text-sm">Detailing Garage</strong>
                                                <div className="text-xs text-zinc-400 mt-1">Data Privacy & Grievance Cell</div>
                                            </div>

                                            <div>
                                                <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">Response Timeline</span>
                                                <strong className="text-emerald-400 text-sm">Within 48 – 72 Business Hours</strong>
                                                <div className="text-xs text-zinc-400 mt-1">Monday – Saturday, 9:30 AM to 7:00 PM IST</div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900/80 border border-white/5">
                                                <div className="flex items-center gap-2 truncate">
                                                    <Mail className="w-4 h-4 text-[#16acd4] flex-shrink-0" />
                                                    <span className="truncate text-white">info@detailinggarage.in</span>
                                                </div>
                                                <button
                                                    onClick={handleCopyEmail}
                                                    className="p-1 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white"
                                                    title="Copy Email"
                                                >
                                                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>

                                            <a
                                                href="tel:+918679800074"
                                                className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 hover:border-[#16acd4]/30 text-white transition-colors"
                                            >
                                                <Phone className="w-4 h-4 text-[#16acd4] flex-shrink-0" />
                                                <span>+91 86798 00074</span>
                                            </a>
                                        </div>

                                        <div className="pt-2 text-xs text-zinc-400 flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-[#16acd4] flex-shrink-0 mt-0.5" />
                                            <span>
                                                Prime Shine, Saulikhad & Opposite Rani Ki Bain, Gutkar, Mandi, Himachal Pradesh – 175021, India
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-zinc-400">
                                        If you have questions, wish to exercise any privacy rights, or desire to withdraw consent for any vehicle imagery, please email us with your full name, vehicle registration number, and registered contact number.
                                    </p>
                                </div>
                            </section>

                            {/* Additional Help Callout Card */}
                            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-bold text-white mb-1">
                                        Have questions about your vehicle's PDI or PPF warranty?
                                    </h3>
                                    <p className="text-xs text-zinc-400">
                                        Our support staff is ready to assist you directly at our Mandi studio or via WhatsApp.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Link
                                        href="/pdi"
                                        className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors border border-white/10"
                                    >
                                        PDI Inspection
                                    </Link>
                                    <a
                                        href="https://wa.me/918679800074?text=Hi%20Detailing%20Garage,%20I%20have%20a%20query%20regarding%20my%20vehicle%20data%20and%20privacy."
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-[#16acd4] hover:bg-[#1397bc] text-black font-extrabold text-xs transition-all shadow-lg shadow-[#16acd4]/20"
                                    >
                                        Chat on WhatsApp
                                    </a>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <HomeFooter />
        </div>
    )
}

