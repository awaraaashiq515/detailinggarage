"use client"

import { useState, useEffect, useRef } from "react"

function useCountUp(target: number, duration = 2000, start = false) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!start) return
        let startTime: number | null = null
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [start, target, duration])
    return count
}

export default function StatsSection() {
    const [isVisible, setIsVisible] = useState(false)
    const statsRef = useRef<HTMLDivElement>(null)

    const customers = useCountUp(5000, 2000, isVisible)
    const years = useCountUp(10, 1500, isVisible)
    const rating = useCountUp(49, 1500, isVisible)

    useEffect(() => {
        if (!statsRef.current) return
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
            { threshold: 0.4 }
        )
        observer.observe(statsRef.current)
        return () => observer.disconnect()
    }, [])

    const stats = [
        {
            value: years,
            suffix: '+',
            unit: 'Yrs',
            label: 'Experience',
            desc: 'Over a decade of excellence in automobile services and customer satisfaction.',
            icon: 'M12 6v6l4 2',
            color: '#0ea5e9'
        },
        {
            value: customers,
            suffix: '+',
            label: 'Happy Customers',
            desc: 'High-trust community of car owners who rely on our expert care every year.',
            icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2',
            color: '#0ea5e9'
        },
        {
            value: (rating / 10).toFixed(1),
            suffix: '★',
            label: 'Average Rating',
            desc: 'Consistently rated excellent by our customers for quality and transparency.',
            icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
            color: '#38bdf8'
        }
    ]

    return (
        <section id="about" ref={statsRef} className="py-28 px-6 md:px-14 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #060a14 0%, #0c1220 50%, #060a14 100%)' }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(14, 165, 233, 0.05) 0%, transparent 65%)' }} />

            <div className="text-center mb-16 relative z-10 section-reveal">
                <div className="inline-flex items-center gap-3 mb-4">
                    <span className="w-8 h-0.5 rounded" style={{ backgroundColor: '#0ea5e9' }} />
                    <span className="text-xs font-semibold tracking-[2.5px] uppercase" style={{ color: '#0ea5e9' }}>Why Us</span>
                    <span className="w-8 h-0.5 rounded" style={{ backgroundColor: '#0ea5e9' }} />
                </div>
                <h2 className="font-display text-[clamp(38px,5vw,54px)] tracking-[3px] text-white">Why Choose <span style={{ color: '#0ea5e9' }}>Us?</span></h2>
                <p className="mt-4 text-[15px] font-light max-w-lg mx-auto" style={{ color: '#6b7280' }}>We combine passion with precision to deliver unmatched automotive care.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 max-w-[1000px] mx-auto relative z-10">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card flex-1 min-w-[280px] max-w-[320px] text-center section-reveal transition-all duration-500 hover:scale-[1.02]" style={{ transitionDelay: `${i * 0.1}s` }}>
                        <div className="w-[64px] h-[64px] mx-auto mb-6 rounded-2xl flex items-center justify-center glass shadow-lg" style={{ border: `1px solid ${stat.color}30` }}>
                            <svg className="w-7 h-7" style={{ color: stat.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d={stat.icon} />
                                {i === 0 && <circle cx="12" cy="12" r="10" />}
                                {i === 1 && <circle cx="9" cy="7" r="4" />}
                            </svg>
                        </div>
                        <div className="font-display text-[52px] tracking-wide text-white leading-none">
                            {stat.value}<span style={{ color: stat.color }}>{stat.suffix}</span> {stat.unit && <span className="text-[28px] text-gray-500">{stat.unit}</span>}
                        </div>
                        <div className="text-[17px] font-bold text-white mt-4">{stat.label}</div>
                        <div className="text-[14px] mt-3 leading-relaxed" style={{ color: '#6b7280' }}>{stat.desc}</div>
                    </div>
                ))}
            </div>
        </section>
    )
}
