import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { PDIReportData } from '@/components/pdi/pdi-types'
import { join } from 'path'
import { readFileSync } from 'fs'

// Colors
const COLORS = {
    cyan: '#00BCD4',
    black: '#000000',
    white: '#FFFFFF',
    gray: '#444444', // Darker gray for better visibility
    lightGray: '#F5F5F5',
    border: '#999999', // Darker border
    headerBg: '#E0E0E0',
}

// Compact styles
const styles = StyleSheet.create({
    page: {
        padding: 12,
        fontSize: 8,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        borderBottomWidth: 2,
        borderColor: COLORS.cyan,
        paddingBottom: 5,
    },
    logoSection: {
        width: '50%',
    },
    companyName: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        color: COLORS.black,
    },
    tagline: {
        fontSize: 7,
        color: COLORS.cyan,
        marginTop: 2,
        fontFamily: 'Helvetica-Bold',
    },
    headerTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'right',
        color: COLORS.black,
    },

    // Grid Details Section
    gridContainer: {
        marginTop: 3,
        marginBottom: 6,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: COLORS.black,
    },
    gridRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: COLORS.black,
    },
    gridCell: {
        flex: 1,
        padding: 2,
        borderRightWidth: 1,
        borderColor: COLORS.black,
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridLabel: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: COLORS.black,
        marginRight: 2,
        width: '35%',
    },
    gridValue: {
        fontSize: 7,
        fontFamily: 'Helvetica',
        color: COLORS.black,
        flex: 1,
    },

    // Checklist Section
    checklistHeader: {
        backgroundColor: COLORS.lightGray,
        padding: 2,
        marginBottom: 3,
        borderWidth: 1,
        borderColor: COLORS.black,
    },
    checklistTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },

    columnsContainer: {
        flexDirection: 'row',
        gap: 3,
    },
    column: {
        flex: 1,
    },

    // Section Table
    sectionContainer: {
        marginBottom: 3,
        borderWidth: 1,
        borderColor: COLORS.black,
    },
    sectionHeader: {
        backgroundColor: COLORS.lightGray,
        padding: 2,
        borderBottomWidth: 1,
        borderColor: COLORS.black,
    },
    sectionHeaderText: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },

    // Checklist Items
    itemRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: COLORS.border,
        paddingVertical: 0.5,
    },
    itemLabel: {
        flex: 6,
        fontSize: 7,
        paddingLeft: 1,
        paddingRight: 1,
    },
    statusCol: {
        flex: 1,
        fontSize: 8,
        textAlign: 'center',
        borderLeftWidth: 0.5,
        borderColor: COLORS.border,
        fontFamily: 'Helvetica-Bold',
        paddingTop: 0.5,
    },
    headerRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: COLORS.black,
        backgroundColor: '#FAFAFA',
    },

    // Leakage Table (Integrated style)
    leakageContainer: {
        marginTop: 5,
        borderWidth: 1,
        borderColor: COLORS.black,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 15,
        left: 20,
        right: 20,
        borderTopWidth: 1,
        borderColor: COLORS.cyan,
        paddingTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 7,
        color: COLORS.gray,
    }
})

// Column Grouping - Updated to match actual database section names (case-insensitive with trim)
const COL_1_SECTIONS = [
    'Body Exterior Glass',
    'Wheels & Tyres',
    'Interior & Luggage Compartment',
    'Electrical Controls'
]

const COL_2_SECTIONS = [
    'Engine Compartment',
    'Clutch & Transmission',
    'Exhaust System',
    'Fuel System'
]

const COL_3_SECTIONS = [
    'Suspension, Underframe & Steering',
    'Road Test',
    'General steering & handling',
    'Convenience'
]

// Helper to normalize section names for matching (trim whitespace and case-insensitive)
const normalizeSectionName = (name: string): string => name.trim().toLowerCase()

function getVehicleImageBase64(filename: string): string {
    try {
        const imagePath = join(process.cwd(), 'public', 'uploads', 'pdi', 'assets', 'vehicles', filename)
        const imageBuffer = readFileSync(imagePath)
        const base64 = imageBuffer.toString('base64')
        const ext = filename.split('.').pop()?.toLowerCase()
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg'
        return `data:${mimeType};base64,${base64}`
    } catch (error) {
        return ''
    }
}

// Helper function to load branding images as base64
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

