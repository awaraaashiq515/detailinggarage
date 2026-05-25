"use client"

import * as React from "react"
import { PDIItem, PDIStatus } from "./pdi-types"
import { Check, X, AlertTriangle } from "lucide-react"

interface PDIItemRowProps {
    item: PDIItem
    status?: PDIStatus
    notes?: string
    onChange: (itemId: string, status: PDIStatus, notes: string) => void
}

export function PDIItemRow({ item, status, notes = "", onChange }: PDIItemRowProps) {
    return (
        <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
            {/* Item Label */}
            <td className="py-1.5 px-2.5 text-xs text-slate-700 font-semibold">
                {item.label}
            </td>

            {/* Y (Pass) Button */}
            <td className="py-1.5 px-1 text-center w-10">
                <button
                    type="button"
                    onClick={() => onChange(item.id, "PASS", notes)}
                    className={`
                        w-8 h-8 rounded-lg text-[10px] font-black
                        transition-all duration-200
                        ${status === "PASS"
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110'
                            : 'bg-slate-100 border border-slate-200 text-slate-400 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600'
                        }
                    `}
                    title="Satisfactory / Passed"
                >
                    Y
                </button>
            </td>

            {/* X (Fail) Button */}
            <td className="py-1.5 px-1 text-center w-10">
                <button
                    type="button"
                    onClick={() => onChange(item.id, "FAIL", notes)}
                    className={`
                        w-8 h-8 rounded-lg text-[10px] font-black
                        transition-all duration-200
                        ${status === "FAIL"
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-110'
                            : 'bg-slate-100 border border-slate-200 text-slate-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600'
                        }
                    `}
                    title="Unsatisfactory / Failed"
                >
                    X
                </button>
            </td>

            {/* ! (Advisory) Button */}
            <td className="py-1.5 px-1 text-center w-10">
                <button
                    type="button"
                    onClick={() => onChange(item.id, "WARN", notes)}
                    className={`
                        w-8 h-8 rounded-lg text-[10px] font-black
                        transition-all duration-200
                        ${status === "WARN"
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-110'
                            : 'bg-slate-100 border border-slate-200 text-slate-400 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600'
                        }
                    `}
                    title="Advisory / Attention Required"
                >
                    !
                </button>
            </td>
        </tr>
    )
}
