"use client"

import * as React from "react"
import { PDIImageData, ImageCategory } from "../pdi-types"
import { Camera, Upload, X, Loader2, Image as ImageIcon, Trash2, SwitchCamera, AlertCircle, Eye, ArrowLeft, Check } from "lucide-react"

export interface EVImageCategoryItem {
    value: ImageCategory | string
    label: string
    icon: string
}

export const EV_IMAGE_CATEGORIES: EVImageCategoryItem[] = [
    { value: 'FRONT_VIEW', label: 'Front Exterior View', icon: '🚘' },
    { value: 'REAR_VIEW', label: 'Rear & Tailgate View', icon: '🚗' },
    { value: 'LEFT_SIDE', label: 'Left Side Profile', icon: '🚙' },
    { value: 'RIGHT_SIDE', label: 'Right Side Profile', icon: '🚙' },
    { value: 'UNDERBODY', label: 'HV Battery Pack & Underbody', icon: '🔋' },
    { value: 'ENGINE', label: 'Electric Motor (EDU) Bay', icon: '⚡' },
    { value: 'DASHBOARD', label: 'Digital Cockpit & Displays', icon: '📟' },
    { value: 'INTERIOR', label: 'Interior Seats & Cabin', icon: '💺' },
    { value: 'BOOT_SPACE', label: 'Boot & Portable EV Charger', icon: '🔌' },
    { value: 'STEPNEY', label: 'Tyre Repair Kit / Inflator', icon: '🛞' },
    { value: 'TYRE_FRONT_LEFT', label: 'Tyres & Alloy Wheels', icon: '⚙️' },
    { value: 'OTHER', label: 'Defect Evidence / Observations', icon: '🔍' },
]

