import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding PDI structure...')

    // Define the detailed PDI Structure based on the image
    const sections = [
        {
            name: 'Body Exterior Glass',
            items: [
                'Door locks/operation',
                'Fuel filler cover/petrol cap',
                'General bodywork condition',
                'Corrosion',
            ],
        },
        {
            name: 'Wheels & Tyres',
            items: [
                'Front right tyre',
                'Front left tyre',
                'Rear left tyre',
                'Rear right tyre',
                'Spare tyre',
            ],
        },
        {
            name: 'Interior & Luggage Compartment',
            items: [
                'Seat mechanism',
                'Seat belts',
                'Internal mirrors',
                'Boot/tailgate lock',
            ],
        },
        {
            name: 'Electrical Controls',
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
                'Hand brake linkage Pedal/linkage',
            ],
        },
        {
            name: 'Engine Compartment',
            items: ['Coolant level', 'Radiator & cap'],
        },
        {
            name: 'Hoses & pipes',
            items: [
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
                'Excess fumes/smoke',
            ],
        },
        {
            name: 'Clutch & Transmission',
            items: [
                'Cables/adjustment',
                'Hydraulic system',
                'Linkages (check for signs of wear)',
                'Casings Mountings',
                'Drive shaft assemblies',
                'Universal & sliding joints',
                'Clutch backlash',
                'Rubber gaiters Prop-shaft(s)',
                'Bearings & supports',
            ],
        },
        {
            name: 'Exhaust System',
            items: [
                'Inlet manifold',
                'Outlet manifold Pipes Silencer(s)',
                'Heat shields & mountings',
                'Joints & couplings',
                'Catalytic converter',
                'Overall system condition',
            ],
        },
        {
            name: 'Fuel System',
            items: ['Fuel tank', 'Fuel tank fixings', 'Fuel lines', 'Breather pipes'],
        },
        {
            name: 'Suspension, Underframe & Steering',
            items: ['Steering joints & ball joints'],
        },
        {
            name: 'Steering rack / Suspension Misc', // Combined based on image flow
            items: [
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
                'Bumper stops & gaiters',
            ],
        },
        {
            name: 'Road Test',
            items: [
                'Engine - performance',
                'Engine - noise',
                'Engine - excessive fumes or smoke',
                'Evidence of overheating',
                'Gearbox operation & noise level',
                'Final drive operation & noise level',
                'Clutch operation',
                'Cooling fan operation',
                'Instruments & controls functioning',
            ],
        },
        {
            name: 'General steering & handling',
            items: [
                'Footbrake operation',
                'Hand brake operation',
                'Suspension noise',
                'Road holding stability',
            ],
        },
        {
            name: 'Convenience',
            items: [
                'Warning lights',
                'Owners manual',
                'Service book & history',
                'Keys & remote controls',
            ],
        },
        {
            name: 'LEAKAGE INSPECTION',
            items: [
                'Engine Oil Leakage',
                'Coolant Leakage',
                'Fuel Leakage',
                'Brake Fluid Leakage',
                'Power Steering Fluid Leakage',
                'Transmission Fluid Leakage',
                'External Engine Leak',
                'Engine Underside Leak',
                'Fluid/Oil Seepage',
            ],
        },
    ]

    let order = 0
    for (const section of sections) {
        // Check if exists
        const existing = await prisma.pDISection.findFirst({
            where: { name: section.name },
        })

        if (!existing) {
            await prisma.pDISection.create({
                data: {
                    name: section.name,
                    order: order++,
                    items: {
                        create: section.items.map((item, idx) => ({
                            label: item,
                            order: idx,
                        })),
                    },
                },
            })
            console.log(`Created section: ${section.name}`)
        } else {
            console.log(`Skipped existing section: ${section.name}`)
            // Optionally update items if needed
        }
    }

    console.log('Seeding completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
