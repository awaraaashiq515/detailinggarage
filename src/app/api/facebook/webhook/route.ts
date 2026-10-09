import { NextResponse } from "next/server"
import { getFacebookSettings, processFacebookWebhookPayload } from "@/services/facebook-sync.service"

/**
 * Facebook Webhook Verification (GET)
 * Meta calls this endpoint when configuring or validating Webhooks for Page feed.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const mode = searchParams.get("hub.mode")
        const token = searchParams.get("hub.verify_token")
        const challenge = searchParams.get("hub.challenge")

        if (!mode || !token) {
            return new Response("Missing parameters", { status: 400 })
        }

        const settings = await getFacebookSettings()
        const configuredToken = settings.webhookVerifyToken || "dg_fb_webhook_token_secure_2026"

        if (mode === "subscribe" && token === configuredToken) {
            console.log("Facebook Webhook verified successfully!")
            return new Response(challenge || "OK", {
                status: 200,
                headers: { "Content-Type": "text/plain" }
            })
        } else {
            console.warn("Facebook Webhook verification failed. Token mismatch.", {
                provided: token,
                expected: configuredToken
            })
            return new Response("Forbidden: Verify token mismatch", { status: 403 })
        }
    } catch (error: any) {
        console.error("Facebook webhook GET error:", error)
        return new Response("Internal Server Error", { status: 500 })
    }
}

/**
 * Facebook Webhook Event Receiver (POST)
 * Triggered automatically in real-time when new posts, photos or videos are published on the Facebook Page!
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Verify that this is an event from a page
        if (body.object === "page") {
            // Process the webhook payload asynchronously
            const result = await processFacebookWebhookPayload(body)
            return NextResponse.json({ status: "EVENT_RECEIVED", result }, { status: 200 })
        }

        return NextResponse.json({ status: "IGNORED_NON_PAGE_EVENT" }, { status: 200 })
    } catch (error: any) {
        console.error("Facebook webhook POST error:", error)
        return NextResponse.json({ error: error.message || "Failed to process webhook" }, { status: 500 })
    }
}
