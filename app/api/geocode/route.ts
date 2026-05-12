// app/api/geocode/route.ts
// Proxy สำหรับ Nominatim Reverse Geocoding เพื่อหลีกเลี่ยง CORS
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
        return NextResponse.json(
            { error: "Missing lat or lon" },
            { status: 400 }
        );
    }

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=th`,
            {
                headers: {
                    "User-Agent": "TrainSystem/1.0",
                },
            }
        );

        if (!res.ok) {
            return NextResponse.json(
                { error: "Geocoding failed" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json(
            { error: "Geocoding service unavailable" },
            { status: 500 }
        );
    }
}
