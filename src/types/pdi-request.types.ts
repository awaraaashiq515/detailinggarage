// PDI Request Types and Interfaces

export type PDIRequestStatus =
    | "PENDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ISSUES_FOUND"

export interface PDIRequestFormData {
    vehicleName: string
    vehicleModel: string
    location: string
    preferredDate?: string // ISO date string
    notes?: string
}

export interface PDIRequest {
    id: string
    userId: string
    packageId?: string

    // Vehicle Details
    vehicleName: string
    vehicleModel: string
    location: string
    preferredDate?: Date | string

    // Status and Notes
    status: PDIRequestStatus
    notes?: string
    adminNotes?: string
    adminMessage?: string

    // Link to PDI Inspection
    pdiInspectionId?: string

    // Timestamps
    createdAt: Date | string
    updatedAt: Date | string

    // Relations (optional, populated when needed)
    user?: {
        name: string
        email: string
    }
}

export interface PDIRequestWithUser extends PDIRequest {
    user: {
        name: string
        email: string
    }
}

export interface CreatePDIRequestInput {
    userId: string
    packageId?: string
    vehicleName: string
    vehicleModel: string
    location: string
    preferredDate?: Date
    notes?: string
}

export interface UpdatePDIRequestInput {
    status?: PDIRequestStatus
    adminNotes?: string
    adminMessage?: string
    pdiInspectionId?: string
}
