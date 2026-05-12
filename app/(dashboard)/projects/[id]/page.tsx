// app/(dashboard)/projects/[id]/page.tsx
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format, differenceInDays } from "date-fns"
import { th } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    CalendarDays,
    MapPin,
    ArrowLeft,
    FileText,
    Car,
    Briefcase,
    Clock,
    User as UserIcon,
} from "lucide-react"
import Link from "next/link"
import ProjectDetailMap from "@/components/ProjectDetailMap"
import { ProjectImageGallery } from "./_components/ProjectImageGallery"
import { ProjectCertificateList } from "./_components/ProjectCertificateList"


interface ProjectDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
    const { id } = await params

    const project = await prisma.trainingProject.findUnique({
        where: { id },
        include: {
            user: { select: { name: true, email: true } },
            area: { select: { name: true } }
        }
    })

    if (!project) {
        notFound()
    }

    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)
    const durationDays = differenceInDays(endDate, startDate) + 1

    return (
        <div className="bg-slate-50/50 pb-0">
            <div className="max-w-6xl mx-auto px-4 pt-0 pb-0">
                <Card className="border-none shadow-2xl shadow-slate-200 bg-white rounded-2xl sm:rounded-[2rem] overflow-hidden">
                    <CardContent className="p-4 sm:p-6 md:px-12 pt-6 sm:pt-8 pb-4 sm:pb-6 space-y-6 sm:space-y-8">
                        {/* Navigation & Actions */}
                        <div className="flex items-center justify-between">
                            <Link href="/projects">
                                <Button variant="ghost" className="gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                                    <ArrowLeft className="h-4 w-4" /> ย้อนกลับ
                                </Button>
                            </Link>
                            <Link href={`/projects/${project.id}/edit`}>
                                <Button variant="outline" size="sm" className="rounded-full px-6 py-5 border-slate-100 text-slate-600 hover:bg-slate-50 transition-all shadow-sm">แก้ไขข้อมูล</Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                            {/* Main Content (Left) */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Title Section Inside Grid */}
                                <div className="text-center md:text-left">
                                    <h1 className="text-lg sm:text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2 sm:mb-4">
                                        {project.projectName}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4">
                                        <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-none px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                            {project.budgetType}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm font-medium">
                                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-300 hidden md:block" />
                                            <span>รหัส: {project.projectCode}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Gallery Section with Divider */}
                                <ProjectImageGallery
                                    images={project.projectImages}
                                    projectName={project.projectName}
                                />

                                {/* Description Section */}
                                <section className="bg-white p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
                                        <FileText className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-indigo-500" /> รายละเอียดโครงการ
                                    </h3>
                                    <div className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                        {project.description || "- ไม่มีรายละเอียดเพิ่มเติม -"}
                                    </div>
                                </section>

                                {/* Certificates Section with Divider */}
                                {project.certificates.length > 0 && (
                                    <>
                                        <hr className="border-slate-100 my-2" />
                                        <ProjectCertificateList
                                            certificates={project.certificates}
                                        />
                                    </>
                                )}
                            </div>

                            {/* Sidebar Info (Right) */}
                            <div className="space-y-6">
                                <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-slate-50/10">
                                    <CardContent className="p-0">
                                        <div className="p-6 space-y-6">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">ข้อมูลการอบรม</h3>

                                            <div className="space-y-6">
                                                {/* Date Range Item */}
                                                <div className="flex items-start gap-3 sm:gap-4">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                                        <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-xs text-slate-400 font-medium whitespace-nowrap uppercase tracking-tight">ระยะเวลาจัดกิจกรรม</p>
                                                        <p className="text-[13px] sm:text-sm font-bold text-slate-700">
                                                            {format(startDate, "d MMMM yyyy", { locale: th })} - {format(endDate, "d MMMM yyyy", { locale: th })}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-0.5 text-xs sm:text-[11px] text-orange-600 font-semibold">
                                                            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {durationDays} วัน
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Location Item */}
                                                <div className="flex items-start gap-3 sm:gap-4">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-xs text-slate-400 font-medium uppercase tracking-tight">สถานที่</p>
                                                        <p className="text-[13px] sm:text-sm font-bold text-slate-700 leading-snug">
                                                            {project.locationDetail}
                                                        </p>
                                                        <p className="text-xs sm:text-[11px] text-slate-500 mt-0.5 uppercase">
                                                            {project.district ? `${project.district}, ` : ""}{project.province}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Training Area Item */}
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                                                        <Briefcase className="h-5 w-5 text-teal-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-400 font-medium">หน่วยงาน/พื้นที่</p>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {project.area.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Transport Item */}
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                                        <Car className="h-5 w-5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-400 font-medium">พาหนะเดินทาง</p>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {project.transportMethod || "ไม่ระบุ"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Creator Info Footer */}
                                        <div className="bg-slate-50 p-6 border-t border-slate-100">
                                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">ผู้บันทึกข้อมูล</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center">
                                                    <UserIcon className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-bold text-slate-700 truncate">{project.user.name}</p>
                                                    <p className="text-xs text-slate-400 truncate">{project.user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>


                            </div>
                        </div>

                        {/* Map Visualization at the bottom */}
                        {project.latitude && project.longitude && (
                            <section className="space-y-3 pt-8 border-t border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">พิกัดสถานที่จัด</h3>
                                <div className="h-64 sm:h-[400px] rounded-2xl overflow-hidden shadow-sm border border-slate-100 z-0">
                                    <ProjectDetailMap pins={[{
                                        projectName: project.projectName,
                                        lat: project.latitude,
                                        lng: project.longitude
                                    }]} />
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs text-slate-400 font-mono">{project.latitude.toFixed(6)}, {project.longitude.toFixed(6)}</span>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${project.latitude},${project.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline font-bold"
                                    >
                                        เปิดใน Google Maps &rarr;
                                    </a>
                                </div>
                            </section>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


