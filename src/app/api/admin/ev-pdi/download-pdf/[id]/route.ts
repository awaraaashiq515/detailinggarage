import { NextRequest, NextResponse } from "next/server"
import { chromium } from "playwright"
import { db as prisma } from "@/lib/db"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: "Missing inspection ID" }, { status: 400 })
        }

        // Fetch basic info for clean filename
        const inspection = await prisma.eVPDIInspection.findUnique({
            where: { id },
            select: {
                vehicleMake: true,
                vehicleModel: true,
                registrationNumber: true,
                vin: true,
            }
        })

        const make = (inspection?.vehicleMake || "EV").replace(/[^a-zA-Z0-9]/g, "_")
        const model = (inspection?.vehicleModel || "Vehicle").replace(/[^a-zA-Z0-9]/g, "_")
        const reg = (inspection?.registrationNumber || inspection?.vin || id).replace(/[^a-zA-Z0-9]/g, "_")
        const filename = `EV_PDI_Report_${make}_${model}_${reg}.pdf`

        // Target public render route
        const host = request.headers.get("host") || "127.0.0.1:3001"
        const targetUrl = `http://127.0.0.1:3001/pdi/ev-report/${id}`

        console.log(`[PDF-API] Launching Chromium to render: ${targetUrl}`)

        const browser = await chromium.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        })

        const context = await browser.newContext({
            viewport: { width: 1200, height: 1600 },
            deviceScaleFactor: 2
        })

        const page = await context.newPage()

        // Navigate to the EV report page
        await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 })

        // Wait for main report content to be rendered
        await page.waitForSelector("#ev-report-document", { timeout: 15000 }).catch(() => null)

        // Wait for all images to complete loading & decoding so they are crisp in the PDF
        await page.evaluate(async () => {
            const images = Array.from(document.querySelectorAll("img"))
            await Promise.all(images.map(img => {
                if (img.complete && img.naturalWidth > 0) return Promise.resolve()
                return new Promise(resolve => {
                    img.addEventListener("load", resolve, { once: true })
                    img.addEventListener("error", resolve, { once: true })
                })
            }))
        }).catch(() => null)

        // Give dynamic graphics and charts a moment to stabilize
        await page.waitForTimeout(800)

        // Generate high-resolution compact print PDF (scales to 5-6 dense, beautiful pages)
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            scale: 0.8,
            margin: {
                top: "6mm",
                bottom: "6mm",
                left: "5mm",
                right: "5mm"
            }
        })

        await browser.close()

        console.log(`[PDF-API] Successfully generated PDF for ${id}, size: ${pdfBuffer.length} bytes`)

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": pdfBuffer.length.toString(),
                "Cache-Control": "no-cache, no-store, must-revalidate"
            }
        })
    } catch (err: any) {
        console.error("[PDF-API] Failed to generate PDF:", err)
        return NextResponse.json(
            { error: "Failed to generate PDF", details: err?.message || String(err) },
            { status: 500 }
        )
    }
}
