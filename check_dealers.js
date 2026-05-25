const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- DEALER USERS ---");
    const users = await prisma.user.findMany({
        where: { role: 'DEALER' },
        select: {
            id: true,
            email: true,
            status: true,
            dealerBusinessName: true,
            dealerSubscriptions: {
                where: { status: 'ACTIVE' },
                include: { package: true }
            }
        }
    });
    console.log(JSON.stringify(users, null, 2));

    console.log("\n--- PACKAGES ---");
    const packages = await prisma.dealerPackage.findMany({
        where: { status: 'ACTIVE' }
    });
    console.log(JSON.stringify(packages, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
