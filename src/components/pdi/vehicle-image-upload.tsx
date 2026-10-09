"use client"

import * as React from "react"
import { ImageCategory, PDIImageData } from "./pdi-types"
import { Button } from "@/components/ui/button"
import { Camera, X, Upload, Loader2, AlertCircle, ZapIcon, SwitchCamera } from "lucide-react"

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

// ─── Camera Capture Modal ──────────────────────────────────────────────────
interface CameraModalProps {
    categoryLabel: string
    onCapture: (file: File) => void
    onClose: () => void
}

function CameraModal({ categoryLabel, onCapture, onClose }: CameraModalProps) {
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const streamRef = React.useRef<MediaStream | null>(null)
    const [capturedDataUrl, setCapturedDataUrl] = React.useState<string | null>(null)
    const [facingMode, setFacingMode] = React.useState<"environment" | "user">("environment")
    const [cameraError, setCameraError] = React.useState<string | null>(null)
    const [starting, setStarting] = React.useState(true)

    const startCamera = React.useCallback(async (mode: "environment" | "user") => {
        setCameraError(null)
        setStarting(true)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        try {
            if (!navigator?.mediaDevices?.getUserMedia) {
                throw new Error("Direct webcam stream is not supported on this browser.")
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false,
            })
            streamRef.current = stream
            const video = videoRef.current
            if (video) {
                video.srcObject = stream
                video.onloadedmetadata = () => {
                    const playPromise = video.play()
                    if (playPromise !== undefined) {
                        playPromise.catch((err) => {
                            if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
                                console.warn("Play error:", err)
                            }
                        })
                    }
                    setStarting(false)
                }
            } else {
                setStarting(false)
            }
        } catch (err: any) {
            console.error("Camera error:", err)
            setStarting(false)
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                setCameraError("Camera permission denied. Please allow camera permissions in browser settings.")
            } else if (err.name !== "AbortError") {
                setCameraError(err.message || "Camera access not available.")
            }
        }
    }, [])

    React.useEffect(() => {
        startCamera(facingMode)
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop())
                streamRef.current = null
            }
        }
    }, [facingMode, startCamera])

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return
        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(video, 0, 0)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92)
        setCapturedDataUrl(dataUrl)
        // Stop camera while previewing
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }

    const handleRetake = () => {
        setCapturedDataUrl(null)
        startCamera(facingMode)
    }

    const handleConfirm = () => {
        if (!capturedDataUrl) return
        // Convert dataURL to File
        const arr = capturedDataUrl.split(",")
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg"
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) u8arr[n] = bstr.charCodeAt(n)
        const file = new File([u8arr], `photo-${Date.now()}.jpg`, { type: mime })
        onCapture(file)
        onClose()
    }

    const switchCamera = () => {
        setFacingMode(prev => prev === "environment" ? "user" : "environment")
        setCapturedDataUrl(null)
    }

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
                            <Camera className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Taking Photo</p>
                            <p className="text-sm font-black text-white">{categoryLabel}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Camera / Preview Area */}
                <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
                    {/* Always mounted video element */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraError || capturedDataUrl ? "hidden" : "block"}`}
                    />

                    {/* Loading Spinner */}
                    {starting && !cameraError && !capturedDataUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                    )}

                    {/* Error Overlay */}
                    {cameraError && !capturedDataUrl && (
                        <div className="flex flex-col items-center gap-3 p-6 text-center z-10">
                            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                                <AlertCircle className="w-7 h-7 text-rose-400" />
                            </div>
                            <p className="text-sm font-bold text-rose-300">{cameraError}</p>
                            <p className="text-xs text-slate-400">Please check browser permissions or use the upload button.</p>
                        </div>
                    )}

                    {/* Captured image snapshot */}
                    {capturedDataUrl && (
                        <img src={capturedDataUrl} alt="Captured" className="w-full h-full object-contain" />
                    )}

                    {/* Crosshair overlay */}
                    {!cameraError && !capturedDataUrl && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-48 h-48 border-2 border-white/30 rounded-2xl">
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-xl" />
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-xl" />
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-xl" />
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-xl" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Action Buttons */}
                <div className="px-5 py-4 border-t border-white/10">
                    {capturedDataUrl ? (
                        <div className="flex items-center gap-3">
                            <button onClick={handleRetake} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest transition-all border border-white/10">
                                <Camera className="w-4 h-4" /> Retake
                            </button>
                            <button onClick={handleConfirm} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/30">
                                <ZapIcon className="w-4 h-4" /> Use Photo
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button onClick={switchCamera} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/10" title="Switch Camera">
                                <SwitchCamera className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleCapture}
                                disabled={starting || !!cameraError}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                            >
                                <Camera className="w-5 h-5" /> Capture Photo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Main Upload Component ──────────────────────────────────────────────────
export function VehicleImageUpload({ images, onChange }: VehicleImageUploadProps) {
    const [uploading, setUploading] = React.useState<Record<string, boolean>>({})
    const [uploadError, setUploadError] = React.useState<string | null>(null)
    const [cameraCategory, setCameraCategory] = React.useState<ImageCategory | null>(null)

    // Shared upload logic — works for both file picker and camera capture
    const uploadFile = async (category: ImageCategory, file: File) => {
        setUploadError(null)

        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
            setUploadError(`Invalid file type: ${file.name}. Only jpg, jpeg, png, webp allowed.`)
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError(`File too large: ${file.name}. Maximum size is 5MB.`)
            return
        }

        setUploading(prev => ({ ...prev, [category]: true }))
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('category', category)

            const response = await fetch('/api/pdi/upload-image', { method: 'POST', body: formData })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Upload failed')
            }

            const result = await response.json()

            const newImage: PDIImageData = {
                tempId: `temp-${Date.now()}`,
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
            setUploading(prev => ({ ...prev, [category]: false }))
        }
    }

    const handleFileSelect = async (category: ImageCategory, files: FileList | null) => {
        if (!files || files.length === 0) return
        for (let i = 0; i < files.length; i++) {
            await uploadFile(category, files[i])
        }
    }

    const handleCameraCapture = async (category: ImageCategory, file: File) => {
        await uploadFile(category, file)
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
            {/* Camera Capture Modal */}
            {cameraCategory && (
                <CameraModal
                    categoryLabel={IMAGE_CATEGORIES.find(c => c.value === cameraCategory)?.label || cameraCategory}
                    onCapture={(file) => handleCameraCapture(cameraCategory, file)}
                    onClose={() => setCameraCategory(null)}
                />
            )}

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

                                {/* Upload + Camera Buttons */}
                                {isUploading ? (
                                    <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30">
                                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Uploading...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Upload from Gallery/File */}
                                        <label className="block cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                multiple
                                                onChange={(e) => handleFileSelect(value, e.target.files)}
                                                className="hidden"
                                            />
                                            <div className="flex flex-col items-center justify-center gap-2 px-3 py-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 transition-all group/btn">
                                                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover/btn:bg-blue-500 group-hover/btn:border-blue-500 transition-all">
                                                    <Upload className="w-4 h-4 text-slate-400 group-hover/btn:text-white transition-colors" />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover/btn:text-blue-500 text-center transition-colors">Upload</span>
                                            </div>
                                        </label>

                                        {/* Take Photo with Camera */}
                                        <button
                                            type="button"
                                            onClick={() => setCameraCategory(value)}
                                            className="flex flex-col items-center justify-center gap-2 px-3 py-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 transition-all group/cam"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover/cam:bg-emerald-500 group-hover/cam:border-emerald-500 transition-all">
                                                <Camera className="w-4 h-4 text-slate-400 group-hover/cam:text-white transition-colors" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover/cam:text-emerald-500 text-center transition-colors">Take Photo</span>
                                        </button>
                                    </div>
                                )}

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
                                Click <strong>Upload</strong> to select from gallery or files
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                Click <strong>Take Photo</strong> to use device camera — auto uploads instantly
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-blue-300" />
                                Ensure images are clear and well-lit for better visibility in reports
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
