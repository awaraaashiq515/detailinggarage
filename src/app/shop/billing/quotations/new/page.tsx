"use client"

import { Suspense } from "react"
import { AdminInvoiceForm } from "@/app/admin/invoices/new/page"

export default function NewShopQuotationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 text-sm">Loading...</div>}>
            <AdminInvoiceForm
                defaultType="QUOTATION"
                defaultBackUrl="/shop/billing/quotations"
                defaultLockType={true}
            />
        </Suspense>
    )
}
