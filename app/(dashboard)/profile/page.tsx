// app/(dashboard)/profile/page.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useEffect, useRef, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Camera, Mail, Phone, User } from "lucide-react"
import { useToast } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Schema สำหรับ form
const profileFormSchema = z.object({
    name: z.string().min(2, "ชื่อต้องยาวอย่างน้อย 2 ตัวอักษร"),
    phoneNumber: z.string()
        .optional()
        .refine((val) => !val || /^0[0-9]{8,9}$/.test(val), {
            message: "รูปแบบเบอร์โทรไม่ถูกต้อง (เช่น 0812345678)",
        }),
})

interface UserProfile {
    id: string
    name: string
    email: string
    image: string | null
    phoneNumber: string | null
    role: string
}

export default function ProfilePage() {
    const { addToast } = useToast()
    const router = useRouter()
    const { data: session } = authClient.useSession()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: "",
            phoneNumber: "",
        },
    })

    // ดึงข้อมูล profile จาก API
    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/profile")
                if (res.ok) {
                    const data = await res.json()
                    setProfile(data.user)
                    form.reset({
                        name: data.user?.name || "",
                        phoneNumber: data.user?.phoneNumber || "",
                    })
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error)
            }
        }

        if (session?.user) {
            fetchProfile()
        }
    }, [session, form])

    async function onSubmit(values: z.infer<typeof profileFormSchema>) {
        setLoading(true)
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name,
                    phoneNumber: values.phoneNumber || undefined,
                }),
            })

            if (!res.ok) throw new Error("อัปเดตไม่สำเร็จ")

            addToast({ title: "อัปเดตข้อมูลสำเร็จ!", type: "success" })
            router.refresh()

        } catch (error) {
            console.error("Profile Update Error:", error)
            addToast({ title: "เกิดข้อผิดพลาด", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!res.ok) throw new Error("อัปโหลดไม่สำเร็จ")

            const data = await res.json()

            // อัปเดต profile image
            await fetch("/api/profile/image", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: data.url }),
            })

            // Update local state immediately
            if (profile) {
                setProfile({ ...profile, image: data.url })
            }

            addToast({ title: "อัปโหลดรูปโปรไฟล์สำเร็จ!", type: "success" })
            router.refresh()
            window.location.reload() // Force reload to ensure session updates header too
        } catch (error) {
            console.error("Upload Error:", error)
            addToast({ title: "เกิดข้อผิดพลาดในการอัปโหลด", type: "error" })
        } finally {
            setUploading(false)
        }
    }

    if (!session) return <div className="p-8">กำลังโหลดข้อมูล...</div>

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">ข้อมูลส่วนตัว</h1>

            {/* Profile Card - Layout ตามที่กำหนด */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-6 text-center">
                        {/* รูปโปรไฟล์ */}
                        <div className="relative group">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={profile?.image || session.user.image || ""} />
                                <AvatarFallback className="text-2xl bg-primary/10">
                                    {session.user.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {/* Overlay สำหรับอัปโหลด */}
                            <div
                                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="h-6 w-6 text-white" />
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        {/* ข้อมูลพื้นฐาน */}
                        <div className="w-full space-y-2 text-left">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-lg">{profile?.name || session.user.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span className="break-all">{profile?.email || session.user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{profile?.phoneNumber || "ยังไม่ได้ระบุเบอร์โทร"}</span>
                            </div>
                            {uploading && (
                                <p className="text-sm text-blue-600">กำลังอัปโหลดรูป...</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Form Card */}
            <Card>
                <CardHeader>
                    <CardTitle>แก้ไขข้อมูลพื้นฐาน</CardTitle>
                    <CardDescription>จัดการชื่อและเบอร์โทรศัพท์</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ชื่อ-นามสกุล</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>เบอร์โทรศัพท์</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0812345678" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email (แสดงเฉยๆ ไม่ให้แก้ไข) */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">อีเมล</label>
                                <Input
                                    value={profile?.email || session.user.email || ""}
                                    disabled
                                    className="bg-gray-100"
                                />
                                <p className="text-xs text-muted-foreground">อีเมลไม่สามารถแก้ไขได้</p>
                            </div>

                            <Button type="submit" disabled={loading}>
                                {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}