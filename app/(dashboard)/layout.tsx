// app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ดึง session และ role จาก database
  const session = await auth.api.getSession({
    headers: await headers()
  })

  let userRole: "USER" | "ADMIN" = "USER"

  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    userRole = (user?.role as "USER" | "ADMIN") || "USER"
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar ซ้ายมือ - ส่ง userRole ไปด้วย */}
      <Sidebar userRole={userRole} />

      {/* Content ขวามือ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}