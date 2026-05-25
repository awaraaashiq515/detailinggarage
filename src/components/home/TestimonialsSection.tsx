"use client"

import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"

export default function TestimonialsSection() {
    return (
        <section className="py-24 px-6 md:px-14 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                {/* Customer Image with Decorative elements */}
                <div className="flex-1 relative w-full max-w-sm lg:max-w-none mx-auto section-reveal">
                    <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#16acd4]/10 rounded-full -z-10 blur-xl" />
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl z-10 aspect-[0.9] border-8 border-white ring-1 ring-zinc-100">
                        <img src="https://images.unsplash.com/photo-1618641986557-1def23625997?q=80&w=800&auto=format&fit=crop" alt="Customer Car" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    {/* Experience Badge */}
                    <div className="absolute -bottom-6 -left-6 bg-zinc-950 p-5 rounded-2xl shadow-2xl z-20 flex items-center gap-4 border border-zinc-800 animate-bounce-arrow">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#16acd4] to-[#0f80a0] flex items-center justify-center text-black shadow-lg">
                            <Star className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white tracking-tight">5,000+</div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Vehicles Restored</div>
                        </div>
                    </div>
                </div>

                {/* Testimonial Content */}
                <div className="flex-1 space-y-8 section-reveal" style={{ transitionDelay: '0.2s' }}>
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2">
                            <span className="w-6 h-0.5 bg-[#16acd4] rounded-full"></span>
                            <div className="text-[#16acd4] text-xs font-black uppercase tracking-widest">Client Experiences</div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-zinc-900 leading-[1.1] tracking-tight">
                            Hear from our <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16acd4] to-[#0f80a0]">Premium Clients</span>
                        </h2>
                    </div>

                    <div className="relative">
                        <Quote className="absolute -top-10 -left-10 w-24 h-24 text-zinc-100 -z-10" />
                        <div className="space-y-6">
                            <div className="flex items-center gap-1.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-[#16acd4] fill-[#16acd4]" />
                                ))}
                            </div>
                            <p className="text-zinc-600 text-lg font-medium leading-relaxed italic">
                                "The level of perfectionism at this studio is unmatched. They applied Paint Protection Film and Ceramic Coating to my Porsche 911, and it looks better than the day it left the showroom. Highly recommended for true enthusiasts."
                            </p>
                            <div className="flex items-center gap-4 pt-6 border-t border-zinc-100">
                                <div className="w-14 h-14 rounded-full bg-zinc-200 overflow-hidden border-2 border-white shadow-md">
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" alt="Client" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-zinc-900">James Rutherford</h4>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Porsche 911 Owner</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-3 pt-4">
                        <button className="w-12 h-12 rounded-full border border-zinc-200 text-zinc-400 flex items-center justify-center hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all duration-300 shadow-sm active:scale-95">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-950 text-white flex items-center justify-center hover:bg-[#16acd4] hover:text-black hover:border-[#16acd4] transition-all duration-300 shadow-md active:scale-95">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>
        </section>
    )
}
