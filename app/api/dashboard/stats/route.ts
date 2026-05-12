import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
        const userId = searchParams.get("userId");

        // Fetch user role to verify admin access for userId filter
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        const where: Record<string, unknown> = {};

        // Role-based filtering
        if (user?.role !== "ADMIN") {
            where.userId = session.user.id;
        } else if (userId && userId !== "all") {
            where.userId = userId;
        }

        // Date filtering
        if (year && year !== "all") {
            const startM = startMonth ? parseInt(startMonth) - 1 : 0;
            const endM = endMonth ? parseInt(endMonth) : 12;

            const startDate = new Date(parseInt(year), startM, 1);
            const endDate = new Date(parseInt(year), endM, 0);
            endDate.setHours(23, 59, 59, 999);

            where.startDate = {
                gte: startDate,
                lte: endDate
            };
        }

        // Note: Month filtering could be more complex, but for now we'll stick to year 
        // or implement month filtering logic here if needed.

        // 1. Total Projects
        const totalProjects = await prisma.trainingProject.count({ where });

        // 2. Transport Method Breakdown
        const transportBreakdown = await prisma.trainingProject.groupBy({
            by: ['transportMethod'],
            where,
            _count: { id: true }
        });

        // 3. Budget Type Breakdown
        const budgetBreakdown = await prisma.trainingProject.groupBy({
            by: ['budgetType'],
            where,
            _count: { id: true }
        });

        // 4. Training Area Breakdown
        const areaBreakdown = await prisma.trainingProject.groupBy({
            by: ['areaId'],
            where,
            _count: { id: true },
        });

        // Get area names for the breakdown
        const areas = await prisma.trainingArea.findMany();
        const areaMap = Object.fromEntries(areas.map(a => [a.id, a.name]));

        // Group by name to avoid duplicates if multiple IDs have the same name
        const areaNameCounts: Record<string, number> = {};
        areaBreakdown.forEach(item => {
            const name = areaMap[item.areaId] || "Unknown";
            areaNameCounts[name] = (areaNameCounts[name] || 0) + item._count.id;
        });

        const formattedAreaBreakdown = Object.entries(areaNameCounts).map(([name, count]) => ({
            name,
            count
        }));

        // 5. Province Breakdown
        const provinceBreakdown = await prisma.trainingProject.groupBy({
            by: ['province'],
            where,
            _count: { id: true },
        });

        const formattedProvinceBreakdown = provinceBreakdown
            .filter(p => p.province)
            .map(p => ({ province: p.province, count: p._count.id }))
            .sort((a, b) => b.count - a.count);

        // 6. Map Pins
        const pins = await prisma.trainingProject.findMany({
            where,
            select: {
                id: true,
                projectName: true,
                latitude: true,
                longitude: true,
                province: true
            }
        });

        // 7. Recent Projects (Paginated)
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 10;
        const skip = (page - 1) * limit;

        const recentProjects = await prisma.trainingProject.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip,
            include: {
                user: { select: { name: true } },
                area: { select: { name: true } }
            }
        });

        const totalRecent = await prisma.trainingProject.count({ where });

        // 8. Distinct values for filters
        const allTransportMethods = await prisma.transportMethod.findMany({
            orderBy: { name: 'asc' },
            select: { name: true }
        });
        const distinctProvinces = await prisma.trainingProject.findMany({
            where,
            select: { province: true },
            distinct: ['province'],
        });

        // Get distinct years from startDate
        // Using queryRaw because Prisma doesn't support distinct on date parts directly
        const distinctYearsRaw = await prisma.$queryRaw`
            SELECT DISTINCT EXTRACT(YEAR FROM "startDate") as year 
            FROM "TrainingProject" 
            WHERE "startDate" IS NOT NULL
            ORDER BY year DESC
        `;

        const distinctYears = (distinctYearsRaw as Array<{ year: number }>)
            .map(r => Number(r.year))
            .filter(y => !isNaN(y));

        return NextResponse.json({
            totalProjects,
            transportBreakdown,
            budgetBreakdown,
            provinceBreakdown: formattedProvinceBreakdown,
            areaBreakdown: formattedAreaBreakdown,
            pins: pins.filter(p => p.latitude && p.longitude),
            recentProjects,
            distinctTransportMethods: allTransportMethods.map(t => t.name),
            distinctProvinces: distinctProvinces.map(p => p.province).filter(Boolean).sort(),
            distinctYears,
            pagination: {
                total: totalRecent,
                pages: Math.ceil(totalRecent / limit),
                currentPage: page
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
