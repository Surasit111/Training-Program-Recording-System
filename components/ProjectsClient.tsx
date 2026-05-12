// components/ProjectsClient.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/app/(dashboard)/projects/data-table"
import { createColumns } from "@/app/(dashboard)/projects/columns"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import Link from "next/link"

interface ProjectsClientProps {
    userRole: string
    users: { id: string, name: string }[]
}

export default function ProjectsClient({ userRole, users }: ProjectsClientProps) {
    const [filters, setFilters] = useState({
        year: "all",
        startMonth: "1",
        endMonth: "12",
        budgetType: "all",
        userId: "all",
        transportMethod: "all",
        province: "all",
    })
    const [page, setPage] = useState(1)
    const [data, setData] = useState<{
        projects: Array<{
            id: string;
            projectCode: string;
            projectName: string;
            province: string;
            startDate: string;
            endDate: string;
            budgetType: string;
            transportMethod?: string;
            area: { name: string };
        }>;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [budgetTypeOptions, setBudgetTypeOptions] = useState<{ id: string, name: string }[]>([])
    const [transportOptions, setTransportOptions] = useState<string[]>([])
    const [provinceOptions, setProvinceOptions] = useState<string[]>([])
    const [yearOptions, setYearOptions] = useState<string[]>([])

    // Fetch filter options from API
    useEffect(() => {
        async function fetchOptions() {
            try {
                const [budgetRes, statsRes] = await Promise.all([
                    fetch("/api/budget-types"),
                    fetch("/api/dashboard/stats?year=&startMonth=1&endMonth=12&userId=all&page=1")
                ])
                if (budgetRes.ok) {
                    const data = await budgetRes.json()
                    setBudgetTypeOptions(data.budgetTypes)
                }
                if (statsRes.ok) {
                    const data = await statsRes.json()
                    setTransportOptions(data.distinctTransportMethods || [])
                    setProvinceOptions(data.distinctProvinces || [])
                    setYearOptions(data.distinctYears?.map(String) || [])
                }
            } catch (error) {
                console.error("Failed to fetch filter options:", error)
            }
        }
        fetchOptions()
    }, [])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            // Remove empty filters
            const paramsOb: Record<string, string> = {
                ...filters,
                page: page.toString()
            };
            // Clean up 'all' values
            if (paramsOb.year === 'all') delete paramsOb.year;
            if (paramsOb.budgetType === 'all') delete paramsOb.budgetType;
            if (paramsOb.userId === 'all') delete paramsOb.userId;
            if (paramsOb.transportMethod === 'all') { paramsOb.transportMethod = ''; }
            if (paramsOb.province === 'all') { paramsOb.province = ''; }

            const params = new URLSearchParams(paramsOb)
            const res = await fetch(`/api/projects?${params}`)
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (error) {
            console.error("Fetch projects error:", error)
        } finally {
            setLoading(false)
        }
    }, [filters, page])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData()
        }, 300)
        return () => clearTimeout(timer)
    }, [fetchData])

    // Use dynamic years if available, else default
    const years = yearOptions.map(String)

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: format(new Date(2024, i, 1), "MMMM", { locale: th })
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2 overflow-hidden">
                    <h1 className="text-base sm:text-2xl font-black tracking-tight text-slate-900 whitespace-nowrap">
                        โครงการอบรมทั้งหมด
                    </h1>
                    {userRole === "ADMIN" && (
                        <div className="bg-slate-50 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200 uppercase tracking-widest shrink-0 shadow-sm">
                            {userRole}
                        </div>
                    )}
                </div>
                <Link href="/projects/new" className="shrink-0">
                    <Button size="sm" className="h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all">
                        <Plus className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> 
                        <span className="sm:inline">สร้างใหม่</span>
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">ปีที่จัด</label>
                    <Select value={filters.year} onValueChange={(v) => { setFilters(f => ({ ...f, year: v })); setPage(1); }}>
                        <SelectTrigger className="w-30">
                            <SelectValue placeholder="ทั้งหมด" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            {years.map(y => <SelectItem key={y} value={y}>{parseInt(y) + 543}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">เดือนเริ่มต้น</label>
                    <Select value={filters.startMonth} onValueChange={(v) => { setFilters(f => ({ ...f, startMonth: v })); setPage(1); }}>
                        <SelectTrigger className="w-35">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">เดือนสิ้นสุด</label>
                    <Select value={filters.endMonth} onValueChange={(v) => { setFilters(f => ({ ...f, endMonth: v })); setPage(1); }}>
                        <SelectTrigger className="w-35">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">ประเภทงบประมาณ</label>
                    <Select value={filters.budgetType} onValueChange={(v) => { setFilters(f => ({ ...f, budgetType: v })); setPage(1); }}>
                        <SelectTrigger className="w-45">
                            <SelectValue placeholder="ทั้งหมด" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            {budgetTypeOptions.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">การเดินทาง</label>
                    <Select value={filters.transportMethod} onValueChange={(v) => { setFilters(f => ({ ...f, transportMethod: v })); setPage(1); }}>
                        <SelectTrigger className="w-45">
                            <SelectValue placeholder="ทั้งหมด" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            {transportOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">จังหวัด</label>
                    <Select value={filters.province} onValueChange={(v) => { setFilters(f => ({ ...f, province: v })); setPage(1); }}>
                        <SelectTrigger className="w-45">
                            <SelectValue placeholder="ทั้งหมด" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            {provinceOptions.map(p => <SelectItem key={p} value={p}>{p.replace('จังหวัด', '')}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {userRole === "ADMIN" && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">ผู้บันทึก</label>
                        <Select value={filters.userId} onValueChange={(v) => { setFilters(f => ({ ...f, userId: v })); setPage(1); }}>
                            <SelectTrigger className="w-50">
                                <SelectValue placeholder="ทั้งหมด" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <DataTable columns={createColumns(fetchData)} data={data?.projects || []} />

                    {/* Pagination */}
                    {data?.pagination?.totalPages && data.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Button variant="outline" size="icon" onClick={() => setPage(1)} disabled={page === 1}>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium mx-4">
                                หน้า {page} / {data.pagination.totalPages}
                            </span>
                            <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setPage(data.pagination.totalPages)} disabled={page === data.pagination.totalPages}>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
