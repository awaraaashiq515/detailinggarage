import { NextRequest, NextResponse } from "next/server"
import { chromium } from "playwright"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"
import fs from "fs"
import path from "path"

function resolveImageToDataUrl(imgUrl?: string | null): string | null {
    if (!imgUrl) return null
    if (imgUrl.startsWith("data:")) return imgUrl
    if (imgUrl.startsWith("/")) {
        try {
            const cleanPath = imgUrl.split("?")[0]
            const filePath = path.join(process.cwd(), "public", cleanPath)
            if (fs.existsSync(filePath)) {
                const ext = path.extname(filePath).toLowerCase().replace(".", "")
                const mime =
                    ext === "svg" ? "image/svg+xml" :
                    ext === "png" ? "image/png" :
                    ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
                    ext === "webp" ? "image/webp" : "image/png"
                const buffer = fs.readFileSync(filePath)
                return `data:${mime};base64,${buffer.toString("base64")}`
            }
        } catch (e) {
            console.error("Failed to load local image for PDF:", e)
        }
    }
    return imgUrl
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: "Invoice ID required" }, { status: 400 })
        }

        const invoice = await db.invoice.findUnique({
            where: { id },
            include: {
                client: true,
                items: true,
                payments: true,
                assignedStaff: true,
                shop: {
                    include: {
                        billingProfile: true
                    }
                }
            }
        })

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
        }

        // Check ownership if not admin
        if (!ctx.isAdmin && invoice.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const bp = invoice.shop?.billingProfile

        const companyName = bp?.businessName || invoice.shop?.name || "Detailing Garage"
        const companyTagline = bp?.tagline || (invoice.shop ? (invoice.shop.city ? `${invoice.shop.city}, ${invoice.shop.state || ""}` : "") : "Premium Auto Protection Studio")

        const addressParts = [
            bp?.address || invoice.shop?.address,
            bp?.city || invoice.shop?.city,
            bp?.state || invoice.shop?.state,
            bp?.pinCode
        ].filter(Boolean)
        const fullAddress = addressParts.join(", ")

        const companyPhone = bp?.phone || invoice.shop?.phone || ""
        const companyAltPhone = bp?.altPhone || ""
        const companyEmail = bp?.email || invoice.shop?.email || ""
        const companyWebsite = bp?.website || ""
        const companyGstin = bp?.gstin || invoice.shop?.gstin || ""
        const companyPan = bp?.pan || ""

        const bankName = bp?.bankName || ""
        const accountName = bp?.accountName || ""
        const accountNumber = bp?.accountNumber || ""
        const ifscCode = bp?.ifscCode || ""
        const upiId = bp?.upiId || ""
        const hasBankDetails = Boolean(bankName || accountNumber || ifscCode || upiId)

        const logoDataUrl = resolveImageToDataUrl(bp?.logoUrl || invoice.shop?.logoUrl)
        const signatureDataUrl = resolveImageToDataUrl(bp?.signatureUrl)

        const isQuotation = invoice.type === "QUOTATION" || invoice.type === "ESTIMATE"
        const docTitle = isQuotation ? "ESTIMATE / QUOTATION" : "TAX INVOICE"
        const docPrefix = isQuotation ? "Quotation" : "Invoice"
        const filename = `${docPrefix}_${invoice.invoiceNumber}.pdf`

        const balance = Math.max(0, invoice.grandTotal - invoice.amountPaid)
        const issueDate = new Date(invoice.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
        const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null

        const fmt = (n: number) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>${filename}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 10px;
            color: #111111;
            background: #ffffff;
            width: 100%;
            padding: 12mm 15mm;
            line-height: 1.4;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 12px;
            border-bottom: 2.5px solid #111111;
            margin-bottom: 14px;
        }
        .company-name {
            font-size: 22px;
            font-weight: 900;
            text-transform: uppercase;
            color: #0e8fb0;
            letter-spacing: 0.02em;
            line-height: 1.1;
        }
        .company-tagline {
            font-size: 9px;
            color: #555555;
            margin-top: 3px;
            letter-spacing: 0.02em;
        }
        .meta {
            text-align: right;
        }
        .meta-label {
            font-size: 7.5px;
            color: #888888;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }
        .inv-number {
            font-size: 18px;
            font-weight: 900;
            font-family: "Courier New", Courier, monospace;
            color: #111111;
            margin-top: 1px;
        }
        .meta-date {
            font-size: 9px;
            color: #333333;
            margin-top: 3px;
        }
        .doc-title-badge {
            display: inline-block;
            margin-top: 5px;
            padding: 2px 7px;
            background: #111111;
            color: #ffffff;
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border-radius: 2px;
        }
        .parties {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            background: #fbfbfb;
            border: 1px solid #e5e5e5;
            padding: 10px 14px;
            margin-bottom: 12px;
            border-radius: 4px;
        }
        .party-title {
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #777777;
            margin-bottom: 4px;
        }
        .party-name {
            font-size: 12px;
            font-weight: 800;
            color: #111111;
            margin-bottom: 2px;
        }
        .party-info {
            font-size: 9px;
            color: #444444;
            line-height: 1.5;
        }
        .vehicle-band {
            background: #f4f6f8;
            border: 1px solid #e1e4e8;
            padding: 8px 12px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 14px;
            border-radius: 4px;
        }
        .v-label {
            font-size: 7.5px;
            text-transform: uppercase;
            font-weight: 700;
            color: #777777;
            letter-spacing: 0.05em;
        }
        .v-val {
            font-size: 10px;
            font-weight: 800;
            color: #111111;
            font-family: "Courier New", Courier, monospace;
            margin-top: 1px;
        }
        table.items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }
        table.items-table thead tr {
            background-color: #111111;
            color: #ffffff;
        }
        table.items-table th {
            padding: 6px 8px;
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border: 1px solid #111111;
        }
        table.items-table td {
            padding: 6px 8px;
            font-size: 9.5px;
            border: 1px solid #e5e5e5;
            color: #222222;
        }
        table.items-table tr:nth-child(even) td {
            background-color: #fafafa;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .footer-grid {
            display: grid;
            grid-template-columns: 1fr 240px;
            gap: 16px;
            align-items: flex-start;
            margin-bottom: 14px;
        }
        .notes-box {
            background: #fafafa;
            border: 1px solid #e5e5e5;
            padding: 8px 10px;
            border-radius: 3px;
            margin-bottom: 8px;
        }
        .notes-title {
            font-size: 7.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            color: #555555;
            margin-bottom: 3px;
        }
        .notes-content {
            font-size: 8.5px;
            color: #444444;
            line-height: 1.4;
        }
        .summary-box {
            background: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 3px;
            overflow: hidden;
        }
        .sum-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 8px;
            font-size: 9.5px;
            border-bottom: 1px solid #f0f0f0;
        }
        .sum-row.grand-total {
            background: #111111;
            color: #ffffff;
            font-weight: 900;
            font-size: 11px;
            border-bottom: none;
            padding: 6px 8px;
        }
        .sum-row.balance {
            background: #fff8f0;
            color: #b45309;
            font-weight: 800;
            font-size: 10px;
        }
        .signatory-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px dashed #cccccc;
        }
        .thank-you {
            font-size: 9px;
            color: #666666;
            font-style: italic;
        }
        .signature-line {
            text-align: right;
        }
        .sign-rule {
            width: 140px;
            height: 1px;
            background: #111111;
            margin-bottom: 4px;
            margin-left: auto;
        }
        .sign-title {
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #333333;
        }
    </style>
