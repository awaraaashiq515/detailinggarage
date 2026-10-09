// EV PDI Types & Constants
import { PDIImageData } from "./pdi-types"

export type EVCheckStatus = "PASS" | "FAIL" | "NA" | "OBSERVATION"

export interface EVCheckItem {
    id: string
    label: string
    status: EVCheckStatus
    observation: string
}

export interface EVSectionData {
    items: EVCheckItem[]
}

export interface PaintThicknessReading {
    panel: string
    reading: string
    status: EVCheckStatus
}

export interface TyreReading {
    position: string
    brand: string
    size: string
    dot: string
    treadDepth: string
    pressure: string
    sidewallStatus: EVCheckStatus
}

export interface DiagnosticModule {
    name: string
    status: EVCheckStatus
    faultCodes: string
}

export interface EVPDIScores {
    body: number
    tyres: number
    underbody: number
    battery: number
    charging: number
    motor: number
    electrical: number
    brakes: number
    interior: number
    adas: number
    diagnostics: number
}

export type EVFinalResult = "PASS" | "PASS_WITH_OBSERVATIONS" | "RECHECK" | "NOT_RECOMMENDED"

export interface EVPDIFormData {
    vehicleMake: string
    vehicleModel: string
    vehicleVariant: string
    vehicleColor: string
    vehicleYear: string
    vin: string
    motorNumber: string
    batteryId: string
    registrationNumber: string
    dealership: string
    odometer: string
    manufacturingDate: string
    customerName: string
    customerEmail: string
    customerPhone: string
    inspectionDate: string
    inspectedBy: string
    adminComments: string
    batterySoc: string
    batterySoh: string
    cellVoltageDeviation: string
    batteryTemperature: string
    hvIsolation: string
    acChargingResult: string
    dcChargingResult: string
    chargingRate: string
    activeFaultCodes: string
    storedFaultCodes: string
    pendingFaultCodes: string
    totalFaultCodes: string
    documentationData: EVSectionData
    exteriorData: EVSectionData
    paintThicknessData: PaintThicknessReading[]
    tyreData: TyreReading[]
    underbodyData: EVSectionData
    batteryData: EVSectionData
    motorData: EVSectionData
    chargingData: EVSectionData
    diagnosticData: DiagnosticModule[]
    electricalData: EVSectionData
    brakingData: EVSectionData
    steeringData: EVSectionData
    interiorData: EVSectionData
    infotainmentData: EVSectionData
    adasData: EVSectionData
    roadTestData: EVSectionData
    scores: EVPDIScores
    finalResult: EVFinalResult
    digitalSignature: string
    customerSignature: string
    dealerSignature: string
    images?: PDIImageData[]
}

function makeItems(labels: string[]): EVCheckItem[] {
    return labels.map((label, i) => ({
        id: `item_${i}`,
        label,
        status: "PASS" as EVCheckStatus,
        observation: "",
    }))
}

export const DEFAULT_DOCUMENTATION_ITEMS = makeItems([
    "VIN Verification","Chassis Number Match","Motor Number","Battery Identification Number",
    "Manufacturing Date","Variant Verification","Colour Match","Odometer Reading",
    "Invoice Document","Insurance Policy","Warranty Card","Battery Warranty",
    "Roadside Assistance (RSA)","Registration Documents",
])

export const DEFAULT_EXTERIOR_ITEMS = makeItems([
    "Bonnet Panel","Roof Panel","Front Left Door","Front Right Door","Rear Left Door","Rear Right Door",
    "Front Left Fender","Front Right Fender","Left Quarter Panel","Right Quarter Panel",
    "Front Bumper","Rear Bumper","Tailgate","Panel Gap Uniformity","Paint Uniformity & Sheen",
    "Scratch Detection","Dent Detection","Repaint / Respray Detection","Overspray Check",
    "Windshield Glass","Rear Glass","Side Glass","Sunroof / Moonroof","Door Seals & Weatherstripping",
])

export const DEFAULT_PAINT_THICKNESS: PaintThicknessReading[] = [
    { panel: "Bonnet (Hood)", reading: "", status: "PASS" },
    { panel: "Roof Panel", reading: "", status: "PASS" },
    { panel: "Front Left Fender", reading: "", status: "PASS" },
    { panel: "Front Right Fender", reading: "", status: "PASS" },
    { panel: "Front Left Door", reading: "", status: "PASS" },
    { panel: "Front Right Door", reading: "", status: "PASS" },
    { panel: "Rear Left Door", reading: "", status: "PASS" },
    { panel: "Rear Right Door", reading: "", status: "PASS" },
    { panel: "Left Quarter Panel", reading: "", status: "PASS" },
    { panel: "Right Quarter Panel", reading: "", status: "PASS" },
    { panel: "Tailgate / Boot Lid", reading: "", status: "PASS" },
    { panel: "Front Bumper Upper", reading: "", status: "PASS" },
    { panel: "Rear Bumper Upper", reading: "", status: "PASS" },
    { panel: "Left A/B/C Pillars", reading: "", status: "PASS" },
    { panel: "Right A/B/C Pillars", reading: "", status: "PASS" },
    { panel: "Running Boards / Rockers", reading: "", status: "PASS" },
]

