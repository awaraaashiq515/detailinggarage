import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const packages = [
        {
            name: 'Vehicle Plan',
            type: 'VEHICLE',
            description: 'Standard plan for individual car listings',
            price: 999,
            durationDays: 30,
            maxVehicles: 10,
            maxFeaturedCars: 0,
            canAddVehicles: true,
            canFeatureVehicles: false,
            features: JSON.stringify(['10 Vehicle Listings', 'Basic Analytics', 'Standard Support']),
            isPopular: false,
        },
        {
            name: 'Featured Plan',
            type: 'FEATURED',
            description: 'Highlight your cars to reach more buyers',
            price: 1999,
            durationDays: 30,
            maxVehicles: 5,
            maxFeaturedCars: 5,
            canAddVehicles: true,
            canFeatureVehicles: true,
            features: JSON.stringify(['5 Featured Listings', 'Priority Search Results', 'Advanced Analytics']),
            isPopular: true,
        },
        {
            name: 'Free Starter Plan',
            type: 'BASIC',
            description: 'Get started with our basic dealer features for free',
            price: 0,
            durationDays: 365,
            maxVehicles: 2,
            maxFeaturedCars: 0,
            canAddVehicles: true,
            canFeatureVehicles: false,
            features: JSON.stringify(['2 Vehicle Listings', 'Basic Analytics', 'Standard Support']),
            isPopular: false,
        },
        {
            name: 'Combo Plan',
            type: 'COMBO',
            description: 'The ultimate package for growing dealers',
            price: 3499,
            durationDays: 30,
            maxVehicles: 50,
            maxFeaturedCars: 10,
            canAddVehicles: true,
            canFeatureVehicles: true,
            features: JSON.stringify(['50 Vehicle Listings', '10 Featured Slots', 'Bulk Upload', 'Premium Support']),
            isPopular: false,
        },
    ];

    console.log('Seeding dealer packages...');

    for (const pkg of packages) {
        try {
            await prisma.dealerPackage.create({
                data: pkg,
            });
        } catch (e) {
            console.log(`Skipping or error for ${pkg.name}:`, e);
        }
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
