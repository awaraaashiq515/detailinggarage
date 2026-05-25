'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Shield, ArrowLeft, Car, FileCheck, AlertTriangle,
    RefreshCw, Save, User, Upload, Plus, X, Search, CheckCircle2, Languages
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
const POLICY_TYPES = ['Comprehensive', 'Third Party', 'Third Party Fire & Theft', 'Own Damage Only']
const INSURANCE_COMPANIES = [
    'ICICI Lombard', 'HDFC ERGO', 'Bajaj Allianz', 'New India Assurance',
    'National Insurance', 'United India Insurance', 'Oriental Insurance',
    'Tata AIG', 'Reliance General', 'SBI General', 'Cholamandalam MS',
    'Royal Sundaram', 'Future Generali', 'Bharti AXA', 'IFFCO Tokio'
]

const DAMAGE_AREAS = [
    'Front Bumper', 'Rear Bumper', 'Left Side', 'Right Side',
    'Roof', 'Hood/Bonnet', 'Trunk/Boot', 'Windshield', 'Rear Glass',
    'Left Headlight', 'Right Headlight', 'Left Tail Light', 'Right Tail Light',
    'Left Door (Front)', 'Left Door (Rear)', 'Right Door (Front)', 'Right Door (Rear)',
    'Left Fender', 'Right Fender', 'Engine', 'Suspension', 'Axle',
    'Wheels/Tyres', 'Interior', 'Electrical System', 'Total Loss'
]

interface ExistingUser {
    id: string
    name: string
    email: string
    mobile: string
}

