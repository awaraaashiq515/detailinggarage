import { NextResponse } from 'next/server'
import { createPDIReport, PDIInspectionInput } from '@/services/pdi-service'
import { getCurrentUser } from '@/lib/auth/jwt'
import { z } from 'zod'

// Validation schema - Updated with all mandatory fields and leakage responses
const submissionSchema = z.object({
    // Customer Details (all required)
    customerName: z.string().min(1, "Customer Name is required"),
    customerPhone: z.string().min(1, "Mobile Number is required"),
    customerEmail: z.string().email().optional().or(z.literal('')),

    // Vehicle Details (most required)
    vehicleMake: z.string().min(1, "Vehicle Make is required"),
    vehicleModel: z.string().min(1, "Vehicle Model is required"),
    vehicleColor: z.string().min(1, "Vehicle Color is required"),
    vehicleYear: z.string().min(1, "Manufacturing Year is required"),
    engineNumber: z.string().min(1, "Engine Number is required"),
    vin: z.string().min(1, "Chassis Number is required"),
    odometer: z.string().min(1, "Odometer Reading is required"),

    // Inspection Details
    inspectedBy: z.string().optional().or(z.literal('')),
    adminComments: z.string().optional(),
    vehicleDamageData: z.string().optional(),
    inspectionDate: z.string().optional(),

    // Checklist Responses
    responses: z.array(z.object({
        itemId: z.string(),
        status: z.enum(["PASS", "FAIL", "WARN"]),
        notes: z.string().optional()
    })),

    leakageResponses: z.array(z.object({
        leakageItemId: z.string(),
        found: z.boolean(),
        notes: z.string().optional()
    })).optional(),

    // Vehicle Images
    images: z.array(z.object({
        category: z.string(),
        imagePath: z.string(),
        fileName: z.string(),
        fileSize: z.number()
    })).optional(),

    digitalSignature: z.string().optional(),
    customerSignature: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Only ADMIN can create PDI reports
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const json = await req.json()
        const validated = submissionSchema.parse(json)

        console.log(`📸 Images received: ${validated.images?.length || 0}`)

        // Add userId to input if explicitly provided in request, otherwise leave null for auto-lookup
        const input: PDIInspectionInput = {
            ...validated,
            userId: (json as any).userId || null,
            skipPackageDeduction: true  // Admin creating PDI, no package deduction needed
        }

        const result = await createPDIReport(input)

        // Generate PDF synchronously after save completes to avoid race conditions
        try {
            const { generatePDIPDF } = await import('@/services/pdi/pdf/generator/pdi-pdf-generator')
            await generatePDIPDF(result.id)
            console.log(`✅ PDF generated: ${result.id}`)
        } catch (err) {
            console.error(`❌ PDF gen failed:`, err)
            // Still return success since the PDI was saved, only PDF failed
        }

        return NextResponse.json({ success: true, id: result.id }, { status: 201 })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 })
        }
        console.error('Failed to save PDI report:', error)
        return NextResponse.json(
            { error: 'Failed to save PDI report. Please try again.' },
            { status: 500 }
        )
    }
}
