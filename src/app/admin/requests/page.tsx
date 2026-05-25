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
    Save
} from "lucide-react"

interface PDIRequest {
    id: string
    userId: string
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ISSUES_FOUND"

    // Vehicle Details
    vehicleName: string
    vehicleModel: string
    location: string
    preferredDate?: string

    notes: string // Client notes
    adminNotes?: string
    adminMessage?: string
    createdAt: string
    user: {
        name: string
        email: string
        mobile?: string | null
    }
}


export default function PDIRequestsPage() {
    const [requests, setRequests] = useState<PDIRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<PDIRequest | null>(null)

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
            const res = await fetch("/api/admin/pdi-requests")
            const data = await res.json()
            if (data.requests) setRequests(data.requests)
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
            req.vehicleName.toLowerCase().includes(query) ||
            req.vehicleModel.toLowerCase().includes(query) ||
            req.location.toLowerCase().includes(query) ||
            req.status.toLowerCase().includes(query)
        )
    })

    const handleOpenRequest = (req: PDIRequest) => {
        setSelectedRequest(req)
        setEditStatus(req.status)
        setEditAdminNotes(req.adminNotes || "")
        setEditAdminMessage(req.adminMessage || "")
    }

    const handleSave = async () => {
        if (!selectedRequest) return
        setSaving(true)
        try {
            const res = await fetch(`/api/admin/pdi-requests/${selectedRequest.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: editStatus,
                    adminNotes: editAdminNotes,
                    adminMessage: editAdminMessage
                })
            })

            if (res.ok) {
                // Update local list
                setRequests(prev => prev.map(r =>
                    r.id === selectedRequest.id
                        ? { ...r, status: editStatus as any, adminNotes: editAdminNotes, adminMessage: editAdminMessage }
                        : r
                ))
                setSelectedRequest(null) // Close modal
            }
        } catch (error) {
            console.error("Failed to update", error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>

    return (
        <div className="flex-1 p-6 lg:p-8 overflow-auto space-y-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 select-none">PDI Confirmation Requests</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage and track all vehicle inspection requests</p>
                </div>

                {/* Professional Search Bar */}
                <div className="relative group w-full md:w-[400px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-accent transition-colors duration-300" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent sm:text-sm transition-all duration-300 shadow-sm hover:border-slate-300"
                        placeholder="Search client, vehicle, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                        <div className="h-5 w-5 rounded border border-slate-200 flex items-center justify-center bg-slate-50 text-[10px] text-slate-500 font-mono">/</div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-4">Client</th>
                            <th className="p-4">Mobile</th>
                            <th className="p-4">Vehicle</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                            <Search className="w-6 h-6 text-slate-100" />
                                        </div>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No matching records found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-black text-xs border border-accent/20">
                                                {req.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 group-hover:text-accent transition-colors">{req.user.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{req.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-slate-600 font-bold font-mono tracking-wide">
                                            {req.user.mobile || <span className="text-slate-300">-</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">{req.vehicleName}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{req.vehicleModel}</div>
                                    </td>
                                    <td className="p-4 text-slate-500 text-sm">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                            {req.location}
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-500 text-sm font-bold font-mono">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                            ${req.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                req.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    req.status === 'ISSUES_FOUND' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}
                                        >
                                            {req.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                                            {req.status === 'IN_PROGRESS' && <Eye className="w-3 h-3" />}
                                            {req.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                            {req.status === 'ISSUES_FOUND' && <X className="w-3 h-3" />}
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleOpenRequest(req)}
                                            className="p-2.5 bg-slate-50 hover:bg-accent/10 rounded-xl text-slate-400 hover:text-accent transition-all border border-slate-100 hover:border-accent/20 shadow-sm"
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
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Vehicle Name</p>
                                        <p className="text-slate-900 text-sm font-bold">{selectedRequest.vehicleName}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Model</p>
                                        <p className="text-slate-900 text-sm font-bold">{selectedRequest.vehicleModel}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Location</p>
                                        <p className="text-slate-900 text-sm font-bold flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            {selectedRequest.location}
                                        </p>
                                    </div>
                                    {selectedRequest.preferredDate && (
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2">
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Preferred Date</p>
                                            <p className="text-slate-900 text-sm font-bold">
                                                {new Date(selectedRequest.preferredDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Client Notes */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Client Notes</label>
                                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 text-slate-600 text-sm min-h-[100px] leading-relaxed relative overflow-hidden shadow-inner">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200"></div>
                                    <div className="pl-2 font-medium">
                                        {selectedRequest.notes
                                            ? selectedRequest.notes.replace(/Mobile:.*?\n|Type:.*?\n/g, '').trim() || "No notes provided."
                                            : "No notes provided."}
                                    </div>
                                </div>
                            </div>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] text-slate-400 uppercase tracking-[4px] font-black">Management</span></div>
                            </div>

                            {/* Status Update */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Update Status</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-2xl p-4 pl-12 text-slate-900 font-bold focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 appearance-none cursor-pointer transition-all shadow-sm"
                                    >
                                        <option value="PENDING">Pending Review</option>
                                        <option value="IN_PROGRESS">PDI In Progress</option>
                                        <option value="COMPLETED">PDI Completed</option>
                                        <option value="ISSUES_FOUND">Issues Found</option>
                                    </select>
                                </div>
                            </div>

                            {/* Admin Internal Note */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Internal Admin Note</label>
                                <textarea
                                    value={editAdminNotes}
                                    onChange={(e) => setEditAdminNotes(e.target.value)}
                                    placeholder="Only visible to admins..."
                                    className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 min-h-[100px] placeholder:text-slate-300 transition-all shadow-sm"
                                />
                            </div>

                            {/* Admin Message to Client */}
                            <div className="bg-accent/5 p-6 rounded-[2rem] border border-accent/10">
                                <label className="block text-xs font-black uppercase tracking-widest text-accent mb-3 flex items-center gap-3">
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
                                    className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent/90 text-white font-black py-5 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-accent/30 active:scale-[0.98] uppercase tracking-widest text-xs"
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
