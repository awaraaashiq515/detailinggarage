import { EVPDIForm } from "@/components/pdi/ev-pdi-form"

export const metadata = {
    title: "Create EV PDI Inspection | Workshop Portal",
    description: "Create a new Electric Vehicle Pre-Delivery Inspection report",
}

export default function ShopEVPDICreatePage() {
    return (
        <div className="min-h-screen bg-[#07090d] rounded-2xl">
            <EVPDIForm />
        </div>
    )
}
