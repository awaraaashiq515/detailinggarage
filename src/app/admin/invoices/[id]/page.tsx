"use client"

import "./print.css"
import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, IndianRupee, Printer, X, Pencil, ArrowRightLeft, FileText, FileDown } from "lucide-react"

type Invoice = {
    id: string; invoiceNumber: string; type: string; date: string; dueDate: string | null
    status: string; subTotal: number; cgstTotal: number; sgstTotal: number; igstTotal: number
    taxTotal: number; discount: number; grandTotal: number; amountPaid: number
    notes: string | null; terms: string | null
    vehicleName: string | null; vehicleRegNo: string | null; vehicleChassis: string | null; odometer: string | null
    assignedStaff?: { id: string; name: string; role: string; phone?: string | null } | null
    client: { name: string; phone: string | null; email: string | null; gstin: string | null; address: string | null; state: string | null }
    shop?: {
        name: string
        logoUrl?: string | null
        phone?: string | null
        email?: string | null
        address?: string | null
        city?: string | null
        state?: string | null
        gstin?: string | null
        billingProfile?: {
            businessName?: string | null
            tagline?: string | null
            logoUrl?: string | null
            phone?: string | null
            altPhone?: string | null
            email?: string | null
            website?: string | null
            address?: string | null
            city?: string | null
            state?: string | null
            pinCode?: string | null
            country?: string | null
            gstin?: string | null
            pan?: string | null
            bankName?: string | null
            accountName?: string | null
            accountNumber?: string | null
            ifscCode?: string | null
            upiId?: string | null
            signatureUrl?: string | null
        } | null
    } | null
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

function fmtNum(n: number) {
    return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export function InvoiceDetailView({ id, basePath = "/admin/invoices" }: { id: string; basePath?: string }) {
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

    const handleConvert = async () => {
        if (!invoice) return
        const isQuotation = invoice.type === "QUOTATION" || invoice.type === "ESTIMATE"
        const targetType = isQuotation ? "INVOICE" : "QUOTATION"
        const label = isQuotation ? "Tax Invoice" : "Quotation"
        if (!confirm(`Convert this ${invoice.type} to a ${label}?\nA new DRAFT copy will be created with all items copied.`)) return
        const res = await fetch("/api/admin/billing/invoices", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action: "convert", targetType }),
        })
        const data = await res.json()
        if (data.success) {
            alert(`✅ ${label} created: ${data.invoice.invoiceNumber}`)
            window.location.href = `${basePath}/${data.invoice.id}`
        } else {
            alert(data.error || "Conversion failed")
        }
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

            {/* ====================================
                SCREEN-ONLY: Top Action Bar
                ==================================== */}
            <div className="no-print sticky top-0 z-20 bg-[#121214] border-b border-white/10 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={basePath} className="text-zinc-500 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
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
                    <button
                        onClick={handleConvert}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase transition-colors"
                        title={(invoice.type === "QUOTATION" || invoice.type === "ESTIMATE") ? "Convert to Invoice" : "Convert to Quotation"}
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        {(invoice.type === "QUOTATION" || invoice.type === "ESTIMATE") ? "Convert to Invoice" : "Convert to Quotation"}
                    </button>
                    <Link href={`${basePath}/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-[#121214] border border-white/10 text-white font-bold text-xs uppercase hover:bg-white/5 transition-colors">
                        <Pencil className="w-4 h-4" /> Edit
                    </Link>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#121214] border border-white/10 text-white font-bold text-xs uppercase hover:bg-white/5 transition-colors">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    <a
                        href={`/api/admin/billing/invoices/${id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition-colors"
                        title="Download PDF"
                    >
                        <FileDown className="w-4 h-4" /> Download PDF
                    </a>
                    {invoice.status === "DRAFT" && (
                        <button onClick={() => handleMarkStatus("UNPAID")} className="flex items-center gap-2 px-4 py-2 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase transition-colors">
                            <Check className="w-4 h-4" /> Finalize
                        </button>
                    )}
                </div>
            </div>

            {/* ====================================
                SCREEN-ONLY: Dark Preview Cards
                ==================================== */}
            <div className="no-print max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                {/* Invoice Header */}
                <div className="bg-[#121214] border border-white/5 p-6 grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                        {(invoice.shop?.billingProfile?.logoUrl || invoice.shop?.logoUrl) && (
                            <img
                                src={invoice.shop?.billingProfile?.logoUrl || invoice.shop?.logoUrl || ""}
                                alt="Shop Logo"
                                className="w-12 h-12 object-contain rounded bg-white/5 p-1 border border-white/10"
                            />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold font-display text-[#16acd4] mb-1">
                                {invoice.shop?.billingProfile?.businessName || invoice.shop?.name || "Detailing Garage"}
                            </h2>
                            <p className="text-xs text-zinc-400">
                                {invoice.shop?.billingProfile?.tagline || (invoice.shop ? (invoice.shop.city ? `${invoice.shop.city}, ${invoice.shop.state || ""}` : "") : "Premium Auto Protection Studio")}
                            </p>
                            <p className="text-xs text-zinc-500 mt-2">{invoice.type === "ESTIMATE" ? "ESTIMATE / QUOTATION" : "TAX INVOICE"}</p>
                        </div>
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
                        {invoice.assignedStaff && (
                            <div className="border-t border-white/5 pt-3 mt-4">
                                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Serviced By (Technician)</p>
                                <p className="text-xs text-emerald-400 font-bold">
                                    👨‍🔧 {invoice.assignedStaff.name} ({invoice.assignedStaff.role})
                                </p>
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
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">Product / Service Name</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest">HSN/SAC</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-center">Qty</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">Unit Price</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">CGST</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">SGST</th>
                                <th className="p-3 text-zinc-500 font-bold uppercase tracking-widest text-right">Amount</th>
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
                                    <td className="p-3 text-right font-mono text-zinc-400">
                                        <span>₹{item.cgst.toFixed(2)}</span>
                                        <span className="block text-[10px] text-zinc-600">{item.taxRate / 2}%</span>
                                    </td>
                                    <td className="p-3 text-right font-mono text-zinc-400">
                                        <span>₹{item.sgst.toFixed(2)}</span>
                                        <span className="block text-[10px] text-zinc-600">{item.taxRate / 2}%</span>
                                    </td>
                                    <td className="p-3 text-right font-mono font-bold text-[#16acd4]">₹{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals + Payment History */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* ====================================
                PRINT-ONLY: Professional A4 Layout
                ==================================== */}
            <div className="print-only" style={{ display: "none" }}>
                {/* Header: Company + Invoice Meta */}
                <div className="ip-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        {(invoice.shop?.billingProfile?.logoUrl || invoice.shop?.logoUrl) && (
                            <img
                                src={invoice.shop?.billingProfile?.logoUrl || invoice.shop?.logoUrl || ""}
                                alt="Shop Logo"
                                style={{ width: "52px", height: "52px", objectFit: "contain" }}
                            />
                        )}
                        <div>
                            <div className="ip-company-name">
                                {invoice.shop?.billingProfile?.businessName || invoice.shop?.name || "Detailing Garage"}
                            </div>
                            <div className="ip-company-tagline">
                                {invoice.shop?.billingProfile?.tagline || (invoice.shop ? (invoice.shop.city ? `${invoice.shop.city}, ${invoice.shop.state || ""}` : "") : "Premium Auto Protection Studio")}
                            </div>
                        </div>
                    </div>
                    <div className="ip-invoice-meta">
                        <div className="ip-meta-label">Original for Recipient</div>
                        <div className="ip-invoice-number">{invoice.invoiceNumber}</div>
                        <div className="ip-date-row">
                            <strong>Date</strong> {new Date(invoice.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                        {invoice.dueDate && (
                            <div className="ip-date-row">
                                <strong>Due Date</strong> {new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                            </div>
                        )}
                        <div className="ip-date-row" style={{ marginTop: "4px" }}>
                            <strong>{invoice.type === "ESTIMATE" ? "ESTIMATE / QUOTATION" : "TAX INVOICE"}</strong>
                        </div>
                    </div>
                </div>

                <hr className="ip-divider" />

                {/* From + Bill To */}
                <div className="ip-parties">
                    {/* From (our company) */}
                    <div>
                        <div className="ip-party-label">From</div>
                        <div className="ip-party-name">
                            {invoice.shop?.billingProfile?.businessName || invoice.shop?.name || "Detailing Garage"}
                        </div>
                        <div className="ip-party-detail">
                            {invoice.shop?.billingProfile?.tagline || (invoice.shop ? "" : "Premium Auto Protection Studio")}
                        </div>
                        {(invoice.shop?.billingProfile?.address || invoice.shop?.address) && (
                            <div className="ip-party-detail">
                                {invoice.shop?.billingProfile?.address || invoice.shop?.address}
                            </div>
                        )}
                        {(invoice.shop?.billingProfile?.city || invoice.shop?.city) && (
                            <div className="ip-party-detail">
                                {[
                                    invoice.shop?.billingProfile?.city || invoice.shop?.city,
                                    invoice.shop?.billingProfile?.state || invoice.shop?.state,
                                    invoice.shop?.billingProfile?.pinCode
                                ].filter(Boolean).join(", ")}
                            </div>
                        )}
                        {(invoice.shop?.billingProfile?.phone || invoice.shop?.phone) && (
                            <div className="ip-party-detail">
                                ☎ {invoice.shop?.billingProfile?.phone || invoice.shop?.phone}
                            </div>
                        )}
                        {(invoice.shop?.billingProfile?.email || invoice.shop?.email) && (
                            <div className="ip-party-detail">
                                ✉ {invoice.shop?.billingProfile?.email || invoice.shop?.email}
                            </div>
                        )}
                        {(invoice.shop?.billingProfile?.gstin || invoice.shop?.gstin) && (
                            <div className="ip-party-detail">
                                GSTIN: <span>{invoice.shop?.billingProfile?.gstin || invoice.shop?.gstin}</span>
                            </div>
                        )}
                        {invoice.shop?.billingProfile?.pan && (
                            <div className="ip-party-detail">
                                PAN: <span>{invoice.shop.billingProfile.pan}</span>
                            </div>
                        )}
                    </div>
                    {/* Bill To */}
                    <div>
                        <div className="ip-party-label">Bill to:</div>
                        <div className="ip-party-name">{invoice.client.name}</div>
                        {invoice.client.address && <div className="ip-party-detail">{invoice.client.address}</div>}
                        {invoice.client.phone && <div className="ip-party-detail">☎ {invoice.client.phone}</div>}
                        {invoice.client.email && <div className="ip-party-detail">✉ {invoice.client.email}</div>}
                        {invoice.client.gstin && <div className="ip-party-detail">GSTIN: <span>{invoice.client.gstin}</span></div>}
                    </div>
                </div>

                {/* Vehicle Info Band (if any) */}
                {(invoice.vehicleName || invoice.vehicleRegNo || invoice.vehicleChassis || invoice.odometer || invoice.assignedStaff) && (
                    <div className="ip-vehicle">
                        {invoice.vehicleName && (
                            <div>
                                <div className="ip-vehicle-cell-label">Vehicle</div>
                                <div className="ip-vehicle-cell-value">{invoice.vehicleName}</div>
                            </div>
                        )}
                        {invoice.vehicleRegNo && (
                            <div>
                                <div className="ip-vehicle-cell-label">Reg No</div>
                                <div className="ip-vehicle-cell-value">{invoice.vehicleRegNo}</div>
                            </div>
                        )}
                        {invoice.assignedStaff && (
                            <div>
                                <div className="ip-vehicle-cell-label">Serviced By</div>
                                <div className="ip-vehicle-cell-value">{invoice.assignedStaff.name} ({invoice.assignedStaff.role})</div>
                            </div>
                        )}
                        {invoice.odometer && (
                            <div>
                                <div className="ip-vehicle-cell-label">Odometer</div>
                                <div className="ip-vehicle-cell-value">{invoice.odometer}</div>
                            </div>
                        )}
                        {invoice.vehicleChassis && (
                            <div>
                                <div className="ip-vehicle-cell-label">Chassis / VIN</div>
                                <div className="ip-vehicle-cell-value">{invoice.vehicleChassis}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Items Table */}
                <table className="ip-table">
                    <thead>
                        <tr>
                            <th style={{ width: "28px" }}>No</th>
                            <th>Product / Service Name</th>
                            <th style={{ width: "60px" }}>HSN/SAC</th>
                            <th style={{ width: "36px", textAlign: "center" }}>Qty</th>
                            <th style={{ width: "80px", textAlign: "right" }}>Unit Price</th>
                            <th style={{ width: "80px", textAlign: "right" }}>CGST</th>
                            <th style={{ width: "80px", textAlign: "right" }}>SGST</th>
                            <th style={{ width: "80px", textAlign: "right" }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, i) => (
                            <tr key={item.id}>
                                <td>{i + 1}</td>
                                <td className="ip-item-name">{item.name}</td>
                                <td>{item.hsnSacCode || "-"}</td>
                                <td className="ip-center">{item.quantity}</td>
                                <td className="ip-right">{fmtNum(item.rate)}</td>
                                <td className="ip-tax-cell">
                                    {fmtNum(item.cgst)}
                                    <span className="ip-tax-pct">{item.taxRate / 2}%</span>
                                </td>
                                <td className="ip-tax-cell">
                                    {fmtNum(item.sgst)}
                                    <span className="ip-tax-pct">{item.taxRate / 2}%</span>
                                </td>
                                <td className="ip-total-cell">{fmtNum(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer: Notes/Payments + Summary */}
                <div className="ip-footer">
                    {/* Left: Notes + Payments */}
                    <div>
                        {invoice.payments.length > 0 && (
                            <div className="ip-payments-list" style={{ marginBottom: "12px" }}>
                                <div className="ip-pay-label">Payment History</div>
                                {invoice.payments.map(p => (
                                    <div key={p.id} className="ip-pay-row">
                                        <span>{p.paymentMethod} · {new Date(p.paymentDate).toLocaleDateString("en-IN")}{p.reference ? ` (${p.reference})` : ""}</span>
                                        <span>{fmtNum(p.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {invoice.notes && (
                            <div className="ip-notes-section">
                                <div className="ip-notes-title">Note</div>
                                <div className="ip-notes-text">{invoice.notes}</div>
                            </div>
                        )}
                        {invoice.terms && (
                            <div className="ip-notes-section" style={{ marginTop: "8px" }}>
                                <div className="ip-notes-title">Terms &amp; Conditions</div>
                                <div className="ip-notes-text">{invoice.terms}</div>
                            </div>
                        )}
                        {(invoice.shop?.billingProfile?.bankName || invoice.shop?.billingProfile?.accountNumber || invoice.shop?.billingProfile?.upiId) && (
                            <div className="ip-notes-section" style={{ marginTop: "8px", background: "#f8fafc", padding: "6px 8px", border: "1px solid #e2e8f0" }}>
                                <div className="ip-notes-title" style={{ color: "#0369a1" }}>Bank &amp; Payment Details</div>
                                <div className="ip-notes-text" style={{ fontSize: "8.5px", lineHeight: "1.4" }}>
                                    {invoice.shop.billingProfile.bankName && <div><strong>Bank:</strong> {invoice.shop.billingProfile.bankName}</div>}
                                    {invoice.shop.billingProfile.accountName && <div><strong>A/C Name:</strong> {invoice.shop.billingProfile.accountName}</div>}
                                    {invoice.shop.billingProfile.accountNumber && <div><strong>A/C No:</strong> {invoice.shop.billingProfile.accountNumber} {invoice.shop.billingProfile.ifscCode ? `(${invoice.shop.billingProfile.ifscCode})` : ""}</div>}
                                    {invoice.shop.billingProfile.upiId && <div><strong>UPI ID:</strong> {invoice.shop.billingProfile.upiId}</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Summary Box */}
                    <div className="ip-summary">
                        <div className="ip-summary-row ip-subtotal">
                            <span>Sub Total</span><span>{fmtNum(invoice.subTotal)}</span>
                        </div>
                        <div className="ip-summary-row">
                            <span>CGST</span><span>{fmtNum(invoice.cgstTotal)}</span>
                        </div>
                        <div className="ip-summary-row">
                            <span>SGST</span><span>{fmtNum(invoice.sgstTotal)}</span>
                        </div>
                        {invoice.igstTotal > 0 && (
                            <div className="ip-summary-row">
                                <span>IGST</span><span>{fmtNum(invoice.igstTotal)}</span>
                            </div>
                        )}
                        {invoice.discount > 0 && (
                            <div className="ip-summary-row" style={{ color: "#b91c1c" }}>
                                <span>Discount</span><span>- {fmtNum(invoice.discount)}</span>
                            </div>
                        )}
                        <div className="ip-summary-row ip-grand-total">
                            <span>Grand Total</span><span>{fmtNum(invoice.grandTotal)}</span>
                        </div>
                        {invoice.amountPaid > 0 && (
                            <div className="ip-summary-row ip-amount-paid">
                                <span>Amount Paid</span><span>{fmtNum(invoice.amountPaid)}</span>
                            </div>
                        )}
                        {balance > 0 && (
                            <div className="ip-summary-row ip-balance-due">
                                <span>Balance Due</span><span>{fmtNum(Math.max(0, balance))}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stamp / Signature */}
                <div className="ip-stamp">
                    <div className="ip-stamp-text">
                        Thank you for your business!<br />
                        {invoice.shop?.billingProfile?.businessName || invoice.shop?.name || "Detailing Garage · Premium Auto Protection Studio"}
                    </div>
                    <div className="ip-stamp-sign">
                        {invoice.shop?.billingProfile?.signatureUrl ? (
                            <img
                                src={invoice.shop.billingProfile.signatureUrl}
                                alt="Signature"
                                style={{ height: "36px", objectFit: "contain", marginLeft: "auto", marginBottom: "4px" }}
                            />
                        ) : null}
                        <div className="ip-sign-line"></div>
                        Authorised Signatory
                    </div>
                </div>
            </div>

            {/* ====================================
                Payment Modal (screen-only)
                ==================================== */}
            {showPayModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print">
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

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    return <InvoiceDetailView id={id} basePath="/admin/invoices" />
}
