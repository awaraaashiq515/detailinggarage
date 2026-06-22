"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, AlertCircle } from "lucide-react"
import { DamageMarker, DamageType, DamageSeverity, DamageView, VehicleDamageData } from "./pdi-types"

interface VehicleDamageMarkerProps {
    damageData: VehicleDamageData
    onChange: (data: VehicleDamageData) => void
}

const damageTypes: { value: DamageType; label: string; color: string }[] = [
    { value: 'scratch', label: 'Scratch', color: '#fbbf24' },
    { value: 'dent', label: 'Dent', color: '#f97316' },
    { value: 'crack', label: 'Crack', color: '#ef4444' },
    { value: 'chip', label: 'Chip', color: '#a855f7' },
    { value: 'rust', label: 'Rust', color: '#dc2626' },
    { value: 'paint-damage', label: 'Paint Damage', color: '#14b8a6' },
    { value: 'broken', label: 'Broken', color: '#ec4899' },
    { value: 'missing', label: 'Missing Part', color: '#6366f1' },
    { value: 'other', label: 'Other', color: '#64748b' },
]

const vehicleViews: { value: DamageView; label: string; aspectRatio: string; imagePath: string }[] = [
    { value: 'top', label: 'Top View', aspectRatio: '3/5', imagePath: '/uploads/pdi/assets/vehicles/top-view.png' },
    { value: 'side', label: 'Side View', aspectRatio: '2/1', imagePath: '/uploads/pdi/assets/vehicles/side-view.png' },
    { value: 'interior', label: 'Interior View', aspectRatio: '1/1', imagePath: '/uploads/pdi/assets/vehicles/interior-view.jpg' },
    { value: 'boot', label: 'Boot/Luggage', aspectRatio: '8/7', imagePath: '/uploads/pdi/assets/vehicles/boot-view.jpg' },
]

