"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Wrench, Car, Search, Plus, Filter,
    CheckCircle2, Clock, AlertCircle, Phone,
    ArrowRight, ChevronRight, RefreshCw, X,
    Calendar, Check, Sparkles, AlertTriangle
} from "lucide-react"

export default function StaffJobsPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [counts, setCounts] = useState<any>({ all: 0, assigned: 0, inProgress: 0, completed: 0 })
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [searchQuery, setSearchQuery] = useState("")

    // New Job Modal
    const [showNewJobModal, setShowNewJobModal] = useState(false)
    const [creatingJob, setCreatingJob] = useState(false)
    const [jobForm, setJobForm] = useState({
        vehicleName: "",
        vehicleRegNo: "",
        vehicleChassis: "",
        odometer: "",
        clientName: "",
        clientPhone: "",
        jobCategory: "DETAILING",
        priority: "NORMAL",
        workSummary: "",
        commissionAmount: "0"
    })

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (statusFilter !== "ALL") params.set("status", statusFilter)
            if (searchQuery) params.set("search", searchQuery)

            const res = await fetch(`/api/staff/jobs?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setJobs(data.jobs || [])
                    setCounts(data.counts || { all: 0, assigned: 0, inProgress: 0, completed: 0 })
                }
            } else {
                console.warn("fetchJobs failed with status:", res.status)
            }
        } catch (err) {
            console.error("Error fetching jobs:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [statusFilter, searchQuery])

    // Quick status update from card
    const handleQuickStatus = async (jobId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/staff/jobs/${jobId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })
            const data = await res.json()
            if (data.success) {
                fetchJobs()
            }
        } catch (err) {
            console.error("Status update error:", err)
        }
    }

    // Create New Job
    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!jobForm.vehicleName || !jobForm.vehicleRegNo) return

        try {
            setCreatingJob(true)
            const res = await fetch("/api/staff/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jobForm)
            })
            const data = await res.json()
            if (data.success) {
                setShowNewJobModal(false)
                setJobForm({
                    vehicleName: "",
                    vehicleRegNo: "",
                    vehicleChassis: "",
                    odometer: "",
                    clientName: "",
                    clientPhone: "",
                    jobCategory: "DETAILING",
                    priority: "NORMAL",
                    workSummary: "",
                    commissionAmount: "0"
                })
                fetchJobs()
            } else {
                alert(data.error || "Failed to create job card")
            }
        } catch (err) {
            console.error("Create job error:", err)
        } finally {
            setCreatingJob(false)
        }
    }

    const parseChecklistProgress = (checklistStr: string | null) => {
        if (!checklistStr) return { total: 0, done: 0, percent: 0 }
        try {
            const items = JSON.parse(checklistStr)
            if (!Array.isArray(items) || items.length === 0) return { total: 0, done: 0, percent: 0 }
            const done = items.filter((i: any) => i.isDone).length
            return {
                total: items.length,
                done,
                percent: Math.round((done / items.length) * 100)
            }
        } catch {
            return { total: 0, done: 0, percent: 0 }
        }
    }

    return (
        <div className="space-y-6">
            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                        <Car className="w-6 h-6 text-[#16acd4]" />
                        <span>Assigned Vehicle Jobs</span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Track vehicles in the workshop bay, check off repair tasks & log work details
                    </p>
                </div>

                <button
                    onClick={() => setShowNewJobModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#16acd4] hover:bg-[#139cb8] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#16acd4]/20 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>Open New Job Card</span>
                </button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#121216] border border-white/8">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    {[
                        { id: "ALL", label: "All Vehicles", count: counts.all },
                        { id: "IN_PROGRESS", label: "In Progress", count: counts.inProgress, color: "#16acd4" },
                        { id: "ASSIGNED", label: "Pending", count: counts.assigned, color: "#fbbf24" },
                        { id: "COMPLETED", label: "Completed", count: counts.completed, color: "#34d399" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                statusFilter === tab.id
                                    ? "bg-[#16acd4]/20 text-[#16acd4] border border-[#16acd4]/40"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                                statusFilter === tab.id ? "bg-[#16acd4] text-black" : "bg-white/10 text-zinc-400"
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[240px]">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by car, number, customer..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#17171d] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                    />
                </div>
            </div>

            {/* Jobs List Grid */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                    <RefreshCw className="w-7 h-7 animate-spin text-[#16acd4] mb-3" />
                    <p className="text-xs font-bold uppercase tracking-wider">Loading vehicle jobs...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-[#121216] border border-white/8 p-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 text-zinc-500 flex items-center justify-center mx-auto mb-4">
                        <Car className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">No Vehicle Jobs Found</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
                        {searchQuery || statusFilter !== "ALL"
                            ? "Try clearing your search query or switching tabs."
                            : "No jobs have been assigned to you yet. You can create a walk-in job card or ask the workshop owner."}
                    </p>
                    <button
                        onClick={() => setShowNewJobModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Job Card</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobs.map(job => {
                        const progress = parseChecklistProgress(job.checklist)
                        const isInProgress = job.status === "IN_PROGRESS"
                        const isCompleted = job.status === "COMPLETED"

                        return (
                            <div
                                key={job.id}
                                className={`p-5 rounded-3xl bg-[#121216] border transition-all hover:border-white/20 flex flex-col justify-between ${
                                    isInProgress
                                        ? "border-[#16acd4]/40 shadow-lg shadow-[#16acd4]/5"
                                        : isCompleted
                                        ? "border-emerald-500/20 opacity-80"
                                        : "border-white/8"
                                }`}
                            >
                                <div className="space-y-3.5">
                                    {/* Top Row: Reg Plate & Status */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-black text-xs bg-amber-400 text-black px-2.5 py-0.5 rounded tracking-widest border border-amber-300 shadow">
                                                {job.vehicleRegNo}
                                            </span>
                                            {job.priority === "URGENT" && (
                                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> Urgent
                                                </span>
                                            )}
                                        </div>

                                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                            isInProgress
                                                ? "bg-[#16acd4]/20 text-[#16acd4] border-[#16acd4]/30"
                                                : isCompleted
                                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                        }`}>
                                            {job.status === "IN_PROGRESS" ? "In Progress" : job.status === "COMPLETED" ? "Completed" : "Assigned"}
                                        </span>
                                    </div>

                                    {/* Car Model & Category */}
                                    <div>
                                        <h3 className="text-base font-black text-white">{job.vehicleName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/8">
                                                {job.jobCategory}
                                            </span>
                                            <span className="text-[11px] text-zinc-500 font-mono">
                                                {job.jobNumber}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="flex items-center justify-between text-xs text-zinc-400 bg-white/5 px-3 py-2 rounded-xl">
                                        <span className="font-medium">Client: <b className="text-white">{job.clientName}</b></span>
                                        {job.clientPhone && (
                                            <a
                                                href={`tel:${job.clientPhone}`}
                                                className="text-[#16acd4] hover:underline flex items-center gap-1 font-bold"
                                            >
                                                <Phone className="w-3 h-3" />
                                                <span>{job.clientPhone}</span>
                                            </a>
                                        )}
                                    </div>

                                    {/* Checklist Progress Bar */}
                                    {progress.total > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-[11px] text-zinc-400">
                                                <span className="font-medium">Task Checklist</span>
                                                <span className="font-bold text-white">{progress.done}/{progress.total} Done ({progress.percent}%)</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[#16acd4] to-emerald-400 transition-all duration-500"
                                                    style={{ width: `${progress.percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Work Summary note if present */}
                                    {job.workSummary && (
                                        <p className="text-xs text-zinc-400 line-clamp-2 italic bg-[#0d0d10] p-2.5 rounded-xl border border-white/5">
                                            "{job.workSummary}"
                                        </p>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="pt-4 border-t border-white/8 mt-4 flex items-center justify-between gap-2">
                                    {/* Left action: Quick Start / Resume */}
                                    {job.status === "ASSIGNED" ? (
                                        <button
                                            onClick={() => handleQuickStatus(job.id, "IN_PROGRESS")}
                                            className="px-3.5 py-2 rounded-xl bg-[#16acd4]/20 hover:bg-[#16acd4]/30 text-[#16acd4] border border-[#16acd4]/40 text-xs font-bold transition-colors"
                                        >
                                            Start Work
                                        </button>
                                    ) : job.status === "IN_PROGRESS" ? (
                                        <button
                                            onClick={() => handleQuickStatus(job.id, "COMPLETED")}
                                            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-colors"
                                        >
                                            Mark Completed
                                        </button>
                                    ) : (
                                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> All Done
                                        </span>
                                    )}

                                    {/* Right action: Open Full Sheet */}
                                    <Link
                                        href={`/staff/jobs/${job.id}`}
                                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                                    >
                                        <span>Job Sheet</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal: Open New Job Card */}
            {showNewJobModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="rounded-3xl border border-white/10 w-full max-w-lg overflow-hidden shadow-2xl bg-[#121215] my-8">
                        <div className="flex items-center justify-between p-5 border-b border-white/8 bg-[#17171b]">
                            <div>
                                <h3 className="text-base font-black text-white">Open Vehicle Job Card</h3>
                                <p className="text-xs text-zinc-400 mt-0.5">Assign car for repair or detailing work</p>
                            </div>
                            <button
                                onClick={() => setShowNewJobModal(false)}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateJob} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Vehicle Reg No (Plate) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. HR 26 DQ 1234"
                                        value={jobForm.vehicleRegNo}
                                        onChange={e => setJobForm({ ...jobForm, vehicleRegNo: e.target.value.toUpperCase() })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4] font-mono uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Vehicle Make & Model *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Toyota Fortuner 4x4"
                                        value={jobForm.vehicleName}
                                        onChange={e => setJobForm({ ...jobForm, vehicleName: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Job Category
                                    </label>
                                    <select
                                        value={jobForm.jobCategory}
                                        onChange={e => setJobForm({ ...jobForm, jobCategory: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    >
                                        <option value="DETAILING">Ceramic & Detailing</option>
                                        <option value="PPF_WRAP">PPF / Vinyl Wrap</option>
                                        <option value="MECHANICAL">Mechanical Repair</option>
                                        <option value="PAINT_DENT">Paint & Denting</option>
                                        <option value="WASHING">Deep Wash & Interior</option>
                                        <option value="ELECTRICAL">Electrical & Accessories</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Priority
                                    </label>
                                    <select
                                        value={jobForm.priority}
                                        onChange={e => setJobForm({ ...jobForm, priority: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    >
                                        <option value="NORMAL">Normal Priority</option>
                                        <option value="HIGH">High Priority</option>
                                        <option value="URGENT">Urgent (Express)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Amit Sharma"
                                        value={jobForm.clientName}
                                        onChange={e => setJobForm({ ...jobForm, clientName: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Customer Phone
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        value={jobForm.clientPhone}
                                        onChange={e => setJobForm({ ...jobForm, clientPhone: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Initial Work Notes
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Customer requested extra focus on right rear door scratch..."
                                    value={jobForm.workSummary}
                                    onChange={e => setJobForm({ ...jobForm, workSummary: e.target.value })}
                                    className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/8">
                                <button
                                    type="button"
                                    onClick={() => setShowNewJobModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingJob}
                                    className="px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-[#16acd4] hover:bg-[#139cb8] text-black shadow-lg shadow-[#16acd4]/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {creatingJob ? "Creating..." : "Create Job Card"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
