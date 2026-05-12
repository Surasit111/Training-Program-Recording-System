"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

const forgotPasswordSchema = z.object({
    email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
})

export default function ForgotPasswordPage() {
    const [emailSent, setEmailSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    })

    async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
        setLoading(true)
        setError("")
        try {
            const res = await fetch("/api/auth/request-password-reset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: values.email,
                    redirectTo: "/reset-password",
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "เกิดข้อผิดพลาดในการส่งอีเมล")
            }

            setEmailSent(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
        } finally {
            setLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-green-600">ตรวจสอบอีเมลของคุณ ✓</CardTitle>
                        <CardDescription>
                            เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว (กรุณาเช็คใน Console หากทดสอบ Local)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-500">
                                หากไม่ได้รับอีเมล กรุณาตรวจสอบในโฟลเดอร์ขยะ หรือลองใหม่อีกครั้ง
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setEmailSent(false)}
                                className="w-full"
                            >
                                ลองใหม่อีกครั้ง
                            </Button>
                            <Link href="/login" className="block text-sm text-blue-600 hover:underline">
                                กลับไปหน้าเข้าสู่ระบบ
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>ลืมรหัสผ่าน</CardTitle>
                    <CardDescription>กรอกอีเมลเพื่อรับลิงก์สำหรับรีเซ็ตรหัสผ่าน</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>อีเมล</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        <Link href="/login" className="text-blue-600 hover:underline">
                            ← กลับไปหน้าเข้าสู่ระบบ
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
