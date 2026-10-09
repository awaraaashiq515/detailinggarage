import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

// Default starter detailing packages for Indian workshops (Vehicle Specific)
const DEFAULT_PACKAGES = [
    {
        name: "Toyota Fortuner - 9H Ceramic & Underbody Armor",
        category: "COATING",
        description: "Heavy duty dual-layer 9H nano ceramic coat, paint cut correction, full chassis underbody sealant & 3-row interior conditioning.",
        productsUsed: JSON.stringify([
            { name: "Graphene Matrix Ceramic Coating 50ml", quantity: 1, unit: "BOTTLE", price: 3750 },
            { name: "Heavy Cutting Compound 3M/Menzerna", quantity: 1, unit: "CAN", price: 850 },
            { name: "Underbody Rubberized Anti-Rust Bitumen Seal", quantity: 2, unit: "CAN", price: 1200 },
            { name: "High-Foam Snow Shampoo", quantity: 1, unit: "BOTTLE", price: 350 },
            { name: "Edgeless Microfiber Buffing Towels", quantity: 4, unit: "PCS", price: 600 }
        ]),
        inclusions: JSON.stringify([
            "High-Pressure Underbody & Heavy Wheel Arch Mud Flush",
            "Snow Foam Pre-Wash & Iron Fallout Decontamination",
            "3-Step Rotary Paint Correction & Hologram Removal",
            "2 Layers 9H Nano Ceramic Coating on Paint & Fiber Trim",
            "Windshield & All Window Glass Hydrophobic Rain Repellent",
            "Full Underbody Anti-Rust Bitumen Sealant Treatment",
            "Alloy Wheel Face Ceramic Protection",
            "3-Row Leather Interior Deep Conditioning & Steam Clean"
        ]),
        basePrice: 24000,
        fullSuvPrice: 24000,
        compactSuvPrice: 20000,
        sedanPrice: 18000,
        hatchbackPrice: 15000,
        bikePrice: null,
        duration: "2 Days",
        warranty: "3 Years Warranty",
        hsnSacCode: "9987",
        taxRate: 18,
    },
    {
        name: "Mahindra Thar 4x4 - Off-Road Shield & Detailing",
        category: "COATING",
        description: "Specialized off-road protection for Thar: hard shell ceramic coat, silencer zinc coat, fender flare dressing & mud defense.",
        productsUsed: JSON.stringify([
            { name: "9H High Solids Ceramic Coating 50ml", quantity: 1, unit: "BOTTLE", price: 3500 },
            { name: "Chassis & Silencer Zinc Spray", quantity: 2, unit: "CAN", price: 1100 },
            { name: "Plastic & Fiber Cladding Restorer", quantity: 1, unit: "BOTTLE", price: 650 },
            { name: "Interior Fabric & Upholstery Hydrophobic Shield", quantity: 1, unit: "CAN", price: 550 }
        ]),
        inclusions: JSON.stringify([
            "Heavy Mud Removal & Undercarriage High-Pressure Wash",
            "Fiber Hard Top / Soft Top Deep Wash & Weather Seal",
            "2-Step Paint Correction & Bush Scratch Removal",
            "9H Ceramic Coating on Metal Panels & Bonnet",
            "High-Temperature Zinc Exhaust & Silencer Coating",
            "Unpainted Fiber Fenders & Bumper UV Restoration",
            "Engine Bay Degreasing & Protective Moisture Coating",
            "Water-Repellent Interior Carpet & Seat Shield"
        ]),
        basePrice: 16500,
        compactSuvPrice: 16500,
        fullSuvPrice: 19000,
        sedanPrice: 14000,
        hatchbackPrice: 12000,
        bikePrice: null,
        duration: "1.5 Days",
        warranty: "2 Years Warranty",
        hsnSacCode: "9987",
        taxRate: 18,
    },
    {
        name: "Hyundai Creta - Ceramic Gloss & Interior Spa",
        category: "COATING",
        description: "Mirror finish 9H ceramic coating, multi-stage paint refinement, roof headliner extraction & ozone air sanitization.",
        productsUsed: JSON.stringify([
            { name: "Ceramic Coating 9H Pro 50ml", quantity: 1, unit: "BOTTLE", price: 3200 },
            { name: "Fine Finish Polish Compound", quantity: 1, unit: "CAN", price: 650 },
            { name: "Interior Foam Extraction Shampoo", quantity: 1, unit: "BOTTLE", price: 450 },
            { name: "Glass Hydrophobic Coating 50ml", quantity: 1, unit: "BOTTLE", price: 500 }
        ]),
        inclusions: JSON.stringify([
            "Exterior Decontamination Foam Wash & Clay Bar Treatment",
            "2-Step Paint Correction (Swirl Elimination & Deep Gloss)",
            "Dual Layer 9H Ceramic Coating on Exterior Paint",
            "Roof Headliner Dry Clean & Stain Extraction",
            "Seat Fabric Injection-Extraction / Leather Balm Condition",
            "Dashboard, Door Trims & Center Console UV Dressing",
            "AC Duct Disinfection & Bacteria Neutralization",
            "Windshield Water-Beading Hydrophobic Rain Repellent"
        ]),
        basePrice: 16000,
        compactSuvPrice: 16000,
        sedanPrice: 14000,
        fullSuvPrice: 19000,
        hatchbackPrice: 12500,
        bikePrice: null,
        duration: "1 Day",
        warranty: "2 Years Warranty",
        hsnSacCode: "9987",
        taxRate: 18,
    },
    {
        name: "Mahindra Scorpio-N - Beast Armor Ceramic & Detailing",
        category: "COATING",
        description: "Comprehensive detailing for Scorpio-N: heavy scratch cut, dual-coat ceramic shield, underbody rust protection & full 7-seater spa.",
        productsUsed: JSON.stringify([
            { name: "9H Ceramic Matrix Coating 50ml", quantity: 1, unit: "BOTTLE", price: 3750 },
            { name: "Medium Cut Rubbing Compound", quantity: 1, unit: "CAN", price: 750 },
            { name: "Rubberized Underbody Sealant", quantity: 2, unit: "CAN", price: 1200 },
            { name: "Leather Seat Cleaner & Conditioner", quantity: 1, unit: "BOTTLE", price: 600 }
        ]),
        inclusions: JSON.stringify([
            "Chassis, Wheel Arches & Undercarriage Deep Wash",
            "3-Step Rotary Paint Correction & Hologram Removal",
            "9H Ceramic Shield on Paint, Massive Grille & Tailgate",
            "Full 7-Seater Interior Leather Scrub & UV Moisturizing",
            "Floor Carpets High-Power Foam Cleaning & Vacuum",
            "Underbody Anti-Corrosion Rubberized Barrier Seal",
            "Front LED DRLs & Headlights Clarity Protection",
            "Engine Bay Steam Clean & Factory Matte Finish Dressing"
        ]),
        basePrice: 22000,
        fullSuvPrice: 22000,
        compactSuvPrice: 18000,
        sedanPrice: 15500,
        hatchbackPrice: 13500,
        bikePrice: null,
        duration: "2 Days",
        warranty: "3 Years Warranty",
        hsnSacCode: "9987",
        taxRate: 18,
    },
    {
        name: "Tata Nexon - High Gloss Ceramic & Paint Protection",
        category: "COATING",
        description: "Wet-look high gloss ceramic treatment, plastic cladding restoration, swirl removal & glass hydrophobic coat.",
        productsUsed: JSON.stringify([
            { name: "Nano Ceramic Gloss Coating 30ml", quantity: 1, unit: "BOTTLE", price: 2800 },
            { name: "Dual-Action Finishing Polish", quantity: 1, unit: "CAN", price: 550 },
            { name: "Plastic Cladding Restorer", quantity: 1, unit: "BOTTLE", price: 400 },
            { name: "Snow Foam Wash Concentrate", quantity: 1, unit: "BOTTLE", price: 250 }
        ]),
        inclusions: JSON.stringify([
            "Snow Foam Bath & Two-Bucket Microfiber Hand Wash",
            "Clay Bar Treatment for Industrial Fallout & Tar Spots",
            "2-Step Machine Polishing for Wet-Look Deep Reflection",
            "9H Nano Ceramic Coating Application on Painted Panels",
            "Black Wheel Arch & Bumper Plastic Deep Restoration",
            "Interior Cabin Vacuum & Instrument Cluster Safe Dusting",
            "Front Windshield Hydrophobic Rain Repellent",
            "Satin Black Tire Dressing Gloss Treatment"
        ]),
        basePrice: 14500,
        compactSuvPrice: 14500,
        hatchbackPrice: 12000,
        sedanPrice: 13500,
        fullSuvPrice: 17500,
        bikePrice: null,
        duration: "1 Day",
        warranty: "2 Years Warranty",
        hsnSacCode: "9987",
        taxRate: 18,
    },
    {
        name: "Maruti Swift - Showroom Gloss Polishing & Interior Spa",
        category: "POLISHING",
        description: "Complete paint correction rubbing-buffing, synthetic polymer sealant, deep fabric seat shampoo & wheel cleaning.",
        productsUsed: JSON.stringify([
            { name: "Fast Cut Rubbing Compound", quantity: 1, unit: "CAN", price: 500 },
            { name: "Synthetic Polymer Gloss Sealant", quantity: 1, unit: "BOTTLE", price: 450 },
            { name: "Upholstery Dry Foam Shampoo", quantity: 1, unit: "BOTTLE", price: 350 },
            { name: "Dashboard UV Protectant Spray", quantity: 1, unit: "BOTTLE", price: 250 }
        ]),
        inclusions: JSON.stringify([
            "Exterior High-Pressure Foam Pressure Wash",
            "2-Step Machine Rubbing & High-Gloss Finish Polish",
            "Hydrophobic Polymer Sealant Coat for 6-Month Shine",
            "Deep Foam Injection-Extraction for All 5 Fabric Seats",
            "Floor Carpets & Footwell Deep Industrial Vacuum",
            "Dashboard, Door Trims & AC Vents UV Matte Dressing",
            "Alloy Wheels Deep Clean & Brake Dust Degreasing",
            "Silencer Tip Polishing & Tire Dressing"
        ]),
        basePrice: 6500,
        laborCharge: 5000,
        vehicleName: "Maruti Swift",
        hatchbackPrice: 6500,
        sedanPrice: 7500,
        compactSuvPrice: 8500,
        fullSuvPrice: 10500,
        bikePrice: null,
        duration: "6 Hours",
        warranty: "6 Months Gloss Protection",
        hsnSacCode: "9987",
        taxRate: 18,
    },
    {
        vehicleName: "Maruti Swift",
        name: "Maruti Swift - Comprehensive Periodic Service & Tune-up",
        category: "LABOR",
        description: "Complete periodic general service for Maruti Swift: Engine oil change (5W-30), new oil/air/cabin filters, coolant & brake fluid top-up, spark plugs, caliper grease & full 40-point safety inspection.",
        productsUsed: JSON.stringify([
            { name: "Engine Oil", quantity: 3.5, unit: "LTR", price: 650 },
            { name: "Oil Filter", quantity: 1, unit: "PCS", price: 280 },
            { name: "Air Filter", quantity: 1, unit: "PCS", price: 450 },
            { name: "Cabin AC Filter", quantity: 1, unit: "PCS", price: 550 },
            { name: "Coolant", quantity: 1, unit: "LTR", price: 320 },
            { name: "Brake Oil / Brake Fluid", quantity: 1, unit: "BOTTLE", price: 260 },
            { name: "Windshield Washer Fluid", quantity: 1, unit: "BOTTLE", price: 150 },
            { name: "Grease / Lubricant", quantity: 1, unit: "CAN", price: 240 },
            { name: "Spark Plugs", quantity: 1, unit: "SET", price: 950 },
            { name: "Drain Plug Washer / Gasket", quantity: 1, unit: "PCS", price: 40 }
        ]),
        laborCharge: 1485,
        basePrice: 7000,
        hatchbackPrice: 7000,
        sedanPrice: 7500,
        compactSuvPrice: 8500,
        fullSuvPrice: 9500,
        bikePrice: null,
        duration: "3 - 4 Hours",
        warranty: "10,000 KM / 6 Months Service Warranty",
        hsnSacCode: "9987",
        taxRate: 18,
    },
    {
        name: "Honda City - Executive Ceramic Coating & Mirror Finish",
        category: "COATING",
        description: "Executive luxury detailing: 3-step jewelling machine polish, Japanese 9H quartz ceramic coat & beige leather conditioning.",
        productsUsed: JSON.stringify([
            { name: "Japanese 9H Quartz Ceramic Coating 50ml", quantity: 1, unit: "BOTTLE", price: 3500 },
            { name: "Ultra Fine Jewelling Polish", quantity: 1, unit: "CAN", price: 700 },
            { name: "Windshield Hydrophobic Coating", quantity: 1, unit: "BOTTLE", price: 500 },
            { name: "Leather Moisturizing Balm", quantity: 1, unit: "BOTTLE", price: 550 }
        ]),
        inclusions: JSON.stringify([
            "Gentle Hand Wash with pH Neutral Foam & Soft Mitts",
            "Full Clay Bar Decontamination of Paint & Glass",
            "3-Step Jewelling Polish for Flawless Mirror Reflection",
            "Dual Layer 9H Quartz Ceramic Coating Application",
            "All Window Glasses Water-Repellent Hydrophobic Coat",
            "Beige / Black Leather Upholstery Gentle Scrub & Conditioning",
            "Engine Bay Steam Detailing & Non-Sticky Dressing",
            "Alloy Rims High Gloss Polish & Face Coating"
        ]),
        basePrice: 15500,
        sedanPrice: 15500,
        hatchbackPrice: 13000,
        compactSuvPrice: 16500,
        fullSuvPrice: 19500,
        bikePrice: null,
        duration: "1.5 Days",
        warranty: "3 Years Warranty",
        hsnSacCode: "9987",
        taxRate: 18,
    },
    {
        name: "Kia Seltos - Graphene Matrix 10H & Full Detailing",
        category: "COATING",
        description: "Advanced 10H graphene matrix coating (high heat & water spot resistance), rim ceramic protection & leather detailing.",
        productsUsed: JSON.stringify([
            { name: "Graphene Matrix 10H Coating 50ml", quantity: 1, unit: "BOTTLE", price: 4200 },
            { name: "Heavy Cut + Finish Polish Compounds", quantity: 1, unit: "SET", price: 800 },
            { name: "Alloy Wheel Ceramic Rim Coating", quantity: 1, unit: "BOTTLE", price: 600 },
            { name: "Leather & Vinyl Interior Balm", quantity: 1, unit: "BOTTLE", price: 550 }
        ]),
        inclusions: JSON.stringify([
            "Decontamination Foam Bath & Chemical Iron Fallout Remover",
            "Multi-Stage Machine Paint Correction (Swirl Mark Removal)",
            "10H Graphene Coating (High Heat & Water Spot Resistance)",
            "Diamond Cut Alloy Wheel Rim Face Ceramic Protection",
            "Front & Rear Knurled Skid Plates Polishing & Seal",
            "Interior Deep Cleaning & Ozone Anti-Bacterial Sanitization",
            "Leatherette Seats Nourishment & UV Color Guard",
            "3 Years Warranty with Annual Maintenance Inspection"
        ]),
        basePrice: 18500,
        compactSuvPrice: 18500,
        sedanPrice: 16000,
        fullSuvPrice: 21000,
        hatchbackPrice: 14000,
        bikePrice: null,
        duration: "2 Days",
        warranty: "3 Years Warranty",
        hsnSacCode: "9987",
        taxRate: 18,
    },
    {
        name: "Tata Safari / Harrier - Full Body Armor & Detailing",
        category: "COATING",
        description: "Heavy duty ceramic coat for massive body panels, pan-roof glass hydrophobic seal, underbody rust protection & full interior spa.",
        productsUsed: JSON.stringify([
            { name: "Heavy Duty Ceramic Coating 9H 50ml", quantity: 1, unit: "BOTTLE", price: 3800 },
            { name: "Rotary Cutting Compound", quantity: 1, unit: "CAN", price: 850 },
            { name: "Underbody Anti-Rust Bitumen Seal", quantity: 2, unit: "CAN", price: 1200 },
            { name: "Silencer Zinc High-Temp Coating", quantity: 1, unit: "CAN", price: 550 }
        ]),
        inclusions: JSON.stringify([
            "Heavy Underbody High-Pressure Mud & Road Tar Flush",
            "3-Step Rotary Paint Correction & Swirl Elimination",
            "Dual Layer 9H Ceramic Seal on Paint & Panoramic Sunroof Frame",
            "Full Interior Upholstery Foam Extraction & Leather Dressing",
            "Underbody Rust Guard Rubber Seal & Zinc Exhaust Silencer Coat",
            "Engine Bay Degreasing & Protective Moisture Seal",
            "Headlight & DRL Micro-Scratch Correction",
            "Full Wheel Arches, Brake Calipers & Alloy Wheels Clean"
        ]),
        basePrice: 23000,
        fullSuvPrice: 23000,
        compactSuvPrice: 18500,
        sedanPrice: 16000,
        hatchbackPrice: 14000,
        bikePrice: null,
        duration: "2 Days",
        warranty: "3 Years Warranty",
        hsnSacCode: "9987",
        taxRate: 18,
    },
    {
        name: "BMW 3 Series / Mercedes C-Class - Luxury Detailing & PPF Front",
        category: "PPF",
        description: "Ultra luxury German treatment: Self-healing TPU PPF on front impact zones + 10H Graphene ceramic coat on all remaining panels.",
        productsUsed: JSON.stringify([
            { name: "TPU Self-Healing High-Gloss PPF Film", quantity: 5, unit: "MTR", price: 18000 },
            { name: "Ultra Gloss 10H Graphene Ceramic Coat", quantity: 1, unit: "BOTTLE", price: 4500 },
            { name: "Menzerna German Heavy Cut & Jewelling Polish", quantity: 1, unit: "SET", price: 1100 },
            { name: "German Nappa Leather Conditioner", quantity: 1, unit: "BOTTLE", price: 850 },
            { name: "Ceramic Wheel Face Shield", quantity: 1, unit: "BOTTLE", price: 750 }
        ]),
        inclusions: JSON.stringify([
            "Multi-Stage Contactless Foam Bath & Fine Clay Decontamination",
            "Precision German Rotary Jewelling Paint Correction",
            "Self-Healing TPU PPF on Front High-Impact Zones (Bumper, Bonnet, Fenders, ORVMs)",
            "10H Graphene Ceramic Coating on All Remaining Painted Panels",
            "M-Sport / AMG Alloy Wheels Face Ceramic Coating",
            "Nappa / Dakota Leather Conditioning & Matte Finish Dressing",
            "Glass Hydrophobic Rain Vision Coating on All Windows",
            "5 Years PPF Warranty + 3 Years Ceramic Coating Warranty"
        ]),
        basePrice: 45000,
        sedanPrice: 45000,
        fullSuvPrice: 55000,
        compactSuvPrice: 40000,
        hatchbackPrice: 32000,
        bikePrice: null,
        duration: "3 Days",
        warranty: "5 Years PPF + 3 Years Ceramic",
        hsnSacCode: "9987",
        taxRate: 18,
    }
]

