'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Zap, Battery, BatteryCharging, Shield, ArrowLeft, Car, FileCheck,
    AlertTriangle, RefreshCw, Save, User, Upload, Plus, X, Search,
    CheckCircle2, Languages, Cpu, Sparkles, MapPin, Gauge
} from "lucide-react"

import { getCurrentLiveLocation } from '@/lib/location-utils'
import {
    EVInsuranceFormData, EV_VEHICLE_TYPES, EV_TRANSMISSION_TYPES,
    EV_USAGE_TYPES, EV_CLAIM_TYPES, EV_POLICY_TYPES, EV_INSURANCE_COMPANIES,
    EV_SPECIFIC_DAMAGE_AREAS, EV_BATTERY_CAPACITY_PRESETS, EV_BATTERY_SOH_PRESETS,
    EV_CHARGER_TYPE_PRESETS, EV_ADDON_COVERS
} from './ev-insurance-types'

interface ExistingUser {
    id: string
    name: string
    email: string
    mobile: string
}

export function EVInsuranceForm({ isShopPortal = true }: { isShopPortal?: boolean }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [locationStatus, setLocationStatus] = useState<string>('')
    const [showCustomCompany, setShowCustomCompany] = useState(false)
    const [customCompany, setCustomCompany] = useState('')
    const [showCustomPolicyType, setShowCustomPolicyType] = useState(false)
    const [customPolicyType, setCustomPolicyType] = useState('')
    const [translating, setTranslating] = useState(false)

    // User selection mode
    const [userMode, setUserMode] = useState<'auto' | 'existing'>('auto')
    const [userSearch, setUserSearch] = useState('')
    const [searchingUsers, setSearchingUsers] = useState(false)
    const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([])
    const [selectedUser, setSelectedUser] = useState<ExistingUser | null>(null)

    // EV add-on protections
    const [selectedEvCovers, setSelectedEvCovers] = useState<string[]>([
        'Battery Pack & Cell Degradation Shield',
        'Charging Cable & Home Wallbox Charger Cover'
    ])

    // File references for uploads
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

    const [formData, setFormData] = useState<EVInsuranceFormData>({
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
        vehicleType: 'Electric SUV',
        fuelType: 'Electric',
        transmissionType: 'Single-Speed Automatic',
        vehicleColor: '',
        registrationNumber: '',
        rcNumber: '',
        registrationDate: '',
        usageType: 'Personal / Private',
        odometerReading: '',
        chassisNumber: '',
        motorNumber: '',
        engineNumber: '',

        // EV Powertrain & Battery Details
        batteryCapacity: '40.5 kWh',
        batterySerialNumber: '',
        batteryHealthSoH: '100%',
        chargerType: 'CCS2 DC Fast Combo + 3.3kW Portable AC',
        chargerSerialNumber: '',
        evSpecificCover: [],

        // Insurance Policy
        insuranceCompany: '',
        policyNumber: '',
        policyType: 'Comprehensive + EV Battery Pack Protection',
        policyStartDate: '',
        policyEndDate: '',
        policyExpiryDate: '',
        claimType: 'Accident / Collision',
        estimatedClaimAmount: '',
        idvValue: '',
        status: 'SUBMITTED',
        vehicleConditionBefore: 'Good',
        previousAccidentHistory: 'No Previous Accidents',

        // Incident Details
        damageAreas: [],
        incidentDate: '',
        incidentLocation: '',
        damageDescription: '',

        // Admin Notes
        adminNotes: ''
    })

    const basePath = isShopPortal ? '/shop/billing/insurance' : '/admin/insurance'

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

    const toggleEvCover = (cover: string) => {
        setSelectedEvCovers(prev =>
            prev.includes(cover) ? prev.filter(c => c !== cover) : [...prev, cover]
        )
    }

    const calculateVehicleAge = () => {
        if (!formData.registrationDate) return '-'
        const regDate = new Date(formData.registrationDate)
        const now = new Date()
        const years = Math.floor((now.getTime() - regDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        const months = Math.floor(((now.getTime() - regDate.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))
        if (years > 0) return `${years} years ${months} months`
        return `${months} months`
    }

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
            setFormData(prev => ({ ...prev, damageDescription: translatedText }))
            alert('Translation successful!')
        } catch (error) {
            console.error('Translation error:', error)
            alert('Translation failed. Please check AI settings.')
        } finally {
            setTranslating(false)
        }
    }

    const uploadFiles = async (claimId: string, files: File[], documentType: string, location?: string) => {
        if (files.length === 0) return

        const data = new FormData()
        files.forEach(file => data.append('files', file))
        data.append('documentType', documentType)
        data.append('claimId', claimId)
        data.append('location', location || '')

        const response = await fetch('/api/admin/upload', {
            method: 'POST',
            body: data
        })

        if (!response.ok) {
            const error = await response.json()
            console.error(`Failed to upload ${documentType}:`, error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const effectiveInsuranceCompany = showCustomCompany ? customCompany : formData.insuranceCompany

        const requiredFields = [
            { key: 'vehicleMake', label: 'EV Make / Brand' },
            { key: 'vehicleModel', label: 'EV Model' },
            { key: 'registrationNumber', label: 'Registration Number' },
            { key: 'chassisNumber', label: 'Chassis / VIN' },
            { key: 'policyNumber', label: 'Insurance Policy Number' },
            { key: 'claimType', label: 'Claim Type' },
            { key: 'estimatedClaimAmount', label: 'Estimated Claim Amount' },
            { key: 'damageDescription', label: 'Damage Description' },
        ]

        if (userMode === 'auto') {
            requiredFields.push(
                { key: 'customerName', label: 'Customer Name' },
                { key: 'customerMobile', label: 'Customer Phone Number' }
            )
        }

        if (!formData.motorNumber && !formData.engineNumber) {
            alert('Please enter the Drive Motor Serial / UID for this Electric Vehicle')
            return
        }

        if (!effectiveInsuranceCompany.trim()) {
            alert('Please select or specify the Insurance Company')
            return
        }

        for (const f of requiredFields) {
            const val = formData[f.key as keyof EVInsuranceFormData]
            if (!val || (Array.isArray(val) && val.length === 0)) {
                alert(`Please fill in all required fields. Missing: ${f.label}`)
                return
            }
        }

        if (userMode === 'existing' && !selectedUser) {
            alert('Please select an existing customer')
            return
        }

        try {
            setLoading(true)
            setUploadProgress(0)

            const motorId = formData.motorNumber || formData.engineNumber

            const payload = {
                ...formData,
                isEv: true,
                fuelType: 'Electric',
                motorNumber: motorId,
                engineNumber: motorId,
                evSpecificCover: selectedEvCovers.join(', '),
                insuranceCompany: effectiveInsuranceCompany,
                policyType: showCustomPolicyType ? customPolicyType : formData.policyType,
                userId: userMode === 'existing' ? selectedUser?.id : undefined,
                estimatedDamage: formData.estimatedClaimAmount ? parseFloat(formData.estimatedClaimAmount) : undefined,
                idvValue: formData.idvValue ? parseFloat(formData.idvValue) : undefined,
                odometerReading: formData.odometerReading ? parseInt(formData.odometerReading) : undefined
            }

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

            const totalUploads = 14
            let completedUploads = 0
            const updateProgress = () => {
                completedUploads++
                setUploadProgress(20 + Math.floor((completedUploads / totalUploads) * 80))
            }

            setLocationStatus('Tagging live GPS location for watermark stamping...')
            const liveLocation = await getCurrentLiveLocation()
            const locationToUse = liveLocation || formData.incidentLocation
            setLocationStatus(liveLocation ? 'GPS Watermark Stamp Ready' : 'Using incident location')

            // Upload photos & files
            if (documentFiles.damageImages.length > 0) {
                await uploadFiles(claimId, documentFiles.damageImages, 'DAMAGE_PHOTOS', locationToUse)
            }
            updateProgress()

            if (documentFiles.underRepairingPhotos.length > 0) {
                await uploadFiles(claimId, documentFiles.underRepairingPhotos, 'UNDER_REPAIRING_PHOTOS', locationToUse)
            }
            updateProgress()

            if (documentFiles.afterRepairPhotos.length > 0) {
                await uploadFiles(claimId, documentFiles.afterRepairPhotos, 'AFTER_REPAIR_PHOTOS', locationToUse)
            }
            updateProgress()

            if (documentFiles.firDocs.length > 0) {
                await uploadFiles(claimId, documentFiles.firDocs, 'FIR', locationToUse)
            }
            updateProgress()

            const panFiles = [documentFiles.panFront, documentFiles.panBack].filter(Boolean) as File[]
            if (panFiles.length > 0) await uploadFiles(claimId, panFiles, 'PAN_CARD')
            updateProgress()

            const aadhaarFiles = [documentFiles.aadhaarFront, documentFiles.aadhaarBack].filter(Boolean) as File[]
            if (aadhaarFiles.length > 0) await uploadFiles(claimId, aadhaarFiles, 'AADHAAR')
            updateProgress()

            const dlFiles = [documentFiles.dlFront, documentFiles.dlBack].filter(Boolean) as File[]
            if (dlFiles.length > 0) await uploadFiles(claimId, dlFiles, 'DRIVING_LICENSE')
            updateProgress()

            const insuranceFiles = [documentFiles.insuranceFront, documentFiles.insuranceBack].filter(Boolean) as File[]
            if (insuranceFiles.length > 0) await uploadFiles(claimId, insuranceFiles, 'POLICY')
            updateProgress()

            if (documentFiles.bankPassbook) await uploadFiles(claimId, [documentFiles.bankPassbook], 'BANK_PASSBOOK')
            updateProgress()

            const rcFiles = [documentFiles.rcFront, documentFiles.rcBack].filter(Boolean) as File[]
            if (rcFiles.length > 0) await uploadFiles(claimId, rcFiles, 'RC_BOOK')
            updateProgress()

            if (documentFiles.additional.length > 0) await uploadFiles(claimId, documentFiles.additional, 'OTHER')
            updateProgress()

            setUploadProgress(100)

            alert('⚡ EV Insurance Claim registered successfully!')
            router.push(`${basePath}/ev-view/${claimId}`)
        } catch (error) {
            console.error('Error creating EV claim:', error)
            alert('Failed to create EV claim')
        } finally {
            setLoading(false)
            setUploadProgress(0)
            setLocationStatus('')
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-24 text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0d1525] via-[#09101d] to-[#07090d] border border-cyan-500/30 shadow-xl shadow-cyan-950/20">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.push(basePath)}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                                ⚡ EV SPECIALIZED INSURANCE
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 mt-1">
                            Electric Vehicle (EV) Insurance Claim
                        </h1>
                        <p className="text-xs text-zinc-400 font-medium">
                            Comprehensive evaluation for EV battery packs, drive motors, chargers, and high-voltage damage
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => router.push(`${basePath}/new`)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                        Switch to Standard Claim
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Customer Selection */}
                <div className="rounded-3xl p-6 sm:p-8 bg-[#0a0c10] border border-white/10 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">1. Customer Information</h3>
                            <p className="text-xs text-zinc-400">Policyholder contact & profile details</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => { setUserMode('auto'); setSelectedUser(null); }}
                            className={`p-5 rounded-2xl text-left transition-all border ${
                                userMode === 'auto'
                                    ? 'bg-cyan-950/20 border-cyan-500 shadow-md shadow-cyan-950/30'
                                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                            }`}
                        >
                            <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">Recommended</div>
                            <div className="font-extrabold text-white text-base">Auto Create New User Profile</div>
                            <div className="text-xs text-zinc-400 mt-1">Automatically registers customer profile & sends insurance notification.</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setUserMode('existing')}
                            className={`p-5 rounded-2xl text-left transition-all border ${
                                userMode === 'existing'
                                    ? 'bg-cyan-950/20 border-cyan-500 shadow-md shadow-cyan-950/30'
                                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                            }`}
                        >
                            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Workshop Database</div>
                            <div className="font-extrabold text-white text-base">Select Existing Customer</div>
                            <div className="text-xs text-zinc-400 mt-1">Search and link an existing registered workshop customer.</div>
                        </button>
                    </div>

                    {userMode === 'existing' ? (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchUsers(); } }}
                                        placeholder="Search by customer name, email or mobile..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={searchUsers}
                                    disabled={searchingUsers}
                                    className="px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs bg-cyan-500 hover:bg-cyan-400 text-black transition-all"
                                >
                                    {searchingUsers ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
                                </button>
                            </div>

                            {selectedUser && (
                                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500 text-black font-black flex items-center justify-center">
                                            {selectedUser.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{selectedUser.name}</div>
                                            <div className="text-xs text-zinc-400">{selectedUser.email} • {selectedUser.mobile}</div>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setSelectedUser(null)} className="p-1.5 text-zinc-400 hover:text-red-400">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {existingUsers.length > 0 && !selectedUser && (
                                <div className="grid gap-2 max-h-56 overflow-y-auto">
                                    {existingUsers.map(u => (
                                        <button
                                            key={u.id}
                                            type="button"
                                            onClick={() => setSelectedUser(u)}
                                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left flex items-center justify-between transition-all"
                                        >
                                            <div>
                                                <div className="text-sm font-bold text-white">{u.name}</div>
                                                <div className="text-xs text-zinc-400">{u.mobile} • {u.email}</div>
                                            </div>
                                            <span className="text-xs text-cyan-400 font-bold">Select</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Customer Name *</label>
                                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Full Name" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none font-bold" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Mobile Number *</label>
                                <input type="tel" name="customerMobile" value={formData.customerMobile} onChange={handleChange} placeholder="Phone" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none font-bold" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Email Address</label>
                                <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} placeholder="Email" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">City</label>
                                <input type="text" name="customerCity" value={formData.customerCity} onChange={handleChange} placeholder="e.g. Mumbai, Delhi" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none" />
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Electric Vehicle Specifications */}
                <div className="rounded-3xl p-6 sm:p-8 bg-[#0a0c10] border border-white/10 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                            <Car className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">2. Electric Vehicle Details</h3>
                            <p className="text-xs text-zinc-400">Make, Model, Registration & VIN Chassis</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">EV Brand / Make *</label>
                            <input type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} placeholder="e.g. Tata, MG, BYD, Hyundai, Kia" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none font-bold" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">EV Model *</label>
                            <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="e.g. Nexon EV, ZS EV, Atto 3, Ioniq 5" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none font-bold" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Model Variant</label>
                            <input type="text" name="vehicleVariant" value={formData.vehicleVariant} onChange={handleChange} placeholder="e.g. Empowered Plus LR / Exclusive" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Manufacturing Year</label>
                            <input type="text" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} placeholder="YYYY" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">EV Category / Body Type *</label>
                            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm bg-[#121620] border border-white/10 focus:border-cyan-500 text-white outline-none font-bold cursor-pointer" required>
                                {EV_VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Transmission</label>
                            <select name="transmissionType" value={formData.transmissionType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm bg-[#121620] border border-white/10 focus:border-cyan-500 text-white outline-none cursor-pointer">
                                {EV_TRANSMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Registration Number *</label>
                            <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="e.g. DL01EV1234" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none font-mono font-bold" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Color</label>
                            <input type="text" name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} placeholder="e.g. Teal Blue, Starry Night" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Chassis VIN (17-digit) *</label>
                            <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} placeholder="17 Digit VIN" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none font-mono font-bold" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Odometer Reading (KM)</label>
                            <input type="number" name="odometerReading" value={formData.odometerReading} onChange={handleChange} placeholder="Total Odo KM" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Registration Date</label>
                            <input type="date" name="registrationDate" value={formData.registrationDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">EV Age</label>
                            <div className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-cyan-400 font-bold">{calculateVehicleAge()}</div>
                        </div>
                    </div>
                </div>

                {/* 3. ⚡ Dedicated High-Voltage Battery & Powertrain System */}
                <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0c182a] via-[#09101d] to-[#07090d] border-2 border-cyan-500/40 shadow-xl shadow-cyan-950/30">
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-cyan-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-cyan-500 text-black font-black shadow-md shadow-cyan-500/30">
                                <BatteryCharging className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-black uppercase tracking-widest text-cyan-400">
                                    3. ⚡ High-Voltage Battery & Electric Drive Motor System
                                </h3>
                                <p className="text-xs text-zinc-400">
                                    Battery pack health diagnostic, motor serial number, charger rating & BMS integrity
                                </p>
                            </div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            EV POWERTRAIN SPEC
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                        {/* Battery Capacity */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-1.5 block flex items-center gap-1.5">
                                <Battery className="w-3.5 h-3.5 text-cyan-400" /> Battery Capacity (kWh) *
                            </label>
                            <input
                                type="text"
                                name="batteryCapacity"
                                value={formData.batteryCapacity}
                                onChange={handleChange}
                                placeholder="e.g. 40.5 kWh, 50.3 kWh"
                                className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-cyan-500/40 focus:border-cyan-400 text-white outline-none font-bold mb-2"
                                required
                            />
                            <div className="flex flex-wrap gap-1.5">
                                {EV_BATTERY_CAPACITY_PRESETS.slice(0, 6).map(cap => (
                                    <button
                                        key={cap}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, batteryCapacity: cap }))}
                                        className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-colors"
                                    >
                                        {cap}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Battery Pack Serial Number */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-1.5 block flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Battery Pack Serial / UID
                            </label>
                            <input
                                type="text"
                                name="batterySerialNumber"
                                value={formData.batterySerialNumber}
                                onChange={handleChange}
                                placeholder="e.g. BATT-NEX-2023-88214"
                                className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-cyan-500/40 focus:border-cyan-400 text-white outline-none font-mono"
                            />
                            <p className="text-[10px] text-zinc-500 mt-1.5">Found on bottom battery plate or BMS scan report</p>
                        </div>

                        {/* Battery State of Health (SoH %) */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-1.5 block flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Battery State of Health (SoH %)
                            </label>
                            <input
                                type="text"
                                name="batteryHealthSoH"
                                value={formData.batteryHealthSoH}
                                onChange={handleChange}
                                placeholder="e.g. 98.5%"
                                className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-cyan-500/40 focus:border-cyan-400 text-white outline-none font-mono mb-2"
                            />
                            <div className="flex flex-wrap gap-1.5">
                                {EV_BATTERY_SOH_PRESETS.slice(0, 5).map(soh => (
                                    <button
                                        key={soh}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, batteryHealthSoH: soh }))}
                                        className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-colors"
                                    >
                                        {soh}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Drive Motor Serial */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-1.5 block flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-cyan-400" /> Drive Motor Serial / UID *
                            </label>
                            <input
                                type="text"
                                name="motorNumber"
                                value={formData.motorNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, motorNumber: e.target.value, engineNumber: e.target.value }))}
                                placeholder="e.g. EM-PMSM-120KW-8819"
                                className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-cyan-500/40 focus:border-cyan-400 text-white outline-none font-mono font-bold"
                                required
                            />
                        </div>

                        {/* Charger Type */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-1.5 block">
                                Charger Port & Wallbox Specs
                            </label>
                            <select
                                name="chargerType"
                                value={formData.chargerType}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl text-sm bg-[#121620] border border-cyan-500/40 focus:border-cyan-400 text-white outline-none cursor-pointer"
                            >
                                {EV_CHARGER_TYPE_PRESETS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Charger Serial Number */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-1.5 block">
                                Home Charger / Cable Serial No
                            </label>
                            <input
                                type="text"
                                name="chargerSerialNumber"
                                value={formData.chargerSerialNumber}
                                onChange={handleChange}
                                placeholder="e.g. CHG-AC-7KW-8812"
                                className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-cyan-500/40 focus:border-cyan-400 text-white outline-none font-mono"
                            />
                        </div>
                    </div>

                    {/* EV Addon Covers */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-2.5 block">
                            ⚡ EV Add-on Protections & Endorsements:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {EV_ADDON_COVERS.map(cover => {
                                const selected = selectedEvCovers.includes(cover)
                                return (
                                    <button
                                        key={cover}
                                        type="button"
                                        onClick={() => toggleEvCover(cover)}
                                        className={`p-3 rounded-xl text-left text-xs font-bold transition-all border flex items-center justify-between ${
                                            selected
                                                ? 'bg-cyan-500 text-black border-cyan-400 shadow-sm font-black'
                                                : 'bg-white/[0.02] text-zinc-300 border-white/10 hover:bg-white/[0.05]'
                                        }`}
                                    >
                                        <span className="line-clamp-2 leading-tight">{cover}</span>
                                        {selected && <CheckCircle2 className="w-4 h-4 ml-1.5 shrink-0 stroke-[3]" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* 4. Insurance Policy Details */}
                <div className="rounded-3xl p-6 sm:p-8 bg-[#0a0c10] border border-white/10 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                            <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">4. Insurance Policy Details</h3>
                            <p className="text-xs text-zinc-400">Insurer, Policy Number, IDV Value & Claim Amount</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Insurance Company *</label>
                            {showCustomCompany ? (
                                <div className="flex gap-2">
                                    <input type="text" value={customCompany} onChange={e => setCustomCompany(e.target.value)} placeholder="Company name" className="flex-1 px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none" required />
                                    <button type="button" onClick={() => { setShowCustomCompany(false); setCustomCompany(''); }} className="px-3 rounded-xl bg-red-500/20 text-red-400">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <select name="insuranceCompany" value={formData.insuranceCompany} onChange={handleChange} className="flex-1 px-4 py-3 rounded-xl text-sm bg-[#121620] border border-white/10 text-white outline-none cursor-pointer font-bold" required>
                                        <option value="">-- Select Insurer --</option>
                                        {EV_INSURANCE_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setShowCustomCompany(true)} className="px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-bold">
                                        + Other
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Policy Number *</label>
                            <input type="text" name="policyNumber" value={formData.policyNumber} onChange={handleChange} placeholder="e.g. POL-EV-88219" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none font-mono font-bold" required />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Policy Type</label>
                            <select name="policyType" value={formData.policyType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm bg-[#121620] border border-white/10 text-white outline-none cursor-pointer">
                                {EV_POLICY_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Claim Type *</label>
                            <select name="claimType" value={formData.claimType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm bg-[#121620] border border-white/10 text-white outline-none cursor-pointer font-bold" required>
                                {EV_CLAIM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Estimated Claim Amount (₹) *</label>
                            <input type="number" name="estimatedClaimAmount" value={formData.estimatedClaimAmount} onChange={handleChange} placeholder="Estimated repair cost" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none font-bold text-cyan-400" required />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">EV IDV Value (₹)</label>
                            <input type="number" name="idvValue" value={formData.idvValue} onChange={handleChange} placeholder="Insured Declared Value" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none" />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Policy Start Date</label>
                            <input type="date" name="policyStartDate" value={formData.policyStartDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none" />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Policy End Date</label>
                            <input type="date" name="policyEndDate" value={formData.policyEndDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none" />
                        </div>
                    </div>
                </div>

                {/* 5. Incident & EV Damage Assessment */}
                <div className="rounded-3xl p-6 sm:p-8 bg-[#0a0c10] border border-white/10 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">5. Incident & EV Damage Assessment</h3>
                            <p className="text-xs text-zinc-400">Identify all impacted components including high-voltage systems</p>
                        </div>
                    </div>

                    {/* Damage Areas Chips */}
                    <div className="mb-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2.5 block">
                            Select All Applicable Damage Points:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {EV_SPECIFIC_DAMAGE_AREAS.map(area => {
                                const selected = formData.damageAreas.includes(area)
                                const isHV = area.startsWith('⚡')
                                return (
                                    <button
                                        key={area}
                                        type="button"
                                        onClick={() => toggleDamageArea(area)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                            selected
                                                ? isHV
                                                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/30 font-black'
                                                    : 'bg-amber-500 text-black border-amber-400 font-bold'
                                                : isHV
                                                    ? 'bg-cyan-950/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-950/40'
                                                    : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        {area}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Incident Date</label>
                            <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Incident Location</label>
                            <input type="text" name="incidentLocation" value={formData.incidentLocation} onChange={handleChange} placeholder="e.g. Mumbai-Pune Expressway Near Lonavala" className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Damage Description *</label>
                        <div className="relative">
                            <textarea
                                name="damageDescription"
                                value={formData.damageDescription}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe accident details, impact to underbody battery pack, motor housing, front radar or charger socket..."
                                className="w-full px-4 py-3 rounded-2xl text-sm bg-white/5 border border-white/10 focus:border-cyan-500 text-white outline-none resize-none"
                                required
                            />
                            {formData.damageDescription && (
                                <button
                                    type="button"
                                    onClick={handleTranslate}
                                    disabled={translating}
                                    className="absolute right-3 bottom-3 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition-all"
                                >
                                    {translating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
                                    <span>AI Translate to English</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 6. Document & Media Uploads */}
                <div className="rounded-3xl p-6 sm:p-8 bg-[#0a0c10] border border-white/10 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                            <Upload className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">6. Inspection Photos & Documents</h3>
                            <p className="text-xs text-zinc-400">Includes GPS timestamp watermarks stamped automatically</p>
                        </div>
                    </div>

                    {/* Damage Images */}
                    <div className="mb-6 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-extrabold text-white">
                                EV Damage Photos (Include Battery Underbody, Motor Bay & Charging Socket)
                            </label>
                            {documentFiles.damageImages.length > 0 && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                    {documentFiles.damageImages.length} SELECTED
                                </span>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                                const files = Array.from(e.target.files || [])
                                setDocumentFiles(prev => ({ ...prev, damageImages: [...prev.damageImages, ...files] }))
                            }}
                            className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-cyan-500 file:text-black file:font-black file:cursor-pointer hover:file:bg-cyan-400 cursor-pointer"
                        />
                        {documentFiles.damageImages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {documentFiles.damageImages.map((f, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300">
                                        <span>{f.name.slice(0, 18)}...</span>
                                        <button type="button" onClick={() => setDocumentFiles(prev => ({ ...prev, damageImages: prev.damageImages.filter((_, i) => i !== idx) }))} className="text-zinc-500 hover:text-red-400">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Customer Documents Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                            <label className="text-xs font-bold text-white block mb-2">RC Book (Front & Back)</label>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => setDocumentFiles(prev => ({ ...prev, rcFront: e.target.files?.[0] || null }))} className="w-full text-[11px] text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:font-bold" />
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                            <label className="text-xs font-bold text-white block mb-2">Driving License</label>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => setDocumentFiles(prev => ({ ...prev, dlFront: e.target.files?.[0] || null }))} className="w-full text-[11px] text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:font-bold" />
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                            <label className="text-xs font-bold text-white block mb-2">Insurance Policy Document</label>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => setDocumentFiles(prev => ({ ...prev, insuranceFront: e.target.files?.[0] || null }))} className="w-full text-[11px] text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:font-bold" />
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                            <label className="text-xs font-bold text-white block mb-2">PAN Card</label>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => setDocumentFiles(prev => ({ ...prev, panFront: e.target.files?.[0] || null }))} className="w-full text-[11px] text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:font-bold" />
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                            <label className="text-xs font-bold text-white block mb-2">Aadhaar Card</label>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => setDocumentFiles(prev => ({ ...prev, aadhaarFront: e.target.files?.[0] || null }))} className="w-full text-[11px] text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:font-bold" />
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                            <label className="text-xs font-bold text-white block mb-2">Bank Passbook / Cheque</label>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => setDocumentFiles(prev => ({ ...prev, bankPassbook: e.target.files?.[0] || null }))} className="w-full text-[11px] text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:font-bold" />
                        </div>
                    </div>

                    {/* BMS & Diagnostic Report */}
                    <div className="mt-4 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                        <label className="text-xs font-bold text-cyan-300 block mb-1.5">
                            ⚡ EV Battery Diagnostic BMS Log / Scanner Report (PDF / Image)
                        </label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            multiple
                            onChange={(e) => {
                                const files = Array.from(e.target.files || [])
                                setDocumentFiles(prev => ({ ...prev, additional: [...prev.additional, ...files] }))
                            }}
                            className="w-full text-[11px] text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-300 file:font-bold"
                        />
                    </div>
                </div>

                {/* 7. Internal Workshop Notes */}
                <div className="rounded-3xl p-6 sm:p-8 bg-[#0a0c10] border border-white/10 shadow-lg">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3">
                        7. Internal Workshop Notes
                    </h3>
                    <textarea
                        name="adminNotes"
                        value={formData.adminNotes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Internal survey notes, estimated battery pack turnaround time, surveyor comments..."
                        className="w-full px-4 py-3 rounded-2xl text-sm bg-white/5 border border-white/10 text-white outline-none resize-none"
                    />
                </div>

                {/* Submit Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => router.push(basePath)}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-all"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs transition-all active:scale-95 disabled:opacity-50 text-black shadow-lg"
                        style={{
                            background: "linear-gradient(135deg, #00d4ff 0%, #0077ff 100%)",
                            boxShadow: "0 4px 20px rgba(0, 212, 255, 0.4)"
                        }}
                    >
                        {loading ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> Submitting EV Claim...</>
                        ) : (
                            <><Zap className="w-4 h-4 fill-black" /> Register EV Insurance Claim</>
                        )}
                    </button>
                </div>
            </form>

            {/* Upload Modal Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#0d121c] rounded-3xl p-8 border border-cyan-500/40 text-center shadow-2xl">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                            <Zap className="w-8 h-8 animate-pulse" />
                        </div>
                        <h4 className="text-lg font-black text-white mb-1">
                            {uploadProgress < 100 ? 'Processing EV Claim & Photos...' : 'Finalizing Registration...'}
                        </h4>
                        {locationStatus && (
                            <p className="text-cyan-400 text-xs font-semibold mb-4">{locationStatus}</p>
                        )}
                        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden mb-3">
                            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{uploadProgress}% Complete</p>
                    </div>
                </div>
            )}
        </div>
    )
}
