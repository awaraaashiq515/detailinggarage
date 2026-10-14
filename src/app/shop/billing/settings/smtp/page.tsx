"use client"

import Link from "next/link"
import { Mail, ChevronRight, Store, ArrowLeft } from "lucide-react"
import { SMTPSettingsForm } from "@/components/settings/smtp-settings-form"

export default function ShopSMTPSettingsPage() {
    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Navigation Breadcrumb */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <Link
                        href="/shop/billing"
                        className="hover:text-white transition-colors flex items-center gap-1.5"
                    >
                        <span>Dashboard</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    <Link
                        href="/shop/billing/profile"
                        className="hover:text-white transition-colors flex items-center gap-1"
                    >
                        <Store className="w-3.5 h-3.5" />
                        <span>Settings</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[#16acd4] font-semibold flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email / SMTP Settings</span>
                    </span>
                </div>

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16acd4]/10 border border-[#16acd4]/20 text-[#16acd4] text-xs font-bold uppercase tracking-wider mb-2">
                            <Mail className="w-3.5 h-3.5" />
                            Email Dispatch Configuration
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                            SMTP &amp; Outgoing Mail Settings
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                            Configure your workshop's email server (Gmail, Hostinger, Zoho, Outlook, or Custom SMTP) to automatically deliver Insurance Claim PDF assessments to Surveyors, customer Invoices, Quotations, and staff notifications.
                        </p>
                    </div>

                    <Link
                        href="/shop/billing/insurance"
                        className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Insurance</span>
                    </Link>
                </div>

                {/* Unified SMTP Settings Form */}
                <SMTPSettingsForm isShopPortal={true} />
            </div>
        </div>
    )
}
