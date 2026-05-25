import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#16acd4',
        paddingBottom: 20,
        marginBottom: 20,
    },
    brandContainer: {
        flexDirection: 'column',
    },
    brandName: {
        fontSize: 22,
        fontWeight: 'extrabold',
        color: '#111318',
    },
    brandAccent: {
        color: '#16acd4',
    },
    brandSub: {
        fontSize: 8,
        color: '#6b7080',
        marginTop: 2,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    reportInfo: {
        textAlign: 'right',
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111318',
        marginBottom: 4,
    },
    reportDate: {
        fontSize: 9,
        color: '#6b7080',
    },
    vehicleSection: {
        backgroundColor: '#f9fafb',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        border: '1px solid #e5e7eb',
    },
    vehicleItem: {
        flexDirection: 'column',
    },
    vehicleLabel: {
        fontSize: 8,
        color: '#6b7080',
        textTransform: 'uppercase',
        marginBottom: 2,
        fontWeight: 'bold',
    },
    vehicleValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#111318',
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        padding: 10,
        borderRadius: 6,
        border: '1px solid #e5e7eb',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 8,
        color: '#6b7080',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111318',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#111318',
        padding: 8,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    tableHeaderCell: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#ffffff',
        textTransform: 'uppercase',
        paddingHorizontal: 4,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingVertical: 8,
        alignItems: 'center',
    },
    tableCell: {
        fontSize: 8,
        color: '#374151',
        paddingHorizontal: 4,
    },
    statusBadge: {
        fontSize: 7,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    footer: {
        marginTop: 'auto',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 15,
        textAlign: 'center',
    },
    footerText: {
        fontSize: 8,
        color: '#9ca3af',
        marginBottom: 2,
    }
});

interface ChallanPDFProps {
    vehicle: {
        rc: string;
        chassis: string;
        engine: string;
    };
    summary: {
        total: number;
        pending: number;
        paid: number;
        court: number;
        amount: string;
    };
    challans: any[];
}

const ChallanPDF = ({ vehicle, summary, challans }: ChallanPDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.brandContainer}>
                    <Text style={styles.brandName}>
                        Detailing<Text style={styles.brandAccent}>Garage</Text>
                    </Text>
                    <Text style={styles.brandSub}>Premium Vehicle Services & Inspection</Text>
                </View>
                <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>E-CHALLAN REPORT</Text>
                    <Text style={styles.reportDate}>Generated: {new Date().toLocaleString('en-IN')}</Text>
                </View>
            </View>

            {/* Vehicle Info */}
            <View style={styles.vehicleSection}>
                <View style={styles.vehicleItem}>
                    <Text style={styles.vehicleLabel}>RC Number</Text>
                    <Text style={styles.vehicleValue}>{vehicle.rc}</Text>
                </View>
                <View style={styles.vehicleItem}>
                    <Text style={styles.vehicleLabel}>Chassis Number</Text>
                    <Text style={styles.vehicleValue}>{vehicle.chassis}</Text>
                </View>
                <View style={styles.vehicleItem}>
                    <Text style={styles.vehicleLabel}>Engine Number</Text>
                    <Text style={styles.vehicleValue}>{vehicle.engine}</Text>
                </View>
            </View>

            {/* Summary Grid */}
            <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Challans</Text>
                    <Text style={styles.summaryValue}>{summary.total}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Pending</Text>
                    <Text style={styles.summaryValue}>{summary.pending}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>On Court</Text>
                    <Text style={styles.summaryValue}>{summary.court}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Paid</Text>
                    <Text style={styles.summaryValue}>{summary.paid}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Amount</Text>
                    <Text style={styles.summaryValue}>{summary.amount}</Text>
                </View>
            </View>

            {/* Table */}
            <View>
                <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderCell, { width: '10%' }]}>State</Text>
                    <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Challan No.</Text>
                    <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Date</Text>
                    <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Accused</Text>
                    <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Status</Text>
                    <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Amount</Text>
                </View>

                {challans.map((c, i) => {
                    const s = (c.challan_status || c.status || "").toLowerCase();

                    // Standardized Mapping Logic (Sync with Web UI)
                    const isPaid = s.includes("paid") || s === "0" || s === "success"
                    const isOnCourt = s.includes("court") || s.includes("challan to court")
                    const isPending = !isPaid && !isOnCourt

                    const label = isPaid ? "Paid" : isOnCourt ? "On Court" : "Pending"
                    const badgeBg = isPaid ? '#edfff3' : isOnCourt ? '#fef2f2' : '#fff9eb'
                    const badgeColor = isPaid ? '#166534' : isOnCourt ? '#991b1b' : '#92400e'
                    const badgeBorder = isPaid ? '#bbf7d0' : isOnCourt ? '#fecaca' : '#fef3c7'

                    return (
                        <View key={i} style={styles.tableRow} wrap={false}>
                            <Text style={[styles.tableCell, { width: '10%' }]}>{c.state || "—"}</Text>
                            <Text style={[styles.tableCell, { width: '25%', fontFamily: 'Courier', fontSize: 7 }]}>{c.challan_number || "—"}</Text>
                            <Text style={[styles.tableCell, { width: '15%' }]}>{c.challan_date || "—"}</Text>
                            <Text style={[styles.tableCell, { width: '20%' }]}>{c.accused_name || "—"}</Text>
                            <View style={{ width: '20%', paddingHorizontal: 4 }}>
                                <Text style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor: badgeBg,
                                        color: badgeColor,
                                        border: `1px solid ${badgeBorder}`
                                    }
                                ]}>
                                    {label}
                                </Text>
                            </View>
                            <Text style={[styles.tableCell, { width: '10%', fontWeight: 'bold' }]}>
                                ₹{Number(c.amount || 0).toLocaleString('en-IN')}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>This is a computer-generated report and does not require a physical signature.</Text>
                <Text style={styles.footerText}>Generated via DetailingGarage Admin Console</Text>
            </View>
        </Page>
    </Document>
);

export default ChallanPDF;
