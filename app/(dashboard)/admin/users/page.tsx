import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import UsersClient from "./client"
import { UserData } from "./columns"

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session || !session.user) {
    redirect("/login")
  }

  const userCheck = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (userCheck?.role !== "ADMIN") {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Admin Only)
      </div>
    )
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      phoneNumber: true,
      createdAt: true
    }
  })

  // Find the first admin to protect
  const firstAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true }
  })

  const formattedUsers = users.map(user => ({
    ...user,
    isFirstAdmin: firstAdmin?.id === user.id,
    isCurrentUser: session.user.id === user.id,
    // Add flags for easier UI logic
    isSuperAdmin: session.user.id === firstAdmin?.id,
    canEdit: session.user.id === firstAdmin?.id || (userCheck?.role === "ADMIN" && user.role === "USER")
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base sm:text-3xl font-black tracking-tight text-slate-900 whitespace-nowrap">
            จัดการผู้ใช้งาน
          </h1>
        </div>
        <div className="bg-slate-50 px-2.5 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-200 uppercase tracking-widest shrink-0 shadow-sm">
          ADMIN
        </div>
      </div>

      <UsersClient data={formattedUsers as UserData[]} />
    </div>
  )
}