"use client"

import Link from "next/link"
import { Calendar, ArrowRight, MessageSquare, ShieldCheck } from "lucide-react"

interface Post {
    id: string
    content: string
    title?: string
    date?: string
    author?: string
    image?: string
    page: {
        businessName: string
        slug: string
    }
}

interface Props {
    posts: Post[]
}

export default function CommunityUpdatesSection({ posts }: Props) {
    // Use first 4 posts
    const displayPosts = posts.length > 0 ? posts.slice(0, 4) : []

    return (
        <section className="py-24 px-6 md:px-14 bg-zinc-950 border-t border-zinc-900">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 section-reveal">
                    <div className="text-[#16acd4] text-xs font-black uppercase tracking-widest mb-3">Insights & News</div>
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">Detailing Knowledge Base</h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#16acd4] to-[#ffd070] mx-auto rounded-full mt-6 mb-6"></div>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-base font-medium opacity-90">Expert tips, behind-the-scenes transformations, and the latest advancements in automotive protection.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayPosts.map((post, i) => (
                        <div key={post.id} className="group flex flex-col bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border border-white/5 hover:border-[#16acd4]/30 hover:-translate-y-2 section-reveal relative" style={{ transitionDelay: `${i * 0.15}s` }}>
                            {/* Hover glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#16acd4]/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />

                            {/* Image Section Refined */}
                            <div className="relative h-56 overflow-hidden z-10">
                                <img
                                    src={post.image || `https://images.unsplash.com/photo-1618641986557-1def23625997?q=80&w=800&auto=format&fit=crop`}
                                    alt={post.title || "Blog Title"}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-90" />

                                {/* Author Badge */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full border border-[#16acd4]/50 overflow-hidden shadow-lg bg-zinc-800 flex items-center justify-center">
                                        <ShieldCheck className="w-4 h-4 text-[#16acd4]" />
                                    </div>
                                    <div className="text-white text-[10px] font-bold uppercase tracking-widest drop-shadow-md">
                                        {post.page.businessName || "Master Tech"}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 z-10 relative">
                                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3 text-[#16acd4]" /> {post.date || "March 12, 2024"}
                                    </div>
                                </div>

                                <h3 className="text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-[#16acd4] transition-colors">
                                    <Link href={`/feed`}>{post.title || post.content.substring(0, 60) + '...'}</Link>
                                </h3>

                                <p className="text-sm text-zinc-400 font-medium leading-relaxed opacity-80 line-clamp-2">
                                    {post.content.replace(/<[^>]*>?/gm, '').substring(0, 80)}...
                                </p>

                                <div className="pt-4 border-t border-white/10 mt-auto">
                                    <Link href={`/feed`} className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#16acd4] hover:text-white transition-colors group/link">
                                        Read Full Article <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
