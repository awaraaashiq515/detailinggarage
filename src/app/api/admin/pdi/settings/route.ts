import { NextResponse } from 'next/server'
import * as pdiService from '@/services/pdi-service'

export async function GET() {
    try {
        const structure = await pdiService.getPDIStructure()
        return NextResponse.json(structure)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch structure' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { type, ...data } = body

        if (type === 'SECTION') {
            const section = await pdiService.createPDISection(data.name)
            return NextResponse.json(section)
        } else if (type === 'ITEM') {
            const item = await pdiService.createPDIItem(data.sectionId, data.label)
            return NextResponse.json(item)
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { type, id, ...data } = body

        if (type === 'SECTION') {
            const section = await pdiService.updatePDISection(id, data)
            return NextResponse.json(section)
        } else if (type === 'ITEM') {
            const item = await pdiService.updatePDIItem(id, data)
            return NextResponse.json(item)
        } else if (type === 'REORDER') {
            await pdiService.reorderPDIStructure(data.reorderType, data.items)
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const type = searchParams.get('type')

        if (!id || !type) {
            return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })
        }

        if (type === 'SECTION') {
            await pdiService.deletePDISection(id)
        } else if (type === 'ITEM') {
            await pdiService.deletePDIItem(id)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
