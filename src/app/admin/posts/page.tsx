"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Plus, Trash2, Link as LinkIcon, Image as ImageIcon, Film } from "lucide-react"

type Post = {
    id: string
    type: string
    url: string
    caption: string | null
    link: string | null
    isActive: boolean
    createdAt: string
}

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [formData, setFormData] = useState({ type: "IMAGE", url: "", caption: "", link: "" })

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/posts")
            const data = await res.json()
            if (data.success) {
                setPosts(data.posts)
            } else {
                toast.error(data.error || "Failed to fetch posts")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const toastId = toast.loading("Adding post...")
        try {
            const res = await fetch("/api/admin/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Post added successfully", { id: toastId })
                setIsCreating(false)
                setFormData({ type: "IMAGE", url: "", caption: "", link: "" })
                fetchPosts()
            } else {
                toast.error(data.error || "Failed to add post", { id: toastId })
            }
        } catch (error) {
            toast.error("An error occurred", { id: toastId })
        }
    }

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/posts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(currentStatus ? "Post hidden" : "Post visible")
                fetchPosts()
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return
        const toastId = toast.loading("Deleting post...")
        try {
            const res = await fetch(`/api/admin/posts/${id}`, {
                method: "DELETE"
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Post deleted", { id: toastId })
                fetchPosts()
            } else {
                toast.error(data.error || "Failed to delete", { id: toastId })
            }
        } catch (error) {
            toast.error("An error occurred", { id: toastId })
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto text-zinc-200">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Social Showcase</h1>
                    <p className="text-zinc-400 mt-1">Manage posts that appear on your homepage and portfolio.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#16acd4] hover:bg-[#0f80a0] text-black font-semibold rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" /> Add New Post
                </button>
            </div>

            {isCreating && (
                <div className="bg-[#18181b] p-6 rounded-xl border border-white/5 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Add New Post</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Post Type</label>
                                <select 
                                    className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-white"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="IMAGE">Image</option>
                                    <option value="VIDEO">Video</option>
                                    <option value="REEL">Instagram Reel</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Media URL (Image/Video Link)</label>
                                <input 
                                    type="url" 
                                    required
                                    className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-white"
                                    placeholder="https://example.com/image.jpg"
                                    value={formData.url}
                                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Caption (Optional)</label>
                                <textarea 
                                    className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-white"
                                    placeholder="Write a caption..."
                                    rows={3}
                                    value={formData.caption}
                                    onChange={(e) => setFormData({...formData, caption: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-400 mb-1">External Link (Instagram Post URL - Optional)</label>
                                <input 
                                    type="url" 
                                    className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-white"
                                    placeholder="https://instagram.com/p/..."
                                    value={formData.link}
                                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button 
                                type="button" 
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 bg-transparent border border-white/10 rounded-lg hover:bg-white/5"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-[#16acd4] text-black font-semibold rounded-lg"
                            >
                                Publish Post
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-zinc-900 animate-pulse rounded-xl" />)}
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 bg-[#18181b] rounded-xl border border-white/5">
                    <p className="text-zinc-500">No posts added yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {posts.map((post) => (
                        <div key={post.id} className={`relative bg-[#18181b] rounded-xl overflow-hidden border ${post.isActive ? 'border-white/10' : 'border-red-500/30'} group`}>
                            <div className="aspect-square relative">
                                <img src={post.url} alt="Post" className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded text-white">
                                    {post.type === "IMAGE" ? <ImageIcon className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-zinc-300 line-clamp-2 mb-3 h-10">
                                    {post.caption || "No caption"}
                                </p>
                                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleToggleStatus(post.id, post.isActive)}
                                            className={`text-xs px-2 py-1 rounded ${post.isActive ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-400'}`}
                                        >
                                            {post.isActive ? 'Visible' : 'Hidden'}
                                        </button>
                                        {post.link && (
                                            <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white">
                                                <LinkIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(post.id)}
                                        className="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
