"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    getAdminHeaderSettings,
    updateHeaderSettings,
    resetHeaderSettings,
    type HeaderSettingsData,
    type NavigationLink,
} from "@/app/actions/header-settings"
import {
    QrCode,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    Smartphone
} from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-1 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                        <Save className="w-5 h-5" />
                    </div>
                    Settings
                </h1>
                <p className="text-sm font-bold text-slate-500 ml-14">Manage system configuration</p>
            </div>

            <Tabs defaultValue="header" className="w-full space-y-6">
                <TabsList className="flex flex-wrap h-auto gap-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-sm justify-start">
                    <TabsTrigger
                        value="header"
                        className="px-6 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white text-slate-600 font-bold tracking-wide transition-all"
                    >
                        Header
                    </TabsTrigger>
                    <TabsTrigger
                        value="system"
                        className="px-6 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white text-slate-600 font-bold tracking-wide transition-all"
                    >
                        System
                    </TabsTrigger>
                    <TabsTrigger
                        value="roles"
                        className="px-6 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white text-slate-600 font-bold tracking-wide transition-all"
                    >
                        Roles
                    </TabsTrigger>
                    <TabsTrigger
                        value="smtp"
                        className="px-6 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white text-slate-600 font-bold tracking-wide transition-all"
                    >
                        SMTP
                    </TabsTrigger>
                    <TabsTrigger
                        value="otp"
                        className="px-6 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white text-slate-600 font-bold tracking-wide transition-all"
                    >
                        OTP
                    </TabsTrigger>
                    <TabsTrigger
                        value="purposes"
                        className="px-6 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white text-slate-600 font-bold tracking-wide transition-all"
                    >
                        Login Purposes
                    </TabsTrigger>
                    <TabsTrigger
                        value="ai"
                        className="px-6 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white text-slate-600 font-bold tracking-wide transition-all"
                    >
                        AI
                    </TabsTrigger>
                    <TabsTrigger
                        value="payment"
                        className="px-6 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white text-slate-600 font-bold tracking-wide transition-all"
                    >
                        Payment
                    </TabsTrigger>
                    <TabsTrigger
                        value="surepass"
                        className="px-6 py-2.5 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white text-slate-600 font-bold tracking-wide transition-all"
                    >
                        Surepass API
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="header" className="animate-in fade-in duration-300">
                    <HeaderSettings />
                </TabsContent>

                <TabsContent value="system" className="animate-in fade-in duration-300">
                    <SystemSettings />
                </TabsContent>

                <TabsContent value="roles" className="animate-in fade-in duration-300">
                    <RoleSettings />
                </TabsContent>

                <TabsContent value="smtp" className="animate-in fade-in duration-300">
                    <SMTPSettings />
                </TabsContent>

                <TabsContent value="otp" className="animate-in fade-in duration-300">
                    <OTPSettings />
                </TabsContent>

                <TabsContent value="purposes" className="animate-in fade-in duration-300">
                    <LoginPurposes />
                </TabsContent>

                <TabsContent value="ai" className="animate-in fade-in duration-300">
                    <AISettingsTab />
                </TabsContent>

                <TabsContent value="payment" className="animate-in fade-in duration-300">
                    <PaymentSettings />
                </TabsContent>

                <TabsContent value="surepass" className="animate-in fade-in duration-300">
                    <SurepassSettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Header Settings Component
