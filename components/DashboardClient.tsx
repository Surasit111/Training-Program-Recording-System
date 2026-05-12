// components/DashboardClient.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    FolderGit2,
    Car,
    Wallet,
    Map as MapIcon,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    BarChart3
} from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList } from 'recharts';

interface DashboardMapProps {
    pins: { lat: number, lng: number, projectName: string }[]
}

const MapDisplay = dynamic<DashboardMapProps>(() => import("@/components/DashboardMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">กำลังโหลดแผนที่...</div>
})

interface DashboardClientProps {
    userRole: string
    users: { id: string, name: string }[]
}

const REGIONS_DATA = [
    { name: "เหนือ", provinces: ["เชียงราย", "เชียงใหม่", "น่าน", "พะเยา", "แพร่", "แม่ฮ่องสอน", "ลำปาง", "ลำพูน", "อุตรดิตถ์"] },
    { name: "ตะวันออกเฉียงเหนือ", provinces: ["กาฬสินธุ์", "ขอนแก่น", "ชัยภูมิ", "นครพนม", "นครราชสีมา", "บึงกาฬ", "บุรีรัมย์", "มหาสารคาม", "มุกดาหาร", "ยโสธร", "ร้อยเอ็ด", "เลย", "ศรีสะเกษ", "สกลนคร", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อำนาจเจริญ", "อุดรธานี", "อุบลราชธานี"] },
    { name: "กลาง", provinces: ["กรุงเทพมหานคร", "กำแพงเพชร", "ชัยนาท", "นครนายก", "นครปฐม", "นครสวรรค์", "นนทบุรี", "ปทุมธานี", "พระนครศรีอยุธยา", "พิจิตร", "พิษณุโลก", "เพชรบูรณ์", "ลพบุรี", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "อ่างทอง", "อุทัยธานี"] },
    { name: "ตะวันออก", provinces: ["จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ตราด", "ปราจีนบุรี", "ระยอง", "สระแก้ว"] },
    { name: "ตะวันตก", provinces: ["กาญจนบุรี", "ตาก", "ประจวบคีรีขันธ์", "เพชรบุรี", "ราชบุรี"] },
    { name: "ใต้", provinces: ["กระบี่", "ชุมพร", "ตรัง", "นครศรีธรรมราช", "นราธิวาส", "ปัตตานี", "พังงา", "พัทลุง", "ภูเก็ต", "ระนอง", "สงขลา", "สตูล", "สุราษฎร์ธานี", "ยะลา"] }
];

export default function DashboardClient({ userRole, users }: DashboardClientProps) {
    const router = useRouter()
    const [filters, setFilters] = useState({
        year: "all",
        startMonth: "1",
        endMonth: "12",
        userId: "all"
    })
    const [page, setPage] = useState(1)
    const [regionIndex, setRegionIndex] = useState(0)
    const [data, setData] = useState<{
        totalProjects?: number;
        budgetBreakdown?: Array<{ budgetType: string; _count: { id: number } }>;
        transportBreakdown?: Array<{ transportMethod: string; _count: { id: number } }>;
        areaBreakdown?: Array<{ name: string; count: number }>;
        recentProjects?: Array<{
            id: string;
            projectName: string;
            startDate: string;
            endDate: string;
            budgetType: string;
            province: string;
            area?: { name: string };
        }>;
        provinceBreakdown?: Array<{ province: string; count: number }>;
        distinctYears?: Array<number>;
        pins?: Array<{ lat: number; lng: number; projectName: string }>;
        pagination?: {
            currentPage: number;
            totalPages: number;
            total: number;
            limit: number;
        };
    } | null>(null)
    const [loading, setLoading] = useState(true)

    // Use dynamic years from API, fallback to current year + prev 4 years if empty
    const years = data?.distinctYears && data.distinctYears.length > 0
        ? data.distinctYears.map(String)
        : Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())
    const months = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: format(new Date(2024, i, 1), "MMMM", { locale: th }) }))

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                ...filters,
                page: page.toString()
            })
            const res = await fetch(`/api/dashboard/stats?${params}`)
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (error) {
            console.error("Fetch stats error:", error)
        } finally {
            setLoading(false)
        }
    }, [filters, page])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (!data && loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <div className="flex flex-wrap items-end gap-2 bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">ปีที่จัด</label>
                    <Select value={filters.year} onValueChange={(v) => { setFilters(f => ({ ...f, year: v })); setPage(1); }}>
                        <SelectTrigger className="w-full sm:w-32 bg-slate-50 border-slate-100 hover:bg-white transition-colors">
                            <SelectValue placeholder="ทั้งหมด" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4}>
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            {years.filter(y => y !== "all").map((y: string) => (
                                <SelectItem key={y} value={y}>{parseInt(y) + 543}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">เดือนเริ่มต้น</label>
                    <Select value={filters.startMonth} onValueChange={(v) => { setFilters(f => ({ ...f, startMonth: v })); setPage(1); }}>
                        <SelectTrigger className="w-full sm:w-40 bg-slate-50 border-slate-100 hover:bg-white transition-colors">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4}>
                            {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">เดือนสิ้นสุด</label>
                    <Select value={filters.endMonth} onValueChange={(v) => { setFilters(f => ({ ...f, endMonth: v })); setPage(1); }}>
                        <SelectTrigger className="w-full sm:w-40 bg-slate-50 border-slate-100 hover:bg-white transition-colors">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4}>
                            {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {userRole === "ADMIN" && (
                    <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">ผู้บันทึก</label>
                        <Select value={filters.userId} onValueChange={(v) => { setFilters(f => ({ ...f, userId: v })); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-56 bg-slate-50 border-slate-100 hover:bg-white transition-colors">
                                <SelectValue placeholder="ทั้งหมด" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={4}>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-blue-50 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                        <CardTitle className="text-sm sm:text-base font-bold text-blue-800">โครงการทั้งหมด</CardTitle>
                        <FolderGit2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-4xl font-black text-blue-900 tracking-tighter">{data?.totalProjects || 0}</div>
                        <p className="text-xs sm:text-sm font-medium text-blue-600/70 mt-1 uppercase tracking-wide">สถิติโครงการที่คุณเข้าถึงได้</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                        <CardTitle className="text-sm sm:text-base font-bold text-green-800">แยกตามงบประมาณ</CardTitle>
                        <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </CardHeader>
                    <CardContent className="h-16 sm:h-20 overflow-y-auto custom-scrollbar">
                        {(data?.budgetBreakdown || []).map((b) => (
                            <div key={b.budgetType} className="flex justify-between text-xs sm:text-sm py-1 border-b border-green-100/50 last:border-0">
                                <span className="text-green-700 font-medium">{b.budgetType}</span>
                                <span className="font-bold text-green-900">{b._count.id}</span>
                            </div>
                        ))}
                        {(!data?.budgetBreakdown || data.budgetBreakdown.length === 0) && (
                            <p className="text-xs text-muted-foreground italic">ไม่มีข้อมูล</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                        <CardTitle className="text-sm sm:text-base font-bold text-purple-800">แยกตามการเดินทาง</CardTitle>
                        <Car className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent className="h-16 sm:h-20 overflow-y-auto custom-scrollbar">
                        {(data?.transportBreakdown || []).map((t) => (
                            <div key={t.transportMethod || "No data"} className="flex justify-between text-xs sm:text-sm py-1 border-b border-purple-100/50 last:border-0">
                                <span className="text-purple-700 font-medium">{t.transportMethod || "ไม่ได้ระบุ"}</span>
                                <span className="font-bold text-purple-900">{t._count.id}</span>
                            </div>
                        ))}
                        {(!data?.transportBreakdown || data.transportBreakdown.length === 0) && (
                            <p className="text-xs text-muted-foreground italic">ไม่มีข้อมูล</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                        <CardTitle className="text-sm sm:text-base font-bold text-orange-800">แยกตามพื้นที่</CardTitle>
                        <MapIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent className="h-16 sm:h-20 overflow-y-auto custom-scrollbar">
                        {(data?.areaBreakdown || []).map((a) => (
                            <div key={a.name} className="flex justify-between text-xs sm:text-sm py-1 border-b border-orange-100/50 last:border-0">
                                <span className="text-orange-700 font-medium">{a.name}</span>
                                <span className="font-bold text-orange-900">{a.count}</span>
                            </div>
                        ))}
                        {(!data?.areaBreakdown || data.areaBreakdown.length === 0) && (
                            <p className="text-xs text-muted-foreground italic">ไม่มีข้อมูล</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                {/* Recent Projects Table */}
                <div className="lg:col-span-6">
                    <Card className="shadow-md overflow-hidden border-slate-100 h-full">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-lg">โครงการล่าสุด</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 uppercase text-[12px] sm:text-[16px] font-bold border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-center w-12.5">ลำดับ</th>
                                            <th className="px-4 py-3">โครงการ</th>
                                            <th className="px-4 py-3 text-center">พื้นที่</th>
                                            <th className="px-4 py-3 text-center">จังหวัด</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {(data?.recentProjects || []).map((p, index) => {
                                            const dateStr = p.startDate
                                                ? `${format(new Date(p.startDate), "d MMM", { locale: th })} - ${p.endDate ? format(new Date(p.endDate), "d MMM yy", { locale: th }) : "ไม่ระบุ"}`
                                                : "-";
                                            const year = p.startDate ? parseInt(format(new Date(p.startDate), "yyyy")) + 543 : null;
                                            return (
                                                <tr
                                                    key={p.id}
                                                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                                    onClick={() => router.push(`/projects/${p.id}`)}
                                                >
                                                    <td className="px-2 py-2 text-center text-xs text-slate-500 group-hover:text-slate-700">
                                                        {(index + 1)}
                                                    </td>
                                                    <td className="px-2 py-2 sm:px-4 sm:py-3">
                                                        <div>
                                                            <span className="font-bold text-slate-800 group-hover:text-primary transition-colors text-xs sm:text-sm">{p.projectName}</span>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-xs text-slate-500">{dateStr}</span>
                                                                {year && <span className="text-xs bg-slate-100 text-slate-500 px-1 py-0.5 rounded">{year}</span>}
                                                                <span className="text-xs bg-green-50 text-green-700 px-1 py-0.5 rounded">{p.budgetType || "-"}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-slate-600 text-xs group-hover:text-slate-800">
                                                        {p.area?.name || "-"}
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-slate-600 text-xs group-hover:text-slate-800">
                                                        {p.province || "-"}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {(data?.recentProjects || []).length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">ไม่พบข้อมูลโครงการ</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {data?.pagination?.totalPages && data.pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 p-4 border-t bg-slate-50">
                                    <Button variant="ghost" size="icon" onClick={() => setPage(1)} disabled={page === 1}>
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs font-medium mx-2">
                                        หน้า {page} / {data.pagination?.totalPages}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.min(data.pagination?.totalPages || 1, p + 1))} disabled={page === data.pagination?.totalPages}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setPage(data.pagination?.totalPages || 1)} disabled={page === data.pagination?.totalPages}>
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* Province Statistics Bar Chart */}
                <div className="lg:col-span-6">
                    <Card className="shadow-md flex flex-col border-slate-100 h-full">
                        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between py-2 sm:py-3 px-3 sm:px-6">
                            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-sky-400" />
                                {REGIONS_DATA[regionIndex].name} ({REGIONS_DATA[regionIndex].provinces.length} จ.)
                            </CardTitle>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setRegionIndex(prev => (prev > 0 ? prev - 1 : REGIONS_DATA.length - 1))}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-xs font-medium px-2 min-w-15 text-center">
                                    {regionIndex + 1} / {REGIONS_DATA.length}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setRegionIndex(prev => (prev < REGIONS_DATA.length - 1 ? prev + 1 : 0))}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-4 grow overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 300px)', minHeight: '300px' }}>
                            {data?.provinceBreakdown ? (() => {
                                const globalTotal = data.totalProjects || 1;
                                const currentRegionProvinces = [...REGIONS_DATA[regionIndex].provinces].sort((a, b) => a.localeCompare(b, 'th'));

                                const chartData = currentRegionProvinces.map(pName => {
                                    const found = (data?.provinceBreakdown || []).find((d) => {
                                        const dbName = (d.province || "").trim();
                                        const listName = pName.trim();
                                        return dbName === listName ||
                                            dbName === `จังหวัด${listName}` ||
                                            listName === `จังหวัด${dbName}` ||
                                            dbName.replace(/^จังหวัด/, '') === listName.replace(/^จังหวัด/, '') ||
                                            (listName === "กรุงเทพมหานคร" && dbName.includes("กรุงเทพ"));
                                    });
                                    return {
                                        province: pName,
                                        count: found ? found.count : 0
                                    };
                                });

                                const chartHeight = Math.max(currentRegionProvinces.length * 35, 250);

                                return (
                                    <ResponsiveContainer width="100%" height={chartHeight}>
                                        <BarChart
                                            data={chartData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
                                            barCategoryGap="10%"
                                        >
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.8} />
                                                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.4} />
                                            <XAxis type="number" hide domain={[0, globalTotal]} />
                                            <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={2} />
                                            <YAxis
                                                dataKey="province"
                                                type="category"
                                                width={100}
                                                tick={{ fontSize: 12, fill: '#475569' }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(15, 118, 110, 0.04)' }}
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                                                    padding: '12px'
                                                }}
                                                formatter={(val) => [`${val} โครงการ`, 'จำนวน']}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="url(#barGradient)"
                                                radius={[0, 4, 4, 0]}
                                                background={{ fill: '#f8fafc' }}
                                                isAnimationActive={false}
                                            >
                                                <LabelList
                                                    dataKey="count"
                                                    position="right"
                                                    style={{ fontSize: 12, fontWeight: 600, fill: '#0f766e' }}
                                                    formatter={(val: any) => (Number(val) > 0 ? val : '')}
                                                />
                                                {chartData.map((entry) => (
                                                    <Cell
                                                        key={`cell-${entry.province}`}
                                                        fill={entry.count > 0 ? "url(#barGradient)" : "transparent"}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                );
                            })() : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-xs text-muted-foreground italic">ไม่มีข้อมูล</p>
                                </div>
                            )}
                        </CardContent>
                        <div className="px-4 pb-4 flex justify-center gap-1">
                            {REGIONS_DATA.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setRegionIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all ${idx === regionIndex ? 'w-6 bg-primary' : 'w-2 bg-slate-200'}`}
                                />
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Map Visualization */}
            <div className="w-full">
                <Card className="shadow-md w-full border-slate-100">
                    <CardHeader className="bg-slate-50 border-b py-2 sm:py-3 px-3 sm:px-6">
                        <CardTitle className="text-sm sm:text-lg">แผนที่โครงการ</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 h-[300px] sm:h-[500px]">
                        <MapDisplay pins={data?.pins || []} />
                    </CardContent>
                </Card>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
      `}</style>
        </div>
    )
}
