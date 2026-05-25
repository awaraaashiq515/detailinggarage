"use client"

import React, { useState, useRef, useEffect } from "react"

export type ScannedData = {
    amount: number | null
    date: string | null
    invoiceNo: string | null
    rawText: string
}

export default function InvoiceScanner({ onScan, onClose }: { onScan: (data: ScannedData) => void, onClose: () => void }) {
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [status, setStatus] = useState<string>("")
    const [progress, setProgress] = useState<number>(0)
    const [tesseractReady, setTesseractReady] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if ((window as any).Tesseract) {
            setTesseractReady(true)
            return
        }

        const script = document.createElement("script")
        script.src = "https://unpkg.com/tesseract.js@5.0.5/dist/tesseract.min.js"
        script.async = true
        script.onload = () => setTesseractReady(true)
        script.onerror = () => setStatus("Failed to load OCR Library. Check internet connection.")
        document.body.appendChild(script)
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type === "image/heic" || file.type === "image/heif" || file.name.toLowerCase().endsWith(".heic")) {
                alert("HEIC format (iPhone Live Photo/High Efficiency) is not directly supported by browsers. Please change your iPhone settings to 'Most Compatible' or use a JPG/PNG.")
                e.target.value = "" // reset input
                return
            }
            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file (JPG/PNG).")
                e.target.value = ""
                return
            }

            const url = URL.createObjectURL(file)
            setImageSrc(url)
            setImageFile(file)
            setStatus("")
            setProgress(0)
        }
    }

    const startScan = async () => {
        if (!imageSrc || !imageFile) return
        
        const Tesseract = (window as any).Tesseract
        if (!Tesseract) {
            setStatus("OCR Library not loaded yet. Please wait...")
            return
        }
        
        setStatus("Initializing Scanner...")
        setProgress(0)

        try {
            // Draw image to an offscreen canvas to completely bypass worker image reading issues
            const img = document.createElement("img")
            img.src = imageSrc
            await new Promise((resolve, reject) => {
                img.onload = resolve
                img.onerror = () => reject(new Error("Browser failed to render the image. It might be corrupted or in an unsupported format."))
            })

            const canvas = document.createElement("canvas")
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext("2d")
            if (ctx) {
                ctx.drawImage(img, 0, 0)
            }

            const result = await Tesseract.recognize(canvas, "eng", {
                logger: (m: any) => {
                    if (m.status === "recognizing text") {
                        setStatus("Reading text...")
                        setProgress(Math.round(m.progress * 100))
                    } else {
                        setStatus(m.status)
                    }
                }
            })

            const text = result.data.text
            setStatus("Parsing Data...")
            
            // Regex to find common bill patterns
            const amountMatch = text.match(/(?:total|amount|grand|rs\.?|inr|₹)\s*[:\-\.]?\s*([\d,]+(?:\.\d{1,2})?)/i)
            const dateMatch = text.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/)
            const invoiceNoMatch = text.match(/(?:inv|invoice|bill)\s*(?:no|number)?[\s:\-\.#]*([A-Z0-9\-\/]+)/i)

            let amount = null
            if (amountMatch && amountMatch[1]) {
                amount = parseFloat(amountMatch[1].replace(/,/g, ""))
            }

            let date = null
            if (dateMatch && dateMatch[1]) {
                // simple normalization to YYYY-MM-DD for input type="date"
                const parts = dateMatch[1].split(/[\/\-\.]/)
                if (parts.length === 3) {
                    let d = parts[0], m = parts[1], y = parts[2]
                    if (y.length === 2) y = "20" + y // Assume 20xx for 2-digit years
                    // Check if format is DD/MM or MM/DD (usually DD/MM in India)
                    date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
                }
            }

            const invoiceNo = invoiceNoMatch ? invoiceNoMatch[1] : null

            setStatus("Done!")
            setTimeout(() => {
                onScan({ amount, date, invoiceNo, rawText: text })
                onClose()
            }, 500)
            
        } catch (error: any) {
            console.error("OCR Error:", error)
            setStatus(error?.message || "Error scanning document. Please try again.")
        }
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ background: "white", borderRadius: "8px", width: "100%", maxWidth: "450px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                <div style={{ background: "#2a6fbd", color: "white", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        📷 Scan Bill / Invoice
                    </h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "white", fontSize: "18px", cursor: "pointer" }}>✕</button>
                </div>
                
                <div style={{ padding: "20px" }}>
                    {!imageSrc ? (
                        <div 
                            style={{ border: "2px dashed #a0b8d8", borderRadius: "8px", padding: "40px 20px", textAlign: "center", cursor: "pointer", background: "#f5f9ff" }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div style={{ fontSize: "32px", marginBottom: "10px" }}>📸</div>
                            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#2a6fbd" }}>Click to Take Photo or Upload</div>
                            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Tesseract OCR will run locally on your device</div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ position: "relative", width: "100%", height: "250px", backgroundColor: "#000", borderRadius: "4px", overflow: "hidden" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageSrc} alt="Bill Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                <button 
                                    onClick={() => {
                                        setImageSrc(null)
                                        setImageFile(null)
                                    }} 
                                    style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.5)", color: "white", border: "1px solid white", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "11px" }}
                                >
                                    Retake
                                </button>
                            </div>
                            
                            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                {status ? (
                                    <div style={{ padding: "12px", background: "#f0f6ff", borderRadius: "4px", border: "1px solid #c0d8f0" }}>
                                        <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1a4f9a", marginBottom: progress > 0 ? "8px" : "0" }}>
                                            {status}
                                        </div>
                                        {progress > 0 && progress < 100 && (
                                            <div style={{ width: "100%", height: "6px", background: "#d0dff0", borderRadius: "3px", overflow: "hidden" }}>
                                                <div style={{ width: `${progress}%`, height: "100%", background: "#2a6fbd", transition: "width 0.2s" }} />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button 
                                        onClick={startScan}
                                        disabled={!tesseractReady}
                                        style={{ width: "100%", padding: "12px", background: tesseractReady ? "#16acd4" : "#e0e0e0", color: tesseractReady ? "#000" : "#666", fontWeight: "bold", border: "none", borderRadius: "4px", cursor: tesseractReady ? "pointer" : "not-allowed", fontSize: "14px", borderBottom: tesseractReady ? "3px solid #c88a00" : "none" }}
                                    >
                                        {tesseractReady ? "🚀 Extract Data (Free OCR)" : "⏳ Loading OCR Library..."}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        style={{ display: "none" }} 
                    />
                </div>
            </div>
        </div>
    )
}
