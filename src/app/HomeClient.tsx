"use client"

import { Navbar } from "@/components/layout/navbar"
import HomeFooter from "@/components/home/HomeFooter"
import { ArrowRight, Shield, Sparkles, Droplets, CheckCircle2, Play, ExternalLink } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState } from "react"
import Link from "next/link"

type Post = {
    id: string
    type: string
    url: string
    caption: string | null
    link: string | null
}

const FADE_UP: any = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
}

const STAGGER: any = {
    visible: { transition: { staggerChildren: 0.1 } }
}

export default function HomeClient() {
    const { scrollY } = useScroll()
    const heroY = useTransform(scrollY, [0, 1000], [0, 250])
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0])
    
    const [socialPosts, setSocialPosts] = useState<Post[]>([])

    useEffect(() => {
        fetch("/api/public/posts")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSocialPosts(data.posts.slice(0, 4)) // Only take latest 4
                }
            })
    }, [])

    return (
        <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] selection:bg-[#16acd4] selection:text-black font-sans overflow-x-hidden">
            <Navbar />

            {/* 1. HERO - CINEMATIC PARALLAX */}
            <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
                <motion.div 
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="absolute inset-0 z-0 origin-top"
                >
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <img 
                        src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2400&auto=format&fit=crop" 
                        alt="Premium Detailing" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent z-20" />
                </motion.div>
                
                <div className="relative z-30 w-full max-w-7xl mx-auto px-6 md:px-14 mt-20">
                    <motion.div 
                        initial="hidden" 
                        animate="visible" 
                        variants={STAGGER}
                        className="max-w-4xl"
                    >
                        <motion.div variants={FADE_UP} className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-black/20 backdrop-blur-md mb-8">
                            <Sparkles className="w-4 h-4 text-[#16acd4]" />
                            <span className="text-xs font-bold tracking-[0.25em] uppercase text-zinc-300">Elite Auto Protection Studio</span>
                        </motion.div>
                        
                        <motion.h1 variants={FADE_UP} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.95] mb-8 font-display text-white">
                            We Don't Just Wash.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16acd4] via-[#e8f6fa] to-[#0f80a0]">We Restore Perfection.</span>
                        </motion.h1>
                        
                        <motion.p variants={FADE_UP} className="text-lg md:text-2xl text-zinc-300 max-w-2xl mb-12 font-light leading-relaxed">
                            Master-certified detailing, ceramic coatings, and paint protection film for those who demand the absolute best for their vehicles.
                        </motion.p>
                        
                        <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row gap-5">
                            <Link href="#contact" className="px-8 py-4 bg-[#16acd4] text-black font-bold uppercase tracking-widest text-sm rounded-none hover:bg-white transition-all duration-300 flex items-center justify-center gap-3 group">
                                Book Your Vehicle <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded-none hover:border-[#16acd4] hover:text-[#16acd4] transition-all duration-300 flex items-center justify-center gap-3 group backdrop-blur-sm">
                                <Play className="w-4 h-4" /> View Showreel
                            </button>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3"
                >
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Scroll</span>
                    <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
                        <motion.div 
                            animate={{ y: [0, 48] }} 
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute top-0 left-0 w-full h-1/2 bg-[#16acd4]" 
                        />
                    </div>
                </motion.div>
            </section>

            {/* 2. THE PHILOSOPHY */}
            <section className="py-32 px-6 md:px-14 bg-[#09090b]">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={STAGGER}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
                    >
                        <motion.div variants={FADE_UP}>
                            <div className="text-[#16acd4] font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-4">
                                <span className="w-12 h-[1px] bg-[#16acd4]"></span>
                                The Philosophy
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-8 font-display">
                                Obsessive attention to every single detail.
                            </h2>
                            <p className="text-lg text-zinc-400 leading-relaxed mb-8 font-light">
                                Operating from a state-of-the-art, climate-controlled facility, we utilize the industry's most advanced tools and exclusively formulated compounds. 
                            </p>
                            <p className="text-lg text-zinc-400 leading-relaxed mb-10 font-light">
                                From 100-hour concourse paint corrections to bespoke interior restorations, we treat every vehicle not as a job, but as a masterpiece in the making.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                                <div>
                                    <div className="text-4xl font-display font-bold text-white mb-2">10+</div>
                                    <div className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Years Experience</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-display font-bold text-white mb-2">5k+</div>
                                    <div className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Vehicles Protected</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={FADE_UP} className="relative">
                            <div className="absolute -inset-4 border border-white/10 rounded-none z-0 translate-x-4 translate-y-4" />
                            <div className="relative z-10 aspect-[4/5] overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1552930294-6b595f4c2974?q=80&w=1000&auto=format&fit=crop" alt="Detailing Master" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100" />
                            </div>
                            <div className="absolute -bottom-8 -left-8 bg-[#09090b] p-6 border border-white/10 shadow-2xl z-20 max-w-xs">
                                <Sparkles className="w-6 h-6 text-[#16acd4] mb-3" />
                                <p className="text-sm text-zinc-300 font-medium">"The only acceptable standard is absolute perfection."</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 3. BENTO GRID SERVICES - LUXURY EDITION */}
            <section className="py-32 px-6 md:px-14 bg-[#09090b] relative border-t border-white/5" id="services">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#16acd4]/5 blur-[150px] rounded-full pointer-events-none" />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={FADE_UP}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-display">Signature Services</h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">Engineered protection and flawless finishes for the uncompromising owner.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[320px]">
                        
                        {/* 1. Ceramic Coating (Large Square) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="md:col-span-8 group relative overflow-hidden bg-[#121214] border border-white/5 hover:border-[#16acd4]/30 transition-all duration-500"
                        >
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
                                <img src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700" alt="Ceramic Coating" />
                            </div>
                            <div className="absolute inset-0 p-10 flex flex-col justify-end z-20">
                                <div className="w-12 h-12 bg-[#16acd4]/10 border border-[#16acd4]/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-md">
                                    <Droplets className="w-5 h-5 text-[#16acd4]" />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold font-display mb-3">Ceramic Coating</h3>
                                <p className="text-zinc-400 max-w-md text-sm leading-relaxed mb-6">Molecular-level 9H protection that creates a hydrophobic barrier, blocking UV rays and providing a mirror-like deep gloss that lasts for years.</p>
                                <button className="self-start text-xs font-bold uppercase tracking-widest text-[#16acd4] flex items-center gap-2 group-hover:gap-4 transition-all">
                                    Explore Packages <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>

                        {/* 2. Paint Correction (Tall Rectangle) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="md:col-span-4 md:row-span-2 group relative overflow-hidden bg-[#121214] border border-white/5 hover:border-[#16acd4]/30 transition-all duration-500"
                        >
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                                <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-700" alt="Paint Correction" />
                            </div>
                            <div className="absolute inset-0 p-10 flex flex-col justify-end z-20">
                                <div className="w-12 h-12 bg-[#16acd4]/10 border border-[#16acd4]/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-md">
                                    <Sparkles className="w-5 h-5 text-[#16acd4]" />
                                </div>
                                <h3 className="text-3xl font-bold font-display mb-3">Paint Correction</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">Multi-stage machine polishing to permanently remove swirl marks, holograms, and light scratches, restoring factory clarity.</p>
                                <button className="self-start text-xs font-bold uppercase tracking-widest text-[#16acd4] flex items-center gap-2 group-hover:gap-4 transition-all">
                                    Learn More <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>

                        {/* 3. PPF (Small Square) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="md:col-span-4 group relative overflow-hidden bg-[#121214] border border-white/5 hover:border-[#16acd4]/30 transition-all duration-500"
                        >
                             <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                <img src="https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-20 group-hover:scale-105 group-hover:opacity-30 transition-all duration-700 filter grayscale" alt="PPF" />
                            </div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                                <Shield className="w-8 h-8 text-[#16acd4] mb-4" />
                                <h3 className="text-2xl font-bold font-display mb-2">Protection Film (PPF)</h3>
                                <p className="text-zinc-400 text-sm mb-4">Self-healing invisible armor.</p>
                                <ArrowRight className="w-5 h-5 text-[#16acd4] group-hover:translate-x-2 transition-transform" />
                            </div>
                        </motion.div>

                        {/* 4. Interior (Small Square) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="md:col-span-4 group relative overflow-hidden bg-[#121214] border border-white/5 hover:border-[#16acd4]/30 transition-all duration-500"
                        >
                            <div className="absolute inset-0 z-0 bg-zinc-900/50" />
                            <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold font-display mb-2">Interior Restoration</h3>
                                <p className="text-zinc-400 text-sm mb-4">Leather & fabric revitalization.</p>
                                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-2 transition-transform" />
                            </div>
                        </motion.div>

                        {/* 5. PDI (Full Width) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="md:col-span-12 group relative overflow-hidden bg-[#121214] border border-white/5 hover:border-[#16acd4]/30 transition-all duration-500"
                        >
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10" />
                                <img src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-700" alt="Pre-Delivery Inspection" />
                            </div>
                            <div className="absolute inset-0 p-10 flex flex-col justify-end z-20">
                                <div className="w-12 h-12 bg-[#16acd4]/10 border border-[#16acd4]/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-md">
                                    <Shield className="w-5 h-5 text-[#16acd4]" />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold font-display mb-3">Pre-Delivery Inspection (PDI)</h3>
                                <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed mb-6">Don't let the dealership hide imperfections. Our comprehensive 150-point PDI uncovers factory defects, transport damage, and hidden repaints before you take delivery. We ensure your new vehicle is truly flawless from day one.</p>
                                <button className="self-start text-xs font-bold uppercase tracking-widest text-[#16acd4] flex items-center gap-2 group-hover:gap-4 transition-all">
                                    Book an Inspection <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* 4. HORIZONTAL MARQUEE / SHOWCASE */}
            <section className="py-24 bg-[#09090b] overflow-hidden border-y border-white/5 flex flex-col justify-center">
                <div className="mb-12 px-6 md:px-14">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Recent Masterpieces</h2>
                </div>
                <div className="relative flex overflow-x-hidden w-full group">
                    <div className="py-4 animate-marquee whitespace-nowrap flex gap-6 px-6 items-center">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="relative w-[300px] md:w-[450px] aspect-[16/9] overflow-hidden rounded-none border border-white/10 shrink-0">
                                <img src={`https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop&sig=${i}`} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500" alt={`Showcase ${i}`} />
                            </div>
                        ))}
                    </div>
                    {/* Duplicate for infinite loop */}
                    <div className="py-4 animate-marquee2 whitespace-nowrap flex gap-6 px-6 items-center absolute top-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={`dup-${i}`} className="relative w-[300px] md:w-[450px] aspect-[16/9] overflow-hidden rounded-none border border-white/10 shrink-0">
                                <img src={`https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop&sig=${i}`} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500" alt={`Showcase ${i}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. PROCESS TIMELINE */}
            <section className="py-32 px-6 md:px-14 bg-[#09090b]">
                <div className="max-w-4xl mx-auto">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={FADE_UP}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 font-display">The Path to Perfection</h2>
                        <p className="text-zinc-400">Our meticulous 3-step framework ensures flawless execution.</p>
                    </motion.div>

                    <div className="relative border-l border-white/10 ml-4 md:ml-0 md:border-l-0">
                        {/* Vertical line for desktop */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 -translate-x-1/2" />
                        
                        {[
                            { step: "01", title: "Consultation & Inspection", desc: "Detailed paint depth analysis, defect logging, and a bespoke package tailored to your exact expectations." },
                            { step: "02", title: "The Transformation", desc: "Your vehicle undergoes our exhaustive multi-stage decontamination, correction, and protection process inside our clean-room." },
                            { step: "03", title: "The Ultimate Reveal", desc: "Final quality assurance under sun-match lighting, followed by an unforgettable handover experience." }
                        ].map((item, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 mb-16 last:mb-0 ${index % 2 === 0 ? 'md:flex-row-reverse text-left md:text-right' : 'text-left'}`}
                            >
                                {/* Center Node */}
                                <div className="absolute left-[-21px] md:left-1/2 md:-translate-x-1/2 w-10 h-10 bg-[#09090b] border border-[#16acd4] rounded-full flex items-center justify-center z-10 shadow-[0_0_15px_rgba(22, 172, 212,0.3)]">
                                    <div className="w-2 h-2 bg-[#16acd4] rounded-full" />
                                </div>
                                
                                <div className="md:w-1/2 pl-8 md:pl-0" />
                                <div className={`md:w-1/2 pl-8 md:pl-0 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                                    <div className="text-5xl font-display font-black text-white/5 mb-2">{item.step}</div>
                                    <h3 className="text-2xl font-bold mb-3 font-display">{item.title}</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5.2 THE STUDIO (VIDEO FEATURE) */}
            <section className="py-24 px-6 md:px-14 bg-[#09090b] border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={FADE_UP}
                        className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden group cursor-pointer border border-white/10"
                    >
                        <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-colors duration-700" />
                        <img 
                            src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2400&auto=format&fit=crop" 
                            alt="The Studio" 
                            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-[#16acd4]/90 transition-all duration-500">
                                <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-2 group-hover:text-black transition-colors" />
                            </div>
                        </div>
                        <div className="absolute bottom-10 left-10 z-20 hidden md:block">
                            <h3 className="text-3xl font-bold font-display text-white">Inside The Studio</h3>
                            <p className="text-zinc-300 font-light tracking-wide mt-2">Watch our master technicians at work.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 5.3 LATEST SOCIAL SHOWCASE */}
            <section className="py-24 px-6 md:px-14 bg-[#09090b] border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 font-display">Recent Masterpieces</h2>
                            <p className="text-zinc-400">Straight from our studio floor.</p>
                        </div>
                        <Link href="/social" className="px-6 py-3 border border-white/10 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center gap-2">
                            View Full Gallery <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(socialPosts.length > 0 ? socialPosts : [
                            { id: "1", type: "IMAGE", url: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop", caption: "Ferrari 488 GTB - Full PPF & Ceramic Coating.", link: null },
                            { id: "2", type: "VIDEO", url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop", caption: "Paint correction magic. Watch the swirls disappear.", link: null },
                            { id: "3", type: "IMAGE", url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800&auto=format&fit=crop", caption: "Porsche 911 GT3 RS getting the royal treatment.", link: null },
                            { id: "4", type: "IMAGE", url: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=800&auto=format&fit=crop", caption: "Bespoke interior restoration. Better than factory.", link: null }
                        ]).map((post, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                key={post.id} 
                                className="group relative bg-[#121214] rounded-2xl overflow-hidden border border-white/5 hover:border-[#16acd4]/30 transition-all cursor-pointer aspect-[4/5]"
                                onClick={() => post.link && window.open(post.link, "_blank")}
                            >
                                <img src={post.url} alt="Showcase" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                
                                {(post.type === "VIDEO" || post.type === "REEL") && (
                                    <div className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center">
                                        <Play className="w-4 h-4 text-white ml-0.5" />
                                    </div>
                                )}

                                {post.link && (
                                    <div className="absolute top-4 left-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                {post.caption && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                        <p className="text-sm text-zinc-300 line-clamp-3">{post.caption}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5.5 FAQ ACCORDION */}
            <section className="py-32 px-6 md:px-14 bg-[#09090b] border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 font-display">Client Inquiries</h2>
                        <p className="text-zinc-400">Everything you need to know about our premium services.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "How long does a full ceramic coating process take?", a: "A professional 9H ceramic coating application, including multi-stage paint correction, typically requires 3 to 4 days. This allows for proper curing in our climate-controlled clean room." },
                            { q: "Do you offer mobile detailing services?", a: "No. To maintain our strict quality control standards, all work is performed in our specialized studio where lighting, temperature, and dust levels are meticulously managed." },
                            { q: "What is the difference between PPF and Ceramic Coating?", a: "PPF (Paint Protection Film) is a physical, self-healing vinyl wrap that prevents rock chips and deep scratches. Ceramic Coating is a liquid polymer that hardens to provide immense gloss, UV protection, and hydrophobic properties. They are often combined for ultimate protection." },
                            { q: "How do I maintain my vehicle after a coating?", a: "We provide all clients with a bespoke maintenance guide. We also offer exclusive 'Maintenance Wash' programs specifically designed to safely clean and rejuvenate coated vehicles without degrading the protective layer." }
                        ].map((faq, i) => (
                            <div key={i} className="group border border-white/10 rounded-2xl bg-[#121214] overflow-hidden hover:border-[#16acd4]/30 transition-colors">
                                <details className="w-full peer cursor-pointer">
                                    <summary className="w-full flex items-center justify-between p-6 font-semibold text-lg text-zinc-200 list-none font-display">
                                        {faq.q}
                                        <span className="text-[#16acd4] group-open:rotate-45 transition-transform duration-300 text-2xl">+</span>
                                    </summary>
                                    <div className="px-6 pb-6 text-zinc-400 leading-relaxed text-sm">
                                        {faq.a}
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. MAGNETIC CTA */}
            <section className="py-32 px-6 bg-[#121214] border-t border-white/5 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[60vh]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#16acd4]/10 via-[#09090b] to-[#09090b]" />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-3xl mx-auto flex flex-col items-center"
                >
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 font-display">
                        Reserve Your <br /> <span className="text-[#16acd4] italic">Masterpiece</span>
                    </h2>
                    <p className="text-lg text-zinc-400 mb-12 max-w-xl font-light">
                        Due to the extensive time dedicated to each vehicle, we operate strictly by appointment and accept a limited volume.
                    </p>
                    
                    <button className="relative group overflow-hidden rounded-full p-[1px]">
                        <span className="absolute inset-0 bg-gradient-to-r from-[#16acd4] via-[#e8f6fa] to-[#16acd4] rounded-full animate-[spin_3s_linear_infinite]" />
                        <div className="px-12 py-5 bg-[#09090b] rounded-full relative z-10 group-hover:bg-transparent transition-colors duration-500">
                            <span className="font-bold uppercase tracking-widest text-sm text-[#16acd4] group-hover:text-black transition-colors duration-500">
                                Apply for Booking
                            </span>
                        </div>
                    </button>
                </motion.div>
            </section>

            <HomeFooter />

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-100%); }
                }
                @keyframes marquee2 {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(0%); }
                }
                .animate-marquee {
                    animation: marquee 25s linear infinite;
                }
                .animate-marquee2 {
                    animation: marquee2 25s linear infinite;
                }
            `}} />
        </div>
    )
}
