"use client"

import { use, Suspense } from "react"
import { EditInvoiceForm } from "@/app/admin/invoices/[id]/edit/page"

export default function ShopEditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 text-sm">Loading invoice data...</div>}>
            <EditInvoiceForm id={id} basePath="/shop/billing/invoices" />
        </Suspense>
    )
}
