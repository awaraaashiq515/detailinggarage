import * as React from "react"

// ── 1. Futuristic EV Battery Pack Technical Diagram ──────────────────────────
export function EVBatteryDiagram({
    soc = "85",
    soh = "99",
    cellDelta = "12",
    temp = "28",
    isolation = "PASS",
}: {
    soc?: string
    soh?: string
    cellDelta?: string
    temp?: string
    isolation?: string
}) {
    return (
        <div className="rounded-2xl p-5 bg-[#07090e] border border-cyan-500/20 text-white relative overflow-hidden">
            {/* Tech Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/15">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00d4ff]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                        HV LI-ION ARCHITECTURE // BMS DIAGNOSTIC TELEMETRY
                    </span>
                </div>
                <span className="text-[9px] font-mono text-cyan-400/60 uppercase">
                    400V / 800V COMPLIANT
                </span>
            </div>

            {/* SVG Battery Schematic */}
            <div className="w-full my-3 flex justify-center">
                <svg viewBox="0 0 800 240" className="w-full max-w-2xl h-auto" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="battGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#0055ff" stopOpacity="0.08" />
                        </linearGradient>
                        <linearGradient id="cellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#0066cc" stopOpacity="0.4" />
                        </linearGradient>
                        <linearGradient id="hvBus" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ff5500" />
                            <stop offset="100%" stopColor="#ffaa00" />
                        </linearGradient>
                        <pattern id="diagGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,212,255,0.05)" strokeWidth="1" />
                        </pattern>
                    </defs>

                    {/* Outer Casing */}
                    <rect x="20" y="20" width="760" height="200" rx="16" fill="#0d111a" stroke="#00d4ff" strokeWidth="2" strokeOpacity="0.4" />
                    <rect x="24" y="24" width="752" height="192" rx="12" fill="url(#diagGrid)" />

                    {/* HV Terminals / Positive & Negative Busbars */}
                    <path d="M 40 40 L 160 40 L 160 55 L 40 55 Z" fill="url(#hvBus)" />
                    <text x="45" y="52" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="monospace">+ HV BUSBAR (+400V)</text>
                    <path d="M 640 40 L 760 40 L 760 55 L 640 55 Z" fill="#00d4ff" fillOpacity="0.8" />
                    <text x="645" y="52" fill="#000" fontSize="10" fontWeight="bold" fontFamily="monospace">- HV GROUND BUS</text>

                    {/* Battery Modules (12 Modules Grid) */}
                    {[0, 1, 2, 3, 4, 5].map(col => (
                        <g key={col}>
                            {/* Top row */}
                            <rect x={50 + col * 120} y="75" width="105" height="55" rx="6" fill="url(#battGrad)" stroke="#00d4ff" strokeWidth="1.2" strokeOpacity="0.5" />
                            <text x={60 + col * 120} y="95" fill="#00d4ff" fontSize="9" fontWeight="bold" fontFamily="monospace">MOD-0{col + 1}</text>
                            <rect x={60 + col * 120} y="105" width="85" height="12" rx="2" fill="#000" stroke="#00d4ff" strokeWidth="0.5" />
                            <rect x={62 + col * 120} y="107" width="75" height="8" rx="1" fill="url(#cellGrad)" />

                            {/* Bottom row */}
                            <rect x={50 + col * 120} y="145" width="105" height="55" rx="6" fill="url(#battGrad)" stroke="#00d4ff" strokeWidth="1.2" strokeOpacity="0.5" />
                            <text x={60 + col * 120} y="165" fill="#00d4ff" fontSize="9" fontWeight="bold" fontFamily="monospace">MOD-0{col + 7}</text>
                            <rect x={60 + col * 120} y="175" width="85" height="12" rx="2" fill="#000" stroke="#00d4ff" strokeWidth="0.5" />
                            <rect x={62 + col * 120} y="177" width="78" height="8" rx="1" fill="url(#cellGrad)" />
                        </g>
                    ))}

                    {/* Central BMS Controller Box */}
                    <rect x="340" y="90" width="120" height="60" rx="8" fill="#002244" stroke="#00d4ff" strokeWidth="2" />
                    <text x="400" y="115" textAnchor="middle" fill="#00d4ff" fontSize="11" fontWeight="900" fontFamily="sans-serif">BMS ECU</text>
                    <text x="400" y="130" textAnchor="middle" fill="#99e6ff" fontSize="8" fontFamily="monospace">DUAL-CAN NODE</text>
                    <circle cx="355" cy="100" r="3" fill="#00ff88" />
                    <circle cx="365" cy="100" r="3" fill="#00d4ff" />

                    {/* Liquid Cooling Flow Path */}
                    <path d="M 45 208 L 755 208" stroke="#00d4ff" strokeWidth="3" strokeDasharray="6 4" strokeOpacity="0.7" />
                    <text x="400" y="217" textAnchor="middle" fill="#00d4ff" fontSize="8" fontFamily="monospace" letterSpacing="2">
                        ← CLOSED-LOOP GLYCOL THERMAL JACKET ACTIVE →
                    </text>
                </svg>
            </div>

            {/* Live Metrics Quick Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-3 border-t border-cyan-500/15 text-center font-mono">
                <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">State of Charge</div>
                    <div className="text-xl font-black text-cyan-400">{soc || "85"}%</div>
                </div>
                <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">State of Health</div>
                    <div className="text-xl font-black text-emerald-400">{soh || "99"}%</div>
                </div>
                <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Cell Max Delta</div>
                    <div className="text-xl font-black text-amber-400">{cellDelta || "12"}<span className="text-xs text-gray-400 ml-1">mV</span></div>
                </div>
                <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Pack Temp</div>
                    <div className="text-xl font-black text-cyan-300">{temp || "28"}<span className="text-xs text-gray-400 ml-1">°C</span></div>
                </div>
                <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">HV Isolation</div>
                    <div className={`text-xl font-black ${isolation === "PASS" ? "text-emerald-400" : "text-rose-400"}`}>
                        {isolation || "PASS"}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── 2. EV Charging System Infographic ─────────────────────────────────────────
export function EVChargingInfographic({
    acStatus = "PASS",
    dcStatus = "PASS",
    chargingRate = "60",
}: {
    acStatus?: string
    dcStatus?: string
    chargingRate?: string
}) {
    return (
        <div className="rounded-2xl p-5 bg-[#07090e] border border-cyan-500/20 text-white relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/15">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                    CHARGING POWER FLOW // AC TYPE-2 & DC CCS2 PROTOCOL
                </span>
                <span className="text-[9px] font-mono text-cyan-400/60 uppercase">
                    OBC 11KW / DC 150KW PEAK
                </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* AC Charging Path */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 relative">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">AC Charging Circuit (Type-2)</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${acStatus === "PASS" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300"}`}>
                            {acStatus}
                        </span>
                    </div>
                    {/* Schematic Flow */}
                    <div className="flex items-center justify-between text-center font-mono text-[10px] gap-2 py-3">
                        <div className="bg-black/60 p-2.5 rounded-lg border border-cyan-500/30 flex-1">
                            <div className="text-[8px] text-gray-400">GRID / EVSE</div>
                            <div className="font-bold text-cyan-300 mt-1">230V / 415V</div>
                        </div>
                        <span className="text-cyan-400 font-bold">➔</span>
                        <div className="bg-black/60 p-2.5 rounded-lg border border-cyan-500/30 flex-1">
                            <div className="text-[8px] text-gray-400">OBC CONVERTER</div>
                            <div className="font-bold text-amber-300 mt-1">AC ➔ DC</div>
                        </div>
                        <span className="text-cyan-400 font-bold">➔</span>
                        <div className="bg-black/60 p-2.5 rounded-lg border border-cyan-500/30 flex-1">
                            <div className="text-[8px] text-gray-400">HV PACK</div>
                            <div className="font-bold text-emerald-300 mt-1">400V DC</div>
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2 font-sans">
                        • CP/PP pilot communication verified • Solenoid lock engaged • ICCB ground pin ok
                    </div>
                </div>

                {/* DC Fast Charging Path */}
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 relative">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-blue-400 uppercase tracking-wider">DC Fast Charging Circuit (CCS2)</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${dcStatus === "PASS" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300"}`}>
                            {dcStatus}
                        </span>
                    </div>
                    {/* Schematic Flow */}
                    <div className="flex items-center justify-between text-center font-mono text-[10px] gap-2 py-3">
                        <div className="bg-black/60 p-2.5 rounded-lg border border-blue-500/30 flex-1">
                            <div className="text-[8px] text-gray-400">DC FAST EVSE</div>
                            <div className="font-bold text-blue-300 mt-1">50-350 kW</div>
                        </div>
                        <span className="text-blue-400 font-bold">➔</span>
                        <div className="bg-black/60 p-2.5 rounded-lg border border-blue-500/30 flex-1">
                            <div className="text-[8px] text-gray-400">PLC CONTROLLER</div>
                            <div className="font-bold text-amber-300 mt-1">DIN 70121</div>
                        </div>
                        <span className="text-blue-400 font-bold">➔</span>
                        <div className="bg-black/60 p-2.5 rounded-lg border border-blue-500/30 flex-1">
                            <div className="text-[8px] text-gray-400">HV CONTACTORS</div>
                            <div className="font-bold text-emerald-300 mt-1">DIRECT DC</div>
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2 font-sans flex items-center justify-between">
                        <span>• High-current thermal sensors PASS • Handshake verified</span>
                        <span className="font-mono font-bold text-cyan-300">Rate: {chargingRate || "—"} kW</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── 3. Exploded Electric Motor & Drivetrain Graphic ───────────────────────────
export function EVMotorDrivetrainGraphic() {
    return (
        <div className="rounded-2xl p-5 bg-[#07090e] border border-cyan-500/20 text-white relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/15">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                    ELECTRIC DRIVE UNIT (EDU) // PERMANENT MAGNET SYNCHRONOUS MOTOR (PMSM)
                </span>
                <span className="text-[9px] font-mono text-cyan-400/60 uppercase">
                    SINGLE-SPEED REDUCTION + REGEN INTEGRATION
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-center">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-cyan-500/15">
                    <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-xs mb-2">
                        01
                    </div>
                    <div className="text-xs font-bold text-white mb-1">IGBT / SiC Inverter</div>
                    <div className="text-[9px] text-gray-400 leading-tight">Converts DC to 3-Phase AC with zero ripple</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-cyan-500/15">
                    <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-xs mb-2">
                        02
                    </div>
                    <div className="text-xs font-bold text-white mb-1">Stator & Rotor Core</div>
                    <div className="text-[9px] text-gray-400 leading-tight">Liquid-cooled jacket, zero bearing whine</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-cyan-500/15">
                    <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-xs mb-2">
                        03
                    </div>
                    <div className="text-xs font-bold text-white mb-1">Reduction Gearbox</div>
                    <div className="text-[9px] text-gray-400 leading-tight">Helical gears, zero seal leakage, correct oil level</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-cyan-500/15">
                    <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-xs mb-2">
                        04
                    </div>
                    <div className="text-xs font-bold text-white mb-1">Regen Braking Unit</div>
                    <div className="text-[9px] text-gray-400 leading-tight">Reverse torque generation, smooth brake blending</div>
                </div>
            </div>
        </div>
    )
}

// ── 4. Technical Underbody & High-Voltage Warning Graphic ─────────────────────
export function EVUnderbodyGraphic() {
    return (
        <div className="rounded-2xl p-5 bg-[#07090e] border border-amber-500/30 text-white relative">
            {/* Warning Banner */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-4 text-amber-300">
                <span className="text-xl">⚠️</span>
                <div>
                    <div className="text-xs font-black uppercase tracking-wider">
                        HIGH-VOLTAGE COMPONENTS — INSPECTION BY TRAINED PERSONNEL ONLY
                    </div>
                    <div className="text-[10px] text-amber-200/70">
                        Never touch orange cables or high-voltage junction boxes without de-energization verification and CAT IV 1000V rated PPE.
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3 font-mono text-[11px]">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-cyan-400 font-bold mb-1">🛡️ Flat Undertray Armor</div>
                    <div className="text-gray-400 text-[10px]">Reinforced ballistic shielding protecting Li-ion battery pouch/prismatic cells from road debris.</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-cyan-400 font-bold mb-1">⚡ Orange HV Conduits</div>
                    <div className="text-gray-400 text-[10px]">Dual-insulated cables securely clipped, zero chafing, zero pinches, zero connector play.</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-cyan-400 font-bold mb-1">💧 Sealed Coolant Manifolds</div>
                    <div className="text-gray-400 text-[10px]">Die-cast quick connectors, factory witness marks intact, zero pressure drop.</div>
                </div>
            </div>
        </div>
    )
}

// ── 5. Digital Paint Thickness Gauge (DFT) Graphic ────────────────────────────
export function EVPaintGaugeIllustration({ readings }: { readings?: any[] }) {
    const avgMicrons = readings?.length
        ? Math.round(
            readings.reduce((sum, r) => sum + (parseFloat(r.reading) || 110), 0) / readings.length
        )
        : 112

    return (
        <div className="rounded-2xl p-5 bg-[#07090e] border border-cyan-500/20 text-white relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/15">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                        DIGITAL PAINT THICKNESS GAUGE (DFT) // HIGH-PRECISION ULTRASONIC TEST
                    </span>
                </div>
                <span className="text-[9px] font-mono text-cyan-400/60 uppercase">
                    OEM FACTORY RANGE: 90 - 145 µm
                </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Visual Gauge Device */}
                <div className="w-48 h-36 rounded-2xl bg-gradient-to-b from-gray-900 to-black border-2 border-cyan-400/40 p-3 flex flex-col justify-between shadow-[0_0_20px_rgba(0,212,255,0.15)] shrink-0">
                    <div className="flex justify-between items-center text-[8px] font-mono text-cyan-400">
                        <span>DETAILING GARAGE®</span>
                        <span>DFT-PRO</span>
                    </div>
                    <div className="bg-[#001824] rounded-lg p-2 border border-cyan-400/50 text-center font-mono">
                        <div className="text-[8px] text-cyan-400/70">AVERAGE COATING</div>
                        <div className="text-2xl font-black text-cyan-300 tracking-tight">{avgMicrons} <span className="text-xs text-cyan-400">µm</span></div>
                        <div className="text-[8px] text-emerald-400 font-bold">● OEM FACTORY SPEC</div>
                    </div>
                    <div className="flex justify-around text-[8px] font-mono text-gray-500">
                        <span>NFe / Fe PROBE</span>
                        <span>CALIBRATED</span>
                    </div>
                </div>

                {/* Explanatory Spec Strip */}
                <div className="flex-1 space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400">Factory Clear Coat + Base Coat</span>
                        <span className="text-cyan-400 font-bold">90 – 140 µm (PASS)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400">Minor Localized Touch-Up</span>
                        <span className="text-amber-400 font-bold">141 – 190 µm (OBSERVATION)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-gray-400">Body Filler / Heavy Respray</span>
                        <span className="text-rose-400 font-bold">&gt; 200 µm (FAIL)</span>
                    </div>
                    <div className="text-[10px] text-gray-500 pt-1 font-sans">
                        All 16 structural steel and aluminum body panels scanned with dual ferrous & non-ferrous ultrasonic magnetic probe.
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── 6. ADAS Radar & Camera Sensor Schematic ───────────────────────────────────
export function EVADASSensorGraphic() {
    return (
        <div className="rounded-2xl p-5 bg-[#07090e] border border-emerald-500/20 text-white relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-500/15">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
                    ADAS SENSOR CONES // 77GHZ MILLIMETER-WAVE RADAR & TRI-FOCAL OPTICS
                </span>
                <span className="text-[9px] font-mono text-emerald-400/60 uppercase">
                    LEVEL 2+ ACTIVE SAFETY
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-emerald-500/20">
                    <div className="text-emerald-400 text-lg mb-1">📡</div>
                    <div className="font-bold text-white text-[11px]">77GHz Forward Radar</div>
                    <div className="text-[9px] text-gray-400 mt-1">200m range, AEB & Adaptive Cruise calibration ok</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-emerald-500/20">
                    <div className="text-emerald-400 text-lg mb-1">👁️</div>
                    <div className="font-bold text-white text-[11px]">Windshield Camera</div>
                    <div className="text-[9px] text-gray-400 mt-1">Lane keep assist & speed sign optical recognition</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-emerald-500/20">
                    <div className="text-emerald-400 text-lg mb-1">🔄</div>
                    <div className="font-bold text-white text-[11px]">360° Surround Cameras</div>
                    <div className="text-[9px] text-gray-400 mt-1">Front, rear, and mirror cameras alignment & stitching</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-emerald-500/20">
                    <div className="text-emerald-400 text-lg mb-1">📶</div>
                    <div className="font-bold text-white text-[11px]">Ultrasonic Sonar Array</div>
                    <div className="text-[9px] text-gray-400 mt-1">12-sensor park distance sensors flush & zero fault</div>
                </div>
            </div>
        </div>
    )
}