export const DEFAULT_TYRE_DATA: TyreReading[] = [
    { position: "Front Left", brand: "", size: "", dot: "", treadDepth: "", pressure: "", sidewallStatus: "PASS" },
    { position: "Front Right", brand: "", size: "", dot: "", treadDepth: "", pressure: "", sidewallStatus: "PASS" },
    { position: "Rear Left", brand: "", size: "", dot: "", treadDepth: "", pressure: "", sidewallStatus: "PASS" },
    { position: "Rear Right", brand: "", size: "", dot: "", treadDepth: "", pressure: "", sidewallStatus: "PASS" },
    { position: "Spare / Repair Kit", brand: "", size: "", dot: "", treadDepth: "", pressure: "", sidewallStatus: "PASS" },
]

export const DEFAULT_UNDERBODY_ITEMS = makeItems([
    "Battery Casing Condition","Battery Protection Plate","High-Voltage (HV) Cables",
    "HV Connectors & Terminals","Electric Motor Housing","Reduction Gearbox",
    "Front Suspension Components","Rear Suspension Components","Steering Rack & Components",
    "Brake Lines & Hoses","Coolant Lines (Battery & Motor)","Fluid Leakage Check",
    "Corrosion / Rust Check","Physical / Impact Damage","Transport Damage Assessment",
])

export const DEFAULT_BATTERY_ITEMS = makeItems([
    "Battery Casing Integrity","Battery Mounting & Fasteners","HV Cable Routing",
    "HV Connector Condition","Battery Coolant Lines","Battery Management System (BMS)",
    "State of Charge (SOC)","State of Health (SOH)","Cell Voltage Balance","Cell Deviation",
    "Battery Temperature Reading","Thermal Management System","HV Isolation Test",
    "Insulation Monitoring Device","Battery Fault Codes","Battery Impact Damage","Overheating Indicators",
])

export const DEFAULT_MOTOR_ITEMS = makeItems([
    "Motor Diagnostic Scan","Motor Mounting & Fasteners","Motor Housing Condition",
    "Motor Noise (Idle)","Motor Vibration","Reduction Gearbox Operation","Motor Cooling System",
    "Drive Response (Acceleration)","Forward Drive Test","Reverse Drive Test",
    "Regenerative Braking System","One-Pedal Driving Mode",
])

export const DEFAULT_CHARGING_ITEMS = makeItems([
    "AC Charging Port Condition","DC Fast Charging Port Condition","Charging Flap / Door Operation",
    "Connector Lock Mechanism","Charging Cable (If Included)","Portable Charger (ICCB)",
    "EVSE Communication","AC Charging Function Test","DC Fast Charging Function Test",
    "Charging Speed Verification","Charging Communication Protocol","Charging Fault Codes",
    "Scheduled Charging Feature","Charging Limit Setting","Charging Lock / Security",
])

export const DEFAULT_DIAGNOSTIC_MODULES: DiagnosticModule[] = [
    { name: "BMS", status: "PASS", faultCodes: "" },
    { name: "VCU", status: "PASS", faultCodes: "" },
    { name: "MCU", status: "PASS", faultCodes: "" },
    { name: "OBC", status: "PASS", faultCodes: "" },
    { name: "ABS", status: "PASS", faultCodes: "" },
    { name: "ESC", status: "PASS", faultCodes: "" },
    { name: "SRS", status: "PASS", faultCodes: "" },
    { name: "BCM", status: "PASS", faultCodes: "" },
    { name: "EPS", status: "PASS", faultCodes: "" },
    { name: "HVAC", status: "PASS", faultCodes: "" },
    { name: "ADAS", status: "PASS", faultCodes: "" },
    { name: "TPMS", status: "PASS", faultCodes: "" },
    { name: "GATEWAY", status: "PASS", faultCodes: "" },
    { name: "TELEMATICS", status: "PASS", faultCodes: "" },
    { name: "INFOTAINMENT", status: "PASS", faultCodes: "" },
]

export const DEFAULT_ELECTRICAL_ITEMS = makeItems([
    "12V Auxiliary Battery","DC-DC Converter","Fuse Box & Circuit Protection",
    "Headlights (Low & High Beam)","Daytime Running Lights (DRL)","Front Indicators",
    "Rear Indicators","Brake Lights","Reverse Lights","Hazard Warning Lights","Horn",
    "Front Wipers","Rear Wiper","Washer Fluid Jets","Power Windows","Central Locking",
    "ORVMs (Electric Fold & Adjust)","Interior Lighting",
])

export const DEFAULT_BRAKING_ITEMS = makeItems([
    "Brake Pedal Feel & Travel","Brake Fluid Level","Brake Lines & Hoses",
    "Front Brake Pads","Rear Brake Pads","Front Brake Discs","Rear Brake Discs","Brake Calipers",
    "Electronic Parking Brake","Auto Hold Function","ABS System","ESC / Stability Control",
    "Regenerative Braking Operation","Friction-to-Regen Transition",
])

