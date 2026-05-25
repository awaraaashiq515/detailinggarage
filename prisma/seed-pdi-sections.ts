import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Professional PDI Inspection Sections matching industry standards
// Based on the Detailing Garage Pre-Delivery Inspection Check List format

const sections = [
    {
        name: 'Body Exterior Glass',
        order: 1,
        sectionType: 'CHECKLIST',
        items: [
            'Door locks/operation',
            'Fuel filler cover/petrol cap',
            'General bodywork condition',
            'Corrosion'
        ]
    },
    {
        name: 'Engine Compartment',
        order: 2,
        sectionType: 'CHECKLIST',
        items: [
            'Coolant level',
            'Hoses & pipes',
            'Drive belts',
            'Water pump',
            'Power steering fluid level',
            'Clutch fluid level',
            'Brake fluid level',
            'Engine oil level',
            'Engine mounts',
            'Turbo/supercharger',
            'Fuel pump & pipes',
            'Accelerator linkage',
            'Cold starting',
            'Fast idle when engine cold',
            'Noise level when engine cold',
            'Excess fumes/smoke'
        ]
    },
    {
        name: 'Suspension, Underframe & Steering',
        order: 3,
        sectionType: 'CHECKLIST',
        items: [
            'Steering joints & ball joints',
            'Chassis members',
            'Power steering',
            'Wheels, hubs & bearings',
            'Springs & suspension unit',
            'Pipes & hoses',
            'Dampers & bushes Gaiters',
            'Sub frames & mountings',
            'Suspension arms, mountings & fixings',
            'Tie bars & anti-roll bars',
            'Anti roll-bar',
            'Evidence of floor/chassis corrosion',
            'Bumper stops & gaiters'
        ]
    },
    {
        name: 'Wheels & Tyres',
        order: 4,
        sectionType: 'CHECKLIST',
        items: [
            'Front right tyre',
            'Front left tyre',
            'Rear left tyre',
            'Rear right tyre',
            'Spare tyre'
        ]
    },
    {
        name: 'Interior & Luggage Compartment',
        order: 5,
        sectionType: 'CHECKLIST',
        items: [
            'Seat mechanism',
            'Seat belts',
            'Internal mirrors',
            'Boot/tailgate lock'
        ]
    },
    {
        name: 'Electrical Controls',
        order: 6,
        sectionType: 'CHECKLIST',
        items: [
            'Ignition lock/starting system',
            'Battery charging system Headlights',
            'Side lights/running lights',
            'Rear lights & number plate illumination',
            'Brake lights',
            'Indicator & hazard lights',
            'Reverse & fog lights',
            'Auxiliary lights',
            'Panel lights/dashboard illumination',
            'Switches & controls',
            'Instrument/controls function Horn',
            'Windows & sunroof operation',
            'Wipers & jet washers Brakes',
            'Master cylinder security',
            'Servo/power system',
            'Flexible hoses',
            'Pipes/unions & connections',
            'Discs & pads',
            'Hand brake operation/adjustments',
            'Hand brake linkage Pedal/linkage'
        ]
    },
    {
        name: 'Clutch & Transmission',
        order: 7,
        sectionType: 'CHECKLIST',
        items: [
            'Cables/adjustment',
            'Hydraulic system',
            'Linkages (check for signs of wear)',
            'Casings Mountings',
            'Drive shaft assemblies',
            'Universal & sliding joints',
            'Clutch backlash',
            'Rubber gaiters Prop-shaft(s)',
            'Bearings & supports'
        ]
    },
    {
        name: 'Exhaust System',
        order: 8,
        sectionType: 'CHECKLIST',
        items: [
            'Inlet manifold',
            'Outlet manifold Pipes Silencer(s)',
            'Heat shields & mountings',
            'Joints & couplings',
            'Catalytic converter',
            'Overall system condition'
        ]
    },
    {
        name: 'Fuel System',
        order: 9,
        sectionType: 'CHECKLIST',
        items: [
            'Fuel tank',
            'Fuel tank fixings',
            'Fuel lines',
            'Breather pipes'
        ]
    },
    {
        name: 'Road Test',
        order: 10,
        sectionType: 'CHECKLIST',
        items: [
            'Engine - performance',
            'Engine - noise',
            'Engine - excessive fumes or smoke',
            'Evidence of overheating',
            'Gearbox operation & noise level',
            'Final drive operation & noise level',
            'Clutch operation',
            'Cooling fan operation',
            'Instruments & controls functioning'
        ]
    },
    {
        name: 'General steering & handling',
        order: 11,
        sectionType: 'CHECKLIST',
        items: [
            'Footbrake operation',
            'Hand brake operation',
            'Suspension noise',
            'Road holding stability'
        ]
    },
    {
        name: 'Convenience',
        order: 12,
        sectionType: 'CONVENIENCE',
        items: [
            'Warning lights',
            'Owners manual',
            'Service book & history',
            'Keys & remote controls'
        ]
    }
]

// Leakage inspection items
const leakageItems = [
    { label: 'Brake Fluid Leakage', order: 1 },
    { label: 'Coolant Leakage', order: 2 },
    { label: 'Engine Oil Leakage', order: 3 },
    { label: 'Engine Underside Leak', order: 4 },
    { label: 'External Engine Leak', order: 5 },
    { label: 'Fuel Leakage', order: 6 },
    { label: 'Power Steering Fluid Leakage', order: 7 },
    { label: 'Transmission Fluid Leakage', order: 8 }
]


async function main() {
    console.log('🔧 Seeding Professional PDI Sections and Items...')
    console.log('='.repeat(50))

    // Clear existing sections and items
    console.log('\n🗑️  Clearing existing PDI data...')
    await prisma.pDIResponse.deleteMany({})
    await prisma.pDIItem.deleteMany({})
    await prisma.pDISection.deleteMany({})
    await prisma.pDILeakageResponse.deleteMany({})
    await prisma.pDILeakageItem.deleteMany({})

    // Seed sections and items
    console.log('\n📋 Creating PDI Sections and Items...\n')

    for (const sectionData of sections) {
        const section = await prisma.pDISection.create({
            data: {
                id: `pdi-section-${sectionData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                name: sectionData.name,
                order: sectionData.order,
                sectionType: sectionData.sectionType,
            },
        })

        console.log(`  ✅ Section ${sectionData.order}: ${section.name}`)

        // Create items for this section
        for (let i = 0; i < sectionData.items.length; i++) {
            await prisma.pDIItem.create({
                data: {
                    sectionId: section.id,
                    label: sectionData.items[i],
                    order: i + 1,
                },
            })
        }

        console.log(`     ➡️  Created ${sectionData.items.length} items`)
    }

    // Seed leakage items
    console.log('\n🔍 Creating Leakage Inspection Items...\n')

    for (const item of leakageItems) {
        await prisma.pDILeakageItem.create({
            data: {
                id: `leakage-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                label: item.label,
                order: item.order,
            },
        })
        console.log(`  ✅ ${item.label}`)
    }

    console.log('\n' + '='.repeat(50))
    console.log('✅ PDI Sections and Items seeded successfully!')
    console.log(`📊 Total Sections: ${sections.length}`)
    console.log(`📋 Total Checklist Items: ${sections.reduce((sum, s) => sum + s.items.length, 0)}`)
    console.log(`🔍 Total Leakage Items: ${leakageItems.length}`)
}

main()
    .catch((e) => {
        console.error('❌ Error seeding PDI sections:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
