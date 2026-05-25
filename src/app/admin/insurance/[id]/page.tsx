'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
    Shield, ArrowLeft, FileText, Car, User, Calendar, MapPin,
    DollarSign, FileCheck, RefreshCw, Download, CheckCircle,
    XCircle, Clock, AlertTriangle, Send, Edit
} from "lucide-react"

interface InsuranceClaim {
    id: string
    claimNumber: string
    source: string
    createdAt: string
    status: string
    vehicleMake: string
    vehicleModel: string
    vehicleYear: string
    vehicleColor: string
    registrationNumber: string
    rcNumber?: string
    registrationDate?: string
    vin?: string
    engineNumber?: string
    policyNumber: string
    insuranceCompany: string
    policyType: string
    policyStartDate?: string
    policyEndDate?: string
    claimType: string
    incidentDate: string
    incidentLocation: string
    incidentDescription: string
    estimatedDamage?: number
    adminNotes?: string
    reviewedBy?: string
    reviewedAt?: string
    pdfUrl?: string
    pdfGeneratedAt?: string
    user?: {
        id: string
        name: string
        email: string
        mobile?: string
    }
    documents?: Array<{
        id: string
        fileName: string
        fileUrl: string
        fileType: string
    }>
}

const STATUS_OPTIONS = [
    { value: 'SUBMITTED', label: 'Submitted', color: '#a855f7' },
    { value: 'UNDER_REVIEW', label: 'Under Review', color: '#16acd4' },
    { value: 'PENDING_DOCUMENTS', label: 'Pending Documents', color: '#60a5fa' },
    { value: 'APPROVED', label: 'Approved', color: '#4ade80' },
    { value: 'REJECTED', label: 'Rejected', color: '#f87171' },
    { value: 'COMPLETED', label: 'Completed', color: '#22c55e' },
]

