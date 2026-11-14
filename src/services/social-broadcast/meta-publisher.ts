import { PlatformPublishResult } from "./types"
import fs from "fs"
import path from "path"
import sharp from "sharp"

/**
 * Resolve local disk file path if mediaUrl is a relative path like /uploads/...
 */
function getLocalFilePath(urlStr?: string): string | null {
    if (!urlStr) return null
    if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) return null

    const clean = urlStr.startsWith("/") ? urlStr.slice(1) : urlStr
    const candidate1 = path.join(process.cwd(), "public", clean)
    if (fs.existsSync(candidate1)) return candidate1

    const candidate2 = path.join(process.cwd(), clean)
    if (fs.existsSync(candidate2)) return candidate2

    return null
}

function getMimeType(filePath: string, isVideo = false): string {
    const ext = path.extname(filePath).toLowerCase()
    if (isVideo) {
        if (ext === ".mov") return "video/quicktime"
        return "video/mp4"
    }
    if (ext === ".png") return "image/png"
    if (ext === ".webp") return "image/webp"
    if (ext === ".gif") return "image/gif"
    return "image/jpeg"
}

/**
 * Upload a binary buffer to a reliable public host so Instagram Graph API can fetch it
 */
async function uploadBufferToPublicHost(buffer: any, filename: string, mime: string): Promise<string | null> {
    try {
        // Provider 1: catbox.moe
        try {
            const form = new FormData()
            form.append("reqtype", "fileupload")
            form.append("fileToUpload", new Blob([buffer as any], { type: mime }), filename)

            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), 15000)
            const res = await fetch("https://catbox.moe/user/api.php", {
                method: "POST",
                body: form,
                signal: controller.signal
            })
            clearTimeout(timer)
            const txt = (await res.text()).trim()
            if (txt.startsWith("http://") || txt.startsWith("https://")) {
                return txt
            }
        } catch (catboxErr) {
            console.warn("catbox.moe upload failed, trying tmpfiles fallback:", catboxErr)
        }

        // Provider 2: tmpfiles.org
        try {
            const form = new FormData()
            form.append("file", new Blob([buffer as any], { type: mime }), filename)

            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), 15000)
            const res = await fetch("https://tmpfiles.org/api/v1/upload", {
                method: "POST",
                body: form,
                signal: controller.signal
            })
            clearTimeout(timer)
            const data = await res.json()
            if (data?.data?.url) {
                // Convert view URL to direct download URL: /12345/ -> /dl/12345/
                const directUrl = data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/")
                return directUrl
            }
        } catch (tmpfilesErr) {
            console.warn("tmpfiles.org upload failed:", tmpfilesErr)
        }
    } catch (err) {
        console.error("uploadBufferToPublicHost error:", err)
    }
    return null
}

/**
 * Normalize image for Instagram:
 * 1. Converts any image to high-quality JPEG (Meta strictly rejects PNG, WEBP, AVIF, HEIC)
 * 2. Ensures aspect ratio is strictly within Instagram's allowed range: 4:5 (0.80) to 1.91:1
 *    If an image is too wide (banner) or too tall, it pads it with a clean background (fit: 'contain')
 * 3. Ensures minimum resolution of at least 320x320 (Instagram requirement is >= 150x150)
 */
