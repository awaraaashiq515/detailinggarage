"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import HomeFooter from "@/components/home/HomeFooter"
import { motion } from "framer-motion"
import { Play, ExternalLink, Sparkles, ShieldCheck, X, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

type Post = {
    id: string
    type: string
    url: string
    caption: string | null
    link: string | null
    source?: string
    publishedAt?: string
    createdAt: string
}

export default function SocialPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/public/posts")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPosts(data.posts || [])
                }
            })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] font-sans">
            <Navbar />

            <div className="pt-32 pb-24 px-6 md:px-14 max-w-7xl mx-auto min-h-[80vh]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#16acd4]/30 bg-[#16acd4]/10 text-[#16acd4] text-xs font-bold uppercase tracking-wider mb-4">
                            <Sparkles className="w-3.5 h-3.5" /> Studio Stories & Deliveries
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 text-white">Latest Work & Updates</h1>
                        <p className="text-zinc-400">Our recent master detailing projects, ceramic coatings, PPF installations, and verified deliveries.</p>
                    </div>

                    <Link 
                        href="/pdi"
                        className="px-6 py-3 bg-[#16acd4] hover:bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-[#16acd4]/20"
                    >
                        Book Inspection <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-square bg-zinc-900 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 border border-white/5 rounded-3xl bg-zinc-900/30 space-y-3">
                        <p className="text-zinc-500">No studio stories available yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post, i) => (
                            <Link
                                key={post.id}
                                href={`/posts/${post.id}`}
                                className="block"
                            >
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group relative bg-[#121214] rounded-2xl overflow-hidden border border-white/5 hover:border-[#16acd4]/30 transition-all cursor-pointer aspect-square"
                                >
                                    <img src={post.url} alt="Studio Post" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                    
                                    {(post.type === "VIDEO" || post.type === "REEL") && (
                                        <div className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center">
                                            <Play className="w-4 h-4 text-white ml-0.5" />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-10">
                                        <p className="text-sm text-zinc-200 line-clamp-3 mb-2 font-light">{post.caption || "Detailing Garage Masterpiece"}</p>
                                        <div className="text-[11px] text-[#16acd4] font-medium flex items-center gap-1">
                                            View Story <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* In-Page Lightbox Modal */}
            {selectedPost && (
                <div 
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200" 
                    onClick={() => setSelectedPost(null)}
                >
                    <div 
                        className="relative max-w-4xl w-full bg-[#121214] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Media Column */}
                        <div className="md:w-3/5 bg-black relative flex items-center justify-center min-h-[300px] md:min-h-[500px]">
                            <img 
                                src={selectedPost.url} 
                                alt={selectedPost.caption || "Detailing Garage"} 
                                className="w-full h-full object-contain max-h-[75vh]" 
                            />
                            {(selectedPost.type === "VIDEO" || selectedPost.type === "REEL") && (
                                <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-bold text-white flex items-center gap-1.5 border border-white/10">
                                    <Play className="w-3.5 h-3.5 fill-current text-[#16acd4]" /> Video Showcase
                                </div>
                            )}
                        </div>

                        {/* Details Column */}
                        <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-[#121214]">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <div>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-bold">
                                            <Sparkles className="w-3.5 h-3.5 text-[#16acd4]" /> Studio Story
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedPost(null)}
                                        className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="text-xs text-zinc-400 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-[#16acd4]" />
                                    <span>
                                        {selectedPost.publishedAt 
                                            ? new Date(selectedPost.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                                            : new Date(selectedPost.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>

                                <div className="text-sm text-zinc-200 font-light leading-relaxed whitespace-pre-line max-h-[40vh] overflow-y-auto pr-2">
                                    {selectedPost.caption || "Detailing Garage professional paint protection and detailing service."}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 mt-6 flex flex-col gap-3">
                                <Link
                                    href={`/posts/${selectedPost.id}`}
                                    className="w-full py-3 bg-[#16acd4] hover:bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-[#16acd4]/20 text-center flex items-center justify-center gap-2"
                                >
                                    Read Full Story <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                                <button 
                                    onClick={() => setSelectedPost(null)}
                                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <HomeFooter />
        </div>
    )
}
