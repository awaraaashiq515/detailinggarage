'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Zap, Battery, BatteryCharging, Shield, ArrowLeft, Car, User,
    FileCheck, RefreshCw, Download, FileText, Calendar, MapPin,
    AlertTriangle, CheckCircle, ExternalLink, Image as ImageIcon,
    Clock, Cpu, Sparkles, Wrench, ChevronRight, UserCheck, Send, Mail
} from "lucide-react"

interface ClaimData {
    id: string
    claimNumber: string
    source: string
    createdAt: string
    status: string
    isEv?: boolean
    vehicleMake: string
    vehicleModel: string
    vehicleYear: string
    vehicleColor: string
    registrationNumber: string
    rcNumber?: string
    registrationDate?: string
    vin?: string
    engineNumber?: string
    motorNumber?: string
    batteryCapacity?: string
    batterySerialNumber?: string
    batteryHealthSoH?: string
    chargerType?: string
    chargerSerialNumber?: string
    evSpecificCover?: string
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
    pdfUrl?: string
    surveyorName?: string | null
    surveyorEmail?: string | null
    surveyorPhone?: string | null
    surveyorCompany?: string | null
    pdfSentToSurveyorAt?: string | null
    surveyorLastEmailedTo?: string | null
    user?: {
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

export function EVInsuranceView({ id, isShopPortal = true }: { id: string; isShopPortal?: boolean }) {
    const router = useRouter()
    const [claim, setClaim] = useState<ClaimData | null>(null)
    const [loading, setLoading] = useState(true)
    const [generatingPdf, setGeneratingPdf] = useState(false)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [newStatus, setNewStatus] = useState('')
    const [adminNotes, setAdminNotes] = useState('')

    // Surveyor dispatch state
    const [surveyorEmail, setSurveyorEmail] = useState('')
    const [surveyorName, setSurveyorName] = useState('')
    const [surveyorPhone, setSurveyorPhone] = useState('')
    const [surveyorCompany, setSurveyorCompany] = useState('')
    const [surveyorCustomMsg, setSurveyorCustomMsg] = useState('')
    const [includeSurveyorDocs, setIncludeSurveyorDocs] = useState(true)
    const [sendingSurveyorPdf, setSendingSurveyorPdf] = useState(false)
    const [surveyorFeedback, setSurveyorFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const basePath = isShopPortal ? '/shop/billing/insurance' : '/admin/insurance'

    const fetchClaim = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/insurance-claims/${id}`)
            const data = await res.json()
            const claimData = data.claim || data
            if (res.ok && claimData && claimData.id) {
                setClaim(claimData)
                setNewStatus(claimData.status || '')
                setAdminNotes(claimData.adminNotes || '')
                setSurveyorEmail(claimData.surveyorEmail || '')
                setSurveyorName(claimData.surveyorName || '')
                setSurveyorPhone(claimData.surveyorPhone || '')
                setSurveyorCompany(claimData.surveyorCompany || claimData.insuranceCompany || '')
            }
        } catch (error) {
            console.error('Error fetching claim:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSendSurveyorPdf = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!surveyorEmail || !surveyorEmail.includes('@')) {
            setSurveyorFeedback({ type: 'error', text: 'Please enter a valid surveyor email address' })
            return
        }

        try {
            setSendingSurveyorPdf(true)
            setSurveyorFeedback(null)

            const res = await fetch(`/api/admin/insurance-claims/${id}/send-surveyor-pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    surveyorEmail,
                    surveyorName,
                    surveyorPhone,
                    surveyorCompany,
                    customMessage: surveyorCustomMsg,
                    includeDocuments: includeSurveyorDocs
                })
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Failed to dispatch PDF')
            }

