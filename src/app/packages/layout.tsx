import { ReactNode } from "react"
import Link from "next/link"
import { Package, ArrowLeft } from "lucide-react"

export default function PackagesLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen" style={{ backgroundColor: "#08090c" }}>
            {/* Header */}
            <header
                className="sticky top-0 z-50"
                style={{
                    backgroundColor: "rgba(8, 9, 12, 0.9)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Back to Home</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Package className="w-6 h-6" style={{ color: "#16acd4" }} />
                        <span className="font-display text-xl tracking-wider text-white">
                            Our <span style={{ color: "#16acd4" }}>Packages</span>
                        </span>
                    </div>

                    <Link
                        href="/login"
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            color: "#d8d8d8",
                        }}
                    >
                        Sign In
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {children}
            </main>

            {/* Footer */}
            <footer
                className="mt-auto py-8"
                style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm" style={{ color: "#6b7080" }}>
                        © 2026 DetailingGarage. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}
