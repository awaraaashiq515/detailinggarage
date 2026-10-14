import { EVInsuranceForm } from "@/components/insurance/ev-insurance-form"

export const metadata = {
    title: "New EV Insurance Claim | Admin Portal",
    description: "Create an Electric Vehicle insurance claim with high-voltage battery and powertrain inspection",
}

export default function AdminEVInsuranceCreatePage() {
    return (
        <div className="min-h-screen bg-[#07090d] rounded-2xl">
            <EVInsuranceForm isShopPortal={false} />
        </div>
    )
}
