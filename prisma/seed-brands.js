const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const CAR_BRANDS = {
    "Maruti Suzuki": ["Alto", "Swift", "Baleno", "Brezza", "Ertiga", "Dzire"],
    "Hyundai": ["i10", "i20", "Creta", "Verna", "Venue", "Alcazar"],
    "Tata": ["Tiago", "Nexon", "Harrier", "Safari", "Punch", "Altroz"],
    "Mahindra": ["Thar", "Scorpio", "XUV700", "Bolero", "XUV300"],
    "Toyota": ["Innova", "Fortuner", "Glanza", "Urban Cruiser", "Camry"],
    "Honda": ["City", "Amaze", "Jazz", "WR-V"],
    "Kia": ["Seltos", "Sonet", "Carens", "Carnival"],
    "BMW": ["3 Series", "5 Series", "X1", "X3", "X5"],
    "Mercedes-Benz": ["C-Class", "E-Class", "GLA", "GLC", "GLE"]
}

const BIKE_BRANDS = {
    "Hero": ["Splendor+", "HF Deluxe", "Passion Pro", "Xpulse 200"],
    "Honda": ["Activa", "CB Shine", "Unicorn", "SP 125"],
    "TVS": ["Jupiter", "Apache RTR", "XL100", "Raider"],
    "Bajaj": ["Pulsar", "Platina", "Dominar", "Avenger"],
    "Royal Enfield": ["Classic 350", "Bullet 350", "Meteor 350", "Himalayan"],
    "Yamaha": ["R15", "MT-15", "FZ", "Fascino"],
    "Suzuki": ["Access", "Gixxer", "Burgman"],
    "KTM": ["Duke 200", "Duke 390", "RC 200", "RC 390"]
}

async function seed() {
    console.log('Seeding CAR brands and models...')
    for (const [brandName, models] of Object.entries(CAR_BRANDS)) {
        const brand = await prisma.vehicleBrand.upsert({
            where: { name: brandName },
            update: {},
            create: { name: brandName, type: 'CAR' }
        })

        for (const modelName of models) {
            await prisma.vehicleModel.upsert({
                where: {
                    brandId_name: {
                        brandId: brand.id,
                        name: modelName
                    }
                },
                update: {},
                create: { name: modelName, brandId: brand.id }
            })
        }
    }

    console.log('Seeding BIKE brands and models...')
    for (const [brandName, models] of Object.entries(BIKE_BRANDS)) {
        const brand = await prisma.vehicleBrand.upsert({
            where: { name: brandName },
            update: {},
            create: { name: brandName, type: 'BIKE' }
        })

        for (const modelName of models) {
            await prisma.vehicleModel.upsert({
                where: {
                    brandId_name: {
                        brandId: brand.id,
                        name: modelName
                    }
                },
                update: {},
                create: { name: modelName, brandId: brand.id }
            })
        }
    }
    console.log('Seed completed!')
}

seed()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
