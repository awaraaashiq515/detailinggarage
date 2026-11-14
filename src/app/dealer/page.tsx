"use client"

import { useState, useRef, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import Link from "next/link"
import {
  Check,
  CheckCircle2,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Building,
  User,
  Coins,
  MapPin,
  Sliders,
  FileText,
  Loader2,
  Sparkles,
  ExternalLink,
  Laptop,
  Printer,
  Shield,
  Gauge,
  Zap,
  Wrench,
  Search,
  Package,
  Layers,
  Car,
  Camera,
  AlertCircle
} from "lucide-react"

/* ─── CONSTANTS & OPTIONS ─── */
const ROADMAP_STEPS = [
  "1 Apply",
  "2 Screening call",
  "3 Evaluation & site visit",
  "4 Quote & LOI",
  "5 Agreement",
  "6 Setup & training",
  "7 Launch"
]

const WIZARD_STEPS = [
  { id: "mobile", label: "Verify mobile", icon: "✓" },
  { id: "about", label: "About you", icon: "👤" },
  { id: "business", label: "Business", icon: "🏢" },
  { id: "finance", label: "Finance & team", icon: "💰" },
  { id: "premises", label: "Premises & territory", icon: "📍" },
  { id: "customize", label: "Customize", icon: "🧩" },
  { id: "terms", label: "Terms", icon: "📋" },
  { id: "review", label: "Review", icon: "✓" },
]

const ROLES_LIST = [
  "Sole Owner / Proprietor",
  "Partner",
  "Managing Partner",
  "Director / Co-Founder",
  "Franchisee Operator",
  "Investor / Non-active",
  "Other"
]

const STATES_LIST = [
  "Himachal Pradesh",
  "Punjab",
  "Chandigarh (UT)",
  "Haryana",
  "Uttarakhand",
  "Delhi NCR",
  "Jammu & Kashmir",
  "Rajasthan",
  "Uttar Pradesh",
  "Other"
]

const QUALIFICATIONS_LIST = [
  "Below 10th",
  "10th / 12th",
  "ITI / Diploma (Automobile / Mechanical)",
  "Graduate",
  "Engineer",
  "MBA / Postgraduate",
  "Other"
]

const YEARS_IN_AUTO_LIST = [
  "None — new to auto",
  "Under 2 years",
  "2–5 years",
  "5–10 years",
  "10+ years"
]

const HEAR_ABOUT_US_LIST = [
  "Google Search",
  "Instagram / Facebook",
  "YouTube",
  "From a Friend / Referral",
  "Saw a Detailing Garage Studio",
  "Newspaper / Media",
  "Other"
]

const CONSTITUTION_LIST = [
  "Proprietorship",
  "Partnership",
  "LLP",
  "Private Limited",
  "One Person Company (OPC)",
  "Trust / Society",
  "Not registered yet"
]

const BUSINESS_ACTIVITIES = [
  "Authorised car dealership (OEM)",
  "Two-wheeler dealership",
  "Used car dealer",
  "Multi-brand workshop / garage",
  "Detailing studio / car wash",
  "Accessories store",
  "Spare parts / distributor",
  "Tyres & alignment",
  "Insurance / finance agent",
  "Non-automotive business",
  "None yet"
]

const OUTLETS_COUNT = [
  "0 (Starting first)",
  "1",
  "2–3",
  "4–5",
  "6+"
]

const TURNOVER_LAST_FY = [
  "Not started yet",
  "Below ₹25 lakh",
  "₹25 lakh – ₹50 lakh",
  "₹50 lakh – ₹1 crore",
  "₹1 crore – ₹3 crore",
  "₹3 crore – ₹5 crore",
  "₹5 crore+"
]

const TURNOVER_TREND = [
  "Growing (20%+ per year)",
  "Stable / Steady",
  "Declining",
  "New business"
]

const NET_WORTH_LIST = [
  "Below ₹25 lakh",
  "₹25 lakh – ₹50 lakh",
  "₹50 lakh – ₹1 crore",
  "₹1 crore – ₹2.5 crore",
  "₹2.5 crore – ₹5 crore",
  "₹5 crore+"
]

const INVESTMENT_CAPACITY = [
  "Below ₹5 lakh",
  "₹5 lakh – ₹15 lakh",
  "₹15 lakh – ₹25 lakh",
  "₹25 lakh – ₹40 lakh",
  "₹40 lakh – ₹75 lakh",
  "₹75 lakh+"
]

const SOURCE_OF_FUNDS = [
  "Own funds",
  "Bank loan / business credit",
  "Family / partner investment",
  "Seeking investor / loan"
]

const EMPLOYEES_COUNT = [
  "0 (new)",
  "1–3",
  "4–8",
  "9–15",
  "16–30",
  "30+"
]

const VEHICLES_PER_MONTH = [
  "None yet",
  "1–25",
  "25–50",
  "50–100",
  "100–250",
  "250+"
]

const PREMISES_STATUS_LIST = [
  "Owned",
  "Rented / Leased",
  "Under negotiation",
  "Looking for location",
  "Need DG guidance"
]

const LOCATION_TYPE_LIST = [
  "National / state highway",
  "Main city commercial road",
  "Auto market / transport area",
  "Industrial area",
  "Residential with commercial approval",
  "Other"
]

const POWER_CONNECTION_LIST = [
  "Single phase (up to 5 kW)",
  "Three phase (up to 15 kW)",
  "Three phase (15 kW – 30 kW)",
  "Commercial high-load (30 kW+)",
  "Need to apply"
]

const WATER_DRAINAGE_LIST = [
  "Municipal supply + borewell + commercial drainage",
  "Commercial borewell + drainage",
  "Water tanker + drainage",
  "Need to arrange"
]

const START_TIMELINE_LIST = [
  "Immediately (within 15 days)",
  "Within 1 month",
  "Within 1–3 months",
  "3–6 months",
  "Just exploring"
]

const DEALERSHIPS_NEARBY = [
  "0–2 dealerships",
  "3–5 dealerships",
  "6–10 dealerships",
  "10+ dealerships"
]

const MODELS_DATA = [
  {
    id: "model-1",
    title: "Model 1 — PDI Basic",
    subtitle: "Mobile PDI professional",
    req: "No showroom needed — works at dealerships",
    icon: "🔍"
  },
  {
    id: "model-2",
    title: "Model 2 — PDI + Detailing",
    subtitle: "Detailing studio with PDI",
    req: "Showroom minimum 2,000 sq ft",
    icon: "💎"
  },
  {
    id: "model-3",
    title: "Model 3 — Detailing Garage",
    subtitle: "Full workshop + body shop",
    req: "Workshop minimum 5,000 sq ft",
    icon: "🏭"
  },
  {
    id: "model-4",
    title: "Model 4 — Used Car & Software",
    subtitle: "Used-car franchise platform",
    req: "Office / small yard",
    icon: "💻"
  },
  {
    id: "custom",
    title: "Custom package",
    subtitle: "Build your own from everything we offer",
    req: "Flexible setup tailored to your plan",
    icon: "🧩"
  }
]

const SOFTWARE_ITEMS = [
  { id: "pdi-app", name: "PDI app — 7 vehicle types", desc: "Checklists, photos, AI customer report, PDF", unit: "licence", defaultQty: 1 },
  { id: "billing-gst", name: "Billing & GST invoicing", desc: "Invoices, payments, GST split", unit: "licence", defaultQty: 1 },
  { id: "crm-leads", name: "CRM & leads", desc: "Enquiries, follow-ups, WhatsApp", unit: "licence", defaultQty: 1 },
  { id: "job-cards", name: "Job cards & live bay board", desc: "Workshop flow, customer tracking & estimate approval", unit: "licence", defaultQty: 0 },
  { id: "insurance-desk", name: "Insurance claims desk", desc: "Claims, surveyor, customer liability", unit: "licence", defaultQty: 0 },
  { id: "warranty-mgr", name: "Warranty manager", desc: "Ceramic / PPF warranty + yearly inspections", unit: "licence", defaultQty: 1 },
  { id: "stock-purchase", name: "Stock & purchase", desc: "Purchase orders, vendor portal", unit: "licence", defaultQty: 0 },
  { id: "marketplace-store", name: "Marketplace store", desc: "Sell parts & accessories online", unit: "licence", defaultQty: 0 },
  { id: "used-car-mod", name: "Used-car module", desc: "Listings, PDI, mechanic & RSA finder", unit: "licence", defaultQty: 0 },
  { id: "social-garage", name: "SocialGarage", desc: "Social media manager for 14 networks", unit: "licence", defaultQty: 1 },
  { id: "ai-manager", name: "AI Manager", desc: "Daily brief, lead replies, captions", unit: "licence", defaultQty: 0 },
  { id: "hiring-verify", name: "Hiring & DG Verify", desc: "Jobs, resumes, staff verification", unit: "licence", defaultQty: 0 },
  { id: "city-website", name: "City website & booking page", desc: "Your own page on detailinggarage.in", unit: "licence", defaultQty: 0 },
  { id: "customer-app", name: "Customer app", desc: "Reports, warranties, invoices for customers", unit: "licence", defaultQty: 0 }
]

const EQUIPMENT_ITEMS = [
  { id: "obd-scanner", cat: "Diagnostics", name: "Professional OBD scanner (all brands)", desc: "Autel MaxiSys / Launch X-431 / XTOOL D-series / Bosch KTS / TEXA · Full-system scan, read & clear codes, live data", unit: "unit", defaultQty: 1 },
  { id: "ev-scanner", cat: "Diagnostics", name: "EV scanner with battery SOH", desc: "Autel MS909EV / Ultra EV (EVDiag box) • XTOOL D9EV • Launch EV · HV system scan + battery SOC/SOH, cell voltage & temperature", unit: "unit", defaultQty: 1 },
  { id: "battery-tester", cat: "Diagnostics", name: "Battery, starter & alternator tester", desc: "Midtronics • Topdon BT200/BT600 • Autel MaxiBAS BT608 • Konnwei · 12V/24V battery health, cranking & charging test", unit: "unit", defaultQty: 1 },
  { id: "paint-gauge", cat: "Body & Paint Inspection", name: "Paint thickness gauge (ferrous + non-ferrous)", desc: "Elcometer • DeFelsko PosiTector • Landtek / Huatec · Detects repaint, filler & panel replacement", unit: "unit", defaultQty: 1 },
  { id: "inspection-light", cat: "Body & Paint Inspection", name: "Paint inspection light", desc: "Scangrip MultiMatch / SunMatch • Rupes LL150 swirl finder • 3M · Daylight-matched light to spot swirls, overspray & colour mismatch", unit: "unit", defaultQty: 1 },
  { id: "dent-reflector", cat: "Body & Paint Inspection", name: "LED dent reflector / line board", desc: "PDR LED line board (portable) · Shows dents & waves in panels", unit: "unit", defaultQty: 1 },
  { id: "tread-gauge", cat: "Body & Paint Inspection", name: "Digital tyre tread depth gauge", desc: "Digital depth gauge • Topdon · Tread depth on all tyres incl. spare", unit: "unit", defaultQty: 1 },
  { id: "pressure-gauge", cat: "Body & Paint Inspection", name: "Tyre pressure gauge & DOT reader", desc: "Digital pressure gauge · Pressure + tyre manufacturing week/year", unit: "unit", defaultQty: 1 },
  { id: "app-console", cat: "Reporting & Office", name: "AI report console — Detailing Garage app", desc: "Detailing Garage PDI app (this system) · 7 PDI checklists, readings, PDF reports, WhatsApp sharing, CRM & billing", unit: "unit", defaultQty: 1 },
  { id: "laptop", cat: "Reporting & Office", name: "Laptop", desc: "Any Intel i5 / Ryzen 5, 8–16 GB RAM · Runs app, scanner software & printing", unit: "unit", defaultQty: 1 },
  { id: "printer", cat: "Reporting & Office", name: "Colour printer", desc: "Epson EcoTank • HP Smart Tank • Canon PIXMA G · Printed reports, quotations & certificates", unit: "unit", defaultQty: 1 },
  { id: "kit-bag", cat: "Reporting & Office", name: "Branded PDI kit bag, uniform & ID card", desc: "Detailing Garage branding · Professional look at dealerships", unit: "unit", defaultQty: 1 }
]

const SERVICES_OFFERED_LIST = [
  "New car PDI",
  "EV PDI",
  "Used car PDI",
  "Bike PDI",
  "Truck & bus PDI",
  "Foam wash & interior detailing",
  "Paint correction & polishing",
  "Ceramic coating",
  "Graphene coating",
  "PPF installation",
  "Music systems & audio",
  "Accessories fitting",
  "4×4 & modification",
  "Denting & painting",
  "Mechanical service",
  "Insurance claims",
  "24×7 roadside assistance",
  "Spare parts supply"
]

const BRANDING_ITEMS = [
  { id: "gmb-setup", name: "Google Business setup & reviews kit", desc: "Optimised profile & review QR cards", unit: "kit", defaultQty: 1 },
  { id: "social-launch", name: "Social media launch kit (30 posts)", desc: "Branded graphics & introductory reels", unit: "kit", defaultQty: 1 },
  { id: "van-wrap", name: "Mobile PDI van wrap", desc: "Full or half vehicle branding wrap design", unit: "vehicle", defaultQty: 1 }
]

const TRAINING_ITEMS = [
  { id: "pdi-cert", name: "PDI inspector certification", desc: "Comprehensive classroom & live dealership training", unit: "person", defaultQty: 2 },
  { id: "software-train", name: "Software training", desc: "Complete workshop CRM & inspection software walkthrough", unit: "sessions", defaultQty: 1 }
]

export default function BecomeADealerPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(1) // Step 1: "About you" default active as in screenshot
  const termsScrollRef = useRef<HTMLDivElement>(null)
  const [termsScrolledToBottom, setTermsScrolledToBottom] = useState(false)

  // Full Wizard State
  const [formData, setFormData] = useState({
    // Step 0: Verify mobile
    fullName: "Ritesh Grover",
    mobile: "+91 8679800074",
    email: "rishi00074@gmail.com",
    isMobileVerified: true,

    // Step 1: About you
    role: "Partner",
    alternateMobile: "",
    address: "Opposite Rani Ki bain Gutkar mandi Hp Pin Code 175001",
    city: "Mandi",
    district: "Mandi",
    state: "Himachal Pradesh",
    pincode: "175001",
    highestQualification: "Graduate",
    yearsInAuto: "Under 2 years",
    currentOccupation: "Auto care & car wash entrepreneur",
    howDidYouHear: "Google Search",
    whyPartner: "High regional demand for certified PDI and luxury ceramic detailing in Himachal.",

    // Step 2: Your business
    applyingAs: "Existing business", // "Existing business" | "New business (not yet started)"
    legalName: "sfsfsf",
    tradeName: "sdfsdf",
    constitution: "Proprietorship",
    yearEstablished: "2015",
    gstRegistered: "Yes",
    pan: "02BMAPG7310Q",
    udyamNumber: "UDYAM-HP-00-0000000",
    cinNumber: "",
    activities: ["Detailing studio / car wash"] as string[],
    brandAssociations: "",
    outletsCount: "1",
    websiteListing: "https://detailinggarage.in",
    otherFranchises: "None",

    // Step 3: Finance & team
    turnoverLastFY: "Not started yet",
    turnoverTrend: "Growing (20%+ per year)",
    netWorth: "Below ₹25 lakh",
    investmentCapacity: "Below ₹5 lakh",
    sourceOfFunds: "Own funds",
    existingLoans: "No",
    employeesCount: "0 (new)",
    techniciansCount: "0",
    vehiclesPerMonth: "None yet",
    softwareUsed: "Excel",
    insolventHistory: "No",
    legalDisputes: "No",

    // Step 4: Premises & territory
    premisesStatus: "Owned",
    locationType: "National / state highway",
    coveredArea: "3000",
    openArea: "1500",
    roadFrontage: "45",
    workshopBays: "2",
    powerConnection: "Three phase (up to 15 kW)",
    waterDrainage: "Municipal supply + borewell + commercial drainage",
    proposedSiteAddress: "Gutkar NH-21, Mandi (HP)",
    targetTerritory: "Mandi District (Exclusive)",
    territoryPreference: "Exclusive",
    startTimeline: "Within 1 month",
    dealershipsNearby: "6–10 dealerships",
    ref1Name: "SDF - Banker",
    ref1Phone: "+91 98160 00000",
    ref2Name: "ADSF - Supplier",
    ref2Phone: "+91 98160 11111",
    premisesPhotosCount: 0,

    // Step 5: Choose your model & customize
    selectedModel: "model-1", // Model 1 — PDI Basic
    activeCustomizeSubTab: "software", // "software" | "equipment" | "services" | "branding" | "training"
    softwareQuantities: {
      "pdi-app": 1,
      "billing-gst": 1,
      "crm-leads": 1,
      "warranty-mgr": 1,
      "social-garage": 1
    } as Record<string, number>,
    equipmentQuantities: {
      "obd-scanner": 1,
      "ev-scanner": 1,
      "battery-tester": 1,
      "paint-gauge": 1,
      "inspection-light": 1,
      "dent-reflector": 1,
      "tread-gauge": 1,
      "pressure-gauge": 1,
      "app-console": 1,
      "laptop": 1,
      "printer": 1,
      "kit-bag": 1
    } as Record<string, number>,
    servicesOffered: ["New car PDI", "EV PDI", "Used car PDI"] as string[],
    brandingQuantities: {
      "gmb-setup": 1,
      "social-launch": 1,
      "van-wrap": 1
    } as Record<string, number>,
    trainingQuantities: {
      "pdi-cert": 2,
      "software-train": 1
    } as Record<string, number>,
    extraPackageNotes: "",

    // Step 6: Terms
    agreedTerms: true,
    declaredTrue: true,
    consentDataProcessing: true,
    signatureName: "Ritesh Grover",
    signatureDate: "2026-11-14",
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [trackingModal, setTrackingModal] = useState(false)

  // Track scroll on terms box
  const handleTermsScroll = () => {
    if (!termsScrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = termsScrollRef.current
    if (scrollTop + clientHeight >= scrollHeight - 30) {
      setTermsScrolledToBottom(true)
    }
  }

  // Pre-select model presets
  const handleModelSelect = (modelId: string) => {
    setFormData(prev => {
      let sw = { ...prev.softwareQuantities }
      let eq = { ...prev.equipmentQuantities }
      let srv = [...prev.servicesOffered]

      if (modelId === "model-1") {
        sw = { "pdi-app": 1, "billing-gst": 1, "crm-leads": 1, "warranty-mgr": 1, "social-garage": 1 }
        srv = ["New car PDI", "EV PDI", "Used car PDI"]
      } else if (modelId === "model-2") {
        sw = { "pdi-app": 1, "billing-gst": 1, "crm-leads": 1, "job-cards": 1, "warranty-mgr": 1, "social-garage": 1, "customer-app": 1 }
        srv = ["New car PDI", "EV PDI", "Used car PDI", "Ceramic coating", "Graphene coating", "PPF installation"]
      } else if (modelId === "model-3") {
        sw = { "pdi-app": 2, "billing-gst": 1, "crm-leads": 1, "job-cards": 1, "insurance-desk": 1, "warranty-mgr": 1, "stock-purchase": 1, "social-garage": 1 }
        srv = ["New car PDI", "EV PDI", "Ceramic coating", "PPF installation", "Paint correction & polishing", "Denting & painting", "Mechanical service"]
      }

      return {
        ...prev,
        selectedModel: modelId,
        softwareQuantities: sw,
        equipmentQuantities: eq,
        servicesOffered: srv
      }
    })
  }

  const toggleActivity = (act: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(act)
        ? prev.activities.filter(a => a !== act)
        : [...prev.activities, act]
    }))
  }

  const toggleServiceOffer = (svc: string) => {
    setFormData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(svc)
        ? prev.servicesOffered.filter(s => s !== svc)
        : [...prev.servicesOffered, svc]
    }))
  }

  const updateSoftwareQty = (id: string, delta: number) => {
    setFormData(prev => ({
      ...prev,
      softwareQuantities: {
        ...prev.softwareQuantities,
        [id]: Math.max(0, (prev.softwareQuantities[id] || 0) + delta)
      }
    }))
  }

  const updateEquipmentQty = (id: string, delta: number) => {
    setFormData(prev => ({
      ...prev,
      equipmentQuantities: {
        ...prev.equipmentQuantities,
        [id]: Math.max(0, (prev.equipmentQuantities[id] || 0) + delta)
      }
    }))
  }

  // Count total selected items in kit
  const totalKitItems =
    Object.values(formData.softwareQuantities).reduce((a, b) => a + (b > 0 ? 1 : 0), 0) +
    Object.values(formData.equipmentQuantities).reduce((a, b) => a + (b > 0 ? 1 : 0), 0) +
    formData.servicesOffered.length +
    Object.values(formData.brandingQuantities).reduce((a, b) => a + (b > 0 ? 1 : 0), 0) +
    Object.values(formData.trainingQuantities).reduce((a, b) => a + (b > 0 ? 1 : 0), 0)

  const handleSubmitApplication = async () => {
    setSubmitting(true)
    try {
      await fetch("/api/dealer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07090b] text-white selection:bg-[#16acd4]/30 selection:text-[#16acd4]">
      <Navbar />

      {/* ── Top Header Section ── */}
      <section
        className="pt-32 pb-8 px-6 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at 65% 0%, rgba(22,172,212,0.15) 0%, transparent 60%), #07090b"
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Cursive Eyebrow */}
          <p
            className="text-lg sm:text-xl text-[#16acd4] mb-1"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Detailing Garage™ Partner Programme
          </p>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none mb-3 uppercase"
            style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
          >
            BECOME A <span style={{ color: "#16acd4" }}>DEALER</span>
          </h1>

          <p
            className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-3xl"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Apply in about 10 minutes. Choose your model and the exact modules, equipment and support you want – we send you a personalised quote.
          </p>

          {/* ── 7 Milestones Roadmap Strip ── */}
          <div className="mt-8 flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {ROADMAP_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-semibold tracking-wider whitespace-nowrap border shrink-0"
                style={
                  idx === 0
                    ? { background: "#0e1316", borderColor: "#16acd4", color: "#16acd4" }
                    : { background: "#0e1316", borderColor: "#1a2328", color: "#71717a" }
                }
              >
                <span>{step}</span>
              </div>
            ))}
          </div>

          {/* ── Step Wizard Navigation Pills (8 Steps) ── */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {WIZARD_STEPS.map((s, idx) => {
              const isActive = currentStepIndex === idx
              const isPast = idx < currentStepIndex
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap border shrink-0"
                  style={
                    isActive
                      ? {
                          background: "#16acd4",
                          borderColor: "#16acd4",
                          color: "#07090b",
                          boxShadow: "0 0 18px rgba(22,172,212,0.35)"
                        }
                      : isPast
                      ? {
                          background: "rgba(22,172,212,0.1)",
                          borderColor: "rgba(22,172,212,0.3)",
                          color: "#16acd4"
                        }
                      : {
                          background: "#0a1317",
                          borderColor: "#1a2328",
                          color: "#71717a"
                        }
                  }
                >
                  <span className="text-[12px]">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Main Two Column Wizard Container ── */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: Form Steps ── */}
          <div
            className="lg:col-span-8 rounded-2xl p-6 sm:p-9 border shadow-2xl"
            style={{
              background: "#0a1317",
              borderColor: "#1a2328"
            }}
          >
            {submitted ? (
              <div className="py-14 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-[#16acd4]/15 border border-[#16acd4]/40 flex items-center justify-center mx-auto text-[#16acd4]">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3
                  className="text-3xl font-black uppercase tracking-tight text-white font-display"
                  style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
                >
                  APPLICATION SUBMITTED SUCCESSFULLY!
                </h3>
                <p className="text-zinc-400 text-sm max-w-md mx-auto" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Thank you, <span className="text-white font-bold">{formData.fullName}</span>! Your dealership application has been submitted for <span className="text-[#16acd4] font-bold">{formData.city}, {formData.state}</span>. Our franchise team will review your dossier and contact you within 24 hours.
                </p>
                <div className="pt-4 flex items-center justify-center gap-3">
                  <a
                    href="https://wa.me/918679800074?text=Hi%20Detailing%20Garage%2C%20I%20have%20submitted%20my%20Dealer%20Application."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                    style={{ background: "#16acd4", color: "#07090b" }}
                  >
                    Direct WhatsApp Connect
                  </a>
                </div>
              </div>
            ) : (
              <div>
                {/* ──────────────── STEP 0: VERIFY MOBILE ──────────────── */}
                {currentStepIndex === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-1" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
                        VERIFY MOBILE NUMBER
                      </h2>
                      <p className="text-zinc-400 text-xs sm:text-sm">
                        Enter your primary WhatsApp mobile number to start your application.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                          FULL LEGAL NAME *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={e => setFormData(f => ({ ...f, fullName: e.target.value }))}
                          className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#16acd4]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                          MOBILE NUMBER (WHATSAPP ENABLED) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.mobile}
                          onChange={e => setFormData(f => ({ ...f, mobile: e.target.value }))}
                          className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#16acd4]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                          EMAIL ADDRESS
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                          className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#16acd4]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStepIndex(1)}
                      className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
                      style={{ background: "#16acd4", color: "#07090b" }}
                    >
                      <span>Continue to About You</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ──────────────── STEP 1: ABOUT YOU (Screenshot 1 & 2) ──────────────── */}
                {currentStepIndex === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-1" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
                        ABOUT YOU
                      </h2>
                      <p className="text-zinc-400 text-xs sm:text-sm">
                        The person who will own and run the dealership.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Role & Alternate Mobile */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            YOUR ROLE IN THE BUSINESS <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.role}
                              onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {ROLES_LIST.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            ALTERNATE MOBILE
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. 98160-XXXXX"
                            value={formData.alternateMobile}
                            onChange={e => setFormData(f => ({ ...f, alternateMobile: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4]"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                          ADDRESS <span className="text-[#16acd4]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                          className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4]"
                        />
                      </div>

                      {/* City, District, State */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            CITY / TOWN <span className="text-[#16acd4]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.city}
                            onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            DISTRICT <span className="text-[#16acd4]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.district}
                            onChange={e => setFormData(f => ({ ...f, district: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            STATE <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.state}
                              onChange={e => setFormData(f => ({ ...f, state: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {STATES_LIST.map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Pin code, Qualification, Years in Industry */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            PIN CODE <span className="text-[#16acd4]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.pincode}
                            onChange={e => setFormData(f => ({ ...f, pincode: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            HIGHEST QUALIFICATION
                          </label>
                          <div className="relative">
                            <select
                              value={formData.highestQualification}
                              onChange={e => setFormData(f => ({ ...f, highestQualification: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {QUALIFICATIONS_LIST.map(q => (
                                <option key={q} value={q}>{q}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            YEARS IN AUTO INDUSTRY <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.yearsInAuto}
                              onChange={e => setFormData(f => ({ ...f, yearsInAuto: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {YEARS_IN_AUTO_LIST.map(y => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Current Occupation & How did you hear */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            CURRENT OCCUPATION <span className="text-[#16acd4]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Run a car wash in Kangra"
                            value={formData.currentOccupation}
                            onChange={e => setFormData(f => ({ ...f, currentOccupation: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            HOW DID YOU HEAR ABOUT US?
                          </label>
                          <div className="relative">
                            <select
                              value={formData.howDidYouHear}
                              onChange={e => setFormData(f => ({ ...f, howDidYouHear: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {HEAR_ABOUT_US_LIST.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Why do you want to partner */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                          WHY DO YOU WANT TO PARTNER WITH DETAILING GARAGE? <span className="text-[#16acd4]">*</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Your plan, local demand, what you bring to the partnership..."
                          value={formData.whyPartner}
                          onChange={e => setFormData(f => ({ ...f, whyPartner: e.target.value }))}
                          className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#1a2328]">
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(0)}
                        className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#1a2328] hover:bg-white/5 text-zinc-400 flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(2)}
                        className="flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(22,172,212,0.25)]"
                        style={{ background: "#16acd4", color: "#07090b" }}
                      >
                        <span>Save &amp; continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ──────────────── STEP 2: YOUR BUSINESS ──────────────── */}
                {currentStepIndex === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-1" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
                        YOUR BUSINESS
                      </h2>
                      <p className="text-zinc-400 text-xs sm:text-sm">
                        Registration and background details of your existing or proposed entity.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Applying as */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                          APPLYING AS <span className="text-[#16acd4]">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {["Existing business", "New business (not yet started)"].map(opt => (
                            <button
                              type="button"
                              key={opt}
                              onClick={() => setFormData(f => ({ ...f, applyingAs: opt }))}
                              className="px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold text-left transition-all"
                              style={
                                formData.applyingAs === opt
                                  ? { background: "rgba(22,172,212,0.15)", borderColor: "#16acd4", color: "#16acd4" }
                                  : { background: "#07090b", borderColor: "#1a2328", color: "#a1a1aa" }
                              }
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Legal & Trade Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            LEGAL NAME OF BUSINESS <span className="text-[#16acd4]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="As on GST / registration"
                            value={formData.legalName}
                            onChange={e => setFormData(f => ({ ...f, legalName: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            TRADE / BRAND NAME
                          </label>
                          <input
                            type="text"
                            value={formData.tradeName}
                            onChange={e => setFormData(f => ({ ...f, tradeName: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>
                      </div>

                      {/* Constitution & Year Established */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            CONSTITUTION <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.constitution}
                              onChange={e => setFormData(f => ({ ...f, constitution: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {CONSTITUTION_LIST.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            YEAR ESTABLISHED <span className="text-[#16acd4]">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2016"
                            value={formData.yearEstablished}
                            onChange={e => setFormData(f => ({ ...f, yearEstablished: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>
                      </div>

                      {/* GST & PAN */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            GST REGISTERED? <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="flex gap-4 pt-1">
                            {["Yes", "No / not yet"].map(opt => (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm">
                                <input
                                  type="radio"
                                  name="gstRegistered"
                                  checked={formData.gstRegistered === opt}
                                  onChange={() => setFormData(f => ({ ...f, gstRegistered: opt }))}
                                  className="text-[#16acd4] focus:ring-[#16acd4]"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            PAN (BUSINESS OR PROPRIETOR) <span className="text-[#16acd4]">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="ABCDE1234F"
                            value={formData.pan}
                            onChange={e => setFormData(f => ({ ...f, pan: e.target.value.toUpperCase() }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] font-mono"
                          />
                          <p className="text-[10px] text-zinc-500 mt-1">
                            Only the last 4 characters are stored now; full documents are collected after shortlisting.
                          </p>
                        </div>
                      </div>

                      {/* Udyam & CIN */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            UDYAM (MSME) NUMBER
                          </label>
                          <input
                            type="text"
                            placeholder="UDYAM-HP-00-0000000"
                            value={formData.udyamNumber}
                            onChange={e => setFormData(f => ({ ...f, udyamNumber: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            CIN / LLPIN
                          </label>
                          <input
                            type="text"
                            value={formData.cinNumber}
                            onChange={e => setFormData(f => ({ ...f, cinNumber: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] font-mono"
                          />
                        </div>
                      </div>

                      {/* Current business activities */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                          CURRENT BUSINESS ACTIVITIES <span className="text-[#16acd4]">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {BUSINESS_ACTIVITIES.map(act => {
                            const isSelected = formData.activities.includes(act)
                            return (
                              <button
                                type="button"
                                key={act}
                                onClick={() => toggleActivity(act)}
                                className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all"
                                style={
                                  isSelected
                                    ? { background: "rgba(22,172,212,0.18)", borderColor: "#16acd4", color: "#16acd4" }
                                    : { background: "#07090b", borderColor: "#1a2328", color: "#a1a1aa" }
                                }
                              >
                                {isSelected ? "✓ " : ""}{act}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Associations, Outlets & Link */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            OEM / BRAND ASSOCIATIONS
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Maruti Suzuki dealer since 2015"
                            value={formData.brandAssociations}
                            onChange={e => setFormData(f => ({ ...f, brandAssociations: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            OUTLETS YOU RUN TODAY
                          </label>
                          <div className="relative">
                            <select
                              value={formData.outletsCount}
                              onChange={e => setFormData(f => ({ ...f, outletsCount: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {OUTLETS_COUNT.map(o => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            WEBSITE / INSTAGRAM / GOOGLE
                          </label>
                          <input
                            type="text"
                            placeholder="link"
                            value={formData.websiteListing}
                            onChange={e => setFormData(f => ({ ...f, websiteListing: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                          OTHER FRANCHISES / DEALERSHIPS HELD
                        </label>
                        <input
                          type="text"
                          placeholder="Brand, city, since — or “None”"
                          value={formData.otherFranchises}
                          onChange={e => setFormData(f => ({ ...f, otherFranchises: e.target.value }))}
                          className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#1a2328]">
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(1)}
                        className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#1a2328] hover:bg-white/5 text-zinc-400 flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(3)}
                        className="flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(22,172,212,0.25)]"
                        style={{ background: "#16acd4", color: "#07090b" }}
                      >
                        <span>Save &amp; continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ──────────────── STEP 3: FINANCE & TEAM ──────────────── */}
                {currentStepIndex === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-1" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
                        FINANCE &amp; TEAM
                      </h2>
                      <p className="text-zinc-400 text-xs sm:text-sm">
                        Ranges are fine. Exact statements (ITR, P&amp;L, balance sheet, bank letter) are asked only after shortlisting.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Turnover & Trend */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            ANNUAL TURNOVER — LAST FY <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.turnoverLastFY}
                              onChange={e => setFormData(f => ({ ...f, turnoverLastFY: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {TURNOVER_LAST_FY.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            TURNOVER TREND (LAST 3 YEARS)
                          </label>
                          <div className="relative">
                            <select
                              value={formData.turnoverTrend}
                              onChange={e => setFormData(f => ({ ...f, turnoverTrend: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {TURNOVER_TREND.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Net Worth & Investment */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            NET WORTH (APPROX.) <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.netWorth}
                              onChange={e => setFormData(f => ({ ...f, netWorth: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {NET_WORTH_LIST.map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            INVESTMENT CAPACITY FOR DEALERSHIP <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.investmentCapacity}
                              onChange={e => setFormData(f => ({ ...f, investmentCapacity: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {INVESTMENT_CAPACITY.map(i => (
                                <option key={i} value={i}>{i}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Source of Funds & Loans */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            SOURCE OF FUNDS <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.sourceOfFunds}
                              onChange={e => setFormData(f => ({ ...f, sourceOfFunds: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {SOURCE_OF_FUNDS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            EXISTING BUSINESS LOANS?
                          </label>
                          <div className="flex gap-4 pt-1">
                            {["No", "Yes — regular repayments", "Yes — overdue"].map(opt => (
                              <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-xs">
                                <input
                                  type="radio"
                                  name="existingLoans"
                                  checked={formData.existingLoans === opt}
                                  onChange={() => setFormData(f => ({ ...f, existingLoans: opt }))}
                                  className="text-[#16acd4] focus:ring-[#16acd4]"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Employees & Technicians */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            EMPLOYEES TODAY <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.employeesCount}
                              onChange={e => setFormData(f => ({ ...f, employeesCount: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {EMPLOYEES_COUNT.map(e => (
                                <option key={e} value={e}>{e}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            TECHNICIANS / MECHANICS
                          </label>
                          <input
                            type="number"
                            placeholder="number"
                            value={formData.techniciansCount}
                            onChange={e => setFormData(f => ({ ...f, techniciansCount: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            VEHICLES / MONTH (TODAY)
                          </label>
                          <div className="relative">
                            <select
                              value={formData.vehiclesPerMonth}
                              onChange={e => setFormData(f => ({ ...f, vehiclesPerMonth: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {VEHICLES_PER_MONTH.map(v => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Software & Disclaimers */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            SOFTWARE USED TODAY
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Tally, Excel, none"
                            value={formData.softwareUsed}
                            onChange={e => setFormData(f => ({ ...f, softwareUsed: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            EVER DECLARED BANKRUPT? <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="flex gap-4 pt-2">
                            {["No", "Yes"].map(opt => (
                              <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-xs">
                                <input
                                  type="radio"
                                  name="insolventHistory"
                                  checked={formData.insolventHistory === opt}
                                  onChange={() => setFormData(f => ({ ...f, insolventHistory: opt }))}
                                  className="text-[#16acd4] focus:ring-[#16acd4]"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            PENDING LEGAL DISPUTES? <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="flex gap-4 pt-2">
                            {["No", "Yes"].map(opt => (
                              <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-xs">
                                <input
                                  type="radio"
                                  name="legalDisputes"
                                  checked={formData.legalDisputes === opt}
                                  onChange={() => setFormData(f => ({ ...f, legalDisputes: opt }))}
                                  className="text-[#16acd4] focus:ring-[#16acd4]"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#1a2328]">
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(2)}
                        className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#1a2328] hover:bg-white/5 text-zinc-400 flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(4)}
                        className="flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(22,172,212,0.25)]"
                        style={{ background: "#16acd4", color: "#07090b" }}
                      >
                        <span>Save &amp; continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ──────────────── STEP 4: PREMISES & TERRITORY ──────────────── */}
                {currentStepIndex === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-1" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
                        PREMISES &amp; TERRITORY
                      </h2>
                      <p className="text-zinc-400 text-xs sm:text-sm">
                        Facility specifications and target operational zone.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Status & Location Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            PREMISES STATUS <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.premisesStatus}
                              onChange={e => setFormData(f => ({ ...f, premisesStatus: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {PREMISES_STATUS_LIST.map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            LOCATION TYPE
                          </label>
                          <div className="relative">
                            <select
                              value={formData.locationType}
                              onChange={e => setFormData(f => ({ ...f, locationType: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {LOCATION_TYPE_LIST.map(l => (
                                <option key={l} value={l}>{l}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Covered, Open Area & Road Frontage */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            COVERED AREA (SQ FT)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2500"
                            value={formData.coveredArea}
                            onChange={e => setFormData(f => ({ ...f, coveredArea: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            OPEN / PARKING AREA (SQ FT)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 1500"
                            value={formData.openArea}
                            onChange={e => setFormData(f => ({ ...f, openArea: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            ROAD FRONTAGE (FT)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 45"
                            value={formData.roadFrontage}
                            onChange={e => setFormData(f => ({ ...f, roadFrontage: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>
                      </div>

                      {/* Power, Water & Bays */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            WORKSHOP BAYS / LIFTS
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2"
                            value={formData.workshopBays}
                            onChange={e => setFormData(f => ({ ...f, workshopBays: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            POWER CONNECTION
                          </label>
                          <div className="relative">
                            <select
                              value={formData.powerConnection}
                              onChange={e => setFormData(f => ({ ...f, powerConnection: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {POWER_CONNECTION_LIST.map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            WATER SUPPLY &amp; DRAINAGE
                          </label>
                          <div className="relative">
                            <select
                              value={formData.waterDrainage}
                              onChange={e => setFormData(f => ({ ...f, waterDrainage: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {WATER_DRAINAGE_LIST.map(w => (
                                <option key={w} value={w}>{w}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Site Address, Territory & Preference */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                          PROPOSED SITE ADDRESS / LANDMARK
                        </label>
                        <input
                          type="text"
                          placeholder="Address or nearest landmark"
                          value={formData.proposedSiteAddress}
                          onChange={e => setFormData(f => ({ ...f, proposedSiteAddress: e.target.value }))}
                          className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            TERRITORY YOU WANT <span className="text-[#16acd4]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Kangra district"
                            value={formData.targetTerritory}
                            onChange={e => setFormData(f => ({ ...f, targetTerritory: e.target.value }))}
                            className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            TERRITORY PREFERENCE <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="flex gap-4 pt-2">
                            {["Exclusive", "Non-exclusive", "Open to advice"].map(opt => (
                              <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-xs">
                                <input
                                  type="radio"
                                  name="territoryPreference"
                                  checked={formData.territoryPreference === opt}
                                  onChange={() => setFormData(f => ({ ...f, territoryPreference: opt }))}
                                  className="text-[#16acd4] focus:ring-[#16acd4]"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Start timeline & Dealerships within 10km */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            WHEN DO YOU WANT TO START? <span className="text-[#16acd4]">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.startTimeline}
                              onChange={e => setFormData(f => ({ ...f, startTimeline: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {START_TIMELINE_LIST.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                            CAR DEALERSHIPS WITHIN 10 KM (APPROX.)
                          </label>
                          <div className="relative">
                            <select
                              value={formData.dealershipsNearby}
                              onChange={e => setFormData(f => ({ ...f, dealershipsNearby: e.target.value }))}
                              className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] cursor-pointer pr-10"
                            >
                              {DEALERSHIPS_NEARBY.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* References */}
                      <div className="border-t border-[#1a2328] pt-4">
                        <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
                          TWO BUSINESS REFERENCES
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">REFERENCE 1 — NAME &amp; RELATION *</label>
                            <input
                              type="text"
                              required
                              placeholder="Name — e.g. banker, supplier"
                              value={formData.ref1Name}
                              onChange={e => setFormData(f => ({ ...f, ref1Name: e.target.value }))}
                              className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#16acd4]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">REFERENCE 1 — PHONE *</label>
                            <input
                              type="tel"
                              required
                              value={formData.ref1Phone}
                              onChange={e => setFormData(f => ({ ...f, ref1Phone: e.target.value }))}
                              className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#16acd4]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">REFERENCE 2 — NAME &amp; RELATION</label>
                            <input
                              type="text"
                              placeholder="Non-relative preferred"
                              value={formData.ref2Name}
                              onChange={e => setFormData(f => ({ ...f, ref2Name: e.target.value }))}
                              className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#16acd4]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">REFERENCE 2 — PHONE</label>
                            <input
                              type="tel"
                              value={formData.ref2Phone}
                              onChange={e => setFormData(f => ({ ...f, ref2Phone: e.target.value }))}
                              className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#16acd4]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#1a2328]">
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(3)}
                        className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#1a2328] hover:bg-white/5 text-zinc-400 flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(5)}
                        className="flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(22,172,212,0.25)]"
                        style={{ background: "#16acd4", color: "#07090b" }}
                      >
                        <span>Save &amp; continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ──────────────── STEP 5: CHOOSE YOUR MODEL & CUSTOMIZE (Screenshot 3) ──────────────── */}
                {currentStepIndex === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-1" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
                        CHOOSE YOUR MODEL &amp; CUSTOMIZE
                      </h2>
                      <p className="text-zinc-400 text-xs sm:text-sm">
                        Start from a model — we pre-select its standard kit — then add or remove anything. You only get a quote for what you pick.
                      </p>
                    </div>

                    {/* 5 Preset Models Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {MODELS_DATA.map(m => {
                        const isSelected = formData.selectedModel === m.id
                        return (
                          <div
                            key={m.id}
                            onClick={() => handleModelSelect(m.id)}
                            className="p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5"
                            style={
                              isSelected
                                ? { background: "rgba(22,172,212,0.12)", borderColor: "#16acd4", boxShadow: "0 0 15px rgba(22,172,212,0.2)" }
                                : { background: "#07090b", borderColor: "#1a2328" }
                            }
                          >
                            <span className="text-2xl mt-0.5">{m.icon}</span>
                            <div>
                              <p className="font-extrabold text-sm text-white uppercase font-display">
                                {m.title}
                              </p>
                              <p className="text-xs text-[#16acd4] font-medium">{m.subtitle}</p>
                              <p className="text-[11px] text-zinc-500 mt-1">{m.req}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Sub-tabs for customization */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1a2328]">
                      {[
                        { id: "software", label: "💻 Software modules", count: Object.values(formData.softwareQuantities).filter(q => q > 0).length },
                        { id: "equipment", label: "🧰 Equipment", count: Object.values(formData.equipmentQuantities).filter(q => q > 0).length },
                        { id: "services", label: "🛠 Services you will offer", count: formData.servicesOffered.length },
                        { id: "branding", label: "🎨 Branding & launch", count: Object.values(formData.brandingQuantities).filter(q => q > 0).length },
                        { id: "training", label: "🎓 Training & support", count: Object.values(formData.trainingQuantities).filter(q => q > 0).length },
                      ].map(tab => (
                        <button
                          type="button"
                          key={tab.id}
                          onClick={() => setFormData(f => ({ ...f, activeCustomizeSubTab: tab.id }))}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all"
                          style={
                            formData.activeCustomizeSubTab === tab.id
                              ? { background: "#16acd4", color: "#07090b", borderColor: "#16acd4" }
                              : { background: "#07090b", color: "#a1a1aa", borderColor: "#1a2328" }
                          }
                        >
                          {tab.label} ({tab.count})
                        </button>
                      ))}
                    </div>

                    {/* SUB-TAB 1: SOFTWARE MODULES */}
                    {formData.activeCustomizeSubTab === "software" && (
                      <div className="space-y-3">
                        <p className="text-xs text-zinc-400">
                          Your Detailing Garage management platform — pick what you need.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {SOFTWARE_ITEMS.map(sw => {
                            const qty = formData.softwareQuantities[sw.id] || 0
                            const isIncluded = qty > 0
                            return (
                              <div
                                key={sw.id}
                                className="p-3.5 rounded-xl border flex flex-col justify-between transition-all"
                                style={
                                  isIncluded
                                    ? { background: "rgba(22,172,212,0.06)", borderColor: "#16acd4" }
                                    : { background: "#07090b", borderColor: "#1a2328" }
                                }
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <p className="font-bold text-xs text-white uppercase font-display">{sw.name}</p>
                                    <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">{sw.desc}</p>
                                  </div>
                                  {isIncluded && <CheckCircle2 className="w-4 h-4 text-[#16acd4] shrink-0" />}
                                </div>
                                <div className="flex items-center justify-between border-t border-[#1a2328] pt-2 mt-2">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => updateSoftwareQty(sw.id, -1)}
                                      className="w-6 h-6 rounded bg-[#1a2328] text-zinc-300 font-bold hover:bg-zinc-700 flex items-center justify-center text-xs"
                                    >
                                      −
                                    </button>
                                    <span className="font-mono text-xs font-bold text-white w-4 text-center">{qty}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateSoftwareQty(sw.id, 1)}
                                      className="w-6 h-6 rounded bg-[#16acd4] text-[#07090b] font-bold hover:opacity-90 flex items-center justify-center text-xs"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <span className="text-[11px] text-zinc-500 font-mono">{sw.unit}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 2: EQUIPMENT */}
                    {formData.activeCustomizeSubTab === "equipment" && (
                      <div className="space-y-4">
                        <p className="text-xs text-zinc-400">
                          Complete dealership inspection, scanner &amp; detailing hardware kit.
                        </p>
                        <div className="space-y-3">
                          {EQUIPMENT_ITEMS.map(eq => {
                            const qty = formData.equipmentQuantities[eq.id] || 0
                            const isIncluded = qty > 0
                            return (
                              <div
                                key={eq.id}
                                className="p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all"
                                style={
                                  isIncluded
                                    ? { background: "rgba(22,172,212,0.06)", borderColor: "#16acd4" }
                                    : { background: "#07090b", borderColor: "#1a2328" }
                                }
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-mono text-[#16acd4]">{eq.cat}</span>
                                  </div>
                                  <p className="font-bold text-xs text-white uppercase font-display">{eq.name}</p>
                                  <p className="text-[11px] text-zinc-400 leading-snug line-clamp-1 mt-0.5">{eq.desc}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => updateEquipmentQty(eq.id, -1)}
                                    className="w-6 h-6 rounded bg-[#1a2328] text-zinc-300 font-bold hover:bg-zinc-700 flex items-center justify-center text-xs"
                                  >
                                    −
                                  </button>
                                  <span className="font-mono text-xs font-bold text-white w-4 text-center">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateEquipmentQty(eq.id, 1)}
                                    className="w-6 h-6 rounded bg-[#16acd4] text-[#07090b] font-bold hover:opacity-90 flex items-center justify-center text-xs"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 3: SERVICES YOU WILL OFFER */}
                    {formData.activeCustomizeSubTab === "services" && (
                      <div className="space-y-4">
                        <p className="text-xs text-zinc-400">
                          Tell us the services you plan to run.
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {SERVICES_OFFERED_LIST.map(svc => {
                            const isSelected = formData.servicesOffered.includes(svc)
                            return (
                              <button
                                type="button"
                                key={svc}
                                onClick={() => toggleServiceOffer(svc)}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2"
                                style={
                                  isSelected
                                    ? { background: "rgba(22,172,212,0.18)", borderColor: "#16acd4", color: "#16acd4" }
                                    : { background: "#07090b", borderColor: "#1a2328", color: "#a1a1aa" }
                                }
                              >
                                <span>{isSelected ? "✓" : "+"}</span>
                                <span>{svc}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 4: BRANDING & LAUNCH */}
                    {formData.activeCustomizeSubTab === "branding" && (
                      <div className="space-y-3">
                        <p className="text-xs text-zinc-400">
                          Turnkey branding and local digital launch pack.
                        </p>
                        <div className="space-y-2.5">
                          {BRANDING_ITEMS.map(b => (
                            <div key={b.id} className="p-3.5 rounded-xl border border-[#16acd4] bg-[#16acd4]/10 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-xs text-white uppercase font-display">{b.name}</p>
                                <p className="text-[11px] text-zinc-400 mt-0.5">{b.desc}</p>
                              </div>
                              <span className="px-2.5 py-1 rounded bg-[#16acd4] text-[#07090b] text-xs font-bold font-mono">
                                Included
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 5: TRAINING & SUPPORT */}
                    {formData.activeCustomizeSubTab === "training" && (
                      <div className="space-y-3">
                        <p className="text-xs text-zinc-400">
                          Staff certifications and continuous technical enablement.
                        </p>
                        <div className="space-y-2.5">
                          {TRAINING_ITEMS.map(t => (
                            <div key={t.id} className="p-3.5 rounded-xl border border-[#16acd4] bg-[#16acd4]/10 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-xs text-white uppercase font-display">{t.name}</p>
                                <p className="text-[11px] text-zinc-400 mt-0.5">{t.desc}</p>
                              </div>
                              <span className="px-2.5 py-1 rounded bg-[#16acd4] text-[#07090b] text-xs font-bold font-mono">
                                Included
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Anything else in package */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                        ANYTHING ELSE YOU WANT IN YOUR PACKAGE?
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. second mobile PDI kit, paint booth financing, extra software licences"
                        value={formData.extraPackageNotes}
                        onChange={e => setFormData(f => ({ ...f, extraPackageNotes: e.target.value }))}
                        className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4]"
                      />
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Prices depend on your city, model and quantities — we send an itemised quote after a short screening call.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#1a2328]">
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(4)}
                        className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#1a2328] hover:bg-white/5 text-zinc-400 flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(6)}
                        className="flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(22,172,212,0.25)]"
                        style={{ background: "#16acd4", color: "#07090b" }}
                      >
                        <span>Continue to terms</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ──────────────── STEP 6: TERMS & CONDITIONS (Screenshot 4) ──────────────── */}
                {currentStepIndex === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-1" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
                        TERMS &amp; CONDITIONS
                      </h2>
                      <p className="text-zinc-400 text-xs sm:text-sm">
                        Please read to the end — the tick boxes unlock when you reach the bottom.
                      </p>
                    </div>

                    {/* Scrollable Terms Container */}
                    <div
                      ref={termsScrollRef}
                      onScroll={handleTermsScroll}
                      className="bg-[#07090b] border border-[#1a2328] rounded-2xl p-5 h-72 overflow-y-auto text-xs text-zinc-400 space-y-4 leading-relaxed font-sans scrollbar-thin scrollbar-thumb-zinc-700"
                    >
                      <div className="border-b border-[#1a2328] pb-3">
                        <p className="font-bold text-white text-sm">Detailing Garage™ — Dealer Application Terms</p>
                        <p className="text-[11px] text-zinc-500 font-mono">Version 1.0 · 2026-11-14</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">1. About this application</p>
                        <p>This is an application to be considered as an authorised Detailing Garage™ dealer / franchise partner. Submitting it does not grant any dealership, franchise, territory or right to use the Detailing Garage name, and it does not oblige Detailing Garage or the applicant to enter into any agreement. Rights are granted only by a signed Dealership / Franchise Agreement.</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">2. Accuracy of information</p>
                        <p>You confirm that all information given is true, complete and not misleading. Detailing Garage may reject the application, or cancel any later offer or agreement, if any material information is found to be false or withheld.</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">3. Verification &amp; due diligence</p>
                        <p>You allow Detailing Garage to verify the information (GST portal, MCA records, references, site visit, calls) and to request documents such as GST certificate, PAN, address proof, ITRs / financial statements for the last 3 years, bank letter, premises documents and photographs after shortlisting. Detailing Garage may decide in its sole discretion and is not required to give reasons.</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">4. Selection process</p>
                        <p>Typical steps: application → screening call → evaluation &amp; site visit → itemised quote → Letter of Intent (LOI) → Dealership / Franchise Agreement → setup, training and launch. Time-lines are indicative.</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">5. Quotes, fees &amp; payments</p>
                        <p>Quotes are based on the modules, equipment, services and support you select and are valid for the period stated on the quote (default 15 days). Prices exclude GST unless stated. No payment is due for submitting this application. Any brand / franchise fee, equipment cost, software subscription, royalty or marketing contribution is payable only as set out in the signed agreement. Equipment brands and prices from third-party sellers may change.</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">6. Territory</p>
                        <p>A requested territory is a preference only. Territory, exclusivity (exclusive or non-exclusive), duration and renewal are fixed only in the signed agreement and may depend on performance targets.</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">7. Brand &amp; intellectual property</p>
                        <p>Until an agreement is signed you may not use the Detailing Garage name, logo, checklists, reports, software or marketing material. All manuals, pricing, quotes and documents shared with you remain confidential property of Detailing Garage.</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">8. Confidentiality</p>
                        <p>Both sides keep each other’s non-public information confidential and use it only to evaluate this application.</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">9. Operating standards (after appointment)</p>
                        <p>Appointed dealers follow Detailing Garage service standards, checklists, customer-data rules, pricing guidelines, training, audits and brand guidelines, and maintain the licences, registrations and insurance their business needs.</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">10. Data privacy &amp; consent</p>
                        <p>Your personal data is processed to evaluate your application and to contact you, in line with the Digital Personal Data Protection Act, 2023. It is shared only with our team and verification partners, kept only as long as needed, and you may ask to see, correct or delete it by writing to the contact below. You can withdraw consent; we may then be unable to process the application.</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">11. Communication</p>
                        <p>You agree to be contacted by call, SMS, WhatsApp and email about this application, even if your number is on a do-not-disturb list.</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">12. Governing law</p>
                        <p>These terms are governed by the laws of India. The final agreement will contain dispute-resolution terms (arbitration under the Arbitration and Conciliation Act, 1996). Subject to that, courts at Mandi, Himachal Pradesh have jurisdiction.</p>
                      </div>

                      <div>
                        <p className="font-bold text-white mb-1">13. Contact</p>
                        <p>Detailing Garage™, Mandi, Himachal Pradesh · +91-86798-00074 · info@detailinggarage.in</p>
                        <p className="text-zinc-500 font-mono mt-2">— End of terms —</p>
                      </div>
                    </div>

                    {/* 3 Checkboxes */}
                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agreedTerms}
                          onChange={e => setFormData(f => ({ ...f, agreedTerms: e.target.checked }))}
                          className="w-4 h-4 mt-0.5 rounded text-[#16acd4] focus:ring-[#16acd4] bg-[#07090b] border-zinc-600"
                        />
                        <span className="text-xs text-zinc-300">
                          I have read and agree to the Dealer Application Terms &amp; Conditions.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.declaredTrue}
                          onChange={e => setFormData(f => ({ ...f, declaredTrue: e.target.checked }))}
                          className="w-4 h-4 mt-0.5 rounded text-[#16acd4] focus:ring-[#16acd4] bg-[#07090b] border-zinc-600"
                        />
                        <span className="text-xs text-zinc-300">
                          I declare that the information I have given is true and complete.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.consentDataProcessing}
                          onChange={e => setFormData(f => ({ ...f, consentDataProcessing: e.target.checked }))}
                          className="w-4 h-4 mt-0.5 rounded text-[#16acd4] focus:ring-[#16acd4] bg-[#07090b] border-zinc-600"
                        />
                        <span className="text-xs text-zinc-300">
                          I consent to Detailing Garage processing my data and contacting me about this application (DPDP Act, 2023).
                        </span>
                      </label>
                    </div>

                    {/* Signature & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#1a2328]">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                          TYPE YOUR FULL NAME AS SIGNATURE <span className="text-[#16acd4]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.signatureName}
                          onChange={e => setFormData(f => ({ ...f, signatureName: e.target.value }))}
                          className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-mono outline-none focus:border-[#16acd4]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                          DATE
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={formData.signatureDate}
                          className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-400 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#1a2328]">
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(5)}
                        className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#1a2328] hover:bg-white/5 text-zinc-400 flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(7)}
                        className="flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(22,172,212,0.25)]"
                        style={{ background: "#16acd4", color: "#07090b" }}
                      >
                        <span>Agree &amp; continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ──────────────── STEP 7: REVIEW & SUBMIT (Exact match to User Text) ──────────────── */}
                {currentStepIndex === 7 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-1" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
                        REVIEW &amp; SUBMIT
                      </h2>
                      <p className="text-zinc-400 text-xs sm:text-sm">
                        Please verify your application details before final submission.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* 1. Applicant Card */}
                      <div className="bg-[#07090b] border border-[#1a2328] rounded-2xl p-5">
                        <div className="flex items-center justify-between border-b border-[#1a2328] pb-3 mb-3">
                          <div className="flex items-center gap-2 font-bold text-white text-sm uppercase">
                            <span>👤</span> <span>Applicant</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentStepIndex(1)}
                            className="text-xs text-[#16acd4] hover:underline font-bold"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <span className="text-zinc-500">Name</span>
                          <span className="font-semibold text-white">{formData.fullName}</span>

                          <span className="text-zinc-500">Mobile</span>
                          <span className="font-semibold text-emerald-400 font-mono">{formData.mobile} ✔</span>

                          <span className="text-zinc-500">Email</span>
                          <span className="font-semibold text-zinc-300">{formData.email}</span>

                          <span className="text-zinc-500">Role</span>
                          <span className="font-semibold text-white">{formData.role}</span>

                          <span className="text-zinc-500">Address</span>
                          <span className="font-semibold text-zinc-300">{formData.address}, {formData.city}, {formData.state}, {formData.pincode}</span>

                          <span className="text-zinc-500">Experience</span>
                          <span className="font-semibold text-white">{formData.yearsInAuto}</span>

                          <span className="text-zinc-500">Occupation</span>
                          <span className="font-semibold text-white">{formData.currentOccupation}</span>
                        </div>
                      </div>

                      {/* 2. Business Card */}
                      <div className="bg-[#07090b] border border-[#1a2328] rounded-2xl p-5">
                        <div className="flex items-center justify-between border-b border-[#1a2328] pb-3 mb-3">
                          <div className="flex items-center gap-2 font-bold text-white text-sm uppercase">
                            <span>🏢</span> <span>Business</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentStepIndex(2)}
                            className="text-xs text-[#16acd4] hover:underline font-bold"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <span className="text-zinc-500">Applying as</span>
                          <span className="font-semibold text-white">{formData.applyingAs}</span>

                          <span className="text-zinc-500">Legal name</span>
                          <span className="font-semibold text-white">{formData.legalName}</span>

                          <span className="text-zinc-500">Trade name</span>
                          <span className="font-semibold text-white">{formData.tradeName}</span>

                          <span className="text-zinc-500">Constitution</span>
                          <span className="font-semibold text-white">{formData.constitution}</span>

                          <span className="text-zinc-500">Established</span>
                          <span className="font-semibold text-white">{formData.yearEstablished}</span>

                          <span className="text-zinc-500">GSTIN</span>
                          <span className="font-semibold text-emerald-400 font-mono">02BMAPG7310Q1Z7 ✔ {formData.state}</span>

                          <span className="text-zinc-500">PAN</span>
                          <span className="font-semibold text-white font-mono">••••••310Q</span>

                          <span className="text-zinc-500">Activities</span>
                          <span className="font-semibold text-white">{formData.activities.join(", ")}</span>
                        </div>
                      </div>

                      {/* 3. Finance & team Card */}
                      <div className="bg-[#07090b] border border-[#1a2328] rounded-2xl p-5">
                        <div className="flex items-center justify-between border-b border-[#1a2328] pb-3 mb-3">
                          <div className="flex items-center gap-2 font-bold text-white text-sm uppercase">
                            <span>💰</span> <span>Finance &amp; team</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentStepIndex(3)}
                            className="text-xs text-[#16acd4] hover:underline font-bold"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <span className="text-zinc-500">Turnover (last FY)</span>
                          <span className="font-semibold text-white">{formData.turnoverLastFY}</span>

                          <span className="text-zinc-500">Net worth</span>
                          <span className="font-semibold text-white">{formData.netWorth}</span>

                          <span className="text-zinc-500">Investment</span>
                          <span className="font-semibold text-[#16acd4] font-bold">{formData.investmentCapacity}</span>

                          <span className="text-zinc-500">Funds</span>
                          <span className="font-semibold text-white">{formData.sourceOfFunds}</span>

                          <span className="text-zinc-500">Employees</span>
                          <span className="font-semibold text-white">{formData.employeesCount}</span>

                          <span className="text-zinc-500">Vehicles / month</span>
                          <span className="font-semibold text-white">{formData.vehiclesPerMonth}</span>

                          <span className="text-zinc-500">Insolvency</span>
                          <span className="font-semibold text-white">{formData.insolventHistory}</span>

                          <span className="text-zinc-500">Legal disputes</span>
                          <span className="font-semibold text-white">{formData.legalDisputes}</span>
                        </div>
                      </div>

                      {/* 4. Premises Card */}
                      <div className="bg-[#07090b] border border-[#1a2328] rounded-2xl p-5">
                        <div className="flex items-center justify-between border-b border-[#1a2328] pb-3 mb-3">
                          <div className="flex items-center gap-2 font-bold text-white text-sm uppercase">
                            <span>📍</span> <span>Premises</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentStepIndex(4)}
                            className="text-xs text-[#16acd4] hover:underline font-bold"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <span className="text-zinc-500">Premises</span>
                          <span className="font-semibold text-white">{formData.premisesStatus}</span>

                          <span className="text-zinc-500">Area</span>
                          <span className="font-semibold text-white">{formData.coveredArea} sq ft</span>

                          <span className="text-zinc-500">Location</span>
                          <span className="font-semibold text-white">{formData.locationType}</span>

                          <span className="text-zinc-500">Territory</span>
                          <span className="font-semibold text-white">{formData.targetTerritory} ({formData.territoryPreference})</span>

                          <span className="text-zinc-500">Start</span>
                          <span className="font-semibold text-white">{formData.startTimeline}</span>

                          <span className="text-zinc-500">References</span>
                          <span className="font-semibold text-white">{formData.ref1Name}; {formData.ref2Name}</span>
                        </div>
                      </div>

                      {/* 5. Your package Card */}
                      <div className="bg-[#07090b] border border-[#1a2328] rounded-2xl p-5">
                        <div className="flex items-center justify-between border-b border-[#1a2328] pb-3 mb-3">
                          <div className="flex items-center gap-2 font-bold text-white text-sm uppercase">
                            <span>🧩</span> <span>Your package — {MODELS_DATA.find(m => m.id === formData.selectedModel)?.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentStepIndex(5)}
                            className="text-xs text-[#16acd4] hover:underline font-bold"
                          >
                            Edit
                          </button>
                        </div>
                        <p className="text-xs text-[#16acd4] font-bold mb-2">{totalKitItems} items selected</p>
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          {Object.entries(formData.softwareQuantities).filter(([_, q]) => q > 0).map(([id]) => (
                            <span key={id} className="px-2 py-0.5 rounded bg-[#16acd4]/10 text-[#16acd4] border border-[#16acd4]/30">
                              {SOFTWARE_ITEMS.find(s => s.id === id)?.name || id}
                            </span>
                          ))}
                          {formData.servicesOffered.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800">
                              {s}
                            </span>
                          ))}
                          {Object.entries(formData.equipmentQuantities).filter(([_, q]) => q > 0).map(([id]) => (
                            <span key={id} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {EQUIPMENT_ITEMS.find(e => e.id === id)?.name || id}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Electronic signature note */}
                      <p className="text-xs text-zinc-400 italic">
                        Signed electronically by {formData.signatureName} on {formData.signatureDate}. Terms v1.0 accepted.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#1a2328]">
                      <button
                        type="button"
                        onClick={() => setCurrentStepIndex(6)}
                        className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#1a2328] hover:bg-white/5 text-zinc-400 flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmitApplication}
                        className="flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(22,172,212,0.35)] disabled:opacity-50"
                        style={{ background: "#16acd4", color: "#07090b" }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
                          </>
                        ) : (
                          "Submit application ✔"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right Column: Sticky Application Status Card (Exact match to Screenshots) ── */}
          <div
            className="lg:col-span-4 rounded-2xl p-6 sm:p-7 border flex flex-col justify-between sticky top-28"
            style={{
              background: "#0a1317",
              borderColor: "#1a2328"
            }}
          >
            <div>
              <h3
                className="text-lg font-black uppercase tracking-tight text-white mb-4"
                style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
              >
                Your application
              </h3>

              {/* Applicant Name & Location */}
              <div className="flex items-start gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full bg-[#16acd4]/15 border border-[#16acd4]/30 flex items-center justify-center text-[#16acd4] text-xs shrink-0 mt-0.5">
                  👤
                </div>
                <div>
                  <span className="font-bold text-sm text-white block">{formData.fullName}</span>
                  <span className="text-[11px] text-zinc-400">{formData.city}, {formData.state}</span>
                </div>
              </div>

              {/* Mobile Verified Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold mb-3">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mobile verified {formData.mobile}</span>
              </div>

              {/* Business Name & GSTIN Pill */}
              <div className="mb-4">
                <p className="font-mono text-xs text-zinc-300 font-bold flex items-center gap-1.5">
                  <span>🏢</span> {formData.legalName}
                </p>
                <span className="text-[10px] text-emerald-400 font-mono">GSTIN valid</span>
              </div>

              {/* Selected Model & Items count */}
              <div className="p-3 rounded-xl bg-[#07090b] border border-[#1a2328] mb-4">
                <div className="flex items-center gap-2">
                  <span>🔍</span>
                  <p className="font-bold text-xs text-white uppercase">{MODELS_DATA.find(m => m.id === formData.selectedModel)?.title}</p>
                </div>
                <span className="text-[11px] text-[#16acd4] font-semibold mt-1 block">
                  {totalKitItems} items selected
                </span>
              </div>

              {/* Security info text */}
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Your details are used only to evaluate your application. Progress is saved on this device – you can come back any time.
              </p>

              {/* Questions row */}
              <div className="border-t border-[#1a2328] pt-4 mb-6">
                <p className="text-xs text-zinc-400 mb-1.5 font-mono uppercase tracking-wider">
                  Questions?
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <a href="tel:+918679800074" className="text-white hover:text-[#16acd4] font-mono font-bold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#16acd4]" /> +91-86798-00074
                  </a>
                  <span className="text-zinc-600">·</span>
                  <a
                    href="https://wa.me/918679800074?text=Hi%20Detailing%20Garage%2C%20I%20have%20questions%20about%20the%20Dealer%20Programme."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25d366] hover:underline font-bold"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Track an application button */}
            <button
              type="button"
              onClick={() => setTrackingModal(true)}
              className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-center"
            >
              Track an application
            </button>
          </div>
        </div>
      </section>

      {/* ── Tracking Modal ── */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0a1317] border border-[#1a2328] p-6">
            <h3 className="text-lg font-black uppercase text-white mb-2" style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}>
              Track Application Status
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter your registered mobile number to check your evaluation status.
            </p>
            <input
              type="tel"
              defaultValue="+91 8679800074"
              className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white mb-4 outline-none focus:border-[#16acd4]"
            />
            <div className="p-3 rounded-lg bg-[#16acd4]/10 border border-[#16acd4]/30 text-[#16acd4] text-xs font-mono mb-4">
              Status: Application Registered · Evaluation in progress
            </div>
            <button
              onClick={() => setTrackingModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#1a2328] text-zinc-400 hover:bg-white/5"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Floating WhatsApp Button ── */}
      <a
        href="https://wa.me/918679800074?text=Hi%20Detailing%20Garage%2C%20I%20have%20questions%20about%20the%20Partner%20Programme."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed right-5 bottom-6 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-[#07090b] font-extrabold text-xs tracking-wider transition-all hover:scale-105 active:scale-95"
        style={{ background: "#25d366" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z" />
        </svg>
        <span>WhatsApp</span>
      </a>
    </div>
  )
}
