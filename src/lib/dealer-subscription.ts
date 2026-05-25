import { db } from "@/lib/db"

export interface DealerCapabilities {
    canAddVehicles: boolean
    canFeatureVehicles: boolean
    maxVehicles: number
    maxFeaturedCars: number
    subscriptionId: string | null
    packageName: string | null
    endDate: Date | null
}

/**
 * Returns the active dealer subscription capabilities.
 * Also auto-expires subscriptions that have passed their endDate.
 */
export async function getDealerCapabilities(dealerId: string): Promise<DealerCapabilities> {
    const now = new Date()

    // Auto-expire any subscriptions that have passed their end date
    const expiredResult = await db.dealerSubscription.updateMany({
        where: {
            dealerId,
            status: "ACTIVE",
            endDate: { lt: now },
        },
        data: { status: "EXPIRED" },
    })

    // check if we still have any active subscription
    const activeCount = await db.dealerSubscription.count({
        where: {
            dealerId,
            status: "ACTIVE",
            endDate: { gte: now },
        }
    })

    // Only deactivate vehicles if a subscription JUST expired AND there are no other active ones
    if (expiredResult.count > 0 && activeCount === 0) {
        await db.dealerVehicle.updateMany({
            where: { dealerId, status: "ACTIVE" },
            data: { status: "INACTIVE", isFeatured: false },
        })
    }

    // Get active subscription
    const subscription = await db.dealerSubscription.findFirst({
        where: {
            dealerId,
            status: "ACTIVE",
            endDate: { gte: now },
        },
        include: { package: true },
        orderBy: { endDate: "desc" },
    })

    if (!subscription) {
        console.log(`[SUBSCRIPTION_DEBUG] No active subscription found for dealer ${dealerId}. Now: ${now.toISOString()}`)
        return {
            canAddVehicles: false,
            canFeatureVehicles: false,
            maxVehicles: 0,
            maxFeaturedCars: 0,
            subscriptionId: null,
            packageName: null,
            endDate: null,
        }
    }

    console.log(`[SUBSCRIPTION_DEBUG] Found active sub ${subscription.id} for dealer ${dealerId}. Package: ${subscription.package.name}, canAdd: ${subscription.package.canAddVehicles}`)

    return {
        canAddVehicles: subscription.package.canAddVehicles,
        canFeatureVehicles: subscription.package.canFeatureVehicles,
        maxVehicles: subscription.package.maxVehicles,
        maxFeaturedCars: subscription.package.maxFeaturedCars,
        subscriptionId: subscription.id,
        packageName: subscription.package.name,
        endDate: subscription.endDate,
    }
}
