"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Diamond,
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Info,
  Car,
  Fuel,
  Zap,
  Truck,
  Bus,
  Bike
} from "lucide-react"

const CITIES = [
  "Chandigarh",
  "Panchkula",
  "Mohali",
  "Mandi",
  "Sundernagar",
  "Shimla",
  "Kullu",
  "Manali",
  "Dharamshala",
  "Kangra",
  "Dehradun",
  "Other"
]

const VEHICLE_TYPES = [
  { id: "petrol", label: "Petrol PDI", icon: "⛽" },
  { id: "diesel", label: "Diesel PDI", icon: "⛽" },
  { id: "ev", label: "EV PDI", icon: "⚡" },
  { id: "used", label: "Used Car PDI", icon: "🚙" },
  { id: "bike", label: "Bike PDI", icon: "🏍️" },
  { id: "truck", label: "Truck PDI", icon: "🚛" },
  { id: "bus", label: "Bus PDI", icon: "🚌" },
]

const CAR_AGES = [
  "New (0-6 months)",
  "6 months - 2 years",
  "2-5 years",
  "5+ years"
]

const PREFERRED_TIMES = [
  "Morning",
  "Afternoon",
  "Evening",
  "Flexible"
]

const SERVICE_LOCATIONS = [
  "Our studio / workshop",
  "Doorstep / Mobile"
]

const DETAILING_SERVICES = [
  "Ceramic coating",
  "Graphene coating",
  "PPF",
  "Machine polishing / paint correction",
  "Interior deep cleaning",
  "Foam wash & detailing",
  "Accessories fitting",
  "Music system / dash cam",
  "Denting & painting",
  "4x4 / modification",
  "Insurance claim repair",
  "General service"
]

