"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search, Edit2, Trash2, X, Check, Users } from "lucide-react"

type Client = { id: string; name: string; phone: string | null; email: string | null; gstin: string | null; state: string | null; address: string | null; _count: { invoices: number } }

const INDIAN_STATES = ["01-Jammu & Kashmir","02-Himachal Pradesh","03-Punjab","04-Chandigarh","05-Uttarakhand","06-Haryana","07-Delhi","08-Rajasthan","09-Uttar Pradesh","10-Bihar","11-Sikkim","12-Arunachal Pradesh","13-Nagaland","14-Manipur","15-Mizoram","16-Tripura","17-Meghalaya","18-Assam","19-West Bengal","20-Jharkhand","21-Odisha","22-Chhattisgarh","23-Madhya Pradesh","24-Gujarat","25-Daman & Diu","26-Dadra & Nagar Haveli","27-Maharashtra","28-Andhra Pradesh","29-Karnataka","30-Goa","31-Lakshadweep","32-Kerala","33-Tamil Nadu","34-Puducherry","35-Andaman & Nicobar","36-Telangana","37-Andhra Pradesh (New)"]

const emptyForm = { name: "", phone: "", email: "", gstin: "", address: "", state: "", city: "", pin: "" }

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const fetchClients = useCallback(async () => {
        setLoading(true)
        const res = await fetch(`/api/admin/billing/clients?search=${search}`)
        const data = await res.json()
        if (data.success) setClients(data.clients)
        setLoading(false)
    }, [search])

    useEffect(() => { fetchClients() }, [])

    const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true) }
    const openEdit = (c: Client) => {
        setForm({ name: c.name, phone: c.phone || "", email: c.email || "", gstin: c.gstin || "", address: c.address || "", state: c.state || "", city: "", pin: "" })
        setEditId(c.id); setShowModal(true)
    }

    const handleSave = async () => {
        if (!form.name) { alert("Client name is required"); return }
        setSaving(true)
        const url = "/api/admin/billing/clients"
        const body = editId ? { id: editId, ...form } : form
        const method = editId ? "PATCH" : "POST"
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        const data = await res.json()
        setSaving(false)
        if (data.success) { setShowModal(false); fetchClients() }
        else alert(data.error || "Failed to save client")
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this client? All their invoices will remain.")) return
        await fetch(`/api/admin/billing/clients?id=${id}`, { method: "DELETE" })
        fetchClients()
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">Billing Clients</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Manage customers and their GST details</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#16acd4] hover:bg-white text-black font-bold uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(22, 172, 212,0.2)]">
                    <Plus className="w-4 h-4" /> Add Client
                </button>
            </div>

            {/* Search */}
            <div className="bg-[#121214] border border-white/5 p-4 flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchClients()} type="text" placeholder="Search by name, phone or GSTIN..." className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 pl-9 outline-none focus:border-[#16acd4]/50 placeholder:text-zinc-600" />
                </div>
                <button onClick={fetchClients} className="px-4 py-2 bg-[#16acd4] text-black font-bold text-xs uppercase"><Search className="w-4 h-4" /></button>
            </div>

            {/* Table */}
            <div className="bg-[#121214] border border-white/5 flex-1 overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-[#1a1a1c] border-b border-white/10">
                        <tr>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">#</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">Name</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">Phone</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">Email</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">GSTIN</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">State</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-center">Invoices</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                        {loading ? (
                            <tr><td colSpan={8} className="p-12 text-center text-zinc-500">Loading clients...</td></tr>
                        ) : clients.length === 0 ? (
                            <tr><td colSpan={8} className="p-16 text-center">
                                <Users className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                                <p className="text-zinc-500 font-medium">No clients found</p>
                                <button onClick={openAdd} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#16acd4] text-black text-xs font-bold uppercase hover:bg-white transition-colors"><Plus className="w-3 h-3" /> Add First Client</button>
                            </td></tr>
                        ) : clients.map((c, i) => (
                            <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-3 text-zinc-600">{i + 1}</td>
                                <td className="p-3 font-medium text-white">{c.name}</td>
                                <td className="p-3">{c.phone || "-"}</td>
                                <td className="p-3">{c.email || "-"}</td>
                                <td className="p-3 font-mono">{c.gstin || "-"}</td>
                                <td className="p-3">{c.state || "-"}</td>
                                <td className="p-3 text-center"><span className="bg-[#16acd4]/10 text-[#16acd4] text-[10px] font-bold px-2 py-0.5 rounded-full">{c._count.invoices}</span></td>
                                <td className="p-3">
                                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(c)} className="text-zinc-400 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#121214] border border-white/10 w-full max-w-lg rounded-sm shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-bold text-white">{editId ? "Edit Client" : "Add New Client"}</h3>
                            <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
                            {[
                                { label: "Client Name *", key: "name", col: 2 },
                                { label: "Phone", key: "phone", col: 1 },
                                { label: "Email", key: "email", col: 1 },
                                { label: "GSTIN", key: "gstin", col: 1 },
                                { label: "City", key: "city", col: 1 },
                                { label: "PIN Code", key: "pin", col: 1 },
                            ].map(f => (
                                <div key={f.key} className={f.col === 2 ? "col-span-2" : ""}>
                                    <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">{f.label}</label>
                                    <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50" />
                                </div>
                            ))}
                            <div className="col-span-2">
                                <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">State</label>
                                <select value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50">
                                    <option value="">Select state...</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">Billing Address</label>
                                <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50 resize-none" />
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/10 flex justify-end">
                            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase transition-colors disabled:opacity-50 flex items-center gap-2">
                                <Check className="w-4 h-4" /> {saving ? "Saving..." : "Save Client"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