function cleanText(text: string | null | undefined): string {
    if (!text) return ''
    const r = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{2700}-\u{27BF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{25A0}-\u{25FF}\u{2B50}\u{2B06}\u{FE0F}\u{200D}]/gu;
    return text.replace(r, '').trim()
}

export function PDIReportTemplate({ data }: { data: PDIReportData }) {
    console.log("Rendering PDF Template with Y-X-! order")
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-GB')
        } catch {
            return dateString
        }
    }

    // Helper to get items for a specific column (case-insensitive matching with trim)
    const getSectionsForColumn = (columnNames: string[]) => {
        const normalizedColumnNames = columnNames.map(normalizeSectionName)
        return data.sections.filter(s => normalizedColumnNames.includes(normalizeSectionName(s.name)))
    }

    // Dynamically distribute sections into 3 columns if not matching predefined names
    const col1 = getSectionsForColumn(COL_1_SECTIONS)
    const col2 = getSectionsForColumn(COL_2_SECTIONS)
    const col3 = getSectionsForColumn(COL_3_SECTIONS)

    // Find any unmapped sections and distribute them evenly across columns
    const mappedNames = [...COL_1_SECTIONS, ...COL_2_SECTIONS, ...COL_3_SECTIONS].map(normalizeSectionName)
    const unmapped = data.sections.filter(s => !mappedNames.includes(normalizeSectionName(s.name)))

    // If there are unmapped sections, distribute them
    if (unmapped.length > 0) {
        console.log('Unmapped sections found:', unmapped.map(s => s.name))
        unmapped.forEach((section, idx) => {
            const colLengths = [col1.length, col2.length, col3.length]
            const minIdx = colLengths.indexOf(Math.min(...colLengths))
            if (minIdx === 0) col1.push(section)
            else if (minIdx === 1) col2.push(section)
            else col3.push(section)
        })
    }

    const renderChecklistTable = (section: any) => {
        // Don't render empty sections
        if (!section.items || section.items.length === 0) return null;

        return (
            <View key={section.name} style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{section.name.toUpperCase()}</Text>
                </View>
                <View style={styles.headerRow}>
                    <Text style={[styles.itemLabel, { fontFamily: 'Helvetica-Bold', textAlign: 'center' }]}>ITEM</Text>
                    <Text style={styles.statusCol}>Y</Text>
                    <Text style={styles.statusCol}>X</Text>
                    <Text style={styles.statusCol}>!</Text>
                </View>
                {section.items.map((item: any, idx: number) => (
                    <View key={idx} style={styles.itemRow}>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                        <Text style={[styles.statusCol, { color: '#008800', fontFamily: 'Helvetica-Bold' }]}>
                            {item.status === 'PASS' ? 'Y' : ''}
                        </Text>
                        <Text style={[styles.statusCol, { color: '#CC0000', fontFamily: 'Helvetica-Bold' }]}>
                            {item.status === 'FAIL' ? 'X' : ''}
                        </Text>
                        <Text style={[styles.statusCol, { color: '#FF8800', fontFamily: 'Helvetica-Bold' }]}>
                            {item.status === 'WARN' ? '!' : ''}
                        </Text>
                    </View>
                ))}
            </View>
        )
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Image */}
                <Image
                    src={getBrandingImageBase64('pdi-header.jpg')}
                    style={{ width: '100%', marginBottom: 5 }}
                />

                {/* Info Grid - The "Boxy" Header */}
                <View style={styles.gridContainer}>
                    {/* Row 1 */}
                    <View style={styles.gridRow}>
                        <View style={styles.gridCell}>
                            <Text style={styles.gridLabel}>Date:</Text>
                            <Text style={styles.gridValue}>{formatDate(data.inspection.inspectionDate)}</Text>
                        </View>
                        <View style={styles.gridCell}>
                            <Text style={styles.gridLabel}>Customer:</Text>
                            <Text style={styles.gridValue}>{data.inspection.customerName}</Text>
                        </View>
                        <View style={styles.gridCell}>
                            <Text style={styles.gridLabel}>Phone:</Text>
                            <Text style={styles.gridValue}>{data.inspection.customerPhone || '-'}</Text>
                        </View>
                    </View>

                    {/* Row 2 */}
                    <View style={styles.gridRow}>
                        <View style={styles.gridCell}>
                            <Text style={styles.gridLabel}>Vehicle:</Text>
                            <Text style={styles.gridValue}>{data.inspection.vehicleMake} {data.inspection.vehicleModel}</Text>
                        </View>
                        <View style={styles.gridCell}>
                            <Text style={styles.gridLabel}>Color:</Text>
                            <Text style={styles.gridValue}>{data.inspection.vehicleColor}</Text>
                        </View>
                        <View style={styles.gridCell}>
                            <Text style={styles.gridLabel}>Year:</Text>
                            <Text style={styles.gridValue}>{data.inspection.vehicleYear || '-'}</Text>
                        </View>
                    </View>

                    {/* Row 3 */}
                    <View style={[styles.gridRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.gridCell}>
                            <Text style={styles.gridLabel}>Engine No:</Text>
                            <Text style={styles.gridValue}>{data.inspection.engineNumber || '-'}</Text>
                        </View>
                        <View style={styles.gridCell}>
                            <Text style={styles.gridLabel}>Chassis:</Text>
                            <Text style={styles.gridValue}>{data.inspection.vin || '-'}</Text>
                        </View>
                        <View style={styles.gridCell}>
                            <Text style={styles.gridLabel}>Odometer:</Text>
                            <Text style={styles.gridValue}>{data.inspection.odometer || '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* Checklist Columns */}
                <View style={styles.checklistHeader}>
                    <Text style={styles.checklistTitle}>INSPECTION CHECKLIST</Text>
                </View>

                <View style={styles.columnsContainer}>
                    {/* Column 1 */}
                    <View style={styles.column}>
                        {col1.map(renderChecklistTable)}
                    </View>

                    {/* Column 2 */}
                    <View style={styles.column}>
                        {col2.map(renderChecklistTable)}
                    </View>

                    {/* Column 3 */}
                    <View style={styles.column}>
                        {col3.map(renderChecklistTable)}

                        {/* Leakage Section appended to Col 3 */}
                        {data.leakageItems && data.leakageItems.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionHeaderText}>LEAKAGE INSPECTION</Text>
                                </View>
                                {data.leakageItems.map((item, idx) => (
                                    <View key={idx} style={styles.itemRow}>
                                        <Text style={styles.itemLabel}>{item.label}</Text>
                                        <Text style={[styles.statusCol, { flex: 3.5, borderLeftWidth: 1, textAlign: 'center', fontSize: 6 }]}>
                                            {item.found ? 'FOUND' : 'NOT FOUND'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Footer Image */}
                <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                }}>
                    <Image
                        src={getBrandingImageBase64('pdi-footer.jpg')}
                        style={{ width: '100%' }}
                    />
                </View>
            </Page>

            {/* Page 2 - Diagrams and Notes */}
            <Page size="A4" style={styles.page}>
                {/* Header Image */}
                <Image
                    src={getBrandingImageBase64('pdi-header.jpg')}
                    style={{ width: '100%', marginBottom: 5 }}
                />

                {/* Same damage logic but cleaner */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {['Top', 'Side', 'Interior', 'Boot'].map((viewName, i) => {
                        const viewKey = viewName.toLowerCase() as 'top' | 'side' | 'interior' | 'boot';
                        const imgName = viewName === 'Boot' ? 'boot-view.jpg' :
                            viewName === 'Top' ? 'top-view.png' :
                                viewName === 'Side' ? 'side-view.png' : 'interior-view.jpg';

                        // Get markers for this view
                        const viewMarkers = data.damageData?.markers.filter(m => m.view === viewKey) || [];

                        return (
                            <View key={i} style={{ width: '49%', marginBottom: 10, borderWidth: 1, borderColor: COLORS.black, position: 'relative' }}>
                                <Text style={{ textAlign: 'center', fontFamily: 'Helvetica-Bold', fontSize: 8, padding: 2, backgroundColor: COLORS.lightGray }}>
                                    {viewName.toUpperCase()} VIEW
                                </Text>
                                <View style={{ position: 'relative', height: 160 }}>
                                    <Image
                                        src={getVehicleImageBase64(imgName)}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />

                                    {/* Render damage markers on top of the image */}
                                    {viewMarkers.map((marker, idx) => {
                                        const markerColor = marker.type === 'scratch' ? '#fbbf24' :
                                            marker.type === 'dent' ? '#f97316' :
                                                marker.type === 'crack' ? '#ef4444' :
                                                    marker.type === 'chip' ? '#a855f7' :
                                                        marker.type === 'rust' ? '#dc2626' :
                                                            marker.type === 'broken' ? '#ec4899' : '#64748b';

                                        return (
                                            <View
                                                key={idx}
                                                style={{
                                                    position: 'absolute',
                                                    left: `${marker.x}%`,
                                                    top: `${marker.y}%`,
                                                    width: 12,
                                                    height: 12,
                                                    marginLeft: -6,
                                                    marginTop: -6,
                                                    borderRadius: 6,
                                                    backgroundColor: markerColor,
                                                    borderWidth: 1.5,
                                                    borderColor: '#FFFFFF',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Text style={{ fontSize: 7, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' }}>
                                                    {idx + 1}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )
                    })}
                </View>

                {/* Damage Table */}
                {data.damageData && data.damageData.markers.length > 0 ? (
                    <View style={{ marginTop: 10, borderWidth: 1, borderColor: COLORS.black }}>
                        <View style={{ padding: 4, backgroundColor: COLORS.lightGray, borderBottomWidth: 1, borderColor: COLORS.black }}>
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>IDENTIFIED DAMAGES</Text>
                        </View>
                        {data.damageData.markers.map((marker, i) => (
                            <View key={i} style={{ padding: 3, borderBottomWidth: 0.5, borderColor: COLORS.border, flexDirection: 'row' }}>
                                <Text style={{ fontSize: 8, width: 20 }}>{i + 1}.</Text>
                                <Text style={{ fontSize: 8, flex: 1 }}>
                                    {marker.code} ({marker.type}) on {marker.view} view - {cleanText(marker.description) || 'No description'}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' }}>
                        <Text style={{ fontSize: 8, textAlign: 'center', color: COLORS.gray }}>No damages marked.</Text>
                    </View>
                )}

                {/* Admin Comments / Recommendations */}
                {data.inspection.adminComments && (
                    <View style={{ marginTop: 15, borderWidth: 1, borderColor: COLORS.black }}>
                        <View style={{ padding: 4, backgroundColor: COLORS.lightGray, borderBottomWidth: 1, borderColor: COLORS.black }}>
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>RECOMMENDATIONS & NOTES</Text>
                        </View>
                        <View style={{ padding: 6 }}>
                            <Text style={{ fontSize: 8, lineHeight: 1.4 }}>{cleanText(data.inspection.adminComments)}</Text>
                        </View>
                    </View>
                )}

                {/* Signatures */}
                <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', gap: 20 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 25 }}>VEHICLE INSPECTED BY (SIGNATURE):</Text>
                        <View style={{ borderBottomWidth: 1, borderColor: COLORS.black }} />
                        {data.inspection.digitalSignature && (
                            <Text style={{ fontSize: 7, textAlign: 'center', marginTop: 4 }}>{data.inspection.digitalSignature}</Text>
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 25 }}>CUSTOMER SIGNATURE:</Text>
                        <View style={{ borderBottomWidth: 1, borderColor: COLORS.black }} />
                        {data.inspection.customerSignature && (
                            <Text style={{ fontSize: 7, textAlign: 'center', marginTop: 4 }}>{data.inspection.customerSignature}</Text>
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 25 }}>CUSTOMER NAME:</Text>
                        <View style={{ borderBottomWidth: 1, borderColor: COLORS.black }} />
                        <Text style={{ fontSize: 7, textAlign: 'center', marginTop: 4 }}>{data.inspection.customerName}</Text>
                    </View>
                </View>

                {/* Footer Image */}
                <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                }}>
                    <Image
                        src={getBrandingImageBase64('pdi-footer.jpg')}
                        style={{ width: '100%' }}
                    />
                </View>
            </Page>

            {/* Vehicle Images Page - Separate dedicated page */}
            {data.images && data.images.length > 0 && (
                <Page size="A4" style={styles.page}>
                    {/* Header */}
                    <Image
                        src={getBrandingImageBase64('pdi-header.jpg')}
                        style={{ width: '100%', marginBottom: 8 }}
                    />

                    {/* Page Title */}
                    <View style={{
                        padding: 5,
                        backgroundColor: COLORS.cyan,
                        marginBottom: 8
                    }}>
                        <Text style={{
                            fontSize: 9,
                            fontFamily: 'Helvetica-Bold',
                            color: COLORS.white,
                            textAlign: 'center'
                        }}>
                            VEHICLE IMAGES — {data.inspection.vehicleMake} {data.inspection.vehicleModel}
                        </Text>
                    </View>

                    {/* All images in a flat 2-col grid with category labels */}
                    {(() => {
                        const categoryLabels: Record<string, string> = {
                            'FRONT_VIEW': 'Front View',
                            'REAR_VIEW': 'Rear View',
                            'LEFT_SIDE': 'Left Side View',
                            'RIGHT_SIDE': 'Right Side View',
                            'INTERIOR': 'Interior',
                            'DASHBOARD': 'Dashboard',
                            'ENGINE': 'Engine',
                            'BOOT_SPACE': 'Boot Space',
                            'STEPNEY': 'Stepney / Spare Wheel',
                            'TYRE_FRONT_LEFT': 'Tyre - Front Left',
                            'TYRE_FRONT_RIGHT': 'Tyre - Front Right',
                            'TYRE_REAR_LEFT': 'Tyre - Rear Left',
                            'TYRE_REAR_RIGHT': 'Tyre - Rear Right',
                            'UNDERBODY': 'Underbody',
                            'OTHER': 'Other Images'
                        }

                        return (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {data.images.map((img, idx) => {
                                    try {
                                        let imagePath = img.imagePath
                                        if (imagePath.startsWith('/')) imagePath = imagePath.substring(1)
                                        if (imagePath.startsWith('public/')) imagePath = imagePath.substring(7)

                                        const fullPath = join(process.cwd(), 'public', imagePath)
                                        const imageBuffer = readFileSync(fullPath)
                                        const base64 = imageBuffer.toString('base64')
                                        const ext = img.fileName.split('.').pop()?.toLowerCase()
                                        const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
                                        const imageData = `data:${mimeType};base64,${base64}`

                                        return (
                                            <View key={idx} style={{
                                                width: '48%',
                                                marginBottom: 6,
                                                borderWidth: 1,
                                                borderColor: COLORS.border,
                                            }} wrap={false}>
                                                {/* Category Label on top */}
                                                <View style={{
                                                    backgroundColor: COLORS.cyan,
                                                    padding: 3,
                                                }}>
                                                    <Text style={{
                                                        fontSize: 7,
                                                        fontFamily: 'Helvetica-Bold',
                                                        color: COLORS.white
                                                    }}>
                                                        {categoryLabels[img.category] || img.category}
                                                    </Text>
                                                </View>
                                                {/* Image */}
                                                <Image
                                                    src={imageData}
                                                    style={{
                                                        width: '100%',
                                                        height: 120,
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                                {/* Filename */}
                                                <View style={{ padding: 2, backgroundColor: COLORS.lightGray }}>
                                                    <Text style={{ fontSize: 5, color: COLORS.gray, textAlign: 'center' }}>
                                                        {img.fileName.length > 35 ? img.fileName.substring(0, 32) + '...' : img.fileName}
                                                    </Text>
                                                </View>
                                            </View>
                                        )
                                    } catch (error: any) {
                                        console.error(`❌ Failed to load image ${img.fileName}:`, error.message)
                                        return (
                                            <View key={idx} style={{
                                                width: '48%',
                                                marginBottom: 6,
                                                borderWidth: 1,
                                                borderColor: COLORS.border,
                                            }} wrap={false}>
                                                <View style={{
                                                    backgroundColor: COLORS.cyan,
                                                    padding: 3,
                                                }}>
                                                    <Text style={{
                                                        fontSize: 7,
                                                        fontFamily: 'Helvetica-Bold',
                                                        color: COLORS.white
                                                    }}>
                                                        {categoryLabels[img.category] || img.category}
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    width: '100%',
                                                    height: 120,
                                                    backgroundColor: COLORS.lightGray,
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <Text style={{ fontSize: 7, color: COLORS.gray }}>Image not found</Text>
                                                    <Text style={{ fontSize: 5, color: COLORS.gray, marginTop: 2 }}>{img.fileName}</Text>
                                                </View>
                                            </View>
                                        )
                                    }
                                })}
                            </View>
                        )
                    })()}

                    {/* Footer Image */}
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                    }}>
                        <Image
                            src={getBrandingImageBase64('pdi-footer.jpg')}
                            style={{ width: '100%' }}
                        />
                    </View>
                </Page>
            )}
        </Document>
    )
}
