"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { sidebarItems, adminItems } from "./sidebar"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

interface MobileNavProps {
  userRole?: string
}

export function MobileNav({ userRole = "USER" }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = userRole === "ADMIN"

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
        },
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden mr-auto ml-4">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[200px] p-0 flex flex-col border-r-0 shadow-2xl">
        <SheetHeader className="p-3 border-b bg-white">
          <SheetTitle>
            <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-sm font-black text-slate-800 tracking-tighter leading-none truncate">
                  TRAINING
                </span>
                <span className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase leading-tight">
                  System
                </span>
              </div>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-auto py-2">
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-bold transition-all",
                  pathname === item.href
                    ? "bg-slate-100 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", pathname === item.href ? "text-indigo-600" : "text-slate-400")} />
                <span className="truncate">{item.title}</span>
              </Link>
            ))}

            {isAdmin && (
              <>
                <div className="mt-5 mb-1 px-2.5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Admin
                </div>
                {adminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-bold transition-all",
                      pathname === item.href
                        ? "bg-slate-100 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", pathname === item.href ? "text-indigo-600" : "text-slate-400")} />
                    <span className="truncate">{item.title}</span>
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>

        <div className="p-3 border-t bg-slate-50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg text-[12px] font-bold h-9 px-3"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4 shrink-0" />
            <span className="truncate">ออกจากระบบ</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
