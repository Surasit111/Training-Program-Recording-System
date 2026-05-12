# Train Management System (TMS)

> ระบบบริหารจัดการโครงการฝึกอบรมและสถิติอัจฉริยะ — ติดตามโครงการ, วิเคราะห์งบประมาณตามประเภท, และระบุตำแหน่งพื้นที่ฝึกอบรมทั่วประเทศไทยแบบ Interactive

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.3.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## -------------------------------------------------------------------

🔗 **[Live Demo](https://training-program-recording-system.vercel.app/)**

## -------------------------------------------------------------------

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@gmail.com` | `123456789` |
| **Secondary Admin** | `admin2@gmail.com` | `123456789` |
| **General User** | `user@gmail.com` | `123456789` |

> [!NOTE]
> ระบบมีการแยกสิทธิ์ 3 ระดับ: **Super Admin** (สิทธิ์สูงสุด), **Admin** (ผู้ช่วยดูแลระบบ), และ **User** (ผู้บันทึกข้อมูล) เพื่อความปลอดภัยและเป็นระเบียบของข้อมูลโครงการ

---

## Screenshots & Demos

### Advanced Analytics Dashboard
หน้าแรกสรุปข้อมูลสถิติที่สำคัญ พร้อมกราฟ Recharts แสดงสัดส่วนงบประมาณและจำนวนโครงการแยกตามพื้นที่
![Dashboard](docs/screenshots/Dashboard.png)

### Geocoding & Interactive Map
ปักหมุดตำแหน่งโครงการลงบนแผนที่ Leaflet โดยรองรับระบบ Geocoding เพื่อค้นหาพิกัดจากที่อยู่จริง
![Map View](docs/screenshots/Map.png)

### Project Life-cycle Management
ระบบจัดการโครงการที่ครบวงจร ตั้งแต่การบันทึกรหัสโครงการ จนถึงการสรุปรายงาน
![Project Management](docs/screenshots/Projects.png)

### Comprehensive Form Design
แบบฟอร์มการกรอกข้อมูลโครงการที่ออกแบบมาให้ใช้งานง่าย พร้อมระบบปักหมุดอัตโนมัติ
![New Project](docs/screenshots/NewProject.png)

### Excel Data Export & Reports
ระบบส่งออกรายงานโครงการเป็นไฟล์ Excel พร้อมระบบกรองข้อมูลอัจฉริยะ
![Excel Export](docs/screenshots/ExportGIF.gif)

### Detailed Project Insights
หน้าแสดงรายละเอียดเจาะลึกของแต่ละโครงการ รวมถึงภาพกิจกรรมและเอกสารแนบ
![Project Details](docs/screenshots/Details.png)

---

## Key Features

| Feature | รายละเอียด |
|---|---|
| **Training Project Tracking** | บันทึกและจัดการโครงการฝึกอบรมอย่างเป็นระบบ พร้อมระบบคำนวณจำนวนวันอัตโนมัติ |
| **Smart Geocoding Map** | ระบุพิกัดโครงการบนแผนที่ Interactive รองรับการแสดงผลรายโครงการและภาพรวมทั้งระบบ |
| **Budget Categorization** | วิเคราะห์และติดตามงบประมาณแยกตามประเภท (Budget Types) เพื่อความโปร่งใส |
| **Excel Data Export** | ระบบส่งออกรายงานโครงการเป็นไฟล์ Excel พร้อมระบบกรองข้อมูลตามเงื่อนไขที่ต้องการ |
| **Rich Media Storage** | ระบบจัดเก็บรูปภาพโครงการและใบประกาศนียบัตร (Certificates) ในรูปแบบ Digital Assets |
| **Complex Reporting** | ระบบรายงานขั้นสูงที่สามารถวิเคราะห์สถิติและแสดงผลในรูปแบบกราฟ (Charts) |
| **User Profile & Security** | จัดการข้อมูลส่วนตัวและระบบเปลี่ยนรหัสผ่าน พร้อมการรักษาความปลอดภัยด้วย Better-Auth |
| **Enterprise RBAC** | ควบคุมสิทธิ์การเข้าถึงข้อมูลตามบทบาทของผู้ใช้งาน (Admin / User) อย่างเข้มงวด |

---

## Tech Stack & Rationale

| Technology | Version | เหตุผลที่เลือก |
|---|---|---|
| **Next.js** (App Router) | 16.1.6 | ใช้ประสิทธิภาพสูงสุดของ Server Components และ Route Handlers |
| **React** | 19.2.3 | รองรับ Features ใหม่ๆ และการจัดการ UI ที่ซับซ้อนในหน้า Reports |
| **Prisma ORM** | 7.3.0 | มั่นใจเรื่อง Type-safety ของข้อมูลโครงการและความสัมพันธ์ของหมวดหมู่ต่างๆ |
| **PostgreSQL** | 16 | ฐานข้อมูลประสิทธิภาพสูง รองรับ Query ข้อมูลรายงานที่มีความซับซ้อน |
| **Better-Auth** | 1.4.18 | ระบบจัดการความปลอดภัยและ Session ที่ทันสมัยและยืดหยุ่น |
| **Supabase** | Cloud | โซลูชัน Backend สำหรับ Database และ Storage ที่เสถียรและขยายตัวได้ง่าย |
| **Vercel** | Edge | Deployment Platform — รองรับ Edge Functions และ ISR สำหรับความเร็วสูงสุด |

---

## User Roles & Permissions

| สิทธิ์การใช้งาน | Super Admin | Admin | User |
|---|:---:|:---:|:---:|
| ดูและค้นหาโครงการทั้งหมด | ✅ | ✅ | ✅ |
| เพิ่ม/แก้ไขข้อมูลโครงการของตนเอง | ✅ | ✅ | ✅ |
| ดูรายงานและสถิติภาพรวม | ✅ | ✅ | ✅ |
| ส่งออกรายงานเป็นไฟล์ Excel | ✅ | ✅ | ✅ |
| ส่งออกรายงาน Excel ตามชื่อผู้บันทึก | ✅ | ✅ | ❌ |
| จัดการข้อมูลพื้นที่/งบประมาณ/พาหนะ | ✅ | ✅ | ❌ |
| จัดการข้อมูลผู้ใช้ทั่วไป (USER) | ✅ | ✅ | ❌ |
| เปลี่ยนบทบาทผู้ใช้งาน (Role Change) | ✅ | ❌ | ❌ |
| จัดการ/แก้ไขแอดมินคนอื่นๆ | ✅ | ❌ | ❌ |
| จัดการข้อมูลแอดมินสูงสุด (ยกเว้นเปลี่ยนบทบาทตัวเอง) | ✅ | ❌ | ❌ |

---

## About the Developer

**คุณสุรสิทธิ์ พิมพ์สีดา (Surasit Phimseeda)**

- [surasit.phimseeda111@gmail.com](mailto:surasit.phimseeda111@gmail.com)
- [github.com/Surasit111](https://github.com/Surasit111)

---

## License

This project is proprietary software. All rights reserved.

---

*Developed with ❤️ for excellence in Training Management.*
