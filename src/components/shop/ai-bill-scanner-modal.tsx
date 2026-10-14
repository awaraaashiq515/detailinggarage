"use client"

import { useState, useRef, useEffect } from "react"
import {
    Sparkles,
    Upload,
    Camera,
    FileText,
    CheckCircle2,
    AlertCircle,
    X,
    RefreshCw,
    Plus,
    Trash2,
    Boxes,
    Package,
    Key,
    ExternalLink,
    HelpCircle,
    ArrowRight,
    IndianRupee,
    Info,
    Layers
} from "lucide-react"

export interface ScannedItem {
    id: string
    selected: boolean
    action: "RESTOCK" | "CREATE"
    existingItemId: string | null
    name: string
    detectedName: string
    sku: string
    quantity: number
    currentStock: number
    newTotalStock: number
    unit: string
    purchasePrice: number
    sellingPrice: number
    hsnSacCode: string
    taxRate: number
    pageNumber?: number
}

interface PageItem {
    id: string
    file: File
    previewUrl: string
}

interface AiBillScannerModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

const COMMON_UNITS = ["PCS", "LTR", "BOTTLE", "BOX", "SET", "KG", "CAN", "MTR", "PACK", "ROLL", "KIT"]
const TAX_RATES = [0, 5, 12, 18, 28]

