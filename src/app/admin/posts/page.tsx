"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { 
    Plus, 
    Trash2, 
    Link as LinkIcon, 
    Image as ImageIcon, 
    Film, 
    Facebook, 
    RefreshCw, 
    Settings, 
    ExternalLink,
    Filter,
    CheckCircle2,
    Edit3,
    X,
    Save
} from "lucide-react"
import Link from "next/link"

type Post = {
    id: string
    type: string
    url: string
    caption: string | null
    link: string | null
    source?: string
    externalId?: string | null
    sharesCount?: number
    publishedAt?: string
    isActive: boolean
    createdAt: string
}

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [editingPost, setEditingPost] = useState<Post | null>(null)
    const [editFormData, setEditFormData] = useState({ type: "IMAGE", url: "", caption: "", link: "" })
    const [filterSource, setFilterSource] = useState<"ALL" | "FACEBOOK" | "MANUAL">("ALL")
    const [syncingFb, setSyncingFb] = useState(false)
    const [fbInfo, setFbInfo] = useState<{ isConnected: boolean; pageName: string; lastSyncedAt: string | null } | null>(null)
    const [formData, setFormData] = useState({ type: "IMAGE", url: "", caption: "", link: "", source: "MANUAL" })

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const [postsRes, fbRes] = await Promise.all([
                fetch("/api/admin/posts"),
                fetch("/api/admin/settings/facebook")
            ])
            
            const postsData = await postsRes.json()
            if (postsData.success) {
                setPosts(postsData.posts)
            } else {
                toast.error(postsData.error || "Failed to fetch posts")
            }

            const fbData = await fbRes.json()
            if (fbData.success && fbData.settings) {
                setFbInfo({
                    isConnected: fbData.settings.isConnected,
                    pageName: fbData.settings.pageName || "Facebook Page",
                    lastSyncedAt: fbData.settings.lastSyncedAt
                })
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
                setFormData({ type: "IMAGE", url: "", caption: "", link: "", source: "MANUAL" })
                fetchPosts()
            } else {
                toast.error(data.error || "Failed to add post", { id: toastId })
            }
        } catch (error) {
            toast.error("An error occurred", { id: toastId })
        }
    }

    const startEdit = (post: Post) => {
        setEditingPost(post)
        setEditFormData({
            type: post.type || "IMAGE",
            url: post.url || "",
            caption: post.caption || "",
            link: post.link || ""
        })
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingPost) return

        const toastId = toast.loading("Saving changes...")
        try {
            const res = await fetch(`/api/admin/posts/${editingPost.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editFormData)
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Post updated successfully!", { id: toastId })
                setEditingPost(null)
                fetchPosts()
            } else {
                toast.error(data.error || "Failed to update post", { id: toastId })
            }
        } catch (error) {
            toast.error("An error occurred while updating", { id: toastId })
        }
    }

    const handleSyncFacebook = async () => {
        setSyncingFb(true)
        const toastId = toast.loading("Syncing posts from Facebook...")
        try {
            const res = await fetch("/api/admin/settings/facebook/sync", {
                method: "POST"
            })
            const data = await res.json()
            if (data.success) {
                toast.success(data.message || `Synced ${data.count} posts from Facebook!`, { id: toastId })
                fetchPosts()
            } else {
                toast.error(data.error || "Failed to sync Facebook posts", { id: toastId })
            }
        } catch (error) {
            toast.error("Failed to connect to Facebook sync service", { id: toastId })
        } finally {
            setSyncingFb(false)
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

    const filteredPosts = posts.filter(post => {
        if (filterSource === "ALL") return true
        if (filterSource === "FACEBOOK") return post.source === "FACEBOOK"
        if (filterSource === "MANUAL") return post.source !== "FACEBOOK"
        return true
    })

    return (
        <div className="p-6 max-w-7xl mx-auto text-zinc-200 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Social Showcase & Feed</h1>
                    <p className="text-zinc-400 mt-1">Manage, edit, and delete posts that appear on your homepage and portfolio.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link
                        href="/admin/settings/facebook"
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all text-sm"
                    >
                        <Settings className="w-4 h-4 text-[#16acd4]" /> Facebook Settings
                    </Link>
                    <button 
                        onClick={() => setIsCreating(!isCreating)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#16acd4] hover:bg-[#0f80a0] text-black font-bold rounded-xl transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Manual Post
                    </button>
                </div>
            </div>

            {/* Facebook Sync Bar Banner */}
            <div className="p-5 rounded-2xl bg-[#121214] border border-[#1877F2]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-[#1877F2]/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2]">
                        <Facebook className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base">
                                {fbInfo?.pageName || "Facebook Page Feed Sync"}
                            </h3>
                            {fbInfo?.isConnected && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3" /> Auto-Sync Active
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            {fbInfo?.lastSyncedAt 
                                ? `Last synchronized: ${new Date(fbInfo.lastSyncedAt).toLocaleString('en-IN')}` 
                                : "Sync latest photos, reels and posts directly from your Facebook Page"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleSyncFacebook}
                        disabled={syncingFb}
                        className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-md shadow-[#1877F2]/20 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncingFb ? "animate-spin" : ""}`} />
                        {syncingFb ? "Syncing Feed..." : "Sync Facebook Now"}
                    </button>
                    <Link
                        href="/admin/settings/facebook"
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                        <Settings className="w-3.5 h-3.5" /> Configure
                    </Link>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <button
                    onClick={() => setFilterSource("ALL")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        filterSource === "ALL" 
                            ? "bg-white text-black" 
                            : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                >
                    All Posts ({posts.length})
                </button>
                <button
                    onClick={() => setFilterSource("FACEBOOK")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        filterSource === "FACEBOOK" 
                            ? "bg-[#1877F2] text-white" 
                            : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                >
                    <Facebook className="w-3.5 h-3.5 fill-current" /> Facebook Feed ({posts.filter(p => p.source === "FACEBOOK").length})
                </button>
                <button
                    onClick={() => setFilterSource("MANUAL")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        filterSource === "MANUAL" 
                            ? "bg-[#16acd4] text-black" 
                            : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                >
                    Manual Uploads ({posts.filter(p => p.source !== "FACEBOOK").length})
                </button>
            </div>

            {/* Create Post Form */}
            {isCreating && (
                <div className="bg-[#18181b] p-6 rounded-2xl border border-white/10 mb-8 animate-in fade-in duration-300">
                    <h2 className="text-xl font-bold text-white mb-4">Add New Studio Post</h2>
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
                                    <option value="REEL">Instagram / FB Reel</option>
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
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Post Link (Facebook / Instagram Link)</label>
                                <input 
                                    type="url" 
                                    className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-white"
                                    placeholder="https://facebook.com/..."
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

            {/* Edit Post Modal */}
            {editingPost && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#18181b] border border-white/15 w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Edit3 className="w-5 h-5 text-[#16acd4]" /> Edit Post Details
                                </h2>
                                <p className="text-xs text-zinc-400 mt-1">
                                    Source: <span className="text-[#16acd4] font-bold">{editingPost.source || "MANUAL"}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingPost(null)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Type</label>
                                    <select 
                                        className="w-full bg-[#09090b] border border-white/10 rounded-xl p-3 text-white text-sm"
                                        value={editFormData.type}
                                        onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                                    >
                                        <option value="IMAGE">Image</option>
                                        <option value="VIDEO">Video</option>
                                        <option value="REEL">Reel</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Media URL</label>
                                    <input 
                                        type="url" 
                                        required
                                        className="w-full bg-[#09090b] border border-white/10 rounded-xl p-3 text-white text-sm"
                                        value={editFormData.url}
                                        onChange={(e) => setEditFormData({...editFormData, url: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Caption / Description</label>
                                    <textarea 
                                        className="w-full bg-[#09090b] border border-white/10 rounded-xl p-3 text-white text-sm"
                                        rows={4}
                                        value={editFormData.caption}
                                        onChange={(e) => setEditFormData({...editFormData, caption: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Direct Link (Facebook / Instagram)</label>
                                    <input 
                                        type="url" 
                                        className="w-full bg-[#09090b] border border-white/10 rounded-xl p-3 text-white text-sm"
                                        value={editFormData.link}
                                        onChange={(e) => setEditFormData({...editFormData, link: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingPost(null)}
                                    className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5 text-xs font-bold uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#16acd4] hover:bg-[#1397bc] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#16acd4]/20"
                                >
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Posts Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square bg-zinc-900 animate-pulse rounded-2xl" />)}
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-[#121214] rounded-2xl border border-white/5 space-y-4">
                    <p className="text-zinc-500">No posts found in this section.</p>
                    <button
                        onClick={handleSyncFacebook}
                        disabled={syncingFb}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1877F2] text-white hover:bg-[#166fe5]"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Sync from Facebook Page
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredPosts.map((post) => (
                        <div key={post.id} className={`relative bg-[#121214] rounded-2xl overflow-hidden border ${post.isActive ? 'border-white/10 hover:border-[#16acd4]/30' : 'border-red-500/30'} group transition-all flex flex-col`}>
                            <div className="aspect-square relative overflow-hidden bg-black">
                                <img src={post.url} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                
                                {/* Source Badge */}
                                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                    {post.source === "FACEBOOK" ? (
                                        <span className="px-2.5 py-1 rounded-full bg-[#1877F2] text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                                            <Facebook className="w-3 h-3 fill-current" /> Facebook
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 text-[10px] font-medium border border-white/10">
                                            Studio Manual
                                        </span>
                                    )}
                                </div>

                                {/* Type icon */}
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white">
                                    {post.type === "IMAGE" ? <ImageIcon className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                                </div>
                            </div>
                            
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <p className="text-xs text-zinc-300 line-clamp-2 mb-3">
                                    {post.caption || "No caption provided"}
                                </p>
                                
                                <div className="space-y-3 pt-3 border-t border-white/5">
                                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                                        <span>
                                            {post.publishedAt 
                                                ? new Date(post.publishedAt).toLocaleDateString('en-IN') 
                                                : new Date(post.createdAt).toLocaleDateString('en-IN')}
                                        </span>
                                        {post.link && (
                                            <a 
                                                href={post.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-[#16acd4] hover:underline flex items-center gap-1"
                                            >
                                                View Post <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <button 
                                            onClick={() => handleToggleStatus(post.id, post.isActive)}
                                            className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg transition-colors ${
                                                post.isActive 
                                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                            }`}
                                        >
                                            {post.isActive ? 'Active on Home' : 'Hidden'}
                                        </button>
                                        
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => startEdit(post)}
                                                className="text-zinc-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                                                title="Edit post details"
                                            >
                                                <Edit3 className="w-4 h-4 text-[#16acd4]" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(post.id)}
                                                className="text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                                                title="Delete post"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
