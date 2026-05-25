// PDI Request Service - Business Logic Layer

import { db as prisma } from "@/lib/db"
import type {
    CreatePDIRequestInput,
    UpdatePDIRequestInput,
    PDIRequestStatus
} from "@/types/pdi-request.types"

/**
 * Create a new PDI request from a client
 */
export async function createPDIRequest(input: CreatePDIRequestInput) {
    const request = await prisma.pDIConfirmationRequest.create({
        data: {
            userId: input.userId,
            vehicleName: input.vehicleName,
            vehicleModel: input.vehicleModel,
            location: input.location,
            preferredDate: input.preferredDate,
            notes: input.notes || "",
            status: "PENDING",
        },
    })

    return request
}

/**
 * Get a single PDI request by ID
 */
export async function getPDIRequestById(requestId: string) {
    const request = await prisma.pDIConfirmationRequest.findUnique({
        where: { id: requestId },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    })

    return request
}

/**
 * Get all PDI requests for a specific user
 */
export async function getPDIRequestsByUserId(userId: string) {
    const requests = await prisma.pDIConfirmationRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    })

    return requests
}

/**
 * Get all PDI requests (admin view)
 */
export async function getAllPDIRequests(statusFilter?: PDIRequestStatus) {
    const requests = await prisma.pDIConfirmationRequest.findMany({
        where: statusFilter ? { status: statusFilter } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    })

    return requests
}

/**
 * Update PDI request status and admin notes
 */
export async function updatePDIRequest(
    requestId: string,
    updates: UpdatePDIRequestInput
) {
    const request = await prisma.pDIConfirmationRequest.update({
        where: { id: requestId },
        data: updates,
    })

    return request
}

/**
 * Link a completed PDI inspection to a request
 */
export async function linkPDIInspection(
    requestId: string,
    inspectionId: string
) {
    const request = await prisma.pDIConfirmationRequest.update({
        where: { id: requestId },
        data: {
            pdiInspectionId: inspectionId,
            status: "COMPLETED",
        },
    })

    return request
}

/**
 * Check if user has a pending PDI request
 */
export async function hasPendingRequest(userId: string): Promise<boolean> {
    const count = await prisma.pDIConfirmationRequest.count({
        where: {
            userId,
            status: "PENDING",
        },
    })

    return count > 0
}
