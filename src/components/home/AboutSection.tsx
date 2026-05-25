"use client"

import { Check, ShieldCheck, Award, Wrench } from "lucide-react"

export default function AboutSection() {
    return (
        <section className="py-32 px-6 md:px-14 bg-zinc-950 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#16acd4]/10 rounded-full blur-[120px] -z-10 translate-y-[-50%] translate-x-[-20%]" />

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">

                {/* Image Collage Refined */}
                <div className="flex-1 relative w-full max-w-xl mx-auto lg:mx-0">
                    <div className="relative w-full aspect-[1.1] rounded-3xl overflow-hidden shadow-2xl z-10 border-8 border-zinc-900">
                        <img src="https://images.unsplash.com/photo-1552930294-6b595f4c2974?q=80&w=2000&auto=format&fit=crop" alt="Premium Detailing" className="w-full h-full object-cover" />
                    </div>

                    {/* Secondary smaller overlay images */}
                    <div className="absolute top-1/2 -right-6 w-40 aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-900 z-30 hidden xl:block translate-y-[-100%] transition-transform hover:scale-105 duration-500">
                        <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop" alt="Experience" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-6 -right-8 w-44 aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-900 z-30 hidden xl:block transition-transform hover:scale-105 duration-500">
                        <img src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=1000&auto=format&fit=crop" alt="Detailing" className="w-full h-full object-cover" />
                    </div>

                    {/* Large Watermark Text */}
                    <div className="absolute -bottom-8 -left-8 z-[5] pointer-events-none select-none opacity-[0.02]">
                        <h3 className="text-[140px] font-sans font-black text-white leading-none whitespace-nowrap uppercase">Perfection</h3>
                    </div>
                </div>

                {/* Content Section Refined */}
                <div className="flex-1 space-y-10 animate-in-right">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2">
                            <span className="w-6 h-0.5 bg-[#16acd4] rounded-full"></span>
                            <div className="text-[#16acd4] text-xs font-black uppercase tracking-widest">Our Craftsmanship</div>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tight">
                            Obsessive Attention <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16acd4] to-[#ffd070]">To Every Detail</span>
                        </h2>
                        <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-xl opacity-90">
                            We don't just wash cars; we restore, protect, and elevate them. Our master technicians use the world's most advanced products and techniques to deliver a showroom finish that lasts.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {[
                            { icon: <Award />, title: "Master Certified Detailers", desc: "Our team has undergone thousands of hours of training and holds elite certifications in PPF and Ceramic Coatings." },
                            { icon: <ShieldCheck />, title: "State-of-the-Art Facility", desc: "Climate-controlled, dust-free environments equipped with specialized lighting to spot even the finest imperfections." },
                            { icon: <Wrench />, title: "Uncompromising Quality", desc: "From multi-stage paint correction to interior sanitization, we never cut corners. Excellence is our only standard." }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-5 group">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 text-[#16acd4] flex items-center justify-center flex-shrink-0 group-hover:bg-[#16acd4] group-hover:text-black group-hover:scale-110 transition-all duration-300 shadow-lg">
                                    <div className="w-5 h-5">{item.icon}</div>
                                </div>
                                <div className="pt-1">
                                    <h4 className="font-bold text-white text-base mb-1 group-hover:text-[#16acd4] transition-colors">{item.title}</h4>
                                    <p className="text-sm text-zinc-400 font-medium leading-relaxed opacity-80">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="bg-white text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-[#16acd4] hover:shadow-[0_0_30px_rgba(22, 172, 212,0.3)] transition-all transform hover:-translate-y-1 active:scale-95">
                        Discover Our Process
                    </button>
                </div>

            </div>
        </section>
    )
}
