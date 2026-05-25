"use client"

import { useState, useEffect } from "react"
import { Heart, Loader2 } from "lucide-react"

interface WishlistButtonProps {
    vehicleId: string
    variant?: "icon" | "full"
    className?: string
}

export function WishlistButton({ vehicleId, variant = "icon", className = "" }: WishlistButtonProps) {
    const [isInWishlist, setIsInWishlist] = useState(false)
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/wishlist/check?vehicleId=${vehicleId}`)
                const data = await res.json()
                setIsInWishlist(data.isInWishlist)
            } catch (error) {
                console.error("Error checking wishlist status:", error)
            } finally {
                setLoading(false)
            }
        }
        checkStatus()
    }, [vehicleId])

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setToggling(true)
        try {
            const res = await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vehicleId })
            })

            if (res.status === 401) {
                window.location.href = "/login?callbackUrl=" + window.location.pathname
                return
            }

            const data = await res.json()
            if (data.status === "added") {
                setIsInWishlist(true)
            } else if (data.status === "removed") {
                setIsInWishlist(false)
            }
        } catch (error) {
            console.error("Error toggling wishlist:", error)
        } finally {
            setToggling(false)
        }
    }

    if (loading) {
        return (
            <div className={`p-2.5 rounded-xl bg-slate-100 border border-slate-200 ${className}`}>
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
        )
    }

    if (variant === "full") {
        return (
            <button
                onClick={handleToggle}
                disabled={toggling}
                className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${isInWishlist
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600"
                    } ${className}`}
            >
                {toggling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Heart className={`w-4 h-4 ${isInWishlist ? "fill-red-600 text-red-600" : ""}`} />
                )}
                {isInWishlist ? "Saved" : "Add to Wishlist"}
            </button>
        )
    }

    return (
        <button
            onClick={handleToggle}
            disabled={toggling}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isInWishlist
                ? "bg-red-50 border border-red-100 text-red-600 shadow-sm"
                : "bg-white border border-slate-200 text-slate-400 hover:border-indigo-600 hover:text-indigo-600 shadow-sm"
                } ${className}`}
        >
            {toggling ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
                <Heart className={`w-4 h-4 ${isInWishlist ? "fill-red-600 text-red-600" : ""}`} />
            )}
        </button>
    )
}
