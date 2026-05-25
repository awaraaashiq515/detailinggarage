import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { db as prisma } from '@/lib/db'

const SANDBOX_URL = 'https://sandbox.surepass.io/api/v1/rc/rc-related/challan-details'
const LIVE_URL = 'https://api.surepass.io/api/v1/rc/rc-related/challan-details'

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { rc_number, chassis_number, engine_number, state_only, state_portal, force_refresh } = body

        if (!rc_number?.trim() || !chassis_number?.trim() || !engine_number?.trim()) {
            return NextResponse.json({ error: 'RC, Chassis, and Engine numbers are required' }, { status: 400 })
        }

        const rc = rc_number.trim().toUpperCase()
        const chassis = chassis_number.trim().toUpperCase()
        const engine = engine_number.trim().toUpperCase()

        // ─── 1. Check Cache first (unless force_refresh is true) ────────────────
        if (!force_refresh) {
            try {
                // Find existing search summary
                const existingSearch = await prisma.$queryRaw<any[]>`
                    SELECT * FROM ChallanSearch 
                    WHERE rcNumber = ${rc} 
                    ORDER BY createdAt DESC LIMIT 1
                `

                if (existingSearch && existingSearch.length > 0) {
                    const search = existingSearch[0]

                    // Fetch individual records for this search
                    const savedRecords = await prisma.$queryRaw<any[]>`
                        SELECT * FROM ChallanRecord WHERE searchId = ${search.id}
                    `

                    return NextResponse.json({
                        success: true,
                        fromCache: true,
                        cachedAt: search.updatedAt,
                        data: {
                            total_challan: search.totalChallans,
                            challan_list: savedRecords.map(r => ({
                                challan_number: r.challanNumber,
                                offense_details: r.offenseDetails,
                                challan_place: r.challanPlace,
                                challan_date: r.challanDate,
                                state: r.state,
                                accused_name: r.accusedName,
                                amount: r.amount,
                                challan_status: r.status,
                                court_challan: !!r.courtChallan
                            }))
                        },
                        mode: search.mode
                    })
                }
            } catch (cacheError) {
                console.error('Cache read error:', cacheError)
                // Continue to live API if cache fails
            }
        }

        // ─── 2. Call Surepass API (Live/Paid) ───────────────────────────────────
        const settings = await prisma.surepassSettings.findFirst()
        if (!settings?.apiToken) {
            return NextResponse.json({ error: 'Surepass API token not configured' }, { status: 400 })
        }

        const endpoint = settings.mode === 'live' ? LIVE_URL : SANDBOX_URL
        const cleanToken = settings.apiToken.replace(/^Bearer\s+/i, '').trim()

        const surepassRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanToken}`,
            },
            body: JSON.stringify({
                rc_number: rc,
                chassis_number: chassis,
                engine_number: engine,
                state_only: state_only ?? false,
                state_portal: state_portal ?? [],
            }),
        })

        const data = await surepassRes.json()

        if (!surepassRes.ok) {
            return NextResponse.json(
                { error: data?.message || data?.error || `Surepass API request failed (${settings.mode} mode)` },
                { status: surepassRes.status }
            )
        }

        const challanList = data.data?.challan_details?.challans || []
        const totalAmount = challanList.reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0)

        // ─── 3. Save to database ───────────────────────────────────────────────
        try {
            const searchId = Math.random().toString(36).substring(7)

            // Delete old data for this RC to avoid duplicates if force refreshed
            await prisma.$executeRaw`DELETE FROM ChallanSearch WHERE rcNumber = ${rc}`

            // Save Search Summary
            await prisma.$executeRaw`
                INSERT INTO ChallanSearch (id, rcNumber, chassisNumber, engineNumber, totalChallans, totalAmount, mode, searchBy, createdAt, updatedAt)
                VALUES (
                    ${searchId},
                    ${rc},
                    ${chassis},
                    ${engine},
                    ${challanList.length},
                    ${totalAmount},
                    ${settings.mode},
                    ${user.userId},
                    datetime('now'),
                    datetime('now')
                )
            `

            // Save Individual Records (best effort)
            for (const c of challanList) {
                try {
                    await prisma.$executeRaw`
                        INSERT INTO ChallanRecord (id, searchId, challanNumber, offenseDetails, challanPlace, challanDate, state, accusedName, amount, status, courtChallan, updatedAt)
                        VALUES (
                            ${Math.random().toString(36).substring(7)},
                            ${searchId},
                            ${c.challan_number || 'UNKNOWN-' + Math.random()},
                            ${c.offense_details || ''},
                            ${c.challan_place || ''},
                            ${c.challan_date || ''},
                            ${c.state || ''},
                            ${c.accused_name || ''},
                            ${Number(c.amount) || 0},
                            ${c.challan_status || ''},
                            ${c.court_challan ? 1 : 0},
                            datetime('now')
                        )
                    `
                } catch (err) {
                    console.error('Failed to save individual record:', c.challan_number, err)
                }
            }
        } catch (dbError) {
            console.error('Failed to save results to database:', dbError)
        }

        return NextResponse.json({
            success: true,
            fromCache: false,
            data: {
                total_challan: challanList.length,
                challan_list: challanList,
            },
            mode: settings.mode
        })
    } catch (error) {
        console.error('Challan API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
