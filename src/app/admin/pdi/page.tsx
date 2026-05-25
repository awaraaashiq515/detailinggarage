"use client"

import * as React from "react"
import { ClipboardCheck, Plus, Search, Filter, Settings, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PDIPage() {
    const [inspections, setInspections] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    const fetchInspections = async () => {
        try {
            const res = await fetch('/api/admin/pdi/list')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setInspections(data)
        } catch (error) {
            console.error("Failed to load inspections:", error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchInspections()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED": return { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981" }
            case "IN_PROGRESS": return { bg: "rgba(255, 75, 85, 0.1)", text: "#ff4b55" }
            case "PENDING": return { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6" }
            default: return { bg: "rgba(100, 116, 139, 0.1)", text: "#64748b" }
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        } catch (e) {
            return dateString
        }
    }

    return (
        <div className="space-y-6 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                            <ClipboardCheck className="w-6 h-6 text-accent" />
                        </div>
                        PDI Inspections
                    </h2>
                    <p className="mt-1 text-slate-500 font-medium text-sm">Manage Pre-Delivery Inspections</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/pdi/settings">
                        <button
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm"
                        >
                            <Settings className="w-5 h-5" />
                            Settings
                        </button>
                    </Link>
                    <Link href="/admin/pdi/new">
                        <button
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all hover:translate-y-[-2px] bg-accent text-white shadow-lg shadow-accent/30 active:translate-y-0"
                        >
                            <Plus className="w-4 h-4" />
                            New Inspection
                        </button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by VIN, vehicle, or customer..."
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-accent/40 focus:ring-4 focus:ring-accent/5 text-slate-900 placeholder-slate-400"
                    />
                </div>
                <button
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl transition-all hover:bg-slate-50 border border-slate-100 text-slate-600 font-bold text-sm shadow-sm"
                >
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-accent" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading inspections...</p>
                        </div>
                    ) : inspections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                            <div className="w-16 h-16 rounded-[2rem] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center mb-6">
                                <ClipboardCheck className="w-8 h-8 text-slate-200" />
                            </div>
                            <h3 className="text-slate-900 font-extrabold text-xl tracking-tight">No Inspections Found</h3>
                            <p className="text-slate-500 max-w-xs mt-2 text-sm">Start by creating your first Pre-Delivery Inspection report.</p>
                            <Link href="/pdi/create" className="mt-8">
                                <Button className="bg-accent hover:bg-accent/90 text-white font-black px-8 h-12 rounded-2xl shadow-lg shadow-accent/20 transition-all uppercase tracking-widest text-[10px]">
                                    Create Inspection
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">VIN</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {inspections.map((inspection, index) => {
                                    const statusColor = getStatusColor(inspection.status)
                                    return (
                                        <tr
                                            key={inspection.id}
                                            className="transition-colors hover:bg-slate-50/50 group"
                                        >
                                            <td className="px-6 py-5 text-sm text-slate-500 font-bold font-mono tracking-tight">{formatDate(inspection.inspectionDate)}</td>
                                            <td className="px-6 py-5">
                                                <div className="text-slate-900 font-extrabold text-sm group-hover:text-accent transition-colors">
                                                    {inspection.vehicleMake} {inspection.vehicleModel}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{inspection.vehicleYear}</div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-bold font-mono text-slate-400">{inspection.vin || 'N/A'}</td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-slate-900">{inspection.customerName}</div>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Contract Holder</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span
                                                    className="px-3 py-1.5 rounded-full text-[9px] font-black tracking-[0.1em] uppercase border"
                                                    style={{
                                                        backgroundColor: statusColor.bg,
                                                        color: statusColor.text,
                                                        borderColor: `${statusColor.text}20`
                                                    }}
                                                >
                                                    {inspection.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Link href={`/admin/pdi/view/${inspection.id}`}>
                                                    <button className="px-4 py-2 bg-slate-50 hover:bg-accent/10 rounded-xl text-slate-400 hover:text-accent transition-all border border-slate-100 font-black text-[9px] uppercase tracking-widest shadow-sm">
                                                        View Report
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
