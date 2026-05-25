"use client"

import * as React from "react"
import { PDISection, PDIStatus } from "./pdi-types"
import { PDIItemRow } from "./pdi-item-row"

interface PDISectionProps {
    section: PDISection
    responses: Record<string, { status: PDIStatus; notes: string }>
    onItemChange: (itemId: string, status: PDIStatus, notes: string) => void
}

export function PDISectionComponent({ section, responses, onItemChange }: PDISectionProps) {
    // Calculate section progress
    const totalItems = section.items.length
    const answeredItems = section.items.filter(item => responses[item.id]).length
    const passItems = section.items.filter(item => responses[item.id]?.status === "PASS").length
    const failItems = section.items.filter(item => responses[item.id]?.status === "FAIL").length
    const warnItems = section.items.filter(item => responses[item.id]?.status === "WARN").length

    return (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
            {/* Section Header */}
            <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                        {section.name}
                    </h4>
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                        {answeredItems > 0 && (
                            <>
                                {passItems > 0 && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-600 border border-emerald-200">
                                        {passItems}
                                    </span>
                                )}
                                {failItems > 0 && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-600 border border-rose-200">
                                        {failItems}
                                    </span>
                                )}
                                {warnItems > 0 && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-600 border border-amber-200">
                                        {warnItems}
                                    </span>
                                )}
                            </>
                        )}
                        <span className="text-[10px] text-slate-400 font-black font-mono">
                            {answeredItems}/{totalItems}
                        </span>
                    </div>
                </div>
            </div>

            {/* Table Layout */}
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="text-left py-3 px-5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Item
                        </th>
                        <th className="py-1.5 px-1 text-center w-10">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100">
                                Y
                            </span>
                        </th>
                        <th className="py-1.5 px-1 text-center w-10">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-50 text-rose-600 text-[10px] font-black border border-rose-100">
                                X
                            </span>
                        </th>
                        <th className="py-1.5 px-1 text-center w-10">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-50 text-amber-600 text-[10px] font-black border border-amber-100">
                                !
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {section.items.map((item) => (
                        <PDIItemRow
                            key={item.id}
                            item={item}
                            status={responses[item.id]?.status}
                            notes={responses[item.id]?.notes || ""}
                            onChange={onItemChange}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}
