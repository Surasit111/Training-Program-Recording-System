// app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { projectSchema } from "@/schemas/project-schema";

// GET - Fetch project detail
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.trainingProject.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

// PUT - Update project
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const parsedData = projectSchema.parse({
      ...body,
      dateRange: {
        from: new Date(body.dateRange.from),
        to: new Date(body.dateRange.to)
      }
    });

    const updatedProject = await prisma.trainingProject.update({
      where: { id },
      data: {
        projectName: parsedData.projectName,
        projectCode: parsedData.projectCode,
        budgetType: parsedData.budgetType,
        startDate: parsedData.dateRange.from,
        endDate: parsedData.dateRange.to,
        transportMethod: parsedData.transportMethod,
        province: parsedData.province,
        locationDetail: parsedData.locationDetail,
        description: parsedData.description,

        // Map fields
        latitude: parsedData.latitude,
        longitude: parsedData.longitude,
        district: parsedData.district,
        provinceFromMap: parsedData.provinceFromMap,

        // Media
        projectImages: parsedData.projectImages || [],
        certificates: parsedData.certificates || [],

        // Relations
        areaId: parsedData.areaId,
      },
    });

    return NextResponse.json({ success: true, data: updatedProject });
  } catch (error: unknown) {
    console.error("Update Project Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Delete project
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

    const { id } = await params;

    await prisma.trainingProject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}