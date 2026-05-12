"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import { UserData } from "./columns"

interface EditUserDialogProps {
    user: UserData | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
    const { addToast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        role: "",
        password: "",
    })

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                role: user.role,
                password: "",
            })
        }
    }, [user])

    const handleUpdate = async () => {
        if (!user) return
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                addToast({ title: "อัปเดตผู้ใช้งานเรียบร้อย", type: "success" })
                onOpenChange(false)
                router.refresh()
                if (onSuccess) onSuccess()
            } else {
                const err = await res.json()
                addToast({ title: err.error || "อัปเดตไม่สำเร็จ", type: "error" })
            }
        } catch {
            addToast({ title: "เกิดข้อผิดพลาด", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>แก้ไขข้อมูลผู้ใช้งาน</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">อีเมล</Label>
                        <Input
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                        <Input
                            id="phone"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData(f => ({ ...f, phoneNumber: e.target.value }))}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">สิทธิ์การใช้งาน</Label>
                        <Select
                            disabled={user.isFirstAdmin || user.isCurrentUser}
                            value={formData.role}
                            onValueChange={(v) => setFormData(f => ({ ...f, role: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกสิทธิ์" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={4}>
                                <SelectItem value="USER">User (ผู้ใช้งานทั่วไป)</SelectItem>
                                <SelectItem value="ADMIN">Admin (ผู้ดูแลระบบ)</SelectItem>
                            </SelectContent>
                        </Select>
                        {user.isFirstAdmin && <p className="text-xs text-muted-foreground">ไม่สามารถเปลี่ยนสิทธิ์ของแอดมินคนแรกได้</p>}
                        {user.isCurrentUser && <p className="text-xs text-muted-foreground">ไม่สามารถเปลี่ยนสิทธิ์ของตัวเองได้</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">รีเซ็ตรหัสผ่าน (เว้นว่างหากไม่ต้องการเปลี่ยน)</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="กรอกรหัสผ่านใหม่"
                                value={formData.password}
                                onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
                    <Button onClick={handleUpdate} disabled={loading}>
                        {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface DeleteUserDialogProps {
    user: UserData | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function DeleteUserDialog({ user, open, onOpenChange, onSuccess }: DeleteUserDialogProps) {
    const { addToast } = useToast()
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!user) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
            if (res.ok) {
                addToast({ title: "ลบผู้ใช้งานเรียบร้อย", type: "success" })
                onOpenChange(false)
                router.refresh()
                if (onSuccess) onSuccess()
            } else {
                const err = await res.json()
                addToast({ title: err.error || "ลบไม่สำเร็จ", type: "error" })
            }
        } catch {
            addToast({ title: "เกิดข้อผิดพลาด", type: "error" })
        } finally {
            setIsDeleting(false)
        }
    }

    if (!user) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-2xl p-0 gap-0 overflow-hidden">
                {/* Header with Icon */}
                <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
                        <AlertTriangle className="h-10 w-10 text-red-500" strokeWidth={1.5} />
                    </div>

                    <DialogHeader className="space-y-3 text-center">
                        <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">
                            ยืนยันการลบผู้ใช้งาน
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 leading-relaxed text-center max-w-xs mx-auto">
                            คุณต้องการลบผู้ใช้งาน<br />
                            <span className="font-semibold text-gray-900 text-base block mt-1">
                                &ldquo;{user.name}&rdquo;
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Footer Buttons */}
                <DialogFooter className="flex-row gap-0 border-t border-gray-100 p-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                        className="flex-1 h-14 rounded-none border-r border-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 h-14 rounded-none bg-red-500 hover:bg-red-600 text-white font-medium transition-colors border-0"
                    >
                        {isDeleting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                กำลังลบ...
                            </span>
                        ) : (
                            "ยืนยันการลบ"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
