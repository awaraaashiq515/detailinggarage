"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Building2, Users, LocateFixed, ZoomIn, ZoomOut, Layers, Eye } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
type StaffLocation = {
    id: string
    name: string
    phone?: string | null
    role: string
    todayStatus: string
    latitude: number | null
    longitude: number | null
    distanceMeters: number | null
    checkIn: string | null
    punchMethod?: string | null
    activeJob: { vehicleName: string; jobNumber: string } | null
}

type ShopLocation = {
    latitude: number | null
    longitude: number | null
    geofenceRadius: number
}

const ROLE_LABELS: Record<string, string> = {
    TECHNICIAN: "Detailing Tech",
    PPF_INSTALLER: "PPF Installer",
    CERAMIC_SPECIALIST: "Ceramic Expert",
    PAINTER: "Painter",
    MECHANIC: "Mechanic",
    WASHER: "Washer",
    MANAGER: "Manager",
    HELPER: "Helper",
    DETAILER: "Detailer",
    DENTER: "Denter",
}

const ROLE_COLORS: Record<string, string> = {
    TECHNICIAN: "#16acd4",
    PPF_INSTALLER: "#c084fc",
    CERAMIC_SPECIALIST: "#38bdf8",
    PAINTER: "#fb923c",
    MECHANIC: "#f472b6",
    WASHER: "#34d399",
    MANAGER: "#fbbf24",
    HELPER: "#94a3b8",
    DETAILER: "#16acd4",
    DENTER: "#fb923c",
}

const STATUS_COLORS: Record<string, string> = {
    PRESENT: "#34d399",
    ABSENT: "#f87171",
    HALF_DAY: "#fbbf24",
    LEAVE: "#94a3b8",
    NOT_MARKED: "#6b7280",
}

type MapLayerType = "dark" | "satellite" | "street"

interface Props {
    staff: StaffLocation[]
    shopLocation: ShopLocation | null
    selectedId: string | null
    onSelectStaff: (id: string) => void
}

