import { db } from "@/lib/db"
import { BroadcastRequest, BroadcastResult, PlatformPublishResult, SupportedPlatform } from "./types"
import { publishToFacebookPage, publishToInstagram } from "./meta-publisher"
import { publishToGoogleBusiness } from "./google-business-publisher"
import { publishToLinkedIn } from "./linkedin-publisher"
import { publishToTwitter } from "./twitter-publisher"
import { publishToTelegram } from "./telegram-publisher"

/**
 * Execute a multi-platform broadcast
 */
export async function executeBroadcast(request: BroadcastRequest): Promise<BroadcastResult> {
    const {
        caption,
        mediaUrl,
        mediaUrls,
        mediaType = "IMAGE",
        linkUrl,
        platforms,
        scheduledAt,
        authorName = "Super Admin"
    } = request

    // 1. Create BroadcastPost entry in database
    const postRecord = await db.broadcastPost.create({
        data: {
            caption,
            mediaUrl: mediaUrl || (mediaUrls && mediaUrls.length > 0 ? mediaUrls[0] : null),
            mediaUrls: mediaUrls && mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
            mediaType,
            linkUrl,
            targetList: platforms.join(","),
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            publishedAt: scheduledAt ? null : new Date(),
            status: scheduledAt ? "SCHEDULED" : "PUBLISHED",
            authorName
        }
    })

    // If scheduled for future, don't publish now
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
        return {
            postId: postRecord.id,
            overallStatus: "SCHEDULED",
            platformResults: []
        }
    }

    // 2. Load connected social accounts
    const socialAccounts = await db.socialAccount.findMany({
        where: {
            platform: { in: platforms },
            isActive: true
        }
    })

    // Also check legacy FacebookSettings table as fallback if FACEBOOK or INSTAGRAM is in target platforms
    const fbLegacySettings = await db.facebookSettings.findFirst()

    const platformResults: PlatformPublishResult[] = []

    // 3. Process each platform
    for (const platform of platforms) {
        const account = socialAccounts.find((a) => a.platform === platform)

        let result: PlatformPublishResult = {
            platform,
            success: false,
            error: "Platform account not configured or inactive"
        }

        // Check if this platform is configured at all — if not, mark as SKIPPED
        const hasConfig = (() => {
            if (platform === "FACEBOOK") return !!(account?.accountId || fbLegacySettings?.pageId) && !!(account?.accessToken || fbLegacySettings?.pageAccessToken)
            if (platform === "INSTAGRAM") return !!(account?.accountId) && !!(account?.accessToken || fbLegacySettings?.pageAccessToken)
            return !!(account?.accessToken || account?.apiKey)
        })()

        if (!hasConfig) {
            await db.broadcastPlatformLog.create({
                data: {
                    broadcastPostId: postRecord.id,
                    platform,
                    status: "SKIPPED",
                    errorMessage: `${platform} account not configured. Go to Social Broadcast → Connected Channels to add credentials.`,
                    attemptedAt: new Date()
                }
            })
            platformResults.push({ platform, success: false, error: "Not configured — skipped" })
            continue
        }

        try {
            switch (platform) {
                case "FACEBOOK": {
                    const pageId = account?.accountId || fbLegacySettings?.pageId
                    const accessToken = account?.accessToken || fbLegacySettings?.pageAccessToken

                    if (pageId && accessToken) {
                        result = await publishToFacebookPage({
                            pageId,
                            accessToken,
                            caption,
                            mediaUrl: mediaUrl || (mediaUrls && mediaUrls[0]),
                            mediaType,
                            linkUrl
                        })
                    } else {
                        result.error = "Facebook Page ID or Access Token is missing. Configure in Social Settings."
                    }
                    break
                }

                case "INSTAGRAM": {
                    const igAccountId = account?.accountId
                    const accessToken = account?.accessToken || fbLegacySettings?.pageAccessToken

                    if (igAccountId && accessToken) {
                        result = await publishToInstagram({
                            instagramAccountId: igAccountId,
                            accessToken,
                            caption,
                            mediaUrl: mediaUrl || (mediaUrls && mediaUrls[0]),
                            mediaType,
                            linkUrl
                        })
                    } else {
                        result.error = "Instagram Business Account ID or Token is missing. Configure in Social Settings."
                    }
                    break
                }

                case "GOOGLE_BUSINESS": {
                    if (account?.accountId && account?.accessToken) {
                        result = await publishToGoogleBusiness({
                            accountId: account.accountId,
                            accessToken: account.accessToken,
                            refreshToken: account.refreshToken,
                            clientId: account.apiKey,
                            clientSecret: account.apiSecret,
                            caption,
                            mediaUrl: mediaUrl || (mediaUrls && mediaUrls[0]),
                            linkUrl
                        })
                    } else {
                        result.error = "Google Business Profile not connected."
                    }
                    break
                }

                case "LINKEDIN": {
                    if (account?.accountId && account?.accessToken) {
                        result = await publishToLinkedIn({
                            authorUrn: account.accountId,
                            accessToken: account.accessToken,
                            caption,
                            mediaUrl: mediaUrl || (mediaUrls && mediaUrls[0]),
                            linkUrl
                        })
                    } else {
                        result.error = "LinkedIn Organization not connected."
                    }
                    break
                }

                case "TWITTER": {
                    const token = account?.accessToken || account?.apiKey
                    if (token) {
                        result = await publishToTwitter({
                            accessToken: token,
                            refreshToken: account?.refreshToken,
                            clientId: account?.apiKey,
                            clientSecret: account?.apiSecret,
                            caption,
                            mediaUrl: mediaUrl || (mediaUrls && mediaUrls[0]),
                            linkUrl
                        })
                    } else {
                        result.error = "X/Twitter token not configured."
                    }
                    break
                }

                case "TELEGRAM": {
                    const botToken = account?.accessToken || account?.apiKey
                    const channelId = account?.accountId
                    if (botToken && channelId) {
                        result = await publishToTelegram({
                            botToken,
                            channelId,
                            caption,
                            mediaUrl: mediaUrl || (mediaUrls && mediaUrls[0]),
                            mediaType,
                            linkUrl
                        })
                    } else {
                        result.error = "Telegram Bot Token or Channel ID is missing."
                    }
                    break
                }

                default:
                    result.error = `Platform ${platform} publisher not implemented yet.`
            }
        } catch (error: any) {
            result.error = error?.message || "Unexpected error during platform publication."
        }

        platformResults.push(result)

        // 4. Save platform delivery log
        await db.broadcastPlatformLog.create({
            data: {
                broadcastPostId: postRecord.id,
                platform,
                status: result.success ? "SUCCESS" : "FAILED",
                externalPostId: result.externalPostId || null,
                externalUrl: result.externalUrl || null,
                errorMessage: result.error || null,
                attemptedAt: new Date()
            }
        })
    }

    // 5. Automatically add post to website StudioPost showcase (Website Feed)
    if (mediaUrl || (mediaUrls && mediaUrls[0])) {
        try {
            await db.studioPost.create({
                data: {
                    type: mediaType === "VIDEO" || mediaType === "REEL" ? "VIDEO" : "IMAGE",
                    url: mediaUrl || mediaUrls![0],
                    caption,
                    link: linkUrl || null,
                    source: "BROADCAST",
                    externalId: `broadcast_${postRecord.id}`,
                    publishedAt: new Date()
                }
            })
        } catch (studioErr) {
            console.error("Auto website showcase sync error:", studioErr)
        }
    }

    // 6. Update overall broadcast post status
    const successCount = platformResults.filter((r) => r.success).length
    const skippedCount = platformResults.filter((r) => r.error === "Not configured — skipped").length
    const attemptedCount = platformResults.length - skippedCount

    let overallStatus: "PUBLISHED" | "PARTIAL" | "FAILED" = "FAILED"

    if (successCount > 0 && successCount === attemptedCount) {
        overallStatus = "PUBLISHED"
    } else if (successCount > 0) {
        overallStatus = "PARTIAL"
    } else if (skippedCount === platformResults.length) {
        // All platforms skipped (none configured) — still save as FAILED with helpful message
        overallStatus = "FAILED"
    } else {
        overallStatus = "FAILED"
    }

    await db.broadcastPost.update({
        where: { id: postRecord.id },
        data: {
            status: overallStatus
        }
    })

    return {
        postId: postRecord.id,
        overallStatus,
        platformResults
    }
}

