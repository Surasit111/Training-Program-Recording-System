// app/api/profile/image/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { image } = body;

        if (!image || typeof image !== "string") {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
        }

        // Update user image in database
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { image },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: unknown) {
        console.error("Profile image update error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Update failed" },
            { status: 500 }
        );
    }
}
