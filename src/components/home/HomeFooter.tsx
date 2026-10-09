"use client"

import Link from "next/link"
import { Facebook, Instagram, Mail, Phone, MapPin, Send, MessageCircle, Clock, ExternalLink } from "lucide-react"

export default function HomeFooter() {
    return (
        <footer className="bg-zinc-950 text-white py-16 px-6 md:px-14 border-t border-zinc-900 mt-auto relative overflow-hidden">
            {/* Subtle glow backdrop */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#16acd4]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* 1. Brand & Social */}
                    <div className="space-y-6">
                        <Link href="/" className="font-sans text-3xl font-black tracking-tight text-white flex items-center">
                            Detailing<span className="text-[#16acd4]">Garage</span>
                        </Link>
                        <p className="text-zinc-400 text-sm font-light leading-relaxed">
                            Himachal’s premier studio for certified PDI pre-delivery inspections, multi-stage paint correction, 9H ceramic coatings, and precision PPF installations.
                        </p>
                        
                        {/* Social Links */}
                        <div className="space-y-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Connect With Us</span>
                            <div className="flex items-center gap-3">
                                <a 
                                    href="https://www.facebook.com/detailinggarage.in" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    aria-label="Facebook"
                                    className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-300 shadow-lg group"
                                >
                                    <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </a>
                                <a 
                                    href="https://www.instagram.com/detailinggarage.in" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    aria-label="Instagram"
                                    className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent transition-all duration-300 shadow-lg group"
                                >
                                    <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </a>
                                <a 
                                    href="https://wa.me/918679800074" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    aria-label="WhatsApp"
                                    className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#25D366] hover:border-[#25D366] transition-all duration-300 shadow-lg group"
                                >
                                    <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </a>
                                <a 
                                    href="tel:+918679800074" 
                                    aria-label="Call Detailing Garage"
                                    className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-[#16acd4] hover:border-[#16acd4] transition-all duration-300 shadow-lg group"
                                >
                                    <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* 2. Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Services & Explore</h4>
                        <ul className="space-y-3">
                            {[
                                { name: 'PDI Pre-Delivery Inspection', href: '/pdi' },
                                { name: 'Paint Protection Film (PPF)', href: '/#services' },
                                { name: '9H Ceramic Coating', href: '/#services' },
                                { name: 'Multi-Stage Paint Correction', href: '/#services' },
                                { name: 'Studio Deliveries & Stories', href: '/social' },
                                { name: 'Client Portal', href: '/portal' },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-zinc-400 hover:text-[#16acd4] transition-colors text-sm font-medium flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#16acd4] opacity-0 group-hover:opacity-100 transition-all" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 3. Primary Locations in Mandi */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Locations in Mandi</h4>
                        <div className="space-y-4">
                            {/* Location 1 */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#16acd4] shrink-0 mt-0.5">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Studio & Workshop</span>
                                    <p className="text-zinc-300 text-sm font-medium leading-snug">
                                        Prime Shine, Saulikhad, Mandi, HP
                                    </p>
                                </div>
                            </div>

                            {/* Location 2 */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#16acd4] shrink-0 mt-0.5">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Inspection & Delivery Hub</span>
                                    <p className="text-zinc-300 text-sm font-medium leading-snug">
                                        Opposite Rani Ki Bain, Gutkar, Mandi – 175021
                                    </p>
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div className="flex items-center gap-3 pt-2 text-xs text-zinc-400">
                                <Clock className="w-3.5 h-3.5 text-[#16acd4] shrink-0" />
                                <span>Mon – Sun: 9:30 AM – 7:30 PM</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. Contact & Inquiries */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Direct Inquiries</h4>
                        <ul className="space-y-4">
                            {/* Email */}
                            <li>
                                <a 
                                    href="mailto:info@detailinggarage.in" 
                                    className="flex items-start gap-3 group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#16acd4] group-hover:bg-[#16acd4] group-hover:text-black transition-colors shrink-0">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Official Email</span>
                                        <p className="text-zinc-300 group-hover:text-[#16acd4] transition-colors text-sm font-medium leading-snug break-all">
                                            info@detailinggarage.in
                                        </p>
                                    </div>
                                </a>
                            </li>

                            {/* Phone Numbers */}
                            <li>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#16acd4] shrink-0">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Call / WhatsApp</span>
                                        <div className="flex flex-col text-sm font-medium">
                                            <a href="tel:+918679800074" className="text-zinc-300 hover:text-[#16acd4] transition-colors">
                                                +91 86798 00074
                                            </a>
                                            <a href="tel:+918579800074" className="text-zinc-300 hover:text-[#16acd4] transition-colors">
                                                +91 85798 00074
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>

                        {/* Quick Booking CTA */}
                        <div className="pt-2">
                            <Link 
                                href="/pdi" 
                                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#16acd4] hover:bg-white text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#16acd4]/20"
                            >
                                <span>Book PDI Inspection</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-500 text-xs font-semibold tracking-wider text-center md:text-left">
                        © {new Date().getFullYear()} DETAILING GARAGE. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-zinc-500 hover:text-white transition-colors text-xs font-semibold tracking-wider uppercase">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-zinc-500 hover:text-white transition-colors text-xs font-semibold tracking-wider uppercase">
                            Terms of Service
                        </Link>
                        <a href="https://maps.google.com/?q=Detailing+Garage+Mandi" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors text-xs font-semibold tracking-wider uppercase">
                            Google Map
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
