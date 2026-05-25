export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#09090b] p-6 md:p-12 relative overflow-hidden font-sans">
            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#09090b] to-[#09090b] -z-10" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#16acd4]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#16acd4]/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 -z-10" />
            {children}
        </div>
    )
}
