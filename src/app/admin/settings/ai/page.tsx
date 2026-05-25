'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, RefreshCw, Key, Eye, EyeOff } from 'lucide-react'

export default function AISettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showApiKey, setShowApiKey] = useState(false)
    const [formData, setFormData] = useState({
        geminiApiKey: '',
        translationEnabled: true
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/settings/ai')
            if (res.ok) {
                const data = await res.json()
                if (data.settings) {
                    setFormData({
                        geminiApiKey: data.settings.geminiApiKey || '',
                        translationEnabled: data.settings.translationEnabled ?? true
                    })
                }
            }
        } catch (error) {
            console.error('Error fetching AI settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch('/api/admin/settings/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                alert('AI settings saved successfully!')
            } else {
                const data = await res.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            alert('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const inputStyle = {
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#d8d8d8'
    }

    const sectionStyle = {
        backgroundColor: '#111318',
        border: '1px solid rgba(255,255,255,0.07)'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#16acd4' }} />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/admin/settings')}
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <ArrowLeft className="w-5 h-5" style={{ color: '#d8d8d8' }} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Key className="w-7 h-7" style={{ color: '#60a5fa' }} />
                        AI & Translation Settings
                    </h2>
                    <p className="mt-1" style={{ color: '#6b7080' }}>Configure Gemini AI for translation features</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Google Gemini API Settings */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white mb-4">Google Gemini API Configuration</h3>

                    <div className="space-y-4">
                        {/* API Key */}
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>
                                Gemini API Key *
                            </label>
                            <div className="relative">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={formData.geminiApiKey}
                                    onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                                    placeholder="Enter your Gemini API key"
                                    className="w-full px-4 py-3 pr-12 rounded-lg text-sm outline-none"
                                    style={inputStyle}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10"
                                >
                                    {showApiKey ? (
                                        <EyeOff className="w-5 h-5" style={{ color: '#6b7080' }} />
                                    ) : (
                                        <Eye className="w-5 h-5" style={{ color: '#6b7080' }} />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs mt-2" style={{ color: '#6b7080' }}>
                                Get your API key from{' '}
                                <a
                                    href="https://makersuite.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-[#16acd4]"
                                >
                                    Google AI Studio
                                </a>
                            </p>
                        </div>

                        {/* Translation Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <div>
                                <div className="font-medium text-white">Enable Translation Feature</div>
                                <div className="text-xs mt-1" style={{ color: '#6b7080' }}>
                                    Allow admins to translate Hindi text to English in insurance forms
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, translationEnabled: !formData.translationEnabled })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.translationEnabled ? 'bg-[#16acd4]' : 'bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.translationEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                    <p className="text-sm" style={{ color: '#60a5fa' }}>
                        <strong>Note:</strong> The translation feature uses Google Gemini AI to automatically translate Hindi damage descriptions to English.
                        This helps streamline insurance claim processing and ensures consistent documentation.
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:translate-y-[-1px] disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #16acd4, #d49510)',
                            color: '#000',
                            boxShadow: '0 4px 15px rgba(22, 172, 212, 0.3)'
                        }}
                    >
                        {saving ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
