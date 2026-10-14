"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import {
    EVPDIFormData, EVCheckItem, EVCheckStatus, PaintThicknessReading,
    TyreReading, DiagnosticModule, EVPDIScores, EVFinalResult,
    getDefaultFormData,
} from "./ev-pdi-types"
import {
    Zap, Battery, ChevronDown, ChevronUp, Save, Loader2,
    CheckCircle, XCircle, AlertCircle, MinusCircle,
    Car, User, FileText, Wrench, Activity, Wifi, Shield, Navigation,
    Radio, Gauge, Settings2, Volume2, Eye, ArrowRight, ChevronRight, Camera
} from "lucide-react"
import { EVImageUpload } from "./ev/ev-image-upload"

// ── Status Toggle ────────────────────────────────────────────────────────────
const STATUS_OPTIONS: { value: EVCheckStatus; label: string; color: string; bg: string }[] = [
    { value: "PASS", label: "PASS", color: "#00d4ff", bg: "rgba(0,212,255,0.12)" },
    { value: "FAIL", label: "FAIL", color: "#ff4444", bg: "rgba(255,68,68,0.12)" },
    { value: "OBSERVATION", label: "OBS", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    { value: "NA", label: "N/A", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
]

function StatusToggle({ value, onChange }: { value: EVCheckStatus; onChange: (v: EVCheckStatus) => void }) {
    const opt = STATUS_OPTIONS.find(o => o.value === value) || STATUS_OPTIONS[0]
    const cycle = () => {
        const idx = STATUS_OPTIONS.findIndex(o => o.value === value)
        onChange(STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length].value)
    }
    return (
        <button
            type="button"
            onClick={cycle}
            style={{ color: opt.color, backgroundColor: opt.bg, borderColor: opt.color + "40" }}
            className="px-2 py-0.5 rounded text-[9px] font-black tracking-wider border transition-all hover:scale-105 min-w-[46px] h-6 text-center shrink-0"
        >
            {opt.label}
        </button>
    )
}

// ── Section Wrapper (Compact) ────────────────────────────────────────────────
function EVSection({
    num, title, icon, children, accent = "#00d4ff"
}: {
    num: string; title: string; icon: React.ReactNode; children: React.ReactNode; accent?: string
}) {
    const [open, setOpen] = React.useState(true)
    return (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}22` }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:opacity-90"
                style={{ background: `linear-gradient(135deg, #0d0f14 0%, ${accent}08 100%)`, borderBottom: open ? `1px solid ${accent}22` : "none" }}
            >
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-black" style={{ background: accent + "20", color: accent, border: `1px solid ${accent}40` }}>
                        {num}
                    </div>
                    <div className="flex items-center gap-2" style={{ color: accent }}>
                        {icon}
                        <span className="font-black uppercase tracking-widest text-xs">{title}</span>
                    </div>
                </div>
                <div style={{ color: accent }}>
                    {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
            </button>
            {open && <div className="bg-[#0a0c10] p-3">{children}</div>}
        </div>
    )
}

// ── Checklist Table (Mobile & Desktop Responsive) ─────────────────────────
function ChecklistTable({
    items,
    onChange,
    accent = "#00d4ff"
}: {
    items: EVCheckItem[]
    onChange: (items: EVCheckItem[]) => void
    accent?: string
}) {
    const update = (idx: number, field: keyof EVCheckItem, val: string) => {
        const updated = items.map((item, i) => i === idx ? { ...item, [field]: val } : item)
        onChange(updated)
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2">
            {items.map((item, idx) => (
                <div
                    key={item.id}
                    className="p-2 sm:px-2.5 sm:py-1 rounded-lg bg-white/[0.02] border transition-all hover:bg-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 sm:h-9"
                    style={{ borderColor: `${accent}18` }}
                >
                    <div className="flex items-center justify-between gap-2 w-full sm:w-auto sm:flex-1 min-w-0">
                        <span className="text-xs sm:text-[11px] text-gray-200 font-medium truncate leading-tight">{item.label}</span>
                        <div className="sm:hidden shrink-0">
                            <StatusToggle value={item.status} onChange={v => update(idx, "status", v)} />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <input
                            type="text"
                            value={item.observation}
                            onChange={e => update(idx, "observation", e.target.value)}
                            placeholder="Observation note..."
                            className="w-full sm:w-24 md:w-28 text-xs sm:text-[10px] px-2 py-1 sm:py-0.5 rounded bg-black/50 border border-white/10 text-gray-300 placeholder-gray-600 outline-none focus:border-cyan-400 sm:focus:w-36 transition-all"
                        />
                        <div className="hidden sm:block shrink-0">
                            <StatusToggle value={item.status} onChange={v => update(idx, "status", v)} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ── Field Input (Ultra-Compact) ──────────────────────────────────────────────
function Field({ label, value, onChange, type = "text", placeholder = "", accent = "#00d4ff" }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; accent?: string;
}) {
    return (
        <div>
            <label className="block text-[8.5px] font-black uppercase tracking-wider mb-0.5 truncate" style={{ color: accent + "cc" }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-8 px-2.5 rounded-lg text-xs text-white bg-black/60 border outline-none transition-all focus:border-cyan-400 focus:bg-white/[0.05] placeholder-gray-600"
                style={{ borderColor: accent + "25" }}
            />
        </div>
    )
}

function PassFailToggle({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
    return (
        <div>
            <label className="block text-[9px] font-black uppercase tracking-widest mb-1.5 text-cyan-400">{label}</label>
            <div className="flex gap-2">
                {["PASS", "FAIL"].map(opt => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onChange(opt)}
                        className="flex-1 py-2 rounded-lg text-xs font-black tracking-widest border transition-all"
                        style={{
                            backgroundColor: value === opt ? (opt === "PASS" ? "rgba(0,212,255,0.2)" : "rgba(255,68,68,0.2)") : "transparent",
                            borderColor: value === opt ? (opt === "PASS" ? "#00d4ff" : "#ff4444") : "#ffffff15",
                            color: value === opt ? (opt === "PASS" ? "#00d4ff" : "#ff4444") : "#6b7280",
                        }}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── Main EV PDI Form ─────────────────────────────────────────────────────────
export function EVPDIForm() {
    const router = useRouter()
    const pathname = usePathname()
    const [data, setData] = React.useState<EVPDIFormData>(getDefaultFormData())
    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState("")

    const set = (field: keyof EVPDIFormData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
    }

    const setScore = (key: keyof EVPDIScores, val: number) => {
        setData(prev => ({ ...prev, scores: { ...prev.scores, [key]: Math.min(10, Math.max(0, val)) } }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)
        try {
            const res = await fetch("/api/admin/ev-pdi/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to save")
            }
            const result = await res.json()
            const targetViewUrl = pathname?.startsWith('/shop/billing')
                ? `/shop/billing/pdi/ev-view/${result.id}`
                : `/admin/pdi/ev-view/${result.id}`
            router.push(targetViewUrl)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const SCORE_LABELS: { key: keyof EVPDIScores; label: string }[] = [
        { key: "body", label: "Body & Paint" },
        { key: "tyres", label: "Tyres & Wheels" },
        { key: "underbody", label: "Underbody" },
        { key: "battery", label: "Battery" },
        { key: "charging", label: "Charging" },
        { key: "motor", label: "Motor & Drivetrain" },
        { key: "electrical", label: "Electrical" },
        { key: "brakes", label: "Brakes" },
        { key: "interior", label: "Interior" },
        { key: "adas", label: "ADAS & Safety" },
        { key: "diagnostics", label: "Diagnostics" },
    ]

    return (
        <form onSubmit={handleSubmit} className="min-h-screen bg-[#07090d] text-white pb-24">
            {/* ── HEADER ── */}
            <div className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #07090d 0%, #0d111a 100%)", borderBottom: "1px solid rgba(0,212,255,0.15)" }}>
                <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-0.5">DETAILING GARAGE® | EV PDI</div>
                    <h1 className="text-lg font-black uppercase tracking-tight text-white">New EV Pre-Delivery Inspection</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:flex items-center gap-1 text-[9px] font-black text-cyan-400 uppercase tracking-widest border border-cyan-400/20 px-3 py-1.5 rounded-full">
                        <Zap className="w-3 h-3" /> 150+ Point Checklist
                    </span>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all hover:scale-105 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #00d4ff, #0066ff)", color: "#000" }}
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Report
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6 space-y-2">
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                        <XCircle className="w-5 h-5 shrink-0" /> {error}
                    </div>
                )}

                {/* ── VEHICLE IDENTITY (ULTRA-COMPACT DENSE GRID) ── */}
                <EVSection num="00" title="Vehicle Identity & Client Info" icon={<Car className="w-4 h-4" />} accent="#00d4ff">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        <Field label="Customer Name *" value={data.customerName} onChange={v => set("customerName", v)} placeholder="Full name" accent="#00d4ff" />
                        <Field label="Customer Phone" value={data.customerPhone} onChange={v => set("customerPhone", v)} placeholder="+91 00000 00000" accent="#00d4ff" />
                        <Field label="Customer Email" value={data.customerEmail} onChange={v => set("customerEmail", v)} placeholder="customer@email.com" type="email" accent="#00d4ff" />
                        <Field label="Dealership" value={data.dealership} onChange={v => set("dealership", v)} placeholder="Dealer name" accent="#00d4ff" />

                        <Field label="Vehicle Make *" value={data.vehicleMake} onChange={v => set("vehicleMake", v)} placeholder="e.g. Tata" accent="#00d4ff" />
                        <Field label="Vehicle Model *" value={data.vehicleModel} onChange={v => set("vehicleModel", v)} placeholder="e.g. Nexon EV" accent="#00d4ff" />
                        <Field label="Variant" value={data.vehicleVariant} onChange={v => set("vehicleVariant", v)} placeholder="e.g. Max LR" accent="#00d4ff" />
                        <Field label="Colour" value={data.vehicleColor} onChange={v => set("vehicleColor", v)} placeholder="e.g. Pristine White" accent="#00d4ff" />

                        <Field label="VIN / Chassis No." value={data.vin} onChange={v => set("vin", v)} placeholder="17-char VIN" accent="#00d4ff" />
                        <Field label="Motor Number" value={data.motorNumber} onChange={v => set("motorNumber", v)} placeholder="Motor serial no." accent="#00d4ff" />
                        <Field label="Battery ID" value={data.batteryId} onChange={v => set("batteryId", v)} placeholder="Battery pack ID" accent="#00d4ff" />
                        <Field label="Registration No." value={data.registrationNumber} onChange={v => set("registrationNumber", v)} placeholder="HP-XX-XX-XXXX" accent="#00d4ff" />

                        <Field label="Year" value={data.vehicleYear} onChange={v => set("vehicleYear", v)} placeholder="2026" accent="#00d4ff" />
                        <Field label="Mfg. Date" value={data.manufacturingDate} onChange={v => set("manufacturingDate", v)} placeholder="MM/YYYY" accent="#00d4ff" />
                        <Field label="Odometer (km)" value={data.odometer} onChange={v => set("odometer", v)} placeholder="0" accent="#00d4ff" />
                        <Field label="Inspection Date" value={data.inspectionDate} onChange={v => set("inspectionDate", v)} type="date" accent="#00d4ff" />
                    </div>
                </EVSection>

                {/* ── SECTION 01 — DOCUMENTATION ── */}
                <EVSection num="01" title="Vehicle Identity & Documentation" icon={<FileText className="w-4 h-4" />} accent="#00d4ff">
                    <ChecklistTable
                        items={data.documentationData.items}
                        onChange={items => set("documentationData", { items })}
                        accent="#00d4ff"
                    />
                </EVSection>

                {/* ── SECTION 02 — EXTERIOR & PAINT ── */}
                <EVSection num="02" title="Exterior & Paint Inspection" icon={<Eye className="w-4 h-4" />} accent="#a78bfa">
                    <ChecklistTable
                        items={data.exteriorData.items}
                        onChange={items => set("exteriorData", { items })}
                        accent="#a78bfa"
                    />
                    <div className="mt-5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-2">
                            <div className="h-px flex-1 bg-purple-400/20" />
                            Paint Thickness Test (µm)
                            <div className="h-px flex-1 bg-purple-400/20" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {data.paintThicknessData.map((row, idx) => (
                                <div
                                    key={idx}
                                    className="p-2.5 rounded-xl bg-white/[0.02] border border-purple-400/20 flex items-center justify-between gap-2"
                                >
                                    <span className="text-xs text-gray-300 font-medium truncate flex-1">{row.panel}</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={row.reading}
                                            onChange={e => {
                                                const updated = data.paintThicknessData.map((r, i) => i === idx ? { ...r, reading: e.target.value } : r)
                                                set("paintThicknessData", updated)
                                            }}
                                            placeholder="µm"
                                            className="w-16 px-2 py-1 rounded text-xs text-center text-white bg-black/40 border border-white/10 outline-none focus:border-purple-400/50"
                                        />
                                        <StatusToggle
                                            value={row.status}
                                            onChange={v => {
                                                const updated = data.paintThicknessData.map((r, i) => i === idx ? { ...r, status: v } : r)
                                                set("paintThicknessData", updated)
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </EVSection>

                {/* ── SECTION 03 — TYRES & WHEELS ── */}
                <EVSection num="03" title="Tyre & Wheel Inspection" icon={<Settings2 className="w-4 h-4" />} accent="#34d399">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                        {data.tyreData.map((tyre, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-emerald-400/20 space-y-2">
                                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                                    <span className="text-xs font-bold text-emerald-300">{tyre.position}</span>
                                    <StatusToggle
                                        value={tyre.sidewallStatus}
                                        onChange={v => {
                                            const updated = data.tyreData.map((t, i) => i === idx ? { ...t, sidewallStatus: v } : t)
                                            set("tyreData", updated)
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                    <div>
                                        <label className="text-[8px] text-gray-400 uppercase">Brand</label>
                                        <input
                                            type="text"
                                            value={tyre.brand}
                                            onChange={e => {
                                                const updated = data.tyreData.map((t, i) => i === idx ? { ...t, brand: e.target.value } : t)
                                                set("tyreData", updated)
                                            }}
                                            placeholder="Brand"
                                            className="w-full h-7 px-2 rounded bg-black/40 border border-white/10 text-white text-[11px] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] text-gray-400 uppercase">Size</label>
                                        <input
                                            type="text"
                                            value={tyre.size}
                                            onChange={e => {
                                                const updated = data.tyreData.map((t, i) => i === idx ? { ...t, size: e.target.value } : t)
                                                set("tyreData", updated)
                                            }}
                                            placeholder="Size"
                                            className="w-full h-7 px-2 rounded bg-black/40 border border-white/10 text-white text-[11px] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] text-gray-400 uppercase">Tread (mm)</label>
                                        <input
                                            type="text"
                                            value={tyre.treadDepth}
                                            onChange={e => {
                                                const updated = data.tyreData.map((t, i) => i === idx ? { ...t, treadDepth: e.target.value } : t)
                                                set("tyreData", updated)
                                            }}
                                            placeholder="7.5"
                                            className="w-full h-7 px-2 rounded bg-black/40 border border-white/10 text-white text-[11px] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] text-gray-400 uppercase">PSI</label>
                                        <input
                                            type="text"
                                            value={tyre.pressure}
                                            onChange={e => {
                                                const updated = data.tyreData.map((t, i) => i === idx ? { ...t, pressure: e.target.value } : t)
                                                set("tyreData", updated)
                                            }}
                                            placeholder="36"
                                            className="w-full h-7 px-2 rounded bg-black/40 border border-white/10 text-white text-[11px] outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[8px] text-gray-400 uppercase">DOT / Code</label>
                                    <input
                                        type="text"
                                        value={tyre.dot}
                                        onChange={e => {
                                            const updated = data.tyreData.map((t, i) => i === idx ? { ...t, dot: e.target.value } : t)
                                            set("tyreData", updated)
                                        }}
                                        placeholder="DOT Code"
                                        className="w-full h-7 px-2 rounded bg-black/40 border border-white/10 text-white text-[11px] outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </EVSection>

                {/* ── SECTION 04 — UNDERBODY ── */}
                <EVSection num="04" title="Underbody Inspection" icon={<Activity className="w-4 h-4" />} accent="#f97316">
                    <div className="flex items-center gap-3 p-3 rounded-lg mb-4 text-xs font-bold text-amber-300" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.3)" }}>
                        <Shield className="w-5 h-5 shrink-0 text-orange-400" />
                        HIGH-VOLTAGE COMPONENTS — INSPECTION BY TRAINED PERSONNEL ONLY
                    </div>
                    <ChecklistTable
                        items={data.underbodyData.items}
                        onChange={items => set("underbodyData", { items })}
                        accent="#f97316"
                    />
                </EVSection>

                {/* ── SECTION 05 — BATTERY HEALTH ── */}
                <EVSection num="05" title="High-Voltage Battery Health" icon={<Battery className="w-4 h-4" />} accent="#00d4ff">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest mb-1.5 text-cyan-400">Battery SOC (%)</label>
                            <input type="text" value={data.batterySoc} onChange={e => set("batterySoc", e.target.value)} placeholder="e.g. 85" className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-[#0d0f14] border border-cyan-400/20 outline-none" />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest mb-1.5 text-cyan-400">Battery SOH (%)</label>
                            <input type="text" value={data.batterySoh} onChange={e => set("batterySoh", e.target.value)} placeholder="e.g. 100" className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-[#0d0f14] border border-cyan-400/20 outline-none" />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest mb-1.5 text-cyan-400">Cell Voltage Deviation</label>
                            <input type="text" value={data.cellVoltageDeviation} onChange={e => set("cellVoltageDeviation", e.target.value)} placeholder="e.g. ±0.005V" className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-[#0d0f14] border border-cyan-400/20 outline-none" />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest mb-1.5 text-cyan-400">Battery Temperature (°C)</label>
                            <input type="text" value={data.batteryTemperature} onChange={e => set("batteryTemperature", e.target.value)} placeholder="e.g. 28" className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-[#0d0f14] border border-cyan-400/20 outline-none" />
                        </div>
                        <PassFailToggle value={data.hvIsolation} onChange={v => set("hvIsolation", v)} label="HV Isolation Test" />
                    </div>
                    <ChecklistTable
                        items={data.batteryData.items}
                        onChange={items => set("batteryData", { items })}
                        accent="#00d4ff"
                    />
                </EVSection>

                {/* ── SECTION 06 — MOTOR & DRIVETRAIN ── */}
                <EVSection num="06" title="Electric Motor & Drivetrain" icon={<Zap className="w-4 h-4" />} accent="#f59e0b">
                    <ChecklistTable
                        items={data.motorData.items}
                        onChange={items => set("motorData", { items })}
                        accent="#f59e0b"
                    />
                </EVSection>

                {/* ── SECTION 07 — CHARGING SYSTEM ── */}
                <EVSection num="07" title="EV Charging System" icon={<Zap className="w-4 h-4" />} accent="#34d399">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                        <PassFailToggle value={data.acChargingResult} onChange={v => set("acChargingResult", v)} label="AC Charging Result" />
                        <PassFailToggle value={data.dcChargingResult} onChange={v => set("dcChargingResult", v)} label="DC Charging Result" />
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest mb-1.5 text-emerald-400">Charging Rate (kW)</label>
                            <input type="text" value={data.chargingRate} onChange={e => set("chargingRate", e.target.value)} placeholder="e.g. 7.2" className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-[#0d0f14] border border-emerald-400/20 outline-none" />
                        </div>
                    </div>
                    <ChecklistTable
                        items={data.chargingData.items}
                        onChange={items => set("chargingData", { items })}
                        accent="#34d399"
                    />
                </EVSection>

                {/* ── SECTION 08 — DIAGNOSTIC SCAN ── */}
                <EVSection num="08" title="Full Professional Diagnostic Scan" icon={<Activity className="w-4 h-4" />} accent="#a78bfa">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                        {[
                            { field: "activeFaultCodes", label: "Active DTC", color: "#ff4444" },
                            { field: "storedFaultCodes", label: "Stored DTC", color: "#f59e0b" },
                            { field: "pendingFaultCodes", label: "Pending DTC", color: "#f59e0b" },
                            { field: "totalFaultCodes", label: "Total DTC", color: "#a78bfa" },
                        ].map(({ field, label, color }) => (
                            <div key={field}>
                                <label className="block text-[8px] font-black uppercase tracking-wider mb-0.5 truncate" style={{ color }}>{label}</label>
                                <input
                                    type="text"
                                    value={(data as any)[field]}
                                    onChange={e => set(field as keyof EVPDIFormData, e.target.value)}
                                    placeholder="0"
                                    className="w-full h-8 px-2.5 rounded-lg text-xs text-white bg-[#0d0f14] outline-none border"
                                    style={{ borderColor: color + "30" }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {data.diagnosticData.map((mod, idx) => (
                            <div key={mod.name} className="p-2 rounded-xl bg-white/[0.02] border border-purple-400/20 flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-purple-300 w-24 truncate">{mod.name}</span>
                                <input
                                    type="text"
                                    value={mod.faultCodes}
                                    onChange={e => {
                                        const updated = data.diagnosticData.map((m, i) => i === idx ? { ...m, faultCodes: e.target.value } : m)
                                        set("diagnosticData", updated)
                                    }}
                                    placeholder="DTC code..."
                                    className="w-20 text-[10px] h-6 px-1.5 rounded bg-black/40 border border-white/10 text-gray-300 outline-none"
                                />
                                <StatusToggle
                                    value={mod.status}
                                    onChange={v => {
                                        const updated = data.diagnosticData.map((m, i) => i === idx ? { ...m, status: v } : m)
                                        set("diagnosticData", updated)
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </EVSection>

                {/* ── SECTION 09 — ELECTRICAL ── */}
                <EVSection num="09" title="12V & Electrical System" icon={<Zap className="w-4 h-4" />} accent="#fbbf24">
                    <ChecklistTable
                        items={data.electricalData.items}
                        onChange={items => set("electricalData", { items })}
                        accent="#fbbf24"
                    />
                </EVSection>

                {/* ── SECTION 10 — BRAKING ── */}
                <EVSection num="10" title="Braking & Regenerative Braking" icon={<Activity className="w-4 h-4" />} accent="#f87171">
                    <ChecklistTable
                        items={data.brakingData.items}
                        onChange={items => set("brakingData", { items })}
                        accent="#f87171"
                    />
                </EVSection>

                {/* ── SECTION 11 — STEERING & SUSPENSION ── */}
                <EVSection num="11" title="Steering & Suspension" icon={<Settings2 className="w-4 h-4" />} accent="#60a5fa">
                    <ChecklistTable
                        items={data.steeringData.items}
                        onChange={items => set("steeringData", { items })}
                        accent="#60a5fa"
                    />
                </EVSection>

                {/* ── SECTION 12 — INTERIOR ── */}
                <EVSection num="12" title="Interior Quality Inspection" icon={<Eye className="w-4 h-4" />} accent="#c084fc">
                    <ChecklistTable
                        items={data.interiorData.items}
                        onChange={items => set("interiorData", { items })}
                        accent="#c084fc"
                    />
                </EVSection>

                {/* ── SECTION 13 — INFOTAINMENT ── */}
                <EVSection num="13" title="Infotainment & Connectivity" icon={<Wifi className="w-4 h-4" />} accent="#38bdf8">
                    <ChecklistTable
                        items={data.infotainmentData.items}
                        onChange={items => set("infotainmentData", { items })}
                        accent="#38bdf8"
                    />
                </EVSection>

                {/* ── SECTION 14 — ADAS & SAFETY ── */}
                <EVSection num="14" title="ADAS & Safety Systems" icon={<Shield className="w-4 h-4" />} accent="#34d399">
                    <ChecklistTable
                        items={data.adasData.items}
                        onChange={items => set("adasData", { items })}
                        accent="#34d399"
                    />
                </EVSection>

                {/* ── SECTION 15 — ROAD TEST ── */}
                <EVSection num="15" title="Road Test" icon={<Navigation className="w-4 h-4" />} accent="#f59e0b">
                    <ChecklistTable
                        items={data.roadTestData.items}
                        onChange={items => set("roadTestData", { items })}
                        accent="#f59e0b"
                    />
                </EVSection>

                {/* ── SECTION 16 — VEHICLE INSPECTION PHOTOS ── */}
                <EVSection num="16" title="Vehicle Inspection Photos & Evidence" icon={<Camera className="w-4 h-4" />} accent="#00d4ff">
                    <EVImageUpload
                        images={data.images || []}
                        onChange={images => set("images", images)}
                    />
                </EVSection>

                {/* ── SECTION 17 — SCORECARD ── */}
                <EVSection num="17" title="Final EV PDI Scorecard" icon={<Gauge className="w-4 h-4" />} accent="#00d4ff">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {SCORE_LABELS.map(({ key, label }) => (
                            <div key={key} className="rounded-xl p-4" style={{ background: "#0d0f14", border: "1px solid rgba(0,212,255,0.15)" }}>
                                <div className="text-[9px] font-black uppercase tracking-widest text-cyan-400 mb-2">{label}</div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min={0}
                                        max={10}
                                        value={data.scores[key]}
                                        onChange={e => setScore(key, parseInt(e.target.value) || 0)}
                                        className="w-16 text-center text-2xl font-black text-white bg-transparent border-b-2 border-cyan-400/40 outline-none pb-1"
                                    />
                                    <span className="text-gray-500 text-lg font-black">/10</span>
                                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${data.scores[key] * 10}%`,
                                                background: data.scores[key] >= 8 ? "#00d4ff" : data.scores[key] >= 6 ? "#f59e0b" : "#ff4444"
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Final Result */}
                    <div className="rounded-xl p-5" style={{ background: "#0d0f14", border: "1px solid rgba(0,212,255,0.2)" }}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-4">Final Result</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { value: "PASS", label: "✅ PASS — Ready for Delivery", color: "#00d4ff" },
                                { value: "PASS_WITH_OBSERVATIONS", label: "⚠️ Pass with Observations", color: "#f59e0b" },
                                { value: "RECHECK", label: "🔶 Recheck Required", color: "#f97316" },
                                { value: "NOT_RECOMMENDED", label: "❌ Delivery Not Recommended", color: "#ff4444" },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => set("finalResult", opt.value as EVFinalResult)}
                                    className="p-3 rounded-xl text-xs font-bold text-left border transition-all"
                                    style={{
                                        borderColor: data.finalResult === opt.value ? opt.color : opt.color + "30",
                                        background: data.finalResult === opt.value ? opt.color + "15" : "transparent",
                                        color: data.finalResult === opt.value ? opt.color : "#6b7280"
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </EVSection>

                {/* ── ADMIN COMMENTS ── */}
                <div className="rounded-xl p-5" style={{ background: "#0d0f14", border: "1px solid rgba(0,212,255,0.15)" }}>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-cyan-400 mb-2">Admin Comments & Recommendations</label>
                    <textarea
                        value={data.adminComments}
                        onChange={e => set("adminComments", e.target.value)}
                        rows={4}
                        placeholder="Additional notes, recommendations, or observations..."
                        className="w-full px-4 py-3 rounded-lg text-sm text-white bg-white/5 border border-white/10 outline-none resize-none"
                    />
                </div>

                {/* ── SUBMIT (DESKTOP) ── */}
                <div className="flex justify-end pt-4 pb-16 sm:pb-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all hover:scale-105 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #00d4ff, #0066ff)", color: "#000" }}
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save EV PDI Report
                    </button>
                </div>
            </div>

            {/* ── MOBILE FLOATING ACTION BAR ── */}
            <div className="fixed bottom-0 inset-x-0 p-3 bg-[#07090d]/95 backdrop-blur-md border-t border-cyan-500/20 z-40 sm:hidden flex items-center justify-between gap-3 shadow-2xl">
                <div className="text-[10px] font-mono text-cyan-400 truncate">
                    {data.vehicleMake ? `${data.vehicleMake} ${data.vehicleModel}` : "EV Inspection"}
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Report
                </button>
            </div>
        </form>
    )
}