async function processImageForInstagram(input: any): Promise<Buffer> {
    try {
        const image = sharp(input)
        const meta = await image.metadata()

        if (!meta.width || !meta.height) {
            return await image
                .flatten({ background: { r: 255, g: 255, b: 255 } })
                .toFormat("jpeg", { quality: 95 })
                .toBuffer()
        }

        let targetWidth = meta.width
        let targetHeight = meta.height
        const ratio = targetWidth / targetHeight

        // Instagram strict aspect ratio range: [0.80, 1.91]
        // We use safe inner bounds: [0.81, 1.90] to avoid Meta rounding rejection
        let needsResize = false

        if (ratio > 1.90) {
            // Image is too wide (horizontal banner/strip) -> pad height (top & bottom)
            targetHeight = Math.ceil(targetWidth / 1.90)
            needsResize = true
        } else if (ratio < 0.81) {
            // Image is too tall (vertical story/reel poster) -> pad width (left & right)
            targetWidth = Math.ceil(targetHeight * 0.81)
            needsResize = true
        }

        // Instagram minimum resolution (at least 320px)
        if (targetWidth < 320 || targetHeight < 320) {
            const scale = Math.max(320 / targetWidth, 320 / targetHeight)
            targetWidth = Math.ceil(targetWidth * scale)
            targetHeight = Math.ceil(targetHeight * scale)
            needsResize = true
        }

        let pipeline = image

        if (needsResize) {
            pipeline = pipeline.resize(targetWidth, targetHeight, {
                fit: "contain",
                background: { r: 255, g: 255, b: 255 }
            })
        }

        return await pipeline
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .toFormat("jpeg", { quality: 95 })
            .toBuffer()
    } catch (err) {
        console.warn("processImageForInstagram fallback:", err)
        return await sharp(input)
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .toFormat("jpeg", { quality: 95 })
            .toBuffer()
    }
}

/**
 * Upload local file to a reliable temporary public host so Instagram Graph API can fetch it.
 * Converts ANY image format (PNG, WEBP, etc.) to JPEG and fixes aspect ratio for Instagram.
 */
async function uploadToPublicHost(localPath: string, isVideo = false): Promise<string | null> {
    try {
        let fileBuffer: any = fs.readFileSync(localPath)
        let mime = getMimeType(localPath, isVideo)
        let filename = path.basename(localPath)

        // Meta Instagram Graph API STRICTLY REQUIRES JPEG format and 4:5 to 1.91:1 aspect ratio
        if (!isVideo) {
            fileBuffer = await processImageForInstagram(fileBuffer)
            mime = "image/jpeg"
            filename = `${path.parse(filename).name}.jpg`
        }

        return await uploadBufferToPublicHost(fileBuffer, filename, mime)
    } catch (err) {
        console.error("uploadToPublicHost error:", err)
        return null
    }
}

/**
 * Publish post to a Facebook Page via Graph API
 * Supports both local binary file upload (multipart/form-data) and public URLs
 */
export async function publishToFacebookPage({
    pageId,
    accessToken,
    caption,
    mediaUrl,
    mediaType = "IMAGE",
    linkUrl
}: {
    pageId: string
    accessToken: string
    caption: string
    mediaUrl?: string
    mediaType?: string
    linkUrl?: string
}): Promise<PlatformPublishResult> {
    const result: PlatformPublishResult = {
        platform: "FACEBOOK",
        success: false
    }

    try {
        if (!pageId || !accessToken) {
            result.error = "Facebook Page ID or Access Token is missing."
            return result
        }

        const isVideo = mediaType === "VIDEO" || mediaType === "REEL"
        const fullMessage = caption + (linkUrl ? `\n\n🔗 ${linkUrl}` : "")
        const localPath = getLocalFilePath(mediaUrl)

        // Case 1: Video Post
        if (mediaUrl && isVideo) {
            const endpoint = `https://graph.facebook.com/v20.0/${pageId}/videos`

            if (localPath) {
                // Upload binary file directly from disk
                const fileBuffer = fs.readFileSync(localPath)
                const formData = new FormData()
                formData.append("source", new Blob([fileBuffer], { type: getMimeType(localPath, true) }), path.basename(localPath))
                formData.append("description", fullMessage)
                formData.append("access_token", accessToken)

                const res = await fetch(endpoint, {
                    method: "POST",
                    body: formData
                })
                const data = await res.json()
                if (data.id) {
                    result.success = true
                    result.externalPostId = data.id
                    result.externalUrl = `https://www.facebook.com/${data.id}`
                    return result
                } else {
                    result.error = data.error?.message || "Failed to upload video file to Facebook"
                    return result
                }
            } else {
                // Public URL
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        file_url: mediaUrl,
                        description: fullMessage,
                        access_token: accessToken
                    })
                })
                const data = await res.json()
                if (data.id) {
                    result.success = true
                    result.externalPostId = data.id
                    result.externalUrl = `https://www.facebook.com/${data.id}`
                    return result
                } else {
                    result.error = data.error?.message || "Failed to publish video URL to Facebook"
                    return result
                }
            }
        }

        // Case 2: Photo Post
        if (mediaUrl) {
            const endpoint = `https://graph.facebook.com/v20.0/${pageId}/photos`

            if (localPath) {
                // Upload binary file directly from disk — works on localhost without any public domain!
                const fileBuffer = fs.readFileSync(localPath)
                const formData = new FormData()
                formData.append("source", new Blob([fileBuffer], { type: getMimeType(localPath, false) }), path.basename(localPath))
                formData.append("caption", fullMessage)
                formData.append("access_token", accessToken)

                const res = await fetch(endpoint, {
                    method: "POST",
                    body: formData
                })
                const data = await res.json()
                if (data.id || data.post_id) {
                    result.success = true
                    result.externalPostId = data.id || data.post_id
                    result.externalUrl = `https://www.facebook.com/${data.post_id || data.id}`
                    return result
                } else {
                    result.error = data.error?.message || "Failed to upload photo file to Facebook"
                    return result
                }
            } else {
                // Public URL
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url: mediaUrl,
                        caption: fullMessage,
                        access_token: accessToken
                    })
                })
                const data = await res.json()
                if (data.id || data.post_id) {
                    result.success = true
                    result.externalPostId = data.id || data.post_id
                    result.externalUrl = `https://www.facebook.com/${data.post_id || data.id}`
                    return result
                } else {
                    result.error = data.error?.message || "Failed to publish photo URL to Facebook"
                    return result
                }
            }
        }

        // Case 3: Text or Link Feed Post
        const feedEndpoint = `https://graph.facebook.com/v20.0/${pageId}/feed`
        const payload: Record<string, any> = {
            message: caption,
            access_token: accessToken
        }
        if (linkUrl) payload.link = linkUrl

        const res = await fetch(feedEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        const data = await res.json()
        if (data.id) {
            result.success = true
            result.externalPostId = data.id
            result.externalUrl = `https://www.facebook.com/${data.id}`
            return result
        } else {
            result.error = data.error?.message || "Failed to publish feed post to Facebook"
            return result
        }
    } catch (err: any) {
        result.error = err?.message || "Network error while publishing to Facebook"
        return result
    }
}

