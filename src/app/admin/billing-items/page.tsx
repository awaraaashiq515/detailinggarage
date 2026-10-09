import { StockInventoryView } from "@/components/shop/stock-inventory-view"

export const metadata = {
    title: "Stock & Inventory | Admin",
    description: "Manage product stock levels, catalog items, and inventory valuation",
}

export default function AdminBillingItemsPage() {
    return (
        <StockInventoryView
            basePath="/admin"
            title="Services & Stock Management"
            subtitle="Predefined catalog, product stock levels, and inventory valuation"
        />
    )
}
