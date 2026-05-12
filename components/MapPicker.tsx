// components/MapPicker.tsx
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icon in Next.js
// Fix for default marker icon in Next.js

interface MapPickerProps {
    latitude?: number
    longitude?: number
    center?: [number, number] | null // New prop for external center control
    onChange: (coords: { latitude: number; longitude: number; district?: string; province?: string }) => void
}

function LocationMarker({
    position,
    setPositionCallback,
    onChange
}: {
    position: [number, number] | null
    setPositionCallback: (pos: [number, number]) => void
    onChange: (coords: { latitude: number; longitude: number; district?: string; province?: string }) => void
}) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng
            setPositionCallback([lat, lng])

            // Reverse geocoding ผ่าน API Proxy (หลีกเลี่ยง CORS)
            fetch(`/api/geocode?lat=${lat}&lon=${lng}`)
                .then(res => res.json())
                .then(data => {
                    const address = data.address || {}
                    onChange({
                        latitude: lat,
                        longitude: lng,
                        district: address.district || address.suburb || address.city_district || address.town || "",
                        province: address.state || address.province || address.city || "",
                    })
                })
                .catch(() => {
                    onChange({
                        latitude: lat,
                        longitude: lng,
                    })
                })
        },
    })

    return position ? <Marker position={position} /> : null
}

// Map Controller to handle flying to new center
function MapController({ center }: { center?: [number, number] | null }) {
    const map = useMap()

    useEffect(() => {
        if (center) {
            map.flyTo(center, 10, {
                duration: 1.5
            })
        }
    }, [center, map])

    return null
}

export default function MapPicker({ latitude, longitude, center, onChange }: MapPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        typeof latitude === 'number' && typeof longitude === 'number' ? [latitude, longitude] : null
    )
    const [mounted, setMounted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Thailand Bounds
    const maxBounds: L.LatLngBoundsExpression = [
        [5.61, 97.34], // South West
        [20.46, 105.63] // North East
    ]

    // Default center: Bangkok
    const defaultCenter: [number, number] = [13.7563, 100.5018]

    // Wrap setPosition in useCallback to avoid dependency issues
    const setPositionCallback = useCallback((pos: [number, number]) => {
        setPosition(pos)
    }, [])

    // Sync position with props
    useEffect(() => {
        if (typeof latitude === 'number' && typeof longitude === 'number') {
            setPosition([latitude, longitude])
        }
    }, [latitude, longitude])


    useEffect(() => {
        // Fix for default marker icon in Next.js
        /* @ts-expect-error - Leaflet type definitions don't include this property */
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
    }, [])

    useEffect(() => {
        // Use setTimeout to avoid calling setState synchronously in effect
        const timer = setTimeout(() => {
            setMounted(true)
        }, 0)
        return () => {
            clearTimeout(timer)
            // Cleanup Leaflet instance from DOM to prevent "Map container is being reused"
            if (containerRef.current) {
                // @ts-ignore
                delete containerRef.current._leaflet_id
            }
        }
    }, [])

    if (!mounted) {
        return (
            <div className="h-[450px] w-full bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-xs text-muted-foreground">กำลังโหลดแผนที่...</span>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div ref={containerRef} className="h-[450px] w-full rounded-md overflow-hidden border">
                <MapContainer
                    key="map-picker-instance" // Fixed key for stability
                    center={(center || position || defaultCenter) as L.LatLngExpression}
                    zoom={position ? 15 : 6}
                    className="h-full w-full"
                    scrollWheelZoom={true}
                    maxBounds={maxBounds}
                    maxBoundsViscosity={1.0}
                    minZoom={5}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                        position={position}
                        setPositionCallback={setPositionCallback}
                        onChange={onChange}
                    />
                    <MapController center={center} />
                </MapContainer>
            </div>
            <p className="text-xs text-muted-foreground">
                คลิกบนแผนที่เพื่อเลือกตำแหน่ง {position && `(${position[0].toFixed(6)}, ${position[1].toFixed(6)})`}
            </p>
        </div>
    )
}
