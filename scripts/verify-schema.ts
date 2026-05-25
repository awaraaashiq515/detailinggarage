import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Verifying Prisma Client...')

    if ('pDIConfirmationRequest' in prisma) {
        console.log('✅ PDIConfirmationRequest model exists in Prisma Client.')
    } else {
        console.error('❌ PDIConfirmationRequest model MISSING in Prisma Client.')
        console.error('   This means "npx prisma generate" has not run successfully.')
    }

    try {
        // @ts-ignore
        const dmmf = await prisma._getDmmf()
        const model = dmmf.datamodel.models.find((m: any) => m.name === 'PDIConfirmationRequest')
        if (model) {
            console.log('✅ PDIConfirmationRequest found in DMMF metadata.')
        } else {
            console.error('❌ PDIConfirmationRequest NOT found in DMMF metadata.')
        }
    } catch (e: unknown) {
        console.log('Could not check DMMF:', e instanceof Error ? e.message : e)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
