"use client"

import * as React from "react"
import {
    ClipboardCheck, ArrowLeft, Loader2, Calendar,
    Car, User, CheckCircle2,
    XCircle, AlertCircle, Clock, Edit, Download, RefreshCw, Mail,
    Camera, Droplets, MessageSquare, X, ExternalLink
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ShopPDIViewPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = React.use(paramsPromise)
    const id = params.id
    const [inspection, setInspection] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)
    const [pdfLoading, setPdfLoading] = React.useState(false)
    const [emailLoading, setEmailLoading] = React.useState(false)
    const [activeImage, setActiveImage] = React.useState<string | null>(null)

    React.useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/admin/pdi/details/${id}`)
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()

                // Group responses by section
                const sectionsMap: Record<string, any> = {}
                if (Array.isArray(data.responses)) {
                    data.responses.forEach((resp: any) => {
                        const sectionName = resp.item?.section?.name || 'General Inspection'
                        if (!sectionsMap[sectionName]) {
                            sectionsMap[sectionName] = {
                                name: sectionName,
                                responses: []
                            }
                        }
                        sectionsMap[sectionName].responses.push(resp)
                    })
                }

                setInspection({
                    ...data,
                    groupedSections: Object.values(sectionsMap)
                })
            } catch (error) {
                console.error("Failed to load inspection details:", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchDetails()
    }, [id])

    const regeneratePdf = async () => {
        setPdfLoading(true)
        try {
            const res = await fetch(`/api/pdi/generate-pdf/${id}`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to generate PDF')
            const data = await res.json()
            if (data.exists || data.pdfUrl) {
                if (data.pdfUrl) {
                    setInspection((prev: any) => ({ ...prev, pdfUrl: data.pdfUrl }))
                }
                alert('PDF regenerated successfully!')
            }
        } catch (err) {
            alert('Failed to regenerate PDF')
            console.error(err)
        } finally {
            setPdfLoading(false)
        }
    }

    const downloadPdf = async () => {
        if (inspection?.pdfUrl) {
            window.open(inspection.pdfUrl, '_blank')
            return
        }

        setPdfLoading(true)
        try {
            const res = await fetch(`/api/pdi/generate-pdf/${id}`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to generate PDF')
            const data = await res.json()
            if (data.pdfUrl) {
                setInspection((prev: any) => ({ ...prev, pdfUrl: data.pdfUrl }))
                window.open(data.pdfUrl, '_blank')
            } else {
                alert('PDF generated successfully!')
                window.location.reload()
            }
        } catch (err) {
            alert('Failed to generate and download PDF')
            console.error(err)
        } finally {
            setPdfLoading(false)
        }
    }

    const sendManualEmail = async () => {
        if (!inspection?.customerEmail) {
            alert("Customer email is missing for this report.")
            return
        }

        setEmailLoading(true)
        try {
            const res = await fetch("/api/admin/pdi/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inspectionId: id })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to send email")
            }

            alert("✅ PDI Report email sent to customer successfully!")
        } catch (err: any) {
            alert(`Failed to send email: ${err.message}`)
        } finally {
            setEmailLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PASS": return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
            case "FAIL": return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0" />
            case "WARN": return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
            default: return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" />
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4 px-4 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#16acd4]" />
                <p className="text-zinc-400 font-medium animate-pulse uppercase tracking-widest text-xs sm:text-sm">
                    Retrieving Report Details...
                </p>
            </div>
        )
    }

    if (!inspection) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] text-center px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Report Not Found</h2>
                <p className="text-zinc-500 mb-8 max-w-md text-sm">The inspection report you are looking for does not exist or has been removed.</p>
                <Link href="/shop/billing/pdi">
                    <Button className="bg-[#16acd4] hover:bg-[#16acd4]/90 text-black font-bold uppercase tracking-wider text-xs sm:text-sm">
                        Back to PDI List
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#08090c] text-white pb-24 sm:pb-20">
            {/* Branded Header */}
            <div className="w-full flex justify-center pt-4 sm:pt-8 px-3 sm:px-4 mb-4 sm:mb-8">
                <img
                    src="/uploads/branding/pdi-header.jpg"
                    alt="Detailing Garage PDI Header"
                    className="w-full max-w-3xl h-auto max-h-24 sm:max-h-36 object-contain rounded-xl opacity-90 invert hue-rotate-180"
                />
            </div>

            <div className="max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 space-y-6 sm:space-y-10">
                {/* Header and Title */}
                <div className="border-b border-white/10 pb-6 space-y-4">
                    <div className="flex items-center gap-3 sm:gap-5">
                        <Link href="/shop/billing/pdi">
                            <button
                                type="button"
                                className="p-2.5 sm:p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/10 active:scale-95 shrink-0"
                                title="Back to PDI Inspections"
                            >
                                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </Link>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[#16acd4] text-[11px] sm:text-xs font-black uppercase tracking-widest mb-1 truncate">
                                <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
                                <span>Inspection Report Detail</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-tight truncate">
                                {inspection.vehicleMake} <span className="text-[#16acd4]">{inspection.vehicleModel}</span>
                            </h1>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
                        {/* Download PDF */}
                        <Button
                            type="button"
                            onClick={downloadPdf}
                            disabled={pdfLoading}
                            className="bg-[#16acd4] hover:bg-[#16acd4]/90 text-black font-black text-xs uppercase tracking-wider h-11 px-4 sm:px-6 rounded-xl shadow-lg shadow-[#16acd4]/30 active:scale-95 transition-all flex items-center justify-center gap-2 col-span-2 sm:col-span-1"
                        >
                            {pdfLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            <span>Download PDF</span>
                        </Button>

                        {/* Regenerate PDF */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={regeneratePdf}
                            disabled={pdfLoading}
                            className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs uppercase tracking-wider h-11 px-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            {pdfLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            <span>Regenerate</span>
                        </Button>

                        {/* Send Email */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={sendManualEmail}
                            disabled={emailLoading || !inspection.customerEmail}
                            className={`border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-bold text-xs uppercase tracking-wider h-11 px-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all col-span-2 sm:col-span-1 ${!inspection.customerEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={!inspection.customerEmail ? "Customer has no email address" : "Send report to customer via email"}
                        >
                            {emailLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Mail className="w-4 h-4" />
                            )}
                            <span>Send Email</span>
                        </Button>
                    </div>
                </div>

                {/* Info Grid: Vehicle Info & Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Vehicle Details */}
                    <Card className="bg-[#111318]/60 border-white/[0.08] rounded-2xl backdrop-blur-md overflow-hidden">
                        <CardHeader className="border-b border-white/[0.05] flex flex-row items-center gap-3 py-3.5 px-4 sm:px-6 bg-white/[0.02]">
                            <div className="p-2 rounded-xl bg-[#16acd4]/10 text-[#16acd4]">
                                <Car className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <CardTitle className="text-sm sm:text-base font-black italic uppercase tracking-wider text-white">
                                Vehicle Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-y-5">
                            {[
                                { label: "Make", value: inspection.vehicleMake },
                                { label: "Model", value: inspection.vehicleModel },
                                { label: "Year", value: inspection.vehicleYear || "N/A" },
                                { label: "Color", value: inspection.vehicleColor },
                                { label: "VIN/Chassis", value: inspection.vin || "N/A", full: true },
                                { label: "Engine No", value: inspection.engineNumber || "N/A" },
                                { label: "Odometer", value: `${inspection.odometer || "0"} KM` },
                            ].map((item, i) => (
                                <div key={i} className={item.full ? "col-span-2" : ""}>
                                    <span className="block text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                                        {item.label}
                                    </span>
                                    <span className="text-sm sm:text-base text-zinc-100 font-semibold break-all">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Customer & Meta */}
                    <Card className="bg-[#111318]/60 border-white/[0.08] rounded-2xl backdrop-blur-md overflow-hidden">
                        <CardHeader className="border-b border-white/[0.05] flex flex-row items-center gap-3 py-3.5 px-4 sm:px-6 bg-white/[0.02]">
                            <div className="p-2 rounded-xl bg-[#16acd4]/10 text-[#16acd4]">
                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <CardTitle className="text-sm sm:text-base font-black italic uppercase tracking-wider text-white">
                                Customer Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
                            <div>
                                <span className="block text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                                    Full Name
                                </span>
                                <span className="text-base sm:text-xl text-white font-bold">
                                    {inspection.customerName}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                                        Email Address
                                    </span>
                                    <span className="text-xs sm:text-sm text-zinc-200 font-medium break-all">
                                        {inspection.customerEmail || "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                                        Phone Number
                                    </span>
                                    <span className="text-xs sm:text-sm text-zinc-200 font-medium">
                                        {inspection.customerPhone || "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/[0.05] grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                                        <Calendar className="w-3 h-3 inline mr-1 pb-0.5" /> Inspection Date
                                    </span>
                                    <span className="text-xs sm:text-sm text-[#16acd4] font-bold">
                                        {inspection.inspectionDate
                                            ? new Date(inspection.inspectionDate).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })
                                            : "N/A"
                                        }
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
                                        <Clock className="w-3 h-3 inline mr-1 pb-0.5" /> Status
                                    </span>
                                    <span className="text-xs sm:text-sm text-emerald-400 font-bold uppercase italic tracking-wider">
                                        {inspection.status}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Uploaded Vehicle Images Gallery */}
                {inspection.images && inspection.images.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                                <Camera className="w-5 h-5" />
                            </div>
                            <h2 className="text-base sm:text-lg font-black italic uppercase tracking-wider text-white">
                                Attached Vehicle Images ({inspection.images.length})
                            </h2>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {inspection.images.map((img: any, idx: number) => {
                                const imgSrc = img.preview || `/${img.imagePath}`
                                return (
                                    <div
                                        key={img.id || idx}
                                        onClick={() => setActiveImage(imgSrc)}
                                        className="group relative aspect-square rounded-2xl overflow-hidden bg-black/60 border border-white/10 hover:border-[#16acd4]/50 cursor-pointer transition-all shadow-sm"
                                    >
                                        <img
                                            src={imgSrc}
                                            alt={img.fileName || "Vehicle photo"}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 sm:p-2.5">
                                            <p className="text-[10px] font-black uppercase text-white truncate tracking-wide">
                                                {img.category ? img.category.replace(/_/g, ' ') : "Image"}
                                            </p>
                                        </div>
                                        <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Leakage Inspection Section */}
                {inspection.leakageResponses && inspection.leakageResponses.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                                <Droplets className="w-5 h-5" />
                            </div>
                            <h2 className="text-base sm:text-lg font-black italic uppercase tracking-wider text-white">
                                Leakage Inspection
                            </h2>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {inspection.leakageResponses.map((leak: any, idx: number) => (
                                <div
                                    key={leak.id || idx}
                                    className="p-3.5 rounded-xl bg-[#111318]/50 border border-white/[0.08] flex items-center justify-between"
                                >
                                    <span className="text-xs sm:text-sm font-medium text-zinc-300">
                                        {leak.leakageItem?.label || leak.label || "Leakage Item"}
                                    </span>
                                    <span
                                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                                            leak.found
                                                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                        }`}
                                    >
                                        {leak.found ? "Found" : "Not Found"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Inspector Comments */}
                {inspection.adminComments && (
                    <Card className="bg-[#111318]/60 border-white/[0.08] rounded-2xl overflow-hidden">
                        <CardHeader className="py-3 px-4 sm:px-6 bg-white/[0.02] border-b border-white/[0.05] flex flex-row items-center gap-3">
                            <MessageSquare className="w-4 h-4 text-[#16acd4]" />
                            <CardTitle className="text-sm font-black uppercase italic tracking-wider text-white">
                                Inspector Comments & Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <p className="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                {inspection.adminComments}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Inspection Checklist Sections */}
                <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/10" />
                        <h2 className="text-sm sm:text-base font-black italic uppercase tracking-[0.2em] text-zinc-400">
                            Checklist Results
                        </h2>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {inspection.groupedSections?.map((section: any) => (
                            <Card key={section.name} className="bg-[#111318]/40 border-white/[0.07] rounded-2xl overflow-hidden flex flex-col">
                                <div className="bg-white/[0.03] px-4 sm:px-5 py-3 border-b border-white/[0.05]">
                                    <h3 className="text-xs sm:text-sm font-black italic uppercase tracking-wider text-white/90">
                                        {section.name}
                                    </h3>
                                </div>
                                <CardContent className="p-0 flex-1">
                                    <div className="divide-y divide-white/[0.04]">
                                        {section.responses.map((resp: any) => (
                                            <div key={resp.id} className="p-3.5 sm:p-4 flex flex-col gap-2 hover:bg-white/[0.02] transition-colors">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-xs sm:text-sm font-medium text-zinc-300 uppercase tracking-wide break-words">
                                                        {resp.item?.label}
                                                    </span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className={`text-[10px] font-black italic uppercase tracking-tighter px-2 py-0.5 rounded border ${
                                                            resp.status === 'PASS' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' :
                                                            resp.status === 'FAIL' ? 'border-rose-500/20 text-rose-500 bg-rose-500/5' :
                                                            'border-amber-500/20 text-amber-500 bg-amber-500/5'
                                                        }`}>
                                                            {resp.status}
                                                        </span>
                                                        {getStatusIcon(resp.status)}
                                                    </div>
                                                </div>
                                                {resp.notes && (
                                                    <div className="bg-white/[0.02] p-2.5 rounded-lg border-l-2 border-amber-500/40 text-xs text-zinc-400 italic">
                                                        "{resp.notes}"
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Branded Footer */}
                <div className="w-full flex justify-center pt-6 pb-6 px-3">
                    <img
                        src="/uploads/branding/pdi-footer.jpg"
                        alt="Detailing Garage PDI Footer"
                        className="w-full max-w-3xl h-auto max-h-24 sm:max-h-36 object-contain rounded-xl opacity-90 invert hue-rotate-180"
                    />
                </div>
            </div>

            {/* Mobile Fixed Floating Bottom Action Bar */}
            <div className="sm:hidden fixed bottom-0 inset-x-0 p-3 bg-[#08090c]/95 backdrop-blur-lg border-t border-white/10 z-40 flex items-center justify-between gap-2 shadow-2xl">
                <Button
                    type="button"
                    onClick={downloadPdf}
                    disabled={pdfLoading}
                    className="flex-1 bg-[#16acd4] hover:bg-[#16acd4]/90 text-black font-black text-xs uppercase tracking-wider h-11 rounded-xl shadow-lg shadow-[#16acd4]/30 active:scale-95 transition-all"
                >
                    {pdfLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4 mr-2" />
                    )}
                    Download PDF
                </Button>
            </div>

            {/* Full-Screen Lightbox for Images */}
            {activeImage && (
                <div
                    onClick={() => setActiveImage(null)}
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img
                            src={activeImage}
                            alt="Inspection Photo Preview"
                            className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-white/20 shadow-2xl"
                        />
                        <button
                            type="button"
                            onClick={() => setActiveImage(null)}
                            className="absolute -top-3 -right-3 p-2 rounded-full bg-white text-black font-bold shadow-xl hover:bg-zinc-200 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
