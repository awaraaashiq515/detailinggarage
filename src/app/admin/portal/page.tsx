import { db } from "@/lib/db"
import { AllPagesPortalClient } from "@/components/admin/AllPagesPortalClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "All Pages Portal | Detailing Garage Admin",
    description: "Central quick-access launchpad for all modules, services, tools and settings.",
}

export default async function AdminPortalPage() {
    let pendingUsers = 0
    let totalUsers = 0
    let pdiCount = 0
    let invoicesCount = 0
    let claimsCount = 0
    let serviceInquiries = 0
    let shopsCount = 0

    try {
        totalUsers = await db.user.count()
        pendingUsers = await db.user.count({ where: { status: "PENDING" } })
    } catch (e) {
        // ignore fallback
    }

    try {
        pdiCount = await db.pDIInspection.count()
    } catch (e) {
        // ignore fallback
    }

    try {
        invoicesCount = await db.invoice.count()
    } catch (e) {
        // ignore fallback
    }

    try {
        claimsCount = await db.insuranceClaim.count()
    } catch (e) {
        // ignore fallback
    }

    try {
        serviceInquiries = await db.serviceInquiry.count()
    } catch (e) {
        // ignore fallback
    }

    try {
        shopsCount = await db.shop.count()
    } catch (e) {
        // ignore fallback
    }

    return (
        <div className="max-w-[1600px] mx-auto pb-12">
            <AllPagesPortalClient
                counts={{
                    pendingUsers,
                    totalUsers,
                    pdiCount,
                    invoicesCount,
                    claimsCount,
                    serviceInquiries,
                    shopsCount,
                }}
            />
        </div>
    )
}
