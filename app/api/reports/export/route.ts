import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import ExcelJS from "exceljs"
import { format } from "date-fns"
import { th } from "date-fns/locale"

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Get user role
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, name: true }
        })

        const userRole = user?.role || "USER"

        // Parse query params
        const { searchParams } = new URL(req.url)
        const year = searchParams.get("year")
        const budgetType = searchParams.get("budgetType")
        const areaId = searchParams.get("areaId")
        const province = searchParams.get("province")
        const transportMethod = searchParams.get("transportMethod")
        const userId = searchParams.get("userId")
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")

        // Build filter
        const where: any = {}

        // 1. Role-based filter
        if (userRole === "USER") {
            // Users can only see their own projects
            where.userId = session.user.id
        } else if (userRole === "ADMIN") {
            // Admin can filter by user
            if (userId && userId !== "all") {
                where.userId = userId
            }
        }

        // 2. Common filters
        if (year && year !== "all") {
            // Filter by fiscal year or calendar year based on project logic
            // Assuming start date year for now
            // Or if text search on year field? 
            // The project schema doesn't seem to have direct 'fiscalYear' field stored, 
            // usually derived from startDate.
            // Let's filter by startDate range for that year
            const startOfYear = new Date(parseInt(year) - 543, 0, 1) // Adjust for Thai year if input is Thai, but frontend sends AD usually?
            // Wait, front end sends: new Date().getFullYear().toString() which is AD.
            // But display shows +543.
            // So 'year' param is AD.
            const start = new Date(parseInt(year), 0, 1)
            const end = new Date(parseInt(year), 11, 31, 23, 59, 59)

            // If startDate is also provided, intersect?
            // Let's prioritize specific date range if provided, else use year.
            // Actually, usually filters are AND.
            if (!startDate && !endDate) {
                where.startDate = {
                    gte: start,
                    lte: end
                }
            }
        }

        if (budgetType && budgetType !== "all") {
            where.budgetType = budgetType
        }

        if (areaId && areaId !== "all") {
            where.areaId = areaId
        }

        if (province && province !== "all") {
            where.province = province
        }

        if (transportMethod && transportMethod !== "all") {
            where.transportMethod = transportMethod
        }

        // Date Range Override
        if (startDate || endDate) {
            where.startDate = {}
            if (startDate) where.startDate.gte = new Date(startDate)
            if (endDate) where.startDate.lte = new Date(endDate)
        }

        // Fetch data
        const projects = await prisma.trainingProject.findMany({
            where,
            include: {
                area: true,
                user: {
                    select: { name: true }
                }
            },
            orderBy: {
                startDate: 'desc'
            }
        })

        // Create Excel Workbook
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Projects")

        // Define Columns
        const columnsParam = searchParams.get("columns")

        // Define Master Columns
        const allColumns = [
            { header: "ลำดับ", key: "index", width: 10 },
            { header: "รหัสโครงการ", key: "projectCode", width: 15 },
            { header: "ชื่อโครงการ", key: "projectName", width: 40 },
            { header: "รายละเอียด", key: "description", width: 30 },
            { header: "ประเภทงบประมาณ", key: "budgetType", width: 20 },
            { header: "พื้นที่ดำเนินการ", key: "area", width: 20 },
            { header: "จังหวัด", key: "province", width: 20 },
            { header: "สถานที่จัด (รายละเอียดเพิ่มเติม)", key: "locationDetail", width: 30 },
            { header: "วันที่เริ่มต้น", key: "startDate", width: 15 },
            { header: "วันที่สิ้นสุด", key: "endDate", width: 15 },
            { header: "การเดินทาง", key: "transportMethod", width: 15 },
            { header: "ผู้บันทึก", key: "createdBy", width: 20 },
            { header: "วันที่บันทึก", key: "createdAt", width: 20 },
        ]

        // Filter Columns
        if (columnsParam) {
            const selectedKeys = columnsParam.split(",")
            worksheet.columns = allColumns.filter(col => selectedKeys.includes(col.key))
        } else {
            worksheet.columns = allColumns
        }

        // Style Header
        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9D9D9" }
        }

        // Add Data
        projects.forEach((p, index) => {
            worksheet.addRow({
                index: index + 1,
                projectCode: p.projectCode || "-",
                projectName: p.projectName,
                description: p.description || "-",
                budgetType: p.budgetType || "-",
                area: p.area?.name || "-",
                province: p.province ? p.province.replace("จังหวัด", "") : "-",
                locationDetail: p.locationDetail || "-",
                startDate: format(new Date(p.startDate), "d MMM yyyy", { locale: th }),
                endDate: p.endDate ? format(new Date(p.endDate), "d MMM yyyy", { locale: th }) : "-",
                transportMethod: p.transportMethod || "-",
                createdBy: (p as any).user?.name || "-",
                createdAt: format(new Date(p.createdAt), "d MMM yyyy HH:mm", { locale: th }),
            })
        })

        // Generate Buffer
        const buffer = await workbook.xlsx.writeBuffer()

        // Return Response
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="projects_export.xlsx"`
            }
        })

    } catch (error) {
        console.error("Export Error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
