'use server'

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"
import { revalidatePath } from "next/cache"
import { sendPDIRequestNotification } from "@/lib/services/email"

interface CreatePDIRequestInput {
    vehicleMake: string
    vehicleModel: string
    vehicleType: string
    location: string
    preferredDate?: string
    notes?: string
    mobile: string
}

export async function createPDIRequest(data: CreatePDIRequestInput) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return { error: "You must be logged in to submit a request." }
        }

        // Validate basic fields
        if (!data.vehicleMake || !data.vehicleModel || !data.location || !data.mobile) {
            return { error: "Please fill in all required fields." }
        }

        // Create the request
        const request = await db.pDIConfirmationRequest.create({
            data: {
                userId: user.userId,
                vehicleName: data.vehicleMake, // Mapping make to name as per schema
                vehicleModel: data.vehicleModel,
                location: data.location,
                preferredDate: data.preferredDate ? new Date(data.preferredDate) : undefined,
                notes: data.notes || '',
                status: "PENDING"
            }
        })


        // Send email notification to admin
        await sendPDIRequestNotification(request, user)

        revalidatePath('/admin/requests')
        revalidatePath('/client/requests')

        return { success: true, requestId: request.id }
    } catch (error) {
        console.error("Failed to create PDI request:", error)
        return { error: "Something went wrong. Please try again." }
    }
}
