import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { PDIReportData } from '@/components/pdi/pdi-types'
import { join } from 'path'
import { readFileSync } from 'fs'

// Exact color matching the reference
const COLORS = {
    cyan: '#00BCD4',
    black: '#000000',
    white: '#FFFFFF',
    gray: '#666666',
    lightGray: '#F0F0F0',
    darkGray: '#333333',
    border: '#DDDDDD',
}

// Tight, compact styles matching reference exactly
const styles = StyleSheet.create({
    page: {
        padding: 15,
        fontSize: 8,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },
    // Header Section (Cyan banner)
    header: {
        backgroundColor: COLORS.cyan,
        padding: '6 10',
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    companyName: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: COLORS.white,
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 6,
        color: COLORS.white,
        marginTop: 1,
    },
    headerRight: {
        fontSize: 5,
        color: COLORS.white,
        textAlign: 'right',
        lineHeight: 1.2,
    },
    // Title Section
    titleSection: {
        backgroundColor: COLORS.lightGray,
        padding: '4 8',
        marginBottom: 6,
        borderWidth: 0.5,
        borderColor: COLORS.border,
    },
    title: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: COLORS.black,
        textAlign: 'center',
    },
    // Customer & Vehicle Details Grid
    detailsGrid: {
        flexDirection: 'row',
        marginBottom: 8,
        borderWidth: 0.5,
        borderColor: COLORS.border,
    },
    detailsColumnLeft: {
        flex: 1,
        padding: 6,
        borderRightWidth: 0.5,
        borderColor: COLORS.border,
    },
    detailsColumn: {
        flex: 1,
        padding: 6,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    detailLabel: {
        fontSize: 6,
        color: COLORS.gray,
        width: '40%',
    },
    detailValue: {
        fontSize: 7,
        color: COLORS.black,
        width: '60%',
        fontFamily: 'Helvetica-Bold',
    },
    // Inspection Checklist
    checklistTitle: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        backgroundColor: COLORS.lightGray,
        padding: 3,
        marginBottom: 4,
        borderWidth: 0.5,
        borderColor: COLORS.border,
    },
    // Three-column layout
    checklistThreeColumn: {
        flexDirection: 'row',
        gap: 4,
    },
    checklistColumn: {
        flex: 1,
    },
    // Section box
    sectionBox: {
        borderWidth: 0.5,
        borderColor: COLORS.border,
        marginBottom: 4,
    },
    sectionHeader: {
        backgroundColor: COLORS.lightGray,
        padding: 2,
        borderBottomWidth: 0.5,
        borderColor: COLORS.border,
    },
    sectionName: {
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        color: COLORS.black,
    },
    // Table
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightGray,
        borderBottomWidth: 0.5,
        borderColor: COLORS.border,
        paddingVertical: 1,
        paddingHorizontal: 2,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.3,
        borderColor: COLORS.border,
        paddingVertical: 1.5,
        paddingHorizontal: 2,
        minHeight: 12,
    },
    tableCellItem: {
        flex: 1,
        fontSize: 6,
        paddingRight: 2,
    },
    tableCellStatus: {
        width: 10,
        textAlign: 'center',
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
    },
    tableHeaderCell: {
        fontSize: 5,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },
    // Leakage Section
    leakageSection: {
        marginTop: 6,
        borderWidth: 0.5,
        borderColor: COLORS.border,
    },
    leakageHeader: {
        backgroundColor: COLORS.lightGray,
        padding: 3,
        borderBottomWidth: 0.5,
        borderColor: COLORS.border,
    },
    leakageTitle: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: COLORS.black,
    },
    leakageRow: {
        flexDirection: 'row',
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderBottomWidth: 0.3,
        borderColor: COLORS.border,
    },
    leakageItem: {
        flex: 1,
        fontSize: 6,
    },
    leakageStatus: {
        width: 50,
        textAlign: 'right',
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
    },
    // Vehicle Damage Section
    damageSection: {
        marginTop: 8,
        borderWidth: 0.5,
        borderColor: COLORS.border,
        padding: 8,
    },
    damageSectionTitle: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 6,
        textAlign: 'center',
    },
    damageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    damageView: {
        width: '48%',
        marginBottom: 6,
        borderWidth: 0.5,
        borderColor: COLORS.border,
        padding: 4,
    },
    damageViewTitle: {
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 3,
    },
    damageImageContainer: {
        height: 100,
        backgroundColor: COLORS.lightGray,
        borderWidth: 0.5,
        borderColor: COLORS.border,
    },
    damageImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    damageLegend: {
        marginTop: 6,
        padding: 4,
        backgroundColor: COLORS.lightGray,
        borderWidth: 0.5,
        borderColor: COLORS.border,
    },
    damageLegendTitle: {
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
    },
    damageLegendText: {
        fontSize: 5,
        lineHeight: 1.3,
    },
    // Comments Section
    commentsSection: {
        marginTop: 8,
        borderWidth: 0.5,
        borderColor: COLORS.border,
    },
    commentsHeader: {
        backgroundColor: COLORS.lightGray,
        padding: 3,
        borderBottomWidth: 0.5,
        borderColor: COLORS.border,
    },
    commentsTitle: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
    },
    commentsBody: {
        padding: 6,
        minHeight: 30,
    },
    commentsText: {
        fontSize: 7,
        lineHeight: 1.3,
    },
    // Signature Section
    signatureSection: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 15,
    },
    signatureBox: {
        flex: 1,
    },
    signatureLabel: {
        fontSize: 6,
        marginBottom: 2,
        fontFamily: 'Helvetica-Bold',
    },
    signatureLine: {
        borderBottomWidth: 0.5,
        borderColor: COLORS.black,
        paddingTop: 15,
        marginBottom: 2,
    },
    signatureName: {
        fontSize: 6,
        textAlign: 'center',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 10,
        left: 15,
        right: 15,
        borderTopWidth: 1.5,
        borderColor: COLORS.cyan,
        paddingTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerCompany: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: COLORS.cyan,
    },
    footerTagline: {
        fontSize: 5,
        color: COLORS.gray,
    },
    footerRight: {
        fontSize: 5,
        color: COLORS.gray,
        textAlign: 'right',
        lineHeight: 1.2,
    },
})

