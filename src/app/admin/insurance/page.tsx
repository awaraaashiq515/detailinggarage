'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Plus, Search, Filter, FileText, RefreshCw, ChevronLeft, ChevronRight, Eye, Zap, Car } from "lucide-react"

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
    isEv?: boolean
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
    evTotal?: number
}

export default function InsurancePage() {
    const router = useRouter()
    const [claims, setClaims] = useState<InsuranceClaim[]>([])
    const [stats, setStats] = useState<ClaimStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'standard' | 'ev'>('all')
    const [shopFilter, setShopFilter] = useState('all')
    const [shops, setShops] = useState<any[]>([])
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
            if (shopFilter && shopFilter !== 'all') params.append('shopId', shopFilter)
            if (categoryFilter === 'ev') params.append('isEv', 'true')
            if (categoryFilter === 'standard') params.append('isEv', 'false')

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
            const params = new URLSearchParams({ statsOnly: 'true' })
            if (shopFilter && shopFilter !== 'all') params.append('shopId', shopFilter)
            const response = await fetch(`/api/admin/insurance-claims?${params}`)
            const data = await response.json()
            if (response.ok) {
                setStats(data)
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    const fetchShops = async () => {
        try {
            const res = await fetch('/api/admin/shops')
            if (res.ok) {
                const data = await res.json()
                setShops(data.shops || [])
            }
        } catch (e) {
            console.error('Error fetching shops:', e)
        }
    }

    useEffect(() => {
        fetchShops()
    }, [])

    useEffect(() => {
        fetchClaims()
        fetchStats()
    }, [page, statusFilter, shopFilter, categoryFilter])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchClaims()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED":
            case "COMPLETED":
                return { bg: "rgba(34, 197, 94, 0.1)", text: "#16a34a" }
            case "UNDER_REVIEW":
                return { bg: "rgba(255, 75, 85, 0.1)", text: "#ff4b55" }
            case "PENDING_DOCUMENTS":
                return { bg: "rgba(59, 130, 246, 0.1)", text: "#2563eb" }
            case "REJECTED":
                return { bg: "rgba(239, 68, 68, 0.1)", text: "#dc2626" }
            case "SUBMITTED":
                return { bg: "rgba(168, 85, 247, 0.1)", text: "#9333ea" }
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

    const evCount = stats?.evTotal || 0
    const standardCount = Math.max(0, (stats?.total || 0) - evCount)

    const statCards = [
        { label: "Total Claims", value: stats?.total || 0, isEv: false },
        { label: "⚡ EV Claims", value: evCount, isEv: true },
        { label: "Submitted", value: stats?.submitted || 0, isEv: false },
        { label: "Approved", value: stats?.approved || 0, isEv: false },
    ]

    const getClaimViewUrl = (claim: InsuranceClaim) => {
        return claim.isEv
            ? `/admin/insurance/ev-view/${claim.id}`
            : `/admin/insurance/${claim.id}`
    }

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
                    <p className="mt-1 text-slate-500 text-sm font-medium">Manage walk-in insurance claims across all workshop branches</p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => router.push('/admin/insurance/new')}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent/90 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        New Claim
                    </button>
                    <button
                        onClick={() => router.push('/admin/insurance/ev-new')}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 text-white shadow-lg shadow-cyan-500/25 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                    >
                        <Zap className="w-4 h-4" />
                        New EV Claim
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md group ${
                            stat.isEv ? 'bg-cyan-50/50 border-cyan-200' : 'bg-white border-slate-200'
                        }`}
                    >
                        <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                            stat.isEv ? 'text-cyan-700' : 'text-slate-400 group-hover:text-accent'
                        }`}>
                            {stat.label}
                        </p>
                        <div className="flex items-end gap-2 mt-2">
                            <p className={`text-3xl font-black ${stat.isEv ? 'text-cyan-800' : 'text-slate-900'}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Powertrain Filter Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 w-fit shadow-sm">
                <button
                    type="button"
                    onClick={() => { setCategoryFilter('all'); setPage(1); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        categoryFilter === 'all'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                    All Claims ({stats?.total || 0})
                </button>
                <button
                    type="button"
                    onClick={() => { setCategoryFilter('standard'); setPage(1); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        categoryFilter === 'standard'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Car className="w-3.5 h-3.5 text-orange-500" />
                    <span>Standard ICE ({standardCount})</span>
                </button>
                <button
                    type="button"
                    onClick={() => { setCategoryFilter('ev'); setPage(1); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        categoryFilter === 'ev'
                            ? 'bg-cyan-600 text-white shadow-sm'
                            : 'text-cyan-700 hover:text-cyan-900'
                    }`}
                >
                    <Zap className="w-3.5 h-3.5 text-cyan-500" />
                    <span>⚡ EV Claims ({evCount})</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
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
                <select
                    value={shopFilter}
                    onChange={(e) => { setShopFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none transition-all"
                >
                    <option value="all">All Workshop Branches</option>
                    {shops.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                </select>
                <button
                    onClick={() => { setPage(1); fetchClaims(); fetchStats(); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-bold text-xs"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Table */}
            <div className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-8 h-8 animate-spin text-accent" />
                    </div>
                ) : claims.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Shield className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-lg font-bold text-slate-700">No claims found</p>
                        <p className="text-sm text-slate-400 mt-1">
                            {categoryFilter === 'ev' ? 'No EV claims registered yet' : 'Create an insurance claim to get started'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
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
                                    const isEV = !!claim.isEv
                                    const viewUrl = getClaimViewUrl(claim)

                                    return (
                                        <tr
                                            key={claim.id}
                                            className="transition-all hover:bg-slate-50/50 cursor-pointer group"
                                            onClick={() => router.push(viewUrl)}
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-black ${isEV ? 'text-cyan-700' : 'text-accent'}`}>
                                                        {claim.claimNumber}
                                                    </span>
                                                    {isEV && (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                                                            <Zap className="w-2.5 h-2.5" /> EV
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{formatDate(claim.createdAt)}</div>
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                                    {(claim as any).shop?.name || "Main Admin HQ"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-slate-900">{claim.user?.name || '-'}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{claim.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`text-sm font-bold transition-colors ${isEV ? 'text-cyan-900 group-hover:text-cyan-700' : 'text-slate-900 group-hover:text-accent'}`}>
                                                    {claim.vehicleMake} {claim.vehicleModel}
                                                </div>
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
                                                    onClick={(e) => { e.stopPropagation(); router.push(viewUrl); }}
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        isEV
                                                            ? 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200'
                                                            : 'bg-slate-50 text-slate-400 transition-all hover:bg-accent/10 hover:text-accent border-slate-100 hover:border-accent/20'
                                                    }`}
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View {isEV && 'EV'}
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
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-900 disabled:opacity-40"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <span className="text-xs font-bold text-slate-400">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-900 disabled:opacity-40"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
