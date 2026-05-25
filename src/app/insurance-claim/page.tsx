"use client"

import { Navbar } from "@/components/layout/navbar"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function InsuranceClaimPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)

    useEffect(() => {
        // Check if user is logged in
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me')
                if (res.ok) {
                    setIsLoggedIn(true)
                }
            } catch {
                // Not logged in
            } finally {
                setCheckingAuth(false)
            }
        }
        checkAuth()
    }, [])

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#08090c' }}>
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 md:px-14 text-center">
                {/* Ambient Blobs */}
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>

                <div className="glass inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8">
                    <span className="w-2 h-2 rounded-full animate-blink" style={{ backgroundColor: '#fb923c' }}></span>
                    <span className="text-[13px] font-semibold tracking-[0.8px] uppercase" style={{ color: '#fb923c' }}>Insurance & Claim Services</span>
                </div>

                <h1 className="font-display text-[clamp(42px,7vw,72px)] leading-[1] tracking-[3px] text-white max-w-4xl mx-auto">
                    Insurance Claim<br />
                    <span className="font-['Playfair_Display'] italic font-bold bg-gradient-to-r from-[#fb923c] via-[#16acd4] to-[#16acd4] bg-clip-text text-transparent">
                        Made Simple
                    </span>
                </h1>

                <p className="max-w-[560px] mx-auto mt-8 text-base leading-relaxed font-light" style={{ color: '#6b7080' }}>
                    Hassle-free insurance claims for your vehicle. File your claim online, track progress in real-time, and get your detailed claim report delivered digitally.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
                    {checkingAuth ? (
                        <div className="btn-primary opacity-50">
                            Loading...
                        </div>
                    ) : isLoggedIn ? (
                        <Link href="/client/insurance-claims/new" className="btn-primary">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            File a Claim
                        </Link>
                    ) : (
                        <Link href="/login?redirect=/client/insurance-claims/new" className="btn-primary">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            Login to File Claim
                        </Link>
                    )}
                    <Link href="/#services" className="btn-secondary">
                        <svg className="w-5 h-5" style={{ color: '#6b7080' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12" y2="8" strokeLinecap="round" strokeWidth="3" />
                        </svg>
                        All Services
                    </Link>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6 md:px-14" style={{ background: 'linear-gradient(180deg, #111318 0%, #08090c 100%)' }}>
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <span className="w-8 h-0.5 rounded" style={{ backgroundColor: '#fb923c' }}></span>
                        <span className="text-xs font-semibold tracking-[2.5px] uppercase" style={{ color: '#fb923c' }}>Process</span>
                    </div>
                    <h2 className="font-display text-[clamp(32px,4.5vw,48px)] tracking-[3px] text-white">How It Works</h2>
                    <p className="mt-4 text-[15px] font-light" style={{ color: '#6b7080' }}>Simple 4-step process to file and track your claim</p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 max-w-[1000px] mx-auto">
                    {/* Step 1 */}
                    <div className="flex-1 min-w-[200px] max-w-[220px] text-center">
                        <div className="w-14 h-14 mx-auto mb-6 rounded-full flex items-center justify-center font-display text-[22px] tracking-wide" style={{ backgroundColor: '#111318', color: '#fb923c', boxShadow: '0 0 0 3px #111318, 0 0 0 5px #fb923c' }}>
                            1
                        </div>
                        <h4 className="text-[15px] font-semibold text-white mb-2">Submit Claim</h4>
                        <p className="text-[13px] leading-relaxed max-w-[160px] mx-auto" style={{ color: '#6b7080' }}>Fill out the claim form with vehicle and incident details.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex-1 min-w-[200px] max-w-[220px] text-center">
                        <div className="w-14 h-14 mx-auto mb-6 rounded-full flex items-center justify-center font-display text-[22px] tracking-wide" style={{ backgroundColor: '#111318', color: '#60a5fa', boxShadow: '0 0 0 3px #111318, 0 0 0 5px #60a5fa' }}>
                            2
                        </div>
                        <h4 className="text-[15px] font-semibold text-white mb-2">Expert Review</h4>
                        <p className="text-[13px] leading-relaxed max-w-[160px] mx-auto" style={{ color: '#6b7080' }}>Our team reviews your claim and assesses the damage.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex-1 min-w-[200px] max-w-[220px] text-center">
                        <div className="w-14 h-14 mx-auto mb-6 rounded-full flex items-center justify-center font-display text-[22px] tracking-wide" style={{ backgroundColor: '#111318', color: '#4ade80', boxShadow: '0 0 0 3px #111318, 0 0 0 5px #4ade80' }}>
                            3
                        </div>
                        <h4 className="text-[15px] font-semibold text-white mb-2">Get Report</h4>
                        <p className="text-[13px] leading-relaxed max-w-[160px] mx-auto" style={{ color: '#6b7080' }}>Receive your detailed claim report as a downloadable PDF.</p>
                    </div>

                    {/* Step 4 */}
                    <div className="flex-1 min-w-[200px] max-w-[220px] text-center">
                        <div className="w-14 h-14 mx-auto mb-6 rounded-full flex items-center justify-center font-display text-[22px] tracking-wide" style={{ backgroundColor: '#111318', color: '#16acd4', boxShadow: '0 0 0 3px #111318, 0 0 0 5px #16acd4' }}>
                            4
                        </div>
                        <h4 className="text-[15px] font-semibold text-white mb-2">Claim Settlement</h4>
                        <p className="text-[13px] leading-relaxed max-w-[160px] mx-auto" style={{ color: '#6b7080' }}>Use report for insurance processing and settlement.</p>
                    </div>
                </div>
            </section>

            {/* What We Cover */}
            <section className="py-24 px-6 md:px-14" style={{ backgroundColor: '#08090c' }}>
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <span className="w-8 h-0.5 rounded" style={{ backgroundColor: '#fb923c' }}></span>
                        <span className="text-xs font-semibold tracking-[2.5px] uppercase" style={{ color: '#fb923c' }}>Coverage</span>
                    </div>
                    <h2 className="font-display text-[clamp(32px,4.5vw,48px)] tracking-[3px] text-white">What We Cover</h2>
                    <p className="mt-4 text-[15px] font-light" style={{ color: '#6b7080' }}>Comprehensive support for all types of vehicle claims</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1080px] mx-auto">
                    {/* Card 1 - Accident */}
                    <div className="service-card">
                        <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)' }}>
                            <svg className="w-6 h-6" style={{ color: '#f87171' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="18" y1="8" x2="23" y2="13" />
                                <line x1="23" y1="8" x2="18" y2="13" />
                            </svg>
                        </div>
                        <h3 className="text-[17px] font-semibold text-white mb-3">Accident Claims</h3>
                        <p className="text-sm leading-relaxed font-light" style={{ color: '#6b7080' }}>Complete documentation for collision and accident damage. Comprehensive assessment for insurance processing.</p>
                    </div>

                    {/* Card 2 - Theft */}
                    <div className="service-card">
                        <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
                            <svg className="w-6 h-6" style={{ color: '#fb923c' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                        </div>
                        <h3 className="text-[17px] font-semibold text-white mb-3">Theft Claims</h3>
                        <p className="text-sm leading-relaxed font-light" style={{ color: '#6b7080' }}>Report and document vehicle theft or break-in incidents with proper assessment and valuation.</p>
                    </div>

                    {/* Card 3 - Natural Disaster */}
                    <div className="service-card">
                        <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)' }}>
                            <svg className="w-6 h-6" style={{ color: '#60a5fa' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 16.9A5 5 0 0018 7h-1.26a8 8 0 10-11.62 9" />
                                <polyline points="13 11 9 17 15 17 11 23" />
                            </svg>
                        </div>
                        <h3 className="text-[17px] font-semibold text-white mb-3">Natural Disaster</h3>
                        <p className="text-sm leading-relaxed font-light" style={{ color: '#6b7080' }}>Flood, hail, or storm damage claims. We help document environmental damage for insurance.</p>
                    </div>

                    {/* Card 4 - Third Party */}
                    <div className="service-card">
                        <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)' }}>
                            <svg className="w-6 h-6" style={{ color: '#4ade80' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                                <path d="M16 3.13a4 4 0 010 7.75" />
                            </svg>
                        </div>
                        <h3 className="text-[17px] font-semibold text-white mb-3">Third Party</h3>
                        <p className="text-sm leading-relaxed font-light" style={{ color: '#6b7080' }}>Documentation for third-party liability claims when another party is involved in the incident.</p>
                    </div>

                    {/* Card 5 - Fire */}
                    <div className="service-card">
                        <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(22, 172, 212, 0.1)' }}>
                            <svg className="w-6 h-6" style={{ color: '#16acd4' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
                                <path d="M12 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
                            </svg>
                        </div>
                        <h3 className="text-[17px] font-semibold text-white mb-3">Fire Damage</h3>
                        <p className="text-sm leading-relaxed font-light" style={{ color: '#6b7080' }}>Assessment and documentation for fire-related vehicle damage claims and restoration needs.</p>
                    </div>

                    {/* Card 6 - Vandalism */}
                    <div className="service-card">
                        <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(192, 132, 252, 0.1)' }}>
                            <svg className="w-6 h-6" style={{ color: '#c084fc' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                        </div>
                        <h3 className="text-[17px] font-semibold text-white mb-3">Vandalism</h3>
                        <p className="text-sm leading-relaxed font-light" style={{ color: '#6b7080' }}>Report and document intentional damage to your vehicle with detailed evidence for claims.</p>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 px-6 md:px-14" style={{ background: 'linear-gradient(180deg, #111318 0%, #08090c 100%)' }}>
                <div className="max-w-[1000px] mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <span className="w-8 h-0.5 rounded" style={{ backgroundColor: '#fb923c' }}></span>
                            <span className="text-xs font-semibold tracking-[2.5px] uppercase" style={{ color: '#fb923c' }}>Benefits</span>
                        </div>
                        <h2 className="font-display text-[clamp(32px,4.5vw,48px)] tracking-[3px] text-white">Why File With Us?</h2>
                        <p className="max-w-[440px] mt-5 text-[15px] leading-relaxed font-light" style={{ color: '#6b7080' }}>
                            We simplify the insurance claim process so you can focus on getting back on the road.
                        </p>

                        <div className="mt-8 flex flex-col gap-5 max-w-[440px]">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
                                    <svg className="w-5 h-5" style={{ color: '#fb923c' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                </div>
                                <div>
                                    <strong className="text-sm font-semibold text-white">Digital Documentation</strong>
                                    <span className="block text-[13px] mt-0.5" style={{ color: '#6b7080' }}>Professional PDF reports delivered to your dashboard</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
                                    <svg className="w-5 h-5" style={{ color: '#fb923c' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                                <div>
                                    <strong className="text-sm font-semibold text-white">Real-time Updates</strong>
                                    <span className="block text-[13px] mt-0.5" style={{ color: '#6b7080' }}>Track your claim status via email and notifications</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
                                    <svg className="w-5 h-5" style={{ color: '#fb923c' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <div>
                                    <strong className="text-sm font-semibold text-white">Insurance Support</strong>
                                    <span className="block text-[13px] mt-0.5" style={{ color: '#6b7080' }}>Work with all major insurance companies</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
                                    <svg className="w-5 h-5" style={{ color: '#fb923c' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <div>
                                    <strong className="text-sm font-semibold text-white">Expert Assessment</strong>
                                    <span className="block text-[13px] mt-0.5" style={{ color: '#6b7080' }}>Trained professionals review every claim</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Element */}
                    <div className="flex-shrink-0">
                        <div className="relative w-[280px] h-[320px] rounded-3xl p-8 flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(150deg, #161921, #0e1015)', border: '1px solid rgba(255, 255, 255, 0.07)', boxShadow: '0 40px 90px rgba(0, 0, 0, 0.55)' }}>
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #fb923c, #16acd4)' }}>
                                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">Secure & Trusted</h4>
                            <p className="text-sm" style={{ color: '#6b7080' }}>Your data is protected with enterprise-grade security</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 md:px-14 text-center relative overflow-hidden" style={{ backgroundColor: '#08090c' }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(251, 146, 60, 0.07) 0%, transparent 68%)' }}></div>

                <div className="max-w-[600px] mx-auto relative z-10">
                    <h2 className="font-display text-[clamp(36px,5vw,52px)] tracking-[3px] text-white">Ready to File Your Claim?</h2>
                    <p className="text-base mt-4 leading-relaxed font-light" style={{ color: '#6b7080' }}>
                        {isLoggedIn
                            ? "Start your claim now and get your professional report delivered to your dashboard."
                            : "Login or create an account to file your insurance claim and track its progress."
                        }
                    </p>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        {checkingAuth ? null : isLoggedIn ? (
                            <>
                                <Link href="/client/insurance-claims/new" className="btn-primary">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    File a Claim
                                </Link>
                                <Link href="/client/insurance-claims" className="btn-secondary">
                                    <svg className="w-5 h-5" style={{ color: '#6b7080' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    My Claims
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login?redirect=/client/insurance-claims/new" className="btn-primary">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                    Login to File Claim
                                </Link>
                                <Link href="/register" className="btn-secondary">
                                    <svg className="w-5 h-5" style={{ color: '#6b7080' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                        <circle cx="8.5" cy="7" r="4" />
                                        <line x1="20" y1="8" x2="20" y2="14" />
                                        <line x1="23" y1="11" x2="17" y2="11" />
                                    </svg>
                                    Create Account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 px-6 md:px-14 flex flex-col md:flex-row items-center justify-between gap-4" style={{ backgroundColor: '#111318', borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}>
                <div className="font-display text-lg tracking-[3px] text-white">
                    Detailing<span style={{ color: '#16acd4' }}>Garage</span>
                </div>
                <p className="text-[13px]" style={{ color: '#6b7080' }}>© 2026 DetailingGarage. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="text-[13px] hover:text-[#16acd4] transition-colors" style={{ color: '#6b7080' }}>Privacy</a>
                    <a href="#" className="text-[13px] hover:text-[#16acd4] transition-colors" style={{ color: '#6b7080' }}>Terms</a>
                    <a href="#" className="text-[13px] hover:text-[#16acd4] transition-colors" style={{ color: '#6b7080' }}>Contact</a>
                </div>
            </footer>
        </div>
    )
}
