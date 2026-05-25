"use client"

export default function CTASection() {
    return (
        <section id="contact" className="py-28 px-6 md:px-14 text-center relative overflow-hidden" style={{ backgroundColor: '#060a14' }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(14, 165, 233, 0.08) 0%, transparent 68%)' }} />

            <div className="max-w-[800px] mx-auto relative z-10 section-reveal p-12 rounded-[40px] glass border border-white/5 shadow-2xl overflow-hidden">
                {/* Abstract Background for Card */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="badge-pill mb-8 mx-auto w-fit">
                    <span className="w-2 h-2 rounded-full animate-blink" style={{ backgroundColor: '#38bdf8' }} />
                    <span className="text-[12px] font-semibold tracking-wider uppercase" style={{ color: '#38bdf8' }}>Available Now</span>
                </div>

                <h2 className="font-display text-[clamp(40px,6vw,64px)] leading-tight tracking-[2px] text-white">
                    Ready to Elevate Your<br />
                    <span className="gradient-text-red">Driving Experience?</span>
                </h2>

                <p className="text-lg mt-6 leading-relaxed font-light max-w-xl mx-auto" style={{ color: '#6b7280' }}>
                    Join thousands of satisfied car owners. Book your premium service today and experience the difference.
                </p>

                <div className="mt-12 flex flex-wrap justify-center gap-5">
                    <button className="btn-primary px-10 py-4 text-base">
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Book My Service
                    </button>

                    <button className="btn-secondary px-10 py-4 text-base group">
                        <svg className="w-5 h-5 mr-3 group-hover:text-green-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        WhatsApp Support
                    </button>
                </div>

                <p className="mt-8 text-[13px] font-medium" style={{ color: '#4b5563' }}>
                    *Guaranteed genuine parts & certified technicians. Reliable service on every visit.
                </p>
            </div>
        </section>
    )
}
