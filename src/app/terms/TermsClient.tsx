"use client"

import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import HomeFooter from "@/components/home/HomeFooter"
import {
    FileCheck,
    Shield,
    Car,
    Clock,
    Scale,
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    MapPin,
    Mail,
    Phone,
    Printer
} from "lucide-react"

export default function TermsClient() {
    const lastUpdated = "November 12, 2026"

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="min-h-screen bg-[#07090e] text-zinc-200 selection:bg-[#16acd4] selection:text-black antialiased">
            <Navbar />

            {/* Ambient Glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#16acd4]/10 via-[#16acd4]/5 to-transparent blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 pt-28 sm:pt-32 pb-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                            <Link href="/" className="hover:text-[#16acd4] transition-colors flex items-center gap-1.5">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to Home
                            </Link>
                            <span className="text-zinc-600">/</span>
                            <span className="text-zinc-500">Legal</span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-[#16acd4]">Terms of Service</span>
                        </div>

                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all shadow-sm"
                        >
                            <Printer className="w-3.5 h-3.5 text-[#16acd4]" />
                            Print Terms
                        </button>
                    </div>

                    {/* Hero Header */}
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16acd4]/10 border border-[#16acd4]/30 text-[#16acd4] text-xs font-bold tracking-wider uppercase mb-5">
                            <FileCheck className="w-4 h-4" />
                            Official Terms & Conditions
                        </div>
                        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                            These Terms govern your use of services provided by <strong className="text-white">Detailing Garage</strong> across our Mandi studio branches and digital portals.
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 text-xs text-zinc-400">
                            <Clock className="w-3.5 h-3.5 text-[#16acd4]" />
                            Last Revised: <strong className="text-white">{lastUpdated}</strong>
                        </div>
                    </div>

                    {/* Content Cards */}
                    <div className="space-y-8">

                        {/* 1. Acceptance */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10">
                            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-[#16acd4]">1.</span> Acceptance of Terms
                            </h2>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                By booking an appointment, entrusting your vehicle to Detailing Garage (Saulikhad & Gutkar, Mandi), or using our website (<code className="text-[#16acd4] bg-[#16acd4]/10 px-1 rounded">detailinggarage.in</code>), you enter into a legally binding agreement to comply with these Terms of Service.
                            </p>
                        </div>

                        {/* 2. Vehicle Intake & Inspection */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10">
                            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-[#16acd4]">2.</span> Vehicle Intake & Condition Audit
                            </h2>
                            <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                                <p>
                                    Prior to initiating any service (PPF, Ceramic, Detailing, or PDI), a joint digital vehicle intake inspection is performed to record pre-existing defects, rock chips, repainted panels, dents, and paint thickness.
                                </p>
                                <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-400 pl-2">
                                    <li>Detailing Garage is not responsible for damage arising from prior poor-quality resprays, brittle clear coats, or factory paint defects.</li>
                                    <li>Customers must remove all personal valuables, cash, and electronics from the vehicle prior to handing over keys. Detailing Garage is not liable for loose items left inside vehicles.</li>
                                </ul>
                            </div>
                        </div>

                        {/* 3. Pre-Delivery Inspection (PDI) */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10">
                            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-[#16acd4]">3.</span> Pre-Delivery Inspection (PDI) Reports
                            </h2>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                Our PDI audits (for both ICE and EV vehicles) are thorough visual, electronic, and paint-depth assessments based on industry standards. While our technicians exercise maximum diligence, the final acceptance or rejection of a new vehicle from the manufacturer/dealership remains the sole prerogative of the vehicle buyer.
                            </p>
                        </div>

                        {/* 4. Warranties & Maintenance */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10">
                            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-[#16acd4]">4.</span> PPF & Ceramic Coating Warranties
                            </h2>
                            <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
                                <p>
                                    All Ceramic and PPF warranties are subject to manufacturer specifications and adherence to post-care maintenance instructions:
                                </p>
                                <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-400 pl-2">
                                    <li>Avoid washing the vehicle with hard chemicals or automatic abrasive brush car washes for at least 7 days post application to allow curing.</li>
                                    <li>Mandatory periodic inspection/maintenance washes at our studio every 6 to 12 months (as indicated on your digital warranty card) are required to keep warranties valid.</li>
                                    <li>Physical accidents, stone chips puncturing film base, scratches caused by abrasive rubbing, or vandalism are not covered under standard anti-yellowing/anti-bubbling film warranties.</li>
                                </ul>
                            </div>
                        </div>

                        {/* 5. Payments, Deposits & Cancellations */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10">
                            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-[#16acd4]">5.</span> Payments, Invoicing & Cancellations
                            </h2>
                            <div className="text-xs sm:text-sm text-zinc-300 space-y-2 leading-relaxed">
                                <p>
                                    All services must be settled in full upon completion and vehicle inspection before release. Invoices are issued with applicable GST. Booking deposits for scheduled PPF slots may be rescheduled with at least 24 hours advance notice.
                                </p>
                            </div>
                        </div>

                        {/* 6. Jurisdiction */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/10">
                            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-[#16acd4]">6.</span> Governing Law & Jurisdiction
                            </h2>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of services provided by Detailing Garage shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-white">Mandi, Himachal Pradesh, India</strong>.
                            </p>
                        </div>

                        {/* Contact Box */}
                        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-[#16acd4]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-white mb-1">Have questions about our Terms?</h3>
                                <p className="text-xs text-zinc-400">Our customer care team is available to assist you.</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold">
                                <Link href="/privacy-policy" className="text-[#16acd4] hover:underline">
                                    View Privacy Policy
                                </Link>
                                <span className="text-zinc-600">|</span>
                                <a href="mailto:info@detailinggarage.in" className="text-white hover:text-[#16acd4]">
                                    info@detailinggarage.in
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <HomeFooter />
        </div>
    )
}

