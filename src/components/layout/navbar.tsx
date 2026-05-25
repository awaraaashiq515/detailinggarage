"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { getPublicHeaderSettings, type HeaderSettingsData } from "@/app/actions/header-settings"

export function Navbar() {
    const [user, setUser] = useState<{ role: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [scrolled, setScrolled] = useState(false)
    const [settings, setSettings] = useState<HeaderSettingsData | null>(null)
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)

        // Fetch user session
        fetch("/api/auth/me")
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.user) setUser(data.user)
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false))

        // Fetch header settings
        getPublicHeaderSettings()
            .then(data => {
                if (data) setSettings(data)
            })
            .catch(err => console.error("Error loading header settings in Navbar:", err))

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { label: "Studio", href: "#" },
        { label: "Services", href: "#services" },
        { label: "PDI Inspection", href: "/pdi" },
        { label: "Portfolio", href: "#" },
        { label: "The Process", href: "#" },
    ]

    return (
        <motion.header 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-6 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}
        >
            <div className={`flex items-center justify-between w-full max-w-7xl mx-auto transition-all duration-500 ${scrolled ? 'bg-[#18181b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl px-6 py-3' : 'bg-transparent px-0'}`}>
                
                {/* Brand */}
                {settings?.useLogo && settings?.logoImageUrl ? (
                    <Link href="/" className="flex items-center group">
                        <img 
                            src={settings.logoImageUrl} 
                            alt={`${settings.brandName || "Detailing"} ${settings.brandNameAccent || "Garage"}`} 
                            className="h-10 w-auto object-contain hover:scale-105 transition-transform duration-300" 
                        />
                    </Link>
                ) : (
                    <Link href="/" className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-1 group">
                        <span className="w-6 h-6 rounded bg-gradient-to-tr from-[#16acd4] to-[#0f80a0] flex items-center justify-center mr-2 shadow-[0_0_15px_rgba(22, 172, 212,0.4)] group-hover:scale-110 transition-transform">
                            <span className="w-2 h-2 bg-black rounded-full" />
                        </span>
                        {settings?.brandName || "Detailing"}<span className="text-zinc-500 font-light">{settings?.brandNameAccent || "Garage"}</span>
                    </Link>
                )}

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8 bg-black/20 px-8 py-2.5 rounded-full border border-white/5 backdrop-blur-md">
                    {navLinks.map((link, index) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={index}
                                href={link.href}
                                className={`text-xs font-semibold tracking-widest uppercase transition-all hover:text-white ${
                                    isActive ? 'text-white' : 'text-zinc-400'
                                }`}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                </div>

                {/* Auth / CTA */}
                <div className="flex items-center gap-4">
                    {!loading && (
                        user ? (
                            <Link
                                href="/admin"
                                className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase hover:scale-105 hover:bg-[#16acd4] transition-all"
                            >
                                Admin Access
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase hover:scale-105 hover:bg-[#16acd4] transition-all"
                            >
                                Client Portal
                            </Link>
                        )
                    )}
                </div>

            </div>
        </motion.header>
    )
}
