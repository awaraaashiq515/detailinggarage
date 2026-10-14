import { EVInsuranceForm } from "@/components/insurance/ev-insurance-form"

export const metadata = {
    title: "New EV Insurance Claim | Workshop Portal",
    description: "Create an Electric Vehicle insurance claim with high-voltage battery and powertrain inspection",
}

export default function ShopEVInsuranceCreatePage() {
    return (
        <div className="min-h-screen bg-[#07090d] rounded-2xl">
            <EVInsuranceForm isShopPortal={true} />
        </div>
    )
}
