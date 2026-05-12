// app/api/transport-methods/[id]/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });
        if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { id } = await params;
        const { name } = await req.json();

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "กรุณากรอกชื่อพาหนะ" }, { status: 400 });
        }

        const transportMethod = await prisma.transportMethod.update({
            where: { id },
            data: { name: name.trim() },
        });

        return NextResponse.json({ transportMethod });
    } catch (error) {
        console.error("PUT transport method error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });
        if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { id } = await params;
        await prisma.transportMethod.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE transport method error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
