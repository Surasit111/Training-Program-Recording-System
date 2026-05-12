// app/(dashboard)/page.tsx
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import DashboardClient from "@/components/DashboardClient"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  const userRole = user?.role || "USER"

  // If ADMIN, fetch all users for the filter
  let users: { id: string, name: string }[] = []
  if (userRole === "ADMIN") {
    users = await prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base sm:text-3xl font-black tracking-tight text-slate-900 whitespace-nowrap">
          ระบบติดตามโครงการอบรม
        </h2>
        <div className="bg-slate-50 px-2.5 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-200 uppercase tracking-widest shrink-0 shadow-sm">
          {userRole}
        </div>
      </div>

      <DashboardClient userRole={userRole} users={users} />
    </div>
  )
}