export default function ClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [claim, setClaim] = useState<InsuranceClaim | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [generatingPdf, setGeneratingPdf] = useState(false)
    const [newStatus, setNewStatus] = useState('')
    const [adminNotes, setAdminNotes] = useState('')

    const fetchClaim = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/insurance-claims/${id}`)
            const data = await response.json()
            if (response.ok) {
                setClaim(data)
                setNewStatus(data.status)
                setAdminNotes(data.adminNotes || '')
            }
        } catch (error) {
            console.error('Error fetching claim:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClaim()
    }, [id])

    const handleStatusUpdate = async () => {
        if (!newStatus || newStatus === claim?.status) return

        try {
            setUpdating(true)
            const response = await fetch(`/api/admin/insurance-claims/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, adminNotes })
            })

            if (response.ok) {
                await fetchClaim()
                alert('Status updated successfully!')
            } else {
                const error = await response.json()
                alert(`Error: ${error.message}`)
            }
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Failed to update status')
        } finally {
            setUpdating(false)
        }
    }

    const handleGeneratePdf = async () => {
        try {
            setGeneratingPdf(true)
            const response = await fetch(`/api/admin/insurance-claims/${id}/generate-pdf`, {
                method: 'POST'
            })

            if (response.ok) {
                await fetchClaim()
                alert('PDF generated successfully! Client has been notified.')
            } else {
                const error = await response.json()
                alert(`Error: ${error.message}`)
            }
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF')
        } finally {
            setGeneratingPdf(false)
        }
    }

    const getStatusColor = (status: string) => {
        const option = STATUS_OPTIONS.find(s => s.value === status)
        return option?.color || '#6b7080'
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatCurrency = (amount?: number) => {
        if (!amount) return '-'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#16acd4' }} />
            </div>
        )
    }

    if (!claim) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <AlertTriangle className="w-12 h-12 mb-4" style={{ color: '#f87171' }} />
                <p className="text-lg font-medium text-white">Claim not found</p>
                <button
                    onClick={() => router.push('/admin/insurance')}
                    className="mt-4 text-sm" style={{ color: '#16acd4' }}
                >
                    ← Back to Claims
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/insurance')}
                        className="p-2 rounded-lg transition-colors hover:bg-white/10"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <ArrowLeft className="w-5 h-5" style={{ color: '#d8d8d8' }} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Shield className="w-7 h-7" style={{ color: '#60a5fa' }} />
                            {claim.claimNumber}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: `${getStatusColor(claim.status)}20`, color: getStatusColor(claim.status) }}
                            >
                                {claim.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm" style={{ color: '#6b7080' }}>
                                {claim.source === 'WALK_IN' ? '🏢 Walk-in' : '🌐 Online'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => router.push(`/admin/insurance/${id}/edit`)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                        style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.3)' }}
                    >
                        <Edit className="w-4 h-4" />
                        Edit Claim
                    </button>

                    {claim.pdfUrl && (
                        <a
                            href={claim.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                            style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)' }}
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </a>
                    )}

                    <button
                        onClick={handleGeneratePdf}
                        disabled={generatingPdf}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:translate-y-[-1px] disabled:opacity-50"
                        style={{
                            background: claim.pdfUrl ? 'rgba(22, 172, 212, 0.1)' : 'linear-gradient(135deg, #16acd4, #d49510)',
                            color: claim.pdfUrl ? '#16acd4' : '#000',
                            border: claim.pdfUrl ? '1px solid rgba(22, 172, 212, 0.4)' : 'none',
                            boxShadow: claim.pdfUrl ? 'none' : '0 4px 15px rgba(22, 172, 212, 0.3)'
                        }}
                    >
                        {generatingPdf ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> {claim.pdfUrl ? 'Regenerating...' : 'Generating...'}</>
                        ) : (
                            <><FileText className="w-4 h-4" /> {claim.pdfUrl ? 'Regenerate PDF' : 'Generate PDF'}</>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                            <User className="w-5 h-5" style={{ color: '#60a5fa' }} />
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Name</p>
                                <p className="text-white font-medium">{claim.user?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Email</p>
                                <p className="text-white">{claim.user?.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Mobile</p>
                                <p className="text-white">{claim.user?.mobile || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                            <Car className="w-5 h-5" style={{ color: '#60a5fa' }} />
                            Vehicle Details
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Make & Model</p>
                                <p className="text-white font-medium">{claim.vehicleMake} {claim.vehicleModel}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Year</p>
                                <p className="text-white">{claim.vehicleYear}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Color</p>
                                <p className="text-white">{claim.vehicleColor}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Registration</p>
                                <p className="text-white font-mono">{claim.registrationNumber}</p>
                            </div>
                            {claim.rcNumber && (
                                <div>
                                    <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>RC Number</p>
                                    <p className="text-white font-mono text-sm">{claim.rcNumber}</p>
                                </div>
                            )}
                            {claim.registrationDate && (
                                <div>
                                    <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Vehicle Age</p>
                                    <p className="text-sm font-semibold" style={{ color: '#16acd4' }}>
                                        {(() => {
                                            const reg = new Date(claim.registrationDate!)
                                            const now = new Date()
                                            const totalMs = now.getTime() - reg.getTime()
                                            const years = Math.floor(totalMs / (365.25 * 24 * 60 * 60 * 1000))
                                            const months = Math.floor((totalMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))
                                            if (years > 0) return `${years} yrs ${months} mo`
                                            return `${months} months`
                                        })()}
                                    </p>
                                </div>
                            )}
                            {claim.vin && (
                                <div>
                                    <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>VIN/Chassis</p>
                                    <p className="text-white font-mono text-sm">{claim.vin}</p>
                                </div>
                            )}
                            {claim.engineNumber && (
                                <div>
                                    <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Engine Number</p>
                                    <p className="text-white font-mono text-sm">{claim.engineNumber}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Policy Info */}
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                            <FileCheck className="w-5 h-5" style={{ color: '#60a5fa' }} />
                            Insurance Policy
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Policy Number</p>
                                <p className="text-white font-mono">{claim.policyNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Company</p>
                                <p className="text-white">{claim.insuranceCompany}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Policy Type</p>
                                <p className="text-white">{claim.policyType}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Validity</p>
                                <p className="text-white text-sm">{formatDate(claim.policyStartDate)} - {formatDate(claim.policyEndDate)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Incident Details */}
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
                            Incident Details
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Claim Type</p>
                                <p className="text-white font-medium">{claim.claimType}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Incident Date</p>
                                <p className="text-white">{formatDate(claim.incidentDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Estimated Damage</p>
                                <p className="font-semibold" style={{ color: '#16acd4' }}>{formatCurrency(claim.estimatedDamage)}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Submitted</p>
                                <p className="text-white">{formatDate(claim.createdAt)}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Incident Location</p>
                            <p className="text-white mb-3">{claim.incidentLocation}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase mb-1" style={{ color: '#6b7080' }}>Description</p>
                            <p className="text-white whitespace-pre-wrap" style={{ lineHeight: 1.6 }}>{claim.incidentDescription}</p>
                        </div>
                    </div>

                    {/* Documents */}
                    {claim.documents && claim.documents.length > 0 && (
                        <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5" style={{ color: '#60a5fa' }} />
                                Attached Documents ({claim.documents.length})
                            </h3>
                            <div className="space-y-2">
                                {claim.documents.map(doc => (
                                    <a
                                        key={doc.id}
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-white/5"
                                        style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4" style={{ color: '#6b7080' }} />
                                            <span className="text-sm text-white">{doc.fileName}</span>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#6b7080' }}>
                                            {doc.fileType}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Status Update */}
                <div className="space-y-6">
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="text-lg font-semibold text-white mb-4">Update Status</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#d8d8d8'
                                    }}
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value} style={{ backgroundColor: '#111318' }}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Admin Notes</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={4}
                                    placeholder="Add notes for the client..."
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#d8d8d8'
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleStatusUpdate}
                                disabled={updating || newStatus === claim.status}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                                    color: '#fff'
                                }}
                            >
                                {updating ? (
                                    <><RefreshCw className="w-4 h-4 animate-spin" /> Updating...</>
                                ) : (
                                    <><Send className="w-4 h-4" /> Update & Notify Client</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#a855f7' }} />
                                <div>
                                    <p className="text-sm text-white">Claim Submitted</p>
                                    <p className="text-xs" style={{ color: '#6b7080' }}>{formatDate(claim.createdAt)}</p>
                                </div>
                            </div>
                            {claim.reviewedAt && (
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#16acd4' }} />
                                    <div>
                                        <p className="text-sm text-white">Last Reviewed</p>
                                        <p className="text-xs" style={{ color: '#6b7080' }}>{formatDate(claim.reviewedAt)}</p>
                                    </div>
                                </div>
                            )}
                            {claim.pdfGeneratedAt && (
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#4ade80' }} />
                                    <div>
                                        <p className="text-sm text-white">PDF Generated</p>
                                        <p className="text-xs" style={{ color: '#6b7080' }}>{formatDate(claim.pdfGeneratedAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
