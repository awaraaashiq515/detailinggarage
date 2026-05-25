'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
    Shield, ArrowLeft, Car, FileCheck, AlertTriangle,
    RefreshCw, Save, Upload, Plus, X, Trash2, Wrench
} from "lucide-react"

import { getCurrentLiveLocation } from '@/lib/location-utils'

const VEHICLE_TYPES = ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Truck', 'Two Wheeler', 'Three Wheeler', 'Other']
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'LPG', 'Electric', 'Hybrid', 'Petrol + CNG', 'Petrol + LPG']
const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT', 'iMT']
const USAGE_TYPES = ['Personal', 'Commercial', 'Taxi', 'Fleet', 'Rental']
const CLAIM_TYPES = ['Accident', 'Theft', 'Natural Disaster', 'Third Party', 'Fire', 'Vandalism', 'Own Damage', 'Hit and Run', 'Other']
const CLAIM_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS', 'APPROVED', 'REJECTED', 'COMPLETED']
const VEHICLE_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Not Running']
const ACCIDENT_HISTORY = ['No Previous Accidents', '1 Previous Accident', '2+ Previous Accidents', 'Unknown']
const INSURANCE_COMPANIES = [
    'ICICI Lombard', 'HDFC ERGO', 'Bajaj Allianz', 'New India Assurance',
    'National Insurance', 'United India Insurance', 'Oriental Insurance',
    'Tata AIG', 'Reliance General', 'SBI General', 'Cholamandalam MS',
    'Royal Sundaram', 'Future Generali', 'Bharti AXA', 'IFFCO Tokio'
]
const POLICY_TYPES = ['Comprehensive', 'Third Party', 'Third Party Fire & Theft', 'Own Damage Only']

const DAMAGE_AREAS = [
    'Front Bumper', 'Rear Bumper', 'Left Side', 'Right Side',
    'Roof', 'Hood/Bonnet', 'Trunk/Boot', 'Windshield', 'Rear Glass',
    'Left Headlight', 'Right Headlight', 'Left Tail Light', 'Right Tail Light',
    'Left Door (Front)', 'Left Door (Rear)', 'Right Door (Front)', 'Right Door (Rear)',
    'Left Fender', 'Right Fender', 'Engine', 'Suspension', 'Axle',
    'Wheels/Tyres', 'Interior', 'Electrical System', 'Total Loss'
]

interface ExistingDocument {
    id: string
    fileName: string
    fileUrl: string
    fileType: string
    uploadedAt: string
}

