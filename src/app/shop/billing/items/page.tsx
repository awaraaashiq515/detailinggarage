import { StockInventoryView } from "@/components/shop/stock-inventory-view"

export const metadata = {
    title: "Stock & Inventory | Shop Billing",
    description: "Manage product stock levels, pricing, purchase rates, and billing items",
}

export default function ShopBillingItemsPage() {
    return (
        <StockInventoryView
            basePath="/shop/billing"
            title="Stock & Inventory Management"
            subtitle="Manage product stocks, purchase rates, low stock alerts & billing items"
        />
    )
}
