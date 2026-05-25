"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginValues } from "@/lib/schemas/auth"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"

export function LoginForm() {
    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(data: LoginValues) {
        setIsLoading(true)
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                alert(`Error: ${result.error}`)
                setIsLoading(false)
                return
            }

            const searchParams = new URLSearchParams(window.location.search)
            const callbackUrl = searchParams.get("callbackUrl")

            if (callbackUrl) {
                router.push(callbackUrl)
                return
            }

            router.push("/admin")

        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : "Something went wrong")
            setIsLoading(false)
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[440px] relative"
        >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-[#16acd4]/20 blur-3xl -z-10 rounded-full opacity-50" />

            <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#16acd4] to-transparent opacity-50" />
                
                <div className="p-8 md:p-10">
                    <div className="text-center mb-10">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-6"
                        >
                            <ShieldCheck className="w-8 h-8 text-[#16acd4]" />
                        </motion.div>
                        <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">
                            Detailing <span className="text-[#16acd4]">Garage</span>
                        </h1>
                        <p className="text-zinc-400 mt-2 text-sm tracking-wide">Studio Management Portal</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-[#16acd4] transition-colors" />
                                                </div>
                                                <input
                                                    type="email"
                                                    placeholder="Admin Email"
                                                    disabled={isLoading}
                                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#16acd4]/50 focus:bg-white/10 transition-all placeholder:text-zinc-600 font-medium"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-400 text-xs ml-1" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-[#16acd4] transition-colors" />
                                                </div>
                                                <input
                                                    type="password"
                                                    placeholder="Password"
                                                    disabled={isLoading}
                                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#16acd4]/50 focus:bg-white/10 transition-all placeholder:text-zinc-600 font-medium"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-400 text-xs ml-1" />
                                    </FormItem>
                                )}
                            />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative group overflow-hidden rounded-xl bg-[#16acd4] text-black font-bold text-sm tracking-widest uppercase py-4 transition-all hover:bg-white disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        "Secure Login"
                                    )}
                                </span>
                            </button>
                        </form>
                    </Form>
                </div>
                
                <div className="p-6 bg-black/40 border-t border-white/5 text-center">
                    <p className="text-xs text-zinc-600 font-medium tracking-wider">
                        SECURE 256-BIT ENCRYPTION • AUTHORIZED PERSONNEL ONLY
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
