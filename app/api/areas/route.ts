// app/api/areas/route.ts
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const areaSchema = z.object({
    name: z.string().min(2, "ชื่อพื้นที่ต้องมีอย่างน้อย 2 ตัวอักษร"),
})

// GET - ดึงรายการ Training Areas ทั้งหมด
export async function GET() {
    try {
        const areas = await prisma.trainingArea.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { projects: true }
                }
            }
        })

        return NextResponse.json({ areas })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Fetch failed" },
            { status: 500 }
        )
    }
}

// POST - สร้าง Training Area ใหม่
export async function POST(req: Request) {
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

        const body = await req.json()
        const { name } = areaSchema.parse(body)

        const area = await prisma.trainingArea.create({
            data: { name }
        })

        return NextResponse.json({ success: true, area })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Create failed" },
            { status: 500 }
        )
    }
}
