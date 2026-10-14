"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    Car, Wrench, ArrowLeft, CheckCircle2, Clock,
    Phone, Plus, Trash2, Check, Sparkles,
    FileText, Package, Camera, ChevronRight,
    RefreshCw, Play, CheckCheck, X, ShieldCheck
} from "lucide-react"

type ChecklistItem = {
    id: string
    task: string
    isDone: boolean
    doneAt?: string | null
}

type PartItem = {
    id: string
    name: string
    qty: number
    unit: string
}

// Quick common parts/chemicals for detailing & workshop
const QUICK_PARTS = [
    { name: "Engine Oil", unit: "L" },
    { name: "Oil Filter", unit: "PCS" },
    { name: "Air Filter", unit: "PCS" },
    { name: "Brake Pads", unit: "SET" },
    { name: "Coolant", unit: "L" },
    { name: "9H Ceramic Bottle", unit: "BOTTLE" },
    { name: "Microfiber Cloth", unit: "PCS" },
    { name: "Compound Paste", unit: "CAN" },
]

// Quick notes templates
const QUICK_NOTES = [
    "Full periodic service completed & oil changed.",
    "Brakes inspected & pads cleaned.",
    "3-stage rubbing and high-gloss polishing done.",
    "Vehicle deep washed & vacuumed.",
    "Quality inspection passed, ready for delivery.",
]

