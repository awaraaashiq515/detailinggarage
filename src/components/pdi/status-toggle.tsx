"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { PDIStatus } from "./pdi-types"
import { Check, X, AlertTriangle, Eye, EyeOff } from "lucide-react"

interface StatusToggleProps {
    value: PDIStatus | undefined
    onChange: (value: PDIStatus) => void
    isLeakage?: boolean
}

export function StatusToggle({ value, onChange, isLeakage = false }: StatusToggleProps) {
    if (isLeakage) {
        return (
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange("FOUND")}
                    className={cn(
                        "h-8 px-4 rounded-full text-[10px] font-bold tracking-wider transition-all duration-300",
                        value === "FOUND"
                            ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                            : "bg-red-500/5 text-red-500 border border-red-500/20 hover:bg-red-500/10"
                    )}
                >
                    FOUND
                </button>
                <button
                    type="button"
                    onClick={() => onChange("NOT_FOUND")}
                    className={cn(
                        "h-8 px-4 rounded-full text-[10px] font-bold tracking-wider transition-all duration-300",
                        value === "NOT_FOUND"
                            ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                            : "bg-green-500/5 text-green-500 border border-green-500/20 hover:bg-green-500/10"
                    )}
                >
                    NOT FOUND
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
            {/* PASS (Y) */}
            <button
                type="button"
                onClick={() => onChange("PASS")}
                className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-md transition-all duration-300",
                    value === "PASS"
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/20 scale-105"
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                )}
                title="Pass (Y)"
            >
                <span className="text-xs font-bold">YES</span>
            </button>

            {/* FAIL (X) */}
            <button
                type="button"
                onClick={() => onChange("FAIL")}
                className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-md transition-all duration-300",
                    value === "FAIL"
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20 scale-105"
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                )}
                title="Fail (X)"
            >
                <span className="text-xs font-bold">NO</span>
            </button>

            {/* WARN (!) */}
            <button
                type="button"
                onClick={() => onChange("WARN")}
                className={cn(
                    "flex h-7 w-8 items-center justify-center rounded-md transition-all duration-300",
                    value === "WARN"
                        ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 scale-105"
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                )}
                title="Attention Needed (!)"
            >
                <AlertTriangle className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}
