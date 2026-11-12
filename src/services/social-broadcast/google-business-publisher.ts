import { PlatformPublishResult } from "./types"
import { db } from "@/lib/db"

/**
 * Publish a Local Post (What's New / Photo / Update) to Google Business Profile (Maps)
 */
export async function publishToGoogleBusiness({
    accountId, // e.g. "2867120447345251160" or "accounts/{accId}/locations/{locId}"
    accessToken,
    refreshToken,
    clientId,
    clientSecret,
    caption,
    mediaUrl,
    linkUrl
}: {
    accountId: string
    accessToken: string
    refreshToken?: string | null
    clientId?: string | null
    clientSecret?: string | null
    caption: string
    mediaUrl?: string
    linkUrl?: string
}): Promise<PlatformPublishResult> {
    const result: PlatformPublishResult = {
        platform: "GOOGLE_BUSINESS",
        success: false
    }

    try {
        if (!accountId || !accessToken) {
            result.error = "Google Business Location ID or Access Token is missing."
            return result
        }

        let activeToken = accessToken

        // Helper to refresh Google OAuth token if expired
        const refreshGoogleToken = async (): Promise<string | null> => {
            if (!refreshToken || !clientId || !clientSecret) return null
            try {
                console.log("[GoogleBusiness] Refreshing expired OAuth token...")
                const res = await fetch("https://oauth2.googleapis.com/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: clientId,
                        client_secret: clientSecret,
                        refresh_token: refreshToken,
                        grant_type: "refresh_token"
                    }).toString()
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.access_token) {
                        await db.socialAccount.updateMany({
                            where: { platform: "GOOGLE_BUSINESS" },
                            data: {
                                accessToken: data.access_token,
                                lastStatus: "CONNECTED",
                                lastError: null
                            }
                        })
                        console.log("[GoogleBusiness] Token successfully refreshed & stored.")
                        return data.access_token
                    }
                }
            } catch (e) {
                console.error("[GoogleBusiness] Refresh error:", e)
            }
            return null
        }

        // Helper to resolve exact accounts/*/locations/* resource path
        const resolveLocationPath = async (token: string): Promise<string> => {
            if (accountId.includes("accounts/") && accountId.includes("/locations/")) {
                return accountId
            }

            try {
                // 1. Fetch user Google My Business accounts
                const accRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const accData = await accRes.json()

                if (accData.accounts && accData.accounts.length > 0) {
                    const primaryAccount = accData.accounts[0].name // e.g. "accounts/1083948..."

                    // 2. Fetch locations under this account
                    const locRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${primaryAccount}/locations?readMask=name,title,storeCode`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    const locData = await locRes.json()

                    if (locData.locations && locData.locations.length > 0) {
                        // Match with accountId or take first location
                        const matchedLoc = locData.locations.find((l: any) =>
                            l.name.includes(accountId) || (l.storeCode && l.storeCode === accountId)
                        ) || locData.locations[0]

                        const fullPath = `${primaryAccount}/${matchedLoc.name}`
                        console.log("[GoogleBusiness] Resolved location resource path:", fullPath)

                        // Save resolved path to database for next time
                        await db.socialAccount.updateMany({
                            where: { platform: "GOOGLE_BUSINESS" },
                            data: { accountId: fullPath }
                        })

                        return fullPath
                    }

                    // Fallback to primaryAccount/locations/{accountId}
                    return `${primaryAccount}/locations/${accountId}`
                }
            } catch (resolveErr) {
                console.warn("[GoogleBusiness] Auto-resolution failed, falling back to direct ID:", resolveErr)
            }

            return accountId.startsWith("locations/") ? accountId : `locations/${accountId}`
        }

        let fullLocationPath = await resolveLocationPath(activeToken)
        const url = `https://mybusiness.googleapis.com/v4/${fullLocationPath}/localPosts`

        const localPostPayload: Record<string, any> = {
            languageCode: "en-US",
            summary: caption.length > 1500 ? caption.substring(0, 1497) + "..." : caption,
            topicType: "STANDARD"
        }

        if (linkUrl) {
            localPostPayload.callToAction = {
                actionType: "LEARN_MORE",
                url: linkUrl
            }
        }

        if (mediaUrl) {
            localPostPayload.media = [
                {
                    mediaFormat: "PHOTO",
                    sourceUrl: mediaUrl
                }
            ]
        }

        const executePost = async (token: string, targetUrl: string) => {
            return await fetch(targetUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(localPostPayload)
            })
        }

        let res = await executePost(activeToken, url)

        // Handle 401 Unauthorized via auto-refresh
        if (res.status === 401) {
            const newToken = await refreshGoogleToken()
            if (newToken) {
                activeToken = newToken
                fullLocationPath = await resolveLocationPath(activeToken)
                res = await executePost(activeToken, `https://mybusiness.googleapis.com/v4/${fullLocationPath}/localPosts`)
            }
        }

        const data = await res.json()
        if (data.name || data.localPostId) {
            result.success = true
            result.externalPostId = data.localPostId || data.name
            result.externalUrl = data.searchUrl || "https://business.google.com"
            return result
        } else {
            result.error = data.error?.message || JSON.stringify(data.error) || "Failed to publish to Google Business Profile"
            return result
        }
    } catch (err: any) {
        result.error = err?.message || "Network error while publishing to Google Business"
        return result
    }
}