export function AiBillScannerModal({ isOpen, onClose, onSuccess }: AiBillScannerModalProps) {
    // Workflow step: 1 = upload, 2 = review, 3 = success
    const [step, setStep] = useState<1 | 2 | 3>(1)

    // Multi-page state
    const [pages, setPages] = useState<PageItem[]>([])
    const [scanning, setScanning] = useState(false)
    const [scanProgress, setScanProgress] = useState<string | null>(null)
    const [scanError, setScanError] = useState<string | null>(null)
    const [scanNotice, setScanNotice] = useState<string | null>(null)

    // Extracted invoice metadata
    const [vendorName, setVendorName] = useState("")
    const [invoiceNumber, setInvoiceNumber] = useState("")
    const [invoiceDate, setInvoiceDate] = useState("")
    const [items, setItems] = useState<ScannedItem[]>([])
    const [engineUsed, setEngineUsed] = useState<string>("LOCAL_AI")

    // AI Key State (Optional)
    const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
    const [apiKeyInput, setApiKeyInput] = useState("")
    const [showKeyConfig, setShowKeyConfig] = useState(false)
    const [savingKey, setSavingKey] = useState(false)
    const [keySaveSuccess, setKeySaveSuccess] = useState(false)

    // Import state
    const [importing, setImporting] = useState(false)
    const [importSummary, setImportSummary] = useState<{
        countCreated: number
        countRestocked: number
        totalUnitsAdded: number
    } | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const appendFileInputRef = useRef<HTMLInputElement>(null)
    const appendCameraInputRef = useRef<HTMLInputElement>(null)

    // Check Gemini API key status on open
    useEffect(() => {
        if (isOpen) {
            checkAiSettings()
        } else {
            resetModal()
        }
    }, [isOpen])

    const resetModal = () => {
        setStep(1)
        pages.forEach(p => {
            if (p.previewUrl) URL.revokeObjectURL(p.previewUrl)
        })
        setPages([])
        setScanning(false)
        setScanProgress(null)
        setScanError(null)
        setScanNotice(null)
        setVendorName("")
        setInvoiceNumber("")
        setInvoiceDate("")
        setItems([])
        setImporting(false)
        setImportSummary(null)
        setShowKeyConfig(false)
    }

    const checkAiSettings = async () => {
        try {
            const res = await fetch("/api/shop/billing/items/ai-settings")
            const data = await res.json()
            if (data.success) {
                setHasApiKey(data.isConfigured)
            }
        } catch (e) {
            console.error("Failed to check AI settings:", e)
        }
    }

    const handleSaveApiKey = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!apiKeyInput.trim()) return

        setSavingKey(true)
        setScanError(null)
        try {
            const res = await fetch("/api/shop/billing/items/ai-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
            })
            const data = await res.json()
            if (data.success) {
                setHasApiKey(true)
                setKeySaveSuccess(true)
                setShowKeyConfig(false)
                setTimeout(() => setKeySaveSuccess(false), 3000)
            } else {
                setScanError(data.error || "Failed to save API key")
            }
        } catch (e: any) {
            setScanError(e.message || "Failed to save API key")
        } finally {
            setSavingKey(false)
        }
    }

    // Add files to pages array
    const addFiles = (fileList: FileList | File[]) => {
        setScanError(null)
        setScanNotice(null)
        const newPages: PageItem[] = []
        for (let i = 0; i < fileList.length; i++) {
            const f = fileList[i]
            const previewUrl = f.type.startsWith("image/") ? URL.createObjectURL(f) : ""
            newPages.push({
                id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                file: f,
                previewUrl
            })
        }
        setPages(prev => [...prev, ...newPages])
    }

    const removePage = (id: string) => {
        setPages(prev => {
            const item = prev.find(p => p.id === id)
            if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
            return prev.filter(p => p.id !== id)
        })
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files)
        }
    }

    /**
     * Compress large phone photos on client-side canvas before uploading
     * Reduces 10MB photo to 80KB in 25ms, making upload & OCR lightning fast
     */
    const compressImageForUpload = async (file: File): Promise<Blob | File> => {
        if (!file.type.startsWith("image/")) return file
        return new Promise((resolve) => {
            const img = new Image()
            const objectUrl = URL.createObjectURL(file)
            img.onload = () => {
                URL.revokeObjectURL(objectUrl)
                const maxDim = 1000
                let { width, height } = img
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width)
                        width = maxDim
                    } else {
                        width = Math.round((width * maxDim) / height)
                        height = maxDim
                    }
                }
                const canvas = document.createElement("canvas")
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext("2d")
                if (!ctx) return resolve(file)
                ctx.drawImage(img, 0, 0, width, height)
                canvas.toBlob(
                    (blob) => resolve(blob || file),
                    "image/jpeg",
                    0.8
                )
            }
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl)
                resolve(file)
            }
            img.src = objectUrl
        })
    }

    /**
     * Scan a single file via the API with ultra-fast pre-compressed payload
     */
    const scanSingleFile = async (f: File, pageNum: number) => {
        const payloadBlob = await compressImageForUpload(f)
        const formData = new FormData()
        formData.append("file", payloadBlob, f.name || `bill-page-${pageNum}.jpg`)
        if (apiKeyInput.trim()) {
            formData.append("apiKey", apiKeyInput.trim())
        }

        const res = await fetch("/api/shop/billing/items/ai-bill-scan", {
            method: "POST",
            body: formData,
        })
        const data = await res.json()
        return { ok: res.ok, status: res.status, data }
    }

    /**
     * Scan all uploaded pages step-by-step
     */
    const handleScanAllPages = async () => {
        if (pages.length === 0) {
            setScanError("Please select or upload at least 1 page of the purchase bill")
            return
        }

        setScanning(true)
        setScanError(null)
        setScanNotice(null)

        const allExtractedItems: ScannedItem[] = []
        let lastVendor = ""
        let lastInvNo = ""
        let lastDate = ""
        let lastEngine = "LOCAL_AI"
        let summaryPageNotices: string[] = []

        try {
            for (let i = 0; i < pages.length; i++) {
                const pageNum = i + 1
                setScanProgress(`Scanning Page ${pageNum} of ${pages.length}... extracting items`)

                try {
                    const result = await scanSingleFile(pages[i].file, pageNum)
                    const data = result.data

                    if (result.ok && data.success) {
                        if (data.vendorName && !lastVendor) lastVendor = data.vendorName
                        if (data.invoiceNumber && !lastInvNo) lastInvNo = data.invoiceNumber
                        if (data.invoiceDate && !lastDate) lastDate = data.invoiceDate
                        if (data.engineUsed) lastEngine = data.engineUsed

                        if (Array.isArray(data.items)) {
                            const taggedItems = data.items.map((it: ScannedItem) => ({
                                ...it,
                                pageNumber: pageNum
                            }))
                            allExtractedItems.push(...taggedItems)
                        }
                    } else if (data?.isSummaryPage) {
                        summaryPageNotices.push(`Page ${pageNum} appears to be a Summary/Tax page (no individual items).`)
                    } else if (pages.length === 1) {
                        setScanError(data?.message || "Failed to process bill image. Please ensure photo is clear and legible.")
                        setScanning(false)
                        setScanProgress(null)
                        return
                    }
                } catch (pageErr: any) {
                    console.error(`Error on page ${pageNum}:`, pageErr)
                    if (pages.length === 1) {
                        setScanError(pageErr.message || "Failed to process bill image. Please try again.")
                        setScanning(false)
                        setScanProgress(null)
                        return
                    }
                }
            }

            if (allExtractedItems.length === 0) {
                if (summaryPageNotices.length > 0) {
                    setScanError(`${summaryPageNotices.join(" ")} Please upload Page 1 containing product lines & rates.`)
                } else {
                    setScanError("No product items could be detected. Please ensure invoice items, quantities, and rates are clearly visible.")
                }
                setScanning(false)
                setScanProgress(null)
                return
            }

            if (summaryPageNotices.length > 0) {
                setScanNotice(summaryPageNotices.join(" "))
            }

            setVendorName(lastVendor)
            setInvoiceNumber(lastInvNo)
            setInvoiceDate(lastDate)
            setEngineUsed(lastEngine)
            setItems(allExtractedItems)
            setStep(2)
        } catch (err: any) {
            console.error("Scan error:", err)
            setScanError(err.message || "Failed to scan pages.")
        } finally {
            setScanning(false)
            setScanProgress(null)
        }
    }

    /**
     * Append a new page from Step 2 directly into the existing review table
     */
    const handleScanAppendFile = async (newFile: File) => {
        setScanning(true)
        setScanError(null)
        setScanNotice(null)
        setScanProgress(`Scanning new page...`)

        try {
            const pageNum = pages.length + 1
            const result = await scanSingleFile(newFile, pageNum)
            const data = result.data

            if (!result.ok || !data.success) {
                if (data?.isSummaryPage) {
                    setScanNotice(`Scanned page looks like a Summary/Tax page (no new items found).`)
                } else {
                    setScanError(data?.message || "Could not detect items on this page.")
                }
                setScanning(false)
                setScanProgress(null)
                return
            }

            if (Array.isArray(data.items) && data.items.length > 0) {
                const tagged = data.items.map((it: ScannedItem) => ({
                    ...it,
                    pageNumber: pageNum
                }))
                setItems(prev => [...prev, ...tagged])
                setScanNotice(`Added ${tagged.length} new items from Page ${pageNum}!`)
            } else {
                setScanNotice("No new items were detected on this page.")
            }
        } catch (err: any) {
            console.error("Append page error:", err)
            setScanError(err.message || "Failed to scan new page.")
        } finally {
            setScanning(false)
            setScanProgress(null)
        }
    }

    // Item row edits in review table
    const updateItem = (index: number, field: keyof ScannedItem, value: any) => {
        setItems(prev => {
            const next = [...prev]
            const it = { ...next[index], [field]: value }

            if (field === "quantity" && it.action === "RESTOCK") {
                it.newTotalStock = it.currentStock + (parseFloat(value) || 0)
            }
            if (field === "quantity" && it.action === "CREATE") {
                it.newTotalStock = parseFloat(value) || 0
            }

            next[index] = it
            return next
        })
    }

    const toggleSelectItem = (index: number) => {
        setItems(prev => {
            const next = [...prev]
            next[index] = { ...next[index], selected: !next[index].selected }
            return next
        })
    }

    const toggleSelectAll = (select: boolean) => {
        setItems(prev => prev.map(i => ({ ...i, selected: select })))
    }

    const removeItemRow = (index: number) => {
        setItems(prev => prev.filter((_, idx) => idx !== index))
    }

    const addNewBlankRow = () => {
        const newItem: ScannedItem = {
            id: `manual-item-${Date.now()}`,
            selected: true,
            action: "CREATE",
            existingItemId: null,
            name: "New Product",
            detectedName: "Manual Addition",
            sku: "",
            quantity: 1,
            currentStock: 0,
            newTotalStock: 1,
            unit: "PCS",
            purchasePrice: 0,
            sellingPrice: 0,
            hsnSacCode: "",
            taxRate: 18
        }
        setItems(prev => [newItem, ...prev])
    }

    // Step 2 -> 3: Commit selected items to inventory
    const handleConfirmImport = async () => {
        const selectedItems = items.filter(i => i.selected)
        if (selectedItems.length === 0) {
            setScanError("Please select at least 1 item to add to stock")
            return
        }

        setImporting(true)
        setScanError(null)

        try {
            const res = await fetch("/api/shop/billing/items/ai-bill-import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vendorName: vendorName.trim() || undefined,
                    invoiceNumber: invoiceNumber.trim() || undefined,
                    invoiceDate: invoiceDate || undefined,
                    items: selectedItems
                })
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                setScanError(data.message || data.error || "Failed to import items into inventory.")
                setImporting(false)
                return
            }

            setImportSummary({
                countCreated: data.countCreated || 0,
                countRestocked: data.countRestocked || 0,
                totalUnitsAdded: data.totalUnitsAdded || 0,
            })
            setStep(3)
        } catch (e: any) {
            console.error("Import error:", e)
            setScanError(e.message || "Failed to commit items to database.")
        } finally {
            setImporting(false)
        }
    }

    if (!isOpen) return null

    const selectedCount = items.filter(i => i.selected).length
    const restockCount = items.filter(i => i.selected && i.action === "RESTOCK").length
    const createCount = items.filter(i => i.selected && i.action === "CREATE").length
    const totalUnits = items.filter(i => i.selected).reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0)

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="relative w-full max-w-5xl bg-[#101012] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]">
                
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-3 bg-gradient-to-r from-cyan-950/20 via-black to-black">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                    INVENTORY BILL SCANNER
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Built-in AI Active (No API Key Needed)
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowKeyConfig(!showKeyConfig)}
                                    className="text-[9px] text-zinc-500 hover:text-zinc-300 underline ml-1"
                                >
                                    {showKeyConfig ? "Hide Cloud Key" : "Optional Gemini Key"}
                                </button>
                            </div>
                            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                                Scan Purchase Bill &amp; Add to Stock
                            </h2>
                            <p className="text-xs text-zinc-400 hidden sm:block">
                                Upload 1 or multiple bill pages (Page 1, Page 2...). AI extracts all product items, rates &amp; quantities into stock.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={scanning || importing}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Optional Cloud Gemini Config */}
                {showKeyConfig && (
                    <div className="my-3 mx-4 sm:mx-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-transparent border border-cyan-500/30 text-xs space-y-3 shrink-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                                <div className="font-bold text-white flex items-center gap-1.5">
                                    <Key className="w-4 h-4 text-cyan-400" />
                                    <span>Google Gemini Free AI API Key (Optional)</span>
                                </div>
                                <p className="text-zinc-300 text-[11px]">
                                    Your built-in AI works completely offline without any API key. If you prefer to use Google Gemini Cloud AI instead, you can optionally paste your free key here.
                                </p>
                            </div>
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-[10px] shrink-0 uppercase tracking-wider"
                            >
                                <span>Get Free Key</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder="Paste your Gemini API key here (e.g. AIzaSy...)"
                                className="flex-1 px-3 py-2 rounded-xl text-xs bg-black/50 border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => handleSaveApiKey()}
                                disabled={savingKey || !apiKeyInput.trim()}
                                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-colors shrink-0"
                            >
                                {savingKey ? "Saving..." : "Save Key"}
                            </button>
                        </div>
                    </div>
                )}

                {keySaveSuccess && (
                    <div className="my-2 mx-4 sm:mx-6 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Google Gemini API Key saved successfully!</span>
                    </div>
                )}

                {/* Scan / Import Error Display */}
                {scanError && (
                    <div className="my-2 mx-4 sm:mx-6 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>{scanError}</span>
                        </div>
                        <button onClick={() => setScanError(null)} className="text-zinc-400 hover:text-white">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Informational Notice */}
                {scanNotice && (
                    <div className="my-2 mx-4 sm:mx-6 p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>{scanNotice}</span>
                        </div>
                        <button onClick={() => setScanNotice(null)} className="text-zinc-400 hover:text-white">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Main Step Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 py-2">
                    {/* ============================================================
                        STEP 1: Upload or Capture Multi-Page Purchasing Bill
                    ============================================================ */}
                    {step === 1 && (
                        <div className="space-y-4">
                            {/* Drag and Drop Box */}
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                                    pages.length > 0
                                        ? "border-cyan-500/50 bg-cyan-950/10"
                                        : "border-white/15 hover:border-cyan-400/50 hover:bg-white/[0.02]"
                                }`}
                            >
                                {pages.length > 0 ? (
                                    <div className="space-y-4 w-full" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <Layers className="w-4 h-4 text-cyan-400" />
                                                <span>{pages.length} Bill Page{pages.length > 1 ? "s" : ""} Selected</span>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => cameraInputRef.current?.click()}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                                                >
                                                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                                                    <span>+ Photo</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                                                >
                                                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                                                    <span>+ Add Page</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Multi-page grid previews */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                                            {pages.map((p, idx) => (
                                                <div key={p.id} className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 group">
                                                    {p.previewUrl ? (
                                                        <img
                                                            src={p.previewUrl}
                                                            alt={`Page ${idx + 1}`}
                                                            className="w-full h-32 object-contain bg-black"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-32 flex flex-col items-center justify-center gap-1 text-zinc-400">
                                                            <FileText className="w-8 h-8 text-cyan-400" />
                                                            <span className="text-[10px] font-mono truncate px-2">{p.file.name}</span>
                                                        </div>
                                                    )}
                                                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-cyan-300 border border-white/10">
                                                        Page {idx + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removePage(p.id)}
                                                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 text-zinc-300 hover:text-white hover:bg-red-600 transition-colors"
                                                        title="Remove page"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="text-[11px] text-zinc-400 text-center">
                                            Tip: If your invoice contains multiple pages (Page 1, Page 2...), add all pages here. The AI will scan them sequentially.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                                            <Upload className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="text-sm sm:text-base font-bold text-white">
                                                Click or Drag &amp; Drop Purchasing Bill / Invoice
                                            </p>
                                            <p className="text-xs text-zinc-400 mt-1 max-w-md">
                                                Supports camera photos, multi-page bills, GST Tax Invoices, cash receipts &amp; delivery slips
                                            </p>
                                        </div>

                                        {/* Camera & Browse Buttons */}
                                        <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                onClick={() => cameraInputRef.current?.click()}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 transition-colors"
                                            >
                                                <Camera className="w-4 h-4 text-cyan-400" />
                                                <span>Take Photo</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 transition-colors"
                                            >
                                                <FileText className="w-4 h-4 text-cyan-400" />
                                                <span>Browse Files (Multi-Select)</span>
                                            </button>
                                        </div>
                                    </>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            addFiles(e.target.files)
                                        }
                                    }}
                                />

                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            addFiles(e.target.files)
                                        }
                                    }}
                                />
                            </div>

                            {/* How It Works Guide */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
                                <div className="space-y-1">
                                    <div className="font-bold text-white flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-black">1</span>
                                        <span>Multi-Page Support</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400">Upload Page 1, Page 2, Page 3 together or scan them step-by-step.</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="font-bold text-white flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-black">2</span>
                                        <span>Auto Stock Matching</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400">Existing products get restocked (+qty); new items are created automatically.</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="font-bold text-white flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-black">3</span>
                                        <span>1-Click Stock Add</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400">Review and edit items in the table, then add everything to stock with 1 click.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================
                        STEP 2: Review & Edit Extracted Items Table
                    ============================================================ */}
                    {step === 2 && (
                        <div className="space-y-4">
                            {/* Engine Badge & Page Append Action */}
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                        <Sparkles className="w-3 h-3 text-cyan-400" />
                                        {engineUsed === "LOCAL_AI"
                                            ? "Scanned with Built-in Local AI Engine (100% Free • No Key Used)"
                                            : "Scanned with Google Gemini AI"}
                                    </span>
                                </div>

                                {/* Step-by-Step Scan Next Page Button */}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => appendCameraInputRef.current?.click()}
                                        disabled={scanning}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all shadow-sm active:scale-95"
                                        title="Capture next page with camera"
                                    >
                                        <Camera className="w-3.5 h-3.5 text-purple-300" />
                                        <span>+ Scan Page via Camera</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => appendFileInputRef.current?.click()}
                                        disabled={scanning}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all shadow-sm active:scale-95"
                                        title="Upload next page image file"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-purple-300" />
                                        <span>+ Add / Scan Next Page</span>
                                    </button>

                                    <input
                                        ref={appendFileInputRef}
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleScanAppendFile(e.target.files[0])
                                            }
                                        }}
                                    />

                                    <input
                                        ref={appendCameraInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleScanAppendFile(e.target.files[0])
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Scanning overlay banner if scanning additional page */}
                            {scanning && (
                                <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-2 animate-pulse">
                                    <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                                    <span>{scanProgress || "Scanning additional page & extracting items..."}</span>
                                </div>
                            )}

                            {/* Invoice Summary Card */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                                        Supplier / Vendor Name
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorName}
                                        onChange={(e) => setVendorName(e.target.value)}
                                        placeholder="e.g. PARAMHANS AUTO / 3M India"
                                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white font-bold focus:border-cyan-400 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                                        Invoice / Bill Number
                                    </label>
                                    <input
                                        type="text"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                        placeholder="e.g. RA-5206/26-27"
                                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                                        Bill Date
                                    </label>
                                    <input
                                        type="text"
                                        value={invoiceDate}
                                        onChange={(e) => setInvoiceDate(e.target.value)}
                                        placeholder="e.g. 10-Oct-26"
                                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:border-cyan-400 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Items Match Counts & Selection Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30 text-[11px]">
                                        {selectedCount} of {items.length} Selected
                                    </span>
                                    {restockCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                                            {restockCount} Existing (Restock)
                                        </span>
                                    )}
                                    {createCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                                            {createCount} New Products
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleSelectAll(true)}
                                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-zinc-600">•</span>
                                    <button
                                        type="button"
                                        onClick={() => toggleSelectAll(false)}
                                        className="text-[11px] text-zinc-400 hover:text-white"
                                    >
                                        Deselect All
                                    </button>
                                    <span className="text-zinc-600">•</span>
                                    <button
                                        type="button"
                                        onClick={addNewBlankRow}
                                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>Add Item Manually</span>
                                    </button>
                                </div>
                            </div>

                            {/* Review & Edit Items Table */}
                            <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40">
                                <div className="overflow-x-auto max-h-80 custom-scrollbar">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#18181b] border-b border-white/10 text-zinc-400 font-bold text-[10px] uppercase tracking-wider sticky top-0 z-10">
                                            <tr>
                                                <th className="p-3 w-10 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCount === items.length && items.length > 0}
                                                        onChange={(e) => toggleSelectAll(e.target.checked)}
                                                        className="rounded accent-cyan-400 cursor-pointer"
                                                    />
                                                </th>
                                                <th className="p-3 min-w-[220px]">Product / Item Name</th>
                                                <th className="p-3 w-28">Action</th>
                                                <th className="p-3 w-24">Qty</th>
                                                <th className="p-3 w-28">Unit</th>
                                                <th className="p-3 w-32">Purchase Rate (₹)</th>
                                                <th className="p-3 w-32">Selling Price (₹)</th>
                                                <th className="p-3 w-24">GST %</th>
                                                <th className="p-3 w-10 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {items.map((it, idx) => (
                                                <tr
                                                    key={it.id}
                                                    className={`transition-colors ${
                                                        it.selected ? "bg-white/[0.02] hover:bg-white/[0.04]" : "opacity-40 hover:opacity-70 bg-transparent"
                                                    }`}
                                                >
                                                    <td className="p-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={it.selected}
                                                            onChange={() => toggleSelectItem(idx)}
                                                            className="rounded accent-cyan-400 cursor-pointer"
                                                        />
                                                    </td>

                                                    {/* Name & SKU */}
                                                    <td className="p-3">
                                                        <div className="space-y-1">
                                                            <input
                                                                type="text"
                                                                value={it.name}
                                                                onChange={(e) => updateItem(idx, "name", e.target.value)}
                                                                className="w-full px-2 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-white font-bold focus:border-cyan-400 outline-none"
                                                            />
                                                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                                                {it.pageNumber && (
                                                                    <span className="px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-mono">
                                                                        P{it.pageNumber}
                                                                    </span>
                                                                )}
                                                                <span>SKU/HSN:</span>
                                                                <input
                                                                    type="text"
                                                                    value={it.sku || it.hsnSacCode || ""}
                                                                    onChange={(e) => {
                                                                        updateItem(idx, "sku", e.target.value)
                                                                        updateItem(idx, "hsnSacCode", e.target.value)
                                                                    }}
                                                                    placeholder="Optional"
                                                                    className="w-24 px-1 py-0.5 rounded bg-transparent border-b border-white/10 text-zinc-300 font-mono text-[10px] outline-none focus:border-cyan-400"
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Action Badge */}
                                                    <td className="p-3">
                                                        {it.action === "RESTOCK" ? (
                                                            <div className="space-y-0.5">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                                    <span>Restock</span>
                                                                </span>
                                                                <span className="text-[10px] text-zinc-500 block font-mono">
                                                                    {it.currentStock} → {it.newTotalStock} {it.unit}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                                <Plus className="w-2.5 h-2.5" />
                                                                <span>New Product</span>
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Qty */}
                                                    <td className="p-3">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={it.quantity}
                                                            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                                                            className="w-20 px-2 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-white font-mono font-bold focus:border-cyan-400 outline-none"
                                                        />
                                                    </td>

                                                    {/* Unit */}
                                                    <td className="p-3">
                                                        <select
                                                            value={it.unit}
                                                            onChange={(e) => updateItem(idx, "unit", e.target.value)}
                                                            className="px-2 py-1 rounded-lg text-xs bg-[#18181b] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                                                        >
                                                            {COMMON_UNITS.map(u => (
                                                                <option key={u} value={u}>{u}</option>
                                                            ))}
                                                        </select>
                                                    </td>

                                                    {/* Purchase Price */}
                                                    <td className="p-3">
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1.5 text-zinc-500 text-xs">₹</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={it.purchasePrice || ""}
                                                                onChange={(e) => updateItem(idx, "purchasePrice", parseFloat(e.target.value) || 0)}
                                                                className="w-28 pl-5 pr-2 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-amber-300 font-mono font-bold focus:border-cyan-400 outline-none"
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* Selling Price */}
                                                    <td className="p-3">
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1.5 text-zinc-500 text-xs">₹</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={it.sellingPrice || ""}
                                                                onChange={(e) => updateItem(idx, "sellingPrice", parseFloat(e.target.value) || 0)}
                                                                className="w-28 pl-5 pr-2 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-emerald-400 font-mono font-bold focus:border-cyan-400 outline-none"
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* Tax Rate */}
                                                    <td className="p-3">
                                                        <select
                                                            value={it.taxRate}
                                                            onChange={(e) => updateItem(idx, "taxRate", parseInt(e.target.value) || 0)}
                                                            className="px-2 py-1 rounded-lg text-xs bg-[#18181b] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                                                        >
                                                            {TAX_RATES.map(r => (
                                                                <option key={r} value={r}>{r}%</option>
                                                            ))}
                                                        </select>
                                                    </td>

                                                    {/* Delete Row */}
                                                    <td className="p-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItemRow(idx)}
                                                            className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================
                        STEP 3: Success Confirmation View
                    ============================================================ */}
                    {step === 3 && importSummary && (
                        <div className="py-8 text-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-black text-white">
                                    Inventory Updated Successfully!
                                </h3>
                                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                                    All confirmed items from bill {invoiceNumber || "purchasing invoice"} have been committed to stock records.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Total Units Added</span>
                                    <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                                        +{importSummary.totalUnitsAdded}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Existing Restocked</span>
                                    <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
                                        {importSummary.countRestocked}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">New Items Created</span>
                                    <span className="text-2xl font-black text-blue-400 font-mono mt-1 block">
                                        {importSummary.countCreated}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 sm:p-5 border-t border-white/10 bg-[#121214] flex flex-wrap items-center justify-between gap-3">
                    {step === 1 && (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={scanning}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleScanAllPages}
                                disabled={scanning || pages.length === 0}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-black text-xs uppercase tracking-wider transition-all disabled:opacity-40 shadow-lg shadow-cyan-500/20 active:scale-95"
                            >
                                {scanning ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>{scanProgress || "AI Reading Bill Pages..."}</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 fill-black" />
                                        <span>
                                            {pages.length > 1
                                                ? `Scan All ${pages.length} Pages & Extract Items`
                                                : "Scan & Extract Items"}
                                        </span>
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                disabled={importing}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                ← Back to Upload
                            </button>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-zinc-400 hidden sm:inline">
                                    Total: <strong className="text-white">{totalUnits} units</strong> to be added
                                </span>
                                <button
                                    type="button"
                                    onClick={handleConfirmImport}
                                    disabled={importing || selectedCount === 0}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black font-black text-xs uppercase tracking-wider transition-all disabled:opacity-40 shadow-lg shadow-emerald-500/25 active:scale-95"
                                >
                                    {importing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Adding to Inventory...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Confirm &amp; Add to Stock ({selectedCount})</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <div className="w-full flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    onSuccess()
                                    onClose()
                                }}
                                className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-400/25"
                            >
                                Done &amp; View Inventory
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
