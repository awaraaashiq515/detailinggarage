const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Vehicle Images ---');

    try {
        const vehicles = await prisma.companyVehicle.findMany({
            select: {
                id: true,
                title: true,
                images: true
            }
        });

        for (const v of vehicles) {
            const hasImages = v.images && v.images !== '[]' && v.images !== '';
            const isBase64 = v.images && v.images.includes('data:image');
            console.log(`Vehicle ${v.id} (${v.title}): Has Images: ${hasImages}, isBase64: ${isBase64 ? 'YES' : 'NO'} (Length: ${v.images ? v.images.length : 0})`);
        }

    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
