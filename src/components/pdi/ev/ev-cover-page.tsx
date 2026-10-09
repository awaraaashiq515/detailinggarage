import * as React from "react"
import { Zap, Shield, Battery, CheckCircle2, Award, Calendar, User, Car, MapPin, Gauge } from "lucide-react"

export interface EVReportMetadata {
    customerName: string
    customerPhone?: string
    customerEmail?: string
    vehicleMake: string
    vehicleModel: string
    vehicleVariant?: string
    vehicleColor?: string
    vehicleYear?: string
    vin?: string
    motorNumber?: string
    batteryId?: string
    registrationNumber?: string
    dealership?: string
    odometer?: string
    inspectionDate: string
    inspectedBy?: string
    finalResult?: string
}

export function EVCoverPage({ meta }: { meta: EVReportMetadata }) {
    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        } catch {
            return dateStr
        }
    }

    const resultLabel = meta.finalResult === "PASS"
        ? { text: "CERTIFIED PASS — READY FOR DELIVERY", color: "#00d4ff", border: "border-cyan-400", bg: "bg-cyan-500/10" }
        : meta.finalResult === "PASS_WITH_OBSERVATIONS"
        ? { text: "PASS WITH MINOR OBSERVATIONS", color: "#f59e0b", border: "border-amber-400", bg: "bg-amber-500/10" }
        : meta.finalResult === "RECHECK"
        ? { text: "RECHECK REQUIRED BEFORE ACCEPTANCE", color: "#f97316", border: "border-orange-500", bg: "bg-orange-500/10" }
        : { text: "DELIVERY NOT RECOMMENDED", color: "#ff4444", border: "border-rose-500", bg: "bg-rose-500/10" }

    return (
        <div className="relative rounded-3xl print:rounded-xl overflow-hidden bg-gradient-to-b from-[#0a0d14] via-[#07090e] to-[#040508] border border-cyan-500/25 p-4 sm:p-8 md:p-12 print:p-4 text-white shadow-2xl mb-8 print:mb-3 print:border-cyan-500/40">
            {/* Top Atmospheric Glows */}
            <div className="no-print absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="no-print absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Branding */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 print:gap-2 pb-8 print:pb-2 border-b border-cyan-500/20">
                <div>
                    <div className="flex items-center gap-3 print:gap-2 mb-2 print:mb-0">
                        <div className="flex items-center justify-center w-10 h-10 print:w-7 print:h-7 rounded-xl print:rounded-lg bg-cyan-400/10 border border-cyan-400/40 text-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                            <Zap className="w-6 h-6 print:w-4 print:h-4 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-xl md:text-2xl print:text-base font-black tracking-[0.2em] text-white">
                                DETAILING GARAGE<span className="text-cyan-400">®</span>
                            </span>
                            <div className="text-[10px] print:text-[8px] uppercase tracking-[0.3em] font-mono text-cyan-400/80">
                                AUTOMOTIVE ENGINEERING INSPECTIONS
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-left md:text-right flex items-center md:block gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 print:px-2 print:py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] print:text-[8px] font-black uppercase tracking-[0.2em] mb-1 print:mb-0">
                        <Award className="w-3.5 h-3.5 print:w-2.5 print:h-2.5" /> 150+ POINT EV INSPECTION SYSTEM
                    </div>
                    <div className="text-xs print:text-[9px] italic text-gray-400 font-serif">
                        “Inspect Before You Accept.”
                    </div>
                </div>
            </div>

            {/* Hero Inspection Title & Visual */}
            <div className="relative z-10 my-8 py-4 print:my-2 print:py-1">
                <div className="text-[11px] print:text-[9px] font-mono font-bold uppercase tracking-[0.35em] text-cyan-400 mb-2 print:mb-1">
                    OFFICIAL DIAGNOSTIC CERTIFICATION
                </div>
                <h1 className="text-3xl md:text-5xl print:text-xl font-black uppercase tracking-tight text-white mb-3 print:mb-1">
                    EV PRE-DELIVERY <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">INSPECTION REPORT</span>
                </h1>
                <p className="text-sm md:text-base print:text-[10px] text-gray-400 max-w-2xl leading-relaxed print:line-clamp-1">
                    Comprehensive High-Voltage Battery Pack Analysis, OBD-II Multi-Module Live Telemetry, Digital Paint Depth Scan, Structural Chassis & Road Performance Evaluation.
                </p>

                {/* Status Stamp */}
                <div className="mt-5 print:mt-2 inline-block">
                    <div className={`px-5 py-2.5 print:px-3 print:py-1 rounded-xl print:rounded-lg border-2 ${resultLabel.border} ${resultLabel.bg} font-mono font-black text-xs md:text-sm print:text-xs tracking-widest`} style={{ color: resultLabel.color }}>
                        {resultLabel.text}
                    </div>
                </div>
            </div>

            {/* Metadata Engineering Block */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-4 print:gap-2 p-6 print:p-3 rounded-2xl print:rounded-xl bg-[#090c13]/90 border border-cyan-500/20 backdrop-blur-sm">
                <div className="space-y-1">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/70 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-cyan-400" /> Customer Name
                    </div>
                    <div className="text-sm font-black text-white">{meta.customerName || "—"}</div>
                    {meta.customerPhone && <div className="text-xs text-gray-400 font-mono">{meta.customerPhone}</div>}
                </div>

                <div className="space-y-1">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/70 flex items-center gap-1.5">
                        <Car className="w-3 h-3 text-cyan-400" /> Vehicle Model
                    </div>
                    <div className="text-sm font-black text-white">{meta.vehicleMake} {meta.vehicleModel}</div>
                    <div className="text-xs text-gray-400 font-mono">{meta.vehicleVariant || meta.vehicleYear || "EV Variant"} • {meta.vehicleColor || "N/A"}</div>
                </div>

                <div className="space-y-1">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/70 flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-cyan-400" /> VIN / Chassis
                    </div>
                    <div className="text-xs font-mono font-bold text-cyan-300 break-all">{meta.vin || "NOT PROVIDED"}</div>
                    <div className="text-[10px] text-gray-500 font-mono">Reg: {meta.registrationNumber || "NEW / UNREGISTERED"}</div>
                </div>

                <div className="space-y-1">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/70 flex items-center gap-1.5">
                        <Gauge className="w-3 h-3 text-cyan-400" /> Odometer
                    </div>
                    <div className="text-sm font-black text-white">{meta.odometer ? `${meta.odometer} km` : "Delivery Odo"}</div>
                    <div className="text-[10px] text-gray-500 font-mono">Motor ID: {meta.motorNumber || "VERIFIED"}</div>
                </div>

                <div className="space-y-1 pt-3 border-t border-white/5">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/70 flex items-center gap-1.5">
                        <Battery className="w-3 h-3 text-cyan-400" /> Battery Pack ID
                    </div>
                    <div className="text-xs font-mono font-bold text-gray-300">{meta.batteryId || "OEM MATCHED"}</div>
                </div>

                <div className="space-y-1 pt-3 border-t border-white/5">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/70 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-cyan-400" /> Dealership
                    </div>
                    <div className="text-xs font-bold text-gray-300">{meta.dealership || "Authorized OEM Dealer"}</div>
                </div>

                <div className="space-y-1 pt-3 border-t border-white/5">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/70 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-cyan-400" /> Inspection Date
                    </div>
                    <div className="text-xs font-mono font-bold text-gray-300">{formatDate(meta.inspectionDate)}</div>
                </div>

                <div className="space-y-1 pt-3 border-t border-white/5">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/70 flex items-center gap-1.5">
                        <Award className="w-3 h-3 text-cyan-400" /> PDI Professional
                    </div>
                    <div className="text-xs font-black text-cyan-300">{meta.inspectedBy || "Ritchie"} <span className="text-[9px] text-gray-500 font-mono">(Lead EV Eng.)</span></div>
                </div>
            </div>

            {/* Bottom Footer Line */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10 text-[10px] font-mono text-gray-500">
                <div>
                    DETAILING GARAGE® | Professional PDI Services | Himachal Pradesh
                </div>
                <div>
                    CONFIDENTIAL PRE-DELIVERY AUDIT • 150+ OEM VALIDATION CHECKPOINTS
                </div>
            </div>
        </div>
    )
}
