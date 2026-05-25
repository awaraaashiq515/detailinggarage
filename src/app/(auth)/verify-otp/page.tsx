"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getPublicHeaderSettings, type HeaderSettingsData } from "@/app/actions/header-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ShieldCheck, Mail, Smartphone, ArrowLeft, RefreshCw, Loader2 } from "lucide-react"

function VerifyOTPContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams.get("userId")

    const [emailOTP, setEmailOTP] = useState("")
    const [mobileOTP, setMobileOTP] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [otpSettings, setOTPSettings] = useState({ emailOTPEnabled: true, mobileOTPEnabled: false })
    const [settings, setSettings] = useState<HeaderSettingsData | null>(null)
    const [imgError, setImgError] = useState(false)
    const [timer, setTimer] = useState(600) // 10 minutes in seconds
    const [canResend, setCanResend] = useState(false)

    useEffect(() => {
        getPublicHeaderSettings().then(setSettings)

        if (!userId) {
            router.push("/register")
            return
        }

        // Fetch OTP settings
        async function fetchOTPSettings() {
            try {
                const response = await fetch("/api/settings/otp")
                if (response.ok) {
                    const data = await response.json()
                    setOTPSettings(data.settings || { emailOTPEnabled: true, mobileOTPEnabled: false })
                }
            } catch (error) {
                console.error("Failed to fetch OTP settings:", error)
            }
        }
        fetchOTPSettings()
    }, [userId, router])

    // Countdown timer
    useEffect(() => {
        if (timer > 0 && !success) {
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [timer, success])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    async function handleVerify() {
        if (!userId) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    emailOTP: otpSettings.emailOTPEnabled ? emailOTP : undefined,
                    mobileOTP: otpSettings.mobileOTPEnabled ? mobileOTP : undefined,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || "Verification failed")
                return
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 3000)

        } catch (error) {
            console.error(error)
            setError(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleResend(type: "EMAIL" | "MOBILE") {
        if (!userId) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, type }),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || "Failed to resend OTP")
                return
            }

            setTimer(600) // Reset timer
            setCanResend(false)
            alert("OTP resent successfully!")

        } catch (error) {
            console.error(error)
            setError(error instanceof Error ? error.message : "Failed to resend OTP")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-50 -z-10" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 -z-10" />
            <div className="relative w-full max-w-md">
                    {/* Glowing effect */}
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-400 to-teal-500 opacity-20 blur-xl animate-pulse" />

                    <Card className="relative w-full border-emerald-100 bg-white shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/50 animate-bounce">
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">
                                Verification Successful!
                            </CardTitle>
                            <CardDescription className="text-sm font-bold text-slate-500 mt-1">
                                Your account has been securely verified.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-8 space-y-4">
                            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                                <p className="text-sm text-emerald-700">
                                    Please wait for admin approval before logging in. You will receive an email once approved.
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground animate-pulse">
                                Redirecting to login...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const useLogo = true
    const logoUrl = settings?.logoImageUrl || "/car-assure-logo.png"
    const brandName = settings?.brandName ?? "Car "
    const brandNameAccent = settings?.brandNameAccent ?? "Assure"

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-50 -z-10" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 -z-10" />
            <div className="relative w-full max-w-md">
                {/* Background Glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-accent/20 to-blue-500/20 opacity-20 blur-xl animate-pulse" />

                <Card className="relative w-full bg-white border-slate-200 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto mb-4 flex justify-center h-12">
                            {(useLogo && logoUrl && !imgError) ? (
                                <img
                                    src={logoUrl}
                                    alt="Brand Logo"
                                    className="h-full w-auto object-contain"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <div className="font-sans text-3xl font-black tracking-tighter text-slate-900 flex items-center h-full">
                                    {brandName}<span className="text-accent">{brandNameAccent}</span>
                                </div>
                            )}
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight uppercase mt-2">
                            Verify Your Account
                        </CardTitle>
                        <CardDescription className="text-sm font-bold text-slate-500">
                            Enter the OTP code sent to your device
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 font-bold px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                                <ShieldCheck className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        {otpSettings.emailOTPEnabled && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-700 uppercase tracking-widest text-[11px] font-black flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-accent" /> Email OTP
                                    </label>
                                    {canResend && (
                                        <button
                                            onClick={() => handleResend("EMAIL")}
                                            className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1 transition-colors"
                                            disabled={isLoading}
                                        >
                                            <RefreshCw className="h-3 w-3" /> Resend
                                        </button>
                                    )}
                                </div>
                                <Input
                                    type="text"
                                    placeholder="• • • • • •"
                                    value={emailOTP}
                                    onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    className="h-12 text-center text-2xl tracking-[0.5em] font-mono bg-black/40 border-white/10 focus:border-accent/50 focus:ring-accent/20 transition-all text-slate-900 placeholder:text-gray-700"
                                />
                            </div>
                        )}

                        {otpSettings.mobileOTPEnabled && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-700 uppercase tracking-widest text-[11px] font-black flex items-center gap-2">
                                        <Smartphone className="h-4 w-4 text-accent" /> Mobile OTP
                                    </label>
                                    {canResend && (
                                        <button
                                            onClick={() => handleResend("MOBILE")}
                                            className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1 transition-colors"
                                            disabled={isLoading}
                                        >
                                            <RefreshCw className="h-3 w-3" /> Resend
                                        </button>
                                    )}
                                </div>
                                <Input
                                    type="text"
                                    placeholder="• • • • • •"
                                    value={mobileOTP}
                                    onChange={(e) => setMobileOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    className="h-12 text-center text-2xl tracking-[0.5em] font-mono bg-black/40 border-white/10 focus:border-accent/50 focus:ring-accent/20 transition-all text-slate-900 placeholder:text-gray-700"
                                />
                            </div>
                        )}

                        <div className="text-center">
                            {timer > 0 ? (
                                <p className="text-sm text-slate-600 font-bold bg-slate-100 py-1.5 px-3 rounded-full inline-block">
                                    Expires in <span className="font-mono font-medium text-accent w-12 inline-block">{formatTime(timer)}</span>
                                </p>
                            ) : (
                                <p className="text-sm text-red-500 font-medium">OTP expired</p>
                            )}
                        </div>

                        <Button
                            onClick={handleVerify}
                            className="w-full rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-xs bg-slate-900 hover:bg-accent text-white shadow-xl shadow-slate-900/10 hover:shadow-accent/25 transition-all mt-4"
                            disabled={isLoading || timer === 0}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4 animate-spin" /> Verifying...
                                </div>
                            ) : "Verify Account"}
                        </Button>

                        <div className="text-center pt-2">
                            <button
                                onClick={() => router.push("/login")}
                                className="text-sm text-gray-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back to Login
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-accent" />
            </div>
        }>
            <VerifyOTPContent />
        </Suspense>
    )
}
