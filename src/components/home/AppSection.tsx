"use client"

import { PlayCircle, Apple } from "lucide-react"

export default function AppSection() {
    return (
        <section className="py-24 px-6 md:px-14 bg-gradient-to-br from-[#1a1405] to-zinc-950 relative overflow-hidden border-t border-[#16acd4]/20">
            {/* Wavy Background detail */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen">
                <svg width="100%" height="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="#16acd4" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,213.3C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
                <div className="flex-1 space-y-8 text-center md:text-left">
                    <div className="space-y-4">
                        <div className="text-[#16acd4] text-xs font-black uppercase tracking-widest mb-3">Mobile Experience</div>
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                            Track Your Vehicle's <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16acd4] to-[#ffd070]">Transformation</span>
                        </h2>
                        <p className="text-zinc-400 text-base font-medium leading-relaxed max-w-lg">
                            Download our exclusive app to receive live updates, view high-res progress photos, and manage your maintenance schedule directly from your phone.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                        <button className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 text-white px-6 py-3 rounded-2xl shadow-xl hover:bg-zinc-800 hover:border-[#16acd4]/50 hover:shadow-[0_0_20px_rgba(22, 172, 212,0.15)] transition-all active:scale-95 group">
                            <Apple className="w-8 h-8 group-hover:text-[#16acd4] transition-colors" />
                            <div className="text-left leading-none">
                                <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Download on</div>
                                <div className="text-base font-black">App Store</div>
                            </div>
                        </button>
                        <button className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 text-white px-6 py-3 rounded-2xl shadow-xl hover:bg-zinc-800 hover:border-[#16acd4]/50 hover:shadow-[0_0_20px_rgba(22, 172, 212,0.15)] transition-all active:scale-95 group">
                            <PlayCircle className="w-8 h-8 group-hover:text-[#16acd4] transition-colors" />
                            <div className="text-left leading-none">
                                <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Get it on</div>
                                <div className="text-base font-black">Google Play</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="flex-[0.8] flex justify-center md:justify-end relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square bg-[#16acd4]/20 blur-[80px] rounded-full z-0" />
                    <div className="relative w-[280px] md:w-[320px] aspect-[1/2] animate-float drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 border-8 border-zinc-900 rounded-[3rem] overflow-hidden bg-zinc-950 flex flex-col items-center justify-center">
                        <div className="text-[#16acd4] font-black text-2xl tracking-widest mb-4">STUDIO</div>
                        <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-[#16acd4] animate-spin" />
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-6">Loading Preview...</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
