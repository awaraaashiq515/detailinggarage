"use server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"
import { revalidatePath } from "next/cache"

// Type for navigation link
export interface NavigationLink {
    label: string
    href: string
    isExternal: boolean
}

// Type for header settings
export interface HeaderSettingsData {
    id?: string
    brandName: string
    brandNameAccent: string
    logoImageUrl: string | null
    useLogo: boolean
    primaryColor: string
    accentColor: string
    textColor: string
    navigationLinks: NavigationLink[]
    loginButtonText: string
    ctaButtonText: string
    ctaButtonLink: string
    dashboardButtonText: string
    siteTitle: string
    siteDescription: string
}

// Default header settings
const defaultSettings: HeaderSettingsData = {
    brandName: "Detailing",
    brandNameAccent: "Garage",
    logoImageUrl: null,
    useLogo: false,
    primaryColor: "#16acd4",
    accentColor: "#ff6b35",
    textColor: "#6b7080",
    navigationLinks: [
        { label: "Services", href: "#services", isExternal: false },
        { label: "Marketplace", href: "/marketplace", isExternal: false },
        { label: "PDI", href: "/pdi", isExternal: false },
        { label: "How It Works", href: "#how-it-works", isExternal: false },
        { label: "About", href: "#about", isExternal: false },
        { label: "Contact", href: "#contact", isExternal: false },
    ],
    loginButtonText: "Log In",
    ctaButtonText: "Get Started",
    ctaButtonLink: "/register",
    dashboardButtonText: "Dashboard",
    siteTitle: "DetailingGarage – Premium Car Care",
    siteDescription: "All car services in one place. Book repairs, detailing, PDI inspections, and more.",
}

/**
 * Get public header settings for rendering navbar
 * No authentication required
 */
export async function getPublicHeaderSettings(): Promise<HeaderSettingsData> {
    try {
        const startTime = Date.now()
        const settings = await db.headerSettings.findFirst()
        const duration = Date.now() - startTime

        if (duration > 1000) {
            console.warn(`[HeaderSettings] Slow query: ${duration}ms`)
        }

        if (!settings) {
            return defaultSettings
        }

        const parsedLinks = JSON.parse(settings.navigationLinks) as NavigationLink[]

        // Always ensure Marketplace link exists in nav
        const hasMarketplace = parsedLinks.some(l => l.href === "/marketplace")
        const navLinks = hasMarketplace
            ? parsedLinks
            : [parsedLinks[0], { label: "Marketplace", href: "/marketplace", isExternal: false }, ...parsedLinks.slice(1)]

        return {
            id: settings.id,
            brandName: settings.brandName,
            brandNameAccent: settings.brandNameAccent,
            logoImageUrl: settings.logoImageUrl,
            useLogo: settings.useLogo,
            primaryColor: settings.primaryColor,
            accentColor: settings.accentColor,
            textColor: settings.textColor,
            navigationLinks: navLinks,
            loginButtonText: settings.loginButtonText,
            ctaButtonText: settings.ctaButtonText,
            ctaButtonLink: settings.ctaButtonLink,
            dashboardButtonText: settings.dashboardButtonText,
            siteTitle: settings.siteTitle,
            siteDescription: settings.siteDescription,
        }
    } catch (error) {
        console.error("Error fetching header settings:", error)
        return defaultSettings
    }
}

/**
 * Get header settings for admin editing
 * Requires admin authentication
 */
export async function getAdminHeaderSettings(): Promise<{ success: boolean; data?: HeaderSettingsData; error?: string }> {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" }
        }

        const settings = await getPublicHeaderSettings()
        return { success: true, data: settings }
    } catch (error) {
        console.error("Error fetching admin header settings:", error)
        return { success: false, error: "Failed to fetch header settings" }
    }
}

/**
 * Update header settings
 * Requires admin authentication
 */
export async function updateHeaderSettings(
    data: Omit<HeaderSettingsData, "id">
): Promise<{ success: boolean; data?: HeaderSettingsData; error?: string }> {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" }
        }

        // Validate navigation links
        if (!Array.isArray(data.navigationLinks)) {
            return { success: false, error: "Invalid navigation links format" }
        }

        // Validate colors are hex format
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        if (!hexColorRegex.test(data.primaryColor)) {
            return { success: false, error: "Invalid primary color format" }
        }
        if (!hexColorRegex.test(data.accentColor)) {
            return { success: false, error: "Invalid accent color format" }
        }
        if (!hexColorRegex.test(data.textColor)) {
            return { success: false, error: "Invalid text color format" }
        }

        // Check if settings exist
        const existingSettings = await db.headerSettings.findFirst()

        const settingsData = {
            brandName: data.brandName,
            brandNameAccent: data.brandNameAccent,
            logoImageUrl: data.logoImageUrl,
            useLogo: data.useLogo,
            primaryColor: data.primaryColor,
            accentColor: data.accentColor,
            textColor: data.textColor,
            navigationLinks: JSON.stringify(data.navigationLinks),
            loginButtonText: data.loginButtonText,
            ctaButtonText: data.ctaButtonText,
            ctaButtonLink: data.ctaButtonLink,
            dashboardButtonText: data.dashboardButtonText,
            siteTitle: data.siteTitle,
            siteDescription: data.siteDescription,
            updatedBy: user.userId,
        }

        let updatedSettings

        if (existingSettings) {
            updatedSettings = await db.headerSettings.update({
                where: { id: existingSettings.id },
                data: settingsData,
            })
        } else {
            updatedSettings = await db.headerSettings.create({
                data: settingsData,
            })
        }

        // Revalidate pages that use header settings
        revalidatePath("/")
        revalidatePath("/admin/settings/header")

        return {
            success: true,
            data: {
                id: updatedSettings.id,
                brandName: updatedSettings.brandName,
                brandNameAccent: updatedSettings.brandNameAccent,
                logoImageUrl: updatedSettings.logoImageUrl,
                useLogo: updatedSettings.useLogo,
                primaryColor: updatedSettings.primaryColor,
                accentColor: updatedSettings.accentColor,
                textColor: updatedSettings.textColor,
                navigationLinks: JSON.parse(updatedSettings.navigationLinks) as NavigationLink[],
                loginButtonText: updatedSettings.loginButtonText,
                ctaButtonText: updatedSettings.ctaButtonText,
                ctaButtonLink: updatedSettings.ctaButtonLink,
                dashboardButtonText: updatedSettings.dashboardButtonText,
                siteTitle: updatedSettings.siteTitle,
                siteDescription: updatedSettings.siteDescription,
            },
        }
    } catch (error) {
        console.error("Error updating header settings:", error)
        return { success: false, error: "Failed to update header settings" }
    }
}

/**
 * Reset header settings to defaults
 * Requires admin authentication
 */
export async function resetHeaderSettings(): Promise<{ success: boolean; data?: HeaderSettingsData; error?: string }> {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" }
        }

        return await updateHeaderSettings(defaultSettings)
    } catch (error) {
        console.error("Error resetting header settings:", error)
        return { success: false, error: "Failed to reset header settings" }
    }
}
