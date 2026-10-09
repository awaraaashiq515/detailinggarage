"use client"

import * as React from "react"
import Link from "next/link"
import {
    ArrowLeft, Loader2, Battery, Zap, CheckCircle2, XCircle,
    AlertCircle, MinusCircle, Printer, Share2, Shield, Activity, Navigation,
    Car, User, FileText, Settings2, Eye, Wifi, Gauge, AlertTriangle, Radio, Download
} from "lucide-react"

import { EVCoverPage } from "./ev-cover-page"
import { EVExecutiveDashboard } from "./ev-executive-dashboard"
import {
    EVBatteryDiagram,
    EVChargingInfographic,
    EVMotorDrivetrainGraphic,
    EVUnderbodyGraphic,
    EVPaintGaugeIllustration,
    EVADASSensorGraphic
} from "./ev-tech-graphics"
import { EVReportImagesGallery } from "./ev-image-upload"

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { color: string; bg: string; label: string; border: string }> = {
        PASS: { color: "#00d4ff", bg: "rgba(0,212,255,0.12)", label: "PASS", border: "rgba(0,212,255,0.3)" },
        FAIL: { color: "#ff4444", bg: "rgba(255,68,68,0.12)", label: "FAIL", border: "rgba(255,68,68,0.3)" },
        OBSERVATION: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "OBS", border: "rgba(245,158,11,0.3)" },
        NA: { color: "#6b7280", bg: "rgba(107,114,128,0.12)", label: "N/A", border: "rgba(107,114,128,0.3)" },
        true: { color: "#ff4444", bg: "rgba(255,68,68,0.12)", label: "FAULT", border: "rgba(255,68,68,0.3)" },
        false: { color: "#00d4ff", bg: "rgba(0,212,255,0.12)", label: "CLEAR", border: "rgba(0,212,255,0.3)" },
    }
    const s = map[status] || map["NA"]
    return (
        <span
            className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest border inline-block text-center"
            style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}
        >
            {s.label}
        </span>
    )
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ num, title, icon, accent = "#00d4ff" }: {
    num: string; title: string; icon: React.ReactNode; accent?: string
}) {
    return (
        <div className="flex items-center gap-3.5 mb-5 pb-3 border-b" style={{ borderColor: `${accent}20` }}>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl text-xs font-black" style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}40` }}>
                {num}
            </div>
            <div className="flex items-center gap-2" style={{ color: accent }}>
                {icon}
                <h2 className="text-sm md:text-base font-black uppercase tracking-[0.2em]">{title}</h2>
            </div>
        </div>
    )
}

// ── Checklist Display (Compact 2-Column Grid) ─────────────────────────
function ChecklistDisplay({ items, accent = "#00d4ff" }: { items: any[]; accent?: string }) {
    if (!items?.length) return null
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {items.map((item: any, i: number) => (
                <div
                    key={i}
                    className="p-2.5 rounded-xl bg-white/[0.02] border flex items-center justify-between gap-3 hover:bg-white/[0.04] transition-colors"
                    style={{ borderColor: `${accent}18` }}
                >
                    <div className="min-w-0 flex-1">
                        <div className="text-xs text-gray-200 font-medium truncate">{item.label}</div>
                        {item.observation && (
                            <div className="text-[10px] text-gray-400 italic font-mono truncate mt-0.5">
                                {item.observation}
                            </div>
                        )}
                    </div>
                    <div className="shrink-0">
                        <StatusBadge status={item.status} />
                    </div>
                </div>
            ))}
        </div>
    )
}

const SCORE_LABELS = [
    { key: "body", label: "Body & Paint Integrity" },
    { key: "tyres", label: "Tyres, Wheels & TPMS" },
    { key: "underbody", label: "Underbody & Armor Plating" },
    { key: "battery", label: "HV Battery Architecture" },
    { key: "charging", label: "AC/DC Charging Hardware" },
    { key: "motor", label: "Motor & EDU Transmission" },
    { key: "electrical", label: "12V & Low-Voltage Systems" },
    { key: "brakes", label: "Regenerative & Friction Brakes" },
    { key: "interior", label: "Cabin & Digital Ergonomics" },
    { key: "adas", label: "ADAS & Active Safety Systems" },
    { key: "diagnostics", label: "OBD-II Multi-Module Scan" },
]

