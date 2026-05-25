"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import HomeFooter from "@/components/home/HomeFooter"
import { motion } from "framer-motion"
import { Play, ExternalLink } from "lucide-react"

type Post = {
    id: string
    type: string
    url: string
    caption: string | null
    link: string | null
    createdAt: string
}

export default function SocialPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/public/posts")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPosts(data.posts)
                }
            })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] font-sans">
            <Navbar />

            <div className="pt-32 pb-24 px-6 md:px-14 max-w-7xl mx-auto min-h-[80vh]">
                <div className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">Latest Work</h1>
                    <p className="text-zinc-400">Our recent masterpieces and studio updates.</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-square bg-zinc-900 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 border border-white/5 rounded-3xl bg-zinc-900/30">
                        <p className="text-zinc-500">No posts available yet. Check back soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={post.id} 
                                className="group relative bg-[#121214] rounded-2xl overflow-hidden border border-white/5 hover:border-[#16acd4]/30 transition-all cursor-pointer aspect-square"
                                onClick={() => post.link && window.open(post.link, "_blank")}
                            >
                                <img src={post.url} alt="Studio Post" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                
                                {post.type === "VIDEO" || post.type === "REEL" ? (
                                    <div className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center">
                                        <Play className="w-4 h-4 text-white ml-0.5" />
                                    </div>
                                ) : null}

                                {post.link && (
                                     <div className="absolute top-4 left-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                {post.caption && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                        <p className="text-sm text-zinc-300 line-clamp-3">{post.caption}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <HomeFooter />
        </div>
    )
}
