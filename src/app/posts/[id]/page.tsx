import { db } from "@/lib/db"
import { Navbar } from "@/components/layout/navbar"
import HomeFooter from "@/components/home/HomeFooter"
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
    Calendar, 
    Clock, 
    Share2, 
    ArrowLeft, 
    CheckCircle2, 
    ExternalLink, 
    Sparkles, 
    Play, 
    Phone,
    ShieldCheck
} from "lucide-react"
import PostShareButtons from "./PostShareButtons"

interface PageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params
    const post = await db.studioPost.findFirst({
        where: {
            OR: [{ id }, { externalId: id }]
        }
    })

    if (!post) {
        return { title: "Post Not Found | Detailing Garage" }
    }

    const firstLine = post.caption?.split("\n")[0]?.trim() || "Studio Update & Transformation"
    const title = `${firstLine.slice(0, 60)} | Detailing Garage`
    const description = post.caption?.slice(0, 160) || "Explore detailing transformations and updates from Detailing Garage."

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [post.url],
        }
    }
}

export default async function PostDetailPage({ params }: PageProps) {
    const { id } = await params

    const post = await db.studioPost.findFirst({
        where: {
            OR: [{ id }, { externalId: id }]
        }
    })

    if (!post) {
        notFound()
    }

    // Fetch related recent posts
    const relatedPosts = await db.studioPost.findMany({
        where: {
            id: { not: post.id },
            isActive: true
        },
        orderBy: [
            { publishedAt: "desc" },
            { createdAt: "desc" }
        ],
        take: 3
    })

    // Extract title and paragraphs from caption
    const rawCaption = post.caption || "Detailing Garage Masterpiece — Precision paint correction and protective treatment."
    const lines = rawCaption.split("\n").map(l => l.trim()).filter(Boolean)
    const title = lines[0]?.replace(/[#*]/g, "") || "Detailing Garage Transformation"
    const remainingLines = lines.slice(1)

    // Separate hashtags
    const hashtags: string[] = []
    const contentParagraphs: string[] = []

    for (const line of remainingLines) {
        if (line.startsWith("#") || line.includes("#DetailingGarage")) {
            const tags = line.match(/#[a-zA-Z0-9_]+/g) || []
            hashtags.push(...tags)
        } else {
            contentParagraphs.push(line)
        }
    }

    const publishedDate = post.publishedAt || post.createdAt

    return (
        <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] selection:bg-[#16acd4] selection:text-black font-sans">
            <Navbar />

            <main className="pt-32 pb-24 px-6 md:px-14 max-w-5xl mx-auto">
                {/* Top Navigation & Breadcrumbs */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                    </Link>

                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>Stories</span>
                        <span>/</span>
                        <span className="text-[#16acd4] font-medium truncate max-w-[200px]">
                            Studio Story
                        </span>
                    </div>
                </div>

                {/* Article Header */}
                <header className="space-y-6 mb-12">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#16acd4]/10 border border-[#16acd4]/30 text-[#16acd4] text-xs font-bold shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" /> Studio Story
                        </span>

                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            <span>
                                {new Date(publishedDate).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            <span>2 min read</span>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-display leading-[1.15] text-white">
                        {title}
                    </h1>

                    <div className="flex items-center justify-between border-y border-white/10 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#16acd4] text-black font-extrabold flex items-center justify-center text-sm shadow-md">
                                DG
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Detailing Garage Studio</p>
                                <p className="text-[11px] text-zinc-400">Certified Auto Protection & Detailing Experts</p>
                            </div>
                        </div>

                        <PostShareButtons title={title} />
                    </div>
                </header>

                {/* Hero Featured Media */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black mb-12 shadow-2xl">
                    <img 
                        src={post.url} 
                        alt={title}
                        className="w-full max-h-[650px] object-contain mx-auto" 
                    />
                    
                    {(post.type === "VIDEO" || post.type === "REEL") && (
                        <div className="absolute top-6 left-6 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full text-xs font-bold text-white flex items-center gap-2 border border-white/10">
                            <Play className="w-4 h-4 fill-current text-[#16acd4]" /> Video Showcase
                        </div>
                    )}
                </div>

                {/* Article Body Content */}
                <article className="prose prose-invert max-w-none space-y-6 text-zinc-300 font-light text-base md:text-lg leading-relaxed">
                    {contentParagraphs.length > 0 ? (
                        contentParagraphs.map((para, i) => {
                            // Check if this is a bullet highlight line
                            if (para.startsWith("✔") || para.startsWith("✅") || para.startsWith("•") || para.startsWith("-")) {
                                return (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 my-2">
                                        <CheckCircle2 className="w-5 h-5 text-[#16acd4] shrink-0 mt-0.5" />
                                        <span className="text-sm md:text-base font-normal text-zinc-200">
                                            {para.replace(/^[✔✅•-]\s*/, "")}
                                        </span>
                                    </div>
                                )
                            }
                            return (
                                <p key={i} className="text-zinc-300 leading-relaxed font-light">
                                    {para}
                                </p>
                            )
                        })
                    ) : (
                        <p className="text-zinc-300 leading-relaxed">
                            {rawCaption}
                        </p>
                    )}

                    {/* Hashtags section */}
                    {hashtags.length > 0 && (
                        <div className="pt-8 border-t border-white/10 flex flex-wrap gap-2">
                            {hashtags.map((tag, i) => (
                                <span 
                                    key={i} 
                                    className="px-3 py-1 rounded-full bg-white/5 text-xs text-zinc-400 font-mono hover:text-[#16acd4] transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </article>

                {/* Studio Booking CTA Banner */}
                <div className="my-14 p-8 rounded-3xl bg-gradient-to-r from-[#121214] via-[#16acd4]/10 to-[#121214] border border-[#16acd4]/30 relative overflow-hidden text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16acd4]/20 text-[#16acd4] text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4" /> Detailing & PDI Experts
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold font-display text-white">
                        Want Perfection Like This For Your Car?
                    </h3>
                    <p className="text-zinc-400 max-w-xl mx-auto text-sm">
                        From 100-point PDI pre-delivery inspections to 9H ceramic coatings and self-healing PPF, we treat every vehicle like a masterpiece.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link 
                            href="/pdi"
                            className="px-6 py-3 bg-[#16acd4] text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-white transition-all shadow-lg shadow-[#16acd4]/20"
                        >
                            Book PDI Inspection
                        </Link>
                        <a 
                            href="tel:+918679800074"
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center gap-2"
                        >
                            <Phone className="w-3.5 h-3.5 text-[#16acd4]" /> Call: +91 86798 00074
                        </a>
                    </div>
                </div>

                {/* Related Recent Stories */}
                {relatedPosts.length > 0 && (
                    <section className="pt-12 border-t border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold font-display text-white">More Studio Stories</h3>
                                <p className="text-xs text-zinc-400 mt-1">Explore other recent transformations and updates</p>
                            </div>
                            <Link href="/social" className="text-xs font-bold uppercase tracking-wider text-[#16acd4] hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedPosts.map((relPost) => (
                                <Link 
                                    key={relPost.id}
                                    href={`/posts/${relPost.id}`}
                                    className="group rounded-2xl bg-[#121214] border border-white/10 hover:border-[#16acd4]/40 overflow-hidden transition-all duration-300 flex flex-col"
                                >
                                    <div className="aspect-[4/3] bg-black overflow-hidden relative">
                                        <img 
                                            src={relPost.url} 
                                            alt={relPost.caption || "Studio story"}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                                        />
                                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-zinc-200 text-[10px] font-bold flex items-center gap-1 border border-white/10">
                                            <ShieldCheck className="w-2.5 h-2.5 text-[#16acd4]" /> PDI Delivery
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                                        <p className="text-xs text-zinc-300 line-clamp-2 font-light group-hover:text-white transition-colors">
                                            {relPost.caption || "Detailing Garage Masterpiece"}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 font-mono">
                                            {new Date(relPost.publishedAt || relPost.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <HomeFooter />
        </div>
    )
}
