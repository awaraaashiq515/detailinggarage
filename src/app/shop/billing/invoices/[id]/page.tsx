"use client"

import { use, Suspense } from "react"
import { InvoiceDetailView } from "@/app/admin/invoices/[id]/page"

export default function ShopInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 text-sm">Loading invoice...</div>}>
            <InvoiceDetailView id={id} basePath="/shop/billing/invoices" />
        </Suspense>
    )
}
