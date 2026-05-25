"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PDISection, PDIStatus, VehicleDamageData, PDILeakageItem, PDILeakageResponse, PDIImageData } from "./pdi-types"
import { PDISectionComponent } from "./pdi-section"
import { LeakageInspection } from "./leakage-inspection"
import { VehicleDamageMarker } from "./vehicle-damage-marker"
import { VehicleImageUpload } from "./vehicle-image-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, FileText, Car, User, Wrench, Droplets, AlertCircle, CheckCircle2 } from "lucide-react"

// Define User Type
interface ClientUser {
    id: string
    name: string
    email: string
    mobile: string
}

// Form Schema - All mandatory fields as per requirements
const formSchema = z.object({
    // Customer Details
    customerName: z.string().min(1, "Customer Name is required"),
    customerPhone: z.string().min(1, "Mobile Number is required"),
    customerEmail: z.string().email("Invalid email").optional().or(z.literal('')),

    // Vehicle Details
    vehicleMake: z.string().min(1, "Vehicle Make is required"),
    vehicleModel: z.string().min(1, "Vehicle Model is required"),
    vehicleColor: z.string().min(1, "Vehicle Color is required"),
    vehicleYear: z.string().min(1, "Manufacturing Year is required"),
    engineNumber: z.string().min(1, "Engine Number is required"),
    vin: z.string().min(1, "Chassis Number is required"),
    odometer: z.string().min(1, "Odometer Reading is required"),

    // Inspection Details
    inspectedBy: z.string().optional().or(z.literal('')),
    adminComments: z.string().optional(),
    inspectionDate: z.string().optional(),
    digitalSignature: z.string().optional(),
    customerSignature: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface PDIFormProps {
    inspectionId?: string
    initialData?: any
}

export function PDIForm({ inspectionId, initialData }: PDIFormProps = {}) {
    const router = useRouter()
    const isEditMode = Boolean(inspectionId && initialData)
    const [sections, setSections] = React.useState<PDISection[]>([])
    const [leakageItems, setLeakageItems] = React.useState<PDILeakageItem[]>([])
    const [loading, setLoading] = React.useState(true)
    const [submitting, setSubmitting] = React.useState(false)
    const [submitSuccess, setSubmitSuccess] = React.useState(false)

    // Store PDI responses
    const [responses, setResponses] = React.useState<Record<string, { status: PDIStatus; notes: string }>>({})
    const [leakageResponses, setLeakageResponses] = React.useState<Record<string, PDILeakageResponse>>({})
    const [damageData, setDamageData] = React.useState<VehicleDamageData>({ markers: [] })
    const [vehicleImages, setVehicleImages] = React.useState<PDIImageData[]>([])
    const [clients, setClients] = React.useState<ClientUser[]>([])
    const [loadingClients, setLoadingClients] = React.useState(false)
    const [selectedUserId, setSelectedUserId] = React.useState<string>("")

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerName: initialData?.customerName || "",
            customerPhone: initialData?.customerPhone || "",
            customerEmail: initialData?.customerEmail || "",
            vehicleMake: initialData?.vehicleMake || "",
            vehicleModel: initialData?.vehicleModel || "",
            vehicleColor: initialData?.vehicleColor || "",
            vehicleYear: initialData?.vehicleYear || "",
            engineNumber: initialData?.engineNumber || "",
            vin: initialData?.vin || "",
            odometer: initialData?.odometer || "",
            inspectedBy: initialData?.inspectedBy || "",
            adminComments: initialData?.adminComments || "",
            inspectionDate: initialData?.inspectionDate
                ? new Date(initialData.inspectionDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            digitalSignature: initialData?.digitalSignature || "",
            customerSignature: initialData?.customerSignature || "",
        },
    })

    // Fetch PDI structure and leakage items
    React.useEffect(() => {
        async function loadData() {
            try {
                const [structureRes, leakageRes] = await Promise.all([
                    fetch('/api/pdi/structure'),
                    fetch('/api/pdi/leakage-items')
                ])

                if (structureRes.ok) {
                    const data = await structureRes.json()
                    setSections(data)
                }

                if (leakageRes.ok) {
                    const data = await leakageRes.json()
                    setLeakageItems(data)
                }

                // If editing, populate responses from initialData
                if (initialData?.responses) {
                    const respMap: Record<string, { status: PDIStatus; notes: string }> = {}
                    initialData.responses.forEach((r: any) => {
                        respMap[r.itemId || r.item?.id] = { status: r.status, notes: r.notes || '' }
                    })
                    setResponses(respMap)
                }

                if (initialData?.leakageResponses) {
                    const leakMap: Record<string, PDILeakageResponse> = {}
                    initialData.leakageResponses.forEach((r: any) => {
                        const itemId = r.leakageItemId || r.leakageItem?.id
                        leakMap[itemId] = { leakageItemId: itemId, found: r.found, notes: r.notes }
                    })
                    setLeakageResponses(leakMap)
                }

                if (initialData?.vehicleDamageData) {
                    try {
                        setDamageData(JSON.parse(initialData.vehicleDamageData))
                    } catch (e) {
                        console.error('Failed to parse damage data')
                    }
                }

                // Load existing images if in edit mode
                if (initialData?.images) {
                    setVehicleImages(initialData.images.map((img: any) => ({
                        id: img.id,
                        category: img.category,
                        imagePath: img.imagePath,
                        fileName: img.fileName,
                        fileSize: img.fileSize,
                        preview: `/${img.imagePath}`
                    })))
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }

            // Fetch clients separately (non-blocking for form)
            try {
                setLoadingClients(true)
                const clientRes = await fetch('/api/admin/users?role=CLIENT')
                if (clientRes.ok) {
                    const data = await clientRes.json()
                    setClients(data.users.filter((u: any) => u.role === 'CLIENT' || u.role === 'USER'))
                }
            } catch (err) {
                console.error('Failed to load clients:', err)
            } finally {
                setLoadingClients(false)
            }
        }
        loadData()
    }, [])

    const handleItemChange = React.useCallback((itemId: string, status: PDIStatus, notes: string) => {
        setResponses(prev => ({
            ...prev,
            [itemId]: { status, notes }
        }))
    }, [])

    const handleSelectAllY = React.useCallback(() => {
        setResponses(prev => {
            const next = { ...prev }
            sections.forEach(section => {
                section.items.forEach(item => {
                    next[item.id] = {
                        status: "PASS" as PDIStatus,
                        notes: prev[item.id]?.notes || ""
                    }
                })
            })
            return next
        })
    }, [sections])

    const handleLeakageChange = React.useCallback((itemId: string, found: boolean, notes?: string) => {
        setLeakageResponses(prev => ({
            ...prev,
            [itemId]: { leakageItemId: itemId, found, notes }
        }))
    }, [])

    async function onSubmit(data: FormValues) {
        setSubmitting(true)
        try {
            // Transform responses to array for API
            const responsesArray = Object.entries(responses).map(([itemId, val]) => ({
                itemId,
                status: val.status,
                notes: val.notes
            }))

            const leakageArray = Object.entries(leakageResponses).map(([itemId, val]) => ({
                leakageItemId: itemId,
                found: val.found,
                notes: val.notes || ""
            }))

            const payload = {
                ...data,
                responses: responsesArray,
                leakageResponses: leakageArray,
                vehicleDamageData: JSON.stringify(damageData),
                images: vehicleImages.map(img => ({
                    category: img.category,
                    imagePath: img.imagePath,
                    fileName: img.fileName,
                    fileSize: img.fileSize
                })),
                userId: selectedUserId || null
            }

            const url = isEditMode ? `/api/admin/pdi/update/${inspectionId}` : '/api/pdi/save'
            const method = isEditMode ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.message || errorData.error || 'Failed to save')
            }

            const result = await res.json()
            setSubmitSuccess(true)

            // Redirect to the PDI view page after success
            setTimeout(() => {
                router.push(`/admin/pdi/view/${result.id}`)
            }, 1500)

        } catch (error: any) {
            console.error(error)
            alert(`Error: ${error.message || "Failed to save PDI Inspection"}`)
        } finally {
            setSubmitting(false)
        }
    }

    // Calculate overall progress
    const totalChecklistItems = sections.reduce((sum, s) => sum + s.items.length, 0)
    const answeredChecklistItems = Object.keys(responses).length
    const totalLeakageItems = leakageItems.length
    const answeredLeakageItems = Object.keys(leakageResponses).length

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-accent" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading PDI Structure...</p>
                </div>
            </div>
        )
    }

    if (submitSuccess) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{isEditMode ? 'PDI Updated Successfully!' : 'PDI Saved Successfully!'}</h2>
                        <p className="text-slate-500 font-medium mt-1">Redirecting to report view...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            <div className="max-w-[1800px] mx-auto px-4 lg:px-8">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 mb-8 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Title & Progress */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">{isEditMode ? 'Edit PDI Inspection' : 'Pre-Delivery Inspection'}</h1>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">{isEditMode ? 'Modify inspection details' : 'Professional Vehicle Assessment'}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100 shadow-inner">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Checklist</span>
                                <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent transition-all duration-700 ease-out"
                                        style={{ width: `${totalChecklistItems > 0 ? (answeredChecklistItems / totalChecklistItems) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-900 font-black font-mono">{answeredChecklistItems}/{totalChecklistItems}</span>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100 shadow-inner">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Leakage</span>
                                <div className="w-20 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-slate-400 transition-all duration-700 ease-out"
                                        style={{ width: `${totalLeakageItems > 0 ? (answeredLeakageItems / totalLeakageItems) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-900 font-black font-mono">{answeredLeakageItems}/{totalLeakageItems}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={submitting}
                                className="bg-accent text-white hover:bg-accent/90 font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-2xl shadow-lg shadow-accent/25 transition-all active:scale-95"
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isEditMode ? 'Update Inspection' : 'Save Inspection'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                        {/* Customer & Vehicle Details - Compact Grid */}
                        <div className="grid gap-6 lg:grid-cols-2">

                            {/* Customer Details Card */}
                            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
                                <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                                            <User className="w-5 h-5 text-accent" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Customer Details</h3>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    {/* Select Existing Client */}
                                    {!isEditMode && (
                                        <div className="pb-6 border-b border-slate-100 space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-accent" />
                                                Select Existing Client (Optional)
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    const client = clients.find(c => c.id === value)
                                                    if (client) {
                                                        setSelectedUserId(client.id)
                                                        form.setValue("customerName", client.name)
                                                        form.setValue("customerPhone", client.mobile || "")
                                                        form.setValue("customerEmail", client.email || "")
                                                    } else if (value === "new") {
                                                        setSelectedUserId("")
                                                        form.setValue("customerName", "")
                                                        form.setValue("customerPhone", "")
                                                        form.setValue("customerEmail", "")
                                                    }
                                                }}
                                                value={selectedUserId || (selectedUserId === "" ? "new" : undefined)}
                                            >
                                                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:ring-accent/20 rounded-2xl font-bold">
                                                    <SelectValue placeholder="Search or select a client..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-slate-200 text-slate-900 max-h-[300px] rounded-2xl shadow-2xl">
                                                    <SelectItem value="new" className="font-black text-accent focus:bg-accent/5">
                                                        + Create New Client
                                                    </SelectItem>
                                                    {clients.map((client) => (
                                                        <SelectItem key={client.id} value={client.id} className="focus:bg-slate-50">
                                                            <div className="flex flex-col items-start py-0.5">
                                                                <span className="font-bold">{client.name}</span>
                                                                <span className="text-[10px] text-slate-400 font-medium">{client.email || client.mobile}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-slate-400 italic px-2">Selecting an existing client will auto-fill the details below.</p>
                                        </div>
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="customerName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                    Customer Name <span className="text-accent">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter customer name"
                                                        {...field}
                                                        className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-accent/40 focus:ring-4 focus:ring-accent/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="customerPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                        Mobile Number <span className="text-accent">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter mobile"
                                                            {...field}
                                                            className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-accent/40 focus:ring-4 focus:ring-accent/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="customerEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                        Email Address
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter email"
                                                            type="email"
                                                            {...field}
                                                            className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-accent/40 focus:ring-4 focus:ring-accent/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Details Card */}
                            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
                                <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                            <Car className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Vehicle Details</h3>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="vehicleMake"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Make <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Toyota"
                                                            {...field}
                                                            className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="vehicleModel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Model <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Camry"
                                                            {...field}
                                                            className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="vehicleColor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Color <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Black"
                                                            {...field}
                                                            className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="vehicleYear"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Year <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="2024"
                                                            {...field}
                                                            className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="engineNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Engine No. <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Engine number"
                                                            {...field}
                                                            className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="vin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Chassis No. <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Chassis number"
                                                            {...field}
                                                            className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="odometer"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Odometer <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="0"
                                                            {...field}
                                                            className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inspection Checklist - Multi-Column Layout */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="p-2.5 rounded-2xl bg-accent shadow-lg shadow-accent/20">
                                        <Wrench className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-[0.15em] text-slate-900">Inspection Checklist</h2>
                                    <div className="hidden sm:block flex-1 h-px bg-slate-200" />
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleSelectAllY}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] px-5 h-11 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Mark All Y
                                </Button>
                            </div>
                            {/* 3-Column Grid for Sections */}
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {sections.map((section) => (
                                    <PDISectionComponent
                                        key={section.id}
                                        section={section}
                                        responses={responses}
                                        onItemChange={handleItemChange}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Leakage Inspection */}
                        {leakageItems.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-2xl bg-blue-400 shadow-lg shadow-blue-400/20">
                                        <Droplets className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-[0.15em] text-slate-900">Leakage Inspection</h2>
                                    <div className="flex-1 h-px bg-slate-200" />
                                </div>
                                <LeakageInspection
                                    items={leakageItems}
                                    responses={leakageResponses}
                                    onChange={handleLeakageChange}
                                />
                            </div>
                        )}

                        {/* Vehicle Damage Marking Section */}
                        <VehicleDamageMarker
                            damageData={damageData}
                            onChange={setDamageData}
                        />

                        {/* Vehicle Images Section */}
                        <VehicleImageUpload
                            images={vehicleImages}
                            onChange={setVehicleImages}
                        />

                        {/* Comments / Recommendations Section */}
                        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                        <FileText className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Comments / Recommendations</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <FormField
                                    control={form.control}
                                    name="adminComments"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Add any recommendations, observations, or important notes for the customer..."
                                                    {...field}
                                                    className="min-h-[150px] bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500/40 focus:ring-4 focus:ring-purple-500/5 rounded-2xl p-4 font-bold resize-none transition-all placeholder:text-slate-300"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Signatures Section - matching PDF requirements */}
                        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                        <FileText className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Signatures & Name (Optional)</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-[10px] text-orange-600 font-bold mb-8 flex items-center gap-3 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    Note: These fields can be left blank if you prefer to sign the report manually after printing.
                                </p>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <FormField
                                        control={form.control}
                                        name="digitalSignature"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                    Vehicle Inspected By (Signature)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Inspector signature/name"
                                                        {...field}
                                                        className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-orange-500/40 focus:ring-4 focus:ring-orange-500/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs font-bold" />
                                           </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="customerSignature"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                    Customer Signature
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Customer signature/name"
                                                        {...field}
                                                        className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-orange-500/40 focus:ring-4 focus:ring-orange-500/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs font-bold" />
                                           </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="customerName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                    Customer Name (Verification)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter customer name"
                                                        {...field}
                                                        className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-orange-500/40 focus:ring-4 focus:ring-orange-500/5 rounded-2xl font-bold transition-all placeholder:text-slate-300"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-8 border-t border-slate-200">
                            <Button
                                type="submit"
                                disabled={submitting}
                                size="lg"
                                className="w-full md:w-auto h-16 px-16 text-[10px] bg-accent text-white hover:bg-accent/90 font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-accent/40 active:scale-95 transition-all"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-3 h-6 w-6" />
                                        {isEditMode ? 'Update & Save Changes' : 'Complete & Save Inspection'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
