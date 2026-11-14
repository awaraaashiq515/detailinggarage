"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import Link from "next/link"
import {
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ExternalLink,
  Facebook,
  Heart,
  MessageSquare,
  Share2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  Tag
} from "lucide-react"

/* ─── BLOG POSTS DATA ─── */
interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  date: string
  readTime: string
  author: string
  authorRole: string
  imageUrl: string
  excerpt: string
  tags: string[]
  content: string[]
}

const BLOG_CATEGORIES = [
  "All",
  "PDI Inspection",
  "Ceramic & PPF",
  "EV & Diagnostics",
  "Car Care & Detailing",
  "Buyer Guides"
]

const BLOG_ARTICLES: BlogPost[] = [
  {
    id: "pdi-checklist-guide",
    slug: "pdi-checklist-guide",
    title: "The Essential 100+ Point PDI Checklist: Inspect Before You Accept",
    category: "PDI Inspection",
    date: "Nov 12, 2026",
    readTime: "6 min read",
    author: "Ritchie",
    authorRole: "Lead PDI Professional",
    imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Why taking delivery of a new car without a digital paint thickness gauge and diagnostic scan can leave you with transit-damaged or repainted panels.",
    tags: ["PDI", "Pre-Delivery Inspection", "New Car", "Paint Gauge"],
    content: [
      "Buying a new car is among the biggest financial milestones for an Indian family. However, the shiny showroom lights often conceal transit blemishes, uneven repainted panels, or battery deep discharges that happen between the factory floor and the regional stockyard.",
      "At Detailing Garage, our 100+ point inspection protocol begins with systematic paint thickness profiling using dual-substrate (ferrous & non-ferrous) digital gauges. Factory automotive paint typically measures between 95µM and 135µM. Any panel spiking over 180µM indicates dealer-level repainting or filler work done to mask transport scratches.",
      "Next, a full OBD-II digital scan evaluates the ECU, ABS module, airbag controllers, and body control units for stored or pending DTCs (Diagnostic Trouble Codes). We also verify the tyre DOT manufacturing code against the vehicle manufacturing month to ensure the dealership hasn't swapped rubber sets.",
      "The lesson is simple: Inspect Before You Accept. Once you sign the gate pass and drive out, claiming transit damage or mechanical fault becomes nearly impossible."
    ]
  },
  {
    id: "ceramic-vs-graphene-vs-ppf",
    slug: "ceramic-vs-graphene-vs-ppf",
    title: "Ceramic vs Graphene vs PPF: Which Protection Does Your Car Actually Need?",
    category: "Ceramic & PPF",
    date: "Nov 08, 2026",
    readTime: "8 min read",
    author: "DG Technical Lab",
    authorRole: "Surface Chemistry Engineers",
    imageUrl: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1200&auto=format&fit=crop",
    excerpt: "A realistic breakdown of longevity, hydrophobic performance, swirl resistance, and water spot protection in North Indian climate.",
    tags: ["Ceramic Coating", "Graphene", "PPF", "Paint Protection"],
    content: [
      "Car owners are often confused between Ceramic Coating, Graphene Coating, and Paint Protection Film (PPF). Each technology serves a distinct protective role on modern clear coats.",
      "Ceramic Coatings (SiO2) chemically bond with the clear coat to create a glass-like sacrificial layer. It provides intense gloss, chemical resistance (pH 2–12), and extreme hydrophobicity so dirt rinses off with ease.",
      "Graphene Coatings incorporate reduced graphene oxide matrices. Because graphene reduces heat retention on dark surfaces, it significantly reduces hard water spotting — a common problem across Punjab, Haryana, and Himachal due to high mineral content in borewell water.",
      "Paint Protection Film (PPF), by contrast, is a physical 7.5 to 8.5 mil thick thermoplastic polyurethane (TPU) membrane. Only PPF provides true rock-chip and stone-flick protection on highways. For optimal longevity, many enthusiasts opt for front-kit PPF combined with full-body ceramic coating."
    ]
  },
  {
    id: "ev-pdi-battery-soh-guide",
    slug: "ev-pdi-battery-soh-guide",
    title: "Electric Vehicle PDI Guide: How We Check HV Battery SOH, Cell Voltages & BMS",
    category: "EV & Diagnostics",
    date: "Nov 02, 2026",
    readTime: "5 min read",
    author: "High-Voltage Team",
    authorRole: "EV Diagnostics Specialist",
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Real-world EV inspection walkthrough for MG, Tata, Mahindra, and BYD electric vehicles before signing delivery papers.",
    tags: ["EV PDI", "Battery SOH", "BMS", "Electric Vehicles"],
    content: [
      "Electric vehicles demand a completely different inspection protocol compared to traditional internal combustion engines. A visual exterior check alone is insufficient when 60% of the vehicle value sits inside the high-voltage lithium battery pack.",
      "During an EV PDI, our certified technicians connect specialised EV diagnostic scanners (such as Autel EVDiag) directly to the high-voltage battery management system (BMS). We verify individual cell voltage deviations. A healthy new pack must not exceed a 10mV to 15mV variance across modules.",
      "We also monitor cooling loop temperature sensors, charging port latching solenoids, thermal runaway alerts, and state of health (SOH). If an EV sat idle in an open stockyard for 4 months without periodic charging, irreversible cell capacity loss can occur before day one.",
      "Never accept an EV without verifying the battery manufacturing date, DC fast charging handshake test, and insulation resistance logs."
    ]
  },
  {
    id: "ppf-gloss-vs-matte-finish",
    slug: "ppf-gloss-vs-matte-finish",
    title: "Self-Healing TPU Paint Protection Film (PPF): Gloss vs Matte Finish Explained",
    category: "Ceramic & PPF",
    date: "Oct 28, 2026",
    readTime: "7 min read",
    author: "Film Craft Division",
    authorRole: "Master Film Applicator",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Everything car owners need to know about TPU optical clarity, non-yellowing adhesive, self-healing top coats, and satin conversions.",
    tags: ["PPF", "TPU Film", "Matte Finish", "Self Healing"],
    content: [
      "Thermoplastic Polyurethane (TPU) paint protection film has evolved from military helicopter blade protection into the ultimate automotive shield. Modern films feature a micro-elastomeric top coat that self-heals swirl marks and minor scratches under warm sunlight.",
      "Gloss PPF enhances the optical depth and wet-look reflections of factory paint without altering the car's original colour tone. It is ideal for preserving metallic and pearl finishes.",
      "Matte (Satin) PPF transforms any gloss paint into a sleek, stealth satin-frozen texture while delivering the exact same impact protection. It eliminates reflections and creates an aggressive, custom presence — especially on dark shades and performance SUVs.",
      "When investing in PPF, always demand non-yellowing solvent-resistant aliphatic TPU with genuine manufacturer warranty registered against your VIN number."
    ]
  },
  {
    id: "monsoon-winter-mountain-car-care",
    slug: "monsoon-winter-mountain-car-care",
    title: "Monsoon & Winter Detailing in Himachal & Punjab: Salt, Mud & Road Grit Care",
    category: "Car Care & Detailing",
    date: "Oct 21, 2026",
    readTime: "4 min read",
    author: "Detailing Garage Studio",
    authorRole: "Workshop Operations",
    imageUrl: "https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Proven washing techniques, two-bucket grit guard methods, and underbody anti-rust protection for mountain driving in HP and Punjab.",
    tags: ["Car Wash", "Maintenance", "Mountain Roads", "Underbody"],
    content: [
      "Driving through Himalayan passes or slushy monsoon highways subjects a car's underside to an aggressive mix of road grit, mud, and de-icing salt.",
      "Never allow local car wash attendants to rub a dry cloth or use harsh household detergents. High-pH soaps strip protective waxes, leaving the clear coat porous and prone to UV oxidation.",
      "Always follow the Two-Bucket Method with grit guards: one bucket for pH-neutral foam shampoo, and one bucket filled with clean water to rinse your microfiber wash mitt before touching the paint again.",
      "Pay special attention to wheel arches, brake callipers, and chassis crevices where salt and moisture linger to cause unnoticed corrosion."
    ]
  },
  {
    id: "dealership-red-flags-hidden-repaints",
    slug: "dealership-red-flags-hidden-repaints",
    title: "Dealership Red Flags: How Stored Fault Codes and Repainted Bumpers Go Undetected",
    category: "Buyer Guides",
    date: "Oct 15, 2026",
    readTime: "6 min read",
    author: "Automobile Surveyor",
    authorRole: "Forensic Auto Analyst",
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Case studies of transit scratches buffed down by dealerships, odometer disconnection tricks, and battery deep-discharge issues.",
    tags: ["Buyer Guide", "Dealer Scams", "New Car Delivery", "Red Flags"],
    content: [
      "Dealership staff are under intense pressure to hit monthly sales targets and clear aging inventory. In the process, minor lot accidents are routinely touched up at in-house body shops before the buyer arrives for the delivery ceremony.",
      "Common indicators of transit repairs include paint overspray on window rubber mouldings, buffer trails (holograms) on door corners, mismatched paint orange peel texture, and tool marks on fender bolts.",
      "Another critical red flag is odometer discrepancies. Vehicles driven from stockyards located 150 km away sometimes have disconnected speed sensors, showing only 12 km on the cluster while tyre tread wear indicates hundreds of kilometers of hard driving.",
      "A structured third-party PDI brings complete peace of mind, empowering you to demand a vehicle replacement or dealership rectification before disbursing payment."
    ]
  }
]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null)

  // Live Facebook / Studio posts state
  const [socialPosts, setSocialPosts] = useState<any[]>([])
  const [socialLoading, setSocialLoading] = useState(true)
  const [activeSocialModal, setActiveSocialModal] = useState<any | null>(null)

  // Fetch social / Facebook posts from API
  useEffect(() => {
    async function loadSocialFeed() {
      try {
        const res = await fetch("/api/public/posts?limit=12")
        const data = await res.json()
        if (data.posts && data.posts.length > 0) {
          setSocialPosts(data.posts)
        }
      } catch (err) {
        console.error("Failed to load Facebook feed:", err)
      } finally {
        setSocialLoading(false)
      }
    }
    loadSocialFeed()
  }, [])

  // Filtered blog posts
  const filteredArticles = BLOG_ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#07090b] text-white selection:bg-[#16acd4]/30 selection:text-[#16acd4]">
      <Navbar />

      {/* ── Top Hero Section ── */}
      <section
        className="pt-32 pb-10 px-6 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(22,172,212,0.14) 0%, transparent 60%), #07090b"
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* Cursive Eyebrow */}
          <p
            className="text-lg sm:text-xl text-[#16acd4] mb-1"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Detailing That Defines Luxury
          </p>

          {/* Heading */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none mb-4 uppercase"
            style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
          >
            DG AUTOMOTIVE <span style={{ color: "#16acd4" }}>BLOG &amp; JOURNAL</span>
          </h1>

          <p
            className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-8"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Guides, 100+ point PDI checklists, paint protection insights, and real-time dispatches from our inspection hubs and detailing studios across North India.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative mb-8">
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search guides, PDI, ceramic, PPF, EV insights..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a1317] border border-[#1a2328] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#16acd4] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {BLOG_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all border"
                style={
                  selectedCategory === cat
                    ? {
                        background: "#16acd4",
                        borderColor: "#16acd4",
                        color: "#07090b",
                        boxShadow: "0 0 16px rgba(22,172,212,0.3)"
                      }
                    : {
                        background: "#0a1317",
                        borderColor: "#1a2328",
                        color: "#a1a1aa"
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Blog Articles Grid ── */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#16acd4]" />
              <p className="text-base font-bold text-white">No articles matched your search.</p>
              <p className="text-xs mt-1">Try another category or clear the search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => (
                <div
                  key={article.id}
                  className="rounded-2xl border flex flex-col overflow-hidden group transition-all hover:border-[#16acd4]/60 hover:shadow-[0_0_25px_rgba(22,172,212,0.12)]"
                  style={{
                    background: "#0a1317",
                    borderColor: "#1a2328"
                  }}
                >
                  {/* Image Banner */}
                  <div className="h-52 relative overflow-hidden bg-[#07090b]">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1317] via-transparent to-transparent opacity-80" />
                    
                    {/* Category badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#07090b]/85 border border-[#16acd4]/40 text-[#16acd4] backdrop-blur-md">
                      {article.category}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#16acd4]" />
                        {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#16acd4]" />
                        {article.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3
                      className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mb-2.5 leading-snug group-hover:text-[#16acd4] transition-colors"
                      style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
                    >
                      {article.title}
                    </h3>

                    <p
                      className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6 flex-1 line-clamp-3"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {article.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {article.tags.map(t => (
                        <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#07090b] text-zinc-400 border border-[#1a2328]">
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Author & Read Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#1a2328]">
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{article.author}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{article.authorRole}</p>
                      </div>

                      <button
                        onClick={() => setActiveArticle(article)}
                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#16acd4] hover:text-white transition-colors group-hover:translate-x-1 duration-200"
                      >
                        <span>Read Guide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Separate Section: FACEBOOK LIVE COMMUNITY FEED ── */}
      <section className="px-6 py-16 border-t border-[#1a2328] bg-[#050709]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-950/40 border border-red-500/30 text-red-400 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>LIVE SOCIAL FEED</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight"
                style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
              >
                LATEST FROM OUR <span style={{ color: "#16acd4" }}>FACEBOOK DISPATCHES</span>
              </h2>
              <p
                className="text-zinc-400 text-xs sm:text-sm md:text-base max-w-2xl mt-1 leading-relaxed"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Real customer deliveries, live PDI inspections, ceramic coatings, and workshop milestones synced directly from our official Facebook channel.
              </p>
            </div>

            <a
              href="https://www.facebook.com/1151749844180336"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1877f2] hover:bg-[#166fe5] text-white shadow-[0_0_20px_rgba(24,119,242,0.3)] transition-all self-start md:self-auto shrink-0"
            >
              <Facebook className="w-4 h-4 fill-white" />
              <span>Visit Official Facebook</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Facebook Posts Grid */}
          {socialLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#16acd4] mb-3" />
              <p className="text-xs font-mono uppercase text-zinc-500 tracking-wider">Syncing latest Facebook posts...</p>
            </div>
          ) : socialPosts.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 bg-[#0a1317] rounded-2xl border border-[#1a2328] p-8">
              <Facebook className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
              <p className="text-sm font-bold text-white">No social updates available right now.</p>
              <p className="text-xs text-zinc-500 mt-1">Posts will appear here automatically when published on Facebook.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {socialPosts.map(post => {
                const dateStr = post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })
                  : "Recently"

                return (
                  <div
                    key={post.id}
                    className="rounded-2xl border flex flex-col overflow-hidden group transition-all hover:border-[#16acd4]/50 hover:shadow-[0_0_20px_rgba(22,172,212,0.1)]"
                    style={{
                      background: "#0a1317",
                      borderColor: "#1a2328"
                    }}
                  >
                    {/* Media Thumbnail */}
                    <div className="h-48 relative overflow-hidden bg-[#07090b]">
                      <img
                        src={post.url}
                        alt="Facebook update"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => {
                          ;(e.currentTarget as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop"
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1317] via-transparent to-transparent opacity-75" />

                      {/* Facebook Logo Pill */}
                      <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#1877f2] flex items-center justify-center text-white shadow-md">
                        <Facebook className="w-4 h-4 fill-white" />
                      </div>

                      {/* Date */}
                      <div className="absolute bottom-2.5 left-2.5 text-[10px] font-mono text-zinc-300 font-bold bg-[#07090b]/80 px-2 py-0.5 rounded">
                        {dateStr}
                      </div>
                    </div>

                    {/* Caption & Actions */}
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <p
                        className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-4"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
                        {post.caption || "Inspection & delivery dispatch from Detailing Garage Studio."}
                      </p>

                      <div className="pt-3 border-t border-[#1a2328] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setActiveSocialModal(post)}
                          className="text-[11px] font-bold text-[#16acd4] hover:underline uppercase tracking-wider"
                        >
                          Read Story
                        </button>

                        {post.link && (
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                          >
                            <span>Facebook</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Article Reader Modal ── */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-2xl bg-[#0a1317] border border-[#1a2328] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#16acd4]/15 border border-[#16acd4]/30 text-[#16acd4]">
                {activeArticle.category}
              </span>
            </div>

            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-3"
              style={{ fontFamily: "'Saira Semi Condensed', sans-serif" }}
            >
              {activeArticle.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono mb-6 border-b border-[#1a2328] pb-4">
              <span>By {activeArticle.author} ({activeArticle.authorRole})</span>
              <span>•</span>
              <span>{activeArticle.date}</span>
              <span>•</span>
              <span>{activeArticle.readTime}</span>
            </div>

            <div className="h-64 sm:h-80 rounded-xl overflow-hidden mb-6 bg-[#07090b]">
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed" style={{ fontFamily: "Manrope, sans-serif" }}>
              {activeArticle.content.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#1a2328] flex items-center justify-between flex-wrap gap-3">
              <div className="flex flex-wrap gap-1.5">
                {activeArticle.tags.map(t => (
                  <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#07090b] text-zinc-400 border border-[#1a2328]">
                    #{t}
                  </span>
                ))}
              </div>

              <Link
                href="/book"
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                style={{ background: "#16acd4", color: "#07090b" }}
              >
                Book PDI / Detailing Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Facebook Post Reader Modal ── */}
      {activeSocialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0a1317] border border-[#1a2328] shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveSocialModal(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#1877f2] flex items-center justify-center text-white">
                <Facebook className="w-4 h-4 fill-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Detailing Garage Official</p>
                <p className="text-[10px] text-zinc-400 font-mono">
                  {activeSocialModal.publishedAt
                    ? new Date(activeSocialModal.publishedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })
                    : "Verified Dispatch"}
                </p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden mb-4 bg-[#07090b] max-h-96">
              <img
                src={activeSocialModal.url}
                alt="Facebook dispatch"
                className="w-full h-auto object-contain max-h-96"
              />
            </div>

            <div className="text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line mb-6 font-sans">
              {activeSocialModal.caption}
            </div>

            <div className="pt-4 border-t border-[#1a2328] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveSocialModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 hover:bg-white/5 text-zinc-300"
              >
                Close
              </button>

              {activeSocialModal.link && (
                <a
                  href={activeSocialModal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1877f2] text-white hover:bg-[#166fe5]"
                >
                  <Facebook className="w-3.5 h-3.5 fill-white" />
                  <span>Open on Facebook ↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Floating WhatsApp Button ── */}
      <a
        href="https://wa.me/918679800074?text=Hi%20Detailing%20Garage%2C%20I%20have%20a%20question%20about%20your%20blog%20and%20services."
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
