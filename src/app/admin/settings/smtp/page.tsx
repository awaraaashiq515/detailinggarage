"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function SMTPSettingsPage() {
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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">SMTP Settings</h1>
                <p className="text-muted-foreground">Configure email server settings for sending notifications</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>SMTP Configuration</CardTitle>
                    <CardDescription>Configure email server settings for OTP and approval notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="host">SMTP Host *</Label>
                            <Input
                                id="host"
                                placeholder="smtp.gmail.com"
                                value={settings.host}
                                onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="port">Port *</Label>
                            <Input
                                id="port"
                                type="number"
                                placeholder="587"
                                value={settings.port}
                                onChange={(e) => setSettings({ ...settings, port: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username *</Label>
                            <Input
                                id="username"
                                placeholder="your-email@gmail.com"
                                value={settings.username}
                                onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={settings.password}
                                onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fromEmail">From Email *</Label>
                            <Input
                                id="fromEmail"
                                placeholder="noreply@yourcompany.com"
                                value={settings.fromEmail}
                                onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fromName">From Name *</Label>
                            <Input
                                id="fromName"
                                placeholder="Your Company"
                                value={settings.fromName}
                                onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="encryption">Encryption</Label>
                        <Select value={settings.encryption} onValueChange={(value) => setSettings({ ...settings, encryption: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TLS">TLS</SelectItem>
                                <SelectItem value="SSL">SSL</SelectItem>
                                <SelectItem value="NONE">None</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <h3 className="font-semibold">Test Email Configuration</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter test email address"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                            />
                            <Button onClick={handleTestEmail} disabled={isLoading} variant="outline">
                                Send Test
                            </Button>
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={isLoading} className="w-full">
                        {isLoading ? "Saving..." : "Save SMTP Settings"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
