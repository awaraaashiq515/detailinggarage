import { NextResponse } from 'next/server'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params
        const filePath = join(process.cwd(), 'public', 'uploads', ...path)

        if (!existsSync(filePath)) {
            return new NextResponse('File Not Found', { status: 404 })
        }

        const fileBuffer = readFileSync(filePath)
        const extension = path[path.length - 1].split('.').pop()?.toLowerCase()

        let contentType = 'application/octet-stream'
        if (extension === 'jpg' || extension === 'jpeg') {
            contentType = 'image/jpeg'
        } else if (extension === 'png') {
            contentType = 'image/png'
        } else if (extension === 'webp') {
            contentType = 'image/webp'
        } else if (extension === 'gif') {
            contentType = 'image/gif'
        } else if (extension === 'svg') {
            contentType = 'image/svg+xml'
        } else if (extension === 'pdf') {
            contentType = 'application/pdf'
        }

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        console.error('Error serving file:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
