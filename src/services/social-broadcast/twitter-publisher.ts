import { PlatformPublishResult } from "./types"
import { db } from "@/lib/db"

/**
 * Publish a Tweet to X / Twitter via Twitter API v2
 */
export async function publishToTwitter({
    accessToken,
    refreshToken,
    clientId,
    clientSecret,
    caption,
    mediaUrl,
    linkUrl
}: {
    accessToken: string
    refreshToken?: string | null
    clientId?: string | null
    clientSecret?: string | null
    caption: string
    mediaUrl?: string
    linkUrl?: string
}): Promise<PlatformPublishResult> {
    const result: PlatformPublishResult = {
        platform: "TWITTER",
        success: false
    }

    try {
        let activeToken = accessToken
        if (!activeToken) {
            result.error = "Twitter Bearer/OAuth Token is missing."
            return result
        }

        // Twitter character limit handling (280 characters for standard tweet)
        let tweetText = caption
        if (linkUrl) {
            tweetText = `${caption}\n${linkUrl}`
        }

        if (tweetText.length > 280) {
            tweetText = tweetText.substring(0, 276) + "..."
        }

        // Helper to attempt tweet creation
        const attemptPost = async (token: string) => {
            return await fetch("https://api.twitter.com/2/tweets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: tweetText
                })
            })
        }

        let res = await attemptPost(activeToken)
        let data = await res.json()

        // If unauthorized or token expired, attempt auto-refresh using refreshToken & client credentials
        if (res.status === 401 && refreshToken && clientId) {
            console.log("[Twitter] Token expired or 401 received, attempting OAuth 2.0 refresh...")
            try {
                const basicAuth = clientSecret
                    ? Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
                    : undefined

                const refreshRes = await fetch("https://api.twitter.com/2/oauth2/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        ...(basicAuth ? { Authorization: `Basic ${basicAuth}` } : {})
                    },
                    body: new URLSearchParams({
                        grant_type: "refresh_token",
                        refresh_token: refreshToken,
                        client_id: clientId
                    }).toString()
                })

                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json()
                    if (refreshData.access_token) {
                        activeToken = refreshData.access_token
                        const newRefreshToken = refreshData.refresh_token || refreshToken

                        // Persist refreshed tokens in database
                        await db.socialAccount.updateMany({
                            where: { platform: "TWITTER" },
                            data: {
                                accessToken: activeToken,
                                refreshToken: newRefreshToken,
                                lastStatus: "CONNECTED",
                                lastError: null
                            }
                        })
                        console.log("[Twitter] OAuth 2.0 token refreshed & updated in database.")

                        // Retry posting with fresh token
                        res = await attemptPost(activeToken)
                        data = await res.json()
                    }
                } else {
                    const refreshErr = await refreshRes.text()
                    console.error("[Twitter] Failed to refresh token:", refreshErr)
                }
            } catch (refreshErr) {
                console.error("[Twitter] Error during token refresh:", refreshErr)
            }
        }

        if (data.data?.id) {
            result.success = true
            result.externalPostId = data.data.id
            result.externalUrl = `https://twitter.com/i/status/${data.data.id}`
            return result
        } else {
            result.error = data.detail || data.title || JSON.stringify(data) || "Failed to post Tweet on X"
            return result
        }
    } catch (err: any) {
        result.error = err?.message || "Network error while publishing to Twitter"
        return result
    }
}
