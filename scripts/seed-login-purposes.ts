import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const purposes = [
        { name: 'Buy a Car', description: 'Looking to purchase a new or used vehicle' },
        { name: 'Sell a Car', description: 'Interested in selling my current vehicle' },
        { name: 'Get Car Inspection (PDI)', description: 'Pre-delivery inspection for a new car' },
        { name: 'Auto Repair / Service', description: 'Mechanical repairs or maintenance' },
        { name: 'Car Detailing / Coating', description: 'Ceramic coating, wash, or interior cleaning' },
        { name: 'Insurance Claim', description: 'Help with accident or insurance processing' },
        { name: 'Business / Dealer Inquiry', description: 'Partnership or dealer specific tools' },
    ];

    console.log('Seeding login purposes...');

    for (const purpose of purposes) {
        await prisma.loginPurpose.upsert({
            where: { name: purpose.name },
            update: {},
            create: {
                name: purpose.name,
                description: purpose.description,
                isActive: true,
            },
        });
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
