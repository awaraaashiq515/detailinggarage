const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding PDI packages...");

  const demoPackages = [
    {
        name: "Basic PDI",
        type: "PDI",
        price: 1999,
        pdiCount: 1,
        description: "Essential 50-point exterior and interior inspection with instant digital report.",
        services: JSON.stringify(["Exterior check", "Interior check", "Digital report"]),
        status: "ACTIVE"
    },
    {
        name: "Comprehensive PDI",
        type: "PDI",
        price: 3499,
        pdiCount: 1,
        description: "Deep 120-point check including underbody, OBD scanning, and paint thickness test.",
        services: JSON.stringify(["120-point check", "Underbody inspection", "OBD scan", "Paint thickness test"]),
        status: "ACTIVE"
    },
    {
        name: "PDI + Detailing Combo",
        type: "PDI",
        price: 6999,
        pdiCount: 1,
        description: "Comprehensive PDI plus our signature exterior polishing and interior deep clean.",
        services: JSON.stringify(["Comprehensive PDI", "Exterior polish", "Interior deep clean"]),
        status: "ACTIVE"
    }
  ];

  for (const pkg of demoPackages) {
    const existing = await prisma.package.findFirst({
        where: { name: pkg.name }
    });

    if (!existing) {
        await prisma.package.create({ data: pkg });
        console.log(`Created package: ${pkg.name}`);
    } else {
        console.log(`Package ${pkg.name} already exists.`);
    }
  }

  console.log("Done.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
