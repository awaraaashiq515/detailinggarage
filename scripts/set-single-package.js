const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Resetting PDI packages to a single package...");

  // Delete all existing packages of type PDI
  await prisma.package.deleteMany({
    where: { type: "PDI" }
  });
  console.log("Deleted existing PDI packages.");

  // Create the single package
  await prisma.package.create({
    data: {
      name: "Complete PDI Inspection",
      type: "PDI",
      price: 4000,
      pdiCount: 1,
      description: "Note: Any extra or external expenses will be charged separately.",
      services: JSON.stringify(["Comprehensive 50+ Point Check", "Exterior & Interior Inspection", "Underbody & Engine Check", "Digital Report Provided"]),
      status: "ACTIVE"
    }
  });

  console.log("Created single PDI package at ₹4000.");
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
