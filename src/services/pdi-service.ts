import { db as prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { sendWelcomeCredentialsEmail, sendPDIReportEmail } from "@/lib/services/email"
import { createPDIImagesDirectory } from "@/lib/utils/file-upload.utils"
import { rename } from "fs/promises"
import { join } from "path"

// Types for PDI Submission
export interface PDIResponseInput {
    itemId: string
    status: "PASS" | "FAIL" | "WARN"
    notes?: string
}

export interface PDILeakageResponseInput {
    leakageItemId: string
    found: boolean
    notes?: string
}

export interface PDIImageInput {
    category: string
    imagePath: string
    fileName: string
    fileSize: number
}

export interface PDIInspectionInput {
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
    userId?: string
    skipPackageDeduction?: boolean  // Set to true for admin-created PDIs

    inspectedBy?: string
    adminComments?: string
    vehicleDamageData?: string
    inspectionDate?: string

    responses: PDIResponseInput[]
    leakageResponses?: PDILeakageResponseInput[]
    images?: PDIImageInput[]
    digitalSignature?: string
    customerSignature?: string
}

/**
 * Fetches the complete PDI form structure (Sections -> Items)
 */
export async function getPDIStructure() {
    const sections = await (prisma as any).pDISection.findMany({
        include: {
            items: {
                orderBy: { order: 'asc' }
            }
        },
        orderBy: { order: 'asc' }
    })

    if (sections.length === 0) {
        console.log("PDI Structure empty, seeding defaults...")
        await seedPDIStructure()
        return await (prisma as any).pDISection.findMany({
            include: {
                items: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        })
    }

    return sections
}

/**
 * Fetches all leakage inspection items
 */
export async function getLeakageItems() {
    const items = await (prisma as any).pDILeakageItem.findMany({
        orderBy: { order: 'asc' }
    })

    if (items.length === 0) {
        console.log("Leakage items empty, seeding defaults...")
        await seedPDIStructure()
        return await (prisma as any).pDILeakageItem.findMany({
            orderBy: { order: 'asc' }
        })
    }

    return items
}

/**
 * Saves a new PDI Inspection Report with responses and leakage data
 */
export async function createPDIReport(data: PDIInspectionInput) {
    let welcomeEmailData: any = null

    return await prisma.$transaction(async (tx: any) => {
        let finalUserId = data.userId

        // 1. Identify or Create User
        // If userId is not provided, try to find user by email or phone
        if (!finalUserId && (data.customerEmail || data.customerPhone)) {
            const existingUser = await tx.user.findFirst({
                where: {
                    OR: [
                        ...(data.customerEmail ? [{ email: data.customerEmail }] : []),
                        ...(data.customerPhone ? [{ mobile: data.customerPhone }] : [])
                    ]
                }
            })

            if (existingUser) {
                finalUserId = existingUser.id
            } else if (data.customerEmail) {
                // User doesn't exist, auto-create them
                // We require at least an email to create an account
                const password = Math.random().toString(36).slice(-10) + "!" // Simple random password
                const hashedPassword = await bcrypt.hash(password, 12)

                const newUser = await tx.user.create({
                    data: {
                        email: data.customerEmail,
                        name: data.customerName,
                        mobile: data.customerPhone,
                        password: hashedPassword,
                        role: "CLIENT",
                        status: "APPROVED",
                        emailVerified: true // Set to true as admin created the report
                    }
                })
                finalUserId = newUser.id

                // Send welcome email with credentials (don't await to keep transaction fast, 
                // but wait, transaction might fail - better to send after transaction? 
                // Actually in Prisma transaction we can't reliably send email if it errors.
                // But we need the credentials. I'll pass them out of the transaction.)
                welcomeEmailData = { email: data.customerEmail, name: data.customerName, password }
            }
        }

        // 2. If userId is provided AND skipPackageDeduction is false, deduct from their package
        if (finalUserId && !data.skipPackageDeduction) {
            const userPackage = await tx.userPackage.findFirst({
                where: {
                    userId: data.userId,
                    status: "ACTIVE",
                    pdiRemaining: { gt: 0 }
                },
                orderBy: { purchasedAt: 'asc' }
            })

            if (userPackage) {
                // Deduct PDI only if package exists
                await tx.userPackage.update({
                    where: { id: userPackage.id },
                    data: {
                        pdiRemaining: { decrement: 1 },
                        pdiUsed: { increment: 1 },
                        status: userPackage.pdiRemaining <= 1 ? "EXHAUSTED" : "ACTIVE"
                    }
                })
            }
            // If no package, just continue without deduction (for admin-created PDIs)
        }

        // 2. Prepare inspection date
        const inspectionDate = data.inspectionDate
            ? new Date(data.inspectionDate)
            : new Date()

        // 3. Create the inspection report with responses
        const inspection = await tx.pDIInspection.create({
            data: {
                userId: finalUserId,
                vehicleMake: data.vehicleMake,
                vehicleModel: data.vehicleModel,
                vehicleColor: data.vehicleColor,
                vehicleYear: data.vehicleYear,
                vin: data.vin,
                engineNumber: data.engineNumber,
                odometer: data.odometer,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone,
                inspectedBy: data.inspectedBy,
                adminComments: data.adminComments,
                vehicleDamageData: data.vehicleDamageData,
                inspectionDate,
                status: "COMPLETED",
                digitalSignature: data.digitalSignature,
                customerSignature: data.customerSignature,
                responses: {
                    create: data.responses.map(res => ({
                        itemId: res.itemId,
                        status: res.status,
                        notes: res.notes || ""
                    }))
                }
            },
            include: {
                responses: true
            }
        })

        // Create leakage responses separately
        if (data.leakageResponses && data.leakageResponses.length > 0) {
            for (const lr of data.leakageResponses) {
                await tx.pDILeakageResponse.create({
                    data: {
                        inspectionId: inspection.id,
                        leakageItemId: lr.leakageItemId,
                        found: lr.found,
                        notes: lr.notes || ""
                    }
                })
            }
        }

        // Handle image uploads - move from temp to permanent location
        if (data.images && data.images.length > 0) {
            console.log(`📸 Processing ${data.images.length} images for PDI ${inspection.id}`)

            // Create permanent directory for this PDI
            const permanentDir = await createPDIImagesDirectory(inspection.id)
            console.log(`📁 Permanent dir: ${permanentDir}`)

            for (const img of data.images) {
                try {
                    // Normalize paths - replace backslashes with forward slashes
                    let imgPath = img.imagePath.replace(/\\/g, '/')

                    // Remove leading slash if present
                    if (imgPath.startsWith('/')) {
                        imgPath = imgPath.substring(1)
                    }

                    const tempFullPath = join(process.cwd(), 'public', imgPath)
                    const newRelativePath = `${permanentDir}/${img.fileName}`.replace(/\\/g, '/')
                    const newFullPath = join(process.cwd(), 'public', newRelativePath)

                    console.log(`📸 Moving: ${tempFullPath} → ${newFullPath}`)

                    // Try to move file, if fails try copy
                    try {
                        await rename(tempFullPath, newFullPath)
                    } catch (moveErr) {
                        console.log(`⚠️ Rename failed, file may already be in place`)
                    }

                    // Save image record to database with normalized path
                    await tx.pDIImage.create({
                        data: {
                            inspectionId: inspection.id,
                            category: img.category,
                            imagePath: newRelativePath,
                            fileName: img.fileName,
                            fileSize: img.fileSize
                        }
                    })
                    console.log(`✅ Saved image: ${img.fileName} (${img.category})`)
                } catch (err) {
                    console.error(`❌ Failed to process image ${img.fileName}:`, err)
                    // Continue with other images even if one fails
                }
            }
        }

        if (welcomeEmailData) {
            ; (inspection as any)._welcomeEmail = welcomeEmailData
        }

        return inspection
    }, {
        timeout: 15000
    }).then(async (inspection) => {
        // Handle post-transaction tasks like sending emails
        const email = inspection.customerEmail
        const name = inspection.customerName
        const vehicleInfo = `${inspection.vehicleMake} ${inspection.vehicleModel}`

        // 1. Send Welcome Email if needed
        if ((inspection as any)._welcomeEmail) {
            const { email: wEmail, name: wName, password } = (inspection as any)._welcomeEmail
            try {
                await sendWelcomeCredentialsEmail(wEmail, wName, password)
                console.log(`✅ Welcome email sent to ${wEmail}`)
            } catch (err) {
                console.error(`❌ Failed to send welcome email to ${wEmail}:`, err)
            }
        }

        // 2. Send PDI Report Ready Email
        if (email) {
            try {
                await sendPDIReportEmail(email, name, vehicleInfo, inspection.id)
                console.log(`✅ PDI report email sent to ${email}`)
            } catch (err) {
                console.error(`❌ Failed to send PDI report email to ${email}:`, err)
            }
        }

        return inspection
    })
}

/**
 * Fetches a single inspection by ID with all related data
 */
export async function getPDIInspection(id: string) {
    return await (prisma as any).pDIInspection.findUnique({
        where: { id },
        include: {
            responses: {
                include: {
                    item: {
                        include: {
                            section: true
                        }
                    }
                }
            },
            leakageResponses: {
                include: {
                    leakageItem: true
                }
            },
            images: {
                orderBy: {
                    uploadedAt: 'asc'
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    })
}

/**
 * Fetches all PDI inspections
 */
export async function getAllPDIInspections() {
    return await (prisma as any).pDIInspection.findMany({
        orderBy: { createdAt: 'desc' },
    })
}

/**
 * Fetches PDI inspections for a specific user (client view)
 */
export async function getUserPDIInspections(userId: string) {
    return await (prisma as any).pDIInspection.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    })
}

// --- Administrative Functions ---

export async function createPDISection(name: string) {
    const lastSection = await (prisma as any).pDISection.findFirst({
        orderBy: { order: 'desc' }
    })
    const order = lastSection ? lastSection.order + 1 : 0
    return await (prisma as any).pDISection.create({
        data: { name, order }
    })
}

export async function updatePDISection(id: string, data: any) {
    return await (prisma as any).pDISection.update({
        where: { id },
        data
    })
}

export async function deletePDISection(id: string) {
    return await (prisma as any).pDISection.delete({
        where: { id }
    })
}

export async function createPDIItem(sectionId: string, label: string) {
    const lastItem = await (prisma as any).pDIItem.findFirst({
        where: { sectionId },
        orderBy: { order: 'desc' }
    })
    const order = lastItem ? lastItem.order + 1 : 0
    return await (prisma as any).pDIItem.create({
        data: { sectionId, label, order }
    })
}

export async function updatePDIItem(id: string, data: any) {
    return await (prisma as any).pDIItem.update({
        where: { id },
        data
    })
}

export async function deletePDIItem(id: string) {
    return await (prisma as any).pDIItem.delete({
        where: { id }
    })
}

export async function reorderPDIStructure(type: 'SECTION' | 'ITEM', items: { id: string, order: number }[]) {
    const updates = items.map(item => {
        if (type === 'SECTION') {
            return (prisma as any).pDISection.update({
                where: { id: item.id },
                data: { order: item.order }
            })
        } else {
            return (prisma as any).pDIItem.update({
                where: { id: item.id },
                data: { order: item.order }
            })
        }
    })
    return await prisma.$transaction(updates)
}

/**
 * Seeds the PDI structure with industry-standard sections and items
 */
export async function seedPDIStructure() {
    const sections = [
        {
            name: 'Body Exterior Glass',
            order: 1,
            sectionType: 'CHECKLIST',
            items: [
                'Door locks/operation',
                'Fuel filler cover/petrol cap',
                'General bodywork condition',
                'Corrosion'
            ]
        },
        {
            name: 'Engine Compartment',
            order: 2,
            sectionType: 'CHECKLIST',
            items: [
                'Coolant level',
                'Hoses & pipes',
                'Drive belts',
                'Water pump',
                'Power steering fluid level',
                'Clutch fluid level',
                'Brake fluid level',
                'Engine oil level',
                'Engine mounts',
                'Turbo/supercharger',
                'Fuel pump & pipes',
                'Accelerator linkage',
                'Cold starting',
                'Fast idle when engine cold',
                'Noise level when engine cold',
                'Excess fumes/smoke'
            ]
        },
        {
            name: 'Suspension, Underframe & Steering',
            order: 3,
            sectionType: 'CHECKLIST',
            items: [
                'Steering joints & ball joints',
                'Chassis members',
                'Power steering',
                'Wheels, hubs & bearings',
                'Springs & suspension unit',
                'Pipes & hoses',
                'Dampers & bushes Gaiters',
                'Sub frames & mountings',
                'Suspension arms, mountings & fixings',
                'Tie bars & anti-roll bars',
                'Anti roll-bar',
                'Evidence of floor/chassis corrosion',
                'Bumper stops & gaiters'
            ]
        },
        {
            name: 'Wheels & Tyres',
            order: 4,
            sectionType: 'CHECKLIST',
            items: [
                'Front right tyre',
                'Front left tyre',
                'Rear left tyre',
                'Rear right tyre',
                'Spare tyre'
            ]
        },
        {
            name: 'Interior & Luggage Compartment',
            order: 5,
            sectionType: 'CHECKLIST',
            items: [
                'Seat mechanism',
                'Seat belts',
                'Internal mirrors',
                'Boot/tailgate lock'
            ]
        },
        {
            name: 'Electrical Controls',
            order: 6,
            sectionType: 'CHECKLIST',
            items: [
                'Ignition lock/starting system',
                'Battery charging system Headlights',
                'Side lights/running lights',
                'Rear lights & number plate illumination',
                'Brake lights',
                'Indicator & hazard lights',
                'Reverse & fog lights',
                'Auxiliary lights',
                'Panel lights/dashboard illumination',
                'Switches & controls',
                'Instrument/controls function Horn',
                'Windows & sunroof operation',
                'Wipers & jet washers Brakes',
                'Master cylinder security',
                'Servo/power system',
                'Flexible hoses',
                'Pipes/unions & connections',
                'Discs & pads',
                'Hand brake operation/adjustments',
                'Hand brake linkage Pedal/linkage'
            ]
        },
        {
            name: 'Clutch & Transmission',
            order: 7,
            sectionType: 'CHECKLIST',
            items: [
                'Cables/adjustment',
                'Hydraulic system',
                'Linkages (check for signs of wear)',
                'Casings Mountings',
                'Drive shaft assemblies',
                'Universal & sliding joints',
                'Clutch backlash',
                'Rubber gaiters Prop-shaft(s)',
                'Bearings & supports'
            ]
        },
        {
            name: 'Exhaust System',
            order: 8,
            sectionType: 'CHECKLIST',
            items: [
                'Inlet manifold',
                'Outlet manifold Pipes Silencer(s)',
                'Heat shields & mountings',
                'Joints & couplings',
                'Catalytic converter',
                'Overall system condition'
            ]
        },
        {
            name: 'Fuel System',
            order: 9,
            sectionType: 'CHECKLIST',
            items: [
                'Fuel tank',
                'Fuel tank fixings',
                'Fuel lines',
                'Breather pipes'
            ]
        },
        {
            name: 'Road Test',
            order: 10,
            sectionType: 'CHECKLIST',
            items: [
                'Engine - performance',
                'Engine - noise',
                'Engine - excessive fumes or smoke',
                'Evidence of overheating',
                'Gearbox operation & noise level',
                'Final drive operation & noise level',
                'Clutch operation',
                'Cooling fan operation',
                'Instruments & controls functioning'
            ]
        },
        {
            name: 'General steering & handling',
            order: 11,
            sectionType: 'CHECKLIST',
            items: [
                'Footbrake operation',
                'Hand brake operation',
                'Suspension noise',
                'Road holding stability'
            ]
        },
        {
            name: 'Convenience',
            order: 12,
            sectionType: 'CONVENIENCE',
            items: [
                'Warning lights',
                'Owners manual',
                'Service book & history',
                'Keys & remote controls'
            ]
        }
    ]

    const leakageItems = [
        { label: 'Brake Fluid Leakage', order: 1 },
        { label: 'Coolant Leakage', order: 2 },
        { label: 'Engine Oil Leakage', order: 3 },
        { label: 'Engine Underside Leak', order: 4 },
        { label: 'External Engine Leak', order: 5 },
        { label: 'Fuel Leakage', order: 6 },
        { label: 'Power Steering Fluid Leakage', order: 7 },
        { label: 'Transmission Fluid Leakage', order: 8 }
    ]

    return await prisma.$transaction(async (tx: any) => {
        // Clear existing PDI structure data (but keep actual inspections)
        await tx.pDIItem.deleteMany({})
        await tx.pDISection.deleteMany({})
        await tx.pDILeakageItem.deleteMany({})

        // Seed sections and items
        for (const sectionData of sections) {
            const section = await tx.pDISection.create({
                data: {
                    id: `pdi-section-${sectionData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                    name: sectionData.name,
                    order: sectionData.order,
                    sectionType: sectionData.sectionType,
                },
            })

            // Create items for this section
            for (let i = 0; i < sectionData.items.length; i++) {
                await tx.pDIItem.create({
                    data: {
                        sectionId: section.id,
                        label: sectionData.items[i],
                        order: i + 1,
                    },
                })
            }
        }

        // Seed leakage items
        for (const item of leakageItems) {
            await tx.pDILeakageItem.create({
                data: {
                    id: `leakage-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                    label: item.label,
                    order: item.order,
                },
            })
        }

        return { success: true, sectionCount: sections.length, leakageCount: leakageItems.length }
    })
}
