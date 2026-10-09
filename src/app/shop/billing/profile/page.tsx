"use client"

import { useState, useEffect, useRef } from "react"
import {
    Store,
    Upload,
    Check,
    Building2,
    MapPin,
    Phone,
    Mail,
    FileText,
    CreditCard,
    Sparkles,
    ShieldCheck,
    AlertCircle,
    Eye,
    Trash2,
    RefreshCw
} from "lucide-react"

const INDIAN_STATES = [
    "01-Jammu & Kashmir", "02-Himachal Pradesh", "03-Punjab", "04-Chandigarh",
    "05-Uttarakhand", "06-Haryana", "07-Delhi", "08-Rajasthan", "09-Uttar Pradesh",
    "10-Bihar", "11-Sikkim", "12-Arunachal Pradesh", "13-Nagaland", "14-Manipur",
    "15-Mizoram", "16-Tripura", "17-Meghalaya", "18-Assam", "19-West Bengal",
    "20-Jharkhand", "21-Odisha", "22-Chhattisgarh", "23-Madhya Pradesh", "24-Gujarat",
    "25-Daman & Diu", "26-Dadra & Nagar Haveli", "27-Maharashtra", "28-Andhra Pradesh",
    "29-Karnataka", "30-Goa", "31-Lakshadweep", "32-Kerala", "33-Tamil Nadu",
    "34-Puducherry", "35-Andaman & Nicobar", "36-Telangana", "37-Andhra Pradesh (New)"
]

