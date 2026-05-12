// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { projectSchema } from "@/schemas/project-schema";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Parse and validate data
    const parsedData = projectSchema.parse({
      ...body,
      dateRange: {
        from: new Date(body.dateRange.from),
        to: new Date(body.dateRange.to)
      }
    });

    const newProject = await prisma.trainingProject.create({
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
        userId: session.user.id,
        areaId: parsedData.areaId,
      },
    });

    return NextResponse.json({ success: true, data: newProject });

  } catch (error: unknown) {
    console.error("Create Project Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const startMonth = searchParams.get("startMonth");
    const endMonth = searchParams.get("endMonth");
    const budgetType = searchParams.get("budgetType");
    const userId = searchParams.get("userId");
    const transportMethod = searchParams.get("transportMethod");
    const areaId = searchParams.get("areaId");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const province = searchParams.get("province");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 30;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const where: Record<string, unknown> = {};
    if (user?.role !== "ADMIN") {
      where.userId = session.user.id;
    } else if (userId && userId !== "all") {
      where.userId = userId;
    }

    if (startDateParam && endDateParam) {
      where.startDate = {
        gte: new Date(startDateParam),
        lte: new Date(endDateParam)
      };
    } else if (year && year !== "all") {
      const startM = startMonth ? parseInt(startMonth) - 1 : 0;
      const endM = endMonth ? parseInt(endMonth) : 12;

      const startDate = new Date(parseInt(year), startM, 1);
      const endDate = new Date(parseInt(year), endM, 0);
      endDate.setHours(23, 59, 59, 999);

      where.startDate = { gte: startDate, lte: endDate };
    }

    if (budgetType && budgetType !== "all") {
      where.budgetType = budgetType;
    }

    if (areaId && areaId !== "all") {
      where.areaId = areaId;
    }

    if (transportMethod && transportMethod !== "") {
      where.transportMethod = { contains: transportMethod, mode: 'insensitive' };
    }

    if (province && province !== "") {
      where.province = { contains: province, mode: 'insensitive' };
    }

    const projects = await prisma.trainingProject.findMany({
      where,
      include: {
        area: true,
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: skip,
    });

    const total = await prisma.trainingProject.count({ where });

    return NextResponse.json({
      projects,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
