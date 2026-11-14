"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { WebsiteContent, defaultWebsiteContent } from "@/lib/website-content.types"

// ─── Helper Icons ─────────────────────────────────────────────────────────────
function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ color: "#5fd6e4", flex: "none", marginTop: 3 }}>
            <path d="M4 12l5 5L20 6" />
        </svg>
    )
}

function WAIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z" />
        </svg>
    )
}

function ArrowRightIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    )
}

function InstagramIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none" />
        </svg>
    )
}

function FacebookIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5 22v-8.2h2.8l.4-3.3h-3.2V8.4c0-.9.3-1.6 1.6-1.6h1.7V3.9a23 23 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.3h2.8V22z" />
        </svg>
    )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ hero }: { hero: WebsiteContent["hero"] }) {
    return (
        <section style={{
            position: "relative",
            overflow: "hidden",
            borderBottom: "1px solid #1a2328",
            background: "#07090b",
            backgroundImage: `
                radial-gradient(ellipse 600px 450px at 75% 40%, rgba(22,172,212,0.14) 0%, transparent 70%),
                radial-gradient(ellipse 400px 300px at 15% 20%, rgba(22,172,212,0.06) 0%, transparent 60%),
                linear-gradient(rgba(22,172,212,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(22,172,212,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 100% 100%, 42px 42px, 42px 42px",
            padding: "clamp(125px, 11vw, 155px) 0 clamp(16px, 2vw, 24px)"
        }}>
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px" }}>
                <div style={{ display: "grid", gap: 36, alignItems: "center" }} className="dg-hero-grid">
                    {/* Left Column: Eyebrow, Main Headline, Subtitle, CTA Buttons, Checkmark Badges */}
                    <div style={{ display: "grid", gap: 14 }}>
                        <span style={{
                            fontFamily: "'Dancing Script', 'Caveat', cursive",
                            fontSize: "clamp(1.45rem, 2.3vw, 1.9rem)",
                            fontWeight: 700,
                            color: "#16acd4",
                            letterSpacing: "0.01em",
                            lineHeight: 1.15
                        }}>
                            Detailing That Defines Luxury
                        </span>

                        <h1 style={{
                            fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif",
                            fontSize: "clamp(2.4rem, 5.2vw, 4.3rem)",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            lineHeight: 0.95,
                            letterSpacing: "0.01em",
                            color: "#ffffff",
                            margin: 0
                        }}>
                            <span style={{ display: "block" }}>INSPECT BEFORE</span>
                            <span style={{ display: "block" }}>YOU ACCEPT.</span>
                        </h1>

                        <p style={{
                            color: "#8d9ea6",
                            fontSize: "clamp(0.92rem, 1.1vw, 1.02rem)",
                            maxWidth: "52ch",
                            margin: 0,
                            lineHeight: 1.6
                        }}>
                            Professional 100+ point PDI, ceramic &amp; graphene coating, PPF, accessories, insurance claims and complete car care – across Himachal, Punjab, Chandigarh Tricity, Haryana &amp; Dehradun.
                        </p>

                        {/* 3 Action Buttons */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
                            <a href="#contact" style={{
                                background: "#16acd4",
                                color: "#07090b",
                                fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif",
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                letterSpacing: "0.03em",
                                padding: "10px 22px",
                                borderRadius: 8,
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                transition: "transform .15s ease, opacity .15s ease"
                            }}>
                                Book a PDI
                            </a>
                            <a href="/report-warranty" style={{
                                background: "transparent",
                                border: "1.5px solid #16acd4",
                                color: "#eef4f6",
                                fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif",
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                letterSpacing: "0.03em",
                                padding: "10px 20px",
                                borderRadius: 8,
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                transition: "all .15s ease"
                            }}>
                                Download PDI Report
                            </a>
                            <a href="/report-warranty" style={{
                                background: "transparent",
                                border: "1.5px solid rgba(22,172,212,0.6)",
                                color: "#16acd4",
                                fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif",
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                letterSpacing: "0.03em",
                                padding: "10px 20px",
                                borderRadius: 8,
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                transition: "all .15s ease"
                            }}>
                                Check Warranty
                            </a>
                        </div>

                        {/* 6 Checkmark Pills (2 rows) */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                            {[
                                "100+ Point Check",
                                "Paint Gauge",
                                "Tyre Gauge",
                                "Full OBD Scan",
                                "Underbody",
                                "Digital Report"
                            ].map(pill => (
                                <span key={pill} style={{
                                    border: "1.5px solid #16acd4",
                                    borderRadius: 999,
                                    padding: "4px 13px",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    color: "#eef4f6",
                                    background: "#07090b",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6
                                }}>
                                    <span style={{ color: "#16acd4", fontWeight: 800 }}>✓</span> {pill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Live PDI Report Card */}
                    <div style={{
                        background: "#0a1317",
                        border: "1.5px solid rgba(22,172,212,0.3)",
                        borderRadius: 20,
                        padding: "24px 26px",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 45px rgba(22,172,212,0.08)",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        {/* Live Scanner Laser Beam (Up & Down Scanning Line) */}
                        <div
                            aria-hidden="true"
                            className="pdi-scanner-line"
                            style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                height: "1px",
                                pointerEvents: "none",
                                zIndex: 2,
                                background: "linear-gradient(90deg, transparent 0%, rgba(22,172,212,0.35) 12%, #38bdf8 50%, rgba(22,172,212,0.35) 88%, transparent 100%)",
                                boxShadow: "0 0 6px #16acd4, 0 0 14px rgba(22,172,212,0.75)"
                            }}
                        />
                        {/* Soft Glow Area Traveling with the Line */}
                        <div
                            aria-hidden="true"
                            className="pdi-scanner-glow"
                            style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                height: "22px",
                                pointerEvents: "none",
                                zIndex: 1,
                                transform: "translateY(-50%)",
                                background: "radial-gradient(ellipse 70% 100% at 50% 50%, rgba(22,172,212,0.18) 0%, rgba(22,172,212,0.06) 45%, transparent 75%)"
                            }}
                        />

                        {/* Header Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, position: "relative", zIndex: 3 }}>
                            <div>
                                <h2 style={{
                                    fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif",
                                    fontSize: "1.25rem",
                                    fontWeight: 800,
                                    color: "#ffffff",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                    margin: 0
                                }}>
                                    LIVE PDI REPORT
                                </h2>
                                <span style={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: "0.72rem",
                                    color: "#8d9ea6",
                                    display: "block",
                                    marginTop: 2
                                }}>
                                    DG-PDI • Compact SUV at dealership
                                </span>
                            </div>
                            <span style={{
                                background: "rgba(34,197,94,0.12)",
                                border: "1px solid rgba(34,197,94,0.35)",
                                color: "#22c55e",
                                padding: "3px 10px",
                                borderRadius: 999,
                                fontSize: "0.68rem",
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontWeight: 700,
                                letterSpacing: "0.04em"
                            }}>
                                PDI VERIFIED
                            </span>
                        </div>

                        {/* Checklist items */}
                        <div style={{ display: "grid", gap: 2, position: "relative", zIndex: 3 }}>
                            {[
                                { label: "Paint thickness – 13 panels", status: "Original" },
                                { label: "Stored fault codes", status: "None" },
                                { label: "Tyre DOT date", status: "2026" },
                                { label: "Underbody & transit damage", status: "Clear" },
                                { label: "Manufacturing date vs invoice", status: "Match" }
                            ].map(item => (
                                <div key={item.label} style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "7px 0",
                                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                                    fontSize: "0.85rem",
                                    color: "#d1d5db"
                                }}>
                                    <span>{item.label}</span>
                                    <span style={{ color: "#16acd4", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                        ✔ {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* 3 Metric Stat Boxes */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16, position: "relative", zIndex: 3 }}>
                            {[
                                { val: "118µM", label: "Bonnet" },
                                { val: "7.8MM", label: "Tread" },
                                { val: "12.6V", label: "Battery" }
                            ].map(stat => (
                                <div key={stat.label} style={{
                                    background: "rgba(7,9,11,0.7)",
                                    border: "1px solid rgba(22,172,212,0.25)",
                                    borderRadius: 12,
                                    padding: "10px 8px",
                                    textAlign: "center"
                                }}>
                                    <div style={{
                                        color: "#16acd4",
                                        fontSize: "1.25rem",
                                        fontWeight: 800,
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        lineHeight: 1.1
                                    }}>
                                        {stat.val}
                                    </div>
                                    <div style={{ color: "#8d9ea6", fontSize: "0.72rem", marginTop: 2 }}>
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footnote */}
                        <div style={{ fontSize: "0.7rem", color: "#61727c", fontStyle: "italic", marginTop: 12, position: "relative", zIndex: 3 }}>
                            Sample values for illustration
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pdiScannerSweep {
                    0% {
                        top: 8%;
                        opacity: 0.35;
                    }
                    15% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 1;
                    }
                    85% {
                        opacity: 1;
                    }
                    100% {
                        top: 92%;
                        opacity: 0.35;
                    }
                }

                .pdi-scanner-line, .pdi-scanner-glow {
                    animation: pdiScannerSweep 3.2s ease-in-out infinite alternate;
                }

                @media(min-width: 960px) {
                    .dg-hero-grid {
                        grid-template-columns: 1.15fr 0.85fr !important;
                    }
                }
            `}</style>
        </section>
    )
}

// ─── Ticker Marquee Strip ─────────────────────────────────────────────────────
function TickerStrip({ items }: { items: string[] }) {
    const list = items && items.length > 0 ? items : defaultWebsiteContent.ticker.items
    const doubled = [...list, ...list]
    return (
        <div style={{ background: "#16acd4", color: "#07090b", overflow: "hidden", whiteSpace: "nowrap" }} aria-hidden="true">
            <div className="dg-strip-track" style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", padding: "6px 0", fontSize: "0.82rem", letterSpacing: "0.08em" }}>
                {doubled.map((t, i) => (
                    <span key={i}>{t}<span style={{ marginLeft: 36, opacity: 0.45 }}>/</span></span>
                ))}
            </div>
        </div>
    )
}

// ─── PDI Section with Ritchie & Sample Reports ────────────────────────────────
function PDISection({ pdi, onOpenLightbox }: { pdi: WebsiteContent["pdi"]; onOpenLightbox: (src: string, alt: string) => void }) {
    return (
        <section style={{ padding: "clamp(36px, 5vw, 60px) 0" }} id="pdi">
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px" }}>
                <div style={{ display: "grid", gap: 32, alignItems: "start" }} className="dg-pdi-top">
                    <div>
                        <div style={{ display: "grid", gap: 8, maxWidth: "44rem", marginBottom: "clamp(20px, 3vw, 32px)" }}>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5fd6e4" }}>{pdi.eyebrow}</span>
                            <h2 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.25rem)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 1.05, margin: 0 }}>{pdi.heading}</h2>
                            <p style={{ color: "#8d9ea6", fontSize: "0.95rem", maxWidth: "60ch", margin: 0, lineHeight: 1.55 }}>
                                {pdi.description}
                            </p>
                        </div>

                        {/* Dynamic Fuel Cards */}
                        <div style={{ display: "grid", gap: 1, background: "#1a2328", border: "1px solid #1a2328", gridTemplateColumns: "repeat(3, 1fr)" }} className="dg-fuel-grid">
                            {pdi.fuelTypes.map(f => (
                                <div key={f.title} style={{ background: "#07090b", padding: "18px 16px", display: "grid", gap: 6, alignContent: "start" }}>
                                    <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>
                                        {f.title}
                                        <small style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.12em", color: "#5fd6e4", display: "block", marginTop: 2, fontWeight: 400 }}>{f.subtitle}</small>
                                    </h3>
                                    <ul style={{ listStyle: "none", margin: 0, padding: 0, color: "#8d9ea6", fontSize: "0.85rem", display: "grid", gap: 3 }}>
                                        {f.items.map(i => <li key={i}>{i}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Dynamic Equipment Tools */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 22 }} className="dg-tools">
                            {pdi.tools.map(t => (
                                <div key={t.name}>
                                    <b style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.05rem", fontWeight: 800, color: "#5fd6e4", textTransform: "uppercase", display: "block" }}>{t.name}</b>
                                    <span style={{ fontSize: "0.82rem", color: "#8d9ea6" }}>{t.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Pricing Card */}
                    <aside style={{ background: "#07090b", border: "1px solid #5fd6e4", padding: 22, display: "grid", gap: 14 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5fd6e4" }}>{pdi.pricing.eyebrow}</span>
                        <div style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "2.6rem", fontWeight: 800, lineHeight: 1 }}>
                            {pdi.pricing.amount}<small style={{ fontSize: "0.95rem", color: "#8d9ea6", fontWeight: 600, marginLeft: 6 }}>{pdi.pricing.travelNote}</small>
                        </div>
                        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6, fontSize: "0.88rem" }}>
                            {pdi.pricing.features.map(f => (
                                <li key={f} style={{ display: "flex", gap: 8 }}><CheckIcon />{f}</li>
                            ))}
                        </ul>
                        <p style={{ fontSize: "0.8rem", color: "#8d9ea6", borderTop: "1px solid #1a2328", paddingTop: 12, margin: 0 }}>
                            {pdi.pricing.footnote}
                        </p>
                        <a href={pdi.pricing.ctaLink || "#contact"} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#5fd6e4", color: "#07090b", fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "11px 22px", borderRadius: 2, textDecoration: "none", justifySelf: "start" }}>
                            {pdi.pricing.ctaText || "Get a quote"}
                        </a>
                    </aside>
                </div>

                {/* Dynamic 8 Check Areas */}
                <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.2rem", textTransform: "uppercase", fontWeight: 800, margin: "36px 0 16px", display: "flex", alignItems: "center", gap: 14, color: "#eef4f6" }}>
                    What we check
                    <span style={{ flex: 1, height: 1, background: "#1a2328" }} />
                </h3>

                <div style={{ display: "grid", gap: 1, background: "#1a2328", border: "1px solid #1a2328", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                    {pdi.checkAreas.map(a => (
                        <div key={a.index} style={{ background: "#07090b", padding: "22px 20px", display: "grid", gap: 10, alignContent: "start", minWidth: 0 }}>
                            <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.15rem", textTransform: "uppercase", margin: 0, display: "flex", gap: 10, alignItems: "baseline" }}>
                                <i style={{ fontStyle: "normal", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem", color: "#5fd6e4" }}>{a.index}</i>
                                {a.title}
                            </h3>
                            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4, fontSize: "0.86rem", color: "#8d9ea6" }}>
                                {a.items.map(item => (
                                    <li key={item} style={{ position: "relative", paddingLeft: "1.4em" }}>
                                        <span style={{ position: "absolute", left: 0, color: "#5fd6e4" }}>+</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Ritchie Profile */}
                <div style={{ display: "grid", gap: 28, alignItems: "center", background: "#07090b", border: "1px solid #1a2328", marginTop: 56 }} className="dg-ritchie">
                    {pdi.ritchie.imageUrl && (
                        <img 
                            src={pdi.ritchie.imageUrl} 
                            alt={pdi.ritchie.name} 
                            style={{ width: "100%", height: "100%", aspectRatio: "4/5", objectFit: "cover", objectPosition: "40% 20%" }} 
                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                        />
                    )}
                    <div style={{ display: "grid", gap: 14, padding: "28px 36px 28px 0" }} className="dg-ritchie-copy">
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#5fd6e4" }}>{pdi.ritchie.eyebrow}</span>
                        <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "2.2rem", textTransform: "uppercase", margin: 0 }}>{pdi.ritchie.name}</h3>
                        <blockquote style={{ margin: 0, fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.4rem", color: "#5fd6e4", lineHeight: 1.2 }}>
                            {pdi.ritchie.quote}
                        </blockquote>
                        <p style={{ color: "#8d9ea6", maxWidth: "60ch", margin: 0, lineHeight: 1.6 }}>
                            {pdi.ritchie.description}
                        </p>
                    </div>
                </div>

                {/* Sample Reports */}
                <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.5rem", textTransform: "uppercase", fontWeight: 700, margin: "56px 0 20px", display: "flex", alignItems: "center", gap: 16, color: "#eef4f6" }}>
                    Sample reports
                    <span style={{ flex: 1, height: 1, background: "#1a2328" }} />
                </h3>
                <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                    {pdi.sampleReports.map(doc => (
                        <button key={doc.title} onClick={() => onOpenLightbox(doc.imageUrl, doc.title)}
                            style={{ padding: 0, border: "1px solid #1a2328", background: "#07090b", cursor: "zoom-in", textAlign: "left", color: "#eef4f6", display: "grid", borderRadius: 2, overflow: "hidden", font: "inherit", transition: "border-color .2s" }}
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "#5fd6e4")}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "#1a2328")}>
                            <img src={doc.imageUrl} alt={doc.title} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "top" }} />
                            <span style={{ padding: "14px 16px", fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", borderTop: "1px solid #1a2328" }}>
                                {doc.title}
                                <small style={{ display: "block", fontFamily: "'Manrope', sans-serif", textTransform: "none", letterSpacing: 0, color: "#8d9ea6", fontWeight: 400, marginTop: 4 }}>{doc.subtitle}</small>
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                @media(min-width:940px){ .dg-pdi-top { grid-template-columns: 1.1fr .9fr; } }
                @media(max-width:559px){ .dg-fuel-grid { grid-template-columns: 1fr !important; } }
                @media(max-width:559px){ .dg-tools { grid-template-columns: repeat(2,1fr) !important; } }
                @media(min-width:760px){ .dg-ritchie { grid-template-columns: 280px 1fr !important; } }
                @media(max-width:759px){ .dg-ritchie-copy { padding: 8px 28px 28px !important; } }
            `}</style>
        </section>
    )
}

// ─── Services Section ─────────────────────────────────────────────────────────
function ServicesSection({ services, onOpenLightbox }: { services: WebsiteContent["services"]; onOpenLightbox: (src: string, alt: string) => void }) {
    return (
        <section style={{ padding: "clamp(36px, 5vw, 60px) 0", background: "#0e1316", borderBlock: "1px solid #1a2328" }} id="services">
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px" }}>
                <div style={{ display: "grid", gap: 8, maxWidth: "44rem", marginBottom: "clamp(20px, 3vw, 32px)" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5fd6e4" }}>{services.eyebrow}</span>
                    <h2 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.25rem)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 1.05, margin: 0 }}>{services.heading}</h2>
                    <p style={{ color: "#8d9ea6", fontSize: "0.95rem", maxWidth: "60ch", margin: 0, lineHeight: 1.55 }}>
                        {services.description}
                    </p>
                </div>

                <div style={{ display: "grid", gap: 1, background: "#1a2328", border: "1px solid #1a2328" }} className="dg-services-grid">
                    {services.primaryList.filter(s => s.isActive !== false).map(s => (
                        <article key={s.id} style={{ background: "#0e1316", padding: "24px 22px 22px", display: "grid", gap: 10, alignContent: "start", minWidth: 0, transition: "background .25s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#07090b")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#0e1316")}>
                            <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0, color: "#ffffff", letterSpacing: "0.02em" }}>{s.title}</h3>
                            <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#cbd5e1", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>{s.description}</p>
                            <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "grid", gap: 6, fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "0.86rem", fontWeight: 500 }}>
                                {s.items.map(i => (
                                    <li key={i} style={{ position: "relative", paddingLeft: "1.3em", color: "#e2e8f0" }}>
                                        <span style={{ position: "absolute", left: 0, color: "#16acd4", fontWeight: 700, fontSize: "0.95rem" }}>+</span> {i}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>

                <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.2rem", textTransform: "uppercase", fontWeight: 800, margin: "36px 0 16px", display: "flex", alignItems: "center", gap: 14, color: "#eef4f6" }}>
                    {services.solutionsHeading}
                    <span style={{ flex: 1, height: 1, background: "#1a2328" }} />
                </h3>

                <div style={{ display: "grid", gap: 1, background: "#1a2328", border: "1px solid #1a2328" }} className="dg-services-grid">
                    {services.solutionsList.filter(s => s.isActive !== false).map(s => (
                        <article key={s.id} style={{ background: "#0e1316", padding: "24px 22px 22px", display: "grid", gap: 10, alignContent: "start", minWidth: 0, transition: "background .25s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#07090b")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#0e1316")}>
                            <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0, color: "#ffffff", letterSpacing: "0.02em" }}>{s.title}</h3>
                            <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#cbd5e1", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>{s.description}</p>
                            {s.fine && <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "0.82rem", color: "#94a3b8", fontStyle: "italic", margin: 0 }}>{s.fine}</p>}
                            {s.items && (
                                <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "grid", gap: 6, fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "0.86rem", fontWeight: 500 }}>
                                    {s.items.map(i => (
                                        <li key={i} style={{ position: "relative", paddingLeft: "1.3em", color: "#e2e8f0" }}>
                                            <span style={{ position: "absolute", left: 0, color: "#16acd4", fontWeight: 700, fontSize: "0.95rem" }}>+</span> {i}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </article>
                    ))}
                </div>

                {services.poster && (
                    <div style={{ marginTop: 28, display: "grid", gap: 20, alignItems: "center" }} className="dg-poster-grid">
                        <button onClick={() => onOpenLightbox(services.poster.imageUrl, services.poster.heading)}
                            style={{ padding: 0, border: "1px solid #1a2328", background: "none", cursor: "zoom-in", borderRadius: 2, overflow: "hidden" }}>
                            <img src={services.poster.imageUrl} alt={services.poster.heading} style={{ width: "100%", height: "auto" }} />
                        </button>
                        <div style={{ display: "grid", gap: 10 }}>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5fd6e4" }}>{services.poster.eyebrow}</span>
                            <h2 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "clamp(1.5rem, 2.8vw, 2rem)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", margin: 0 }}>
                                {services.poster.heading}
                            </h2>
                            <p style={{ color: "#8d9ea6", fontSize: "0.95rem", margin: 0, lineHeight: 1.55 }}>
                                {services.poster.description}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media(min-width:640px){ .dg-services-grid { grid-template-columns: repeat(2,1fr) !important; } }
                @media(min-width:1000px){ .dg-services-grid { grid-template-columns: repeat(3,1fr) !important; } }
                @media(min-width:860px){ .dg-poster-grid { grid-template-columns: 1.3fr 1fr !important; } }
            `}</style>
        </section>
    )
}

// ─── Packages Section ─────────────────────────────────────────────────────────
function PackagesSection({ packages }: { packages: WebsiteContent["packages"] }) {
    return (
        <section style={{ padding: "clamp(36px, 5vw, 60px) 0" }} id="packages">
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px" }}>
                <div style={{ display: "grid", gap: 8, maxWidth: "44rem", marginBottom: "clamp(20px, 3vw, 32px)" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5fd6e4" }}>{packages.eyebrow}</span>
                    <h2 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.25rem)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 1.05, margin: 0 }}>{packages.heading}</h2>
                    <p style={{ color: "#8d9ea6", fontSize: "0.95rem", maxWidth: "60ch", margin: 0, lineHeight: 1.55 }}>{packages.description}</p>
                </div>

                <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
                    {packages.list.map(p => (
                        <div key={p.id} style={{ border: `1px solid ${p.isHighlighted ? "#5fd6e4" : "#1a2328"}`, padding: "20px 18px", display: "grid", gap: 10, alignContent: "start", background: "#07090b" }}>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#5fd6e4" }}>{p.forText}</span>
                            <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>{p.name}</h3>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 5, fontSize: "0.85rem", color: "#8d9ea6" }}>
                                {p.items.map(i => <li key={i}><span style={{ color: "#5fd6e4" }}>✓ </span>{i}</li>)}
                            </ul>
                            <a href={p.ctaLink || "#contact"} style={{ marginTop: 4, justifySelf: "start", display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 2, fontFamily: "'Saira Semi Condensed', sans-serif", fontWeight: 700, fontSize: "0.88rem", textTransform: "uppercase", textDecoration: "none", background: p.isHighlighted ? "#5fd6e4" : "rgba(7,9,11,.4)", color: p.isHighlighted ? "#07090b" : "#eef4f6", border: p.isHighlighted ? "none" : "1px solid rgba(238,244,246,.25)" }}>
                                {p.ctaText || "Ask for price"}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ─── Customers Section (Dynamic Deliveries & Real Facebook Posts) ────────────
interface SocialPost {
    id: string
    type: string
    url: string
    caption: string | null
    link: string | null
    source: string
    publishedAt: string | null
    likesCount?: number
    commentsCount?: number
}

function parseDeliveryCaption(caption: string | null) {
    if (!caption) return { customer: "Verified Customer", car: "Detailing Garage Delivery", dealer: "Detailing Garage Mandi", excerpt: "Professional PDI inspection completed with 100+ checkpoints." }
    const lines = caption.split("\n").map(l => l.trim()).filter(Boolean)
    const congratsLine = lines.find(l => /congratulations/i.test(l)) || lines[0] || ""
    const cleanLine = congratsLine.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "").replace(/\s+/g, " ").replace(/[.!\s]+$/, "").trim()
    
    // Pattern: Congratulations to [Customer] on [taking] delivery of [his/her/their/brand-new] [Car] [from Dealer]
    const match = cleanLine.match(/to\s+([^,]+?)\s+on\s+(?:taking\s+)?(?:the\s+)?delivery\s+of\s+(?:his\s+|her\s+|their\s+|brand-new\s+|the\s+)*(.+?)(?:\s+from\s+(.+))?$/i)
    if (match) {
        return {
            customer: match[1]?.trim() || "Verified Customer",
            car: match[2]?.trim() || "Customer Vehicle",
            dealer: match[3]?.trim() || "",
            excerpt: cleanLine
        }
    }
    return {
        customer: "Verified Customer",
        car: cleanLine || "Customer Delivery",
        dealer: "",
        excerpt: cleanLine
    }
}

function CustomersSection({ 
    customers, 
    posts, 
    onOpenLightbox 
}: { 
    customers: WebsiteContent["customers"]; 
    posts: SocialPost[]; 
    onOpenLightbox: (src: string, alt: string, caption?: string, link?: string) => void 
}) {
    const [visibleCount, setVisibleCount] = useState(8)
    
    // Filter to Facebook posts or delivery posts
    const fbDeliveries = (posts && posts.length > 0)
        ? posts.filter(p => p.source === "FACEBOOK" || p.caption?.toLowerCase().includes("customer") || p.caption?.toLowerCase().includes("delivery"))
        : []
    
    const useFb = customers.useFacebookPosts !== false && fbDeliveries.length > 0
    const displayedFbPosts = fbDeliveries.slice(0, visibleCount)

    return (
        <section style={{ padding: "clamp(36px, 5vw, 60px) 0", background: "#0e1316", borderBlock: "1px solid #1a2328" }} id="customers">
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px" }}>
                {/* Header row with Title and Live Facebook Badge */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: "clamp(20px, 3vw, 32px)" }}>
                    <div style={{ display: "grid", gap: 8, maxWidth: "44rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5fd6e4" }}>
                                {customers.eyebrow}
                            </span>
                            {useFb && (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(24, 119, 242, 0.15)", border: "1px solid rgba(24, 119, 242, 0.4)", color: "#5ea6ff", padding: "2px 9px", borderRadius: 999, fontSize: "0.68rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.06em", fontWeight: 600 }}>
                                    <FacebookIcon size={11} />
                                    LIVE FACEBOOK SYNC ({fbDeliveries.length} DELIVERIES)
                                </span>
                            )}
                        </div>
                        <h2 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.25rem)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 1.05, margin: 0 }}>
                            {customers.heading}
                        </h2>
                        <p style={{ color: "#8d9ea6", fontSize: "0.95rem", maxWidth: "60ch", margin: 0, lineHeight: 1.55 }}>
                            {customers.description}
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <a 
                            href={customers.facebookPageUrl || "https://www.facebook.com/detailinggarage.in"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#1877F2", color: "#fff", textDecoration: "none", fontFamily: "'Saira Semi Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.05em", textTransform: "uppercase", borderRadius: 2, transition: "opacity .15s" }}
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.9")}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                        >
                            <FacebookIcon size={13} />
                            Facebook Page ↗
                        </a>
                        <Link 
                            href="/feed"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1px solid #1a2328", background: "#07090b", color: "#8d9ea6", textDecoration: "none", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.74rem", letterSpacing: "0.05em", textTransform: "uppercase", borderRadius: 2, transition: "color .2s, border-color .2s" }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.borderColor = "#5fd6e4";
                                (e.currentTarget as HTMLElement).style.color = "#eef4f6";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.borderColor = "#1a2328";
                                (e.currentTarget as HTMLElement).style.color = "#8d9ea6";
                            }}
                        >
                            Social Feed
                        </Link>
                    </div>
                </div>

                {/* Delivery Cards Grid */}
                <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                    {useFb ? (
                        displayedFbPosts.map(post => {
                            const parsed = parseDeliveryCaption(post.caption)
                            const dateLabel = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : ""
                            
                            return (
                                <div key={post.id}
                                    style={{ border: "1px solid #1a2328", background: "#07090b", display: "flex", flexDirection: "column", borderRadius: 2, overflow: "hidden", transition: "border-color .2s, transform .2s" }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.borderColor = "#5fd6e4";
                                        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.borderColor = "#1a2328";
                                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                                    }}
                                >
                                    {/* Image with zoom click */}
                                    <div 
                                        onClick={() => onOpenLightbox(post.url, `${parsed.car} - ${parsed.customer}`, post.caption || undefined, post.link || undefined)}
                                        style={{ position: "relative", aspectRatio: "1", background: "#040608", overflow: "hidden", cursor: "zoom-in" }}
                                    >
                                        <img 
                                            src={post.url} 
                                            alt={parsed.car} 
                                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", transition: "transform .4s ease" }}
                                            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                                            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                                        />
                                        
                                        {/* Overlay Badges */}
                                        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, alignItems: "center" }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(24,119,242,0.92)", color: "#fff", padding: "3px 8px", borderRadius: 2, fontSize: "0.68rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, letterSpacing: "0.06em" }}>
                                                <FacebookIcon size={11} />
                                                DELIVERY
                                            </span>
                                            {dateLabel && (
                                                <span style={{ background: "rgba(7,9,11,0.82)", backdropFilter: "blur(4px)", color: "#eef4f6", padding: "3px 8px", borderRadius: 2, fontSize: "0.68rem", fontFamily: "'IBM Plex Mono', monospace" }}>
                                                    {dateLabel}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.7)", color: "#5fd6e4", padding: "2px 7px", borderRadius: 2, fontSize: "0.7rem", fontFamily: "'IBM Plex Mono', monospace" }}>
                                            🔍 Tap to view
                                        </div>
                                    </div>

                                    {/* Content info */}
                                    <div style={{ padding: "14px 14px 12px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                            <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", color: "#5fd6e4", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                                {parsed.customer}
                                            </code>
                                            <span style={{ fontSize: "0.65rem", color: "#22c55e", fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>
                                                ✓ 100+ PTS PDI
                                            </span>
                                        </div>
                                        
                                        <b style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.05rem", fontWeight: 800, textTransform: "uppercase", lineHeight: 1.1, letterSpacing: "0.01em", color: "#eef4f6" }}>
                                            {parsed.car}
                                        </b>

                                        {parsed.dealer ? (
                                            <span style={{ color: "#8d9ea6", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 4 }}>
                                                📍 {parsed.dealer}
                                            </span>
                                        ) : (
                                            <span style={{ color: "#8d9ea6", fontSize: "0.82rem" }}>
                                                Detailing Garage Verified Delivery
                                            </span>
                                        )}

                                        {/* Bottom Action buttons */}
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginTop: "auto", paddingTop: 12, borderTop: "1px solid #1a2328" }}>
                                            <button 
                                                onClick={() => onOpenLightbox(post.url, `${parsed.car} - ${parsed.customer}`, post.caption || undefined, post.link || undefined)}
                                                style={{ border: "1px solid #1a2328", background: "#0e1316", color: "#eef4f6", padding: "7px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.06em", textTransform: "uppercase", borderRadius: 2, cursor: "pointer", textAlign: "center", transition: "border-color .2s" }}
                                                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "#5fd6e4")}
                                                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "#1a2328")}
                                            >
                                                Inspection Details
                                            </button>
                                            {post.link && (
                                                <a 
                                                    href={post.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#1877F2", color: "#fff", padding: "7px 12px", fontSize: "0.72rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, textDecoration: "none", borderRadius: 2 }}
                                                    title="View original post on Facebook"
                                                >
                                                    <FacebookIcon size={12} />
                                                    FB ↗
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        customers.list.map(c => (
                            <button key={c.id} onClick={() => onOpenLightbox(c.imageUrl, `${c.carModel} - ${c.customerDetails}`)}
                                style={{ padding: 0, border: "1px solid #1a2328", background: "#0e1316", cursor: "zoom-in", textAlign: "left", color: "#eef4f6", display: "grid", gridTemplateRows: "auto 1fr", borderRadius: 2, overflow: "hidden", font: "inherit", transition: "border-color .2s" }}
                                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "#5fd6e4")}
                                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "#1a2328")}>
                                <div style={{ aspectRatio: "1", background: "#07090b", overflow: "hidden" }}>
                                    <img src={c.imageUrl} alt={c.customerDetails} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                                </div>
                                <div style={{ padding: "16px 18px", display: "grid", gap: 4, alignContent: "start" }}>
                                    <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", color: "#5fd6e4", letterSpacing: "0.08em", textTransform: "uppercase" }}>{c.brand}</code>
                                    <b style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.25rem", textTransform: "uppercase", lineHeight: 1.1 }}>{c.carModel}</b>
                                    <span style={{ color: "#8d9ea6", fontSize: "0.9rem" }}>{c.customerDetails}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Show more button if Facebook deliveries exceed visible count */}
                {useFb && fbDeliveries.length > 8 && (
                    <div style={{ textAlign: "center", marginTop: 32 }}>
                        {visibleCount < fbDeliveries.length ? (
                            <button
                                onClick={() => setVisibleCount(prev => Math.min(prev + 8, fbDeliveries.length))}
                                style={{ border: "1px solid #5fd6e4", background: "transparent", color: "#5fd6e4", fontFamily: "'Saira Semi Condensed', sans-serif", fontWeight: 700, fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.08em", padding: "10px 28px", borderRadius: 2, cursor: "pointer", transition: "all .2s" }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.background = "#5fd6e4";
                                    (e.currentTarget as HTMLElement).style.color = "#07090b";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                    (e.currentTarget as HTMLElement).style.color = "#5fd6e4";
                                }}
                            >
                                Show More Deliveries ({visibleCount} of {fbDeliveries.length}) ↓
                            </button>
                        ) : (
                            <button
                                onClick={() => setVisibleCount(8)}
                                style={{ border: "1px solid #1a2328", background: "transparent", color: "#8d9ea6", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 20px", borderRadius: 2, cursor: "pointer" }}
                            >
                                Show Less ↑
                            </button>
                        )}
                    </div>
                )}

                {/* Brand badges at bottom */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 36, alignItems: "center", paddingTop: 24, borderTop: "1px solid #1a2328" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", color: "#5fd6e4", letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 8 }}>
                        Inspected Brands:
                    </span>
                    {customers.brands.map(b => (
                        <span key={b} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.74rem", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid #1a2328", padding: "5px 10px", color: "#8d9ea6", background: "#07090b" }}>{b}</span>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ─── Video Reels (Watch Us Work) ──────────────────────────────────────────────
function VideoSection({ videos }: { videos: WebsiteContent["videos"] }) {
    return (
        <section style={{ padding: "clamp(36px, 5vw, 60px) 0" }} id="watch">
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px" }}>
                <div style={{ display: "grid", gap: 8, maxWidth: "44rem", marginBottom: "clamp(20px, 3vw, 32px)" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5fd6e4" }}>{videos.eyebrow}</span>
                    <h2 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.25rem)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 1.05, margin: 0 }}>{videos.heading}</h2>
                    <p style={{ color: "#8d9ea6", fontSize: "0.95rem", maxWidth: "60ch", margin: 0, lineHeight: 1.55 }}>{videos.description}</p>
                </div>

                <div style={{ display: "grid", gap: 14 }} className="dg-reels">
                    {videos.reels.map(reel => (
                        <figure key={reel.id} style={{ position: "relative", margin: 0, border: "1px solid #1a2328", background: "#07090b", overflow: "hidden", borderRadius: 2 }}>
                            <video src={reel.videoUrl} poster={reel.posterUrl} muted loop playsInline autoPlay style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", aspectRatio: "9/15", cursor: "pointer" }} onClick={(e) => { const v = e.currentTarget; v.paused ? v.play() : v.pause(); }} />
                            <figcaption style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "30px 14px 12px", background: "linear-gradient(transparent, rgba(7,9,11,.9))", display: "grid", gap: 2, pointerEvents: "none" }}>
                                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#5fd6e4" }}>{reel.tag}</span>
                                <b style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.15rem", fontWeight: 800, textTransform: "uppercase" }}>{reel.title}</b>
                            </figcaption>
                        </figure>
                    ))}

                    {videos.sideCard && (
                        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                            <figure style={{ position: "relative", margin: 0, border: "1px solid #1a2328", background: "#07090b", overflow: "hidden", borderRadius: 2 }}>
                                <video src={videos.sideCard.videoUrl} poster={videos.sideCard.posterUrl} muted loop playsInline autoPlay style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", aspectRatio: "16/9", cursor: "pointer" }} onClick={(e) => { const v = e.currentTarget; v.paused ? v.play() : v.pause(); }} />
                            </figure>
                            <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.45rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>{videos.sideCard.heading}</h3>
                            <p style={{ color: "#8d9ea6", margin: 0, fontSize: "0.92rem", lineHeight: 1.55 }}>{videos.sideCard.description}</p>
                            <div>
                                <a href={videos.sideCard.ctaLink || "#contact"} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#5fd6e4", color: "#07090b", fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "10px 20px", borderRadius: 2, textDecoration: "none" }}>
                                    {videos.sideCard.ctaText || "Book a slot"}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media(min-width:900px){ .dg-reels { grid-template-columns: 1fr 1fr 1.25fr !important; } }
            `}</style>
        </section>
    )
}

// ─── Studio / About Section ───────────────────────────────────────────────────
function StudioSection({ studio }: { studio: WebsiteContent["studio"] }) {
    return (
        <section style={{ padding: "clamp(36px, 5vw, 60px) 0", background: "#0e1316", borderBlock: "1px solid #1a2328" }} id="studio">
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px" }}>
                <div style={{ display: "grid", gap: 32, alignItems: "center" }} className="dg-about-grid">
                    <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5fd6e4" }}>{studio.eyebrow}</span>
                        <h2 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.25rem)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 1.05, margin: 0 }}>{studio.heading}</h2>
                        <p style={{ color: "#eef4f6", fontSize: "1.05rem", margin: 0, maxWidth: "60ch" }}>
                            {studio.leadText}
                        </p>
                        <p style={{ color: "#8d9ea6", maxWidth: "60ch", margin: 0, fontSize: "0.92rem", lineHeight: 1.55 }}>
                            {studio.description}
                        </p>
                        <p style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#5fd6e4", lineHeight: 1.2, margin: 0 }}>
                            {studio.taglineHindi}
                        </p>
                        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginTop: 4 }}>
                            {studio.values.map(v => (
                                <div key={v.title} style={{ borderTop: "2px solid #5fd6e4", paddingTop: 10 }}>
                                    <b style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.05rem", fontWeight: 800, textTransform: "uppercase", display: "block" }}>{v.title}</b>
                                    <span style={{ color: "#8d9ea6", fontSize: "0.82rem" }}>{v.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {studio.photos.main && <img src={studio.photos.main} alt="Studio storefront" style={{ gridColumn: "span 2", width: "100%", height: "100%", aspectRatio: "16/10", objectFit: "cover", borderRadius: 2 }} />}
                        {studio.photos.sub1 && <img src={studio.photos.sub1} alt="Studio lounge window" style={{ width: "100%", height: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 2 }} />}
                        {studio.photos.sub2 && <img src={studio.photos.sub2} alt="Studio lounge interior" style={{ width: "100%", height: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 2 }} />}
                    </div>
                </div>

                <div style={{ display: "grid", gap: 20, marginTop: 40, paddingTop: 28, borderTop: "1px solid #1a2328" }} className="dg-region-grid">
                    <div>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5fd6e4" }}>{studio.region.eyebrow}</span>
                        <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.5rem", fontWeight: 800, textTransform: "uppercase", margin: "4px 0 0" }}>{studio.region.heading}</h3>
                        <p style={{ color: "#8d9ea6", marginTop: 10, margin: "10px 0 0" }}>{studio.region.description}</p>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {studio.region.districts.map(d => (
                            <span key={d.name} style={{ border: `1px solid ${d.isHighlighted ? "#5fd6e4" : "#1a2328"}`, color: d.isHighlighted ? "#5fd6e4" : "#eef4f6", padding: "8px 14px", fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem" }}>
                                {d.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @media(min-width:900px){ .dg-about-grid { grid-template-columns: 1fr 1fr !important; } }
                @media(min-width:860px){ .dg-region-grid { grid-template-columns: 1fr 2fr !important; align-items: start; } }
            `}</style>
        </section>
    )
}

// ─── Creators Program ─────────────────────────────────────────────────────────
function CreatorsSection({ creators }: { creators: WebsiteContent["creators"] }) {
    return (
        <section style={{ padding: "clamp(36px, 5vw, 60px) 0" }} id="creators">
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px" }}>
                <div style={{ display: "grid", gap: 8, maxWidth: "44rem", marginBottom: "clamp(20px, 3vw, 32px)" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5fd6e4" }}>{creators.eyebrow}</span>
                    <h2 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.25rem)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 1.05, margin: 0 }}>{creators.heading}</h2>
                    <p style={{ color: "#8d9ea6", fontSize: "0.95rem", maxWidth: "60ch", margin: 0, lineHeight: 1.55 }}>
                        {creators.description}
                    </p>
                </div>

                <div style={{ display: "grid", gap: 1, background: "#1a2328", border: "1px solid #1a2328", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
                    {creators.roles.map(r => (
                        <div key={r.title} style={{ background: "#07090b", padding: "20px 18px", display: "grid", gap: 8, alignContent: "start" }}>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#5fd6e4" }}>{r.roleNum}</span>
                            <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.2rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>{r.title}</h3>
                            <p style={{ color: "#8d9ea6", fontSize: "0.85rem", margin: 0 }}>{r.description}</p>
                            <div style={{ fontSize: "0.8rem", color: "#eef4f6", borderTop: "1px solid #1a2328", paddingTop: 8 }}>{r.bestFit}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: "grid", gap: 32, marginTop: 36 }} className="dg-creator-grid">
                    <div>
                        <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: "0 0 14px" }}>Who we're looking for</h3>
                        <dl style={{ display: "grid", borderTop: "1px solid #1a2328", margin: 0 }}>
                            {creators.requirements.map(item => (
                                <div key={item.label} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a2328", fontSize: "0.88rem" }}>
                                    <dt style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8d9ea6", paddingTop: 2 }}>{item.label}</dt>
                                    <dd style={{ margin: 0 }}>{item.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>How to apply</h3>
                        <p style={{ color: "#8d9ea6", margin: 0, fontSize: "0.9rem" }}>
                            {creators.applicationText}
                        </p>
                        <ul style={{ margin: 0, paddingLeft: 18, color: "#8d9ea6", display: "grid", gap: 4, fontSize: "0.88rem" }}>
                            {creators.applicationBullets.map(b => (
                                <li key={b}>{b}</li>
                            ))}
                        </ul>
                        <div style={{ marginTop: 4 }}>
                            <a href={`https://wa.me/${creators.whatsappNumber}?text=Influencer%20Application%20-%20`} target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#5fd6e4", color: "#07090b", fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "11px 22px", borderRadius: 2, textDecoration: "none" }}>
                                <WAIcon /> Apply on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media(min-width:900px){ .dg-creator-grid { grid-template-columns: 1fr 1fr !important; } }
            `}</style>
        </section>
    )
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────
function FAQSection({ faq }: { faq: WebsiteContent["faq"] }) {
    return (
        <section style={{ padding: "clamp(36px, 5vw, 60px) 0", background: "#0e1316", borderBlock: "1px solid #1a2328" }} id="faq">
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px" }}>
                <div style={{ display: "grid", gap: 8, maxWidth: "44rem", marginBottom: "clamp(20px, 3vw, 32px)" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5fd6e4" }}>{faq.eyebrow}</span>
                    <h2 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.25rem)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 1.05, margin: 0 }}>{faq.heading}</h2>
                </div>

                <div style={{ display: "grid", borderTop: "1px solid #1a2328", maxWidth: "52rem" }} className="dg-faq">
                    {faq.items.map(f => (
                        <details key={f.id} style={{ borderBottom: "1px solid #1a2328" }}>
                            <summary style={{ cursor: "pointer", padding: "16px 36px 16px 0", position: "relative", fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#eef4f6" }}>
                                {f.question}
                            </summary>
                            <p style={{ color: "#8d9ea6", padding: "0 0 18px", maxWidth: "64ch", margin: 0, lineHeight: 1.55, fontSize: "0.92rem" }}>{f.answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ─── Contact Section ──────────────────────────────────────────────────────────
function ContactSection({ contact }: { contact: WebsiteContent["contact"] }) {
    const [form, setForm] = useState({ name: "", phone: "", car: "", dealer: "", fuel: "Petrol", date: "", notes: "" })
    const [services, setServices] = useState<string[]>(["Pre-Delivery Inspection"])
    const [error, setError] = useState("")
    const [confirmMsg, setConfirmMsg] = useState("")
    const [waHref, setWaHref] = useState("")

    const toggleService = (svc: string) => {
        setServices(prev => prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc])
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const missing: string[] = []
        if (!form.name.trim()) missing.push("your name")
        if (form.phone.replace(/\D/g, "").length < 10) missing.push("a 10-digit mobile number")
        if (!form.car.trim()) missing.push("your car model")
        if (!services.length) missing.push("at least one service")
        if (missing.length) { setError("Please add " + missing.join(", ") + "."); return }
        setError("")
        const msg = [
            "Booking request - Detailing Garage",
            "Name: " + form.name,
            "Mobile: " + form.phone,
            "Car: " + form.car + " (" + form.fuel + ")",
            form.dealer ? "Dealership / location: " + form.dealer : "",
            "Services: " + services.join(", "),
            form.date ? "Preferred date: " + form.date : "",
            form.notes ? "Notes: " + form.notes : "",
        ].filter(Boolean).join("\n")
        setConfirmMsg(msg)
        setWaHref(`https://wa.me/${contact.whatsappNumber}?text=` + encodeURIComponent(msg))
    }

    const svcOptions = contact.bookingServices && contact.bookingServices.length > 0 ? contact.bookingServices : defaultWebsiteContent.contact.bookingServices

    return (
        <section style={{ padding: "clamp(36px, 5vw, 60px) 0", background: "#0e1316", borderTop: "1px solid #1a2328" }} id="contact">
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px", display: "grid", gap: 32 }} className="dg-contact-grid">
                <div>
                    <div style={{ display: "grid", gap: 8, maxWidth: "44rem", marginBottom: "clamp(20px, 3vw, 32px)" }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5fd6e4" }}>{contact.eyebrow}</span>
                        <h2 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.25rem)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 1.05, margin: 0 }}>{contact.heading}</h2>
                        <p style={{ color: "#8d9ea6", fontSize: "0.95rem", maxWidth: "60ch", margin: 0, lineHeight: 1.55 }}>{contact.description}</p>
                    </div>

                    <dl style={{ display: "grid", alignContent: "start", borderTop: "1px solid #1a2328", margin: 0 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12, padding: "12px 0", borderBottom: "1px solid #1a2328", alignItems: "start" }}>
                            <dt style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6", paddingTop: 3 }}>Phone</dt>
                            <dd style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, display: "grid", gap: 2 }}>
                                {contact.phones.map(ph => (
                                    <a key={ph} href={`tel:${ph.replace(/\s+/g, '')}`} style={{ color: "#eef4f6", textDecoration: "none" }}>{ph}</a>
                                ))}
                            </dd>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12, padding: "12px 0", borderBottom: "1px solid #1a2328", alignItems: "start" }}>
                            <dt style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6", paddingTop: 3 }}>WhatsApp</dt>
                            <dd style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>
                                <a href={`https://wa.me/${contact.whatsappNumber}`} target="_blank" rel="noopener" style={{ color: "#eef4f6", textDecoration: "none" }}>+{contact.whatsappNumber}</a>
                            </dd>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12, padding: "12px 0", borderBottom: "1px solid #1a2328", alignItems: "start" }}>
                            <dt style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6", paddingTop: 3 }}>Email</dt>
                            <dd style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>
                                <a href={`mailto:${contact.email}`} style={{ color: "#eef4f6", textDecoration: "none" }}>{contact.email}</a>
                            </dd>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12, padding: "12px 0", borderBottom: "1px solid #1a2328", alignItems: "start" }}>
                            <dt style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6", paddingTop: 3 }}>Studio</dt>
                            <dd style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{contact.address}</dd>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12, padding: "12px 0", borderBottom: "1px solid #1a2328", alignItems: "start" }}>
                            <dt style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6", paddingTop: 3 }}>Hours</dt>
                            <dd style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{contact.hours}</dd>
                        </div>
                    </dl>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ background: "#0e1316", border: "1px solid #1a2328", padding: "clamp(20px, 3.5vw, 32px)", display: "grid", gap: 14, minWidth: 0 }}>
                    <h3 style={{ fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontSize: "1.5rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>Request a booking</h3>

                    <div style={{ display: "grid", gap: 16 }} className="dg-form-row-2">
                        <div style={{ display: "grid", gap: 6 }}>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6" }}>Your name</label>
                            <input placeholder="Full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ width: "100%", fontFamily: "inherit", fontSize: "1rem", color: "#eef4f6", background: "#07090b", border: "1px solid #1a2328", borderRadius: 2, padding: "12px 14px", outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <div style={{ display: "grid", gap: 6 }}>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6" }}>Mobile number</label>
                            <input placeholder="10-digit mobile" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={{ width: "100%", fontFamily: "inherit", fontSize: "1rem", color: "#eef4f6", background: "#07090b", border: "1px solid #1a2328", borderRadius: 2, padding: "12px 14px", outline: "none", boxSizing: "border-box" }} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: 16 }} className="dg-form-row-2">
                        <div style={{ display: "grid", gap: 6 }}>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6" }}>Car make &amp; model</label>
                            <input placeholder="e.g. Tata Sierra EV" value={form.car} onChange={e => setForm(p => ({ ...p, car: e.target.value }))} style={{ width: "100%", fontFamily: "inherit", fontSize: "1rem", color: "#eef4f6", background: "#07090b", border: "1px solid #1a2328", borderRadius: 2, padding: "12px 14px", outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <div style={{ display: "grid", gap: 6 }}>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6" }}>Dealership / location</label>
                            <input placeholder="e.g. Surya Tata, Mandi" value={form.dealer} onChange={e => setForm(p => ({ ...p, dealer: e.target.value }))} style={{ width: "100%", fontFamily: "inherit", fontSize: "1rem", color: "#eef4f6", background: "#07090b", border: "1px solid #1a2328", borderRadius: 2, padding: "12px 14px", outline: "none", boxSizing: "border-box" }} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: 16 }} className="dg-form-row-2">
                        <div style={{ display: "grid", gap: 6 }}>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6" }}>Fuel type</label>
                            <select value={form.fuel} onChange={e => setForm(p => ({ ...p, fuel: e.target.value }))} style={{ width: "100%", fontFamily: "inherit", fontSize: "1rem", color: "#eef4f6", background: "#07090b", border: "1px solid #1a2328", borderRadius: 2, padding: "12px 14px", outline: "none", boxSizing: "border-box" }}>
                                {["Petrol", "Diesel", "EV", "CNG"].map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "grid", gap: 6 }}>
                            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6" }}>Preferred date</label>
                            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ width: "100%", fontFamily: "inherit", fontSize: "1rem", color: "#eef4f6", background: "#07090b", border: "1px solid #1a2328", borderRadius: 2, padding: "12px 14px", outline: "none", boxSizing: "border-box" }} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6" }}>Services</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {svcOptions.map(svc => {
                                const checked = services.includes(svc)
                                return (
                                    <label key={svc} style={{ cursor: "pointer" }}>
                                        <input type="checkbox" checked={checked} onChange={() => toggleService(svc)} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />
                                        <span style={{ display: "inline-block", padding: "8px 14px", border: `1px solid ${checked ? "#5fd6e4" : "#1a2328"}`, borderRadius: 2, fontSize: "0.9rem", cursor: "pointer", transition: "all .2s", background: checked ? "#5fd6e4" : "transparent", color: checked ? "#07090b" : "#eef4f6", userSelect: "none" }}>
                                            {svc}
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: 6 }}>
                        <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#8d9ea6" }}>Anything else?</label>
                        <textarea placeholder="Delivery date, concerns, questions..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ width: "100%", fontFamily: "inherit", fontSize: "1rem", color: "#eef4f6", background: "#07090b", border: "1px solid #1a2328", borderRadius: 2, padding: "12px 14px", outline: "none", minHeight: 90, resize: "vertical", boxSizing: "border-box" }} />
                    </div>

                    {error && <p style={{ color: "#ff9b9b", fontSize: "0.9rem", margin: 0 }}>{error}</p>}

                    <div>
                        <button type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#5fd6e4", color: "#07090b", fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "14px 26px", borderRadius: 2, border: "none", cursor: "pointer" }}>
                            Prepare WhatsApp message
                        </button>
                    </div>

                    {confirmMsg && (
                        <div style={{ border: "1px solid #5fd6e4", background: "rgba(95,214,228,.06)", padding: 20, display: "grid", gap: 12 }}>
                            <strong>Your request is ready. Send it to us on WhatsApp.</strong>
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem", background: "#07090b", border: "1px solid #1a2328", padding: 14, overflowX: "auto" }}>{confirmMsg}</pre>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                <a href={waHref} target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#5fd6e4", color: "#07090b", fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "14px 26px", borderRadius: 2, textDecoration: "none" }}>
                                    <WAIcon /> Open WhatsApp
                                </a>
                                <button type="button" onClick={() => { navigator.clipboard?.writeText(confirmMsg) }} style={{ display: "inline-flex", alignItems: "center", gap: 10, border: "1px solid rgba(238,244,246,.25)", color: "#eef4f6", background: "rgba(7,9,11,.4)", fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "14px 26px", borderRadius: 2, cursor: "pointer" }}>
                                    Copy message
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            <style>{`
                @media(min-width:940px){ .dg-contact-grid { grid-template-columns: .85fr 1.15fr !important; } }
                @media(min-width:600px){ .dg-form-row-2 { grid-template-columns: 1fr 1fr !important; } }
            `}</style>
        </section>
    )
}

