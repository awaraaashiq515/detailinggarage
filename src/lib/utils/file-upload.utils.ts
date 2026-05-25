import { writeFile, mkdir, unlink, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { randomBytes } from 'crypto'

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

export interface FileValidationResult {
    valid: boolean
    error?: string
}

export interface UploadedFileInfo {
    fileName: string
    filePath: string
    fileSize: number
}

/**
 * Validate file type and size
 */
export function validateImageFile(file: File): FileValidationResult {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed types: jpg, jpeg, png, webp`
        }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        }
    }

    return { valid: true }
}

/**
 * Generate unique filename
 */
export function generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now()
    const randomString = randomBytes(8).toString('hex')
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
    return `${timestamp}-${randomString}.${extension}`
}

/**
 * Save uploaded file to disk
 */
export async function saveUploadedFile(
    file: File,
    directory: string
): Promise<UploadedFileInfo> {
    try {
        // Ensure directory exists
        const fullDirPath = join(process.cwd(), 'public', directory)
        if (!existsSync(fullDirPath)) {
            await mkdir(fullDirPath, { recursive: true })
        }

        // Generate unique filename
        const fileName = generateUniqueFileName(file.name)
        const filePath = join(directory, fileName)
        const fullFilePath = join(process.cwd(), 'public', filePath)

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(fullFilePath, buffer)

        return {
            fileName,
            filePath,
            fileSize: file.size
        }
    } catch (error) {
        console.error('Error saving file:', error)
        throw new Error('Failed to save file')
    }
}

/**
 * Delete file from disk
 */
export async function deleteFile(filePath: string): Promise<boolean> {
    try {
        const fullPath = join(process.cwd(), 'public', filePath)
        if (existsSync(fullPath)) {
            await unlink(fullPath)
            return true
        }
        return false
    } catch (error) {
        console.error('Error deleting file:', error)
        return false
    }
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
    try {
        const fullPath = join(process.cwd(), 'public', filePath)
        await stat(fullPath)
        return true
    } catch {
        return false
    }
}

/**
 * Get file size
 */
export async function getFileSize(filePath: string): Promise<number | null> {
    try {
        const fullPath = join(process.cwd(), 'public', filePath)
        const stats = await stat(fullPath)
        return stats.size
    } catch {
        return null
    }
}

/**
 * Create PDI images directory
 */
export async function createPDIImagesDirectory(pdiId: string): Promise<string> {
    const directory = `uploads/pdi/${pdiId}`
    const fullPath = join(process.cwd(), 'public', directory)

    if (!existsSync(fullPath)) {
        await mkdir(fullPath, { recursive: true })
    }

    return directory
}
