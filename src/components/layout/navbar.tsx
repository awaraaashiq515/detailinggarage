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
    const [mobileOpen, setMobileOpen] = useState(false)
    const [moreOpen, setMoreOpen] = useState(false)
    const [settings, setSettings] = useState<HeaderSettingsData | null>(null)
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30)
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
        { label: "Studio", href: "/#studio" },
        { label: "Services", href: "/#services" },
        { label: "PDI Inspection", href: "/pdi" },
        { label: "Portfolio", href: "/#customers" },
        { label: "The Process", href: "/#pdi" },
    ]

    const moreLinks = [
        { label: "Marketplace", href: "/marketplace", icon: "🛒" },
        { label: "Cars", href: "/cars", icon: "🚗" },
        { label: "Bikes", href: "/bikes", icon: "🏍️" },
        { label: "Insurance Claims", href: "/insurance-claim", icon: "🛡️" },
        { label: "Shop", href: "/shop", icon: "🛍️" },
        { label: "Social Feed", href: "/feed", icon: "📱" },
    ]

    const logoSrc = (settings?.useLogo && settings?.logoImageUrl) 
        ? settings.logoImageUrl 
        : "/uploads/branding/1779713654268-4739f61de249a06b.png"

    return (
        <motion.header 
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 sm:px-6 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}
        >
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto bg-[#18181b]/85 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 relative">
                
                {/* Brand / Logo */}
                <Link href="/" className="flex items-center group flex-shrink-0">
                    <img 
                        src={logoSrc} 
                        alt="Detailing Garage - Detailing That Defines Luxury" 
                        className="h-9 sm:h-10 w-auto object-contain hover:scale-105 transition-transform duration-300" 
                        onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const fallback = document.getElementById("navbar-brand-fallback");
                            if (fallback) fallback.style.display = 'flex';
                        }}
                    />
                    <div id="navbar-brand-fallback" style={{ display: "none" }} className="items-center gap-1 font-display text-lg sm:text-xl font-bold tracking-tight text-white">
                        <span>Detailing</span><span className="text-[#16acd4] font-normal">Garage</span>
                    </div>
                </Link>

                {/* Desktop Capsule Nav Pill */}
                <nav className="hidden md:flex items-center gap-5 lg:gap-7 bg-black/40 px-6 lg:px-7 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    {navLinks.map((link, index) => {
                        const isActive = pathname === link.href || (pathname === "/pdi" && link.href === "/pdi")
                        return (
                            <Link
                                key={index}
                                href={link.href}
                                className={`text-[11px] font-semibold tracking-wider uppercase transition-all duration-200 hover:text-white ${
                                    isActive ? 'text-white font-bold' : 'text-zinc-400'
                                }`}
                            >
                                {link.label}
                            </Link>
                        )
                    })}

                    {/* More Dropdown hidden for now as requested */}
                    {false && (
                    <div 
                        className="relative"
                        onMouseEnter={() => setMoreOpen(true)}
                        onMouseLeave={() => setMoreOpen(false)}
                    >
                        <button 
                            onClick={() => setMoreOpen(!moreOpen)}
                            className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            More <span className={`text-[9px] opacity-70 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}>▾</span>
                        </button>
                        
                        <AnimatePresence>
                            {moreOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full right-0 mt-3 w-52 bg-[#0e1316]/95 border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1 backdrop-blur-xl z-50"
                                >
                                    {moreLinks.map((m, idx) => (
                                        <Link 
                                            key={idx}
                                            href={m.href}
                                            onClick={() => setMoreOpen(false)}
                                            className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                                        >
                                            <span className="text-sm">{m.icon}</span>
                                            <span>{m.label}</span>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    )}
                </nav>

                {/* Right Auth / CTA Button */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {!loading && (
                        user ? (
                            <Link
                                href={user.role === "SUPER_ADMIN" ? "/super-admin/website" : "/admin"}
                                className="bg-white text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] font-bold tracking-wider uppercase hover:scale-105 hover:bg-[#16acd4] hover:text-black transition-all shadow-md"
                            >
                                {user.role === "SUPER_ADMIN" ? "Admin CMS" : "Admin Access"}
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/pdi#book"
                                    className="bg-white text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] font-bold tracking-wider uppercase hover:scale-105 hover:bg-[#16acd4] hover:text-black transition-all shadow-md"
                                >
                                    Book Inspection
                                </Link>
                                <Link
                                    href="/login"
                                    className="hidden lg:inline-flex text-zinc-400 hover:text-white text-[11px] font-semibold tracking-wider uppercase px-2 py-1 transition-colors"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )
                    )}

                    {/* Mobile Hamburger Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors ml-1"
                        aria-label="Toggle Navigation"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {mobileOpen ? (
                                <path d="M18 6L6 18M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Dropdown Drawer */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-[#0e1316]/98 border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-2 backdrop-blur-2xl z-50 md:hidden"
                        >
                            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3 pt-1">
                                Main Sections
                            </div>
                            {navLinks.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-3 py-2 text-sm font-semibold tracking-wide uppercase text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {/* Explore / More section hidden for now as requested */}
                            {false && (
                            <>
                                <div className="border-t border-white/10 my-1" />
                                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3 pt-1">
                                    Explore
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    {moreLinks.map((m, idx) => (
                                        <Link
                                            key={idx}
                                            href={m.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <span>{m.icon}</span>
                                            <span>{m.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                            )}
                            <div className="border-t border-white/10 my-1 pt-2">
                                <Link
                                    href="/pdi#book"
                                    onClick={() => setMobileOpen(false)}
                                    className="block text-center w-full py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#16acd4] transition-colors"
                                >
                                    Book Inspection
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    )
}
