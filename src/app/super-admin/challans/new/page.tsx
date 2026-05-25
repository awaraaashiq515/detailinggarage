"use client"

import { Suspense } from "react"
import { SuperAdminInvoiceForm } from "../../invoices/new/page"

export default function NewChallanPage() {
    return (
        <Suspense fallback={<div style={{ padding: 20, fontFamily: "Arial", color: "#888" }}>Loading Challan Form...</div>}>
            <SuperAdminInvoiceForm defaultType="CHALLAN" defaultBackUrl="/super-admin/challans" defaultLockType={true} />
        </Suspense>
    )
}
