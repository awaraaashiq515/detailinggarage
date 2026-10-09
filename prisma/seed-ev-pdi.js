const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    const defaultDocumentation = [
        { id: "item_0", label: "VIN Verification (Chassis plate vs Windshield)", status: "PASS", observation: "Chassis stamping perfectly matches windshield VIN bar" },
        { id: "item_1", label: "Chassis Number Match", status: "PASS", observation: "Under-carpet stamping crisp, zero tamper marks" },
        { id: "item_2", label: "Permanent Magnet Motor Number", status: "PASS", observation: "Motor casing plate stamped MOT-NEX24-8841" },
        { id: "item_3", label: "Battery Identification Number", status: "PASS", observation: "CATL/Tata 40.5kWh pack ID: BAT-LFP-2024-99102" },
        { id: "item_4", label: "Manufacturing Date (Form 21/22)", status: "PASS", observation: "Manufactured August 2026, factory fresh" },
        { id: "item_5", label: "Variant Verification", status: "PASS", observation: "Empowered+ Long Range 40.5 kWh" },
        { id: "item_6", label: "Colour Match & Code", status: "PASS", observation: "Pristine White Dual-Tone with Black Roof" },
        { id: "item_7", label: "Odometer Reading", status: "PASS", observation: "18 km on digital cluster" },
        { id: "item_8", label: "Invoice & Sale Certificate Document", status: "PASS", observation: "Tax invoice matches VIN and GST details" },
        { id: "item_9", label: "Insurance Policy Handover", status: "PASS", observation: "Zero-dep 1+3 year active cover" },
        { id: "item_10", label: "Vehicle Warranty Card", status: "PASS", observation: "3 Year / 1,25,000 km standard coverage" },
        { id: "item_11", label: "High-Voltage Battery Warranty", status: "PASS", observation: "8 Year / 1,60,000 km battery & motor warranty active" },
        { id: "item_12", label: "Roadside Assistance (RSA) Activation", status: "PASS", observation: "Pan-India EV flatbed towing enrolled" },
        { id: "item_13", label: "Registration Documents & High Security Plates", status: "PASS", observation: "Form 20/21/22 verified, Green EV plates applied" }
    ];

    const defaultExterior = [
        { id: "item_0", label: "Bonnet Panel & Shutlines", status: "PASS", observation: "Symmetric 3.5mm gap across both sides" },
        { id: "item_1", label: "Roof Panel & Panoramic Glass", status: "PASS", observation: "Dual-tone black roof finish pristine, glass seal tight" },
        { id: "item_2", label: "Front Left Door", status: "PASS", observation: "Factory clear coat intact, flush handles operate smoothly" },
        { id: "item_3", label: "Front Right Door", status: "PASS", observation: "Zero micro-scratches or orange peel" },
        { id: "item_4", label: "Rear Left Door", status: "PASS", observation: "Hinges factory greased, latch alignment spot-on" },
        { id: "item_5", label: "Rear Right Door", status: "PASS", observation: "Weatherstripping rubber supple, zero wind leak" },
        { id: "item_6", label: "Front Left Fender", status: "PASS", observation: "Uniform clear coat sheen" },
        { id: "item_7", label: "Front Right Fender", status: "PASS", observation: "Wheel arch cladding clipped firmly" },
        { id: "item_8", label: "Left Quarter Panel", status: "PASS", observation: "C-pillar blend smooth" },
        { id: "item_9", label: "Right Quarter Panel", status: "PASS", observation: "Charge port door integration flush" },
        { id: "item_10", label: "Front Bumper & Grille Infill", status: "PASS", observation: "Active cooling shutter louvers test cycled" },
        { id: "item_11", label: "Rear Bumper & Aerodynamic Diffuser", status: "PASS", observation: "Diffuser strakes undamaged, sensors flush" },
        { id: "item_12", label: "Tailgate & Connected LED Lightbar", status: "PASS", observation: "Power tailgate opens/closes smoothly, LED animation clear" },
        { id: "item_13", label: "Panel Gap Uniformity", status: "PASS", observation: "Gap tolerances within ±0.4mm across all panels" },
        { id: "item_14", label: "Paint Uniformity & Gloss (GU)", status: "PASS", observation: "Gloss meter reading 92 GU — showroom finish" },
        { id: "item_15", label: "Scratch Detection (Inspection Bay Lights)", status: "PASS", observation: "Zero transit swirls under dual-beam LED inspection" },
        { id: "item_16", label: "Dent Detection (Digital Line Board)", status: "PASS", observation: "Zero dings or transit ripples" },
        { id: "item_17", label: "Repaint / Respray Detection", status: "PASS", observation: "100% factory original paint" },
        { id: "item_18", label: "Overspray Check", status: "PASS", observation: "Rubbers, glass and plastics pristine" },
        { id: "item_19", label: "Windshield Glass & Sensor Cutouts", status: "PASS", observation: "Acoustic PVB glass, zero stone chips" },
        { id: "item_20", label: "Rear Glass & Defogger Elements", status: "PASS", observation: "All grid lines conducting" },
        { id: "item_21", label: "Side Glass & UV Solar Coating", status: "PASS", observation: "Green tinted UV cut glass confirmed" },
        { id: "item_22", label: "Sunroof / Moonroof Mechanism", status: "PASS", observation: "Anti-pinch safety tested, drain channels clear" },
        { id: "item_23", label: "Door Seals & Weatherstripping", status: "PASS", observation: "Double perimeter seals seated in channel" }
    ];

    const paint16Panels = [
        { panel: "Bonnet (Hood)", reading: "114", status: "PASS" },
        { panel: "Roof Panel", reading: "108", status: "PASS" },
        { panel: "Front Left Fender", reading: "116", status: "PASS" },
        { panel: "Front Right Fender", reading: "118", status: "PASS" },
        { panel: "Front Left Door", reading: "122", status: "PASS" },
        { panel: "Front Right Door", reading: "120", status: "PASS" },
        { panel: "Rear Left Door", reading: "115", status: "PASS" },
        { panel: "Rear Right Door", reading: "117", status: "PASS" },
        { panel: "Left Quarter Panel", reading: "119", status: "PASS" },
        { panel: "Right Quarter Panel", reading: "121", status: "PASS" },
        { panel: "Tailgate / Boot Lid", reading: "110", status: "PASS" },
        { panel: "Front Bumper Upper", reading: "95", status: "PASS" },
        { panel: "Rear Bumper Upper", reading: "98", status: "PASS" },
        { panel: "Left A/B/C Pillars", reading: "104", status: "PASS" },
        { panel: "Right A/B/C Pillars", reading: "106", status: "PASS" },
        { panel: "Running Boards / Rockers", reading: "128", status: "PASS" }
    ];

    const tyres = [
        { position: "Front Left", brand: "Bridgestone", size: "215/60 R16", dot: "2826", treadDepth: "7.6", pressure: "36", sidewallStatus: "PASS" },
        { position: "Front Right", brand: "Bridgestone", size: "215/60 R16", dot: "2826", treadDepth: "7.6", pressure: "36", sidewallStatus: "PASS" },
        { position: "Rear Left", brand: "Bridgestone", size: "215/60 R16", dot: "2826", treadDepth: "7.5", pressure: "36", sidewallStatus: "PASS" },
        { position: "Rear Right", brand: "Bridgestone", size: "215/60 R16", dot: "2826", treadDepth: "7.5", pressure: "36", sidewallStatus: "PASS" },
        { position: "Spare / Repair Kit", brand: "OEM 12V Inflator", size: "Continental Sealant Kit", dot: "2026", treadDepth: "N/A", pressure: "N/A", sidewallStatus: "PASS" }
    ];

    const diagModules = [
        { name: "BMS (Battery Management)", status: "PASS", faultCodes: "0" },
        { name: "VCU (Vehicle Control)", status: "PASS", faultCodes: "0" },
        { name: "MCU (Motor Control)", status: "PASS", faultCodes: "0" },
        { name: "OBC (On-Board Charger)", status: "PASS", faultCodes: "0" },
        { name: "ABS / ESC (Braking Unit)", status: "PASS", faultCodes: "0" },
        { name: "SRS (Airbag Control)", status: "PASS", faultCodes: "0" },
        { name: "BCM (Body Electronics)", status: "PASS", faultCodes: "0" },
        { name: "EPS (Electric Steering)", status: "PASS", faultCodes: "0" },
        { name: "HVAC (Heat Pump / PTC)", status: "PASS", faultCodes: "0" },
        { name: "ADAS (Active Safety Radar)", status: "PASS", faultCodes: "0" },
        { name: "TPMS (Tyre Pressure)", status: "PASS", faultCodes: "0" },
        { name: "GATEWAY (CAN/Ethernet)", status: "PASS", faultCodes: "0" },
        { name: "TELEMATICS (TCU 4G/eSIM)", status: "PASS", faultCodes: "0" },
        { name: "INFOTAINMENT (AVNT)", status: "PASS", faultCodes: "0" }
    ];

    const scores = {
        body: 10,
        tyres: 10,
        underbody: 10,
        battery: 10,
        charging: 10,
        motor: 10,
        electrical: 10,
        brakes: 10,
        interior: 10,
        adas: 10,
        diagnostics: 10
    };

    const inspection = await prisma.eVPDIInspection.create({
        data: {
            vehicleMake: "Tata",
            vehicleModel: "Nexon.ev",
            vehicleVariant: "Empowered+ Long Range 40.5kWh",
            vehicleColor: "Pristine White (Dual Tone)",
            vehicleYear: "2026",
            vin: "MAT624089RFA10928",
            motorNumber: "MOT-NEX24-8841",
            batteryId: "BAT-LFP-2024-99102",
            registrationNumber: "HP-01-EV-2026",
            dealership: "Tata Motors Commercial & Passenger Cars, Shimla",
            odometer: "18",
            manufacturingDate: "08/2026",
            customerName: "Vikramjit Singh",
            customerEmail: "vikramjit.singh@gmail.com",
            customerPhone: "+91 98160 45890",
            inspectionDate: new Date(),
            inspectedBy: "Ritchie",
            adminComments: "Comprehensive EV PDI executed at dealership staging bay. High-voltage battery pack telemetry indicates 100% State of Health (SoH) with an ultra-tight cell-to-cell delta voltage of only 11 mV (spec allowance is <= 20 mV). AC Type-2 latch handshake and CCS2 DC fast-charging handshake both cleared without protocol errors. Digital paint depth scan confirms 100% original OEM coating across all 16 structural steel and aluminum body panels with zero repaint or transit abrasions. Full 14-module ECU scan completed with zero active, pending or historical DTC fault codes. Vehicle cleared 100% for delivery acceptance.",
            batterySoc: "88",
            batterySoh: "100",
            cellVoltageDeviation: "11",
            batteryTemperature: "27",
            hvIsolation: "PASS",
            acChargingResult: "PASS",
            dcChargingResult: "PASS",
            chargingRate: "65",
            activeFaultCodes: "0",
            storedFaultCodes: "0",
            pendingFaultCodes: "0",
            totalFaultCodes: "0",
            documentationData: JSON.stringify({ items: defaultDocumentation }),
            exteriorData: JSON.stringify({ items: defaultExterior }),
            paintThicknessData: JSON.stringify(paint16Panels),
            tyreData: JSON.stringify(tyres),
            diagnosticData: JSON.stringify(diagModules),
            scores: JSON.stringify(scores),
            images: JSON.stringify([
                {
                    id: "img_01",
                    url: "/service-pdi.png",
                    category: "Front Profile & Headlamps",
                    notes: "Front LED lightbar, bumper & ADAS radar in pristine factory condition"
                },
                {
                    id: "img_02",
                    url: "/featured-car.png",
                    category: "Right Side Profile",
                    notes: "Flawless side body panels, zero door dings or paint imperfections"
                },
                {
                    id: "img_03",
                    url: "/service-workshop.png",
                    category: "Underbody & Battery Armor",
                    notes: "HV Battery pack enclosure & composite shield inspected on hoist, zero scrape marks"
                }
            ]),
            finalResult: "PASS",
            status: "COMPLETED"
        }
    });

    console.log("Seeded EV PDI report successfully! ID:", inspection.id);
}

seed().catch(console.error).finally(() => prisma.$disconnect());
