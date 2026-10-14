"use client"

import { useState, useEffect } from "react"
import {
    DollarSign, Award, Calendar, CheckCircle2,
    Clock, RefreshCw, Car, ChevronRight, FileText,
    ArrowUpRight
} from "lucide-react"

export default function StaffEarningsPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchEarnings = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/staff/earnings")
            if (res.ok) {
                const result = await res.json()
                if (result.success) {
                    setData(result)
                }
            }
        } catch (err) {
            console.error("Earnings fetch error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEarnings()
    }, [])

    if (loading && !data) {
        return (
            <div className="py-24 flex flex-col items-center justify-center text-zinc-500">
                <RefreshCw className="w-8 h-8 animate-spin text-[#16acd4] mb-3" />
                <p className="text-xs font-bold uppercase tracking-wider">Loading earnings & commissions...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-[#c084fc]" />
                    <span>My Earnings & Job Commissions</span>
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                    Complete breakdown of your base salary, pro-rata days, and car repair commissions
                </p>
            </div>

            {/* Earnings Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Base Salary Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-[#15151c] to-[#111114] border border-white/10 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Estimated Base Salary</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        ₹{(data?.salary?.estimatedSalaryEarned || 0).toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-zinc-400 mt-2 space-y-0.5">
                        <p>Based on <b className="text-white">{data?.salary?.currentMonthDays || 0} payable days</b> this month</p>
                        <p className="text-[11px] text-zinc-500">Rate: ₹{(data?.salary?.rate || 0).toLocaleString("en-IN")} ({data?.salary?.type})</p>
                    </div>
                </div>

                {/* Pending Commission */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-[#171510] to-[#12110c] border border-amber-500/20 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Pending Commissions</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                        ₹{(data?.commissions?.pendingTotal || 0).toLocaleString("en-IN")}
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">
                        Earned from completed vehicle jobs awaiting settlement
                    </p>
                </div>

                {/* Paid Commissions */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-[#101713] to-[#0c120e] border border-emerald-500/20 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Paid Out Commissions</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                        ₹{(data?.commissions?.paidTotal || 0).toLocaleString("en-IN")}
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">
                        Successfully transferred & cleared by shop owner
                    </p>
                </div>
            </div>

            {/* Vehicle Job Commission Ledger */}
            <div className="rounded-3xl bg-[#121216] border border-white/10 overflow-hidden shadow-xl">
                <div className="p-4 sm:p-5 border-b border-white/8 bg-[#15151a] flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                            Vehicle Job Commission Ledger
                        </h3>
                        <p className="text-[11px] text-zinc-400">Commissions earned per car serviced in the workshop</p>
                    </div>
                    <span className="text-xs font-bold text-zinc-400">
                        {data?.commissions?.items?.length || 0} Entries
                    </span>
                </div>

                {!data?.commissions?.items || data.commissions.items.length === 0 ? (
                    <div className="py-16 text-center p-6 text-zinc-500">
                        <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-bold">No commission entries recorded yet.</p>
                        <p className="text-[11px] text-zinc-600 max-w-xs mx-auto mt-1">
                            When vehicle invoices are completed with your staff name assigned, your commissions will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {data.commissions.items.map((item: any) => (
                            <div key={item.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {item.invoice?.vehicleRegNo && (
                                            <span className="font-mono font-bold text-xs bg-amber-400 text-black px-2 py-0.5 rounded">
                                                {item.invoice.vehicleRegNo}
                                            </span>
                                        )}
                                        <span className="font-bold text-sm text-white">
                                            {item.invoice?.vehicleName || "Vehicle Service"}
                                        </span>
                                        {item.invoice?.invoiceNumber && (
                                            <span className="font-mono text-xs text-zinc-500">
                                                INV: #{item.invoice.invoiceNumber}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                                        <span>Customer: <b className="text-zinc-300">{item.invoice?.client?.name || "Client"}</b></span>
                                        {item.invoice?.grandTotal && (
                                            <span>Bill Amount: <b className="text-zinc-300">₹{item.invoice.grandTotal.toLocaleString("en-IN")}</b></span>
                                        )}
                                        {item.rate > 0 && (
                                            <span>Rate: <b className="text-purple-400">{item.rate}%</b></span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                                    <div>
                                        <div className="font-black text-base text-white">
                                            ₹{item.amount.toLocaleString("en-IN")}
                                        </div>
                                        <div className="text-[10px] text-zinc-500">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : ""}
                                        </div>
                                    </div>

                                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                                        item.status === "PAID"
                                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                    }`}>
                                        {item.status === "PAID" ? "Paid Out" : "Pending"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
