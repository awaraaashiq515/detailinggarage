export interface EVInsuranceFormData {
    // Customer Details
    customerName: string
    customerMobile: string
    customerEmail: string
    customerCity: string

    // Vehicle Details
    vehicleMake: string
    vehicleModel: string
    vehicleVariant: string
    vehicleYear: string
    vehicleType: string
    fuelType: string
    transmissionType: string
    vehicleColor: string
    registrationNumber: string
    rcNumber: string
    registrationDate: string
    usageType: string
    odometerReading: string
    chassisNumber: string
    motorNumber: string
    engineNumber: string // synched for DB compatibility

    // Dedicated EV Powertrain & Battery System
    batteryCapacity: string
    batterySerialNumber: string
    batteryHealthSoH: string
    chargerType: string
    chargerSerialNumber: string
    evSpecificCover: string[]

    // Insurance Policy Details
    insuranceCompany: string
    policyNumber: string
    policyType: string
    policyStartDate: string
    policyEndDate: string
    policyExpiryDate: string
    claimType: string
    estimatedClaimAmount: string
    idvValue: string
    status: string
    vehicleConditionBefore: string
    previousAccidentHistory: string

    // Incident & Damage Details
    damageAreas: string[]
    incidentDate: string
    incidentLocation: string
    damageDescription: string

    // Notes
    adminNotes: string
}

export const EV_VEHICLE_TYPES = [
    'Electric SUV', 'Electric Sedan', 'Electric Hatchback', 'Electric MUV/MPV',
    'Electric Coupe', 'Electric Two Wheeler', 'Electric Commercial / Fleet', 'Other EV'
]

export const EV_TRANSMISSION_TYPES = ['Single-Speed Automatic', 'Direct Drive (e-CVT)', 'Multi-Speed EV Transmission']

export const EV_USAGE_TYPES = ['Personal / Private', 'Commercial Fleet', 'EV Taxi / Cab', 'Rental / Subscription', 'Government / Corporate']

export const EV_CLAIM_TYPES = [
    'Accident / Collision',
    'Battery Pack Underbody Impact',
    'Water Ingress / Flooding',
    'Charging Port / Electrical Surge Damage',
    'Fire / Thermal Incident',
    'Theft / Parts Theft (Charger/Cables)',
    'Hit and Run',
    'Third Party Property Damage',
    'Vandalism',
    'Other'
]

export const EV_POLICY_TYPES = [
    'Zero Depreciation Comprehensive',
    'Comprehensive + EV Battery Pack Protection',
    'Comprehensive + Wallbox & Cable Shield',
    'Third Party Only',
    'Own Damage (OD) Only'
]

export const EV_INSURANCE_COMPANIES = [
    'ICICI Lombard', 'HDFC ERGO', 'Bajaj Allianz', 'Tata AIG',
    'New India Assurance', 'National Insurance', 'United India Insurance',
    'Oriental Insurance', 'Reliance General', 'SBI General', 'Cholamandalam MS',
    'Royal Sundaram', 'Future Generali', 'Bharti AXA', 'IFFCO Tokio', 'Digit Insurance', 'Acko General'
]

export const EV_SPECIFIC_DAMAGE_AREAS = [
    '⚡ Battery Pack Underbody / Skid Plate',
    '⚡ High Voltage (HV) Cabling & Wiring Harness',
    '⚡ Electric Drive Motor & Reduction Gearbox',
    '⚡ Inverter / Power Electronics Module',
    '⚡ Onboard Charger (OBC) / Charging Socket Port',
    '⚡ Battery Thermal Management Radiator',
    '⚡ Regenerative Braking Actuator / Controller',
    '⚡ Front Bumper & Radar Sensors',
    '⚡ Rear Bumper & Parking Sonar',
    '⚡ Bonnet / Frunk Compartment',
    '⚡ Left Front Door & Wing Mirror',
    '⚡ Right Front Door & Wing Mirror',
    '⚡ Left Rear Door / Panel',
    '⚡ Right Rear Door / Panel',
    '⚡ Roof Panel / Panoramic Glass',
    '⚡ Windshield Glass / ADAS Camera Zone',
    '⚡ Rear Windscreen Glass',
    '⚡ Suspension & EV Under-chassis',
    '⚡ Alloy Wheels & EV Low-Rolling Resistance Tyres',
    '⚡ Interior Screen & Digital Cockpit',
    '⚡ Total Loss / Structural Cell Damage'
]

export const EV_BATTERY_CAPACITY_PRESETS = [
    '19.2 kWh', '24.0 kWh', '30.2 kWh', '35.0 kWh', '40.5 kWh',
    '45.0 kWh', '50.3 kWh', '60.0 kWh', '72.6 kWh', '77.4 kWh', '84.0 kWh', '100.0 kWh'
]

export const EV_BATTERY_SOH_PRESETS = [
    '100%', '98.5%', '95%', '92%', '88%', '85%', 'Under 80% (Warranty Claim)'
]

export const EV_CHARGER_TYPE_PRESETS = [
    'CCS2 DC Fast Combo + 3.3kW Portable AC',
    'Type 2 AC Wallbox (7.2 kW)',
    'Type 2 AC Wallbox (11.0 kW)',
    '15A Portable Emergency 3-Pin Charger (3.3 kW)',
    'CCS2 Ultra-Fast (50kW - 150kW)',
    'Bharat DC-001 (15kW)',
    'Custom / Third Party Wallbox'
]

export const EV_ADDON_COVERS = [
    'Battery Pack & Cell Degradation Shield',
    'Electric Drive Motor & Inverter Breakdown Cover',
    'Charging Cable & Home Wallbox Charger Cover',
    'Zero Depreciation on EV Sensors & High-Voltage Circuitry',
    'Emergency Flatbed Towing to Nearest EV Charging Station',
    'Water Ingress & Electrical Surge Protection',
    'Return to Invoice (RTI) for EV Total Loss',
    'Key & Smart Digital Card Replacement'
]
