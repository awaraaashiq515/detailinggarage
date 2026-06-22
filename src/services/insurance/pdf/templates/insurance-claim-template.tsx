import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { join } from 'path'
import { readFileSync } from 'fs'

// Types for insurance claim PDF
export interface InsuranceClaimPDFData {
    claim: {
        claimNumber: string
        createdAt: string
        status: string
        source: string

        // Vehicle Details
        vehicleMake: string
        vehicleModel: string
        vehicleVariant?: string
        vehicleYear: string
        vehicleType?: string
        fuelType?: string
        transmissionType?: string
        vehicleColor?: string
        registrationNumber: string
        rcNumber?: string
        registrationDate?: string
        usageType?: string
        odometerReading?: number
        chassisNumber?: string
        engineNumber?: string

        // Insurance Details
        policyNumber: string
        insuranceCompany: string
        policyType?: string
        policyStartDate?: string
        policyEndDate?: string
        policyExpiryDate?: string
        idvValue?: number
        vehicleConditionBefore?: string
        previousAccidentHistory?: string

        // Incident Details
        claimType: string
        incidentDate: string
        incidentLocation: string
        incidentDescription: string
        damageAreas?: string
        estimatedDamage?: number

        // Customer Details (for walk-in)
        customerCity?: string

        // Admin
        adminNotes?: string
        reviewedBy?: string
        reviewedAt?: string
        showWatermark?: boolean

        // Job Details
        invoiceNumber?: string
    }
    customer: {
        name: string
        email?: string
        mobile?: string
    }
    documents?: Array<{
        fileName: string
        fileType: string
        fileUrl: string
        uploadedAt?: string
    }>
}

// ─── Professional Color Palette ────────────────────────────────────────────
const C = {
    // Primary Brand Colors
    primary: '#2563EB',        // Professional Blue
    primaryDark: '#1E40AF',
    primaryLight: '#DBEAFE',

    // Accent Colors
    gold: '#F59E0B',           // Warm Gold
    goldLight: '#FEF3C7',
    goldDark: '#D97706',

    // Neutral Colors
    dark: '#111827',           // Almost Black
    darkGray: '#374151',
    mediumGray: '#6B7280',
    lightGray: '#9CA3AF',

    // Background Colors
    white: '#FFFFFF',
    bgPrimary: '#F9FAFB',
    bgSecondary: '#F3F4F6',
    bgTertiary: '#E5E7EB',

    // Border Colors
    borderLight: '#E5E7EB',
    borderMedium: '#D1D5DB',
    borderDark: '#9CA3AF',

    // Status Colors
    success: '#10B981',
    successBg: '#D1FAE5',
    successBorder: '#6EE7B7',

    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    warningBorder: '#FCD34D',

    danger: '#EF4444',
    dangerBg: '#FEE2E2',
    dangerBorder: '#FCA5A5',

    info: '#3B82F6',
    infoBg: '#DBEAFE',
    infoBorder: '#93C5FD',
}

