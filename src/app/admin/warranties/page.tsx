"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    ShieldCheck,
    Plus,
    Search,
    Filter,
    Calendar,
    FileText,
    Printer,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
    X,
    ExternalLink,
    Car,
    User,
    AlertCircle,
    Check
} from "lucide-react"
import { toast } from "react-hot-toast"

interface WarrantyItem {
    id: string
    certificateNumber: string
    type: string
    productPackage?: string | null
    coverageArea?: string | null
    customerName: string
    customerPhone: string
    vin?: string | null
    vehicleReg?: string | null
    invoiceNo?: string | null
    startDate: string
    endDate: string
    years: number
    requiresAnnualInspection: boolean
    nextInspectionDate?: string | null
    status: string
    terms?: string | null
    notes?: string | null
    inspections?: {
        id: string
        date: string
        inspector?: string | null
        notes?: string | null
        status: string
    }[]
}

const SERVICE_TYPES = [
    "Ceramic Coating",
    "Graphene Coating",
    "PPF",
    "Music Systems & Dash Cams",
    "Accessories",
    "4x4 & Modification",
    "Denting & Painting",
    "Spare Parts",
    "Other"
]

const DEFAULT_TERMS = "Covers product defects such as peeling, yellowing, cracking or loss of performance under normal use. Excludes accident damage, improper washing, chemical damage and work by non-authorised installers."

