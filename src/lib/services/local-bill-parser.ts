import { exec } from "child_process"
import fs from "fs"
import path from "path"
import os from "os"

export type ParsedBillItem = {
    name: string
    sku?: string | null
    quantity: number
    unit: string
    purchasePrice: number | null
    suggestedSellingPrice?: number | null
    hsnSacCode?: string | null
    taxRate?: number
}

export type ParsedBillResult = {
    vendorName?: string
    invoiceNumber?: string
    invoiceDate?: string
    items: ParsedBillItem[]
    rawText: string
    engine: "LOCAL_TESSERACT"
}

/**
 * Execute OCR in an isolated clean Node process to guarantee zero Turbopack/Next.js thread locks
 */
export async function parseInvoiceWithLocalOCR(imageBuffer: Buffer): Promise<ParsedBillResult> {
    const tempFile = path.join(os.tmpdir(), `bill-scan-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`)
    fs.writeFileSync(tempFile, imageBuffer)

    const runnerScript = path.resolve(process.cwd(), "src/lib/services/ocr-process.mjs")

    return new Promise<ParsedBillResult>((resolve, reject) => {
        exec(`node "${runnerScript}" "${tempFile}"`, { maxBuffer: 10 * 1024 * 1024, timeout: 25000 }, (error, stdout, stderr) => {
            try {
                fs.unlinkSync(tempFile)
            } catch {}

            if (error) {
                console.error("[Local OCR Runner] Execution error:", error, stderr)
                return reject(new Error(error.message || "OCR process execution failed"))
            }

            try {
                const lines = stdout.trim().split("\n")
                let jsonStr = ""
                for (let i = lines.length - 1; i >= 0; i--) {
                    const l = lines[i].trim()
                    if (l.startsWith("{") && l.endsWith("}")) {
                        jsonStr = l
                        break
                    }
                }
                if (!jsonStr) {
                    const match = stdout.match(/\{[\s\S]*\}/)
                    if (match) jsonStr = match[0]
                }

                if (!jsonStr) {
                    throw new Error("Invalid output from OCR runner: " + stdout.slice(0, 200))
                }

                const parsed = JSON.parse(jsonStr)
                resolve(parsed)
            } catch (parseErr: any) {
                console.error("[Local OCR Runner] JSON parse failed:", parseErr, "Stdout was:", stdout.slice(0, 300))
                reject(parseErr)
            }
        })
    })
}
