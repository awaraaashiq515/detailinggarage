import type { Metadata } from "next"
import TermsClient from "./TermsClient"

export const metadata: Metadata = {
    title: "Terms of Service | Detailing Garage – Auto Detailing Studio",
    description: "Review the Terms of Service for Detailing Garage. Guidelines regarding vehicle intake, detailing packages, warranties, PDI inspections, and payments in Mandi, HP.",
    alternates: {
        canonical: "https://detailinggarage.in/terms",
    },
}

export default function TermsPage() {
    return <TermsClient />
}