export default function ShopProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form fields
    const [businessName, setBusinessName] = useState("")
    const [tagline, setTagline] = useState("")
    const [logoUrl, setLogoUrl] = useState("")
    const [phone, setPhone] = useState("")
    const [altPhone, setAltPhone] = useState("")
    const [email, setEmail] = useState("")
    const [website, setWebsite] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("02-Himachal Pradesh")
    const [pinCode, setPinCode] = useState("")
    const [country, setCountry] = useState("India")
    const [gstin, setGstin] = useState("")
    const [pan, setPan] = useState("")
    const [bankName, setBankName] = useState("")
    const [accountName, setAccountName] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [ifscCode, setIfscCode] = useState("")
    const [upiId, setUpiId] = useState("")
    const [defaultNotes, setDefaultNotes] = useState("")
    const [defaultTerms, setDefaultTerms] = useState("")
    const [signatureUrl, setSignatureUrl] = useState("")

    // Upload states
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [uploadingSign, setUploadingSign] = useState(false)
    const logoInputRef = useRef<HTMLInputElement>(null)
    const signInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/shop/billing/profile")
            const data = await res.json()
            if (data.success && data.profile) {
                const p = data.profile
                const s = data.shop || {}
                setBusinessName(p.businessName || s.name || "")
                setTagline(p.tagline || "")
                setLogoUrl(p.logoUrl || s.logoUrl || "")
                setPhone(p.phone || s.phone || "")
                setAltPhone(p.altPhone || "")
                setEmail(p.email || s.email || "")
                setWebsite(p.website || "")
                setAddress(p.address || s.address || "")
                setCity(p.city || s.city || "")
                setState(p.state || s.state || "02-Himachal Pradesh")
                setPinCode(p.pinCode || "")
                setCountry(p.country || "India")
                setGstin(p.gstin || s.gstin || "")
                setPan(p.pan || "")
                setBankName(p.bankName || "")
                setAccountName(p.accountName || "")
                setAccountNumber(p.accountNumber || "")
                setIfscCode(p.ifscCode || "")
                setUpiId(p.upiId || "")
                setDefaultNotes(p.defaultNotes || "WE SHALL NOT BE RESPONSIBLE FOR THE REPLACED PARTS IF NOT COLLECTED AT THE TIME OF DELIVERY.")
                setDefaultTerms(p.defaultTerms || "1. Goods once sold will not be taken back.\n2. Warranty terms as per manufacturer/workshop policy.")
                setSignatureUrl(p.signatureUrl || "")
            } else {
                setError(data.error || "Failed to load shop profile")
            }
        } catch (err: any) {
            setError(err?.message || "Failed to load shop profile")
        }
        setLoading(false)
    }

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setSaving(true)
        setError(null)
        setSaveSuccess(false)

        try {
            const res = await fetch("/api/shop/billing/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessName,
                    tagline,
                    logoUrl,
                    phone,
                    altPhone,
                    email,
                    website,
                    address,
                    city,
                    state,
                    pinCode,
                    country,
                    gstin,
                    pan,
                    bankName,
                    accountName,
                    accountNumber,
                    ifscCode,
                    upiId,
                    defaultNotes,
                    defaultTerms,
                    signatureUrl,
                }),
            })
            const data = await res.json()
            if (data.success) {
                setSaveSuccess(true)
                setTimeout(() => setSaveSuccess(false), 4000)
            } else {
                setError(data.error || "Failed to update profile")
            }
        } catch (err: any) {
            setError(err?.message || "Error saving profile")
        }
        setSaving(false)
    }

    const handleFileUpload = async (file: File, type: "logo" | "signature") => {
        const setUploading = type === "logo" ? setUploadingLogo : setUploadingSign
        setUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("type", type)

            const res = await fetch("/api/shop/billing/upload", {
                method: "POST",
                body: formData,
            })
            const data = await res.json()

            if (data.success) {
                if (type === "logo") setLogoUrl(data.url)
                else setSignatureUrl(data.url)
            } else {
                setError(data.error || `Failed to upload ${type}`)
            }
        } catch (err: any) {
            setError(err?.message || `Failed to upload ${type}`)
        }
        setUploading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-400 gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#16acd4]" />
                <p className="text-sm">Loading Shop Profile...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Top Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#16acd4]">
                            <Store className="w-4 h-4" /> Workshop Settings
                        </div>
                        <h1 className="text-2xl font-black font-display tracking-tight text-white mt-1">
                            Shop Profile &amp; Billing Identity
                        </h1>
                        <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                            Configure your workshop's name, logo, location, GSTIN, and bank account. These details appear directly on all your customer Invoices and Quotations.
                        </p>
                    </div>

                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="self-start sm:self-auto flex items-center gap-2 px-6 py-2.5 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-[#16acd4]/10"
                    >
                        {saving ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <Check className="w-4 h-4" /> Saved Successfully!
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" /> Save Profile
                            </>
                        )}
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 rounded">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                {saveSuccess && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 rounded">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>Your shop profile has been updated! New bills and PDF prints will use your updated details.</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left 2 Columns: Edit Form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Card 1: Shop Logo & Branding */}
                        <div className="bg-[#121214] border border-white/5 p-6 rounded-lg space-y-5">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                                <Sparkles className="w-4 h-4 text-[#16acd4]" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-white">1. Shop Branding &amp; Logo</h2>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                {/* Logo Preview / Upload Area */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400">Shop Logo</label>
                                    <div className="w-36 h-36 bg-[#09090b] border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center p-2 relative group overflow-hidden">
                                        {logoUrl ? (
                                            <>
                                                <img src={logoUrl} alt="Shop Logo" className="w-full h-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setLogoUrl("")}
                                                    className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 text-[10px] font-bold uppercase"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Remove
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center p-2 text-zinc-500">
                                                <Store className="w-8 h-8 mx-auto mb-1 text-zinc-600" />
                                                <p className="text-[10px] leading-tight">No logo uploaded</p>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        className="hidden"
                                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleFileUpload(file, "logo")
                                        }}
                                    />
                                    <button
                                        type="button"
                                        disabled={uploadingLogo}
                                        onClick={() => logoInputRef.current?.click()}
                                        className="w-36 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-[#16acd4] hover:text-black text-white text-[11px] font-bold uppercase transition-colors rounded"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        {uploadingLogo ? "Uploading..." : "Upload Logo"}
                                    </button>
                                </div>

                                {/* Business Name & Tagline */}
                                <div className="flex-1 space-y-4 w-full">
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-300">
                                            Workshop / Business Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            placeholder="e.g. Al Motors / Speedy Garage"
                                            className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#16acd4] rounded"
                                        />
                                        <p className="text-[11px] text-zinc-500 mt-1">This name will be displayed in large bold font on top of every bill.</p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-zinc-300">Tagline / Subtitle</label>
                                        <input
                                            type="text"
                                            value={tagline}
                                            onChange={(e) => setTagline(e.target.value)}
                                            placeholder="e.g. Premium Multi-Brand Car Service & Ceramic Studio"
                                            className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#16acd4] rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-zinc-400">Or Image URL</label>
                                        <input
                                            type="text"
                                            value={logoUrl}
                                            onChange={(e) => setLogoUrl(e.target.value)}
                                            placeholder="https://example.com/logo.png"
                                            className="w-full mt-1 bg-[#09090b] border border-white/10 px-3 py-1.5 text-zinc-300 text-xs outline-none focus:border-[#16acd4] rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Location & Address */}
                        <div className="bg-[#121214] border border-white/5 p-6 rounded-lg space-y-4">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                                <MapPin className="w-4 h-4 text-[#16acd4]" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-white">2. Workshop Location &amp; Address</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300">Street Address / Landmark</label>
                                    <textarea
                                        rows={2}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="e.g. Opposite Rani Ki Bain, Gutkar, Near Main Highway"
                                        className="w-full mt-1.5 bg-[#09090b] border border-white/10 p-3 text-white text-sm outline-none focus:border-[#16acd4] rounded resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-300">City</label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="e.g. Mandi"
                                            className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#16acd4] rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-zinc-300">State (GST)</label>
                                        <select
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#16acd4] rounded"
                                        >
                                            {INDIAN_STATES.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-zinc-300">PIN Code</label>
                                        <input
                                            type="text"
                                            value={pinCode}
                                            onChange={(e) => setPinCode(e.target.value)}
                                            placeholder="e.g. 175001"
                                            className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#16acd4] rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Contact & Legal (GSTIN / PAN) */}
                        <div className="bg-[#121214] border border-white/5 p-6 rounded-lg space-y-4">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                                <ShieldCheck className="w-4 h-4 text-[#16acd4]" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-white">3. Contact &amp; Tax Identifiers</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300">Primary Phone</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="e.g. +91 9876543210"
                                        className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#16acd4] rounded"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300">Alt Phone / Landline</label>
                                    <input
                                        type="text"
                                        value={altPhone}
                                        onChange={(e) => setAltPhone(e.target.value)}
                                        placeholder="Optional"
                                        className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#16acd4] rounded"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="shop@example.com"
                                        className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#16acd4] rounded"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300">Website</label>
                                    <input
                                        type="text"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://myshop.com"
                                        className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#16acd4] rounded"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300">GSTIN (GST Number)</label>
                                    <input
                                        type="text"
                                        value={gstin}
                                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                                        placeholder="e.g. 02AAAAA0000A1Z5"
                                        className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white font-mono text-sm uppercase outline-none focus:border-[#16acd4] rounded"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300">PAN Number</label>
                                    <input
                                        type="text"
                                        value={pan}
                                        onChange={(e) => setPan(e.target.value.toUpperCase())}
                                        placeholder="e.g. ABCDE1234F"
                                        className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white font-mono text-sm uppercase outline-none focus:border-[#16acd4] rounded"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Bank & Payment Details */}
                        <div className="bg-[#121214] border border-white/5 p-6 rounded-lg space-y-4">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                                <CreditCard className="w-4 h-4 text-[#16acd4]" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-white">4. Bank &amp; Payment Details (Shown on Bill)</h2>
                            </div>

                            <p className="text-xs text-zinc-400">
                                Your bank account and UPI details will be printed on the invoice so customers can pay directly to your account.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-300">Bank Name</label>
                                    <input
                                        type="text"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        placeholder="e.g. State Bank of India / HDFC Bank"
                                        className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#16acd4] rounded"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300">Account Holder Name</label>
                                    <input
                                        type="text"
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        placeholder="e.g. Al Motors"
                                        className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#16acd4] rounded"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300">Account Number</label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        placeholder="e.g. 50200012345678"
                                        className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white font-mono text-sm outline-none focus:border-[#16acd4] rounded"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300">IFSC Code</label>
                                    <input
                                        type="text"
                                        value={ifscCode}
                                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. SBIN0001234"
                                        className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white font-mono text-sm uppercase outline-none focus:border-[#16acd4] rounded"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-xs font-semibold text-zinc-300">UPI ID (GooglePay / PhonePe / Paytm)</label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="e.g. yourshop@okhdfcbank"
                                        className="w-full mt-1.5 bg-[#09090b] border border-white/10 px-3 py-2 text-white font-mono text-sm outline-none focus:border-[#16acd4] rounded"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 5: Notes & Terms Defaults & Signature */}
                        <div className="bg-[#121214] border border-white/5 p-6 rounded-lg space-y-4">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                                <FileText className="w-4 h-4 text-[#16acd4]" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-white">5. Notes &amp; Terms (Invoice Defaults)</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-semibold text-zinc-300">Note (printed on invoice)</label>
                                        <span className="text-[10px] text-zinc-500">Auto-filled on every new invoice</span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={defaultNotes}
                                        onChange={(e) => setDefaultNotes(e.target.value)}
                                        placeholder="e.g. WE SHALL NOT BE RESPONSIBLE FOR THE REPLACED PARTS IF NOT COLLECTED AT THE TIME OF DELIVERY."
                                        className="w-full bg-[#09090b] border border-white/10 p-3 text-white text-xs outline-none focus:border-[#16acd4] rounded resize-none"
                                    />
                                    <p className="text-[10px] text-zinc-500 mt-1">This default note will automatically load on all new invoices. You won't have to retype it.</p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-semibold text-zinc-300">Terms &amp; Conditions</label>
                                        <span className="text-[10px] text-zinc-500">Auto-filled on every new invoice</span>
                                    </div>
                                    <textarea
                                        rows={4}
                                        value={defaultTerms}
                                        onChange={(e) => setDefaultTerms(e.target.value)}
                                        placeholder="1. Goods once sold will not be taken back.&#10;2. Warranty terms as per manufacturer/workshop policy."
                                        className="w-full bg-[#09090b] border border-white/10 p-3 text-white text-xs outline-none focus:border-[#16acd4] rounded resize-none"
                                    />
                                    <p className="text-[10px] text-zinc-500 mt-1">These terms and conditions will automatically appear on every invoice generated by your shop.</p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-300">Authorised Signatory Image</label>
                                    <div className="flex items-center gap-4 mt-2">
                                        {signatureUrl ? (
                                            <div className="h-16 px-4 bg-white rounded flex items-center justify-center relative group">
                                                <img src={signatureUrl} alt="Signature" className="h-12 object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setSignatureUrl("")}
                                                    className="absolute inset-0 bg-black/80 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="h-16 px-4 bg-[#09090b] border border-white/10 rounded flex items-center text-zinc-600 text-xs">
                                                No signature uploaded
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            ref={signInputRef}
                                            className="hidden"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleFileUpload(file, "signature")
                                            }}
                                        />
                                        <button
                                            type="button"
                                            disabled={uploadingSign}
                                            onClick={() => signInputRef.current?.click()}
                                            className="px-4 py-2 bg-zinc-800 hover:bg-[#16acd4] hover:text-black text-white text-xs font-bold uppercase transition-colors rounded"
                                        >
                                            {uploadingSign ? "Uploading..." : "Upload Signature"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right 1 Column: Live Bill Preview */}
                    <div className="space-y-4">
                        <div className="sticky top-6">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                                <Eye className="w-4 h-4 text-[#16acd4]" /> Live Invoice Header Preview
                            </div>

                            {/* White paper-like invoice preview */}
                            <div className="bg-white text-black p-5 rounded-lg shadow-2xl border border-zinc-200 text-[11px] space-y-4">
                                {/* Header */}
                                <div className="flex justify-between items-start border-b-2 border-black pb-3">
                                    <div className="flex items-center gap-3">
                                        {logoUrl && (
                                            <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded" />
                                        )}
                                        <div>
                                            <h3 className="text-base font-black uppercase text-[#0e8fb0] leading-tight">
                                                {businessName || "Your Shop Name"}
                                            </h3>
                                            <p className="text-[9px] text-zinc-600 mt-0.5">
                                                {tagline || (city ? `${city}, ${state}` : "Workshop Tagline")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[7px] uppercase font-bold text-zinc-500">Invoice No.</span>
                                        <p className="font-mono font-black text-xs">INV-26-0001</p>
                                        <span className="inline-block bg-black text-white text-[7px] font-bold uppercase px-1.5 py-0.5 mt-1 rounded">
                                            Tax Invoice
                                        </span>
                                    </div>
                                </div>

                                {/* From Block */}
                                <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded text-[10px] space-y-0.5 leading-snug">
                                    <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">From</p>
                                    <p className="font-bold text-black">{businessName || "Your Shop Name"}</p>
                                    {address && <p className="text-zinc-600">{address}</p>}
                                    {(city || state || pinCode) && (
                                        <p className="text-zinc-600">
                                            {[city, state, pinCode].filter(Boolean).join(", ")}
                                        </p>
                                    )}
                                    {phone && <p className="text-zinc-600">☎ {phone}</p>}
                                    {email && <p className="text-zinc-600">✉ {email}</p>}
                                    {gstin && <p className="text-zinc-900 font-semibold font-mono">GSTIN: {gstin}</p>}
                                </div>

                                {/* Bank details block */}
                                {(bankName || accountNumber || upiId) && (
                                    <div className="border border-dashed border-zinc-300 p-2.5 rounded text-[9.5px] space-y-0.5 bg-amber-50/50">
                                        <p className="text-[8px] font-bold uppercase tracking-wider text-amber-900">Payment Account</p>
                                        {bankName && <p className="font-semibold text-black">{bankName}</p>}
                                        {accountNumber && <p className="font-mono text-zinc-800">A/C: {accountNumber} ({ifscCode})</p>}
                                        {upiId && <p className="font-mono text-[#0e8fb0] font-bold">UPI: {upiId}</p>}
                                    </div>
                                )}

                                {/* Signature block */}
                                <div className="flex justify-between items-end pt-3 border-t border-zinc-200">
                                    <p className="text-[9px] text-zinc-400 italic">Thank you for your business!</p>
                                    <div className="text-right">
                                        {signatureUrl ? (
                                            <img src={signatureUrl} alt="Signature" className="h-8 ml-auto object-contain mb-1" />
                                        ) : (
                                            <div className="h-8"></div>
                                        )}
                                        <div className="w-24 h-px bg-black ml-auto mb-0.5"></div>
                                        <span className="text-[7.5px] uppercase font-bold text-zinc-700">Authorised Signatory</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Save Button */}
                            <button
                                type="button"
                                onClick={() => handleSave()}
                                disabled={saving}
                                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-[#16acd4] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-all rounded shadow-lg shadow-[#16acd4]/20 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" /> Save Profile &amp; Apply to Bills
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
