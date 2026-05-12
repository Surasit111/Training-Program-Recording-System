"use client"

import dynamic from 'next/dynamic'

const DashboardMap = dynamic(() => import("./DashboardMap"), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">กำลังโหลดแผนที่...</div>
})

interface ProjectDetailMapProps {
    pins: {
        projectName: string
        lat: number
        lng: number
    }[]
}

export default function ProjectDetailMap({ pins }: ProjectDetailMapProps) {
    return <DashboardMap pins={pins} />
}
