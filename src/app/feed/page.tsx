"use client"

import { Navbar } from "@/components/layout/navbar"
import { useEffect, useState } from "react"
import {
    Globe,
    CheckCircle,
    Heart,
    MessageSquare,
    Share2,
    Loader2,
    ArrowRight,
    Pin
} from "lucide-react"
import Link from "next/link"

export default function PublicFeedPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch("/api/public/posts")
                const data = await res.json()
                if (data.posts) {
                    setPosts(data.posts)
                }
            } catch (error) {
                console.error("Error fetching public posts:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPosts()
    }, [])

    return (
        <div className="min-h-screen bg-[#060a14]">
            <Navbar />

            <main className="max-w-[1200px] mx-auto px-6 md:px-14 pt-32 pb-24">
                {/* Header */}
                <div className="mb-16">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <span className="w-8 h-0.5 rounded bg-[#16acd4]" />
                        <span className="text-xs font-semibold tracking-[2.5px] uppercase text-[#16acd4]">Real-time Updates</span>
                    </div>
                    <h1 className="font-display text-[clamp(40px,6vw,64px)] tracking-[3px] text-white">Dealer <span className="text-[#16acd4]">Community</span> Feed</h1>
                    <p className="text-gray-500 max-w-xl mt-4 leading-relaxed font-medium">
                        Explore the latest announcements, exclusive offers, and vehicle updates from our network of verified dealers.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#16acd4] mb-4" />
                        <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Syncing updates...</p>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="group relative rounded-[40px] border border-white/5 overflow-hidden transition-all duration-700 hover:border-[#16acd4]/20 hover:bg-white/[0.01]"
                                style={{ backgroundColor: '#0d1220' }}
                            >
                                {/* Pinned indicator */}
                                {post.isPinned && (
                                    <div className="absolute top-6 right-8 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e293b] border border-white/5">
                                        <Pin className="w-3 h-3 text-[#16acd4] rotate-45" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Featured</span>
                                    </div>
                                )}

                                <div className="p-8 md:p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <Link href={`/dealer/${post.page.slug}`} className="relative block">
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center group-hover:border-[#16acd4]/50 transition-colors">
                                                {post.page.logoUrl ? (
                                                    <img src={post.page.logoUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Globe className="w-6 h-6 text-gray-800" />
                                                )}
                                            </div>
                                            {post.page.isVerified && (
                                                <div className="absolute -bottom-1 -right-1 bg-[#16acd4] rounded-full p-1 border-2 border-[#0d1220]">
                                                    <CheckCircle className="w-2.5 h-2.5 text-black" />
                                                </div>
                                            )}
                                        </Link>
                                        <div>
                                            <Link href={`/dealer/${post.page.slug}`} className="block group/title">
                                                <h3 className="text-lg font-black text-white group-hover/title:text-[#16acd4] transition-colors">{post.page.businessName}</h3>
                                            </Link>
                                            <p className="text-[10px] uppercase tracking-[2px] font-bold text-gray-600 mt-0.5">Verified Dealer</p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                                                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-lg leading-relaxed font-medium mb-10">
                                        {post.content}
                                    </p>

                                    {/* Interaction Bar */}
                                    <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                        <div className="flex items-center gap-6">
                                            <button className="flex items-center gap-2 group/action">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 text-gray-500 group-hover/action:bg-[#e11d48]/10 group-hover/action:text-[#e11d48] transition-all">
                                                    <Heart className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-600 group-hover/action:text-white transition-colors">
                                                    {Math.floor(Math.random() * 50)}
                                                </span>
                                            </button>
                                            <button className="flex items-center gap-2 group/action">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 text-gray-500 group-hover/action:bg-[#16acd4]/10 group-hover/action:text-[#16acd4] transition-all">
                                                    <MessageSquare className="w-4 h-4" />
                                                </div>
                                            </button>
                                            <button className="flex items-center gap-2 group/action">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 text-gray-500 group-hover/action:bg-blue-500/10 group-hover/action:text-blue-500 transition-all">
                                                    <Share2 className="w-4 h-4" />
                                                </div>
                                            </button>
                                        </div>

                                        <Link href={`/dealer/${post.page.slug}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#16acd4] hover:text-white transition-all group/btn">
                                            View Profile <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border border-dashed border-white/10 rounded-[40px]">
                        <p className="text-gray-500 font-medium">No updates found from dealers yet.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
