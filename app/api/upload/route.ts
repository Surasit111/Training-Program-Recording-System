// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. เช็คสิทธิ์ (คนนอกห้ามอัปโหลด)
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. รับไฟล์จาก FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // 3. ใช้ Unified Storage (Local หรือ Supabase)
    const fileUrl = await uploadFile(file, 'uploads');

    // 4. ส่ง URL กลับไปให้ Frontend
    return NextResponse.json({ url: fileUrl });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}