'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Shield, ArrowLeft, Car, FileCheck, AlertTriangle,
    RefreshCw, Save, User, Upload, Plus, X, Search, CheckCircle2, Languages,
    Zap, Battery, BatteryCharging, Sparkles, Cpu
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

const STANDARD_DAMAGE_AREAS = [
    'Front Bumper', 'Rear Bumper', 'Left Side', 'Right Side',
    'Roof', 'Hood/Bonnet', 'Trunk/Boot', 'Windshield', 'Rear Glass',
    'Left Headlight', 'Right Headlight', 'Left Tail Light', 'Right Tail Light',
    'Left Door (Front)', 'Left Door (Rear)', 'Right Door (Front)', 'Right Door (Rear)',
    'Left Fender', 'Right Fender', 'Engine', 'Suspension', 'Axle',
    'Wheels/Tyres', 'Interior', 'Electrical System', 'Total Loss'
]

const EV_DAMAGE_AREAS = [
    '⚡ Battery Pack Underbody / Skid Plate',
    '⚡ High Voltage (HV) Cabling & Inverter',
    '⚡ Electric Drive Motor & Gearbox',
    '⚡ EV Charging Port / Socket Flap',
    '⚡ Battery Thermal Cooling Radiator',
    '⚡ Regenerative Brake Actuator'
]

const BATTERY_CAPACITY_PRESETS = [
    '19.2 kWh', '24.0 kWh', '30.2 kWh', '35.0 kWh', '40.5 kWh', '45.0 kWh', '50.3 kWh', '60.0 kWh', '72.6 kWh', '77.4 kWh', '100.0 kWh'
]

const BATTERY_SOH_PRESETS = [
    '100%', '98%', '95%', '92%', '88%', '85%'
]

const CHARGER_TYPE_PRESETS = [
    'CCS2 DC Fast + 3.3kW Portable AC',
    'Type 2 AC Wallbox (7.2 kW)',
    'Type 2 AC Wallbox (11.0 kW)',
    '15A Portable Home 3-Pin Charger (3.3 kW)',
    'CCS2 Ultra-Fast Combo (50kW-150kW)',
    'Bharat DC-001 (15 kW)',
    'Custom / Other'
]

const EV_COVER_OPTIONS = [
    'Battery Pack & Cell Degradation Protection',
    'Electric Drive Motor & Power Inverter Cover',
    'Home Wallbox Charger & Charging Cable Cover',
    'Zero Depreciation on EV Electronics & Sensors',
    'Emergency Flatbed Towing to Fast-Charging Hub',
    'High Voltage Surge & Water Ingress Protection'
]

interface ExistingUser {
    id: string
    name: string
    email: string
    mobile: string
}

function NewClaimForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [isEv, setIsEv] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [locationStatus, setLocationStatus] = useState<string>('')
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

    // EV add-on protections selection
    const [selectedEvCovers, setSelectedEvCovers] = useState<string[]>([])

    // File upload states
    const [damageImageInputs, setDamageImageInputs] = useState<number[]>([1])
    const [firInputs, setFirInputs] = useState<number[]>([1])
    const [additionalInputs, setAdditionalInputs] = useState<number[]>([1])

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

        // EV Specific Fields
        batteryCapacity: '',
        batterySerialNumber: '',
        batteryHealthSoH: '',
        motorNumber: '',
        chargerType: '',
        chargerSerialNumber: '',

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

    // Auto-detect EV mode from query params (?type=ev or ?isEv=true)
    useEffect(() => {
        const typeParam = searchParams.get('type')
        const isEvParam = searchParams.get('isEv')
        if (typeParam === 'ev' || isEvParam === 'true') {
            setIsEv(true)
            setFormData(prev => ({
                ...prev,
                fuelType: 'Electric',
                transmissionType: prev.transmissionType || 'Automatic'
            }))
        }
    }, [searchParams])

    const handleSwitchVehicleMode = (evMode: boolean) => {
        setIsEv(evMode)
        if (evMode) {
            setFormData(prev => ({
                ...prev,
                fuelType: 'Electric',
                transmissionType: prev.transmissionType || 'Automatic'
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                fuelType: prev.fuelType === 'Electric' ? 'Petrol' : prev.fuelType
            }))
        }
    }

    const toggleEvCover = (cover: string) => {
        setSelectedEvCovers(prev =>
            prev.includes(cover) ? prev.filter(c => c !== cover) : [...prev, cover]
        )
    }

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

    // Helper function to upload files
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

        // Validate required fields
        const required = ['vehicleMake', 'vehicleModel', 'registrationNumber', 'chassisNumber',
            'policyNumber', 'claimType', 'estimatedClaimAmount', 'damageDescription']

        if (!isEv) {
            required.push('engineNumber')
        } else {
            // For EV, motorNumber or engineNumber is required
            if (!formData.motorNumber && !formData.engineNumber) {
                alert('Please enter the Drive Motor ID / Motor Number for this Electric Vehicle')
                return
            }
        }

        if (userMode === 'auto') {
            required.push('customerName', 'customerMobile')
        }

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

            const motorId = isEv ? (formData.motorNumber || formData.engineNumber) : formData.motorNumber
            const engineId = isEv ? (formData.engineNumber || formData.motorNumber) : formData.engineNumber

            const payload = {
                ...formData,
                isEv,
                motorNumber: motorId,
                engineNumber: engineId,
                batteryCapacity: isEv ? formData.batteryCapacity : undefined,
                batterySerialNumber: isEv ? formData.batterySerialNumber : undefined,
                batteryHealthSoH: isEv ? formData.batteryHealthSoH : undefined,
                chargerType: isEv ? formData.chargerType : undefined,
                chargerSerialNumber: isEv ? formData.chargerSerialNumber : undefined,
                evSpecificCover: isEv && selectedEvCovers.length > 0 ? selectedEvCovers.join(', ') : undefined,
                insuranceCompany: effectiveInsuranceCompany,
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

            setLocationStatus('Finding live location...')
            const liveLocation = await getCurrentLiveLocation()
            const locationToUse = liveLocation || formData.incidentLocation
            setLocationStatus(liveLocation ? 'Location found!' : 'Using incident location')

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

            const msg = data.newUserCreated
                ? `${isEv ? '⚡ EV' : ''} Claim created successfully! Customer account created and welcome email sent.`
                : `${isEv ? '⚡ EV' : ''} Claim created successfully!`
            alert(msg)
            router.push(`/shop/billing/insurance/${claimId}`)
        } catch (error) {
            console.error('Error creating claim:', error)
            alert('Failed to create claim')
        } finally {
            setLoading(false)
            setUploadProgress(0)
            setLocationStatus('')
        }
    }

    const availableDamageAreas = isEv
        ? [...EV_DAMAGE_AREAS, ...STANDARD_DAMAGE_AREAS]
        : STANDARD_DAMAGE_AREAS

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-5">
                <button
                    onClick={() => router.push('/shop/billing/insurance')}
                    className="p-3 rounded-2xl transition-all hover:bg-white bg-slate-100/50 border border-slate-200 text-slate-400 hover:text-accent shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className={`p-2 rounded-xl ${isEv ? 'bg-cyan-500/10 text-cyan-600' : 'bg-accent/10 text-accent'}`}>
                            {isEv ? <Zap className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                        </div>
                        {isEv ? '⚡ New Electric Vehicle (EV) Insurance Claim' : 'New Insurance Claim'}
                    </h2>
                    <p className="mt-1 text-slate-500 text-sm font-medium">
                        {isEv
                            ? 'Specialized evaluation form with High-Voltage battery, drive motor, and EV charging cover'
                            : 'Create and process a walk-in vehicle insurance claim'}
                    </p>
                </div>
            </div>

            {/* Powertrain / Vehicle Category Mode Switcher */}
            <div className="p-2 rounded-3xl bg-slate-100 border border-slate-200/80 flex flex-col sm:flex-row gap-2 shadow-inner">
                <button
                    type="button"
                    onClick={() => handleSwitchVehicleMode(false)}
                    className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                        !isEv
                            ? 'bg-white text-slate-900 shadow-md border border-slate-200/60'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                    <Car className="w-4 h-4 text-orange-500" />
                    <span>🚗 Standard Vehicle (Petrol / Diesel / Hybrid)</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleSwitchVehicleMode(true)}
                    className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                        isEv
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/40'
                            : 'text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50'
                    }`}
                >
                    <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>⚡ Electric Vehicle (EV) — Specialized Mode</span>
                </button>
            </div>

            {isEv && (
                <div className="p-4 rounded-2xl bg-cyan-50/90 border border-cyan-200 flex items-center gap-3 text-cyan-900 text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-2 rounded-xl bg-cyan-500 text-white shadow-md">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-extrabold uppercase tracking-wider text-[11px] text-cyan-800 mr-2">⚡ EV Mode Active:</span>
                        Fuel auto-set to Electric, Engine replaced with Drive Motor ID, and specialized Battery Pack & Charging inspection parameters enabled.
                    </div>
                </div>
            )}

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
                            <div className="text-xs text-slate-500 font-medium leading-relaxed">Search and attach an existing customer profile to this insurance claim.</div>
                        </button>
                    </div>

                    {userMode === 'existing' ? (
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchUsers(); } }}
                                        placeholder="Search by customer name, email or mobile..."
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white text-slate-900 font-bold placeholder:text-slate-400"
                                    />
                                </div>
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
                                <div className="p-6 rounded-3xl flex items-center justify-between bg-emerald-50 border border-emerald-100 shadow-sm">
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
                                <div className="grid gap-3 max-h-[300px] overflow-y-auto p-2 -m-2">
                                    {existingUsers.map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => setSelectedUser(user)}
                                            className="w-full p-4 rounded-2xl text-left transition-all bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-500/30 hover:shadow-md group"
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
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                <Car className="w-5 h-5 text-orange-500" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Vehicle Details</h3>
                        </div>
                        {isEv && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-100 text-cyan-700 border border-cyan-200">
                                ⚡ EV Powertrain
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Vehicle Make/Brand <span className="text-accent">*</span></label>
                            <input type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} placeholder={isEv ? "e.g. Tata, MG, BYD, Hyundai" : "e.g. Honda, Maruti"} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Model <span className="text-accent">*</span></label>
                            <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder={isEv ? "e.g. Nexon EV, ZS EV, Atto 3" : "e.g. City, Swift"} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Model Variant</label>
                            <input type="text" name="vehicleVariant" value={formData.vehicleVariant} onChange={handleChange} placeholder={isEv ? "e.g. Empowered Plus LR" : "e.g. VXi, ZXi Plus"} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
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
                            <input type="text" name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} placeholder="e.g. Teal Blue, Pristine White" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Registration Number <span className="text-accent">*</span></label>
                            <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="e.g. DL01EV1234" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
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
                            <div className="w-full px-4 py-3.5 rounded-2xl text-sm transition-all bg-slate-50 border border-slate-100 text-accent font-bold">{calculateVehicleAge()}</div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Chassis Number (VIN) <span className="text-accent">*</span></label>
                            <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} placeholder="17-digit VIN" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">
                                {isEv ? 'Drive Motor ID / Motor Number' : 'Engine Number'} <span className="text-accent">*</span>
                            </label>
                            <input
                                type="text"
                                name={isEv ? "motorNumber" : "engineNumber"}
                                value={isEv ? (formData.motorNumber || formData.engineNumber) : formData.engineNumber}
                                onChange={(e) => {
                                    if (isEv) {
                                        setFormData(prev => ({ ...prev, motorNumber: e.target.value, engineNumber: e.target.value }))
                                    } else {
                                        handleChange(e)
                                    }
                                }}
                                placeholder={isEv ? "e.g. EM-NEX-88219" : "Engine identification number"}
                                className={`w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border ${
                                    isEv ? 'border-cyan-300 focus:border-cyan-500 focus:ring-cyan-500/10' : 'border-slate-100 focus:border-accent/30 focus:ring-accent/5'
                                } text-slate-900 font-bold placeholder:text-slate-300`}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* ⚡ Dedicated EV Powertrain & Battery System Section (shown when EV is active) */}
                {isEv && (
                    <div className="rounded-[2.5rem] p-8 bg-gradient-to-br from-cyan-950/10 via-slate-900/5 to-blue-950/10 border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/5 transition-all">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-cyan-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-cyan-500 text-white shadow-md shadow-cyan-500/30">
                                    <BatteryCharging className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black uppercase tracking-[0.15em] text-cyan-950">
                                        ⚡ EV Powertrain & High-Voltage Battery System
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">Battery pack health, serial numbering, charger specs & EV warranty covers</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-white shadow-sm">
                                EV SPECIFIC
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {/* Battery Capacity */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-900 mb-2 ml-1 block flex items-center gap-1.5">
                                    <Battery className="w-3.5 h-3.5 text-cyan-600" /> Battery Capacity (kWh)
                                </label>
                                <input
                                    type="text"
                                    name="batteryCapacity"
                                    value={formData.batteryCapacity}
                                    onChange={handleChange}
                                    placeholder="e.g. 40.5 kWh, 50.3 kWh"
                                    className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-white border border-cyan-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 text-slate-900 font-bold placeholder:text-slate-300 mb-2"
                                />
                                <div className="flex flex-wrap gap-1.5">
                                    {BATTERY_CAPACITY_PRESETS.slice(0, 6).map(cap => (
                                        <button
                                            key={cap}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, batteryCapacity: cap }))}
                                            className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white border border-cyan-200 hover:bg-cyan-50 text-cyan-800 transition-colors"
                                        >
                                            {cap}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Battery Pack Serial Number */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-900 mb-2 ml-1 block flex items-center gap-1.5">
                                    <Cpu className="w-3.5 h-3.5 text-cyan-600" /> Battery Pack Serial / UID
                                </label>
                                <input
                                    type="text"
                                    name="batterySerialNumber"
                                    value={formData.batterySerialNumber}
                                    onChange={handleChange}
                                    placeholder="e.g. BATT-NEX-2023-88214"
                                    className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-white border border-cyan-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 text-slate-900 font-bold placeholder:text-slate-300 font-mono"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 ml-1 font-medium">Stamped on battery bottom plate or BMS diagnostic scan</p>
                            </div>

                            {/* Battery State of Health (SoH %) */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-900 mb-2 ml-1 block flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Battery State of Health (SoH %)
                                </label>
                                <input
                                    type="text"
                                    name="batteryHealthSoH"
                                    value={formData.batteryHealthSoH}
                                    onChange={handleChange}
                                    placeholder="e.g. 98.5%"
                                    className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-white border border-cyan-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 text-slate-900 font-bold placeholder:text-slate-300 mb-2 font-mono"
                                />
                                <div className="flex flex-wrap gap-1.5">
                                    {BATTERY_SOH_PRESETS.map(soh => (
                                        <button
                                            key={soh}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, batteryHealthSoH: soh }))}
                                            className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white border border-cyan-200 hover:bg-cyan-50 text-cyan-800 transition-colors"
                                        >
                                            {soh}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Charger Type */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-900 mb-2 ml-1 block flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-cyan-600" /> Charger Type / Port Specs
                                </label>
                                <select
                                    name="chargerType"
                                    value={formData.chargerType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-white border border-cyan-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 text-slate-900 font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">-- Select Charger Specs --</option>
                                    {CHARGER_TYPE_PRESETS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Charger Serial Number */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-900 mb-2 ml-1 block">
                                    Charger / Wallbox Serial Number
                                </label>
                                <input
                                    type="text"
                                    name="chargerSerialNumber"
                                    value={formData.chargerSerialNumber}
                                    onChange={handleChange}
                                    placeholder="e.g. CHG-AC-7KW-55102"
                                    className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-white border border-cyan-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 text-slate-900 font-bold placeholder:text-slate-300 font-mono"
                                />
                            </div>

                            {/* Drive Motor Number */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-900 mb-2 ml-1 block">
                                    Drive Motor Serial / UID
                                </label>
                                <input
                                    type="text"
                                    name="motorNumber"
                                    value={formData.motorNumber || formData.engineNumber}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, motorNumber: e.target.value, engineNumber: e.target.value }))
                                    }}
                                    placeholder="e.g. EM-PMSM-120KW-991"
                                    className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-white border border-cyan-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 text-slate-900 font-bold placeholder:text-slate-300 font-mono"
                                />
                            </div>
                        </div>

                        {/* EV Specific Insurance Add-ons */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-950 mb-3 ml-1 block">
                                ⚡ EV Specific Insurance Add-ons & Extended Covers:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {EV_COVER_OPTIONS.map(cover => {
                                    const selected = selectedEvCovers.includes(cover)
                                    return (
                                        <button
                                            key={cover}
                                            type="button"
                                            onClick={() => toggleEvCover(cover)}
                                            className={`p-3 rounded-2xl text-left text-xs font-bold transition-all border flex items-center justify-between ${
                                                selected
                                                    ? 'bg-cyan-500 text-white border-cyan-600 shadow-sm'
                                                    : 'bg-white text-slate-700 border-cyan-200/80 hover:bg-cyan-50'
                                            }`}
                                        >
                                            <span>{cover}</span>
                                            {selected && <CheckCircle2 className="w-4 h-4 ml-2 shrink-0" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

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
                                    <button type="button" onClick={() => setShowCustomCompany(true)} className="px-3 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-bold" title="Enter custom company">
                                        + Other
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Policy Number <span className="text-accent">*</span></label>
                            <input type="text" name="policyNumber" value={formData.policyNumber} onChange={handleChange} placeholder="e.g. POL-12345678" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
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
                                        <option value="">-- Select --</option>
                                        {POLICY_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setShowCustomPolicyType(true)} className="px-3 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-bold" title="Enter custom policy type">
                                        + Other
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Claim Type <span className="text-accent">*</span></label>
                            <select name="claimType" value={formData.claimType} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none cursor-pointer" required>
                                <option value="">-- Select Type --</option>
                                {CLAIM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
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
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Estimated Claim Amount (₹) <span className="text-accent">*</span></label>
                            <input type="number" name="estimatedClaimAmount" value={formData.estimatedClaimAmount} onChange={handleChange} placeholder="Estimated cost" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">IDV Value (₹)</label>
                            <input type="number" name="idvValue" value={formData.idvValue} onChange={handleChange} placeholder="Vehicle IDV" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Vehicle Condition</label>
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
                            {availableDamageAreas.map(area => {
                                const isEVArea = area.startsWith('⚡')
                                const isSelected = formData.damageAreas.includes(area)
                                return (
                                    <button
                                        key={area}
                                        type="button"
                                        onClick={() => toggleDamageArea(area)}
                                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                            isSelected
                                                ? isEVArea
                                                    ? 'bg-cyan-500 text-white border border-cyan-600 shadow-md shadow-cyan-500/20'
                                                    : 'bg-amber-100 text-amber-600 border border-amber-300 shadow-sm'
                                                : isEVArea
                                                    ? 'bg-cyan-50 border border-cyan-200 text-cyan-800 hover:bg-cyan-100'
                                                    : 'bg-slate-50 border border-slate-100 text-slate-400 hover:bg-slate-100'
                                        }`}
                                    >
                                        {area}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Accident/Incident Date</label>
                            <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleChange} className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold appearance-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 block">Accident Location</label>
                            <input type="text" name="incidentLocation" value={formData.incidentLocation} onChange={handleChange} placeholder="e.g. Mumbai-Pune Expressway Near Khopoli" className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-bold placeholder:text-slate-300" />
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
                                placeholder={isEv ? "Describe damage in detail, including impact to underbody battery skid plate, motor, or charging socket if applicable..." : "Describe the damage in detail..."}
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
                            Damage Images {isEv && '(Include Battery Pack Underbody & Motor Bay Photos)'}
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
                            <p className="text-[11px] font-medium text-slate-500">Upload completed repair images</p>
                        </div>
                    </div>

                    {/* Customer Documents Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* PAN Card */}
                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                            <label className="text-xs font-bold text-slate-900 mb-3 block">PAN Card (Front & Back)</label>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Front</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setDocumentFiles(prev => ({ ...prev, panFront: e.target.files?.[0] || null }))}
                                        className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Back</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setDocumentFiles(prev => ({ ...prev, panBack: e.target.files?.[0] || null }))}
                                        className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Aadhaar Card */}
                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                            <label className="text-xs font-bold text-slate-900 mb-3 block">Aadhaar Card (Front & Back)</label>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Front</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setDocumentFiles(prev => ({ ...prev, aadhaarFront: e.target.files?.[0] || null }))}
                                        className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Back</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setDocumentFiles(prev => ({ ...prev, aadhaarBack: e.target.files?.[0] || null }))}
                                        className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Driving License */}
                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                            <label className="text-xs font-bold text-slate-900 mb-3 block">Driving License (Front & Back)</label>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Front</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setDocumentFiles(prev => ({ ...prev, dlFront: e.target.files?.[0] || null }))}
                                        className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Back</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setDocumentFiles(prev => ({ ...prev, dlBack: e.target.files?.[0] || null }))}
                                        className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RC Book */}
                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                            <label className="text-xs font-bold text-slate-900 mb-3 block">RC Book (Front & Back)</label>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Front</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setDocumentFiles(prev => ({ ...prev, rcFront: e.target.files?.[0] || null }))}
                                        className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Back</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setDocumentFiles(prev => ({ ...prev, rcBack: e.target.files?.[0] || null }))}
                                        className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Insurance Policy */}
                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                            <label className="text-xs font-bold text-slate-900 mb-3 block">Insurance Policy (Front & Back)</label>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Front / Page 1</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setDocumentFiles(prev => ({ ...prev, insuranceFront: e.target.files?.[0] || null }))}
                                        className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Back / Page 2</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setDocumentFiles(prev => ({ ...prev, insuranceBack: e.target.files?.[0] || null }))}
                                        className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bank Passbook / Cancelled Cheque */}
                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                            <label className="text-xs font-bold text-slate-900 mb-3 block">Bank Passbook / Cancelled Cheque</label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => setDocumentFiles(prev => ({ ...prev, bankPassbook: e.target.files?.[0] || null }))}
                                className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400 mt-4"
                            />
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">For direct NEFT/RTGS insurance claim reimbursement</p>
                        </div>
                    </div>

                    {/* FIR Documents */}
                    <div className="mt-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <label className="text-xs font-bold text-slate-900 mb-3 block">
                            Police FIR / Panchnama Documents (if applicable)
                        </label>
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || [])
                                    setDocumentFiles(prev => ({
                                        ...prev,
                                        firDocs: [...prev.firDocs, ...files]
                                    }))
                                }}
                                className="w-full text-sm file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400"
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
                        </div>
                    </div>

                    {/* Additional Documents */}
                    <div className="mt-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <label className="text-xs font-bold text-slate-900 mb-3 block">
                            Additional Documents {isEv && '(e.g. EV Battery Diagnostic Report / BMS Log)'}
                        </label>
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || [])
                                    setDocumentFiles(prev => ({
                                        ...prev,
                                        additional: [...prev.additional, ...files]
                                    }))
                                }}
                                className="w-full text-sm file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-bold file:cursor-pointer hover:file:bg-slate-300 text-slate-400"
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
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 mb-6">Internal Notes</h3>
                    <textarea
                        name="adminNotes"
                        value={formData.adminNotes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Internal workshop notes (not visible to customer)..."
                        className="w-full px-4 py-4 rounded-3xl text-sm outline-none transition-all bg-slate-50 border border-slate-100 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 text-slate-900 font-medium placeholder:text-slate-300 resize-none"
                    />
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pb-6">
                    <button
                        type="button"
                        onClick={() => router.push('/shop/billing/insurance')}
                        className="px-8 py-3.5 rounded-2xl font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-sm disabled:opacity-50 text-white ${
                            isEv
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/25'
                                : 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
                        }`}
                        style={{
                            boxShadow: isEv ? '0 4px 15px rgba(6, 182, 212, 0.35)' : '0 4px 15px rgba(255, 75, 85, 0.3)'
                        }}
                    >
                        {loading ? (
                            <><RefreshCw className="w-5 h-5 animate-spin" /> Creating Claim...</>
                        ) : (
                            <>{isEv ? <Zap className="w-5 h-5" /> : <Save className="w-5 h-5" />} {isEv ? 'Create EV Insurance Claim' : 'Create Insurance Claim'}</>
                        )}
                    </button>
                </div>
            </form>

            {/* Upload Progress Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl text-center">
                        <div className={`p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 ${isEv ? 'bg-cyan-50 text-cyan-500' : 'bg-accent/10 text-accent'}`}>
                            <RefreshCw className="w-10 h-10 animate-spin" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">
                            {uploadProgress < 100 ? 'Creating Claim & Uploading...' : 'Finalizing...'}
                        </h3>

                        {locationStatus && (
                            <p className="text-cyan-600 text-sm mb-6 font-bold flex items-center justify-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                                {locationStatus}
                            </p>
                        )}

                        <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                            <div
                                className={`h-3 rounded-full transition-all duration-300 relative ${isEv ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-accent'}`}
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

export default function NewClaimPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        }>
            <NewClaimForm />
        </Suspense>
    )
}
