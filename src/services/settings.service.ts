// System Settings Service - Business Logic Layer

import { db as prisma } from "@/lib/db"

/**
 * Get system settings (creates default if not exists)
 */
export async function getSystemSettings() {
    let settings = await prisma.systemSettings.findFirst()

    // Create default settings if none exist
    if (!settings) {
        settings = await prisma.systemSettings.create({
            data: {
                packagesEnabled: true, // Default: packages are required
            },
        })
    }

    return settings
}

/**
 * Check if packages are currently enabled
 */
export async function arePackagesEnabled(): Promise<boolean> {
    const settings = await getSystemSettings()
    return settings.packagesEnabled
}

/**
 * Update package enabled status
 */
export async function updatePackagesEnabled(
    enabled: boolean,
    adminUserId?: string
) {
    const settings = await getSystemSettings()

    const updated = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
            packagesEnabled: enabled,
            updatedBy: adminUserId,
        },
    })

    return updated
}

/**
 * Update system settings
 */
export async function updateSystemSettings(
    updates: { packagesEnabled?: boolean },
    adminUserId?: string
) {
    const settings = await getSystemSettings()

    const updated = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
            ...updates,
            updatedBy: adminUserId,
        },
    })

    return updated
}
