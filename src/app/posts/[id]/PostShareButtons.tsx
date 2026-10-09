"use client"

import { useState } from "react"
import { Share2, Copy, Check, MessageCircle } from "lucide-react"
import { toast } from "react-hot-toast"

export default function PostShareButtons({ title }: { title: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            toast.success("Link copied to clipboard!")
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleWhatsApp = () => {
        if (typeof window !== "undefined") {
            const text = encodeURIComponent(`${title} - Read more on Detailing Garage: ${window.location.href}`)
            window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank")
        }
    }

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={handleWhatsApp}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                title="Share on WhatsApp"
            >
                <MessageCircle className="w-3.5 h-3.5 fill-current" /> Share
            </button>

            <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
                title="Copy link"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Link"}
            </button>
        </div>
    )
}
