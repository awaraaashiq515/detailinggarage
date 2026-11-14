"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ChevronDown,
  Star
} from "lucide-react"

const CITIES = [
  "Mandi",
  "Chandigarh",
  "Panchkula",
  "Mohali",
  "Sundernagar",
  "Shimla",
  "Kullu",
  "Manali",
  "Dharamshala",
  "Kangra",
  "Dehradun",
  "Other"
]

const SERVICES = [
  "PDI booking",
  "Ceramic coating",
  "Graphene coating",
  "PPF (Paint Protection Film)",
  "Music systems & dash cams",
  "Accessories & floor mats",
  "4x4 modification",
  "Denting & painting",
  "Insurance claims",
  "Car wash & detailing",
  "Other"
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "Mandi",
    service: "PDI booking",
    message: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setErrorMsg("Please enter your name and phone number.")
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setErrorMsg(data.error || "Failed to submit enquiry. Please try again.")
      }
    } catch {
      setErrorMsg("An unexpected network error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07090b] text-white selection:bg-[#16acd4]/30 selection:text-[#16acd4]">
      <Navbar />

      {/* ── Hero Section ── */}
      <section
        className="pt-32 pb-12 px-6 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at 75% 0%, rgba(22,172,212,0.12) 0%, transparent 60%), #07090b"
        }}
      >
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none mb-3 uppercase"
            style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
          >
            CONTACT <span style={{ color: "#16acd4" }}>US</span>
          </h1>
          <p
            className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Call, WhatsApp or send an enquiry – we reply quickly.
          </p>
        </div>
      </section>

      {/* ── Main Two Column Section ── */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: REACH US ── */}
          <div
            className="lg:col-span-5 rounded-2xl p-6 sm:p-8 border flex flex-col justify-between"
            style={{
              background: "#0a1317",
              borderColor: "#1a2328"
            }}
          >
            <div>
              <h2
                className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-6"
                style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
              >
                REACH US
              </h2>

              <div className="space-y-4 mb-8">
                {/* Phone 1 */}
                <a
                  href="tel:+918679800074"
                  className="flex items-center gap-3.5 text-zinc-300 hover:text-[#16acd4] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#07090b] border border-[#1a2328] flex items-center justify-center text-zinc-400 group-hover:text-[#16acd4] group-hover:border-[#16acd4]/40 transition-colors shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide font-mono">+91-86798-00074</span>
                </a>

                {/* Phone 2 */}
                <a
                  href="tel:+918679400014"
                  className="flex items-center gap-3.5 text-zinc-300 hover:text-[#16acd4] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#07090b] border border-[#1a2328] flex items-center justify-center text-zinc-400 group-hover:text-[#16acd4] group-hover:border-[#16acd4]/40 transition-colors shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide font-mono">+91-86794-00014</span>
                </a>

                {/* Email */}
                <a
                  href="mailto:info@detailinggarage.in"
                  className="flex items-center gap-3.5 text-zinc-300 hover:text-[#16acd4] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#07090b] border border-[#1a2328] flex items-center justify-center text-zinc-400 group-hover:text-[#16acd4] group-hover:border-[#16acd4]/40 transition-colors shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium tracking-wide">info@detailinggarage.in</span>
                </a>

                {/* Website */}
                <a
                  href="https://www.detailinggarage.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 text-zinc-300 hover:text-[#16acd4] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#07090b] border border-[#1a2328] flex items-center justify-center text-zinc-400 group-hover:text-[#16acd4] group-hover:border-[#16acd4]/40 transition-colors shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium tracking-wide">www.detailinggarage.in</span>
                </a>

                {/* Location */}
                <div className="flex items-start gap-3.5 text-zinc-300 pt-1">
                  <div className="w-9 h-9 rounded-lg bg-[#07090b] border border-[#1a2328] flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-zinc-300 leading-snug">
                    Saulikhad · Gutkar · Rani Bain, Mandi (HP)
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-[#1a2328]">
              <a
                href="https://wa.me/918679800074?text=Hi%20Detailing%20Garage%2C%20I%20have%20an%20enquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all hover:opacity-90 active:scale-95 shadow-[0_0_20px_rgba(22,172,212,0.25)]"
                style={{ background: "#16acd4", color: "#07090b" }}
              >
                WhatsApp us
              </a>
              <a
                href="https://maps.google.com/?q=Detailing+Garage+Mandi"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-[#16acd4]/60 text-zinc-200 hover:text-[#16acd4] hover:border-[#16acd4] hover:bg-[#16acd4]/10 transition-all flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Google Reviews
              </a>
            </div>
          </div>

          {/* ── Right Column: SEND AN ENQUIRY ── */}
          <div
            className="lg:col-span-7 rounded-2xl p-6 sm:p-8 border"
            style={{
              background: "#0a1317",
              borderColor: "#1a2328"
            }}
          >
            <h2
              className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-6"
              style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
            >
              SEND AN ENQUIRY
            </h2>

            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-[#16acd4]/15 border border-[#16acd4]/40 flex items-center justify-center mx-auto text-[#16acd4]">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3
                  className="text-2xl font-black uppercase tracking-tight text-white"
                  style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
                >
                  ENQUIRY SUBMITTED SUCCESSFULLY!
                </h3>
                <p className="text-zinc-400 text-sm max-w-md mx-auto" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Thank you, <span className="text-white font-bold">{form.name}</span>! Our technical team will review your requirement and call you at <span className="text-[#16acd4] font-mono font-bold">{form.phone}</span> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setForm({ name: "", phone: "", city: "Mandi", service: "PDI booking", message: "" })
                  }}
                  className="mt-4 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-[#1a2328] hover:bg-white/5 text-zinc-300 transition-colors"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      NAME <span className="text-[#16acd4]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      PHONE <span className="text-[#16acd4]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Phone number"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors"
                    />
                  </div>
                </div>

                {/* City & Service */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      CITY
                    </label>
                    <div className="relative">
                      <select
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#16acd4] transition-colors cursor-pointer pr-10"
                      >
                        {CITIES.map(c => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      SERVICE
                    </label>
                    <div className="relative">
                      <select
                        value={form.service}
                        onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                        className="w-full appearance-none bg-[#07090b] border border-[#1a2328] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#16acd4] transition-colors cursor-pointer pr-10"
                      >
                        {SERVICES.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Car / Message */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    CAR / MESSAGE
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter your car model, year, requirement or any question..."
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-[#07090b] border border-[#1a2328] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#16acd4] transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(22,172,212,0.25)]"
                  style={{ background: "#16acd4", color: "#07090b" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Send Enquiry"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Floating WhatsApp Button (matches screenshot) ── */}
      <a
        href="https://wa.me/918679800074?text=Hi%20Detailing%20Garage%2C%20I%20have%20an%20enquiry."
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