export default function AdminWarrantiesPage() {
    const [warranties, setWarranties] = useState<WarrantyItem[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false)
    const [editingWarranty, setEditingWarranty] = useState<WarrantyItem | null>(null)
    const [selectedWarrantyForInspection, setSelectedWarrantyForInspection] = useState<WarrantyItem | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        certificateNumber: "",
        type: "Ceramic Coating",
        productPackage: "",
        coverageArea: "",
        customerName: "",
        customerPhone: "",
        vin: "",
        vehicleReg: "",
        invoiceNo: "",
        startDate: new Date().toISOString().split("T")[0],
        years: 3,
        requiresAnnualInspection: true,
        terms: DEFAULT_TERMS
    })

    // Inspection form state
    const [inspectionData, setInspectionData] = useState({
        inspector: "",
        notes: "Annual maintenance check completed. Coating hydrophobic properties intact.",
        status: "PASSED",
        date: new Date().toISOString().split("T")[0]
    })

    // Fetch warranties
    const fetchWarranties = async () => {
        try {
            const queryParams = new URLSearchParams()
            if (search) queryParams.set("search", search)
            if (statusFilter !== "ALL") queryParams.set("status", statusFilter)

            const res = await fetch(`/api/admin/warranties?${queryParams.toString()}`)
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()
            setWarranties(data.warranties || [])
        } catch (err: any) {
            console.error(err)
            toast.error("Failed to load warranties")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWarranties()
    }, [statusFilter])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        fetchWarranties()
    }

    // Open Issue / Edit Modal
    const handleOpenIssueModal = (item?: WarrantyItem) => {
        if (item) {
            setEditingWarranty(item)
            setFormData({
                certificateNumber: item.certificateNumber,
                type: item.type,
                productPackage: item.productPackage || "",
                coverageArea: item.coverageArea || "",
                customerName: item.customerName,
                customerPhone: item.customerPhone,
                vin: item.vin || "",
                vehicleReg: item.vehicleReg || "",
                invoiceNo: item.invoiceNo || "",
                startDate: new Date(item.startDate).toISOString().split("T")[0],
                years: item.years,
                requiresAnnualInspection: item.requiresAnnualInspection,
                terms: item.terms || DEFAULT_TERMS
            })
        } else {
            setEditingWarranty(null)
            const randomCode = Math.floor(100000 + Math.random() * 900000)
            setFormData({
                certificateNumber: `DG-WAR-${randomCode}`,
                type: "Ceramic Coating",
                productPackage: "Ceramic – 3 layer",
                coverageArea: "Full Body",
                customerName: "",
                customerPhone: "",
                vin: "",
                vehicleReg: "",
                invoiceNo: "",
                startDate: new Date().toISOString().split("T")[0],
                years: 3,
                requiresAnnualInspection: true,
                terms: DEFAULT_TERMS
            })
        }
        setIsModalOpen(true)
    }

    // Save warranty
    const handleSaveWarranty = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.customerName || !formData.customerPhone) {
            toast.error("Please fill customer name and phone")
            return
        }

        setSubmitting(true)
        try {
            const url = editingWarranty
                ? `/api/admin/warranties/${editingWarranty.id}`
                : `/api/admin/warranties`
            const method = editingWarranty ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to save")
            }

            toast.success(editingWarranty ? "Warranty updated successfully!" : "Warranty issued successfully!")
            setIsModalOpen(false)
            fetchWarranties()
        } catch (err: any) {
            toast.error(err.message || "Failed to save warranty")
        } finally {
            setSubmitting(false)
        }
    }

    // Delete warranty
    const handleDeleteWarranty = async (id: string, cert: string) => {
        if (!confirm(`Are you sure you want to delete warranty ${cert}?`)) return
        try {
            const res = await fetch(`/api/admin/warranties/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("Warranty deleted")
            setWarranties(warranties.filter(w => w.id !== id))
        } catch (err: any) {
            toast.error(err.message || "Could not delete warranty")
        }
    }

    // Open Inspection Modal
    const handleOpenInspectionModal = (w: WarrantyItem) => {
        setSelectedWarrantyForInspection(w)
        setInspectionData({
            inspector: "Technician",
            notes: "Annual maintenance inspection passed. Coating hydrophobic properties intact.",
            status: "PASSED",
            date: new Date().toISOString().split("T")[0]
        })
        setIsInspectionModalOpen(true)
    }

    // Save Inspection
    const handleSaveInspection = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedWarrantyForInspection) return
        setSubmitting(true)
        try {
            const res = await fetch(`/api/admin/warranties/${selectedWarrantyForInspection.id}/inspection`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(inspectionData)
            })
            if (!res.ok) throw new Error("Failed to record inspection")
            toast.success("Inspection recorded! Next inspection date extended by 1 year.")
            setIsInspectionModalOpen(false)
            fetchWarranties()
        } catch (err: any) {
            toast.error(err.message || "Failed to log inspection")
        } finally {
            setSubmitting(false)
        }
    }

    const formatDate = (d?: string | Date | null) => {
        if (!d) return "—"
        return new Date(d).toISOString().split("T")[0]
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
            {/* ─── Top Header (Matching Image 3) ───────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide uppercase font-['Saira_Semi_Condensed'] text-[#16acd4]">
                        WARRANTIES
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Registered against VIN + vehicle no. Customers can check them on the website.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/report-warranty"
                        target="_blank"
                        className="px-4 py-2 rounded-xl border border-[#16acd4]/30 bg-[#16acd4]/10 text-xs font-semibold text-[#16acd4] hover:bg-[#16acd4]/20 flex items-center gap-1.5 transition"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Website View
                    </Link>
                    <button
                        onClick={() => handleOpenIssueModal()}
                        className="px-5 py-2.5 rounded-xl bg-[#16acd4] hover:bg-[#1499be] text-black text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#16acd4]/20 transition"
                    >
                        <Plus className="w-4 h-4" /> Issue warranty
                    </button>
                </div>
            </div>

            {/* ─── Filter & Search Bar ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 bg-[#0e1316] p-3 rounded-2xl border border-white/10">
                <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by Cert #, Customer, Phone, VIN, or Vehicle Reg..."
                            className="w-full bg-[#07090b] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#16acd4]/20 border border-[#16acd4]/40 text-[#16acd4] text-xs font-bold rounded-xl hover:bg-[#16acd4]/30 transition"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-mono">Status:</span>
                    {["ALL", "Active", "Expired", "Void"].map(st => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                                statusFilter === st
                                    ? "bg-[#16acd4] text-black font-bold"
                                    : "bg-[#07090b] text-zinc-400 hover:text-white border border-white/5"
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Warranties Table (Matching Image 3) ──────────────────────── */}
            <div className="bg-[#0e1316] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#07090b] border-b border-white/10 text-[11px] font-mono uppercase text-[#16acd4] tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Certificate</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">VIN / Reg</th>
                                <th className="px-6 py-4">Period</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-zinc-500 font-mono text-xs">
                                        Loading warranties...
                                    </td>
                                </tr>
                            ) : warranties.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-zinc-500 font-mono text-xs">
                                        No warranties found. Click "+ Issue warranty" to create one.
                                    </td>
                                </tr>
                            ) : (
                                warranties.map(w => (
                                    <tr key={w.id} className="hover:bg-white/[0.02] transition">
                                        {/* Certificate */}
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-white text-xs tracking-wider">
                                                {w.certificateNumber}
                                            </span>
                                            {w.coverageArea && (
                                                <div className="text-[11px] text-zinc-500">
                                                    {w.coverageArea}
                                                </div>
                                            )}
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white text-xs">
                                                {w.type}
                                            </div>
                                            <div className="text-[11px] text-zinc-400">
                                                {w.productPackage || "Standard"}
                                            </div>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white text-xs">
                                                {w.customerName}
                                            </div>
                                            <div className="text-[11px] font-mono text-zinc-400">
                                                {w.customerPhone}
                                            </div>
                                        </td>

                                        {/* VIN / Reg */}
                                        <td className="px-6 py-4 font-mono text-xs">
                                            <div className="text-white">
                                                {w.vin || "—"}
                                            </div>
                                            <div className="text-zinc-400">
                                                {w.vehicleReg || "—"}
                                            </div>
                                        </td>

                                        {/* Period */}
                                        <td className="px-6 py-4 font-mono text-xs">
                                            <div className="text-white">
                                                {formatDate(w.startDate)} → {formatDate(w.endDate)}
                                            </div>
                                            {w.nextInspectionDate && (
                                                <div className="text-[11px] text-zinc-400">
                                                    Next inspection {formatDate(w.nextInspectionDate)}
                                                </div>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                {w.status || "Active"}
                                            </span>
                                        </td>

                                        {/* Actions (Matching Image 3: PDF, + Inspection, Edit) */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/warranty/certificate/${w.id}`}
                                                    target="_blank"
                                                    title="View / Print Certificate"
                                                    className="px-2.5 py-1 bg-[#16acd4] hover:bg-[#1499be] text-black font-bold text-xs rounded transition flex items-center gap-1"
                                                >
                                                    PDF
                                                </Link>
                                                {w.requiresAnnualInspection && (
                                                    <button
                                                        onClick={() => handleOpenInspectionModal(w)}
                                                        title="Log Annual Inspection"
                                                        className="px-2.5 py-1 bg-transparent hover:bg-white/5 border border-white/20 text-white text-xs font-semibold rounded transition"
                                                    >
                                                        + Inspection
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenIssueModal(w)}
                                                    title="Edit Warranty"
                                                    className="px-2.5 py-1 bg-transparent hover:bg-white/5 border border-white/20 text-zinc-300 hover:text-white text-xs font-semibold rounded transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteWarranty(w.id, w.certificateNumber)}
                                                    title="Delete Warranty"
                                                    className="p-1 text-zinc-500 hover:text-red-400 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ─── MODAL: ISSUE / EDIT WARRANTY (Matching Image 2) ─────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#0e1316] border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide font-['Saira_Semi_Condensed'] text-white">
                                {editingWarranty ? "EDIT WARRANTY" : "ISSUE WARRANTY"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-zinc-400 hover:text-white p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveWarranty} className="p-6 space-y-4">
                            {/* Row 1: TYPE, PRODUCT/BRAND/PACKAGE, COVERAGE AREA */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    >
                                        {SERVICE_TYPES.map(st => (
                                            <option key={st} value={st}>{st}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                        Product / Brand / Package
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.productPackage}
                                        onChange={e => setFormData({ ...formData, productPackage: e.target.value })}
                                        placeholder="e.g. Ceramic – 3 layer"
                                        className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                        Coverage Area
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.coverageArea}
                                        onChange={e => setFormData({ ...formData, coverageArea: e.target.value })}
                                        placeholder="e.g. Full Body"
                                        className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            {/* Row 2: CUSTOMER, PHONE, VIN / CHASSIS */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                        Customer *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customerName}
                                        onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                        placeholder="Customer Full Name"
                                        className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                        Phone *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customerPhone}
                                        onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                        placeholder="10-digit Mobile"
                                        className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                        VIN / Chassis
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.vin}
                                        onChange={e => setFormData({ ...formData, vin: e.target.value })}
                                        placeholder="Chassis Number"
                                        className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            {/* Row 3: VEHICLE REG. NO., INVOICE NO., START DATE */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                        Vehicle Reg. No.
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.vehicleReg}
                                        onChange={e => setFormData({ ...formData, vehicleReg: e.target.value })}
                                        placeholder="e.g. HP-33-X-0000"
                                        className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                        Invoice No.
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.invoiceNo}
                                        onChange={e => setFormData({ ...formData, invoiceNo: e.target.value })}
                                        placeholder="e.g. INV-2026-001"
                                        className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            {/* Row 4: YEARS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                        Years
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={15}
                                        value={formData.years}
                                        onChange={e => setFormData({ ...formData, years: Number(e.target.value) })}
                                        className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                        Certificate Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.certificateNumber}
                                        onChange={e => setFormData({ ...formData, certificateNumber: e.target.value })}
                                        placeholder="e.g. DG-WAR-SAMPLE1"
                                        className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            {/* Checkbox: Requires annual inspection to stay valid */}
                            <div className="pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                                    <input
                                        type="checkbox"
                                        checked={formData.requiresAnnualInspection}
                                        onChange={e => setFormData({ ...formData, requiresAnnualInspection: e.target.checked })}
                                        className="rounded border-zinc-700 text-[#16acd4] focus:ring-[#16acd4]"
                                    />
                                    <span>Requires annual inspection to stay valid</span>
                                </label>
                            </div>

                            {/* TERMS / EXCLUSIONS */}
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                    Terms / Exclusions
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.terms}
                                    onChange={e => setFormData({ ...formData, terms: e.target.value })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-[#16acd4] resize-none leading-relaxed"
                                />
                            </div>

                            {/* Buttons (Matching Image 2: Save warranty + Cancel) */}
                            <div className="flex items-center gap-3 pt-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl bg-[#16acd4] hover:bg-[#1499be] text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
                                >
                                    {submitting ? "Saving..." : "Save warranty"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl bg-[#1a2328] hover:bg-[#222e35] text-zinc-300 text-xs font-semibold transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── MODAL: LOG INSPECTION ──────────────────────────────────── */}
            {isInspectionModalOpen && selectedWarrantyForInspection && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0e1316] border border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                            <div>
                                <h2 className="text-xl font-extrabold uppercase font-['Saira_Semi_Condensed'] text-[#16acd4]">
                                    Log Annual Inspection
                                </h2>
                                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                                    {selectedWarrantyForInspection.certificateNumber} • {selectedWarrantyForInspection.customerName}
                                </p>
                            </div>
                            <button onClick={() => setIsInspectionModalOpen(false)} className="text-zinc-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveInspection} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                    Inspection Date
                                </label>
                                <input
                                    type="date"
                                    value={inspectionData.date}
                                    onChange={e => setInspectionData({ ...inspectionData, date: e.target.value })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                    Inspector / Technician Name
                                </label>
                                <input
                                    type="text"
                                    value={inspectionData.inspector}
                                    onChange={e => setInspectionData({ ...inspectionData, inspector: e.target.value })}
                                    placeholder="e.g. Ritchie / Studio Lead"
                                    className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                    Status
                                </label>
                                <select
                                    value={inspectionData.status}
                                    onChange={e => setInspectionData({ ...inspectionData, status: e.target.value })}
                                    className="w-full bg-[#07090b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                >
                                    <option value="PASSED">Passed (Warranty Valid)</option>
                                    <option value="ATTENTION_NEEDED">Attention Needed / Top-up Required</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                                    Inspection Notes & Findings
                                </label>
                                <textarea
                                    rows={3}
                                    value={inspectionData.notes}
                                    onChange={e => setInspectionData({ ...inspectionData, notes: e.target.value })}
                                    placeholder="Observations on paint condition, hydrophobic effect, wash quality..."
                                    className="w-full bg-[#07090b] border border-white/10 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-[#16acd4] resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl bg-[#16acd4] hover:bg-[#1499be] text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
                                >
                                    {submitting ? "Saving..." : "Save & Extend 1 Year"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsInspectionModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl bg-[#1a2328] hover:bg-[#222e35] text-zinc-300 text-xs font-semibold transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