</head>
<body>
    <!-- Top Header -->
    <div class="header">
        <div style="display: flex; align-items: center; gap: 14px;">
            ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Shop Logo" style="max-height: 52px; max-width: 130px; object-fit: contain;" />` : ""}
            <div>
                <div class="company-name">${companyName}</div>
                <div class="company-tagline">${companyTagline}</div>
            </div>
        </div>
        <div class="meta">
            <div class="meta-label">Original for Recipient</div>
            <div class="inv-number">${invoice.invoiceNumber}</div>
            <div class="meta-date">Date: <strong>${issueDate}</strong></div>
            ${dueDate ? `<div class="meta-date">Due: <strong>${dueDate}</strong></div>` : ""}
            <div><span class="doc-title-badge">${docTitle}</span></div>
        </div>
    </div>

    <!-- Parties: From & Bill To -->
    <div class="parties">
        <div>
            <div class="party-title">From</div>
            <div class="party-name">${companyName}</div>
            <div class="party-info">
                ${companyTagline ? `${companyTagline}<br/>` : ""}
                ${fullAddress ? `${fullAddress}<br/>` : ""}
                ${companyPhone ? `☎ ${companyPhone}${companyAltPhone ? ` / ${companyAltPhone}` : ""}<br/>` : ""}
                ${companyEmail ? `✉ ${companyEmail}<br/>` : ""}
                ${companyWebsite ? `🌐 ${companyWebsite}<br/>` : ""}
                ${companyGstin ? `<strong>GSTIN:</strong> ${companyGstin}<br/>` : ""}
                ${companyPan ? `<strong>PAN:</strong> ${companyPan}` : ""}
            </div>
        </div>
        <div>
            <div class="party-title">Bill To</div>
            <div class="party-name">${invoice.client.name}</div>
            <div class="party-info">
                ${invoice.client.address ? `${invoice.client.address}<br/>` : ""}
                ${invoice.client.phone ? `☎ ${invoice.client.phone}<br/>` : ""}
                ${invoice.client.email ? `✉ ${invoice.client.email}<br/>` : ""}
                ${invoice.client.gstin ? `<strong>GSTIN:</strong> ${invoice.client.gstin}` : ""}
            </div>
        </div>
    </div>

    <!-- Vehicle Details & Assigned Technician (if available) -->
    ${(invoice.vehicleName || invoice.vehicleRegNo || invoice.vehicleChassis || invoice.odometer || invoice.assignedStaff) ? `
    <div class="vehicle-band">
        ${invoice.vehicleName ? `<div><div class="v-label">Vehicle</div><div class="v-val">${invoice.vehicleName}</div></div>` : ""}
        ${invoice.vehicleRegNo ? `<div><div class="v-label">Reg No</div><div class="v-val">${invoice.vehicleRegNo}</div></div>` : ""}
        ${invoice.assignedStaff ? `<div><div class="v-label">Serviced By</div><div class="v-val">${invoice.assignedStaff.name} (${invoice.assignedStaff.role})</div></div>` : ""}
        ${invoice.odometer ? `<div><div class="v-label">Odometer</div><div class="v-val">${invoice.odometer}</div></div>` : ""}
        ${invoice.vehicleChassis ? `<div><div class="v-label">Chassis / VIN</div><div class="v-val">${invoice.vehicleChassis}</div></div>` : ""}
    </div>
    ` : ""}

    <!-- Items Table -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 24px;" class="text-center">#</th>
                <th>Product / Service Description</th>
                <th style="width: 65px;">HSN/SAC</th>
                <th style="width: 35px;" class="text-center">Qty</th>
                <th style="width: 75px;" class="text-right">Rate (₹)</th>
                <th style="width: 60px;" class="text-right">CGST</th>
                <th style="width: 60px;" class="text-right">SGST</th>
                <th style="width: 80px;" class="text-right">Total (₹)</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.items.map((item, i) => `
            <tr>
                <td class="text-center">${i + 1}</td>
                <td><strong>${item.name}</strong></td>
                <td>${item.hsnSacCode || "-"}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${fmt(item.rate)}</td>
                <td class="text-right">${fmt(item.cgst)}</td>
                <td class="text-right">${fmt(item.sgst)}</td>
                <td class="text-right"><strong>${fmt(item.total)}</strong></td>
            </tr>
            `).join("")}
        </tbody>
    </table>

    <!-- Footer: Notes + Summary -->
    <div class="footer-grid">
        <div>
            ${hasBankDetails ? `
            <div class="notes-box" style="border-left: 3px solid #0e8fb0;">
                <div class="notes-title" style="color: #0e8fb0;">Bank &amp; Payment Details</div>
                <div class="notes-content" style="font-size: 8.5px; line-height: 1.6;">
                    ${bankName ? `<div><strong>Bank:</strong> ${bankName}</div>` : ""}
                    ${accountName ? `<div><strong>Account Name:</strong> ${accountName}</div>` : ""}
                    ${accountNumber ? `<div><strong>Account No:</strong> <span style="font-family: monospace; font-weight: 700;">${accountNumber}</span></div>` : ""}
                    ${ifscCode ? `<div><strong>IFSC Code:</strong> <span style="font-family: monospace; font-weight: 700;">${ifscCode}</span></div>` : ""}
                    ${upiId ? `<div><strong>UPI ID:</strong> <span style="font-family: monospace; font-weight: 700;">${upiId}</span></div>` : ""}
                </div>
            </div>` : ""}

            ${invoice.notes ? `
            <div class="notes-box">
                <div class="notes-title">Notes</div>
                <div class="notes-content">${invoice.notes}</div>
            </div>` : ""}

            ${invoice.terms ? `
            <div class="notes-box">
                <div class="notes-title">Terms &amp; Conditions</div>
                <div class="notes-content">${invoice.terms}</div>
            </div>` : ""}

            ${invoice.payments && invoice.payments.length > 0 ? `
            <div class="notes-box">
                <div class="notes-title">Payment History</div>
                <div class="notes-content">
                    ${invoice.payments.map(p => `${p.paymentMethod} · ₹${fmt(p.amount)} (${new Date(p.paymentDate).toLocaleDateString("en-IN")})`).join("<br/>")}
                </div>
            </div>` : ""}
        </div>

        <div class="summary-box">
            <div class="sum-row"><span>Sub Total</span><span>₹${fmt(invoice.subTotal)}</span></div>
            <div class="sum-row"><span>CGST Total</span><span>₹${fmt(invoice.cgstTotal)}</span></div>
            <div class="sum-row"><span>SGST Total</span><span>₹${fmt(invoice.sgstTotal)}</span></div>
            ${invoice.igstTotal > 0 ? `<div class="sum-row"><span>IGST Total</span><span>₹${fmt(invoice.igstTotal)}</span></div>` : ""}
            ${invoice.discount > 0 ? `<div class="sum-row" style="color: #b91c1c;"><span>Discount</span><span>- ₹${fmt(invoice.discount)}</span></div>` : ""}
            <div class="sum-row grand-total"><span>Grand Total</span><span>₹${fmt(invoice.grandTotal)}</span></div>
            ${invoice.amountPaid > 0 ? `<div class="sum-row"><span>Amount Paid</span><span>₹${fmt(invoice.amountPaid)}</span></div>` : ""}
            ${balance > 0 ? `<div class="sum-row balance"><span>Balance Due</span><span>₹${fmt(balance)}</span></div>` : ""}
        </div>
    </div>

    <!-- Signatory -->
    <div class="signatory-row">
        <div class="thank-you">
            Thank you for your business!<br />
            ${companyName}
        </div>
        <div class="signature-line">
            ${signatureDataUrl ? `<img src="${signatureDataUrl}" alt="Authorised Signature" style="max-height: 48px; max-width: 140px; object-fit: contain; display: block; margin-left: auto; margin-bottom: 4px;" />` : `<div style="height: 32px;"></div>`}
            <div class="sign-rule"></div>
            <div class="sign-title">Authorised Signatory</div>
        </div>
    </div>
</body>
</html>
        `

        const browser = await chromium.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        })
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: "load" })
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "8mm", right: "10mm", bottom: "8mm", left: "10mm" }
        })
        await browser.close()

        return new NextResponse(pdfBuffer as unknown as BodyInit, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-cache",
            }
        })
    } catch (error: any) {
        console.error("Error generating invoice PDF:", error)
        return NextResponse.json({ error: error?.message || "Failed to generate PDF" }, { status: 500 })
    }
}
