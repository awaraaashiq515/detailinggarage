"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Search, ShieldCheck, FileCheck, Calendar, Car, Download, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react"

// ─── WhatsApp Float ───────────────────────────────────────────────────────────
function WAFloat({ number }: { number: string }) {
    return (
        <a
            href={`https://wa.me/${number}?text=Hi%20Detailing%20Garage%2C%20I%27d%20like%20to%20verify%20my%20warranty%20or%20report.`}
            target="_blank"
            rel="noopener"
            aria-label="Chat on WhatsApp"
            style={{
                position: "fixed", right: 18, bottom: 18, zIndex: 40, width: 52, height: 52,
                borderRadius: "50%", background: "#25d366", color: "#07090b",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,.5)", textDecoration: "none"
            }}
        >
            <svg width={26} height={26} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z" />
            </svg>
        </a>
    )
}

export default function ReportWarrantyPage() {
    const [query, setQuery] = useState("")
    const [searched, setSearched] = useState(false)
    const [lastQuery, setLastQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [warranties, setWarranties] = useState<any[]>([])
    const [pdiReports, setPdiReports] = useState<any[]>([])

    const doSearch = (qVal?: string) => {
        const targetQ = (qVal !== undefined ? qVal : query).trim()
        if (!targetQ) return
        setLoading(true)
        setLastQuery(targetQ)
        fetch(`/api/public/track?q=${encodeURIComponent(targetQ)}`)
            .then(res => res.json())
            .then(data => {
                setWarranties(data.warranties || [])
                setPdiReports(data.pdiReports || [])
                setSearched(true)
            })
            .catch(err => {
                console.error("Search error:", err)
            })
            .finally(() => setLoading(false))
    }

    const formatDate = (d?: string | Date) => {
        if (!d) return "—"
        const dateObj = new Date(d)
        return dateObj.toISOString().split("T")[0]
    }

    return (
        <div style={{
            minHeight: "100vh", background: "#07090b", color: "#eef4f6",
            fontFamily: "'Manrope','Segoe UI',system-ui,sans-serif", fontSize: 15, lineHeight: 1.6, overflowX: "hidden"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Saira+Semi+Condensed:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                :focus-visible { outline: 2px solid #5fd6e4; outline-offset: 3px; border-radius: 2px; }
            `}</style>

            <Navbar />

            <main style={{ minHeight: "calc(100vh - 160px)", paddingTop: 84 }}>
                {/* ─── Hero Section ─────────────────────────────────────────── */}
                <section style={{
                    padding: "48px 24px 36px",
                    background: "radial-gradient(ellipse at 85% 20%, rgba(22,172,212,0.1) 0%, transparent 55%), linear-gradient(180deg, #07090b 0%, #0c1317 100%)",
                    borderBottom: "1px solid #1a2328",
                    position: "relative"
                }}>
                    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            background: "rgba(22,172,212,0.08)", border: "1px solid rgba(22,172,212,0.25)",
                            borderRadius: 999, padding: "3px 12px", marginBottom: 14,
                            fontSize: "0.72rem", fontFamily: "'IBM Plex Mono',monospace", color: "#16acd4",
                            letterSpacing: "0.08em", textTransform: "uppercase"
                        }}>
                            <span>●</span> Official Digital Verification Portal
                        </div>

                        <h1 style={{
                            fontFamily: "'Saira Semi Condensed','Arial Narrow',sans-serif",
                            fontSize: "clamp(1.75rem, 4.2vw, 2.75rem)", fontWeight: 800,
                            textTransform: "uppercase", margin: "0 0 10px", lineHeight: 1.15,
                            letterSpacing: "0.02em"
                        }}>
                            TRACK • REPORT • <span style={{ color: "#16acd4" }}>WARRANTY</span>
                        </h1>
                        <p style={{
                            color: "#8d9ea6", fontSize: "0.92rem", maxWidth: "56ch",
                            margin: "0 0 24px", lineHeight: 1.6
                        }}>
                            Verify your ceramic, graphene, PPF and accessory warranty live, or download official 100+ point PDI inspection reports.
                        </p>

                        {/* Search Input Box */}
                        <form
                            onSubmit={e => {
                                e.preventDefault()
                                doSearch()
                            }}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                maxWidth: 540, width: "100%"
                            }}
                        >
                            <div style={{ position: "relative", flex: 1 }}>
                                <Search size={15} style={{
                                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                                    color: "#52626b", pointerEvents: "none"
                                }} />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Enter Certificate No., VIN, Reg No., or Phone"
                                    style={{
                                        width: "100%",
                                        background: "#0e1316",
                                        border: "1px solid #1a2328",
                                        borderRadius: 10,
                                        padding: "11px 16px 11px 38px",
                                        fontSize: "0.88rem",
                                        fontFamily: "'IBM Plex Mono',monospace",
                                        color: "#eef4f6",
                                        outline: "none",
                                        transition: "border-color .2s"
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: "#16acd4",
                                    color: "#07090b",
                                    border: "none",
                                    borderRadius: 10,
                                    padding: "11px 22px",
                                    fontFamily: "'Saira Semi Condensed',sans-serif",
                                    fontWeight: 800,
                                    fontSize: "0.85rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    cursor: "pointer",
                                    transition: "background .2s, opacity .2s",
                                    opacity: loading ? 0.7 : 1,
                                    flexShrink: 0
                                }}
                            >
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </form>

                        {/* Sample Quick Link */}
                        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: "0.74rem", color: "#61727c", fontFamily: "'IBM Plex Mono',monospace" }}>
                            <span>Try sample:</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery("DG-WAR-SAMPLE1")
                                    doSearch("DG-WAR-SAMPLE1")
                                }}
                                style={{
                                    background: "transparent",
                                    border: "1px dashed rgba(22,172,212,0.4)",
                                    borderRadius: 6,
                                    padding: "2px 8px",
                                    color: "#16acd4",
                                    fontFamily: "'IBM Plex Mono',monospace",
                                    fontSize: "0.74rem",
                                    cursor: "pointer"
                                }}
                            >
                                DG-WAR-SAMPLE1
                            </button>
                        </div>
                    </div>
                </section>

                {/* ─── Main Content Section ─────────────────────────────────── */}
                <section style={{ padding: "36px 24px 64px", maxWidth: 1080, margin: "0 auto" }}>
                    {!searched ? (
                        /* Feature / Information Guide before user searches */
                        <div>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                gap: 16,
                                marginBottom: 32
                            }}>
                                <div style={{
                                    background: "#0e1316",
                                    border: "1px solid #1a2328",
                                    borderRadius: 14,
                                    padding: "20px 22px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: "rgba(22,172,212,0.1)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "#16acd4"
                                    }}>
                                        <ShieldCheck size={20} />
                                    </div>
                                    <h3 style={{
                                        fontFamily: "'Saira Semi Condensed',sans-serif",
                                        fontSize: "1.05rem", fontWeight: 700, textTransform: "uppercase",
                                        margin: "4px 0 0", color: "#eef4f6"
                                    }}>
                                        Warranty Lookup
                                    </h3>
                                    <p style={{ margin: 0, fontSize: "0.82rem", color: "#8d9ea6", lineHeight: 1.55 }}>
                                        Enter your Certificate Number (e.g. DG-WAR-SAMPLE1) or vehicle registration number to check valid coverage and terms.
                                    </p>
                                </div>

                                <div style={{
                                    background: "#0e1316",
                                    border: "1px solid #1a2328",
                                    borderRadius: 14,
                                    padding: "20px 22px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: "rgba(22,172,212,0.1)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "#16acd4"
                                    }}>
                                        <FileCheck size={20} />
                                    </div>
                                    <h3 style={{
                                        fontFamily: "'Saira Semi Condensed',sans-serif",
                                        fontSize: "1.05rem", fontWeight: 700, textTransform: "uppercase",
                                        margin: "4px 0 0", color: "#eef4f6"
                                    }}>
                                        PDI Reports
                                    </h3>
                                    <p style={{ margin: 0, fontSize: "0.82rem", color: "#8d9ea6", lineHeight: 1.55 }}>
                                        Search using your VIN or chassis number to instantly download your 100+ checkpoint dealership inspection report.
                                    </p>
                                </div>

                                <div style={{
                                    background: "#0e1316",
                                    border: "1px solid #1a2328",
                                    borderRadius: 14,
                                    padding: "20px 22px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: "rgba(22,172,212,0.1)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "#16acd4"
                                    }}>
                                        <Calendar size={20} />
                                    </div>
                                    <h3 style={{
                                        fontFamily: "'Saira Semi Condensed',sans-serif",
                                        fontSize: "1.05rem", fontWeight: 700, textTransform: "uppercase",
                                        margin: "4px 0 0", color: "#eef4f6"
                                    }}>
                                        Annual Inspections
                                    </h3>
                                    <p style={{ margin: 0, fontSize: "0.82rem", color: "#8d9ea6", lineHeight: 1.55 }}>
                                        Track required yearly check-ups for multi-year coatings and PPF packages to maintain active guarantee status.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Results Display */
                        <div style={{ display: "grid", gap: 32 }}>
                            {/* PDI Reports Section */}
                            <div>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    borderBottom: "1px solid #1a2328", paddingBottom: 10, marginBottom: 14
                                }}>
                                    <span style={{
                                        fontFamily: "'IBM Plex Mono',monospace",
                                        fontSize: "0.78rem", fontWeight: 700,
                                        textTransform: "uppercase", color: "#16acd4",
                                        letterSpacing: "0.12em"
                                    }}>
                                        PDI REPORTS ({pdiReports.length})
                                    </span>
                                </div>

                                {pdiReports.length === 0 ? (
                                    <div style={{
                                        background: "#0e1316",
                                        border: "1px dashed #1a2328",
                                        borderRadius: 12,
                                        padding: "16px 20px",
                                        color: "#8d9ea6",
                                        fontSize: "0.85rem"
                                    }}>
                                        No PDI inspection reports found for "{lastQuery}".
                                    </div>
                                ) : (
                                    <div style={{ display: "grid", gap: 10 }}>
                                        {pdiReports.map(report => (
                                            <div
                                                key={report.id}
                                                style={{
                                                    background: "#0e1316",
                                                    border: "1px solid #1a2328",
                                                    borderRadius: 12,
                                                    padding: "16px 20px",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    flexWrap: "wrap",
                                                    gap: 12
                                                }}
                                            >
                                                <div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                        <span style={{
                                                            fontFamily: "'Saira Semi Condensed',sans-serif",
                                                            fontSize: "0.98rem", fontWeight: 700, color: "#eef4f6", textTransform: "uppercase"
                                                        }}>
                                                            {report.vehicleMake} {report.vehicleModel}
                                                        </span>
                                                        <span style={{
                                                            background: "rgba(16,185,129,0.12)",
                                                            border: "1px solid rgba(16,185,129,0.3)",
                                                            color: "#34d399",
                                                            borderRadius: 999,
                                                            padding: "1px 8px",
                                                            fontSize: "0.68rem",
                                                            fontWeight: 700,
                                                            fontFamily: "'IBM Plex Mono',monospace"
                                                        }}>
                                                            {report.status || "COMPLETED"}
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        fontSize: "0.78rem", color: "#8d9ea6",
                                                        fontFamily: "'IBM Plex Mono',monospace",
                                                        display: "flex", gap: 10, flexWrap: "wrap"
                                                    }}>
                                                        <span>VIN: {report.vin || "—"}</span>
                                                        <span>•</span>
                                                        <span>Customer: {report.customerName}</span>
                                                        <span>•</span>
                                                        <span>Date: {formatDate(report.inspectionDate)}</span>
                                                    </div>
                                                </div>

                                                {report.pdfUrl && (
                                                    <a
                                                        href={report.pdfUrl}
                                                        target="_blank"
                                                        rel="noopener"
                                                        style={{
                                                            background: "transparent",
                                                            border: "1px solid #16acd4",
                                                            color: "#16acd4",
                                                            borderRadius: 8,
                                                            padding: "6px 14px",
                                                            fontFamily: "'Saira Semi Condensed',sans-serif",
                                                            fontWeight: 700,
                                                            fontSize: "0.78rem",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.04em",
                                                            textDecoration: "none",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: 5
                                                        }}
                                                    >
                                                        <Download size={13} /> PDF
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Warranties Section */}
                            <div>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    borderBottom: "1px solid #1a2328", paddingBottom: 10, marginBottom: 14
                                }}>
                                    <span style={{
                                        fontFamily: "'IBM Plex Mono',monospace",
                                        fontSize: "0.78rem", fontWeight: 700,
                                        textTransform: "uppercase", color: "#16acd4",
                                        letterSpacing: "0.12em"
                                    }}>
                                        WARRANTIES ({warranties.length})
                                    </span>
                                </div>

                                {warranties.length === 0 ? (
                                    <div style={{
                                        background: "#0e1316",
                                        border: "1px dashed #1a2328",
                                        borderRadius: 12,
                                        padding: "16px 20px",
                                        color: "#8d9ea6",
                                        fontSize: "0.85rem"
                                    }}>
                                        No warranty records found for "{lastQuery}". Please verify the certificate or chassis number.
                                    </div>
                                ) : (
                                    <div style={{ display: "grid", gap: 12 }}>
                                        {warranties.map(w => (
                                            <div
                                                key={w.id}
                                                style={{
                                                    background: "#0e1316",
                                                    border: "1px solid #1a2328",
                                                    borderRadius: 14,
                                                    padding: "18px 22px",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    flexWrap: "wrap",
                                                    gap: 16
                                                }}
                                            >
                                                <div style={{ flex: 1, minWidth: 260 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                                                        <span style={{
                                                            fontFamily: "'Saira Semi Condensed',sans-serif",
                                                            fontSize: "1.05rem", fontWeight: 700, color: "#eef4f6", textTransform: "uppercase"
                                                        }}>
                                                            {w.type} {w.productPackage ? `– ${w.productPackage}` : ""}
                                                        </span>
                                                        <span style={{
                                                            background: "rgba(16,185,129,0.12)",
                                                            border: "1px solid rgba(16,185,129,0.3)",
                                                            color: "#34d399",
                                                            borderRadius: 999,
                                                            padding: "1px 9px",
                                                            fontSize: "0.7rem",
                                                            fontWeight: 700,
                                                            fontFamily: "'IBM Plex Mono',monospace"
                                                        }}>
                                                            {w.status || "Active"}
                                                        </span>
                                                    </div>

                                                    <div style={{
                                                        fontSize: "0.78rem", color: "#8d9ea6",
                                                        fontFamily: "'IBM Plex Mono',monospace",
                                                        display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center"
                                                    }}>
                                                        <span>Cert: <strong style={{ color: "#eef4f6" }}>{w.certificateNumber}</strong></span>
                                                        <span>•</span>
                                                        <span>{formatDate(w.startDate)} → {formatDate(w.endDate)}</span>
                                                        {w.nextInspectionDate && (
                                                            <>
                                                                <span>•</span>
                                                                <span style={{ color: "#16acd4" }}>next inspection {formatDate(w.nextInspectionDate)}</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    {(w.vehicleReg || w.vin) && (
                                                        <div style={{
                                                            marginTop: 5, fontSize: "0.74rem", color: "#61727c",
                                                            fontFamily: "'IBM Plex Mono',monospace",
                                                            display: "flex", gap: 10
                                                        }}>
                                                            {w.vehicleReg && <span>Reg: {w.vehicleReg}</span>}
                                                            {w.vin && <span>VIN: {w.vin}</span>}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <Link
                                                        href={`/warranty/certificate/${w.id}`}
                                                        target="_blank"
                                                        style={{
                                                            background: "transparent",
                                                            border: "1px solid #16acd4",
                                                            color: "#16acd4",
                                                            borderRadius: 8,
                                                            padding: "7px 16px",
                                                            fontFamily: "'Saira Semi Condensed',sans-serif",
                                                            fontWeight: 700,
                                                            fontSize: "0.82rem",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.04em",
                                                            textDecoration: "none",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: 6
                                                        }}
                                                    >
                                                        Certificate PDF
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer style={{ borderTop: "1px solid #1a2328", padding: "28px 24px", background: "#0e1316", color: "#8d9ea6", fontSize: "0.82rem" }}>
                <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <div style={{ fontFamily: "'Saira Semi Condensed',sans-serif", fontWeight: 800, color: "#eef4f6", fontSize: "1rem" }}>
                            DETAI<span style={{ color: "#16acd4" }}>L</span>ING GARAGE
                        </div>
                        <div style={{ fontSize: "0.7rem", fontFamily: "'IBM Plex Mono',monospace", color: "#16acd4" }}>
                            Detailing That Defines Luxury
                        </div>
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.75rem" }}>
                        © {new Date().getFullYear()} Detailing Garage. All rights reserved.
                    </div>
                </div>
            </footer>

            <WAFloat number="918679400014" />
        </div>
    )
}
