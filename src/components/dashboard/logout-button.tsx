"use client"

import { LogOut } from "lucide-react"

export function LogoutButton() {
    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            window.location.href = "/login"
        } catch {
            window.location.href = "/login"
        }
    }

    return (
        <button
            onClick={handleLogout}
            className="p-2 rounded-xl transition-all hover:bg-red-500/10"
            style={{ color: '#f87171' }}
            title="Logout"
        >
            <LogOut className="w-4 h-4" />
        </button>
    )
}
