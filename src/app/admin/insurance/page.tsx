'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Plus, Search, Filter, FileText, RefreshCw, ChevronLeft, ChevronRight, Eye } from "lucide-react"

interface InsuranceClaim {
    id: string
    claimNumber: string
    vehicleMake: string
    vehicleModel: string
    vehicleYear: string
    policyNumber: string
    claimType: string
    estimatedDamage: number | null
    status: string
    createdAt: string
    source: string
    user?: {
        name: string
        email: string
    }
}

interface ClaimStats {
    total: number
    submitted: number
    underReview: number
    approved: number
    rejected: number
    completed: number
}

export default function InsurancePage() {
    const router = useRouter()
    const [claims, setClaims] = useState<InsuranceClaim[]>([])
    const [stats, setStats] = useState<ClaimStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showFilters, setShowFilters] = useState(false)

    const fetchClaims = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: '10',
                source: 'WALK_IN'
            })
            if (search) params.append('search', search)
            if (statusFilter) params.append('status', statusFilter)

            const response = await fetch(`/api/admin/insurance-claims?${params}`)
            const data = await response.json()

            if (response.ok) {
                setClaims(data.claims || [])
                setTotalPages(data.pagination?.totalPages || 1)
            }
        } catch (error) {
            console.error('Error fetching claims:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/insurance-claims?statsOnly=true')
            const data = await response.json()
            if (response.ok) {
                setStats(data)
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    useEffect(() => {
        fetchClaims()
        fetchStats()
    }, [page, statusFilter])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchClaims()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED":
            case "COMPLETED":
                return { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e" }
            case "UNDER_REVIEW":
                return { bg: "rgba(255, 75, 85, 0.1)", text: "#ff4b55" }
            case "PENDING_DOCUMENTS":
                return { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6" }
            case "REJECTED":
                return { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" }
            case "SUBMITTED":
                return { bg: "rgba(168, 85, 247, 0.1)", text: "#a855f7" }
            default:
                return { bg: "rgba(100, 116, 139, 0.1)", text: "#64748b" }
        }
    }

    const formatCurrency = (amount: number | null) => {
        if (!amount) return '-'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ')
    }

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'SUBMITTED', label: 'Submitted' },
        { value: 'UNDER_REVIEW', label: 'Under Review' },
        { value: 'PENDING_DOCUMENTS', label: 'Pending Documents' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'COMPLETED', label: 'Completed' },
    ]

    const statCards = [
        { label: "Total Claims", value: stats?.total || 0 },
        { label: "Submitted", value: stats?.submitted || 0 },
        { label: "Under Review", value: stats?.underReview || 0 },
        { label: "Approved", value: stats?.approved || 0 },
    ]

    return (
        <div className="space-y-6 pb-12 bg-slate-50 min-h-screen p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-xl">
                            <Shield className="w-6 h-6 text-accent" />
                        </div>
                        Insurance - Walk-in Claims
                    </h2>
                    <p className="mt-1 text-slate-500 text-sm font-medium">Manage walk-in insurance claims created by admin</p>
                </div>
                <button
                    onClick={() => router.push('/admin/insurance/new')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:translate-y-[-1px] bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent/90 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    New Walk-in Claim
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md group"
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-accent transition-colors">{stat.label}</p>
                        <div className="flex items-end gap-2 mt-2">
                            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm"
            >
                <form onSubmit={handleSearch} className="flex-1 relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by claim ID, policy, vehicle..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-medium placeholder:text-slate-300"
                    />
                </form>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none transition-all"
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => { setPage(1); fetchClaims(); fetchStats(); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all bg-slate-50 border border-slate-100 hover:bg-white text-slate-600 font-bold text-xs"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Table */}
            <div
                className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm"
            >
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="w-8 h-8 animate-spin text-accent" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching claims...</p>
                        </div>
                    </div>
                ) : claims.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-4">
                            <Shield className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-lg font-black text-slate-900">No claims found</p>
                        <p className="text-sm text-slate-500 font-medium">Create a walk-in claim to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Claim Details</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Policy</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="text-right px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {claims.map((claim) => {
                                    const statusColor = getStatusColor(claim.status)
                                    return (
                                        <tr
                                            key={claim.id}
                                            className="transition-all hover:bg-slate-50/50 cursor-pointer group"
                                            onClick={() => router.push(`/admin/insurance/${claim.id}`)}
                                        >
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-black text-accent">{claim.claimNumber}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{formatDate(claim.createdAt)}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-slate-900">{claim.user?.name || '-'}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{claim.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-slate-900">{claim.vehicleMake} {claim.vehicleModel}</div>
                                                <div className="text-[10px] text-slate-400 font-bold tracking-widest">{claim.vehicleYear} • {claim.claimType}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-mono font-bold text-slate-600">{claim.policyNumber}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-black text-slate-900">{formatCurrency(claim.estimatedDamage)}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span
                                                    className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center w-fit gap-1.5"
                                                    style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor.text }}></div>
                                                    {formatStatus(claim.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); router.push(`/admin/insurance/${claim.id}`); }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 transition-all hover:bg-accent/10 hover:text-accent border border-slate-100 hover:border-accent/20"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div
                        className="flex items-center justify-between px-6 py-5 bg-slate-50/30"
                        style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2.5 rounded-xl transition-all bg-white border border-slate-200 text-slate-400 hover:text-accent hover:border-accent/20 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2.5 rounded-xl transition-all bg-white border border-slate-200 text-slate-400 hover:text-accent hover:border-accent/20 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
