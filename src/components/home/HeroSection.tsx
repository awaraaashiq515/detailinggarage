"use client"

import { Shield, Sparkles, Droplets, PaintBucket, Search, Play, ArrowRight, Star, CheckCircle } from "lucide-react"
import Link from "next/link"

const categories = [
    { icon: <Shield className="w-6 h-6" />, label: 'PPF Installation', desc: 'Invisible armor for your paint' },
    { icon: <Sparkles className="w-6 h-6" />, label: 'Ceramic Coating', desc: '9H hardness & extreme gloss' },
    { icon: <PaintBucket className="w-6 h-6" />, label: 'Paint Correction', desc: 'Remove swirls & scratches' },
    { icon: <Droplets className="w-6 h-6" />, label: 'Deep Detailing', desc: 'Interior & exterior perfection' },
]

export default function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-zinc-950">
            {/* Background Image & Overlays */}
            <div
                className="absolute inset-0 z-0 scale-105"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2070&auto=format&fit=crop')`, // Premium dark car detailing image
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            />
            {/* Multi-layer gradient for depth */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-zinc-950/90 via-zinc-950/60 to-zinc-950" />
            <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,rgba(22, 172, 212,0.15)_0%,transparent_70%)]" />

            {/* Content */}
            <div className="relative z-[5] flex flex-col items-center w-full max-w-5xl mt-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(22, 172, 212,0.1)]">
                    <span className="w-2 h-2 rounded-full bg-[#16acd4] animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Premium Auto Studio</span>
                </div>

                {/* Main Headline */}
                <h1 className="font-sans font-black text-5xl md:text-7xl leading-[1.1] text-white mb-6 tracking-tight drop-shadow-2xl">
                    Ultimate Protection For Your <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16acd4] via-[#ffd070] to-[#16acd4]">Automotive Masterpiece</span>
                </h1>

                <p className="text-gray-300 text-lg md:text-xl max-w-2xl font-medium leading-relaxed mb-10">
                    Experience unrivaled perfection with our state-of-the-art ceramic coatings, paint protection film, and bespoke detailing services.
                </p>

                {/* Call to Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full justify-center">
                    <Link href="#services" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#16acd4] to-[#0f80a0] text-zinc-950 font-black uppercase tracking-widest text-sm hover:scale-105 hover:shadow-[0_0_30px_rgba(22, 172, 212,0.4)] transition-all duration-300 flex items-center justify-center gap-2">
                        Explore Services <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold uppercase tracking-widest text-sm hover:bg-white/20 backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2">
                        <Play className="w-4 h-4 fill-white" /> Watch Video
                    </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center items-center gap-8 text-white/70 text-sm font-semibold uppercase tracking-widest border-t border-white/10 pt-8">
                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#16acd4]" /> Certified Installers</div>
                    <div className="flex items-center gap-2 hidden md:flex"><CheckCircle className="w-4 h-4 text-[#16acd4]" /> 5-Year Warranty</div>
                    <div className="flex items-center gap-2"><Star className="w-4 h-4 text-[#16acd4] fill-[#16acd4]" /> 4.9/5 Rated</div>
                </div>
            </div>

            {/* Overlapping Glassmorphism Cards at the bottom */}
            <div className="absolute bottom-0 z-10 w-full px-6 flex justify-center translate-y-1/2">
                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, i) => (
                        <div key={i} className="bg-zinc-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center p-8 group hover:-translate-y-2 hover:border-[#16acd4]/50 hover:bg-zinc-900 transition-all duration-500 overflow-hidden relative">
                            {/* Hover glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#16acd4]/20 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center text-[#16acd4] mb-5 shadow-inner group-hover:scale-110 transition-transform duration-500 relative z-10">
                                {cat.icon}
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-2 relative z-10 group-hover:text-[#16acd4] transition-colors">{cat.label}</h3>
                            <p className="text-sm text-zinc-400 font-medium relative z-10">{cat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