// GET all service packages
export async function GET(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get("category") || ""
        const search = searchParams.get("search") || ""

        const where: any = {}
        if (!ctx.isAdmin) {
            where.OR = [
                { shopId: ctx.shopId },
                { shopId: null }
            ]
        }

        if (category && category !== "ALL") {
            where.category = category
        }

        if (search) {
            where.name = { contains: search }
        }

        let packages = await db.servicePackage.findMany({
            where,
            orderBy: { createdAt: "desc" }
        })

        // Auto-seed default packages if current shop has zero packages
        if (packages.length === 0 && !search && (!category || category === "ALL") && ctx.shopId) {
            const seedData = DEFAULT_PACKAGES.map(pkg => ({
                ...pkg,
                shopId: ctx.shopId,
            }))
            await db.servicePackage.createMany({
                data: seedData
            })
            packages = await db.servicePackage.findMany({
                where: { shopId: ctx.shopId },
                orderBy: { createdAt: "desc" }
            })
        }

        return NextResponse.json({ success: true, packages })
    } catch (err: any) {
        console.error("GET /api/admin/billing/packages error:", err)
        return NextResponse.json({ error: err?.message || "Failed to fetch service packages" }, { status: 500 })
    }
}

// POST create new service package
export async function POST(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            vehicleName,
            name,
            category,
            description,
            inclusions,
            productsUsed,
            laborCharge,
            basePrice,
            hatchbackPrice,
            sedanPrice,
            compactSuvPrice,
            fullSuvPrice,
            bikePrice,
            duration,
            warranty,
            hsnSacCode,
            taxRate
        } = body

        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json({ error: "Package name is required" }, { status: 400 })
        }

        let formattedInclusions: string | null = null
        if (Array.isArray(inclusions)) {
            formattedInclusions = JSON.stringify(inclusions)
        } else if (typeof inclusions === "string") {
            try {
                JSON.parse(inclusions)
                formattedInclusions = inclusions
            } catch {
                const lines = inclusions.split("\n").map(l => l.trim()).filter(Boolean)
                formattedInclusions = JSON.stringify(lines)
            }
        }

        let formattedProductsUsed: string | null = null
        let computedPartsCost = 0
        if (Array.isArray(productsUsed)) {
            formattedProductsUsed = JSON.stringify(productsUsed)
            computedPartsCost = productsUsed.reduce((sum: number, p: any) => sum + ((parseFloat(p.price) || 0) * (parseFloat(p.quantity) || 1)), 0)
        } else if (typeof productsUsed === "string" && productsUsed.trim()) {
            formattedProductsUsed = productsUsed.trim()
            try {
                const parsed = JSON.parse(productsUsed)
                if (Array.isArray(parsed)) {
                    computedPartsCost = parsed.reduce((sum: number, p: any) => sum + ((parseFloat(p.price) || 0) * (parseFloat(p.quantity) || 1)), 0)
                }
            } catch {}
        }

        const lCharge = parseFloat(laborCharge) || 0
        const calculatedPrice = (parseFloat(basePrice) > 0) ? parseFloat(basePrice) : (computedPartsCost + lCharge)

        const newPkg = await db.servicePackage.create({
            data: {
                vehicleName: vehicleName ? vehicleName.trim() : null,
                name: name.trim(),
                category: category || "DETAILING",
                description: description ? description.trim() : null,
                inclusions: formattedInclusions,
                productsUsed: formattedProductsUsed,
                laborCharge: lCharge,
                basePrice: calculatedPrice || 0,
                hatchbackPrice: hatchbackPrice !== undefined && hatchbackPrice !== "" ? parseFloat(hatchbackPrice) : null,
                sedanPrice: sedanPrice !== undefined && sedanPrice !== "" ? parseFloat(sedanPrice) : null,
                compactSuvPrice: compactSuvPrice !== undefined && compactSuvPrice !== "" ? parseFloat(compactSuvPrice) : null,
                fullSuvPrice: fullSuvPrice !== undefined && fullSuvPrice !== "" ? parseFloat(fullSuvPrice) : null,
                bikePrice: bikePrice !== undefined && bikePrice !== "" ? parseFloat(bikePrice) : null,
                duration: duration ? duration.trim() : null,
                warranty: warranty ? warranty.trim() : null,
                hsnSacCode: hsnSacCode ? hsnSacCode.trim() : "9987",
                taxRate: taxRate !== undefined ? parseFloat(taxRate) : 18,
                shopId: ctx.shopId || null,
            }
        })

        return NextResponse.json({ success: true, package: newPkg })
    } catch (err: any) {
        console.error("POST /api/admin/billing/packages error:", err)
        return NextResponse.json({ error: err?.message || "Failed to create package" }, { status: 500 })
    }
}

