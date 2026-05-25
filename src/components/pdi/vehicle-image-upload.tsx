"use client"

import * as React from "react"
import { ImageCategory, PDIImageData } from "./pdi-types"
import { Button } from "@/components/ui/button"
import { Camera, X, Upload, Loader2, AlertCircle } from "lucide-react"

interface VehicleImageUploadProps {
    images: PDIImageData[]
    onChange: (images: PDIImageData[]) => void
}

const IMAGE_CATEGORIES: { value: ImageCategory; label: string }[] = [
    { value: 'FRONT_VIEW', label: 'Front View' },
    { value: 'REAR_VIEW', label: 'Rear View' },
    { value: 'LEFT_SIDE', label: 'Left Side View' },
    { value: 'RIGHT_SIDE', label: 'Right Side View' },
    { value: 'INTERIOR', label: 'Interior' },
    { value: 'DASHBOARD', label: 'Dashboard' },
    { value: 'ENGINE', label: 'Engine' },
    { value: 'BOOT_SPACE', label: 'Boot Space' },
    { value: 'STEPNEY', label: 'Stepney / Spare Wheel' },
    { value: 'TYRE_FRONT_LEFT', label: 'Tyre - Front Left' },
    { value: 'TYRE_FRONT_RIGHT', label: 'Tyre - Front Right' },
    { value: 'TYRE_REAR_LEFT', label: 'Tyre - Rear Left' },
    { value: 'TYRE_REAR_RIGHT', label: 'Tyre - Rear Right' },
    { value: 'UNDERBODY', label: 'Underbody' },
    { value: 'OTHER', label: 'Other Images' },
]

export function VehicleImageUpload({ images, onChange }: VehicleImageUploadProps) {
    const [uploading, setUploading] = React.useState<Record<string, boolean>>({})
    const [uploadError, setUploadError] = React.useState<string | null>(null)

    const handleFileSelect = async (category: ImageCategory, files: FileList | null) => {
        if (!files || files.length === 0) return

        setUploadError(null)
        const categoryKey = category

        // Upload each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            // Validate file
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                setUploadError(`Invalid file type: ${file.name}. Only jpg, jpeg, png, webp allowed.`)
                continue
            }

            if (file.size > 5 * 1024 * 1024) {
                setUploadError(`File too large: ${file.name}. Maximum size is 5MB.`)
                continue
            }

            // Set uploading state
            setUploading(prev => ({ ...prev, [categoryKey]: true }))

            try {
                // Upload to server
                const formData = new FormData()
                formData.append('file', file)
                formData.append('category', category)

                const response = await fetch('/api/pdi/upload-image', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Upload failed')
                }

                const result = await response.json()

                // Add to images array
                const newImage: PDIImageData = {
                    tempId: `temp-${Date.now()}-${i}`,
                    category,
                    imagePath: result.data.filePath,
                    fileName: result.data.fileName,
                    fileSize: result.data.fileSize,
                    preview: result.data.preview
                }

                onChange([...images, newImage])
            } catch (error: any) {
                console.error('Upload error:', error)
                setUploadError(error.message || 'Failed to upload image')
            } finally {
                setUploading(prev => ({ ...prev, [categoryKey]: false }))
            }
        }
    }

    const handleRemoveImage = (imageToRemove: PDIImageData) => {
        onChange(images.filter(img =>
            img.tempId ? img.tempId !== imageToRemove.tempId : img.id !== imageToRemove.id
        ))
    }

    const getImagesForCategory = (category: ImageCategory) => {
        return images.filter(img => img.category === category)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/20">
                    <Camera className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-[0.15em] text-slate-900">Vehicle Images</h2>
                <div className="flex-1 h-px bg-slate-200" />
            </div>

            {uploadError && (
                <div className="flex items-center gap-4 bg-rose-50 border border-rose-100 rounded-2xl p-5 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <p className="text-xs text-rose-900 font-bold">{uploadError}</p>
                    <button
                        onClick={() => setUploadError(null)}
                        className="ml-auto w-8 h-8 rounded-xl bg-white border border-rose-100 text-rose-400 hover:text-rose-600 flex items-center justify-center transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {IMAGE_CATEGORIES.map(({ value, label }) => {
                    const categoryImages = getImagesForCategory(value)
                    const isUploading = uploading[value]

                    return (
                        <div
                            key={value}
                            className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md group"
                        >
                            {/* Category Header */}
                            <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">{label}</h3>
                                    <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[9px] font-black text-slate-400 uppercase">
                                        {categoryImages.length} {categoryImages.length === 1 ? 'image' : 'images'}
                                    </span>
                                </div>
                            </div>

                            {/* Images Grid */}
                            <div className="p-5 space-y-4">
                                {categoryImages.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {categoryImages.map((img) => (
                                            <div
                                                key={img.tempId || img.id}
                                                className="relative group/img aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50"
                                            >
                                                <img
                                                    src={img.preview || `/${img.imagePath}`}
                                                    alt={label}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <button
                                                        onClick={() => handleRemoveImage(img)}
                                                        className="w-10 h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-3">
                                                    <p className="text-[9px] font-black text-white/90 truncate uppercase tracking-tighter">{img.fileName}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload Button */}
                                <label className="block">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        multiple
                                        onChange={(e) => handleFileSelect(value, e.target.files)}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                    <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 cursor-pointer transition-all">
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all">
                                                    <Upload className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500">Add Images</span>
                                            </>
                                        )}
                                    </div>
                                </label>

                                <p className="text-[9px] text-slate-400 font-bold text-center uppercase tracking-widest">
                                    Max 5MB • JPG, PNG, WEBP
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="rounded-3xl bg-blue-50 border border-blue-100 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Camera className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-blue-900 uppercase tracking-widest mb-2">Image Upload Tips</p>
                        <ul className="text-xs text-blue-800/70 font-bold space-y-2">
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-blue-300" />
                                Upload multiple images per category for comprehensive documentation
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-blue-300" />
                                Ensure images are clear and well-lit for better visibility in reports
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-blue-300" />
                                You can remove images before saving by clicking the X button
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-blue-300" />
                                Supported formats: JPG, JPEG, PNG, WEBP (max 5MB each)
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
