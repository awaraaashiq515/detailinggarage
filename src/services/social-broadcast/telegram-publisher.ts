import { PlatformPublishResult } from "./types"

/**
 * Publish photo/video or text broadcast to Telegram Channel/Group
 */
export async function publishToTelegram({
    botToken,
    channelId, // e.g. "@detailinggarage" or "-100123456789"
    caption,
    mediaUrl,
    mediaType = "IMAGE",
    linkUrl
}: {
    botToken: string
    channelId: string
    caption: string
    mediaUrl?: string
    mediaType?: string
    linkUrl?: string
}): Promise<PlatformPublishResult> {
    const result: PlatformPublishResult = {
        platform: "TELEGRAM",
        success: false
    }

    try {
        if (!botToken || !channelId) {
            result.error = "Telegram Bot Token or Channel ID is missing."
            return result
        }

        const isVideo = mediaType === "VIDEO" || mediaType === "REEL"
        const fullCaption = caption + (linkUrl ? `\n\n🌐 Visit: ${linkUrl}` : "")

        if (mediaUrl) {
            const method = isVideo ? "sendVideo" : "sendPhoto"
            const url = `https://api.telegram.org/bot${botToken}/${method}`
            const bodyPayload: Record<string, any> = {
                chat_id: channelId,
                caption: fullCaption.substring(0, 1024), // Telegram caption limit 1024
                parse_mode: "HTML"
            }

            if (isVideo) {
                bodyPayload.video = mediaUrl
            } else {
                bodyPayload.photo = mediaUrl
            }

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload)
            })

            const data = await res.json()
            if (data.ok) {
                result.success = true
                result.externalPostId = String(data.result?.message_id)
                const cleanChannel = channelId.replace("@", "")
                result.externalUrl = `https://t.me/${cleanChannel}/${data.result?.message_id}`
                return result
            } else {
                result.error = data.description || "Failed to publish to Telegram"
                return result
            }
        }

        // Text only message
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: channelId,
                text: fullCaption,
                parse_mode: "HTML"
            })
        })

        const data = await res.json()
        if (data.ok) {
            result.success = true
            result.externalPostId = String(data.result?.message_id)
            const cleanChannel = channelId.replace("@", "")
            result.externalUrl = `https://t.me/${cleanChannel}/${data.result?.message_id}`
            return result
        } else {
            result.error = data.description || "Failed to send Telegram message"
            return result
        }
    } catch (err: any) {
        result.error = err?.message || "Network error while publishing to Telegram"
        return result
    }
}

