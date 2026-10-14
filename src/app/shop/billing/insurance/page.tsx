'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Shield, Plus, Search, Filter, FileText, RefreshCw,
    ChevronLeft, ChevronRight, Eye, Zap, Battery, Car,
    Mail, Send, CheckCircle2, UserCheck, Phone, AlertCircle, X, Download, Paperclip,
    User, ArrowRight
} from "lucide-react"

interface InsuranceClaim {
    id: string
    claimNumber: string
    vehicleMake: string
    vehicleModel: string
    vehicleYear: string
    registrationNumber?: string
    policyNumber: string
    insuranceCompany?: string
    claimType: string
    estimatedDamage: number | null
    status: string
    isEv?: boolean
    batteryCapacity?: string
    createdAt: string
    source: string
    user?: {
        name: string
        email: string
        mobile?: string
    }
    // Surveyor Details
    surveyorName?: string | null
    surveyorEmail?: string | null
    surveyorPhone?: string | null
    surveyorCompany?: string | null
    pdfSentToSurveyorAt?: string | null
    surveyorLastEmailedTo?: string | null
    pdfUrl?: string | null
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

export default function ShopInsurancePage() {
    const router = useRouter()
    const [claims, setClaims] = useState<InsuranceClaim[]>([])
    const [stats, setStats] = useState<ClaimStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'standard' | 'ev'>('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Surveyor Modal State
    const [surveyorModalOpen, setSurveyorModalOpen] = useState(false)
    const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null)
    const [surveyorEmail, setSurveyorEmail] = useState('')
    const [surveyorName, setSurveyorName] = useState('')
    const [surveyorPhone, setSurveyorPhone] = useState('')
    const [surveyorCompany, setSurveyorCompany] = useState('')
    const [customMessage, setCustomMessage] = useState('')
    const [includeDocs, setIncludeDocs] = useState(true)
    const [sendingSurveyorPdf, setSendingSurveyorPdf] = useState(false)
    const [surveyorSuccess, setSurveyorSuccess] = useState<string | null>(null)
    const [surveyorError, setSurveyorError] = useState<string | null>(null)

    const openSurveyorModal = (e: React.MouseEvent, claim: InsuranceClaim) => {
        e.stopPropagation()
        setSelectedClaim(claim)
        setSurveyorEmail(claim.surveyorEmail || '')
        setSurveyorName(claim.surveyorName || '')
        setSurveyorPhone(claim.surveyorPhone || '')
        setSurveyorCompany(claim.surveyorCompany || claim.insuranceCompany || '')
        setCustomMessage('')
        setIncludeDocs(true)
        setSurveyorSuccess(null)
        setSurveyorError(null)
        setSurveyorModalOpen(true)
    }

    const handleSendSurveyorPdf = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedClaim) return
        if (!surveyorEmail || !surveyorEmail.includes('@')) {
            setSurveyorError('Please enter a valid surveyor email address')
            return
        }

