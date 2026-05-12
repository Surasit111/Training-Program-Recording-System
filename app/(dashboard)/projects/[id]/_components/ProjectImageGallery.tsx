"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, ExternalLink, ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjectImageGalleryProps {
    images: string[]
    projectName: string
}

export function ProjectImageGallery({ images, projectName }: ProjectImageGalleryProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(0)

    const openModal = (index: number) => {
        setActiveIndex(index)
        setIsOpen(true)
    }

    const nextImage = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        setActiveIndex((prev) => (prev + 1) % images.length)
    }, [images.length])

    const prevImage = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
    }, [images.length])

    // Keyboard navigation
    React.useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") nextImage()
            if (e.key === "ArrowLeft") prevImage()
            if (e.key === "Escape") setIsOpen(false)
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, nextImage, prevImage])

    if (images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 text-slate-400">
                <ImageIcon className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">ยังไม่มีรูปภาพเข้าร่วมโครงการ</p>
            </div>
        )
    }

    return (
        <>
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-bold text-slate-800">รูปภาพเข้าร่วมโครงการ</h3>
                    <Badge variant="outline" className="rounded-full text-xs">{images.length}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((url, idx) => {
                        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
                        return (
                            <div
                                key={idx}
                                onClick={() => openModal(idx)}
                                className={cn(
                                    "group relative aspect-video overflow-hidden rounded-2xl border bg-slate-100 shadow-sm transition-all hover:shadow-md cursor-pointer",
                                    idx === 0 && images.length === 1 ? "sm:col-span-2" : ""
                                )}
                            >
                                {isImage ? (
                                    <Image
                                        src={url}
                                        alt={`${projectName} - ${idx + 1}`}
                                        fill
                                        sizes="(max-width: 640px) 100vw, 50vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                        <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                            <ExternalLink className="h-6 w-6 text-slate-600" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-500 max-w-[80%] truncate">
                                            {url.split('/').pop()}
                                        </span>
                                    </div>
                                )}

                                {isImage && (
                                    <div className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ExternalLink className="h-4 w-4 text-slate-700" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </section>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-6xl h-[95vh] md:h-[90vh] p-0 overflow-hidden bg-slate-950 border-white/10 z-9999 flex flex-col shadow-2xl rounded-[2rem]">
                    <DialogTitle className="sr-only">รูปภาพเข้าร่วมโครงการ</DialogTitle>

                    {/* Header: Fixed Top */}
                    <div className="flex items-center justify-between px-8 py-5 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 text-white z-20">
                        <div className="flex items-center gap-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold tracking-tighter text-white">{activeIndex + 1}</span>
                                <span className="text-sm text-white/40 font-medium">/ {images.length}</span>
                            </div>
                            <div className="hidden sm:block w-px h-5 bg-white/10" />
                            <span className="text-sm font-semibold tracking-widest uppercase text-white/80">รูปภาพเข้าร่วมโครงการ</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="w-10 h-10 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="relative flex-1 w-full flex items-center justify-center group overflow-hidden bg-slate-950">
                        <div className="relative w-full h-full flex items-center justify-center p-6 md:p-12">
                            {/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(images[activeIndex]) ? (
                                <Image
                                    src={images[activeIndex]}
                                    alt={`รูปภาพ - ${activeIndex + 1}`}
                                    fill
                                    sizes="95vw"
                                    className="object-contain p-2"
                                    priority
                                    unoptimized
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-6">
                                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                                        <ExternalLink className="h-10 w-10 text-white/80" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-white mb-2">ไฟล์เอกสาร</h3>
                                        <p className="text-white/50 text-sm max-w-md truncate px-4">
                                            {images[activeIndex].split('/').pop()}
                                        </p>
                                    </div>
                                    <a
                                        href={images[activeIndex]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-indigo-50 transition-colors flex items-center gap-2"
                                    >
                                        <ExternalLink className="h-4 w-4" /> เปิดไฟล์
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Controls: Float */}
                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white border border-white/5 backdrop-blur-md z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex"
                                    onClick={prevImage}
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </button>
                                <button
                                    className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white border border-white/5 backdrop-blur-md z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex"
                                    onClick={nextImage}
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Footer / Progress Bar (Optional, for that modern touch) */}
                    {images.length > 1 && (
                        <div className="px-8 py-4 bg-slate-900/30 backdrop-blur-sm flex justify-center border-t border-white/5">
                            <div className="flex gap-2">
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveIndex(i)}
                                        className={cn(
                                            "h-1 rounded-full transition-all duration-300",
                                            i === activeIndex ? "bg-white w-8" : "bg-white/20 w-4 hover:bg-white/40"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
