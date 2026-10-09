import { ServicePackagesView } from "@/components/shop/service-packages-view"

export const metadata = {
    title: "Detailing Packages & Services | Shop Billing",
    description: "Manage vehicle-wise detailing packages, washing rates, ceramic coating & labor services",
}

export default function ShopBillingServicesPage() {
    return (
        <ServicePackagesView
            basePath="/shop/billing"
        />
    )
}
