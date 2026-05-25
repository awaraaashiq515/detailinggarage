// System Settings Types

export interface SystemSettings {
    id: string
    packagesEnabled: boolean
    updatedAt: Date | string
    updatedBy?: string
}

export interface UpdateSettingsInput {
    packagesEnabled?: boolean
}
