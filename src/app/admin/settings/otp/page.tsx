"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function OTPSettingsPage() {
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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">OTP Settings</h1>
                <p className="text-muted-foreground">Control OTP verification requirements for new registrations</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>OTP Verification Settings</CardTitle>
                    <CardDescription>Configure email and mobile OTP verification for user registration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-semibold">Email OTP Verification</h3>
                                <p className="text-sm text-muted-foreground">Require email verification during registration</p>
                            </div>
                            <Button
                                variant={settings.emailOTPEnabled ? "default" : "outline"}
                                onClick={() => setSettings({ ...settings, emailOTPEnabled: !settings.emailOTPEnabled })}
                            >
                                {settings.emailOTPEnabled ? "Enabled" : "Disabled"}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-semibold">Mobile OTP Verification</h3>
                                <p className="text-sm text-muted-foreground">Require mobile verification during registration</p>
                            </div>
                            <Button
                                variant={settings.mobileOTPEnabled ? "default" : "outline"}
                                onClick={() => setSettings({ ...settings, mobileOTPEnabled: !settings.mobileOTPEnabled })}
                            >
                                {settings.mobileOTPEnabled ? "Enabled" : "Disabled"}
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiry">OTP Expiry Time (minutes)</Label>
                            <Input
                                id="expiry"
                                type="number"
                                min="5"
                                max="60"
                                value={settings.otpExpiryMinutes}
                                onChange={(e) => setSettings({ ...settings, otpExpiryMinutes: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">OTP Rules:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Email OTP enabled → Email verification required</li>
                            <li>• Mobile OTP enabled → Mobile verification required</li>
                            <li>• Both enabled → Both required</li>
                            <li>• Both disabled → OTP verification skipped</li>
                        </ul>
                    </div>

                    <Button onClick={handleSave} disabled={isLoading} className="w-full">
                        {isLoading ? "Saving..." : "Save OTP Settings"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
