"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Plus,
    Edit2,
    Trash2,
    Package,
    ToggleLeft,
    ToggleRight,
    Search,
    Filter,
    Loader2,
    AlertCircle
} from "lucide-react"

interface PackageData {
    id: string
    name: string
    type: "PDI" | "INSURANCE" | "SERVICE"
    description: string
    services: string[]
    price: number
    duration: number | null
    status: "ACTIVE" | "INACTIVE"
    createdAt: string
    updatedAt: string
}

const typeColors = {
    PDI: { bg: "#eff6ff", text: "#2563eb", border: "#dbeafe" },
    INSURANCE: { bg: "#f0fdf4", text: "#16a34a", border: "#dcfce7" },
    SERVICE: { bg: "#faf5ff", text: "#9333ea", border: "#f3e8ff" },
}

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState<PackageData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<string>("ALL")
    const [filterStatus, setFilterStatus] = useState<string>("ALL")
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)

    useEffect(() => {
        fetchPackages()
    }, [])

    const fetchPackages = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/packages")
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch packages")
            }

            setPackages(data.packages)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async (pkg: PackageData) => {
        try {
            setTogglingId(pkg.id)
            const newStatus = pkg.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"

            const res = await fetch(`/api/packages/${pkg.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!res.ok) {
                throw new Error("Failed to update status")
            }

            setPackages(prev =>
                prev.map(p => (p.id === pkg.id ? { ...p, status: newStatus } : p))
            )
        } catch (err) {
            console.error("Toggle error:", err)
        } finally {
            setTogglingId(null)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return

        try {
            setDeletingId(id)
            const res = await fetch(`/api/packages/${id}`, { method: "DELETE" })

            if (!res.ok) {
                throw new Error("Failed to delete package")
            }

            setPackages(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            console.error("Delete error:", err)
        } finally {
            setDeletingId(null)
        }
    }

    const filteredPackages = packages.filter(pkg => {
        const matchesSearch =
            pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === "ALL" || pkg.type === filterType
        const matchesStatus = filterStatus === "ALL" || pkg.status === filterStatus

        return matchesSearch && matchesType && matchesStatus
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-red-400">{error}</p>
                <button onClick={fetchPackages} className="btn-primary">
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Package className="w-7 h-7 text-accent" />
                        Package Management
                    </h1>
                    <p className="text-sm mt-1 text-slate-500 font-medium">
                        Manage PDI, Insurance, and Service packages
                    </p>
                </div>
                </div>

                <Link
                    href="/admin/packages/create"
                    className="btn-primary inline-flex items-center gap-2 w-fit"
                >
                    <Plus className="w-5 h-5" />
                    Create Package
                </Link>
            </div>

            {/* Filters */}
            <div
                className="p-5 bg-white border border-slate-100 rounded-xl flex flex-col md:flex-row gap-4 shadow-sm"
            >
                {/* Search */}
                <div className="flex-1 relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                    />
                    <input
                        type="text"
                        placeholder="Search packages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-300 text-slate-900 placeholder-slate-400 transition-all"
                    />
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer text-slate-900 focus:border-slate-300 transition-all"
                    >
                        <option value="ALL">All Types</option>
                        <option value="PDI">PDI</option>
                        <option value="INSURANCE">Insurance</option>
                        <option value="SERVICE">Service</option>
                    </select>
                </div>

                {/* Status Filter */}
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer text-slate-900 focus:border-slate-300 transition-all"
                >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
            </div>

            {/* Packages Grid */}
            {filteredPackages.length === 0 ? (
                <div
                    className="text-center py-16 bg-white border border-slate-100 rounded-xl shadow-sm"
                >
                    <Package className="w-16 h-16 mx-auto mb-4 text-slate-100" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No packages found</h3>
                    <p className="text-slate-500 font-medium">
                        {packages.length === 0
                            ? "Create your first package to get started"
                            : "Try adjusting your search or filters"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPackages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span
                                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                        style={{
                                            backgroundColor: typeColors[pkg.type].bg,
                                            color: typeColors[pkg.type].text,
                                            border: `1px solid ${typeColors[pkg.type].border}`,
                                        }}
                                    >
                                        {pkg.type}
                                    </span>
                                </div>

                                {/* Status Toggle */}
                                <button
                                    onClick={() => handleToggleStatus(pkg)}
                                    disabled={togglingId === pkg.id}
                                    className="transition-opacity hover:opacity-80"
                                    title={pkg.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                >
                                    {togglingId === pkg.id ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-200" />
                                    ) : pkg.status === "ACTIVE" ? (
                                        <ToggleRight className="w-7 h-7 text-emerald-500" />
                                    ) : (
                                        <ToggleLeft className="w-7 h-7 text-slate-300" />
                                    )}
                                </button>
                            </div>

                            {/* Name & Description */}
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{pkg.name}</h3>
                            <p className="text-sm line-clamp-2 mb-4 text-slate-500 font-medium">
                                {pkg.description}
                            </p>

                            {/* Price */}
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-2xl font-black text-accent">
                                    ${pkg.price.toFixed(2)}
                                </span>
                                {pkg.duration && (
                                    <span className="text-sm text-slate-400 font-bold">
                                        / {pkg.duration} days
                                    </span>
                                )}
                            </div>

                            {/* Services Preview */}
                            <div className="mb-4">
                                <p className="text-xs font-bold mb-2 text-slate-400 uppercase tracking-widest">
                                    Included Services ({pkg.services.length})
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {pkg.services.slice(0, 3).map((service, idx) => (
                                        <span
                                            key={idx}
                                            className="text-[10px] px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-100 font-bold"
                                        >
                                            {service}
                                        </span>
                                    ))}
                                    {pkg.services.length > 3 && (
                                        <span
                                            className="text-[10px] px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100 font-bold"
                                        >
                                            +{pkg.services.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div
                                className="flex gap-2 pt-4 border-t border-slate-100"
                            >
                                <Link
                                    href={`/admin/packages/${pkg.id}/edit`}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(pkg.id)}
                                    disabled={deletingId === pkg.id}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 text-red-500 border border-red-100 text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-all shadow-sm"
                                >
                                    {deletingId === pkg.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
