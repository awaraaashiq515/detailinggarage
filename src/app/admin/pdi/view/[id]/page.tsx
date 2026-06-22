"use client"

import * as React from "react"
import {
    ClipboardCheck, ArrowLeft, Loader2, Calendar,
    Car, User, Fingerprint, MapPin, CheckCircle2,
    XCircle, AlertCircle, Clock, Edit, Download, RefreshCw, Mail
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PDIViewPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = React.use(paramsPromise)
    const id = params.id
    const [inspection, setInspection] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)
    const [pdfLoading, setPdfLoading] = React.useState(false)
    const [emailLoading, setEmailLoading] = React.useState(false)

    React.useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/admin/pdi/details/${id}`)
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()

                // Group responses by section
                const sectionsMap: Record<string, any> = {}
                data.responses.forEach((resp: any) => {
                    const sectionName = resp.item.section.name
                    if (!sectionsMap[sectionName]) {
                        sectionsMap[sectionName] = {
                            name: sectionName,
                            responses: []
                        }
                    }
                    sectionsMap[sectionName].responses.push(resp)
                })

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
                alert('PDF regenerated successfully!')
                window.location.reload()
            }
        } catch (err) {
            alert('Failed to regenerate PDF')
            console.error(err)
        } finally {
            setPdfLoading(false)
        }
    }

    const downloadPdf = () => {
        if (inspection?.pdfUrl) {
            window.open(inspection.pdfUrl, '_blank')
        } else {
            regeneratePdf()
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
            alert(`❌ Error: ${err.message}`)
            console.error(err)
        } finally {
            setEmailLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PASS": return <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            case "FAIL": return <XCircle className="w-5 h-5 text-rose-500" />
            case "WARN": return <AlertCircle className="w-5 h-5 text-amber-500" />
            default: return <Clock className="w-5 h-5 text-gray-500" />
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
                <p className="text-gray-400 font-medium animate-pulse uppercase tracking-widest">Retrieving Report Details...</p>
            </div>
        )
    }

    if (!inspection) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] text-center px-4">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-md">The inspection report you are looking for does not exist or has been removed.</p>
                <Link href="/admin/pdi">
                    <Button className="bg-white hover:bg-amber-500 text-black font-bold uppercase italic tracking-wider">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#08090c] text-white">
            {/* Branded Header */}
            <div className="w-full mb-8 flex justify-center pt-8">
                <img
                    src="/uploads/branding/pdi-header.jpg"
                    alt="Detailing Garage PDI Header"
                    className="w-full max-w-3xl h-auto object-contain rounded-xl opacity-90 invert hue-rotate-180"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20 space-y-12">
                {/* Header Actions */}
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <div className="flex items-center gap-6">
                        <Link href="/admin/pdi">
                            <button className="p-3 rounded-full hover:bg-white/5 text-gray-400 transition-all border border-white/5 hover:border-white/10">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 text-amber-500 text-sm font-black uppercase italic tracking-widest mb-1">
                                <ClipboardCheck className="w-4 h-4" />
                                Inspection Report Detail
                            </div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                                {inspection.vehicleMake} <span className="text-amber-500">{inspection.vehicleModel}</span>
                            </h1>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        {/* Action Buttons */}
                        <Link href={`/admin/pdi/edit/${id}`}>
                            <Button
                                variant="outline"
                                className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={downloadPdf}
                            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>
                        <Button
                            variant="outline"
                            onClick={regeneratePdf}
                            disabled={pdfLoading}
                            className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                        >
                            {pdfLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Regenerate PDF
                        </Button>
                        <Button
                            variant="outline"
                            onClick={sendManualEmail}
                            disabled={emailLoading || !inspection.customerEmail}
                            className={`border-amber-500/50 text-amber-500 hover:bg-amber-500/10 ${!inspection.customerEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={!inspection.customerEmail ? "Customer has no email address" : "Send report to customer via email"}
                        >
                            {emailLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Mail className="w-4 h-4 mr-2" />
                            )}
                            Send Email
                        </Button>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Vehicle Details */}
                    <Card className="bg-[#111318]/40 border-white/[0.08] rounded-none backdrop-blur-md">
                        <CardHeader className="border-b border-white/[0.05] flex flex-row items-center gap-4 py-4">
                            <Car className="w-5 h-5 text-amber-500" />
                            <CardTitle className="text-lg font-black italic uppercase tracking-wider text-white">Vehicle Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-2 gap-y-6">
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
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{item.label}</span>
                                    <span className="text-gray-200 font-medium">{item.value}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Customer & Meta */}
                    <Card className="bg-[#111318]/40 border-white/[0.08] rounded-none backdrop-blur-md">
                        <CardHeader className="border-b border-white/[0.05] flex flex-row items-center gap-4 py-4">
                            <User className="w-5 h-5 text-amber-500" />
                            <CardTitle className="text-lg font-black italic uppercase tracking-wider text-white">Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col gap-6">
                            <div>
                                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Full Name</span>
                                <span className="text-xl text-white font-bold">{inspection.customerName}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Email Address</span>
                                    <span className="text-gray-200">{inspection.customerEmail || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Phone Number</span>
                                    <span className="text-gray-200">{inspection.customerPhone || "N/A"}</span>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-white/[0.05] grid grid-cols-2 gap-6">
                                <div>
                                    <span className="block text items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                                        <Calendar className="w-3 h-3 inline pb-0.5" /> Inspection Date
                                    </span>
                                    <span className="text-amber-500 font-bold">
                                        {new Date(inspection.inspectionDate).toLocaleDateString('en-IN', {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                                        <Clock className="w-3 h-3 inline pb-0.5" /> Status
                                    </span>
                                    <span className="text-emerald-400 font-bold uppercase italic tracking-tighter">
                                        {inspection.status}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Inspection Results Sections */}
                <div className="space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        <h2 className="text-xl font-black italic uppercase tracking-[0.2em] text-gray-500">Inspection Results</h2>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                    </div>

                    <div className="columns-1 md:columns-2 gap-8 space-y-8">
                        {inspection.groupedSections.map((section: any) => (
                            <div key={section.name} className="break-inside-avoid">
                                <Card className="bg-[#111318]/20 border-white/[0.05] rounded-none overflow-hidden">
                                    <div className="bg-white/[0.02] px-6 py-4 border-b border-white/[0.05]">
                                        <h3 className="text-sm font-black italic uppercase tracking-widest text-white/70">{section.name}</h3>
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-white/[0.03]">
                                            {section.responses.map((resp: any) => (
                                                <div key={resp.id} className="p-5 flex flex-col gap-3 hover:bg-white/[0.01] transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-300 uppercase tracking-wide">{resp.item.label}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-[10px] font-black italic uppercase tracking-tighter px-2 py-0.5 rounded border ${resp.status === 'PASS' ? 'border-emerald-500/20 text-emerald-400' :
                                                                resp.status === 'FAIL' ? 'border-rose-500/20 text-rose-500' :
                                                                    'border-amber-500/20 text-amber-500'
                                                                }`}>
                                                                {resp.status}
                                                            </span>
                                                            {getStatusIcon(resp.status)}
                                                        </div>
                                                    </div>
                                                    {resp.notes && (
                                                        <div className="bg-white/[0.02] p-3 border-l-2 border-amber-500/30 text-xs text-gray-400 italic">
                                                            "{resp.notes}"
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Branded Footer */}
                <div className="w-full mt-20 flex justify-center pb-8">
                    <img
                        src="/uploads/branding/pdi-footer.jpg"
                        alt="Detailing Garage PDI Footer"
                        className="w-full max-w-3xl h-auto object-contain rounded-xl opacity-90 invert hue-rotate-180"
                    />
                </div>
            </div>
        </div>
    )
}
