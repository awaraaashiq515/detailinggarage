"use client"

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import ChallanPDF from './ChallanPDF';

interface Props {
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

const ChallanDownloadButton = ({ vehicle, summary, challans }: Props) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <Button
                size="sm"
                variant="outline"
                className="text-xs border-[#16acd4]/20 text-[#16acd4]"
            >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Download PDF
            </Button>
        );
    }

    return (
        <PDFDownloadLink
            document={
                <ChallanPDF
                    vehicle={vehicle}
                    summary={summary}
                    challans={challans}
                />
            }
            fileName={`challan-report-${vehicle.rc}-${Date.now()}.pdf`}
        >
            {({ loading }) => (
                <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    className="text-xs border-[#16acd4]/20 text-[#16acd4] hover:bg-[#16acd4]/10"
                >
                    {loading ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    {loading ? "Generating..." : "Download PDF"}
                </Button>
            )}
        </PDFDownloadLink>
    );
};

export default ChallanDownloadButton;
