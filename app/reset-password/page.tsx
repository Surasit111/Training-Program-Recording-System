"use client"

import { useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { useSearchParams } from "next/navigation"

const resetPasswordSchema = z.object({
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
})

// Component ที่ใช้ useSearchParams - แยกออกมาเพื่อให้สามารถ wrap ด้วย Suspense ได้
function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token") || ""
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    })

    async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
        if (!token) {
            setError("ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน")
            return
        }
        setLoading(true)
        setError("")
        try {
            const { error } = await authClient.resetPassword({
                newPassword: values.password,
                token: token,
                fetchOptions: {
                    onError: (ctx) => {
                        setError(ctx.error.message || "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน")
                    }
                }
            })
            if (error) {
                setError(error.message || "เกิดข้อผิดพลาด")
            } else {
                setSuccess(true)
            }
        } catch {
            setError("เกิดข้อผิดพลาด")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-green-600">รีเซ็ตรหัสผ่านสำเร็จ ✓</CardTitle>
                        <CardDescription>รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/login">
                            <Button className="w-full">กลับไปหน้าเข้าสู่ระบบ</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>ตั้งรหัสผ่านใหม่</CardTitle>
                    <CardDescription>กรุณากรอกรหัสผ่านใหม่ของคุณ</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>รหัสผ่านใหม่</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ยืนยันรหัสผ่านใหม่</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

// Loading fallback component
function LoadingFallback() {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <p className="text-gray-500">กำลังโหลด...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Page component หลัก - wrap ด้วย Suspense
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordForm />
        </Suspense>
    )
}
