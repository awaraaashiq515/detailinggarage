"use client"

import { Suspense } from "react"
import { SuperAdminInvoiceForm } from "../../invoices/new/page"

export default function NewProformaPage() {
    return (
        <Suspense fallback={<div style={{ padding: 20, fontFamily: "Arial", color: "#888" }}>Loading Proforma Form...</div>}>
            <SuperAdminInvoiceForm defaultType="PROFORMA" defaultBackUrl="/super-admin/proformas" defaultLockType={true} />
        </Suspense>
    )
}
