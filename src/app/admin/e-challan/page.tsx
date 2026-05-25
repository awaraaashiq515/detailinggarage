"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    FileWarning,
    Search,
    RotateCcw,
    Loader2,
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    Printer,
    Download,
    FileText,
    Car,
    Hash,
    Settings,
} from "lucide-react"

// Dynamic import for the PDF download button to avoid SSR issues
const ChallanDownloadButton = dynamic(() => import('@/components/admin/challan/ChallanDownloadButton'), {
    ssr: false,
    loading: () => (
        <Button size="sm" variant="outline" className="text-xs border-[#16acd4]/20 text-[#16acd4]">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Download PDF
        </Button>
    )
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChallanEntry {
    challan_number?: string
    challan_date?: string
    state?: string
    offense_details?: string
    accused_name?: string
    challan_place?: string
    challan_status?: string
    amount?: number
    fine_imposed?: number
    status?: string
}

interface ChallanData {
    total_challan?: number
    challan_list?: ChallanEntry[]
    fromCache?: boolean
    cachedAt?: string
    [key: string]: unknown
}

interface ApiResponse {
    success: boolean
    fromCache?: boolean
    cachedAt?: string
    data?: {
        status_code?: number
        message?: string
        data?: ChallanData
        total_challan?: number
        challan_list?: ChallanEntry[]
    }
    error?: string
}

// ─── State constants ───────────────────────────────────────────────────────────

const STATES = ["DL", "TS", "KA", "GJ", "MH", "RJ", "UP", "HR", "PB", "TN"]

const defaultForm = {
    rc_number: "",
    chassis_number: "",
    engine_number: "",
    state_only: false,
    state_portal: [] as string[],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
    const s = (status || "").toLowerCase()

    // Standardized Mapping Logic
    const isPaid = s.includes("paid") || s === "0" || s === "success"
    const isOnCourt = s.includes("court") || s.includes("challan to court")
    const isPending = !isPaid && !isOnCourt && (s.includes("pending") || s.includes("unpaid") || s.includes("un-paid") || s === "")

    if (isPaid) return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
            Paid
        </span>
    )

    if (isOnCourt) return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
            On Court
        </span>
    )

    return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Pending
        </span>
    )
}

function fmt(val?: number) {
    if (val === undefined || val === null) return "—"
    return `₹${Number(val).toLocaleString("en-IN")}`
}

