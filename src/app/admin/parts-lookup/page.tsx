"use client"

import { useState, useCallback, useRef } from "react"
import {
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Package,
  Tag,
  IndianRupee,
  Clock,
  Database,
  Download,
  Zap,
  ImageOff,
  Boxes,
  History,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PartData {
  partNumber: string
  sku?: string | null
  partName: string | null
  mrp: string | null
  availability: string | null
  imageUrl: string | null
  category: string | null
  status: "FOUND" | "NOT_FOUND" | "ERROR"
  fromCache: boolean
  scrapedAt: string
}

interface HistoryItem {
  id: string
  partNumber: string
  sku?: string | null
  partName: string | null
  mrp: string | null
  availability: string | null
  status: string
  category: string | null
  scrapedAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function downloadCSV(items: HistoryItem[]) {
  const headers = ["Part Number", "Part Name", "MRP", "Availability", "Category", "Status", "Scraped At"]
  const rows = items.map((p) => [
    p.partNumber,
    p.partName || "",
    p.mrp || "",
    p.availability || "",
    p.category || "",
    p.status,
    formatDate(p.scrapedAt),
  ])
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `maruti-parts-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "FOUND") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" />
        Found
      </span>
    )
  }
  if (status === "NOT_FOUND") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
        <XCircle className="w-3 h-3" />
        Not Found
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
      <AlertCircle className="w-3 h-3" />
      Error
    </span>
  )
}

function CacheBadge({ fromCache }: { fromCache: boolean }) {
  if (fromCache) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Database className="w-3 h-3" />
        Cached
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#16acd4]/10 text-[#16acd4] border border-[#16acd4]/20">
      <Zap className="w-3 h-3" />
      Live Scrape
    </span>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PartsLookupPage() {
  const [partNumber, setPartNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PartData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyFilter, setHistoryFilter] = useState("")
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Lookup ──────────────────────────────────────────────────────────────────

  const handleLookup = useCallback(
    async (forceRefresh = false) => {
      const pn = partNumber.trim().toUpperCase()
      if (!pn) {
        setError("Please enter a part number")
        inputRef.current?.focus()
        return
      }
      if (!/^[A-Z0-9\-_]{2,50}$/.test(pn)) {
        setError("Invalid part number format — use alphanumeric characters only")
        return
      }

      setLoading(true)
      setResult(null)
      setError(null)

      try {
        const res = await fetch("/api/admin/parts-lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partNumber: pn, forceRefresh }),
        })

        const json = await res.json()

        if (!res.ok || !json.success) {
          throw new Error(json.error || "An unexpected error occurred")
        }

        setResult(json.data as PartData)

        // Refresh history list if it's open
        if (historyLoaded) {
          loadHistory()
        }
      } catch (err) {
        setError((err as Error).message || "Network error — please try again")
      } finally {
        setLoading(false)
      }
    },
    [partNumber, historyLoaded]
  )

  // ── History ─────────────────────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch("/api/admin/parts-lookup?limit=100")
      const json = await res.json()
      if (json.success) {
        setHistory(json.data as HistoryItem[])
        setHistoryLoaded(true)
      }
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const toggleHistory = async () => {
    if (!showHistory && !historyLoaded) {
      await loadHistory()
    }
    setShowHistory((p) => !p)
  }

  // ── Copy ──────────────────────────────────────────────────────────────────

  const copyPartNumber = (pn: string) => {
    navigator.clipboard.writeText(pn)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredHistory = historyFilter
    ? history.filter(
        (h) =>
          h.partNumber.includes(historyFilter.toUpperCase()) ||
          (h.partName || "").toLowerCase().includes(historyFilter.toLowerCase())
      )
    : history

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#16acd4]/10 border border-[#16acd4]/20 flex items-center justify-center">
              <Boxes className="w-5 h-5 text-[#16acd4]" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Maruti Parts Lookup
            </h1>
          </div>
          <p className="text-sm text-zinc-500 ml-[52px]">
            Search genuine Maruti Suzuki spare parts — MRP, availability & images
          </p>
        </div>

        {/* History toggle */}
        <button
          onClick={toggleHistory}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all"
        >
          <History className="w-4 h-4" />
          Lookup History
          {showHistory ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Search Panel ───────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border border-white/8 p-6 sm:p-8 space-y-6"
        style={{ background: "linear-gradient(135deg, #121214 0%, #0e1015 100%)" }}
      >
        <div className="space-y-2">
          <label
            htmlFor="partNumber"
            className="text-xs font-bold uppercase tracking-[2px] text-zinc-500"
          >
            Part Number
          </label>
          <div className="relative flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
              <input
                ref={inputRef}
                id="partNumber"
                type="text"
                value={partNumber}
                onChange={(e) => {
                  setPartNumber(e.target.value.toUpperCase())
                  if (error) setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) handleLookup(false)
                }}
                placeholder="e.g. 55121M74K00"
                className="w-full bg-[#09090b] border border-white/10 text-white placeholder:text-zinc-600 rounded-xl pl-12 pr-4 py-3.5 text-sm font-mono focus:outline-none focus:border-[#16acd4]/50 focus:ring-2 focus:ring-[#16acd4]/10 transition-all"
                disabled={loading}
                autoComplete="off"
                autoCapitalize="characters"
              />
            </div>

            <button
              onClick={() => handleLookup(false)}
              disabled={loading || !partNumber.trim()}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-[#16acd4] hover:bg-[#13a0c7] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-[#16acd4]/20 hover:shadow-[#16acd4]/30 shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? "Searching..." : "Search"}
            </button>

            {result && (
              <button
                onClick={() => handleLookup(true)}
                disabled={loading}
                title="Force refresh from website (bypasses cache)"
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm font-bold shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
          </div>
          {error && (
            <p className="flex items-center gap-2 text-sm text-red-400 mt-1 pl-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Tips */}
        <div className="flex flex-wrap gap-2">
          {["55121M74K00", "37110M55NN0", "84710M55NA0"].map((sample) => (
            <button
              key={sample}
              onClick={() => setPartNumber(sample)}
              className="px-3 py-1 rounded-lg border border-white/8 bg-white/5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/15 font-mono transition-all"
            >
              {sample}
            </button>
          ))}
          <span className="px-3 py-1 text-xs text-zinc-600">← Sample part numbers</span>
        </div>
      </div>

      {/* ── Loading State ───────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-white/8 bg-[#121214] p-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-[#16acd4]/10 border border-[#16acd4]/20 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-[#16acd4] animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping border border-[#16acd4]/20 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-sm">Scraping Maruti Suzuki Website</p>
            <p className="text-xs text-zinc-500 mt-1">
              Launching browser → Searching part → Extracting data...
            </p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#16acd4]/60 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Result Card ─────────────────────────────────────────────────────── */}
      {result && !loading && (
        <div className="rounded-2xl border border-white/8 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ background: "linear-gradient(135deg, #121214 0%, #0e1015 100%)" }}>

          {/* Result header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <StatusBadge status={result.status} />
              <CacheBadge fromCache={result.fromCache} />
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(result.scrapedAt)}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {result.status === "NOT_FOUND" ? (
              <div className="flex flex-col items-center py-8 gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-amber-500" />
                </div>
                <p className="text-white font-bold">Part Not Found</p>
                <p className="text-sm text-zinc-500 max-w-sm">
                  No genuine part found for <span className="font-mono text-zinc-300">{result.partNumber}</span> on Maruti Suzuki&apos;s website.
                  Check the part number and try again.
                </p>
              </div>
            ) : result.status === "ERROR" ? (
              <div className="flex flex-col items-center py-8 gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-400" />
                </div>
                <p className="text-white font-bold">Scrape Failed</p>
                <p className="text-sm text-zinc-500">
                  The scraper encountered an error. Use the Refresh button to try again.
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Product Image */}
                <div className="sm:w-48 shrink-0">
                  <div className="w-full aspect-square rounded-2xl border border-white/8 overflow-hidden bg-white/5 flex items-center justify-center">
                    {result.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={result.imageUrl}
                        alt={result.partName || result.partNumber}
                        className="w-full h-full object-contain p-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          target.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                    ) : null}
                    <div className={`flex flex-col items-center gap-2 text-zinc-600 ${result.imageUrl ? "hidden" : ""}`}>
                      <ImageOff className="w-8 h-8" />
                      <span className="text-xs">No Image</span>
                    </div>
                  </div>
                </div>

                {/* Part Details */}
                <div className="flex-1 space-y-5">
                  {/* Part Name */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[2px] text-zinc-600 mb-1">Part Name</p>
                    <p className="text-xl font-bold text-white leading-snug">
                      {result.partName || <span className="text-zinc-500 font-normal text-base">Not available</span>}
                    </p>
                  </div>

                  {/* Part Number */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[2px] text-zinc-600 mb-1">Part Number / SKU</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-base font-mono text-[#16acd4] bg-[#16acd4]/8 px-3 py-1.5 rounded-lg border border-[#16acd4]/20">
                        {result.partNumber}
                      </code>
                      {result.sku && result.sku !== result.partNumber && (
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20" title="Mapped Maruti Genuine Part Number / Root SKU">
                          Mapped SKU: {result.sku}
                        </span>
                      )}
                      <button
                        onClick={() => copyPartNumber(result.sku || result.partNumber)}
                        className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 text-zinc-500 hover:text-white transition-all"
                        title="Copy part number"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* MRP & Availability */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-white/8 bg-white/3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[2px] text-zinc-600 mb-2">
                        <IndianRupee className="w-3.5 h-3.5" />
                        MRP
                      </div>
                      <p className="text-2xl font-bold text-white font-mono">
                        {result.mrp || <span className="text-zinc-500 text-base font-normal">N/A</span>}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-white/8 bg-white/3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[2px] text-zinc-600 mb-2">
                        <Package className="w-3.5 h-3.5" />
                        Availability
                      </div>
                      <p className="text-base font-bold">
                        {result.availability ? (
                          <span className={
                            /in.?stock|available/i.test(result.availability)
                              ? "text-emerald-400"
                              : /out.?of.?stock/i.test(result.availability)
                              ? "text-red-400"
                              : "text-zinc-300"
                          }>
                            {result.availability}
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-normal text-sm">Not specified</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  {result.category && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[2px] text-zinc-600 mb-1">Category</p>
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-sm text-zinc-400">{result.category}</span>
                      </div>
                    </div>
                  )}

                  {/* View on website link */}
                  <a
                    href={`https://www.marutisuzuki.com/genuine-parts?search=${encodeURIComponent(result.partNumber)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-[#16acd4] hover:text-[#13a0c7] font-bold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View on Maruti Suzuki Website
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── History Panel ───────────────────────────────────────────────────── */}
      {showHistory && (
        <div className="rounded-2xl border border-white/8 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ background: "linear-gradient(135deg, #121214 0%, #0e1015 100%)" }}>

          {/* History header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-bold text-white">
                Lookup History
              </span>
              {history.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white/8 text-xs text-zinc-400 font-bold">
                  {history.length} records
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Filter parts..."
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#16acd4]/40 transition-all w-40 font-mono"
              />
              {history.length > 0 && (
                <button
                  onClick={() => downloadCSV(filteredHistory)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
              )}
              <button
                onClick={loadHistory}
                disabled={historyLoading}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                title="Refresh history"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* History Table */}
          {historyLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-zinc-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading history...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-600">
              <Database className="w-8 h-8" />
              <p className="text-sm">
                {historyFilter ? "No matching records" : "No lookups yet — search for a part above"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Part Number", "Part Name", "MRP", "Availability", "Category", "Status", "Scraped At"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[2px] text-zinc-600 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item, i) => (
                    <tr
                      key={item.id}
                      className="border-b border-white/3 hover:bg-white/3 transition-colors cursor-pointer group"
                      onClick={() => {
                        setPartNumber(item.partNumber)
                        setShowHistory(false)
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                    >
                      <td className="px-4 py-3">
                        <code className="text-[#16acd4] font-mono text-xs bg-[#16acd4]/8 px-2 py-0.5 rounded-md">
                          {item.partNumber}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 max-w-[200px] truncate">
                        {item.partName || <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-300 font-mono whitespace-nowrap">
                        {item.mrp || <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {item.availability || <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 max-w-[150px] truncate text-xs">
                        {item.category || <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs whitespace-nowrap">
                        {formatDate(item.scrapedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Info Box ───────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/5 bg-white/2 px-5 py-4 flex gap-3">
        <div className="w-5 h-5 rounded-full bg-[#16acd4]/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[#16acd4] text-xs font-bold">i</span>
        </div>
        <div className="text-xs text-zinc-600 leading-relaxed">
          <span className="text-zinc-400 font-bold">How it works: </span>
          Results are cached for 24 hours to respect the source website. First lookup
          triggers a live Playwright browser scrape of{" "}
          <a
            href="https://www.marutisuzuki.com/genuine-parts"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#16acd4] hover:underline"
          >
            marutisuzuki.com
          </a>
          . Use the{" "}
          <span className="text-zinc-400 font-bold">Refresh</span> button to bypass cache and re-scrape fresh data.
          Data is authorized for internal business use only.
        </div>
      </div>
    </div>
  )
}