// ─── SiteFooter ───────────────────────────────────────────────────────────────
function SiteFooter({ footer, contact }: { footer: WebsiteContent["footer"]; contact: WebsiteContent["contact"] }) {
    return (
        <footer style={{ borderTop: "1px solid #1a2328", paddingBlock: "48px 32px", background: "#0e1316" }}>
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px" }}>
                <div style={{ display: "grid", gap: 32 }} className="dg-footer-grid">
                    <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
                        <img src="/images/logo.png" alt="Detailing Garage" style={{ height: 64, width: "auto" }} onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
                        <p style={{ color: "#8d9ea6", maxWidth: "40ch", margin: 0, lineHeight: 1.6 }}>{footer.aboutText}</p>
                    </div>

                    <div>
                        <h4 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#8d9ea6", margin: "0 0 12px", fontWeight: 500 }}>Services</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8, fontSize: "0.94rem" }}>
                            {["Pre-Delivery Inspection", "Ceramic & graphene coating", "Paint protection film", "Denting & painting", "Insurance claim help"].map(l => (
                                <li key={l}><a href="#services" style={{ textDecoration: "none", color: "#eef4f6" }} onMouseEnter={e => (e.currentTarget.style.color = "#5fd6e4")} onMouseLeave={e => (e.currentTarget.style.color = "#eef4f6")}>{l}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#8d9ea6", margin: "0 0 12px", fontWeight: 500 }}>Company &amp; Pages</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8, fontSize: "0.94rem" }}>
                            {[
                                { label: "Marketplace", href: "/marketplace" },
                                { label: "Cars Stock", href: "/cars" },
                                { label: "Bikes Stock", href: "/bikes" },
                                { label: "Insurance Claims", href: "/insurance-claim" },
                                { label: "Community Feed", href: "/feed" },
                                { label: "Our Studio", href: "#studio" },
                                { label: "Creators Program", href: "#creators" },
                                { label: "Privacy Policy", href: "/privacy-policy" },
                                { label: "Terms of Service", href: "/terms" },
                            ].map(l => (
                                <li key={l.label}><a href={l.href} style={{ textDecoration: "none", color: "#eef4f6" }} onMouseEnter={e => (e.currentTarget.style.color = "#5fd6e4")} onMouseLeave={e => (e.currentTarget.style.color = "#eef4f6")}>{l.label}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#8d9ea6", margin: "0 0 12px", fontWeight: 500 }}>Contact</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8, fontSize: "0.94rem" }}>
                            {contact.phones.map(ph => (
                                <li key={ph}><a href={`tel:${ph.replace(/\s+/g, '')}`} style={{ textDecoration: "none", color: "#eef4f6" }}>{ph}</a></li>
                            ))}
                            <li><a href={`mailto:${contact.email}`} style={{ textDecoration: "none", color: "#eef4f6" }}>{contact.email}</a></li>
                        </ul>
                    </div>
                </div>

                <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid #1a2328", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, color: "#8d9ea6", fontSize: "0.85rem" }}>
                    <span>© {new Date().getFullYear()} {footer.copyrightText}</span>
                    <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                        <a href="/privacy-policy" style={{ color: "#8d9ea6", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#5fd6e4")} onMouseLeave={e => (e.currentTarget.style.color = "#8d9ea6")}>Privacy Policy</a>
                        <span style={{ opacity: 0.3 }}>•</span>
                        <a href="/terms" style={{ color: "#8d9ea6", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#5fd6e4")} onMouseLeave={e => (e.currentTarget.style.color = "#8d9ea6")}>Terms of Service</a>
                    </div>
                    <span>{footer.tagline}</span>
                </div>
            </div>

            <style>{`
                @media(min-width:800px){ .dg-footer-grid { grid-template-columns: 1.4fr 1fr 1fr 1fr !important; } }
            `}</style>
        </footer>
    )
}

// ─── WAFloat ──────────────────────────────────────────────────────────────────
function WAFloat({ whatsappNumber }: { whatsappNumber: string }) {
    return (
        <a href={`https://wa.me/${whatsappNumber}?text=Hi%20Detailing%20Garage%2C%20I%27d%20like%20to%20book%20a%20service.`} target="_blank" rel="noopener" aria-label="Chat on WhatsApp"
            style={{ position: "fixed", right: 18, bottom: 18, zIndex: 40, width: 56, height: 56, borderRadius: "50%", background: "#25d366", color: "#07090b", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,.5)", textDecoration: "none" }}>
            <WAIcon size={30} />
        </a>
    )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HomeClient() {
    const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent)
    const [socialPosts, setSocialPosts] = useState<SocialPost[]>([])
    const [lightbox, setLightbox] = useState<{ open: boolean; src: string; alt: string; caption?: string; link?: string }>({ open: false, src: "", alt: "" })

    useEffect(() => {
        // Fetch 100% dynamic website content from server
        fetch("/api/public/website-content")
            .then(r => r.json())
            .then(res => {
                if (res.success && res.data) {
                    setContent(res.data)
                }
            })
            .catch(() => { })

        // Fetch dynamic Facebook delivery posts from studio post database
        fetch("/api/public/posts?limit=30")
            .then(r => r.json())
            .then(res => {
                if (res.posts && Array.isArray(res.posts)) {
                    setSocialPosts(res.posts)
                }
            })
            .catch(() => { })
    }, [])

    const openLightbox = (src: string, alt: string, caption?: string, link?: string) => {
        setLightbox({ open: true, src, alt, caption, link })
    }

    const closeLightbox = () => {
        setLightbox({ open: false, src: "", alt: "", caption: "", link: "" })
    }

    return (
        <div style={{ minHeight: "100vh", background: "#07090b", color: "#eef4f6", fontFamily: "'Manrope', 'Segoe UI', system-ui, sans-serif", fontSize: 16, lineHeight: 1.6, overflowX: "hidden" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Saira+Semi+Condensed:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                img { display: block; max-width: 100%; }
                :focus-visible { outline: 2px solid #5fd6e4; outline-offset: 3px; border-radius: 2px; }
                input[type=date]::-webkit-calendar-picker-indicator { filter: invert(1); }
            `}</style>

            <Navbar />

            <main id="top">
                <HeroSection hero={content.hero} />
                <TickerStrip items={content.ticker.items} />
                <PDISection pdi={content.pdi} onOpenLightbox={openLightbox} />
                <ServicesSection services={content.services} onOpenLightbox={openLightbox} />
                <PackagesSection packages={content.packages} />
                <CustomersSection customers={content.customers} posts={socialPosts} onOpenLightbox={openLightbox} />
                <VideoSection videos={content.videos} />
                <StudioSection studio={content.studio} />
                <CreatorsSection creators={content.creators} />
                <FAQSection faq={content.faq} />
                <ContactSection contact={content.contact} />
            </main>

            <SiteFooter footer={content.footer} contact={content.contact} />
            <WAFloat whatsappNumber={content.contact.whatsappNumber} />

            {/* Lightbox modal for sample reports, posters & customer deliveries */}
            {lightbox.open && (
                <div onClick={closeLightbox} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(4,6,8,.96)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
                    <div style={{ maxWidth: lightbox.caption ? 1040 : 900, width: "100%", maxHeight: "90vh", display: "grid", gridTemplateColumns: lightbox.caption ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr", background: "#0e1316", border: "1px solid #1a2328", borderRadius: 4, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
                        <div style={{ background: "#07090b", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, minHeight: 320, maxHeight: "85vh", overflow: "hidden" }}>
                            <img src={lightbox.src} alt={lightbox.alt} style={{ maxHeight: "80vh", maxWidth: "100%", objectFit: "contain" }} />
                        </div>
                        {lightbox.caption && (
                            <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0e1316", borderLeft: "1px solid #1a2328", maxHeight: "85vh", overflowY: "auto" }}>
                                <div style={{ display: "grid", gap: 14 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#1877F2", fontSize: "0.78rem", fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>
                                            <FacebookIcon size={15} />
                                            VERIFIED FACEBOOK DELIVERY
                                        </span>
                                    </div>
                                    <h3 style={{ margin: 0, fontFamily: "'Saira Semi Condensed', sans-serif", fontSize: "1.45rem", textTransform: "uppercase", color: "#eef4f6", lineHeight: 1.2 }}>
                                        {lightbox.alt}
                                    </h3>
                                    <div style={{ color: "#a5b4bc", fontSize: "0.88rem", lineHeight: 1.6, whiteSpace: "pre-line", maxHeight: 340, overflowY: "auto", paddingRight: 8, borderTop: "1px solid #1a2328", paddingTop: 12 }}>
                                        {lightbox.caption}
                                    </div>
                                </div>
                                <div style={{ paddingTop: 18, borderTop: "1px solid #1a2328", marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {lightbox.link && (
                                        <a href={lightbox.link} target="_blank" rel="noopener noreferrer" style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 18px", background: "#1877F2", color: "#fff", textDecoration: "none", fontFamily: "'Saira Semi Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.06em", borderRadius: 2 }}>
                                            <FacebookIcon size={14} />
                                            View on Facebook ↗
                                        </a>
                                    )}
                                    <button onClick={closeLightbox} style={{ border: "1px solid #1a2328", background: "#07090b", color: "#8d9ea6", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem", padding: "10px 16px", borderRadius: 2, cursor: "pointer" }}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={closeLightbox} style={{ position: "absolute", top: 20, right: 24, border: "1px solid rgba(238,244,246,.25)", color: "#eef4f6", background: "rgba(7,9,11,.8)", fontFamily: "'Saira Semi Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", padding: "10px 20px", borderRadius: 2, cursor: "pointer" }}>
                        Close ✕
                    </button>
                </div>
            )}
        </div>
    )
}
