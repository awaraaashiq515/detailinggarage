export type PDIStatus = "PASS" | "FAIL" | "WARN" | "FOUND" | "NOT_FOUND"

// Image Categories for Vehicle Photos
export type ImageCategory =
    | 'FRONT_VIEW'
    | 'REAR_VIEW'
    | 'LEFT_SIDE'
    | 'RIGHT_SIDE'
    | 'INTERIOR'
    | 'DASHBOARD'
    | 'ENGINE'
    | 'BOOT_SPACE'
    | 'STEPNEY'
    | 'TYRE_FRONT_LEFT'
    | 'TYRE_FRONT_RIGHT'
    | 'TYRE_REAR_LEFT'
    | 'TYRE_REAR_RIGHT'
    | 'UNDERBODY'
    | 'OTHER'

export interface PDIImageData {
    id?: string
    category: ImageCategory
    imagePath: string
    fileName: string
    fileSize: number
    preview?: string
    tempId?: string // For tracking uploads before save
}

export interface PDIItem {
    id: string
    label: string
    order: number
}

export interface PDISection {
    id: string
    name: string
    order: number
    sectionType: string  // CHECKLIST, LEAKAGE, CONVENIENCE
    items: PDIItem[]
}

export interface PDIResponse {
    itemId: string
    status: PDIStatus
    notes: string
}

// Leakage inspection types
export interface PDILeakageItem {
    id: string
    label: string
    order: number
}

export interface PDILeakageResponse {
    leakageItemId: string
    found: boolean  // true = FOUND, false = NOT FOUND
    notes?: string
}

// Vehicle Damage Marker Types
export interface DamageMarker {
    id: string
    x: number  // X coordinate (percentage 0-100)
    y: number  // Y coordinate (percentage 0-100)
    type: DamageType
    code: DamageCode  // Short code for the damage type
    severity: DamageSeverity
    description?: string
    view: DamageView  // Which vehicle view this damage is on
}

// Exterior damage codes: D (Dent), S (Scratch), CH (Chip), CR (Crack)
// Interior damage codes: TR (Tear), ST (Stain), SC (Scratch), BR (Broken), NW (Not Working)
export type DamageCode =
    | 'D'    // Dent
    | 'S'    // Scratch
    | 'CH'   // Chip
    | 'CR'   // Crack
    | 'TR'   // Tear (Interior)
    | 'ST'   // Stain (Interior)
    | 'SC'   // Scratch (Interior)
    | 'BR'   // Broken (Interior)
    | 'NW'   // Not Working (Interior)
    | 'RS'   // Rust
    | 'MS'   // Missing
    | 'OT'   // Other

export type DamageType =
    | 'scratch'
    | 'dent'
    | 'crack'
    | 'chip'
    | 'rust'
    | 'paint-damage'
    | 'broken'
    | 'missing'
    | 'tear'
    | 'stain'
    | 'not-working'
    | 'other'

export type DamageSeverity = 'minor' | 'moderate' | 'major'

export type DamageView = 'top' | 'side' | 'interior' | 'boot'


export interface VehicleDamageData {
    markers: DamageMarker[]
    notes?: string
}

// Damage code mapping for display
export const DAMAGE_CODES: Record<DamageCode, { label: string; color: string; forViews: DamageView[] }> = {
    'D': { label: 'Dent', color: '#ef4444', forViews: ['top', 'side'] },
    'S': { label: 'Scratch', color: '#f97316', forViews: ['top', 'side'] },
    'CH': { label: 'Chip', color: '#eab308', forViews: ['top', 'side'] },
    'CR': { label: 'Crack', color: '#dc2626', forViews: ['top', 'side'] },
    'RS': { label: 'Rust', color: '#92400e', forViews: ['top', 'side'] },
    'TR': { label: 'Tear', color: '#7c3aed', forViews: ['interior', 'boot'] },
    'ST': { label: 'Stain', color: '#6366f1', forViews: ['interior', 'boot'] },
    'SC': { label: 'Scratch', color: '#f97316', forViews: ['interior', 'boot'] },
    'BR': { label: 'Broken', color: '#dc2626', forViews: ['interior', 'boot'] },
    'NW': { label: 'Not Working', color: '#6b7280', forViews: ['interior', 'boot'] },
    'MS': { label: 'Missing', color: '#374151', forViews: ['top', 'side', 'interior', 'boot'] },
    'OT': { label: 'Other', color: '#9ca3af', forViews: ['top', 'side', 'interior', 'boot'] },
}

// PDF Generation Types
export interface PDIReportData {
    inspection: {
        id: string
        vehicleMake: string
        vehicleModel: string
        vehicleColor: string
        vehicleYear?: string
        vin?: string
        engineNumber?: string
        odometer?: string
        customerName: string
        customerEmail?: string
        customerPhone?: string
        inspectionDate: string
        inspectedBy?: string
        adminComments?: string
        digitalSignature?: string
        customerSignature?: string
        status: string
    }
    sections: Array<{
        name: string
        sectionType: string
        items: Array<{
            label: string
            status: PDIStatus
            notes?: string
        }>
    }>
    leakageItems: Array<{
        label: string
        found: boolean
        notes?: string
    }>
    images?: Array<{
        id: string
        category: string
        imagePath: string
        fileName: string
    }>
    damageData?: VehicleDamageData
}
