"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, Check, IndianRupee, Printer, X, Pencil } from "lucide-react"

type Invoice = {
    id: string; invoiceNumber: string; type: string; date: string; dueDate: string | null
    status: string; subTotal: number; cgstTotal: number; sgstTotal: number; igstTotal: number
    taxTotal: number; discount: number; grandTotal: number; amountPaid: number
    notes: string | null; terms: string | null
    vehicleName: string | null; vehicleRegNo: string | null; vehicleChassis: string | null; odometer: string | null
    client: { name: string; phone: string | null; email: string | null; gstin: string | null; address: string | null; state: string | null }
    items: { id: string; name: string; hsnSacCode: string | null; quantity: number; rate: number; taxRate: number; cgst: number; sgst: number; igst: number; total: number }[]
    payments: { id: string; amount: number; paymentMethod: string; reference: string | null; paymentDate: string; notes: string | null }[]
}

const STATUS_COLORS: Record<string, string> = {
    PAID: "bg-green-500/10 text-green-400 border border-green-500/20",
    UNPAID: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    PARTIALLY_PAID: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    OVERDUE: "bg-red-500/10 text-red-400 border border-red-500/20",
    DRAFT: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
}

function fmt(n: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n)
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [loading, setLoading] = useState(true)
    const [showPayModal, setShowPayModal] = useState(false)
    const [payAmount, setPayAmount] = useState("")
    const [payMethod, setPayMethod] = useState("CASH")
    const [payRef, setPayRef] = useState("")
    const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0])
    const [paying, setPaying] = useState(false)

    const fetchInvoice = async () => {
        const res = await fetch(`/api/admin/billing/invoices?id=${id}`)
        const data = await res.json()
        if (data.success) {
            setInvoice(data.invoice || null)
        }
        setLoading(false)
    }

    useEffect(() => { fetchInvoice() }, [id])

    const handleMarkStatus = async (status: string) => {
        await fetch("/api/admin/billing/invoices", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        })
        fetchInvoice()
    }

    const handleRecordPayment = async () => {
        if (!payAmount || parseFloat(payAmount) <= 0) { alert("Enter a valid amount"); return }
        setPaying(true)
        const res = await fetch("/api/admin/billing/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invoiceId: id, amount: parseFloat(payAmount), paymentMethod: payMethod, reference: payRef, paymentDate: payDate }),
        })
        const data = await res.json()
        setPaying(false)
        if (data.success) {
            setShowPayModal(false)
            setPayAmount(""); setPayRef("")
            fetchInvoice()
        } else alert(data.error || "Failed to record payment")
    }

    if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500">Loading invoice...</div>
    if (!invoice) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500">Invoice not found</div>

    const balance = invoice.grandTotal - invoice.amountPaid

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            {/* Top bar */}
            <div className="sticky top-0 z-20 bg-[#121214] border-b border-white/10 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/invoices" className="text-zinc-500 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
                    <div>
                        <span className="font-bold text-[#16acd4] font-mono">{invoice.invoiceNumber}</span>
                        <span className={`ml-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLORS[invoice.status] || STATUS_COLORS.DRAFT}`}>
                            {invoice.status.replace("_", " ")}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {invoice.status !== "PAID" && (
                        <button onClick={() => setShowPayModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase transition-colors">
                            <IndianRupee className="w-4 h-4" /> Record Payment
                        </button>
                    )}
                    <Link href={`/admin/invoices/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-[#121214] border border-white/10 text-white font-bold text-xs uppercase hover:bg-white/5 transition-colors">
                        <Pencil className="w-4 h-4" /> Edit
                    </Link>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#121214] border border-white/10 text-white font-bold text-xs uppercase hover:bg-white/5 transition-colors">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    {invoice.status === "DRAFT" && (
                        <button onClick={() => handleMarkStatus("UNPAID")} className="flex items-center gap-2 px-4 py-2 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase transition-colors">
                            <Check className="w-4 h-4" /> Finalize
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                {/* Invoice Header */}
                <div className="bg-[#121214] border border-white/5 p-6 grid grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-2xl font-bold font-display text-[#16acd4] mb-1">Detailing Garage</h2>
                        <p className="text-xs text-zinc-400">Premium Auto Protection Studio</p>
                        <p className="text-xs text-zinc-500 mt-2">{invoice.type === "ESTIMATE" ? "ESTIMATE / QUOTATION" : "TAX INVOICE"}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-500 mb-1">Invoice No.</p>
                        <p className="text-xl font-bold font-mono text-white">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-zinc-500 mt-2">Issue Date: <span className="text-white">{new Date(invoice.date).toLocaleDateString("en-IN")}</span></p>
                        {invoice.dueDate && <p className="text-xs text-zinc-500">Due Date: <span className="text-amber-400">{new Date(invoice.dueDate).toLocaleDateString("en-IN")}</span></p>}
                    </div>
                </div>

                {/* Client & Vehicle Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bill To */}
                    <div className="bg-[#121214] border border-white/5 p-5 flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#16acd4] mb-3">Bill To</p>
                            <p className="font-bold text-white text-lg">{invoice.client.name}</p>
                            {invoice.client.address && <p className="text-xs text-zinc-400 mt-1">{invoice.client.address}</p>}
                        </div>
                        <div className="flex gap-4 mt-4 flex-wrap border-t border-white/5 pt-3">
                            {invoice.client.phone && <p className="text-xs text-zinc-400">📞 {invoice.client.phone}</p>}
                            {invoice.client.email && <p className="text-xs text-zinc-400">✉️ {invoice.client.email}</p>}
                            {invoice.client.gstin && <p className="text-xs text-zinc-400">GSTIN: <span className="font-mono text-white">{invoice.client.gstin}</span></p>}
                        </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="bg-[#121214] border border-white/5 p-5 flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#16acd4] mb-3">Vehicle Details</p>
                            {invoice.vehicleName ? (
                                <p className="font-bold text-white text-lg">{invoice.vehicleName}</p>
                            ) : (
                                <p className="text-sm text-zinc-500 italic">No vehicle details provided</p>
                            )}
                            <div className="grid grid-cols-2 gap-4 mt-3">
                                {invoice.vehicleRegNo && (
                                    <div>
                                        <p className="text-[10px] text-zinc-500 uppercase font-semibold">Reg No</p>
                                        <p className="text-xs text-white font-mono">{invoice.vehicleRegNo}</p>
                                    </div>
                                )}
                                {invoice.odometer && (
                                    <div>
                                        <p className="text-[10px] text-zinc-500 uppercase font-semibold">Odometer</p>
                                        <p className="text-xs text-white">{invoice.odometer}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {invoice.vehicleChassis && (
                            <div className="border-t border-white/5 pt-3 mt-4">
                                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Chassis / VIN No</p>
                                <p className="text-xs text-zinc-400 font-mono">{invoice.vehicleChassis}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-[#121214] border border-white/5 overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="bg-[#1a1a1c] border-b border-white/10">
                            <tr>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">#</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">Item</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">HSN/SAC</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-center">Qty</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">Rate</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">CGST</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">SGST</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {invoice.items.map((item, i) => (
                                <tr key={item.id} className="hover:bg-white/[0.02]">
                                    <td className="p-3 text-zinc-600">{i + 1}</td>
                                    <td className="p-3 text-white font-medium">{item.name}</td>
                                    <td className="p-3 text-zinc-500">{item.hsnSacCode || "-"}</td>
                                    <td className="p-3 text-center">{item.quantity}</td>
                                    <td className="p-3 text-right font-mono">₹{item.rate.toFixed(2)}</td>
                                    <td className="p-3 text-right font-mono text-zinc-400">₹{item.cgst.toFixed(2)}</td>
                                    <td className="p-3 text-right font-mono text-zinc-400">₹{item.sgst.toFixed(2)}</td>
                                    <td className="p-3 text-right font-mono font-bold text-[#16acd4]">₹{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals + Payment History */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payment History */}
                    <div className="bg-[#121214] border border-white/5 p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Payment History</p>
                        {invoice.payments.length === 0 ? (
                            <p className="text-zinc-600 text-xs">No payments recorded yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {invoice.payments.map(p => (
                                    <div key={p.id} className="flex justify-between items-center border border-white/5 rounded p-2">
                                        <div>
                                            <p className="text-xs font-bold text-white">{p.paymentMethod}</p>
                                            <p className="text-[10px] text-zinc-500">{new Date(p.paymentDate).toLocaleDateString("en-IN")}{p.reference ? ` · ${p.reference}` : ""}</p>
                                        </div>
                                        <span className="font-mono font-bold text-green-400 text-sm">{fmt(p.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {invoice.notes && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Note</p>
                                <p className="text-xs text-zinc-400">{invoice.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Totals */}
                    <div className="bg-[#121214] border border-white/5 p-5 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Summary</p>
                        <div className="flex justify-between text-xs text-zinc-400"><span>Sub Total</span><span className="font-mono">{fmt(invoice.subTotal)}</span></div>
                        <div className="flex justify-between text-xs text-zinc-400"><span>CGST</span><span className="font-mono">{fmt(invoice.cgstTotal)}</span></div>
                        <div className="flex justify-between text-xs text-zinc-400"><span>SGST</span><span className="font-mono">{fmt(invoice.sgstTotal)}</span></div>
                        {invoice.igstTotal > 0 && <div className="flex justify-between text-xs text-zinc-400"><span>IGST</span><span className="font-mono">{fmt(invoice.igstTotal)}</span></div>}
                        {invoice.discount > 0 && <div className="flex justify-between text-xs text-red-400"><span>Discount</span><span className="font-mono">-{fmt(invoice.discount)}</span></div>}
                        <div className="flex justify-between text-white font-bold text-base pt-3 border-t border-white/10">
                            <span>Grand Total</span><span className="font-mono text-[#16acd4]">{fmt(invoice.grandTotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-green-400"><span>Amount Paid</span><span className="font-mono">{fmt(invoice.amountPaid)}</span></div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-white/10">
                            <span className="text-amber-400">Balance Due</span><span className="font-mono text-amber-400">{fmt(Math.max(0, balance))}</span>
                        </div>
                        {invoice.status !== "PAID" && (
                            <button onClick={() => setShowPayModal(true)} className="w-full mt-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2">
                                <IndianRupee className="w-4 h-4" /> Record Payment
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#121214] border border-white/10 w-full max-w-md rounded-sm shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-bold text-white">Record Payment</h3>
                            <button onClick={() => setShowPayModal(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="bg-[#09090b] border border-white/5 p-3 rounded flex justify-between">
                                <span className="text-xs text-zinc-500">Balance Due</span>
                                <span className="font-mono font-bold text-amber-400">{fmt(Math.max(0, balance))}</span>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Amount *</label>
                                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder={`Max: ${balance.toFixed(2)}`} className="w-full bg-[#09090b] border border-white/10 text-white text-sm px-3 py-2.5 outline-none focus:border-[#16acd4]/50 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Payment Method *</label>
                                <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50">
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="CARD">Card</option>
                                    <option value="CHEQUE">Cheque</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Transaction Ref / UTR</label>
                                <input value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Optional" className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Payment Date</label>
                                <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="w-full bg-[#09090b] border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#16acd4]/50" />
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/10 flex justify-end">
                            <button onClick={handleRecordPayment} disabled={paying} className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase transition-colors disabled:opacity-50 flex items-center gap-2">
                                <Check className="w-4 h-4" /> {paying ? "Saving..." : "Record Payment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
