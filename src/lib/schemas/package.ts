import { z } from "zod"

// Package types enum
export const PackageTypeEnum = z.enum(["PDI", "INSURANCE", "SERVICE"])
export type PackageType = z.infer<typeof PackageTypeEnum>

// Package status enum
export const PackageStatusEnum = z.enum(["ACTIVE", "INACTIVE"])
export type PackageStatus = z.infer<typeof PackageStatusEnum>

// User package status enum
export const UserPackageStatusEnum = z.enum(["ACTIVE", "EXHAUSTED", "CANCELLED"])
export type UserPackageStatus = z.infer<typeof UserPackageStatusEnum>

// Create package schema (admin)
export const createPackageSchema = z.object({
    name: z.string().min(1, "Package name is required").max(100, "Name too long"),
    type: PackageTypeEnum,
    description: z.string().min(1, "Description is required").max(500, "Description too long"),
    services: z.array(z.string().min(1)).min(1, "At least one service is required"),
    price: z.number().min(0, "Price must be positive"),
    pdiCount: z.number().int().min(1, "PDI count must be at least 1"),
    status: PackageStatusEnum.default("ACTIVE"),
})

export type CreatePackageInput = z.infer<typeof createPackageSchema>

// Update package schema (admin)
export const updatePackageSchema = createPackageSchema.partial()
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>

// Package query params
export const packageQuerySchema = z.object({
    type: PackageTypeEnum.optional(),
    status: PackageStatusEnum.optional(),
})

// Purchase package schema (client)
export const purchasePackageSchema = z.object({
    packageId: z.string().cuid("Invalid package ID"),
})

export type PurchasePackageInput = z.infer<typeof purchasePackageSchema>

// Package response type (for API responses)
export interface PackageResponse {
    id: string
    name: string
    type: PackageType
    description: string
    services: string[]
    price: number
    pdiCount: number
    status: PackageStatus
    createdAt: string
    updatedAt: string
}

// User package response type
export interface UserPackageResponse {
    id: string
    packageId: string
    purchasedAt: string
    pdiRemaining: number
    pdiUsed: number
    status: UserPackageStatus
    package: PackageResponse
}

