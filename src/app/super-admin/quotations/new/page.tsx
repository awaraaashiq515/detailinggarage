"use client"

import { Suspense } from "react"
import { SuperAdminInvoiceForm } from "../../invoices/new/page"

export default function NewQuotationPage() {
    return (
        <Suspense fallback={<div style={{ padding: 20, fontFamily: "Arial", color: "#888" }}>Loading Quotation Form...</div>}>
            <SuperAdminInvoiceForm defaultType="QUOTATION" defaultBackUrl="/super-admin/quotations" defaultLockType={true} />
        </Suspense>
    )
}

