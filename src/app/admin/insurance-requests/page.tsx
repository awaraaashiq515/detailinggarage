"use client"

import { useState, useEffect } from "react"
import {
    Loader2,
    CheckCircle2,
    Clock,
    Eye,
    ChevronDown,
    Search,
    Filter,
    MoreHorizontal,
    X,
    MessageSquare,
    Save,
    FileText,
    AlertCircle,
    XCircle
} from "lucide-react"

interface InsuranceRequest {
    id: string
    claimNumber: string
    userId: string
    status: "SUBMITTED" | "UNDER_REVIEW" | "PENDING_DOCUMENTS" | "APPROVED" | "REJECTED" | "COMPLETED"

    // Customer Details
    user: {
        name: string
        email: string
        mobile?: string | null
    }

    // Vehicle Details
    vehicleMake: string
    vehicleModel: string
    vehicleVariant?: string
    vehicleYear: string
    vehicleType?: string
    registrationNumber: string

    // Insurance Details
    policyNumber: string
    insuranceCompany: string
    policyType?: string

    // Claim Details
    claimType: string
    incidentDate?: string
    incidentLocation?: string
    incidentDescription?: string
    estimatedDamage?: number

    adminNotes?: string
    adminMessage?: string
    createdAt: string

    documents?: Array<{
        id: string
        fileName: string
        fileUrl: string
        fileType: string
    }>
}

