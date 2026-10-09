"use client"

import Link from "next/link"
import { Facebook, Instagram, Mail, Phone } from "lucide-react"

export function Footer() {
    return (
        <footer className="py-10 px-6 md:px-14 border-t border-white/10 bg-[#09090b] text-white">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center md:items-start gap-1">
                    <Link href="/" className="font-sans text-xl font-black tracking-tight text-white flex items-center">
                        Detailing<span className="text-[#16acd4]">Garage</span>
                    </Link>
                    <p className="text-xs text-zinc-400">
                        Prime Shine, Saulikhad & Opposite Rani Ki Bain, Gutkar, Mandi (HP)
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
                    <a href="mailto:info@detailinggarage.in" className="flex items-center gap-1.5 hover:text-[#16acd4] transition-colors">
                        <Mail className="w-3.5 h-3.5 text-[#16acd4]" /> info@detailinggarage.in
                    </a>
                    <a href="tel:+918679800074" className="flex items-center gap-1.5 hover:text-[#16acd4] transition-colors">
                        <Phone className="w-3.5 h-3.5 text-[#16acd4]" /> +91 86798 00074
                    </a>
                    <div className="flex items-center gap-3 pl-2">
                        <a href="https://www.facebook.com/detailinggarage.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#1877F2] transition-colors" aria-label="Facebook">
                            <Facebook className="w-4 h-4" />
                        </a>
                        <a href="https://www.instagram.com/detailinggarage.in" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors" aria-label="Instagram">
                            <Instagram className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                <p className="text-[12px] text-zinc-600">
                    © {new Date().getFullYear()} DetailingGarage. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
