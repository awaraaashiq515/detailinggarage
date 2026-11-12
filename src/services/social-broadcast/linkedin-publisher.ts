import { PlatformPublishResult } from "./types"

/**
 * Publish post to LinkedIn Organization or Personal Profile via LinkedIn REST API
 */
export async function publishToLinkedIn({
    authorUrn, // e.g. "urn:li:organization:123456" or "urn:li:person:abcdef"
    accessToken,
    caption,
    mediaUrl,
    linkUrl
}: {
    authorUrn: string
    accessToken: string
    caption: string
    mediaUrl?: string
    linkUrl?: string
}): Promise<PlatformPublishResult> {
    const result: PlatformPublishResult = {
        platform: "LINKEDIN",
        success: false
    }

    try {
        if (!authorUrn || !accessToken) {
            result.error = "LinkedIn Author URN or Access Token is missing."
            return result
        }

        // Using LinkedIn Community Management / UGC Post API
        const url = "https://api.linkedin.com/v2/ugcPosts"

        const postBody: any = {
            author: authorUrn.startsWith("urn:li:") ? authorUrn : `urn:li:organization:${authorUrn}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: caption + (linkUrl ? `\n\n${linkUrl}` : "")
                    },
                    shareMediaCategory: mediaUrl ? "ARTICLE" : "NONE"
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }

        if (mediaUrl || linkUrl) {
            postBody.specificContent["com.linkedin.ugc.ShareContent"].media = [
                {
                    status: "READY",
                    originalUrl: linkUrl || mediaUrl,
                    title: {
                        text: "Detailing Garage Studio"
                    }
                }
            ]
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                "X-Restli-Protocol-Version": "2.0.0"
            },
            body: JSON.stringify(postBody)
        })

        const data = await res.json()
        if (data.id) {
            result.success = true
            result.externalPostId = data.id
            result.externalUrl = `https://www.linkedin.com/feed/update/${data.id}`
            return result
        } else {
            result.error = data.message || "Failed to publish post to LinkedIn"
            return result
        }
    } catch (err: any) {
        result.error = err?.message || "Network error while publishing to LinkedIn"
        return result
    }
}