// ─── Enhanced Styles ────────────────────────────────────────────────────────
// ─── Enhanced Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
    page: {
        paddingTop: 0,
        paddingBottom: 40,
        paddingHorizontal: 0,
        fontSize: 9,
        fontFamily: 'Helvetica',
        backgroundColor: C.white,
    },

    // ── Body Container ────────────────────────────────────────────────
    body: {
        paddingHorizontal: 28,
        paddingTop: 0,
    },

    // ── Header Section ────────────────────────────────────────────────
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 10,
        paddingHorizontal: 28,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: C.primary,
    },
    reportTitle: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: C.dark,
        letterSpacing: 0.5,
    },
    claimBadge: {
        backgroundColor: C.dark,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 2,
    },
    claimBadgeText: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        letterSpacing: 0.5,
    },

    // ── Status Badge ──────────────────────────────────────────────────
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 6,
        paddingHorizontal: 32,
    },
    statusPill: {
        paddingHorizontal: 14,
        paddingVertical: 2,
        borderRadius: 2,
        borderWidth: 1,
    },
    statusPillText: {
        fontSize: 6.5,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },

    // ── Section Container ─────────────────────────────────────────────
    section: {
        marginBottom: 6,
        borderWidth: 1,
        borderColor: C.borderMedium,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.bgSecondary,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: C.borderMedium,
    },
    sectionTitle: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: C.dark,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    sectionBody: {
        flexDirection: 'column',
    },

    // ── Grid Form Fields ──────────────────────────────────────────────
    fieldRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: C.borderLight,
        minHeight: 30,
    },
    fieldRowLast: {
        flexDirection: 'row',
        minHeight: 30,
    },
    fieldCell: {
        flex: 1,
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: C.borderLight,
    },
    fieldCellLast: {
        flex: 1,
        padding: 4,
    },
    fieldLabel: {
        fontSize: 5.5,
        fontFamily: 'Helvetica-Bold',
        color: C.mediumGray,
        textTransform: 'uppercase',
        letterSpacing: 0.2,
        marginBottom: 1,
    },
    fieldValue: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: C.dark,
    },
    fieldValueEmpty: {
        fontSize: 7.5,
        fontFamily: 'Helvetica',
        color: C.lightGray,
    },
    fieldValueHighlight: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: C.primary,
    },

    // ── Text Area Fields ──────────────────────────────────────────────
    textAreaRow: {
        padding: 6,
        borderBottomWidth: 1,
        borderBottomColor: C.borderLight,
    },
    textAreaRowLast: {
        padding: 6,
    },
    textAreaText: {
        fontSize: 8.5,
        lineHeight: 1.5,
        color: C.dark,
        fontFamily: 'Helvetica',
        marginTop: 2,
    },

    // ── Special Styles ─────────────────────────────────────────────
    damageValue: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: C.danger,
    },
    adminNotesRow: {
        padding: 8,
        backgroundColor: C.warningBg,
    },

    // ── Document Grid ───────────────────────────────────────────────
    docGridContainer: {
        padding: 8,
    },
    docRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    docImageBox: {
        width: '48%',
        borderWidth: 1,
        borderColor: C.borderLight,
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
    },
    docImageBoxEmpty: {
        width: '48%',
    },
    docImage: {
        width: '100%',
        height: 180,
        objectFit: 'cover',
    },
    pdfWatermark: {
        position: 'absolute',
        bottom: 40, // Above the caption box
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.65)',
        padding: '4 8',
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: C.gold,
        alignItems: 'flex-end',
    },
    pdfWatermarkTime: {
        color: '#FFFFFF',
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
    },
    pdfWatermarkLoc: {
        color: C.gold,
        fontSize: 5,
        fontFamily: 'Helvetica-Bold',
        marginTop: 1,
    },
    docImageLabel: {
        padding: 5,
        backgroundColor: C.bgSecondary,
        borderTopWidth: 1,
        borderTopColor: C.borderLight,
    },
    docImageType: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: C.primary,
        textTransform: 'uppercase',
    },

    // ── Footer ────────────────────────────────────────────────────────
    footerWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },

    // ── Condensed Terms & Conditions Styles ──────────────────────────
    tcPage: {
        padding: 16,
        paddingBottom: 30,
        backgroundColor: '#FFFFFF',
    },
    tcHeader: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
        borderBottomWidth: 1.5,
        borderBottomColor: '#3B82F6',
        paddingBottom: 3,
        marginBottom: 6,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    tcSection: {
        marginBottom: 4,
    },
    tcSectionTitle: {
        fontSize: 6.5,
        fontFamily: 'Helvetica-Bold',
        color: '#1F2937',
        marginBottom: 2,
        textTransform: 'uppercase',
        backgroundColor: '#F3F4F6',
        padding: '1 4',
        borderLeftWidth: 2,
        borderLeftColor: '#3B82F6',
    },
    tcText: {
        fontSize: 5.5,
        fontFamily: 'Helvetica',
        color: '#374151',
        lineHeight: 1.2,
        textAlign: 'justify',
    },
    tcList: {
        marginLeft: 4,
        marginTop: 1,
    },
    tcListItem: {
        flexDirection: 'row',
        marginBottom: 0.5,
    },
    tcListBullet: {
        width: 6,
        fontSize: 5.5,
    },
    tcListText: {
        flex: 1,
        fontSize: 5.6,
        fontFamily: 'Helvetica',
        color: '#4B5563',
        lineHeight: 1.2,
    },
    checkboxRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 1,
        marginBottom: 2,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    checkbox: {
        width: 6,
        height: 6,
        borderWidth: 0.8,
        borderColor: '#9CA3AF',
        borderRadius: 0.5,
    },
    checkboxLabel: {
        fontSize: 5.2,
        fontFamily: 'Helvetica',
        color: '#374151',
    },
    tcGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderWidth: 0.8,
        borderColor: '#D1D5DB',
        marginTop: 3,
    },
    tcGridItem: {
        width: '50%',
        padding: 2,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E7EB',
        borderRightWidth: 0.5,
        borderRightColor: '#E5E7EB',
    },
    tcGridLabel: {
        fontSize: 4.5,
        fontFamily: 'Helvetica-Bold',
        color: '#6B7280',
        marginBottom: 0.5,
    },
    tcGridValue: {
        fontSize: 6.2,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    tcContent: {
        marginTop: 2,
    },
    tcParagraph: {
        fontSize: 5.5,
        fontFamily: 'Helvetica',
        color: '#4B5563',
        lineHeight: 1.2,
        marginBottom: 2,
    },
    tcSubTitle: {
        fontSize: 5.8,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
        marginBottom: 1,
        marginTop: 1,
    },
    tcBullet: {
        fontSize: 5.5,
        fontFamily: 'Helvetica',
        color: '#4B5563',
        paddingLeft: 4,
        marginBottom: 0.5,
    },
    tcNumber: {
        fontSize: 5.5,
        fontFamily: 'Helvetica',
        color: '#374151',
        marginBottom: 1,
        lineHeight: 1.2,
    },
    tcFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        paddingTop: 4,
        borderTopWidth: 0.8,
        borderTopColor: '#E5E7EB',
    },
    tcSignBox: {
        width: '45%',
    },
    tcSignLine: {
        borderBottomWidth: 0.8,
        borderBottomColor: '#374151',
        marginBottom: 2,
        marginTop: 8,
    },
    tcSignLabel: {
        fontSize: 5.5,
        fontFamily: 'Helvetica-Bold',
        color: '#1F2937',
        textTransform: 'uppercase',
    },
    brandLogoContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    brandLogoText: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        color: '#2563EB',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    brandLogoSubtext: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: '#6B7280',
        letterSpacing: 1,
        marginTop: 2,
    },
})

// ─── Helper Functions ───────────────────────────────────────────────────────

