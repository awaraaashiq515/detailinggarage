"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { PDIForm } from "@/components/pdi/pdi-form"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PDIEditPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = React.use(paramsPromise)
    const id = params.id
    const [inspection, setInspection] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        async function fetchInspection() {
            try {
                const res = await fetch(`/api/admin/pdi/details/${id}`)
                if (!res.ok) {
                    throw new Error('Failed to fetch inspection')
                }
                const data = await res.json()
                setInspection(data)
            } catch (err: any) {
                setError(err.message || 'Failed to load inspection')
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchInspection()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#08090c] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                    <p className="text-gray-400">Loading inspection data...</p>
                </div>
            </div>
        )
    }

    if (error || !inspection) {
        return (
            <div className="min-h-screen bg-[#08090c] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Failed to Load Inspection</h2>
                    <p className="text-gray-500 max-w-md">{error || 'Inspection not found'}</p>
                    <Link href="/admin/pdi">
                        <Button className="mt-4">
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            Back to Inspections
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#08090c]">
            <PDIForm inspectionId={id} initialData={inspection} />
        </div>
    )
}
