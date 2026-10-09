import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

// GET shop billing profile
export async function GET(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        let targetShopId = ctx.shopId

        // Admin can view any shop's profile if passed
        if (ctx.isAdmin) {
            const queryShopId = searchParams.get("shopId")
            if (queryShopId) targetShopId = queryShopId
        }

        if (!targetShopId) {
            return NextResponse.json({ error: "No shop associated with account" }, { status: 404 })
        }

        let shop = await db.shop.findUnique({
            where: { id: targetShopId },
            include: { billingProfile: true }
        })

        if (!shop) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 })
        }

        // If billing profile doesn't exist yet, create default
        if (!shop.billingProfile) {
            const newProfile = await db.shopBillingProfile.create({
                data: {
                    shopId: shop.id,
                    businessName: shop.name || "My Business",
                    phone: shop.phone,
                    email: shop.email,
                    address: shop.address,
                    city: shop.city,
                    state: shop.state,
                    gstin: shop.gstin,
                    logoUrl: shop.logoUrl,
                }
            })
            shop = { ...shop, billingProfile: newProfile }
        }

        return NextResponse.json({
            success: true,
            shop,
            profile: shop.billingProfile,
        })
    } catch (error: any) {
        console.error("Error fetching shop billing profile:", error)
        return NextResponse.json({ error: error?.message || "Failed to fetch profile" }, { status: 500 })
    }
}

// PUT update shop billing profile
export async function PUT(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            shopId: overrideShopId,
            businessName,
            tagline,
            logoUrl,
            phone,
            altPhone,
            email,
            website,
            address,
            city,
            state,
            pinCode,
            country,
            gstin,
            pan,
            bankName,
            accountName,
            accountNumber,
            ifscCode,
            upiId,
            defaultNotes,
            defaultTerms,
            signatureUrl,
        } = body

        let targetShopId = ctx.shopId
        if (ctx.isAdmin && overrideShopId) {
            targetShopId = overrideShopId
        }

        if (!targetShopId) {
            return NextResponse.json({ error: "No shop specified" }, { status: 400 })
        }

        // Verify shop exists
        const existingShop = await db.shop.findUnique({
            where: { id: targetShopId },
            include: { billingProfile: true }
        })

        if (!existingShop) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 })
        }

        // Build dynamic update payload so partial updates (e.g. defaultNotes / defaultTerms) preserve other fields
        const updateData: any = {}
        if (businessName !== undefined) updateData.businessName = businessName.trim() || existingShop.name
        if (tagline !== undefined) updateData.tagline = tagline || null
        if (logoUrl !== undefined) updateData.logoUrl = logoUrl || null
        if (phone !== undefined) updateData.phone = phone || null
        if (altPhone !== undefined) updateData.altPhone = altPhone || null
        if (email !== undefined) updateData.email = email || null
        if (website !== undefined) updateData.website = website || null
        if (address !== undefined) updateData.address = address || null
        if (city !== undefined) updateData.city = city || null
        if (state !== undefined) updateData.state = state || null
        if (pinCode !== undefined) updateData.pinCode = pinCode || null
        if (country !== undefined) updateData.country = country || "India"
        if (gstin !== undefined) updateData.gstin = gstin || null
        if (pan !== undefined) updateData.pan = pan || null
        if (bankName !== undefined) updateData.bankName = bankName || null
        if (accountName !== undefined) updateData.accountName = accountName || null
        if (accountNumber !== undefined) updateData.accountNumber = accountNumber || null
        if (ifscCode !== undefined) updateData.ifscCode = ifscCode || null
        if (upiId !== undefined) updateData.upiId = upiId || null
        if (defaultNotes !== undefined) updateData.defaultNotes = defaultNotes
        if (defaultTerms !== undefined) updateData.defaultTerms = defaultTerms
        if (signatureUrl !== undefined) updateData.signatureUrl = signatureUrl || null

        // Upsert billing profile
        const updatedProfile = await db.shopBillingProfile.upsert({
            where: { shopId: targetShopId },
            update: updateData,
            create: {
                shopId: targetShopId,
                businessName: businessName?.trim() || existingShop.name || "My Business",
                tagline: tagline ?? null,
                logoUrl: logoUrl ?? null,
                phone: phone ?? null,
                altPhone: altPhone ?? null,
                email: email ?? null,
                website: website ?? null,
                address: address ?? null,
                city: city ?? null,
                state: state ?? null,
                pinCode: pinCode ?? null,
                country: country || "India",
                gstin: gstin ?? null,
                pan: pan ?? null,
                bankName: bankName ?? null,
                accountName: accountName ?? null,
                accountNumber: accountNumber ?? null,
                ifscCode: ifscCode ?? null,
                upiId: upiId ?? null,
                defaultNotes: defaultNotes ?? null,
                defaultTerms: defaultTerms ?? null,
                signatureUrl: signatureUrl ?? null,
            }
        })

        // Also sync basic information onto Shop table if provided
        const shopUpdateData: any = {}
        if (businessName !== undefined) shopUpdateData.name = businessName.trim() || existingShop.name
        if (phone !== undefined) shopUpdateData.phone = phone || null
        if (email !== undefined) shopUpdateData.email = email || null
        if (address !== undefined) shopUpdateData.address = address || null
        if (city !== undefined) shopUpdateData.city = city || null
        if (state !== undefined) shopUpdateData.state = state || null
        if (gstin !== undefined) shopUpdateData.gstin = gstin || null
        if (logoUrl !== undefined) shopUpdateData.logoUrl = logoUrl || null

        const updatedShop = Object.keys(shopUpdateData).length > 0
            ? await db.shop.update({
                where: { id: targetShopId },
                data: shopUpdateData,
            })
            : existingShop

        return NextResponse.json({
            success: true,
            message: "Shop profile updated successfully",
            profile: updatedProfile,
            shop: updatedShop,
        })
    } catch (error: any) {
        console.error("Error updating shop billing profile:", error)
        return NextResponse.json({ error: error?.message || "Failed to update profile" }, { status: 500 })
    }
}

export const PATCH = PUT