export const DEFAULT_STEERING_ITEMS = makeItems([
    "Electric Power Steering (EPS)","Steering Response & Feel","Wheel Alignment Visual",
    "Front Shock Absorbers","Rear Shock Absorbers","Coil Springs","Suspension Bushes",
    "Ball Joints","Tie Rods","Wheel Bearings","Suspension Noise Check",
])

export const DEFAULT_INTERIOR_ITEMS = makeItems([
    "Dashboard Condition","Front Seats","Rear Seats","Seat Belts (All Positions)",
    "Door Trims","Roof Liner","Carpets","Floor Mats","Boot / Frunk",
    "Switches & Controls","Touchscreens & Displays","Interior Panels",
    "Scratch / Mark Detection","Rattle & Noise Check","Interior Odour","Fit & Finish Quality",
])

export const DEFAULT_INFOTAINMENT_ITEMS = makeItems([
    "Touchscreen Functionality","Digital Instrument Cluster","Bluetooth Pairing",
    "Apple CarPlay","Android Auto","Navigation System","USB Ports","Wireless Charging Pad",
    "Speaker System","Microphone & Call Quality","Voice Control","OTA Update Capability",
    "Mobile Application Connectivity","Remote Lock / Unlock","Remote Charging Control",
    "Remote Climate Control","Digital Key Feature",
])

export const DEFAULT_ADAS_ITEMS = makeItems([
    "Front Camera","Radar Sensor","Front Parking Sensors","Rear Parking Sensors",
    "360° Surround View Camera","Blind Spot Monitoring","Lane Departure Warning",
    "Lane Keep Assist","Adaptive Cruise Control","Forward Collision Warning",
    "Autonomous Emergency Braking","Rear Cross Traffic Alert","Driver Monitoring System",
    "Traffic Sign Recognition","Camera & Radar Calibration","Airbag System",
    "Seat-Belt Warning System","Child Lock",
])

export const DEFAULT_ROAD_TEST_ITEMS = makeItems([
    "Vehicle Wake-Up & Ready State","Drive Mode Selector","Acceleration Response",
    "Reverse Operation","Steering Precision","Braking Performance","Regenerative Braking Feel",
    "Suspension Comfort","Motor Noise (Under Load)","Wind Noise","Tyre Noise",
    "Cabin Rattles & Vibrations","AC / Heating Performance","HVAC Distribution",
    "Warning Lights (None Expected)","ADAS Functionality","Parking Sensor Accuracy","Reverse Camera Quality",
])

export const DEFAULT_SCORES: EVPDIScores = {
    body: 0, tyres: 0, underbody: 0, battery: 0, charging: 0,
    motor: 0, electrical: 0, brakes: 0, interior: 0, adas: 0, diagnostics: 0,
}

export function getDefaultFormData(): EVPDIFormData {
    return {
        vehicleMake: "", vehicleModel: "", vehicleVariant: "", vehicleColor: "",
        vehicleYear: "", vin: "", motorNumber: "", batteryId: "", registrationNumber: "",
        dealership: "", odometer: "", manufacturingDate: "",
        customerName: "", customerEmail: "", customerPhone: "",
        inspectionDate: new Date().toISOString().split("T")[0],
        inspectedBy: "Ritchie", adminComments: "",
        batterySoc: "", batterySoh: "", cellVoltageDeviation: "", batteryTemperature: "",
        hvIsolation: "PASS", acChargingResult: "PASS", dcChargingResult: "PASS", chargingRate: "",
        activeFaultCodes: "0", storedFaultCodes: "0", pendingFaultCodes: "0", totalFaultCodes: "0",
        documentationData: { items: DEFAULT_DOCUMENTATION_ITEMS },
        exteriorData: { items: DEFAULT_EXTERIOR_ITEMS },
        paintThicknessData: DEFAULT_PAINT_THICKNESS,
        tyreData: DEFAULT_TYRE_DATA,
        underbodyData: { items: DEFAULT_UNDERBODY_ITEMS },
        batteryData: { items: DEFAULT_BATTERY_ITEMS },
        motorData: { items: DEFAULT_MOTOR_ITEMS },
        chargingData: { items: DEFAULT_CHARGING_ITEMS },
        diagnosticData: DEFAULT_DIAGNOSTIC_MODULES,
        electricalData: { items: DEFAULT_ELECTRICAL_ITEMS },
        brakingData: { items: DEFAULT_BRAKING_ITEMS },
        steeringData: { items: DEFAULT_STEERING_ITEMS },
        interiorData: { items: DEFAULT_INTERIOR_ITEMS },
        infotainmentData: { items: DEFAULT_INFOTAINMENT_ITEMS },
        adasData: { items: DEFAULT_ADAS_ITEMS },
        roadTestData: { items: DEFAULT_ROAD_TEST_ITEMS },
        scores: { ...DEFAULT_SCORES },
        finalResult: "PASS",
        digitalSignature: "", customerSignature: "", dealerSignature: "",
        images: [],
    }
}
