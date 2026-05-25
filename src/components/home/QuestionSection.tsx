"use client"

import { MessageCircle } from "lucide-react"

export default function QuestionSection() {
    return (
        <section className="py-12 px-6 md:px-14 bg-zinc-900 border-t border-zinc-800">
            <div className="max-w-7xl mx-auto rounded-[2rem] overflow-hidden relative group shadow-2xl">
                {/* Background with dark overlay/image */}
                <div className="absolute inset-0 bg-zinc-950 z-0" />
                <div className="absolute inset-0 bg-cover bg-center opacity-40 z-[1]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2000&auto=format&fit=crop')" }} />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 to-transparent z-[2]" />

                <div className="relative z-10 px-8 py-16 md:px-20 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                    <div className="text-center md:text-left space-y-3">
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Demand Perfection?</h2>
                        <p className="text-zinc-400 font-medium text-base">Consult with our master detailers to discuss your vehicle's tailored protection plan.</p>
                    </div>

                    <button className="flex items-center gap-3 bg-gradient-to-r from-[#16acd4] to-[#0f80a0] text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(22, 172, 212,0.3)] active:scale-95 group-hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_40px_rgba(22, 172, 212,0.5)] shrink-0">
                        <MessageCircle className="w-5 h-5" /> Request Quote
                    </button>
                </div>
            </div>
        </section>
    )
}
