import { EVPDIForm } from "@/components/pdi/ev-pdi-form"

export const metadata = {
    title: "Create EV PDI Inspection | DETAILING GARAGE®",
    description: "Create a new Electric Vehicle Pre-Delivery Inspection report — 150+ Point EV Inspection System",
}

export default function EVPDICreatePage() {
    return (
        <div className="min-h-screen bg-[#07090d]">
            <EVPDIForm />
        </div>
    )
}
