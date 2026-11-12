import type { Metadata } from "next"
import PrivacyPolicyClient from "./PrivacyPolicyClient"

export const metadata: Metadata = {
    title: "Privacy Policy | Detailing Garage – Auto Detailing & Protection Studio",
    description: "Read the Privacy Policy of Detailing Garage. Learn how we collect, store, protect, and handle your vehicle details, PDI inspection records, and personal information across our Mandi studios.",
    keywords: [
        "Detailing Garage privacy policy",
        "vehicle data protection",
        "PDI report privacy",
        "auto detailing Mandi HP",
        "car ceramic coating warranty privacy",
        "PPF warranty terms",
        "Detailing Garage terms and policy"
    ],
    openGraph: {
        title: "Privacy Policy | Detailing Garage",
        description: "Official Privacy Policy of Detailing Garage (Mandi, Himachal Pradesh). Transparent handling of vehicle data, inspections, and customer privacy.",
        url: "https://detailinggarage.in/privacy-policy",
        siteName: "Detailing Garage",
        type: "website",
    },
    alternates: {
        canonical: "https://detailinggarage.in/privacy-policy",
    },
}

export default function PrivacyPolicyPage() {
    return <PrivacyPolicyClient />
}

