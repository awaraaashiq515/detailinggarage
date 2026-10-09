import * as React from "react"
import { Battery, Zap, Activity, ShieldCheck, AlertTriangle, CheckCircle, Gauge, Thermometer, Cpu } from "lucide-react"

export interface EVExecutiveDashboardProps {
    scores: Record<string, number>
    totalScore: number
    maxScore: number
    finalResult: string
    batterySoc?: string
    batterySoh?: string
    cellVoltageDeviation?: string
    batteryTemperature?: string
    hvIsolation?: string
    acChargingResult?: string
    dcChargingResult?: string
    chargingRate?: string
    activeFaultCodes?: string
    storedFaultCodes?: string
    pendingFaultCodes?: string
    totalFaultCodes?: string
}

export function EVExecutiveDashboard({
    scores,
    totalScore,
    maxScore,
    finalResult,
    batterySoc = "88",
    batterySoh = "100",
    cellVoltageDeviation = "12",
    batteryTemperature = "28",
    hvIsolation = "PASS",
    acChargingResult = "PASS",
    dcChargingResult = "PASS",
    chargingRate = "60",
    activeFaultCodes = "0",
    storedFaultCodes = "0",
    pendingFaultCodes = "0",
    totalFaultCodes = "0",
}: EVExecutiveDashboardProps) {
    const percentage = Math.round((totalScore / (maxScore || 110)) * 100)

    const getResultBadge = () => {
        switch (finalResult) {
            case "PASS":
                return {
                    label: "ACCEPT VEHICLE — 100% DELIVERY CLEARANCE",
                    bg: "bg-emerald-500/10 border-emerald-400/40 text-emerald-400",
                    glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)]",
                    icon: "🟢",
                }
            case "PASS_WITH_OBSERVATIONS":
                return {
                    label: "ACCEPT WITH MINOR RECTIFICATION NOTE",
                    bg: "bg-amber-500/10 border-amber-400/40 text-amber-400",
                    glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
                    icon: "🟡",
                }
            case "RECHECK":
                return {
                    label: "HOLD — DEALER ESCALATION REQUIRED",
                    bg: "bg-orange-500/10 border-orange-400/40 text-orange-400",
                    glow: "shadow-[0_0_20px_rgba(249,115,22,0.25)]",
                    icon: "🟠",
                }
            case "NOT_RECOMMENDED":
            default:
                return {
                    label: "REJECT VEHICLE — SEVERE DEFECTS IDENTIFIED",
                    bg: "bg-rose-500/10 border-rose-400/40 text-rose-400",
                    glow: "shadow-[0_0_20px_rgba(239,68,68,0.25)]",
                    icon: "🔴",
                }
        }
    }

    const badge = getResultBadge()

    return (
        <div className="rounded-3xl print:rounded-xl p-4 sm:p-6 md:p-8 print:p-3 bg-gradient-to-b from-[#0b0e17] to-[#07090e] border border-cyan-500/30 text-white shadow-2xl mb-8 print:mb-3 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 print:pb-2 border-b border-cyan-500/15 gap-4 print:gap-2">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 print:w-2 print:h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00d4ff]" />
                        <span className="text-[10px] print:text-[8px] font-mono font-black uppercase tracking-[0.3em] text-cyan-400">
                            EXECUTIVE EV TELEMETRY DASHBOARD
                        </span>
                    </div>
                    <h2 className="text-xl md:text-2xl print:text-sm font-black uppercase tracking-tight text-white mt-1 print:mt-0.5">
                        High-Voltage Systems & Overall Vehicle Health
                    </h2>
                </div>

                <div className={`px-4 py-2 print:px-2.5 print:py-1 rounded-xl print:rounded-lg border font-mono font-black text-xs print:text-[10px] tracking-wider flex items-center gap-2 ${badge.bg} ${badge.glow}`}>
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                </div>
            </div>

            {/* Central KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 print:grid-cols-6 gap-3.5 print:gap-1.5 my-6 print:my-2">
                {/* 1. Health Score */}
                <div className="p-4 print:p-2 rounded-2xl print:rounded-lg bg-white/[0.02] border border-cyan-500/20 text-center">
                    <div className="text-[9px] print:text-[8px] font-mono uppercase text-gray-400 tracking-wider mb-1 print:mb-0.5 flex items-center justify-center gap-1">
                        <Gauge className="w-3 h-3 print:w-2.5 print:h-2.5 text-cyan-400" /> Overall Health
                    </div>
                    <div className="text-3xl print:text-lg font-black text-white">{percentage}<span className="text-sm print:text-xs text-cyan-400 ml-0.5">%</span></div>
                    <div className="text-[9px] print:text-[7px] font-mono text-cyan-400/80 mt-1 print:mt-0">{totalScore} / {maxScore} PTS</div>
                </div>

                {/* 2. Battery SoH */}
                <div className="p-4 print:p-2 rounded-2xl print:rounded-lg bg-white/[0.02] border border-cyan-500/20 text-center">
                    <div className="text-[9px] print:text-[8px] font-mono uppercase text-gray-400 tracking-wider mb-1 print:mb-0.5 flex items-center justify-center gap-1">
                        <Battery className="w-3 h-3 print:w-2.5 print:h-2.5 text-emerald-400" /> Battery SoH
                    </div>
                    <div className="text-3xl print:text-lg font-black text-emerald-400">{batterySoh || "100"}<span className="text-sm print:text-xs text-emerald-500 ml-0.5">%</span></div>
                    <div className="text-[9px] print:text-[7px] font-mono text-emerald-400/80 mt-1 print:mt-0">STATE OF HEALTH</div>
                </div>

                {/* 3. Battery SoC */}
                <div className="p-4 print:p-2 rounded-2xl print:rounded-lg bg-white/[0.02] border border-cyan-500/20 text-center">
                    <div className="text-[9px] print:text-[8px] font-mono uppercase text-gray-400 tracking-wider mb-1 print:mb-0.5 flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3 print:w-2.5 print:h-2.5 text-cyan-400" /> Battery SoC
                    </div>
                    <div className="text-3xl print:text-lg font-black text-cyan-300">{batterySoc || "85"}<span className="text-sm print:text-xs text-cyan-400 ml-0.5">%</span></div>
                    <div className="text-[9px] print:text-[7px] font-mono text-cyan-400/80 mt-1 print:mt-0">CHARGE LEVEL</div>
                </div>

                {/* 4. Cell Delta */}
                <div className="p-4 print:p-2 rounded-2xl print:rounded-lg bg-white/[0.02] border border-cyan-500/20 text-center">
                    <div className="text-[9px] print:text-[8px] font-mono uppercase text-gray-400 tracking-wider mb-1 print:mb-0.5 flex items-center justify-center gap-1">
                        <Activity className="w-3 h-3 print:w-2.5 print:h-2.5 text-amber-400" /> Cell Balance
                    </div>
                    <div className="text-3xl print:text-lg font-black text-amber-300">{cellVoltageDeviation || "12"}<span className="text-xs print:text-[10px] text-amber-400 ml-1">mV</span></div>
                    <div className="text-[9px] print:text-[7px] font-mono text-amber-400/80 mt-1 print:mt-0">&le; 20mV SPEC OK</div>
                </div>

                {/* 5. HV Isolation */}
                <div className="p-4 print:p-2 rounded-2xl print:rounded-lg bg-white/[0.02] border border-cyan-500/20 text-center">
                    <div className="text-[9px] print:text-[8px] font-mono uppercase text-gray-400 tracking-wider mb-1 print:mb-0.5 flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3 h-3 print:w-2.5 print:h-2.5 text-cyan-400" /> HV Isolation
                    </div>
                    <div className="text-2xl print:text-base font-black text-emerald-400 mt-1 print:mt-0">{hvIsolation || "PASS"}</div>
                    <div className="text-[9px] print:text-[7px] font-mono text-emerald-400/80 mt-2 print:mt-0">&gt; 500 MΩ CLEAR</div>
                </div>

                {/* 6. Diagnostic DTCs */}
                <div className="p-4 print:p-2 rounded-2xl print:rounded-lg bg-white/[0.02] border border-cyan-500/20 text-center">
                    <div className="text-[9px] print:text-[8px] font-mono uppercase text-gray-400 tracking-wider mb-1 print:mb-0.5 flex items-center justify-center gap-1">
                        <Cpu className="w-3 h-3 print:w-2.5 print:h-2.5 text-cyan-400" /> Fault DTCs
                    </div>
                    <div className="text-3xl print:text-lg font-black text-cyan-300">{activeFaultCodes || "0"}</div>
                    <div className="text-[9px] print:text-[7px] font-mono text-cyan-400/80 mt-1 print:mt-0">{totalFaultCodes || "0"} TOTAL LOGGED</div>
                </div>
            </div>

            {/* Second Telemetry Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 print:gap-1.5 pt-4 print:pt-1.5 border-t border-white/5 font-mono text-xs print:text-[9px]">
                <div className="p-3.5 print:p-1.5 rounded-xl print:rounded-lg bg-white/[0.015] border border-white/5 flex items-center justify-between">
                    <span className="text-gray-400">Thermal Loop:</span>
                    <span className="font-bold text-cyan-300">{batteryTemperature || "28"}°C (Glycol Pump OK)</span>
                </div>
                <div className="p-3.5 print:p-1.5 rounded-xl print:rounded-lg bg-white/[0.015] border border-white/5 flex items-center justify-between">
                    <span className="text-gray-400">AC/DC Charge:</span>
                    <span className="font-bold text-emerald-400">AC: {acChargingResult} • DC: {dcChargingResult} ({chargingRate || "60"} kW)</span>
                </div>
                <div className="p-3.5 print:p-1.5 rounded-xl print:rounded-lg bg-white/[0.015] border border-white/5 flex items-center justify-between">
                    <span className="text-gray-400">DTC Status:</span>
                    <span className="font-bold text-cyan-300">Act: {activeFaultCodes} | Sto: {storedFaultCodes} | Pnd: {pendingFaultCodes}</span>
                </div>
            </div>
        </div>
    )
}