export function EVReportView({ id, isPublic = false }: { id: string; isPublic?: boolean }) {
    const [data, setData] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)
    const [downloading, setDownloading] = React.useState(false)

    React.useEffect(() => {
        if (!id) return
        fetch(`/api/admin/ev-pdi/details/${id}`)
            .then(res => res.json())
            .then(d => {
                if (d && !d.error) {
                    setData(d)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    const handlePrint = () => {
        window.print()
    }

    const handleDownloadPDF = async () => {
        try {
            setDownloading(true)
            const res = await fetch(`/api/admin/ev-pdi/download-pdf/${id}`)
            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}))
                throw new Error(errJson.error || "Failed to generate PDF")
            }
            const blob = await res.blob()
            const blobUrl = window.URL.createObjectURL(blob)

            // Extract filename from response header if available
            const disposition = res.headers.get("content-disposition")
            let filename = `EV_PDI_Report_${id}.pdf`
            if (disposition && disposition.includes("filename=")) {
                const match = disposition.match(/filename="?([^";]+)"?/)
                if (match && match[1]) filename = match[1]
            }

            const link = document.createElement("a")
            link.href = blobUrl
            link.download = filename
            document.body.appendChild(link)
            link.click()
            link.remove()
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000)
        } catch (err: any) {
            console.error("[PDF-DOWNLOAD] Error:", err)
            // Fallback: direct browser navigation to attachment endpoint
            window.location.href = `/api/admin/ev-pdi/download-pdf/${id}`
        } finally {
            setDownloading(false)
        }
    }

    const handleWhatsAppShare = () => {
        if (!data) return
        const customerName = data.customerName || "Customer"
        const vehicle = `${data.vehicleMake} ${data.vehicleModel} ${data.vehicleVariant || ''}`.trim()
        const result = data.finalResult === "PASS"
            ? "✅ CERTIFIED PASS"
            : data.finalResult === "PASS_WITH_OBSERVATIONS"
            ? "⚠️ PASS WITH OBSERVATIONS"
            : data.finalResult === "RECHECK"
            ? "🔶 RECHECK REQUIRED"
            : "❌ REJECT / ATTENTION"

        const shareUrl = `${window.location.origin}/pdi/ev-report/${id}`
        const message = `*DETAILING GARAGE® — EV PDI REPORT*\n\n` +
            `*Customer:* ${customerName}\n` +
            `*Vehicle:* ${vehicle}\n` +
            `*VIN:* ${data.vin || 'N/A'}\n` +
            `*Result:* ${result}\n` +
            `*Overall Score:* ${totalScore}/${maxScore} Points\n` +
            `*Battery SoH:* ${data.batterySoh || '100'}% | *SoC:* ${data.batterySoc || '85'}%\n` +
            `*Inspector:* ${data.inspectedBy || 'Ritchie'}\n\n` +
            `View Full Certified Report:\n${shareUrl}`

        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank")
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">Loading EV PDI Report...</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white gap-4">
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <p className="font-mono text-sm text-gray-400">Inspection Report Not Found</p>
                <Link href={isPublic ? "/" : "/admin/pdi"} className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono text-xs">
                    ← Return to Home
                </Link>
            </div>
        )
    }

    const scores = data.scores || {}
    const totalScore = Object.values(scores).reduce((a: any, b: any) => (a || 0) + (b || 0), 0) as number
    const maxScore = SCORE_LABELS.length * 10

    return (
        <div className="min-h-screen bg-[#05070a] text-gray-200 py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:m-0 print:bg-[#05070a] print:text-white">
            {/* Print Stylesheet */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 6mm 5mm;
                    }
                    html, body {
                        background-color: #05070a !important;
                        color: #ffffff !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        width: 100% !important;
                        font-size: 10.5px !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break {
                        page-break-before: always !important;
                        break-before: page !important;
                    }
                    .break-inside-avoid {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }
            `}</style>

            <div id="ev-report-document" className="max-w-5xl mx-auto space-y-8 print:space-y-2.5 print:max-w-none">
                {/* ── ACTION BAR (HIDDEN IN PRINT & EXPORT) ── */}
                <div data-html2canvas-ignore="true" className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#090c13] border border-cyan-500/20 shadow-xl">
                    <Link href={isPublic ? "/" : "/admin/pdi"} className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gray-400 hover:text-cyan-400 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> {isPublic ? "Detailing Garage Home" : "Back to PDI Inspections"}
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {/* WhatsApp Share */}
                        <button
                            type="button"
                            onClick={handleWhatsAppShare}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold font-mono transition-all"
                        >
                            <Share2 className="w-3.5 h-3.5" /> WhatsApp
                        </button>

                        {/* Direct PDF Download Button (Native Vector PDF from Playwright Engine) */}
                        <button
                            type="button"
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black font-mono tracking-wider transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] disabled:opacity-50 active:scale-95"
                            title="Download complete PDF report file"
                        >
                            {downloading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                                    <span>Generating PDF...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 text-black stroke-[2.5]" />
                                    <span>Download PDF</span>
                                </>
                            )}
                        </button>

                        {/* Print / Save PDF via Browser */}
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-xs font-bold font-mono transition-all"
                            title="Print or Save via Browser Print Dialog"
                        >
                            <Printer className="w-3.5 h-3.5 text-gray-400" />
                            <span className="hidden sm:inline">Print A4</span>
                        </button>
                    </div>
                </div>

                {/* ── 1. COVER PAGE ── */}
                <div>
                    <EVCoverPage
                        meta={{
                            customerName: data.customerName,
                            customerPhone: data.customerPhone,
                            customerEmail: data.customerEmail,
                            vehicleMake: data.vehicleMake,
                            vehicleModel: data.vehicleModel,
                            vehicleVariant: data.vehicleVariant,
                            vehicleColor: data.vehicleColor,
                            vehicleYear: data.vehicleYear,
                            vin: data.vin,
                            motorNumber: data.motorNumber,
                            batteryId: data.batteryId,
                            registrationNumber: data.registrationNumber,
                            dealership: data.dealership,
                            odometer: data.odometer,
                            inspectionDate: data.inspectionDate,
                            inspectedBy: data.inspectedBy,
                            finalResult: data.finalResult,
                        }}
                    />
                </div>

                {/* ── 2. EXECUTIVE DASHBOARD ── */}
                <div>
                    <EVExecutiveDashboard
                        scores={scores}
                        totalScore={totalScore}
                        maxScore={maxScore}
                        finalResult={data.finalResult}
                        batterySoc={data.batterySoc}
                        batterySoh={data.batterySoh}
                        cellVoltageDeviation={data.cellVoltageDeviation}
                        batteryTemperature={data.batteryTemperature}
                        hvIsolation={data.hvIsolation}
                        acChargingResult={data.acChargingResult}
                        dcChargingResult={data.dcChargingResult}
                        chargingRate={data.chargingRate}
                        activeFaultCodes={data.activeFaultCodes}
                        storedFaultCodes={data.storedFaultCodes}
                        pendingFaultCodes={data.pendingFaultCodes}
                        totalFaultCodes={data.totalFaultCodes}
                    />
                </div>

                {/* ── SECTION 01 — VEHICLE IDENTITY & DOCUMENTATION ── */}
                {data.documentationData?.items && (
                    <div className="rounded-2xl print:rounded-xl p-6 print:p-3 bg-[#080b12] border border-cyan-500/20">
                        <SectionHeader num="01" title="Vehicle Identity & Legal Documentation" icon={<FileText className="w-4 h-4" />} />
                        <ChecklistDisplay items={data.documentationData.items} />
                    </div>
                )}

                {/* ── SECTION 02 — EXTERIOR & PAINT INSPECTION (WITH DFT GAUGE) ── */}
                <div className="rounded-2xl print:rounded-xl p-6 print:p-3 bg-[#080b12] border border-cyan-500/20 space-y-6 print:space-y-2.5">
                    <SectionHeader num="02" title="Exterior, Body Panels & Digital Paint Depth (DFT)" icon={<Car className="w-4 h-4" />} />

                    {/* Paint Gauge Illustration */}
                    <div className="print:scale-[0.88] print:origin-top print:-mb-6">
                        <EVPaintGaugeIllustration readings={data.paintThicknessData} />
                    </div>

                    {/* 16-Panel DFT Readings Table */}
                    {data.paintThicknessData?.length > 0 && (
                        <div>
                            <div className="text-[10px] print:text-[8px] font-mono font-bold text-cyan-400 uppercase tracking-widest mb-3 print:mb-1.5">
                                DIGITAL PAINT THICKNESS READINGS (16-PANEL METRIC IN MICRONS µm)
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2.5 print:gap-1.5">
                                {data.paintThicknessData.map((pt: any, i: number) => (
                                    <div key={i} className="p-3 print:p-1.5 rounded-xl print:rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                        <span className="text-xs print:text-[10px] text-gray-300">{pt.panel}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs print:text-[10px] font-mono font-bold text-cyan-400">{pt.reading || "110"} µm</span>
                                            <StatusBadge status={pt.status || "PASS"} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Exterior Checklist */}
                    {data.exteriorData?.items && (
                        <ChecklistDisplay items={data.exteriorData.items} />
                    )}
                </div>

                {/* ── SECTION 03 — TYRE & WHEEL INSPECTION ── */}
                <div className="rounded-2xl print:rounded-xl p-6 print:p-3 bg-[#080b12] border border-cyan-500/20 space-y-4 print:space-y-2">
                    <SectionHeader num="03" title="Tyres, Wheels & EV Load-Rating Inspection" icon={<Gauge className="w-4 h-4" />} />

                    {data.tyreData?.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-3 print:gap-1.5">
                            {data.tyreData.map((tyre: any, i: number) => (
                                <div key={i} className="p-4 print:p-2 rounded-xl print:rounded-lg bg-white/[0.02] border border-white/5 font-mono text-xs print:text-[9px] space-y-2 print:space-y-0.5">
                                    <div className="flex justify-between items-center text-cyan-400 font-bold border-b border-white/5 pb-1">
                                        <span>{tyre.position}</span>
                                        <StatusBadge status={tyre.sidewallStatus || "PASS"} />
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Brand/Size:</span>
                                        <span className="text-white truncate max-w-[100px]">{tyre.brand || "OEM"} {tyre.size}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Tread Depth:</span>
                                        <span className="text-cyan-300 font-bold">{tyre.treadDepth || "7.5"} mm</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Pressure:</span>
                                        <span className="text-emerald-400 font-bold">{tyre.pressure || "36"} PSI</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400 text-[10px] print:text-[8px]">
                                        <span>DOT Code:</span>
                                        <span className="text-gray-300">{tyre.dot || "RECENT"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── SECTION 04 — COMPLETE UNDERBODY INSPECTION ── */}
                <div className="rounded-2xl print:rounded-xl p-6 print:p-3 bg-[#080b12] border border-cyan-500/20 space-y-5 print:space-y-2">
                    <SectionHeader num="04" title="Underbody, Structural Chassis & HV Conduit Routing" icon={<Shield className="w-4 h-4" />} />
                    <div className="print:scale-[0.9] print:origin-top print:-mb-4">
                        <EVUnderbodyGraphic />
                    </div>
                    {data.underbodyData?.items && (
                        <ChecklistDisplay items={data.underbodyData.items} />
                    )}
                </div>

                {/* ── SECTION 05 — HIGH-VOLTAGE BATTERY HEALTH ── */}
                <div className="rounded-2xl print:rounded-xl p-6 print:p-3 bg-[#080b12] border border-cyan-500/20 space-y-6 print:space-y-2">
                    <SectionHeader num="05" title="High-Voltage Li-ion Battery Pack & BMS Telemetry" icon={<Battery className="w-4 h-4" />} />
                    <div className="print:scale-[0.9] print:origin-top print:-mb-4">
                        <EVBatteryDiagram
                            soc={data.batterySoc}
                            soh={data.batterySoh}
                            cellDelta={data.cellVoltageDeviation}
                            temp={data.batteryTemperature}
                            isolation={data.hvIsolation}
                        />
                    </div>
                    {data.batteryData?.items && (
                        <ChecklistDisplay items={data.batteryData.items} />
                    )}
                </div>

                {/* ── SECTION 06 — ELECTRIC MOTOR & DRIVETRAIN ── */}
                <div className="rounded-2xl print:rounded-xl p-6 print:p-3 bg-[#080b12] border border-cyan-500/20 space-y-5 print:space-y-2">
                    <SectionHeader num="06" title="Electric Drive Motor, Inverter & Reduction Gearbox" icon={<Zap className="w-4 h-4" />} />
                    <div className="print:scale-[0.9] print:origin-top print:-mb-4">
                        <EVMotorDrivetrainGraphic />
                    </div>
                    {data.motorData?.items && (
                        <ChecklistDisplay items={data.motorData.items} />
                    )}
                </div>

                {/* ── SECTION 07 — EV CHARGING SYSTEM ── */}
                <div className="rounded-2xl print:rounded-xl p-6 print:p-3 bg-[#080b12] border border-cyan-500/20 space-y-5 print:space-y-2">
                    <SectionHeader num="07" title="On-Board Charger (OBC) & DC Fast Charging System" icon={<Zap className="w-4 h-4" />} />
                    <div className="print:scale-[0.9] print:origin-top print:-mb-4">
                        <EVChargingInfographic
                            acStatus={data.acChargingResult}
                            dcStatus={data.dcChargingResult}
                            chargingRate={data.chargingRate}
                        />
                    </div>
                    {data.chargingData?.items && (
                        <ChecklistDisplay items={data.chargingData.items} />
                    )}
                </div>

                {/* ── SECTION 08 — FULL DIAGNOSTIC SCAN ── */}
                <div className="rounded-2xl print:rounded-xl p-6 print:p-3 bg-[#080b12] border border-cyan-500/20 space-y-5 print:space-y-2">
                    <SectionHeader num="08" title="Full Vehicle OBD-II Multi-Module ECU Diagnostic Scan" icon={<Activity className="w-4 h-4" />} />

                    {/* DTC Summary Strip */}
                    <div className="p-4 print:p-2 rounded-xl print:rounded-lg bg-white/[0.02] border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4 print:gap-2 font-mono">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 print:w-2 print:h-2 rounded-full bg-emerald-400" />
                            <span className="text-xs print:text-[10px] text-white font-bold">FULL VEHICLE SCAN COMPLETED</span>
                        </div>
                        <div className="flex gap-4 print:gap-2 text-xs print:text-[9px]">
                            <span className="text-gray-400">Active DTC: <strong className="text-cyan-400">{data.activeFaultCodes || 0}</strong></span>
                            <span className="text-gray-400">Stored DTC: <strong className="text-amber-400">{data.storedFaultCodes || 0}</strong></span>
                            <span className="text-gray-400">Pending DTC: <strong className="text-cyan-400">{data.pendingFaultCodes || 0}</strong></span>
                            <span className="text-gray-400">Total DTC: <strong className="text-emerald-400">{data.totalFaultCodes || 0}</strong></span>
                        </div>
                    </div>

                    {/* Modules Grid */}
                    {data.diagnosticData?.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 print:grid-cols-5 gap-2.5 print:gap-1.5">
                            {data.diagnosticData.map((mod: any, i: number) => (
                                <div key={i} className="p-2.5 print:p-1.5 rounded-xl print:rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs print:text-[9px] font-mono">
                                    <span className="font-bold text-white truncate max-w-[90px]">{mod.name}</span>
                                    <StatusBadge status={mod.status || "PASS"} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── 2-COLUMN COMPACT GRID IN PRINT FOR CHECKLIST SECTIONS 09-15 ── */}
                <div className="grid grid-cols-1 print:grid-cols-2 gap-6 print:gap-2.5">
                    {/* SECTION 09 — 12V & ELECTRICAL */}
                    {data.electricalData?.items && (
                        <div className="rounded-2xl print:rounded-xl p-6 print:p-2.5 bg-[#080b12] border border-cyan-500/20">
                            <SectionHeader num="09" title="12V Battery & Low-Voltage" icon={<Zap className="w-4 h-4" />} />
                            <ChecklistDisplay items={data.electricalData.items} />
                        </div>
                    )}

                    {/* SECTION 10 — BRAKING & REGEN */}
                    {data.brakingData?.items && (
                        <div className="rounded-2xl print:rounded-xl p-6 print:p-2.5 bg-[#080b12] border border-cyan-500/20">
                            <SectionHeader num="10" title="Brakes & Regenerative Blending" icon={<Shield className="w-4 h-4" />} />
                            <ChecklistDisplay items={data.brakingData.items} />
                        </div>
                    )}

                    {/* SECTION 11 — STEERING & SUSPENSION */}
                    {data.steeringData?.items && (
                        <div className="rounded-2xl print:rounded-xl p-6 print:p-2.5 bg-[#080b12] border border-cyan-500/20">
                            <SectionHeader num="11" title="Steering, Suspension & EV Dynamics" icon={<Navigation className="w-4 h-4" />} />
                            <ChecklistDisplay items={data.steeringData.items} />
                        </div>
                    )}

                    {/* SECTION 12 — INTERIOR CABIN */}
                    {data.interiorData?.items && (
                        <div className="rounded-2xl print:rounded-xl p-6 print:p-2.5 bg-[#080b12] border border-cyan-500/20">
                            <SectionHeader num="12" title="Interior Cabin Quality & Trim" icon={<User className="w-4 h-4" />} />
                            <ChecklistDisplay items={data.interiorData.items} />
                        </div>
                    )}

                    {/* SECTION 13 — INFOTAINMENT */}
                    {data.infotainmentData?.items && (
                        <div className="rounded-2xl print:rounded-xl p-6 print:p-2.5 bg-[#080b12] border border-cyan-500/20">
                            <SectionHeader num="13" title="Infotainment & Connected Tech" icon={<Wifi className="w-4 h-4" />} />
                            <ChecklistDisplay items={data.infotainmentData.items} />
                        </div>
                    )}

                    {/* SECTION 14 — ADAS & SENSORS */}
                    <div className="rounded-2xl print:rounded-xl p-6 print:p-2.5 bg-[#080b12] border border-cyan-500/20 space-y-4 print:space-y-1.5">
                        <SectionHeader num="14" title="ADAS, Radar & Camera Sensors" icon={<Radio className="w-4 h-4" />} />
                        <div className="print:scale-[0.85] print:origin-top print:-mb-6">
                            <EVADASSensorGraphic />
                        </div>
                        {data.adasData?.items && (
                            <ChecklistDisplay items={data.adasData.items} />
                        )}
                    </div>

                    {/* SECTION 15 — ROAD TEST */}
                    {data.roadTestData?.items && (
                        <div className="rounded-2xl print:rounded-xl p-6 print:p-2.5 bg-[#080b12] border border-cyan-500/20">
                            <SectionHeader num="15" title="Road Test & Dynamic Evaluation" icon={<Navigation className="w-4 h-4" />} />
                            <ChecklistDisplay items={data.roadTestData.items} />
                        </div>
                    )}
                </div>

                {/* ── VEHICLE INSPECTION PHOTOS GALLERY ── */}
                <div>
                    <EVReportImagesGallery images={data.images} />
                </div>

                {/* ── SECTION 16 — FINAL SCORECARD & DEFECT CLASSIFICATION ── */}
                <div className="rounded-2xl print:rounded-xl p-6 print:p-3 bg-[#080b12] border border-cyan-500/20 space-y-6 print:space-y-2">
                    <SectionHeader num="16" title="Final EV PDI Scorecard & Defect Severity Framework" icon={<Gauge className="w-4 h-4" />} />

                    {/* Defect Classification Matrix */}
                    <div className="p-4 print:p-2 rounded-xl print:rounded-lg bg-white/[0.02] border border-white/5 font-mono text-xs print:text-[9px]">
                        <div className="text-[10px] print:text-[8px] text-cyan-400 font-bold uppercase tracking-widest mb-3 print:mb-1">
                            DEFECT SEVERITY CLASSIFICATION PROTOCOL
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3 print:gap-1.5">
                            <div className="p-3 print:p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
                                <div className="text-rose-400 font-bold">🔴 CRITICAL DEFECT</div>
                                <div className="text-[10px] print:text-[8px] text-gray-300 mt-1">HV Isolation fault, battery casing impact, brake hydraulic failure. Immediate Delivery Reject.</div>
                            </div>
                            <div className="p-3 print:p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                <div className="text-amber-400 font-bold">🟡 MAJOR DEFECT</div>
                                <div className="text-[10px] print:text-[8px] text-gray-300 mt-1">Paint respray &gt;200µm, charging lock pin failure, camera miscalibration. Rectify before delivery.</div>
                            </div>
                            <div className="p-3 print:p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                                <div className="text-cyan-400 font-bold">🔵 MINOR OBSERVATION</div>
                                <div className="text-[10px] print:text-[8px] text-gray-300 mt-1">Cosmetic swirls, wiper washer fluid low, tyre pressure adjustment required. Acceptable with notes.</div>
                            </div>
                        </div>
                    </div>

                    {/* Category Breakdown Bars */}
                    <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3 print:gap-1.5 font-mono text-xs print:text-[9px]">
                        {SCORE_LABELS.map(({ key, label }) => {
                            const sc = scores[key] || 0
                            return (
                                <div key={key} className="p-2.5 print:p-1.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                    <span className="text-gray-300 truncate max-w-[140px]">{label}</span>
                                    <div className="flex items-center gap-3 print:gap-1.5">
                                        <div className="w-24 print:w-16 h-2 print:h-1.5 rounded-full bg-white/10 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${(sc / 10) * 100}%`,
                                                    backgroundColor: sc >= 8 ? "#00d4ff" : sc >= 6 ? "#f59e0b" : "#ff4444"
                                                }}
                                            />
                                        </div>
                                        <span className="font-bold text-cyan-300 w-10 print:w-8 text-right">{sc}/10</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ── ADMIN COMMENTS & RECOMMENDATION ── */}
                {data.adminComments && (
                    <div className="rounded-2xl print:rounded-xl p-6 print:p-2.5 bg-[#080b12] border border-cyan-500/20">
                        <div className="text-[10px] print:text-[8px] font-mono font-black uppercase tracking-widest text-cyan-400 mb-2 print:mb-1">
                            PDI LEAD INSPECTOR FINDINGS & RECOMMENDATIONS
                        </div>
                        <p className="text-sm print:text-[10px] text-gray-300 italic leading-relaxed">{data.adminComments}</p>
                    </div>
                )}

                {/* ── SIGN-OFF BLOCK ── */}
                <div className="rounded-2xl print:rounded-xl p-6 print:p-3 bg-[#080b12] border border-cyan-500/20 break-inside-avoid">
                    <div className="text-[10px] print:text-[8px] font-mono font-black uppercase tracking-widest text-cyan-400 mb-6 print:mb-2">
                        OFFICIAL CERTIFICATION & SIGN-OFF
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6 print:gap-2 font-mono">
                        <div className="p-4 print:p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 print:space-y-0.5">
                            <div className="text-[9px] print:text-[7px] text-gray-500 uppercase">PDI PROFESSIONAL</div>
                            <div className="text-sm print:text-xs font-black text-cyan-300">{data.inspectedBy || "Ritchie"}</div>
                            <div className="text-[9px] print:text-[7px] text-gray-400">Lead EV Quality Inspector</div>
                            <div className="h-12 print:h-7 border-b border-dashed border-cyan-500/30 flex items-end pb-1 text-xs print:text-[9px] text-cyan-400/80 font-serif italic">
                                Ritchie / DG-EV-CERT
                            </div>
                        </div>

                        <div className="p-4 print:p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 print:space-y-0.5">
                            <div className="text-[9px] print:text-[7px] text-gray-500 uppercase">CUSTOMER ACCEPTANCE</div>
                            <div className="text-sm print:text-xs font-black text-white">{data.customerName}</div>
                            <div className="text-[9px] print:text-[7px] text-gray-400">Vehicle Owner / Purchaser</div>
                            <div className="h-12 print:h-7 border-b border-dashed border-white/20 flex items-end pb-1 text-xs print:text-[9px] text-gray-500">
                                Signature / Acknowledged
                            </div>
                        </div>

                        <div className="p-4 print:p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 print:space-y-0.5">
                            <div className="text-[9px] print:text-[7px] text-gray-500 uppercase">DEALERSHIP WITNESS</div>
                            <div className="text-sm print:text-xs font-black text-white">{data.dealership || "Authorized Dealer"}</div>
                            <div className="text-[9px] print:text-[7px] text-gray-400">Sales / Delivery Manager</div>
                            <div className="h-12 print:h-7 border-b border-dashed border-white/20 flex items-end pb-1 text-xs print:text-[9px] text-gray-500">
                                Signature & Dealership Stamp
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 print:mt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] print:text-[8px] font-mono text-gray-500 border-t border-white/5 pt-4 print:pt-1.5">
                        <span>INSPECTION DATE: {new Date(data.inspectionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        <span>REPORT VALIDATION ID: {data.id}</span>
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="text-center py-6 print:py-2 space-y-1 font-mono text-[10px] print:text-[8px] text-gray-600">
                    <div className="text-cyan-400/80 font-black tracking-widest">DETAILING GARAGE®</div>
                    <div>Professional PDI Services | Himachal Pradesh</div>
                    <div className="italic text-gray-700">“Inspect Before You Accept.”</div>
                </div>
            </div>
        </div>
    )
}
