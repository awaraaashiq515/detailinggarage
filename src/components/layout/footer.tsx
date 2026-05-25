"use client"

import Link from "next/link"
import { useState } from "react"

export function Footer() {
    const [imgError, setImgError] = useState(false)

    return (
        <footer className="py-10 px-6 md:px-14 flex flex-col md:flex-row items-center justify-between gap-4" style={{ backgroundColor: '#111318', borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <Link href="/" className="flex items-center font-display text-lg tracking-[3px] text-white">
                {!imgError ? (
                    <img 
                        src="/car-assure-logo.png" 
                        alt="Car Assure Logo" 
                        className="h-8 w-auto object-contain brightness-0 invert" 
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <>Car<span style={{ color: '#ff4b55' }}>Assure</span></>
                )}
            </Link>
            <p className="text-[13px]" style={{ color: '#6b7080' }}>© 2026 DetailingGarage. All rights reserved.</p>
            <div className="flex gap-6">
                <a href="#" className="text-[13px] hover:text-[#16acd4] transition-colors" style={{ color: '#6b7080' }}>Privacy</a>
                <a href="#" className="text-[13px] hover:text-[#16acd4] transition-colors" style={{ color: '#6b7080' }}>Terms</a>
                <a href="#" className="text-[13px] hover:text-[#16acd4] transition-colors" style={{ color: '#6b7080' }}>Contact</a>
            </div>
        </footer>
    )
}
