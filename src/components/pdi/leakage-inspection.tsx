"use client"

import * as React from "react"
import { PDILeakageItem, PDILeakageResponse } from "./pdi-types"
import { AlertTriangle, Check, Droplets } from "lucide-react"

interface LeakageInspectionProps {
    items: PDILeakageItem[]
    responses: Record<string, PDILeakageResponse>
    onChange: (itemId: string, found: boolean, notes?: string) => void
}

export function LeakageInspection({ items, responses, onChange }: LeakageInspectionProps) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
            {/* Header */}
            <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <Droplets className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                        Leakage Inspection
                    </h3>
                </div>
            </div>

            {/* Legend */}
            <div className="px-6 py-4 bg-slate-50/30 border-b border-slate-100 flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shadow-sm">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Found</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
                        <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Not Found</span>
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100">
                {items.map((item) => {
                    const response = responses[item.id]
                    const found = response?.found ?? false
                    const isSet = response !== undefined

                    return (
                        <div
                            key={item.id}
                            className="p-5 bg-white hover:bg-slate-50/50 transition-colors"
                        >
                            <div className="flex flex-col gap-4">
                                <span className="text-sm text-slate-700 font-bold">
                                    {item.label}
                                </span>
                                <div className="flex gap-2">
                                    {/* FOUND Button */}
                                    <button
                                        type="button"
                                        onClick={() => onChange(item.id, true)}
                                        className={`
                                            flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest
                                            transition-all duration-200
                                            ${isSet && found
                                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 ring-2 ring-rose-500/20'
                                                : 'bg-slate-50 border border-slate-200 text-slate-400 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-500'
                                            }
                                        `}
                                    >
                                        Found
                                    </button>
                                    {/* NOT FOUND Button */}
                                    <button
                                        type="button"
                                        onClick={() => onChange(item.id, false)}
                                        className={`
                                            flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest
                                            transition-all duration-200
                                            ${isSet && !found
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/20'
                                                : 'bg-slate-50 border border-slate-200 text-slate-400 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-500'
                                            }
                                        `}
                                    >
                                        Not Found
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
