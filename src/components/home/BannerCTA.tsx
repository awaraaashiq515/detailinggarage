"use client"

import { MousePointer2, Star } from "lucide-react"

export default function BannerCTA() {
    return (
        <section className="py-24 px-6 md:px-14 relative overflow-hidden flex items-center">
            {/* Background with dark overlay/image */}
            <div className="absolute inset-0 bg-zinc-950 z-0" />
            <div className="absolute inset-0 bg-cover bg-center opacity-40 z-[1]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000&auto=format&fit=crop')" }} />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-[2]" />

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-center gap-10 relative z-10">

                <div className="space-y-8 text-center md:text-left">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-[#16acd4]/30 rounded-full mb-2">
                            <Star className="w-3 h-3 text-[#16acd4] fill-[#16acd4]" />
                            <span className="text-[10px] font-bold text-[#16acd4] uppercase tracking-widest">Limited Time Offer</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight">
                            Elevate Your Drive. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16acd4] to-[#ffd070]">Book Your Session.</span>
                        </h2>
                        <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-lg mt-4">
                            Reserve your vehicle's transformation today. Experience the pinnacle of automotive care with our master detailers.
                        </p>
                    </div>

                    <button className="bg-gradient-to-r from-[#16acd4] to-[#0f80a0] text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(22, 172, 212,0.3)] hover:shadow-[0_0_40px_rgba(22, 172, 212,0.5)] hover:scale-105 flex items-center gap-2 mx-auto md:mx-0">
                        Schedule Appointment <MousePointer2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Floating cards/images effect */}
                <div className="hidden md:flex justify-end gap-6 h-[400px] items-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#16acd4]/20 blur-[100px] rounded-full z-0" />
                    
                    <div className="w-48 h-64 rounded-3xl overflow-hidden border border-white/10 -rotate-6 shadow-2xl relative z-10 group cursor-pointer hover:rotate-0 transition-transform duration-500">
                        <img src="https://images.unsplash.com/photo-1618641986557-1def23625997?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Ceramic" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                            <span className="text-white font-bold text-sm tracking-wide">Ceramic Pro</span>
                        </div>
                    </div>
                    
                    <div className="w-56 h-72 rounded-3xl overflow-hidden border border-white/20 rotate-6 shadow-2xl relative z-20 translate-y-8 group cursor-pointer hover:rotate-0 transition-transform duration-500">
                        <img src="https://images.unsplash.com/photo-1552930294-6b595f4c2974?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Correction" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-5">
                            <span className="text-[#16acd4] font-bold text-base tracking-wide">Paint Correction</span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
