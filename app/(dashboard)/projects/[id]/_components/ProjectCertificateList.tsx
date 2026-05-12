"use client"

import * as React from "react"
import Image from "next/image"
import { FileText, ExternalLink, Download, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ProjectCertificateList({ certificates }: { certificates: string[] }) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(0)

    if (certificates.length === 0) return null

    const handleItemClick = (index: number) => {
        setActiveIndex(index)
        setIsOpen(true)
    }

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        setActiveIndex((prev) => (prev + 1) % certificates.length)
    }

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        setActiveIndex((prev) => (prev - 1 + certificates.length) % certificates.length)
    }

    const openOriginal = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer")
    }

    const activeItem = certificates[activeIndex]
    const isActiveImage = activeItem && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(activeItem)

    return (
        <section>
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-slate-800">ใบรับรอง/เกียรติบัตร</h3>
                <Badge variant="outline" className="rounded-full text-xs">{certificates.length}</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {certificates.map((url, idx) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
                    const fileName = url.split('/').pop()?.split('?')[0] || `File ${idx + 1}`;
                    return (
                        <div
                            key={idx}
                            onClick={() => handleItemClick(idx)}
                            className="group relative aspect-3/4 overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer"
                        >
                            {isImage ? (
                                <Image src={url} alt={`Certificate ${idx + 1}`} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" unoptimized />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-slate-50/50">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                                        <FileText className="h-6 w-6 text-indigo-500" />
                                    </div>
                                    <span className="text-xs text-slate-500 line-clamp-2 px-1 break-all uppercase font-bold tracking-tighter">{fileName}</span>
                                </div>
                            )}

                            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <div
                                    onClick={(e) => { e.stopPropagation(); openOriginal(url); }}
                                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-slate-900 shadow-sm hover:scale-110 transition-transform"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </div>
                                <a
                                    href={url}
                                    download
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-slate-900 shadow-sm hover:scale-110 transition-transform"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-6xl h-[95vh] md:h-[90vh] p-0 overflow-hidden bg-slate-950 border-white/10 z-9999 flex flex-col shadow-2xl rounded-[2rem]">
                    <DialogTitle className="sr-only">ใบรับรอง/เกียรติบัตร</DialogTitle>

                    {/* Header: Fixed Top */}
                    <div className="flex items-center justify-between px-8 py-5 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 text-white z-20">
                        <div className="flex items-center gap-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold tracking-tighter text-white">{activeIndex + 1}</span>
                                <span className="text-sm text-white/40 font-medium">/ {certificates.length}</span>
                            </div>
                            <div className="hidden sm:block w-px h-5 bg-white/10" />
                            <span className="text-sm font-semibold tracking-widest uppercase text-white/80">ใบรับรอง/เกียรติบัตร</span>
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
                            {isActiveImage ? (
                                <Image
                                    src={activeItem}
                                    alt={`Certificate ${activeIndex + 1}`}
                                    fill
                                    sizes="95vw"
                                    className="object-contain p-2"
                                    priority
                                    unoptimized
                                />
                            ) : (
                                <div
                                    onClick={() => openOriginal(activeItem)}
                                    className="flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-white/5 transition-all rounded-[2rem] border border-white/5 bg-white/5 group/btn"
                                >
                                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/10 group-hover/btn:scale-110 transition-transform duration-500">
                                        <FileText className="h-12 w-12 text-white/80" />
                                    </div>
                                    <h4 className="text-white font-bold text-2xl mb-2 tracking-tight">เปิดดูไฟล์เอกสาร</h4>
                                    <p className="text-white/30 text-sm max-w-xs truncate font-medium uppercase tracking-widest">{activeItem.split('/').pop()?.split('?')[0]}</p>
                                    <div className="mt-10 px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-lg">
                                        <ExternalLink className="h-4 w-4" /> เปิดในแท็บใหม่
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls: Float */}
                        {certificates.length > 1 && (
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

                    {/* Footer / Progress Bar */}
                    {certificates.length > 1 && (
                        <div className="px-8 py-4 bg-slate-900/30 backdrop-blur-sm flex justify-center border-t border-white/5">
                            <div className="flex gap-2">
                                {certificates.map((_, i) => (
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
        </section>
    )
}