function HeaderSettings() {
    const [settings, setSettings] = useState<HeaderSettingsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    async function loadSettings() {
        setIsLoading(true)
        const result = await getAdminHeaderSettings()
        if (result.success && result.data) {
            setSettings(result.data)
        }
        setIsLoading(false)
    }

    async function handleSave() {
        if (!settings) return
        setIsSaving(true)
        const result = await updateHeaderSettings(settings)
        if (result.success && result.data) {
            setSettings(result.data)
            alert("Header settings saved successfully!")
        } else {
            alert(result.error || "Failed to save settings")
        }
        setIsSaving(false)
    }

    async function handleReset() {
        if (!confirm("Reset all header settings to defaults?")) return
        setIsSaving(true)
        const result = await resetHeaderSettings()
        if (result.success && result.data) {
            setSettings(result.data)
            alert("Header settings reset to defaults!")
        }
        setIsSaving(false)
    }

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !settings) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", "branding")

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (res.ok) {
                const data = await res.json()
                setSettings({ ...settings, logoImageUrl: data.url, useLogo: true })
            } else {
                const data = await res.json()
                alert(data.error || "Upload failed")
            }
        } catch (error) {
            console.error("Upload error:", error)
            alert("An error occurred during upload")
        } finally {
            setIsUploading(false)
        }
    }

    function updateNavLink(index: number, field: keyof NavigationLink, value: string | boolean) {
        if (!settings) return
        const updatedLinks = [...settings.navigationLinks]
        updatedLinks[index] = { ...updatedLinks[index], [field]: value }
        setSettings({ ...settings, navigationLinks: updatedLinks })
    }

    function addNavLink() {
        if (!settings) return
        setSettings({
            ...settings,
            navigationLinks: [...settings.navigationLinks, { label: "New Link", href: "/", isExternal: false }],
        })
    }

    function removeNavLink(index: number) {
        if (!settings) return
        setSettings({ ...settings, navigationLinks: settings.navigationLinks.filter((_, i) => i !== index) })
    }

    function moveNavLink(index: number, direction: "up" | "down") {
        if (!settings) return
        const newLinks = [...settings.navigationLinks]
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= newLinks.length) return
        [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]]
        setSettings({ ...settings, navigationLinks: newLinks })
    }

    if (isLoading) {
        return <div className="text-center py-10 text-slate-500 font-bold flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> Loading header settings...</div>
    }

    if (!settings) {
        return <div className="text-center py-10 text-red-500 font-bold shadow-sm bg-white border border-red-100 rounded-2xl w-full">Failed to load settings</div>
    }

    return (
        <div className="space-y-6">
            {/* Preview */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-slate-900 font-black tracking-tight uppercase">Live Preview</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="rounded-2xl p-6 flex items-center justify-between shadow-sm border border-slate-200" style={{ backgroundColor: '#ffffff' }}>
                        {settings.useLogo && settings.logoImageUrl ? (
                            <img src={settings.logoImageUrl} alt="Logo" className="h-8 object-contain" />
                        ) : (
                            <div className="text-[22px] tracking-[3px] font-black uppercase text-slate-900 font-display">
                                {settings.brandName}<span style={{ color: settings.primaryColor }}>{settings.brandNameAccent}</span>
                            </div>
                        )}
                        <div className="flex gap-6">
                            {settings.navigationLinks.slice(0, 4).map((link, i) => (
                                <span key={i} className="text-sm font-bold uppercase tracking-wider" style={{ color: settings.textColor }}>{link.label}</span>
                            ))}
                        </div>
                        <div className="px-5 py-2.5 rounded-xl text-sm font-black text-white uppercase tracking-widest shadow-md hover:-translate-y-0.5 transition-transform" style={{ backgroundColor: settings.primaryColor }}>
                            {settings.ctaButtonText}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Branding */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-slate-900 font-black tracking-tight uppercase">Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center justify-between p-5 border border-slate-200 bg-slate-50 rounded-2xl shadow-inner">
                        <div>
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-1">Use Logo Image</h3>
                            <p className="text-xs font-bold text-slate-500">Toggle between text or logo image</p>
                        </div>
                        <Button
                            variant={settings.useLogo ? "default" : "outline"}
                            onClick={() => setSettings({ ...settings, useLogo: !settings.useLogo })}
                            className={`rounded-xl font-bold uppercase tracking-widest text-xs px-6 py-6 transition-all ${settings.useLogo ? "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/25" : "text-slate-600 border-slate-300 hover:bg-slate-100"}`}
                        >
                            {settings.useLogo ? "Using Logo" : "Using Text"}
                        </Button>
                    </div>
                    {!settings.useLogo ? (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Brand Name</Label>
                                <Input value={settings.brandName} onChange={(e) => setSettings({ ...settings, brandName: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Accent Text</Label>
                                <Input value={settings.brandNameAccent} onChange={(e) => setSettings({ ...settings, brandNameAccent: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Logo Image</Label>
                                <div className="flex items-center gap-6">
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={isUploading}
                                            className="bg-slate-50 border-slate-200 text-slate-700 rounded-xl px-4 py-3 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
                                        />
                                        <p className="text-xs font-bold text-slate-500 mt-2 pl-1">
                                            {isUploading ? <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</span> : "Upload a logo image (PNG, JPG, SVG)"}
                                        </p>
                                    </div>
                                    {settings.logoImageUrl && (
                                        <div className="h-16 w-32 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner">
                                            <img src={settings.logoImageUrl} alt="Preview" className="max-h-12 max-w-full object-contain" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Manual Logo URL</Label>
                                <Input
                                    value={settings.logoImageUrl || ""}
                                    onChange={(e) => setSettings({ ...settings, logoImageUrl: e.target.value })}
                                    placeholder="/branding/logo.png"
                                    className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Colors */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-slate-900 font-black tracking-tight uppercase">Colors</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Primary Color</Label>
                            <div className="flex gap-3">
                                <input type="color" value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="w-14 h-14 rounded-2xl cursor-pointer border-0 p-0 shadow-inner" />
                                <Input value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 flex-1" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Accent Color</Label>
                            <div className="flex gap-3">
                                <input type="color" value={settings.accentColor} onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })} className="w-14 h-14 rounded-2xl cursor-pointer border-0 p-0 shadow-inner" />
                                <Input value={settings.accentColor} onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 flex-1" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Nav Text Color</Label>
                            <div className="flex gap-3">
                                <input type="color" value={settings.textColor} onChange={(e) => setSettings({ ...settings, textColor: e.target.value })} className="w-14 h-14 rounded-2xl cursor-pointer border-0 p-0 shadow-inner" />
                                <Input value={settings.textColor} onChange={(e) => setSettings({ ...settings, textColor: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 flex-1" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Links */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-5">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-900 font-black tracking-tight uppercase">Navigation Links</CardTitle>
                        <Button onClick={addNavLink} variant="outline" size="sm" className="rounded-xl border-accent text-accent hover:bg-accent/5 font-bold uppercase tracking-wider text-xs px-4">
                            + Add Link
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    {settings.navigationLinks.map((link, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-center gap-4 p-5 border border-slate-200 bg-slate-50 rounded-2xl shadow-sm transition-all hover:border-slate-300 group">
                            <div className="flex flex-row sm:flex-col gap-1 w-full sm:w-auto justify-between sm:justify-start">
                                <Button variant="ghost" size="sm" onClick={() => moveNavLink(index, "up")} disabled={index === 0} className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200">↑</Button>
                                <Button variant="ghost" size="sm" onClick={() => moveNavLink(index, "down")} disabled={index === settings.navigationLinks.length - 1} className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200">↓</Button>
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <Input value={link.label} onChange={(e) => updateNavLink(index, "label", e.target.value)} placeholder="Label" className="bg-white border-slate-200 text-slate-900 rounded-xl px-4 py-5 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner" />
                                <Input value={link.href} onChange={(e) => updateNavLink(index, "href", e.target.value)} placeholder="/page or #section" className="bg-white border-slate-200 text-slate-900 rounded-xl px-4 py-5 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner font-mono text-sm" />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <Button 
                                    variant={link.isExternal ? "default" : "outline"} 
                                    size="sm" 
                                    onClick={() => updateNavLink(index, "isExternal", !link.isExternal)} 
                                    className={`rounded-xl font-bold uppercase tracking-widest text-[10px] px-4 py-5 w-24 ${link.isExternal ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 shadow-md" : "text-slate-500 border-slate-300 hover:bg-slate-200"}`}
                                >
                                    {link.isExternal ? "External" : "Internal"}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => removeNavLink(index)} className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 h-10 w-10 p-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Button Labels */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-slate-900 font-black tracking-tight uppercase">Button Labels</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Login Button</Label>
                            <Input value={settings.loginButtonText} onChange={(e) => setSettings({ ...settings, loginButtonText: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Dashboard Button</Label>
                            <Input value={settings.dashboardButtonText} onChange={(e) => setSettings({ ...settings, dashboardButtonText: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">CTA Button Text</Label>
                            <Input value={settings.ctaButtonText} onChange={(e) => setSettings({ ...settings, ctaButtonText: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">CTA Button Link</Label>
                            <Input value={settings.ctaButtonLink} onChange={(e) => setSettings({ ...settings, ctaButtonLink: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 font-mono text-sm" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Site Metadata */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-slate-900 font-black tracking-tight uppercase">Site Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Site Title</Label>
                        <Input value={settings.siteTitle} onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Site Description</Label>
                        <Textarea value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-4 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 min-h-[100px] resize-y" />
                    </div>
                </CardContent>
            </Card>

            {/* Save Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                <Button variant="outline" onClick={handleReset} disabled={isSaving} className="rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-xs border-slate-300 text-slate-600 hover:bg-slate-100 transition-all">
                    Reset Defaults
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-xs bg-accent hover:bg-accent/90 text-white shadow-xl shadow-accent/25 transition-all">
                    {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Header Settings"}
                </Button>
            </div>
        </div>
    )
}

// System Settings Component
function SystemSettings() {
    const [settings, setSettings] = useState({
        packagesEnabled: true,
        autoApproveUsers: false,
        imageWatermarkEnabled: true,
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        try {
            const response = await fetch("/api/settings/system")
            if (response.ok) {
                const data = await response.json()
                if (data.settings) {
                    setSettings(data.settings)
                }
            }
        } catch (error) {
            console.error("Failed to fetch system settings:", error)
        }
    }

    async function handleSave() {
        setIsLoading(true)
        try {
            const response = await fetch("/api/settings/system", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })

            if (response.ok) {
                alert("System settings saved successfully!")
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to save system settings:", error)
            alert("Failed to save settings")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                <CardTitle className="text-slate-900 font-black tracking-tight uppercase">System Configuration</CardTitle>
                <CardDescription className="text-slate-500 font-bold">Manage system-wide settings and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6 pb-6">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-slate-200 bg-slate-50 rounded-2xl shadow-sm gap-4">
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-1.5 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent/80" />
                                Package Requirement for PDI
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xl">
                                When enabled, users must purchase a package before submitting PDI inspection requests
                            </p>
                        </div>
                        <Button
                            variant={settings.packagesEnabled ? "default" : "outline"}
                            onClick={() => setSettings({ ...settings, packagesEnabled: !settings.packagesEnabled })}
                            className={`shrink-0 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 py-5 transition-all w-full sm:w-32 ${settings.packagesEnabled ? "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/25" : "text-slate-600 border-slate-300 hover:bg-slate-100"}`}
                        >
                            {settings.packagesEnabled ? "Required" : "Optional"}
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-slate-200 bg-slate-50 rounded-2xl shadow-sm gap-4">
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-1.5 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                                Auto-Approve New Users
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xl">
                                When enabled, new user registrations are automatically approved without admin review
                            </p>
                        </div>
                        <Button
                            variant={settings.autoApproveUsers ? "default" : "outline"}
                            onClick={() => setSettings({ ...settings, autoApproveUsers: !settings.autoApproveUsers })}
                            className={`shrink-0 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 py-5 transition-all w-full sm:w-36 ${settings.autoApproveUsers ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25" : "text-slate-600 border-slate-300 hover:bg-slate-100"}`}
                        >
                            {settings.autoApproveUsers ? "Auto-Approve" : "Manual"}
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-slate-200 bg-slate-50 rounded-2xl shadow-sm gap-4">
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-1.5 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500/80" />
                                Image Watermark
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xl">
                                When enabled, a camera-style watermark with date, time, and location will be stamped on uploaded images
                            </p>
                        </div>
                        <Button
                            variant={settings.imageWatermarkEnabled ? "default" : "outline"}
                            onClick={() => setSettings({ ...settings, imageWatermarkEnabled: !settings.imageWatermarkEnabled })}
                            className={`shrink-0 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 py-5 transition-all w-full sm:w-32 ${settings.imageWatermarkEnabled ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25" : "text-slate-600 border-slate-300 hover:bg-slate-100"}`}
                        >
                            {settings.imageWatermarkEnabled ? "Enabled" : "Disabled"}
                        </Button>
                    </div>
                </div>

                <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-6 mt-6">
                    <h4 className="font-black text-amber-900 uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Important Workflow Impact
                    </h4>
                    <ul className="text-sm font-semibold text-amber-800/80 space-y-2.5 list-none ml-6 relative">
                        <div className="absolute left-[-16px] top-1.5 bottom-1.5 w-[2px] bg-amber-200 rounded-full" />
                        <li className="relative">
                            <div className="absolute left-[-21px] top-2 w-3 h-[2px] bg-amber-200" />
                            Disabling package requirements will allow users to submit PDI requests without purchasing a package
                        </li>
                        <li className="relative">
                            <div className="absolute left-[-21px] top-2 w-3 h-[2px] bg-amber-200" />
                            Auto-approving users bypasses admin verification and security checks
                        </li>
                        <li className="relative">
                            <div className="absolute left-[-21px] top-2 w-3 h-[2px] bg-amber-200" />
                            Watermark feature uses server resources to process images during upload
                        </li>
                        <li className="relative">
                            <div className="absolute left-[-21px] top-2 w-3 h-[2px] bg-amber-200" />
                            These settings directly affect your business workflow and platform security
                        </li>
                    </ul>
                </div>

                <div className="pt-4">
                    <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto rounded-2xl px-10 py-6 font-black uppercase tracking-widest text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all">
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save System Settings</>}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// SMTP Settings Component
function SMTPSettings() {
    const [settings, setSettings] = useState({
        host: "",
        port: "587",
        username: "",
        password: "",
        fromEmail: "",
        fromName: "",
        encryption: "TLS",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [testEmail, setTestEmail] = useState("")

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        try {
            const response = await fetch("/api/settings/smtp")
            if (response.ok) {
                const data = await response.json()
                if (data.settings) {
                    setSettings(data.settings)
                }
            }
        } catch (error) {
            console.error("Failed to fetch SMTP settings:", error)
        }
    }

    async function handleSave() {
        setIsLoading(true)
        try {
            const response = await fetch("/api/settings/smtp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })

            if (response.ok) {
                alert("SMTP settings saved successfully!")
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to save SMTP settings:", error)
            alert("Failed to save settings")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleTestEmail() {
        if (!testEmail) {
            alert("Please enter an email address")
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch("/api/settings/smtp/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: testEmail }),
            })

            if (response.ok) {
                alert("Test email sent successfully! Check your inbox.")
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to send test email:", error)
            alert("Failed to send test email")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                <CardTitle className="text-slate-900 font-black tracking-tight uppercase">SMTP Configuration</CardTitle>
                <CardDescription className="text-slate-500 font-bold">Configure email server settings for sending notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="host" className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">SMTP Host *</Label>
                        <Input
                            id="host"
                            placeholder="smtp.gmail.com"
                            value={settings.host}
                            onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                            className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="port" className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Port *</Label>
                        <Input
                            id="port"
                            type="number"
                            placeholder="587"
                            value={settings.port}
                            onChange={(e) => setSettings({ ...settings, port: e.target.value })}
                            className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 font-mono"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Username *</Label>
                        <Input
                            id="username"
                            placeholder="your-email@gmail.com"
                            value={settings.username}
                            onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                            className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={settings.password}
                            onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                            className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 font-mono tracking-widest"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="fromEmail" className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">From Email *</Label>
                        <Input
                            id="fromEmail"
                            placeholder="noreply@yourcompany.com"
                            value={settings.fromEmail}
                            onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                            className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fromName" className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">From Name *</Label>
                        <Input
                            id="fromName"
                            placeholder="Your Company"
                            value={settings.fromName}
                            onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                            className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="encryption" className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Encryption</Label>
                    <Select value={settings.encryption} onValueChange={(value: string) => setSettings({ ...settings, encryption: value })}>
                        <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl h-14 px-4 font-bold focus:ring-accent/20 focus:border-accent/40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 rounded-xl shadow-xl">
                            <SelectItem value="TLS" className="font-semibold text-slate-700 focus:bg-slate-50 my-1 cursor-pointer">TLS Encryption (Recommended)</SelectItem>
                            <SelectItem value="SSL" className="font-semibold text-slate-700 focus:bg-slate-50 my-1 cursor-pointer">SSL Encryption</SelectItem>
                            <SelectItem value="NONE" className="font-semibold text-slate-700 focus:bg-slate-50 my-1 cursor-pointer">No Encryption</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-6 mt-6">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-4">Test Email Configuration</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            placeholder="Enter test email address"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="bg-white border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 flex-1"
                        />
                        <Button onClick={handleTestEmail} disabled={isLoading} variant="outline" className="rounded-xl px-8 py-6 font-black uppercase tracking-widest text-[11px] border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 bg-white shadow-sm transition-all h-[50px] shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                            Send Test
                        </Button>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto rounded-2xl px-10 py-6 font-black uppercase tracking-widest text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all">
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save SMTP Settings</>}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// AI Settings Tab Component
function AISettingsTab() {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showApiKey, setShowApiKey] = useState(false)
    const [formData, setFormData] = useState({
        geminiApiKey: '',
        translationEnabled: true
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/settings/ai')
            if (res.ok) {
                const data = await res.json()
                if (data.settings) {
                    setFormData({
                        geminiApiKey: data.settings.geminiApiKey || '',
                        translationEnabled: data.settings.translationEnabled ?? true
                    })
                }
            }
        } catch (error) {
            console.error('Error fetching AI settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch('/api/admin/settings/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                alert('AI settings saved successfully!')
            } else {
                const data = await res.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            alert('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Card className="bg-white border-slate-200 shadow-sm rounded-3xl">
                <CardContent className="py-10 text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    Loading AI settings...
                </CardContent>
            </Card>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                    <CardTitle className="text-slate-900 font-black tracking-tight uppercase">Google Gemini AI Configuration</CardTitle>
                    <CardDescription className="text-slate-500 font-bold">
                        Configure AI-powered translation features using Google Gemini
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 px-6 pb-6">
                    {/* API Key */}
                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Gemini API Key *</Label>
                        <div className="relative">
                            <Input
                                type={showApiKey ? 'text' : 'password'}
                                value={formData.geminiApiKey}
                                onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                                placeholder="Enter your Gemini API key"
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 font-mono tracking-wider pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                            >
                                {showApiKey ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                                )}
                            </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 pl-1 mt-2">
                            Get your API key from{' '}
                            <a
                                href="https://makersuite.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline underline-offset-2"
                            >
                                Google AI Studio
                            </a>
                        </p>
                    </div>

                    {/* Translation Toggle */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-slate-200 bg-slate-50 rounded-2xl shadow-sm gap-4">
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-1.5 flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
                                </div>
                                Enable Translation Feature
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xl">
                                Allow admins to translate Hindi text to English automatically in insurance forms
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant={formData.translationEnabled ? "default" : "outline"}
                            onClick={() => setFormData({ ...formData, translationEnabled: !formData.translationEnabled })}
                            className={`shrink-0 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 py-5 transition-all w-full sm:w-32 ${formData.translationEnabled ? "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/25" : "text-slate-600 border-slate-300 hover:bg-slate-100"}`}
                        >
                            {formData.translationEnabled ? "Enabled" : "Disabled"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Info Box */}
            <div className="bg-blue-50/50 border border-blue-200/60 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-bl-full opacity-50 -mr-10 -mt-10" />
                <h4 className="font-black text-blue-900 uppercase tracking-widest text-xs mb-3 flex items-center gap-2 relative z-10">
                    <Info className="w-4 h-4 text-blue-600" />
                    How AI Translation Works
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 text-sm font-semibold text-blue-800/80 mt-4">
                    <div className="flex items-start gap-3 bg-white/60 p-3 rounded-xl border border-white">
                        <div className="mt-0.5 p-1 bg-blue-100 rounded text-blue-600 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                        <span>Translates Hindi damage descriptions to English automatically</span>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 p-3 rounded-xl border border-white">
                        <div className="mt-0.5 p-1 bg-blue-100 rounded text-blue-600 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                        <span>Uses state-of-the-art Google Gemini AI for highly accurate translations</span>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 p-3 rounded-xl border border-white">
                        <div className="mt-0.5 p-1 bg-blue-100 rounded text-blue-600 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                        <span>Available directly in insurance claim forms with a single click</span>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 p-3 rounded-xl border border-white">
                        <div className="mt-0.5 p-1 bg-blue-100 rounded text-blue-600 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                        <span>Significantly helps streamline claim processing and documentation workflows</span>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving} className="w-full sm:w-auto rounded-2xl px-10 py-6 font-black uppercase tracking-widest text-xs bg-accent hover:bg-accent/90 text-white shadow-xl shadow-accent/25 transition-all">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save AI Settings</>}
                </Button>
            </div>
        </form>
    )
}

// OTP Settings Component
function OTPSettings() {
    const [settings, setSettings] = useState({
        emailOTPEnabled: true,
        mobileOTPEnabled: false,
        otpExpiryMinutes: 10,
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        try {
            const response = await fetch("/api/settings/otp")
            if (response.ok) {
                const data = await response.json()
                if (data.settings) {
                    setSettings(data.settings)
                }
            }
        } catch (error) {
            console.error("Failed to fetch OTP settings:", error)
        }
    }

    async function handleSave() {
        setIsLoading(true)
        try {
            const response = await fetch("/api/settings/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })

            if (response.ok) {
                alert("OTP settings saved successfully!")
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to save OTP settings:", error)
            alert("Failed to save settings")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                <CardTitle className="text-slate-900 font-black tracking-tight uppercase">OTP Verification Settings</CardTitle>
                <CardDescription className="text-slate-500 font-bold">Control OTP verification requirements for new registrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6 pb-6">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-slate-200 bg-slate-50 rounded-2xl shadow-sm gap-4 hover:border-slate-300 transition-colors">
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-1.5 flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                </div>
                                Email OTP Verification
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xl">Require email verification during registration to ensure valid contact addresses</p>
                        </div>
                        <Button
                            variant={settings.emailOTPEnabled ? "default" : "outline"}
                            onClick={() => setSettings({ ...settings, emailOTPEnabled: !settings.emailOTPEnabled })}
                            className={`shrink-0 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 py-5 transition-all w-full sm:w-32 ${settings.emailOTPEnabled ? "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/25" : "text-slate-600 border-slate-300 hover:bg-slate-100"}`}
                        >
                            {settings.emailOTPEnabled ? "Enabled" : "Disabled"}
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-slate-200 bg-slate-50 rounded-2xl shadow-sm gap-4 hover:border-slate-300 transition-colors">
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-1.5 flex items-center gap-2">
                                <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                                </div>
                                Mobile OTP Verification
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xl">Require SMS verification during registration to ensure authentic users</p>
                        </div>
                        <Button
                            variant={settings.mobileOTPEnabled ? "default" : "outline"}
                            onClick={() => setSettings({ ...settings, mobileOTPEnabled: !settings.mobileOTPEnabled })}
                            className={`shrink-0 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 py-5 transition-all w-full sm:w-32 ${settings.mobileOTPEnabled ? "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/25" : "text-slate-600 border-slate-300 hover:bg-slate-100"}`}
                        >
                            {settings.mobileOTPEnabled ? "Enabled" : "Disabled"}
                        </Button>
                    </div>

                    <div className="p-5 border border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                        <div className="flex-1">
                            <Label htmlFor="expiry" className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-1.5 block flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                OTP Expiry Time (minutes)
                            </Label>
                            <p className="text-xs font-semibold text-slate-500">How long an OTP code remains valid before it expires</p>
                        </div>
                        <Input
                            id="expiry"
                            type="number"
                            min="1"
                            max="60"
                            value={settings.otpExpiryMinutes}
                            onChange={(e) => setSettings({ ...settings, otpExpiryMinutes: parseInt(e.target.value) || 5 })}
                            className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-black text-lg focus-visible:ring-accent/20 focus-visible:border-accent/40 font-mono w-full sm:w-32 text-center"
                        />
                    </div>
                </div>

                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 mt-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200 rounded-bl-full opacity-50 -mr-10 -mt-10" />
                    <h4 className="font-black text-slate-700 uppercase tracking-widest text-xs mb-3 flex items-center gap-2 relative z-10">
                        <Info className="w-4 h-4 text-slate-500" />
                        Verification Logic Summary
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 mt-4">
                        <div className="flex items-start gap-2.5 p-3 bg-white/60 rounded-xl border border-white">
                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${settings.emailOTPEnabled ? 'bg-accent' : 'bg-slate-300'}`} />
                            <div className="text-xs font-bold text-slate-600">
                                <span className={settings.emailOTPEnabled ? "text-slate-900 font-black" : "text-slate-400"}>Email OTP:</span> {settings.emailOTPEnabled ? 'Will be required during sign up.' : 'Skipped during sign up.'}
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5 p-3 bg-white/60 rounded-xl border border-white">
                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${settings.mobileOTPEnabled ? 'bg-accent' : 'bg-slate-300'}`} />
                            <div className="text-xs font-bold text-slate-600">
                                <span className={settings.mobileOTPEnabled ? "text-slate-900 font-black" : "text-slate-400"}>Mobile OTP:</span> {settings.mobileOTPEnabled ? 'Will be required during sign up.' : 'Skipped during sign up.'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto rounded-2xl px-10 py-6 font-black uppercase tracking-widest text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all">
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save OTP Settings</>}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Login Purposes Component
function LoginPurposes() {
    const [purposes, setPurposes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [newPurpose, setNewPurpose] = useState({ name: "", description: "" })
    const [showAddForm, setShowAddForm] = useState(false)

    useEffect(() => {
        fetchPurposes()
    }, [])

    async function fetchPurposes() {
        try {
            const response = await fetch("/api/admin/login-purposes")
            if (response.ok) {
                const data = await response.json()
                setPurposes(data.purposes || [])
            }
        } catch (error) {
            console.error("Failed to fetch login purposes:", error)
        }
    }

    async function handleAdd() {
        if (!newPurpose.name) {
            alert("Please enter a purpose name")
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch("/api/admin/login-purposes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPurpose),
            })

            if (response.ok) {
                alert("Login purpose added successfully!")
                setNewPurpose({ name: "", description: "" })
                setShowAddForm(false)
                fetchPurposes()
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to add login purpose:", error)
            alert("Failed to add login purpose")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this login purpose?")) return

        try {
            const response = await fetch(`/api/admin/login-purposes?id=${id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                alert("Login purpose deleted successfully!")
                fetchPurposes()
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to delete login purpose:", error)
            alert("Failed to delete login purpose")
        }
    }

    async function toggleActive(id: string, isActive: boolean) {
        try {
            const response = await fetch("/api/admin/login-purposes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isActive: !isActive }),
            })

            if (response.ok) {
                fetchPurposes()
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to update login purpose:", error)
        }
    }

    return (
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-slate-900 font-black tracking-tight uppercase mb-1">Login Purposes</CardTitle>
                    <CardDescription className="text-slate-500 font-bold">Manage available login purposes for user registration</CardDescription>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)} className={`rounded-xl font-black uppercase tracking-widest text-[11px] px-6 py-5 transition-all shadow-md hover:-translate-y-0.5 ${showAddForm ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-accent hover:bg-accent/90 text-white shadow-accent/25"}`}>
                    {showAddForm ? "Cancel" : "+ Add Purpose"}
                </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6 pb-6">
                {showAddForm && (
                    <div className="border border-accent/20 rounded-2xl p-6 space-y-5 bg-accent/5 shadow-inner">
                        <div className="space-y-2">
                            <Label htmlFor="purposeName" className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Purpose Name *</Label>
                            <Input
                                id="purposeName"
                                placeholder="e.g., Business Partnership"
                                value={newPurpose.name}
                                onChange={(e) => setNewPurpose({ ...newPurpose, name: e.target.value })}
                                className="bg-white border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="purposeDesc" className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Description (Optional)</Label>
                            <Input
                                id="purposeDesc"
                                placeholder="Briefly describe what this purpose implies"
                                value={newPurpose.description}
                                onChange={(e) => setNewPurpose({ ...newPurpose, description: e.target.value })}
                                className="bg-white border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40"
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={isLoading} className="w-full rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all mt-2">
                            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</> : "Add Login Purpose"}
                        </Button>
                    </div>
                )}

                <div className="space-y-2">
                    {purposes.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No login purposes configured</p>
                            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">Users will not be asked for their purpose during registration until you add some options here.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {purposes.map((purpose) => (
                                <div key={purpose.id} className="flex flex-col sm:flex-row items-start justify-between p-5 border border-slate-200 bg-slate-50 rounded-2xl shadow-sm hover:border-slate-300 transition-colors gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <div className={`w-2 h-2 rounded-full ${purpose.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                            <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm">{purpose.name}</h3>
                                        </div>
                                        {purpose.description && (
                                            <p className="text-xs font-semibold text-slate-500 ml-5">{purpose.description}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 ml-5 sm:ml-0">
                                        <Button
                                            size="sm"
                                            variant={purpose.isActive ? "default" : "outline"}
                                            onClick={() => toggleActive(purpose.id, purpose.isActive)}
                                            className={`rounded-xl font-bold uppercase tracking-wider text-[10px] w-24 h-9 ${purpose.isActive ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 shadow-md" : "text-slate-500 border-slate-300 hover:bg-slate-200"}`}
                                        >
                                            {purpose.isActive ? "Active" : "Inactive"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(purpose.id)}
                                            className="rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-red-50 hover:text-red-700 bg-transparent text-slate-400 border border-transparent hover:border-red-200 h-9 px-4"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// Role-Based Access Control Component
function RoleSettings() {
    const roles = ["ADMIN", "CLIENT", "DEALER", "AGENT"]
    const permissionKeys = [
        { key: "DASHBOARD_VIEW", label: "View Dashboard" },
        { key: "USERS_MANAGE", label: "Manage Users" },
        { key: "PDI_REQUESTS_VIEW", label: "View PDI Requests" },
        { key: "PDI_INSPECTION_MANAGE", label: "Manage PDI Inspections" },
        { key: "INSURANCE_MANAGE", label: "Manage Insurance" },
        { key: "PACKAGES_MANAGE", label: "Manage Packages" },
        { key: "SETTINGS_MANAGE", label: "Manage Settings" },
    ]

    const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchRolePermissions()
    }, [])

    async function fetchRolePermissions() {
        try {
            const response = await fetch("/api/settings/roles")
            if (response.ok) {
                const data = await response.json()
                const formatted: Record<string, string[]> = {}
                roles.forEach(role => formatted[role] = [])
                data.permissions.forEach((rp: any) => {
                    formatted[rp.role] = JSON.parse(rp.permissions)
                })
                setRolePermissions(formatted)
            }
        } catch (error) {
            console.error("Failed to fetch role permissions:", error)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSave() {
        setIsSaving(true)
        try {
            const promises = Object.entries(rolePermissions).map(([role, permissions]) =>
                fetch("/api/settings/roles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role, permissions })
                })
            )
            await Promise.all(promises)
            alert("Role permissions saved successfully!")
        } catch (error) {
            console.error("Failed to save role permissions:", error)
            alert("Failed to save role permissions")
        } finally {
            setIsSaving(false)
        }
    }

    const togglePermission = (role: string, perm: string) => {
        setRolePermissions(prev => {
            const current = prev[role] || []
            const updated = current.includes(perm)
                ? current.filter(p => p !== perm)
                : [...current, perm]
            return { ...prev, [role]: updated }
        })
    }

    if (isLoading) return <div className="text-center py-10 text-slate-500 font-bold flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> Loading permissions...</div>

    return (
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                <CardTitle className="text-slate-900 font-black tracking-tight uppercase">Role Permissions</CardTitle>
                <CardDescription className="text-slate-500 font-bold">Control access levels for each user role</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-0 pb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
                            <tr className="border-b border-slate-200">
                                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest w-1/3">Permission Context</th>
                                {roles.map(role => (
                                    <th key={role} className="p-5 text-xs font-black text-slate-900 uppercase tracking-widest text-center whitespace-nowrap">
                                        <div className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg inline-block">
                                            {role}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {permissionKeys.map(({ key, label }, index) => (
                                <tr key={key} className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                    <td className="p-5 text-sm text-slate-700 font-bold">{label}</td>
                                    {roles.map(role => (
                                        <td key={role} className="p-5 text-center">
                                            <div className="flex justify-center">
                                                <label className="relative flex items-center p-2 rounded-full cursor-pointer select-none hover:bg-slate-100 transition-colors group">
                                                    <input
                                                        type="checkbox"
                                                        checked={rolePermissions[role]?.includes(key)}
                                                        onChange={() => togglePermission(role, key)}
                                                        className="peer relative appearance-none w-5 h-5 border border-slate-300 rounded-[6px] bg-white text-accent focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-1 checked:bg-accent checked:border-accent transition-all cursor-pointer"
                                                    />
                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                                        </svg>
                                                    </div>
                                                </label>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 px-6 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto rounded-2xl px-10 py-6 font-black uppercase tracking-widest text-xs bg-accent hover:bg-accent/90 text-white shadow-xl shadow-accent/25 transition-all">
                        {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Role Permissions</>}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Payment Settings Component
function PaymentSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

    const [upiId, setUpiId] = useState("")
    const [upiName, setUpiName] = useState("")
    const [isActive, setIsActive] = useState(true)
    const [qrCodePath, setQrCodePath] = useState<string | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings/payment")
            if (res.ok) {
                const data = await res.json()
                if (data.settings) {
                    setUpiId(data.settings.upiId || "")
                    setUpiName(data.settings.upiName || "Dealer Package Payment")
                    setIsActive(data.settings.isActive)
                    setQrCodePath(data.settings.qrCodePath)
                }
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch("/api/admin/settings/payment", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ upiId, upiName, isActive }),
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: "success", text: "Payment settings updated successfully!" })
                setQrCodePath(data.settings.qrCodePath)
            } else {
                throw new Error(data.error || "Failed to update settings")
            }
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Failed to save settings" })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="text-center py-20 text-slate-500 font-bold flex items-center justify-center gap-3"><Loader2 className="w-6 h-6 animate-spin text-accent" /> Loading payment settings...</div>
    }

    return (
        <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                        <CardTitle className="text-slate-900 font-black tracking-tight uppercase">UPI Configuration</CardTitle>
                        <CardDescription className="text-slate-500 font-bold">
                            Configure UPI details used for dealer package subscriptions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="upiId" className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">UPI ID *</Label>
                                    <Input
                                        id="upiId"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="e.g. 9876543210@paytm"
                                        className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 font-mono tracking-wider"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="upiName" className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Payee Name *</Label>
                                    <Input
                                        id="upiName"
                                        value={upiName}
                                        onChange={(e) => setUpiName(e.target.value)}
                                        placeholder="e.g. The Garage Services"
                                        className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-slate-200 bg-slate-50 rounded-2xl shadow-sm gap-4 hover:border-slate-300 transition-colors">
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-1.5 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-accent/80" />
                                        Accept UPI Payments
                                    </h3>
                                    <p className="text-xs font-semibold text-slate-500">Enable or disable UPI payment option for dealers</p>
                                </div>
                                <Button
                                    type="button"
                                    variant={isActive ? "default" : "outline"}
                                    onClick={() => setIsActive(!isActive)}
                                    className={`shrink-0 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 py-5 transition-all w-full sm:w-32 ${isActive ? "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/25" : "text-slate-600 border-slate-300 hover:bg-slate-100"}`}
                                >
                                    {isActive ? "Approve" : "Disabled"}
                                </Button>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${message.type === "success"
                                    ? "bg-emerald-50/80 border-emerald-200/60 text-emerald-700"
                                    : "bg-red-50/80 border-red-200/60 text-red-700"
                                    }`}>
                                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                                    <span className="text-xs font-bold uppercase tracking-wider">{message.text}</span>
                                </div>
                            )}

                            <div className="pt-2 flex justify-end">
                                <Button type="submit" disabled={saving} className="w-full sm:w-auto rounded-2xl px-10 py-6 font-black uppercase tracking-widest text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all">
                                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Payment Settings</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* QR Preview Section */}
                <Card className="bg-slate-50 border-slate-200 shadow-sm rounded-3xl h-fit sticky top-6 overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100 p-6">
                        <CardTitle className="text-slate-900 font-black tracking-tight uppercase flex items-center gap-2 text-sm">
                            <QrCode className="w-5 h-5 text-accent" /> QR Code Preview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6 px-6">
                        <div className="bg-white border-2 border-dashed border-slate-200 p-6 rounded-2xl aspect-square flex items-center justify-center shadow-sm relative group overflow-hidden">
                            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            {qrCodePath ? (
                                <img
                                    src={qrCodePath}
                                    alt="Generated UPI QR Code"
                                    className="max-w-full h-auto rounded-xl relative z-10 transition-transform group-hover:scale-105 duration-500"
                                />
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-full inline-block">
                                        <QrCode className="w-12 h-12 text-slate-300 mx-auto" strokeWidth={1.5} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No QR Generated</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent" /> Active UPI ID
                                </div>
                                <div className="text-sm font-bold text-slate-800 truncate">{upiId || "Not Set"}</div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-blue-800/80 font-bold uppercase tracking-wider leading-relaxed">
                                    Changing the UPI ID or Payee Name automatically updates the QR code on dealer checkout pages.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// ── Surepass API Settings Component ──────────────────────────────────────────
function SurepassSettingsTab() {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [switchingMode, setSwitchingMode] = useState(false)
    const [showToken, setShowToken] = useState(false)
    const [hasToken, setHasToken] = useState(false)
    const [maskedToken, setMaskedToken] = useState('')
    const [newToken, setNewToken] = useState('')
    const [mode, setMode] = useState<'sandbox' | 'live'>('sandbox')
    const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

    useEffect(() => { fetchSettings() }, [])

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/settings/surepass')
            if (res.ok) {
                const data = await res.json()
                if (data.settings) {
                    setHasToken(data.settings.hasToken)
                    setMaskedToken(data.settings.apiToken || '')
                    setMode(data.settings.mode === 'live' ? 'live' : 'sandbox')
                }
            }
        } catch (err) {
            console.error('Error fetching Surepass settings:', err)
        } finally {
            setLoading(false)
        }
    }

    // Switch mode instantly (no token change needed)
    const handleSwitchMode = async (newMode: 'sandbox' | 'live') => {
        if (!hasToken) {
            setStatus({ type: 'error', msg: 'Please save an API token first before switching to live mode.' })
            return
        }
        setSwitchingMode(true)
        setStatus(null)
        try {
            const res = await fetch('/api/admin/settings/surepass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: newMode }),
            })
            if (res.ok) {
                setMode(newMode)
                setStatus({
                    type: 'success',
                    msg: `Switched to ${newMode === 'live' ? '🟢 Live' : '🔵 Sandbox'} mode successfully!`,
                })
            } else {
                const data = await res.json()
                setStatus({ type: 'error', msg: data.error || 'Failed to switch mode' })
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Network error. Please try again.' })
        } finally {
            setSwitchingMode(false)
        }
    }

    // Save token (optionally also sets mode)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newToken.trim()) {
            setStatus({ type: 'error', msg: 'Please enter an API token' })
            return
        }
        setSaving(true)
        setStatus(null)
        try {
            const res = await fetch('/api/admin/settings/surepass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiToken: newToken.trim(), mode }),
            })
            if (res.ok) {
                setStatus({ type: 'success', msg: 'API token saved successfully!' })
                setNewToken('')
                setShowToken(false)
                fetchSettings()
            } else {
                const data = await res.json()
                setStatus({ type: 'error', msg: data.error || 'Failed to save token' })
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Network error. Please try again.' })
        } finally {
            setSaving(false)
        }
    }

    const sandboxUrl = 'https://sandbox.surepass.io/api/v1/rc/rc-related/challan-details'
    const liveUrl = 'https://api.surepass.io/api/v1/rc/rc-related/challan-details'

    if (loading) {
        return (
            <Card className="bg-white border-slate-200 shadow-sm rounded-3xl">
                <CardContent className="py-10 text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    Loading Surepass settings...
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* ── Mode Switcher Card ── */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                    <CardTitle className="text-slate-900 font-black tracking-tight uppercase flex items-center gap-3">
                        API Mode
                        <span
                            className="text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                            style={{
                                background: mode === 'live'
                                    ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                color: mode === 'live' ? '#059669' : '#2563eb',
                                border: `1px solid ${mode === 'live' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                            }}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${mode === 'live' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            {mode === 'live' ? 'LIVE' : 'SANDBOX'}
                        </span>
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-bold">
                        Toggle between the Surepass sandbox (testing) and live (production) endpoints
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6 px-6">
                    {/* Toggle buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => handleSwitchMode('sandbox')}
                            disabled={switchingMode || mode === 'sandbox'}
                            className={`relative flex flex-col items-start gap-2 p-5 rounded-2xl border-2 transition-all text-left ${
                                mode === 'sandbox' 
                                ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            style={{ opacity: switchingMode ? 0.7 : 1 }}
                        >
                            <div className="flex items-center gap-2 w-full">
                                <div className={`w-2 h-2 rounded-full ${mode === 'sandbox' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                                <span className={`text-sm font-black uppercase tracking-wider ${mode === 'sandbox' ? 'text-blue-900' : 'text-slate-700'}`}>Sandbox</span>
                                {mode === 'sandbox' && (
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-blue-500 text-white ml-auto shadow-sm">ACTIVE</span>
                                )}
                            </div>
                            <span className={`text-xs font-semibold ${mode === 'sandbox' ? 'text-blue-700' : 'text-slate-500'}`}>
                                sandbox.surepass.io — for testing only, no real charges
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSwitchMode('live')}
                            disabled={switchingMode || mode === 'live'}
                            className={`relative flex flex-col items-start gap-2 p-5 rounded-2xl border-2 transition-all text-left ${
                                mode === 'live' 
                                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            style={{ opacity: switchingMode ? 0.7 : 1 }}
                        >
                            <div className="flex items-center gap-2 w-full">
                                <div className={`w-2 h-2 rounded-full ${mode === 'live' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                <span className={`text-sm font-black uppercase tracking-wider ${mode === 'live' ? 'text-emerald-900' : 'text-slate-700'}`}>Live Mode</span>
                                {mode === 'live' && (
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-emerald-500 text-white ml-auto shadow-sm">ACTIVE</span>
                                )}
                            </div>
                            <span className={`text-xs font-semibold ${mode === 'live' ? 'text-emerald-700' : 'text-slate-500'}`}>
                                api.surepass.io — production endpoint, real credits used
                            </span>
                        </button>
                    </div>

                    {/* Active endpoint display */}
                    <div className="p-4 rounded-xl font-mono text-xs truncate bg-slate-100 border border-slate-200 text-slate-600 font-semibold shadow-inner">
                        <span className="text-accent font-black uppercase tracking-widest mr-2 text-[10px]">Endpoint:</span>
                        {mode === 'live' ? liveUrl : sandboxUrl}
                    </div>

                    {mode === 'live' && (
                        <div className="flex items-start gap-2.5 p-4 rounded-xl text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                            <span>
                                <strong className="font-black">Live mode active.</strong> Real API credits will be consumed on every challan lookup. Switch to Sandbox for testing.
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Token Card ── */}
            <form onSubmit={handleSave}>
                <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                        <CardTitle className="text-slate-900 font-black tracking-tight uppercase">API Token Setup</CardTitle>
                        <CardDescription className="text-slate-500 font-bold leading-relaxed">
                            Provide your Bearer token from{' '}
                            <a href="https://console.surepass.app" target="_blank" rel="noopener noreferrer"
                                className="text-accent hover:underline underline-offset-2 inline-flex items-center gap-1">
                                console.surepass.app
                            </a>.<br />
                            This token is stored securely server-side and never exposed to the frontend.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6 px-6 pb-6">
                        {/* Current token status */}
                        <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-colors ${
                            hasToken ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-slate-50 border-slate-200'
                        }`}>
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                hasToken ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'
                            }`} />
                            <div>
                                <p className={`text-xs font-black uppercase tracking-widest mb-1 ${
                                    hasToken ? 'text-emerald-700' : 'text-slate-500'
                                }`}>
                                    {hasToken ? 'Token Configured & Active' : 'No Token Set'}
                                </p>
                                {hasToken && maskedToken && (
                                    <p className="text-sm font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm inline-block">
                                        {maskedToken}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Token input */}
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">{hasToken ? 'Update Token' : 'Enter API Token'} *</Label>
                            <div className="relative">
                                <Input
                                    type={showToken ? 'text' : 'password'}
                                    value={newToken}
                                    onChange={(e) => setNewToken(e.target.value)}
                                    placeholder="Paste your Surepass Bearer token here..."
                                    className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 font-mono tracking-wider pr-12 text-sm shadow-inner"
                                />
                                <button type="button" onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors">
                                    {showToken ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Status */}
                        {status && (
                            <div className={`flex items-center gap-2.5 p-4 rounded-xl border ${
                                status.type === 'success' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                {status.type === 'success'
                                    ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                                    : <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />}
                                <span className="text-sm font-bold">{status.msg}</span>
                            </div>
                        )}

                        {/* Security note */}
                        <div className="flex items-start gap-3 p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 mt-4">
                            <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                            <div className="space-y-1.5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-amber-800">Security Architecture</div>
                                <ul className="text-xs font-semibold text-amber-900/70 list-none space-y-1.5 ml-0">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-amber-400" />
                                        Token stored securely in database, used exclusively server-side
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-amber-400" />
                                        Never included or exposed in browser network responses
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-amber-400" />
                                        All e-Challan calls proxied securely via <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 mx-1">/api/admin/challan</code>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end border-t border-slate-100">
                            <Button type="submit" disabled={saving || !newToken.trim()}
                                className="w-full sm:w-auto rounded-2xl px-10 py-6 font-black uppercase tracking-widest text-xs bg-accent hover:bg-accent/90 text-white shadow-xl shadow-accent/25 transition-all">
                                {saving
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                    : <><Save className="w-4 h-4 mr-2" /> Save Token</>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}

