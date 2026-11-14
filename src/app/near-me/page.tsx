"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { NEAR_ME_CATEGORIES, POPULAR_CITIES, NearMeCategory } from "@/lib/near-me-categories"
import { WebsiteContent, defaultWebsiteContent } from "@/lib/website-content.types"

interface Listing {
    id: string
    name: string
    category: string
    categoryLabel?: string | null
    city: string
    area?: string | null
    address?: string | null
    phone: string
    whatsapp?: string | null
    mapsUrl?: string | null
    rating: number
    reviewsCount: number
    isVerified: boolean
    isActive: boolean
    services?: string | null
}

function WAFloat({ number }: { number: string }) {
    return (
        <a
            href={`https://wa.me/${number}?text=Hi%20Detailing%20Garage%2C%20I%20need%20help%20finding%20a%20nearby%20car%20service.`}
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

function SiteFooter({ footer, contact }: { footer: WebsiteContent["footer"]; contact: WebsiteContent["contact"] }) {
    return (
        <footer style={{ borderTop: "1px solid #1a2328", paddingBlock: "48px 32px", background: "#0e1316" }}>
            <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 32px" }}>
                <div style={{ display: "grid", gap: 32 }} className="dg-footer-grid">
                    <div style={{ display: "grid", gap: 12 }}>
                        <div>
                            <span style={{ fontFamily: "'Saira Semi Condensed','Arial Narrow',sans-serif", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                DETAI<span style={{ color: "#16acd4" }}>L</span>ING GARAGE
                            </span>
                            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#16acd4", marginTop: 2 }}>Detailing That Defines Luxury</div>
                        </div>
                        <p style={{ color: "#8d9ea6", maxWidth: "40ch", margin: 0, lineHeight: 1.6 }}>{footer.aboutText}</p>
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#16acd4" }}>Contact</span>
                        {contact.phones.slice(0, 2).map(ph => (
                            <a key={ph} href={`tel:${ph.replace(/\s/g, "")}`} style={{ color: "#eef4f6", textDecoration: "none", fontSize: "0.9rem" }}>{ph}</a>
                        ))}
                        <a href={`mailto:${contact.email}`} style={{ color: "#8d9ea6", textDecoration: "none", fontSize: "0.85rem" }}>{contact.email}</a>
                        <span style={{ color: "#8d9ea6", fontSize: "0.82rem" }}>{contact.address}</span>
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#16acd4" }}>Explore</span>
                        <Link href="/services" style={{ color: "#8d9ea6", textDecoration: "none", fontSize: "0.85rem" }}>Our Services</Link>
                        <Link href="/pdi" style={{ color: "#8d9ea6", textDecoration: "none", fontSize: "0.85rem" }}>PDI Inspection</Link>
                        <Link href="/report-warranty" style={{ color: "#8d9ea6", textDecoration: "none", fontSize: "0.85rem" }}>Report &amp; Warranty</Link>
                        <Link href="/near-me" style={{ color: "#16acd4", textDecoration: "none", fontSize: "0.85rem" }}>Near Me Directory</Link>
                    </div>
                </div>
                <div style={{ borderTop: "1px solid #1a2328", marginTop: 36, paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, color: "#61727c", fontSize: "0.75rem" }}>
                    <span>{footer.copyrightText}</span>
                    <span>Detailing Garage · Inspect. Protect. Restore.</span>
                </div>
            </div>
            <style>{`
                @media(min-width:720px){ .dg-footer-grid{ grid-template-columns: 1.6fr 1fr 1fr !important; } }
            `}</style>
        </footer>
    )
}

export default function NearMePage() {
    const [selectedCategory, setSelectedCategory] = useState<string>("car-wash")
    const [selectedCity, setSelectedCity] = useState<string>("All cities")
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [availableCities, setAvailableCities] = useState<string[]>(POPULAR_CITIES)
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
    const [websiteContent, setWebsiteContent] = useState<WebsiteContent>(defaultWebsiteContent)

    // Form state for "+ List your business"
    const [form, setForm] = useState({
        name: "",
        category: "garages",
        city: "Mandi",
        area: "",
        address: "",
        phone: "",
        whatsapp: "",
        services: ""
    })

    useEffect(() => {
        fetch("/api/public/website-content")
            .then(r => r.json())
            .then(res => {
                if (res.success && res.data) setWebsiteContent(res.data)
            })
            .catch(() => {})
    }, [])

    const fetchListings = () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (selectedCategory) params.set("category", selectedCategory)
        if (selectedCity && selectedCity !== "All cities") params.set("city", selectedCity)
        if (searchQuery.trim()) params.set("search", searchQuery.trim())

        fetch(`/api/near-me?${params.toString()}`)
            .then(r => r.json())
            .then(res => {
                if (res.success && Array.isArray(res.listings)) {
                    setListings(res.listings)
                    if (res.availableCities && res.availableCities.length > 0) {
                        const merged = Array.from(new Set(["All cities", ...res.availableCities, ...POPULAR_CITIES]))
                        setAvailableCities(merged)
                    }
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchListings()
    }, [selectedCategory, selectedCity])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        fetchListings()
    }

    const currentCatInfo = useMemo(() => {
        return NEAR_ME_CATEGORIES.find(c => c.id === selectedCategory) || {
            id: selectedCategory,
            label: "Auto Services Near Me",
            emoji: "🚗",
            description: ""
        }
    }, [selectedCategory])

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.phone) {
            alert("Please enter business name and phone number")
            return
        }
        setSubmitting(true)
        try {
            const res = await fetch("/api/near-me", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (data.success) {
                setSubmitSuccess(true)
                setTimeout(() => {
                    setModalOpen(false)
                    setSubmitSuccess(false)
                    setForm({
                        name: "",
                        category: "garages",
                        city: "Mandi",
                        area: "",
                        address: "",
                        phone: "",
                        whatsapp: "",
                        services: ""
                    })
                    fetchListings()
                }, 1800)
            } else {
                alert(data.error || "Failed to submit business listing")
            }
        } catch {
            alert("Error submitting listing. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const googleMapsUrl = useMemo(() => {
        const query = `${currentCatInfo.label} in ${selectedCity !== "All cities" ? selectedCity : "Himachal Pradesh"}`
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    }, [currentCatInfo, selectedCity])

    return (
        <div style={{
            minHeight: "100vh",
            background: "#07090b",
            color: "#eef4f6",
            fontFamily: "'Manrope', 'Segoe UI', system-ui, sans-serif",
            fontSize: 16,
            lineHeight: 1.6,
            overflowX: "hidden"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Saira+Semi+Condensed:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                img { display: block; max-width: 100%; }
                :focus-visible { outline: 2px solid #16acd4; outline-offset: 3px; border-radius: 4px; }
                .dg-cat-card {
                    background: #0a1317;
                    border: 1px solid #1a2328;
                    border-radius: 14px;
                    padding: 16px 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    cursor: pointer;
                    transition: all .2s ease;
                    text-align: left;
                    color: inherit;
                    user-select: none;
                }
                .dg-cat-card:hover {
                    border-color: rgba(22,172,212,0.5);
                    background: #0e171b;
                    transform: translateY(-2px);
                }
                .dg-cat-card.active {
                    border: 1.5px solid #16acd4 !important;
                    background: rgba(22,172,212,0.12) !important;
                    box-shadow: 0 0 25px rgba(22,172,212,0.18), inset 0 0 15px rgba(22,172,212,0.08);
                }
                .dg-nearme-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                @media(min-width: 640px) {
                    .dg-nearme-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
                }
                @media(min-width: 960px) {
                    .dg-nearme-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
                }
                @media(min-width: 1200px) {
                    .dg-nearme-grid { grid-template-columns: repeat(7, 1fr); gap: 14px; }
                }
            `}</style>

            <Navbar />

            {/* ─── Hero Header & Search Section ───────────────────────────────────── */}
            <section style={{
                position: "relative",
                overflow: "hidden",
                borderBottom: "1px solid #1a2328",
                background: "#07090b",
                backgroundImage: `
                    radial-gradient(ellipse 700px 450px at 70% 30%, rgba(22,172,212,0.12) 0%, transparent 65%),
                    radial-gradient(ellipse 400px 300px at 10% 20%, rgba(22,172,212,0.05) 0%, transparent 60%),
                    linear-gradient(rgba(22,172,212,0.035) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(22,172,212,0.035) 1px, transparent 1px)
                `,
                backgroundSize: "100% 100%, 100% 100%, 42px 42px, 42px 42px",
                padding: "clamp(125px, 11vw, 155px) 0 clamp(36px, 5vw, 48px)"
            }}>
                <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 28px" }}>
                    
                    {/* Eyebrow in Cursive script */}
                    <div style={{
                        fontFamily: "'Dancing Script', 'Caveat', cursive",
                        fontSize: "clamp(1.5rem, 2.4vw, 2.1rem)",
                        fontWeight: 700,
                        color: "#16acd4",
                        letterSpacing: "0.01em",
                        lineHeight: 1.1,
                        marginBottom: 4
                    }}>
                        Everything for your car, nearby
                    </div>

                    {/* Main Headline */}
                    <h1 style={{
                        fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif",
                        fontSize: "clamp(2.6rem, 6.2vw, 4.6rem)",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        lineHeight: 0.95,
                        letterSpacing: "0.02em",
                        margin: "0 0 24px 0"
                    }}>
                        <span style={{ color: "#ffffff" }}>NEAR </span>
                        <span style={{ color: "#16acd4" }}>ME</span>
                    </h1>

                    {/* Search & Filter Bar */}
                    <form onSubmit={handleSearchSubmit} style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 28
                    }}>
                        {/* City Dropdown */}
                        <div style={{ position: "relative", minWidth: 160 }}>
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                style={{
                                    width: "100%",
                                    background: "#0a1317",
                                    color: "#eef4f6",
                                    border: "1px solid #1a2328",
                                    borderRadius: 10,
                                    padding: "11px 36px 11px 14px",
                                    fontSize: "0.92rem",
                                    fontFamily: "'Manrope', sans-serif",
                                    fontWeight: 600,
                                    appearance: "none",
                                    cursor: "pointer",
                                    outline: "none"
                                }}
                            >
                                {availableCities.map(c => (
                                    <option key={c} value={c} style={{ background: "#0a1317", color: "#eef4f6" }}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            <span style={{
                                position: "absolute",
                                right: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                                color: "#8d9ea6",
                                fontSize: "0.75rem"
                            }}>
                                ▼
                            </span>
                        </div>

                        {/* Search Input */}
                        <div style={{ flex: "1 1 280px", position: "relative" }}>
                            <input
                                type="text"
                                placeholder="Search name, brand, part, area..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: "100%",
                                    background: "#0a1317",
                                    color: "#eef4f6",
                                    border: "1px solid #1a2328",
                                    borderRadius: 10,
                                    padding: "11px 16px",
                                    fontSize: "0.92rem",
                                    fontFamily: "'Manrope', sans-serif",
                                    outline: "none"
                                }}
                            />
                        </div>

                        {/* Search Button */}
                        <button
                            type="submit"
                            style={{
                                background: "#0e171b",
                                border: "1.5px solid #16acd4",
                                color: "#16acd4",
                                borderRadius: 10,
                                padding: "11px 20px",
                                fontSize: "0.9rem",
                                fontFamily: "'Saira Semi Condensed', sans-serif",
                                fontWeight: 700,
                                letterSpacing: "0.03em",
                                cursor: "pointer",
                                textTransform: "uppercase"
                            }}
                        >
                            Search
                        </button>

                        {/* + List your business Button */}
                        <button
                            type="button"
                            onClick={() => setModalOpen(true)}
                            style={{
                                background: "#16acd4",
                                color: "#07090b",
                                border: "none",
                                borderRadius: 10,
                                padding: "11px 22px",
                                fontSize: "0.92rem",
                                fontFamily: "'Saira Semi Condensed', sans-serif",
                                fontWeight: 800,
                                letterSpacing: "0.03em",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                boxShadow: "0 0 20px rgba(22,172,212,0.3)"
                            }}
                        >
                            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> List your business
                        </button>
                    </form>

                    {/* Category Buttons Grid */}
                    <div className="dg-nearme-grid">
                        {NEAR_ME_CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat.id
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`dg-cat-card ${isSelected ? 'active' : ''}`}
                                >
                                    <div style={{ fontSize: "1.45rem", lineHeight: 1 }}>{cat.emoji}</div>
                                    <span style={{
                                        fontFamily: "'Manrope', sans-serif",
                                        fontWeight: 700,
                                        fontSize: "0.85rem",
                                        lineHeight: 1.3,
                                        color: isSelected ? "#ffffff" : "#cbd5e1"
                                    }}>
                                        {cat.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ─── Results Section ─────────────────────────────────────────────────── */}
            <section style={{ padding: "clamp(36px, 5vw, 56px) 0 clamp(48px, 6vw, 72px)", background: "#07090b" }}>
                <div style={{ maxWidth: "calc(1180px + 64px)", margin: "0 auto", padding: "0 28px" }}>
                    
                    {/* Header Row: Category title + count, and Google Maps Button */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 16,
                        marginBottom: 24,
                        paddingBottom: 16,
                        borderBottom: "1px solid #1a2328"
                    }}>
                        <div>
                            <h2 style={{
                                fontFamily: "'Saira Semi Condensed', 'Arial Narrow', sans-serif",
                                fontSize: "clamp(1.5rem, 3.2vw, 2.2rem)",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                color: "#ffffff",
                                letterSpacing: "0.03em",
                                margin: 0
                            }}>
                                {currentCatInfo.label.toUpperCase()} <span style={{ color: "#16acd4" }}>({listings.length})</span>
                            </h2>
                            {selectedCity !== "All cities" && (
                                <span style={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: "0.78rem",
                                    color: "#8d9ea6",
                                    display: "block",
                                    marginTop: 4
                                }}>
                                    Showing verified listings in {selectedCity}
                                </span>
                            )}
                        </div>

                        {/* Search Google Maps too Button */}
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener"
                            style={{
                                background: "transparent",
                                border: "1.5px solid #16acd4",
                                color: "#16acd4",
                                borderRadius: 10,
                                padding: "9px 20px",
                                fontSize: "0.86rem",
                                fontFamily: "'Saira Semi Condensed', sans-serif",
                                fontWeight: 700,
                                letterSpacing: "0.03em",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                transition: "all .15s ease"
                            }}
                        >
                            Search Google Maps too ↗
                        </a>
                    </div>

                    {/* Listings Display */}
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", color: "#8d9ea6" }}>
                            <div style={{ fontSize: "1.6rem", marginBottom: 12 }}>⏳</div>
                            <div>Finding nearest automotive services...</div>
                        </div>
                    ) : listings.length === 0 ? (
                        /* Empty State matching Screenshot 2 */
                        <div style={{
                            background: "#0a1317",
                            border: "1px solid #1a2328",
                            borderRadius: 16,
                            padding: "36px 30px",
                            display: "grid",
                            gap: 14
                        }}>
                            <p style={{
                                color: "#cbd5e1",
                                fontSize: "0.95rem",
                                lineHeight: 1.6,
                                margin: 0,
                                fontFamily: "'Manrope', sans-serif"
                            }}>
                                No listing yet for this search. Try <a href={googleMapsUrl} target="_blank" rel="noopener" style={{ color: "#16acd4", textDecoration: "underline" }}>Google Maps</a>, or WhatsApp us on <a href={`https://wa.me/${websiteContent.contact.whatsappNumber}`} target="_blank" rel="noopener" style={{ color: "#16acd4", textDecoration: "underline", fontWeight: 700 }}>+91-86798-00074</a> and we&apos;ll find one for you.
                            </p>
                            <p style={{
                                color: "#8d9ea6",
                                fontSize: "0.82rem",
                                lineHeight: 1.6,
                                margin: 0,
                                fontFamily: "'Manrope', sans-serif"
                            }}>
                                Listings are sorted with Detailing Garage verified partners first, then by customer rating. Choose your city to see what&apos;s nearest.
                            </p>
                        </div>
                    ) : (
                        /* Listings Grid */
                        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
                            {listings.map(item => (
                                <article key={item.id} style={{
                                    background: "#0e1316",
                                    border: "1.5px solid #1a2328",
                                    borderRadius: 16,
                                    padding: "24px 22px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 14,
                                    transition: "border-color .2s, transform .2s"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = "rgba(22,172,212,0.4)"
                                    e.currentTarget.style.transform = "translateY(-2px)"
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "#1a2328"
                                    e.currentTarget.style.transform = "none"
                                }}>
                                    {/* Header Row */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                                        <div>
                                            <h3 style={{
                                                fontFamily: "'Saira Semi Condensed', sans-serif",
                                                fontSize: "1.25rem",
                                                fontWeight: 800,
                                                color: "#ffffff",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.02em",
                                                margin: 0
                                            }}>
                                                {item.name}
                                            </h3>
                                            <div style={{
                                                fontFamily: "'IBM Plex Mono', monospace",
                                                fontSize: "0.75rem",
                                                color: "#16acd4",
                                                marginTop: 4,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8
                                            }}>
                                                <span>📍 {item.area ? `${item.area}, ` : ""}{item.city}</span>
                                            </div>
                                        </div>

                                        {item.isVerified && (
                                            <span style={{
                                                background: "rgba(34,197,94,0.12)",
                                                border: "1px solid rgba(34,197,94,0.35)",
                                                color: "#22c55e",
                                                padding: "3px 10px",
                                                borderRadius: 999,
                                                fontSize: "0.68rem",
                                                fontFamily: "'IBM Plex Mono', monospace",
                                                fontWeight: 700,
                                                letterSpacing: "0.04em",
                                                whiteSpace: "nowrap"
                                            }}>
                                                VERIFIED PARTNER
                                            </span>
                                        )}
                                    </div>

                                    {/* Rating & Reviews */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: "#fbbf24" }}>
                                        <span>★ {item.rating.toFixed(1)}</span>
                                        <span style={{ color: "#8d9ea6", fontSize: "0.76rem" }}>
                                            ({item.reviewsCount} customer reviews)
                                        </span>
                                    </div>

                                    {/* Services */}
                                    {item.services && (
                                        <p style={{
                                            fontFamily: "'Manrope', sans-serif",
                                            fontSize: "0.86rem",
                                            color: "#cbd5e1",
                                            margin: 0,
                                            lineHeight: 1.5,
                                            flex: 1
                                        }}>
                                            {item.services}
                                        </p>
                                    )}

                                    {/* Contact & Map Buttons */}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: "auto", paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                        <a
                                            href={`tel:${item.phone.replace(/\s/g, "")}`}
                                            style={{
                                                flex: 1,
                                                background: "#16acd4",
                                                color: "#07090b",
                                                fontFamily: "'Saira Semi Condensed', sans-serif",
                                                fontWeight: 700,
                                                fontSize: "0.88rem",
                                                letterSpacing: "0.03em",
                                                textTransform: "uppercase",
                                                padding: "9px 14px",
                                                borderRadius: 8,
                                                textDecoration: "none",
                                                textAlign: "center",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 6
                                            }}
                                        >
                                            📞 Call
                                        </a>

                                        {item.whatsapp && (
                                            <a
                                                href={`https://wa.me/${item.whatsapp}?text=Hi%20${encodeURIComponent(item.name)}%2C%20found%20you%20on%20Detailing%20Garage%20Near%20Me.`}
                                                target="_blank"
                                                rel="noopener"
                                                style={{
                                                    flex: 1,
                                                    background: "rgba(37,211,102,0.12)",
                                                    border: "1.5px solid rgba(37,211,102,0.4)",
                                                    color: "#25d366",
                                                    fontFamily: "'Saira Semi Condensed', sans-serif",
                                                    fontWeight: 700,
                                                    fontSize: "0.88rem",
                                                    letterSpacing: "0.03em",
                                                    textTransform: "uppercase",
                                                    padding: "9px 14px",
                                                    borderRadius: 8,
                                                    textDecoration: "none",
                                                    textAlign: "center",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: 6
                                                }}
                                            >
                                                💬 WhatsApp
                                            </a>
                                        )}

                                        {item.mapsUrl && (
                                            <a
                                                href={item.mapsUrl}
                                                target="_blank"
                                                rel="noopener"
                                                style={{
                                                    background: "transparent",
                                                    border: "1px solid rgba(255,255,255,0.15)",
                                                    color: "#cbd5e1",
                                                    padding: "9px 12px",
                                                    borderRadius: 8,
                                                    textDecoration: "none",
                                                    fontSize: "0.85rem",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                }}
                                                title="View on Google Maps"
                                            >
                                                🗺️ Maps
                                            </a>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ─── Modal: List Your Business ───────────────────────────────────────── */}
            {modalOpen && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 100,
                    background: "rgba(4,6,8,0.85)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 20
                }} onClick={() => setModalOpen(false)}>
                    <div style={{
                        background: "#0c1215",
                        border: "1.5px solid rgba(22,172,212,0.4)",
                        borderRadius: 20,
                        maxWidth: 540,
                        width: "100%",
                        maxHeight: "92vh",
                        overflowY: "auto",
                        padding: "28px 26px",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(22,172,212,0.12)"
                    }} onClick={e => e.stopPropagation()}>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                            <div>
                                <h3 style={{
                                    fontFamily: "'Saira Semi Condensed', sans-serif",
                                    fontSize: "1.5rem",
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    color: "#ffffff",
                                    margin: 0
                                }}>
                                    LIST YOUR BUSINESS
                                </h3>
                                <p style={{ color: "#8d9ea6", fontSize: "0.82rem", margin: "4px 0 0" }}>
                                    Get discovered by thousands of car owners across HP, Punjab &amp; Tricity.
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#8d9ea6",
                                    fontSize: "1.4rem",
                                    cursor: "pointer",
                                    lineHeight: 1
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {submitSuccess ? (
                            <div style={{ textAlign: "center", padding: "40px 10px", color: "#22c55e" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✓</div>
                                <h4 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 6px" }}>Submission Received!</h4>
                                <p style={{ color: "#8d9ea6", fontSize: "0.85rem" }}>
                                    Our team will verify your details and list your business within 24 hours.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} style={{ display: "grid", gap: 14 }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace", color: "#8d9ea6", textTransform: "uppercase", marginBottom: 6 }}>
                                        Business / Workshop Name *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Speed Auto Workshop"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        style={{
                                            width: "100%",
                                            background: "#07090b",
                                            border: "1px solid #1a2328",
                                            borderRadius: 8,
                                            padding: "10px 14px",
                                            color: "#eef4f6",
                                            fontSize: "0.9rem"
                                        }}
                                    />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace", color: "#8d9ea6", textTransform: "uppercase", marginBottom: 6 }}>
                                            Category *
                                        </label>
                                        <select
                                            value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                            style={{
                                                width: "100%",
                                                background: "#07090b",
                                                border: "1px solid #1a2328",
                                                borderRadius: 8,
                                                padding: "10px 12px",
                                                color: "#eef4f6",
                                                fontSize: "0.88rem"
                                            }}
                                        >
                                            {NEAR_ME_CATEGORIES.map(c => (
                                                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace", color: "#8d9ea6", textTransform: "uppercase", marginBottom: 6 }}>
                                            City *
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Mandi, Kullu..."
                                            value={form.city}
                                            onChange={e => setForm({ ...form, city: e.target.value })}
                                            style={{
                                                width: "100%",
                                                background: "#07090b",
                                                border: "1px solid #1a2328",
                                                borderRadius: 8,
                                                padding: "10px 14px",
                                                color: "#eef4f6",
                                                fontSize: "0.9rem"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace", color: "#8d9ea6", textTransform: "uppercase", marginBottom: 6 }}>
                                            Area / Landmark
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Gutkar, NH-21"
                                            value={form.area}
                                            onChange={e => setForm({ ...form, area: e.target.value })}
                                            style={{
                                                width: "100%",
                                                background: "#07090b",
                                                border: "1px solid #1a2328",
                                                borderRadius: 8,
                                                padding: "10px 14px",
                                                color: "#eef4f6",
                                                fontSize: "0.9rem"
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace", color: "#8d9ea6", textTransform: "uppercase", marginBottom: 6 }}>
                                            Phone Number *
                                        </label>
                                        <input
                                            required
                                            type="tel"
                                            placeholder="+91 98160 xxxxx"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            style={{
                                                width: "100%",
                                                background: "#07090b",
                                                border: "1px solid #1a2328",
                                                borderRadius: 8,
                                                padding: "10px 14px",
                                                color: "#eef4f6",
                                                fontSize: "0.9rem"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace", color: "#8d9ea6", textTransform: "uppercase", marginBottom: 6 }}>
                                        Services Offered
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="e.g. Periodic service, AC repair, Denting, Foam wash..."
                                        value={form.services}
                                        onChange={e => setForm({ ...form, services: e.target.value })}
                                        style={{
                                            width: "100%",
                                            background: "#07090b",
                                            border: "1px solid #1a2328",
                                            borderRadius: 8,
                                            padding: "10px 14px",
                                            color: "#eef4f6",
                                            fontSize: "0.9rem",
                                            resize: "vertical"
                                        }}
                                    />
                                </div>

                                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        style={{
                                            flex: 1,
                                            background: "#16acd4",
                                            color: "#07090b",
                                            border: "none",
                                            borderRadius: 8,
                                            padding: "12px 20px",
                                            fontSize: "0.95rem",
                                            fontFamily: "'Saira Semi Condensed', sans-serif",
                                            fontWeight: 800,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.04em",
                                            cursor: submitting ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        {submitting ? "Submitting..." : "Submit Listing"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        style={{
                                            background: "transparent",
                                            border: "1px solid #1a2328",
                                            color: "#8d9ea6",
                                            borderRadius: 8,
                                            padding: "12px 18px",
                                            fontSize: "0.9rem",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <SiteFooter footer={websiteContent.footer} contact={websiteContent.contact} />
            <WAFloat number={websiteContent.contact.whatsappNumber} />
        </div>
    )
}

