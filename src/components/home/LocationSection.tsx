"use client"

import { Shield, Sparkles, PaintBucket, Search, ArrowRight, Layers } from "lucide-react"

const services = [
    { name: 'Ceramic Coating', count: '9H Hardness', icon: <Sparkles className="w-5 h-5" />, img: 'https://images.unsplash.com/photo-1618641986557-1def23625997?q=80&w=800&auto=format&fit=crop' },
    { name: 'Paint Protection Film', count: '10 Year Warranty', icon: <Shield className="w-5 h-5" />, img: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop' },
    { name: 'Paint Correction', count: 'Swirl Removal', icon: <PaintBucket className="w-5 h-5" />, img: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?q=80&w=800&auto=format&fit=crop' },
    { name: 'Interior Detailing', count: 'Deep Clean & Sanitize', icon: <Search className="w-5 h-5" />, img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop' },
    { name: 'Window Tinting', count: 'Heat Rejection', icon: <Layers className="w-5 h-5" />, img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=800&auto=format&fit=crop' },
]

export default function LocationSection() {
    return (
        <section className="py-24 px-6 md:px-14 bg-zinc-900 border-t border-zinc-800">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 section-reveal">
                    <div className="text-[#16acd4] text-xs font-black uppercase tracking-widest mb-3">Service Catalog</div>
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">Our Signature Services</h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#16acd4] to-[#ffd070] mx-auto rounded-full mt-6 mb-6"></div>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-base font-medium leading-relaxed opacity-90">
                        Explore our comprehensive range of high-end detailing services designed to protect your investment and turn heads on the road.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Featured Service - Left Side Large Card */}
                    <div className="flex-1 group relative rounded-[2rem] overflow-hidden shadow-2xl aspect-square lg:aspect-auto min-h-[450px] border border-white/10 section-reveal cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1618641986557-1def23625997?q=80&w=1200&auto=format&fit=crop" alt="Featured Service" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        <div className="absolute bottom-10 left-10 right-10 flex flex-col justify-end">
                            <div className="mb-4">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#16acd4] text-black text-[10px] font-black uppercase tracking-widest rounded-lg mb-4">
                                    <Sparkles className="w-3 h-3" /> Most Popular
                                </div>
                                <h3 className="text-4xl font-black text-white tracking-tight mb-2">Ceramic Coating</h3>
                                <p className="text-zinc-300 font-medium text-sm">Experience the ultimate gloss and protection with our multi-layer 9H ceramic coating solutions.</p>
                            </div>
                            <button className="w-full md:w-auto px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest border border-white/20 flex items-center justify-center gap-2 hover:bg-[#16acd4] hover:text-black hover:border-[#16acd4] transition-all shadow-lg active:scale-95 group-hover:bg-[#16acd4] group-hover:text-black group-hover:border-[#16acd4]">
                                View Package <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Grid of smaller services - Right Side */}
                    <div className="flex-[1.2] grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((loc, i) => (
                            <div key={i} className="group bg-zinc-950/50 rounded-3xl p-4 flex items-center gap-5 shadow-lg hover:shadow-2xl hover:bg-zinc-800 transition-all duration-300 border border-white/5 hover:border-[#16acd4]/30 cursor-pointer section-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 relative border border-white/10">
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                    <img src={loc.img} alt={loc.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 flex items-center justify-center text-[#16acd4] z-20 group-hover:opacity-0 transition-opacity duration-300 drop-shadow-md">
                                        {loc.icon}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-base font-bold text-white group-hover:text-[#16acd4] transition-colors">{loc.name}</h4>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{loc.count}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-zinc-400 flex items-center justify-center group-hover:bg-[#16acd4] group-hover:text-black group-hover:border-[#16acd4] transition-all shadow-sm">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
