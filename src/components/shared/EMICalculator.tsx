"use client"

import React, { useState, useEffect } from "react"
import { Calculator, Info } from "lucide-react"

interface EMICalculatorProps {
    price: number
    className?: string
}

export function EMICalculator({ price, className = "" }: EMICalculatorProps) {
    const [downPayment, setDownPayment] = useState(Math.floor(price * 0.2))
    const [interestRate, setInterestRate] = useState(12)
    const [tenure, setTenure] = useState(24)

    const [emi, setEmi] = useState(0)
    const [totalInterest, setTotalInterest] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)

    useEffect(() => {
        const principal = price - downPayment
        const monthlyRate = interestRate / (12 * 100)
        const n = tenure

        if (principal > 0 && monthlyRate > 0) {
            const emiValue = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
            setEmi(Math.round(emiValue))
            setTotalAmount(Math.round(emiValue * n))
            setTotalInterest(Math.round(emiValue * n - principal))
        } else if (principal > 0 && monthlyRate === 0) {
            setEmi(Math.round(principal / n))
            setTotalAmount(principal)
            setTotalInterest(0)
        } else {
            setEmi(0)
            setTotalAmount(0)
            setTotalInterest(0)
        }
    }, [price, downPayment, interestRate, tenure])

    const formatCurrency = (amount: number) => {
        return "₹" + new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0
        }).format(amount)
    }

    const principal = price - downPayment
    const principalPercent = (principal / (principal + totalInterest)) * 100

    return (
        <div className={`bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_15px_60px_rgba(0,0,0,0.05)] border border-slate-100 ${className}`}>
            {/* Arctic Slate Header */}
            <div className="text-center mb-12 pb-12 border-b border-slate-100">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    <Calculator className="w-4 h-4" />
                    Financing Engine
                </div>

                <div className="space-y-1">
                    <div className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic">
                        {formatCurrency(emi)} <span className="text-2xl md:text-3xl font-bold text-slate-300 not-italic">/mo*</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Visual Breakdown Column */}
                <div className="space-y-10">
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Loan Structure</h3>

                        {/* Interactive Progress Bar */}
                        <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden flex mb-8 shadow-inner">
                            <div
                                className="h-full bg-slate-200"
                                style={{ width: `${principalPercent}%` }}
                            ></div>
                            <div
                                className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                                style={{ width: `${100 - principalPercent}%` }}
                            ></div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 px-1">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Base Principal</span>
                                <span className="text-sm text-slate-900 font-bold">{formatCurrency(principal)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Calculated Interest</span>
                                </div>
                                <span className="text-sm text-indigo-600 font-bold">{formatCurrency(totalInterest)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-indigo-50/30 border border-indigo-100/50 flex justify-between items-center transition-colors hover:bg-indigo-50/50">
                        <div>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Total Ownership</div>
                            <div className="text-2xl font-black text-slate-900 italic tracking-tight">{formatCurrency(totalAmount)}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Monthly Installment</div>
                            <div className="text-2xl font-black text-indigo-600 italic tracking-tight">{formatCurrency(emi)}</div>
                        </div>
                    </div>
                </div>

                {/* Parameters Column */}
                <div className="space-y-10">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Parameters</h3>

                    <div className="space-y-12">
                        {/* Down Payment Control */}
                        <div>
                            <div className="flex justify-between items-center mb-5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Down Payment</label>
                                <input
                                    type="number"
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(Math.min(price, Math.max(0, parseInt(e.target.value) || 0)))}
                                    className="w-36 py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl text-right font-black text-sm text-indigo-600 focus:bg-white focus:border-indigo-600 shadow-sm outline-none transition-all"
                                />
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={price}
                                step={10000}
                                value={downPayment}
                                onChange={(e) => setDownPayment(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Zero Deposit</span>
                                <span>Full Settlement</span>
                            </div>
                        </div>

                        {/* Tenure Control */}
                        <div>
                            <div className="flex justify-between items-center mb-5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timeline</label>
                                <span className="text-sm font-black text-slate-900 italic">{tenure} Months</span>
                            </div>
                            <input
                                type="range"
                                min="12"
                                max="84"
                                step="12"
                                value={tenure}
                                onChange={(e) => setTenure(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span>12 Months</span>
                                <span>84 Months</span>
                            </div>
                        </div>

                        {/* Rate Control */}
                        <div>
                            <div className="flex justify-between items-center mb-5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Interest Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Math.min(30, Math.max(0, parseFloat(e.target.value) || 0)))}
                                    className="w-24 py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl text-right font-black text-sm text-indigo-600 focus:bg-white focus:border-indigo-600 shadow-sm outline-none transition-all"
                                />
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                step="0.1"
                                value={interestRate}
                                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <Info className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                            *Estimated monthly installments are for informational purposes. Final terms subject to credit verification and dealer approval.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
