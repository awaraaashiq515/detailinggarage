"use client"

import { MessageSquareText, Wrench, Sparkles } from "lucide-react"

const steps = [
    {
        number: "01",
        title: "Expert Consultation",
        description: "We inspect your vehicle's condition and discuss the perfect tailored package for your goals.",
        icon: <MessageSquareText className="w-8 h-8" />
    },
    {
        number: "02",
        title: "Studio Transformation",
        description: "Our master detailers meticulously prep, correct, and protect your vehicle in our climate-controlled studio.",
        icon: <Wrench className="w-8 h-8" />
    },
    {
        number: "03",
        title: "The Ultimate Reveal",
        description: "Experience the jaw-dropping gloss and flawless finish as we unveil your renewed masterpiece.",
        icon: <Sparkles className="w-8 h-8" />
    }
]

export default function HowItWorksSection() {
    return (
        <section className="py-24 px-6 md:px-14 bg-zinc-950 border-t border-zinc-900">
            <div className="max-w-7xl mx-auto text-center">
                <div className="space-y-3 mb-20 section-reveal">
                    <div className="text-[#16acd4] text-xs font-black uppercase tracking-widest">Our Process</div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">The Path to Perfection</h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#16acd4] to-[#ffd070] mx-auto rounded-full mt-6 mb-6"></div>
                    <p className="text-zinc-400 max-w-xl mx-auto text-base font-medium leading-relaxed">
                        A systematic, uncompromising approach to achieving the most stunning automotive finishes imaginable.
                    </p>
                </div>

                <div className="relative flex flex-col md:flex-row items-start justify-center gap-12 md:gap-6">
                    {steps.map((step, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group section-reveal relative" style={{ transitionDelay: `${i * 0.2}s` }}>
                            {/* Connector line for desktop */}
                            {i < steps.length - 1 && (
                                <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] right-[calc(-50%+3rem)] h-[2px] bg-gradient-to-r from-[#16acd4]/50 to-transparent z-0" />
                            )}

                            {/* Icon Container */}
                            <div className="relative mb-8 z-10">
                                <div className="absolute inset-0 bg-[#16acd4]/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                                <div className="w-24 h-24 rounded-3xl border border-white/10 flex items-center justify-center text-[#16acd4] bg-zinc-900 shadow-2xl group-hover:bg-gradient-to-br group-hover:from-[#16acd4] group-hover:to-[#0f80a0] group-hover:text-black group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 relative">
                                    {step.icon}
                                </div>
                                {/* Step Number Badge */}
                                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-black border border-white/20 flex items-center justify-center text-sm font-black text-white shadow-xl group-hover:border-[#16acd4] transition-colors">
                                    {step.number}
                                </div>
                            </div>

                            <div className="space-y-3 px-6 text-center">
                                <h3 className="text-xl font-bold text-white group-hover:text-[#16acd4] transition-colors">{step.title}</h3>
                                <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