            setSurveyorFeedback({ type: 'success', text: `EV Claim PDF & dossier successfully emailed to ${surveyorEmail}!` })
            await fetchClaim()
        } catch (err: any) {
            setSurveyorFeedback({ type: 'error', text: err.message || 'Failed to email PDF to surveyor' })
        } finally {
            setSendingSurveyorPdf(false)
        }
    }

    useEffect(() => {
        if (id) fetchClaim()
    }, [id])

    const handleGeneratePdf = async () => {
        try {
            setGeneratingPdf(true)
            const res = await fetch(`/api/admin/insurance-claims/${id}/generate-pdf`, {
                method: 'POST'
            })
            const data = await res.json()
            if (res.ok && data.pdfUrl) {
                setClaim(prev => prev ? { ...prev, pdfUrl: data.pdfUrl } : null)
                window.open(data.pdfUrl, '_blank')
            } else {
                alert(`PDF generation failed: ${data.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF')
        } finally {
            setGeneratingPdf(false)
        }
    }

    const handleUpdateStatus = async () => {
        try {
            setUpdatingStatus(true)
            const res = await fetch(`/api/admin/insurance-claims/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, adminNotes })
            })
            if (res.ok) {
                const data = await res.json()
                setClaim(prev => prev ? { ...prev, status: newStatus, adminNotes } : null)
                alert('Claim status updated successfully!')
            } else {
                alert('Failed to update status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
        } finally {
            setUpdatingStatus(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
            case 'COMPLETED':
                return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: '#22c55e' }
            case 'UNDER_REVIEW':
                return { bg: 'rgba(0, 212, 255, 0.15)', text: '#00d4ff', border: '#00d4ff' }
            case 'REJECTED':
                return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '#ef4444' }
            default:
                return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', border: '#a855f7' }
        }
    }

    const formatCurrency = (amt?: number) => {
        if (!amt) return '₹0'
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt)
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading EV Claim Data...</p>
            </div>
        )
    }

    if (!claim) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mb-3" />
                <h3 className="text-lg font-black text-white">EV Claim Not Found</h3>
                <button onClick={() => router.push(basePath)} className="mt-4 text-xs font-bold text-cyan-400 hover:underline">
                    ← Back to Insurance Claims
                </button>
            </div>
        )
    }

    const statusStyle = getStatusColor(claim.status)

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-24 text-white">
            {/* Header */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1627] via-[#09101d] to-[#07090d] border border-cyan-500/30 shadow-xl shadow-cyan-950/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(basePath)}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 text-cyan-400 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> EV ELECTRIC VEHICLE
                            </span>
                            <span
                                className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border"
                                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
                            >
                                {claim.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                            {claim.claimNumber}
                        </h1>
                        <p className="text-xs text-zinc-400">
                            Registered on {formatDate(claim.createdAt)} • {claim.vehicleMake} {claim.vehicleModel}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {claim.pdfUrl && (
                        <a
                            href={claim.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download PDF</span>
                        </a>
                    )}
                    <button
                        onClick={() => {
                            const el = document.getElementById('ev-surveyor-card')
                            if (el) el.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 transition-all"
                    >
                        <Send className="w-4 h-4" />
                        <span>{claim.pdfSentToSurveyorAt ? '✓ PDF Sent' : 'Send to Surveyor'}</span>
                    </button>
                    <button
                        onClick={handleGeneratePdf}
                        disabled={generatingPdf}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {generatingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        <span>{claim.pdfUrl ? 'Regenerate PDF' : 'Generate EV Report'}</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-5 rounded-2xl bg-[#0a0c10] border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Estimated Claim</p>
                    <p className="text-xl font-black text-cyan-400 mt-1">{formatCurrency(claim.estimatedDamage)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0a0c10] border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Battery Capacity</p>
                    <p className="text-xl font-black text-white mt-1">{claim.batteryCapacity || 'N/A'}</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0a0c10] border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Battery Health (SoH)</p>
                    <p className="text-xl font-black text-emerald-400 mt-1">{claim.batteryHealthSoH || '100%'}</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0a0c10] border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Insurance Policy</p>
                    <p className="text-sm font-bold text-white mt-1.5 truncate">{claim.policyNumber}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{claim.insuranceCompany}</p>
                </div>
            </div>

            {/* ⚡ Dedicated EV Powertrain & High Voltage Diagnostic Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c182a] via-[#09101d] to-[#07090d] border-2 border-cyan-500/30 shadow-xl shadow-cyan-950/20">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-cyan-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500 text-black font-black">
                            <BatteryCharging className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-base font-black uppercase tracking-widest text-cyan-400">
                                ⚡ EV Powertrain & Battery System Specifications
                            </h2>
                            <p className="text-xs text-zinc-400">Inspection & diagnostic report for electric drivetrain</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        DIAGNOSTICS
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                            Battery Capacity
                        </span>
                        <div className="text-sm font-black text-white flex items-center gap-1.5">
                            <Battery className="w-4 h-4 text-cyan-400" />
                            {claim.batteryCapacity || 'Not Recorded'}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                            State of Health (SoH)
                        </span>
                        <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            {claim.batteryHealthSoH || '100%'}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                            Drive Motor ID / Serial
                        </span>
                        <div className="text-sm font-black text-white font-mono flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            {claim.motorNumber || claim.engineNumber || 'N/A'}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                            Battery Pack Serial / UID
                        </span>
                        <div className="text-sm font-bold text-white font-mono truncate">
                            {claim.batterySerialNumber || 'N/A'}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/20 sm:col-span-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                            Charger Port & Wallbox Specs
                        </span>
                        <div className="text-sm font-bold text-white truncate">
                            {claim.chargerType || 'CCS2 Combo Fast + AC'}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/20 sm:col-span-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                            Charger Serial Number
                        </span>
                        <div className="text-sm font-mono text-zinc-300">
                            {claim.chargerSerialNumber || 'Not Recorded'}
                        </div>
                    </div>
                </div>

                {claim.evSpecificCover && (
                    <div className="mt-5 pt-4 border-t border-cyan-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-2">
                            Active EV Insurance Add-ons:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {claim.evSpecificCover.split(',').map((cov, i) => (
                                <span key={i} className="px-3 py-1 rounded-xl text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                                    ✓ {cov.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Detail Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vehicle & Customer Info */}
                <div className="p-6 rounded-3xl bg-[#0a0c10] border border-white/10 space-y-5">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                            <Car className="w-4 h-4 text-orange-400" /> Vehicle Identification
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-white/[0.02]">
                                <span className="text-zinc-500 block">Make & Model</span>
                                <span className="font-bold text-white text-sm">{claim.vehicleMake} {claim.vehicleModel}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02]">
                                <span className="text-zinc-500 block">Registration No</span>
                                <span className="font-bold font-mono text-cyan-400 text-sm">{claim.registrationNumber}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02]">
                                <span className="text-zinc-500 block">Chassis VIN</span>
                                <span className="font-bold font-mono text-white truncate">{claim.vin || 'N/A'}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02]">
                                <span className="text-zinc-500 block">Year / Color</span>
                                <span className="font-bold text-white">{claim.vehicleYear} • {claim.vehicleColor || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-400" /> Policyholder Contact
                        </h3>
                        <div className="p-3.5 rounded-xl bg-white/[0.02] space-y-1 text-xs">
                            <div className="font-bold text-white text-sm">{claim.user?.name || '-'}</div>
                            <div className="text-zinc-400">{claim.user?.mobile || '-'}</div>
                            <div className="text-zinc-500">{claim.user?.email || '-'}</div>
                        </div>
                    </div>
                </div>

                {/* Policy & Incident Info */}
                <div className="p-6 rounded-3xl bg-[#0a0c10] border border-white/10 space-y-5">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-purple-400" /> Policy & Insurer
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-white/[0.02]">
                                <span className="text-zinc-500 block">Insurer</span>
                                <span className="font-bold text-white">{claim.insuranceCompany}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02]">
                                <span className="text-zinc-500 block">Policy No</span>
                                <span className="font-bold font-mono text-white truncate">{claim.policyNumber}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02]">
                                <span className="text-zinc-500 block">Policy Type</span>
                                <span className="font-bold text-white truncate">{claim.policyType}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02]">
                                <span className="text-zinc-500 block">Validity</span>
                                <span className="font-bold text-white">{formatDate(claim.policyStartDate)} - {formatDate(claim.policyEndDate)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" /> Incident Location & Date
                        </h3>
                        <div className="p-3.5 rounded-xl bg-white/[0.02] space-y-1 text-xs">
                            <div className="text-zinc-400 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Date: {formatDate(claim.incidentDate)}</span>
                            </div>
                            <div className="text-zinc-400 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Location: {claim.incidentLocation || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Damage Description */}
            <div className="p-6 rounded-3xl bg-[#0a0c10] border border-white/10">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                    Damage Evaluation Description
                </h3>
                <p className="text-sm text-zinc-200 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                    {claim.incidentDescription || 'No description provided.'}
                </p>
            </div>

            {/* Documents & Photos Gallery */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0c10] border border-white/10">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" /> Attached Inspection Documents & Photos
                </h3>

                {(!claim.documents || claim.documents.length === 0) ? (
                    <p className="text-xs text-zinc-500 italic">No files attached to this claim.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {claim.documents.map((doc) => (
                            <a
                                key={doc.id}
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 flex flex-col items-center text-center transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-105 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-300 line-clamp-1 w-full">{doc.fileName}</span>
                                <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 mt-0.5">{doc.fileType.replace(/_/g, ' ')}</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Insurance Surveyor & PDF Dispatch Card */}
            <div id="ev-surveyor-card" className="p-6 sm:p-8 rounded-3xl bg-[#0a0c10] border border-cyan-500/30 shadow-xl shadow-cyan-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                                Appointed Insurance Surveyor
                            </h3>
                            <p className="text-xs text-zinc-400">
                                Enter surveyor details and dispatch full EV damage evaluation PDF dossier
                            </p>
                        </div>
                    </div>
                    {claim.pdfSentToSurveyorAt && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 w-fit">
                            <CheckCircle className="w-3.5 h-3.5" /> PDF Sent ({formatDate(claim.pdfSentToSurveyorAt)})
                        </span>
                    )}
                </div>

                {claim.pdfSentToSurveyorAt && (
                    <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>Last dispatched to <strong className="text-white font-mono">{claim.surveyorLastEmailedTo || claim.surveyorEmail}</strong> on {formatDate(claim.pdfSentToSurveyorAt)}.</span>
                    </div>
                )}

                {surveyorFeedback && (
                    <div className={`mb-5 p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                        surveyorFeedback.type === 'success'
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                            : 'bg-red-500/15 border border-red-500/30 text-red-300'
                    }`}>
                        {surveyorFeedback.type === 'success' ? (
                            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                        )}
                        <span>{surveyorFeedback.text}</span>
                    </div>
                )}

                <form onSubmit={handleSendSurveyorPdf} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-300 mb-1.5">
                                Surveyor Email Address <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="email"
                                    required
                                    value={surveyorEmail}
                                    onChange={(e) => setSurveyorEmail(e.target.value)}
                                    placeholder="surveyor@insurance.com"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                Surveyor Name (Optional)
                            </label>
                            <input
                                type="text"
                                value={surveyorName}
                                onChange={(e) => setSurveyorName(e.target.value)}
                                placeholder="e.g. Er. Rajesh Verma"
                                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                Surveyor Phone (Optional)
                            </label>
                            <input
                                type="tel"
                                value={surveyorPhone}
                                onChange={(e) => setSurveyorPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                                Insurance Company / Survey Firm
                            </label>
                            <input
                                type="text"
                                value={surveyorCompany}
                                onChange={(e) => setSurveyorCompany(e.target.value)}
                                placeholder="e.g. ICICI Lombard / Surveyor Agency"
                                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                            Inspection Notes for Surveyor
                        </label>
                        <textarea
                            rows={2}
                            value={surveyorCustomMsg}
                            onChange={(e) => setSurveyorCustomMsg(e.target.value)}
                            placeholder="e.g. EV battery pack underbody inspection is prepared in isolated EV bay."
                            className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeSurveyorDocs}
                                onChange={(e) => setIncludeSurveyorDocs(e.target.checked)}
                                className="rounded border-white/20 text-cyan-400 focus:ring-0"
                            />
                            <span>Attach uploaded EV claim document PDFs (RC, Policy, Bills)</span>
                        </label>

                        <button
                            type="submit"
                            disabled={sendingSurveyorPdf}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {sendingSurveyorPdf ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Dispatching PDF...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Send PDF to Surveyor</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Status Update Control */}
            <div className="p-6 rounded-3xl bg-[#0a0c10] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="w-full md:w-auto">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Update Claim Status</h4>
                    <p className="text-[11px] text-zinc-400">Modify review and approval workflow state</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#121620] border border-white/10 text-white outline-none cursor-pointer"
                    >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="PENDING_DOCUMENTS">Pending Documents</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                    <button
                        onClick={handleUpdateStatus}
                        disabled={updatingStatus}
                        className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all disabled:opacity-50"
                    >
                        {updatingStatus ? 'Updating...' : 'Save Status'}
                    </button>
                </div>
            </div>
        </div>
    )
}
