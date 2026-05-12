"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, List, Wallet, Car } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ---- Interfaces ----
interface TrainingArea {
    id: string
    name: string
    createdAt: string
    _count: { projects: number }
}

interface BudgetType {
    id: string
    name: string
    createdAt: string
    _count: { projects: number }
}

interface TransportMethod {
    id: string
    name: string
    createdAt: string
    _count: { projects: number }
}

export default function CategoriesPage() {
    const { addToast } = useToast()
    const [activeTab, setActiveTab] = useState("areas")

    // ---- Areas State ----
    const [areas, setAreas] = useState<TrainingArea[]>([])
    const [loadingAreas, setLoadingAreas] = useState(true)
    const [savingArea, setSavingArea] = useState(false)
    const [isCreateAreaOpen, setIsCreateAreaOpen] = useState(false)
    const [isEditAreaOpen, setIsEditAreaOpen] = useState(false)
    const [isDeleteAreaOpen, setIsDeleteAreaOpen] = useState(false)
    const [newAreaName, setNewAreaName] = useState("")
    const [editAreaId, setEditAreaId] = useState("")
    const [editAreaName, setEditAreaName] = useState("")
    const [deleteAreaId, setDeleteAreaId] = useState("")
    const [deleteAreaName, setDeleteAreaName] = useState("")

    // ---- Budget Types State ----
    const [budgetTypes, setBudgetTypes] = useState<BudgetType[]>([])
    const [loadingBudgets, setLoadingBudgets] = useState(true)
    const [savingBudget, setSavingBudget] = useState(false)
    const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false)
    const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false)
    const [isDeleteBudgetOpen, setIsDeleteBudgetOpen] = useState(false)
    const [newBudgetName, setNewBudgetName] = useState("")
    const [editBudgetId, setEditBudgetId] = useState("")
    const [editBudgetName, setEditBudgetName] = useState("")
    const [deleteBudgetId, setDeleteBudgetId] = useState("")
    const [deleteBudgetName, setDeleteBudgetName] = useState("")

    // ---- Transport Methods State ----
    const [transportMethods, setTransportMethods] = useState<TransportMethod[]>([])
    const [loadingTransport, setLoadingTransport] = useState(true)
    const [savingTransport, setSavingTransport] = useState(false)
    const [isCreateTransportOpen, setIsCreateTransportOpen] = useState(false)
    const [isEditTransportOpen, setIsEditTransportOpen] = useState(false)
    const [isDeleteTransportOpen, setIsDeleteTransportOpen] = useState(false)
    const [newTransportName, setNewTransportName] = useState("")
    const [editTransportId, setEditTransportId] = useState("")
    const [editTransportName, setEditTransportName] = useState("")
    const [deleteTransportId, setDeleteTransportId] = useState("")
    const [deleteTransportName, setDeleteTransportName] = useState("")

    // ---- Initial Fetch ----
    useEffect(() => {
        fetchAreas()
        fetchBudgetTypes()
        fetchTransportMethods()
    }, [])

    // ---- API Functions (Areas) ----
    async function fetchAreas() {
        try {
            const res = await fetch("/api/areas")
            if (res.ok) {
                const data = await res.json()
                setAreas(data.areas)
            }
        } catch (error) {
            console.error("Failed to fetch areas:", error)
        } finally {
            setLoadingAreas(false)
        }
    }

    async function handleCreateArea() {
        if (!newAreaName.trim()) return
        setSavingArea(true)
        try {
            const res = await fetch("/api/areas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newAreaName }),
            })
            if (!res.ok) throw new Error((await res.json()).error)
            setNewAreaName("")
            setIsCreateAreaOpen(false)
            fetchAreas()
            addToast({ title: "เพิ่มพื้นที่อบรมสำเร็จ", type: "success" })
        } catch (error) {
            addToast({ title: error instanceof Error ? error.message : "เกิดข้อผิดพลาด", type: "error" })
        } finally {
            setSavingArea(false)
        }
    }

    async function handleUpdateArea() {
        if (!editAreaName.trim()) return
        setSavingArea(true)
        try {
            const res = await fetch(`/api/areas/${editAreaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editAreaName }),
            })
            if (!res.ok) throw new Error((await res.json()).error)
            setIsEditAreaOpen(false)
            fetchAreas()
            addToast({ title: "อัปเดตพื้นที่อบรมสำเร็จ", type: "success" })
        } catch (error) {
            addToast({ title: error instanceof Error ? error.message : "เกิดข้อผิดพลาด", type: "error" })
        } finally {
            setSavingArea(false)
        }
    }

    async function handleDeleteArea() {
        setSavingArea(true)
        try {
            const res = await fetch(`/api/areas/${deleteAreaId}`, { method: "DELETE" })
            if (!res.ok) throw new Error((await res.json()).error)
            setIsDeleteAreaOpen(false)
            fetchAreas()
            addToast({ title: "ลบพื้นที่อบรมสำเร็จ", type: "success" })
        } catch (error) {
            addToast({ title: error instanceof Error ? error.message : "เกิดข้อผิดพลาด", type: "error" })
        } finally {
            setSavingArea(false)
        }
    }

    // ---- API Functions (Budget Types) ----
    async function fetchBudgetTypes() {
        try {
            const res = await fetch("/api/budget-types")
            if (res.ok) {
                const data = await res.json()
                setBudgetTypes(data.budgetTypes)
            }
        } catch (error) {
            console.error("Failed to fetch budget types:", error)
        } finally {
            setLoadingBudgets(false)
        }
    }

    async function handleCreateBudget() {
        if (!newBudgetName.trim()) return
        setSavingBudget(true)
        try {
            const res = await fetch("/api/budget-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newBudgetName }),
            })
            if (!res.ok) throw new Error((await res.json()).error)
            setNewBudgetName("")
            setIsCreateBudgetOpen(false)
            fetchBudgetTypes()
            addToast({ title: "เพิ่มประเภทงบประมาณสำเร็จ", type: "success" })
        } catch (error) {
            addToast({ title: error instanceof Error ? error.message : "เกิดข้อผิดพลาด", type: "error" })
        } finally {
            setSavingBudget(false)
        }
    }

    async function handleUpdateBudget() {
        if (!editBudgetName.trim()) return
        setSavingBudget(true)
        try {
            const res = await fetch(`/api/budget-types/${editBudgetId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editBudgetName }),
            })
            if (!res.ok) throw new Error((await res.json()).error)
            setIsEditBudgetOpen(false)
            fetchBudgetTypes()
            addToast({ title: "อัปเดตประเภทงบประมาณสำเร็จ", type: "success" })
        } catch (error) {
            addToast({ title: error instanceof Error ? error.message : "เกิดข้อผิดพลาด", type: "error" })
        } finally {
            setSavingBudget(false)
        }
    }

    async function handleDeleteBudget() {
        setSavingBudget(true)
        try {
            const res = await fetch(`/api/budget-types/${deleteBudgetId}`, { method: "DELETE" })
            if (!res.ok) throw new Error((await res.json()).error)
            setIsDeleteBudgetOpen(false)
            fetchBudgetTypes()
            addToast({ title: "ลบประเภทงบประมาณสำเร็จ", type: "success" })
        } catch (error) {
            addToast({ title: error instanceof Error ? error.message : "เกิดข้อผิดพลาด", type: "error" })
        } finally {
            setSavingBudget(false)
        }
    }

    // ---- API Functions (Transport Methods) ----
    async function fetchTransportMethods() {
        try {
            const res = await fetch("/api/transport-methods")
            if (res.ok) {
                const data = await res.json()
                setTransportMethods(data.transportMethods)
            }
        } catch (error) {
            console.error("Failed to fetch transport methods:", error)
        } finally {
            setLoadingTransport(false)
        }
    }

    async function handleCreateTransport() {
        if (!newTransportName.trim()) return
        setSavingTransport(true)
        try {
            const res = await fetch("/api/transport-methods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newTransportName }),
            })
            if (!res.ok) throw new Error((await res.json()).error)
            setNewTransportName("")
            setIsCreateTransportOpen(false)
            fetchTransportMethods()
            addToast({ title: "เพิ่มพาหนะสำเร็จ", type: "success" })
        } catch (error) {
            addToast({ title: error instanceof Error ? error.message : "เกิดข้อผิดพลาด", type: "error" })
        } finally {
            setSavingTransport(false)
        }
    }

    async function handleUpdateTransport() {
        if (!editTransportName.trim()) return
        setSavingTransport(true)
        try {
            const res = await fetch(`/api/transport-methods/${editTransportId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editTransportName }),
            })
            if (!res.ok) throw new Error((await res.json()).error)
            setIsEditTransportOpen(false)
            fetchTransportMethods()
            addToast({ title: "อัปเดตพาหนะสำเร็จ", type: "success" })
        } catch (error) {
            addToast({ title: error instanceof Error ? error.message : "เกิดข้อผิดพลาด", type: "error" })
        } finally {
            setSavingTransport(false)
        }
    }

    async function handleDeleteTransport() {
        setSavingTransport(true)
        try {
            const res = await fetch(`/api/transport-methods/${deleteTransportId}`, { method: "DELETE" })
            if (!res.ok) throw new Error((await res.json()).error)
            setIsDeleteTransportOpen(false)
            fetchTransportMethods()
            addToast({ title: "ลบพาหนะสำเร็จ", type: "success" })
        } catch (error) {
            addToast({ title: error instanceof Error ? error.message : "เกิดข้อผิดพลาด", type: "error" })
        } finally {
            setSavingTransport(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-base sm:text-3xl font-black tracking-tight text-slate-900 whitespace-nowrap">
                        จัดการหมวดหมู่
                    </h1>
                </div>
                <div className="bg-slate-50 px-2.5 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-200 uppercase tracking-widest shrink-0 shadow-sm">
                    ADMIN
                </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 -mt-4">
                จัดการพื้นที่อบรม, ประเภทงบประมาณ และพาหนะในการเดินทาง
            </p>
            <Tabs defaultValue="areas" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100/50 p-1 h-auto">
                    <TabsTrigger value="areas" className="flex items-center justify-center gap-2 text-[11px] sm:text-sm py-2 px-0 whitespace-nowrap">
                        <List className="h-4 w-4 hidden md:block" /> พื้นที่อบรม
                    </TabsTrigger>
                    <TabsTrigger value="budgets" className="flex items-center justify-center gap-2 text-[11px] sm:text-sm py-2 px-0 whitespace-nowrap">
                        <Wallet className="h-4 w-4 hidden md:block" /> ประเภทงบประมาณ
                    </TabsTrigger>
                    <TabsTrigger value="transport" className="flex items-center justify-center gap-2 text-[11px] sm:text-sm py-2 px-0 whitespace-nowrap">
                        <Car className="h-4 w-4 hidden md:block" /> พาหนะเดินทาง
                    </TabsTrigger>
                </TabsList>

                {/* ---- AREAS TAB ---- */}
                <TabsContent value="areas" className="space-y-4 pt-4">
                    <div className="flex justify-end">
                        <Dialog open={isCreateAreaOpen} onOpenChange={setIsCreateAreaOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> เพิ่มพื้นที่ใหม่
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>เพิ่มพื้นที่อบรมใหม่</DialogTitle>
                                    <DialogDescription>กรอกชื่อพื้นที่สำหรับโครงการอบรม</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="area-name">ชื่อพื้นที่</Label>
                                        <Input id="area-name" value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} placeholder="เช่น ภาคเหนือ" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateAreaOpen(false)}>ยกเลิก</Button>
                                    <Button onClick={handleCreateArea} disabled={savingArea}>
                                        {savingArea && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} บันทึก
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">รายการพื้นที่อบรม</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingAreas ? (
                                    <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                                ) : areas.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">ยังไม่มีพื้นที่อบรม</div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ชื่อพื้นที่</TableHead>
                                                <TableHead className="text-center">จำนวนโครงการ</TableHead>
                                                <TableHead className="text-right">จัดการ</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {areas.map((area) => (
                                                <TableRow key={area.id} className="group transition-colors hover:bg-muted/50">
                                                    <TableCell className="font-medium">{area.name}</TableCell>
                                                    <TableCell className="text-center">{area._count.projects}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => { setEditAreaId(area.id); setEditAreaName(area.name); setIsEditAreaOpen(true) }} className="hover:scale-110 transition-transform">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:scale-110 transition-transform" onClick={() => { setDeleteAreaId(area.id); setDeleteAreaName(area.name); setIsDeleteAreaOpen(true) }}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Mobile View: Cards */}
                    <div className="md:hidden space-y-3">
                        {loadingAreas ? (
                            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                        ) : areas.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-dashed italic">ยังไม่มีพื้นที่อบรม</div>
                        ) : (
                            areas.map((area) => (
                                <Card key={area.id} className="border-none shadow-sm shadow-slate-200/50 rounded-xl overflow-hidden">
                                    <CardContent className="px-3 pt-0 pb-1.5">
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">ชื่อพื้นที่</span>
                                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{area._count.projects} โครงการ</span>
                                                </div>
                                                <div className="flex items-center gap-0.5 shrink-0">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => { setEditAreaId(area.id); setEditAreaName(area.name); setIsEditAreaOpen(true) }}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500" onClick={() => { setDeleteAreaId(area.id); setDeleteAreaName(area.name); setIsDeleteAreaOpen(true) }}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 truncate leading-tight mt-0.5">{area.name}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* ---- BUDGETS TAB ---- */}
                <TabsContent value="budgets" className="space-y-4 pt-4">
                    <div className="flex justify-end">
                        <Dialog open={isCreateBudgetOpen} onOpenChange={setIsCreateBudgetOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> เพิ่มประเภทงบประมาณ
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>เพิ่มประเภทงบประมาณ</DialogTitle>
                                    <DialogDescription>เพิ่มประเภทงบประมาณใหม่</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="budget-name">ชื่อประเภทงบประมาณ</Label>
                                        <Input id="budget-name" value={newBudgetName} onChange={(e) => setNewBudgetName(e.target.value)} placeholder="เช่น งบดำเนินงาน" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateBudgetOpen(false)}>ยกเลิก</Button>
                                    <Button onClick={handleCreateBudget} disabled={savingBudget}>
                                        {savingBudget && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} บันทึก
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">รายการประเภทงบประมาณ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingBudgets ? (
                                    <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                                ) : budgetTypes.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">ยังไม่มีประเภทงบประมาณ</div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ชื่อประเภทงบประมาณ</TableHead>
                                                <TableHead className="text-right">จัดการ</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {budgetTypes.map((budget) => (
                                                <TableRow key={budget.id} className="group transition-colors hover:bg-muted/50">
                                                    <TableCell className="font-medium">{budget.name}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => { setEditBudgetId(budget.id); setEditBudgetName(budget.name); setIsEditBudgetOpen(true) }} className="hover:scale-110 transition-transform">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:scale-110 transition-transform" onClick={() => { setDeleteBudgetId(budget.id); setDeleteBudgetName(budget.name); setIsDeleteBudgetOpen(true) }}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Mobile View: Cards */}
                    <div className="md:hidden space-y-3">
                        {loadingBudgets ? (
                            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                        ) : budgetTypes.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-dashed italic">ยังไม่มีประเภทงบประมาณ</div>
                        ) : (
                            budgetTypes.map((budget) => (
                                <Card key={budget.id} className="border-none shadow-sm shadow-slate-200/50 rounded-xl overflow-hidden">
                                    <CardContent className="px-3 pt-0 pb-1.5">
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">ชื่อประเภทงบประมาณ</span>
                                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{budget._count?.projects || 0} โครงการ</span>
                                                </div>
                                                <div className="flex items-center gap-0.5 shrink-0">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => { setEditBudgetId(budget.id); setEditBudgetName(budget.name); setIsEditBudgetOpen(true) }}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500" onClick={() => { setDeleteBudgetId(budget.id); setDeleteBudgetName(budget.name); setIsDeleteBudgetOpen(true) }}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 truncate leading-tight mt-0.5">{budget.name}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* ---- TRANSPORT METHODS TAB ---- */}
                <TabsContent value="transport" className="space-y-4 pt-4">
                    <div className="flex justify-end">
                        <Dialog open={isCreateTransportOpen} onOpenChange={setIsCreateTransportOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> เพิ่มพาหนะ
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>เพิ่มพาหนะในการเดินทาง</DialogTitle>
                                    <DialogDescription>เพิ่มชื่อพาหนะที่ใช้ในการเดินทาง</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="transport-name">ชื่อพาหนะ</Label>
                                        <Input id="transport-name" value={newTransportName} onChange={(e) => setNewTransportName(e.target.value)} placeholder="เช่น รถยนต์ราชการ" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateTransportOpen(false)}>ยกเลิก</Button>
                                    <Button onClick={handleCreateTransport} disabled={savingTransport}>
                                        {savingTransport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} บันทึก
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">รายการพาหนะในการเดินทาง</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingTransport ? (
                                    <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                                ) : transportMethods.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">ยังไม่มีพาหนะในการเดินทาง</div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ชื่อพาหนะ</TableHead>
                                                <TableHead className="text-right">จัดการ</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transportMethods.map((transport) => (
                                                <TableRow key={transport.id} className="group transition-colors hover:bg-muted/50">
                                                    <TableCell className="font-medium">{transport.name}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => { setEditTransportId(transport.id); setEditTransportName(transport.name); setIsEditTransportOpen(true) }} className="hover:scale-110 transition-transform">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:scale-110 transition-transform" onClick={() => { setDeleteTransportId(transport.id); setDeleteTransportName(transport.name); setIsDeleteTransportOpen(true) }}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Mobile View: Cards */}
                    <div className="md:hidden space-y-3">
                        {loadingTransport ? (
                            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                        ) : transportMethods.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-dashed italic">ยังไม่มีพาหนะในการเดินทาง</div>
                        ) : (
                            transportMethods.map((transport) => (
                                <Card key={transport.id} className="border-none shadow-sm shadow-slate-200/50 rounded-xl overflow-hidden">
                                    <CardContent className="px-3 pt-0 pb-1.5">
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">พาหนะเดินทาง</span>
                                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{transport._count?.projects || 0} โครงการ</span>
                                                </div>
                                                <div className="flex items-center gap-0.5 shrink-0">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => { setEditTransportId(transport.id); setEditTransportName(transport.name); setIsEditTransportOpen(true) }}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500" onClick={() => { setDeleteTransportId(transport.id); setDeleteTransportName(transport.name); setIsDeleteTransportOpen(true) }}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 truncate leading-tight mt-0.5">{transport.name}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* ---- DIALOGS FOR AREA EDIT/DELETE ---- */}
            <Dialog open={isEditAreaOpen} onOpenChange={setIsEditAreaOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>แก้ไขพื้นที่อบรม</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>ชื่อพื้นที่</Label>
                            <Input value={editAreaName} onChange={(e) => setEditAreaName(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditAreaOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleUpdateArea} disabled={savingArea}>{savingArea && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} บันทึก</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteAreaOpen} onOpenChange={setIsDeleteAreaOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle><AlertDialogDescription>ต้องการลบพื้นที่ &ldquo;{deleteAreaName}&rdquo; หรือไม่?</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteArea} className="bg-destructive hover:bg-destructive/90">ลบ</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ---- DIALOGS FOR BUDGET EDIT/DELETE ---- */}
            <Dialog open={isEditBudgetOpen} onOpenChange={setIsEditBudgetOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>แก้ไขประเภทงบประมาณ</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>ชื่อประเภทงบประมาณ</Label>
                            <Input value={editBudgetName} onChange={(e) => setEditBudgetName(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditBudgetOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleUpdateBudget} disabled={savingBudget}>{savingBudget && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} บันทึก</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteBudgetOpen} onOpenChange={setIsDeleteBudgetOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle><AlertDialogDescription>ต้องการลบประเภทงบประมาณ &ldquo;{deleteBudgetName}&rdquo; หรือไม่?</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBudget} className="bg-destructive hover:bg-destructive/90">ลบ</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ---- DIALOGS FOR TRANSPORT EDIT/DELETE ---- */}
            <Dialog open={isEditTransportOpen} onOpenChange={setIsEditTransportOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>แก้ไขพาหนะในการเดินทาง</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>ชื่อพาหนะ</Label>
                            <Input value={editTransportName} onChange={(e) => setEditTransportName(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditTransportOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleUpdateTransport} disabled={savingTransport}>{savingTransport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} บันทึก</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteTransportOpen} onOpenChange={setIsDeleteTransportOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle><AlertDialogDescription>ต้องการลบพาหนะ &ldquo;{deleteTransportName}&rdquo; หรือไม่?</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTransport} className="bg-destructive hover:bg-destructive/90">ลบ</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
