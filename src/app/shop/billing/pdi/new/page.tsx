import { PDIForm } from "@/components/pdi/pdi-form"

export const metadata = {
    title: "Create PDI Inspection | Workshop Portal",
    description: "Create a new Pre-Delivery Inspection report",
}

export default function ShopPDICreatePage() {
    return (
        <div className="min-h-screen bg-slate-50 rounded-2xl p-2 sm:p-4 text-slate-900">
            <PDIForm />
        </div>
    )
}
