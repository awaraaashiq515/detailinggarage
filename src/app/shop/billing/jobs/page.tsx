"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
    Wrench, Car, Plus, Search, Filter,
    CheckCircle2, Clock, AlertTriangle, Phone,
    UserCheck, ArrowRight, ChevronRight, RefreshCw,
    X, Sparkles, Package, FileText, Check, Trash2,
    Layers, Camera, Eye
} from "lucide-react"

function ShopWorkshopJobsPageContent() {
    const searchParams = useSearchParams()
    const [jobs, setJobs] = useState<any[]>([])
    const [staffList, setStaffList] = useState<any[]>([])
    const [servicesList, setServicesList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [staffFilter, setStaffFilter] = useState("ALL")
    const [searchQuery, setSearchQuery] = useState("")

    // Assign Work Modal
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [assigning, setAssigning] = useState(false)
    const [selectedJobForDetail, setSelectedJobForDetail] = useState<any>(null)

    useEffect(() => {
        if (searchParams.get("new") === "1" || searchParams.get("assign") === "1") {
            setShowAssignModal(true)
        }
    }, [searchParams])

    const [form, setForm] = useState({
        staffId: "",
        vehicleName: "",
        vehicleRegNo: "",
        vehicleChassis: "",
        odometer: "",
        clientName: "",
        clientPhone: "",
        jobCategory: "DETAILING",
        priority: "NORMAL",
        customInstructions: "",
        selectedServices: [] as string[],
        checklistTasks: [] as string[]
    })
    const [newTaskInput, setNewTaskInput] = useState("")

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (statusFilter !== "ALL") params.set("status", statusFilter)
            if (staffFilter !== "ALL") params.set("staffId", staffFilter)
            if (searchQuery) params.set("search", searchQuery)

            const res = await fetch(`/api/shop/billing/jobs?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setJobs(data.jobs || [])
                }
            }
        } catch (err) {
            console.error("Failed to load jobs:", err)
        } finally {
            setLoading(false)
        }
    }

    const fetchStaffAndServices = async () => {
        try {
            const [staffRes, servRes] = await Promise.allSettled([
                fetch("/api/shop/billing/staff"),
                fetch("/api/admin/billing/packages")
            ])

            if (staffRes.status === "fulfilled" && staffRes.value.ok) {
                try {
                    const staffData = await staffRes.value.json()
                    if (staffData.success) {
                        setStaffList(staffData.staff || [])
                        if (staffData.staff?.length > 0 && !form.staffId) {
                            setForm(prev => ({ ...prev, staffId: staffData.staff[0].id }))
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse staff data:", e)
                }
            }

            if (servRes.status === "fulfilled" && servRes.value.ok) {
                try {
                    const servData = await servRes.value.json()
                    if (servData.success) {
                        setServicesList(servData.packages || [])
                    }
                } catch (e) {
                    console.error("Failed to parse services data:", e)
                }
            }
        } catch (err) {
            console.error("Failed to load staff/services:", err)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [statusFilter, staffFilter, searchQuery])

    useEffect(() => {
        fetchStaffAndServices()
    }, [])

    // Add service to form
    const toggleService = (serviceName: string) => {
        let updated = [...form.selectedServices]
        let tasks = [...form.checklistTasks]

        if (updated.includes(serviceName)) {
            updated = updated.filter(s => s !== serviceName)
            tasks = tasks.filter(t => t !== serviceName)
        } else {
            updated.push(serviceName)
            tasks.push(serviceName)
        }
        setForm({ ...form, selectedServices: updated, checklistTasks: tasks })
    }

    // Add custom task to form
    const addCustomTask = () => {
        if (!newTaskInput.trim()) return
        setForm({
            ...form,
            checklistTasks: [...form.checklistTasks, newTaskInput.trim()]
        })
        setNewTaskInput("")
    }

    // Remove task
    const removeTask = (idx: number) => {
        setForm({
            ...form,
            checklistTasks: form.checklistTasks.filter((_, i) => i !== idx)
        })
    }

    // Submit Assign Work
    const handleAssignWork = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.staffId || !form.vehicleName || !form.vehicleRegNo) return

        try {
            setAssigning(true)
            const res = await fetch("/api/shop/billing/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    services: form.selectedServices
                })
            })
            const data = await res.json()
            if (data.success) {
                setShowAssignModal(false)
                setForm({
                    staffId: staffList[0]?.id || "",
                    vehicleName: "",
                    vehicleRegNo: "",
                    vehicleChassis: "",
                    odometer: "",
                    clientName: "",
                    clientPhone: "",
                    jobCategory: "DETAILING",
                    priority: "NORMAL",
                    customInstructions: "",
                    selectedServices: [],
                    checklistTasks: []
                })
                fetchJobs()
            } else {
                alert(data.error || "Failed to assign work")
            }
        } catch (err) {
            console.error("Assign error:", err)
        } finally {
            setAssigning(false)
        }
    }

    // Delete job
    const handleDeleteJob = async (jobId: string) => {
        if (!confirm("Are you sure you want to remove this job card?")) return
        try {
            const res = await fetch(`/api/shop/billing/jobs/${jobId}`, { method: "DELETE" })
            const data = await res.json()
            if (data.success) {
                fetchJobs()
                setSelectedJobForDetail(null)
            }
        } catch (err) {
            console.error("Delete error:", err)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Shop Billing</span>
                        <ChevronRight className="w-3 h-3 text-zinc-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#16acd4]">Workshop Operations</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-1">
                        <Wrench className="w-6 h-6 text-[#16acd4]" />
                        <span>Workshop Jobs & Staff Assignments</span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Assign vehicle repair & detailing jobs to technicians and monitor their real-time work logs
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-[#16acd4] hover:bg-[#139cb8] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#16acd4]/20 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Assign Work to Staff</span>
                    </button>
                    <Link
                        href="/staff"
                        target="_blank"
                        className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold border border-white/8 transition-colors flex items-center gap-1.5"
                    >
                        <span>Open Technician App</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-3 rounded-2xl bg-[#111114] border border-white/8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Tabs */}
                    {[
                        { id: "ALL", label: "All Vehicles" },
                        { id: "IN_PROGRESS", label: "In Progress" },
                        { id: "ASSIGNED", label: "Pending" },
                        { id: "COMPLETED", label: "Completed" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                statusFilter === tab.id
                                    ? "bg-[#16acd4]/20 text-[#16acd4] border border-[#16acd4]/40"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}

                    {/* Staff Filter Dropdown */}
                    <select
                        value={staffFilter}
                        onChange={e => setStaffFilter(e.target.value)}
                        className="bg-[#17171d] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#16acd4]"
                    >
                        <option value="ALL">All Technicians</option>
                        {staffList.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                        ))}
                    </select>
                </div>

                {/* Search */}
                <div className="relative min-w-[220px]">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search car, plate, technician..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#17171d] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                    />
                </div>
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                    <RefreshCw className="w-7 h-7 animate-spin text-[#16acd4] mb-3" />
                    <p className="text-xs font-bold uppercase tracking-wider">Loading workshop jobs...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-[#121216] border border-white/8 p-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 text-zinc-500 flex items-center justify-center mx-auto mb-4">
                        <Car className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">No Workshop Jobs Found</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
                        Assign vehicle services to your technicians so they can track tasks and log repairs.
                    </p>
                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16acd4] text-black font-extrabold text-xs uppercase tracking-wider transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Assign Work to Staff</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs.map(job => {
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
                                    {/* Reg plate & Status */}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono font-black text-xs bg-amber-400 text-black px-2.5 py-0.5 rounded tracking-widest border border-amber-300 shadow">
                                            {job.vehicleRegNo}
                                        </span>
                                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
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
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                                                {job.jobCategory}
                                            </span>
                                            <span className="text-[11px] text-zinc-500 font-mono">
                                                #{job.jobNumber}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Assigned Staff Pill */}
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#17171d] border border-white/5 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-[#16acd4]/20 text-[#16acd4] flex items-center justify-center font-bold text-[10px]">
                                                {job.staff?.name ? job.staff.name.charAt(0) : "S"}
                                            </div>
                                            <div>
                                                <span className="text-zinc-400 block text-[10px]">Assigned Technician:</span>
                                                <b className="text-white font-bold">{job.staff?.name || "Unassigned"}</b>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded">
                                            {job.staff?.role || "Staff"}
                                        </span>
                                    </div>

                                    {/* Customer & Contact */}
                                    <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                                        <span>Client: <b className="text-white">{job.clientName}</b></span>
                                        {job.clientPhone && (
                                            <a href={`tel:${job.clientPhone}`} className="text-[#16acd4] hover:underline flex items-center gap-1 font-mono font-bold">
                                                <Phone className="w-3 h-3" />
                                                <span>{job.clientPhone}</span>
                                            </a>
                                        )}
                                    </div>

                                    {/* Task Checklist Progress */}
                                    {job.totalTasks > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-[11px] text-zinc-400">
                                                <span>Checklist Progress</span>
                                                <span className="font-bold text-white">{job.completedTasks}/{job.totalTasks} Done ({job.progressPercent}%)</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[#16acd4] to-emerald-400"
                                                    style={{ width: `${job.progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Live Technician Work Summary */}
                                    {job.workSummary && (
                                        <p className="text-xs text-zinc-400 line-clamp-2 italic bg-[#0d0d10] p-2.5 rounded-xl border border-white/5">
                                            "{job.workSummary}"
                                        </p>
                                    )}

                                    {/* Consumed parts count */}
                                    {job.partsConsumedParsed?.length > 0 && (
                                        <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                                            <Package className="w-3.5 h-3.5" />
                                            <span>{job.partsConsumedParsed.length} Parts/Materials consumed by technician</span>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="pt-3 border-t border-white/8 mt-4 flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => setSelectedJobForDetail(job)}
                                        className="w-full px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>View Technician Report</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* =========================================================================
                MODAL 1: ASSIGN WORK TO STAFF
            ========================================================================= */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="rounded-3xl border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl bg-[#121215] my-8">
                        <div className="flex items-center justify-between p-5 border-b border-white/8 bg-[#17171b]">
                            <div>
                                <h3 className="text-base font-black text-white flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-[#16acd4]" />
                                    <span>Assign Vehicle Work to Staff Member</span>
                                </h3>
                                <p className="text-xs text-zinc-400 mt-0.5">Dispatches job card directly to technician's mobile portal</p>
                            </div>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAssignWork} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Staff Member Selector */}
                            <div className="p-4 rounded-2xl bg-[#17171d] border border-white/8 space-y-2">
                                <label className="block text-[11px] font-bold text-[#16acd4] uppercase tracking-wider">
                                    Assign To Staff Member (Technician) *
                                </label>
                                <select
                                    required
                                    value={form.staffId}
                                    onChange={e => setForm({ ...form, staffId: e.target.value })}
                                    className="w-full bg-[#121215] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                >
                                    {staffList.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} — {s.role} {s.specialization ? `(${s.specialization})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Vehicle Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Vehicle Reg No (Plate) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. HR 26 DQ 1234"
                                        value={form.vehicleRegNo}
                                        onChange={e => setForm({ ...form, vehicleRegNo: e.target.value.toUpperCase() })}
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
                                        placeholder="e.g. Toyota Fortuner Legender"
                                        value={form.vehicleName}
                                        onChange={e => setForm({ ...form, vehicleName: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rajesh Sharma"
                                        value={form.clientName}
                                        onChange={e => setForm({ ...form, clientName: e.target.value })}
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
                                        value={form.clientPhone}
                                        onChange={e => setForm({ ...form, clientPhone: e.target.value })}
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
                                        value={form.jobCategory}
                                        onChange={e => setForm({ ...form, jobCategory: e.target.value })}
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
                                        value={form.priority}
                                        onChange={e => setForm({ ...form, priority: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    >
                                        <option value="NORMAL">Normal Priority</option>
                                        <option value="HIGH">High Priority</option>
                                        <option value="URGENT">Urgent (Express Delivery)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Service Quick-Select Pills */}
                            {servicesList.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                                        Select Workshop Services to Assign
                                    </label>
                                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                                        {servicesList.map(serv => {
                                            const isSelected = form.selectedServices.includes(serv.name)
                                            return (
                                                <button
                                                    key={serv.id}
                                                    type="button"
                                                    onClick={() => toggleService(serv.name)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                        isSelected
                                                            ? "bg-[#16acd4] text-black"
                                                            : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5"
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                    <span>{serv.name}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Task Checklist Assigned to Technician */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                                    Checklist Tasks for Technician
                                </label>
                                {form.checklistTasks.length > 0 && (
                                    <div className="space-y-1.5">
                                        {form.checklistTasks.map((task, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white">
                                                <span>{idx + 1}. {task}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTask(idx)}
                                                    className="text-zinc-500 hover:text-red-400"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        type="text"
                                        placeholder="Add specific task (e.g. Buff out deep scratch on right rear door)..."
                                        value={newTaskInput}
                                        onChange={e => setNewTaskInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomTask() } }}
                                        className="flex-1 bg-[#17171a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomTask}
                                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Custom Instructions */}
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Owner Instructions / Special Notes for Technician
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Enter instructions (e.g. Customer is sensitive about alloy wheels, use ceramic spray on wheels as complimentary)..."
                                    value={form.customInstructions}
                                    onChange={e => setForm({ ...form, customInstructions: e.target.value })}
                                    className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/8">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={assigning}
                                    className="px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-[#16acd4] hover:bg-[#139cb8] text-black shadow-lg shadow-[#16acd4]/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {assigning ? "Assigning..." : "Assign Work & Notify Staff"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================================
                MODAL 2: TECHNICIAN WORK REPORT VIEWER (WHAT WAS DONE)
            ========================================================================= */}
            {selectedJobForDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="rounded-3xl border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl bg-[#121215] my-8">
                        <div className="flex items-center justify-between p-5 border-b border-white/8 bg-[#17171b]">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-xs bg-amber-400 text-black px-2 py-0.5 rounded">
                                        {selectedJobForDetail.vehicleRegNo}
                                    </span>
                                    <h3 className="text-base font-black text-white">{selectedJobForDetail.vehicleName}</h3>
                                </div>
                                <p className="text-xs text-zinc-400 mt-1">
                                    Serviced by <b className="text-white">{selectedJobForDetail.staff?.name}</b> ({selectedJobForDetail.staff?.role})
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedJobForDetail(null)}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                            {/* Checklist status */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    Checklist Progress ({selectedJobForDetail.completedTasks}/{selectedJobForDetail.totalTasks} Completed)
                                </h4>
                                <div className="space-y-1.5">
                                    {selectedJobForDetail.checklistParsed?.map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#17171d] border border-white/5 text-xs">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                                                    item.isDone ? "bg-emerald-500 text-black font-black" : "border border-zinc-600"
                                                }`}>
                                                    {item.isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                </div>
                                                <span className={item.isDone ? "line-through text-zinc-400" : "text-white font-medium"}>
                                                    {item.task}
                                                </span>
                                            </div>
                                            {item.doneAt && (
                                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                    Done at {item.doneAt}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Detailed Technician Work Report */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    Technician Work Report Notes
                                </h4>
                                <div className="p-4 rounded-2xl bg-[#17171d] border border-white/5 text-xs text-zinc-300 leading-relaxed">
                                    {selectedJobForDetail.workSummary || "No notes logged by technician yet."}
                                </div>
                            </div>

                            {/* Parts Consumed */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    Parts & Chemicals Consumed on Vehicle
                                </h4>
                                {selectedJobForDetail.partsConsumedParsed?.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {selectedJobForDetail.partsConsumedParsed.map((part: any) => (
                                            <div key={part.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#17171d] border border-white/5 text-xs">
                                                <span className="font-bold text-white">{part.name}</span>
                                                <span className="font-mono text-amber-400 bg-white/5 px-2 py-0.5 rounded text-[11px]">
                                                    {part.qty} {part.unit}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-500 italic">No parts or chemicals recorded for this job.</p>
                                )}
                            </div>

                            {/* Images if any */}
                            {selectedJobForDetail.workImagesParsed?.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        Before / After Photos
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedJobForDetail.workImagesParsed.map((img: string, idx: number) => (
                                            <img key={idx} src={img} alt="Job photo" className="rounded-xl border border-white/10 aspect-video object-cover" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/8">
                                <button
                                    type="button"
                                    onClick={() => handleDeleteJob(selectedJobForDetail.id)}
                                    className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-xs font-bold transition-colors flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Job Card</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedJobForDetail(null)}
                                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                                >
                                    Close Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ShopWorkshopJobsPage() {
    return (
        <Suspense fallback={
            <div className="py-24 flex flex-col items-center justify-center text-zinc-500">
                <RefreshCw className="w-8 h-8 animate-spin text-[#16acd4] mb-3" />
                <p className="text-xs font-bold uppercase tracking-wider">Loading workshop operations...</p>
            </div>
        }>
            <ShopWorkshopJobsPageContent />
        </Suspense>
    )
}