export default function NewClaimPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [locationStatus, setLocationStatus] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showCustomCompany, setShowCustomCompany] = useState(false)
    const [customCompany, setCustomCompany] = useState('')
    const [showCustomPolicyType, setShowCustomPolicyType] = useState(false)
    const [customPolicyType, setCustomPolicyType] = useState('')
    const [translating, setTranslating] = useState(false)

    // User selection
    const [userMode, setUserMode] = useState<'auto' | 'existing'>('auto')
    const [userSearch, setUserSearch] = useState('')
    const [searchingUsers, setSearchingUsers] = useState(false)
    const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([])
    const [selectedUser, setSelectedUser] = useState<ExistingUser | null>(null)

    // Translation handler
    const handleTranslate = async () => {
        if (!formData.damageDescription.trim()) {
            alert('Please enter damage description first')
            return
        }

        setTranslating(true)
        try {
            const response = await fetch('/api/admin/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: formData.damageDescription })
            })

            if (!response.ok) {
                const error = await response.json()
                alert(error.error || 'Translation failed')
                return
            }

            const { translatedText } = await response.json()
            setFormData({ ...formData, damageDescription: translatedText })
            alert('Translation successful!')
        } catch (error) {
            console.error('Translation error:', error)
            alert('Translation failed. Please check AI settings.')
        } finally {
            setTranslating(false)
        }
    }

    // File upload states
    const [damageImageInputs, setDamageImageInputs] = useState<number[]>([1])
    const [firInputs, setFirInputs] = useState<number[]>([1])
    const [additionalInputs, setAdditionalInputs] = useState<number[]>([1])
    // File references for all document types
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
        // Customer Details
        customerName: '',
        customerMobile: '',
        customerEmail: '',
        customerCity: '',

        // Vehicle Details
        vehicleMake: '',
        vehicleModel: '',
        vehicleVariant: '',
        vehicleYear: new Date().getFullYear().toString(),
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


        // Insurance Details
        insuranceCompany: '',
        policyNumber: '',
        policyType: '',
        policyStartDate: '',
        policyEndDate: '',
        policyExpiryDate: '',
        claimType: '',
        estimatedClaimAmount: '',
        idvValue: '',
        status: 'SUBMITTED',
        vehicleConditionBefore: '',
        previousAccidentHistory: '',

        // Incident Details
        damageAreas: [] as string[],
        incidentDate: '',
        incidentLocation: '',
        damageDescription: '',

        // Admin Notes
        adminNotes: ''
    })

    // Calculate vehicle age
    const calculateVehicleAge = () => {
        if (!formData.registrationDate) return '-'
        const regDate = new Date(formData.registrationDate)
        const now = new Date()
        const years = Math.floor((now.getTime() - regDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        const months = Math.floor(((now.getTime() - regDate.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))
        if (years > 0) return `${years} years ${months} months`
        return `${months} months`
    }

    // Search existing users
    const searchUsers = async () => {
        if (!userSearch.trim()) return
        setSearchingUsers(true)
        try {
            const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(userSearch)}`)
            if (res.ok) {
                const data = await res.json()
                setExistingUsers(data.users || [])
            }
        } catch (error) {
            console.error('Error searching users:', error)
        } finally {
            setSearchingUsers(false)
        }
    }

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

    // Helper function to upload files (with location for watermark stamping on images)
    const uploadFiles = async (claimId: string, files: File[], documentType: string, location?: string) => {
        if (files.length === 0) return

        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        formData.append('documentType', documentType)
        formData.append('claimId', claimId)
        // Pass location so images get a camera-style timestamp+location watermark
        formData.append('location', location || '')

        const response = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            const error = await response.json()
            console.error(`Failed to upload ${documentType}:`, error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Resolve effective values for custom fields
        const effectiveInsuranceCompany = showCustomCompany ? customCompany : formData.insuranceCompany

        // Validate required fields (excluding insuranceCompany — we check it separately)
        const required = ['vehicleMake', 'vehicleModel', 'registrationNumber', 'chassisNumber',
            'engineNumber', 'policyNumber', 'claimType', 'estimatedClaimAmount', 'damageDescription']

        if (userMode === 'auto') {
            required.push('customerName', 'customerMobile')
        }

        // Validate insurance company separately (handles custom input)
        if (!effectiveInsuranceCompany.trim()) {
            alert('Please fill in all required fields. Missing: Insurance Company')
            return
        }

        for (const field of required) {
            if (!formData[field as keyof typeof formData] ||
                (Array.isArray(formData[field as keyof typeof formData]) && (formData[field as keyof typeof formData] as string[]).length === 0)) {
                alert(`Please fill in all required fields. Missing: ${field.replace(/([A-Z])/g, ' $1')}`)
                return
            }
        }

        if (userMode === 'existing' && !selectedUser) {
            alert('Please select an existing user')
            return
        }

        try {
            setLoading(true)
            setUploadProgress(0)

            const payload = {
                ...formData,
                insuranceCompany: showCustomCompany ? customCompany : formData.insuranceCompany,
                policyType: showCustomPolicyType ? customPolicyType : formData.policyType,
                userId: userMode === 'existing' ? selectedUser?.id : undefined,
                estimatedDamage: formData.estimatedClaimAmount ? parseFloat(formData.estimatedClaimAmount) : undefined,
                idvValue: formData.idvValue ? parseFloat(formData.idvValue) : undefined,
                odometerReading: formData.odometerReading ? parseInt(formData.odometerReading) : undefined
            }

            // Step 1: Create the claim
            const response = await fetch('/api/admin/insurance-claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (!response.ok) {
                alert(`Error: ${data.error}`)
                return
            }

            const claimId = data.claim.id
            setUploadProgress(20)

            // Step 2: Upload all documents
            const totalUploads = 14
            let completedUploads = 0

            const updateProgress = () => {
                completedUploads++
                setUploadProgress(20 + Math.floor((completedUploads / totalUploads) * 80))
            }

            // Auto fetch LIVE location for image watermarking
            setLocationStatus('Finding live location...')
            const liveLocation = await getCurrentLiveLocation()
            const locationToUse = liveLocation || formData.incidentLocation
            setLocationStatus(liveLocation ? 'Location found!' : 'Using incident location')

            // Upload damage images (with location watermark)
            if (documentFiles.damageImages.length > 0) {
                await uploadFiles(claimId, documentFiles.damageImages, 'DAMAGE_PHOTOS', locationToUse)
            }
            updateProgress()

            // Upload under repairing photos (with location watermark)
            if (documentFiles.underRepairingPhotos.length > 0) {
                await uploadFiles(claimId, documentFiles.underRepairingPhotos, 'UNDER_REPAIRING_PHOTOS', locationToUse)
            }
            updateProgress()

            // Upload after repair photos (with location watermark)
            if (documentFiles.afterRepairPhotos.length > 0) {
                await uploadFiles(claimId, documentFiles.afterRepairPhotos, 'AFTER_REPAIR_PHOTOS', locationToUse)
            }
            updateProgress()

            // Upload FIR documents (with location watermark)
            if (documentFiles.firDocs.length > 0) {
                await uploadFiles(claimId, documentFiles.firDocs, 'FIR', locationToUse)
            }
            updateProgress()

            // Upload PAN card
            const panFiles = [documentFiles.panFront, documentFiles.panBack].filter(Boolean) as File[]
            if (panFiles.length > 0) {
                await uploadFiles(claimId, panFiles, 'PAN_CARD')
            }
            updateProgress()

            // Upload Aadhaar card
            const aadhaarFiles = [documentFiles.aadhaarFront, documentFiles.aadhaarBack].filter(Boolean) as File[]
            if (aadhaarFiles.length > 0) {
                await uploadFiles(claimId, aadhaarFiles, 'AADHAAR')
            }
            updateProgress()

            // Upload Driving License
            const dlFiles = [documentFiles.dlFront, documentFiles.dlBack].filter(Boolean) as File[]
            if (dlFiles.length > 0) {
                await uploadFiles(claimId, dlFiles, 'DRIVING_LICENSE')
            }
            updateProgress()

            // Upload Insurance Policy
            const insuranceFiles = [documentFiles.insuranceFront, documentFiles.insuranceBack].filter(Boolean) as File[]
            if (insuranceFiles.length > 0) {
                await uploadFiles(claimId, insuranceFiles, 'POLICY')
            }
            updateProgress()

            // Upload Bank Passbook
            if (documentFiles.bankPassbook) {
                await uploadFiles(claimId, [documentFiles.bankPassbook], 'BANK_PASSBOOK')
            }
            updateProgress()

            // Upload RC
            const rcFiles = [documentFiles.rcFront, documentFiles.rcBack].filter(Boolean) as File[]
            if (rcFiles.length > 0) {
                await uploadFiles(claimId, rcFiles, 'RC_BOOK')
            }
            updateProgress()

            // Upload Additional documents
            if (documentFiles.additional.length > 0) {
                await uploadFiles(claimId, documentFiles.additional, 'OTHER')
            }
            updateProgress()

            setUploadProgress(100)

            const msg = data.newUserCreated
                ? 'Claim created successfully! New customer account created and welcome email sent.'
                : 'Claim created successfully!'
            alert(msg)
            router.push(`/admin/insurance/${claimId}`)
        } catch (error) {
            console.error('Error creating claim:', error)
            alert('Failed to create claim')
        } finally {
            setLoading(false)
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

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-5">
                <button
                    onClick={() => router.push('/admin/insurance')}
                    className="p-3 rounded-2xl transition-all hover:bg-white bg-slate-100/50 border border-slate-200 text-slate-400 hover:text-accent shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-accent/10 rounded-xl">
                            <Shield className="w-6 h-6 text-accent" />
                        </div>
                        New Insurance Claim
                    </h2>
                    <p className="mt-1 text-slate-500 text-sm font-medium">Create and process a walk-in insurance claim</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* User Selection */}
                <div className="rounded-[2.5rem] p-8 bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <User className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">User Selection</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <button
                            type="button"
                            onClick={() => { setUserMode('auto'); setSelectedUser(null); }}
                            className={`group relative p-6 rounded-3xl text-left transition-all border ${userMode === 'auto' ? 'bg-accent/5 border-accent shadow-lg shadow-accent/5' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`font-black uppercase tracking-widest text-[10px] ${userMode === 'auto' ? 'text-accent' : 'text-slate-400'}`}>Recommended</div>
                                {userMode === 'auto' && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                            </div>
                            <div className="font-bold text-slate-900 text-lg mb-1">Auto Create New User</div>
                            <div className="text-xs text-slate-500 font-medium leading-relaxed">System will automatically create a customer account using the details provided below.</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserMode('existing')}
                            className={`group p-6 rounded-3xl text-left transition-all border ${userMode === 'existing' ? 'bg-blue-500/5 border-blue-500 shadow-lg shadow-blue-500/5' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`font-black uppercase tracking-widest text-[10px] ${userMode === 'existing' ? 'text-blue-500' : 'text-slate-400'}`}>Selective</div>
                                {userMode === 'existing' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                            </div>
                            <div className="font-bold text-slate-900 text-lg mb-1">Select Existing User</div>
                            <div className="text-xs text-slate-500 font-medium leading-relaxed">Search and link this claim to an existing customer already in the CRM database.</div>
                        </button>
                    </div>

                    {userMode === 'existing' ? (
                        <div className="space-y-6">
                            <div className="flex gap-3 relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    placeholder="Search by name, email or mobile..."
                                    className="flex-1 pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 text-slate-900 font-bold placeholder:text-slate-300"
                                />
                                <button
                                    type="button"
                                    onClick={searchUsers}
                                    disabled={searchingUsers}
                                    className="px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-50 active:scale-95"
                                >
                                    {searchingUsers ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
                                </button>
                            </div>

                            {selectedUser && (
                                <div className="p-6 rounded-3xl flex items-center justify-between bg-emerald-50 border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
                                            {selectedUser.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-extrabold text-slate-900">{selectedUser.name}</div>
                                            <div className="text-xs text-slate-500 font-medium">{selectedUser.email} • <span className="text-emerald-600 font-bold font-mono tracking-tight">{selectedUser.mobile}</span></div>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setSelectedUser(null)} className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            {existingUsers.length > 0 && !selectedUser && (
                                <div className="grid gap-3 max-h-[400px] overflow-y-auto p-2 -m-2 scrollbar-thin scrollbar-thumb-slate-200">
                                    {existingUsers.map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => setSelectedUser(user)}
                                            className="w-full p-5 rounded-2xl text-left transition-all bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-500/30 hover:shadow-md group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{user.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.email} • {user.mobile}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Customer Name <span className="text-accent">*</span></label>
                                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Full Name" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Phone Number <span className="text-accent">*</span></label>
                                <input type="tel" name="customerMobile" value={formData.customerMobile} onChange={handleChange} placeholder="Mobile" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Email</label>
                                <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} placeholder="Email" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">City</label>
                                <input type="text" name="customerCity" value={formData.customerCity} onChange={handleChange} placeholder="City" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Vehicle Details */}
                <div className="rounded-[2.5rem] p-8 bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                            <Car className="w-5 h-5 text-orange-500" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Vehicle Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Vehicle Make/Brand <span className="text-accent">*</span></label>
                            <input type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} placeholder="e.g. Honda, Maruti" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Model <span className="text-accent">*</span></label>
                            <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="e.g. City, Swift" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Model Variant</label>
                            <input type="text" name="vehicleVariant" value={formData.vehicleVariant} onChange={handleChange} placeholder="e.g. VXi, ZXi Plus" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Manufacturing Year</label>
                            <input type="text" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} placeholder="YYYY" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Vehicle Type <span className="text-accent">*</span></label>
                            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none cursor-pointer" required>
                                <option value="">-- Select Type --</option>
                                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Fuel Type <span className="text-accent">*</span></label>
                            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none cursor-pointer" required>
                                <option value="">-- Select Fuel Type --</option>
                                {FUEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Transmission Type</label>
                            <select name="transmissionType" value={formData.transmissionType} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none cursor-pointer">
                                <option value="">-- Select Transmission --</option>
                                {TRANSMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Vehicle Color</label>
                            <input type="text" name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} placeholder="e.g. White, Black" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Registration Number <span className="text-accent">*</span></label>
                            <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="e.g. MH12AB1234" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">RC Number</label>
                            <input type="text" name="rcNumber" value={formData.rcNumber} onChange={handleChange} placeholder="RC Book Number" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Registration Date</label>
                            <input type="date" name="registrationDate" value={formData.registrationDate} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Usage Type</label>
                            <select name="usageType" value={formData.usageType} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none cursor-pointer">
                                <option value="">-- Select Usage --</option>
                                {USAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Odometer Reading (KM)</label>
                            <input type="number" name="odometerReading" value={formData.odometerReading} onChange={handleChange} placeholder="Total KM driven" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Vehicle Age</label>
                            <div className="w-full px-4 py-3.5 rounded-2xl text-sm transition-all bg-slate-50 border border-slate-100 text-accent font-bold" >{calculateVehicleAge()}</div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Chassis Number (VIN) <span className="text-accent">*</span></label>
                            <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} placeholder="17-digit VIN" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Engine Number <span className="text-accent">*</span></label>
                            <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} placeholder="Engine identification number" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                        </div>
                    </div>
                </div>

                {/* Insurance Details */}
                <div className="rounded-[2.5rem] p-8 bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <FileCheck className="w-5 h-5 text-purple-500" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Insurance Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Insurance Company <span className="text-accent">*</span></label>
                            {showCustomCompany ? (
                                <div className="flex gap-2">
                                    <input type="text" value={customCompany} onChange={e => setCustomCompany(e.target.value)} placeholder="Enter company name" className="flex-1 px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                                    <button type="button" onClick={() => { setShowCustomCompany(false); setCustomCompany(''); }} className="px-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <select name="insuranceCompany" value={formData.insuranceCompany} onChange={handleChange} className="flex-1 px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none cursor-pointer" required>
                                        <option value="">-- Select --</option>
                                        {INSURANCE_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setShowCustomCompany(true)} className="px-3 rounded-2xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors flex items-center justify-center gap-1" title="Add custom company">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Policy Number <span className="text-accent">*</span></label>
                            <input type="text" name="policyNumber" value={formData.policyNumber} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Policy Type</label>
                            {showCustomPolicyType ? (
                                <div className="flex gap-2">
                                    <input type="text" value={customPolicyType} onChange={e => setCustomPolicyType(e.target.value)} placeholder="Enter policy type" className="flex-1 px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
                                    <button type="button" onClick={() => { setShowCustomPolicyType(false); setCustomPolicyType(''); }} className="px-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <select name="policyType" value={formData.policyType} onChange={handleChange} className="flex-1 px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none cursor-pointer">
                                        <option value="">-- Select Type --</option>
                                        {POLICY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setShowCustomPolicyType(true)} className="px-3 rounded-2xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors flex items-center justify-center gap-1" title="Add custom policy type">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Policy Start Date</label>
                            <input type="date" name="policyStartDate" value={formData.policyStartDate} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Policy End Date</label>
                            <input type="date" name="policyEndDate" value={formData.policyEndDate} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Policy Expiry Date</label>
                            <input type="date" name="policyExpiryDate" value={formData.policyExpiryDate} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Claim Type <span className="text-accent">*</span></label>
                            <select name="claimType" value={formData.claimType} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none cursor-pointer" required>
                                <option value="">-- Select Claim Type --</option>
                                {CLAIM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Estimated Claim Amount (₹) <span className="text-accent">*</span></label>
                            <input type="number" name="estimatedClaimAmount" value={formData.estimatedClaimAmount} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">IDV - Insured Declared Value (₹)</label>
                            <input type="number" name="idvValue" value={formData.idvValue} onChange={handleChange} placeholder="Vehicle's market value" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Claim Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none cursor-pointer">
                                {CLAIM_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Vehicle Condition Before</label>
                            <select name="vehicleConditionBefore" value={formData.vehicleConditionBefore} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none cursor-pointer">
                                <option value="">-- Select Condition --</option>
                                {VEHICLE_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Previous Accident History</label>
                            <select name="previousAccidentHistory" value={formData.previousAccidentHistory} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none cursor-pointer">
                                <option value="">-- Select History --</option>
                                {ACCIDENT_HISTORY.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Claim / Incident Details */}
                <div className="rounded-[2.5rem] p-8 bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Claim / Incident Details</h3>
                    </div>

                    {/* Damage Areas */}
                    <div className="mb-8">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 block">Select all applicable damage areas:</label>
                        <div className="flex flex-wrap gap-2">
                            {DAMAGE_AREAS.map(area => (
                                <button
                                    key={area}
                                    type="button"
                                    onClick={() => toggleDamageArea(area)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${formData.damageAreas.includes(area) ? 'bg-amber-100 text-amber-600 border border-amber-300 shadow-sm' : 'bg-slate-50 border border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Accident/Incident Date</label>
                            <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Accident Location</label>
                            <input type="text" name="incidentLocation" value={formData.incidentLocation} onChange={handleChange} placeholder="e.g. Mumbai-Pune Highway" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Damage Description <span className="text-accent">*</span></label>
                        <div className="relative group">
                            <textarea
                                name="damageDescription"
                                value={formData.damageDescription}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Describe the damage in detail..."
                                className="w-full px-4 py-4 rounded-3xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-medium placeholder:text-slate-300 resize-none"
                                required
                            />

                            {/* AI Translate Button */}
                            {formData.damageDescription && (
                                <button
                                    type="button"
                                    onClick={handleTranslate}
                                    disabled={translating}
                                    className="absolute right-4 bottom-4 p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all shadow-sm group/btn flex items-center gap-2 disabled:opacity-50"
                                    title="Auto-translate to English using AI"
                                >
                                    {translating ? <RefreshCw className="w-4 h-4 animate-spin text-blue-500" /> : <Languages className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">Translate</span>
                                </button>
                            )}
                        </div>
                        <p className="text-xs mt-2 ml-2 text-slate-400 font-medium">Click translate to convert Hindi to English using AI</p>
                    </div>
                </div>

                {/* Documents & Images */}
                <div className="rounded-[2.5rem] p-8 bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <Upload className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Documents & Images</h3>
                    </div>

                    {/* Damage Images */}
                    <div className="mb-8 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <label className="text-xs font-bold text-slate-900 mb-3 block">
                            Damage Images
                            {documentFiles.damageImages.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-emerald-100 text-emerald-600">
                                    {documentFiles.damageImages.length} SELECTED
                                </span>
                            )}
                        </label>
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || [])
                                    setDocumentFiles(prev => ({
                                        ...prev,
                                        damageImages: [...prev.damageImages, ...files]
                                    }))
                                }}
                                className="w-full text-sm file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-bold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400"
                            />
                            {documentFiles.damageImages.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {documentFiles.damageImages.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-sm">
                                            {file.name.slice(0, 20)}...
                                            <button type="button" onClick={() => setDocumentFiles(prev => ({
                                                ...prev,
                                                damageImages: prev.damageImages.filter((_, i) => i !== idx)
                                            }))} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-[11px] font-medium text-slate-500">Upload images of the damaged vehicle (JPG, PNG - max 5MB each)</p>
                        </div>
                    </div>

                    {/* Under Repairing Photos */}
                    <div className="mb-8 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <label className="text-xs font-bold text-slate-900 mb-3 block">
                            Under Repairing Photos
                            {documentFiles.underRepairingPhotos.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-emerald-100 text-emerald-600">
                                    {documentFiles.underRepairingPhotos.length} SELECTED
                                </span>
                            )}
                        </label>
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || [])
                                    setDocumentFiles(prev => ({
                                        ...prev,
                                        underRepairingPhotos: [...prev.underRepairingPhotos, ...files]
                                    }))
                                }}
                                className="w-full text-sm file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-bold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400"
                            />
                            {documentFiles.underRepairingPhotos.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {documentFiles.underRepairingPhotos.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-sm">
                                            {file.name.slice(0, 20)}...
                                            <button type="button" onClick={() => setDocumentFiles(prev => ({
                                                ...prev,
                                                underRepairingPhotos: prev.underRepairingPhotos.filter((_, i) => i !== idx)
                                            }))} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-[11px] font-medium text-slate-500">Upload images of the vehicle under repair (JPG, PNG - max 5MB each)</p>
                        </div>
                    </div>

                    {/* After Repair Photos */}
                    <div className="mb-8 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <label className="text-xs font-bold text-slate-900 mb-3 block">
                            After Repair Photos
                            {documentFiles.afterRepairPhotos.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-emerald-100 text-emerald-600">
                                    {documentFiles.afterRepairPhotos.length} SELECTED
                                </span>
                            )}
                        </label>
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || [])
                                    setDocumentFiles(prev => ({
                                        ...prev,
                                        afterRepairPhotos: [...prev.afterRepairPhotos, ...files]
                                    }))
                                }}
                                className="w-full text-sm file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-bold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400"
                            />
                            {documentFiles.afterRepairPhotos.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {documentFiles.afterRepairPhotos.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-sm">
                                            {file.name.slice(0, 20)}...
                                            <button type="button" onClick={() => setDocumentFiles(prev => ({
                                                ...prev,
                                                afterRepairPhotos: prev.afterRepairPhotos.filter((_, i) => i !== idx)
                                            }))} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-[11px] font-medium text-slate-500">Upload photos after the vehicle has been repaired (JPG, PNG - max 5MB each)</p>
                        </div>
                    </div>

                    {/* FIR Document */}
                    <div className="mb-8 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <label className="text-xs font-bold text-slate-900 mb-3 block">
                            FIR Document <span className="text-slate-400 font-medium">(Optional)</span>
                            {documentFiles.firDocs.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-emerald-100 text-emerald-600">
                                    {documentFiles.firDocs.length} SELECTED
                                </span>
                            )}
                        </label>
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="application/pdf,image/jpeg,image/png"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || [])
                                    setDocumentFiles(prev => ({ ...prev, firDocs: [...prev.firDocs, ...files] }))
                                }}
                                className="w-full text-sm file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-bold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400"
                            />
                            {documentFiles.firDocs.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {documentFiles.firDocs.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-sm">
                                            {file.name.slice(0, 20)}...
                                            <button type="button" onClick={() => setDocumentFiles(prev => ({
                                                ...prev,
                                                firDocs: prev.firDocs.filter((_, i) => i !== idx)
                                            }))} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-[11px] font-medium text-slate-500">Upload FIR copy (PDF, JPG, PNG - max 5MB)</p>
                        </div>
                    </div>

                    {/* Required Identity Documents */}
                    <div className="mb-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.1em] text-slate-900 mb-2">Required Identity Documents</h4>
                        <p className="text-xs font-medium text-slate-500 mb-6">Please upload the following documents (PDF, JPG, PNG - max 5MB each)</p>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* PAN Card */}
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <label className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    PAN Card <span className="text-accent">*</span>
                                    {(documentFiles.panFront || documentFiles.panBack) && <span className="text-emerald-500"><CheckCircle2 className="w-4 h-4" /></span>}
                                </label>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Front Side {documentFiles.panFront && <span className="text-emerald-500 ml-2 normal-case tracking-normal">- {documentFiles.panFront.name.slice(0, 15)}...</span>}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, panFront: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Back Side {documentFiles.panBack && <span className="text-emerald-500 ml-2 normal-case tracking-normal">- {documentFiles.panBack.name.slice(0, 15)}...</span>}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, panBack: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Aadhaar Card */}
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <label className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    Aadhaar Card <span className="text-accent">*</span>
                                    {(documentFiles.aadhaarFront || documentFiles.aadhaarBack) && <span className="text-emerald-500"><CheckCircle2 className="w-4 h-4" /></span>}
                                </label>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Front Side {documentFiles.aadhaarFront && <span className="text-emerald-500 ml-2 normal-case tracking-normal">- {documentFiles.aadhaarFront.name.slice(0, 15)}...</span>}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, aadhaarFront: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Back Side {documentFiles.aadhaarBack && <span className="text-emerald-500 ml-2 normal-case tracking-normal">- {documentFiles.aadhaarBack.name.slice(0, 15)}...</span>}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, aadhaarBack: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Driving License */}
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <label className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    Driving License <span className="text-accent">*</span>
                                    {(documentFiles.dlFront || documentFiles.dlBack) && <span className="text-emerald-500"><CheckCircle2 className="w-4 h-4" /></span>}
                                </label>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Front Side {documentFiles.dlFront && <span className="text-emerald-500 ml-2 normal-case tracking-normal">- {documentFiles.dlFront.name.slice(0, 15)}...</span>}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, dlFront: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Back Side {documentFiles.dlBack && <span className="text-emerald-500 ml-2 normal-case tracking-normal">- {documentFiles.dlBack.name.slice(0, 15)}...</span>}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, dlBack: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Insurance Policy Copy */}
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <label className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    Insurance Policy Copy <span className="text-accent">*</span>
                                    {(documentFiles.insuranceFront || documentFiles.insuranceBack) && <span className="text-emerald-500"><CheckCircle2 className="w-4 h-4" /></span>}
                                </label>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Front Side {documentFiles.insuranceFront && <span className="text-emerald-500 ml-2 normal-case tracking-normal">- {documentFiles.insuranceFront.name.slice(0, 15)}...</span>}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, insuranceFront: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Back Side {documentFiles.insuranceBack && <span className="text-emerald-500 ml-2 normal-case tracking-normal">- {documentFiles.insuranceBack.name.slice(0, 15)}...</span>}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, insuranceBack: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Bank Passbook */}
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <label className="text-xs font-bold text-slate-900 mb-4 block">
                                    Bank Passbook Image
                                    {documentFiles.bankPassbook && <span className="inline-flex items-center text-emerald-500 ml-2"><CheckCircle2 className="w-4 h-4 mr-1" /> <span className="text-xs font-normal text-slate-500">{documentFiles.bankPassbook.name.slice(0, 15)}...</span></span>}
                                </label>
                                <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, bankPassbook: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400" />
                            </div>

                            {/* RC Image */}
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <label className="text-xs font-bold text-slate-900 mb-4 block flex items-center gap-2">
                                    RC Image <span className="text-[10px] tracking-widest font-black uppercase text-slate-400">(Registration Certificate)</span>
                                    {(documentFiles.rcFront || documentFiles.rcBack) && <span className="text-emerald-500"><CheckCircle2 className="w-4 h-4" /></span>}
                                </label>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Front Side {documentFiles.rcFront && <span className="text-emerald-500 ml-2 normal-case tracking-normal">- {documentFiles.rcFront.name.slice(0, 15)}...</span>}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, rcFront: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Back Side {documentFiles.rcBack && <span className="text-emerald-500 ml-2 normal-case tracking-normal">- {documentFiles.rcBack.name.slice(0, 15)}...</span>}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, rcBack: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Documents */}
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <label className="text-xs font-bold text-slate-900 mb-3 block">
                            Additional Documents <span className="font-medium text-slate-400">(Optional)</span>
                            {documentFiles.additional.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-emerald-100 text-emerald-600">
                                    {documentFiles.additional.length} SELECTED
                                </span>
                            )}
                        </label>
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="application/pdf,image/jpeg,image/png"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || [])
                                    setDocumentFiles(prev => ({ ...prev, additional: [...prev.additional, ...files] }))
                                }}
                                className="w-full text-sm file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-bold file:cursor-pointer hover:file:bg-blue-100 transition-colors text-slate-400"
                            />
                            {documentFiles.additional.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {documentFiles.additional.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-sm">
                                            {file.name.slice(0, 20)}...
                                            <button type="button" onClick={() => setDocumentFiles(prev => ({
                                                ...prev,
                                                additional: prev.additional.filter((_, i) => i !== idx)
                                            }))} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-[11px] font-medium text-slate-500">Upload any additional supporting documents</p>
                        </div>
                    </div>
                </div>

                {/* Admin Notes */}
                <div className="rounded-[2.5rem] p-8 bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 mb-6">Admin Notes</h3>
                    <textarea
                        name="adminNotes"
                        value={formData.adminNotes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Internal notes (not visible to customer)..."
                        className="w-full px-4 py-4 rounded-3xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-medium placeholder:text-slate-300 resize-none"
                    />
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pb-6">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/insurance')}
                        className="px-8 py-3.5 rounded-2xl font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-sm disabled:opacity-50"
                        style={{
                            background: '#ff4b55',
                            color: '#ffffff',
                            boxShadow: '0 4px 15px rgba(255, 75, 85, 0.3)'
                        }}
                    >
                        {loading ? (
                            <><RefreshCw className="w-5 h-5 animate-spin" /> Creating Claim...</>
                        ) : (
                            <><Save className="w-5 h-5" /> Create Insurance Claim</>
                        )}
                    </button>
                </div>
            </form>

            {/* Upload Progress Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl text-center">
                        <div className="p-4 bg-accent/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <RefreshCw className="w-10 h-10 text-accent animate-spin" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">
                            {uploadProgress < 100 ? 'Creating Claim & Uploading...' : 'Finalizing...'}
                        </h3>

                        {locationStatus && (
                            <p className="text-accent text-sm mb-6 font-bold flex items-center justify-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(255,75,85,0.6)]" />
                                {locationStatus}
                            </p>
                        )}

                        <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                            <div
                                className="bg-accent h-3 rounded-full transition-all duration-300 relative"
                                style={{ width: `${uploadProgress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', backgroundSize: '200% 100%' }}></div>
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                            {uploadProgress}% Complete • Do not close window
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