function getBrandingImageBase64(filename: string): string {
    try {
        const imagePath = join(process.cwd(), 'public', 'uploads', 'branding', filename)
        const imageBuffer = readFileSync(imagePath)
        const base64 = imageBuffer.toString('base64')
        const ext = filename.split('.').pop()?.toLowerCase()
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg'
        return `data:${mimeType};base64,${base64}`
    } catch (error) {
        console.error(`Failed to load branding image ${filename}:`, error)
        return ''
    }
}

function getStatusStyle(status: string) {
    switch (status) {
        case 'APPROVED':
        case 'COMPLETED':
            return { bg: C.successBg, border: C.successBorder, text: C.success }
        case 'REJECTED':
            return { bg: C.dangerBg, border: C.dangerBorder, text: C.danger }
        case 'UNDER_REVIEW':
        case 'PENDING_DOCUMENTS':
            return { bg: C.warningBg, border: C.warningBorder, text: C.warning }
        default:
            return { bg: C.infoBg, border: C.infoBorder, text: C.info }
    }
}

function formatCurrency(amount?: number): string {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount)
}

function formatDate(dateString?: string): string {
    if (!dateString) return '-'
    try {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    } catch {
        return dateString
    }
}

function chunkArray<T>(array: T[], size: number): T[][] {
    const chunked: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size))
    }
    return chunked
}

// ─── Reusable Components ────────────────────────────────────────────────────

function Field({
    label,
    value,
    isLast,
    isDamage,
    isHighlight,
    flex = 1
}: {
    label: string
    value: string
    isLast?: boolean
    isDamage?: boolean
    isHighlight?: boolean
    flex?: number
}) {
    const isEmpty = !value || value === '-'

    let valueStyle = s.fieldValue
    if (isDamage) valueStyle = s.damageValue
    else if (isHighlight) valueStyle = s.fieldValueHighlight
    else if (isEmpty) valueStyle = s.fieldValueEmpty

    return (
        <View style={[isLast ? s.fieldCellLast : s.fieldCell, { flex }]}>
            <Text style={s.fieldLabel}>{label}</Text>
            <Text style={valueStyle}>
                {isEmpty ? '—' : value}
            </Text>
        </View>
    )
}

function TCLi({ children }: { children: React.ReactNode }) {
    return (
        <View style={s.tcListItem}>
            <Text style={s.tcListBullet}>•</Text>
            <Text style={s.tcListText}>{children}</Text>
        </View>
    )
}

function TCSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={s.tcSection} wrap={false}>
            <Text style={s.tcSectionTitle}>{title}</Text>
            <View style={{ paddingHorizontal: 4 }}>
                {children}
            </View>
        </View>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={s.section}>
            <View style={s.sectionHeader} wrap={false}>
                <Text style={s.sectionTitle}>{title}</Text>
            </View>
            <View style={s.sectionBody}>
                {children}
            </View>
        </View>
    )
}

// ─── Main PDF Template ──────────────────────────────────────────────────────

