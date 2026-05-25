"use client"

import { Suspense } from "react"
import { AdminInvoiceForm } from "../../invoices/new/page"

export default function NewQuotationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 text-sm">Loading...</div>}>
            <AdminInvoiceForm defaultType="QUOTATION" defaultBackUrl="/admin/quotations" defaultLockType={true} />
        </Suspense>
    )
}

