"use client"

import * as React from "react"
import { PDISection, PDIItem } from "@/components/pdi/pdi-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Plus, Trash2, Edit2, ChevronUp, ChevronDown,
    LayoutGrid, ListTodo, Save, Loader2, ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function PDISettingsPage() {
    const [sections, setSections] = React.useState<PDISection[]>([])
    const [loading, setLoading] = React.useState(true)
    const [saving, setSaving] = React.useState<string | null>(null)
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [editValue, setEditValue] = React.useState("")
    const [isSeeding, setIsSeeding] = React.useState(false)

    const fetchStructure = async () => {
        try {
            const res = await fetch('/api/admin/pdi/settings')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setSections(data)
        } catch (error) {
            console.error("Failed to load PDI structure")
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchStructure()
    }, [])

    const handleSeed = async () => {
        if (!confirm("This will replace your current checklist with the industry-standard defaults. Are you sure?")) return
        
        setIsSeeding(true)
        try {
            const res = await fetch('/api/admin/pdi/seed', { method: 'POST' })
            if (!res.ok) throw new Error()
            alert("Default checklist loaded successfully!")
            fetchStructure()
        } catch (error) {
            alert("Failed to load default checklist")
        } finally {
            setIsSeeding(false)
        }
    }

    const handleAddSection = async () => {
        const name = prompt("Enter section name:")
        if (!name) return

        try {
            const res = await fetch('/api/admin/pdi/settings', {
                method: 'POST',
                body: JSON.stringify({ type: 'SECTION', name })
            })
            if (!res.ok) throw new Error()
            fetchStructure()
        } catch (error) {
            alert("Failed to add section")
        }
    }

    const handleAddItem = async (sectionId: string) => {
        const label = prompt("Enter item label:")
        if (!label) return

        try {
            const res = await fetch('/api/admin/pdi/settings', {
                method: 'POST',
                body: JSON.stringify({ type: 'ITEM', sectionId, label })
            })
            if (!res.ok) throw new Error()
            fetchStructure()
        } catch (error) {
            alert("Failed to add item")
        }
    }

    const handleDelete = async (id: string, type: 'SECTION' | 'ITEM') => {
        if (!confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) return

        try {
            const res = await fetch(`/api/admin/pdi/settings?id=${id}&type=${type}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error()
            fetchStructure()
        } catch (error) {
            alert(`Failed to delete ${type.toLowerCase()}`)
        }
    }

    const handleUpdate = async (id: string, type: 'SECTION' | 'ITEM', value: string) => {
        try {
            const res = await fetch('/api/admin/pdi/settings', {
                method: 'PUT',
                body: JSON.stringify({ type, id, name: value, label: value }) // sending both for simplicity
            })
            if (!res.ok) throw new Error()
            setEditingId(null)
            fetchStructure()
        } catch (error) {
            alert("Failed to update")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <Link href="/admin/pdi">
                                <Button variant="outline" size="icon" className="rounded-2xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
                                    PDI <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-4">Settings</span>
                                </h2>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                    <LayoutGrid className="w-4 h-4 text-accent" />
                                    Vehicle Inspection Templates
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleSeed}
                                disabled={isSeeding}
                                variant="outline"
                                className="border-accent/20 bg-accent/5 text-accent hover:bg-accent hover:text-white font-black uppercase tracking-widest rounded-2xl px-6 h-12 shadow-sm transition-all"
                            >
                                {isSeeding ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5 mr-2" />
                                )}
                                Load Defaults
                            </Button>
                            <Button
                                onClick={handleAddSection}
                                className="bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest rounded-2xl px-6 h-12 shadow-lg shadow-slate-900/10 transition-all"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                New Section
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-8">
                        {sections.map((section) => (
                            <Card key={section.id} className="bg-white border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-slate-300">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-accent group-hover:border-accent transition-all">
                                                <LayoutGrid className="w-6 h-6 text-slate-400 group-hover:text-white transition-all" />
                                            </div>
                                            {editingId === section.id ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="h-10 bg-white border-slate-200 text-slate-900 w-[300px] rounded-xl font-bold"
                                                        autoFocus
                                                    />
                                                    <Button size="sm" className="bg-accent hover:bg-accent/90 rounded-xl" onClick={() => handleUpdate(section.id, 'SECTION', editValue)}>Save</Button>
                                                    <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setEditingId(null)}>Cancel</Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <CardTitle className="text-xl font-black tracking-tight text-slate-900 uppercase">
                                                        {section.name}
                                                    </CardTitle>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(section.id)
                                                            setEditValue(section.name)
                                                        }}
                                                        className="w-8 h-8 rounded-lg bg-slate-200/50 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-accent/10 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                                                onClick={() => handleDelete(section.id, 'SECTION')}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Section
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold uppercase text-[10px] tracking-widest px-4"
                                                onClick={() => handleAddItem(section.id)}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Item
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        {section.items?.map((item: any) => (
                                            <div key={item.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                        <ListTodo className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    {editingId === item.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="h-10 bg-white border-slate-200 text-slate-900 w-[400px] rounded-xl font-bold"
                                                                autoFocus
                                                            />
                                                            <Button size="sm" className="bg-accent hover:bg-accent/90 rounded-xl" onClick={() => handleUpdate(item.id, 'ITEM', editValue)}>Save</Button>
                                                            <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setEditingId(null)}>Cancel</Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">{item.label}</span>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(item.id)
                                                                    setEditValue(item.label)
                                                                }}
                                                                className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-accent/10 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(item.id, 'ITEM')}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {(!section.items || section.items.length === 0) && (
                                            <div className="p-12 text-center text-slate-400 italic text-sm font-medium">
                                                No items in this section. Add one to get started.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
