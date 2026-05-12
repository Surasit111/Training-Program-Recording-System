import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createBudgetSchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อประเภทงบประมาณ"),
});

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { name } = createBudgetSchema.parse(body);

        const budgetType = await prisma.budgetType.create({
            data: { name },
        });

        return NextResponse.json({ success: true, budgetType });
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return NextResponse.json({ error: "ชื่อประเภทงบประมาณซ้ำกัน" }, { status: 400 });
        }
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET() {
    try {
        const budgetTypes = await prisma.budgetType.findMany({
            orderBy: { createdAt: "desc" },
        });

        // Add manual counts since schema doesn't have the relation
        const budgetTypesWithCounts = await Promise.all(
            budgetTypes.map(async (bt) => {
                const count = await prisma.trainingProject.count({
                    where: { budgetType: bt.name }
                });
                return {
                    ...bt,
                    _count: { projects: count }
                };
            })
        );

        return NextResponse.json({ budgetTypes: budgetTypesWithCounts });
    } catch {
        return NextResponse.json({ error: "Failed to fetch budget types" }, { status: 500 });
    }
}
