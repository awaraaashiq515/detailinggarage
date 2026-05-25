import { PDIForm } from "@/components/pdi/pdi-form"

export const metadata = {
    title: "Create PDI Inspection | Admin",
    description: "Create a new Pre-Delivery Inspection report",
}

export default function AdminPDICreatePage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <PDIForm />
        </div>
    )
}
