const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Database Cleanup ---');

    try {
        const vehicles = await prisma.companyVehicle.findMany({
            select: {
                id: true,
                partsRefurbished: true,
                images: true
            }
        });

        console.log(`Found ${vehicles.length} vehicles to check.`);
        let updateCount = 0;

        for (const vehicle of vehicles) {
            let needsUpdate = false;
            let parts = [];

            // Handle partsRefurbished bloat
            if (vehicle.partsRefurbished) {
                try {
                    parts = typeof vehicle.partsRefurbished === 'string'
                        ? JSON.parse(vehicle.partsRefurbished)
                        : vehicle.partsRefurbished;

                    if (Array.isArray(parts)) {
                        parts = parts.map(p => {
                            if (p.invoiceImages && p.invoiceImages.length > 0) {
                                console.log(`  [Vehicle ${vehicle.id}] Stripping ${p.invoiceImages.length} invoice images from part: ${p.part}`);
                                needsUpdate = true;
                                return { ...p, invoiceImages: [] };
                            }
                            return p;
                        });
                    }
                } catch (e) {
                    console.error(`  Error parsing parts for vehicle ${vehicle.id}:`, e.message);
                }
            }

            if (needsUpdate) {
                await prisma.companyVehicle.update({
                    where: { id: vehicle.id },
                    data: {
                        partsRefurbished: JSON.stringify(parts)
                    }
                });
                updateCount++;
            }
        }

        console.log(`Updated ${updateCount} vehicles.`);

        console.log('Running VACUUM to reclaim space...');
        await prisma.$executeRawUnsafe('VACUUM');
        console.log('VACUUM completed.');

    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