export function VehicleDamageMarker({ damageData, onChange }: VehicleDamageMarkerProps) {
    const [selectedView, setSelectedView] = React.useState<DamageView>('top')
    const [selectedType, setSelectedType] = React.useState<DamageType>('scratch')
    const [selectedSeverity, setSelectedSeverity] = React.useState<DamageSeverity>('minor')
    const [editingMarker, setEditingMarker] = React.useState<string | null>(null)
    const viewRefs = React.useRef<{ [key in DamageView]?: HTMLDivElement }>({})

    const getDamageCode = (type: DamageType): import('./pdi-types').DamageCode => {
        const codeMap: Record<DamageType, import('./pdi-types').DamageCode> = {
            'scratch': 'S',
            'dent': 'D',
            'crack': 'CR',
            'chip': 'CH',
            'rust': 'RS',
            'paint-damage': 'S',
            'broken': 'BR',
            'missing': 'MS',
            'tear': 'TR',
            'stain': 'ST',
            'not-working': 'NW',
            'other': 'OT',
        }
        return codeMap[type]
    }

    const handleViewClick = (e: React.MouseEvent<HTMLDivElement>, view: DamageView) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        const newMarker: DamageMarker = {
            id: `marker-${Date.now()}`,
            x,
            y,
            type: selectedType,
            code: getDamageCode(selectedType),
            severity: selectedSeverity,
            view,
        }

        onChange({
            ...damageData,
            markers: [...damageData.markers, newMarker],
        })
    }

    const removeMarker = (markerId: string) => {
        onChange({
            ...damageData,
            markers: damageData.markers.filter(m => m.id !== markerId),
        })
    }

    const updateMarkerDescription = (markerId: string, description: string) => {
        onChange({
            ...damageData,
            markers: damageData.markers.map(m =>
                m.id === markerId ? { ...m, description } : m
            ),
        })
    }

    const getMarkerColor = (type: DamageType) => {
        return damageTypes.find(dt => dt.value === type)?.color || '#64748b'
    }

    const currentViewMarkers = damageData.markers.filter(m => m.view === selectedView)

    return (
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
            <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Vehicle Damage Marking</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Click on vehicle diagrams to mark any damages or defects</p>
                    </div>
                </div>
            </div>
            <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Damage Type
                        </Label>
                        <Select value={selectedType} onValueChange={(value) => setSelectedType(value as DamageType)}>
                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-rose-500/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 rounded-2xl shadow-2xl">
                                {damageTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value} className="focus:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                                            <span className="font-bold">{type.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Severity
                        </Label>
                        <Select value={selectedSeverity} onValueChange={(value) => setSelectedSeverity(value as DamageSeverity)}>
                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-rose-500/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 rounded-2xl shadow-2xl">
                                <SelectItem value="minor" className="font-bold focus:bg-slate-50">Minor</SelectItem>
                                <SelectItem value="moderate" className="font-bold focus:bg-slate-50">Moderate</SelectItem>
                                <SelectItem value="major" className="font-bold focus:bg-slate-50">Major</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                    {vehicleViews.map((view) => (
                        <button
                            key={view.value}
                            type="button"
                            onClick={() => setSelectedView(view.value)}
                            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all ${selectedView === view.value
                                ? 'bg-white text-rose-500 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {view.label}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <div
                        ref={(el) => {
                            if (el) viewRefs.current[selectedView] = el
                        }}
                        onClick={(e) => handleViewClick(e, selectedView)}
                        className="relative bg-slate-50 border-2 border-dashed border-slate-200 cursor-crosshair hover:border-rose-300 hover:bg-rose-50/30 transition-all overflow-hidden mx-auto rounded-3xl"
                        style={{
                            aspectRatio: vehicleViews.find(v => v.value === selectedView)?.aspectRatio,
                            minHeight: '300px',
                            maxHeight: '500px',
                            maxWidth: '800px',
                            width: '100%',
                        }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={vehicleViews.find(v => v.value === selectedView)?.imagePath}
                                alt={`${selectedView} view of vehicle`}
                                className="w-full h-full object-contain pointer-events-none opacity-80"
                            />
                        </div>

                        {currentViewMarkers.map((marker) => (
                            <div
                                key={marker.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 group/marker z-10"
                                style={{
                                    left: `${marker.x}%`,
                                    top: `${marker.y}%`,
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl"
                                    style={{ backgroundColor: getMarkerColor(marker.type) }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setEditingMarker(marker.id)
                                    }}
                                >
                                    <span className="text-[10px] text-white font-black">{marker.code}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeMarker(marker.id)
                                    }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center opacity-0 group-hover/marker:opacity-100 transition-opacity shadow-lg"
                                >
                                    <X className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                            <Plus className="w-4 h-4 text-rose-500" />
                            Selected: <span className="font-black" style={{ color: getMarkerColor(selectedType) }}>
                                {damageTypes.find(dt => dt.value === selectedType)?.label}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-slate-600">{selectedSeverity}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium italic">Click on the diagram to place a marker</p>
                    </div>
                </div>

                {damageData.markers.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Damage Inventory ({damageData.markers.length})
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {damageData.markers.map((marker) => (
                                <div
                                    key={marker.id}
                                    className="bg-slate-50/50 border border-slate-200 p-4 rounded-2xl space-y-3 transition-all hover:border-slate-300 hover:bg-slate-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] text-white font-black shadow-sm"
                                                style={{ backgroundColor: getMarkerColor(marker.type) }}
                                            >
                                                {marker.code}
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                                                    {damageTypes.find(dt => dt.value === marker.type)?.label}
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {marker.view} · {marker.severity}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeMarker(marker.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {editingMarker === marker.id ? (
                                        <Input
                                            placeholder="Add specific details..."
                                            value={marker.description || ''}
                                            onChange={(e) => updateMarkerDescription(marker.id, e.target.value)}
                                            onBlur={() => setEditingMarker(null)}
                                            className="h-10 bg-white border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:ring-rose-500/20"
                                            autoFocus
                                        />
                                    ) : (
                                        <p
                                            className={`text-xs cursor-pointer transition-colors ${marker.description ? 'text-slate-600 font-medium' : 'text-slate-400 italic'}`}
                                            onClick={() => setEditingMarker(marker.id)}
                                        >
                                            {marker.description || 'Click to add description...'}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
