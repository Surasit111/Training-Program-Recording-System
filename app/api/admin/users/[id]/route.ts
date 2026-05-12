// app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateUserSchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อ"),
    email: z.string().email("อีเมลไม่ถูกต้อง"),
    phoneNumber: z.string().optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร").optional().or(z.literal("")),
});

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if the current user is an ADMIN
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (currentUser?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const parsedData = updateUserSchema.parse(body);

        // Check if target user is the first admin
        const firstAdmin = await prisma.user.findFirst({
            where: { role: "ADMIN" },
            orderBy: { createdAt: "asc" },
            select: { id: true }
        });

        // Prevent changing role of the first admin
        if (firstAdmin?.id === id && parsedData.role && parsedData.role !== "ADMIN") {
            return NextResponse.json({ error: "Cannot change role of the first admin" }, { status: 400 });
        }

        // Prevent changing own role
        if (session.user.id === id && parsedData.role && parsedData.role !== currentUser?.role) {
            return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
        }

        // Update User info
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: parsedData.name,
                email: parsedData.email,
                phoneNumber: parsedData.phoneNumber,
                role: parsedData.role,
            },
        });

        // Update Password if provided
        if (parsedData.password && parsedData.password.length > 0) {
            const hashedPassword = await bcrypt.hash(parsedData.password, 10);

            // Find existing account with password (usually 'credential' or 'email')
            // better-auth usually uses 'credential' providerId for email/pass
            const account = await prisma.account.findFirst({
                where: {
                    userId: id,
                    password: { not: null }
                }
            });

            if (account) {
                await prisma.account.update({
                    where: { id: account.id },
                    data: { password: hashedPassword }
                });
            } else {
                // Optional: Create account if not exists? For now, we assume user signed up via email.
                // If they signed up via Google, they might not have a password account. 
                // We can skip or return warning. For now, silent skip.
            }
        }

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: unknown) {
        console.error("Update User Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Update failed";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (currentUser?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;

        // Prevent self-deletion
        if (id === session.user.id) {
            return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
        }

        // Check if target user is the first admin
        const firstAdmin = await prisma.user.findFirst({
            where: { role: "ADMIN" },
            orderBy: { createdAt: "asc" },
            select: { id: true }
        });

        if (firstAdmin?.id === id) {
            return NextResponse.json({ error: "Cannot delete the first admin" }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Delete User Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Delete failed";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
