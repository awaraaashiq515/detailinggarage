// Facebook Sync Service - Detailing Garage
import { db } from "@/lib/db"

export interface FacebookPageInfo {
    id: string
    name: string
    link?: string
    picture?: {
        data?: {
            url?: string
        }
    }
    followers_count?: number
}

/**
 * Get Facebook settings (creates default if missing)
 */
export async function getFacebookSettings() {
    let settings = await db.facebookSettings.findFirst()

    if (!settings) {
        settings = await db.facebookSettings.create({
            data: {
                pageId: "",
                pageName: "Detailing Garage Official",
                pageAccessToken: "",
                appId: "",
                appSecret: "",
                webhookVerifyToken: "dg_fb_webhook_token_secure_2026",
                autoSync: true,
                syncInterval: 30, // 30 minutes
                showOnHome: true,
                homeSectionTitle: "Live from Facebook",
                homeSectionDesc: "Latest detailing transformations, master ceramic applications, and stories directly from our Facebook page.",
                maxHomePosts: 8,
                fallbackEmbedUrl: "https://www.facebook.com",
                lastSyncStatus: "IDLE",
                isConnected: false,
            }
        })
    }

    return settings
}

/**
 * Update Facebook settings
 */
export async function updateFacebookSettings(
    updates: {
        pageId?: string
        pageName?: string
        pageAccessToken?: string
        appId?: string
        appSecret?: string
        webhookVerifyToken?: string
        autoSync?: boolean
        syncInterval?: number
        showOnHome?: boolean
        homeSectionTitle?: string
        homeSectionDesc?: string
        maxHomePosts?: number
        fallbackEmbedUrl?: string
    },
    adminUserId?: string
) {
    const current = await getFacebookSettings()

    const updated = await db.facebookSettings.update({
        where: { id: current.id },
        data: {
            ...updates,
            updatedBy: adminUserId,
        }
    })

    return updated
}

/**
 * Test Facebook Graph API Connection with Page ID and Access Token
 */
export async function testFacebookConnection(pageId: string, accessToken: string) {
    if (!pageId || !accessToken) {
        return {
            success: false,
            error: "Page ID and Page Access Token are required to test connection."
        }
    }

    try {
        const cleanPageId = pageId.trim()
        const cleanToken = accessToken.trim()
        
        const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(cleanPageId)}?fields=id,name,link,picture{url},followers_count,fan_count&access_token=${encodeURIComponent(cleanToken)}`
        
        const res = await fetch(url, { method: "GET" })
        const data = await res.json()

        if (data.error) {
            return {
                success: false,
                error: data.error.message || "Failed to connect to Facebook Graph API.",
                details: data.error
            }
        }

        // Connection is successful! Update settings status
        const settings = await getFacebookSettings()
        await db.facebookSettings.update({
            where: { id: settings.id },
            data: {
                isConnected: true,
                pageName: data.name || settings.pageName,
                fallbackEmbedUrl: data.link || settings.fallbackEmbedUrl,
                lastSyncStatus: "SUCCESS",
                lastSyncMessage: `Connected successfully to page "${data.name}" (ID: ${data.id})`
            }
        })

        return {
            success: true,
            page: {
                id: data.id,
                name: data.name,
                link: data.link,
                picture: data.picture?.data?.url,
                followers: data.followers_count || data.fan_count || 0
            }
        }
    } catch (err: any) {
        return {
            success: false,
            error: err.message || "Network error while connecting to Facebook Graph API."
        }
    }
}

/**
 * Fetch and sync latest posts from Facebook Page into db.studioPost
 */
export async function syncFacebookPosts(options: { manual?: boolean; adminUserId?: string } = {}) {
    const settings = await getFacebookSettings()

    if (!settings.pageId || !settings.pageAccessToken) {
        return {
            success: false,
            error: "Facebook credentials not configured. Please enter Page ID and Page Access Token in settings."
        }
    }

    try {
        const pageId = settings.pageId.trim()
        const token = settings.pageAccessToken.trim()
        const limit = 25

        // Graph API endpoint for page posts with rich attachments
        const apiUrl = `https://graph.facebook.com/v19.0/${encodeURIComponent(pageId)}/posts?fields=id,message,created_time,full_picture,permalink_url,shares,attachments{media_type,media,unshimmed_url,title,description,type}&limit=${limit}&access_token=${encodeURIComponent(token)}`

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Accept": "application/json" }
        })

        const data = await response.json()

        if (data.error) {
            await db.facebookSettings.update({
                where: { id: settings.id },
                data: {
                    isConnected: false,
                    lastSyncStatus: "ERROR",
                    lastSyncMessage: data.error.message || "Failed to fetch Facebook posts",
                    lastSyncedAt: new Date(),
                    updatedBy: options.adminUserId
                }
            })

            return {
                success: false,
                error: data.error.message || "Facebook Graph API returned an error.",
                details: data.error
            }
        }

        const rawPosts = data.data || []
        let syncedCount = 0

        for (const post of rawPosts) {
            const externalId = post.id
            if (!externalId) continue

            // Determine media URL and type
            let mediaUrl = post.full_picture
            let postType = "IMAGE"

            const primaryAttachment = post.attachments?.data?.[0]
            if (primaryAttachment) {
                if (
                    primaryAttachment.media_type === "video" || 
                    primaryAttachment.type === "video_inline" ||
                    primaryAttachment.type === "video_autoplay"
                ) {
                    postType = "VIDEO"
                }

                if (!mediaUrl && primaryAttachment.media?.image?.src) {
                    mediaUrl = primaryAttachment.media.image.src
                }
            }

            // Fallback image if post has no image (e.g. text status or link)
            if (!mediaUrl) {
                mediaUrl = "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=1200&auto=format&fit=crop"
            }

            const caption = post.message || primaryAttachment?.title || primaryAttachment?.description || null
            const permalink = post.permalink_url || `https://www.facebook.com/${post.id}`
            const publishedAt = post.created_time ? new Date(post.created_time) : new Date()
            const sharesCount = post.shares?.count || 0

            // Upsert post into studioPost
            await db.studioPost.upsert({
                where: { externalId },
                update: {
                    type: postType,
                    url: mediaUrl,
                    caption,
                    link: permalink,
                    sharesCount,
                    publishedAt,
                    isActive: true,
                    updatedAt: new Date()
                },
                create: {
                    type: postType,
                    url: mediaUrl,
                    caption,
                    link: permalink,
                    source: "FACEBOOK",
                    externalId,
                    sharesCount,
                    publishedAt,
                    isActive: true
                }
            })

            syncedCount++
        }

        // Update settings with success info
        await db.facebookSettings.update({
            where: { id: settings.id },
            data: {
                isConnected: true,
                lastSyncStatus: "SUCCESS",
                lastSyncMessage: `Synced ${syncedCount} posts from Facebook at ${new Date().toLocaleTimeString('en-US')}`,
                lastSyncedAt: new Date(),
                updatedBy: options.adminUserId
            }
        })

        return {
            success: true,
            count: syncedCount,
            message: `Successfully synchronized ${syncedCount} Facebook posts.`
        }
    } catch (err: any) {
        console.error("Facebook Sync Error:", err)

        await db.facebookSettings.update({
            where: { id: settings.id },
            data: {
                lastSyncStatus: "ERROR",
                lastSyncMessage: err.message || "Unknown error during Facebook sync",
                lastSyncedAt: new Date(),
                updatedBy: options.adminUserId
            }
        })

        return {
            success: false,
            error: err.message || "Failed to synchronize Facebook posts."
        }
    }
}

