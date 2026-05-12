// schemas/project-schema.ts
import { z } from "zod"

export const projectSchema = z.object({
  projectName: z.string().min(1, "กรุณาระบุชื่อโครงการ"),
  projectCode: z.string().min(1, "กรุณาระบุหมายเลขโครงการ"),
  budgetType: z.string().min(1, "กรุณาเลือกประเภทงบประมาณ"),
  areaId: z.string().min(1, "กรุณาเลือกพื้นที่อบรม"),

  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).refine((data) => data.from && data.to, {
    message: "กรุณาระบุวันเริ่มต้นและวันสิ้นสุด"
  }).refine((data) => data.to >= data.from, {
    message: "วันสิ้นสุดต้องหลังวันเริ่มต้น"
  }),

  transportMethod: z.string().optional(),
  province: z.string().min(1, "กรุณาระบุจังหวัด"),
  locationDetail: z.string().min(1, "ระบุสถานที่จัด"),
  description: z.string().optional(),

  // Map fields
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  district: z.string().optional(),
  provinceFromMap: z.string().optional(),

  // Media
  projectImages: z.array(z.string()).optional(),
  certificates: z.array(z.string()).optional(),
})