export function InsuranceClaimTemplate({ data }: { data: InsuranceClaimPDFData }) {
    const st = getStatusStyle(data.claim.status)

    return (
        <Document title={`Insurance Claim - ${data.claim.claimNumber}`}>
            <Page size="A4" style={s.page} wrap>
                {/* ── Official Letterhead Branding & Company Name ────── */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, marginTop: 30, marginBottom: 20 }}>
                    {/* Brand Logo Text Left */}
                    <View style={[s.brandLogoContainer, { width: '55%' }]}>
                        <Text style={s.brandLogoText}>PARAMHANS</Text>
                        <Text style={[s.brandLogoText, { color: '#1E40AF', marginTop: -2 }]}>AUTO STORE</Text>
                        <Text style={s.brandLogoSubtext}>PREMIUM CAR CARE &amp; INSURANCE APPRAISAL</Text>
                    </View>

                    {/* Company Name Right */}
                    {data.claim.insuranceCompany ? (
                        <View style={{ width: '50%', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primary, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                                Authorized Insurer
                            </Text>
                            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.dark, textTransform: 'uppercase', marginTop: 4, textAlign: 'right', lineHeight: 1.3 }}>
                                {data.claim.insuranceCompany}
                            </Text>
                            <View style={{ width: 40, height: 2, backgroundColor: C.primary, marginTop: 8, alignSelf: 'flex-end' }} />
                        </View>
                    ) : <View style={{ width: '50%' }} />}
                </View>

                {/* ── Title Bar ─────────────────────────────────────── */}
                <View style={s.titleRow}>
                    <Text style={s.reportTitle}>INSURANCE CLAIM REPORT</Text>
                    <View style={s.claimBadge}>
                        <Text style={s.claimBadgeText}>{data.claim.claimNumber}</Text>
                    </View>
                </View>

                {/* ── Status Stripe ─────────────────────────────────── */}
                <View style={s.statusRow}>
                    <View style={[s.statusPill, { backgroundColor: st.bg, borderColor: st.border }]}>
                        <Text style={[s.statusPillText, { color: st.text }]}>
                            {data.claim.status.replace(/_/g, ' ')}
                        </Text>
                    </View>
                </View>

                {/* ── Main Content ──────────────────────────────────── */}
                <View style={s.body}>

                    {/* ── Customer Information ──────────────────────── */}
                    <Section title="Customer Information">
                        <View style={data.claim.customerCity ? s.fieldRow : s.fieldRowLast} wrap={false}>
                            <Field label="Full Name" value={data.customer.name} />
                            <Field label="Email Address" value={data.customer.email || '-'} />
                            <Field label="Mobile Number" value={data.customer.mobile || '-'} isLast />
                        </View>
                        {data.claim.customerCity && (
                            <View style={s.fieldRowLast} wrap={false}>
                                <Field label="City" value={data.claim.customerCity} isLast />
                            </View>
                        )}
                    </Section>

                    {/* ── Vehicle Details ───────────────────────────── */}
                    <Section title="Vehicle Details">
                        {/* Registration Number Header Row */}
                        <View style={[s.fieldRow, { backgroundColor: C.primaryLight, minHeight: 40 }]} wrap={false}>
                            <View style={[s.fieldCell, { borderRightColor: C.primary, flex: 1, borderRightWidth: 1 }]}>
                                <Text style={[s.fieldLabel, { color: C.primaryDark }]}>Registration Number</Text>
                                <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.primary, letterSpacing: 1 }}>
                                    {data.claim.registrationNumber || '—'}
                                </Text>
                            </View>
                            <View style={[s.fieldCellLast, { flex: 1 }]}>
                                <Text style={[s.fieldLabel, { color: C.primaryDark }]}>RC Number</Text>
                                <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.primaryDark, letterSpacing: 0.5 }}>
                                    {data.claim.rcNumber || '—'}
                                </Text>
                            </View>
                        </View>
                        <View style={s.fieldRow} wrap={false}>
                            <Field label="Vehicle Make/Brand" value={data.claim.vehicleMake} />
                            <Field label="Model" value={data.claim.vehicleModel} />
                            <Field label="Model Variant" value={data.claim.vehicleVariant || '-'} />
                            <Field label="Manufacturing Year" value={data.claim.vehicleYear} isLast />
                        </View>
                        <View style={s.fieldRow} wrap={false}>
                            <Field label="Vehicle Type" value={data.claim.vehicleType || '-'} />
                            <Field label="Fuel Type" value={data.claim.fuelType || '-'} />
                            <Field label="Transmission Type" value={data.claim.transmissionType || '-'} />
                            <Field label="Vehicle Color" value={data.claim.vehicleColor || '-'} isLast />
                        </View>
                        <View style={s.fieldRow} wrap={false}>
                            <Field label="Registration Date" value={formatDate(data.claim.registrationDate)} />
                            <Field label="Usage Type" value={data.claim.usageType || '-'} />
                            <Field label="Odometer (KM)" value={data.claim.odometerReading?.toString() || '-'} />
                            <Field label="Vehicle Age" value={(() => {
                                if (!data.claim.registrationDate) return '-'
                                const reg = new Date(data.claim.registrationDate)
                                const now = new Date()
                                const totalMs = now.getTime() - reg.getTime()
                                const years = Math.floor(totalMs / (365.25 * 24 * 60 * 60 * 1000))
                                const months = Math.floor((totalMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))
                                if (years > 0) return `${years} yr ${months} mo`
                                return `${months} months`
                            })()} isLast />
                        </View>
                        <View style={s.fieldRowLast} wrap={false}>
                            <Field label="Chassis Number (VIN)" value={data.claim.chassisNumber || '—'} flex={1.5} />
                            <Field label="Engine Number" value={data.claim.engineNumber || '—'} isLast />
                        </View>
                    </Section>

                    {/* ── Insurance Details ─────────────────────────── */}
                    <Section title="Insurance Details">
                        <View style={s.fieldRow} wrap={false}>
                            <Field label="Insurance Company" value={data.claim.insuranceCompany} flex={1.5} />
                            <Field label="Policy Number" value={data.claim.policyNumber} isHighlight />
                            <Field label="Policy Type" value={data.claim.policyType || '-'} isLast />
                        </View>
                        <View style={s.fieldRow} wrap={false}>
                            <Field label="Start Date" value={formatDate(data.claim.policyStartDate)} />
                            <Field label="End Date" value={formatDate(data.claim.policyEndDate)} />
                            <Field label="Expiry Date" value={formatDate(data.claim.policyExpiryDate)} isLast />
                        </View>
                        <View style={s.fieldRow} wrap={false}>
                            <Field label="Claim Type" value={data.claim.claimType} />
                            <Field label="Estimated Amount" value={formatCurrency(data.claim.estimatedDamage)} isDamage={!!data.claim.estimatedDamage} />
                            <Field label="IDV Value" value={formatCurrency(data.claim.idvValue)} isLast />
                        </View>
                        <View style={s.fieldRowLast} wrap={false}>
                            <Field label="Vehicle Condition Before" value={data.claim.vehicleConditionBefore || '-'} />
                            <Field label="Previous Accident History" value={data.claim.previousAccidentHistory || '-'} isLast />
                        </View>
                    </Section>

                    {/* ── Claim & Incident Details ──────────────────── */}
                    <Section title="Claim & Incident Details">
                        <View style={s.fieldRow} wrap={false}>
                            <Field label="Incident Date" value={formatDate(data.claim.incidentDate)} />
                            <Field label="Location" value={data.claim.incidentLocation || '-'} flex={2} isLast />
                        </View>
                        <View style={s.textAreaRow} wrap={false}>
                            <Text style={s.fieldLabel}>Incident Description</Text>
                            <Text style={s.textAreaText}>{data.claim.incidentDescription}</Text>
                        </View>
                        <View style={s.textAreaRowLast} wrap={false}>
                            <Text style={s.fieldLabel}>Damage Areas</Text>
                            <Text style={s.textAreaText}>{data.claim.damageAreas || 'None specified'}</Text>
                        </View>
                    </Section>


                    {/* ── Admin Notes ───────────────────────────────── */}
                    {data.claim.adminNotes && (
                        <Section title="Admin Recommendations">
                            <View style={s.adminNotesRow} wrap={false}>
                                <Text style={s.textAreaText}>{data.claim.adminNotes}</Text>
                            </View>
                            {data.claim.reviewedBy && (
                                <View style={{ padding: 6, borderTopWidth: 1, borderTopColor: C.borderLight }} wrap={false}>
                                    <Text style={{ fontSize: 7, color: C.mediumGray, fontFamily: 'Helvetica' }}>
                                        Reviewed by {data.claim.reviewedBy} on {formatDate(data.claim.reviewedAt)}
                                    </Text>
                                </View>
                            )}
                        </Section>
                    )}


                    {/* ── Official Declaration (Page 1) ───────────────────────────────── */}


                    {/* ── Attached Documents ────────────────────────── */}
                    {data.documents && data.documents.length > 0 && (
                        <View style={{ marginTop: 8 }}>
                            <View style={[s.sectionHeader, { borderWidth: 1, borderColor: C.borderMedium }]} wrap={false}>
                                <Text style={s.sectionTitle}>ATTACHED DOCUMENTS ({data.documents.length})</Text>
                            </View>

                            <View style={{ paddingTop: 8 }}>
                                {chunkArray(data.documents, 2).map((rowDocs, rowIdx) => (
                                    <View key={rowIdx} style={s.docRow} wrap={false}>
                                        {rowDocs.map((doc, colIdx) => (
                                            <View key={colIdx} style={s.docImageBox}>
                                                <Image src={doc.fileUrl} style={s.docImage} />

                                                {/* Dynamic Watermark Overlay on top of image */}
                                                {data.claim.showWatermark !== false && (
                                                    <View style={s.pdfWatermark}>
                                                        <Text style={s.pdfWatermarkTime}>
                                                            {doc.uploadedAt
                                                                ? new Date(doc.uploadedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })
                                                                : new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })
                                                            }
                                                        </Text>
                                                        <Text style={s.pdfWatermarkLoc}>{data.claim.incidentLocation || 'Location: Not Provided'}</Text>
                                                    </View>
                                                )}

                                                <View style={s.docImageLabel}>
                                                    <Text style={s.docImageType}>{doc.fileType.replace(/_/g, ' ')}</Text>
                                                    {doc.uploadedAt && (
                                                        <Text style={{ fontSize: 6, color: C.mediumGray, fontFamily: 'Helvetica', marginTop: 2 }}>
                                                            Uploaded: {new Date(doc.uploadedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        ))}
                                        {rowDocs.length === 1 && <View style={s.docImageBoxEmpty} />}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* ── Fixed System Metadata Footer (Repeats on every page) ───────────────────────────────── */}
                <View style={s.footerWrap} fixed>
                    <View style={{ paddingHorizontal: 28, paddingBottom: 16 }}>
                        {/* System Metadata */}
                        <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.primary }}>DETAILING GARAGE | INSURANCE APPRAISAL</Text>
                            <Text style={{ fontSize: 7, fontFamily: 'Helvetica', color: C.mediumGray }}>
                                Report ID: {data.claim.claimNumber} | Generated: {new Date().toLocaleDateString('en-GB')}
                            </Text>
                            <Text style={{ fontSize: 7, fontFamily: 'Helvetica', color: C.mediumGray }} render={({ pageNumber, totalPages }) => (
                                `Page ${pageNumber} of ${totalPages}`
                            )} fixed />
                        </View>
                    </View>
                </View>
            </Page>

            {/* ── Page 2: Full Terms & Conditions (Consolidated Single Page) ───────────────────────────────── */}
            <Page size="A4" style={s.tcPage}>
                <Text style={s.tcHeader}>Full Terms &amp; Conditions • Warranty Policy • Authorization</Text>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {/* Column 1 */}
                    <View style={{ flex: 1 }}>
                        <TCSection title="1. SERVICE AUTHORIZATION">
                            <Text style={s.tcText}>

                                1.1 The Customer authorizes Paramhans Auto Store to inspect, repair, service, and replace parts as required for the vehicle.
                                1.2 The Garage may operate, test drive, or move the vehicle for testing, diagnosis, or inspection purposes.
                                1.3 Additional repairs discovered during service will be performed only after Customer approval (verbal, written, or digital).

                            </Text>
                        </TCSection>

                        <TCSection title="2. ESTIMATE & Payment Obligation & Interest Charges">
                            <Text style={s.tcText}>

                                2.1 All repair estimates are approximate and subject to change based on actual work required.
                                2.2 The Customer agrees to pay the full amount mentioned in the final invoice upon completion.
                                2.3 The Garage reserves the right to retain possession of the vehicle until full payment is received.
                                2.4 Accepted payment methods include Cash / UPI / Bank Transfer / Card /Other approved Methods.
                                Full payment for repair work, spare parts, and services must be made at the time of vehicle delivery unless otherwise agreed in writing.
                                2.5 In case payment is not made on the due date, Paramhans Auto Store reserves the right to retain possession of the vehicle until full payment is received.
                                2.6 Any outstanding amount shall attract interest @ 18% per annum (or 1.5% per month) calculated from the invoice due date until full payment is cleared.
                                2.7 The customer shall also be liable to pay any recovery, legal, parking, or storage charges incurred due to delayed payment.
                                2.8 Vehicles remaining unpaid for more than 30 days may be treated as abandoned and handled as per applicable law for recovery of dues.
                                2.9 All legal expenses incurred for recovery of outstanding payments shall be recoverable from the customer.

                            </Text>
                        </TCSection>

                        <TCSection title="3. SPARE PARTS TERMS">
                            <Text style={s.tcText}>

                                3.1 Spare parts may be Genuine, OEM, or Aftermarket depending on availability and customer approval.
                                3.2 Once spare parts are sold and installed, they cannot be returned unless defective.
                                3.3 Electrical parts, sensors, modules, and special-order parts are non-returnable and non-refundable.
                                3.4 Warranty on spare parts is subject to manufacturer terms only.

                            </Text>
                        </TCSection>

                        <TCSection title="4. WARRANTY ON REPAIR WORK">
                            <Text style={s.tcText}>

                                4.1 Paramhans Auto Store provides limited warranty only on repair workmanship, not on misuse, accidents, or external damage.
                                4.2 Warranty does NOT cover:
                                • Accidents
                                • Improper use
                                • Unauthorized repair by third party
                                • Electrical faults not related to repair
                                • Normal wear and tear
                                4.3 Warranty period (if applicable):30 days from invoice date.

                            </Text>
                        </TCSection>

                        <TCSection title="5. VEHICLE STORAGE & DELIVERY">
                            <Text style={s.tcText}>

                                5.1 The Customer must collect the vehicle within 7 days of repair completion notification.
                                5.2 PARKING charges of ₹200 per day may apply after this period.
                                5.3 Paramhans Auto Store is not responsible for vehicles left for more than 30 days.

                            </Text>
                        </TCSection>

                        <TCSection title="6. CUSTOMER RESPONSIBILITY">
                            <Text style={s.tcText}>


                                6.1 Customer confirms vehicle ownership or authorized use.
                                6.2 Customer must disclose all known issues, accident history, and modifications.
                                6.3 The Garage is not responsible for pre-existing faults.

                            </Text>
                        </TCSection>

                        <TCSection title="7. LIABILITY LIMITATION">
                            <Text style={s.tcText}>



                                7.1 Paramhans Auto Store shall not be liable for:
                                • Loss of personal belongings left in vehicle
                                • Pre-existing mechanical or electrical failures
                                • Delays due to spare parts availability
                                • Indirect or consequential damages
                                7.2 Customer is advised to remove valuables before service.


                            </Text>
                        </TCSection>


                        <TCSection title="8. TEST DRIVE & RISK AUTHORIZATION">
                            <Text style={s.tcText}>

                                Customer authorizes Paramhans Auto Store employees to operate the vehicle for testing, diagnosis, and repair verification.


                            </Text>
                        </TCSection>



                        <TCSection title="9. ABANDONED VEHICLES">
                            <Text style={s.tcText}>


                                Vehicles left unpaid or uncollected for more than 30 days may be treated as abandoned and handled as per applicable law to recover dues.



                            </Text>
                        </TCSection>

                        <TCSection title="10. REFUND POLICY">
                            <Text style={s.tcText}>



                                • Labour charges are non-refundable once work is completed.
                                • Spare parts once installed are non-refundable.
                                • Refund only applicable in case of billing error.




                            </Text>
                        </TCSection>



                        <TCSection title="11. FORCE MAJEURE">
                            <Text style={s.tcText}>




                                Paramhans Auto Store shall not be liable for delays caused by events beyond control including:
                                • Natural disasters
                                • Supplier delays
                                • Government restrictions
                                • Strikes or emergencies





                            </Text>
                        </TCSection>

                        <TCSection title="12. GOVERNING LAW & JURISDICTION">
                            <Text style={s.tcText}>





                                These Terms shall be governed by the laws of India.
                                Jurisdiction shall be the courts of DISTRICT MANDI HIMACHAL PRADESH





                            </Text>
                        </TCSection>

                        <TCSection title="13. CUSTOMER ACCEPTANCE">
                            <Text style={s.tcText}>






                                By signing the Job Card / Invoice or authorizing repair, the Customer agrees to all Terms & Conditions.






                            </Text>
                        </TCSection>




                        <TCSection title="WARRANTY COVERAGE">
                            <Text style={s.tcText}>
                                WARRANTY COVERAGE
                                Paramhans Auto Store warrants that the above spare part is free from manufacturing defects under normal use and service conditions during the warranty period.

                            </Text>
                        </TCSection>
                        <TCSection title="This warranty covers">
                            <View style={s.tcList}>
                                <TCLi>Manufacturing defects only</TCLi>
                                <TCLi>Replacement of defective spare part (if approved)</TCLi>
                                <TCLi>Part replacement only (labor charges extra, if applicable)</TCLi>

                            </View>
                        </TCSection>


                        <TCSection title="WARRANTY DOES NOT COVER">
                            <View style={s.tcList}>
                                <TCLi>This warranty shall be void if</TCLi>
                                <TCLi>Damage due to accident, misuse, or negligence</TCLi>
                                <TCLi>Improper installation by unauthorized person</TCLi>
                                <TCLi>Electrical damage, short circuit, water damage</TCLi>
                                <TCLi>Physical damage, breakage, or tampering</TCLi>
                                <TCLi>Racing, overload, or abnormal usage</TCLi>
                                <TCLi>Electrical parts, sensors, modules, and special-order parts may carry no warranty unless specified bymanufacturer. </TCLi>
                            </View>
                        </TCSection>

                        <TCSection title="WARRANTY CLAIM PROCESS">
                            <View style={s.tcList}>
                                <TCLi>Customer must provide:
                                    • Original Invoice • Warranty Card • Vehicle for inspection
                                </TCLi>
                                <TCLi>Inspection and approval will be done by Paramhans Auto Store or Manufacturer.</TCLi>
                                <TCLi>Replacement will be provided only after defect verification.</TCLi>

                            </View>
                        </TCSection>

                        <TCSection title="IMPORTANT TERMS">
                            <View style={s.tcList}>
                                <TCLi>Warranty is non-transferable </TCLi>
                                <TCLi>Warranty covers part replacement only</TCLi>
                                <TCLi>No cash refund under warranty </TCLi>
                                <TCLi>Final decision rests with Paramhans Auto Store</TCLi>

                            </View>
                        </TCSection>

                    </View>

                    {/* Column 2 */}
                    <View style={{ flex: 1.1 }}>
                        <TCSection title="10. JOB / SPARE PART DETAILS">
                            <View style={s.tcGrid}>

                                {/* JOB TYPE */}
                                <View style={[s.tcGridItem, { width: '100%', borderRightWidth: 0 }]}>
                                    <Text style={s.tcGridLabel}>JOB TYPE</Text>
                                    <View style={s.checkboxRow}>
                                        <View style={s.checkboxItem}>
                                            <View style={s.checkbox} />
                                            <Text style={s.checkboxLabel}>Spare Parts Replacement</Text>
                                        </View>
                                        <View style={s.checkboxItem}>
                                            <View style={s.checkbox} />
                                            <Text style={s.checkboxLabel}>Mechanical Repair</Text>
                                        </View>
                                        <View style={s.checkboxItem}>
                                            <View style={s.checkbox} />
                                            <Text style={s.checkboxLabel}>Denting & Painting</Text>
                                        </View>
                                        <View style={s.checkboxItem}>
                                            <View style={s.checkbox} />
                                            <Text style={s.checkboxLabel}>Insurance Claim Repair</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* INVOICE NUMBER */}
                                <View style={s.tcGridItem}>
                                    <Text style={s.tcGridLabel}>INVOICE NUMBER</Text>
                                    <Text style={s.tcGridValue}>{data.claim.invoiceNumber || '-'}</Text>
                                </View>

                                <View style={[s.tcGridItem, { borderRightWidth: 0 }]}>
                                    <Text style={s.tcGridLabel}>INSTALLATION / REPAIR DATE</Text>
                                    <Text style={s.tcGridValue}>-</Text>
                                </View>

                                {/* PART DETAILS */}
                                <View style={s.tcGridItem}>
                                    <Text style={s.tcGridLabel}>PART NAME</Text>
                                    <Text style={s.tcGridValue}>-</Text>
                                </View>

                                <View style={[s.tcGridItem, { borderRightWidth: 0 }]}>
                                    <Text style={s.tcGridLabel}>PART NUMBER</Text>
                                    <Text style={s.tcGridValue}>-</Text>
                                </View>

                                {/* PART TYPE */}
                                <View style={[s.tcGridItem, { width: '100%', borderRightWidth: 0 }]}>
                                    <Text style={s.tcGridLabel}>PART TYPE</Text>
                                    <View style={s.checkboxRow}>
                                        <View style={s.checkboxItem}>
                                            <View style={s.checkbox} />
                                            <Text style={s.checkboxLabel}>Genuine</Text>
                                        </View>
                                        <View style={s.checkboxItem}>
                                            <View style={s.checkbox} />
                                            <Text style={s.checkboxLabel}>OEM</Text>
                                        </View>
                                        <View style={s.checkboxItem}>
                                            <View style={s.checkbox} />
                                            <Text style={s.checkboxLabel}>Aftermarket</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* WARRANTY */}
                                <View style={[s.tcGridItem, { width: '100%', borderRightWidth: 0 }]}>
                                    <Text style={s.tcGridLabel}>WARRANTY PERIOD</Text>
                                    <Text style={s.tcGridValue}>-</Text>
                                </View>

                            </View>
                        </TCSection>
                        <TCSection title="11. WARRANTY COVERAGE">
                            <View style={s.tcContent}>
                                <Text style={s.tcParagraph}>
                                    Paramhans Auto Store warrants that installed spare parts and repair workmanship
                                    are free from manufacturing or workmanship defects under normal vehicle usage
                                    during the warranty period.
                                </Text>

                                <Text style={s.tcSubTitle}>Warranty Includes:</Text>
                                <Text style={s.tcBullet}>• Manufacturing defects in spare parts</Text>
                                <Text style={s.tcBullet}>• Repair workmanship defects</Text>
                                <Text style={s.tcBullet}>• Paint peeling due to workmanship issues (if applicable)</Text>

                                <Text style={s.tcParagraph}>
                                    Warranty remedy shall be limited to repair or replacement only.
                                </Text>
                            </View>
                        </TCSection>


                        <TCSection title="12. DENTING & PAINTING TERMS">
                            <View style={s.tcContent}>
                                <Text style={s.tcNumber}>1. Paint shade matching depends on vehicle age, previous paint condition, and manufacturer variation.</Text>
                                <Text style={s.tcNumber}>2. Minor color variation or texture difference shall not be treated as defect.</Text>
                                <Text style={s.tcNumber}>3. Warranty applies only to paint peeling, cracking, or blistering caused by workmanship.</Text>
                                <Text style={s.tcNumber}>4. Damage due to washing chemicals, accidents, scratches, or environmental factors is not covered.</Text>
                            </View>
                        </TCSection>


                        <TCSection title="13. INSURANCE CLAIM TERMS">
                            <View style={s.tcContent}>
                                <Text style={s.tcNumber}>1. Paramhans Auto Store acts only as a repair facilitator for insurance claims.</Text>
                                <Text style={s.tcNumber}>2. Claim approval amount is solely decided by the Insurance Company and Surveyor.</Text>
                                <Text style={s.tcNumber}>3. Customer agrees to pay:</Text>

                                <View style={{ marginLeft: 12 }}>
                                    <Text style={s.tcBullet}>• Depreciation charges</Text>
                                    <Text style={s.tcBullet}>• Deductibles</Text>
                                    <Text style={s.tcBullet}>• Non-approved repair items</Text>
                                    <Text style={s.tcBullet}>• Betterment charges</Text>
                                </View>

                                <Text style={s.tcNumber}>4. Repair delivery may depend on insurer approval timelines.</Text>
                                <Text style={s.tcNumber}>5. Garage is not responsible for claim rejection or partial approval.</Text>
                            </View>
                        </TCSection>

                        <TCSection title="14. THIRD-PARTY LIABILITY CLAUSE">
                            <View style={s.tcContent}>
                                <Text style={s.tcNumber}>1. Paramhans Auto Store shall not be liable for:</Text>

                                <View style={{ marginLeft: 12 }}>
                                    <Text style={s.tcBullet}>• Pre-existing damages</Text>
                                    <Text style={s.tcBullet}>• Hidden internal defects discovered after repair</Text>
                                    <Text style={s.tcBullet}>• Mechanical or electrical failures unrelated to repair work</Text>
                                    <Text style={s.tcBullet}>• Insurance company decisions</Text>
                                </View>

                                <Text style={s.tcNumber}>2. The Garage is not responsible for loss of personal belongings left inside the vehicle.</Text>
                                <Text style={s.tcNumber}>3. Any third-party parts supplied by customer carry No Warranty from Paramhans Auto Store.</Text>
                                <Text style={s.tcNumber}>4. Liability, if any, shall be limited only to the value of repair invoice.</Text>
                            </View>
                        </TCSection>


                        <TCSection title="15. WARRANTY DOES NOT COVER">
                            <View style={s.tcContent}>
                                <Text style={s.tcBullet}>• Accident or external impact damage</Text>
                                <Text style={s.tcBullet}>• Unauthorized repair/modification</Text>
                                <Text style={s.tcBullet}>• Electrical short circuit or water damage</Text>
                                <Text style={s.tcBullet}>• Normal wear & tear</Text>
                                <Text style={s.tcBullet}>• Improper vehicle use or negligence</Text>
                                <Text style={s.tcBullet}>• Racing, overload, or commercial misuse (unless declared)</Text>

                                <Text style={s.tcParagraph}>
                                    Electrical components and special-order parts may carry manufacturer-only warranty.
                                </Text>
                            </View>
                        </TCSection>


                        <TCSection title="16. WARRANTY CLAIM PROCESS">
                            <View style={s.tcContent}>
                                <Text style={s.tcParagraph}>Customer must provide:</Text>

                                <View style={{ marginLeft: 12 }}>
                                    <Text style={s.tcBullet}>• Original Invoice</Text>
                                    <Text style={s.tcBullet}>• Warranty Card</Text>
                                    <Text style={s.tcBullet}>• Vehicle for inspection</Text>
                                </View>

                                <Text style={s.tcParagraph}>
                                    Repair or replacement will be processed only after defect verification.
                                </Text>
                            </View>
                        </TCSection>


                        <TCSection title="17. IMPORTANT TERMS">
                            <View style={s.tcContent}>
                                <Text style={s.tcBullet}>• Warranty is non-transferable</Text>
                                <Text style={s.tcBullet}>• No cash refund under warranty</Text>
                                <Text style={s.tcBullet}>• Labour charges may apply unless specified</Text>
                                <Text style={s.tcBullet}>• Final decision rests with Paramhans Auto Store</Text>
                            </View>
                        </TCSection>


                        <TCSection title="18. AUTHORIZATION">
                            <View style={s.tcGrid}>
                                <View style={s.tcGridItem}>
                                    <Text style={s.tcGridLabel}>CUSTOMER SIGNATURE</Text>
                                    <Text style={s.tcGridValue}>________________________</Text>
                                </View>

                                <View style={[s.tcGridItem, { borderRightWidth: 0 }]}>
                                    <Text style={s.tcGridLabel}>DATE</Text>
                                    <Text style={s.tcGridValue}>____ / ____ / ______</Text>
                                </View>

                                <View style={s.tcGridItem}>
                                    <Text style={s.tcGridLabel}>AUTHORIZED SIGNATORY</Text>
                                    <Text style={s.tcGridValue}>Paramhans Auto Store</Text>
                                </View>

                                <View style={[s.tcGridItem, { borderRightWidth: 0 }]}>
                                    <Text style={s.tcGridLabel}>STAMP</Text>
                                    <Text style={s.tcGridValue}>________________________</Text>
                                </View>
                            </View>
                        </TCSection>
                    </View>
                </View>


                {/* Footer Metadata */}
                <View style={[s.footerWrap, { paddingBottom: 6 }]} fixed>
                    <View style={{ paddingHorizontal: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 4 }}>
                        <Text style={{ fontSize: 5, color: '#9CA3AF', textAlign: 'center' }}>
                            Paramhans Auto Store | Accredited Insurance Appraiser | District Mandi, Himachal Pradesh
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