// Section order as per requirements
const SECTION_ORDER = [
    'Body Exterior & Glass',
    'Wheels & Tyres',
    'Interior & Luggage Compartment',
    'Electrical Controls',
    'Brakes',
    'Engine Compartment',
    'Clutch & Transmission',
    'Exhaust System',
    'Fuel System',
    'Suspension, Underframe & Steering',
    'Road Test',
    'Convenience Items',
]

// Helper function to load vehicle images as base64
function getVehicleImageBase64(filename: string): string {
    try {
        const imagePath = join(process.cwd(), 'public', 'uploads', 'pdi', 'assets', 'vehicles', filename)
        const imageBuffer = readFileSync(imagePath)
        const base64 = imageBuffer.toString('base64')
        const ext = filename.split('.').pop()?.toLowerCase()
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg'
        return `data:${mimeType};base64,${base64}`
    } catch (error) {
        console.error(`Failed to load vehicle image ${filename}:`, error)
        return '' // Return empty string if image fails to load
    }
}

function cleanText(text: string | null | undefined): string {
    if (!text) return ''
    const r = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{2700}-\u{27BF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{25A0}-\u{25FF}\u{2B50}\u{2B06}\u{FE0F}\u{200D}]/gu;
    return text.replace(r, '').trim()
}

export function PDIReportTemplate({ data }: { data: PDIReportData }) {
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        } catch {
            return dateString
        }
    }

    // Sort sections according to order
    const sortedSections = [...data.sections].sort((a, b) => {
        const indexA = SECTION_ORDER.indexOf(a.name)
        const indexB = SECTION_ORDER.indexOf(b.name)
        if (indexA === -1) return 1
        if (indexB === -1) return -1
        return indexA - indexB
    })

    // Split into 3 columns
    const columnCount = 3
    const itemsPerColumn = Math.ceil(sortedSections.length / columnCount)
    const columns = Array.from({ length: columnCount }, (_, i) =>
        sortedSections.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn)
    )

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.companyName}>DETAILING GARAGE</Text>
                        <Text style={styles.tagline}>DETAILING THAT DEFINES LUXURY</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text>PRE-DELIVERY INSPECTION</Text>
                        <Text>CALL: +91 [phone]</Text>
                        <Text>EMAIL: contact@detailinggarage.com</Text>
                    </View>
                </View>

                {/* Title */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>PRE-DELIVERY INSPECTION CHECKLIST</Text>
                </View>

                {/* Customer & Vehicle Details */}
                <View style={styles.detailsGrid}>
                    <View style={styles.detailsColumnLeft}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Date:</Text>
                            <Text style={styles.detailValue}>{formatDate(data.inspection.inspectionDate)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Customer Name:</Text>
                            <Text style={styles.detailValue}>{data.inspection.customerName}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Mobile Number:</Text>
                            <Text style={styles.detailValue}>{data.inspection.customerPhone || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Email Address:</Text>
                            <Text style={styles.detailValue}>{data.inspection.customerEmail || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.detailsColumn}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Vehicle Make:</Text>
                            <Text style={styles.detailValue}>{data.inspection.vehicleMake}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Vehicle Model:</Text>
                            <Text style={styles.detailValue}>{data.inspection.vehicleModel}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Color:</Text>
                            <Text style={styles.detailValue}>{data.inspection.vehicleColor}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Year:</Text>
                            <Text style={styles.detailValue}>{data.inspection.vehicleYear || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Engine Number:</Text>
                            <Text style={styles.detailValue}>{data.inspection.engineNumber || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Chassis Number:</Text>
                            <Text style={styles.detailValue}>{data.inspection.vin || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Odometer (KM):</Text>
                            <Text style={styles.detailValue}>{data.inspection.odometer || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Inspection Checklist - Three Column */}
                <Text style={styles.checklistTitle}>INSPECTION CHECKLIST</Text>

                <View style={styles.checklistThreeColumn}>
                    {columns.map((columnSections, colIndex) => (
                        <View key={colIndex} style={styles.checklistColumn}>
                            {columnSections.map((section) => (
                                <View key={section.name} style={styles.sectionBox}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionName}>{section.name}</Text>
                                    </View>

                                    {/* Table Header */}
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'left', paddingLeft: 2 }]}>
                                            Item
                                        </Text>
                                        <Text style={[styles.tableHeaderCell, { width: 10 }]}>Y</Text>
                                        <Text style={[styles.tableHeaderCell, { width: 10 }]}>X</Text>
                                        <Text style={[styles.tableHeaderCell, { width: 10 }]}>!</Text>
                                    </View>

                                    {/* Items */}
                                    {section.items.map((item, idx) => (
                                        <View key={idx} style={styles.tableRow}>
                                            <Text style={styles.tableCellItem}>{item.label}</Text>
                                            <Text style={styles.tableCellStatus}>
                                                {item.status === 'PASS' ? '✓' : ''}
                                            </Text>
                                            <Text style={styles.tableCellStatus}>
                                                {item.status === 'FAIL' ? '✓' : ''}
                                            </Text>
                                            <Text style={styles.tableCellStatus}>
                                                {item.status === 'WARN' ? '✓' : ''}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Leakage Inspection */}
                {data.leakageItems && data.leakageItems.length > 0 && (
                    <View style={styles.leakageSection}>
                        <View style={styles.leakageHeader}>
                            <Text style={styles.leakageTitle}>LEAKAGE INSPECTION</Text>
                        </View>

                        {/* Header Row */}
                        <View style={[styles.leakageRow, { backgroundColor: COLORS.lightGray }]}>
                            <Text style={[styles.leakageItem, { fontFamily: 'Helvetica-Bold', fontSize: 6 }]}>
                                Item
                            </Text>
                            <Text style={[styles.leakageStatus, { fontFamily: 'Helvetica-Bold', fontSize: 6 }]}>
                                Status
                            </Text>
                        </View>

                        {/* Items */}
                        {data.leakageItems.map((item, idx) => (
                            <View key={idx} style={styles.leakageRow}>
                                <Text style={styles.leakageItem}>{item.label}</Text>
                                <Text style={styles.leakageStatus}>
                                    {item.found ? 'FOUND' : 'NOT FOUND'}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </Page>

            {/* Page 2 - Vehicle Damage */}
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.companyName}>DETAILING GARAGE</Text>
                        <Text style={styles.tagline}>DETAILING THAT DEFINES LUXURY</Text>
                    </View>
                </View>

                {/* Vehicle Damage Section */}
                <View style={styles.damageSection}>
                    <Text style={styles.damageSectionTitle}>VEHICLE DAMAGE INSPECTION</Text>

                    <View style={styles.damageGrid}>
                        {/* Top View */}
                        <View style={styles.damageView}>
                            <Text style={styles.damageViewTitle}>TOP VIEW</Text>
                            <View style={styles.damageImageContainer}>
                                <Image src={getVehicleImageBase64('top-view.png')} style={styles.damageImage} />
                            </View>
                        </View>

                        {/* Side View */}
                        <View style={styles.damageView}>
                            <Text style={styles.damageViewTitle}>SIDE VIEW</Text>
                            <View style={styles.damageImageContainer}>
                                <Image src={getVehicleImageBase64('side-view.png')} style={styles.damageImage} />
                            </View>
                        </View>

                        {/* Interior View */}
                        <View style={styles.damageView}>
                            <Text style={styles.damageViewTitle}>INTERIOR VIEW</Text>
                            <View style={styles.damageImageContainer}>
                                <Image src={getVehicleImageBase64('interior-view.jpg')} style={styles.damageImage} />
                            </View>
                        </View>

                        {/* Boot View */}
                        <View style={styles.damageView}>
                            <Text style={styles.damageViewTitle}>BOOT / LUGGAGE</Text>
                            <View style={styles.damageImageContainer}>
                                <Image src={getVehicleImageBase64('boot-view.jpg')} style={styles.damageImage} />
                            </View>
                        </View>
                    </View>

                    {/* Damage Legend */}
                    <View style={styles.damageLegend}>
                        <Text style={styles.damageLegendTitle}>Damage Codes:</Text>
                        <Text style={styles.damageLegendText}>
                            Exterior: D (Dent), S (Scratch), CH (Chip), CR (Crack){'\n'}
                            Interior: TR (Tear), ST (Stain), SC (Scratch), BR (Broken), NW (Not Working)
                        </Text>
                    </View>

                    {/* Damage List */}
                    {data.damageData && data.damageData.markers.length > 0 && (
                        <View style={{ marginTop: 6 }}>
                            <Text style={[styles.damageLegendTitle, { marginBottom: 3 }]}>
                                Identified Damages:
                            </Text>
                            {data.damageData.markers.map((marker, index) => (
                                <Text key={index} style={[styles.damageLegendText, { marginBottom: 2 }]}>
                                    {index + 1}. {marker.code} - {marker.type} ({marker.severity}) - {marker.view} view
                                    {marker.description && ` - ${marker.description}`}
                                </Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* Comments */}
                <View style={styles.commentsSection}>
                    <View style={styles.commentsHeader}>
                        <Text style={styles.commentsTitle}>Comments / Recommendations</Text>
                    </View>
                    <View style={styles.commentsBody}>
                        <Text style={styles.commentsText}>
                            {cleanText(data.inspection.adminComments) || 'No additional comments.'}
                        </Text>
                    </View>
                </View>

                {/* Signatures */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Vehicle Inspected By:</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureName}>
                            {data.inspection.inspectedBy || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Customer Name / Signature:</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureName}>
                            {data.inspection.customerName}
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.footerCompany}>DETAILING GARAGE</Text>
                        <Text style={styles.footerTagline}>
                            EXPERIENCE TRUE CAR LUXURY WITH OUR DETAILING SERVICES
                        </Text>
                    </View>
                    <View style={styles.footerRight}>
                        <Text>CALL: +91 [phone]</Text>
                        <Text>WEBSITE: WWW.DETAILINGGARAGE.COM</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
