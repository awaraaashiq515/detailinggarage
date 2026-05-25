import { getCurrentUser } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"
import { SuperAdminNav } from "./SuperAdminNav"

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser()
    if (!user) redirect("/login")
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") redirect("/unauthorized")

    return (
        <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", background: "#f0f0f0" }}>
            <SuperAdminNav userName={user.name} userRole={user.role} />
            {children}
        </div>
    )
}
