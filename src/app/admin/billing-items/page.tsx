"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search, Edit2, Trash2, X, Check, Store } from "lucide-react"

type Item = { id: string; name: string; description: string | null; price: number; hsnSacCode: string | null; taxRate: number; type: string }

const emptyForm = { name: "", description: "", price: "", hsnSacCode: "", taxRate: "18", type: "SERVICE" }

export default function BillingItemsPage() {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const fetchItems = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (typeFilter) params.set("type", typeFilter)
        const res = await fetch(`/api/admin/billing/items?${params.toString()}`)
        const data = await res.json()
        if (data.success) setItems(data.items)
        setLoading(false)
    }, [search, typeFilter])

    useEffect(() => { fetchItems() }, [])

    const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true) }
    const openEdit = (item: Item) => {
        setForm({ name: item.name, description: item.description || "", price: String(item.price), hsnSacCode: item.hsnSacCode || "", taxRate: String(item.taxRate), type: item.type })
        setEditId(item.id); setShowModal(true)
    }

    const handleSave = async () => {
        if (!form.name || !form.price) { alert("Name and price are required"); return }
        setSaving(true)
        const body = editId ? { id: editId, ...form } : form
        const method = editId ? "PATCH" : "POST"
        const res = await fetch("/api/admin/billing/items", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        const data = await res.json()
        setSaving(false)
        if (data.success) { setShowModal(false); fetchItems() }
        else alert(data.error || "Failed to save item")
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this item?")) return
        await fetch(`/api/admin/billing/items?id=${id}`, { method: "DELETE" })
        fetchItems()
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold font-display text-white">Services & Items</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Predefined catalog for fast invoice creation</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#16acd4] hover:bg-white text-black font-bold uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(22, 172, 212,0.2)]">
                    <Plus className="w-4 h-4" /> Add Item
                </button>
            </div>

            {/* Filters */}
            <div className="bg-[#121214] border border-white/5 p-4 flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchItems()} type="text" placeholder="Search by name or HSN/SAC code..." className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 pl-9 outline-none focus:border-[#16acd4]/50 placeholder:text-zinc-600" />
                </div>
                <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); }} className="bg-[#09090b] border border-white/10 text-zinc-400 text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50">
                    <option value="">All Types</option>
                    <option value="SERVICE">Services</option>
                    <option value="PRODUCT">Products</option>
                </select>
                <button onClick={fetchItems} className="px-4 py-2 bg-[#16acd4] text-black font-bold text-xs uppercase"><Search className="w-4 h-4" /></button>
            </div>

            {/* Table */}
            <div className="bg-[#121214] border border-white/5 flex-1 overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-[#1a1a1c] border-b border-white/10">
                        <tr>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">#</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">Name</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">Description</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">HSN/SAC</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">Price (₹)</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">Tax %</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">Type</th>
                            <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                        {loading ? (
                            <tr><td colSpan={8} className="p-12 text-center text-zinc-500">Loading items...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={8} className="p-16 text-center">
                                <Store className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                                <p className="text-zinc-500 font-medium">No items found</p>
                                <p className="text-zinc-600 text-[11px] mt-1 mb-4">Add services like PPF, Ceramic Coating to use in invoices</p>
                                <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-[#16acd4] text-black text-xs font-bold uppercase hover:bg-white transition-colors"><Plus className="w-3 h-3" /> Add First Item</button>
                            </td></tr>
                        ) : items.map((item, i) => (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-3 text-zinc-600">{i + 1}</td>
                                <td className="p-3 font-medium text-white">{item.name}</td>
                                <td className="p-3 text-zinc-500 max-w-xs truncate">{item.description || "-"}</td>
                                <td className="p-3 font-mono">{item.hsnSacCode || "-"}</td>
                                <td className="p-3 text-right font-mono text-[#16acd4] font-bold">₹{item.price.toLocaleString("en-IN")}</td>
                                <td className="p-3 text-right">{item.taxRate}%</td>
                                <td className="p-3">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.type === "SERVICE" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>{item.type}</span>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(item)} className="text-zinc-400 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
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
                    <div className="bg-[#121214] border border-white/10 w-full max-w-md rounded-sm shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-bold text-white">{editId ? "Edit Item" : "Add New Item"}</h3>
                            <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">Name *</label>
                                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Ceramic Coating 9H" className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50 placeholder:text-zinc-700" />
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">Description</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50 resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">Price (₹) *</label>
                                    <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">HSN/SAC Code</label>
                                    <input value={form.hsnSacCode} onChange={e => setForm(p => ({ ...p, hsnSacCode: e.target.value }))} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">GST Tax Rate %</label>
                                    <select value={form.taxRate} onChange={e => setForm(p => ({ ...p, taxRate: e.target.value }))} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50">
                                        <option value="0">0%</option>
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18%</option>
                                        <option value="28">28%</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 mb-1 block font-bold uppercase tracking-widest">Type</label>
                                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50">
                                        <option value="SERVICE">Service</option>
                                        <option value="PRODUCT">Product</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/10 flex justify-end">
                            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase transition-colors disabled:opacity-50 flex items-center gap-2">
                                <Check className="w-4 h-4" /> {saving ? "Saving..." : "Save Item"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
