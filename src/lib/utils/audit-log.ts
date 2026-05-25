/**
 * audit-log.ts
 * Utility to write AuditLog entries for all sensitive company/admin actions.
 *
 * Usage:
 *   import { createAuditLog } from "@/lib/utils/audit-log"
 *   await createAuditLog({
 *     userId: "clxxxx",
 *     userRole: "COMPANY",
 *     action: "DEALER_APPROVED",
 *     entityType: "User",
 *     entityId: dealerId,
 *     description: `Dealer "${dealerName}" was approved`,
 *     request, // NextRequest — to extract IP
 *   })
 */

import { db } from "@/lib/db"
import type { NextRequest } from "next/server"

export type AuditAction =
    // Dealer lifecycle
    | "DEALER_APPROVED"
    | "DEALER_REJECTED"
    | "DEALER_SUSPENDED"
    | "DEALER_RESTORED"
    // Commission rules
    | "COMMISSION_CREATED"
    | "COMMISSION_UPDATED"
    | "COMMISSION_DELETED"
    // Disputes
    | "DISPUTE_OPENED"
    | "DISPUTE_REVIEWED"
    | "DISPUTE_RESOLVED"
    | "DISPUTE_CLOSED"
    | "DISPUTE_MESSAGE_SENT"
    // Auth / system
    | "ADMIN_LOGIN"
    | "USER_SUSPENDED"
    | "SETTINGS_UPDATED"
    // Generic fallback
    | string

interface CreateAuditLogParams {
    userId: string
    userRole: string
    action: AuditAction
    entityType?: string
    entityId?: string
    description: string
    metadata?: Record<string, unknown>
    request?: NextRequest | Request
}

/**
 * Creates an AuditLog entry. Safe to call — never throws,
 * failures are caught and logged to console only.
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
    try {
        const ip = params.request
            ? (params.request.headers.get("x-forwarded-for") ??
                params.request.headers.get("x-real-ip") ??
                "unknown")
            : undefined

        await db.auditLog.create({
            data: {
                userId: params.userId,
                userRole: params.userRole,
                action: params.action,
                entityType: params.entityType ?? null,
                entityId: params.entityId ?? null,
                description: params.description,
                metadata: params.metadata ? JSON.stringify(params.metadata) : null,
                ipAddress: ip ?? null,
            }
        })
    } catch (error) {
        // Audit log must never crash the main request
        console.error("[AuditLog] Failed to write audit log:", error)
    }
}