// PUT update existing service package
export async function PUT(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            id,
            vehicleName,
            name,
            category,
            description,
            inclusions,
            productsUsed,
            laborCharge,
            basePrice,
            hatchbackPrice,
            sedanPrice,
            compactSuvPrice,
            fullSuvPrice,
            bikePrice,
            duration,
            warranty,
            hsnSacCode,
            taxRate,
            isActive
        } = body

        if (!id) {
            return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
        }

        const existing = await db.servicePackage.findUnique({
            where: { id }
        })
        if (!existing) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 })
        }

        if (!ctx.isAdmin && existing.shopId && existing.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        let formattedInclusions: string | null = null
        if (Array.isArray(inclusions)) {
            formattedInclusions = JSON.stringify(inclusions)
        } else if (typeof inclusions === "string") {
            try {
                JSON.parse(inclusions)
                formattedInclusions = inclusions
            } catch {
                const lines = inclusions.split("\n").map(l => l.trim()).filter(Boolean)
                formattedInclusions = JSON.stringify(lines)
            }
        }

        let formattedProductsUsed: string | null = null
        if (Array.isArray(productsUsed)) {
            formattedProductsUsed = JSON.stringify(productsUsed)
        } else if (typeof productsUsed === "string" && productsUsed.trim()) {
            formattedProductsUsed = productsUsed.trim()
        }

        const updated = await db.servicePackage.update({
            where: { id },
            data: {
                ...(vehicleName !== undefined && { vehicleName: vehicleName ? vehicleName.trim() : null }),
                ...(name && { name: name.trim() }),
                ...(category && { category }),
                description: description !== undefined ? (description ? description.trim() : null) : existing.description,
                inclusions: formattedInclusions !== null ? formattedInclusions : existing.inclusions,
                productsUsed: formattedProductsUsed !== null ? formattedProductsUsed : existing.productsUsed,
                laborCharge: laborCharge !== undefined ? parseFloat(laborCharge) || 0 : existing.laborCharge,
                basePrice: basePrice !== undefined ? parseFloat(basePrice) || 0 : existing.basePrice,
                hatchbackPrice: hatchbackPrice !== undefined ? (hatchbackPrice !== "" ? parseFloat(hatchbackPrice) : null) : existing.hatchbackPrice,
                sedanPrice: sedanPrice !== undefined ? (sedanPrice !== "" ? parseFloat(sedanPrice) : null) : existing.sedanPrice,
                compactSuvPrice: compactSuvPrice !== undefined ? (compactSuvPrice !== "" ? parseFloat(compactSuvPrice) : null) : existing.compactSuvPrice,
                fullSuvPrice: fullSuvPrice !== undefined ? (fullSuvPrice !== "" ? parseFloat(fullSuvPrice) : null) : existing.fullSuvPrice,
                bikePrice: bikePrice !== undefined ? (bikePrice !== "" ? parseFloat(bikePrice) : null) : existing.bikePrice,
                duration: duration !== undefined ? (duration ? duration.trim() : null) : existing.duration,
                warranty: warranty !== undefined ? (warranty ? warranty.trim() : null) : existing.warranty,
                hsnSacCode: hsnSacCode !== undefined ? (hsnSacCode ? hsnSacCode.trim() : null) : existing.hsnSacCode,
                taxRate: taxRate !== undefined ? parseFloat(taxRate) : existing.taxRate,
                isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
            }
        })

        return NextResponse.json({ success: true, package: updated })
    } catch (err: any) {
        console.error("PUT /api/admin/billing/packages error:", err)
        return NextResponse.json({ error: err?.message || "Failed to update package" }, { status: 500 })
    }
}

// DELETE service package
export async function DELETE(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) {
            return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
        }

        const existing = await db.servicePackage.findUnique({
            where: { id }
        })
        if (!existing) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 })
        }

        if (!ctx.isAdmin && existing.shopId && existing.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await db.servicePackage.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error("DELETE /api/admin/billing/packages error:", err)
        return NextResponse.json({ error: err?.message || "Failed to delete package" }, { status: 500 })
    }
}
