"use client"

import React from "react"
import { useParams } from "next/navigation"
import { EVInsuranceView } from "@/components/insurance/ev-insurance-view"

export default function AdminEVInsuranceViewPage() {
    const params = useParams()
    const id = params.id as string

    return <EVInsuranceView id={id} isShopPortal={false} />
}
