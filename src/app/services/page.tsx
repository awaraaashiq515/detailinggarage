"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { WebsiteContent, defaultWebsiteContent } from "@/lib/website-content.types"

// ─── WhatsApp Float ───────────────────────────────────────────────────────────
function WAFloat({ number }: { number: string }) {
    return (
        <a
            href={`https://wa.me/${number}?text=Hi%20Detailing%20Garage%2C%20I%27d%20like%20to%20enquire%20about%20a%20service.`}
            target="_blank"
            rel="noopener"
            aria-label="Chat on WhatsApp"
            style={{
                position: "fixed", right: 18, bottom: 18, zIndex: 40, width: 56, height: 56,
                borderRadius: "50%", background: "#25d366", color: "#07090b",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,.5)", textDecoration: "none"
            }}
        >
            <svg width={30} height={30} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z" />
            </svg>
        </a>
    )
}

// ─── SiteFooter (matches HomeClient footer exactly) ────────────────────────────
function SiteFooter({ footer, contact }: { footer: WebsiteContent["footer"]; contact: WebsiteContent["contact"] }) {
    return (
        <footer style={{ borderTop: "1px solid #1a2328", paddingBlock: "48px 32px", background: "#0e1316" }}>
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px" }}>
                <div style={{ display: "grid", gap: 32 }} className="dg-footer-grid">
                    <div style={{ display: "grid", gap: 12 }}>
                        <div>
                            <span style={{ fontFamily: "'Saira Semi Condensed','Arial Narrow',sans-serif", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                DETAI<span style={{ color: "#5fd6e4" }}>L</span>ING GARAGE
                            </span>
                            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#5fd6e4", marginTop: 2 }}>Detailing That Defines Luxury</div>
                        </div>
                        <p style={{ color: "#8d9ea6", maxWidth: "40ch", margin: 0, lineHeight: 1.6 }}>{footer.aboutText}</p>
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#5fd6e4" }}>Contact</span>
                        {contact.phones.slice(0, 2).map(ph => (
                            <a key={ph} href={`tel:${ph.replace(/\s/g, "")}`} style={{ color: "#eef4f6", textDecoration: "none", fontSize: "0.9rem" }}>{ph}</a>
                        ))}
                        <a href={`mailto:${contact.email}`} style={{ color: "#8d9ea6", textDecoration: "none", fontSize: "0.85rem" }}>{contact.email}</a>
                        <span style={{ color: "#8d9ea6", fontSize: "0.82rem" }}>{contact.address}</span>
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#5fd6e4" }}>Follow</span>
                        <a href="https://www.instagram.com/detailinggarage.in" target="_blank" rel="noopener" style={{ color: "#eef4f6", textDecoration: "none", fontSize: "0.9rem" }}>Instagram</a>
                        <a href="https://g.page/r/detailinggarage" target="_blank" rel="noopener" style={{ color: "#8d9ea6", textDecoration: "none", fontSize: "0.85rem" }}>Google Reviews</a>
                        <a href="/pdi" style={{ color: "#8d9ea6", textDecoration: "none", fontSize: "0.85rem" }}>PDI Inspection</a>
                        <a href="/dealers" style={{ color: "#8d9ea6", textDecoration: "none", fontSize: "0.85rem" }}>Become a Dealer</a>
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#5fd6e4" }}>Quick Links</span>
                        <Link href="/" style={{ color: "#8d9ea6", textDecoration: "none", fontSize: "0.85rem" }}>Home</Link>
                        <Link href="/services" style={{ color: "#5fd6e4", textDecoration: "none", fontSize: "0.85rem" }}>Services</Link>
                        <Link href="/marketplace" style={{ color: "#8d9ea6", textDecoration: "none", fontSize: "0.85rem" }}>Marketplace</Link>
                        <Link href="/insurance-claim" style={{ color: "#8d9ea6", textDecoration: "none", fontSize: "0.85rem" }}>Insurance Claims</Link>
                    </div>
                </div>
                <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #1a2328", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, color: "#8d9ea6", fontSize: "0.78rem", fontFamily: "'IBM Plex Mono',monospace" }}>
                    <span>© {new Date().getFullYear()} {footer.copyrightText}</span>
                    <span>{footer.tagline}</span>
                </div>
            </div>
            <style>{`@media(min-width:800px){ .dg-footer-grid { grid-template-columns: 1.4fr 1fr 1fr 1fr !important; } }`}</style>
        </footer>
    )
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ service, waNumber }: {
    service: WebsiteContent["services"]["primaryList"][0]
    waNumber: string
}) {
    const [hovered, setHovered] = useState(false)
    const bookLink = service.ctaLink?.startsWith("http") || service.ctaLink?.startsWith("/")
        ? service.ctaLink
        : `https://wa.me/${waNumber}?text=Hi%20Detailing%20Garage%2C%20I%27m%20interested%20in%20${encodeURIComponent(service.title)}`

    return (
        <article
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? "#07090b" : "#0e1316",
                border: "1px solid #1a2328",
                borderRadius: 16,
                padding: "26px 22px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "background .22s, box-shadow .22s, transform .22s",
                boxShadow: hovered ? "0 8px 32px rgba(95,214,228,0.08)" : "none",
                transform: hovered ? "translateY(-2px)" : "none",
            }}
        >
            {service.emoji && (
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>{service.emoji}</div>
            )}
            <h3 style={{
                fontFamily: "'Saira Semi Condensed','Arial Narrow',sans-serif",
                fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase",
                margin: 0, color: "#eef4f6", letterSpacing: "0.03em"
            }}>
                {service.title}
            </h3>
            <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#cbd5e1", fontSize: "0.92rem", margin: 0, lineHeight: 1.6, flex: 1 }}>
                {service.description}
            </p>
            {service.items && service.items.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "grid", gap: 6, fontFamily: "'Manrope', system-ui, sans-serif" }}>
                    {service.items.map(item => (
                        <li key={item} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.86rem", color: "#e2e8f0", fontWeight: 500 }}>
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#16acd4" strokeWidth={2.5}>
                                <path d="M4 12l5 5L20 6" />
                            </svg>
                            {item}
                        </li>
                    ))}
                </ul>
            )}
            <a
                href={bookLink}
                target={bookLink.startsWith("http") ? "_blank" : undefined}
                rel={bookLink.startsWith("http") ? "noopener" : undefined}
                style={{
                    marginTop: 10,
                    display: "inline-block",
                    padding: "9px 18px",
                    borderRadius: 8,
                    background: "#16acd4",
                    color: "#07090b",
                    fontFamily: "'Saira Semi Condensed','Arial Narrow',sans-serif",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    textDecoration: "none",
                    alignSelf: "flex-start",
                }}
            >
                Book / enquire
            </a>
        </article>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ServicesPage() {
    const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/public/website-content")
            .then(r => r.json())
            .then(res => {
                if (res.success && res.data) setContent(res.data)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const { services, contact, footer } = content
    const allCards = [...(services.primaryList || [])].filter(s => s.isActive !== false)
    const brands = services.brands || defaultWebsiteContent.services.brands || []
    const brandsHeading = services.brandsHeading || "Brands We Offer"

    return (
        <div style={{
            minHeight: "100vh", background: "#07090b", color: "#eef4f6",
            fontFamily: "'Manrope','Segoe UI',system-ui,sans-serif", fontSize: 16, lineHeight: 1.6, overflowX: "hidden"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Saira+Semi+Condensed:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                img { display: block; max-width: 100%; }
                :focus-visible { outline: 2px solid #5fd6e4; outline-offset: 3px; border-radius: 2px; }
                .srv-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
                @media(min-width:600px){ .srv-grid { grid-template-columns: repeat(2,1fr); } }
                @media(min-width:900px){ .srv-grid { grid-template-columns: repeat(3,1fr); } }
                @media(min-width:1200px){ .srv-grid { grid-template-columns: repeat(4,1fr); } }
            `}</style>

            <Navbar />

            <main>
                {/* ─── Hero Banner ─────────────────────────────────────────── */}
                <section style={{
                    padding: "72px 32px 56px",
                    background: "linear-gradient(135deg, #07090b 0%, #0e1a1f 60%, #0a1419 100%)",
                    borderBottom: "1px solid #1a2328",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    {/* BG decoration */}
                    <div style={{
                        position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
                        background: "radial-gradient(ellipse at 80% 50%, rgba(22,172,212,0.07) 0%, transparent 70%)",
                        pointerEvents: "none"
                    }} />
                    <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", position: "relative" }}>
                        <span style={{
                            fontFamily: "'IBM Plex Mono',monospace",
                            fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase",
                            color: "#5fd6e4", display: "block", marginBottom: 16
                        }}>
                            {services.eyebrow}
                        </span>
                        <h1 style={{
                            fontFamily: "'Saira Semi Condensed','Arial Narrow',sans-serif",
                            fontSize: "clamp(2.8rem,8vw,5rem)", fontWeight: 800,
                            textTransform: "uppercase", margin: "0 0 20px", lineHeight: 1,
                            letterSpacing: "0.02em"
                        }}>
                            OUR <span style={{ color: "#16acd4" }}>SERVICES</span>
                        </h1>
                        <p style={{ color: "#8d9ea6", fontSize: "1.05rem", maxWidth: "56ch", margin: 0, lineHeight: 1.65 }}>
                            {services.description}
                        </p>
                    </div>
                </section>

                {/* ─── Services Grid ───────────────────────────────────────── */}
                <section style={{ padding: "56px 32px 0", background: "#07090b" }}>
                    <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto" }}>
                        {loading ? (
                            <div className="srv-grid">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} style={{
                                        height: 240, background: "#0e1316", borderRadius: 16,
                                        border: "1px solid #1a2328", animation: "pulse 1.5s ease-in-out infinite"
                                    }} />
                                ))}
                            </div>
                        ) : (
                            <div className="srv-grid">
                                {allCards.map(service => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        waNumber={contact.whatsappNumber}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ─── Brands Strip ────────────────────────────────────────── */}
                {brands.length > 0 && (
                    <section style={{ padding: "72px 32px 64px", background: "#07090b" }}>
                        <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto" }}>
                            <h2 style={{
                                fontFamily: "'Saira Semi Condensed','Arial Narrow',sans-serif",
                                fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800,
                                textTransform: "uppercase", margin: "0 0 32px", letterSpacing: "0.02em"
                            }}>
                                {brandsHeading.split(" ").slice(0, -1).join(" ")}{" "}
                                <span style={{ color: "#16acd4" }}>{brandsHeading.split(" ").at(-1)}</span>
                            </h2>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                {brands.map(brand => (
                                    <span key={brand} style={{
                                        padding: "7px 18px",
                                        border: "1.5px solid #1a2328",
                                        borderRadius: 999,
                                        fontSize: "0.88rem",
                                        color: "#eef4f6",
                                        background: "#0e1316",
                                        fontFamily: "'Manrope',sans-serif",
                                        fontWeight: 600,
                                        letterSpacing: "0.02em",
                                    }}>
                                        {brand}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ─── CTA Strip ───────────────────────────────────────────── */}
                <section style={{
                    padding: "56px 32px",
                    background: "linear-gradient(135deg, #0e1316 0%, #0a1419 100%)",
                    borderTop: "1px solid #1a2328"
                }}>
                    <div style={{
                        maxWidth: "calc(1180px + 64px)", margin: "0 auto",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flexWrap: "wrap", gap: 24
                    }}>
                        <div>
                            <h2 style={{
                                fontFamily: "'Saira Semi Condensed','Arial Narrow',sans-serif",
                                fontSize: "clamp(1.5rem,3.5vw,2.2rem)", fontWeight: 800,
                                textTransform: "uppercase", margin: "0 0 8px"
                            }}>
                                Ready to protect your car?
                            </h2>
                            <p style={{ color: "#8d9ea6", margin: 0, fontSize: "0.95rem" }}>
                                Call us or drop a WhatsApp — we reply fast.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <a
                                href={`https://wa.me/${contact.whatsappNumber}?text=Hi%20Detailing%20Garage%2C%20I%27d%20like%20to%20book%20a%20service.`}
                                target="_blank"
                                rel="noopener"
                                style={{
                                    padding: "13px 26px",
                                    borderRadius: 8,
                                    background: "#25d366",
                                    color: "#07090b",
                                    fontFamily: "'Saira Semi Condensed',sans-serif",
                                    fontWeight: 800,
                                    fontSize: "0.95rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8
                                }}
                            >
                                💬 Book on WhatsApp
                            </a>
                            <a
                                href={`tel:${contact.phones[0]?.replace(/\s/g, "")}`}
                                style={{
                                    padding: "13px 26px",
                                    borderRadius: 8,
                                    border: "1.5px solid rgba(238,244,246,0.2)",
                                    background: "transparent",
                                    color: "#eef4f6",
                                    fontFamily: "'Saira Semi Condensed',sans-serif",
                                    fontWeight: 800,
                                    fontSize: "0.95rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    textDecoration: "none",
                                }}
                            >
                                📞 Call Now
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter footer={footer} contact={contact} />
            <WAFloat number={contact.whatsappNumber} />
        </div>
    )
}