function downloadCSV(challans: ChallanEntry[], rc: string) {
    const headers = ["State", "Challan No.", "Date", "Accused", "Offense", "Status", "Amount (₹)"]
    const rows = challans.map((c) => [
        c.state || "",
        c.challan_number || "",
        c.challan_date || "",
        c.accused_name || "",
        c.offense_details || "",
        c.challan_status || c.status || "",
        c.amount ?? "",
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `challans-${rc}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function EChallanPage() {
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ChallanData | null>(null)
    const [apiError, setApiError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.rc_number.trim()) e.rc_number = "RC Number is required"
        if (!form.chassis_number.trim()) e.chassis_number = "Chassis Number is required"
        if (!form.engine_number.trim()) e.engine_number = "Engine Number is required"
        setErrors(e)
        return Object.keys(e).length === 0
    }

    // ── Toggle state portal ───────────────────────────────────────────────────
    const toggleState = useCallback((state: string) => {
        setForm((prev) => {
            if (state === "ALL") {
                const allSelected = prev.state_portal.length === STATES.length
                return { ...prev, state_portal: allSelected ? [] : [...STATES] }
            }
            const next = prev.state_portal.includes(state)
                ? prev.state_portal.filter((s) => s !== state)
                : [...prev.state_portal, state]
            return { ...prev, state_portal: next }
        })
    }, [])

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const handleFetch = async (force: boolean = false) => {
        if (!validate()) return
        setLoading(true)
        setResult(null)
        setApiError(null)

        try {
            const res = await fetch("/api/admin/challan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rc_number: form.rc_number.trim().toUpperCase(),
                    chassis_number: form.chassis_number.trim().toUpperCase(),
                    engine_number: form.engine_number.trim().toUpperCase(),
                    state_only: form.state_only,
                    state_portal: form.state_portal,
                    force_refresh: force,
                }),
            })

            const json: ApiResponse = await res.json()

            if (!res.ok || !json.success) {
                setApiError(json.error || "Failed to fetch challan details")
                return
            }

            // Map data from the new structured response
            const challanData: ChallanData = {
                total_challan: json.data?.total_challan || json.data?.data?.total_challan || json.data?.challan_list?.length || 0,
                challan_list: json.data?.challan_list || json.data?.data?.challan_list || [],
                fromCache: json.fromCache,
                cachedAt: json.cachedAt
            }
            setResult(challanData)
        } catch {
            setApiError("Network error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setForm(defaultForm)
        setErrors({})
        setResult(null)
        setApiError(null)
    }

    // ── Challan list ──────────────────────────────────────────────────────────
    const challans: ChallanEntry[] = result?.challan_list || []
    const totalAmount = challans.reduce((s, c) => s + (Number(c.amount) || 0), 0)

    // Improved counting for Paid/Pending/On Court
    const paidCount = challans.filter((c) => {
        const s = (c.challan_status || c.status || "").toLowerCase()
        return s.includes("paid") || s === "0" || s === "success"
    }).length

    const courtCount = challans.filter((c) => {
        const s = (c.challan_status || c.status || "").toLowerCase()
        return s.includes("court")
    }).length

    const pendingCount = challans.length - paidCount - courtCount


    return (
        <div className="space-y-6">
            {/* ── Print Styles ────────────────────────────────────────────────── */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A4; margin: 1cm; }
                    body { background: white !important; color: black !important; }
                    .no-print, nav, aside, .sidebar-container, header, .card-header-actions { display: none !important; }
                    .print-section { display: block !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .print-only { display: block !important; }
                    .card { border: 1px solid #ddd !important; background: white !important; box-shadow: none !important; color: black !important; margin-bottom: 15px !important; }
                    .card-content { padding: 15px !important; }
                    table { border-collapse: collapse !important; width: 100% !important; }
                    th { background-color: #f3f4f6 !important; color: black !important; border: 1px solid #eee !important; font-size: 10px !important; padding: 8px !important; }
                    td { border: 1px solid #eee !important; color: black !important; font-size: 10px !important; padding: 8px !important; }
                    .status-badge { border: 1px solid #ccc !important; color: black !important; background: transparent !important; }
                    .summary-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 10px !important; }
                    .summary-item { border: 1px solid #eee !important; padding: 10px !important; flex-direction: column !important; align-items: flex-start !important; }
                    .summary-icon { display: none !important; }
                    h1, h2, h3, p, span { color: black !important; }
                    .text-white { color: black !important; }
                    .text-gray-400, .text-gray-500 { color: #666 !important; }
                }
                .print-only { display: none; }
            `}} />
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/10 border border-accent/20 text-accent">
                            <FileWarning className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">E-Challan Verification</h1>
                    </div>
                    <p className="text-sm pl-1 font-medium text-slate-500">
                        Verify vehicle challans via Surepass API
                    </p>
                </div>
                <a
                    href="/admin/settings#surepass"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-slate-50 font-bold text-slate-600 border-slate-200"
                >
                    <Settings className="w-3.5 h-3.5" />
                    API Settings
                </a>
            </div>

            {/* ── Professional Print Header ───────────────────────────────────── */}
            <div className="print-only mb-6 border-b-2 border-black pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Detailing<span className="text-[#16acd4]">Garage</span></h1>
                        <p className="text-xs font-bold text-gray-600">PREMIUM VEHICLE SERVICES & INSPECTION</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-bold">E-CHALLAN REPORT</h2>
                        <p className="text-[10px] text-gray-500">Report Generated: {mounted ? new Date().toLocaleString("en-IN") : ""}</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 border p-3 rounded-lg bg-gray-50">
                    <div>
                        <p className="text-[9px] uppercase text-gray-500 font-bold">RC Number</p>
                        <p className="text-sm font-bold">{form.rc_number || "—"}</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase text-gray-500 font-bold">Chassis Number</p>
                        <p className="text-sm font-bold">{form.chassis_number || "—"}</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase text-gray-500 font-bold">Engine Number</p>
                        <p className="text-sm font-bold">{form.engine_number || "—"}</p>
                    </div>
                </div>
            </div>

            {/* ── Form ───────────────────────────────────────────────────────── */}
            <Card className="no-print bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 py-5">
                    <CardTitle className="text-slate-900 text-base font-black uppercase tracking-widest flex items-center gap-2">
                        <Car className="w-5 h-5 text-accent" />
                        Vehicle Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 lg:space-y-8 p-6 lg:p-8">
                    {/* Required fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* RC Number */}
                        <div className="space-y-2">
                            <Label className="text-[11px] font-black tracking-widest uppercase text-slate-500 ml-1">
                                RC Number <span className="text-accent">*</span>
                            </Label>
                            <div className="relative">
                                <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="e.g. HR55AP0244"
                                    value={form.rc_number}
                                    onChange={(e) => {
                                        setForm((f) => ({ ...f, rc_number: e.target.value }))
                                        if (errors.rc_number) setErrors((er) => ({ ...er, rc_number: "" }))
                                    }}
                                    className={`h-12 pl-11 rounded-xl uppercase font-bold text-slate-900 bg-slate-50 placeholder:text-slate-400 placeholder:font-medium transition-all ${
                                        errors.rc_number ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-accent/40 focus:ring-accent/10"
                                    }`}
                                />
                            </div>
                            {errors.rc_number && (
                                <p className="text-xs text-red-500 font-bold ml-1 flex items-center gap-1.5 mt-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.rc_number}
                                </p>
                            )}
                        </div>

                        {/* Chassis Number */}
                        <div className="space-y-2">
                             <Label className="text-[11px] font-black tracking-widest uppercase text-slate-500 ml-1">
                                Chassis Number <span className="text-accent">*</span>
                            </Label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="e.g. MA3JMTB1SPB851591"
                                    value={form.chassis_number}
                                    onChange={(e) => {
                                        setForm((f) => ({ ...f, chassis_number: e.target.value }))
                                        if (errors.chassis_number) setErrors((er) => ({ ...er, chassis_number: "" }))
                                    }}
                                    className={`h-12 pl-11 rounded-xl uppercase font-bold text-slate-900 bg-slate-50 placeholder:text-slate-400 placeholder:font-medium transition-all ${
                                        errors.chassis_number ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-accent/40 focus:ring-accent/10"
                                    }`}
                                />
                            </div>
                            {errors.chassis_number && (
                                <p className="text-xs text-red-500 font-bold ml-1 flex items-center gap-1.5 mt-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.chassis_number}
                                </p>
                            )}
                        </div>

                        {/* Engine Number */}
                        <div className="space-y-2">
                             <Label className="text-[11px] font-black tracking-widest uppercase text-slate-500 ml-1">
                                Engine Number <span className="text-accent">*</span>
                            </Label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="e.g. K10CNC265773"
                                    value={form.engine_number}
                                    onChange={(e) => {
                                        setForm((f) => ({ ...f, engine_number: e.target.value }))
                                        if (errors.engine_number) setErrors((er) => ({ ...er, engine_number: "" }))
                                    }}
                                    className={`h-12 pl-11 rounded-xl uppercase font-bold text-slate-900 bg-slate-50 placeholder:text-slate-400 placeholder:font-medium transition-all ${
                                        errors.engine_number ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-accent/40 focus:ring-accent/10"
                                    }`}
                                />
                            </div>
                            {errors.engine_number && (
                                <p className="text-xs text-red-500 font-bold ml-1 flex items-center gap-1.5 mt-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.engine_number}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* State Only toggle */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div>
                            <p className="text-sm font-bold text-slate-900">State Only</p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">Restrict search to selected states only</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, state_only: !f.state_only }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${form.state_only ? 'bg-accent' : 'bg-slate-300'}`}
                        >
                            <span
                                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow"
                                style={{ transform: `translateX(${form.state_only ? "24px" : "4px"})` }}
                            />
                        </button>
                    </div>

                    {/* State Portal multi-select */}
                    <div className="space-y-3">
                         <Label className="text-[11px] font-black tracking-widest uppercase text-slate-500 ml-1">
                            State Portal <span className="font-medium normal-case tracking-normal ml-1">(select to filter by state)</span>
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {/* ALL button */}
                            <button
                                type="button"
                                onClick={() => toggleState("ALL")}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    form.state_portal.length === STATES.length
                                        ? "bg-accent text-white shadow-md shadow-accent/20 border-accent"
                                        : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                ALL
                            </button>
                            {STATES.map((s) => {
                                const active = form.state_portal.includes(s)
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => toggleState(s)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                            active
                                                ? "bg-accent text-white shadow-md shadow-accent/20 border-accent"
                                                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                        <Button
                            onClick={() => handleFetch(false)}
                            disabled={loading}
                            className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] text-white bg-accent hover:bg-accent/90 shadow-lg shadow-accent/25 hover:-translate-y-0.5 transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    CHECKING
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4 mr-2" />
                                    FETCH CHALLANS
                                </>
                            )}
                        </Button>
                        {result && (
                            <Button
                                onClick={() => handleFetch(true)}
                                variant="outline"
                                disabled={loading}
                                className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[11px] border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                            >
                                <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                FORCE REFRESH
                            </Button>
                        )}
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            disabled={loading}
                            className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[11px] border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 ml-auto"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            RESET
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── Cache Indicator ─────────────────────────────────────────────────── */}
            {result && (
                <div
                    className={`flex flex-wrap items-center justify-between p-4 rounded-2xl border shadow-sm no-print ${
                        result.fromCache ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {result.fromCache ? (
                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                Showing Saved Data
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                                <RotateCcw className="w-5 h-5 text-blue-600" />
                                Live Data from Surepass
                            </div>
                        )}
                        <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                            • {result.fromCache ? 'CREDIT SAVED' : 'CREDIT USED'}
                        </span>
                    </div>
                    {result.cachedAt && (
                        <p className="text-xs font-semibold text-slate-500">
                            Last checked: <span className="font-bold text-slate-700">{new Date(result.cachedAt).toLocaleString("en-IN")}</span>
                        </p>
                    )}
                </div>
            )}

            {/* ── Error State ─────────────────────────────────────────────────── */}
            {apiError && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-50 border border-red-200 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-red-800">API Error</p>
                        <p className="text-sm font-medium text-red-700 mt-1">{apiError}</p>
                        {apiError.includes("token not configured") && (
                            <a href="/admin/settings" className="text-xs font-bold underline text-red-600 mt-2 inline-block hover:text-red-500">
                                → Go to Settings to add your Surepass API token
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* ── Results ─────────────────────────────────────────────────────── */}
            {result && (
                <div className="space-y-6 print-section animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 summary-grid">
                        {[
                            {
                                label: "Total Challans",
                                value: result.total_challan ?? challans.length,
                                icon: FileWarning,
                                color: "text-slate-700",
                                bg: "bg-slate-100 border border-slate-200",
                            },
                            {
                                label: "Pending",
                                value: pendingCount,
                                icon: AlertTriangle,
                                color: "text-amber-600",
                                bg: "bg-amber-50 border border-amber-200",
                            },
                            {
                                label: "On Court",
                                value: courtCount,
                                icon: AlertCircle,
                                color: "text-red-600",
                                bg: "bg-red-50 border border-red-200",
                            },
                            {
                                label: "Paid",
                                value: paidCount,
                                icon: CheckCircle2,
                                color: "text-emerald-600",
                                bg: "bg-emerald-50 border border-emerald-200",
                            },
                            {
                                label: "Total Amount",
                                value: fmt(totalAmount),
                                icon: Hash,
                                color: "text-indigo-600",
                                bg: "bg-indigo-50 border border-indigo-200",
                            },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div
                                key={label}
                                className="p-5 rounded-2xl flex items-center gap-4 summary-item card bg-white border border-slate-200 shadow-sm"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 summary-icon ${bg}`}>
                                    <Icon className={`w-6 h-6 ${color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1 truncate">{label}</p>
                                    <p className="text-xl font-bold text-slate-900 truncate">{String(value)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table Card */}
                    <Card className="card bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 py-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <CardTitle className="text-slate-900 text-base font-black uppercase tracking-widest flex items-center">
                                    <FileText className="w-5 h-5 text-accent mr-2" />
                                    Challan Records
                                    {challans.length > 0 && (
                                        <span className="ml-3 text-xs px-2.5 py-1 rounded-lg font-bold bg-accent/10 border border-accent/20 text-accent">
                                            {challans.length} records
                                        </span>
                                    )}
                                </CardTitle>
                                {challans.length > 0 && (
                                    <div className="flex flex-wrap gap-2 no-print">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.print()}
                                            className="h-9 px-4 rounded-lg font-bold text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
                                        >
                                            <Printer className="w-4 h-4 mr-2" />
                                            Print
                                        </Button>

                                        {/* Professional PDF Download Component */}
                                        <ChallanDownloadButton
                                            vehicle={{
                                                rc: form.rc_number,
                                                chassis: form.chassis_number,
                                                engine: form.engine_number
                                            }}
                                            summary={{
                                                total: result.total_challan ?? challans.length,
                                                pending: pendingCount,
                                                paid: paidCount,
                                                court: courtCount,
                                                amount: fmt(totalAmount)
                                            }}
                                            challans={challans}
                                        />

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => downloadCSV(challans, form.rc_number)}
                                            className="h-9 px-4 rounded-lg font-bold text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            CSV
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {challans.length === 0 ? (
                                <div className="text-center py-16 px-6">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <p className="text-slate-900 font-bold text-lg">No Challans Found</p>
                                    <p className="text-sm font-medium mt-1 text-slate-500 max-w-sm mx-auto">
                                        This vehicle has no pending or paid challans associated with it across the checked states.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                {["State", "Challan No.", "Date", "Accused", "Offense", "Status", "Amount"].map((h) => (
                                                    <th
                                                        key={h}
                                                        className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap"
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {challans.map((c, i) => (
                                                <tr
                                                    key={i}
                                                    className="transition-colors hover:bg-slate-50 group"
                                                >
                                                    <td className="py-4 px-6">
                                                        <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                                                            {c.state || "—"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 font-bold font-mono text-slate-900 whitespace-nowrap">{c.challan_number || "—"}</td>
                                                    <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">{c.challan_date || "—"}</td>
                                                    <td className="py-4 px-6 text-slate-700 font-bold max-w-[150px] truncate" title={c.accused_name}>
                                                        {c.accused_name || "—"}
                                                    </td>
                                                    <td className="py-4 px-6 text-slate-500 font-medium max-w-[250px] truncate" title={c.offense_details}>
                                                        {c.offense_details || "—"}
                                                    </td>
                                                    <td className="py-4 px-6 whitespace-nowrap">
                                                        <StatusBadge status={c.challan_status || c.status} />
                                                    </td>
                                                    <td className="py-4 px-6 font-black text-slate-900 whitespace-nowrap">{fmt(c.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Print styles */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .print-section * { color: black !important; background: white !important; border-color: #ddd !important; }
                }
            `}</style>
        </div>
    )
}
