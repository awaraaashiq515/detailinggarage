import { getCurrentUser } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { ShopAppLauncher } from "@/components/shop/shop-app-launcher"

export const dynamic = "force-dynamic"

export default async function ShopBillingDashboard() {
    const user = await getCurrentUser()
    if (!user) redirect("/login")

    let shopId: string | null = null
    let shopName = "My Workshop"

    if (user.role === "SHOP_OWNER") {
        const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
        if (!shop || shop.status !== "ACTIVE") redirect("/unauthorized")
        shopId = shop.id
        shopName = shop.name
    }

    const whereClause = shopId ? { shopId } : {}
    const today = new Date().toISOString().split("T")[0]

    const [
        invoices,
        quotations,
        clientsCount,
        servicesCount,
        inventoryCount,
        allDocs,
        staffCount,
        activeJobs,
        todayStaffList,
        pdiCount,
        evPdiCount,
        insuranceCount,
        evInsuranceCount
    ] = await Promise.all([
        db.invoice.findMany({
            where: { ...whereClause, type: "INVOICE" },
            include: { client: true },
            orderBy: { date: "desc" },
            take: 6
        }).catch(() => []),
        db.invoice.findMany({
            where: { ...whereClause, type: "QUOTATION" },
            include: { client: true },
            orderBy: { date: "desc" },
            take: 5
        }).catch(() => []),
        db.billingClient.count({ where: whereClause }).catch(() => 0),
        db.billingItem.count({ where: { ...whereClause, type: "SERVICE" } }).catch(() => 0),
        db.billingItem.count({ where: { ...whereClause, type: "PRODUCT" } }).catch(() => 0),
        db.invoice.findMany({ where: whereClause }).catch(() => []),
        (db as any).shopStaff ? (db as any).shopStaff.count({ where: whereClause }).catch(() => 0) : Promise.resolve(0),
        (db as any).staffJobCard ? (db as any).staffJobCard.findMany({
            where: { ...whereClause, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
            include: { staff: true },
            orderBy: { updatedAt: "desc" },
            take: 6
        }).catch(() => []) : Promise.resolve([]),
        (db as any).shopStaff ? (db as any).shopStaff.findMany({
            where: whereClause,
            include: {
                attendance: {
                    where: { date: today },
                    take: 1
                }
            },
            orderBy: { createdAt: "desc" },
            take: 10
        }).catch(() => []) : Promise.resolve([]),
        (db as any).pDIInspection ? (db as any).pDIInspection.count({ where: whereClause }).catch(() => 0) : Promise.resolve(0),
        (db as any).eVPDIInspection ? (db as any).eVPDIInspection.count({ where: whereClause }).catch(() => 0) : Promise.resolve(0),
        (db as any).insuranceClaim ? (db as any).insuranceClaim.count({ where: whereClause }).catch(() => 0) : Promise.resolve(0),
        (db as any).insuranceClaim ? (db as any).insuranceClaim.count({ where: { ...whereClause, isEv: true } }).catch(() => 0) : Promise.resolve(0)
    ])

    const totalRevenue = allDocs
        .filter((i: any) => i.type === "INVOICE" && i.status === "PAID")
        .reduce((s: number, i: any) => s + (i.grandTotal || 0), 0)

    const totalOutstanding = allDocs
        .filter((i: any) => i.type === "INVOICE" && i.status !== "PAID" && i.status !== "CANCELLED")
        .reduce((s: number, i: any) => s + ((i.grandTotal || 0) - (i.amountPaid || 0)), 0)

    const totalQuotationsCount = allDocs.filter((i: any) => i.type === "QUOTATION").length
    const totalInvoicesCount = allDocs.filter((i: any) => i.type === "INVOICE").length

    const presentStaffCount = todayStaffList.filter(
        (s: any) => s.attendance && s.attendance.length > 0 && s.attendance[0].status === "PRESENT"
    ).length

    const uniqueVehiclesSet = new Set(
        allDocs.map((i: any) => i.vehicleRegNo?.trim().toUpperCase()).filter(Boolean)
    )
    const vehiclesCount = uniqueVehiclesSet.size > 0 ? uniqueVehiclesSet.size : clientsCount

    return (
        <div className="min-h-full py-4 sm:py-6 px-3 sm:px-6">
            <ShopAppLauncher
                shopName={shopName}
                userName={user.name}
                totalRevenue={totalRevenue}
                totalOutstanding={totalOutstanding}
                totalInvoicesCount={totalInvoicesCount}
                totalQuotationsCount={totalQuotationsCount}
                clientsCount={clientsCount}
                servicesCount={servicesCount}
                inventoryCount={inventoryCount}
                staffCount={staffCount}
                presentStaffCount={presentStaffCount}
                activeJobsCount={activeJobs.length}
                vehiclesCount={vehiclesCount}
                pdiCount={pdiCount}
                evPdiCount={evPdiCount}
                insuranceCount={insuranceCount}
                evInsuranceCount={evInsuranceCount}
                activeJobs={activeJobs}
                recentInvoices={invoices}
            />
        </div>
    )
}
