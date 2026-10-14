import sharp from "sharp"
import { createWorker } from "tesseract.js"
import fs from "fs"
import path from "path"

const COMMON_UNITS = ["PCS", "NOS", "LTR", "LITRE", "LITER", "BOTTLE", "CAN", "BOX", "SET", "KG", "PACK", "MTR", "ROLL", "KIT"]

function cleanLine(l) {
    return l.replace(/[\t\r]/g, " ").replace(/\s{2,}/g, " ").trim()
}

async function main() {
    const inputFilePath = process.argv[2]
    if (!inputFilePath || !fs.existsSync(inputFilePath)) {
        console.error(JSON.stringify({ error: "Missing or invalid input file" }))
        process.exit(1)
    }

    const rawBuffer = fs.readFileSync(inputFilePath)

    // Preprocessing with sharp
    let preprocessed
    try {
        preprocessed = await sharp(rawBuffer)
            .rotate()
            .resize({ width: 900, fit: "inside", withoutEnlargement: true })
            .grayscale()
            .normalize()
            .linear(1.4, -40)
            .jpeg({ quality: 75 })
            .toBuffer()
    } catch {
        preprocessed = rawBuffer
    }

    const langDirectory = path.resolve(process.cwd())
    const worker = await createWorker("eng", 1, {
        langPath: langDirectory,
        gzip: false,
    })

    let text = ""
    try {
        const ret = await worker.recognize(preprocessed)
        text = ret?.data?.text || ""
    } finally {
        await worker.terminate().catch(() => {})
    }

    const lines = text
        .split("\n")
        .map(cleanLine)
        .filter((l) => l.length > 2)

    let vendorName = ""
    let invoiceNumber = ""
    let invoiceDate = ""

    // 1. Detect Vendor Name
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
        const line = lines[i]
        const upper = line.toUpperCase()
        if (
            upper.includes("TAX INVOICE") ||
            upper.includes("RETAIL INVOICE") ||
            upper.includes("BILL OF SUPPLY") ||
            upper.includes("CASH MEMO") ||
            upper.includes("DELIVERY CHALLAN") ||
            upper.startsWith("GSTIN") ||
            upper.startsWith("CIN") ||
            upper.startsWith("PAN")
        ) {
            continue
        }
        if (line.length >= 3 && !/^\d+$/.test(line) && !line.includes("Date:") && !line.includes("Inv No")) {
            vendorName = line
            break
        }
    }

    // 2. Detect Invoice Number & Date
    for (const line of lines) {
        if (!invoiceNumber) {
            const invMatch = line.match(/(?:Inv(?:oice)?|Bill|Memo|Challan)\s*(?:No|Number|#)?[.:\s]+([A-Z0-9\-\/]{3,30})/i)
            if (invMatch) invoiceNumber = invMatch[1].trim()
        }
        if (!invoiceDate) {
            const dateMatch = line.match(/(?:Date|Dt)[.:\s]+([0-9]{1,2}[-\/\.][0-9]{1,2}[-\/\.][0-9]{2,4})/i)
            if (dateMatch) invoiceDate = dateMatch[1].trim()
        }
    }

    // 3. Detect Items Table
    const items = []
    const ignoreKeywords = [
        "SUBTOTAL", "SUB TOTAL", "TOTAL", "GRAND TOTAL", "TAXABLE", "CGST", "SGST", "IGST",
        "ROUND OFF", "TERMS & CONDITIONS", "BANK DETAILS", "ACCOUNT", "IFSC", "BRANCH",
        "AUTHORIZED SIGNATORY", "E. & O.E.", "THANK YOU", "FOR ANY QUERY", "VEHICLE NO",
        "RATE", "QUANTITY", "AMOUNT", "DISCOUNT", "TAX", "DESCRIPTION", "PARTICULARS", "SR NO", "S.NO"
    ]

    for (const line of lines) {
        const upper = line.toUpperCase()

        if (ignoreKeywords.some((kw) => upper === kw || upper.startsWith(kw + ":") || upper.startsWith(kw + " "))) {
            continue
        }
        if (upper.includes("TOTAL AMOUNT") || upper.includes("GRAND TOTAL") || upper.includes("AUTHORIZED SIGNATURE")) {
            continue
        }

        const tokens = line.split(" ")
        const numbers = tokens
            .filter((t) => /^\d+(\.\d+)?$/.test(t.replace(/,/g, "")))
            .map((t) => parseFloat(t.replace(/,/g, "")))

        if (numbers.length >= 1) {
            let detectedUnit = "PCS"
            for (const u of COMMON_UNITS) {
                const rx = new RegExp(`\\b${u}\\b`, "i")
                if (rx.test(line)) {
                    detectedUnit = u === "LITRE" || u === "LITER" ? "LTR" : u === "NOS" ? "PCS" : u
                    break
                }
            }

            let hsn = null
            for (const t of tokens) {
                if (/^\d{4,8}$/.test(t) && !numbers.slice(-2).includes(parseFloat(t))) {
                    hsn = t
                    break
                }
            }

            const textWords = []
            for (const t of tokens) {
                if (/^\d+$/.test(t) && textWords.length === 0 && parseInt(t) < 50) {
                    continue
                }
                if (COMMON_UNITS.includes(t.toUpperCase())) {
                    continue
                }
                if (/^\d+(\.\d+)?$/.test(t.replace(/,/g, ""))) {
                    continue
                }
                const cleanT = t.replace(/[|:;]/g, "").trim()
                if (cleanT.length > 0) {
                    textWords.push(cleanT)
                }
            }

            const itemName = textWords.join(" ").trim()

            if (itemName.length >= 3 && !ignoreKeywords.some((kw) => itemName.toUpperCase().includes(kw))) {
                let quantity = 1
                let purchasePrice = null

                if (numbers.length === 1) {
                    purchasePrice = numbers[0]
                } else if (numbers.length === 2) {
                    if (numbers[0] <= 500 && Number.isInteger(numbers[0]) && numbers[1] >= numbers[0]) {
                        quantity = numbers[0]
                        purchasePrice = Math.round((numbers[1] / numbers[0]) * 100) / 100
                    } else {
                        quantity = 1
                        purchasePrice = numbers[0]
                    }
                } else if (numbers.length >= 3) {
                    const filteredNums = numbers.filter((n) => !(hsn && String(n) === hsn))
                    if (filteredNums.length >= 2) {
                        quantity = Math.max(1, filteredNums[0])
                        purchasePrice = filteredNums[1]
                    } else if (filteredNums.length === 1) {
                        purchasePrice = filteredNums[0]
                    }
                }

                if (itemName && !items.some((i) => i.name.toLowerCase() === itemName.toLowerCase())) {
                    const finalPPrice = purchasePrice && purchasePrice > 0 ? purchasePrice : null
                    const suggestedSPrice = finalPPrice ? Math.round(finalPPrice * 1.35) : null

                    items.push({
                        name: itemName,
                        quantity: Math.max(1, quantity),
                        unit: detectedUnit,
                        purchasePrice: finalPPrice,
                        suggestedSellingPrice: suggestedSPrice,
                        hsnSacCode: hsn,
                        taxRate: 18,
                    })
                }
            }
        }
    }

    const output = {
        success: true,
        vendorName: vendorName || undefined,
        invoiceNumber: invoiceNumber || undefined,
        invoiceDate: invoiceDate || undefined,
        items,
        rawText: text,
        engine: "LOCAL_TESSERACT",
    }

    console.log(JSON.stringify(output))
}

main().catch((err) => {
    console.error(JSON.stringify({ error: err.message || "Failed to process OCR" }))
    process.exit(1)
})
