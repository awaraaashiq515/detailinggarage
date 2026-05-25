import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import axios from 'axios'
import * as cheerio from 'cheerio'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts fuel type from a model string if it's missing.
 * e.g. "THAR LX D MT 4WD" -> "DIESEL"
 */
function extractFuelFromModel(model: string): string | null {
    if (!model) return null;
    const m = model.toUpperCase();

    if (m.includes('PETROL')) return 'PETROL';
    if (m.includes('DIESEL')) return 'DIESEL';
    if (m.includes('CNG')) return 'CNG';
    if (m.includes('LPG')) return 'LPG';
    if (m.includes('ELECTRIC') || m.includes(' EV ')) return 'ELECTRIC';

    // Short codes common in RTO records
    if (/\b(D)\b/.test(m)) return 'DIESEL';
    if (/\b(P)\b/.test(m)) return 'PETROL';

    return null;
}

/**
 * Normalizes labels and values for cleaner UI
 */
function normalizeValue(key: string, value: string): string {
    if (!value || value === '—' || value.length < 1) return '—';

    // Remove redundant prefixes
    let clean = value.replace(/^(Rs\.|INR|Expires on|Expiring on)\s*/i, '').trim();

    // Date formatting (simple)
    if (key.includes('validity') || key.includes('date')) {
        // If it's something like "27-Feb-2026Renew Now", split it
        const match = clean.match(/(\d{1,2}-[A-Z][a-z]{2}-\d{4})/);
        if (match) clean = match[1];
    }

    return clean.toUpperCase();
}

// ─── Direct Scraper Logic (CarInfo Fallback) ───────────────────────────
async function scrapeLiveFromCarInfo(regNo: string) {
    try {
        const url = `https://www.carinfo.app/rc-details/${regNo}`
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        })

        const $ = cheerio.load(res.data)
        const data: any = {}

        // Exact labels found from inspection on live site
        const labelMap: any = {
            'Owner Name': 'owner_name',
            'Make & Model': 'model',
            'Maker Model': 'model',
            'Registration Date': 'registration_date',
            'Fuel Type': 'fuel_type',
            'Registration Authority': 'registration_authority',
            'Registered RTO': 'registration_authority',
            'Chassis Number': 'chassis_number',
            'Engine Number': 'engine_number',
            'Registration Expiry': 'fitness_validity',
            'Fitness Valid Upto': 'fitness_validity',
            'Insurance Expiry': 'insurance_validity',
            'Insurance Valid Upto': 'insurance_validity',
            'Vehicle Class': 'vehicle_class',
            'Status': 'status',
            'RC Status': 'status'
        }

        // Search through all elements for label matches
        // Improved: look for container patterns
        $('p, div, span, td, li').each((_, el) => {
            const text = $(el).text().trim()
            if (labelMap[text]) {
                const key = labelMap[text]
                if (!data[key] || data[key] === '—') {
                    // Try next sibling
                    let val = $(el).next().text().trim()

                    // If sibling search fails, try parent's next sibling or children
                    if (!val) {
                        val = $(el).parent().find('p, span').last().text().trim()
                    }

                    if (val && val !== text) {
                        data[key] = normalizeValue(key, val)
                    }
                }
            }

            // Special case for Insurance text which might be in a single tag with badge
            if (text.includes('Insurance Expiring') || text.includes('Insurance Valid')) {
                const match = text.match(/(\d{1,2}-[A-Z][a-z]{2}-\d{4})/)
                if (match && !data.insurance_validity) {
                    data.insurance_validity = match[1].toUpperCase()
                }
            }
        })

        // ─── Post-Processing Heuristics ──────────────────────────────────────

        // 1. If Fuel Type is missing, try to extract from Model
        if ((!data.fuel_type || data.fuel_type === '—') && data.model) {
            const guessed = extractFuelFromModel(data.model)
            if (guessed) data.fuel_type = guessed
        }

        // 2. If authority is partially found in RTO Details section
        if (!data.registration_authority || data.registration_authority === '—') {
            const rtoText = $("p:contains('Registered RTO')").next().text().trim()
            if (rtoText) data.registration_authority = rtoText.toUpperCase()
        }

        // Cleanup: If data is very sparse, it might have failed
        if (!data.owner_name && Object.keys(data).length < 2) {
            console.log('Scrape failed: No data extracted from HTML.')
            return null
        }

        console.log('Successfully scraped live data keys:', Object.keys(data))

        return {
            ...data,
            source: 'CarInfo (Live)',
            is_live: true
        }
    } catch (e) {
        console.error('CarInfo Scrape Error:', e)
        return null
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { vehicle_number } = body

        if (!vehicle_number?.trim()) {
            return NextResponse.json({ error: 'Vehicle number is required' }, { status: 400 })
        }

        const regNo = vehicle_number.trim().toUpperCase()

        // ─── 1. Attempt Direct Live Scrape ──────────────────────────────────
        console.log(`Attempting live scrape for: ${regNo}`)
        const liveData = await scrapeLiveFromCarInfo(regNo)

        if (liveData) {
            return NextResponse.json({
                success: true,
                isSimulation: false,
                isLive: true,
                data: liveData,
                timestamp: new Date().toISOString()
            })
        }

        // ─── 2. Fallback: Mock Data (Simulation Mode) ────────────────────────
        console.log(`Live scrape failed for ${regNo}. Falling back to mock data.`)

        try {
            const mockData = require('@/data/mock-vehicles.json')
            const found = mockData.find((v: any) => v.vehicle_number === regNo)

            if (found) {
                return NextResponse.json({
                    success: true,
                    isSimulation: true,
                    data: { ...found, source: 'Internal Database' },
                    timestamp: new Date().toISOString()
                })
            }
        } catch (e) {
            console.error("Mock data logic error", e)
        }

        // ─── 3. Final Fallback: Generative Simulation ──────────────────────
        return NextResponse.json({
            success: true,
            isSimulation: true,
            data: {
                owner_name: "NUMBER NOT FOUND",
                model: "INVALID OR UNKNOWN VEHICLE",
                fuel_type: "NONE",
                registration_date: "—",
                fitness_validity: "—",
                insurance_validity: "—",
                status: "NOT FOUND IN LIVE RECORDS",
                source: 'Simulation (Not Found)'
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Vehicle Scraper API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
