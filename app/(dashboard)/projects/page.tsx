// app/(dashboard)/projects/page.tsx
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import ProjectsClient from "@/components/ProjectsClient"
import { redirect } from "next/navigation"

export default async function ProjectsPage() {
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
      <ProjectsClient userRole={userRole} users={users} />
    </div>
  )
}