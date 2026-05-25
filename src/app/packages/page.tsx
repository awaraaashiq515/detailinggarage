"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Package,
    ClipboardCheck,
    Shield,
    Sparkles,
    Check,
    ArrowRight,
    Loader2,
    AlertCircle
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

type FilterType = "ALL" | "PDI" | "INSURANCE" | "SERVICE"

export default function PackagesPage() {
    const [packages, setPackages] = useState<PackageData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeFilter, setActiveFilter] = useState<FilterType>("ALL")

    useEffect(() => {
        fetchPackages()
    }, [])

    const fetchPackages = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/packages/public")
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to load packages")
            }

            setPackages(data.packages)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredPackages = packages.filter(
        pkg => activeFilter === "ALL" || pkg.type === activeFilter
    )

    const filters: { key: FilterType; label: string }[] = [
        { key: "ALL", label: "All Packages" },
        { key: "PDI", label: "PDI" },
        { key: "INSURANCE", label: "Insurance" },
        { key: "SERVICE", label: "Services" },
    ]

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#16acd4" }} />
                <p style={{ color: "#6b7080" }}>Loading packages...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-red-400">{error}</p>
                <button onClick={fetchPackages} className="btn-primary">
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div>
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Choose Your <span style={{ color: "#16acd4" }}>Package</span>
                </h1>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: "#6b7080" }}>
                    Select from our range of professional PDI inspections, insurance services,
                    and premium car detailing packages.
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                        style={
                            activeFilter === filter.key
                                ? {
                                    background: "linear-gradient(135deg, #16acd4, #d49510)",
                                    color: "#000",
                                    boxShadow: "0 4px 20px rgba(22, 172, 212, 0.3)",
                                }
                                : {
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    color: "#d8d8d8",
                                }
                        }
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Package Count */}
            <p className="text-center mb-8" style={{ color: "#6b7080" }}>
                Showing {filteredPackages.length} package{filteredPackages.length !== 1 ? "s" : ""}
            </p>

            {/* Packages Grid */}
            {filteredPackages.length === 0 ? (
                <div
                    className="text-center py-16 rounded-2xl"
                    style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                    <Package className="w-16 h-16 mx-auto mb-4" style={{ color: "#6b7080" }} />
                    <h3 className="text-lg font-medium text-white mb-2">No packages available</h3>
                    <p style={{ color: "#6b7080" }}>
                        Please check back later for new packages
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPackages.map((pkg) => {
                        const config = typeConfig[pkg.type]
                        const Icon = config.icon

                        return (
                            <div
                                key={pkg.id}
                                className="group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                                style={{
                                    backgroundColor: "#111318",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                }}
                            >
                                {/* Type Badge */}
                                <div className="flex items-center gap-2 mb-4">
                                    <span
                                        className="p-2 rounded-lg"
                                        style={{ background: config.gradient }}
                                    >
                                        <Icon className="w-5 h-5 text-white" />
                                    </span>
                                    <span
                                        className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase"
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
                                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>

                                {/* Description */}
                                <p className="text-sm mb-5 line-clamp-2" style={{ color: "#6b7080" }}>
                                    {pkg.description}
                                </p>

                                {/* Price */}
                                <div className="flex items-baseline gap-1 mb-5">
                                    <span className="text-3xl font-bold" style={{ color: "#16acd4" }}>
                                        ${pkg.price.toFixed(2)}
                                    </span>
                                    <span className="text-sm" style={{ color: "#6b7080" }}>
                                        / {pkg.pdiCount} PDIs
                                    </span>
                                </div>

                                {/* Services Preview */}
                                <div className="mb-6">
                                    <p className="text-xs font-medium mb-3" style={{ color: "#6b7080" }}>
                                        What&apos;s included:
                                    </p>
                                    <ul className="space-y-2">
                                        {pkg.services.slice(0, 4).map((service, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm">
                                                <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#4ade80" }} />
                                                <span style={{ color: "#d8d8d8" }}>{service}</span>
                                            </li>
                                        ))}
                                        {pkg.services.length > 4 && (
                                            <li className="text-sm" style={{ color: "#16acd4" }}>
                                                +{pkg.services.length - 4} more services
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {/* CTA */}
                                <Link
                                    href={`/packages/${pkg.id}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-all group-hover:gap-3"
                                    style={{
                                        background: "linear-gradient(135deg, #16acd4, #d49510)",
                                        color: "#000",
                                    }}
                                >
                                    View Details
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                {/* Hover glow effect */}
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                    style={{
                                        background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${config.bg}, transparent 40%)`,
                                    }}
                                />
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
