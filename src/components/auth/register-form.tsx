"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterValues } from "@/lib/schemas/auth"
import { useRouter } from "next/navigation"
import { getPublicHeaderSettings, type HeaderSettingsData } from "@/app/actions/header-settings"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginPurpose {
    id: string
    name: string
    description: string | null
}

export function RegisterForm() {
    const [loginPurposes, setLoginPurposes] = useState<LoginPurpose[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [settings, setSettings] = useState<HeaderSettingsData | null>(null)
    const [imgError, setImgError] = useState(false)

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            mobile: "",
            password: "",
            confirmPassword: "",
            role: "CLIENT",
            purposeOfLoginId: "",
            dealerBusinessName: "",
            dealerGstNumber: "",
            dealerCity: "",
            dealerState: "",
            dealerBankName: "",
            dealerAccountNum: "",
            dealerIfscCode: "",
        },
    })

    const role = form.watch("role")

    const router = useRouter()

    // Fetch login purposes on component mount
    useEffect(() => {
        getPublicHeaderSettings().then(setSettings)
        
        async function fetchLoginPurposes() {
            try {
                const response = await fetch("/api/login-purposes")
                if (response.ok) {
                    const data = await response.json()
                    setLoginPurposes(data.purposes || [])
                }
            } catch (error) {
                console.error("Failed to fetch login purposes:", error)
            }
        }
        fetchLoginPurposes()
    }, [])

    async function onSubmit(data: RegisterValues) {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || "Registration failed")
                return
            }

            // Check if OTP verification is required
            if (result.requiresOTP) {
                // Redirect to OTP verification page
                router.push(`/verify-otp?userId=${result.userId}`)
            } else {
                // No OTP required, show success message
                alert("Registration successful! Please wait for admin approval. You will receive an email notification once approved.")
                router.push("/login")
            }

        } catch (error) {
            console.error(error)
            setError(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const useLogo = true
    const logoUrl = settings?.logoImageUrl || "/car-assure-logo.png"
    const brandName = settings?.brandName ?? "Car "
    const brandNameAccent = settings?.brandNameAccent ?? "Assure"

    return (
        <Card className="w-full max-w-2xl mx-auto bg-white border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-3xl overflow-hidden backdrop-blur-sm relative animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/50 via-accent to-accent/50" />
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 text-center pb-6">
                <div className="mx-auto mb-6 flex justify-center h-12">
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
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight uppercase">Create an account</CardTitle>
                <CardDescription className="text-sm font-bold text-slate-500 mt-1">
                    Enter your information to get started. Your account will be activated after admin approval.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
                                <span className="text-lg">⚠️</span> {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">Full Name <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">Email Address <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john@example.com" {...field} className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="mobile"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">Mobile Number <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 234 567 8900" {...field} className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">Role <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors">
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CLIENT">Client</SelectItem>
                                                <SelectItem value="DEALER">Dealer</SelectItem>
                                                <SelectItem value="AGENT">Agent</SelectItem>
                                                <SelectItem value="ENTERPRISE">Enterprise Executive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="purposeOfLoginId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">Purpose of Login <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors">
                                                <SelectValue placeholder="Select purpose of login" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {loginPurposes.length === 0 ? (
                                                <SelectItem value="none" disabled>No purposes available</SelectItem>
                                            ) : (
                                                loginPurposes.map((purpose) => (
                                                    <SelectItem key={purpose.id} value={purpose.id}>
                                                        {purpose.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {role === "DEALER" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top duration-300">
                                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl mb-2">
                                    <h3 className="text-xs font-black text-accent uppercase tracking-widest">Dealer Business Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="dealerBusinessName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">Business / Agency Name <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Super Car Dealers Pvt Ltd" {...field} className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dealerGstNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">GST Number <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="22AAAAA0000A1Z5" {...field} className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium font-mono focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="dealerCity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">City <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Mumbai" {...field} className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dealerState"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">State <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Maharashtra" {...field} className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl my-4">
                                    <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">Bank Details (For Payouts)</h3>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="dealerBankName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">Bank Name <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="HDFC Bank" {...field} className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="dealerAccountNum"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">Account Number <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="000123456789" {...field} className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium font-mono focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dealerIfscCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">IFSC Code <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="HDFC0000123" {...field} className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium font-mono focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">Password <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••" {...field} className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">Confirm Password <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••" {...field} className="bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-900 rounded-xl px-4 py-6 font-medium focus-visible:ring-accent/20 focus-visible:border-accent/40 shadow-inner transition-colors" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-xs bg-slate-900 hover:bg-accent text-white shadow-xl shadow-slate-900/10 hover:shadow-accent/25 transition-all mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center text-xs font-bold text-slate-500 p-6 bg-slate-50/50 border-t border-slate-100 mt-6 pb-6">
                Already have an account? <a href="/login" className="ml-1 text-accent hover:text-accent/80 transition-colors uppercase tracking-widest font-black">Sign in</a>
            </CardFooter>
        </Card >
    )
}
