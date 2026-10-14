"use client"

import Link from "next/link"
import { Mail, ChevronRight, Settings } from "lucide-react"
import { SMTPSettingsForm } from "@/components/settings/smtp-settings-form"

export default function AdminSMTPSettingsPage() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Link href="/admin" className="hover:text-white transition-colors">
                    Admin
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                <Link href="/admin/settings" className="hover:text-white transition-colors flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings</span>
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-[#16acd4] font-semibold flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>SMTP Configuration</span>
                </span>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                    SMTP Email Server Configuration
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                    System-wide email server settings for insurance claim PDF dispatch, invoice notifications, customer alerts, and OTPs.
                </p>
            </div>

            {/* Rich SMTP Configuration Form */}
            <SMTPSettingsForm isShopPortal={false} />
        </div>
    )
}
