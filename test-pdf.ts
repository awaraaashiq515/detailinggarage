import { PrismaClient } from '@prisma/client'
import { generateInsuranceClaimPDF } from './src/services/insurance/pdf/generator/insurance-pdf-generator'

const prisma = new PrismaClient()

async function testPdf() {
    try {
        const claim = await (prisma as any).insuranceClaim.findFirst({
            where: {
                documents: {
                    some: {}
                }
            }
        })

        if (!claim) {
            console.log("No claim found with documents")
            return
        }

        console.log(`Generating PDF for claim ${claim.id}`)
        console.log(`Documents count: ${(await prisma.insuranceDocument.count({ where: { claimId: claim.id } }))}`)
        const url = await generateInsuranceClaimPDF(claim.id)
        console.log(`Success! URL: ${url}`)
    } catch (err) {
        console.error("Test failed:", err)
    } finally {
        await prisma.$disconnect()
    }
}

testPdf()
