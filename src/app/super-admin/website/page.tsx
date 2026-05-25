"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { WebsiteContent } from "@/lib/website-content"
import { Loader2, Plus, Trash2, Save } from "lucide-react"

export default function WebsiteSettingsPage() {
    const [content, setContent] = useState<WebsiteContent | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetch("/api/admin/website")
            .then(res => res.json())
            .then(data => {
                setContent(data)
                setIsLoading(false)
            })
            .catch(err => {
                console.error(err)
                toast.error("Failed to load website content")
                setIsLoading(false)
            })
    }, [])

    const handleSave = async () => {
        if (!content) return
        setIsSaving(true)
        try {
            const res = await fetch("/api/admin/website", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(content)
            })
            if (!res.ok) throw new Error("Failed to save")
            toast.success("Website content updated successfully!")
        } catch (error) {
            console.error(error)
            toast.error("Failed to save changes")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading || !content) {
        return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-10">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Website Content Management</h1>
                    <p className="text-gray-500">Update the dynamic content of the public landing page.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save All Changes
                </button>
            </div>

            <div className="space-y-8">
                {/* About Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">About Us Section</h2>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={content.about.title}
                                onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                rows={4}
                                value={content.about.description}
                                onChange={(e) => setContent({ ...content, about: { ...content.about, description: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input
                                type="text"
                                value={content.about.image}
                                onChange={(e) => setContent({ ...content, about: { ...content.about, image: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Integration */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">Social Media Integration</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                            <input
                                type="text"
                                value={content.social.instagramUrl}
                                onChange={(e) => setContent({ ...content, social: { ...content.social, instagramUrl: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                            <input
                                type="text"
                                value={content.social.facebookUrl}
                                onChange={(e) => setContent({ ...content, social: { ...content.social, facebookUrl: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Elfsight Widget ID (for automatic feed)</label>
                            <input
                                type="text"
                                value={content.social.widgetId}
                                onChange={(e) => setContent({ ...content, social: { ...content.social, widgetId: e.target.value } })}
                                placeholder="e.g. 12345678-1234-1234-1234-1234567890ab"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave as "YOUR_ELFSIGHT_WIDGET_ID" or blank to show normal social buttons.</p>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">Contact Information</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="text"
                                value={content.contact.phone}
                                onChange={(e) => setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={content.contact.email}
                                onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={content.contact.address}
                                onChange={(e) => setContent({ ...content, contact: { ...content.contact, address: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-500">
                <p>Note: Packages are managed from the existing Packages menu.</p>
            </div>
        </div>
    )
}
