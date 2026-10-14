import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"
import { parseInvoiceWithLocalOCR } from "@/lib/services/local-bill-parser"

export async function POST(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const customApiKey = (formData.get("apiKey") as string | null)?.trim()
        const preferredEngine = (formData.get("engine") as string | null)?.toLowerCase() || "auto"

        if (!file) {
            return NextResponse.json({ error: "Please upload a purchase bill image (JPEG, PNG, WEBP or PDF)" }, { status: 400 })
        }

        const fileBytes = await file.arrayBuffer()
        const fileBuffer = Buffer.from(fileBytes)

        let parsedData: {
            vendorName?: string
            invoiceNumber?: string
            invoiceDate?: string
            items: any[]
        } | null = null

        let engineUsed = "LOCAL_AI"

        // 1. Resolve Gemini API Key if available
        let geminiKey = customApiKey || null
        if (!geminiKey) {
            const aiSettings = await db.aISettings.findFirst()
            if (aiSettings?.geminiApiKey && aiSettings.geminiApiKey.length > 5) {
                geminiKey = aiSettings.geminiApiKey.trim()
            }
        }
        if (!geminiKey && process.env.GEMINI_API_KEY) {
            geminiKey = process.env.GEMINI_API_KEY.trim()
        }

        // 2. Decide whether to try Gemini or Local OCR
        const canUseGemini = Boolean(geminiKey && preferredEngine !== "local")

        if (canUseGemini && geminiKey) {
            try {
                const base64Data = fileBuffer.toString("base64")
                let mimeType = file.type || "image/jpeg"
                if (!mimeType || mimeType === "application/octet-stream") {
                    const name = file.name.toLowerCase()
                    if (name.endsWith(".png")) mimeType = "image/png"
                    else if (name.endsWith(".webp")) mimeType = "image/webp"
                    else if (name.endsWith(".pdf")) mimeType = "application/pdf"
                    else mimeType = "image/jpeg"
                }

                const genAI = new GoogleGenerativeAI(geminiKey)
                const modelNames = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
                let rawResponseText = ""

                for (const modelName of modelNames) {
                    try {
                        const model = genAI.getGenerativeModel({ model: modelName })
                        const prompt = `You are an expert automotive parts, detailing studio supplies, and Indian purchase invoice parser.
Analyze this purchasing invoice / cash memo / tax bill / delivery challan image and extract all purchased products/items and vendor metadata.

Return ONLY a valid JSON object with NO markdown formatting, NO \`\`\`json fences, and NO extra text:
{
  "vendorName": "Name of supplier / distributor / shop or null",
  "invoiceNumber": "Invoice / Bill number or null",
  "invoiceDate": "Invoice date (YYYY-MM-DD) or null",
  "items": [
    {
      "name": "Clear descriptive product name (e.g. Sonax Wheel Cleaner 500ml, 3M Masking Tape, Meguiars Compound)",
      "sku": "Part number or item code if listed, otherwise null",
      "quantity": 1,
      "unit": "PCS, LTR, BOTTLE, BOX, SET, KG, CAN, MTR, PACK, ROLL or KIT",
      "purchasePrice": 450,
      "suggestedSellingPrice": 650,
      "hsnSacCode": "HSN code if visible, otherwise null",
      "taxRate": 18
    }
  ]
}

Extraction Rules:
- If quantity is not found, default to 1.
- If purchasePrice is found, set suggestedSellingPrice to purchasePrice * 1.35.
- Valid unit values: PCS, LTR, BOTTLE, BOX, SET, KG, CAN, MTR, PACK, ROLL, KIT.
- Extract individual line items only. Ignore total / summary rows like Subtotal, CGST, SGST, IGST, Round Off, Grand Total.`

                        const result = await model.generateContent([
                            {
                                inlineData: {
                                    data: base64Data,
                                    mimeType: mimeType
                                }
                            },
                            { text: prompt }
                        ])

                        const resp = await result.response
                        rawResponseText = resp.text()
                        if (rawResponseText) break
                    } catch (mErr: any) {
                        console.warn(`[AI Bill Scan] Gemini ${modelName} error:`, mErr.message)
                    }
                }

                if (rawResponseText) {
                    let cleanJson = rawResponseText.trim()
                    if (cleanJson.startsWith("```json")) {
                        cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "")
                    } else if (cleanJson.startsWith("```")) {
                        cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "")
                    }
                    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
                    if (jsonMatch) cleanJson = jsonMatch[0]

                    const geminiParsed = JSON.parse(cleanJson)
                    if (Array.isArray(geminiParsed?.items) && geminiParsed.items.length > 0) {
                        parsedData = geminiParsed
                        engineUsed = "GEMINI_AI"
                    }
                }
            } catch (geminiErr: any) {
                console.warn("[AI Bill Scan] Gemini failed, falling back to built-in local OCR:", geminiErr.message)
            }
        }

        let localRawText = ""
        // 3. If Gemini was not used or did not produce items, run Local Built-in OCR & Parser
        if (!parsedData || !Array.isArray(parsedData.items) || parsedData.items.length === 0) {
            try {
                const localResult = await parseInvoiceWithLocalOCR(fileBuffer)
                localRawText = localResult.rawText || ""
                parsedData = {
                    vendorName: localResult.vendorName,
                    invoiceNumber: localResult.invoiceNumber,
                    invoiceDate: localResult.invoiceDate,
                    items: localResult.items
                }
                engineUsed = "LOCAL_AI"
            } catch (localErr: any) {
                console.error("[AI Bill Scan] Local OCR failed:", localErr)
                return NextResponse.json({
                    error: "SCAN_FAILED",
                    message: "Could not read bill text. Please ensure the image is bright and clearly legible."
                }, { status: 500 })
            }
        }

        const rawItems = Array.isArray(parsedData?.items) ? parsedData.items : []
        if (rawItems.length === 0) {
            const upperText = localRawText.toUpperCase()
            const isSummaryPage = upperText.includes("PAGE 2") ||
                                  upperText.includes("PAGE 3") ||
                                  upperText.includes("ROUND OFF") ||
                                  upperText.includes("TAXABLE VALUE") ||
                                  upperText.includes("TOTAL OUTSTANDING")

            return NextResponse.json({
                error: "NO_ITEMS_FOUND",
                isSummaryPage,
                message: isSummaryPage
                    ? "This invoice page appears to be Page 2 / Summary (totals & tax breakdown) with no product line items. Please scan Page 1 which contains the product items and rates."
                    : "No product items could be detected on this page. Please ensure product names, rates, and quantities are clearly legible.",
                vendorName: parsedData?.vendorName,
                invoiceNumber: parsedData?.invoiceNumber,
                engineUsed
            }, { status: 400 })
        }

        // 4. Match with existing workshop items in Database
        const whereClause: any = {}
        if (!ctx.isAdmin && ctx.shopId) {
            whereClause.OR = [{ shopId: ctx.shopId }, { shopId: null }]
        }
        const existingItems = await db.billingItem.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                sku: true,
                stock: true,
                unit: true,
                price: true,
                purchasePrice: true,
                taxRate: true,
                hsnSacCode: true
            }
        })

        const matchedItems = rawItems.map((item: any, idx: number) => {
            const cleanName = (item.name || `Item ${idx + 1}`).trim()
            const cleanSku = item.sku ? String(item.sku).trim() : null
            const qty = Math.max(1, parseFloat(item.quantity) || 1)
            const pPrice = parseFloat(item.purchasePrice) > 0 ? parseFloat(item.purchasePrice) : null
            const sPrice = parseFloat(item.suggestedSellingPrice) > 0
                ? parseFloat(item.suggestedSellingPrice)
                : (pPrice ? Math.round(pPrice * 1.35) : 0)

            // Normalize unit
            let unit = (item.unit || "PCS").toUpperCase().trim()
            const VALID_UNITS = ["PCS", "LTR", "BOTTLE", "BOX", "SET", "KG", "CAN", "MTR", "PACK", "ROLL", "KIT"]
            if (!VALID_UNITS.includes(unit)) {
                if (unit.includes("LIT") || unit === "L") unit = "LTR"
                else if (unit.includes("BOT")) unit = "BOTTLE"
                else if (unit.includes("BOX")) unit = "BOX"
                else if (unit.includes("MTR") || unit === "M") unit = "MTR"
                else unit = "PCS"
            }

            // Find matching item in existing DB items
            const lowerName = cleanName.toLowerCase()
            const existingMatch = existingItems.find(ex => {
                if (cleanSku && ex.sku && ex.sku.toLowerCase() === cleanSku.toLowerCase()) {
                    return true
                }
                const exLower = ex.name.toLowerCase()
                return exLower === lowerName || (lowerName.length > 4 && (exLower.includes(lowerName) || lowerName.includes(exLower)))
            })

            if (existingMatch) {
                return {
                    id: `ai-item-${idx}-${Date.now()}`,
                    selected: true,
                    action: "RESTOCK",
                    existingItemId: existingMatch.id,
                    name: existingMatch.name,
                    detectedName: cleanName,
                    sku: cleanSku || existingMatch.sku || "",
                    quantity: qty,
                    currentStock: existingMatch.stock,
                    newTotalStock: existingMatch.stock + qty,
                    unit: existingMatch.unit || unit,
                    purchasePrice: pPrice ?? existingMatch.purchasePrice ?? 0,
                    sellingPrice: existingMatch.price > 0 ? existingMatch.price : sPrice,
                    taxRate: existingMatch.taxRate || item.taxRate || 18,
                    hsnSacCode: cleanSku || existingMatch.hsnSacCode || item.hsnSacCode || ""
                }
            } else {
                return {
                    id: `ai-item-${idx}-${Date.now()}`,
                    selected: true,
                    action: "CREATE",
                    existingItemId: null,
                    name: cleanName,
                    detectedName: cleanName,
                    sku: cleanSku || "",
                    quantity: qty,
                    currentStock: 0,
                    newTotalStock: qty,
                    unit: unit,
                    purchasePrice: pPrice || 0,
                    sellingPrice: sPrice,
                    taxRate: item.taxRate || 18,
                    hsnSacCode: item.hsnSacCode || ""
                }
            }
        })

        return NextResponse.json({
            success: true,
            engineUsed,
            vendorName: parsedData?.vendorName || null,
            invoiceNumber: parsedData?.invoiceNumber || null,
            invoiceDate: parsedData?.invoiceDate || null,
            totalDetected: matchedItems.length,
            restockCount: matchedItems.filter(i => i.action === "RESTOCK").length,
            newCount: matchedItems.filter(i => i.action === "CREATE").length,
            items: matchedItems
        })

    } catch (e: any) {
        console.error("[AI Bill Scan] Fatal error:", e)
        return NextResponse.json({
            error: "SCAN_FAILED",
            message: e.message || "Failed to parse bill. Please try again."
        }, { status: 500 })
    }
}