export default function StaffMap({ staff, shopLocation, selectedId, onSelectStaff }: Props) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<any>(null)
    const LRef = useRef<any>(null)
    const tileLayersRef = useRef<{ darkBase?: any; darkRef?: any; satellite?: any; street?: any }>({})
    const markersRef = useRef<Map<string, any>>(new Map())
    const shopMarkerRef = useRef<any>(null)
    const geofenceCircleRef = useRef<any>(null)
    const [isMapReady, setIsMapReady] = useState(false)
    const [layerType, setLayerType] = useState<MapLayerType>("dark")

    // Ref to hold onSelectStaff callback so event listeners never get stale
    const onSelectStaffRef = useRef(onSelectStaff)
    onSelectStaffRef.current = onSelectStaff

    const selectedIdRef = useRef(selectedId)
    selectedIdRef.current = selectedId

    // ── Switch Tile Layers ───────────────────────────────────────────────────
    const switchLayer = useCallback((type: MapLayerType) => {
        if (!mapRef.current || !tileLayersRef.current) return
        const map = mapRef.current
        const { darkBase, darkRef, satellite, street } = tileLayersRef.current

        // Remove all layers
        if (darkBase && map.hasLayer(darkBase)) map.removeLayer(darkBase)
        if (darkRef && map.hasLayer(darkRef)) map.removeLayer(darkRef)
        if (satellite && map.hasLayer(satellite)) map.removeLayer(satellite)
        if (street && map.hasLayer(street)) map.removeLayer(street)

        if (type === "dark") {
            if (darkBase) map.addLayer(darkBase)
            if (darkRef) map.addLayer(darkRef)
        } else if (type === "satellite") {
            if (satellite) map.addLayer(satellite)
            if (darkRef) map.addLayer(darkRef)
        } else if (type === "street") {
            if (street) map.addLayer(street)
        }
        setLayerType(type)
    }, [])

    // ── Initialize Leaflet Map ────────────────────────────────────────────────
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return

        let isMounted = true

        import("leaflet").then((L) => {
            if (!isMounted || !mapContainerRef.current || mapRef.current) return

            LRef.current = L

            // Fix default icon paths
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            })

            // Initial center
            const staffWithGps = staff.filter(s => s.latitude && s.longitude)
            let center: [number, number] = [31.701021, 76.951083]
            let zoom = 16

            if (shopLocation?.latitude && shopLocation?.longitude) {
                center = [shopLocation.latitude, shopLocation.longitude]
            } else if (staffWithGps.length > 0) {
                center = [staffWithGps[0].latitude!, staffWithGps[0].longitude!]
            }

            const map = L.map(mapContainerRef.current, {
                center,
                zoom,
                zoomControl: false,
                attributionControl: false,
                closePopupOnClick: false, // Don't close popup randomly on map clicks or drag!
            })

            // 1. ESRI Dark Gray Base & Reference (reliable, high-contrast, scalable)
            const darkBase = L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
                { maxNativeZoom: 15, maxZoom: 19, attribution: "Esri" }
            )
            const darkRef = L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
                { maxNativeZoom: 15, maxZoom: 19 }
            )

            // 2. ESRI World Imagery (Satellite view)
            const satellite = L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                { maxNativeZoom: 18, maxZoom: 19, attribution: "Esri Satellite" }
            )

            // 3. OpenStreetMap standard (Streets)
            const street = L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                { maxNativeZoom: 19, maxZoom: 19, attribution: "OpenStreetMap" }
            )

            tileLayersRef.current = { darkBase, darkRef, satellite, street }

            darkBase.addTo(map)
            darkRef.addTo(map)

            L.control.attribution({ position: "bottomright", prefix: false }).addTo(map)

            mapRef.current = map
            setIsMapReady(true)
        })

        return () => {
            isMounted = false
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
                setIsMapReady(false)
            }
        }
    }, [])

    // ── EFFECT 1: Update Markers ONLY when staff or shop data changes ──────────
    // Notice: `selectedId` is deliberately excluded here so selecting a staff member
    // DOES NOT destroy and recreate the marker/popup!
    useEffect(() => {
        if (!isMapReady || !mapRef.current || !LRef.current) return

        const L = LRef.current
        const map = mapRef.current

        // ── Draw Shop Marker & Geofence ───────────────────────────────────────
        if (shopMarkerRef.current) {
            shopMarkerRef.current.remove()
            shopMarkerRef.current = null
        }
        if (geofenceCircleRef.current) {
            geofenceCircleRef.current.remove()
            geofenceCircleRef.current = null
        }

        const staffAtShop = staff.filter(s =>
            s.latitude != null &&
            s.distanceMeters != null &&
            shopLocation?.geofenceRadius != null &&
            s.distanceMeters <= shopLocation.geofenceRadius
        )

        if (shopLocation?.latitude && shopLocation?.longitude) {
            const shopIconHtml = `
                <div style="position:relative;display:flex;align-items:center;justify-content:center;">
                    <div style="
                        position:absolute;width:56px;height:56px;border-radius:18px;
                        background:rgba(22,172,212,0.18);
                        animation:shopPulse 2s infinite ease-out;
                    "></div>
                    <div style="
                        position:relative;width:44px;height:44px;border-radius:14px;
                        background:linear-gradient(135deg, #0f2230 0%, #081119 100%);
                        border:2px solid #16acd4;
                        display:flex;align-items:center;justify-content:center;
                        box-shadow:0 0 24px rgba(22,172,212,0.65), 0 4px 14px rgba(0,0,0,0.8);
                        cursor:pointer;
                    ">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16acd4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                    </div>
                    <div style="
                        position:absolute;bottom:-18px;
                        background:#16acd4;color:#000;
                        font-size:9px;font-weight:900;letter-spacing:0.8px;
                        padding:1px 7px;border-radius:6px;
                        box-shadow:0 2px 8px rgba(0,0,0,0.6);
                        white-space:nowrap;
                    ">WORKSHOP</div>
                </div>`

            const shopIcon = L.divIcon({
                html: shopIconHtml,
                className: "custom-map-icon",
                iconSize: [46, 46],
                iconAnchor: [23, 23],
                popupAnchor: [0, -28],
            })

            const shopPopupContent = `
                <div style="background:#18181b;color:#fff;padding:14px 18px;border-radius:14px;border:1px solid rgba(22,172,212,0.4);font-family:system-ui;min-width:210px;">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                        <span style="width:8px;height:8px;border-radius:50%;background:#16acd4;display:inline-block;box-shadow:0 0 8px #16acd4;"></span>
                        <strong style="font-size:11px;color:#16acd4;letter-spacing:1px;text-transform:uppercase;">Workshop HQ</strong>
                    </div>
                    <div style="font-size:15px;font-weight:800;color:#fff;">Detailing Garage</div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:6px;display:flex;align-items:center;justify-content:space-between;">
                        <span>Geofence Radius:</span>
                        <strong style="color:#16acd4;">${shopLocation.geofenceRadius}m</strong>
                    </div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:4px;display:flex;align-items:center;justify-content:space-between;">
                        <span>Staff Present:</span>
                        <strong style="color:#34d399;">${staffAtShop.length} active</strong>
                    </div>
                    ${staffAtShop.length > 0 ? `
                    <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;">
                        ${staffAtShop.map(s => `<div style="color:#e4e4e7;margin-top:2px;">• <strong>${s.name}</strong> (${ROLE_LABELS[s.role] || s.role})</div>`).join("")}
                    </div>` : ""}
                </div>`

            shopMarkerRef.current = L.marker(
                [shopLocation.latitude, shopLocation.longitude],
                { icon: shopIcon, zIndexOffset: 300 }
            )
                .addTo(map)
                .bindPopup(shopPopupContent, {
                    className: "custom-staff-popup",
                    closeButton: true,
                    autoClose: false,
                    closeOnClick: false,
                    autoPan: true,
                    autoPanPaddingTopLeft: [50, 150],
                    autoPanPaddingBottomRight: [50, 50],
                })

            geofenceCircleRef.current = L.circle(
                [shopLocation.latitude, shopLocation.longitude],
                {
                    radius: shopLocation.geofenceRadius,
                    color: "#16acd4",
                    fillColor: "#16acd4",
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: "6 5",
                }
            ).addTo(map)
        }

        // ── Clear and rebuild staff markers ───────────────────────────────────
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current.clear()

        const staffWithCoords = staff.filter(s => s.latitude != null && s.longitude != null)

        staffWithCoords.forEach((member, index) => {
            let lat = member.latitude!
            let lng = member.longitude!

            // Fan out if at exact same shop coordinate so both are fully visible
            const isAtShopCoords = shopLocation?.latitude && shopLocation?.longitude &&
                Math.abs(lat - shopLocation.latitude) < 0.0001 &&
                Math.abs(lng - shopLocation.longitude) < 0.0001

            if (isAtShopCoords && shopLocation?.latitude && shopLocation?.longitude) {
                const angle = (index * (2 * Math.PI / Math.max(staffWithCoords.length, 3))) + 0.5
                const offsetRadius = 0.00025
                lat = shopLocation.latitude + (Math.sin(angle) * offsetRadius)
                lng = shopLocation.longitude + (Math.cos(angle) * offsetRadius)
            }

            const roleColor = ROLE_COLORS[member.role] || "#16acd4"
            const statusColor = STATUS_COLORS[member.todayStatus] || "#6b7280"
            const initials = member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

            const markerHtml = `
                <div id="staff-pin-${member.id}" style="position:relative;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                    <div class="staff-pulse-ring" style="
                        display:none;
                        position:absolute;width:60px;height:60px;border-radius:20px;
                        background:rgba(${hexToRgb(roleColor)},0.35);
                        animation:staffPulse 1.8s infinite ease-out;
                    "></div>
                    <div class="staff-avatar-box" style="
                        position:relative;
                        width:42px;height:42px;
                        border-radius:13px;
                        background:linear-gradient(135deg, rgba(20,20,25,0.96), rgba(${hexToRgb(roleColor)},0.32));
                        border:2px solid ${roleColor};
                        display:flex;align-items:center;justify-content:center;
                        font-weight:800;font-size:13px;
                        color:#fff;
                        font-family:system-ui;
                        box-shadow:0 0 14px rgba(${hexToRgb(roleColor)},0.5), 0 4px 12px rgba(0,0,0,0.8);
                        transition:all 0.2s;
                    ">
                        ${initials}
                    </div>
                    <span style="
                        position:absolute;bottom:-2px;right:-2px;
                        width:13px;height:13px;border-radius:50%;
                        background:${statusColor};
                        border:2px solid #0e0e10;
                        box-shadow:0 0 8px ${statusColor};
                    "></span>
                </div>`

            const staffIcon = L.divIcon({
                html: markerHtml,
                className: "custom-map-icon",
                iconSize: [44, 44],
                iconAnchor: [22, 22],
                popupAnchor: [0, -26],
            })

            const distText = member.distanceMeters != null
                ? (member.distanceMeters <= (shopLocation?.geofenceRadius || 150) ? `At Shop (${member.distanceMeters}m)` : `${(member.distanceMeters / 1000).toFixed(1)}km from shop`)
                : "Distance unknown"

            const popupContent = `
                <div style="background:#141416;color:#fff;padding:16px 18px;border-radius:16px;border:1.5px solid rgba(${hexToRgb(roleColor)},0.5);font-family:system-ui;min-width:210px;box-shadow:0 12px 30px rgba(0,0,0,0.8);">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-right:20px;">
                        <div style="
                            width:38px;height:38px;border-radius:11px;
                            background:rgba(${hexToRgb(roleColor)},0.2);
                            border:1.5px solid ${roleColor};
                            display:flex;align-items:center;justify-content:center;
                            font-weight:800;font-size:13px;color:${roleColor};
                        ">${initials}</div>
                        <div>
                            <div style="font-size:14px;font-weight:800;color:#fff;line-height:1.2;">${member.name}</div>
                            <div style="font-size:11px;color:${roleColor};font-weight:700;margin-top:2px;">${ROLE_LABELS[member.role] || member.role}</div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8;margin-bottom:5px;">
                        <span>⏱️ Check-in:</span>
                        <strong style="color:#fff;">${member.checkIn || "--"}</strong>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8;margin-bottom:6px;">
                        <span>📍 Status:</span>
                        <strong style="color:${statusColor};">${distText}</strong>
                    </div>
                    ${member.activeJob ? `
                    <div style="margin-top:10px;padding:8px 10px;border-radius:10px;background:rgba(251,146,60,0.14);border:1px solid rgba(251,146,60,0.35);">
                        <div style="font-size:10px;color:#fb923c;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">🔧 Active Job: ${member.activeJob.jobNumber}</div>
                        <div style="font-size:12px;color:#fff;font-weight:700;margin-top:2px;">${member.activeJob.vehicleName}</div>
                    </div>` : ""}
                </div>`

            const marker = L.marker(
                [lat, lng],
                { icon: staffIcon, zIndexOffset: 700 }
            )
                .addTo(map)
                .bindPopup(popupContent, {
                    className: "custom-staff-popup",
                    closeButton: true,
                    autoClose: false,
                    closeOnClick: false,
                    autoPan: true,
                    autoPanPaddingTopLeft: [50, 150], // Plenty of clearance below top controls
                    autoPanPaddingBottomRight: [50, 50],
                })

            // Click opens popup and notifies parent
            marker.on("click", () => {
                marker.openPopup()
                onSelectStaffRef.current(member.id)
            })

            // Popup close resets selection if it was selected
            marker.on("popupclose", () => {
                if (selectedIdRef.current === member.id) {
                    onSelectStaffRef.current("")
                }
            })

            markersRef.current.set(member.id, marker)
        })

        // Initial fit bounds
        const allPoints: [number, number][] = []
        if (shopLocation?.latitude && shopLocation?.longitude) {
            allPoints.push([shopLocation.latitude, shopLocation.longitude])
        }
        staffWithCoords.forEach(s => {
            allPoints.push([s.latitude!, s.longitude!])
        })

        if (allPoints.length > 1) {
            map.fitBounds(allPoints, { padding: [70, 70], maxZoom: 16 })
        } else if (allPoints.length === 1) {
            map.setView(allPoints[0], 16)
        }
    }, [isMapReady, staff, shopLocation])

    // ── EFFECT 2: Handle Selection ONLY (Fly-to & highlight, without recreating markers) ──
    useEffect(() => {
        if (!isMapReady || !mapRef.current) return
        const map = mapRef.current

        // Update visual pulse rings on all markers
        staff.forEach(s => {
            const el = document.getElementById(`staff-pin-${s.id}`)
            if (el) {
                const ring = el.querySelector(".staff-pulse-ring") as HTMLElement
                const avatar = el.querySelector(".staff-avatar-box") as HTMLElement
                const isSelected = selectedId === s.id
                if (ring) ring.style.display = isSelected ? "block" : "none"
                if (avatar) {
                    avatar.style.transform = isSelected ? "scale(1.15)" : "scale(1)"
                    avatar.style.borderColor = isSelected ? "#fff" : (ROLE_COLORS[s.role] || "#16acd4")
                }
            }
        })

        if (selectedId) {
            const selMarker = markersRef.current.get(selectedId)
            const selMember = staff.find(s => s.id === selectedId)

            if (selMarker && selMember?.latitude && selMember?.longitude) {
                // Fly smoothly to marker
                map.flyTo([selMember.latitude, selMember.longitude], 16, { duration: 0.6 })
                // Open popup without flickering
                setTimeout(() => {
                    selMarker.openPopup()
                }, 200)
            }
        }
    }, [isMapReady, selectedId, staff])

    // ── Controls handlers ─────────────────────────────────────────────────────
    const handleRecenterAll = useCallback(() => {
        if (!mapRef.current) return
        const allPoints: [number, number][] = []
        if (shopLocation?.latitude && shopLocation?.longitude) {
            allPoints.push([shopLocation.latitude, shopLocation.longitude])
        }
        staff.forEach(s => {
            if (s.latitude && s.longitude) allPoints.push([s.latitude, s.longitude])
        })
        if (allPoints.length > 1) {
            mapRef.current.fitBounds(allPoints, { padding: [70, 70], maxZoom: 16 })
        } else if (allPoints.length === 1) {
            mapRef.current.setView(allPoints[0], 16)
        }
    }, [staff, shopLocation])

    const handleFocusShop = useCallback(() => {
        if (!mapRef.current || !shopLocation?.latitude || !shopLocation?.longitude) return
        mapRef.current.flyTo([shopLocation.latitude, shopLocation.longitude], 16, { duration: 0.6 })
        if (shopMarkerRef.current) {
            setTimeout(() => {
                shopMarkerRef.current.openPopup()
            }, 250)
        }
    }, [shopLocation])

    const handleZoomIn = () => mapRef.current?.zoomIn()
    const handleZoomOut = () => mapRef.current?.zoomOut()

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden group select-none">
            {/* Map Element */}
            <div
                ref={mapContainerRef}
                className="w-full h-full rounded-2xl"
                style={{ minHeight: "440px", background: "#0e0e10" }}
            />

            {/* TOP-LEFT: Map Layer Selector (Leaves center clear for popups!) */}
            <div className="absolute top-3.5 left-3.5 z-[400] flex items-center gap-1 p-1 rounded-xl bg-[#131315]/95 backdrop-blur-md border border-white/10 shadow-xl">
                <button
                    onClick={() => switchLayer("dark")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        layerType === "dark"
                            ? "bg-[#16acd4]/25 text-[#16acd4] border border-[#16acd4]/40"
                            : "text-zinc-400 hover:text-white"
                    }`}
                >
                    🌙 Dark
                </button>
                <button
                    onClick={() => switchLayer("satellite")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        layerType === "satellite"
                            ? "bg-[#16acd4]/25 text-[#16acd4] border border-[#16acd4]/40"
                            : "text-zinc-400 hover:text-white"
                    }`}
                >
                    🛰️ Satellite
                </button>
                <button
                    onClick={() => switchLayer("street")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        layerType === "street"
                            ? "bg-[#16acd4]/25 text-[#16acd4] border border-[#16acd4]/40"
                            : "text-zinc-400 hover:text-white"
                    }`}
                >
                    🗺️ Street
                </button>
            </div>

            {/* TOP-RIGHT: Focus Buttons + Zoom (Leaves center clear for popups!) */}
            <div className="absolute top-3.5 right-3.5 z-[400] flex items-center gap-2">
                <button
                    onClick={handleFocusShop}
                    title="Focus Workshop HQ"
                    className="px-3 py-1.5 rounded-xl text-zinc-300 hover:text-white bg-[#131315]/95 hover:bg-[#1c1c20] border border-white/10 backdrop-blur-md transition-all shadow-xl flex items-center gap-1.5 text-xs font-semibold"
                >
                    <Building2 className="w-3.5 h-3.5 text-[#16acd4]" />
                    <span className="hidden sm:inline">Workshop</span>
                </button>
                <button
                    onClick={handleRecenterAll}
                    title="Fit All Staff & Shop"
                    className="px-3 py-1.5 rounded-xl text-zinc-300 hover:text-white bg-[#131315]/95 hover:bg-[#1c1c20] border border-white/10 backdrop-blur-md transition-all shadow-xl flex items-center gap-1.5 text-xs font-semibold"
                >
                    <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Fit All</span>
                </button>
                <div className="flex items-center rounded-xl overflow-hidden border border-white/10 bg-[#131315]/95 backdrop-blur-md shadow-xl">
                    <button
                        onClick={handleZoomIn}
                        title="Zoom In"
                        className="p-1.5 px-2 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors border-r border-white/10"
                    >
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        title="Zoom Out"
                        className="p-1.5 px-2 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* BOTTOM-LEFT: Map Legend Overlay */}
            <div className="absolute bottom-3.5 left-3.5 z-[400] px-3 py-1.5 rounded-xl bg-[#131315]/95 backdrop-blur-md border border-white/10 shadow-xl flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16acd4] shadow-[0_0_8px_#16acd4]"></span>
                    <span className="text-zinc-300 font-medium">Workshop HQ</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                    <span className="text-zinc-300 font-medium">At Shop</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span>
                    <span className="text-zinc-300 font-medium">Off-Site</span>
                </div>
            </div>

            {/* Custom Leaflet Styles */}
            <style jsx global>{`
                @keyframes shopPulse {
                    0% { transform: scale(0.9); opacity: 0.8; }
                    50% { transform: scale(1.35); opacity: 0.15; }
                    100% { transform: scale(0.9); opacity: 0.8; }
                }
                @keyframes staffPulse {
                    0% { transform: scale(0.85); opacity: 0.85; }
                    50% { transform: scale(1.35); opacity: 0.15; }
                    100% { transform: scale(0.85); opacity: 0.85; }
                }
                .custom-map-icon {
                    background: transparent !important;
                    border: none !important;
                }
                .leaflet-div-icon {
                    background: transparent !important;
                    border: none !important;
                }
                .custom-staff-popup .leaflet-popup-content-wrapper {
                    background: rgba(18, 18, 20, 0.98) !important;
                    backdrop-filter: blur(14px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 18px !important;
                    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.85) !important;
                    padding: 0 !important;
                    overflow: visible !important;
                }
                .custom-staff-popup .leaflet-popup-content {
                    margin: 0 !important;
                    line-height: 1.4 !important;
                }
                .custom-staff-popup .leaflet-popup-tip {
                    background: rgba(18, 18, 20, 0.98) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                }
                .custom-staff-popup .leaflet-popup-close-button {
                    color: #a1a1aa !important;
                    top: 10px !important;
                    right: 10px !important;
                    font-size: 16px !important;
                    width: 22px !important;
                    height: 22px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 8px !important;
                    background: rgba(255, 255, 255, 0.08) !important;
                    text-decoration: none !important;
                    transition: all 0.2s !important;
                }
                .custom-staff-popup .leaflet-popup-close-button:hover {
                    color: #ffffff !important;
                    background: rgba(255, 255, 255, 0.2) !important;
                }
            `}</style>
        </div>
    )
}

function hexToRgb(hex: string): string {
    const clean = hex.replace("#", "")
    const r = parseInt(clean.slice(0, 2), 16) || 22
    const g = parseInt(clean.slice(2, 4), 16) || 172
    const b = parseInt(clean.slice(4, 6), 16) || 212
    return `${r},${g},${b}`
}
