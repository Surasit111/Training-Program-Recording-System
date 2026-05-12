// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema สำหรับตรวจสอบข้อมูลที่ส่งมาแก้ไข
const updateProfileSchema = z.object({
  name: z.string().min(2, "ชื่อต้องยาวอย่างน้อย 2 ตัวอักษร"),
  phoneNumber: z.string()
    .optional()
    .refine((val) => !val || /^0[0-9]{8,9}$/.test(val), {
      message: "รูปแบบเบอร์โทรไม่ถูกต้อง (เช่น 0812345678)",
    }),
});

export async function PUT(req: Request) {
  try {
    // 1. เช็ค Session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. รับข้อมูลและ Validate
    const body = await req.json();
    const { name, phoneNumber } = updateProfileSchema.parse(body);

    // 3. อัปเดตลง Database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phoneNumber: phoneNumber || null,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 }
    );
  }
}

// GET endpoint เพื่อดึงข้อมูล profile รวม phoneNumber
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phoneNumber: true,
        role: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fetch failed" },
      { status: 500 }
    );
  }
}