export default function BookPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"pdi" | "detailing">("pdi")

  // PDI form state
  const [pdiForm, setPdiForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    city: "Chandigarh",
    vehicleType: "Petrol PDI",
    makeModel: "",
    dealershipName: "",
    deliveryDate: "",
    preferredTime: "Morning",
    message: ""
  })

  // Detailing form state
  const [detailingForm, setDetailingForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    city: "Mandi",
    makeModel: "",
    carAge: "New (0-6 months)",
    preferredDate: "",
    serviceAt: "Our studio / workshop",
    servicesNeeded: ["Ceramic coating"] as string[],
    message: ""
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedType, setSubmittedType] = useState<"pdi" | "detailing">("pdi")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Dynamic price calculation for PDI
  const getCityPdiPrice = (city: string) => {
    const c = city.toLowerCase()
    if (c === "chandigarh" || c === "mohali" || c === "panchkula") return "₹2,999"
    if (c === "kangra" || c === "dharamshala" || c === "mandi" || c === "kullu" || c === "manali") return "₹6,000"
    if (c === "shimla") return "₹5,500"
    if (c === "dehradun") return "₹4,999"
    return "₹2,999 - ₹6,000"
  }

  const toggleDetailingService = (service: string) => {
    setDetailingForm(prev => {
      const exists = prev.servicesNeeded.includes(service)
      if (exists) {
        return { ...prev, servicesNeeded: prev.servicesNeeded.filter(s => s !== service) }
      } else {
        return { ...prev, servicesNeeded: [...prev.servicesNeeded, service] }
      }
    })
  }

  const handlePdiSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pdiForm.fullName.trim() || !pdiForm.mobile.trim() || !pdiForm.makeModel.trim()) {
      setErrorMsg("Please fill in your name, mobile, and vehicle make & model.")
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pdi", ...pdiForm })
      })
      const data = await res.json()
      if (data.success) {
        setSubmittedType("pdi")
        setSubmitted(true)
      } else {
        setErrorMsg(data.error || "Failed to submit booking.")
      }
    } catch {
      setErrorMsg("Network error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDetailingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!detailingForm.fullName.trim() || !detailingForm.mobile.trim() || !detailingForm.makeModel.trim()) {
      setErrorMsg("Please fill in your name, mobile, and car make & model.")
      return
    }
    if (detailingForm.servicesNeeded.length === 0) {
      setErrorMsg("Please select at least one service needed.")
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "detailing", ...detailingForm })
      })
      const data = await res.json()
      if (data.success) {
        setSubmittedType("detailing")
        setSubmitted(true)
      } else {
        setErrorMsg(data.error || "Failed to submit booking.")
      }
    } catch {
      setErrorMsg("Network error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07090b] text-white selection:bg-[#16acd4]/30 selection:text-[#16acd4]">
      <Navbar />

      {/* ── Hero Section ── */}
      <section
        className="pt-32 pb-8 px-6 text-center relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(22,172,212,0.14) 0%, transparent 60%), #07090b"
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none mb-3 uppercase"
            style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
          >
            BOOK <span style={{ color: "#16acd4" }}>&amp; ENQUIRE</span>
          </h1>
          <p
            className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Separate forms for PDI, detailing and franchise – our team responds quickly.
          </p>

          {/* ── 3 Tabs Strip ── */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 mt-8 flex-wrap">
            {/* Tab 1: PDI booking */}
            <button
              onClick={() => {
                setActiveTab("pdi")
                setSubmitted(false)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md"
              style={
                activeTab === "pdi"
                  ? { background: "#16acd4", color: "#07090b", boxShadow: "0 0 20px rgba(22,172,212,0.35)" }
                  : { background: "#0e1316", color: "#a1a1aa", border: "1px solid #1a2328" }
              }
            >
              <span>🔍</span>
              <span>PDI booking</span>
            </button>

            {/* Tab 2: Detailing & services */}
            <button
              onClick={() => {
                setActiveTab("detailing")
                setSubmitted(false)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md"
              style={
                activeTab === "detailing"
                  ? { background: "#16acd4", color: "#07090b", boxShadow: "0 0 20px rgba(22,172,212,0.35)" }
                  : { background: "#0e1316", color: "#a1a1aa", border: "1px solid #1a2328" }
              }
            >
              <span>💎</span>
              <span>Detailing &amp; services</span>
            </button>

            {/* Tab 3: Franchise enquiry -> Links directly to the separate Become a Dealer page */}
            <Link
              href="/dealer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all border border-[#1a2328] bg-[#0e1316] text-[#a1a1aa] hover:border-[#16acd4]/60 hover:text-[#16acd4]"
            >
              <span>🤝</span>
              <span>Franchise enquiry ↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Main Form Container ── */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-6 sm:p-9 border shadow-2xl"
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
                  {submittedType === "pdi" ? "PDI BOOKING RECEIVED!" : "DETAILING BOOKING RECEIVED!"}
                </h3>
                <p className="text-zinc-400 text-sm max-w-md mx-auto" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Thank you! We have logged your request. Our inspection &amp; detailing coordinator will call you to confirm your slot.
                </p>
                <div className="pt-4 flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#1a2328] hover:bg-white/5 text-zinc-300 transition-colors"
                  >
                    Submit Another Request
                  </button>
                  <a
                    href="https://wa.me/918679800074?text=Hi%20Detailing%20Garage%2C%20I%20just%20submitted%20a%20booking%20request."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                    style={{ background: "#16acd4", color: "#07090b" }}
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            ) : activeTab === "pdi" ? (
              /* ─────────────── TAB 1: PDI BOOKING FORM ─────────────── */
              <form onSubmit={handlePdiSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* Row 1: Full Name, Mobile, Email */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      FULL NAME <span className="text-[#16acd4]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={pdiForm.fullName}
                      onChange={e => setPdiForm(f => ({ ...f, fullName: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      MOBILE <span className="text-[#16acd4]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98160-XXXXX"
                      value={pdiForm.mobile}
                      onChange={e => setPdiForm(f => ({ ...f, mobile: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      placeholder="name@email.com"
                      value={pdiForm.email}
                      onChange={e => setPdiForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>
                </div>

                {/* Row 2: City, Vehicle Type, Make & Model */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      CITY <span className="text-[#16acd4]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={pdiForm.city}
                        onChange={e => setPdiForm(f => ({ ...f, city: e.target.value }))}
                        className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] transition-colors cursor-pointer pr-10"
                      >
                        {CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      VEHICLE TYPE <span className="text-[#16acd4]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={pdiForm.vehicleType}
                        onChange={e => setPdiForm(f => ({ ...f, vehicleType: e.target.value }))}
                        className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] transition-colors cursor-pointer pr-10"
                      >
                        {VEHICLE_TYPES.map(vt => (
                          <option key={vt.id} value={vt.label}>
                            {vt.icon} {vt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      MAKE &amp; MODEL <span className="text-[#16acd4]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahindra Thar Roxx"
                      value={pdiForm.makeModel}
                      onChange={e => setPdiForm(f => ({ ...f, makeModel: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>
                </div>

                {/* Row 3: Dealership Name, Delivery Date, Preferred Time */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      DEALERSHIP NAME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Modern Auto Dealership"
                      value={pdiForm.dealershipName}
                      onChange={e => setPdiForm(f => ({ ...f, dealershipName: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      DELIVERY DATE <span className="text-[#16acd4]">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={pdiForm.deliveryDate}
                      onChange={e => setPdiForm(f => ({ ...f, deliveryDate: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      PREFERRED TIME
                    </label>
                    <div className="relative">
                      <select
                        value={pdiForm.preferredTime}
                        onChange={e => setPdiForm(f => ({ ...f, preferredTime: e.target.value }))}
                        className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] transition-colors cursor-pointer pr-10"
                      >
                        {PREFERRED_TIMES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Price highlight banner (exact matching Screenshot 1 & 4) */}
                <div
                  className="rounded-xl p-3 sm:p-3.5 border text-xs sm:text-[13px] flex items-center gap-2"
                  style={{
                    background: "rgba(22,172,212,0.06)",
                    borderColor: "rgba(22,172,212,0.3)"
                  }}
                >
                  <Info className="w-4 h-4 text-[#16acd4] shrink-0" />
                  <span className="text-zinc-300">
                    Price for {pdiForm.city}:{" "}
                    <span className="font-bold font-mono text-[#16acd4]">
                      {getCityPdiPrice(pdiForm.city)}
                    </span>
                    . Final price depends on vehicle category.
                  </span>
                </div>

                {/* Row 4: Message */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    MESSAGE
                  </label>
                  <textarea
                    rows={4}
                    placeholder="VIN number (if known), specific inspection requests, questions..."
                    value={pdiForm.message}
                    onChange={e => setPdiForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all hover:opacity-95 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(22,172,212,0.25)]"
                  style={{ background: "#16acd4", color: "#07090b" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Confirming Request...
                    </>
                  ) : (
                    "Confirm booking request"
                  )}
                </button>
              </form>
            ) : (
              /* ─────────────── TAB 2: DETAILING & SERVICES FORM ─────────────── */
              <form onSubmit={handleDetailingSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* Row 1: Full Name, Mobile, Email */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      FULL NAME <span className="text-[#16acd4]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohit Verma"
                      value={detailingForm.fullName}
                      onChange={e => setDetailingForm(f => ({ ...f, fullName: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      MOBILE <span className="text-[#16acd4]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98160-XXXXX"
                      value={detailingForm.mobile}
                      onChange={e => setDetailingForm(f => ({ ...f, mobile: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      placeholder="name@email.com"
                      value={detailingForm.email}
                      onChange={e => setDetailingForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>
                </div>

                {/* Row 2: City, Car Make & Model, Car Age */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      CITY <span className="text-[#16acd4]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={detailingForm.city}
                        onChange={e => setDetailingForm(f => ({ ...f, city: e.target.value }))}
                        className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] transition-colors cursor-pointer pr-10"
                      >
                        {CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      CAR MAKE &amp; MODEL <span className="text-[#16acd4]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hyundai Creta 2024"
                      value={detailingForm.makeModel}
                      onChange={e => setDetailingForm(f => ({ ...f, makeModel: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      CAR AGE
                    </label>
                    <div className="relative">
                      <select
                        value={detailingForm.carAge}
                        onChange={e => setDetailingForm(f => ({ ...f, carAge: e.target.value }))}
                        className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] transition-colors cursor-pointer pr-10"
                      >
                        {CAR_AGES.map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 3: Preferred Date & Service At */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      PREFERRED DATE
                    </label>
                    <input
                      type="date"
                      value={detailingForm.preferredDate}
                      onChange={e => setDetailingForm(f => ({ ...f, preferredDate: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      SERVICE AT
                    </label>
                    <div className="relative">
                      <select
                        value={detailingForm.serviceAt}
                        onChange={e => setDetailingForm(f => ({ ...f, serviceAt: e.target.value }))}
                        className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#16acd4] transition-colors cursor-pointer pr-10"
                      >
                        {SERVICE_LOCATIONS.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 4: Services Needed Checklist Pills (matching Screenshot 2) */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2.5">
                    SERVICES NEEDED <span className="text-[#16acd4]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {DETAILING_SERVICES.map(service => {
                      const isSelected = detailingForm.servicesNeeded.includes(service)
                      return (
                        <button
                          type="button"
                          key={service}
                          onClick={() => toggleDetailingService(service)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5"
                          style={
                            isSelected
                              ? {
                                  background: "rgba(22,172,212,0.18)",
                                  borderColor: "#16acd4",
                                  color: "#16acd4"
                                }
                              : {
                                  background: "#07090b",
                                  borderColor: "#1a2328",
                                  color: "#a1a1aa"
                                }
                          }
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[9px] ${
                              isSelected ? "bg-[#16acd4] border-[#16acd4] text-[#07090b]" : "border-zinc-600"
                            }`}
                          >
                            {isSelected && "✓"}
                          </span>
                          <span>{service}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Row 5: Message */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    MESSAGE
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Specific requirements, preferred timings or package preferences..."
                    value={detailingForm.message}
                    onChange={e => setDetailingForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-[#07090b] border border-[#1a2328] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all hover:opacity-95 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(22,172,212,0.25)]"
                  style={{ background: "#16acd4", color: "#07090b" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Confirming Request...
                    </>
                  ) : (
                    "Confirm booking request"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Floating WhatsApp Button ── */}
      <a
        href="https://wa.me/918679800074?text=Hi%20Detailing%20Garage%2C%20I%20have%20a%20booking%20query."
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

