// components/DashboardMap.tsx
"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"

// Fix for default marker icons in Leaflet with Next.js
// Fix for default marker icons in Leaflet with Next.js applied in useEffect

interface Pin {
    projectName: string
    lat?: number
    lng?: number
    latitude?: number
    longitude?: number
}

interface DashboardMapProps {
    pins: Pin[]
}

export default function DashboardMap({ pins }: DashboardMapProps) {
    useEffect(() => {
        // Fix for default marker icon in Next.js (Client Side Only)
        /* @ts-expect-error - Leaflet type definitions don't include this property */
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }, []);

    // Center map on Thailand if pins exist, otherwise a default
    const center: [number, number] = pins.length > 0 && pins[0]?.lat && pins[0]?.lng
        ? [pins[0].lat, pins[0].lng]
        : [13.7367, 100.5231] // Bangkok

    // Filter valid pins
    const validPins = pins.filter(pin => {
        const lat = pin.lat || pin.latitude;
        const lng = pin.lng || pin.longitude;
        return lat && lng && pin.projectName;
    }).map(pin => ({
        projectName: pin.projectName,
        lat: pin.lat || pin.latitude,
        lng: pin.lng || pin.longitude
    }));

    return (
        <div className="h-full w-full rounded-md overflow-hidden z-0">
            <MapContainer
                key={validPins.length}
                center={center}
                zoom={6}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validPins.map((pin, index) => (
                    <Marker
                        key={`${pin.projectName}-${index}`}
                        position={[pin.lat!, pin.lng!]}
                    >
                        <Popup>
                            <div className="p-1">
                                <p className="font-bold text-sm mb-1">{pin.projectName}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}
