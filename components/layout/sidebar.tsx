// components/layout/sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FolderPlus, MapPin, Users, Settings, LogOut, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export const sidebarItems = [
  {
    title: "ภาพรวม (Dashboard)",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "โครงการอบรม",
    href: "/projects",
    icon: FolderPlus,
  },
  {
    title: "ข้อมูลส่วนตัว",
    href: "/profile",
    icon: Users,
  },
  {
    title: "รายงานและส่งออก",
    href: "/reports",
    icon: FileSpreadsheet,
  },
]

// เมนูสำหรับ Admin เท่านั้น
export const adminItems = [
  {
    title: "จัดการผู้ใช้งาน",
    href: "/admin/users",
    icon: Settings,
  },
  {
    title: "จัดการหมวดหมู่",
    href: "/admin/categories",
    icon: MapPin,
  },
]

interface SidebarProps {
  userRole?: "USER" | "ADMIN"
  className?: string
}

export function Sidebar({ userRole = "USER", className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
        },
      },
    })
  }

  const isAdmin = userRole === "ADMIN"

  return (
    <div className={cn("h-screen w-52 flex-col border-r bg-white hidden lg:flex", className)}>
      <div className="flex h-16 items-center px-4 border-b border-slate-100 bg-white">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-100">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-800 tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">
              TRAINING
            </span>
            <span className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase leading-tight">
              System
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}

          {/* แสดงเมนู Admin เฉพาะเมื่อ user เป็น ADMIN */}
          {isAdmin && (
            <>
              <div className="my-4 border-t px-4 py-2 text-xs font-semibold text-muted-foreground">
                ผู้ดูแลระบบ (Admin)
              </div>

              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>

      <div className="border-t p-4">
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          ออกจากระบบ
        </Button>
      </div>
    </div>
  )
}