// ── Mobile / Desktop Camera Modal ───────────────────────────────────────────
function EVCameraModal({
    categoryLabel,
    onCapture,
    onClose,
}: {
    categoryLabel: string
    onCapture: (file: File) => void
    onClose: () => void
}) {
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const streamRef = React.useRef<MediaStream | null>(null)
    const fallbackInputRef = React.useRef<HTMLInputElement>(null)
    const [facingMode, setFacingMode] = React.useState<"environment" | "user">("environment")
    const [cameraError, setCameraError] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
    const [capturedBlob, setCapturedBlob] = React.useState<Blob | null>(null)

    React.useEffect(() => {
        let isMounted = true
        let activeStream: MediaStream | null = null

        async function initCamera() {
            setCameraError(null)
            setLoading(true)

            // Stop any previous stream safely
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop())
                streamRef.current = null
            }

            try {
                if (!navigator?.mediaDevices?.getUserMedia) {
                    throw new Error("Direct webcam stream is not supported in this browser. Please use your phone's camera app below.")
                }

                let stream: MediaStream
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: { ideal: facingMode },
                            width: { ideal: 1920 },
                            height: { ideal: 1080 }
                        },
                        audio: false,
                    })
                } catch (constraintErr) {
                    // Fallback to basic video constraint if resolution/facingMode is not supported
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false,
                    })
                }

                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop())
                    return
                }

                activeStream = stream
                streamRef.current = stream

                const video = videoRef.current
                if (video) {
                    video.srcObject = stream
                    video.onloadedmetadata = () => {
                        if (!isMounted) return
                        const playPromise = video.play()
                        if (playPromise !== undefined) {
                            playPromise.catch((err) => {
                                if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
                                    console.warn("Video play notice:", err)
                                }
                            })
                        }
                        setLoading(false)
                    }
                } else {
                    setLoading(false)
                }
            } catch (err: any) {
                if (!isMounted) return
                console.error("Camera error:", err)
                setLoading(false)
                if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                    setCameraError("Camera permission was denied. Please allow camera permissions in your browser or use the native phone camera button below.")
                } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                    setCameraError("No camera hardware found on this device.")
                } else if (err.name !== "AbortError") {
                    setCameraError(err.message || "Could not open camera viewfinder.")
                }
            }
        }

        initCamera()

        return () => {
            isMounted = false
            if (activeStream) {
                activeStream.getTracks().forEach(t => t.stop())
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop())
                streamRef.current = null
            }
        }
    }, [facingMode])

    const handleSnap = () => {
        if (!videoRef.current) return
        const video = videoRef.current
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth || 1280
        canvas.height = video.videoHeight || 720
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
            if (blob) {
                setCapturedBlob(blob)
                setPreviewUrl(URL.createObjectURL(blob))
            }
        }, "image/jpeg", 0.92)
    }

    const handleConfirm = () => {
        if (capturedBlob) {
            const file = new File([capturedBlob], `ev-pdi-${Date.now()}.jpg`, { type: "image/jpeg" })
            onCapture(file)
            onClose()
        }
    }

    const handleRetake = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        setCapturedBlob(null)
    }

    const handleNativeFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onCapture(file)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5">
            {/* Header with Prominent Back Button and Camera Switch Badge */}
            <div className="w-full max-w-lg flex items-center justify-between text-white pb-3 border-b border-cyan-500/20">
                {/* Back Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-mono text-xs font-bold border border-white/15 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 text-cyan-400" />
                    <span>Back</span>
                </button>

                {/* Category Title */}
                <div className="flex flex-col items-center text-center px-2 min-w-0">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300 truncate">
                        {previewUrl ? "Review Photo" : categoryLabel}
                    </span>
                </div>

                {/* Switch Camera Button / Badge */}
                {!previewUrl ? (
                    <button
                        type="button"
                        onClick={() => setFacingMode(prev => prev === "environment" ? "user" : "environment")}
                        disabled={loading || !!cameraError}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold tracking-tight transition-all active:scale-95 disabled:opacity-40 shrink-0"
                        title="Switch between Back and Front camera"
                    >
                        <SwitchCamera className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{facingMode === "environment" ? "Back Cam" : "Front Cam"}</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Viewfinder / Preview Area */}
            <div className="w-full max-w-lg flex-1 my-3 relative rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-cyan-500/30">
                {/* Loader overlay */}
                {loading && !previewUrl && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10 gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                        <span className="text-xs text-cyan-300 font-mono">Opening {facingMode === "environment" ? "Back" : "Front"} Camera...</span>
                    </div>
                )}

                {/* Permanent Video Element (Never unmounted) */}
                <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className={`w-full h-full object-cover ${previewUrl || cameraError ? "hidden" : "block"}`}
                />

                {/* Camera Viewfinder Crosshair Brackets */}
                {!previewUrl && !cameraError && (
                    <div className="absolute inset-4 pointer-events-none flex items-center justify-center">
                        <div className="w-full h-full border border-cyan-500/20 rounded-xl relative">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                        </div>
                    </div>
                )}

                {/* Captured Photo Preview */}
                {previewUrl && (
                    <img
                        src={previewUrl}
                        alt="Captured preview"
                        className="w-full h-full object-contain bg-black"
                    />
                )}

                {/* Error Box with Native Phone Camera Fallback */}
                {cameraError && !previewUrl && (
                    <div className="p-6 text-center max-w-xs space-y-4">
                        <AlertCircle className="w-10 h-10 mx-auto text-amber-400" />
                        <div>
                            <p className="text-white text-xs font-bold mb-1">Camera Stream Notice</p>
                            <p className="text-gray-400 text-[11px] leading-relaxed font-sans">{cameraError}</p>
                        </div>

                        {/* Direct Native Camera Fallback */}
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                ref={fallbackInputRef}
                                onChange={handleNativeFallback}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fallbackInputRef.current?.click()}
                                className="w-full py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.4)]"
                            >
                                <Camera className="w-4 h-4" />
                                <span>Use Phone Camera App</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls Bar */}
            <div className="w-full max-w-lg pb-2">
                {previewUrl ? (
                    // Preview action controls
                    <div className="w-full flex items-center justify-between gap-3 px-2">
                        <button
                            type="button"
                            onClick={handleRetake}
                            className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-mono text-xs font-bold border border-white/15 flex items-center justify-center gap-2 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Retake Photo</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="flex-1 py-3 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black font-mono text-xs font-black tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all"
                        >
                            <Check className="w-4 h-4 text-black stroke-[3]" />
                            <span>Confirm & Upload</span>
                        </button>
                    </div>
                ) : (
                    // Live camera action controls
                    <div className="flex items-center justify-around px-4">
                        {/* Switch Front/Back Camera */}
                        <button
                            type="button"
                            onClick={() => setFacingMode(prev => prev === "environment" ? "user" : "environment")}
                            disabled={loading || !!cameraError}
                            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 text-white border border-white/10 transition-all min-w-[72px] disabled:opacity-30"
                            title="Switch Back or Front Camera"
                        >
                            <SwitchCamera className="w-5 h-5 text-cyan-400" />
                            <span className="text-[9px] font-mono font-bold text-gray-300">
                                {facingMode === "environment" ? "Back 📷" : "Front 🤳"}
                            </span>
                        </button>

                        {/* Big Shutter Button */}
                        <button
                            type="button"
                            onClick={handleSnap}
                            disabled={loading || !!cameraError}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cyan-400 border-4 border-white shadow-[0_0_20px_#00d4ff] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
                            title="Take Photo"
                        >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-black flex items-center justify-center">
                                <Camera className="w-6 h-6 text-black" />
                            </div>
                        </button>

                        {/* Back / Exit Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 text-white border border-white/10 transition-all min-w-[72px]"
                            title="Close Camera and go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-300" />
                            <span className="text-[9px] font-mono font-bold text-gray-300">Back</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Main EV Image Upload Component ───────────────────────────────────────────
export function EVImageUpload({
    images = [],
    onChange,
}: {
    images?: PDIImageData[]
    onChange: (images: PDIImageData[]) => void
}) {
    const [selectedCategory, setSelectedCategory] = React.useState<string>(EV_IMAGE_CATEGORIES[0].value)
    const [uploading, setUploading] = React.useState(false)
    const [cameraOpen, setCameraOpen] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const nativeCameraInputRef = React.useRef<HTMLInputElement>(null)

    const uploadFile = async (category: string, file: File) => {
        setUploading(true)
        setError(null)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("category", category)

            const res = await fetch("/api/pdi/upload-image", {
                method: "POST",
                body: formData,
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to upload image")
            }

            const data = await res.json()
            const newImage: PDIImageData = {
                tempId: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                category: category as ImageCategory,
                imagePath: data.data.filePath,
                fileName: data.data.fileName,
                fileSize: data.data.fileSize,
                preview: data.data.preview,
            }

            onChange([...images, newImage])
        } catch (err: any) {
            console.error("Upload error:", err)
            setError(err.message || "Failed to upload image")
        } finally {
            setUploading(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        for (let i = 0; i < files.length; i++) {
            await uploadFile(selectedCategory, files[i])
        }
        if (fileInputRef.current) fileInputRef.current.value = ""
        if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = ""
    }

    const handleRemove = (imageToRemove: PDIImageData) => {
        onChange(images.filter(img =>
            img.tempId ? img.tempId !== imageToRemove.tempId : img.imagePath !== imageToRemove.imagePath
        ))
    }

    const currentCatObj = EV_IMAGE_CATEGORIES.find(c => c.value === selectedCategory) || EV_IMAGE_CATEGORIES[0]

    return (
        <div className="space-y-4">
            {cameraOpen && (
                <EVCameraModal
                    categoryLabel={currentCatObj.label}
                    onCapture={(file) => uploadFile(selectedCategory, file)}
                    onClose={() => setCameraOpen(false)}
                />
            )}

            {/* Category Selector Bar */}
            <div>
                <label className="block text-[8.5px] font-black uppercase tracking-wider mb-1.5 text-cyan-400/80">
                    Select Vehicle Area / Photo Category
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-cyan-500/20">
                    {EV_IMAGE_CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-tight shrink-0 transition-all flex items-center gap-1.5 border ${
                                selectedCategory === cat.value
                                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.25)]"
                                    : "bg-white/[0.02] text-gray-400 border-white/5 hover:bg-white/[0.05]"
                            }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Upload & Camera Buttons Action Card */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-cyan-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{currentCatObj.icon}</span>
                            <span>{currentCatObj.label}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                            {images.filter(img => img.category === selectedCategory).length} photos attached for this section
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Hidden Native Camera Input (Opens phone camera directly) */}
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={nativeCameraInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Hidden Gallery File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />

                    {/* Camera Button: Take Photo (Opens Camera Viewfinder Directly) */}
                    <button
                        type="button"
                        onClick={() => setCameraOpen(true)}
                        disabled={uploading}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/30 text-xs font-black font-mono transition-all shadow-[0_0_15px_rgba(0,212,255,0.25)] disabled:opacity-50 active:scale-95"
                        title="Open Camera to Take Photo"
                    >
                        <Camera className="w-4 h-4 text-cyan-400" />
                        <span>Take Photo</span>
                    </button>

                    {/* Quick Phone Camera App Button (for mobile direct shooting) */}
                    <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        disabled={uploading}
                        className="sm:inline-flex hidden items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-mono transition-all disabled:opacity-50"
                        title="Direct phone camera capture"
                    >
                        <SwitchCamera className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[11px]">Phone App</span>
                    </button>

                    {/* File Upload / Gallery Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black font-mono tracking-wider transition-all shadow-[0_0_15px_rgba(0,212,255,0.3)] disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>Upload Photo</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Attached Images Grid */}
            {images.length > 0 ? (
                <div>
                    <div className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                        <span>All Attached Vehicle Images ({images.length})</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {images.map((img, i) => {
                            const cat = EV_IMAGE_CATEGORIES.find(c => c.value === img.category)
                            return (
                                <div
                                    key={img.tempId || img.id || i}
                                    className="group relative rounded-xl overflow-hidden bg-black/60 border border-white/10 hover:border-cyan-400/50 transition-all aspect-video"
                                >
                                    {/* Thumbnail */}
                                    <img
                                        src={img.preview || img.imagePath}
                                        alt={img.fileName || "PDI photo"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />

                                    {/* Overlay Category Tag */}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 flex items-center justify-between text-[9px] font-mono text-cyan-300">
                                        <span className="truncate">{cat?.label.split(' ')[0] || img.category}</span>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(img)}
                                        className="absolute top-1 right-1 p-1 rounded-lg bg-black/80 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete photo"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : (
                <div className="py-6 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                    <Camera className="w-6 h-6 text-gray-600 mx-auto mb-1.5" />
                    <p className="text-xs text-gray-400 font-mono">No inspection photos attached yet</p>
                    <p className="text-[10px] text-gray-600 font-sans mt-0.5">Capture or upload photos for battery pack, exterior, interior, or defects</p>
                </div>
            )}
        </div>
    )
}

// ── Report View Component for Displaying Images ──────────────────────────────
// ── Report View Component for Displaying Images ──────────────────────────────
export function EVReportImagesGallery({ images }: { images?: PDIImageData[] }) {
    const [activeImage, setActiveImage] = React.useState<string | null>(null)

    if (!images || images.length === 0) return null

    return (
        <div className="rounded-2xl p-6 print:p-3 bg-[#080b12] border border-cyan-500/20 space-y-4 print:space-y-2">
            <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3 print:pb-1.5">
                <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 print:w-4 print:h-4 text-cyan-400" />
                    <h2 className="text-sm md:text-base print:text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                        Photographic Evidence & Vehicle Images
                    </h2>
                </div>
                <span className="text-xs print:text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2.5 py-1 print:py-0.5 rounded-full border border-cyan-500/30">
                    {images.length} Verified Photos
                </span>
            </div>

            {/* Lightbox Modal (Screen Only) */}
            {activeImage && (
                <div
                    onClick={() => setActiveImage(null)}
                    className="no-print fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img src={activeImage} alt="Inspection zoom" className="max-w-full max-h-[85vh] rounded-xl object-contain border border-cyan-500/30 shadow-2xl" />
                        <button
                            onClick={() => setActiveImage(null)}
                            className="absolute -top-3 -right-3 p-2 rounded-full bg-cyan-500 text-black font-bold shadow-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Thumbnail Grid — 4 Columns in Print */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 print:grid-cols-4 gap-3 print:gap-2">
                {images.map((img, i) => {
                    const cat = EV_IMAGE_CATEGORIES.find(c => c.value === img.category)
                    const rawSrc = img.preview || img.imagePath || ""
                    const src = rawSrc.startsWith("http") || rawSrc.startsWith("/") ? rawSrc : `/${rawSrc}`
                    return (
                        <div
                            key={i}
                            onClick={() => setActiveImage(src)}
                            className="group relative rounded-xl print:rounded-lg overflow-hidden bg-black/80 border border-white/10 hover:border-cyan-400 cursor-pointer transition-all aspect-video print:aspect-auto print:h-28 shadow-md break-inside-avoid"
                            style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                        >
                            <img
                                src={src}
                                alt={img.fileName || "Inspection photo"}
                                loading="eager"
                                decoding="sync"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="no-print absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-black/90 p-1 print:p-0.5 flex items-center justify-between text-[9px] print:text-[8px] font-mono text-cyan-300">
                                <span className="truncate font-bold">{cat?.label || img.category}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
