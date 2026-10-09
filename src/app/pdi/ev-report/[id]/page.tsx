"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { EVReportView } from "@/components/pdi/ev/ev-report-view"

export default function PublicEVPDIReportPage() {
    const params = useParams()
    const id = params.id as string

    return <EVReportView id={id} isPublic={true} />
}
