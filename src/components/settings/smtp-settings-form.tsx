"use client"

import { useState, useEffect } from "react"
import {
    Mail,
    Server,
    Shield,
    Lock,
    Eye,
    EyeOff,
    Send,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    HelpCircle,
    Sparkles,
    Key,
    User,
    Radio
} from "lucide-react"

interface SMTPSettingsData {
    id?: string
    host: string
    port: string
    username: string
    password?: string
    hasPassword?: boolean
    fromEmail: string
    fromName: string
    encryption: "TLS" | "SSL" | "NONE"
    isActive?: boolean
    updatedAt?: string
}

const PROVIDER_PRESETS = [
    {
        name: "Gmail / Workspace",
        icon: "✉️",
        host: "smtp.gmail.com",
        port: "587",
        encryption: "TLS" as const,
        note: "Requires a 16-character Google App Password (not your normal password)."
    },
    {
        name: "Hostinger Webmail",
        icon: "🌐",
        host: "smtp.hostinger.com",
        port: "465",
        encryption: "SSL" as const,
        note: "Use your full webmail email address and email account password."
    },
    {
        name: "Zoho Mail (India)",
        icon: "🏢",
        host: "smtp.zoho.in",
        port: "465",
        encryption: "SSL" as const,
        note: "Use your Zoho email. If 2FA is on, generate an Application-Specific Password."
    },
    {
        name: "Microsoft 365",
        icon: "💼",
        host: "smtp.office365.com",
        port: "587",
        encryption: "TLS" as const,
        note: "Ensure Authenticated SMTP is enabled on your Microsoft 365 mailbox."
    },
    {
        name: "Custom SMTP",
        icon: "⚙️",
        host: "",
        port: "587",
        encryption: "TLS" as const,
        note: "Enter your private SMTP relay or hosting provider server parameters."
    }
]

