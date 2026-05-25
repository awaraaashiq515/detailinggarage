"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send } from "lucide-react"

export default function HomeFooter() {
    return (
        <footer className="bg-zinc-950 text-white py-16 px-6 md:px-14 border-t border-zinc-900 mt-auto">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand & Social */}
                    <div className="space-y-6">
                        <Link href="/" className="font-sans text-3xl font-black tracking-tight text-white flex items-center">
                            Detailing<span className="text-[#16acd4]">Garage</span>
                        </Link>
                        <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                            The ultimate destination for premium automotive care. We deliver uncompromising quality and state-of-the-art protection for the world's most exclusive vehicles.
                        </p>
                        <div className="flex items-center gap-3">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <button key={i} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-[#16acd4] hover:border-[#16acd4] transition-all duration-300 shadow-lg">
                                    <Icon className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Explore Services</h4>
                        <ul className="space-y-3">
                            {['Ceramic Coating', 'Paint Protection Film', 'Paint Correction', 'Interior Restoration', 'Window Tinting'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-zinc-400 hover:text-[#16acd4] transition-colors text-sm font-medium flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#16acd4] opacity-0 group-hover:opacity-100 transition-all" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Visit The Studio</h4>
                        <ul className="space-y-5">
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#16acd4] flex-shrink-0 shadow-lg">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="text-zinc-400 text-sm font-medium leading-snug pt-2">123 Detailers Ave, Automotive District, CA 90210</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#16acd4] flex-shrink-0 shadow-lg">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span className="text-zinc-400 text-sm font-medium leading-snug pt-2">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#16acd4] flex-shrink-0 shadow-lg">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="text-zinc-400 text-sm font-medium leading-snug pt-2">concierge@detailinggarage.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Join The Elite</h4>
                        <p className="text-zinc-400 text-sm font-medium">Subscribe for exclusive offers, detailing tips, and event invitations.</p>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 px-6 outline-none focus:border-[#16acd4]/50 focus:bg-zinc-800 transition-all text-sm font-medium text-white placeholder:text-zinc-600 shadow-inner"
                            />
                            <button className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-[#16acd4] to-[#0f80a0] text-black px-5 rounded-full hover:shadow-[0_0_15px_rgba(22, 172, 212,0.4)] transition-all flex items-center justify-center">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-600 text-xs font-bold tracking-wider text-center md:text-left uppercase">
                        © {new Date().getFullYear()} Detailing Garage. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {['Privacy Policy', 'Terms of Service'].map((item) => (
                            <Link key={item} href="#" className="text-zinc-600 hover:text-white transition-colors text-xs font-bold tracking-wider uppercase">
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