export default function StaffJobDetailPage() {
    const params = useParams()
    const router = useRouter()
    const jobId = params?.id as string

    const [job, setJob] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<"SAVED" | "SAVING" | null>(null)

    // Work log states
    const [status, setStatus] = useState("ASSIGNED")
    const [checklist, setChecklist] = useState<ChecklistItem[]>([])
    const [newTaskText, setNewTaskText] = useState("")
    const [showAddTask, setShowAddTask] = useState(false)
    const [workSummary, setWorkSummary] = useState("")
    const [partsConsumed, setPartsConsumed] = useState<PartItem[]>([])
    const [newPartName, setNewPartName] = useState("")
    const [newPartQty, setNewPartQty] = useState(1)
    const [newPartUnit, setNewPartUnit] = useState("PCS")
    const [showAddPart, setShowAddPart] = useState(false)
    const [workImages, setWorkImages] = useState<string[]>([])
    const [newImageUrl, setNewImageUrl] = useState("")
    const [showAddImage, setShowAddImage] = useState(false)

    // Active tab: TASKS | PARTS | NOTES
    const [activeTab, setActiveTab] = useState<"TASKS" | "PARTS" | "NOTES">("TASKS")

    const fetchJob = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/staff/jobs/${jobId}`)
            if (res.ok) {
                const data = await res.json()
                if (data.success && data.job) {
                    setJob(data.job)
                    setStatus(data.job.status || "ASSIGNED")
                    setChecklist(data.job.checklistParsed || [])
                    setWorkSummary(data.job.workSummary || "")
                    setPartsConsumed(data.job.partsConsumedParsed || [])
                    setWorkImages(data.job.workImagesParsed || [])
                } else {
                    alert(data.error || "Failed to load job card")
                }
            } else {
                console.warn("fetchJob failed:", res.status)
            }
        } catch (err) {
            console.error("Job fetch error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (jobId) fetchJob()
    }, [jobId])

    // Background Auto-Save helper
    const autoSave = async (updates: {
        status?: string
        checklist?: ChecklistItem[]
        workSummary?: string
        partsConsumed?: PartItem[]
        workImages?: string[]
    }) => {
        try {
            setSaveStatus("SAVING")
            const payload = {
                status: updates.status !== undefined ? updates.status : status,
                checklist: updates.checklist !== undefined ? updates.checklist : checklist,
                workSummary: updates.workSummary !== undefined ? updates.workSummary : workSummary,
                partsConsumed: updates.partsConsumed !== undefined ? updates.partsConsumed : partsConsumed,
                workImages: updates.workImages !== undefined ? updates.workImages : workImages
            }

            const res = await fetch(`/api/staff/jobs/${jobId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setSaveStatus("SAVED")
                setTimeout(() => setSaveStatus(null), 2500)
            }
        } catch (err) {
            console.error("AutoSave error:", err)
        }
    }

    // Explicit manual save
    const handleManualSave = async () => {
        setSaving(true)
        await autoSave({})
        setSaving(false)
    }

    // Toggle single checklist task & auto-save immediately
    const toggleChecklist = (id: string) => {
        const updated = checklist.map(item => {
            if (item.id === id) {
                const nextDone = !item.isDone
                return {
                    ...item,
                    isDone: nextDone,
                    doneAt: nextDone ? new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : null
                }
            }
            return item
        })
        setChecklist(updated)
        autoSave({ checklist: updated })
    }

    // Change status & auto-save immediately
    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus)
        autoSave({ status: newStatus })
    }

    // Mark all tasks completed & set status to COMPLETED
    const handleCompleteEverything = () => {
        const updatedChecklist = checklist.map(t => ({
            ...t,
            isDone: true,
            doneAt: t.doneAt || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        }))
        setChecklist(updatedChecklist)
        setStatus("COMPLETED")
        autoSave({ status: "COMPLETED", checklist: updatedChecklist })
    }

    // Add new task
    const addChecklistItem = () => {
        if (!newTaskText.trim()) return
        const newItem: ChecklistItem = {
            id: Date.now().toString(),
            task: newTaskText.trim(),
            isDone: false
        }
        const updated = [...checklist, newItem]
        setChecklist(updated)
        setNewTaskText("")
        setShowAddTask(false)
        autoSave({ checklist: updated })
    }

    // Remove task
    const removeChecklistItem = (id: string) => {
        const updated = checklist.filter(item => item.id !== id)
        setChecklist(updated)
        autoSave({ checklist: updated })
    }

    // Quick add part chip
    const quickAddPart = (part: { name: string; unit: string }) => {
        const existing = partsConsumed.find(p => p.name.toLowerCase() === part.name.toLowerCase())
        let updated: PartItem[]
        if (existing) {
            updated = partsConsumed.map(p => p.id === existing.id ? { ...p, qty: p.qty + 1 } : p)
        } else {
            updated = [...partsConsumed, {
                id: Date.now().toString(),
                name: part.name,
                qty: 1,
                unit: part.unit
            }]
        }
        setPartsConsumed(updated)
        autoSave({ partsConsumed: updated })
    }

    // Add custom part
    const addConsumedPart = () => {
        if (!newPartName.trim()) return
        const newPart: PartItem = {
            id: Date.now().toString(),
            name: newPartName.trim(),
            qty: Number(newPartQty) || 1,
            unit: newPartUnit
        }
        const updated = [...partsConsumed, newPart]
        setPartsConsumed(updated)
        setNewPartName("")
        setNewPartQty(1)
        setShowAddPart(false)
        autoSave({ partsConsumed: updated })
    }

    // Step part quantity up/down
    const changePartQty = (id: string, delta: number) => {
        const updated = partsConsumed.map(p => {
            if (p.id === id) {
                const newQty = Math.max(1, p.qty + delta)
                return { ...p, qty: newQty }
            }
            return p
        })
        setPartsConsumed(updated)
        autoSave({ partsConsumed: updated })
    }

    // Remove consumed part
    const removeConsumedPart = (id: string) => {
        const updated = partsConsumed.filter(p => p.id !== id)
        setPartsConsumed(updated)
        autoSave({ partsConsumed: updated })
    }

    // Append quick note template
    const appendQuickNote = (note: string) => {
        const updated = workSummary ? `${workSummary}\n• ${note}` : `• ${note}`
        setWorkSummary(updated)
        autoSave({ workSummary: updated })
    }

    // Add photo URL
    const addImage = () => {
        if (!newImageUrl.trim()) return
        const updated = [...workImages, newImageUrl.trim()]
        setWorkImages(updated)
        setNewImageUrl("")
        setShowAddImage(false)
        autoSave({ workImages: updated })
    }

    const removeImage = (index: number) => {
        const updated = workImages.filter((_, idx) => idx !== index)
        setWorkImages(updated)
        autoSave({ workImages: updated })
    }

    if (loading || !job) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-400 p-6">
                <RefreshCw className="w-9 h-9 animate-spin text-[#16acd4] mb-3" />
                <p className="text-sm font-bold text-white">Loading Vehicle Job Sheet...</p>
                <p className="text-xs text-zinc-500 mt-1">Getting vehicle details & checklist</p>
            </div>
        )
    }

    const completedTasksCount = checklist.filter(t => t.isDone).length
    const totalTasksCount = checklist.length
    const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0
    const allTasksDone = totalTasksCount > 0 && completedTasksCount === totalTasksCount

    return (
        <div className="max-w-xl mx-auto space-y-4 pb-32 px-1">
            {/* ── Top Header & Auto-Save Feedback ── */}
            <div className="flex items-center justify-between gap-3 pt-1">
                <Link
                    href="/staff/jobs"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Jobs</span>
                </Link>

                <div className="flex items-center gap-2">
                    {saveStatus === "SAVING" && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#16acd4] bg-[#16acd4]/10 px-2.5 py-1 rounded-full animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
                        </span>
                    )}
                    {saveStatus === "SAVED" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                            <Check className="w-3 h-3 stroke-[3]" /> Saved
                        </span>
                    )}
                    <button
                        onClick={handleManualSave}
                        disabled={saving}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <span>{saving ? "Saving..." : "Save"}</span>
                    </button>
                </div>
            </div>

            {/* ── Vehicle Identity Card ── */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#16161d] via-[#121217] to-[#0c0c10] border border-white/10 shadow-xl space-y-4">
                {/* Vehicle Plate + Name */}
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-sm sm:text-base bg-amber-400 text-black px-2.5 py-0.5 rounded-md tracking-wider shadow">
                                {job.vehicleRegNo}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#16acd4]/20 text-[#16acd4] border border-[#16acd4]/30">
                                {job.jobCategory || "SERVICE"}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-0.5">
                            {job.vehicleName}
                        </h1>
                        <p className="text-[11px] text-zinc-400 font-mono">
                            Job Card: <b className="text-zinc-200">{job.jobNumber}</b>
                        </p>
                    </div>

                    {/* Customer Call Button */}
                    {job.clientPhone && (
                        <a
                            href={`tel:${job.clientPhone}`}
                            className="px-3 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex flex-col items-center justify-center shrink-0 transition-all active:scale-95"
                            title="Call Customer"
                        >
                            <Phone className="w-4 h-4 mb-0.5 fill-emerald-400/20" />
                            <span className="text-[10px] font-extrabold uppercase">Call</span>
                        </a>
                    )}
                </div>

                {/* Customer Info row */}
                <div className="flex items-center gap-3 text-xs text-zinc-300 pt-1 border-t border-white/5 flex-wrap">
                    <span>Customer: <b className="text-white">{job.clientName || "Walk-in Client"}</b></span>
                    {job.odometer && (
                        <span>• Odometer: <b className="text-white font-mono">{job.odometer} km</b></span>
                    )}
                </div>

                {/* ── Big 3-Step Status Buttons ── */}
                <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                        Current Vehicle Status
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {/* 1. Pending */}
                        <button
                            type="button"
                            onClick={() => handleStatusChange("ASSIGNED")}
                            className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                                status === "ASSIGNED"
                                    ? "bg-amber-500/25 border-amber-400 text-amber-300 font-black shadow-lg shadow-amber-500/10 ring-1 ring-amber-400"
                                    : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 font-bold"
                            }`}
                        >
                            <Clock className="w-4 h-4" />
                            <span className="text-[11px] uppercase tracking-wider">Pending</span>
                        </button>

                        {/* 2. In Progress */}
                        <button
                            type="button"
                            onClick={() => handleStatusChange("IN_PROGRESS")}
                            className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                                status === "IN_PROGRESS"
                                    ? "bg-[#16acd4]/30 border-[#16acd4] text-[#38bdf8] font-black shadow-lg shadow-[#16acd4]/20 ring-1 ring-[#16acd4]"
                                    : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 font-bold"
                            }`}
                        >
                            <Play className="w-4 h-4 fill-current" />
                            <span className="text-[11px] uppercase tracking-wider">Working</span>
                        </button>

                        {/* 3. Completed */}
                        <button
                            type="button"
                            onClick={() => handleStatusChange("COMPLETED")}
                            className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                                status === "COMPLETED"
                                    ? "bg-emerald-500/30 border-emerald-400 text-emerald-300 font-black shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400"
                                    : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 font-bold"
                            }`}
                        >
                            <CheckCheck className="w-4 h-4" />
                            <span className="text-[11px] uppercase tracking-wider">Finished</span>
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">Work Done:</span>
                        <span className="font-extrabold text-white">
                            {completedTasksCount} of {totalTasksCount} tasks ({progressPercent}%)
                        </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-black/60 border border-white/10 overflow-hidden p-0.5">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#16acd4] to-emerald-400 transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Clean 3-Tab Selector (Tasks | Materials | Notes) ── */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#111115] border border-white/8">
                <button
                    type="button"
                    onClick={() => setActiveTab("TASKS")}
                    className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === "TASKS"
                            ? "bg-[#16acd4] text-black shadow-md"
                            : "text-zinc-400 hover:text-white"
                    }`}
                >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tasks ({completedTasksCount}/{totalTasksCount})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("PARTS")}
                    className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === "PARTS"
                            ? "bg-[#16acd4] text-black shadow-md"
                            : "text-zinc-400 hover:text-white"
                    }`}
                >
                    <Package className="w-3.5 h-3.5" />
                    <span>Parts ({partsConsumed.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("NOTES")}
                    className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === "NOTES"
                            ? "bg-[#16acd4] text-black shadow-md"
                            : "text-zinc-400 hover:text-white"
                    }`}
                >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Notes</span>
                </button>
            </div>

            {/* ══════════════════════════════════════════════════════
                TAB 1: WORK CHECKLIST (BIG TOUCH-FRIENDLY BUTTONS)
            ══════════════════════════════════════════════════════ */}
            {activeTab === "TASKS" && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                                Assigned Tasks
                            </h2>
                            <p className="text-[11px] text-zinc-400">Tap any task below to mark it done</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowAddTask(!showAddTask)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Task</span>
                        </button>
                    </div>

                    {/* Add Custom Task Box */}
                    {showAddTask && (
                        <div className="p-3.5 rounded-2xl bg-[#14141a] border border-[#16acd4]/30 space-y-2 animate-in fade-in">
                            <p className="text-[11px] font-bold text-[#16acd4] uppercase">New Task Description</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="e.g. Clean air filter or buff mirror..."
                                    value={newTaskText}
                                    onChange={e => setNewTaskText(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addChecklistItem() } }}
                                    className="flex-1 bg-[#1a1a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                                />
                                <button
                                    type="button"
                                    onClick={addChecklistItem}
                                    className="px-4 py-2 rounded-xl bg-[#16acd4] text-black font-extrabold text-xs active:scale-95"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddTask(false)}
                                    className="p-2 rounded-xl bg-white/5 text-zinc-400"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Checklist Task Cards */}
                    <div className="space-y-2.5">
                        {checklist.length === 0 ? (
                            <div className="py-8 text-center rounded-2xl bg-white/5 border border-white/5 p-4 space-y-2">
                                <CheckCircle2 className="w-8 h-8 text-zinc-600 mx-auto" />
                                <p className="text-xs font-bold text-zinc-300">No tasks currently assigned</p>
                                <button
                                    type="button"
                                    onClick={() => setShowAddTask(true)}
                                    className="px-3.5 py-1.5 rounded-xl bg-[#16acd4] text-black text-xs font-bold"
                                >
                                    + Add First Task
                                </button>
                            </div>
                        ) : (
                            checklist.map((item, idx) => (
                                <div
                                    key={item.id}
                                    onClick={() => toggleChecklist(item.id)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 active:scale-[0.99] ${
                                        item.isDone
                                            ? "bg-emerald-500/15 border-emerald-500/40 text-white shadow-sm"
                                            : "bg-[#141419] border-white/10 hover:border-white/20 text-zinc-200"
                                    }`}
                                >
                                    {/* Left: Big Check Circle + Text */}
                                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                            item.isDone
                                                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30 scale-105"
                                                : "border-2 border-zinc-500 bg-black/40 text-transparent"
                                        }`}>
                                            <Check className="w-5 h-5 stroke-[3]" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm font-bold leading-snug break-words ${
                                                item.isDone ? "line-through text-zinc-400 font-medium" : "text-white"
                                            }`}>
                                                {item.task}
                                            </p>
                                            {item.isDone ? (
                                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block mt-1">
                                                    ✓ Completed {item.doneAt ? `at ${item.doneAt}` : ""}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-zinc-500 block mt-0.5">
                                                    Tap to mark done
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete icon */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (confirm("Remove this task?")) removeChecklistItem(item.id)
                                        }}
                                        className="p-2 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/10 shrink-0 transition-colors"
                                        title="Delete Task"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Congratulations Banner if all tasks finished */}
                    {allTasksDone && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-center space-y-1 animate-in fade-in">
                            <span className="text-xl">🎉</span>
                            <h3 className="text-sm font-black text-emerald-300">All Tasks Finished!</h3>
                            <p className="text-xs text-zinc-300">Great job! You can now mark the vehicle ready for delivery below.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                TAB 2: PARTS & CHEMICALS CONSUMED
            ══════════════════════════════════════════════════════ */}
            {activeTab === "PARTS" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                                Parts & Chemicals Used
                            </h2>
                            <p className="text-[11px] text-zinc-400">Track oil, filters, bottles or parts consumed</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowAddPart(!showAddPart)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Custom</span>
                        </button>
                    </div>

                    {/* Quick 1-Tap Chips */}
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">
                            1-Tap Quick Add:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_PARTS.map((qp, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => quickAddPart(qp)}
                                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#16acd4]/20 hover:text-[#16acd4] border border-white/5 hover:border-[#16acd4]/30 text-xs font-bold text-zinc-300 transition-all active:scale-95 flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3 text-[#16acd4]" />
                                    <span>{qp.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Add Part Form */}
                    {showAddPart && (
                        <div className="p-4 rounded-2xl bg-[#14141a] border border-[#16acd4]/30 space-y-3 animate-in fade-in">
                            <p className="text-[11px] font-bold text-[#16acd4] uppercase">Add Part or Chemical</p>
                            <input
                                type="text"
                                autoFocus
                                placeholder="Item name (e.g. Front Brake Pad)..."
                                value={newPartName}
                                onChange={e => setNewPartName(e.target.value)}
                                className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                            />
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-[#1a1a24] border border-white/10 rounded-xl px-2 py-1">
                                    <span className="text-[11px] text-zinc-500">Qty:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newPartQty}
                                        onChange={e => setNewPartQty(Number(e.target.value) || 1)}
                                        className="w-12 bg-transparent text-xs text-white font-bold text-center focus:outline-none"
                                    />
                                </div>
                                <select
                                    value={newPartUnit}
                                    onChange={e => setNewPartUnit(e.target.value)}
                                    className="bg-[#1a1a24] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                >
                                    <option value="PCS">Pcs</option>
                                    <option value="L">Liter (L)</option>
                                    <option value="BOTTLE">Bottle</option>
                                    <option value="CAN">Can</option>
                                    <option value="SET">Set</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={addConsumedPart}
                                    className="px-4 py-2 rounded-xl bg-[#16acd4] text-black font-extrabold text-xs ml-auto active:scale-95"
                                >
                                    Add Item
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddPart(false)}
                                    className="p-2 rounded-xl bg-white/5 text-zinc-400"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Consumed list */}
                    <div className="space-y-2">
                        {partsConsumed.length === 0 ? (
                            <div className="py-6 text-center rounded-2xl bg-white/5 border border-white/5 p-4">
                                <p className="text-xs text-zinc-400 font-medium">No parts or chemicals recorded yet.</p>
                                <p className="text-[11px] text-zinc-500 mt-0.5">Tap any of the quick buttons above to add items used.</p>
                            </div>
                        ) : (
                            partsConsumed.map(part => (
                                <div
                                    key={part.id}
                                    className="p-3.5 rounded-2xl bg-[#141419] border border-white/10 flex items-center justify-between gap-3"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-white">{part.name}</p>
                                        <p className="text-[11px] font-mono text-amber-400">
                                            {part.qty} {part.unit} used
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {/* Stepper [- 1 +] */}
                                        <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-1">
                                            <button
                                                type="button"
                                                onClick={() => changePartQty(part.id, -1)}
                                                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center"
                                            >
                                                -
                                            </button>
                                            <span className="w-6 text-center text-xs font-mono font-bold text-white">
                                                {part.qty}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => changePartQty(part.id, 1)}
                                                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeConsumedPart(part.id)}
                                            className="p-2 rounded-xl text-zinc-600 hover:text-red-400 transition-colors"
                                            title="Delete Part"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                TAB 3: TECHNICIAN WORK NOTES & PHOTOS
            ══════════════════════════════════════════════════════ */}
            {activeTab === "NOTES" && (
                <div className="space-y-4">
                    {/* Work Notes */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-[#141419] border border-white/10 space-y-3">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-400" />
                            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                                Technician Work Notes
                            </h2>
                        </div>

                        {/* Quick Notes Chips */}
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">
                                1-Tap Quick Note:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_NOTES.map((qn, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => appendQuickNote(qn)}
                                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 border border-white/5 text-[11px] font-medium text-zinc-300 transition-all text-left"
                                    >
                                        + {qn}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <textarea
                            rows={4}
                            placeholder="Type any findings, work details, or comments here..."
                            value={workSummary}
                            onChange={e => setWorkSummary(e.target.value)}
                            onBlur={() => autoSave({ workSummary })}
                            className="w-full bg-[#17171d] border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#16acd4] leading-relaxed"
                        />
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => autoSave({ workSummary })}
                                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
                            >
                                Save Notes
                            </button>
                        </div>
                    </div>

                    {/* Photos */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-[#141419] border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Camera className="w-4 h-4 text-blue-400" />
                                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                                    Work Photos ({workImages.length})
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddImage(!showAddImage)}
                                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Photo</span>
                            </button>
                        </div>

                        {showAddImage && (
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="text"
                                    placeholder="Paste photo link/URL..."
                                    value={newImageUrl}
                                    onChange={e => setNewImageUrl(e.target.value)}
                                    className="flex-1 bg-[#1a1a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                                />
                                <button
                                    type="button"
                                    onClick={addImage}
                                    className="px-3.5 py-2 rounded-xl bg-[#16acd4] text-black font-bold text-xs"
                                >
                                    Add
                                </button>
                            </div>
                        )}

                        {workImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                {workImages.map((imgUrl, idx) => (
                                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/40">
                                        <img src={imgUrl} alt={`Work photo ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-red-400"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-500 italic">No photos attached yet.</p>
                        )}
                    </div>
                </div>
            )}

            {/* ── Big Prominent Bottom Primary Action Button ── */}
            <div className="pt-2">
                {status !== "COMPLETED" ? (
                    <button
                        type="button"
                        onClick={handleCompleteEverything}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all"
                    >
                        <CheckCheck className="w-5 h-5 stroke-[2.5]" />
                        <span>Mark Car Finished &amp; Ready for Delivery</span>
                    </button>
                ) : (
                    <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-sm">
                            <ShieldCheck className="w-5 h-5" />
                            <span>Vehicle Service Completed &amp; Ready for Delivery</span>
                        </div>
                        <Link
                            href="/staff/jobs"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                        >
                            <span>Return to Jobs Queue</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
