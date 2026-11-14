"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Printer,
    ArrowLeft,
    ShieldCheck,
    Download,
    Calendar,
    Car,
    FileText,
    CheckCircle2
} from "lucide-react"
import { toast } from "react-hot-toast"

export default function WarrantyCertificatePage() {
    const params = useParams()
    const router = useRouter()
    const [warranty, setWarranty] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const certificateRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!params?.id) return
        fetch(`/api/admin/warranties/${params.id}`)
            .then(async res => {
                if (!res.ok) {
                    // Try public search by query if not authorized
                    const qRes = await fetch(`/api/public/track?q=${params.id}`)
                    const qData = await qRes.json()
                    if (qData.warranties && qData.warranties.length > 0) {
                        return { warranty: qData.warranties[0] }
                    }
                    throw new Error("Warranty not found")
                }
                return res.json()
            })
            .then(data => {
                if (data.warranty) setWarranty(data.warranty)
                else setError("Warranty not found")
            })
            .catch(err => setError(err.message || "Failed to load certificate"))
            .finally(() => setLoading(false))
    }, [params?.id])

    const formatDate = (d?: string | Date) => {
        if (!d) return "—"
        return new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    }

    // Direct PDF Download
    const handleDownloadPDF = async () => {
        if (!certificateRef.current || !warranty) return
        setDownloading(true)
        const toastId = toast.loading("Generating 1-page PDF Certificate...")

        try {
            const element = certificateRef.current

            // Temporarily apply clean white print mode for PDF generation
            element.classList.add("force-pdf-export")

            const html2pdfModule = (await import("html2pdf.js")).default

            const opt: any = {
                margin: [6, 6, 6, 6],
                filename: `Warranty-Certificate-${warranty.certificateNumber || "DG"}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                    windowWidth: 800
                },
                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait"
                }
            }

            await html2pdfModule().set(opt).from(element).save()

            element.classList.remove("force-pdf-export")
            toast.success("PDF Downloaded successfully!", { id: toastId })
        } catch (err: any) {
            console.error("PDF download error:", err)
            if (certificateRef.current) {
                certificateRef.current.classList.remove("force-pdf-export")
            }
            toast.error("Download fallback: Opening Print dialog...", { id: toastId })
            window.print()
        } finally {
            setDownloading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07090b] flex flex-col items-center justify-center text-white gap-3">
                <div className="w-8 h-8 border-2 border-[#16acd4] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-mono text-zinc-400">Loading Warranty Certificate...</p>
            </div>
        )
    }

    if (error || !warranty) {
        return (
            <div className="min-h-screen bg-[#07090b] text-white flex flex-col items-center justify-center p-6 text-center">
                <p className="text-xl font-bold text-red-400 mb-2">Certificate Not Found</p>
                <p className="text-sm text-zinc-400 mb-6">Could not find a valid certificate for ID: {params?.id}</p>
                <button
                    onClick={() => router.back()}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition"
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#07090b] text-[#eef4f6] p-3 sm:p-6 flex flex-col items-center">
            {/* Top Toolbar (Hidden during print) */}
            <div className="w-full max-w-3xl flex items-center justify-between mb-4 print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="px-4 py-2 rounded-xl bg-[#16acd4] hover:bg-[#1499be] text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#16acd4]/20 transition disabled:opacity-50"
                    >
                        <Download className="w-3.5 h-3.5" />
                        {downloading ? "Generating..." : "Download PDF"}
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 border border-white/10 transition"
                    >
                        <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                </div>
            </div>

            {/* Certificate Container (A4 Single-Page Fit) */}
            <div
                id="certificate-sheet"
                ref={certificateRef}
                className="cert-card w-full max-w-3xl bg-[#0e1316] border-2 border-[#16acd4]/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
                style={{
                    boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(22,172,212,0.08)"
                }}
            >
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none cert-watermark">
                    <ShieldCheck className="w-[360px] h-[360px] text-[#16acd4]" />
                </div>

                {/* 1. Header Bar */}
                <div className="flex justify-between items-center border-b border-white/10 cert-border pb-3 gap-3">
                    <div>
                        <div className="text-xl sm:text-2xl font-extrabold tracking-wider uppercase font-['Saira_Semi_Condensed'] cert-brand">
                            DETAI<span className="text-[#16acd4]">L</span>ING GARAGE
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.22em] text-[#16acd4] cert-tagline mt-0.5">
                            Detailing That Defines Luxury • Official Certificate
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-0.5 cert-status">
                            ● {warranty.status || "Active"}
                        </span>
                        <div className="text-[11px] font-mono text-zinc-400 cert-text-muted">
                            CERT: <span className="font-bold text-white cert-text-main">{warranty.certificateNumber}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Certificate Title */}
                <div className="my-3 text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#16acd4] cert-accent font-semibold">
                        Warranty Protection Program
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide font-['Saira_Semi_Condensed'] cert-text-main leading-tight">
                        CERTIFICATE OF WARRANTY
                    </h1>
                    <p className="text-[11px] text-zinc-400 cert-text-muted max-w-lg mx-auto leading-normal">
                        This official certificate certifies that the vehicle below has received professional automotive protection at Detailing Garage Studio.
                    </p>
                </div>

                {/* 3. Details Grid (Customer & Vehicle | Protection & Period) */}
                <div className="grid grid-cols-2 gap-4 my-3 bg-black/30 cert-box border border-white/5 rounded-xl p-3.5">
                    {/* Left: Customer & Vehicle */}
                    <div className="space-y-2">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#16acd4] cert-accent font-bold border-b border-white/5 cert-border-sub pb-1 flex items-center gap-1.5">
                            <Car className="w-3 h-3" /> Vehicle & Owner Info
                        </div>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-zinc-400 cert-text-muted text-[11px]">Customer:</span>
                                <span className="font-semibold text-white cert-text-main">{warranty.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 cert-text-muted text-[11px]">Phone:</span>
                                <span className="font-mono text-white cert-text-main">{warranty.customerPhone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 cert-text-muted text-[11px]">Reg. No.:</span>
                                <span className="font-mono font-bold text-white cert-text-main">{warranty.vehicleReg || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 cert-text-muted text-[11px]">VIN / Chassis:</span>
                                <span className="font-mono text-white cert-text-main">{warranty.vin || "—"}</span>
                            </div>
                            {warranty.invoiceNo && (
                                <div className="flex justify-between">
                                    <span className="text-zinc-400 cert-text-muted text-[11px]">Invoice Ref:</span>
                                    <span className="font-mono text-white cert-text-main">{warranty.invoiceNo}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Protection & Period */}
                    <div className="space-y-2">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#16acd4] cert-accent font-bold border-b border-white/5 cert-border-sub pb-1 flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3" /> Protection & Period
                        </div>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-zinc-400 cert-text-muted text-[11px]">Service Type:</span>
                                <span className="font-bold text-[#16acd4] cert-accent">{warranty.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 cert-text-muted text-[11px]">Product/Package:</span>
                                <span className="font-medium text-white cert-text-main">{warranty.productPackage || "Standard"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 cert-text-muted text-[11px]">Coverage Area:</span>
                                <span className="text-white cert-text-main">{warranty.coverageArea || "Full Body"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 cert-text-muted text-[11px]">Duration:</span>
                                <span className="font-bold text-white cert-text-main">{warranty.years} Year(s)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 cert-text-muted text-[11px]">Valid Period:</span>
                                <span className="font-mono text-[11px] text-white cert-text-main">
                                    {formatDate(warranty.startDate)} → {formatDate(warranty.endDate)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Annual Maintenance & Next Inspection Condition */}
                {warranty.requiresAnnualInspection && (
                    <div className="mb-3 p-2.5 rounded-lg bg-[#16acd4]/10 border border-[#16acd4]/30 cert-condition flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#16acd4] cert-accent flex-shrink-0" />
                            <div className="text-[11px]">
                                <span className="font-bold text-white cert-text-main">Annual Inspection: </span>
                                <span className="text-zinc-300 cert-text-muted">Requires annual check-up to retain validity.</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-mono bg-black/40 cert-box-inner px-2 py-1 rounded border border-white/10 cert-border-sub flex-shrink-0">
                            Next Due: <span className="font-bold text-[#16acd4] cert-accent">{formatDate(warranty.nextInspectionDate)}</span>
                        </div>
                    </div>
                )}

                {/* 5. Terms and Exclusions */}
                <div className="border-t border-white/10 cert-border pt-2.5 space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 cert-text-muted font-bold block">
                        Warranty Terms & Exclusions
                    </span>
                    <p className="text-[10px] text-zinc-400 cert-text-muted leading-relaxed">
                        {warranty.terms || "Covers product defects such as peeling, yellowing, cracking or loss of performance under normal use. Excludes accident damage, improper washing, chemical damage and work by non-authorised installers."}
                    </p>
                </div>

                {/* 6. Footer Signatures & Studio Info */}
                <div className="mt-3.5 pt-2.5 border-t border-white/10 cert-border flex justify-between items-end gap-4 text-[10px] text-zinc-400 cert-text-muted">
                    <div>
                        <div className="font-bold text-white cert-text-main text-[11px]">Detailing Garage Car Care Studio</div>
                        <div>Mandi, Himachal Pradesh • Phone: +91 86798-00074 / +91 86794-00014</div>
                        <div>Website: www.detailinggarage.in • Verify: /report-warranty</div>
                    </div>
                    <div className="text-right">
                        <div className="w-36 border-b border-white/20 cert-signature-line mb-1 ml-auto" />
                        <div className="font-mono text-[9px] uppercase tracking-wider">Authorised Signatory & Seal</div>
                        <div className="text-[8px] text-[#16acd4] font-mono cert-accent">DIGITALLY VERIFIED</div>
                    </div>
                </div>
            </div>

            {/* Strict Print & PDF CSS rules (Single Page Guarantee) */}
            <style jsx global>{`
                @page {
                    size: A4 portrait;
                    margin: 6mm 8mm !important;
                }
                @media print {
                    html, body {
                        background: #ffffff !important;
                        color: #000000 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 100% !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .cert-card {
                        background: #ffffff !important;
                        color: #000000 !important;
                        border: 2px solid #000000 !important;
                        box-shadow: none !important;
                        margin: 0 auto !important;
                        padding: 18px 24px !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        max-height: 275mm !important;
                        page-break-inside: avoid !important;
                        page-break-before: avoid !important;
                        page-break-after: avoid !important;
                        break-inside: avoid !important;
                    }
                    .cert-brand { color: #000000 !important; }
                    .cert-tagline { color: #0891b2 !important; }
                    .cert-text-main { color: #000000 !important; }
                    .cert-text-muted { color: #374151 !important; }
                    .cert-accent { color: #0891b2 !important; }
                    .cert-border { border-color: #e5e7eb !important; }
                    .cert-border-sub { border-color: #d1d5db !important; }
                    .cert-box { background: #f9fafb !important; border-color: #e5e7eb !important; }
                    .cert-box-inner { background: #ffffff !important; border-color: #d1d5db !important; }
                    .cert-condition { background: #ecfeff !important; border-color: #a5f3fc !important; }
                    .cert-status { background: #ecfdf5 !important; border-color: #a7f3d0 !important; color: #047857 !important; }
                    .cert-signature-line { border-color: #000000 !important; }
                    .cert-watermark { opacity: 0.08 !important; }
                }

                /* Class applied during direct Download PDF capture */
                .force-pdf-export {
                    background: #ffffff !important;
                    color: #000000 !important;
                    border: 2px solid #000000 !important;
                    box-shadow: none !important;
                    padding: 20px 24px !important;
                    width: 780px !important;
                    max-width: 780px !important;
                }
                .force-pdf-export .cert-brand { color: #000000 !important; }
                .force-pdf-export .cert-tagline { color: #0891b2 !important; }
                .force-pdf-export .cert-text-main { color: #000000 !important; }
                .force-pdf-export .cert-text-muted { color: #374151 !important; }
                .force-pdf-export .cert-accent { color: #0891b2 !important; }
                .force-pdf-export .cert-border { border-color: #e5e7eb !important; }
                .force-pdf-export .cert-border-sub { border-color: #d1d5db !important; }
                .force-pdf-export .cert-box { background: #f9fafb !important; border-color: #e5e7eb !important; }
                .force-pdf-export .cert-box-inner { background: #ffffff !important; border-color: #d1d5db !important; }
                .force-pdf-export .cert-condition { background: #ecfeff !important; border-color: #a5f3fc !important; }
                .force-pdf-export .cert-status { background: #ecfdf5 !important; border-color: #a7f3d0 !important; color: #047857 !important; }
                .force-pdf-export .cert-signature-line { border-color: #000000 !important; }
                .force-pdf-export .cert-watermark { opacity: 0.08 !important; }
            `}</style>
        </div>
    )
}
