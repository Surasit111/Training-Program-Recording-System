// app/api/transport-methods/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const transportMethods = await prisma.transportMethod.findMany({
            orderBy: { createdAt: "desc" },
        });

        // Add manual counts since schema doesn't have the relation
        const transportMethodsWithCounts = await Promise.all(
            transportMethods.map(async (tm) => {
                const count = await prisma.trainingProject.count({
                    where: { transportMethod: tm.name }
                });
                return {
                    ...tm,
                    _count: { projects: count }
                };
            })
        );

        return NextResponse.json({ transportMethods: transportMethodsWithCounts });
    } catch (error) {
        console.error("GET transport methods error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });
        if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { name } = await req.json();
        if (!name || !name.trim()) {
            return NextResponse.json({ error: "กรุณากรอกชื่อพาหนะ" }, { status: 400 });
        }

        const existing = await prisma.transportMethod.findUnique({ where: { name: name.trim() } });
        if (existing) {
            return NextResponse.json({ error: "มีชื่อพาหนะนี้อยู่แล้ว" }, { status: 400 });
        }

        const transportMethod = await prisma.transportMethod.create({
            data: { name: name.trim() },
        });

        return NextResponse.json({ transportMethod }, { status: 201 });
    } catch (error) {
        console.error("POST transport method error:", error);
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}
