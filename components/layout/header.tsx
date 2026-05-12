// components/layout/header.tsx
"use client"

import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { MobileNav } from "./mobile-nav"

interface HeaderProps {
  userRole?: string
}

export function Header({ userRole: initialRole }: HeaderProps) {
  const { data: session } = authClient.useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Use setTimeout to avoid calling setState synchronously in effect
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const userName = mounted ? (session?.user?.name || "ผู้ใช้งาน") : "ผู้ใช้งาน"
  const userEmail = mounted ? session?.user?.email : ""
  const userImage = mounted ? session?.user?.image : ""
  const userRole = initialRole || (mounted ? (session?.user as any)?.role : "USER")

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b bg-white/80 backdrop-blur-md px-3 sm:px-8 sticky top-0 z-100 transition-all duration-300">
      <MobileNav userRole={userRole} />
      <div className="flex items-center gap-4 ml-auto">
        <Link
          href="/profile"
          className="group flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300 active:scale-95"
        >
          <div className="text-right">
            <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate max-w-[100px] sm:max-w-none">{userName}</p>
            <p className="text-xs sm:text-[10px] font-medium text-slate-400 truncate max-w-[100px] sm:max-w-[120px]">{userEmail}</p>
          </div>
          <div className="relative">
            <Avatar className="h-7 w-7 sm:h-10 sm:w-10 border-2 border-white ring-1 ring-slate-100 group-hover:ring-indigo-100 transition-all shadow-sm">
              <AvatarImage src={userImage || ""} />
              <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-xs sm:text-sm">{userName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </Link>
      </div>
    </header>
  )
}
