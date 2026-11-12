import { PlatformPublishResult } from "./types"
import fs from "fs"
import path from "path"

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

        let targetIgId = instagramAccountId

        // Step A: Auto-resolve Instagram Business Account ID if Page ID was passed
        try {
            const pageLookup = await fetch(
                `https://graph.facebook.com/v20.0/${instagramAccountId}?fields=name,instagram_business_account&access_token=${accessToken}`
            )
            const pageData = await pageLookup.json()
            if (pageData?.instagram_business_account?.id) {
                targetIgId = pageData.instagram_business_account.id
            } else if (!pageData?.id?.startsWith("1784")) {
                // Not already an Instagram ID (IG IDs typically start with 1784...)
                result.error =
                    "Detailing Garage Facebook Page se koi Instagram Professional Account linked nahi hai. Facebook Page Settings -> Linked Accounts me Instagram account connect karein."
                return result
            }
        } catch {
            // Continue with provided ID
        }

        const isReel = mediaType === "VIDEO" || mediaType === "REEL"
        const fullCaption = caption + (linkUrl ? `\n\nDetails: ${linkUrl}` : "")
        const localPath = getLocalFilePath(mediaUrl)

        // Step B: Ensure Media URL is a public HTTPS URL (Instagram requirement)
        let finalMediaUrl = mediaUrl
        if (localPath) {
            try {
                const fileBuffer = fs.readFileSync(localPath)
                const form = new FormData()
                const mime = getMimeType(localPath, isReel)
                form.append("reqtype", "fileupload")
                form.append("fileToUpload", new Blob([fileBuffer], { type: mime }), path.basename(localPath))

                const uploadRes = await fetch("https://catbox.moe/user/api.php", {
                    method: "POST",
                    body: form
                })
                const publicUrl = (await uploadRes.text()).trim()
                if (publicUrl.startsWith("http://") || publicUrl.startsWith("https://")) {
                    finalMediaUrl = publicUrl
                }
            } catch (tempErr) {
                console.warn("Failed to generate public URL for Instagram:", tempErr)
            }
        }

        if (!finalMediaUrl.startsWith("http://") && !finalMediaUrl.startsWith("https://")) {
            result.error =
                "Instagram Graph API requires a public HTTPS URL. Please ensure your website has a public URL or host the photo online."
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

        // For reels, give Instagram a short moment to process container
        if (isReel) {
            await new Promise((resolve) => setTimeout(resolve, 3000))
        }

        // Step 2: Publish Container
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
