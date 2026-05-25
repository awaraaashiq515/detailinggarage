"use client"

import { ShieldCheck, Award, Zap, Droplets, Wrench, Diamond } from "lucide-react"

export default function PartnersSection() {
    const partners = [
        { icon: <ShieldCheck />, name: "XPEL" },
        { icon: <Diamond />, name: "Ceramic Pro" },
        { icon: <Zap />, name: "SunTek" },
        { icon: <Award />, name: "Gtechniq" },
        { icon: <Droplets />, name: "Rupes" },
        { icon: <Wrench />, name: "Meguiar's" },
    ]

    return (
        <section className="py-16 bg-zinc-950 border-y border-zinc-900 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950 z-10 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 relative z-0">
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                    {partners.map((partner, i) => (
                        <div key={i} className="flex items-center gap-3 font-sans text-2xl font-black text-white hover:text-[#16acd4] transition-colors cursor-pointer group">
                            <span className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-[#16acd4] group-hover:border-[#16acd4]/50 shadow-lg transition-all">
                                {partner.icon}
                            </span>
                            {partner.name.toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
