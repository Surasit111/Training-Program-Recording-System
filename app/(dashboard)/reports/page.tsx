import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ReportsClient from "./client"

export default async function ReportsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        redirect("/sign-in")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    })

    const userRole = user?.role || "USER"
    let usersList: any[] = []

    if (userRole === "ADMIN") {
        usersList = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true
            },
            orderBy: {
                name: 'asc'
            }
        })
    }

    return (
        <ReportsClient
            userRole={userRole}
            users={usersList}
        />
    )
}
