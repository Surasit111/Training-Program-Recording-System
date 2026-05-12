// app/(auth)/login/page.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@/schemas/auth-schema" // ตรวจสอบว่าไฟล์นี้มีอยู่จากการทำ Step ก่อนหน้า
import { z } from "zod"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/components/ui/toast"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true)
    await authClient.signIn.email({
      email: values.email,
      password: values.password,
    }, {
      onSuccess: () => {
        // ล็อกอินสำเร็จ -> ไปหน้า Dashboard
        router.push("/")
        router.refresh() // รีเฟรชเพื่อให้ Server Component รู้ว่า User ล็อกอินแล้ว
      },
      onError: (ctx) => {
        addToast({ title: ctx.error.message, type: "error" })
        setLoading(false)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-[400px] shadow-2xl shadow-slate-200/50 border-slate-100 rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle>เข้าสู่ระบบ</CardTitle>
          <CardDescription>กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน</CardDescription>
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 space-y-2 text-center text-sm">
            <div>
              <Link href="/forgot-password" className="text-blue-600 hover:underline">ลืมรหัสผ่าน?</Link>
            </div>
            <div>
              ยังไม่มีบัญชี? <Link href="/register" className="text-blue-600 hover:underline">ลงทะเบียน</Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}