export function SMTPSettingsForm({ isShopPortal = true }: { isShopPortal?: boolean }) {
    const [settings, setSettings] = useState<SMTPSettingsData>({
        host: "",
        port: "587",
        username: "",
        password: "",
        fromEmail: "",
        fromName: "Detailing Garage Studio",
        encryption: "TLS",
    })
    const [hasExistingPassword, setHasExistingPassword] = useState(false)
    const [isConfigured, setIsConfigured] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
    const [saveError, setSaveError] = useState<string | null>(null)

    // Test email state
    const [testEmail, setTestEmail] = useState("")
    const [testing, setTesting] = useState(false)
    const [testSuccess, setTestSuccess] = useState<string | null>(null)
    const [testError, setTestError] = useState<string | null>(null)

    // Preset active note
    const [activePresetNote, setActivePresetNote] = useState<string | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/settings/smtp")
            const data = await res.json()

            if (res.ok && data.settings) {
                const s = data.settings
                setSettings({
                    host: s.host || "",
                    port: (s.port || 587).toString(),
                    username: s.username || "",
                    password: "", // Kept blank on client, existing password is on server
                    fromEmail: s.fromEmail || "",
                    fromName: s.fromName || "Detailing Garage Studio",
                    encryption: s.encryption || "TLS",
                })
                setHasExistingPassword(Boolean(s.hasPassword))
                setIsConfigured(true)
                if (s.updatedAt) setLastUpdated(s.updatedAt)
            } else {
                setIsConfigured(false)
            }
        } catch (error) {
            console.error("Failed to load SMTP settings:", error)
        } finally {
            setLoading(false)
        }
    }

    const applyPreset = (preset: typeof PROVIDER_PRESETS[0]) => {
        setSettings(prev => ({
            ...prev,
            host: preset.host || prev.host,
            port: preset.port,
            encryption: preset.encryption
        }))
        setActivePresetNote(preset.note)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setSaveSuccess(null)
        setSaveError(null)

        try {
            if (!settings.host || !settings.port || !settings.username || !settings.fromEmail || !settings.fromName) {
                throw new Error("Please fill in all required fields (Host, Port, Username, From Email, From Name)")
            }

            if (!settings.password && !hasExistingPassword) {
                throw new Error("SMTP Password is required for email authentication")
            }

            const res = await fetch("/api/settings/smtp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to save SMTP settings")
            }

            setSaveSuccess("SMTP settings saved and activated successfully!")
            setIsConfigured(true)
            setHasExistingPassword(true)
            setSettings(prev => ({ ...prev, password: "" })) // clear plain password from state
            setLastUpdated(new Date().toISOString())
        } catch (err: any) {
            setSaveError(err.message || "Failed to save SMTP settings")
        } finally {
            setSaving(false)
        }
    }

    const handleSendTestEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!testEmail || !testEmail.includes("@")) {
            setTestError("Please enter a valid recipient email address for testing")
            return
        }

        setTesting(true)
        setTestSuccess(null)
        setTestError(null)

        try {
            const res = await fetch("/api/settings/smtp/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: testEmail }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to send test email")
            }

            setTestSuccess(`✅ Success! Test email was successfully delivered to ${testEmail}. Check your inbox.`)
        } catch (err: any) {
            setTestError(err.message || "Error sending test email. Verify your host, port, credentials, and encryption.")
        } finally {
            setTesting(false)
        }
    }

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "-"
        return new Date(dateStr).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading SMTP Settings...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header / Status Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1627] via-[#09101d] to-[#07090d] border border-cyan-500/30 shadow-xl shadow-cyan-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">EMAIL CONFIGURATION</span>
                            {isConfigured ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active & Configured
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    <AlertCircle className="w-3 h-3" />
                                    Not Configured
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white">SMTP Email Server Settings</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Used for delivering insurance claim PDF reports to surveyors, client OTPs, and invoices
                        </p>
                    </div>
                </div>

                {lastUpdated && (
                    <div className="text-[10px] text-zinc-400 bg-white/5 border border-white/10 px-3 py-2 rounded-xl shrink-0">
                        <span className="text-zinc-500 block">LAST UPDATED</span>
                        <span className="font-mono text-white font-bold">{formatDate(lastUpdated)}</span>
                    </div>
                )}
            </div>

            {/* Quick Provider Presets */}
            <div className="p-6 rounded-3xl bg-[#111318] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-white">
                            Quick Provider Presets (Auto Fill)
                        </h3>
                    </div>
                    <span className="text-[10px] text-zinc-400">Click to fill host & port</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {PROVIDER_PRESETS.map((preset) => {
                        const isMatch = settings.host === preset.host && settings.port === preset.port
                        return (
                            <button
                                key={preset.name}
                                type="button"
                                onClick={() => applyPreset(preset)}
                                className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 ${
                                    isMatch
                                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10"
                                        : "bg-white/[0.03] border-white/8 hover:bg-white/[0.06] hover:border-white/20 text-zinc-300"
                                }`}
                            >
                                <span className="text-lg">{preset.icon}</span>
                                <div>
                                    <div className="text-xs font-bold line-clamp-1">{preset.name}</div>
                                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{preset.host ? preset.host : "Manual"}</div>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {activePresetNote && (
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs flex items-center gap-2 animate-in fade-in">
                        <HelpCircle className="w-4 h-4 shrink-0 text-cyan-400" />
                        <span>{activePresetNote}</span>
                    </div>
                )}
            </div>

            {/* Success & Error Banners */}
            {saveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                    <span>{saveSuccess}</span>
                </div>
            )}
            {saveError && (
                <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                    <span>{saveError}</span>
                </div>
            )}

            {/* Main SMTP Configuration Form */}
            <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-[#111318] border border-white/10 space-y-6">
                <div className="border-b border-white/10 pb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <Server className="w-4 h-4 text-cyan-400" />
                        Server Connection Details
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Enter your mail delivery host credentials</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                            SMTP Host Server <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <Server className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                required
                                value={settings.host}
                                onChange={(e) => setSettings({ ...settings, host: e.target.value.trim() })}
                                placeholder="smtp.gmail.com / smtp.hostinger.com"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                            />
                        </div>
                        {settings.host && settings.host.includes("@") && (
                            <div className="mt-1.5 flex items-center justify-between text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                                <span>⚠️ Host server address hona chahiye (jaise <code>smtp.gmail.com</code>), email nahi.</span>
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, host: "smtp.gmail.com", port: "587", encryption: "TLS" }))}
                                    className="px-2 py-0.5 rounded bg-amber-400 text-black font-bold text-[10px] hover:bg-amber-300 ml-2 shrink-0"
                                >
                                    Fix to smtp.gmail.com
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                            Port <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            value={settings.port}
                            onChange={(e) => setSettings({ ...settings, port: e.target.value })}
                            placeholder="587"
                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                            Encryption Security
                        </label>
                        <select
                            value={settings.encryption}
                            onChange={(e) => setSettings({ ...settings, encryption: e.target.value as any })}
                            className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-[#171a22] border border-white/10 text-white outline-none cursor-pointer focus:border-cyan-400"
                        >
                            <option value="TLS">TLS (Port 587 - Recommended)</option>
                            <option value="SSL">SSL (Port 465)</option>
                            <option value="NONE">None (Port 25)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                            SMTP Username / Email <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                required
                                value={settings.username}
                                onChange={(e) => setSettings({ ...settings, username: e.target.value.trim() })}
                                placeholder="your-email@gmail.com"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-300">
                                Password / App Password <span className="text-red-400">*</span>
                            </label>
                            {hasExistingPassword && (
                                <span className="text-[9px] text-emerald-400 font-bold">✓ Saved</span>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={settings.password}
                                onChange={(e) => setSettings({ ...settings, password: e.target.value.replace(/\s+/g, '') })}
                                placeholder={hasExistingPassword ? "•••••••••••••••• (Leave blank to keep)" : "Enter SMTP Password"}
                                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 mb-3">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        Sender Identity (From Header)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                                From Email Address <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                required
                                value={settings.fromEmail}
                                onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                                placeholder="claims@detailinggarage.in / noreply@domain.com"
                                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                                From Display Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={settings.fromName}
                                onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                                placeholder="Detailing Garage Workshop"
                                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/25 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Saving Settings...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Save & Activate SMTP</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Test Email Verification Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#111318] border border-white/10 space-y-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <Send className="w-4 h-4 text-emerald-400" />
                        Test Email Delivery
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Send a test email to verify that your SMTP credentials, host connection, and SSL/TLS handshake succeed
                    </p>
                </div>

                {testSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                        <span>{testSuccess}</span>
                    </div>
                )}
                {testError && (
                    <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
                        <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                        <span>{testError}</span>
                    </div>
                )}

                <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="email"
                            required
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="Enter your personal email (e.g. yourname@gmail.com)"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={testing || !isConfigured}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-400 hover:bg-emerald-300 text-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                    >
                        {testing ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Sending Test...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Send Test Email</span>
                            </>
                        )}
                    </button>
                </form>

                {!isConfigured && (
                    <p className="text-[11px] text-amber-400/90 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Save your SMTP settings above before sending a test email.
                    </p>
                )}
            </div>

            {/* Step-by-Step Helper Card */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    How to get SMTP Credentials:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                            <span>Gmail & Google Workspace</span>
                        </div>
                        <ol className="list-decimal list-inside text-zinc-400 text-[11px] space-y-1">
                            <li>Open Google Account &gt; <strong>Security</strong></li>
                            <li>Turn ON <strong>2-Step Verification</strong></li>
                            <li>Search for <strong>App passwords</strong></li>
                            <li>Create app password name: <em>Detailing Garage</em></li>
                            <li>Copy the generated 16-letter code and paste in Password</li>
                        </ol>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                            <span>Hostinger / cPanel Webmail</span>
                        </div>
                        <ol className="list-decimal list-inside text-zinc-400 text-[11px] space-y-1">
                            <li>Host: <code>smtp.hostinger.com</code> or your server IP</li>
                            <li>Port: <code>465</code> (SSL) or <code>587</code> (TLS)</li>
                            <li>Username: Your complete email (e.g. <code>info@yourdomain.com</code>)</li>
                            <li>Password: Your webmail account password</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
}
