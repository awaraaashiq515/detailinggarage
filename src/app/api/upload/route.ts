import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { saveUploadedFile } from "@/lib/utils/file-upload.utils"

const MAX_SIZE_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/heic",
    "image/heif",
]

/**
 * POST /api/upload
 * General-purpose image upload endpoint.
 * Accepts: multipart/form-data with `file` field and optional `folder` field.
 * Returns: { url: string } pointing to the public path of the saved file.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        let formData: FormData
        try {
            formData = await request.formData()
        } catch (e) {
            console.error("POST /api/upload: failed to parse formData:", e)
            return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
        }

        const rawFile = formData.get("file")
        const folder = (formData.get("folder") as string) || "general"

        // Accept File instances OR Blobs with a name (some runtimes differ)
        if (!rawFile) {
            console.error("POST /api/upload: no file field in formData")
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Coerce to File — some runtimes return a Blob instead of File
        let file: File
        if (rawFile instanceof File) {
            file = rawFile
        } else if (typeof rawFile === "object" && rawFile !== null && typeof (rawFile as any).arrayBuffer === "function") {
            // Duck-typed Blob — wrap it as a File
            const blob = rawFile as any
            file = new File([await blob.arrayBuffer()], "upload", { type: blob.type || "application/octet-stream" })
        } else {
            console.error("POST /api/upload: file field is not a File/Blob, got:", typeof rawFile)
            return NextResponse.json({ error: "Invalid file field" }, { status: 400 })
        }

        // Validate MIME type — accept any image/* or check explicit list
        const mimeOk =
            file.type.startsWith("image/") || ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())
        if (!mimeOk) {
            console.error(`POST /api/upload: rejected type="${file.type}" name="${file.name}"`)
            return NextResponse.json(
                {
                    error: `Only image files are supported. Got: ${file.type || "unknown (no content-type)"}`,
                },
                { status: 400 }
            )
        }

        if (file.size === 0) {
            return NextResponse.json({ error: "File is empty" }, { status: 400 })
        }

        if (file.size > MAX_SIZE_BYTES) {
            return NextResponse.json(
                {
                    error: `File too large. Max size is 8 MB (got ${(file.size / 1024 / 1024).toFixed(1)} MB)`,
                },
                { status: 400 }
            )
        }

        // Save to public/uploads/<folder>/
        const uploadDir = `uploads/${folder.replace(/^uploads[\\/]/, "")}`
        const fileInfo = await saveUploadedFile(file, uploadDir)

        // Normalize backslashes for web URLs
        const url = `/${fileInfo.filePath.replace(/\\/g, "/")}`

        return NextResponse.json({ url, path: url })
    } catch (error: any) {
        console.error("POST /api/upload error:", error)
        return NextResponse.json({ error: "Upload failed: " + (error?.message || "unknown") }, { status: 500 })
    }
}