        try {
            setSendingSurveyorPdf(true)
            setSurveyorError(null)
            setSurveyorSuccess(null)

            const res = await fetch(`/api/admin/insurance-claims/${selectedClaim.id}/send-surveyor-pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    surveyorEmail,
                    surveyorName,
                    surveyorPhone,
                    surveyorCompany,
                    customMessage,
                    includeDocuments: includeDocs
                })
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Failed to dispatch PDF to surveyor')
            }

            setSurveyorSuccess(`Insurance claim assessment PDF successfully sent to ${surveyorEmail}`)
            fetchClaims()
            fetchStats()

            setTimeout(() => {
                setSurveyorModalOpen(false)
            }, 2000)
        } catch (err: any) {
            setSurveyorError(err.message || 'Failed to email PDF to surveyor')
        } finally {
            setSendingSurveyorPdf(false)
        }
    }

    const fetchClaims = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: '10',
                source: 'WALK_IN',
                shopPortal: 'true'
            })
            if (search) params.append('search', search)
            if (statusFilter) params.append('status', statusFilter)
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
            const response = await fetch('/api/admin/insurance-claims?statsOnly=true&shopPortal=true')
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
    }, [page, statusFilter, categoryFilter])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchClaims()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED":
            case "COMPLETED":
                return { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" }
            case "UNDER_REVIEW":
                return { bg: "rgba(255, 75, 85, 0.15)", text: "#ff4b55" }
            case "PENDING_DOCUMENTS":
                return { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6" }
            case "REJECTED":
                return { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444" }
            case "SUBMITTED":
                return { bg: "rgba(168, 85, 247, 0.15)", text: "#a855f7" }
            default:
                return { bg: "rgba(100, 116, 139, 0.15)", text: "#94a3b8" }
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
            ? `/shop/billing/insurance/ev-view/${claim.id}`
            : `/shop/billing/insurance/${claim.id}`
    }

    return (
        <div className="space-y-6 pb-12 min-h-screen text-white">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-[#16acd4]/15 border border-[#16acd4]/30 rounded-xl text-[#16acd4]">
                            <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        Insurance Claims
                    </h2>
                    <p className="mt-1 text-zinc-400 text-xs sm:text-sm font-medium">Manage and file workshop insurance claims & damage evaluations</p>
                </div>

                {/* Dual Action Buttons: Standard Claim + EV Claim */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => router.push('/shop/billing/insurance/new')}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black uppercase tracking-wider text-[10px] sm:text-xs transition-all bg-[#16acd4] hover:bg-[#16acd4]/90 text-black shadow-lg shadow-[#16acd4]/25 active:scale-95"
                    >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>New Claim</span>
                    </button>

                    <button
                        onClick={() => router.push('/shop/billing/insurance/ev-new')}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black uppercase tracking-wider text-[10px] sm:text-xs transition-all active:scale-95 text-black shadow-lg"
                        style={{
                            background: "linear-gradient(135deg, #00d4ff 0%, #0077ff 100%)",
                            boxShadow: "0 4px 20px rgba(0, 212, 255, 0.4)"
                        }}
                    >
                        <Zap className="w-4 h-4 fill-black" />
                        <span>New EV Claim</span>
                    </button>
                </div>
            </div>

            {/* Interactive EV Insurance Banner */}
            <div
                className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer group transition-all"
                style={{
                    background: "linear-gradient(135deg, #07090d 0%, #0d1525 100%)",
                    border: "1px solid rgba(0, 212, 255, 0.25)",
                    boxShadow: "0 4px 20px rgba(0, 212, 255, 0.08)"
                }}
                onClick={() => { setCategoryFilter('ev'); setPage(1); }}
            >
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)" }}>
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-400 mb-0.5">DETAILING GARAGE® | EV INSURANCE</div>
                        <div className="text-sm sm:text-base font-black text-white">Electric Vehicle Insurance System</div>
                        <div className="text-[11px] sm:text-xs text-zinc-400 line-clamp-1">Specialized claims for EV Battery Pack Underbody, High-Voltage Inverter, Charging Ports & Wallbox Cover</div>
                    </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <span
                        className="text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full border"
                        style={{ color: "#00d4ff", borderColor: "rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.08)" }}
                    >
                        {evCount} EV Claims
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); router.push('/shop/billing/insurance/ev-new'); }}
                        className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm"
                    >
                        + File EV Claim
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-5 rounded-3xl border shadow-sm transition-all group ${
                            stat.isEv
                                ? 'bg-gradient-to-br from-cyan-950/20 to-[#121216] border-cyan-500/30 hover:border-cyan-500/60'
                                : 'bg-[#121216] border-white/10 hover:border-white/20'
                        }`}
                    >
                        <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${stat.isEv ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-[#16acd4]'}`}>
                            {stat.label}
                        </p>
                        <div className="flex items-end gap-2 mt-2">
                            <p className={`text-2xl sm:text-3xl font-black ${stat.isEv ? 'text-cyan-400' : 'text-white'}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Powertrain Category Filter Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#121216] border border-white/10 max-w-full overflow-x-auto custom-scrollbar">
                <button
                    type="button"
                    onClick={() => { setCategoryFilter('all'); setPage(1); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        categoryFilter === 'all'
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    All Claims ({stats?.total || 0})
                </button>
                <button
                    type="button"
                    onClick={() => { setCategoryFilter('standard'); setPage(1); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        categoryFilter === 'standard'
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    <Car className="w-3.5 h-3.5 text-orange-400" />
                    <span>Standard ICE ({standardCount})</span>
                </button>
                <button
                    type="button"
                    onClick={() => { setCategoryFilter('ev'); setPage(1); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        categoryFilter === 'ev'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                            : 'text-cyan-400/80 hover:text-cyan-300'
                    }`}
                >
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>⚡ EV Claims ({evCount})</span>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-[#121216] border border-white/10 shadow-sm">
                <form onSubmit={handleSearch} className="flex-1 relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#16acd4] transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by claim ID, policy, EV brand, vehicle registration..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all bg-white/5 border border-white/8 focus:border-[#16acd4]/40 text-white placeholder-zinc-500"
                    />
                </form>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer bg-white/5 border border-white/8 text-zinc-300 font-bold focus:border-[#16acd4]/40"
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-[#121216] text-white">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => { setPage(1); fetchClaims(); fetchStats(); }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 font-bold text-xs"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Table */}
            <div className="rounded-3xl overflow-hidden bg-[#121216] border border-white/10 shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="w-8 h-8 animate-spin text-[#16acd4]" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Fetching claims...</p>
                        </div>
                    </div>
                ) : claims.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                        <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-dashed border-white/15 flex items-center justify-center mb-4">
                            <Shield className="w-8 h-8 text-zinc-500" />
                        </div>
                        <p className="text-lg font-black text-white">No claims found</p>
                        <p className="text-sm text-zinc-500 font-medium mt-1">
                            {categoryFilter === 'ev' ? 'No Electric Vehicle claims registered yet' : 'Create an insurance claim to get started'}
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                            <button
                                onClick={() => router.push('/shop/billing/insurance/new')}
                                className="px-5 py-2.5 rounded-xl bg-[#16acd4] hover:bg-[#16acd4]/90 text-black font-black text-xs uppercase tracking-wider shadow-lg transition-all"
                            >
                                Regular Claim
                            </button>
                            <button
                                onClick={() => router.push('/shop/billing/insurance/ev-new')}
                                className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-1.5"
                            >
                                <Zap className="w-3.5 h-3.5 fill-black" />
                                <span>⚡ EV Claim</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ============================================================
                            DESKTOP TABLE (md+): Fits 100% width with NO horizontal scroll
                        ============================================================ */}
                        <div className="hidden md:block">
                            <table className="w-full table-fixed text-left border-collapse">
                                <colgroup>
                                    <col className="w-[28%]" />
                                    <col className="w-[22%]" />
                                    <col className="w-[18%]" />
                                    <col className="w-[20%]" />
                                    <col className="w-[12%]" />
                                </colgroup>
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                        <th className="px-4 py-3.5">Claim & Vehicle</th>
                                        <th className="px-4 py-3.5">Customer & Policy</th>
                                        <th className="px-4 py-3.5">Assessment & Status</th>
                                        <th className="px-4 py-3.5 text-cyan-400">Surveyor & PDF</th>
                                        <th className="px-4 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {claims.map((claim) => {
                                        const statusColor = getStatusColor(claim.status)
                                        const isEV = !!claim.isEv
                                        const viewUrl = getClaimViewUrl(claim)

                                        return (
                                            <tr
                                                key={claim.id}
                                                onClick={() => router.push(viewUrl)}
                                                className="transition-colors hover:bg-white/[0.03] cursor-pointer group"
                                            >
                                                {/* Col 1: Claim & Vehicle */}
                                                <td className="px-4 py-3.5 align-top">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className={`text-sm font-black font-mono tracking-tight ${isEV ? 'text-cyan-400' : 'text-[#16acd4]'}`}>
                                                            {claim.claimNumber}
                                                        </span>
                                                        {isEV && (
                                                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-0.5">
                                                                <Zap className="w-2.5 h-2.5" /> EV
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs font-bold text-white mt-1 truncate group-hover:text-cyan-300 transition-colors">
                                                        {claim.vehicleMake} {claim.vehicleModel}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                                                        {claim.vehicleYear} • {claim.registrationNumber || claim.claimType}
                                                        {isEV && claim.batteryCapacity ? ` • ${claim.batteryCapacity}` : ''}
                                                    </div>
                                                    <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider mt-0.5">
                                                        {formatDate(claim.createdAt)}
                                                    </div>
                                                </td>

                                                {/* Col 2: Customer & Policy */}
                                                <td className="px-4 py-3.5 align-top">
                                                    <div className="text-xs font-bold text-white truncate">
                                                        {claim.user?.name || '-'}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                                                        {claim.user?.email || claim.user?.mobile || '-'}
                                                    </div>
                                                    <div className="mt-1.5 pt-1.5 border-t border-white/5">
                                                        <div className="text-[11px] font-mono font-bold text-zinc-300 truncate">
                                                            {claim.policyNumber}
                                                        </div>
                                                        {claim.insuranceCompany && (
                                                            <div className="text-[9px] text-zinc-500 truncate uppercase font-bold tracking-wider">
                                                                {claim.insuranceCompany}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Col 3: Assessment & Status */}
                                                <td className="px-4 py-3.5 align-top">
                                                    <div className="text-sm font-black text-white">
                                                        {formatCurrency(claim.estimatedDamage)}
                                                    </div>
                                                    <div className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">
                                                        Est. Damage
                                                    </div>
                                                    <div className="mt-2">
                                                        <span
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5"
                                                            style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor.text }} />
                                                            {formatStatus(claim.status)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Col 4: Surveyor & PDF */}
                                                <td className="px-4 py-3.5 align-top" onClick={(e) => e.stopPropagation()}>
                                                    {claim.surveyorEmail ? (
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                                                <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                                                <span className="truncate max-w-[140px]">{claim.surveyorName || 'Assigned Surveyor'}</span>
                                                            </div>
                                                            <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[160px]" title={claim.surveyorEmail}>
                                                                {claim.surveyorEmail}
                                                            </div>
                                                            <div>
                                                                {claim.pdfSentToSurveyorAt ? (
                                                                    <span
                                                                        onClick={(e) => openSurveyorModal(e, claim)}
                                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 cursor-pointer transition-all"
                                                                        title={`PDF sent on ${formatDate(claim.pdfSentToSurveyorAt)}. Click to resend.`}
                                                                    >
                                                                        <CheckCircle2 className="w-2.5 h-2.5" /> PDF Sent ({formatDate(claim.pdfSentToSurveyorAt)})
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => openSurveyorModal(e, claim)}
                                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                                                                    >
                                                                        <Mail className="w-2.5 h-2.5" /> Send PDF Now
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => openSurveyorModal(e, claim)}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-zinc-400 hover:text-cyan-300 bg-white/5 hover:bg-cyan-500/10 border border-dashed border-white/10 hover:border-cyan-500/30 transition-all"
                                                        >
                                                            <UserCheck className="w-3 h-3 text-cyan-400" />
                                                            <span>+ Assign Surveyor</span>
                                                        </button>
                                                    )}
                                                </td>

                                                {/* Col 5: Actions */}
                                                <td className="px-4 py-3.5 align-top text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <button
                                                            onClick={(e) => openSurveyorModal(e, claim)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all shadow-sm active:scale-95"
                                                            title="Send Claim Assessment PDF to Surveyor"
                                                        >
                                                            <Send className="w-3 h-3" />
                                                            <span>Send PDF</span>
                                                        </button>
                                                        <button
                                                            onClick={() => router.push(viewUrl)}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                                                                isEV
                                                                    ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/30'
                                                                    : 'bg-white/5 text-zinc-300 hover:text-[#16acd4] hover:bg-[#16acd4]/15 border-white/10'
                                                            }`}
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            <span>View</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* ============================================================
                            MOBILE CARDS (md:hidden): Stacked cards, 100% responsive, touch-friendly
                        ============================================================ */}
                        <div className="md:hidden divide-y divide-white/5">
                            {claims.map((claim) => {
                                const statusColor = getStatusColor(claim.status)
                                const isEV = !!claim.isEv
                                const viewUrl = getClaimViewUrl(claim)

                                return (
                                    <div
                                        key={claim.id}
                                        onClick={() => router.push(viewUrl)}
                                        className="p-4 space-y-3 transition-colors hover:bg-white/[0.02] cursor-pointer"
                                    >
                                        {/* Mobile Card Top: Claim Number + Status */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-base font-black font-mono tracking-tight ${isEV ? 'text-cyan-400' : 'text-[#16acd4]'}`}>
                                                        {claim.claimNumber}
                                                    </span>
                                                    {isEV && (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-0.5">
                                                            <Zap className="w-2.5 h-2.5" /> EV
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                                    {formatDate(claim.createdAt)}
                                                </div>
                                            </div>

                                            <span
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 shrink-0"
                                                style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor.text }} />
                                                {formatStatus(claim.status)}
                                            </span>
                                        </div>

                                        {/* Mobile Vehicle & Amount Banner */}
                                        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                                                    {isEV ? <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Car className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
                                                    <span className="truncate">{claim.vehicleMake} {claim.vehicleModel}</span>
                                                </div>
                                                <div className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">
                                                    {claim.vehicleYear} • {claim.registrationNumber || claim.claimType}
                                                    {isEV && claim.batteryCapacity ? ` • ${claim.batteryCapacity}` : ''}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-xs font-black text-white">{formatCurrency(claim.estimatedDamage)}</div>
                                                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Est. Damage</div>
                                            </div>
                                        </div>

                                        {/* Mobile Customer & Policy */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                                <span className="text-[9px] text-zinc-500 block uppercase font-black tracking-wider">Customer</span>
                                                <div className="font-bold text-white truncate mt-0.5">{claim.user?.name || '-'}</div>
                                                <div className="text-[10px] text-zinc-400 truncate mt-0.5">{claim.user?.email || claim.user?.mobile || '-'}</div>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                                <span className="text-[9px] text-zinc-500 block uppercase font-black tracking-wider">Policy</span>
                                                <div className="font-mono font-bold text-zinc-200 truncate mt-0.5">{claim.policyNumber}</div>
                                                <div className="text-[10px] text-zinc-400 truncate mt-0.5">{claim.insuranceCompany || '-'}</div>
                                            </div>
                                        </div>

                                        {/* Mobile Surveyor Mini Box */}
                                        <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                                            <div className="min-w-0 flex items-center gap-2">
                                                <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="text-[11px] font-bold text-white truncate">
                                                        {claim.surveyorName || (claim.surveyorEmail ? 'Assigned Surveyor' : 'No Surveyor Assigned')}
                                                    </div>
                                                    {claim.surveyorEmail ? (
                                                        <div className="text-[9px] font-mono text-cyan-300/80 truncate">
                                                            {claim.surveyorEmail}
                                                        </div>
                                                    ) : (
                                                        <div className="text-[9px] text-zinc-500">
                                                            Tap below to assign & send PDF
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {claim.pdfSentToSurveyorAt ? (
                                                <span
                                                    onClick={(e) => openSurveyorModal(e, claim)}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0"
                                                >
                                                    <CheckCircle2 className="w-2.5 h-2.5" /> Sent ({formatDate(claim.pdfSentToSurveyorAt)})
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={(e) => openSurveyorModal(e, claim)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-cyan-400 text-black hover:bg-cyan-300 shrink-0 shadow-sm"
                                                >
                                                    <Send className="w-2.5 h-2.5" /> Send PDF
                                                </button>
                                            )}
                                        </div>

                                        {/* Mobile Card Action Grid */}
                                        <div className="grid grid-cols-2 gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => openSurveyorModal(e, claim)}
                                                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-black text-[11px] uppercase tracking-wider transition-all"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Send PDF</span>
                                            </button>
                                            <button
                                                onClick={() => router.push(viewUrl)}
                                                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black text-[11px] uppercase tracking-wider transition-all"
                                            >
                                                <span>View Details</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <span className="text-xs font-medium text-zinc-500">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Surveyor PDF Dispatch Modal */}
            {surveyorModalOpen && selectedClaim && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => { if (!sendingSurveyorPdf) setSurveyorModalOpen(false) }}
                >
                    <div
                        className="bg-[#111318] border border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            boxShadow: "0 25px 60px -15px rgba(0, 212, 255, 0.25)"
                        }}
                    >
                        {/* Glowing Accent Top Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

                        {/* Modal Header */}
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                                    <Send className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                        Email Claim PDF to Surveyor
                                    </h3>
                                    <p className="text-xs text-zinc-400">
                                        Send the full damage assessment report directly to the appointed surveyor
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSurveyorModalOpen(false)}
                                disabled={sendingSurveyorPdf}
                                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Claim Context Badge */}
                        <div className="my-4 p-3 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-cyan-400 font-mono">{selectedClaim.claimNumber}</span>
                                <span className="text-emerald-400 font-black">{formatCurrency(selectedClaim.estimatedDamage)}</span>
                            </div>
                            <div className="text-xs text-zinc-300 font-medium flex items-center justify-between">
                                <span>{selectedClaim.vehicleMake} {selectedClaim.vehicleModel} {selectedClaim.vehicleYear}</span>
                                <span className="text-zinc-400 font-mono text-[11px]">{selectedClaim.policyNumber}</span>
                            </div>
                            {selectedClaim.pdfSentToSurveyorAt && (
                                <div className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg flex items-center gap-1.5 mt-1">
                                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                                    <span>Last sent to {selectedClaim.surveyorLastEmailedTo || selectedClaim.surveyorEmail} on {formatDate(selectedClaim.pdfSentToSurveyorAt)}</span>
                                </div>
                            )}
                        </div>

                        {/* Success Notification */}
                        {surveyorSuccess && (
                            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                                <span>{surveyorSuccess}</span>
                            </div>
                        )}

                        {/* Error Notification */}
                        {surveyorError && (
                            <div className="mb-4 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                                <span>{surveyorError}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSendSurveyorPdf} className="space-y-3.5">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-300 mb-1">
                                    Surveyor Email Address <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        type="email"
                                        required
                                        value={surveyorEmail}
                                        onChange={(e) => setSurveyorEmail(e.target.value)}
                                        placeholder="surveyor@insurance.com / rahul.surveyor@gmail.com"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors font-medium"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                                        Surveyor Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={surveyorName}
                                        onChange={(e) => setSurveyorName(e.target.value)}
                                        placeholder="e.g. Er. Rajesh Verma"
                                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                                        Surveyor Phone (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        value={surveyorPhone}
                                        onChange={(e) => setSurveyorPhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                                    Insurance Company / Surveyor Agency
                                </label>
                                <input
                                    type="text"
                                    value={surveyorCompany}
                                    onChange={(e) => setSurveyorCompany(e.target.value)}
                                    placeholder="e.g. ICICI Lombard / Falcon Surveyors Ltd."
                                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                                    Message / Notes for Surveyor
                                </label>
                                <textarea
                                    rows={2}
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="e.g. Car is kept ready in Workshop Bay 3. Teardown inspection completed."
                                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                                />
                            </div>

                            {/* Attachments checklist */}
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Attached Documents:</div>
                                <div className="flex items-center gap-2 text-xs text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Insurance Claim Damage Assessment PDF Report</span>
                                </div>
                                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                                    <input
                                        type="checkbox"
                                        checked={includeDocs}
                                        onChange={(e) => setIncludeDocs(e.target.checked)}
                                        className="rounded border-white/20 text-cyan-400 focus:ring-0 cursor-pointer"
                                    />
                                    <span>Attach uploaded claim PDFs (RC, Policy, Damage Bills if any)</span>
                                </label>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setSurveyorModalOpen(false)}
                                    disabled={sendingSurveyorPdf}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingSurveyorPdf}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    {sendingSurveyorPdf ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Sending PDF...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5" />
                                            <span>Send PDF to Surveyor</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