/**
 * Automated sync check - runs automatically if interval has passed
 */
export async function autoCheckAndSyncIfNeeded() {
    try {
        const settings = await getFacebookSettings()
        if (!settings.autoSync || !settings.pageId || !settings.pageAccessToken) {
            return
        }

        const now = Date.now()
        const intervalMs = (settings.syncInterval || 30) * 60 * 1000
        const lastSyncTime = settings.lastSyncedAt ? new Date(settings.lastSyncedAt).getTime() : 0

        if (now - lastSyncTime >= intervalMs) {
            // Trigger background sync
            syncFacebookPosts().catch(err => {
                console.error("Background Facebook auto-sync failed:", err)
            })
        }
    } catch (e) {
        console.error("Auto check sync error:", e)
    }
}

/**
 * Handle incoming Facebook Webhook payload
 */
export async function processFacebookWebhookPayload(payload: any) {
    try {
        if (!payload || !payload.entry || !Array.isArray(payload.entry)) {
            return { handled: false, reason: "Invalid payload format" }
        }

        let updatedPostsCount = 0

        for (const entry of payload.entry) {
            const changes = entry.changes || []
            for (const change of changes) {
                if (change.field === "feed") {
                    const value = change.value || {}
                    // Item added or edited
                    if (value.verb === "add" || value.verb === "edit") {
                        const postId = value.post_id
                        const message = value.message || null
                        const link = value.link || (postId ? `https://www.facebook.com/${postId}` : null)
                        const photos = value.photos || []
                        const mediaUrl = photos[0] || "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=1200&auto=format&fit=crop"
                        const postType = value.item === "video" ? "VIDEO" : "IMAGE"

                        if (postId) {
                            await db.studioPost.upsert({
                                where: { externalId: postId },
                                update: {
                                    caption: message,
                                    link,
                                    url: mediaUrl,
                                    type: postType,
                                    updatedAt: new Date()
                                },
                                create: {
                                    externalId: postId,
                                    source: "FACEBOOK",
                                    caption: message,
                                    link,
                                    url: mediaUrl,
                                    type: postType,
                                    isActive: true,
                                    publishedAt: new Date()
                                }
                            })
                            updatedPostsCount++
                        }
                    }
                }
            }
        }

        // Also trigger full sync to ensure high quality full pictures and media attachments are grabbed
        syncFacebookPosts().catch(err => console.error("Webhook triggered sync error:", err))

        return { handled: true, updatedPostsCount }
    } catch (err: any) {
        console.error("Error processing Facebook webhook:", err)
        return { handled: false, error: err.message }
    }
}