export default function InsuranceRequestsPage() {
    const [requests, setRequests] = useState<InsuranceRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<InsuranceRequest | null>(null)

    // Edit States
    const [editStatus, setEditStatus] = useState<string>("")
    const [editAdminNotes, setEditAdminNotes] = useState("")
    const [editAdminMessage, setEditAdminMessage] = useState("")
    const [saving, setSaving] = useState(false)

    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const params = new URLSearchParams({
                source: 'ONLINE',
                pageSize: '100'
            })
            const res = await fetch(`/api/admin/insurance-claims?${params}`)
            const data = await res.json()
            if (data.claims) setRequests(data.claims)
        } catch (error) {
            console.error("Failed to fetch requests", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredRequests = requests.filter(req => {
        const query = searchQuery.toLowerCase()
        return (
            req.user.name.toLowerCase().includes(query) ||
            req.user.email.toLowerCase().includes(query) ||
            req.claimNumber.toLowerCase().includes(query) ||
            req.vehicleMake.toLowerCase().includes(query) ||
            req.vehicleModel.toLowerCase().includes(query) ||
            req.policyNumber.toLowerCase().includes(query) ||
            req.status.toLowerCase().includes(query)
        )
    })

    const handleOpenRequest = (req: InsuranceRequest) => {
        setSelectedRequest(req)
        setEditStatus(req.status)
        setEditAdminNotes(req.adminNotes || "")
        setEditAdminMessage(req.adminMessage || "")
    }

    const handleSave = async () => {
        if (!selectedRequest) return
        setSaving(true)
        try {
            console.log('Saving request:', selectedRequest.id)
            console.log('Data:', { status: editStatus, adminNotes: editAdminNotes, adminMessage: editAdminMessage })

            const res = await fetch(`/api/admin/insurance-claims/${selectedRequest.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: editStatus,
                    adminNotes: editAdminNotes,
                    adminMessage: editAdminMessage
                })
            })

            console.log('Response status:', res.status, res.statusText)

            let data
            try {
                data = await res.json()
                console.log('Response data:', data)
            } catch (e) {
                console.error('Failed to parse JSON response:', e)
                data = {}
            }

            if (res.ok) {
                // Update local list
                setRequests(prev => prev.map(r =>
                    r.id === selectedRequest.id
                        ? { ...r, status: editStatus as any, adminNotes: editAdminNotes, adminMessage: editAdminMessage }
                        : r
                ))
                setSelectedRequest(null) // Close modal
                alert('Request updated successfully!')
            } else {
                console.error('Failed to update. Status:', res.status)
                console.error('Error data:', data)
                alert(`Failed to update: ${data.error || res.statusText || 'Unknown error'}`)
            }
        } catch (error) {
            console.error("Failed to update - exception:", error)
            alert('Failed to update request. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>

    return (
        <div className="flex-1 p-6 lg:p-8 overflow-auto space-y-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 select-none">Insurance Requests</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage online client insurance claim submissions</p>
                </div>

                {/* Professional Search Bar */}
                <div className="relative group w-full md:w-[400px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-accent transition-colors duration-300" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent sm:text-sm transition-all duration-300 shadow-sm hover:border-slate-300"
                        placeholder="Search client, policy, vehicle..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                        <div className="h-5 w-5 rounded border border-slate-200 flex items-center justify-center bg-slate-50 text-[10px] text-slate-500 font-mono">/</div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Client</th>
                            <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile</th>
                            <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle</th>
                            <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Policy</th>
                            <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                            <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                            <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="text-right px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-4">
                                            <Search className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <p className="text-lg font-black text-slate-900">No matching requests found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map((req) => (
                                <tr key={req.id} className="transition-all hover:bg-slate-50/50 cursor-pointer group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent font-black text-xs border border-accent/20">
                                                {req.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 group-hover:text-accent transition-colors">{req.user.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{req.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-mono font-bold text-slate-600">
                                            {req.user.mobile || <span className="text-slate-300">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-bold text-slate-900">{req.vehicleMake} {req.vehicleModel}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{req.vehicleYear} • {req.registrationNumber}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-mono font-bold text-slate-600">
                                            {req.policyNumber}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-bold text-slate-900">
                                            {req.claimType}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-bold text-slate-900">
                                            {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                                            ${req.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    req.status === 'UNDER_REVIEW' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                        req.status === 'PENDING_DOCUMENTS' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                            req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}
                                        >
                                            {req.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            {req.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            {req.status === 'UNDER_REVIEW' && <Eye className="w-3.5 h-3.5" />}
                                            {req.status === 'PENDING_DOCUMENTS' && <FileText className="w-3.5 h-3.5" />}
                                            {req.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                                            {req.status === 'SUBMITTED' && <Clock className="w-3.5 h-3.5" />}
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenRequest(req); }}
                                            className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white text-slate-400 hover:text-accent border border-slate-200 hover:border-accent/30 hover:bg-accent/5 transition-all shadow-sm group-hover:shadow-md"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal (Side Panel) */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRequest(null)} />
                    <div className="relative w-full max-w-md bg-white border-l border-slate-200 h-full p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 py-2 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="w-1 h-6 bg-accent rounded-full"></span>
                                Review Request
                            </h3>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6 pb-10">
                            {/* Claim Number Badge */}
                            <div className="bg-accent/5 p-4 rounded-3xl border border-accent/10 shadow-sm">
                                <div className="text-[10px] text-accent uppercase tracking-widest font-black mb-1 px-1">Claim Number</div>
                                <div className="text-xl font-black text-slate-900 font-mono flex items-center gap-2 px-1">
                                    <FileText className="w-5 h-5 opacity-20" />
                                    {selectedRequest.claimNumber}
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Client Details</p>
                                    <div className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 border border-slate-200 font-bold">ID: {selectedRequest.userId.substring(0, 6)}...</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white font-black text-xl shadow-lg shadow-accent/20">
                                        {selectedRequest.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-extrabold text-lg">{selectedRequest.user.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">{selectedRequest.user.email}</p>
                                        {selectedRequest.user.mobile && (
                                            <p className="text-xs text-accent mt-1 font-bold font-mono tracking-tight">{selectedRequest.user.mobile}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Details */}
                            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] space-y-4 shadow-sm">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <span className="p-1 rounded bg-accent/10 text-accent"><Filter className="w-3 h-3" /></span>
                                    Vehicle Information
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Make & Model</p>
                                        <p className="text-slate-900 text-sm font-bold">{selectedRequest.vehicleMake} {selectedRequest.vehicleModel}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Year</p>
                                        <p className="text-slate-900 text-sm font-bold">{selectedRequest.vehicleYear}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Registration</p>
                                        <p className="text-slate-900 text-sm font-bold font-mono">{selectedRequest.registrationNumber}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Insurance & Claim Details */}
                            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] space-y-4 shadow-sm">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <span className="p-1 rounded bg-accent/10 text-accent"><Save className="w-3 h-3" /></span>
                                    Policy Information
                                </p>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Policy Number</p>
                                        <p className="text-slate-900 text-sm font-bold font-mono">{selectedRequest.policyNumber}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Insurance Company</p>
                                        <p className="text-slate-900 text-sm font-bold">{selectedRequest.insuranceCompany}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Claim Type</p>
                                        <p className="text-slate-900 text-sm font-bold">{selectedRequest.claimType}</p>
                                    </div>
                                    {selectedRequest.estimatedDamage && (
                                        <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10">
                                            <p className="text-[10px] text-accent uppercase tracking-widest font-black mb-1">Estimated Damage</p>
                                            <p className="text-accent text-xl font-black">
                                                ₹{selectedRequest.estimatedDamage.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Incident Description */}
                            {selectedRequest.incidentDescription && (
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Incident Description</label>
                                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 text-slate-600 text-sm min-h-[100px] leading-relaxed relative overflow-hidden shadow-inner">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200"></div>
                                        <div className="pl-2 font-medium">
                                            {selectedRequest.incidentDescription}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] text-slate-400 uppercase tracking-[4px] font-black">Management</span></div>
                            </div>

                            {/* Status Update */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Update Status</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-2xl p-4 pl-12 text-slate-900 font-bold focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 appearance-none cursor-pointer transition-all shadow-sm"
                                    >
                                        <option value="SUBMITTED">Submitted</option>
                                        <option value="UNDER_REVIEW">Under Review</option>
                                        <option value="PENDING_DOCUMENTS">Pending Documents</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="REJECTED">Rejected</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Admin Internal Note */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Internal Admin Note</label>
                                <textarea
                                    value={editAdminNotes}
                                    onChange={(e) => setEditAdminNotes(e.target.value)}
                                    placeholder="Only visible to admins..."
                                    className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 min-h-[100px] placeholder:text-slate-300 transition-all shadow-sm"
                                />
                            </div>

                            {/* Admin Message to Client */}
                            <div className="bg-accent/5 p-6 rounded-[2rem] border border-accent/10">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-accent mb-3 flex items-center gap-3">
                                    <MessageSquare className="w-4 h-4" /> Message to Client
                                </label>
                                <textarea
                                    value={editAdminMessage}
                                    onChange={(e) => setEditAdminMessage(e.target.value)}
                                    placeholder="This will be emailed and shown to the client..."
                                    className="w-full bg-white border border-accent/20 rounded-2xl p-5 text-slate-900 font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 min-h-[120px] placeholder:text-slate-300 transition-all shadow-sm"
                                />
                                <p className="text-[10px] text-accent/60 mt-3 text-right font-bold uppercase tracking-widest">Client will receive email notification</p>
                            </div>

                            <div className="sticky bottom-0 pt-6 bg-gradient-to-t from-white to-transparent pb-4">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent/90 text-white font-black py-5 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-accent/30 active:scale-[0.98] uppercase tracking-widest text-sm"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Record Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
