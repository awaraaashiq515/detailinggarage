import Link from "next/link"
import { ShieldX } from "lucide-react"

export default function UnauthorizedPage() {
    return (
        <div
            className="min-h-screen flex items-center justify-center px-6"
            style={{ backgroundColor: '#08090c' }}
        >
            <div className="text-center max-w-md">
                <div
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)' }}
                >
                    <ShieldX className="w-10 h-10" style={{ color: '#f87171' }} />
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>

                <p className="text-base mb-8" style={{ color: '#6b7080' }}>
                    You don't have permission to access this page. This area is restricted to administrators only.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all hover:translate-y-[-1px]"
                        style={{
                            background: 'linear-gradient(135deg, #16acd4, #d49510)',
                            color: '#000'
                        }}
                    >
                        Go to Home
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all hover:bg-white/10"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            color: '#d8d8d8'
                        }}
                    >
                        Login as Admin
                    </Link>
                </div>
            </div>
        </div>
    )
}
