"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
    getAdminHeaderSettings,
    updateHeaderSettings,
    resetHeaderSettings,
    type HeaderSettingsData,
    type NavigationLink,
} from "@/app/actions/header-settings"

export default function HeaderSettingsPage() {
    const [settings, setSettings] = useState<HeaderSettingsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        loadSettings()
    }, [])

    async function loadSettings() {
        setIsLoading(true)
        const result = await getAdminHeaderSettings()
        if (result.success && result.data) {
            setSettings(result.data)
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to load header settings",
                variant: "destructive",
            })
        }
        setIsLoading(false)
    }

    async function handleSave() {
        if (!settings) return

        setIsSaving(true)
        const result = await updateHeaderSettings(settings)

        if (result.success) {
            toast({
                title: "Success",
                description: "Header settings saved successfully!",
            })
            if (result.data) {
                setSettings(result.data)
            }
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to save settings",
                variant: "destructive",
            })
        }
        setIsSaving(false)
    }

    async function handleReset() {
        if (!confirm("Are you sure you want to reset all header settings to defaults?")) return

        setIsSaving(true)
        const result = await resetHeaderSettings()

        if (result.success && result.data) {
            setSettings(result.data)
            toast({
                title: "Success",
                description: "Header settings reset to defaults!",
            })
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to reset settings",
                variant: "destructive",
            })
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
                toast({
                    title: "Logo Uploaded",
                    description: "Your logo has been uploaded and applied.",
                })
            } else {
                const data = await res.json()
                toast({
                    title: "Upload Failed",
                    description: data.error || "Failed to upload image",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Upload error:", error)
            toast({
                title: "Error",
                description: "An error occurred during file upload",
                variant: "destructive",
            })
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
            navigationLinks: [
                ...settings.navigationLinks,
                { label: "New Link", href: "/", isExternal: false },
            ],
        })
    }

    function removeNavLink(index: number) {
        if (!settings) return
        const updatedLinks = settings.navigationLinks.filter((_, i) => i !== index)
        setSettings({ ...settings, navigationLinks: updatedLinks })
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
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading header settings...</div>
            </div>
        )
    }

    if (!settings) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-destructive">Failed to load settings</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Header Settings</h1>
                    <p className="text-muted-foreground">Customize the website header and navigation</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                        Reset to Defaults
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            {/* Preview Section */}
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Live Preview</CardTitle>
                    <CardDescription>See how your header will look</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className="rounded-lg p-4 flex items-center justify-between"
                        style={{ backgroundColor: '#08090c', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        {/* Brand */}
                        {settings.useLogo && settings.logoImageUrl ? (
                            <img
                                src={settings.logoImageUrl}
                                alt="Logo"
                                className="h-8 object-contain"
                            />
                        ) : (
                            <div className="text-[22px] tracking-[3px] text-white font-display">
                                {settings.brandName}
                                <span style={{ color: settings.primaryColor }}>{settings.brandNameAccent}</span>
                            </div>
                        )}

                        {/* Nav Links */}
                        <div className="flex gap-6">
                            {settings.navigationLinks.slice(0, 4).map((link, i) => (
                                <span
                                    key={i}
                                    className="text-sm font-medium"
                                    style={{ color: settings.textColor }}
                                >
                                    {link.label}
                                </span>
                            ))}
                        </div>

                        {/* CTA */}
                        <div
                            className="px-5 py-2 rounded-lg text-sm font-bold text-black"
                            style={{ backgroundColor: settings.primaryColor }}
                        >
                            {settings.ctaButtonText}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Branding Section */}
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Branding</CardTitle>
                    <CardDescription>Configure your brand name and logo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border border-white/10 rounded-lg">
                        <div className="flex-1">
                            <h3 className="font-semibold text-white">Use Logo Image</h3>
                            <p className="text-sm text-muted-foreground">
                                Toggle between text-based brand name or logo image
                            </p>
                        </div>
                        <Button
                            variant={settings.useLogo ? "default" : "outline"}
                            onClick={() => setSettings({ ...settings, useLogo: !settings.useLogo })}
                        >
                            {settings.useLogo ? "Using Logo" : "Using Text"}
                        </Button>
                    </div>

                    {!settings.useLogo ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brandName" className="text-white">Brand Name</Label>
                                <Input
                                    id="brandName"
                                    value={settings.brandName}
                                    onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                                    placeholder="Detailing"
                                    className="bg-[#08090c] border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brandAccent" className="text-white">
                                    Accent Text <span className="text-xs text-muted-foreground">(colored part)</span>
                                </Label>
                                <Input
                                    id="brandAccent"
                                    value={settings.brandNameAccent}
                                    onChange={(e) => setSettings({ ...settings, brandNameAccent: e.target.value })}
                                    placeholder="Garage"
                                    className="bg-[#08090c] border-white/10 text-white"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="logoUpload" className="text-white">Logo Image</Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <Input
                                            id="logoUpload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={isUploading}
                                            className="bg-[#08090c] border-white/10 text-white cursor-pointer"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {isUploading ? "Uploading..." : "Upload a logo image (PNG, JPG, SVG)"}
                                        </p>
                                    </div>
                                    {settings.logoImageUrl && (
                                        <div className="h-10 w-10 border border-white/10 rounded overflow-hidden bg-white/5 flex items-center justify-center">
                                            <img src={settings.logoImageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logoUrl" className="text-white">Manual Logo URL</Label>
                                <Input
                                    id="logoUrl"
                                    value={settings.logoImageUrl || ""}
                                    onChange={(e) => setSettings({ ...settings, logoImageUrl: e.target.value })}
                                    placeholder="/branding/logo.png"
                                    className="bg-[#08090c] border-white/10 text-white"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Alternatively, enter the path to your logo image manually
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Colors Section */}
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Colors</CardTitle>
                    <CardDescription>Customize the header color scheme</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="primaryColor" className="text-white">Primary Color</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={settings.primaryColor}
                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                    className="w-12 h-10 rounded cursor-pointer"
                                />
                                <Input
                                    id="primaryColor"
                                    value={settings.primaryColor}
                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                    placeholder="#16acd4"
                                    className="bg-[#08090c] border-white/10 text-white flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accentColor" className="text-white">Accent Color</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={settings.accentColor}
                                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                                    className="w-12 h-10 rounded cursor-pointer"
                                />
                                <Input
                                    id="accentColor"
                                    value={settings.accentColor}
                                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                                    placeholder="#ff6b35"
                                    className="bg-[#08090c] border-white/10 text-white flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="textColor" className="text-white">Nav Text Color</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={settings.textColor}
                                    onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                                    className="w-12 h-10 rounded cursor-pointer"
                                />
                                <Input
                                    id="textColor"
                                    value={settings.textColor}
                                    onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                                    placeholder="#6b7080"
                                    className="bg-[#08090c] border-white/10 text-white flex-1"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Links Section */}
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Navigation Links</CardTitle>
                            <CardDescription>Manage header navigation menu items</CardDescription>
                        </div>
                        <Button onClick={addNavLink} variant="outline" size="sm">
                            + Add Link
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {settings.navigationLinks.map((link, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-3 border border-white/10 rounded-lg"
                        >
                            <div className="flex flex-col gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveNavLink(index, "up")}
                                    disabled={index === 0}
                                    className="h-6 w-6 p-0"
                                >
                                    ↑
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveNavLink(index, "down")}
                                    disabled={index === settings.navigationLinks.length - 1}
                                    className="h-6 w-6 p-0"
                                >
                                    ↓
                                </Button>
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <Input
                                    value={link.label}
                                    onChange={(e) => updateNavLink(index, "label", e.target.value)}
                                    placeholder="Link Label"
                                    className="bg-[#08090c] border-white/10 text-white"
                                />
                                <Input
                                    value={link.href}
                                    onChange={(e) => updateNavLink(index, "href", e.target.value)}
                                    placeholder="/page or #section"
                                    className="bg-[#08090c] border-white/10 text-white"
                                />
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateNavLink(index, "isExternal", !link.isExternal)}
                                className={link.isExternal ? "text-green-500" : "text-muted-foreground"}
                            >
                                {link.isExternal ? "External" : "Internal"}
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNavLink(index)}
                                className="text-red-500 hover:text-red-400"
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* CTA Buttons Section */}
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Button Labels</CardTitle>
                    <CardDescription>Customize header button text</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="loginBtn" className="text-white">Login Button Text</Label>
                            <Input
                                id="loginBtn"
                                value={settings.loginButtonText}
                                onChange={(e) => setSettings({ ...settings, loginButtonText: e.target.value })}
                                placeholder="Log In"
                                className="bg-[#08090c] border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dashboardBtn" className="text-white">Dashboard Button Text</Label>
                            <Input
                                id="dashboardBtn"
                                value={settings.dashboardButtonText}
                                onChange={(e) => setSettings({ ...settings, dashboardButtonText: e.target.value })}
                                placeholder="Dashboard"
                                className="bg-[#08090c] border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ctaText" className="text-white">CTA Button Text</Label>
                            <Input
                                id="ctaText"
                                value={settings.ctaButtonText}
                                onChange={(e) => setSettings({ ...settings, ctaButtonText: e.target.value })}
                                placeholder="Get Started"
                                className="bg-[#08090c] border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ctaLink" className="text-white">CTA Button Link</Label>
                            <Input
                                id="ctaLink"
                                value={settings.ctaButtonLink}
                                onChange={(e) => setSettings({ ...settings, ctaButtonLink: e.target.value })}
                                placeholder="/register"
                                className="bg-[#08090c] border-white/10 text-white"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Site Metadata Section */}
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Site Metadata</CardTitle>
                    <CardDescription>Configure page title and description for SEO</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="siteTitle" className="text-white">Site Title</Label>
                        <Input
                            id="siteTitle"
                            value={settings.siteTitle}
                            onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                            placeholder="DetailingGarage – Premium Car Care"
                            className="bg-[#08090c] border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="siteDesc" className="text-white">Site Description</Label>
                        <Textarea
                            id="siteDesc"
                            value={settings.siteDescription}
                            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                            placeholder="All car services in one place..."
                            className="bg-[#08090c] border-white/10 text-white min-h-[100px]"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button at Bottom */}
            <div className="flex justify-end gap-2 pb-6">
                <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                    Reset to Defaults
                </Button>
                <Button onClick={handleSave} disabled={isSaving} size="lg">
                    {isSaving ? "Saving..." : "Save Header Settings"}
                </Button>
            </div>
        </div>
    )
}
