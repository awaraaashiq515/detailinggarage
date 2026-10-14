import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { unlink } from 'fs/promises'
import path from 'path'

type RouteParams = Promise<{ id: string; docId: string }>

/**
 * DELETE - Remove a specific document from an insurance claim
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: RouteParams }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, docId } = await params
        const { db } = await import('@/lib/db')

        const isSuperOrAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
        let isShopOwnerAllowed = false
        let userShopId: string | null = null

        if (user.role === 'SHOP_OWNER') {
            const shop = await db.shop.findUnique({
                where: { ownerUserId: user.userId },
                select: { id: true, hasInsuranceAccess: true }
            })
            if (shop?.hasInsuranceAccess) {
                isShopOwnerAllowed = true
                userShopId = shop.id
            }
        }

        if (!isSuperOrAdmin && !isShopOwnerAllowed) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Find the document and verify it belongs to this claim
        const document = await db.insuranceDocument.findUnique({
            where: { id: docId },
            include: { claim: true }
        })

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }

        if (document.claimId !== id) {
            return NextResponse.json({ error: 'Document does not belong to this claim' }, { status: 403 })
        }

        if (user.role === 'SHOP_OWNER' && document.claim?.shopId && document.claim.shopId !== userShopId) {
            return NextResponse.json({ error: 'Unauthorized for this claim' }, { status: 403 })
        }

        // Delete file from filesystem
        try {
            const filePath = path.join(process.cwd(), 'public', document.fileUrl)
            await unlink(filePath)
        } catch (fsError) {
            // File may not exist on disk, log but don't fail
            console.warn('Could not delete file from disk:', fsError)
        }

        // Delete from database
        await db.insuranceDocument.delete({
            where: { id: docId }
        })

        return NextResponse.json({
            success: true,
            message: 'Document deleted successfully'
        })
    } catch (error: any) {
        console.error('Error deleting document:', error)
        return NextResponse.json({
            error: error.message || 'Failed to delete document'
        }, { status: 500 })
    }
}