export default function EditClaimPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [locationStatus, setLocationStatus] = useState<string>('')
    const [customCompany, setCustomCompany] = useState('')
    const [showCustomCompany, setShowCustomCompany] = useState(false)
    const [showCustomPolicyType, setShowCustomPolicyType] = useState(false)
    const [customPolicyType, setCustomPolicyType] = useState('')
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null)

    // Existing documents from DB
    const [existingDocuments, setExistingDocuments] = useState<ExistingDocument[]>([])

    // New file uploads
    const [documentFiles, setDocumentFiles] = useState<{
        damageImages: File[]
        underRepairingPhotos: File[]
        afterRepairPhotos: File[]
        firDocs: File[]
        panFront: File | null
        panBack: File | null
        aadhaarFront: File | null
        aadhaarBack: File | null
        dlFront: File | null
        dlBack: File | null
        insuranceFront: File | null
        insuranceBack: File | null
        bankPassbook: File | null
        rcFront: File | null
        rcBack: File | null
        additional: File[]
    }>({
        damageImages: [],
        underRepairingPhotos: [],
        afterRepairPhotos: [],
        firDocs: [],
        panFront: null,
        panBack: null,
        aadhaarFront: null,
        aadhaarBack: null,
        dlFront: null,
        dlBack: null,
        insuranceFront: null,
        insuranceBack: null,
        bankPassbook: null,
        rcFront: null,
        rcBack: null,
        additional: []
    })

    const [formData, setFormData] = useState({
        vehicleMake: '',
        vehicleModel: '',
        vehicleVariant: '',
        vehicleYear: '',
        vehicleType: '',
        fuelType: '',
        transmissionType: '',
        vehicleColor: '',
        registrationNumber: '',
        rcNumber: '',
        registrationDate: '',
        usageType: '',
        odometerReading: '',
        chassisNumber: '',
        engineNumber: '',
        insuranceCompany: '',
        policyNumber: '',
        policyType: '',
        policyExpiryDate: '',
        claimType: '',
        estimatedClaimAmount: '',
        idvValue: '',
        status: 'SUBMITTED',
        vehicleConditionBefore: '',
        previousAccidentHistory: '',
        damageAreas: [] as string[],
        incidentDate: '',
        incidentLocation: '',
        damageDescription: '',
        adminNotes: '',
        partName: '',
        partNumber: '',
        invoiceNumber: '',
        installationDate: '',
        warrantyValue: '',
        warrantyType: 'Months'
    })

    const [claimInfo, setClaimInfo] = useState<{
        claimNumber: string
        source: string
        user?: { name: string; email: string; mobile?: string }
    } | null>(null)

    // Fetch existing claim data
    useEffect(() => {
        const fetchClaim = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/admin/insurance-claims/${id}`)
                const data = await response.json()
                if (response.ok) {
                    setClaimInfo({
                        claimNumber: data.claimNumber,
                        source: data.source,
                        user: data.user
                    })

                    // Load existing documents
                    if (data.documents) {
                        setExistingDocuments(data.documents)
                    }

                    let damageAreas: string[] = []
                    if (data.damageAreas) {
                        try {
                            damageAreas = typeof data.damageAreas === 'string'
                                ? JSON.parse(data.damageAreas)
                                : data.damageAreas
                        } catch { damageAreas = [] }
                    }

                    setFormData({
                        vehicleMake: data.vehicleMake || '',
                        vehicleModel: data.vehicleModel || '',
                        vehicleVariant: data.vehicleVariant || '',
                        vehicleYear: data.vehicleYear || '',
                        vehicleType: data.vehicleType || '',
                        fuelType: data.fuelType || '',
                        transmissionType: data.transmissionType || '',
                        vehicleColor: data.vehicleColor || '',
                        registrationNumber: data.registrationNumber || '',
                        rcNumber: data.rcNumber || '',
                        registrationDate: data.registrationDate ? data.registrationDate.split('T')[0] : '',
                        usageType: data.usageType || '',
                        odometerReading: data.odometerReading?.toString() || '',
                        chassisNumber: data.chassisNumber || '',
                        engineNumber: data.engineNumber || '',
                        insuranceCompany: data.insuranceCompany || '',
                        policyNumber: data.policyNumber || '',
                        policyType: POLICY_TYPES.includes(data.policyType || '') ? (data.policyType || '') : '',
                        policyExpiryDate: data.policyExpiryDate ? data.policyExpiryDate.split('T')[0] : '',
                        claimType: data.claimType || '',
                        estimatedClaimAmount: data.estimatedDamage?.toString() || '',
                        idvValue: data.idvValue?.toString() || '',
                        status: data.status || 'SUBMITTED',
                        vehicleConditionBefore: data.vehicleConditionBefore || '',
                        previousAccidentHistory: data.previousAccidentHistory || '',
                        damageAreas: damageAreas,
                        incidentDate: data.incidentDate ? data.incidentDate.split('T')[0] : '',
                        incidentLocation: data.incidentLocation || '',
                        damageDescription: data.incidentDescription || '',
                        adminNotes: data.adminNotes || '',
                        partName: data.partName || '',
                        partNumber: data.partNumber || '',
                        invoiceNumber: data.invoiceNumber || '',
                        installationDate: data.installationDate ? data.installationDate.split('T')[0] : '',
                        warrantyValue: data.warrantyValue || '',
                        warrantyType: data.warrantyType || 'Months'
                    })

                    if (data.insuranceCompany && !INSURANCE_COMPANIES.includes(data.insuranceCompany)) {
                        setShowCustomCompany(true)
                        setCustomCompany(data.insuranceCompany)
                    }
                    if (data.policyType && !POLICY_TYPES.includes(data.policyType)) {
                        setShowCustomPolicyType(true)
                        setCustomPolicyType(data.policyType)
                    }
                }
            } catch (error) {
                console.error('Error fetching claim:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchClaim()
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const toggleDamageArea = (area: string) => {
        setFormData(prev => ({
            ...prev,
            damageAreas: prev.damageAreas.includes(area)
                ? prev.damageAreas.filter(a => a !== area)
                : [...prev.damageAreas, area]
        }))
    }

    const handleDeleteDocument = async (docId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return
        setDeletingDocId(docId)
        try {
            const res = await fetch(`/api/admin/insurance-claims/${id}/documents/${docId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setExistingDocuments(prev => prev.filter(d => d.id !== docId))
            } else {
                const err = await res.json()
                alert(`Failed to delete: ${err.error}`)
            }
        } catch (e) {
            alert('Failed to delete document')
        } finally {
            setDeletingDocId(null)
        }
    }

    const uploadFiles = async (files: File[], documentType: string, location?: string) => {
        if (files.length === 0) return
        const fd = new FormData()
        files.forEach(file => fd.append('files', file))
        fd.append('documentType', documentType)
        fd.append('claimId', id)
        // Pass location so images get a camera-style timestamp+location watermark
        fd.append('location', location || '')
        const response = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        if (!response.ok) {
            const error = await response.json()
            console.error(`Failed to upload ${documentType}:`, error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSaving(true)
            setUploadProgress(0)

            const payload = {
                ...formData,
                insuranceCompany: showCustomCompany ? customCompany : formData.insuranceCompany,
                policyType: showCustomPolicyType ? customPolicyType : formData.policyType,
                estimatedDamage: formData.estimatedClaimAmount ? parseFloat(formData.estimatedClaimAmount) : undefined,
                idvValue: formData.idvValue ? parseFloat(formData.idvValue) : undefined,
                odometerReading: formData.odometerReading ? parseInt(formData.odometerReading) : undefined,
                incidentDescription: formData.damageDescription,
                damageAreas: JSON.stringify(formData.damageAreas)
            }

            const response = await fetch(`/api/admin/insurance-claims/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await response.json()
            if (!response.ok) {
                alert(`Error: ${data.error}`)
                return
            }

            setUploadProgress(20)

            // Upload new files
            const uploads = [
                { files: documentFiles.damageImages, type: 'DAMAGE_PHOTOS' },
                { files: documentFiles.underRepairingPhotos, type: 'UNDER_REPAIRING_PHOTOS' },
                { files: documentFiles.afterRepairPhotos, type: 'AFTER_REPAIR_PHOTOS' },
                { files: documentFiles.firDocs, type: 'FIR' },
                { files: [documentFiles.panFront, documentFiles.panBack].filter(Boolean) as File[], type: 'PAN_CARD' },
                { files: [documentFiles.aadhaarFront, documentFiles.aadhaarBack].filter(Boolean) as File[], type: 'AADHAAR' },
                { files: [documentFiles.dlFront, documentFiles.dlBack].filter(Boolean) as File[], type: 'DRIVING_LICENSE' },
                { files: [documentFiles.insuranceFront, documentFiles.insuranceBack].filter(Boolean) as File[], type: 'POLICY' },
                { files: documentFiles.bankPassbook ? [documentFiles.bankPassbook] : [], type: 'BANK_PASSBOOK' },
                { files: [documentFiles.rcFront, documentFiles.rcBack].filter(Boolean) as File[], type: 'RC_BOOK' },
                { files: documentFiles.additional, type: 'OTHER' },
            ]

            const totalUploads = uploads.length
            let done = 0

            // Auto fetch LIVE location for image watermarking
            setLocationStatus('Finding live location...')
            const liveLocation = await getCurrentLiveLocation()
            const locationToUse = liveLocation || formData.incidentLocation
            setLocationStatus(liveLocation ? 'Location found!' : 'Using incident location')

            for (const { files, type } of uploads) {
                if (files.length > 0) await uploadFiles(files, type, locationToUse)
                done++
                setUploadProgress(20 + Math.floor((done / totalUploads) * 70))
            }

            setUploadProgress(100)

            // Auto-regenerate PDF
            try {
                await fetch(`/api/admin/insurance-claims/${id}/generate-pdf`, { method: 'POST' })
                alert('Claim updated and PDF regenerated successfully!')
            } catch {
                alert('Claim updated! (PDF regeneration failed — regenerate manually)')
            }

            router.push(`/admin/insurance/${id}`)
        } catch (error) {
            console.error('Error updating claim:', error)
            alert('Failed to update claim')
        } finally {
            setSaving(false)
            setUploadProgress(0)
            setLocationStatus('')
        }
    }

    const inputStyle = {
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#d8d8d8'
    }

    const sectionStyle = {
        backgroundColor: '#111318',
        border: '1px solid rgba(255,255,255,0.07)'
    }

    // Group existing documents by type
    const docsByType = (type: string) => existingDocuments.filter(d => d.fileType === type)
    const isImage = (url: string) => /\.(jpg|jpeg|png|webp)$/i.test(url)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#16acd4' }} />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push(`/admin/insurance/${id}`)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <ArrowLeft className="w-5 h-5" style={{ color: '#d8d8d8' }} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-7 h-7" style={{ color: '#60a5fa' }} />
                        Edit Claim: {claimInfo?.claimNumber}
                    </h2>
                    <p className="mt-1" style={{ color: '#6b7080' }}>
                        Customer: {claimInfo?.user?.name} • {claimInfo?.source === 'WALK_IN' ? '🏢 Walk-in' : '🌐 Online'}
                    </p>
                </div>
            </div>

            {/* Upload Progress Bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="rounded-xl p-4" style={sectionStyle}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: '#d8d8d8' }}>Uploading files...</span>
                        <span className="text-sm font-bold" style={{ color: '#16acd4' }}>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%`, backgroundColor: '#16acd4' }}
                        />
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vehicle Details */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <Car className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        Vehicle Details
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Vehicle Make/Brand *</label>
                            <input type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Model *</label>
                            <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Variant</label>
                            <input type="text" name="vehicleVariant" value={formData.vehicleVariant} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Year</label>
                            <input type="text" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Vehicle Type</label>
                            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {VEHICLE_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Fuel Type</label>
                            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {FUEL_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Transmission</label>
                            <select name="transmissionType" value={formData.transmissionType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {TRANSMISSION_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Color</label>
                            <input type="text" name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Registration Number *</label>
                            <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>RC Number</label>
                            <input type="text" name="rcNumber" value={formData.rcNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Registration Date</label>
                            <input type="date" name="registrationDate" value={formData.registrationDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Usage Type</label>
                            <select name="usageType" value={formData.usageType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {USAGE_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Odometer (KM)</label>
                            <input type="number" name="odometerReading" value={formData.odometerReading} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Chassis Number *</label>
                            <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Engine Number *</label>
                            <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                    </div>
                </div>

                {/* Insurance Details */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <FileCheck className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        Insurance Details
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Insurance Company *</label>
                            {showCustomCompany ? (
                                <div className="flex gap-2">
                                    <input type="text" value={customCompany} onChange={e => setCustomCompany(e.target.value)} className="flex-1 px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                                    <button type="button" onClick={() => { setShowCustomCompany(false); setCustomCompany(''); }} className="px-3 rounded-lg" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <select name="insuranceCompany" value={formData.insuranceCompany} onChange={handleChange} className="flex-1 px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle} required>
                                        <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                        {INSURANCE_COMPANIES.map(c => <option key={c} value={c} style={{ backgroundColor: '#111318' }}>{c}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setShowCustomCompany(true)} className="px-3 rounded-lg" style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }}>
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Policy Number *</label>
                            <input type="text" name="policyNumber" value={formData.policyNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Policy Type</label>
                            {showCustomPolicyType ? (
                                <div className="flex gap-2">
                                    <input type="text" value={customPolicyType} onChange={e => setCustomPolicyType(e.target.value)} placeholder="Enter policy type" className="flex-1 px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                                    <button type="button" onClick={() => { setShowCustomPolicyType(false); setCustomPolicyType(''); }} className="px-3 rounded-lg" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <select name="policyType" value={formData.policyType} onChange={handleChange} className="flex-1 px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                        <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                        {POLICY_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setShowCustomPolicyType(true)} className="px-3 rounded-lg" style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }} title="Add custom policy type">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Policy Expiry Date</label>
                            <input type="date" name="policyExpiryDate" value={formData.policyExpiryDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Claim Type *</label>
                            <select name="claimType" value={formData.claimType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle} required>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {CLAIM_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Estimated Amount (₹) *</label>
                            <input type="number" name="estimatedClaimAmount" value={formData.estimatedClaimAmount} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>IDV (₹)</label>
                            <input type="number" name="idvValue" value={formData.idvValue} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                {CLAIM_STATUSES.map(s => <option key={s} value={s} style={{ backgroundColor: '#111318' }}>{s.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Vehicle Condition</label>
                            <select name="vehicleConditionBefore" value={formData.vehicleConditionBefore} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {VEHICLE_CONDITIONS.map(c => <option key={c} value={c} style={{ backgroundColor: '#111318' }}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Accident History</label>
                            <select name="previousAccidentHistory" value={formData.previousAccidentHistory} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {ACCIDENT_HISTORY.map(h => <option key={h} value={h} style={{ backgroundColor: '#111318' }}>{h}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Incident Details */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
                        Incident Details
                    </h3>

                    <div className="mb-6">
                        <label className="text-xs uppercase mb-3 block" style={{ color: '#6b7080' }}>Select damage areas:</label>
                        <div className="flex flex-wrap gap-2">
                            {DAMAGE_AREAS.map(area => (
                                <button
                                    key={area}
                                    type="button"
                                    onClick={() => toggleDamageArea(area)}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${formData.damageAreas.includes(area) ? 'ring-2 ring-[#16acd4]' : ''}`}
                                    style={{
                                        backgroundColor: formData.damageAreas.includes(area) ? 'rgba(22, 172, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                                        color: formData.damageAreas.includes(area) ? '#16acd4' : '#6b7080',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Incident Date</label>
                            <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Incident Location</label>
                            <input type="text" name="incidentLocation" value={formData.incidentLocation} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Damage Description *</label>
                        <textarea
                            name="damageDescription"
                            value={formData.damageDescription}
                            onChange={handleChange}
                            rows={5}
                            className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
                            style={inputStyle}
                            required
                        />
                    </div>
                </div>

                {/* Job & Spare Part Details */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                        <Wrench className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        Job & Spare Part Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Invoice Number</label>
                            <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                    </div>
                </div>

                {/* Documents & Images */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                        <Upload className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        Documents & Images
                    </h3>

                    {/* Helper component renderer */}
                    {([
                        { label: 'Damage Photos', type: 'DAMAGE_PHOTOS', stateKey: 'damageImages', multi: true },
                        { label: 'Under Repairing Photos', type: 'UNDER_REPAIRING_PHOTOS', stateKey: 'underRepairingPhotos', multi: true },
                        { label: 'After Repair Photos', type: 'AFTER_REPAIR_PHOTOS', stateKey: 'afterRepairPhotos', multi: true },
                        { label: 'FIR Documents', type: 'FIR', stateKey: 'firDocs', multi: true },
                        { label: 'Additional Documents', type: 'OTHER', stateKey: 'additional', multi: true },
                    ] as const).map(({ label, type, stateKey, multi }) => {
                        const existing = docsByType(type)
                        const newFiles = documentFiles[stateKey] as File[]
                        return (
                            <div key={type} className="mb-8">
                                <label className="text-sm font-medium text-white mb-3 block">
                                    {label}
                                    {existing.length > 0 && <span className="ml-2 text-xs font-normal" style={{ color: '#4ade80' }}>({existing.length} saved)</span>}
                                    {newFiles.length > 0 && <span className="ml-2 text-xs font-normal" style={{ color: '#16acd4' }}>+{newFiles.length} new</span>}
                                </label>

                                {/* Existing files */}
                                {existing.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mb-3">
                                        {existing.map(doc => (
                                            <div key={doc.id} className="relative group rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                                {isImage(doc.fileUrl) ? (
                                                    <img src={doc.fileUrl} alt={doc.fileName} className="w-24 h-24 object-cover" />
                                                ) : (
                                                    <div className="w-24 h-24 flex items-center justify-center text-xs text-center p-2" style={{ color: '#6b7080', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                                        {doc.fileName.slice(0, 20)}
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                    disabled={deletingDocId === doc.id}
                                                    className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    style={{ backgroundColor: 'rgba(239,68,68,0.9)' }}
                                                    title="Delete document"
                                                >
                                                    {deletingDocId === doc.id
                                                        ? <RefreshCw className="w-3 h-3 text-white animate-spin" />
                                                        : <Trash2 className="w-3 h-3 text-white" />}
                                                </button>
                                                <div className="px-2 py-1 text-xs truncate" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#9ca3af', maxWidth: '96px' }}>
                                                    {doc.fileName.slice(0, 12)}...
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New file input */}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    multiple={multi}
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || [])
                                        setDocumentFiles(prev => ({ ...prev, [stateKey]: [...prev[stateKey], ...files] }))
                                    }}
                                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#16acd4]/20 file:text-[#16acd4] file:font-medium file:cursor-pointer hover:file:bg-[#16acd4]/30"
                                    style={{ color: '#6b7080' }}
                                />
                                {newFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs" style={{ backgroundColor: 'rgba(22, 172, 212, 0.1)', color: '#16acd4' }}>
                                                {file.name.slice(0, 18)}...
                                                <button type="button" onClick={() => setDocumentFiles(prev => ({
                                                    ...prev,
                                                    [stateKey]: (prev[stateKey] as File[]).filter((_, i) => i !== idx)
                                                }))}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Single-file document pairs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {([
                            { label: 'PAN Card', frontKey: 'panFront', backKey: 'panBack', type: 'PAN_CARD' },
                            { label: 'Aadhaar Card', frontKey: 'aadhaarFront', backKey: 'aadhaarBack', type: 'AADHAAR' },
                            { label: 'Driving License', frontKey: 'dlFront', backKey: 'dlBack', type: 'DRIVING_LICENSE' },
                            { label: 'Insurance Policy Copy', frontKey: 'insuranceFront', backKey: 'insuranceBack', type: 'POLICY' },
                            { label: 'RC (Registration Certificate)', frontKey: 'rcFront', backKey: 'rcBack', type: 'RC_BOOK' },
                        ] as const).map(({ label, frontKey, backKey, type }) => {
                            const existing = docsByType(type)
                            return (
                                <div key={type} className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <label className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                                        {label}
                                        {existing.length > 0 && <span className="text-xs font-normal" style={{ color: '#4ade80' }}>✓ {existing.length} saved</span>}
                                    </label>
                                    {/* Existing docs */}
                                    {existing.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {existing.map(doc => (
                                                <div key={doc.id} className="relative group rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    {isImage(doc.fileUrl) ? (
                                                        <img src={doc.fileUrl} alt={doc.fileName} className="w-20 h-20 object-cover" />
                                                    ) : (
                                                        <div className="w-20 h-20 flex items-center justify-center text-xs text-center p-2" style={{ color: '#6b7080', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                                            {doc.fileName.slice(0, 15)}
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                        disabled={deletingDocId === doc.id}
                                                        className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        style={{ backgroundColor: 'rgba(239,68,68,0.9)' }}
                                                    >
                                                        {deletingDocId === doc.id
                                                            ? <RefreshCw className="w-3 h-3 text-white animate-spin" />
                                                            : <Trash2 className="w-3 h-3 text-white" />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-xs block mb-1" style={{ color: '#6b7080' }}>Front Side {documentFiles[frontKey] && `- ${(documentFiles[frontKey] as File).name.slice(0, 15)}...`}</span>
                                            <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, [frontKey]: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#16acd4]/20 file:text-[#16acd4] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                                        </div>
                                        <div>
                                            <span className="text-xs block mb-1" style={{ color: '#6b7080' }}>Back Side {documentFiles[backKey] && `- ${(documentFiles[backKey] as File).name.slice(0, 15)}...`}</span>
                                            <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, [backKey]: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#16acd4]/20 file:text-[#16acd4] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Bank Passbook */}
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <label className="text-sm font-medium text-white mb-3 block">
                                Bank Passbook Image
                                {docsByType('BANK_PASSBOOK').length > 0 && <span className="ml-2 text-xs font-normal" style={{ color: '#4ade80' }}>✓ {docsByType('BANK_PASSBOOK').length} saved</span>}
                            </label>
                            {docsByType('BANK_PASSBOOK').map(doc => (
                                <div key={doc.id} className="relative group inline-block rounded-lg overflow-hidden mb-3 mr-2" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {isImage(doc.fileUrl) ? (
                                        <img src={doc.fileUrl} alt={doc.fileName} className="w-20 h-20 object-cover" />
                                    ) : (
                                        <div className="w-20 h-20 flex items-center justify-center text-xs text-center p-2" style={{ color: '#6b7080', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                            {doc.fileName.slice(0, 15)}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        disabled={deletingDocId === doc.id}
                                        className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ backgroundColor: 'rgba(239,68,68,0.9)' }}
                                    >
                                        {deletingDocId === doc.id ? <RefreshCw className="w-3 h-3 text-white animate-spin" /> : <Trash2 className="w-3 h-3 text-white" />}
                                    </button>
                                </div>
                            ))}
                            <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, bankPassbook: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#16acd4]/20 file:text-[#16acd4] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                            {documentFiles.bankPassbook && <span className="text-xs mt-1 block" style={{ color: '#16acd4' }}>{documentFiles.bankPassbook.name}</span>}
                        </div>
                    </div>
                </div>

                {/* Admin Notes */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white mb-4">Admin Notes</h3>
                    <textarea
                        name="adminNotes"
                        value={formData.adminNotes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Internal notes (not visible to customer)..."
                        className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
                        style={inputStyle}
                    />
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pb-6">
                    <button
                        type="button"
                        onClick={() => router.push(`/admin/insurance/${id}`)}
                        className="px-6 py-3 rounded-lg font-medium transition-colors hover:bg-white/10"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#d8d8d8' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all hover:translate-y-[-1px] disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #16acd4, #d49510)',
                            color: '#000',
                            boxShadow: '0 4px 15px rgba(22, 172, 212, 0.3)'
                        }}
                    >
                        {saving ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4" /> Save Changes</>
                        )}
                    </button>
                </div>
            </form>

            {/* Saving Progress Overlay */}
            {saving && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="w-full max-w-md bg-[#111318] rounded-2xl p-8 border border-white/10 text-center">
                        <RefreshCw className="w-12 h-12 text-[#16acd4] animate-spin mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            {uploadProgress < 100 ? 'Saving Changes & Uploading...' : 'Finalizing...'}
                        </h3>

                        {locationStatus && (
                            <p className="text-[#16acd4] text-sm mb-4 font-medium flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#16acd4] animate-pulse" />
                                {locationStatus}
                            </p>
                        )}

                        <div className="w-full bg-white/5 rounded-full h-2 mb-4">
                            <div
                                className="bg-[#16acd4] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-gray-400 text-xs">
                            {uploadProgress}% Complete • Do not close window
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
