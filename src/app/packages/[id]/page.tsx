"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Package,
    ClipboardCheck,
    Shield,
    Sparkles,
    Check,
    Clock,
    DollarSign,
    Loader2,
    AlertCircle,
    ShoppingCart
} from "lucide-react"

interface PackageData {
    id: string
    name: string
    type: "PDI" | "INSURANCE" | "SERVICE"
    description: string
    services: string[]
    price: number
    pdiCount: number
    status: string
}

const typeConfig = {
    PDI: {
        icon: ClipboardCheck,
        label: "PDI Inspection",
        color: "#60a5fa",
        bg: "rgba(59, 130, 246, 0.15)",
        border: "rgba(59, 130, 246, 0.3)",
        gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    },
    INSURANCE: {
        icon: Shield,
        label: "Insurance",
        color: "#4ade80",
        bg: "rgba(34, 197, 94, 0.15)",
        border: "rgba(34, 197, 94, 0.3)",
        gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
    },
    SERVICE: {
        icon: Sparkles,
        label: "Detailing Service",
        color: "#c084fc",
        bg: "rgba(168, 85, 247, 0.15)",
        border: "rgba(168, 85, 247, 0.3)",
        gradient: "linear-gradient(135deg, #a855f7, #9333ea)",
    },
}

export default function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    const [pkg, setPkg] = useState<PackageData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [purchasing, setPurchasing] = useState(false)

    useEffect(() => {
        fetchPackage()
    }, [id])

    const fetchPackage = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/packages/public/${id}`)
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Package not found")
            }

            setPkg(data.package)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handlePurchase = async () => {
        try {
            setPurchasing(true)

            const res = await fetch("/api/user-packages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ packageId: id }),
            })

            const data = await res.json()

            if (res.status === 401) {
                // Not logged in, redirect to login
                router.push(`/login?callbackUrl=/packages/${id}`)
                return
            }

            if (!res.ok) {
                throw new Error(data.error || "Failed to purchase package")
            }

            // Success - redirect to client packages page
            alert("Package purchased successfully!")
            router.push("/client/packages")
        } catch (err: any) {
            alert(err.message)
        } finally {
            setPurchasing(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#16acd4" }} />
                <p style={{ color: "#6b7080" }}>Loading package details...</p>
            </div>
        )
    }

    if (error || !pkg) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-red-400">{error || "Package not found"}</p>
                <Link href="/packages" className="btn-primary">
                    Back to Packages
                </Link>
            </div>
        )
    }

    const config = typeConfig[pkg.type]
    const Icon = config.icon

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
                href="/packages"
                className="inline-flex items-center gap-2 mb-8 transition-opacity hover:opacity-70"
                style={{ color: "#6b7080" }}
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Packages
            </Link>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Header Card */}
                    <div
                        className="rounded-2xl p-6"
                        style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                        {/* Type Badge */}
                        <div className="flex items-center gap-3 mb-4">
                            <span
                                className="p-3 rounded-xl"
                                style={{ background: config.gradient }}
                            >
                                <Icon className="w-6 h-6 text-white" />
                            </span>
                            <span
                                className="text-sm font-semibold px-3 py-1.5 rounded-full uppercase"
                                style={{
                                    backgroundColor: config.bg,
                                    color: config.color,
                                    border: `1px solid ${config.border}`,
                                }}
                            >
                                {config.label}
                            </span>
                        </div>

                        {/* Package Name */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                            {pkg.name}
                        </h1>

                        {/* Description */}
                        <p className="leading-relaxed" style={{ color: "#9ca3af" }}>
                            {pkg.description}
                        </p>
                    </div>

                    {/* Services Card */}
                    <div
                        className="rounded-2xl p-6"
                        style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" style={{ color: "#16acd4" }} />
                            What&apos;s Included
                        </h2>

                        <ul className="space-y-3">
                            {pkg.services.map((service, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                                    style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                                >
                                    <span
                                        className="p-1 rounded-full flex-shrink-0 mt-0.5"
                                        style={{ backgroundColor: "rgba(34, 197, 94, 0.2)" }}
                                    >
                                        <Check className="w-4 h-4" style={{ color: "#4ade80" }} />
                                    </span>
                                    <span style={{ color: "#d8d8d8" }}>{service}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Sidebar - Pricing Card */}
                <div className="lg:col-span-2">
                    <div
                        className="sticky top-24 rounded-2xl p-6"
                        style={{
                            backgroundColor: "#111318",
                            border: "1px solid rgba(255,255,255,0.07)",
                        }}
                    >
                        {/* Price */}
                        <div className="text-center mb-6">
                            <p className="text-sm mb-2" style={{ color: "#6b7080" }}>
                                Package Price
                            </p>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold" style={{ color: "#16acd4" }}>
                                    ${pkg.price.toFixed(2)}
                                </span>
                            </div>
                            <p className="text-sm mt-2" style={{ color: "#6b7080" }}>
                                Includes {pkg.pdiCount} PDIs
                            </p>
                        </div>

                        {/* Divider */}
                        <div
                            className="h-px my-6"
                            style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
                        />

                        {/* Quick Info */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: "rgba(22, 172, 212, 0.15)" }}
                                >
                                    <DollarSign className="w-5 h-5" style={{ color: "#16acd4" }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">One-time Payment</p>
                                    <p className="text-xs" style={{ color: "#6b7080" }}>
                                        No hidden fees
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
                                >
                                    <Clock className="w-5 h-5" style={{ color: "#60a5fa" }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{pkg.pdiCount} PDIs Included</p>
                                    <p className="text-xs" style={{ color: "#6b7080" }}>
                                        Use anytime
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: "rgba(34, 197, 94, 0.15)" }}
                                >
                                    <Check className="w-5 h-5" style={{ color: "#4ade80" }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{pkg.services.length} Services</p>
                                    <p className="text-xs" style={{ color: "#6b7080" }}>
                                        Full access included
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Purchase Button */}
                        <button
                            onClick={handlePurchase}
                            disabled={purchasing}
                            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                            style={{
                                background: "linear-gradient(135deg, #16acd4, #d49510)",
                                color: "#000",
                                boxShadow: "0 4px 20px rgba(22, 172, 212, 0.3)",
                            }}
                        >
                            {purchasing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-5 h-5" />
                                    Purchase Package
                                </>
                            )}
                        </button>

                        <p className="text-xs text-center mt-4" style={{ color: "#6b7080" }}>
                            Secure payment • Instant activation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
