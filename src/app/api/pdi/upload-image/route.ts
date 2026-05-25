import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { saveUploadedFile, validateImageFile } from '@/lib/utils/file-upload.utils'

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Only ADMIN can upload PDI images
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File
        const category = formData.get('category') as string

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        if (!category) {
            return NextResponse.json({ error: 'Category is required' }, { status: 400 })
        }

        // Validate file
        const validation = validateImageFile(file)
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 })
        }

        // Save to temporary directory (will be moved when PDI is saved)
        const tempDir = 'uploads/pdi/temp'
        const fileInfo = await saveUploadedFile(file, tempDir)

        // Normalize path separators for cross-platform compatibility
        const normalizedPath = fileInfo.filePath.replace(/\\/g, '/')

        console.log(`📸 Image uploaded: ${fileInfo.fileName} (${category}) → ${normalizedPath}`)

        return NextResponse.json({
            success: true,
            data: {
                fileName: fileInfo.fileName,
                filePath: normalizedPath,
                fileSize: fileInfo.fileSize,
                category,
                preview: `/${normalizedPath}`
            }
        }, { status: 200 })

    } catch (error: any) {
        console.error('Image upload error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to upload image' },
            { status: 500 }
        )
    }
}
