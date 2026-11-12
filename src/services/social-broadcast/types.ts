export type SupportedPlatform =
    | "FACEBOOK"
    | "INSTAGRAM"
    | "GOOGLE_BUSINESS"
    | "LINKEDIN"
    | "TWITTER"
    | "YOUTUBE"
    | "TELEGRAM"

export type MediaType = "IMAGE" | "VIDEO" | "REEL" | "CAROUSEL" | "TEXT"

export interface BroadcastRequest {
    caption: string
    mediaUrl?: string
    mediaUrls?: string[]
    mediaType?: MediaType
    linkUrl?: string
    platforms: SupportedPlatform[]
    scheduledAt?: string | null
    authorName?: string
}

export interface PlatformPublishResult {
    platform: SupportedPlatform
    success: boolean
    externalPostId?: string
    externalUrl?: string
    error?: string
}

export interface BroadcastResult {
    postId: string
    overallStatus: "PUBLISHED" | "PARTIAL" | "FAILED" | "SCHEDULED"
    platformResults: PlatformPublishResult[]
}

