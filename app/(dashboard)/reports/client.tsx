"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { CalendarIcon, FileSpreadsheet, Download, Loader2, Filter, Table as TableIcon, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { DateRange } from "react-day-picker"
import { useToast } from "@/components/ui/toast"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface FilterOption {
    id: string
    name: string
}

interface UserOption {
    id: string
    name: string | null
    email: string | null
}

interface ReportsClientProps {
    userRole: string
    users: UserOption[]
}

export default function ReportsClient({ userRole, users }: ReportsClientProps) {
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [previewData, setPreviewData] = useState<any[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [fileName, setFileName] = useState("projects_export")

    // Columns Config
    const projectsColumns = [
        { id: "index", label: "ลำดับ" },
        { id: "projectCode", label: "รหัสโครงการ" },
        { id: "projectName", label: "ชื่อโครงการ" },
        { id: "description", label: "รายละเอียด" },
        { id: "budgetType", label: "ประเภทงบประมาณ" },
        { id: "area", label: "พื้นที่ดำเนินการ" },
        { id: "province", label: "จังหวัด" },
        { id: "locationDetail", label: "สถานที่จัด" },
        { id: "startDate", label: "วันที่เริ่มต้น" },
        { id: "endDate", label: "วันที่สิ้นสุด" },
        { id: "transportMethod", label: "การเดินทาง" },
        { id: "createdBy", label: "ผู้บันทึก" },
        { id: "createdAt", label: "วันที่บันทึก" },
    ]

    const [selectedColumns, setSelectedColumns] = useState<string[]>(projectsColumns.map(c => c.id))

    // Filter State
    const [year, setYear] = useState<string>("all")
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [budgetType, setBudgetType] = useState<string>("all")
    const [areaId, setAreaId] = useState<string>("all")
    const [province, setProvince] = useState<string>("all")
    const [transportMethod, setTransportMethod] = useState<string>("all")
    const [userId, setUserId] = useState<string>("all")

    // Data Options
    const [years, setYears] = useState<string[]>([])
    const [budgetTypes, setBudgetTypes] = useState<FilterOption[]>([])
    const [areas, setAreas] = useState<FilterOption[]>([])
    const [provinces, setProvinces] = useState<string[]>([])
    const [transportMethods, setTransportMethods] = useState<string[]>([])


    // Load initial data
    useEffect(() => {
        async function fetchOptions() {
            try {
                // Fetch necessary options
                const [budgetRes, areaRes, transportRes, statsRes] = await Promise.all([
                    fetch("/api/budget-types"),
                    fetch("/api/areas"),
                    fetch("/api/transport-methods"),
                    fetch("/api/dashboard/stats?page=1"),
                ])

                if (budgetRes.ok) {
                    const data = await budgetRes.json()
                    setBudgetTypes(data.budgetTypes)
                }

                if (areaRes.ok) {
                    const data = await areaRes.json()
                    setAreas(data.areas)
                }

                if (transportRes.ok) {
                    const data = await transportRes.json()
                    setTransportMethods(data.transportMethods.map((t: any) => t.name))
                }

                if (statsRes.ok) {
                    const data = await statsRes.json()
                    setProvinces(data.distinctProvinces || [])
                    setYears(data.distinctYears?.map(String) || [])
                }

            } catch (error) {
                console.error("Failed to fetch options:", error)
                addToast({ title: "โหลดข้อมูลตัวเลือกไม่สำเร็จ", type: "error" })
            } finally {
                setInitializing(false)
            }
        }

        fetchOptions()
    }, [addToast])

    // Fetch Preview Data
    useEffect(() => {
        if (initializing) return;

        async function fetchPreview() {
            setPreviewLoading(true)
            try {
                const params = new URLSearchParams()
                if (year && year !== "all") params.append("year", year)
                if (budgetType && budgetType !== "all") params.append("budgetType", budgetType)
                if (areaId && areaId !== "all") params.append("areaId", areaId)
                if (province && province !== "all") params.append("province", province)
                if (transportMethod && transportMethod !== "all") params.append("transportMethod", transportMethod)
                if (userId && userId !== "all") params.append("userId", userId)

                if (dateRange?.from) params.append("startDate", dateRange.from.toISOString())
                if (dateRange?.to) params.append("endDate", dateRange.to.toISOString())

                // Limit preview to 5 items
                // Using existing /api/projects which supports filters
                const response = await fetch(`/api/projects?${params.toString()}&limit=5`)

                if (response.ok) {
                    const data = await response.json()
                    setPreviewData(data.projects || [])
                    setTotalCount(data.pagination?.total || 0)
                }
            } catch (error) {
                console.error("Preview fetch error:", error)
            } finally {
                setPreviewLoading(false)
            }
        }

        // Debounce slightly to avoid rapid calls
        const timeoutId = setTimeout(() => {
            fetchPreview()
        }, 500)

        return () => clearTimeout(timeoutId)

    }, [year, budgetType, areaId, province, transportMethod, userId, dateRange, initializing])


    const handleExport = async () => {
        setLoading(true)
        try {
            // Build Query Params
            const params = new URLSearchParams()
            if (year && year !== "all") params.append("year", year)
            if (budgetType && budgetType !== "all") params.append("budgetType", budgetType)
            if (areaId && areaId !== "all") params.append("areaId", areaId)
            if (province && province !== "all") params.append("province", province)
            if (transportMethod && transportMethod !== "all") params.append("transportMethod", transportMethod)
            if (userId && userId !== "all") params.append("userId", userId)

            if (dateRange?.from) params.append("startDate", dateRange.from.toISOString())
            if (dateRange?.to) params.append("endDate", dateRange.to.toISOString())

            // Add selected columns
            if (selectedColumns.length > 0) {
                params.append("columns", selectedColumns.join(","))
            }

            const response = await fetch(`/api/reports/export?${params.toString()}`, {
                method: "GET",
            })

            if (!response.ok) {
                throw new Error("Export failed")
            }

            // Handle File Download
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url

            const name = fileName.trim()
            if (name) {
                a.download = `${name}.xlsx`
            } else {
                a.download = `projects_export_${format(new Date(), "yyyy-MM-dd")}.xlsx`
            }

            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            addToast({ title: "ดาวน์โหลดไฟล์สำเร็จ", type: "success" })
        } catch (error) {
            console.error("Export error:", error)
            addToast({ title: "เกิดข้อผิดพลาดในการส่งออกไฟล์", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    const resetFilters = () => {
        setYear(new Date().getFullYear().toString())
        setDateRange(undefined)
        setBudgetType("all")
        setAreaId("all")
        setProvince("all")
        setTransportMethod("all")
        setUserId("all")
        addToast({ title: "ล้างค่าตัวกรองเรียบร้อย", type: "success" })
    }

    // Date Picker Logic
    const selectedYear = parseInt(year)
    const isAllYears = year === "all"

    // Calculate Constraints
    const defaultFromYear = new Date().getFullYear()
    const fromYear = isAllYears ? defaultFromYear - 10 : selectedYear
    const toYear = isAllYears ? defaultFromYear + 10 : selectedYear

    const minDate = isAllYears ? undefined : new Date(selectedYear, 0, 1)
    const maxDate = isAllYears ? undefined : new Date(selectedYear, 11, 31)


    if (initializing) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-base sm:text-3xl font-black tracking-tight text-slate-900 whitespace-nowrap">
                        รายงานและส่งออก
                    </h1>
                </div>
                {userRole === "ADMIN" && (
                    <div className="bg-slate-50 px-2.5 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-200 uppercase tracking-widest shrink-0 shadow-sm">
                        {userRole}
                    </div>
                )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 -mt-4">
                ส่งออกข้อมูลโครงการอบรมเป็นไฟล์ Excel (.xlsx)
            </p>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Section */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-row items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />
                                    ตัวกรองข้อมูล
                                </CardTitle>
                                <CardDescription>
                                    เลือกเงื่อนไขของข้อมูลที่ต้องการส่งออก
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={resetFilters} className="h-8 text-xs">
                                ล้างค่าตัวกรอง
                            </Button>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:gap-6 p-4 sm:p-6">
                            {/* Time Period */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full" /> ช่วงเวลา
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>ปีงบประมาณ</Label>
                                        <Select
                                            value={year}
                                            onValueChange={(val) => {
                                                setYear(val)
                                                // Reset date range if year changes to avoid conflict
                                                setDateRange(undefined)
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกปี" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" align="start">
                                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                                {years.map((y) => (
                                                    <SelectItem key={y} value={y}>{parseInt(y) + 543}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>วันที่เริ่มต้น - สิ้นสุด {year !== 'all' && `(ปี ${parseInt(year) + 543})`}</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !dateRange && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dateRange?.from ? (
                                                        dateRange.to ? (
                                                            <>
                                                                {format(dateRange.from, "d MMM yy", { locale: th })} -{" "}
                                                                {format(dateRange.to, "d MMM yy", { locale: th })}
                                                            </>
                                                        ) : (
                                                            format(dateRange.from, "d MMM yy", { locale: th })
                                                        )
                                                    ) : (
                                                        <span>ทั้งหมด</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start" side="bottom">
                                                <div className="p-2 border-b">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full justify-start font-normal text-muted-foreground hover:text-primary"
                                                        onClick={() => setDateRange(undefined)}
                                                    >
                                                        ทั้งหมด (ไม่ระบุวันที่)
                                                    </Button>
                                                </div>
                                                <Calendar
                                                    initialFocus
                                                    mode="range"
                                                    defaultMonth={dateRange?.from || (year !== 'all' ? new Date(parseInt(year), 0, 1) : new Date())}
                                                    selected={dateRange}
                                                    onSelect={setDateRange}
                                                    numberOfMonths={2}
                                                    locale={th}
                                                    fromDate={minDate}
                                                    toDate={maxDate}
                                                    disabled={(date) => {
                                                        if (year !== 'all') {
                                                            return date.getFullYear() !== parseInt(year)
                                                        }
                                                        return false
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            {/* Project Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full" /> ข้อมูลโครงการ
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>ประเภทงบประมาณ</Label>
                                        <Select value={budgetType} onValueChange={setBudgetType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="ทั้งหมด" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" align="start">
                                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                                {budgetTypes.map((b) => (
                                                    <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>พื้นที่ดำเนินการ</Label>
                                        <Select value={areaId} onValueChange={setAreaId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="ทั้งหมด" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" align="start">
                                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                                {areas.map((a) => (
                                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>จังหวัด</Label>
                                        <Select value={province} onValueChange={setProvince}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="ทั้งหมด" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" align="start">
                                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                                {provinces.map((p) => (
                                                    <SelectItem key={p} value={p}>{p.replace('จังหวัด', '')}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>การเดินทาง</Label>
                                        <Select value={transportMethod} onValueChange={setTransportMethod}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="ทั้งหมด" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" align="start">
                                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                                {transportMethods.map((t) => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Only Filters */}
                            {userRole === "ADMIN" && (
                                <>
                                    <Separator className="bg-slate-100" />
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-indigo-500 rounded-full" /> ผู้ใช้งาน (Admin Only)
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>เลือกผู้ใช้งาน</Label>
                                                <Select value={userId} onValueChange={setUserId}>
                                                    <SelectTrigger className="border-indigo-200 focus:ring-indigo-500">
                                                        <SelectValue placeholder="เลือกผู้ใช้งาน" />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper" align="start">
                                                        <SelectItem value="all">ทั้งหมด</SelectItem>
                                                        {users.map((u) => (
                                                            <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Preview Table */}
                    <Card className="shadow-sm border-slate-200 lg:col-span-4">
                        <CardHeader className="border-b pb-4 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-800 whitespace-nowrap">
                                    <TableIcon className="h-5 w-5 text-slate-500 shrink-0" />
                                    ตัวอย่างข้อมูล (Preview)
                                </CardTitle>
                                <CardDescription className="text-[11px] sm:text-xs leading-relaxed">
                                    {previewLoading ? (
                                        "กำลังโหลด..."
                                    ) : (
                                        <>
                                            แสดง {Math.min(previewData.length, 5)} รายการล่าสุด จากทั้งหมด <strong>{totalCount}</strong> รายการ
                                        </>
                                    )}
                                </CardDescription>
                            </div>

                            <div className="flex justify-end">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-slate-200 shadow-sm active:scale-95 transition-all">
                                            <Settings className="mr-2 h-3.5 w-3.5 text-slate-500" />
                                            เลือกคอลัมน์ ({selectedColumns.length})
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-4 bg-white" align="end" side="bottom">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2 pb-2 border-b">
                                                <Checkbox
                                                    id="select-all"
                                                    checked={selectedColumns.length === projectsColumns.length}
                                                    onCheckedChange={(checked: boolean) => {
                                                        if (checked) {
                                                            setSelectedColumns(projectsColumns.map(c => c.id))
                                                        } else {
                                                            setSelectedColumns([])
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor="select-all" className="font-semibold text-sm cursor-pointer">เลือกทั้งหมด</Label>
                                            </div>
                                            <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                                                {projectsColumns.map((col) => (
                                                    <div key={col.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`col-${col.id}`}
                                                            checked={selectedColumns.includes(col.id)}
                                                            onCheckedChange={(checked: boolean) => {
                                                                if (checked) {
                                                                    setSelectedColumns([...selectedColumns, col.id])
                                                                } else {
                                                                    setSelectedColumns(selectedColumns.filter(id => id !== col.id))
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor={`col-${col.id}`} className="text-sm cursor-pointer font-normal">{col.label}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-auto">
                            {previewLoading ? (
                                <div className="flex items-center justify-center p-8 text-muted-foreground">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" /> กำลังโหลดข้อมูล...
                                </div>
                            ) : previewData.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            {projectsColumns.filter(col => selectedColumns.includes(col.id)).map(col => (
                                                <TableHead key={col.id} className="whitespace-nowrap">{col.label}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.map((project: any, index: number) => (
                                            <TableRow key={project.id}>
                                                {projectsColumns.filter(col => selectedColumns.includes(col.id)).map(col => {
                                                    let content = "-"
                                                    switch (col.id) {
                                                        case "index":
                                                            content = (index + 1).toString()
                                                            break
                                                        case "projectCode":
                                                            content = project.projectCode || "-"
                                                            break
                                                        case "projectName":
                                                            content = project.projectName || "-"
                                                            break
                                                        case "description":
                                                            content = project.description ? (project.description.length > 30 ? project.description.substring(0, 30) + "..." : project.description) : "-"
                                                            break
                                                        case "budgetType":
                                                            content = project.budgetType || "-"
                                                            break
                                                        case "area":
                                                            content = project.area?.name || "-"
                                                            break
                                                        case "province":
                                                            content = project.province ? project.province.replace("จังหวัด", "") : "-"
                                                            break
                                                        case "locationDetail":
                                                            content = project.locationDetail || "-"
                                                            break
                                                        case "startDate":
                                                            content = project.startDate ? format(new Date(project.startDate), "d MMM yy", { locale: th }) : "-"
                                                            break
                                                        case "endDate":
                                                            content = project.endDate ? format(new Date(project.endDate), "d MMM yy", { locale: th }) : "-"
                                                            break
                                                        case "transportMethod":
                                                            content = project.transportMethod || "-"
                                                            break
                                                        case "createdBy":
                                                            content = project.user?.name || "-"
                                                            break
                                                        case "createdAt":
                                                            content = project.createdAt ? format(new Date(project.createdAt), "d MMM yy HH:mm", { locale: th }) : "-"
                                                            break
                                                    }
                                                    return <TableCell key={`${project.id}-${col.id}`} className="whitespace-nowrap text-xs">{content}</TableCell>
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                                    <p>ไม่พบข้อมูลตามเงื่อนไข</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Actions Section (Sidebar on large screens) */}
                <div className="space-y-6">
                    <Card className="shadow-md bg-white border sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-slate-900">
                                <FileSpreadsheet className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                ส่งออกข้อมูล
                            </CardTitle>
                            <CardDescription className="text-slate-500">
                                ระบบจะสร้างไฟล์ Excel (.xlsx) ตามเงื่อนไขที่คุณเลือก
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg bg-slate-50 p-4 text-sm border text-slate-600">
                                <p className="mb-2 font-medium text-slate-900">สรุปเงื่อนไข:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>ปี: {year === 'all' ? 'ทั้งหมด' : parseInt(year) + 543}</li>
                                    {dateRange?.from && (
                                        <li>ช่วงวันที่: {format(dateRange.from, "d/MM/yy", { locale: th })} - {dateRange.to ? format(dateRange.to, "d/MM/yy", { locale: th }) : "..."}</li>
                                    )}
                                    <li>จังหวัด: {province === 'all' ? 'ทั้งหมด' : province}</li>
                                    {areaId !== 'all' && <li>พื้นที่: {areas.find(a => a.id === areaId)?.name || areaId}</li>}
                                    {transportMethod !== 'all' && <li>การเดินทาง: {transportMethod}</li>}
                                    {userRole === 'ADMIN' && <li>ผู้ใช้: {userId === 'all' ? 'ทุกคน' : users.find(u => u.id === userId)?.name || userId}</li>}
                                    {budgetType !== 'all' && <li>งบ: {budgetType}</li>}
                                </ul>
                                <Separator className="my-3" />
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-slate-500">จำนวนที่พบ:</span>
                                    <span className="font-bold text-lg text-primary">{totalCount} รายการ</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Label htmlFor="filename" className="text-xs text-muted-foreground mb-1.5 block">ชื่อไฟล์ (ไม่ต้องใส่นามสกุล)</Label>
                                <Input
                                    id="filename"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    placeholder="ตั้งชื่อไฟล์..."
                                    className="bg-white"
                                />
                                <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                                    ตัวอย่าง: {fileName.trim() ? `${fileName.trim()}.xlsx` : `projects_export_${format(new Date(), "yyyy-MM-dd")}.xlsx`}
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleExport}
                                disabled={loading || totalCount === 0 || selectedColumns.length === 0}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-10 sm:h-12 text-sm sm:text-lg shadow-md shadow-green-100"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                                        กำลังประมวลผล...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                        Export Excel
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>


                </div>
            </div>
        </div>
    )
}
