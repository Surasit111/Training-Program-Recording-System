// app/api/areas/[id]/route.ts
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const areaSchema = z.object({
    name: z.string().min(2, "ชื่อพื้นที่ต้องมีอย่างน้อย 2 ตัวอักษร"),
})

// PUT - แก้ไข Training Area
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // ตรวจสอบ role (เฉพาะ Admin)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { id } = await params
        const body = await req.json()
        const { name } = areaSchema.parse(body)

        const area = await prisma.trainingArea.update({
            where: { id },
            data: { name }
        })

        return NextResponse.json({ success: true, area })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Update failed" },
            { status: 500 }
        )
    }
}

// DELETE - ลบ Training Area
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // ตรวจสอบ role (เฉพาะ Admin)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { id } = await params

        // ตรวจสอบว่ามี projects ที่ใช้ area นี้หรือไม่
        const projectCount = await prisma.trainingProject.count({
            where: { areaId: id }
        })

        if (projectCount > 0) {
            return NextResponse.json(
                { error: `ไม่สามารถลบได้ เนื่องจากมีโครงการ ${projectCount} รายการที่ใช้พื้นที่นี้` },
                { status: 400 }
            )
        }

        await prisma.trainingArea.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Delete failed" },
            { status: 500 }
        )
    }
}
