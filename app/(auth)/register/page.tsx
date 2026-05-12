// app/(auth)/register/page.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema } from "@/schemas/auth-schema"
import { z } from "zod"
import { authClient } from "@/lib/auth-client" // เรียก Client ที่เราสร้างไว้
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/components/ui/toast"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setLoading(true)
    // เรียกใช้ Better Auth Sign Up
    await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      phoneNumber: values.phoneNumber || undefined,
    } as {
      email: string;
      password: string;
      name: string;
      phoneNumber?: string;
    }, {
      onSuccess: () => {
        addToast({ title: "ลงทะเบียนสำเร็จ!", description: "กรุณาเข้าสู่ระบบด้วยบัญชีที่สร้าง", type: "success" })
        router.push("/login")
      },
      onError: (ctx) => {
        addToast({ title: ctx.error.message, type: "error" })
        setLoading(false)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-12">
      <Card className="w-full max-w-[420px] shadow-2xl shadow-slate-200/50 border-slate-100 rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle>ลงทะเบียนเข้าใช้งาน</CardTitle>
          <CardDescription>กรอกข้อมูลเพื่อสร้างบัญชีใหม่</CardDescription>
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
                      <Input placeholder="สมชาย ใจดี" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมล</FormLabel>
                    <FormControl>
                      <Input placeholder="example@email.com" {...field} />
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
                    <FormLabel>เบอร์โทรศัพท์ (ไม่บังคับ)</FormLabel>
                    <FormControl>
                      <Input placeholder="0812345678" {...field} />
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
                    <FormLabel>ยืนยันรหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            มีบัญชีอยู่แล้ว? <Link href="/login" className="text-blue-600 hover:underline">เข้าสู่ระบบ</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}