/**
 * Publish post to Instagram Business/Creator Account via Meta Graph API
 * Automatically resolves Instagram Business Account ID if a Page ID was passed
 */
export async function publishToInstagram({
    instagramAccountId,
    accessToken,
    caption,
    mediaUrl,
    mediaType = "IMAGE",
    linkUrl
}: {
    instagramAccountId: string
    accessToken: string
    caption: string
    mediaUrl?: string
    mediaType?: string
    linkUrl?: string
}): Promise<PlatformPublishResult> {
    const result: PlatformPublishResult = {
        platform: "INSTAGRAM",
        success: false
    }

    try {
        if (!instagramAccountId || !accessToken) {
            result.error = "Instagram Account ID or Access Token is missing."
            return result
        }

        if (!mediaUrl) {
            result.error = "Instagram requires an image or video to publish."
            return result
        }

        let targetIgId = instagramAccountId.trim()

        // Step A: If the ID is NOT already an Instagram Business Account ID (IG User IDs start with 1784...),
        // it means a Facebook Page ID was passed, so query the page for its linked instagram_business_account.
        if (!targetIgId.startsWith("1784")) {
            try {
                const pageLookup = await fetch(
                    `https://graph.facebook.com/v20.0/${targetIgId}?fields=name,instagram_business_account&access_token=${accessToken}`
                )
                const pageData = await pageLookup.json()
                if (pageData?.instagram_business_account?.id) {
                    targetIgId = pageData.instagram_business_account.id
                } else {
                    result.error =
                        "Detailing Garage Facebook Page se koi Instagram Professional Account linked nahi hai. Facebook Page Settings -> Linked Accounts me Instagram account connect karein."
                    return result
                }
            } catch {
                // Continue with provided ID if network fails
            }
        }

        const isReel = mediaType === "VIDEO" || mediaType === "REEL"
        const fullCaption = caption + (linkUrl ? `\n\nDetails: ${linkUrl}` : "")
        const localPath = getLocalFilePath(mediaUrl)

        // Step B: Ensure Media URL is a public HTTPS URL (Instagram requirement)
        let finalMediaUrl = mediaUrl
        if (localPath) {
            const publicUrl = await uploadToPublicHost(localPath, isReel)
            if (publicUrl) {
                finalMediaUrl = publicUrl
            }
        } else if (!isReel && finalMediaUrl && (finalMediaUrl.startsWith("http://") || finalMediaUrl.startsWith("https://"))) {
            // Process remote image to guarantee Instagram-compliant JPEG and aspect ratio
            try {
                const res = await fetch(finalMediaUrl)
                const buf = await res.arrayBuffer()
                const converted = await processImageForInstagram(Buffer.from(buf))
                const publicUrl = await uploadBufferToPublicHost(converted, "instagram_feed.jpg", "image/jpeg")
                if (publicUrl) {
                    finalMediaUrl = publicUrl
                }
            } catch (convErr) {
                console.warn("Remote image processing warning:", convErr)
            }
        }

        if (!finalMediaUrl.startsWith("http://") && !finalMediaUrl.startsWith("https://")) {
            result.error =
                "Instagram Graph API requires a public HTTPS URL. Local images (/uploads/...) cannot be accessed by Instagram servers unless hosted online."
            return result
        }

        // Step 1: Create Instagram Container
        const containerUrl = `https://graph.facebook.com/v20.0/${targetIgId}/media`
        const containerBody: Record<string, any> = {
            caption: fullCaption,
            access_token: accessToken
        }

        if (isReel) {
            containerBody.media_type = "REELS"
            containerBody.video_url = finalMediaUrl
        } else {
            containerBody.image_url = finalMediaUrl
        }

        const containerRes = await fetch(containerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(containerBody)
        })

        const containerData = await containerRes.json()
        if (!containerData.id) {
            const msg = containerData.error?.message || "Failed to create Instagram media container"
            if (msg.includes("does not support this operation") || msg.includes("cannot be loaded")) {
                result.error =
                    `ID '${targetIgId}' is not an Instagram Business Account. Facebook Page Settings -> Linked Accounts me Instagram account connect karein.`
            } else {
                result.error = msg
            }
            return result
        }

        const creationId = containerData.id

        // Step 2: Poll container status until FINISHED
        // Meta Instagram Graph API requires container status to be FINISHED before calling media_publish
        let ready = false
        let attempts = 0
        const maxAttempts = isReel ? 15 : 6

        while (!ready && attempts < maxAttempts) {
            attempts++
            await new Promise((resolve) => setTimeout(resolve, 2000))

            try {
                const statusRes = await fetch(
                    `https://graph.facebook.com/v20.0/${creationId}?fields=status_code,status&access_token=${accessToken}`
                )
                const statusData = await statusRes.json()
                const statusCode = statusData?.status_code

                if (statusCode === "FINISHED") {
                    ready = true
                    break
                } else if (statusCode === "ERROR") {
                    result.error = statusData?.status || "Instagram media processing failed."
                    return result
                } else if (statusCode === "EXPIRED") {
                    result.error = "Instagram media container expired."
                    return result
                }
            } catch {
                // If status check network blips, continue loop
            }
        }

        // Step 3: Publish Container
        const publishUrl = `https://graph.facebook.com/v20.0/${targetIgId}/media_publish`
        const publishRes = await fetch(publishUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                creation_id: creationId,
                access_token: accessToken
            })
        })

        const publishData = await publishRes.json()
        if (publishData.id) {
            result.success = true
            result.externalPostId = publishData.id
            result.externalUrl = `https://www.instagram.com/p/${publishData.id}`

            // Fetch actual Instagram permalink if available
            try {
                const mediaLookup = await fetch(
                    `https://graph.facebook.com/v20.0/${publishData.id}?fields=permalink&access_token=${accessToken}`
                )
                const mediaInfo = await mediaLookup.json()
                if (mediaInfo?.permalink) {
                    result.externalUrl = mediaInfo.permalink
                }
            } catch {
                // Keep default externalUrl
            }

            return result
        } else {
            result.error = publishData.error?.message || "Failed to publish Instagram container"
            return result
        }
    } catch (err: any) {
        result.error = err?.message || "Network error while publishing to Instagram"
        return result
    }
}
