import { z } from "zod"

export const DealerPackageTypeEnum = z.enum(["VEHICLE", "FEATURED", "COMBO", "BASIC", "PREMIUM", "ENTERPRISE", "CUSTOM"])
export type DealerPackageType = z.infer<typeof DealerPackageTypeEnum>

export const DealerPackageStatusEnum = z.enum(["ACTIVE", "INACTIVE"])
export type DealerPackageStatus = z.infer<typeof DealerPackageStatusEnum>

export const createDealerPackageSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    type: DealerPackageTypeEnum,
    description: z.string().max(500).optional().nullable(),
    price: z.number().min(0, "Price must be positive"),
    billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
    durationDays: z.number().int().min(1).default(30),
    maxVehicles: z.number().int().min(0),
    maxFeaturedCars: z.number().int().min(0).default(0),
    canAddVehicles: z.boolean().default(true),
    canFeatureVehicles: z.boolean().default(false),
    listingDuration: z.number().int().min(1).default(30),
    allowPriorityListing: z.boolean().default(false),
    allowAnalytics: z.boolean().default(true),
    allowBulkUpload: z.boolean().default(false),
    features: z.array(z.string()).optional().nullable(),
    status: DealerPackageStatusEnum.default("ACTIVE"),
    isPopular: z.boolean().default(false),
})

export type CreateDealerPackageInput = z.infer<typeof createDealerPackageSchema>

export const updateDealerPackageSchema = createDealerPackageSchema.partial()
export type UpdateDealerPackageInput = z.infer<typeof updateDealerPackageSchema>
